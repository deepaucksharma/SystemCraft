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

**Algorithm Details**

*Smart Routing Algorithm:*
```python
class NotificationRouter:
    def __init__(self, preference_service, device_service):
        self.preference_service = preference_service
        self.device_service = device_service
        
    def route_notification(self, user_id, template, priority):
        # Get user preferences and device availability
        preferences = self.preference_service.get_preferences(user_id)
        devices = self.device_service.get_active_devices(user_id)
        
        channels = self._select_channels(template, preferences, devices, priority)
        schedule = self._determine_schedule(preferences, priority)
        
        return {
            'channels': channels,
            'schedule': schedule,
            'fallback_chain': self._build_fallback_chain(channels, priority)
        }
    
    def _select_channels(self, template, preferences, devices, priority):
        available_channels = template.supported_channels
        enabled_channels = [ch for ch in available_channels 
                          if preferences.is_enabled(template.category, ch)]
        
        if priority >= 4:  # Critical notifications
            # Try multiple channels for critical notifications
            return self._prioritize_channels(enabled_channels, devices)
        
        # Normal priority - respect user preferences strictly
        return enabled_channels[:1] if enabled_channels else []
    
    def _prioritize_channels(self, channels, devices):
        # Priority order for critical notifications
        priority_order = ['push', 'sms', 'email', 'voice']
        
        # Sort channels by availability and priority
        available = []
        for channel in priority_order:
            if channel in channels:
                if channel == 'push' and any(d.is_active for d in devices):
                    available.append(channel)
                elif channel in ['sms', 'voice'] and any(d.phone for d in devices):
                    available.append(channel)
                elif channel == 'email':
                    available.append(channel)
        
        return available[:2]  # Max 2 channels for critical notifications
```

*Template Processing Engine:*
```python
import jinja2
from typing import Dict, Any

class TemplateEngine:
    def __init__(self):
        self.env = jinja2.Environment(
            loader=jinja2.DictLoader({}),
            autoescape=True,
            trim_blocks=True,
            lstrip_blocks=True
        )
        self.env.filters['currency'] = self._currency_filter
        self.env.filters['datetime'] = self._datetime_filter
    
    def render(self, template: dict, variables: Dict[str, Any], 
               user_context: dict) -> dict:
        # Merge user context with variables
        context = {**variables, **user_context}
        
        # Add helper functions
        context['user'] = user_context
        context['now'] = datetime.now()
        
        rendered = {}
        
        # Render title
        if template.get('title_template'):
            title_tmpl = self.env.from_string(template['title_template'])
            rendered['title'] = title_tmpl.render(context)
        
        # Render body with proper escaping for different channels
        if template.get('body_template'):
            body_tmpl = self.env.from_string(template['body_template'])
            rendered['body'] = body_tmpl.render(context)
        
        # Channel-specific rendering
        for channel in template.get('channels', []):
            if template.get(f'{channel}_template'):
                channel_tmpl = self.env.from_string(template[f'{channel}_template'])
                rendered[f'{channel}_content'] = channel_tmpl.render(context)
        
        return rendered
    
    def _currency_filter(self, value, currency='USD'):
        """Format currency values"""
        if currency == 'USD':
            return f"${value:,.2f}"
        return f"{value:,.2f} {currency}"
    
    def _datetime_filter(self, value, format='%Y-%m-%d %H:%M'):
        """Format datetime values"""
        if isinstance(value, str):
            value = datetime.fromisoformat(value)
        return value.strftime(format)
```

**Data Flow**

*Notification Processing Flow:*
```
1. API Request → Notification Gateway
   - Request validation and rate limiting
   - Authentication and authorization check
   - Template resolution and validation

2. Notification Gateway → Orchestrator Service
   - User preference lookup and channel selection
   - Template rendering with user context
   - Priority-based queue assignment

3. Orchestrator Service → Message Queues
   - High priority: Immediate processing queue
   - Normal priority: Batched processing queue
   - Scheduled: Time-based trigger queue

4. Queue Consumers → Channel Services
   - Push Service: FCM/APNS integration
   - Email Service: SES integration with templates
   - SMS Service: SNS/Twilio integration
   - In-app Service: WebSocket/Server-sent events

5. Channel Services → External Providers
   - Retry logic with exponential backoff
   - Dead letter queues for failed deliveries
   - Success/failure callback handling

6. Delivery Tracking → Analytics Pipeline
   - Real-time delivery status updates
   - User engagement metrics collection
   - Performance monitoring and alerting
```

*User Preference Synchronization:*
```
1. User Updates Preferences → Preference Service
2. Preference Service → Cache Update (Redis)
3. Preference Service → Database Update (PostgreSQL)
4. Preference Service → Event Publication (SNS)
5. Notification Services → Cache Refresh
6. Analytics Service → Preference Change Tracking
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

**Scaling Considerations**

*Horizontal Scaling Strategy:*
```
Notification Gateway:
- Auto-scaling based on request rate and queue depth
- Load balancing with session affinity for WebSocket connections
- Circuit breakers for third-party service failures
- Regional deployment with cross-region failover

Template Service:
- Read-heavy workload with aggressive caching
- Template pre-compilation and caching in Redis
- CDN for static template assets and images
- Template versioning for A/B testing support

Channel Services:
- Independent scaling based on channel-specific metrics
- Push service: Scale based on device connection count
- Email service: Scale based on SES sending rate limits
- SMS service: Scale based on SNS throughput limits

Queue Management:
- Separate queues for different priority levels
- Dead letter queues for failed notifications
- Queue auto-scaling based on message depth
- Cross-region replication for disaster recovery

Database Scaling:
- Read replicas for user preferences (5 replicas)
- Partitioning delivery logs by date and user_id
- Archive old data to S3 for cost optimization
- Connection pooling and query optimization
```

*Geographic Distribution:*
```
Multi-Region Architecture:
- Primary regions: us-east-1, eu-west-1, ap-southeast-1
- Regional notification processing to reduce latency
- Cross-region template and preference replication
- Local compliance handling (GDPR, data residency)
- Intelligent routing based on user location
```

**Monitoring and Alerts**

*Key Metrics:*
```yaml
Delivery Metrics:
  - delivery_success_rate: >99% (critical)
  - delivery_latency_p95: <5s for high priority
  - delivery_latency_p99: <30s for normal priority
  - bounce_rate: <2% for email
  - opt_out_rate: <0.5% per campaign

Performance Metrics:
  - api_response_time_p95: <100ms
  - queue_processing_time: <1s average
  - template_render_time: <50ms
  - throughput: >5.8K notifications/second

Business Metrics:
  - click_through_rate: track by template and channel
  - conversion_rate: track business outcomes
  - user_engagement_score: composite metric
  - cost_per_notification: optimize spend efficiency

System Health:
  - queue_depth: monitor backlog by priority
  - error_rate: <0.1% for all services
  - third_party_api_health: monitor external dependencies
  - resource_utilization: CPU <70%, Memory <80%
```

*Alerting Strategy:*
```yaml
Critical Alerts (PagerDuty):
  - Delivery success rate < 95% for 5 minutes
  - High priority notification delay > 10 seconds
  - Third-party service outage affecting >10% of traffic
  - Database connection failures
  - Queue processing stopped for >1 minute

