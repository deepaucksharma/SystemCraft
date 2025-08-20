# L6 System Design Problems and Solutions

!!! info "L6 Component-Level Design Focus"
    This comprehensive guide provides detailed system design problems specifically calibrated for Senior Engineering Manager (L6) roles, focusing on component-level architecture and production-ready systems that serve millions of users.

## Complete L6 System Design Problems

### Problem 1: Design a Rate Limiter Service

**Problem Statement (250 words)**

Design a distributed rate limiter service that can handle 100 million API requests per minute across multiple Amazon services. The rate limiter should support different algorithms (token bucket, sliding window, fixed window), multiple rate limiting policies per client, and provide real-time monitoring and alerting capabilities.

Your service will be used by various Amazon APIs including Prime Video, Alexa, and AWS services to protect against abuse, ensure fair usage, and maintain system stability. The rate limiter must support both synchronous and asynchronous rate limiting checks, with sub-10ms p99 latency for synchronous calls.

Consider that clients may have different rate limits based on their subscription tier, geographic location, and historical behavior. The system should gracefully handle traffic spikes, provide detailed metrics for capacity planning, and support both global and per-region rate limiting policies.

**Requirements Gathering**

*Functional Requirements:*
- Support multiple rate limiting algorithms (token bucket, sliding window, fixed window)
- Handle different time windows (seconds, minutes, hours, days)
- Support hierarchical rate limiting (per-user, per-API key, per-IP, per-region)
- Provide real-time rate limit status and remaining quota
- Support both synchronous (blocking) and asynchronous (non-blocking) checks
- Allow dynamic rate limit updates without service restart
- Provide detailed analytics and monitoring capabilities

*Non-Functional Requirements:*
- Handle 100M requests per minute (1.67M RPS)
- Sub-10ms p99 latency for rate limit checks
- 99.99% availability
- Support 10K different rate limiting policies
- Global deployment across 15 AWS regions
- Handle traffic spikes up to 5x normal load

*Constraints:*
- Must integrate with existing Amazon authentication systems
- Comply with data residency requirements
- Support gradual rollout and A/B testing
- Budget constraint of $2M annually for infrastructure

**Capacity Estimation**

```
Traffic Analysis:
- Peak RPS: 1.67M requests/second
- Average RPS: 800K requests/second
- Request size: ~1KB (client ID, API key, metadata)
- Response size: ~500 bytes (decision + metadata)

Storage Requirements:
- Active rate limit counters: 10K policies × 1M active keys = 10B counters
- Counter storage: 64 bytes per counter = 640GB
- Historical data (30 days): 100M requests/min × 1KB × 30 days = 4.3TB
- Metadata and configuration: 100GB

Compute Requirements:
- CPU: 1.67M RPS × 0.1ms CPU = 167 CPU cores
- Memory: 10B counters × 64 bytes = 640GB RAM
- Network: 1.67M × (1KB + 0.5KB) = 2.5GB/s bandwidth

Database Throughput:
- Reads: 1.67M/sec rate limit checks
- Writes: 200K/sec counter updates
- Cache hit ratio target: 95%
```

**System Design with ASCII Diagram**

```
                    Internet/Internal Network
                              |
                    ┌─────────┴─────────┐
                    │   Load Balancer   │
                    │  (AWS ALB/NLB)   │
                    └─────────┬─────────┘
                              |
                    ┌─────────┴─────────┐
                    │   API Gateway     │
                    │ (Rate Limit API)  │
                    └─────────┬─────────┘
                              |
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────┴─────────┐ ┌─────────┴─────────┐ ┌─────────┴─────────┐
    │ Rate Limiter      │ │ Rate Limiter      │ │ Rate Limiter      │
    │   Service A       │ │   Service B       │ │   Service C       │
    │ (Token Bucket)    │ │ (Sliding Window)  │ │ (Fixed Window)    │
    └─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘
              │               │               │
              └───────────────┼───────────────┘
                              |
                    ┌─────────┴─────────┐
                    │   Redis Cluster   │
                    │ (Counter Storage) │
                    └─────────┬─────────┘
                              |
                    ┌─────────┴─────────┐
                    │   PostgreSQL      │
                    │ (Policy Config)   │
                    └─────────┬─────────┘
                              |
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────┴─────────┐ ┌─────────┴─────────┐ ┌─────────┴─────────┐
    │   Monitoring      │ │    Analytics      │ │   Admin Portal    │
    │  (CloudWatch)     │ │   (Kinesis)       │ │   (Management)    │
    └───────────────────┘ └───────────────────┘ └───────────────────┘
```

**Database Design**

*Redis Cluster Schema (Counter Storage):*
```sql
-- Token Bucket Counters
Key: "tb:{policy_id}:{client_id}"
Value: {
  "tokens": 850,
  "last_refill": 1640995200,
  "capacity": 1000
}
TTL: 3600 seconds

-- Sliding Window Counters  
Key: "sw:{policy_id}:{client_id}:{window_start}"
Value: {
  "count": 45,
  "window_start": 1640995200,
  "window_size": 300
}
TTL: window_size + 60 seconds

-- Fixed Window Counters
Key: "fw:{policy_id}:{client_id}:{window_id}"
Value: {
  "count": 120,
  "window_id": "2021-12-31-14:30",
  "reset_time": 1641000000
}
TTL: 3600 seconds
```

*PostgreSQL Schema (Policy Configuration):*
```sql
CREATE TABLE rate_limit_policies (
    policy_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    algorithm VARCHAR(50) NOT NULL, -- token_bucket, sliding_window, fixed_window
    rate_limit INTEGER NOT NULL,
    time_window INTEGER NOT NULL, -- in seconds
    burst_capacity INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE client_policies (
    client_id VARCHAR(255) NOT NULL,
    policy_id INTEGER REFERENCES rate_limit_policies(policy_id),
    override_rate_limit INTEGER,
    priority INTEGER DEFAULT 1,
    effective_from TIMESTAMP DEFAULT NOW(),
    effective_to TIMESTAMP,
    PRIMARY KEY (client_id, policy_id)
);

CREATE TABLE rate_limit_events (
    event_id BIGSERIAL PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    policy_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- allow, deny, throttle
    timestamp TIMESTAMP DEFAULT NOW(),
    remaining_quota INTEGER,
    request_metadata JSONB
);

CREATE INDEX idx_rate_limit_events_timestamp ON rate_limit_events(timestamp);
CREATE INDEX idx_rate_limit_events_client_policy ON rate_limit_events(client_id, policy_id);
```

**API Design**

```yaml
# Rate Limiter Service API

/api/v1/ratelimit/check:
  post:
    description: Check if request should be rate limited
    request:
      client_id: string (required)
      api_key: string (required) 
      resource: string (required)
      weight: integer (default: 1)
      async: boolean (default: false)
    response:
      allowed: boolean
      remaining_quota: integer
      reset_time: timestamp
      retry_after: integer (seconds)
      policy_applied: string

/api/v1/ratelimit/status:
  get:
    description: Get current rate limit status for client
    parameters:
      client_id: string (required)
      policy_id: integer (optional)
    response:
      policies: array
        - policy_id: integer
          remaining_quota: integer
          reset_time: timestamp
          current_usage: integer

/api/v1/policies:
  post:
    description: Create new rate limit policy
    request:
      name: string
      algorithm: enum [token_bucket, sliding_window, fixed_window]
      rate_limit: integer
      time_window: integer
      burst_capacity: integer
    response:
      policy_id: integer
      created_at: timestamp

/api/v1/policies/{policy_id}/clients:
  put:
    description: Assign policy to clients
    request:
      client_ids: array[string]
      override_rate_limit: integer (optional)
      effective_from: timestamp (optional)
```

**Algorithm Details**

