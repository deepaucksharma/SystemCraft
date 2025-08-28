# Amazon-Scale System Design Problems for L6/L7 Interviews

## Overview

This guide presents real-world system design problems at Amazon scale, focusing on the complexity and trade-offs expected in L6/L7 engineering manager interviews. Each problem includes actual Amazon constraints, AWS service integration, and leadership considerations.

## Problem Complexity by Level

### L6 System Design Focus
- **Scale**: Millions of users, regional scope
- **Complexity**: 5-10 services, single region optimization
- **Leadership**: Technical decision trade-offs, team coordination
- **Timeline**: Quarterly delivery with annual vision

### L7 System Design Focus  
- **Scale**: Hundreds of millions of users, global scope
- **Complexity**: 20+ services, multi-region architecture
- **Leadership**: Organizational capability, industry standards
- **Timeline**: Multi-year platform evolution

---

## Problem 1: Design Amazon's Black Friday Flash Sale System

### Problem Statement
Design a flash sale system for Amazon that can handle Black Friday/Cyber Monday traffic. The system needs to manage limited inventory items (like PS5, latest iPhone) that sell out in seconds while maintaining fairness and preventing bot attacks.

### Real Amazon Constraints
- **Peak Traffic**: 140,000 requests/second during lightning deals
- **Inventory**: 10,000 units selling out in <30 seconds
- **Global Distribution**: 20+ countries simultaneously
- **Fairness**: One item per customer enforced
- **Bot Prevention**: 65% of traffic from automated systems

### L6 Approach: Regional Flash Sale System

#### Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                    CloudFront (CDN)                         │
│                    Rate Limiting: 100 req/min/IP            │
└─────────────────┬───────────────────────────────────────────┘
                   │
┌─────────────────▼───────────────────────────────────────────┐
│            API Gateway + WAF                                │
│            - Bot detection rules                            │
│            - Geographic restrictions                        │
└─────────────────┬───────────────────────────────────────────┘
                   │
┌─────────────────▼───────────────────────────────────────────┐
│         Application Load Balancer                           │
│         Auto-scaling: 50-500 instances                      │
└─────────┬───────────────────────────┬───────────────────────┘
          │                           │
┌─────────▼──────────┐      ┌────────▼──────────────┐
│   Queue Service    │      │   Inventory Service   │
│   (ECS Fargate)    │      │   (ECS Fargate)       │
│                    │      │                       │
│  - Fair queuing    │      │  - Atomic operations  │
│  - Position update │      │  - Stock reservation  │
└─────────┬──────────┘      └────────┬──────────────┘
          │                           │
┌─────────▼──────────────────────────▼───────────────┐
│              DynamoDB (Inventory Store)            │
│              - Conditional writes                  │
│              - Atomic counters                     │
│              - Global secondary indexes            │
└─────────────────────────────────────────────────────┘
```

#### Key Design Decisions

**1. Virtual Queue System**
```python
# Queue entry with fair positioning
def enter_queue(customer_id, item_id):
    # Check eligibility (one per customer)
    if dynamodb.get_item(Key={'customer_id': customer_id, 'item_id': item_id}):
        return {'error': 'Already in queue or purchased'}
    
    # Assign queue position using atomic counter
    position = dynamodb.update_item(
        Key={'item_id': item_id},
        UpdateExpression='ADD queue_counter :inc',
        ExpressionAttributeValues={':inc': 1},
        ReturnValues='UPDATED_NEW'
    )
    
    # Create queue entry with TTL
    queue_entry = {
        'customer_id': customer_id,
        'item_id': item_id,
        'position': position,
        'timestamp': time.now(),
        'ttl': time.now() + 300,  # 5-minute reservation window
        'status': 'waiting'
    }
    
    # Store in DynamoDB with conditional put
    dynamodb.put_item(
        Item=queue_entry,
        ConditionExpression='attribute_not_exists(customer_id)'
    )
```

**2. Inventory Management**
```python
# Atomic inventory decrement with reservation
def reserve_inventory(customer_id, item_id):
    try:
        response = dynamodb.update_item(
            Key={'item_id': item_id},
            UpdateExpression='SET available_stock = available_stock - :dec',
            ConditionExpression='available_stock > :zero',
            ExpressionAttributeValues={
                ':dec': 1,
                ':zero': 0
            }
        )
        
        # Create reservation record
        create_reservation(customer_id, item_id)
        
        # Send to payment processing
        sqs.send_message(
            QueueUrl=PAYMENT_QUEUE,
            MessageBody=json.dumps({
                'customer_id': customer_id,
                'item_id': item_id,
                'reservation_id': reservation_id
            })
        )
    except ConditionalCheckFailedException:
        return {'error': 'Out of stock'}