Warning Alerts (Slack):
  - Delivery success rate < 98% for 15 minutes
  - Queue depth > 10,000 messages for >10 minutes
  - Template rendering errors > 1% for 5 minutes
  - Unusual bounce rates or opt-out spikes

Capacity Alerts:
  - Queue depth trending to capacity within 30 minutes
  - Database connections > 80% of pool
  - Third-party service rate limits approaching (80%)
  - Memory usage > 75% across services
```

*Dashboard Design:*
```yaml
Executive Dashboard:
  - Daily/Weekly notification volume trends
  - Delivery success rates by channel
  - User engagement metrics and conversion rates
  - Cost per notification and ROI metrics

Operational Dashboard:
  - Real-time system health and service status
  - Queue depths and processing rates by priority
  - Third-party service health and rate limits
  - Error rates and failure modes by service

Engineering Dashboard:
  - API performance metrics and latency distributions
  - Database performance and query execution times
  - Template rendering performance and cache hit rates
  - Resource utilization and auto-scaling events
```

**Follow-up Questions**

1. **How would you handle notification delivery during third-party service outages?**
   - Implement graceful degradation with backup providers
   - Use circuit breaker patterns to detect and route around failures
   - Queue notifications for retry when services recover
   - Provide fallback channels (SMS when push fails, email when SMS fails)

2. **How would you implement smart notification batching to reduce user fatigue?**
   - Implement frequency capping per user per time period
   - Batch non-urgent notifications into digest formats
   - Use machine learning to optimize send times per user
   - A/B test different batching strategies and measure engagement

3. **How would you ensure GDPR compliance for EU users?**
   - Implement data residency with EU-only processing for EU users
   - Provide explicit opt-in/opt-out mechanisms for all channels
   - Support right-to-deletion with cascading data removal
   - Maintain audit logs for compliance reporting

4. **How would you implement real-time notification analytics dashboard?**
   - Stream delivery events to Kinesis for real-time processing
   - Use ElasticSearch for real-time search and aggregation
   - WebSocket connections for live dashboard updates
   - Pre-compute common metrics in real-time with Redis

5. **How would you handle notification delivery across different time zones efficiently?**
   - Store user timezone preferences and respect quiet hours
   - Implement timezone-aware scheduling in orchestrator service
   - Use distributed cron jobs across regions for scheduled notifications
   - Buffer notifications during user's night hours with intelligent batching

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

**API Design**

```yaml
# URL Shortener Service API

/api/v1/urls:
  post:
    description: Create a shortened URL
    request:
      url: string (required)
      custom_alias: string (optional)
      expires_at: timestamp (optional)
      description: string (optional)
    response:
      short_code: string
      short_url: string
      long_url: string
      created_at: timestamp
      expires_at: timestamp

/api/v1/urls/{short_code}:
  get:
    description: Get URL details
    response:
      short_code: string
      long_url: string
      created_at: timestamp
      expires_at: timestamp
      click_count: integer
      is_active: boolean
  
  put:
    description: Update URL (requires ownership)
    request:
      expires_at: timestamp (optional)
      is_active: boolean (optional)
    response:
      updated_at: timestamp
      
  delete:
    description: Delete URL (requires ownership)
    response:
      deleted: boolean

/api/v1/urls/bulk:
  post:
    description: Create multiple URLs
    request:
      urls: array
        - url: string
          custom_alias: string (optional)
          expires_at: timestamp (optional)
    response:
      results: array
        - short_code: string
          short_url: string
          status: string

/r/{short_code}:
  get:
    description: Redirect to original URL
    response: 302 redirect with analytics tracking

/api/v1/analytics/{short_code}:
  get:
    description: Get click analytics
    parameters:
      start_date: date (optional)
      end_date: date (optional)
      granularity: enum [hour, day, week] (optional)
    response:
      total_clicks: integer
      unique_clicks: integer
      click_timeline: array
      geographic_distribution: object
      device_breakdown: object
      referrer_stats: object
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

**Data Flow**

*URL Creation Flow:*
```
1. Client Request → API Gateway
   - Rate limiting and authentication
   - Request validation and URL normalization
   - Custom alias availability check

2. API Gateway → URL Creation Service
   - Generate unique counter from distributed counter service
   - Create short code using Base62 encoding + randomization
   - Store URL mapping in DynamoDB
   - Update user quota and usage tracking

3. URL Creation Service → Cache Layer
   - Pre-populate Redis cache for immediate availability
   - Set appropriate TTL based on URL type
   - Warm CDN cache for popular domains

4. Response → Client
   - Return short URL and metadata
   - Include analytics tracking parameters
   - Provide management URLs for registered users
```

*URL Redirect Flow:*
```
1. Browser/Client → CDN (CloudFront)
   - Geographic edge location routing
   - Cache hit for popular URLs (99% hit rate)
   - Cache miss forwards to origin

2. CDN → Load Balancer → Redirect Service
   - Health check and traffic distribution
   - SSL termination and security headers
   - Request logging for analytics

3. Redirect Service → Cache (Redis)
   - Check Redis for URL mapping
   - Cache hit: immediate redirect response
   - Cache miss: query database

4. Cache Miss → Database Query
   - Query DynamoDB for URL mapping
   - Check expiration and active status
   - Update cache with result

5. Analytics Collection (Async)
   - Extract user agent, IP, referrer
   - Geo-location and device detection
   - Queue analytics event to Kinesis
   - Batch processing for aggregation

6. Redirect Response → Client
   - HTTP 302 redirect to original URL
   - Analytics tracking pixels/headers
   - Cache headers for CDN optimization
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

Database Scaling:
  - DynamoDB with on-demand scaling for URLs table
  - Global secondary indexes for user queries
  - DynamoDB Streams for real-time analytics
  - S3 archival for old analytics data

Analytics Pipeline:
  - Kinesis Data Streams for real-time ingestion
  - Kinesis Analytics for real-time aggregation
  - ClickHouse cluster for analytical queries
  - S3 + Athena for historical analysis
```

*Performance Optimization:*
```yaml
Caching Layers:
  - CDN: 1-hour TTL for redirect responses
  - Redis: URL mappings with 24-hour TTL
  - Application: In-memory cache for frequent lookups
  - Database: Connection pooling and query optimization

Load Distribution:
  - Geographic DNS routing for regional traffic
  - Consistent hashing for cache distribution
  - Read replicas for analytics queries
  - Separate write/read workloads

Resource Optimization:
  - Container auto-scaling based on CPU/memory
  - Database connection pooling
  - Async processing for non-critical operations
  - Efficient data structures for high throughput
```

**Monitoring and Alerts**

*Key Metrics:*
```yaml
Performance Metrics:
  - redirect_latency_p95: <50ms globally
  - redirect_latency_p99: <100ms globally
  - url_creation_latency: <200ms
  - cache_hit_ratio: >99% for redirects
  - cdn_hit_ratio: >95% for popular URLs

Availability Metrics:
  - redirect_success_rate: >99.9%
  - url_creation_success_rate: >99.5%
  - database_availability: >99.99%
  - third_party_service_health: monitor dependencies

Business Metrics:
  - daily_url_creation_count: track growth trends
  - click_through_rate: measure engagement
  - user_retention_rate: track active users
  - revenue_per_user: track monetization

System Health:
  - database_read_latency: <10ms p95
  - database_write_latency: <20ms p95
  - queue_processing_lag: <1 second
  - error_rate: <0.1% across all services
```