*Token Bucket Implementation:*
```python
class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate  # tokens per second
        self.last_refill = time.time()
    
    def consume(self, tokens=1):
        now = time.time()
        # Refill tokens based on elapsed time
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, 
                         self.tokens + elapsed * self.refill_rate)
        self.last_refill = now
        
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True, self.tokens
        return False, self.tokens

    def serialize(self):
        return {
            'tokens': self.tokens,
            'last_refill': self.last_refill,
            'capacity': self.capacity
        }
```

*Sliding Window Log Implementation:*
```python
class SlidingWindowLog:
    def __init__(self, limit, window_size):
        self.limit = limit
        self.window_size = window_size  # in seconds
        
    def is_allowed(self, redis_client, key, timestamp=None):
        if timestamp is None:
            timestamp = time.time()
            
        window_start = timestamp - self.window_size
        
        # Remove expired entries
        redis_client.zremrangebyscore(key, 0, window_start)
        
        # Count current requests in window
        current_count = redis_client.zcard(key)
        
        if current_count < self.limit:
            # Add current request
            redis_client.zadd(key, {str(timestamp): timestamp})
            redis_client.expire(key, self.window_size + 1)
            return True, self.limit - current_count - 1
        
        return False, 0
```

**Data Flow**

*Request Processing Flow:*
```
1. Client Request → API Gateway
2. API Gateway → Rate Limiter Service
3. Rate Limiter Service → Redis (counter lookup)
4. Rate Limiter Service → Algorithm Processing
5. Rate Limiter Service → Redis (counter update)
6. Rate Limiter Service → Response (allow/deny + metadata)
7. API Gateway → Client Response
8. Async: Rate Limiter Service → Analytics Pipeline
```

*Counter Synchronization Flow:*
```
1. Multiple Rate Limiter Instances → Redis Cluster
2. Redis Cluster → Consistent Hashing for counter distribution  
3. Redis Cluster → Master-Slave replication per shard
4. Redis Cluster → Periodic counter aggregation
5. Analytics Service → Counter data for reporting
```

**Technology Choices with Trade-offs**

*Primary Technology Stack:*
```yaml
Application Layer:
  Language: Go
    Pros: High performance, excellent concurrency, low memory footprint
    Cons: Smaller ecosystem compared to Java/Python
    Alternative: Java (Spring Boot) for better ecosystem
    
Cache Layer:
  Technology: Redis Cluster
    Pros: Sub-millisecond latency, excellent data structures, cluster mode
    Cons: Memory-only storage, complexity of cluster management
    Alternative: DynamoDB for managed solution, higher latency
    
Database:
  Technology: PostgreSQL
    Pros: ACID compliance, rich feature set, excellent performance
    Cons: Vertical scaling limitations, complex sharding
    Alternative: DynamoDB for serverless scaling
    
Load Balancer:
  Technology: AWS Application Load Balancer
    Pros: Managed service, auto-scaling, health checks
    Cons: AWS vendor lock-in, limited customization
    Alternative: NGINX for on-premises flexibility

Message Queue:
  Technology: AWS SQS + Kinesis
    Pros: Managed, auto-scaling, integration with AWS ecosystem
    Cons: Eventual consistency, vendor lock-in
    Alternative: Apache Kafka for real-time processing
```

**Scaling Considerations**

*Horizontal Scaling Strategy:*
```
Auto-scaling Configuration:
- Scale based on CPU utilization (target: 70%)
- Scale based on Redis connection count
- Scale based on request queue depth
- Minimum instances: 10 (across 3 AZs)
- Maximum instances: 100
- Scale-out cooldown: 60 seconds
- Scale-in cooldown: 300 seconds

Redis Cluster Scaling:
- Hash-based sharding across 12 shards
- 3 master nodes per shard with 2 read replicas each
- Automatic failover with Redis Sentinel
- Memory usage monitoring with alerts at 75%
- Horizontal scaling by adding shards during maintenance windows

Database Scaling:
- Read replicas for policy lookups (3 replicas)
- Connection pooling with PgBouncer
- Query optimization with proper indexing
- Partitioning for rate_limit_events table by timestamp
- Consider migration to DynamoDB for unlimited scaling
```

*Geographic Distribution:*
```
Multi-Region Deployment:
- Primary regions: us-east-1, eu-west-1, ap-southeast-1
- Regional Redis clusters with cross-region replication for backup
- Policy synchronization via EventBridge cross-region replication
- Global load balancer with latency-based routing
- Local rate limiting with periodic global synchronization
```

**Monitoring and Alerts**

*Key Metrics:*
```yaml
Performance Metrics:
  - request_latency_p99: <10ms
  - request_latency_p95: <5ms
  - throughput: >1.67M RPS
  - error_rate: <0.01%
  - cache_hit_ratio: >95%

Business Metrics:
  - rate_limit_blocks_per_minute: monitor for abuse
  - false_positive_rate: <0.1%
  - policy_utilization: track unused policies
  - client_quota_exhaustion: capacity planning

System Health:
  - redis_memory_usage: <80%
  - redis_connection_count: <80% of max
  - database_connection_pool: <90% utilization
  - service_cpu_usage: <70%
  - service_memory_usage: <80%
```

*Alerting Strategy:*
```yaml
Critical Alerts (PagerDuty):
  - Service downtime > 1 minute
  - Error rate > 0.1% for 5 minutes
  - Latency p99 > 20ms for 5 minutes
  - Redis cluster failure

Warning Alerts (Slack):
  - Latency p99 > 15ms for 10 minutes  
  - Memory usage > 80% for 15 minutes
  - Cache hit ratio < 90% for 10 minutes
  - Unusual traffic patterns (>3x normal)

Capacity Alerts:
  - Redis memory usage > 75%
  - Database connections > 80%
  - Expected to hit rate limits within 24 hours
```

**Follow-up Questions**

1. **How would you handle a scenario where Redis cluster becomes unavailable?**
   - Implement graceful degradation with local counters
   - Use probabilistic rate limiting during outages
   - Discuss circuit breaker patterns and fallback strategies

2. **How would you implement rate limiting across multiple data centers?**
   - Design global counter synchronization strategies
   - Discuss eventual consistency trade-offs
   - Consider edge-based rate limiting approaches

3. **How would you handle clients that require custom rate limiting algorithms?**
   - Design pluggable algorithm architecture
   - Discuss performance implications of custom code
   - Consider sandboxing and security implications

4. **What would be your strategy for migrating existing rate limiting systems?**
   - Design dual-write migration pattern
   - Discuss rollback strategies and monitoring
   - Plan for gradual traffic migration

5. **How would you implement rate limiting for GraphQL APIs with complex queries?**
   - Discuss query complexity analysis
   - Design weight-based rate limiting
   - Consider query depth and breadth limitations

---

### Problem 2: Design a Notification System

**Problem Statement (280 words)**

Design a comprehensive notification system that handles push notifications, email, SMS, and in-app notifications for Amazon's ecosystem. The system must support 50 million active users, sending 500 million notifications daily across multiple channels with intelligent routing, delivery tracking, and user preference management.

Your notification system will serve various Amazon services including Prime Video (new episodes), Amazon Shopping (order updates), Alexa (reminders), and AWS (service alerts). The system must handle different notification priorities, support template-based messaging with personalization, and provide comprehensive analytics on delivery rates, engagement, and user preferences.

The system should intelligently route notifications based on user preferences, device availability, and message urgency. For example, critical account security notifications should attempt multiple channels until acknowledged, while promotional messages should respect do-not-disturb hours and frequency caps.

Consider that notifications may need to be sent in multiple languages, comply with regional regulations (GDPR, CAN-SPAM), and handle scenarios like device token expiration, user unsubscriptions, and temporary service outages of third-party providers.

**Requirements Gathering**

*Functional Requirements:*
- Support multiple channels: Push (iOS/Android), Email, SMS, In-app, Voice calls
- Handle 500M notifications per day (5.8K per second average, 20K peak)
- Template-based messaging with personalization and localization
- User preference management with granular controls
- Intelligent routing based on urgency, preferences, and device availability
- Delivery tracking with read receipts and engagement analytics
- Support for scheduled and recurring notifications
- A/B testing capabilities for notification content and timing