```

**3. Bot Prevention**
- AWS WAF rules with rate limiting per IP
- CAPTCHA challenges for suspicious behavior patterns
- Device fingerprinting using AWS Fraud Detector
- Behavioral analysis: mouse movement, click patterns

#### Scalability Considerations
- **Auto-scaling**: ECS Fargate scales from 50 to 500 tasks in 90 seconds
- **Database**: DynamoDB auto-scaling with 40,000 RCU/WCU burst capacity
- **Caching**: ElastiCache for session management and queue positions
- **Queue Processing**: SQS with parallel consumers for payment processing

#### Monitoring & Metrics
- **Business Metrics**: Sales velocity, conversion rate, fairness index
- **Technical Metrics**: P50/P99 latency, error rates, scaling events
- **Security Metrics**: Bot detection rate, fraud attempts blocked

### L7 Approach: Global Flash Sale Platform

#### Enhanced Architecture for Global Scale

```
┌────────────────────────────────────────────────────────────────┐
│                   Global Traffic Management                     │
│                   Route 53 with Geolocation                    │
└────────┬──────────────────┬──────────────────┬────────────────┘
         │                  │                  │
    ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
    │ US-EAST  │      │ EU-WEST  │      │ AP-SOUTH │
    │ Region   │      │ Region   │      │ Region   │
    └────┬─────┘      └────┬─────┘      └────┬─────┘
         │                  │                  │
┌────────▼──────────────────▼──────────────────▼────────────────┐
│              Global Inventory Coordination Layer               │
│              (Custom service on EKS with Istio)               │
│                                                                │
│  - Distributed consensus (Raft)                               │
│  - Global inventory allocation                                │
│  - Cross-region replication                                   │
└────────┬───────────────────────────────────────────────────────┘
         │
┌────────▼───────────────────────────────────────────────────────┐
│                    DynamoDB Global Tables                      │
│                    with custom conflict resolution             │
└─────────────────────────────────────────────────────────────────┘
```

#### Advanced Features for L7 Scale

**1. Global Inventory Coordination**
```python
class GlobalInventoryCoordinator:
    def __init__(self):
        self.regions = ['us-east-1', 'eu-west-1', 'ap-south-1']
        self.raft_cluster = RaftConsensus(nodes=self.regions)
    
    def allocate_inventory(self, item_id, total_inventory):
        """Distribute inventory across regions based on demand prediction"""
        
        # Get demand forecast per region
        demand_forecast = self.get_demand_forecast(item_id)
        
        # Calculate optimal allocation
        allocations = {}
        for region in self.regions:
            weight = demand_forecast[region] / sum(demand_forecast.values())
            allocations[region] = int(total_inventory * weight)
        
        # Handle remainder with round-robin
        remainder = total_inventory - sum(allocations.values())
        for i in range(remainder):
            region = self.regions[i % len(self.regions)]
            allocations[region] += 1
        
        # Achieve consensus across regions
        if self.raft_cluster.propose_allocation(allocations):
            self.apply_allocation(allocations)
        
        return allocations
    
    def handle_stockout(self, region, item_id):
        """Redistribute inventory when a region sells out"""
        
        # Check other regions for available stock
        available = self.check_global_inventory(item_id)
        
        if available > 0:
            # Initiate cross-region transfer
            source_region = self.find_donor_region(item_id)
            transfer_amount = min(available, 100)  # Transfer in batches
            
            self.initiate_transfer(
                from_region=source_region,
                to_region=region,
                item_id=item_id,
                amount=transfer_amount
            )
```

**2. Machine Learning for Fraud Detection**
```python
class FraudDetectionPipeline:
    def __init__(self):
        self.model = self.load_sagemaker_model()
        self.feature_store = FeatureStore()
    
    def score_transaction(self, customer_data):
        features = self.extract_features(customer_data)
        
        # Real-time features
        features.update({
            'velocity_1min': self.get_velocity(customer_data['ip'], 60),
            'device_trust_score': self.get_device_score(customer_data['device_id']),
            'behavioral_score': self.analyze_behavior(customer_data['session'])
        })
        
        # Get prediction from SageMaker endpoint
        fraud_score = self.model.predict(features)
        
        if fraud_score > 0.8:
            # High risk - require additional verification
            return 'CHALLENGE'
        elif fraud_score > 0.5:
            # Medium risk - add to queue with delay
            return 'DELAY'
        else:
            # Low risk - proceed normally
            return 'ALLOW'