*Alerting Strategy:*
```yaml
Critical Alerts (PagerDuty):
  - Redirect service down for >1 minute
  - Database connectivity issues
  - CDN performance degradation (>500ms p95)
  - URL creation service failure rate >5%

Warning Alerts (Slack):
  - Cache hit ratio drops below 95%
  - Unusual traffic patterns (10x normal)
  - High error rates from specific user agents
  - Database connection pool exhaustion

Capacity Alerts:
  - Daily URL creation approaching quota limits
  - Database storage utilization >80%
  - Redis memory usage >75%
  - Auto-scaling events triggering frequently
```

**Follow-up Questions**

1. **How would you handle a viral URL that receives 1M clicks per minute?**
   - Implement CDN edge caching with longer TTLs (6+ hours)
   - Use geo-distributed caching layers
   - Separate analytics collection to avoid bottlenecks
   - Auto-scale redirect service based on traffic patterns
   - Implement circuit breakers to prevent cascade failures

2. **How would you implement URL preview features securely?**
   - Create isolated preview service with limited resources
   - Use headless browsers in sandboxed containers
   - Implement request timeouts and resource limits
   - Cache preview results with appropriate TTLs
   - Filter malicious content and scripts in previews

3. **How would you detect and handle malicious URLs?**
   - Integrate with URL reputation services (Google Safe Browsing)
   - Implement real-time scanning during URL creation
   - Monitor click patterns for suspicious activity
   - Provide user reporting mechanism for abuse
   - Automated takedown system for confirmed malicious URLs

4. **How would you migrate from short codes to a new encoding scheme?**
   - Implement dual encoding system during transition
   - Maintain backward compatibility for existing URLs
   - Use feature flags to gradually roll out new encoding
   - Batch migrate existing URLs during low-traffic periods
   - Monitor performance impact and rollback capability

5. **How would you implement real-time click analytics for enterprise users?**
   - Stream click events to Kinesis Data Streams
   - Use Kinesis Analytics for real-time aggregation
   - WebSocket connections for dashboard updates
   - Pre-compute common metrics in Redis
   - Implement custom alerting on click thresholds

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

**Database Design**

*Task Metadata Schema (PostgreSQL):*
```sql
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY,
    task_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 5,
    max_retries INTEGER DEFAULT 3,
    retry_count INTEGER DEFAULT 0,
    timeout_seconds INTEGER DEFAULT 300,
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    worker_id VARCHAR(255),
    error_message TEXT,
    result JSONB
);

CREATE TABLE task_dependencies (
    task_id UUID REFERENCES tasks(task_id),
    depends_on UUID REFERENCES tasks(task_id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (task_id, depends_on)
);

CREATE TABLE worker_pools (
    pool_id VARCHAR(100) PRIMARY KEY,
    task_types TEXT[],
    min_workers INTEGER DEFAULT 1,
    max_workers INTEGER DEFAULT 10,
    current_workers INTEGER DEFAULT 0,
    worker_config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE task_execution_history (
    execution_id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(task_id),
    worker_id VARCHAR(255),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20),
    error_message TEXT,
    execution_time_ms INTEGER,
    resource_usage JSONB
);

-- Indexes for performance
CREATE INDEX idx_tasks_status_priority ON tasks(status, priority DESC, created_at);
CREATE INDEX idx_tasks_scheduled_at ON tasks(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_tasks_worker_id ON tasks(worker_id) WHERE worker_id IS NOT NULL;
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on);
```

*Queue Configuration (Redis):*
```yaml
# Priority Queues in Redis
Priority_1_Queue: "queue:priority:1"  # Critical tasks
Priority_2_Queue: "queue:priority:2"  # High priority
Priority_3_Queue: "queue:priority:3"  # Normal priority
Priority_4_Queue: "queue:priority:4"  # Low priority
Priority_5_Queue: "queue:priority:5"  # Background tasks

# Delayed Tasks
Scheduled_Tasks: "queue:scheduled"  # Sorted set by execution time
Retry_Tasks: "queue:retry"          # Tasks awaiting retry

# Dead Letter Queue
Dead_Letter_Queue: "queue:dlq"     # Failed tasks after max retries

# Worker Tracking
Active_Workers: "workers:active"   # Set of active worker IDs
Worker_Heartbeats: "workers:heartbeats"  # Hash of worker_id -> timestamp
```

**API Design**

```yaml
# Task Queue Service API

/api/v1/tasks:
  post:
    description: Submit a new task
    request:
      task_type: string (required)
      payload: object (required)
      priority: integer (1-10, default: 5)
      scheduled_at: timestamp (optional)
      timeout_seconds: integer (default: 300)
      max_retries: integer (default: 3)
      dependencies: array[string] (task_ids)
    response:
      task_id: string
      status: string
      estimated_execution: timestamp

/api/v1/tasks/{task_id}:
  get:
    description: Get task details and status
    response:
      task_id: string
      task_type: string
      status: string
      priority: integer
      created_at: timestamp
      started_at: timestamp
      completed_at: timestamp
      result: object
      error_message: string

/api/v1/tasks/{task_id}/cancel:
  post:
    description: Cancel a pending or running task
    response:
      cancelled: boolean
      message: string

/api/v1/tasks/{task_id}/retry:
  post:
    description: Retry a failed task
    response:
      retried: boolean
      new_task_id: string

/api/v1/workers:
  get:
    description: List active workers
    response:
      workers: array
        - worker_id: string
          pool_id: string
          status: string
          current_task: string
          last_heartbeat: timestamp

/api/v1/queues/stats:
  get:
    description: Get queue statistics
    response:
      queues: array
        - priority: integer
          pending_tasks: integer
          processing_tasks: integer
          average_wait_time: integer
      total_workers: integer
      tasks_per_minute: integer
```

**Algorithm Details**

*Task Scheduling Algorithm:*
```python
import heapq
from datetime import datetime, timedelta
from typing import List, Optional

class TaskScheduler:
    def __init__(self, redis_client, db_connection):
        self.redis = redis_client
        self.db = db_connection
        self.priority_queues = [f"queue:priority:{i}" for i in range(1, 6)]
        self.scheduled_queue = "queue:scheduled"
    
    def submit_task(self, task: dict) -> str:
        # Validate dependencies
        if task.get('dependencies'):
            self._validate_dependencies(task['dependencies'])
        
        # Generate task ID and store metadata
        task_id = self._generate_task_id()
        task_record = self._create_task_record(task_id, task)
        
        # Store in database
        self.db.insert_task(task_record)
        
        # Queue task based on scheduling and dependencies
        if task.get('scheduled_at'):
            self._schedule_delayed_task(task_id, task)
        elif task.get('dependencies'):
            self._queue_dependent_task(task_id, task)
        else:
            self._queue_immediate_task(task_id, task)
        
        return task_id
    
    def _queue_immediate_task(self, task_id: str, task: dict):
        priority = task.get('priority', 5)
        queue_name = f"queue:priority:{priority}"
        
        task_payload = {
            'task_id': task_id,
            'task_type': task['task_type'],
            'payload': task['payload'],
            'timeout': task.get('timeout_seconds', 300),
            'max_retries': task.get('max_retries', 3)
        }
        
        # Use Redis LPUSH for FIFO within priority level
        self.redis.lpush(queue_name, json.dumps(task_payload))
        
        # Update metrics
        self.redis.incr(f"metrics:queued:{priority}")
    
    def _schedule_delayed_task(self, task_id: str, task: dict):
        scheduled_time = datetime.fromisoformat(task['scheduled_at'])
        timestamp = scheduled_time.timestamp()
        
        task_payload = {
            'task_id': task_id,
            'priority': task.get('priority', 5),
            'scheduled_for': task['scheduled_at']
        }
        
        # Use sorted set for time-based scheduling
        self.redis.zadd(self.scheduled_queue, {json.dumps(task_payload): timestamp})
    
    def process_scheduled_tasks(self):
        """Background process to move scheduled tasks to execution queues"""
        current_time = datetime.now().timestamp()
        
        # Get tasks ready for execution
        ready_tasks = self.redis.zrangebyscore(
            self.scheduled_queue, 0, current_time, withscores=True
        )
        
        for task_json, score in ready_tasks:
            task = json.loads(task_json)
            
            # Remove from scheduled queue
            self.redis.zrem(self.scheduled_queue, task_json)
            
            # Move to appropriate priority queue
            self._queue_immediate_task(task['task_id'], task)
```