*Non-Functional Requirements:*
- 99.9% delivery success rate for critical notifications
- Sub-5 second delivery latency for high-priority notifications
- Support for 50M active users with 100M total registered devices
- Handle traffic spikes up to 10x during events (Prime Day, Black Friday)
- Multi-region deployment with 99.99% availability
- GDPR and regional compliance support

**Capacity Estimation**

```
Notification Volume:
- Daily notifications: 500M
- Average per second: 5.8K
- Peak per second: 20K (during events)
- Average notification size: 2KB (including metadata)

Storage Requirements:
- User preferences: 50M users × 5KB = 250GB
- Templates: 10K templates × 50KB = 500MB  
- Delivery logs (30 days): 500M/day × 30 × 1KB = 15TB
- Analytics data (1 year): 500M/day × 365 × 0.5KB = 91TB

Channel Distribution:
- Push notifications: 60% (300M/day)
- Email: 25% (125M/day)
- SMS: 10% (50M/day)
- In-app: 5% (25M/day)
```

**System Design with ASCII Diagram**

```
                    Client Applications & Services
                              │
                    ┌─────────┴─────────┐
                    │   Notification    │
                    │     Gateway       │
                    │  (API Gateway)    │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Notification    │
                    │    Orchestrator   │
                    │   (Route & Queue) │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────┴─────────┐ ┌───┴───┐ ┌─────────┴─────────┐
    │ Template Engine   │ │ Queue │ │  User Preference  │
    │ (Personalization) │ │ (SQS) │ │     Service       │
    └─────────┬─────────┘ └───┬───┘ └─────────┬─────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
  ┌─────────┴─────────┐ ┌─────┴─────┐ ┌─────────┴─────────┐
  │   Push Service    │ │   Email   │ │    SMS Service    │
  │  (FCM/APNS)      │ │  Service  │ │   (Twilio/SNS)    │
  └─────────┬─────────┘ └─────┬─────┘ └─────────┬─────────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Delivery        │
                    │   Tracking        │
                    │   & Analytics     │
                    └───────────────────┘
```

**Database Design**

*User Preferences Schema:*
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255),
    phone VARCHAR(20),
    timezone VARCHAR(50),
    language VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_devices (
    device_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    platform VARCHAR(20), -- ios, android, web
    device_token VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notification_preferences (
    user_id UUID REFERENCES users(user_id),
    category VARCHAR(100), -- security, marketing, updates, etc.
    channel VARCHAR(20), -- push, email, sms, in_app
    enabled BOOLEAN DEFAULT true,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    frequency_cap INTEGER, -- max per day
    PRIMARY KEY (user_id, category, channel)
);

CREATE TABLE notification_templates (
    template_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    title_template TEXT,
    body_template TEXT,
    channels TEXT[], -- supported channels
    priority INTEGER, -- 1=low, 5=critical
    variables JSONB, -- template variables
    created_at TIMESTAMP DEFAULT NOW()
);
```

*Delivery Tracking Schema:*
```sql
CREATE TABLE notification_jobs (
    job_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    template_id INTEGER REFERENCES notification_templates(template_id),
    priority INTEGER,
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20), -- pending, processing, completed, failed
    metadata JSONB
);

CREATE TABLE notification_deliveries (
    delivery_id UUID PRIMARY KEY,
    job_id UUID REFERENCES notification_jobs(job_id),
    channel VARCHAR(20),
    recipient VARCHAR(255), -- email/phone/device_token
    status VARCHAR(20), -- sent, delivered, read, failed
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    error_message TEXT,
    external_id VARCHAR(255) -- provider message ID
);

-- Partitioned by date for performance
CREATE TABLE notification_analytics (
    date DATE,
    template_id INTEGER,
    channel VARCHAR(20),
    total_sent INTEGER,
    total_delivered INTEGER,
    total_read INTEGER,
    total_failed INTEGER,
    PRIMARY KEY (date, template_id, channel)
);
```

**API Design**

```yaml
# Notification Service API

/api/v1/notifications/send:
  post:
    description: Send notification to user(s)
    request:
      template_id: integer (required)
      user_ids: array[string] (required)
      variables: object (template variables)
      priority: integer (1-5, default: 3)
      channels: array[string] (optional, uses template default)
      scheduled_at: timestamp (optional, immediate if not set)
    response:
      job_id: string
      status: string
      estimated_delivery: timestamp

/api/v1/notifications/bulk:
  post:
    description: Send notification to large user segments
    request:
      template_id: integer
      user_segment: object
        - filter_type: enum [all_users, user_list, criteria]
        - criteria: object (demographic filters)
        - user_list: array[string] (for user_list type)
      variables: object
      priority: integer
      scheduled_at: timestamp
    response:
      job_id: string
      estimated_users: integer
      status: string

/api/v1/users/{user_id}/preferences:
  get:
    description: Get user notification preferences
    response:
      preferences: array
        - category: string
          channels: array
            - channel: string
              enabled: boolean
              settings: object
  
  put:
    description: Update user preferences
    request:
      preferences: array
        - category: string
          channel: string
          enabled: boolean
          settings: object

/api/v1/templates:
  get:
    description: List notification templates
    parameters:
      category: string (optional)
      page: integer (optional)
    response:
      templates: array
      pagination: object

/api/v1/notifications/{job_id}/status:
  get:
    description: Get notification delivery status
    response:
      job_id: string
      status: string
      total_recipients: integer
      deliveries: array
        - channel: string
          sent: integer
          delivered: integer
          read: integer
          failed: integer
```

**Technology Choices with Trade-offs**

```yaml
Message Queue:
  Primary: AWS SQS + SNS
    Pros: Managed, auto-scaling, dead letter queues, fan-out
    Cons: Maximum message size limits, eventual consistency
    Alternative: Apache Kafka for real-time processing
    
Push Notifications:
  iOS: Apple Push Notification Service (APNS)
  Android: Firebase Cloud Messaging (FCM)
    Pros: Native integration, reliable delivery
    Cons: Platform-specific APIs, token management complexity
    
Email Service:
  Primary: Amazon SES
    Pros: High deliverability, managed service, cost-effective
    Cons: Sending limits, bounce handling complexity
    Alternative: SendGrid for more advanced features
    
SMS Service:
  Primary: Amazon SNS
    Pros: Global coverage, managed service
    Cons: Higher cost, limited features
    Alternative: Twilio for richer features and better international support
    
Database:
  Primary: PostgreSQL with read replicas
    Pros: ACID compliance, rich queries, mature ecosystem
    Cons: Scaling limitations for massive write loads
    Alternative: DynamoDB for infinite scaling, eventual consistency
```

**Follow-up Questions**

1. **How would you handle notification delivery during third-party service outages?**
2. **How would you implement smart notification batching to reduce user fatigue?**
3. **How would you ensure GDPR compliance for EU users?**
4. **How would you implement real-time notification analytics dashboard?**
5. **How would you handle notification delivery across different time zones efficiently?**

---

### Problem 3: Design a URL Shortener Service

**Problem Statement (260 words)**

Design a URL shortener service similar to bit.ly that can handle 100 million URL shortenings per day and 1 billion click redirects daily. The service should support custom aliases, analytics tracking, expiration dates, and user accounts with URL management capabilities.

Your service will be used by Amazon Marketing teams for campaign tracking, internal teams for sharing links, and potentially as a public service. The system must provide detailed click analytics including geographic distribution, device types, referrer information, and time-based metrics.

Consider that the system needs to handle viral content scenarios where a single short URL might receive millions of clicks in a short time period. The service should also support branded domains, bulk URL creation via API, and integration with existing Amazon systems for authentication and billing.

**Requirements Gathering**

*Functional Requirements:*
- Shorten long URLs to 6-7 character short codes
- Support custom aliases (premium feature)
- URL redirection with analytics tracking
- User accounts with URL management dashboard
- Bulk URL creation and management APIs
- Expiration dates and URL lifecycle management
- Click analytics with detailed metrics
- Support for multiple branded domains

*Non-Functional Requirements:*
- Handle 100M URL creations per day (1.16K per second)
- Handle 1B redirects per day (11.6K per second average, 50K peak)
- 99.9% uptime for redirections
- Sub-100ms redirect latency globally
- Store URLs for minimum 5 years
- Support 10M registered users

**Capacity Estimation**

```
URL Creation:
- 100M URLs per day = 1.16K per second
- Peak during business hours: 5K per second
- URL metadata size: ~500 bytes per URL