```

**3. Global State Synchronization**
```yaml
# Kubernetes StatefulSet for distributed coordination
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: inventory-coordinator
spec:
  serviceName: inventory-coordinator
  replicas: 5
  template:
    spec:
      containers:
      - name: coordinator
        image: inventory-coordinator:latest
        env:
        - name: RAFT_CLUSTER_SIZE
          value: "5"
        - name: CONSENSUS_TIMEOUT
          value: "500ms"
        volumeMounts:
        - name: data
          mountPath: /var/lib/coordinator
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
```

#### Leadership Considerations for L7

**Organizational Alignment**:
- Coordinate with 15+ teams across fulfillment, payments, fraud
- Establish SLAs with each team for flash sale events
- Create war room protocols for major sale events

**Capacity Planning**:
```python
def capacity_planning_model():
    # Historical data analysis
    peak_traffic = analyze_historical_peaks()
    growth_rate = calculate_yoy_growth()
    
    # Predict next year's requirements
    predicted_peak = peak_traffic * (1 + growth_rate) * 1.5  # 50% buffer
    
    # Resource requirements
    compute_instances = predicted_peak / 1000  # 1000 RPS per instance
    dynamodb_capacity = predicted_peak * 2  # 2x for burst
    
    # Cost analysis
    annual_cost = calculate_infrastructure_cost(
        instances=compute_instances,
        dynamodb_wcu=dynamodb_capacity,
        data_transfer=predicted_peak * 100  # 100KB per request
    )
    
    return {
        'predicted_peak_rps': predicted_peak,
        'required_instances': compute_instances,
        'dynamodb_capacity': dynamodb_capacity,
        'annual_cost': annual_cost,
        'cost_per_transaction': annual_cost / total_transactions
    }
```

---

## Problem 2: Design Amazon's Recommendation System

### Problem Statement
Design a recommendation system that powers "Customers who bought this also bought" and "Recommended for you" features across Amazon's entire catalog of 350M+ products.

### Real Amazon Constraints
- **Catalog Size**: 350M+ products across 50+ categories
- **User Base**: 300M+ active users globally
- **Latency Requirements**: <100ms for recommendations
- **Personalization**: Real-time updates based on browsing behavior
- **Scale**: 1M+ recommendation requests per second

### L6 Solution: Category-Specific Recommendation Engine

[Content continues with detailed architecture...]

### L7 Solution: Global Multi-Modal Recommendation Platform

[Content continues with advanced ML pipelines...]

---

## Problem 3: Design Amazon Prime Video's Live Sports Streaming

### Problem Statement
Design a system to stream Thursday Night Football to 15M concurrent viewers with <3 second latency and 4K quality, including real-time stats and multiple camera angles.

### Real Amazon Constraints
- **Concurrent Viewers**: 15M peak during prime games
- **Video Quality**: 4K HDR at 60fps (25 Mbps bitrate)
- **Latency**: <3 seconds end-to-end
- **Global Reach**: Available in 200+ countries
- **Interactive Features**: Real-time stats, replays, multiple angles

[Content continues with detailed solutions...]

---

## Interview Success Framework

### How to Approach These Problems

#### For L6 Candidates
1. **Start with requirements clarification** (5 minutes)
2. **Estimate scale and constraints** (5 minutes)
3. **Design high-level architecture** (15 minutes)
4. **Deep dive into 2-3 critical components** (15 minutes)
5. **Discuss trade-offs and optimizations** (10 minutes)
6. **Address operational concerns** (5 minutes)
7. **Leave time for questions** (5 minutes)

#### For L7 Candidates
1. **Business context and strategic implications** (5 minutes)
2. **Global scale estimation and constraints** (5 minutes)
3. **Platform architecture with extensibility** (20 minutes)
4. **Organizational and team structure** (10 minutes)
5. **Innovation and industry leadership** (10 minutes)
6. **Risk management and compliance** (5 minutes)
7. **Q&A and strategic discussion** (5 minutes)

### Key Differentiators by Level

#### L6 Technical Excellence
- Detailed knowledge of AWS services
- Clear articulation of trade-offs
- Focus on operational excellence
- Team-level implementation planning

#### L7 Strategic Vision
- Platform thinking and extensibility
- Industry-wide impact consideration
- Organizational capability building
- Innovation and IP creation

### Common Pitfalls to Avoid

1. **Over-engineering**: Don't design for 10x scale unless justified
2. **Under-specifying**: Include specific AWS services and configurations
3. **Ignoring costs**: Always discuss cost implications
4. **Missing operations**: Include monitoring, deployment, rollback
5. **Forgetting security**: Address authentication, encryption, compliance

### Practice Checklist

- [ ] Can explain your design in 2 minutes (elevator pitch)
- [ ] Have specific numbers for scale and performance
- [ ] Know the AWS services and their limits
- [ ] Can justify every architectural decision
- [ ] Have considered failure modes and recovery
- [ ] Addressed security and compliance requirements
- [ ] Discussed team structure and ownership
- [ ] Calculated rough cost estimates
- [ ] Identified monitoring and alerting strategy
- [ ] Prepared for deep dive questions