*Worker Management System:*
```python
import threading
import time
from typing import Dict, List

class WorkerManager:
    def __init__(self, redis_client, db_connection):
        self.redis = redis_client
        self.db = db_connection
        self.active_workers = {}
        self.worker_pools = {}
        self.heartbeat_thread = None
        
    def register_worker_pool(self, pool_config: dict):
        pool_id = pool_config['pool_id']
        self.worker_pools[pool_id] = {
            'task_types': pool_config['task_types'],
            'min_workers': pool_config['min_workers'],
            'max_workers': pool_config['max_workers'],
            'current_workers': 0,
            'worker_config': pool_config.get('worker_config', {})
        }
        
        # Start initial workers
        for _ in range(pool_config['min_workers']):
            self._spawn_worker(pool_id)
    
    def _spawn_worker(self, pool_id: str) -> str:
        worker_id = f"{pool_id}_{int(time.time())}_{random.randint(1000, 9999)}"
        
        worker_config = {
            'worker_id': worker_id,
            'pool_id': pool_id,
            'task_types': self.worker_pools[pool_id]['task_types'],
            'config': self.worker_pools[pool_id]['worker_config']
        }
        
        # Start worker process/container
        worker_process = self._start_worker_process(worker_config)
        
        self.active_workers[worker_id] = {
            'process': worker_process,
            'pool_id': pool_id,
            'status': 'idle',
            'current_task': None,
            'last_heartbeat': time.time()
        }
        
        self.worker_pools[pool_id]['current_workers'] += 1
        
        return worker_id
    
    def auto_scale_workers(self):
        """Auto-scale workers based on queue depth and performance metrics"""
        for pool_id, pool_config in self.worker_pools.items():
            queue_depths = self._get_queue_depths_for_pool(pool_id)
            total_pending = sum(queue_depths.values())
            
            current_workers = pool_config['current_workers']
            target_workers = self._calculate_target_workers(
                current_workers, total_pending, pool_config
            )
            
            if target_workers > current_workers:
                # Scale up
                for _ in range(target_workers - current_workers):
                    if current_workers < pool_config['max_workers']:
                        self._spawn_worker(pool_id)
            elif target_workers < current_workers:
                # Scale down
                workers_to_remove = current_workers - target_workers
                self._gracefully_remove_workers(pool_id, workers_to_remove)
    
    def _calculate_target_workers(self, current: int, pending: int, config: dict) -> int:
        # Simple scaling algorithm - can be made more sophisticated
        if pending == 0:
            return max(config['min_workers'], current - 1)
        
        # Target: 1 worker per 10 pending tasks, with bounds
        target = max(config['min_workers'], min(config['max_workers'], pending // 10 + 1))
        
        # Avoid thrashing - only scale if significant difference
        if abs(target - current) >= 2:
            return target
        
        return current
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

**Data Flow**

*Task Submission Flow:*
```
1. Client Application → Task Queue API
   - Task validation and authentication
   - Dependency checking and validation
   - Resource requirement assessment

2. Task Queue API → PostgreSQL
   - Store task metadata and configuration
   - Record task dependencies in graph structure
   - Update user quotas and usage tracking

3. Task Router → Priority Assessment
   - Evaluate task priority and resource requirements
   - Check for immediate execution or scheduling
   - Dependency resolution for workflow tasks

4. Task Router → Redis Queues
   - Queue immediate tasks in priority-based queues
   - Schedule delayed tasks in time-sorted sets
   - Update queue depth metrics and monitoring

5. Background Scheduler → Queue Management
   - Move scheduled tasks to execution queues
   - Process dependency chains as tasks complete
   - Handle retry logic for failed tasks
```

*Task Execution Flow:*
```
1. Worker Manager → Worker Pool Monitoring
   - Monitor queue depths and worker utilization
   - Auto-scale worker pools based on demand
   - Health check workers with heartbeat monitoring

2. Workers → Task Polling
   - Poll priority queues (highest priority first)
   - Claim tasks with distributed locks
   - Update task status to 'running' in database

3. Worker → Task Execution
   - Load task payload and configuration
   - Execute task with timeout and resource monitoring
   - Stream execution logs and progress updates

4. Task Completion → Result Handling
   - Store task results and execution metadata
   - Update task status in database
   - Trigger dependent tasks if applicable

5. Worker → Queue Return
   - Release worker resources and update status
   - Return to queue polling for next task
   - Report execution metrics and health status
```

**Scaling Considerations**

*Horizontal Scaling Strategy:*
```yaml
Queue Management:
  - Separate Redis clusters for different priority levels
  - Consistent hashing for queue distribution
  - Cross-AZ replication for high availability
  - Queue sharding based on task type patterns

Worker Orchestration:
  - ECS auto-scaling groups per task type
  - Mixed instance types for different workloads
  - Spot instances for batch processing workloads
  - Reserved capacity for critical task types

Database Scaling:
  - Read replicas for task status queries
  - Partitioning of task history by date
  - Connection pooling with PgBouncer
  - Archival of completed tasks to S3

Resource Management:
  - CPU/memory-based worker scaling
  - GPU worker pools for ML tasks
  - Network-optimized instances for I/O intensive tasks
  - Storage-optimized instances for data processing
```

*Performance Optimization:*
```yaml
Queue Processing:
  - Batch task processing where applicable
  - In-memory task caching for frequent operations
  - Lazy loading of task payload data
  - Compression of large task payloads

Worker Efficiency:
  - Connection pooling for database operations
  - Keep-alive connections to external services
  - Task result streaming for large outputs
  - Resource pre-warming for predictable workloads

Monitoring Integration:
  - Real-time queue depth monitoring
  - Worker performance and utilization tracking
  - Task execution time distribution analysis
  - Resource usage optimization recommendations
```

**Monitoring and Alerts**

*Key Metrics:*
```yaml
Queue Health:
  - queue_depth: Monitor backlog by priority level
  - task_wait_time_p95: <5 minutes for high priority
  - task_processing_rate: >116 tasks/second
  - dead_letter_queue_size: <1% of total tasks