Redirections:
- 1B redirects per day = 11.6K per second  
- Peak traffic: 50K per second
- Click data size: ~200 bytes per click

Storage (5 years):
- URLs: 100M/day × 365 × 5 × 500 bytes = 91TB
- Click data: 1B/day × 365 × 5 × 200 bytes = 365TB
- User data: 10M users × 10KB = 100GB
```

**System Design with ASCII Diagram**

```
                 Web Clients & Mobile Apps
                            │
                  ┌─────────┴─────────┐
                  │   CDN & Global    │
                  │  Load Balancer    │
                  │  (CloudFront)     │
                  └─────────┬─────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
  ┌─────────┴─────────┐   ┌─┴─┐   ┌─────────┴─────────┐
  │  URL Shortener    │   │API│   │   Redirect        │
  │    Service        │   │GW │   │   Service         │
  │  (Create URLs)    │   └─┬─┘   │  (Handle Clicks)  │
  └─────────┬─────────┘     │     └─────────┬─────────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
                  ┌─────────┴─────────┐
                  │      Cache        │
                  │  (Redis Cluster)  │
                  └─────────┬─────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
  ┌─────────┴─────────┐   ┌─┴─┐   ┌─────────┴─────────┐
  │    URL Store      │   │SQL│   │  Analytics Store  │
  │  (NoSQL - URLs)   │   │DB │   │ (Time Series DB)  │
  └───────────────────┘   └───┘   └───────────────────┘
```

**Database Design**

*URL Storage Schema (DynamoDB):*
```yaml
# URLs Table
TableName: urls
PartitionKey: short_code (String)
Attributes:
  short_code: "abc123"
  long_url: "https://example.com/very/long/url"
  user_id: "user123"
  created_at: 1640995200
  expires_at: 1672531200
  is_custom: true
  click_count: 15847
  is_active: true
  
# GSI for user URLs
GSI: user-urls-index
PartitionKey: user_id
SortKey: created_at
```

*Analytics Schema (ClickHouse):*
```sql
CREATE TABLE clicks (
    short_code String,
    click_time DateTime,
    ip_address String,
    user_agent String,
    referrer String,
    country String,
    city String,
    device_type String,
    browser String,
    is_bot Boolean
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(click_time)
ORDER BY (short_code, click_time);

CREATE TABLE daily_stats (
    short_code String,
    date Date,
    total_clicks UInt64,
    unique_clicks UInt64,
    countries Map(String, UInt64),
    devices Map(String, UInt64),
    browsers Map(String, UInt64)
) ENGINE = SummingMergeTree()
ORDER BY (short_code, date);
```

*User Management Schema (PostgreSQL):*
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free',
    api_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    monthly_quota INTEGER DEFAULT 1000,
    current_usage INTEGER DEFAULT 0
);

CREATE TABLE branded_domains (
    domain VARCHAR(255) PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    ssl_cert_arn VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Algorithm Details**

*Base62 Encoding for Short Codes:*
```python
import random
import string

class URLEncoder:
    BASE62 = string.ascii_letters + string.digits
    
    def __init__(self):
        self.base = len(self.BASE62)
    
    def encode(self, num):
        if num == 0:
            return self.BASE62[0]
        
        encoded = ""
        while num > 0:
            encoded = self.BASE62[num % self.base] + encoded
            num //= self.base
        return encoded
    
    def decode(self, short_code):
        decoded = 0
        for char in short_code:
            decoded = decoded * self.base + self.BASE62.index(char)
        return decoded
    
    def generate_short_code(self, counter_value):
        # Add random component to prevent sequential guessing
        randomized = (counter_value << 8) + random.randint(0, 255)
        return self.encode(randomized)
```

*Custom Alias Validation:*
```python
import re

class AliasValidator:
    def __init__(self):
        self.reserved_words = {
            'api', 'www', 'admin', 'app', 'short', 'link',
            'url', 'redirect', 'analytics', 'dashboard'
        }
        self.min_length = 3
        self.max_length = 20
        self.pattern = re.compile(r'^[a-zA-Z0-9_-]+$')
    
    def is_valid_alias(self, alias):
        if not alias or len(alias) < self.min_length or len(alias) > self.max_length:
            return False, "Alias must be between 3-20 characters"
        
        if not self.pattern.match(alias):
            return False, "Alias can only contain letters, numbers, hyphens, and underscores"
        
        if alias.lower() in self.reserved_words:
            return False, "Alias is reserved"
        
        return True, "Valid"
```

**Scaling Considerations**

*Horizontal Scaling Strategy:*
```yaml
URL Creation Service:
  - Stateless microservices in multiple regions
  - Auto-scaling based on request rate
  - Database sharding by short_code prefix
  - Counter service for unique ID generation

Redirect Service:  
  - Geographically distributed (CDN + Edge locations)
  - Heavy caching with 1-hour TTL for non-custom URLs
  - Async analytics collection to avoid latency
  - Circuit breakers for analytics failures

Cache Strategy:
  - L1: CDN cache (99% hit rate for popular URLs)
  - L2: Application cache (Redis) for recent URLs
  - L3: Database read replicas for remaining requests
  - Cache warming for newly created URLs
```

**Follow-up Questions**

1. **How would you handle a viral URL that receives 1M clicks per minute?**
2. **How would you implement URL preview features securely?**
3. **How would you detect and handle malicious URLs?**
4. **How would you migrate from short codes to a new encoding scheme?**
5. **How would you implement real-time click analytics for enterprise users?**

---

### Problem 4: Design a Task Queue System

**Problem Statement (270 words)**

Design a distributed task queue system that can handle 10 million tasks per day with support for task priorities, delayed execution, retry mechanisms, and dead letter queues. The system should support multiple programming languages, provide task monitoring and debugging capabilities, and ensure exactly-once task execution semantics.

Your task queue will be used by various Amazon services for background processing including image resizing, email sending, data processing pipelines, report generation, and machine learning model training. The system must handle both short-running tasks (seconds) and long-running tasks (hours), with appropriate resource allocation and timeout management.

Consider that tasks may have dependencies on each other, require specific worker configurations (CPU, memory, GPU), and need to be scheduled across multiple availability zones for fault tolerance. The system should provide comprehensive monitoring, alerting, and the ability to pause, retry, or cancel tasks as needed.

**Requirements Gathering**

*Functional Requirements:*
- Support for multiple task types and priorities (1-10 scale)
- Delayed task execution with precise scheduling
- Task retry mechanisms with exponential backoff
- Dead letter queue for failed tasks
- Task dependencies and workflow support
- Worker auto-scaling based on queue depth
- Task monitoring dashboard with real-time status
- Multi-language worker support (Python, Java, Go, Node.js)

*Non-Functional Requirements:*
- Handle 10M tasks per day (116 per second average, 1K peak)
- Support for 100K active workers across multiple regions
- 99.9% task completion rate
- Sub-5 second task dispatch latency
- Exactly-once execution semantics for critical tasks
- Support tasks from 1 second to 24 hours duration

**System Design with ASCII Diagram**

```
                    Client Applications
                            │
                  ┌─────────┴─────────┐
                  │   Task Queue      │
                  │      API          │
                  │   (REST/gRPC)     │
                  └─────────┬─────────┘
                            │
                  ┌─────────┴─────────┐
                  │   Task Router     │
                  │  (Priority &      │
                  │   Scheduling)     │
                  └─────────┬─────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────┴─────────┐ ┌─────┴─────┐ ┌─────────┴─────────┐
│  High Priority    │ │  Normal   │ │   Low Priority    │
│     Queue         │ │   Queue   │ │      Queue        │
│    (Redis)        │ │  (Redis)  │ │     (Redis)       │
└─────────┬─────────┘ └─────┬─────┘ └─────────┬─────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                  ┌─────────┴─────────┐
                  │  Worker Manager   │
                  │   (Auto-scaling   │
                  │    & Dispatch)    │
                  └─────────┬─────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────┴───────┐ ┌─────────┴─────────┐ ┌───────┴───────┐
│  Worker Pool  │ │   Worker Pool     │ │  Worker Pool  │
│     (AZ-1)    │ │      (AZ-2)       │ │     (AZ-3)    │
└───────────────┘ └───────────────────┘ └───────────────┘
```

**Technology Choices with Trade-offs**

```yaml
Message Broker:
  Primary: Redis with Redis Streams
    Pros: High performance, rich data structures, persistence
    Cons: Single point of failure without clustering
    Alternative: Apache Kafka for higher durability guarantees
    
Worker Orchestration:
  Primary: AWS ECS with auto-scaling
    Pros: Managed container orchestration, integrated monitoring
    Cons: AWS vendor lock-in, container startup overhead
    Alternative: Kubernetes for multi-cloud flexibility
    
Database:
  Primary: PostgreSQL for task metadata
    Pros: ACID compliance, complex queries, mature ecosystem
    Cons: Scaling challenges for high write loads
    Alternative: DynamoDB for infinite scaling
    
Scheduling:
  Primary: Custom scheduler with cron-like expressions
    Pros: Flexible scheduling, timezone support
    Cons: Development complexity
    Alternative: Apache Airflow for complex workflows
```

**Follow-up Questions**

1. **How would you implement task dependencies and workflow orchestration?**
2. **How would you handle worker failures and ensure task completion?**
3. **How would you implement rate limiting for different task types?**
4. **How would you handle tasks that require specific hardware (GPU, high-memory)?**
5. **How would you implement task auditing and compliance logging?**

---

### Problem 5: Design a Feature Flag Service

**Problem Statement (250 words)**

Design a feature flag service that can support 100,000 feature flags across 10,000 applications, serving 1 billion flag evaluations per day with sub-10ms latency. The system should support percentage rollouts, user targeting, A/B testing, and real-time flag updates without application restarts.

Your feature flag service will be used across Amazon's entire engineering organization to safely deploy features, conduct experiments, and manage application configurations. The system must support complex targeting rules, provide detailed analytics on flag usage and performance impact, and integrate with existing CI/CD pipelines.

Consider that feature flags may control critical business logic, require approval workflows for changes, and need audit trails for compliance. The system should support gradual rollouts, emergency killswitches, and integration with monitoring systems to automatically disable flags that cause performance degradation.

**Requirements Gathering**

*Functional Requirements:*
- Create and manage 100K feature flags across applications
- Support percentage-based and user-targeting rollouts
- Real-time flag evaluation with complex targeting rules
- A/B testing framework with statistical significance tracking
- Approval workflows for critical flag changes
- Emergency killswitch capabilities
- Integration with CI/CD pipelines for automated flag lifecycle
- Comprehensive audit logs and change history

*Non-Functional Requirements:*
- Serve 1B evaluations per day (11.6K per second average, 50K peak)
- Sub-10ms flag evaluation latency (p99)
- 99.99% availability for flag evaluations
- Support 10K applications with 1M daily active users per app
- Global deployment with consistent flag states
- Zero-downtime flag updates

**System Design with ASCII Diagram**

```
               Applications & SDKs
                       │
             ┌─────────┴─────────┐
             │   CDN & Edge      │
             │     Caching       │
             │  (CloudFront)     │
             └─────────┬─────────┘
                       │
             ┌─────────┴─────────┐
             │  Feature Flag     │
             │   Evaluation      │
             │     Service       │
             └─────────┬─────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────┴───────┐ ┌────┴────┐ ┌───────┴───────┐
│ Flag Config   │ │ Cache   │ │  User Context │
│   Storage     │ │(Redis)  │ │   Service     │
│(PostgreSQL)   │ └─────────┘ │   (DynamoDB)  │
└───────────────┘             └───────────────┘
```

**Follow-up Questions**

1. **How would you implement gradual rollouts with automatic rollback on errors?**
2. **How would you handle flag evaluation for offline mobile applications?**
3. **How would you implement flag dependencies (Flag A requires Flag B to be enabled)?**
4. **How would you ensure data consistency across global regions for flag updates?**
5. **How would you implement flag cleanup and automated technical debt reduction?**

---

### Problem 6: Design a Metrics Aggregation Service

**Problem Statement (290 words)**

Design a metrics aggregation service that can collect, process, and serve 1 million metrics per second from thousands of applications across Amazon's infrastructure. The system should support real-time dashboards, alerting, and long-term storage with different retention policies based on metric importance and resolution.

Your metrics service will collect data from EC2 instances, containers, load balancers, databases, and custom applications. It must support different metric types (counters, gauges, histograms, timers), provide downsampling for long-term storage, and enable complex queries for troubleshooting and capacity planning.

Consider that metrics have different criticality levels - some require immediate alerting (security events, service outages), while others are used for long-term trend analysis. The system should handle traffic spikes during incidents when metric volume can increase 10x, and provide APIs for both metric ingestion and querying.

**Requirements Gathering**

*Functional Requirements:*
- Ingest 1M metrics per second with burst capacity to 10M/sec
- Support multiple metric types: counters, gauges, histograms, timers
- Real-time aggregation and downsampling (1min, 5min, 1hour, 1day)
- Flexible retention policies (1day to 7years based on resolution)
- Rich querying language with mathematical operations
- Real-time alerting with complex rule evaluation
- Dashboard APIs for visualization tools
- Metric metadata management and discovery

*Non-Functional Requirements:*
- Sub-100ms query latency for dashboard queries
- 99.9% ingestion success rate
- Support for 100K unique metric series
- Handle 10x traffic spikes during incidents
- Multi-region deployment with 99.99% availability
- Compression ratios of 10:1 for efficient storage

**System Design**

```
         Metric Sources (Apps, Infrastructure)
                        │
              ┌─────────┴─────────┐
              │   Metric Gateway  │
              │  (Load Balancing  │
              │   & Validation)   │
              └─────────┬─────────┘
                        │
              ┌─────────┴─────────┐
              │  Stream Processor │
              │    (Apache        │
              │     Kafka)        │
              └─────────┬─────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────┴───────┐ ┌─────┴─────┐ ┌───────┴───────┐
│   Real-time   │ │Aggregator │ │  Long-term    │
│   Storage     │ │ Workers   │ │   Storage     │
│ (InfluxDB)    │ │           │ │ (ClickHouse)  │
└───────────────┘ └───────────┘ └───────────────┘
```

**Follow-up Questions**

1. **How would you implement metric sampling during high load while preserving accuracy?**
2. **How would you handle metric schema evolution without breaking existing queries?**
3. **How would you implement cost-effective long-term storage for compliance requirements?**
4. **How would you detect and handle anomalous metric patterns automatically?**
5. **How would you implement cross-datacenter metric replication for disaster recovery?**

---

### Problem 7: Design a Session Management System

**Problem Statement (260 words)**

Design a session management system that can handle 50 million concurrent user sessions across Amazon's web properties, mobile apps, and APIs. The system should support session creation, validation, refresh, and termination with sub-50ms latency globally, while maintaining security and enabling features like "remember me" and multi-device session management.

Your session management system will serve Amazon Shopping, Prime Video, AWS Console, and other properties. It must integrate with existing authentication systems, support different session types (web, mobile, API tokens), and provide comprehensive session analytics for security monitoring and fraud detection.

Consider that sessions must be globally accessible, support graceful degradation during outages, and comply with security requirements including session rotation, IP validation, and suspicious activity detection. The system should also support administrative features like force logout, session debugging, and bulk session operations.

**Requirements Gathering**

*Functional Requirements:*
- Handle 50M concurrent sessions across all Amazon properties
- Support session creation, validation, refresh, and termination
- Multi-device session management with device fingerprinting
- "Remember me" functionality with secure long-term tokens
- Session sharing across Amazon services with SSO
- Administrative session management (force logout, session debugging)
- Session analytics and fraud detection
- Support for different session types (web, mobile, API)

*Non-Functional Requirements:*
- Sub-50ms session validation latency globally
- 99.99% availability for session operations
- Support 1M session validations per second
- Handle 100K new sessions per minute during peak traffic
- Session data encrypted at rest and in transit
- Compliance with data residency requirements

**System Design**

```
       Web Apps, Mobile Apps, APIs
                    │
          ┌─────────┴─────────┐
          │  Session Gateway  │
          │  (Global Load     │
          │   Balancing)      │
          └─────────┬─────────┘
                    │
          ┌─────────┴─────────┐
          │ Session Manager   │
          │    Service        │
          └─────────┬─────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
│ Session   │ │   Cache   │ │  Security │
│ Storage   │ │  (Redis   │ │  Service  │
│(DynamoDB) │ │ Cluster)  │ │   (Fraud  │
└───────────┘ └───────────┘ │Detection) │
                            └───────────┘
```

**Follow-up Questions**

1. **How would you implement secure session sharing across different Amazon domains?**
2. **How would you handle session migration during system maintenance or failures?**
3. **How would you implement session concurrency limits (max devices per user)?**
4. **How would you detect and handle session hijacking or replay attacks?**
5. **How would you implement session debugging for customer support scenarios?**

---

### Problem 8: Design a File Upload Service

**Problem Statement (280 words)**

Design a file upload service that can handle 10TB of file uploads per day, supporting files from 1KB to 10GB in size. The service should provide upload progress tracking, resume capability for interrupted uploads, virus scanning, thumbnail generation for images, and integration with CDN for fast global file delivery.

Your file upload service will be used by Amazon sellers for product images, AWS customers for backup storage, Prime Photos for personal photo storage, and internal teams for document management. The system must support different storage classes based on access patterns, provide comprehensive metadata management, and ensure data durability and security.

Consider that files may need different processing pipelines (image resizing, video transcoding, document indexing), require access control and sharing capabilities, and comply with data retention and deletion policies. The system should handle upload failures gracefully and provide detailed analytics on upload patterns and storage usage.

**Requirements Gathering**

*Functional Requirements:*
- Handle uploads from 1KB to 10GB per file
- Process 10TB of uploads per day across all file types
- Resumable uploads with progress tracking
- Automated virus scanning and malware detection
- Image processing (thumbnail generation, format conversion)
- Video processing (transcoding, thumbnail extraction)
- File metadata extraction and indexing
- Access control with fine-grained permissions
- File sharing with expiring links
- Integration with CDN for fast global delivery

*Non-Functional Requirements:*
- Support 100K concurrent uploads
- 99.9% upload success rate
- Sub-5 second upload initiation time
- Support for multiple client types (web, mobile, API)
- 99.999999999% data durability (11 9's)
- Multi-region replication for disaster recovery

**System Design**

```
         Web/Mobile Clients & APIs
                    │
          ┌─────────┴─────────┐
          │   Upload Gateway  │
          │  (Multi-part &    │
          │  Resume Support)  │
          └─────────┬─────────┘
                    │
          ┌─────────┴─────────┐
          │  Processing       │
          │   Pipeline        │
          │ (Async Workers)   │
          └─────────┬─────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
│   File    │ │   Cache   │ │    CDN    │
│ Storage   │ │  (Redis)  │ │(CloudFront)│
│   (S3)    │ └───────────┘ └───────────┘
└───────────┘
```

**Follow-up Questions**

1. **How would you implement deduplication to save storage costs?**
2. **How would you handle file uploads that require real-time processing?**
3. **How would you implement secure direct uploads to S3 from client applications?**
4. **How would you handle file corruption detection and automatic repair?**
5. **How would you implement efficient file search and discovery across billions of files?**

---

### Problem 9: Design a Search Autocomplete System

**Problem Statement (270 words)**

Design a search autocomplete system that can serve 1 million queries per second with sub-100ms latency, providing relevant suggestions based on user input, search history, trending topics, and personalized preferences. The system should support multiple languages, handle typos and fuzzy matching, and provide real-time updates as new popular searches emerge.

Your autocomplete system will serve Amazon's product search, Alexa voice queries, AWS documentation search, and other Amazon properties. The system must balance relevance, freshness, and personalization while handling diverse query patterns and supporting both typed and voice input with different accuracy requirements.

Consider that autocomplete suggestions influence user behavior and business metrics, require careful ranking algorithms, and must be fast enough to provide suggestions as users type. The system should also support administrative controls for content filtering, boost/demote specific suggestions, and provide analytics on suggestion performance.

**Requirements Gathering**

*Functional Requirements:*
- Serve 1M autocomplete queries per second
- Support prefix matching with typo tolerance (edit distance ≤ 2)
- Personalized suggestions based on user history and preferences
- Trending topic integration with real-time updates
- Multi-language support with proper Unicode handling
- Voice query support with phonetic matching
- Administrative controls for suggestion management
- Analytics on suggestion clicks and conversion rates

*Non-Functional Requirements:*
- Sub-100ms response latency (p95)
- 99.9% availability globally
- Support 1B unique query prefixes
- Handle 10M new queries per day for suggestion corpus updates
- Multi-region deployment with local suggestion relevance
- Support for 20+ languages with proper text processing

**System Design**

```
      User Interfaces (Web, Mobile, Voice)
                        │
              ┌─────────┴─────────┐
              │  Autocomplete     │
              │     Gateway       │
              │ (Rate Limiting)   │
              └─────────┬─────────┘
                        │
              ┌─────────┴─────────┐
              │  Suggestion       │
              │    Service        │
              │   (Ranking)       │
              └─────────┬─────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────┴───────┐ ┌─────┴─────┐ ┌───────┴───────┐
│  Suggestion   │ │   Cache   │ │  User Profile │
│   Storage     │ │ (Redis)   │ │    Service    │
│(Elasticsearch)│ └───────────┘ │  (DynamoDB)   │
└───────────────┘               └───────────────┘
```

**Follow-up Questions**

1. **How would you implement real-time trending topic integration?**
2. **How would you handle autocomplete for voice queries with speech recognition errors?**
3. **How would you implement and measure the effectiveness of personalization?**
4. **How would you handle autocomplete suggestions for sensitive or inappropriate content?**
5. **How would you implement A/B testing for different ranking algorithms?**

---

### Problem 10: Design a User Activity Tracking System

**Problem Statement (285 words)**

Design a user activity tracking system that can collect and process 10 billion user events per day from web applications, mobile apps, and APIs. The system should provide real-time analytics, user behavior insights, conversion funnel analysis, and support both batch and streaming data processing for different use cases.

Your activity tracking system will collect data from Amazon Shopping (page views, clicks, purchases), Prime Video (video plays, pause events, completion rates), AWS Console (feature usage, error rates), and mobile apps. The system must handle high-volume event ingestion, provide real-time dashboards, and support complex analytical queries for business intelligence.

Consider that events have different priorities and processing requirements - some need immediate processing for real-time personalization, while others are used for long-term trend analysis. The system should support event schema evolution, provide data quality monitoring, and ensure user privacy compliance with features like data anonymization and deletion.

**Requirements Gathering**

*Functional Requirements:*
- Collect 10B events per day (116K per second average, 500K peak)
- Support multiple event types (page views, clicks, transactions, errors)
- Real-time event processing for immediate insights
- Batch processing for complex analytics and ML feature generation
- User journey tracking and funnel analysis
- A/B testing analytics and statistical significance testing
- Data export capabilities for ML and BI tools
- Privacy controls including data anonymization and user deletion

*Non-Functional Requirements:*
- Sub-50ms event ingestion latency
- 99.9% event delivery guarantee
- Support 100M daily active users across all platforms
- Handle 10x traffic spikes during major events
- Data retention from 7 days (real-time) to 7 years (compliance)
- Multi-region deployment with data residency compliance

**System Design**

```
   Web Apps, Mobile Apps, APIs
                │
      ┌─────────┴─────────┐
      │   Event Gateway   │
      │  (Validation &    │
      │   Enrichment)     │
      └─────────┬─────────┘
                │
      ┌─────────┴─────────┐
      │  Event Streaming  │
      │  (Apache Kafka)   │
      └─────────┬─────────┘
                │
  ┌─────────────┼─────────────┐
  │             │             │
┌─┴─┐     ┌─────┴─────┐ ┌─────┴─────┐
│RT │     │   Batch   │ │Analytics  │
│DB │     │Processing │ │  Storage  │
│   │     │ (Spark)   │ │(Data Lake)│
└───┘     └───────────┘ └───────────┘
```

**Follow-up Questions**

1. **How would you implement user session reconstruction from individual events?**
2. **How would you handle duplicate events and ensure exactly-once processing?**
3. **How would you implement real-time anomaly detection on user behavior patterns?**
4. **How would you ensure GDPR compliance for user data deletion requests?**
5. **How would you implement cost-effective long-term storage for regulatory compliance?**

## Summary

These 10 comprehensive L6 system design problems provide detailed technical depth appropriate for Amazon Engineering Manager interviews. Each problem includes:

- Realistic scale and complexity for L6 scope (millions to tens of millions of users)
- Complete system architecture with trade-off discussions
- Database schemas and API designs
- Detailed capacity planning and scaling considerations
- Technology recommendations with alternatives
- Practical follow-up questions testing deeper understanding

The problems cover essential system components that L6 engineers commonly encounter:
- Rate limiting and traffic management
- Real-time communication and notifications  
- Data storage and retrieval at scale
- Background processing and workflow management
- Feature management and experimentation
- Monitoring and analytics systems
- User management and security
- File handling and content delivery
- Search and discovery systems
- Event processing and data pipelines

Each solution demonstrates production-ready thinking with attention to monitoring, security, compliance, and operational concerns that distinguish L6-level system design from more junior approaches.

### 1. L6 Design Problem Characteristics

#### Scale and Complexity for L6
- **User Scale**: 10M - 100M active users
- **Technical Complexity**: Multi-service component systems
- **Business Impact**: $10M - $50M revenue systems
- **Team Size**: Systems manageable by 10-25 engineers
- **Technology Scope**: Component-level architecture decisions

#### L6 vs L7 Problem Differentiation
```markdown
| Aspect | L6 Problems | L7 Problems |
|--------|-------------|-------------|
| **Scale** | Millions of users | Billions of users |
| **Scope** | Component systems | Platform ecosystems |
| **Innovation** | Proven patterns | Industry-leading innovation |
| **Complexity** | Multi-service | Multi-platform |
| **Authority** | Type 2 decisions | Type 1 strategic decisions |
```

### 2. L6 Problem Categories and Detailed Solutions

#### Category 1: User-Facing Application Systems (8 Problems)

**Problem 1: Design a Social Media Feed System**
```markdown
**Complexity Level**: L6 Intermediate
**User Scale**: 50M DAU, 500M posts/day
**Key Challenges**: 
- Real-time feed generation
- Content recommendation algorithms
- High read:write ratio (100:1)
- Media storage and CDN strategy
**Focus Areas**: Caching, database sharding, recommendation engines
```

**Problem 2: Build a Real-Time Chat Application**
```markdown
**Complexity Level**: L6 Intermediate-Advanced
**User Scale**: 20M concurrent users, 1B messages/day
**Key Challenges**:
- Message delivery guarantees
- Presence and typing indicators
- Group chat scalability
- Message history and search
**Focus Areas**: WebSocket management, message queuing, data consistency
```

**Problem 3: Design a Video Streaming Service**
```markdown
**Complexity Level**: L6 Advanced
**User Scale**: 30M concurrent streams, 100PB content
**Key Challenges**:
- Video encoding and transcoding pipeline
- CDN optimization and edge caching
- Adaptive bitrate streaming
- Content recommendation and discovery
**Focus Areas**: Media processing, global CDN, recommendation algorithms
```

#### Category 2: E-Commerce and Transaction Systems (6 Problems)

**Problem 4: Design an E-Commerce Product Catalog System**
```markdown
**Complexity Level**: L6 Intermediate
**User Scale**: 10M products, 100M searches/day
**Key Challenges**:
- Product search and filtering
- Inventory management across warehouses
- Price and promotion management
- Personalized product recommendations
**Focus Areas**: Search infrastructure, inventory systems, caching strategies
```

**Problem 5: Build a Payment Processing System**
```markdown
**Complexity Level**: L6 Advanced
**User Scale**: 10M transactions/day, $1B processed/month
**Key Challenges**:
- Payment method integration
- Fraud detection and prevention
- PCI compliance and security
- Transaction reliability and rollback
**Focus Areas**: Security, compliance, distributed transactions, fraud detection
```

#### Category 3: Data-Heavy Application Systems (6 Problems)

**Problem 6: Design a Real-Time Analytics Dashboard**
```markdown
**Complexity Level**: L6 Intermediate-Advanced
**User Scale**: 1M events/second, real-time visualization
**Key Challenges**:
- Real-time data ingestion and processing
- Time-series data storage and querying
- Dashboard performance at scale
- Data aggregation and rollups
**Focus Areas**: Stream processing, time-series databases, data visualization
```

**Problem 7: Build a Content Management System**
```markdown
**Complexity Level**: L6 Intermediate
**User Scale**: 1M content creators, 100M content pieces
**Key Challenges**:
- Version control and content history
- Multi-format content handling
- Collaborative editing and workflows
- Content delivery and CDN integration
**Focus Areas**: Content versioning, collaboration, storage optimization
```

### 3. Complete L6 Problem Solutions Framework

#### Solution Structure for Each Problem
```markdown
**Requirements Gathering (10 minutes)**
   Functional Requirements: Core features and user journeys
   Non-Functional Requirements: Scale, performance, availability
   Constraints: Budget, timeline, team size, existing systems
   Success Metrics: Business KPIs and technical metrics

**High-Level Architecture (15 minutes)**
   Component Identification: Services, databases, external systems
   Data Flow Design: Request/response flows and data movement
   Technology Stack: Programming languages, databases, frameworks
   Integration Patterns: API design and service communication

**Detailed Design (20 minutes)**
   Database Design: Schema, indexing, sharding strategies
   API Design: RESTful endpoints, GraphQL schemas, contracts
   Caching Strategy: Multi-layer caching and invalidation
   Security Design: Authentication, authorization, data protection
   Performance Optimization: Query optimization, resource management

**Scaling and Operations (10 minutes)**
   Horizontal Scaling: Auto-scaling, load balancing strategies
   Monitoring and Alerting: Metrics, logging, distributed tracing
   Deployment Strategy: Blue-green, canary, rolling deployments
   Disaster Recovery: Backup, failover, business continuity

**Trade-offs and Alternatives (5 minutes)**
   Technology Alternatives: Different database/framework choices
   Architecture Patterns: Monolith vs microservices trade-offs
   Consistency Models: Strong vs eventual consistency implications
   Cost Optimization: Performance vs cost trade-offs
```

### 4. L6-Specific AWS Architecture Patterns

#### Pattern 1: High-Traffic Web Application
```yaml
# L6 Web Application Architecture Pattern
web_application_pattern:
  load_balancer:
    type: "Application Load Balancer"
    features: ["SSL termination", "health checks", "sticky sessions"]
    capacity: "10,000 requests/second"
  
  application_tier:
    compute: "ECS with Fargate"
    auto_scaling: "Target tracking based on CPU/memory"
    min_capacity: 10
    max_capacity: 100
  
  database_tier:
    primary: "RDS PostgreSQL Multi-AZ"
    read_replicas: 3
    connection_pooling: "RDS Proxy"
    backup_strategy: "Point-in-time recovery"
  
  caching_layer:
    application_cache: "ElastiCache Redis cluster"
    cdn: "CloudFront with origin shield"
    cache_strategy: "Write-through for critical data"
  
  storage:
    static_assets: "S3 with CloudFront integration"
    user_uploads: "S3 with lifecycle policies"
    logs: "CloudWatch Logs with retention policies"
```

#### Pattern 2: Event-Driven Microservices
```yaml
# L6 Event-Driven Architecture Pattern
microservices_pattern:
  api_gateway:
    service: "API Gateway"
    features: ["rate limiting", "authentication", "request/response transformation"]
    capacity: "5,000 requests/second per service"
  
  services:
    user_service:
      compute: "Lambda functions"
      database: "DynamoDB with GSI"
      events: "Publishes to SNS topics"
    
    notification_service:
      compute: "ECS containers"
      queue: "SQS FIFO queues"
      external: "Third-party email/SMS services"
  
  messaging:
    event_bus: "EventBridge for service decoupling"
    message_queues: "SQS for reliable message delivery"
    pub_sub: "SNS for fan-out patterns"
  
  observability:
    tracing: "X-Ray for distributed tracing"
    metrics: "CloudWatch custom metrics"
    logging: "Structured logging to CloudWatch"
```

### 5. L6 Problem Practice Schedule

#### Week 1-2: Foundation Problems (Easier)
```markdown
**Day 1-2**: URL Shortener (like bit.ly)
- Focus: Basic system design fundamentals
- Practice: Requirements gathering, high-level design

**Day 3-4**: Pastebin Clone
- Focus: Text storage and retrieval at scale
- Practice: Database design, caching strategies

**Day 5-6**: Rate Limiter
- Focus: Distributed rate limiting algorithms
- Practice: Algorithm design, consistency trade-offs

**Day 7**: Review and mock interview practice
```

#### Week 3-4: Intermediate Problems
```markdown
**Day 1-2**: Social Media Feed
- Focus: Timeline generation, caching, recommendations
- Practice: Complex data flows, performance optimization

**Day 3-4**: Chat Application
- Focus: Real-time communication, message delivery
- Practice: WebSocket handling, message queuing

**Day 5-6**: E-commerce Product Catalog
- Focus: Search, inventory, product data management
- Practice: Search infrastructure, data consistency

**Day 7**: Review and advanced mock interviews
```

#### Week 5-6: Advanced L6 Problems
```markdown
**Day 1-2**: Video Streaming Service
- Focus: Media processing, CDN, adaptive streaming
- Practice: Media architecture, global distribution

**Day 3-4**: Payment Processing System
- Focus: Security, compliance, transaction reliability
- Practice: Distributed transactions, fraud detection

**Day 5-6**: Real-time Analytics Dashboard
- Focus: Stream processing, time-series data, visualization
- Practice: Real-time architectures, data aggregation

**Day 7**: Comprehensive review and final practice
```

## <� Immediate L6 Practice Resources

### Available Now for Practice

1. **Study system design fundamentals** in our [main guide](index.md)
2. **Review AWS services** in our [AWS Services guide](aws-services.md)
3. **Practice with case studies** in our [Case Studies collection](case-studies.md)

### Quick Start L6 Problems (Practice These Now)

#### Beginner L6 Problems
1. **URL Shortener (like bit.ly)**
   - Requirements: 100M URLs/day, custom aliases, analytics
   - Focus: Database design, caching, encoding algorithms

2. **Task Scheduler System**
   - Requirements: Distributed task execution, fault tolerance
   - Focus: Queue management, worker scaling, failure handling

3. **Real-time Notification System**
   - Requirements: Push notifications, email, SMS delivery
   - Focus: Message queuing, delivery guarantees, rate limiting

#### Intermediate L6 Problems
4. **Social Media Timeline**
   - Requirements: 50M users, personalized feeds, real-time updates
   - Focus: Feed generation, caching strategies, recommendation algorithms

5. **Multiplayer Game Backend**
   - Requirements: Real-time gameplay, matchmaking, leaderboards
   - Focus: Low-latency communication, state synchronization, data consistency

6. **File Storage Service (like Dropbox)**
   - Requirements: File sync, version control, sharing, mobile apps
   - Focus: Conflict resolution, delta sync, metadata management

### L6 Practice Framework

**For Each Problem, Practice:**
```markdown
1. **Requirements Clarification (5 min)**
   - Ask about scale, features, constraints
   - Define success metrics and SLAs

2. **High-Level Design (15 min)**
   - Draw main components and data flow
   - Choose appropriate technologies
   - Explain design decisions

3. **Deep Dive (20 min)**
   - Database schema and access patterns
   - API design and service contracts
   - Caching and performance optimization
   - Security and compliance considerations

4. **Scale and Optimize (15 min)**
   - Identify bottlenecks and scaling strategies
   - Discuss monitoring and operational concerns
   - Address failure scenarios and reliability

5. **Wrap-up (5 min)**
   - Summarize key decisions and trade-offs
   - Discuss alternative approaches
   - Address any remaining questions
```

## = L6 Design Resources

### Essential Reading
- **[System Design Fundamentals](fundamentals.md)** - Core concepts and patterns
- **[AWS Services Guide](aws-services.md)** - L6-relevant AWS service patterns
- **[Scale Architecture](scale-architecture.md)** - Scaling strategies for L6 systems

### Practice Tools
- **[Time Management Template](time-management-template.md)** - Structure your 60-minute design sessions
- **[Case Studies](case-studies.md)** - Learn from real L6-scale implementations
- **[Well-Architected Framework](well-architected.md)** - Amazon's design principles

## =� L6 Content Release Timeline

### Week of February 10, 2025
- [ ] 15 complete L6 problems with detailed solutions
- [ ] Step-by-step solution walkthroughs with diagrams
- [ ] L6-specific AWS architecture patterns and templates

### Week of February 17, 2025
- [ ] Interactive problem practice platform
- [ ] Video walkthroughs of complex L6 problem solutions
- [ ] Mock interview simulator with L6 problem difficulty

### Week of February 24, 2025
- [ ] Advanced L6 techniques and optimization strategies
- [ ] Common L6 design mistakes and how to avoid them
- [ ] Integration with Amazon's L6 technical competency framework

## =� L6 Design Success Strategies

!!! success "L6 System Design Excellence"
    1. **Focus on production readiness** - Include monitoring, alerting, operations
    2. **Balance complexity appropriately** - Avoid over-engineering for L6 scale
    3. **Demonstrate hands-on technical depth** - Show you can still architect and code
    4. **Consider team implementation** - Designs manageable by 10-25 engineers
    5. **Optimize for maintainability** - Long-term operational considerations
    6. **Show business awareness** - Connect technical decisions to business outcomes

## � Start Practicing Now

1. **Pick a beginner problem** from the list above
2. **Set a 60-minute timer** and practice the complete flow
3. **Record yourself** explaining the design
4. **Get feedback** from experienced engineers
5. **Iterate and improve** your design process and communication

---

!!! quote "L6 Design Philosophy"
    "L6 system design is about building robust, scalable systems that real engineering teams can implement and maintain. Focus on practical solutions that balance technical excellence with operational simplicity."

---

*This comprehensive L6 problem set will be available February 20, 2025. Start practicing with our [fundamentals guide](fundamentals.md) and basic problems listed above.*