Worker Performance:
  - worker_utilization: 70-90% target range
  - task_success_rate: >99.5% excluding business logic failures
  - worker_startup_time: <30 seconds average
  - worker_failure_rate: <1% per hour

System Performance:
  - api_response_time_p95: <100ms
  - database_connection_pool_usage: <80%
  - redis_memory_usage: <80% of allocated
  - task_execution_time_distribution: track by task type

Business Metrics:
  - tasks_completed_per_minute: track throughput trends
  - task_retry_rate: <5% of total tasks
  - sla_violation_rate: <1% for priority tasks
  - cost_per_task: optimize resource efficiency
```

*Alerting Strategy:*
```yaml
Critical Alerts (PagerDuty):
  - Queue processing stopped for >2 minutes
  - Worker failure rate >10% for 5 minutes
  - Database connectivity issues
  - Task success rate <95% for high priority tasks

Warning Alerts (Slack):
  - Queue depth >1000 for priority 1-2 tasks
  - Worker utilization >90% for 15 minutes
  - Task wait time >10 minutes for normal priority
  - Dead letter queue size increasing

Capacity Alerts:
  - Projected queue capacity exhaustion within 1 hour
  - Worker auto-scaling approaching max limits
  - Database storage >85% full
  - Redis memory usage >75%
```

**Follow-up Questions**

1. **How would you implement task dependencies and workflow orchestration?**
   - Create dependency graph using adjacency lists in PostgreSQL
   - Use topological sorting to determine execution order
   - Implement event-driven dependency resolution
   - Support conditional dependencies based on task outcomes
   - Provide workflow visualization and debugging tools

2. **How would you handle worker failures and ensure task completion?**
   - Implement heartbeat monitoring with 30-second intervals
   - Use distributed locks with TTL for task claiming
   - Automatic task requeuing after worker timeout
   - Circuit breaker patterns for failing worker pools
   - Graceful worker shutdown with task completion

3. **How would you implement rate limiting for different task types?**
   - Token bucket algorithm per task type
   - Redis-based rate limiting with sliding windows
   - Priority-based rate limit overrides
   - Per-client rate limiting with quotas
   - Dynamic rate limit adjustment based on system load

4. **How would you handle tasks that require specific hardware (GPU, high-memory)?**
   - Create specialized worker pools with resource tagging
   - Task routing based on resource requirements
   - Resource reservation and allocation system
   - Auto-scaling groups with specific instance types
   - Resource utilization monitoring and optimization

5. **How would you implement task auditing and compliance logging?**
   - Comprehensive task execution logging to S3
   - Immutable audit trail with cryptographic signatures
   - GDPR-compliant data retention and deletion
   - Real-time compliance monitoring and alerting
   - Integration with enterprise SIEM systems

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

**Database Design**

*PostgreSQL Schema (Configuration Management):*
```sql
CREATE TABLE feature_flags (
    flag_id SERIAL PRIMARY KEY,
    flag_key VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    flag_type VARCHAR(50) DEFAULT 'boolean',
    default_value JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    tags TEXT[]
);

CREATE TABLE flag_environments (
    environment_id SERIAL PRIMARY KEY,
    environment_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_production BOOLEAN DEFAULT false,
    approval_required BOOLEAN DEFAULT true
);

CREATE TABLE flag_rules (
    rule_id SERIAL PRIMARY KEY,
    flag_id INTEGER REFERENCES feature_flags(flag_id),
    environment_id INTEGER REFERENCES flag_environments(environment_id),
    rule_order INTEGER NOT NULL,
    conditions JSONB NOT NULL,
    variation JSONB NOT NULL,
    rollout_percentage INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE flag_audit_log (
    audit_id BIGSERIAL PRIMARY KEY,
    flag_id INTEGER REFERENCES feature_flags(flag_id),
    environment_id INTEGER REFERENCES flag_environments(environment_id),
    action VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    user_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW()
);
```

**API Design**

```yaml
/api/v1/evaluate:
  post:
    description: Evaluate feature flags for user
    request:
      flag_keys: array[string]
      user_context: object
      environment: string
    response:
      evaluations: array
        - flag_key: string
          value: any
          variation: string
          reason: string

/api/v1/flags:
  post:
    description: Create a new feature flag
    request:
      flag_key: string
      name: string
      description: string
      flag_type: enum [boolean, string, number, json]
      default_value: any
    response:
      flag_id: integer
      flag_key: string

/api/v1/flags/{flag_key}/toggle:
  post:
    description: Toggle flag on/off
    request:
      environment: string
      enabled: boolean
    response:
      enabled: boolean
      updated_at: timestamp
```

**Algorithm Details**

*Flag Evaluation Engine:*
```python
class FlagEvaluator:
    def evaluate_flag(self, flag_key: str, user_context: dict, environment: str):
        # Get flag configuration from cache
        flag_config = self._get_flag_config(flag_key, environment)
        
        # Evaluate targeting rules
        for rule in sorted(flag_config['rules'], key=lambda x: x['rule_order']):
            if self._evaluate_conditions(rule['conditions'], user_context):
                if self._user_in_rollout(user_context, rule['rollout_percentage']):
                    return {
                        'flag_key': flag_key,
                        'value': rule['variation']['value'],
                        'variation': rule['variation']['key'],
                        'reason': f'rule_{rule["rule_id"]}'
                    }
        
        return self._default_response(flag_key, flag_config)
    
    def _user_in_rollout(self, user_context: dict, rollout_percentage: int):
        user_id = user_context.get('user_id', 'anonymous')
        hash_value = int(hashlib.md5(user_id.encode()).hexdigest()[:8], 16)
        bucket = hash_value % 100
        return bucket < rollout_percentage
```

**Scaling Considerations**

```yaml
Evaluation Service:
  - Stateless evaluation nodes with auto-scaling
  - Redis cluster for flag configuration caching
  - Edge locations for global low latency
  - WebSocket for real-time flag updates

Configuration Management:
  - PostgreSQL with read replicas for flag configs
  - Cross-region replication for disaster recovery
  - Connection pooling for database optimization
  - Audit logging for compliance requirements
```

**Monitoring and Alerts**

```yaml
Key Metrics:
  - evaluation_latency_p95: <5ms
  - cache_hit_ratio: >95%
  - flag_update_propagation_time: <30 seconds
  - conversion_impact_by_flag: business metrics

Alerting:
  - Flag evaluation service down >30 seconds
  - Cache cluster failure affecting evaluations
  - Unusual flag evaluation volume (>5x normal)
  - Automatic rollback triggered
```

**Follow-up Questions**

1. **How would you implement gradual rollouts with automatic rollback on errors?**
   - Monitor error rates and conversion metrics during rollouts
   - Implement circuit breakers with configurable thresholds
   - Automated rollback triggers based on health metrics
   - Blue-green evaluation for instant rollback capability

2. **How would you handle flag evaluation for offline mobile applications?**
   - Local flag evaluation with cached configurations
   - Periodic sync of flag configs when online
   - Offline-first architecture with eventual consistency
   - Local fallback values for critical flags

3. **How would you implement flag dependencies (Flag A requires Flag B to be enabled)?**
   - Dependency graph validation during configuration
   - Runtime dependency checking during evaluation
   - Topological sorting for complex dependency chains
   - Visual dependency mapping in admin interface

4. **How would you ensure data consistency across global regions for flag updates?**
   - Master-slave replication with conflict resolution
   - Eventually consistent updates with version vectors
   - Regional flag overrides for compliance
   - Cross-region health checks and failover

5. **How would you implement flag cleanup and automated technical debt reduction?**
   - Usage analytics to identify unused flags
   - Automated notifications for stale flags
   - Deprecation workflow with sunset timelines
   - Code scanning for flag removal opportunities

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

**Database Design**

*InfluxDB Schema (Real-time Metrics):*
```sql
-- High-frequency metrics (1-second resolution)
CREATE RETENTION POLICY "realtime" ON "metrics" DURATION 24h REPLICATION 1

-- Medium-frequency metrics (1-minute resolution)  
CREATE RETENTION POLICY "hourly" ON "metrics" DURATION 7d REPLICATION 1

-- Low-frequency metrics (5-minute resolution)
CREATE RETENTION POLICY "daily" ON "metrics" DURATION 30d REPLICATION 1

-- Measurements
cpu_usage,host=server1,region=us-east-1 value=75.2 1640995200000000000
memory_usage,host=server1,region=us-east-1 value=8.5 1640995200000000000
request_count,service=api,endpoint=/users value=1250 1640995200000000000
response_time,service=api,endpoint=/users p50=45,p95=120,p99=250 1640995200000000000
```

*ClickHouse Schema (Long-term Analytics):*
```sql
CREATE TABLE metrics (
    timestamp DateTime,
    metric_name String,
    tags Map(String, String),
    value Float64,
    aggregation_type Enum('sum', 'avg', 'min', 'max', 'count'),
    resolution_minutes UInt16
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (metric_name, timestamp)
TTL timestamp + INTERVAL 2 YEAR;

CREATE TABLE metric_metadata (
    metric_name String,
    description String,
    unit String,
    metric_type Enum('counter', 'gauge', 'histogram', 'timer'),
    retention_policy String,
    owner String,
    created_at DateTime
) ENGINE = ReplacingMergeTree()
ORDER BY metric_name;
```

**API Design**

```yaml
# Metrics Aggregation Service API

/api/v1/metrics/ingest:
  post:
    description: Ingest metrics data
    request:
      metrics: array
        - name: string
          value: number
          timestamp: timestamp
          tags: object
          type: enum [counter, gauge, histogram, timer]
    response:
      ingested: integer
      errors: array

/api/v1/metrics/query:
  post:
    description: Query metrics data
    request:
      query: string (PromQL-like syntax)
      start_time: timestamp
      end_time: timestamp
      step: string (resolution)
    response:
      result_type: string
      data: array

/api/v1/metrics/metadata:
  get:
    description: Get metric metadata
    parameters:
      metric_name: string (optional)
      namespace: string (optional)
    response:
      metrics: array
        - name: string
          description: string
          type: string
          unit: string

/api/v1/alerts/rules:
  post:
    description: Create alerting rule
    request:
      rule_name: string
      expression: string (PromQL)
      threshold: number
      severity: enum [critical, warning, info]
      notifications: array
    response:
      rule_id: string
```

**Algorithm Details**

*Metric Aggregation Engine:*
```python
class MetricAggregator:
    def __init__(self, time_windows=[60, 300, 3600]):  # 1m, 5m, 1h
        self.time_windows = time_windows
        self.aggregation_buffers = {}
        
    def ingest_metric(self, metric_name, value, timestamp, tags, metric_type):
        # Route to appropriate aggregation window
        for window in self.time_windows:
            window_key = self._get_window_key(timestamp, window)
            buffer_key = f"{metric_name}:{window}:{window_key}"
            
            if buffer_key not in self.aggregation_buffers:
                self.aggregation_buffers[buffer_key] = MetricBuffer(
                    metric_name, window, metric_type
                )
            
            self.aggregation_buffers[buffer_key].add_value(value, timestamp, tags)
    
    def _get_window_key(self, timestamp, window_seconds):
        """Get the window bucket for a given timestamp"""
        return (timestamp // window_seconds) * window_seconds
    
    def flush_completed_windows(self):
        """Flush completed time windows to storage"""
        current_time = time.time()
        completed_buffers = []
        
        for buffer_key, buffer in list(self.aggregation_buffers.items()):
            if buffer.is_complete(current_time):
                aggregated_data = buffer.get_aggregated_data()
                self._store_aggregated_data(aggregated_data)
                completed_buffers.append(buffer_key)
        
        # Cleanup completed buffers
        for key in completed_buffers:
            del self.aggregation_buffers[key]

class MetricBuffer:
    def __init__(self, metric_name, window_seconds, metric_type):
        self.metric_name = metric_name
        self.window_seconds = window_seconds
        self.metric_type = metric_type
        self.values = []
        self.start_time = None
        
    def add_value(self, value, timestamp, tags):
        if self.start_time is None:
            self.start_time = (timestamp // self.window_seconds) * self.window_seconds
        
        self.values.append({
            'value': value,
            'timestamp': timestamp,
            'tags': tags
        })
    
    def is_complete(self, current_time):
        if self.start_time is None:
            return False
        return current_time >= self.start_time + self.window_seconds
    
    def get_aggregated_data(self):
        if not self.values:
            return None
            
        if self.metric_type == 'counter':
            return {
                'metric_name': self.metric_name,
                'timestamp': self.start_time,
                'window_seconds': self.window_seconds,
                'sum': sum(v['value'] for v in self.values),
                'count': len(self.values),
                'rate': sum(v['value'] for v in self.values) / self.window_seconds
            }
        elif self.metric_type == 'gauge':
            values = [v['value'] for v in self.values]
            return {
                'metric_name': self.metric_name,
                'timestamp': self.start_time,
                'window_seconds': self.window_seconds,
                'avg': statistics.mean(values),
                'min': min(values),
                'max': max(values),
                'last': values[-1]
            }
        elif self.metric_type == 'histogram':
            values = [v['value'] for v in self.values]
            return {
                'metric_name': self.metric_name,
                'timestamp': self.start_time,
                'window_seconds': self.window_seconds,
                'count': len(values),
                'sum': sum(values),
                'p50': statistics.median(values),
                'p95': statistics.quantiles(values, n=20)[18] if len(values) > 20 else max(values),
                'p99': statistics.quantiles(values, n=100)[98] if len(values) > 100 else max(values)
            }
```

**Data Flow**

*Metric Ingestion Flow:*
```
1. Applications → Metric Agents
   - StatsD/Prometheus agents collect local metrics
   - Batch and compress metrics for efficiency
   - Add metadata tags and timestamps

2. Metric Agents → Gateway Service
   - Load balancing across gateway instances
   - Authentication and rate limiting
   - Metric validation and normalization

3. Gateway Service → Stream Processing
   - Kafka streams for high-throughput ingestion
   - Real-time aggregation for dashboard updates
   - Routing to appropriate storage systems

4. Stream Processing → Storage Systems
   - InfluxDB for real-time queries and dashboards
   - ClickHouse for long-term analytics and reporting
   - S3 for archival and compliance storage

5. Storage Systems → Query Service
   - Query federation across multiple storage backends
   - Result caching for frequently accessed data
   - API responses to dashboards and alerting
```

**Scaling Considerations**

```yaml
Ingestion Scaling:
  - Kafka partitioning by metric namespace
  - Auto-scaling gateway services based on throughput
  - Batch processing for high-volume metrics
  - Compression and efficient serialization

Storage Scaling:
  - InfluxDB clustering for real-time data
  - ClickHouse sharding for analytical queries
  - Tiered storage with automatic data lifecycle
  - Read replicas for query performance

Query Optimization:
  - Pre-aggregated rollups for common queries
  - Materialized views for dashboard queries
  - Query result caching with TTL
  - Parallel query execution across shards
```

**Monitoring and Alerts**

```yaml
System Metrics:
  - ingestion_rate: 1M metrics/second target
  - query_latency_p95: <100ms for dashboard queries
  - storage_utilization: <80% across all systems
  - data_loss_rate: <0.01% of ingested metrics

Business Metrics:
  - unique_metric_series: track growth patterns
  - query_patterns: optimize for common queries
  - retention_compliance: ensure policy adherence
  - cost_per_metric: optimize storage efficiency

Alerting Rules:
  - Ingestion pipeline down >30 seconds
  - Query latency >500ms for 5 minutes
  - Storage utilization >90%
  - Data loss rate >0.1%
```

**Follow-up Questions**

1. **How would you implement metric sampling during high load while preserving accuracy?**
   - Implement reservoir sampling for high-cardinality metrics
   - Use consistent hashing for deterministic sampling
   - Apply different sampling rates based on metric importance
   - Maintain statistical accuracy with weighted aggregation

2. **How would you handle metric schema evolution without breaking existing queries?**
   - Version metric schemas with backward compatibility
   - Implement query translation layers for old versions
   - Gradual migration with dual-write patterns
   - Schema registry for coordinated changes

3. **How would you implement cost-effective long-term storage for compliance requirements?**
   - Tiered storage with automatic lifecycle policies
   - Compression and deduplication for old data
   - Cold storage in S3 Glacier for archival
   - Query federation across storage tiers

4. **How would you detect and handle anomalous metric patterns automatically?**
   - Statistical anomaly detection using ML models
   - Seasonal pattern recognition for baseline establishment
   - Real-time alerting on significant deviations
   - Automatic data quality checks and filtering

5. **How would you implement cross-datacenter metric replication for disaster recovery?**
   - Asynchronous replication with eventual consistency
   - Conflict resolution for duplicate metrics
   - Cross-region query federation
   - Automated failover with health checking

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

**Database Design**

*DynamoDB Schema (Session Storage):*
```yaml
# Sessions Table
sessions:
  PartitionKey: session_id
  Attributes:
    session_id: "sess_abc123"
    user_id: "user_456"
    device_id: "device_789"
    created_at: 1640995200
    expires_at: 1641081600
    ip_address: "192.168.1.100"
    is_active: true
    session_data: {...}
```

**API Design**

```yaml
/api/v1/sessions:
  post:
    description: Create new session
    request:
      user_id: string
      device_info: object
    response:
      session_token: string
      expires_at: timestamp

/api/v1/sessions/{session_id}/validate:
  post:
    description: Validate session
    response:
      valid: boolean
      user_id: string
      permissions: array
```

**Monitoring**

```yaml
Key Metrics:
  - session_validation_latency_p95: <10ms
  - concurrent_sessions_per_user: monitor limits
  - suspicious_activity_rate: track security events

Security Monitoring:
  - Unusual login patterns and locations
  - Session hijacking attempt detection
  - Concurrent session limit violations
```

**Follow-up Questions**

1. **How would you implement secure session sharing across different Amazon domains?**
   - Use secure cross-domain cookies with proper SameSite policies
   - Implement JWT tokens with domain-specific claims
   - Create session federation service for cross-domain validation
   - Use OAuth 2.0 for secure token exchange between domains

2. **How would you handle session migration during system maintenance or failures?**
   - Implement session replication across availability zones
   - Use graceful session transfer during rolling updates
   - Provide session backup and restore mechanisms
   - Design stateless session validation where possible

3. **How would you implement session concurrency limits (max devices per user)?**
   - Track active sessions per user in Redis sets
   - Implement FIFO eviction when limits are exceeded
   - Provide user interface for managing active sessions
   - Send notifications when new sessions are created

4. **How would you detect and handle session hijacking or replay attacks?**
   - Monitor IP address and geolocation changes
   - Implement device fingerprinting validation
   - Use challenge-response for suspicious activities
   - Automatic session termination on high-risk events

5. **How would you implement session debugging for customer support scenarios?**
   - Create read-only session inspection tools
   - Implement audit logs for all session operations
   - Provide session timeline and activity history
   - Design privacy-compliant debugging interfaces

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

**Database Design**

*File Metadata (PostgreSQL):*
```sql
CREATE TABLE file_uploads (
    file_id UUID PRIMARY KEY,
    user_id VARCHAR(255),
    filename VARCHAR(500),
    content_type VARCHAR(100),
    file_size BIGINT,
    storage_path VARCHAR(1000),
    upload_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE upload_chunks (
    chunk_id UUID PRIMARY KEY,
    file_id UUID REFERENCES file_uploads(file_id),
    chunk_number INTEGER,
    chunk_size INTEGER,
    etag VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT NOW()
);
```

**API Design**

```yaml
/api/v1/uploads/initiate:
  post:
    description: Initiate file upload
    request:
      filename: string
      content_type: string
      file_size: integer
    response:
      upload_id: string
      signed_urls: array

/api/v1/uploads/{upload_id}/complete:
  post:
    description: Complete multipart upload
    request:
      parts: array
        - part_number: integer
          etag: string
    response:
      file_url: string
      cdn_url: string
```

**Algorithm Details**

*Upload Resume Manager:*
```python
class UploadResumeManager:
    def initiate_upload(self, file_info):
        # Generate presigned URLs for multipart upload
        upload_id = self._create_multipart_upload(file_info)
        
        # Calculate chunk size (5MB-100MB based on file size)
        chunk_size = self._calculate_optimal_chunk_size(file_info['file_size'])
        
        # Generate presigned URLs for each chunk
        signed_urls = []
        num_chunks = math.ceil(file_info['file_size'] / chunk_size)
        
        for i in range(num_chunks):
            url = self._generate_presigned_url(upload_id, i+1)
            signed_urls.append({
                'part_number': i+1,
                'url': url,
                'start_byte': i * chunk_size,
                'end_byte': min((i+1) * chunk_size - 1, file_info['file_size'] - 1)
            })
        
        return {
            'upload_id': upload_id,
            'chunk_size': chunk_size,
            'signed_urls': signed_urls
        }
```

**Scaling and Monitoring**

```yaml
Scaling Strategy:
  - S3 multipart uploads for large files
  - Lambda functions for file processing
  - SQS for async processing workflows
  - CloudFront for global file delivery

Key Metrics:
  - upload_success_rate: >99.9%
  - upload_completion_time_p95: <30 seconds for 1GB files
  - processing_latency: <5 minutes for standard operations
  - storage_cost_optimization: deduplication savings
```

**Follow-up Questions**

1. **How would you implement deduplication to save storage costs?**
   - Calculate file hashes (SHA-256) during upload
   - Check hash against existing files before storage
   - Use reference counting for shared file storage
   - Implement copy-on-write for file modifications

2. **How would you handle file uploads that require real-time processing?**
   - Stream processing during upload using Lambda
   - Real-time virus scanning with ClamAV integration
   - Immediate thumbnail generation for images
   - WebSocket connections for live progress updates

3. **How would you implement secure direct uploads to S3 from client applications?**
   - Generate presigned URLs with strict policies
   - Implement upload token validation
   - Use CORS policies for browser-based uploads
   - Monitor and rate-limit upload attempts

4. **How would you handle file corruption detection and automatic repair?**
   - Verify checksums after upload completion
   - Implement automatic retry for failed chunks
   - Use S3 versioning for file recovery
   - Cross-region replication for disaster recovery

5. **How would you implement efficient file search and discovery across billions of files?**
   - Index file metadata in Elasticsearch
   - Implement full-text search for documents
   - Use machine learning for content-based search
   - Cache frequently accessed search results

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

**Database Design**

*Elasticsearch Schema:*
```json
{
  "mappings": {
    "properties": {
      "query": {"type": "text", "analyzer": "autocomplete_analyzer"},
      "suggestions": {"type": "completion"},
      "popularity_score": {"type": "integer"},
      "category": {"type": "keyword"},
      "language": {"type": "keyword"}
    }
  }
}
```

**API Design**

```yaml
/api/v1/autocomplete:
  get:
    description: Get autocomplete suggestions
    parameters:
      q: string (query prefix)
      limit: integer (max results)
      user_id: string (for personalization)
    response:
      suggestions: array
        - text: string
          score: number
          category: string
```

**Algorithm Details**

*Autocomplete Ranking Engine:*
```python
class AutocompleteRanker:
    def rank_suggestions(self, query, suggestions, user_context):
        ranked = []
        
        for suggestion in suggestions:
            score = 0
            
            # Base popularity score (40%)
            score += suggestion['popularity'] * 0.4
            
            # Query relevance (30%)
            score += self._calculate_relevance(query, suggestion['text']) * 0.3
            
            # Personalization (20%)
            score += self._calculate_personalization(suggestion, user_context) * 0.2
            
            # Trending boost (10%)
            score += self._calculate_trending_boost(suggestion) * 0.1
            
            ranked.append({
                'suggestion': suggestion,
                'final_score': score
            })
        
        return sorted(ranked, key=lambda x: x['final_score'], reverse=True)
```

**Monitoring**

```yaml
Performance Metrics:
  - autocomplete_latency_p95: <100ms
  - cache_hit_ratio: >95%
  - suggestion_accuracy: measure click-through rates
  - personalization_effectiveness: A/B test results

System Health:
  - elasticsearch_cluster_health: monitor yellow/red status
  - cache_memory_usage: <80% of allocated
  - suggestion_index_freshness: <1 hour lag
```

**Follow-up Questions**

1. **How would you implement real-time trending topic integration?**
   - Stream search queries to Kafka for real-time processing
   - Use sliding window counters to detect trending patterns
   - Update suggestion scores in real-time based on query volume
   - Implement decay functions for time-sensitive trends

2. **How would you handle autocomplete for voice queries with speech recognition errors?**
   - Implement phonetic matching algorithms (Soundex, Metaphone)
   - Use edit distance calculations for fuzzy matching
   - Maintain pronunciation dictionaries for common terms
   - Apply machine learning models trained on speech recognition errors

3. **How would you implement and measure the effectiveness of personalization?**
   - Track user search history and click patterns
   - Build user interest profiles based on behavior
   - A/B test personalized vs non-personalized suggestions
   - Measure engagement metrics like click-through rates

4. **How would you handle autocomplete suggestions for sensitive or inappropriate content?**
   - Implement content filtering with blacklists
   - Use machine learning for automated content moderation
   - Provide admin controls for suggestion management
   - Regional filtering based on local regulations

5. **How would you implement A/B testing for different ranking algorithms?**
   - Route users to different ranking variants based on user ID hash
   - Track conversion metrics for each algorithm variant
   - Implement statistical significance testing
   - Gradual rollout of winning algorithms

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

**Database Design**

*Event Schema (Kafka + Data Lake):*
```json
{
  "event_id": "evt_123456",
  "user_id": "user_789",
  "session_id": "sess_abc",
  "event_type": "page_view",
  "timestamp": 1640995200000,
  "properties": {
    "page_url": "/products/item123",
    "referrer": "https://google.com"
  },
  "context": {
    "ip_address": "192.168.1.100",
    "device_type": "mobile",
    "country": "US"
  }
}
```

**API Design**

```yaml
/api/v1/events:
  post:
    description: Track user events
    request:
      events: array
        - event_type: string
          user_id: string
          properties: object
          timestamp: timestamp
    response:
      ingested: integer
      status: string

/api/v1/analytics/funnel:
  post:
    description: Analyze conversion funnel
    request:
      steps: array[string]
      start_date: date
      end_date: date
      filters: object
    response:
      funnel_data: array
        - step: string
          users: integer
          conversion_rate: number
```

**Algorithm Details**

*Real-time Event Processor:*
```python
class EventProcessor:
    def process_event(self, event):
        # Enrich with additional context
        enriched_event = self._enrich_event(event)
        
        # Real-time analytics update
        self._update_realtime_metrics(enriched_event)
        
        # User journey tracking
        self._update_user_journey(enriched_event)
        
        # Route to appropriate storage
        self._route_to_storage(enriched_event)
    
    def _update_user_journey(self, event):
        # Reconstruct user session from events
        session_events = self._get_session_events(event['session_id'])
        journey = self._reconstruct_journey(session_events)
        
        # Update user behavior profile
        self._update_user_profile(event['user_id'], journey)
```

**Scaling and Monitoring**

```yaml
Scaling Strategy:
  - Kafka partitioning by user_id for session reconstruction
  - Spark Streaming for real-time processing
  - S3 + Athena for long-term analytics
  - Redis for real-time metrics caching

Key Metrics:
  - event_ingestion_rate: 116K events/second average
  - processing_latency: <100ms for real-time events
  - data_completeness: >99.9% of events successfully processed
  - query_performance: <5s for standard analytics queries

Privacy Compliance:
  - GDPR deletion workflows within 30 days
  - Data anonymization for long-term storage
  - Consent management integration
  - Audit logging for compliance reporting
```

**Follow-up Questions**

1. **How would you implement user session reconstruction from individual events?**
   - Use session_id to group related events
   - Sort events by timestamp to create chronological journey
   - Handle session timeout and continuation logic
   - Implement sliding window aggregation for session metrics

2. **How would you handle duplicate events and ensure exactly-once processing?**
   - Use event_id for deduplication at ingestion
   - Implement idempotent processing with Redis tracking
   - Use Kafka exactly-once semantics for stream processing
   - Design retry logic with exponential backoff

3. **How would you implement real-time anomaly detection on user behavior patterns?**
   - Use statistical models to detect unusual patterns
   - Implement machine learning for behavioral anomalies
   - Set up real-time alerting for suspicious activities
   - Create automated response systems for fraud detection

4. **How would you ensure GDPR compliance for user data deletion requests?**
   - Implement data lineage tracking across all systems
   - Create automated deletion workflows
   - Use data retention policies with automatic expiration
   - Maintain audit logs for compliance verification

5. **How would you implement cost-effective long-term storage for regulatory compliance?**
   - Use tiered storage with lifecycle policies
   - Compress and deduplicate historical data
   - Archive old data to Glacier for compliance
   - Implement query federation across storage tiers

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