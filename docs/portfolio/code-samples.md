# Code Samples for Technical Portfolios

!!! info "Showcase Technical Excellence"
    Curate and present code samples that demonstrate your technical depth, clean coding practices, and problem-solving abilities for Amazon L6/L7 interviews.

## Overview

Code samples are crucial evidence of your technical capabilities and engineering craftsmanship. This guide helps you select, organize, and present code that showcases your skills effectively for technical leadership roles.

## What Code to Prepare for Portfolio

### Code Selection Criteria

#### Technical Depth
- **Complex Problem Solving**: Code that demonstrates algorithmic thinking
- **System Design**: Implementation of architectural patterns
- **Performance Optimization**: Code showing performance considerations
- **Scalability Patterns**: Implementation of scalable solutions

#### Code Quality
- **Clean Code Principles**: Readable, maintainable, and well-structured
- **Design Patterns**: Proper use of established patterns
- **Error Handling**: Robust error handling and edge case management
- **Testing**: Comprehensive test coverage and testing strategies

#### Business Impact
- **Production Code**: Real code that solved actual business problems
- **Measurable Results**: Code that delivered quantifiable improvements
- **Cross-functional Impact**: Code that enabled other teams or systems

### Types of Code to Include

#### 1. Algorithm and Data Structure Implementations
**Purpose**: Demonstrate fundamental computer science knowledge  
**Examples**: Custom sorting algorithms, graph traversal, tree operations

#### 2. System Design Implementations
**Purpose**: Show architectural thinking and system design skills  
**Examples**: Cache implementations, rate limiters, load balancers

#### 3. Performance Optimizations
**Purpose**: Demonstrate ability to identify and solve performance bottlenecks  
**Examples**: Database query optimizations, async processing implementations

#### 4. API Design and Implementation
**Purpose**: Show understanding of good API design principles  
**Examples**: RESTful APIs, GraphQL resolvers, RPC implementations

#### 5. Infrastructure as Code
**Purpose**: Demonstrate DevOps and automation skills  
**Examples**: Terraform modules, Kubernetes deployments, CI/CD pipelines

## Language Selection Strategy

### Primary Languages for Amazon Interviews

#### 1. Python (Highly Recommended)
**Strengths**:
- Clean, readable syntax
- Excellent for demonstrating algorithms
- Strong ecosystem for data processing and ML
- Preferred for system administration and automation

**Best Use Cases**:
- Data processing pipelines
- Machine learning implementations
- System automation scripts
- API services with Flask/Django

#### 2. Java (Highly Recommended)
**Strengths**:
- Enterprise-grade applications
- Strong type system and OOP principles
- Excellent for demonstrating design patterns
- Common in large-scale distributed systems

**Best Use Cases**:
- Microservices with Spring Boot
- Distributed system components
- Enterprise application backends
- Performance-critical applications

#### 3. Go (Recommended)
**Strengths**:
- Modern systems programming language
- Excellent concurrency model
- Simple, efficient for microservices
- Growing adoption in cloud-native applications

**Best Use Cases**:
- Microservices and APIs
- Command-line tools
- Concurrent/parallel processing
- Infrastructure tooling

#### 4. JavaScript/TypeScript (Situational)
**Strengths**:
- Full-stack development capability
- Async programming model
- Large ecosystem and community

**Best Use Cases**:
- Full-stack applications
- Real-time applications with Node.js
- Frontend applications (if relevant to role)

### Language Selection Guidelines

#### For L6 Candidates
- **Focus on 1-2 languages**: Demonstrate depth over breadth
- **Choose based on role**: Match primary technologies of target team
- **Include system language**: Python, Java, or Go for backend roles

#### For L7 Candidates
- **Show versatility**: 2-3 languages showing different paradigms
- **Include modern technologies**: Go, Rust, or TypeScript for forward-thinking
- **Demonstrate architectural thinking**: Language choice based on problem domain

## Essential Code Samples with Explanations

### Sample 1: Distributed Rate Limiter (Go)

**Purpose**: Demonstrates understanding of distributed systems, concurrency, and scalability patterns.

```go
package ratelimiter

import (
    "context"
    "encoding/json"
    "fmt"
    "sync"
    "time"

    "github.com/go-redis/redis/v8"
)

// TokenBucketLimiter implements distributed rate limiting using token bucket algorithm
type TokenBucketLimiter struct {
    client       *redis.Client
    capacity     int64         // Maximum tokens in bucket
    refillRate   int64         // Tokens added per second
    keyPrefix    string        // Redis key prefix
    lockTimeout  time.Duration // Lock timeout for atomic operations
    mu           sync.RWMutex  // Local mutex for configuration changes
}

type BucketState struct {
    Tokens    int64 `json:"tokens"`
    LastRefill int64 `json:"last_refill"`
}

// NewTokenBucketLimiter creates a new distributed rate limiter
func NewTokenBucketLimiter(client *redis.Client, capacity, refillRate int64) *TokenBucketLimiter {
    return &TokenBucketLimiter{
        client:      client,
        capacity:    capacity,
        refillRate:  refillRate,
        keyPrefix:   "rate_limit:",
        lockTimeout: 100 * time.Millisecond,
    }
}

// Allow checks if a request should be allowed for the given key
func (r *TokenBucketLimiter) Allow(ctx context.Context, key string, tokens int64) (bool, error) {
    if tokens <= 0 {
        return false, fmt.Errorf("tokens must be positive")
    }

    r.mu.RLock()
    capacity := r.capacity
    refillRate := r.refillRate
    r.mu.RUnlock()

    redisKey := r.keyPrefix + key
    lockKey := redisKey + ":lock"

    // Use Lua script for atomic read-modify-write operation
    script := `
        local key = KEYS[1]
        local lock_key = KEYS[2]
        local capacity = tonumber(ARGV[1])
        local refill_rate = tonumber(ARGV[2])
        local requested_tokens = tonumber(ARGV[3])
        local now = tonumber(ARGV[4])
        local lock_timeout = tonumber(ARGV[5])
        
        -- Try to acquire lock
        local lock_acquired = redis.call('SET', lock_key, '1', 'PX', lock_timeout, 'NX')
        if not lock_acquired then
            return {false, 'lock_failed'}
        end
        
        -- Get current bucket state
        local bucket_data = redis.call('GET', key)
        local bucket = {tokens = capacity, last_refill = now}
        
        if bucket_data then
            bucket = cjson.decode(bucket_data)
        end
        
        -- Calculate tokens to add based on time elapsed
        local time_elapsed = now - bucket.last_refill
        local tokens_to_add = math.floor((time_elapsed / 1000) * refill_rate)
        
        -- Refill bucket (capped at capacity)
        bucket.tokens = math.min(capacity, bucket.tokens + tokens_to_add)
        bucket.last_refill = now
        
        -- Check if request can be satisfied
        local allowed = bucket.tokens >= requested_tokens
        if allowed then
            bucket.tokens = bucket.tokens - requested_tokens
        end
        
        -- Save updated bucket state
        redis.call('SET', key, cjson.encode(bucket), 'EX', 3600)
        
        -- Release lock
        redis.call('DEL', lock_key)
        
        return {allowed, bucket.tokens}
    `

    now := time.Now().UnixMilli()
    result, err := r.client.Eval(ctx, script, []string{redisKey, lockKey},
        capacity, refillRate, tokens, now, r.lockTimeout.Milliseconds()).Result()

    if err != nil {
        return false, fmt.Errorf("rate limiter evaluation failed: %w", err)
    }

    resultSlice, ok := result.([]interface{})
    if !ok || len(resultSlice) != 2 {
        return false, fmt.Errorf("unexpected result format")
    }

    switch resultSlice[0].(type) {
    case int64:
        return resultSlice[0].(int64) == 1, nil
    case string:
        if resultSlice[0].(string) == "lock_failed" {
            return false, fmt.Errorf("failed to acquire lock")
        }
        return false, nil
    default:
        return false, fmt.Errorf("unexpected result type")
    }
}

// UpdateConfiguration allows dynamic configuration updates
func (r *TokenBucketLimiter) UpdateConfiguration(capacity, refillRate int64) error {
    if capacity <= 0 || refillRate <= 0 {
        return fmt.Errorf("capacity and refill rate must be positive")
    }

    r.mu.Lock()
    r.capacity = capacity
    r.refillRate = refillRate
    r.mu.Unlock()

    return nil
}

// GetStats returns current bucket state for monitoring
func (r *TokenBucketLimiter) GetStats(ctx context.Context, key string) (*BucketState, error) {
    redisKey := r.keyPrefix + key
    data, err := r.client.Get(ctx, redisKey).Result()
    if err == redis.Nil {
        return &BucketState{
            Tokens:     r.capacity,
            LastRefill: time.Now().UnixMilli(),
        }, nil
    }
    if err != nil {
        return nil, err
    }

    var state BucketState
    if err := json.Unmarshal([]byte(data), &state); err != nil {
        return nil, err
    }

    return &state, nil
}
```

**Key Technical Concepts Demonstrated**:
- **Distributed Systems**: Using Redis for shared state across multiple instances
- **Concurrency**: Lua scripts for atomic operations, local mutex for configuration
- **Algorithm Implementation**: Token bucket algorithm with proper refill logic
- **Error Handling**: Comprehensive error checking and meaningful error messages
- **Performance**: Single Redis call using Lua script to minimize latency
- **Monitoring**: Stats interface for observability

### Sample 2: Event Sourcing Implementation (Java)

**Purpose**: Shows understanding of complex architectural patterns, data consistency, and domain modeling.

```java
package com.portfolio.eventsourcing;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;

/**
 * Event Sourcing implementation for order management system
 * Demonstrates CQRS, event sourcing, and aggregate design patterns
 */

// Base event interface with type information for JSON serialization
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, property = "@type")
public interface Event {
    UUID getAggregateId();
    Instant getTimestamp();
    String getEventType();
    long getVersion();
}

// Abstract base for all events
public abstract class BaseEvent implements Event {
    private final UUID aggregateId;
    private final Instant timestamp;
    private final long version;

    protected BaseEvent(UUID aggregateId, long version) {
        this.aggregateId = aggregateId;
        this.timestamp = Instant.now();
        this.version = version;
    }

    @Override
    public UUID getAggregateId() { return aggregateId; }

    @Override
    public Instant getTimestamp() { return timestamp; }

    @Override
    public long getVersion() { return version; }

    @Override
    public String getEventType() { return this.getClass().getSimpleName(); }
}

// Domain Events
public class OrderCreatedEvent extends BaseEvent {
    private final String customerId;
    private final List<OrderItem> items;
    private final double totalAmount;

    public OrderCreatedEvent(UUID aggregateId, long version, String customerId, 
                           List<OrderItem> items, double totalAmount) {
        super(aggregateId, version);
        this.customerId = customerId;
        this.items = new ArrayList<>(items);
        this.totalAmount = totalAmount;
    }

    // Getters...
    public String getCustomerId() { return customerId; }
    public List<OrderItem> getItems() { return Collections.unmodifiableList(items); }
    public double getTotalAmount() { return totalAmount; }
}

public class OrderItemAddedEvent extends BaseEvent {
    private final OrderItem item;

    public OrderItemAddedEvent(UUID aggregateId, long version, OrderItem item) {
        super(aggregateId, version);
        this.item = item;
    }

    public OrderItem getItem() { return item; }
}

public class OrderShippedEvent extends BaseEvent {
    private final String shippingAddress;
    private final String trackingNumber;

    public OrderShippedEvent(UUID aggregateId, long version, String shippingAddress, String trackingNumber) {
        super(aggregateId, version);
        this.shippingAddress = shippingAddress;
        this.trackingNumber = trackingNumber;
    }

    public String getShippingAddress() { return shippingAddress; }
    public String getTrackingNumber() { return trackingNumber; }
}

// Value Objects
public class OrderItem {
    private final String productId;
    private final int quantity;
    private final double price;

    public OrderItem(String productId, int quantity, double price) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be positive");
        if (price < 0) throw new IllegalArgumentException("Price cannot be negative");
        
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }

    public String getProductId() { return productId; }
    public int getQuantity() { return quantity; }
    public double getPrice() { return price; }
    public double getTotalPrice() { return quantity * price; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderItem)) return false;
        OrderItem orderItem = (OrderItem) o;
        return quantity == orderItem.quantity &&
               Double.compare(orderItem.price, price) == 0 &&
               Objects.equals(productId, orderItem.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, quantity, price);
    }
}

// Order Aggregate
public class Order {
    private UUID id;
    private String customerId;
    private List<OrderItem> items;
    private OrderStatus status;
    private double totalAmount;
    private String shippingAddress;
    private String trackingNumber;
    private long version;

    // List of uncommitted events
    private final List<Event> uncommittedEvents = new ArrayList<>();

    public enum OrderStatus {
        CREATED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    }

    // Constructor for new orders
    public Order(UUID id, String customerId, List<OrderItem> items) {
        this.id = id;
        this.customerId = customerId;
        this.items = new ArrayList<>(items);
        this.status = OrderStatus.CREATED;
        this.totalAmount = items.stream().mapToDouble(OrderItem::getTotalPrice).sum();
        this.version = 0;

        // Raise domain event
        addEvent(new OrderCreatedEvent(id, getNextVersion(), customerId, items, totalAmount));
    }

    // Constructor for rebuilding from events
    private Order(UUID id) {
        this.id = id;
        this.items = new ArrayList<>();
        this.version = 0;
    }

    // Factory method to rebuild aggregate from events
    public static Order fromEvents(UUID id, List<Event> events) {
        Order order = new Order(id);
        events.forEach(order::apply);
        return order;
    }

    // Apply event to update aggregate state
    private void apply(Event event) {
        switch (event.getEventType()) {
            case "OrderCreatedEvent":
                apply((OrderCreatedEvent) event);
                break;
            case "OrderItemAddedEvent":
                apply((OrderItemAddedEvent) event);
                break;
            case "OrderShippedEvent":
                apply((OrderShippedEvent) event);
                break;
            default:
                throw new IllegalArgumentException("Unknown event type: " + event.getEventType());
        }
        this.version = event.getVersion();
    }

    private void apply(OrderCreatedEvent event) {
        this.customerId = event.getCustomerId();
        this.items = new ArrayList<>(event.getItems());
        this.totalAmount = event.getTotalAmount();
        this.status = OrderStatus.CREATED;
    }

    private void apply(OrderItemAddedEvent event) {
        this.items.add(event.getItem());
        this.totalAmount += event.getItem().getTotalPrice();
    }

    private void apply(OrderShippedEvent event) {
        this.status = OrderStatus.SHIPPED;
        this.shippingAddress = event.getShippingAddress();
        this.trackingNumber = event.getTrackingNumber();
    }

    // Business methods that generate events
    public void addItem(OrderItem item) {
        if (status != OrderStatus.CREATED) {
            throw new IllegalStateException("Cannot add items to order in status: " + status);
        }

        addEvent(new OrderItemAddedEvent(id, getNextVersion(), item));
        apply(uncommittedEvents.get(uncommittedEvents.size() - 1));
    }

    public void ship(String shippingAddress, String trackingNumber) {
        if (status != OrderStatus.CREATED && status != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot ship order in status: " + status);
        }

        addEvent(new OrderShippedEvent(id, getNextVersion(), shippingAddress, trackingNumber));
        apply(uncommittedEvents.get(uncommittedEvents.size() - 1));
    }

    private void addEvent(Event event) {
        uncommittedEvents.add(event);
    }

    private long getNextVersion() {
        return version + uncommittedEvents.size() + 1;
    }

    public List<Event> getUncommittedEvents() {
        return Collections.unmodifiableList(uncommittedEvents);
    }

    public void markEventsAsCommitted() {
        uncommittedEvents.clear();
    }

    // Getters
    public UUID getId() { return id; }
    public String getCustomerId() { return customerId; }
    public List<OrderItem> getItems() { return Collections.unmodifiableList(items); }
    public OrderStatus getStatus() { return status; }
    public double getTotalAmount() { return totalAmount; }
    public long getVersion() { return version; }
    public String getShippingAddress() { return shippingAddress; }
    public String getTrackingNumber() { return trackingNumber; }
}

// Event Store Interface
public interface EventStore {
    void saveEvents(UUID aggregateId, List<Event> events, long expectedVersion);
    List<Event> getEvents(UUID aggregateId);
    List<Event> getEvents(UUID aggregateId, long fromVersion);
}

// In-memory implementation for demonstration
public class InMemoryEventStore implements EventStore {
    private final Map<UUID, List<Event>> eventStreams = new ConcurrentHashMap<>();
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private final ObjectMapper objectMapper;

    public InMemoryEventStore() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public void saveEvents(UUID aggregateId, List<Event> events, long expectedVersion) {
        lock.writeLock().lock();
        try {
            List<Event> existingEvents = eventStreams.getOrDefault(aggregateId, new ArrayList<>());
            
            // Check for concurrency conflicts
            if (!existingEvents.isEmpty() && existingEvents.get(existingEvents.size() - 1).getVersion() != expectedVersion) {
                throw new ConcurrencyException("Expected version " + expectedVersion + 
                    " but was " + existingEvents.get(existingEvents.size() - 1).getVersion());
            }

            // Validate event versions
            for (int i = 0; i < events.size(); i++) {
                long expectedEventVersion = expectedVersion + i + 1;
                if (events.get(i).getVersion() != expectedEventVersion) {
                    throw new IllegalArgumentException("Event version mismatch");
                }
            }

            existingEvents.addAll(events);
            eventStreams.put(aggregateId, existingEvents);
        } finally {
            lock.writeLock().unlock();
        }
    }

    @Override
    public List<Event> getEvents(UUID aggregateId) {
        lock.readLock().lock();
        try {
            return new ArrayList<>(eventStreams.getOrDefault(aggregateId, Collections.emptyList()));
        } finally {
            lock.readLock().unlock();
        }
    }

    @Override
    public List<Event> getEvents(UUID aggregateId, long fromVersion) {
        lock.readLock().lock();
        try {
            return eventStreams.getOrDefault(aggregateId, Collections.emptyList())
                .stream()
                .filter(event -> event.getVersion() > fromVersion)
                .collect(Collectors.toList());
        } finally {
            lock.readLock().unlock();
        }
    }
}

// Repository for Order aggregate
public class OrderRepository {
    private final EventStore eventStore;

    public OrderRepository(EventStore eventStore) {
        this.eventStore = eventStore;
    }

    public Order getById(UUID id) {
        List<Event> events = eventStore.getEvents(id);
        if (events.isEmpty()) {
            throw new AggregateNotFoundException("Order not found: " + id);
        }
        return Order.fromEvents(id, events);
    }

    public void save(Order order) {
        List<Event> uncommittedEvents = order.getUncommittedEvents();
        if (!uncommittedEvents.isEmpty()) {
            eventStore.saveEvents(order.getId(), uncommittedEvents, order.getVersion() - uncommittedEvents.size());
            order.markEventsAsCommitted();
        }
    }
}

// Custom exceptions
public class ConcurrencyException extends RuntimeException {
    public ConcurrencyException(String message) {
        super(message);
    }
}

public class AggregateNotFoundException extends RuntimeException {
    public AggregateNotFoundException(String message) {
        super(message);
    }
}
```

**Key Technical Concepts Demonstrated**:
- **Event Sourcing**: Complete implementation with event store and aggregate reconstruction
- **Domain-Driven Design**: Proper aggregate boundaries and domain events
- **CQRS**: Separation of command and query responsibilities
- **Concurrency Control**: Version-based optimistic locking
- **Design Patterns**: Factory, Repository, and Command patterns
- **Data Integrity**: Validation and consistency checks
- **Thread Safety**: Proper synchronization for concurrent access

### Sample 3: Machine Learning Pipeline (Python)

**Purpose**: Demonstrates data processing, ML implementation, and production-ready code practices.

```python
"""
Machine Learning Pipeline for Real-time Fraud Detection
Demonstrates ML engineering best practices, data validation, and monitoring
"""

import logging
import pickle
import numpy as np
import pandas as pd
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Union, Any
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import redis
from prometheus_client import Counter, Histogram, Gauge
import json

# Metrics for monitoring
fraud_predictions = Counter('fraud_predictions_total', 'Total fraud predictions', ['prediction'])
prediction_latency = Histogram('fraud_prediction_duration_seconds', 'Fraud prediction latency')
model_confidence = Histogram('fraud_prediction_confidence', 'Model confidence distribution')
feature_drift = Gauge('feature_drift_score', 'Feature drift score', ['feature'])

@dataclass
class Transaction:
    """Transaction data structure with validation"""
    transaction_id: str
    user_id: str
    amount: float
    merchant_category: str
    transaction_time: datetime
    device_fingerprint: str
    ip_address: str
    location_country: str
    payment_method: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Validate transaction data"""
        if self.amount <= 0:
            raise ValueError("Transaction amount must be positive")
        if not self.user_id or not self.transaction_id:
            raise ValueError("User ID and Transaction ID are required")

@dataclass
class PredictionResult:
    """Fraud prediction result with metadata"""
    transaction_id: str
    is_fraud: bool
    confidence_score: float
    risk_factors: List[str]
    model_version: str
    prediction_time: datetime
    features_used: Dict[str, float]

class FeatureExtractor:
    """Extract and engineer features for fraud detection"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.feature_cache_ttl = 3600  # 1 hour
        
    def extract_features(self, transaction: Transaction) -> Dict[str, float]:
        """Extract features for fraud detection model"""
        features = {}
        
        # Basic transaction features
        features['amount'] = transaction.amount
        features['amount_log'] = np.log1p(transaction.amount)
        features['hour_of_day'] = transaction.transaction_time.hour
        features['day_of_week'] = transaction.transaction_time.weekday()
        features['is_weekend'] = 1 if transaction.transaction_time.weekday() >= 5 else 0
        
        # Categorical features (encoded)
        features['merchant_category_encoded'] = self._encode_categorical(
            transaction.merchant_category, 'merchant_category'
        )
        features['payment_method_encoded'] = self._encode_categorical(
            transaction.payment_method, 'payment_method'
        )
        features['country_encoded'] = self._encode_categorical(
            transaction.location_country, 'country'
        )
        
        # User behavior features
        user_features = self._get_user_behavior_features(transaction.user_id, transaction.transaction_time)
        features.update(user_features)
        
        # Device and IP features
        device_features = self._get_device_features(transaction.device_fingerprint, transaction.ip_address)
        features.update(device_features)
        
        # Velocity features
        velocity_features = self._get_velocity_features(transaction)
        features.update(velocity_features)
        
        return features
    
    def _encode_categorical(self, value: str, category_type: str) -> float:
        """Encode categorical values using frequency encoding"""
        try:
            # Get frequency mapping from cache
            freq_map_key = f"freq_map:{category_type}"
            freq_map = self.redis_client.hgetall(freq_map_key)
            
            if not freq_map:
                return 0.0  # Unknown category
                
            return float(freq_map.get(value.encode(), 0))
        except Exception as e:
            logging.warning(f"Error encoding categorical {category_type}: {e}")
            return 0.0
    
    def _get_user_behavior_features(self, user_id: str, current_time: datetime) -> Dict[str, float]:
        """Extract user behavior features from historical data"""
        features = {}
        
        try:
            # Get user transaction history from cache
            user_key = f"user_history:{user_id}"
            history = self.redis_client.lrange(user_key, 0, 99)  # Last 100 transactions
            
            if not history:
                features.update({
                    'user_transaction_count_24h': 0,
                    'user_avg_amount_7d': 0,
                    'user_unique_merchants_30d': 0,
                    'user_avg_time_between_transactions': 0
                })
                return features
            
            # Parse transaction history
            transactions = []
            for tx_data in history:
                try:
                    tx = json.loads(tx_data)
                    tx['timestamp'] = datetime.fromisoformat(tx['timestamp'])
                    transactions.append(tx)
                except (json.JSONDecodeError, KeyError):
                    continue
            
            # Calculate features
            now = current_time
            last_24h = [tx for tx in transactions if now - tx['timestamp'] <= timedelta(days=1)]
            last_7d = [tx for tx in transactions if now - tx['timestamp'] <= timedelta(days=7)]
            last_30d = [tx for tx in transactions if now - tx['timestamp'] <= timedelta(days=30)]
            
            features['user_transaction_count_24h'] = len(last_24h)
            features['user_avg_amount_7d'] = np.mean([tx['amount'] for tx in last_7d]) if last_7d else 0
            features['user_unique_merchants_30d'] = len(set(tx['merchant'] for tx in last_30d))
            
            # Time between transactions
            if len(transactions) > 1:
                time_diffs = [
                    (transactions[i]['timestamp'] - transactions[i+1]['timestamp']).total_seconds()
                    for i in range(len(transactions)-1)
                ]
                features['user_avg_time_between_transactions'] = np.mean(time_diffs)
            else:
                features['user_avg_time_between_transactions'] = 0
                
        except Exception as e:
            logging.error(f"Error extracting user behavior features: {e}")
            features.update({
                'user_transaction_count_24h': 0,
                'user_avg_amount_7d': 0,
                'user_unique_merchants_30d': 0,
                'user_avg_time_between_transactions': 0
            })
        
        return features
    
    def _get_device_features(self, device_fingerprint: str, ip_address: str) -> Dict[str, float]:
        """Extract device and IP-based features"""
        features = {}
        
        try:
            # Device risk score
            device_key = f"device_risk:{device_fingerprint}"
            device_risk = self.redis_client.get(device_key)
            features['device_risk_score'] = float(device_risk) if device_risk else 0.0
            
            # IP reputation score
            ip_key = f"ip_reputation:{ip_address}"
            ip_reputation = self.redis_client.get(ip_key)
            features['ip_reputation_score'] = float(ip_reputation) if ip_reputation else 0.5  # Neutral
            
            # Geographic features
            geo_key = f"ip_geo:{ip_address}"
            geo_data = self.redis_client.hgetall(geo_key)
            features['is_vpn'] = float(geo_data.get(b'is_vpn', 0))
            features['is_tor'] = float(geo_data.get(b'is_tor', 0))
            
        except Exception as e:
            logging.error(f"Error extracting device features: {e}")
            features.update({
                'device_risk_score': 0.0,
                'ip_reputation_score': 0.5,
                'is_vpn': 0.0,
                'is_tor': 0.0
            })
        
        return features
    
    def _get_velocity_features(self, transaction: Transaction) -> Dict[str, float]:
        """Extract velocity-based features"""
        features = {}
        
        try:
            # Transaction velocity by user
            user_velocity_key = f"velocity:user:{transaction.user_id}"
            user_count = self.redis_client.incr(user_velocity_key)
            self.redis_client.expire(user_velocity_key, 3600)  # 1 hour window
            features['user_velocity_1h'] = float(user_count)
            
            # Transaction velocity by IP
            ip_velocity_key = f"velocity:ip:{transaction.ip_address}"
            ip_count = self.redis_client.incr(ip_velocity_key)
            self.redis_client.expire(ip_velocity_key, 3600)
            features['ip_velocity_1h'] = float(ip_count)
            
            # Amount velocity by user
            amount_key = f"amount_velocity:user:{transaction.user_id}"
            current_amount = self.redis_client.get(amount_key)
            if current_amount:
                total_amount = float(current_amount) + transaction.amount
            else:
                total_amount = transaction.amount
            
            self.redis_client.setex(amount_key, 3600, total_amount)
            features['user_amount_velocity_1h'] = total_amount
            
        except Exception as e:
            logging.error(f"Error extracting velocity features: {e}")
            features.update({
                'user_velocity_1h': 1.0,
                'ip_velocity_1h': 1.0,
                'user_amount_velocity_1h': transaction.amount
            })
        
        return features

class FraudDetectionModel(ABC):
    """Abstract base class for fraud detection models"""
    
    @abstractmethod
    def train(self, X: np.ndarray, y: np.ndarray) -> None:
        pass
    
    @abstractmethod
    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Return predictions and confidence scores"""
        pass
    
    @abstractmethod
    def save_model(self, filepath: str) -> None:
        pass
    
    @abstractmethod
    def load_model(self, filepath: str) -> None:
        pass

class EnsembleFraudModel(FraudDetectionModel):
    """Ensemble model combining multiple fraud detection approaches"""
    
    def __init__(self):
        self.isolation_forest = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        self.random_forest = RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        self.scaler = StandardScaler()
        self.feature_names = []
        self.model_version = "1.0.0"
        
    def train(self, X: np.ndarray, y: np.ndarray) -> None:
        """Train the ensemble model"""
        logging.info("Training fraud detection ensemble model")
        
        # Normalize features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train isolation forest (unsupervised)
        self.isolation_forest.fit(X_scaled)
        
        # Train random forest (supervised)
        self.random_forest.fit(X_scaled, y)
        
        # Evaluate model
        y_pred = self.random_forest.predict(X_scaled)
        logging.info(f"Training completed. Classification report:\n{classification_report(y, y_pred)}")
    
    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Make fraud predictions with confidence scores"""
        X_scaled = self.scaler.transform(X)
        
        # Get predictions from both models
        isolation_scores = self.isolation_forest.decision_function(X_scaled)
        rf_probas = self.random_forest.predict_proba(X_scaled)
        
        # Combine predictions (ensemble approach)
        # Normalize isolation forest scores to [0, 1]
        isolation_scores_norm = (isolation_scores - isolation_scores.min()) / (
            isolation_scores.max() - isolation_scores.min() + 1e-8
        )
        
        # Weighted ensemble
        ensemble_scores = 0.3 * isolation_scores_norm + 0.7 * rf_probas[:, 1]
        
        # Convert to binary predictions
        predictions = (ensemble_scores > 0.5).astype(int)
        
        return predictions, ensemble_scores
    
    def save_model(self, filepath: str) -> None:
        """Save the trained model"""
        model_data = {
            'isolation_forest': self.isolation_forest,
            'random_forest': self.random_forest,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'model_version': self.model_version
        }
        joblib.dump(model_data, filepath)
        logging.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """Load a trained model"""
        model_data = joblib.load(filepath)
        self.isolation_forest = model_data['isolation_forest']
        self.random_forest = model_data['random_forest']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.model_version = model_data['model_version']
        logging.info(f"Model loaded from {filepath}")

class FraudDetectionPipeline:
    """Main fraud detection pipeline"""
    
    def __init__(self, model: FraudDetectionModel, feature_extractor: FeatureExtractor):
        self.model = model
        self.feature_extractor = feature_extractor
        self.prediction_threshold = 0.5
        self.risk_threshold = 0.8
        
    @prediction_latency.time()
    def predict_fraud(self, transaction: Transaction) -> PredictionResult:
        """Predict if a transaction is fraudulent"""
        try:
            # Extract features
            features = self.feature_extractor.extract_features(transaction)
            
            # Convert to numpy array
            feature_names = sorted(features.keys())
            feature_vector = np.array([features[name] for name in feature_names]).reshape(1, -1)
            
            # Make prediction
            prediction, confidence = self.model.predict(feature_vector)
            
            # Identify risk factors
            risk_factors = self._identify_risk_factors(features, confidence[0])
            
            # Create result
            result = PredictionResult(
                transaction_id=transaction.transaction_id,
                is_fraud=bool(prediction[0]),
                confidence_score=float(confidence[0]),
                risk_factors=risk_factors,
                model_version=self.model.model_version,
                prediction_time=datetime.now(),
                features_used=features
            )
            
            # Update metrics
            fraud_predictions.labels(prediction=str(result.is_fraud)).inc()
            model_confidence.observe(result.confidence_score)
            
            return result
            
        except Exception as e:
            logging.error(f"Error in fraud prediction for transaction {transaction.transaction_id}: {e}")
            # Return safe default
            return PredictionResult(
                transaction_id=transaction.transaction_id,
                is_fraud=True,  # Fail safe
                confidence_score=1.0,
                risk_factors=["prediction_error"],
                model_version=self.model.model_version,
                prediction_time=datetime.now(),
                features_used={}
            )
    
    def _identify_risk_factors(self, features: Dict[str, float], confidence: float) -> List[str]:
        """Identify risk factors based on feature values"""
        risk_factors = []
        
        # High amount
        if features.get('amount', 0) > 10000:
            risk_factors.append("high_amount")
        
        # High velocity
        if features.get('user_velocity_1h', 0) > 10:
            risk_factors.append("high_user_velocity")
        
        if features.get('ip_velocity_1h', 0) > 20:
            risk_factors.append("high_ip_velocity")
        
        # Suspicious device/IP
        if features.get('device_risk_score', 0) > 0.7:
            risk_factors.append("suspicious_device")
        
        if features.get('ip_reputation_score', 0.5) < 0.3:
            risk_factors.append("bad_ip_reputation")
        
        # VPN/Tor usage
        if features.get('is_vpn', 0) > 0:
            risk_factors.append("vpn_usage")
        
        if features.get('is_tor', 0) > 0:
            risk_factors.append("tor_usage")
        
        # Unusual timing
        hour = features.get('hour_of_day', 12)
        if hour < 6 or hour > 23:
            risk_factors.append("unusual_time")
        
        return risk_factors
    
    def batch_predict(self, transactions: List[Transaction]) -> List[PredictionResult]:
        """Process multiple transactions efficiently"""
        results = []
        
        # Extract features for all transactions
        all_features = []
        feature_names = None
        
        for transaction in transactions:
            features = self.feature_extractor.extract_features(transaction)
            if feature_names is None:
                feature_names = sorted(features.keys())
            all_features.append([features[name] for name in feature_names])
        
        if not all_features:
            return results
        
        # Batch prediction
        X = np.array(all_features)
        predictions, confidences = self.model.predict(X)
        
        # Create results
        for i, transaction in enumerate(transactions):
            features = dict(zip(feature_names, all_features[i]))
            risk_factors = self._identify_risk_factors(features, confidences[i])
            
            result = PredictionResult(
                transaction_id=transaction.transaction_id,
                is_fraud=bool(predictions[i]),
                confidence_score=float(confidences[i]),
                risk_factors=risk_factors,
                model_version=self.model.model_version,
                prediction_time=datetime.now(),
                features_used=features
            )
            results.append(result)
            
            # Update metrics
            fraud_predictions.labels(prediction=str(result.is_fraud)).inc()
            model_confidence.observe(result.confidence_score)
        
        return results

class ModelMonitor:
    """Monitor model performance and feature drift"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        
    def log_prediction(self, transaction: Transaction, result: PredictionResult, actual_fraud: Optional[bool] = None):
        """Log prediction for monitoring"""
        log_entry = {
            'transaction_id': transaction.transaction_id,
            'prediction': result.is_fraud,
            'confidence': result.confidence_score,
            'actual_fraud': actual_fraud,
            'timestamp': result.prediction_time.isoformat(),
            'features': result.features_used
        }
        
        # Store in Redis for real-time monitoring
        key = f"prediction_log:{datetime.now().strftime('%Y-%m-%d')}"
        self.redis_client.lpush(key, json.dumps(log_entry))
        self.redis_client.expire(key, 86400 * 7)  # Keep for 7 days
    
    def calculate_feature_drift(self, current_features: Dict[str, float], baseline_stats: Dict[str, Dict[str, float]]):
        """Calculate feature drift scores"""
        for feature_name, value in current_features.items():
            if feature_name in baseline_stats:
                baseline_mean = baseline_stats[feature_name]['mean']
                baseline_std = baseline_stats[feature_name]['std']
                
                # Calculate z-score as drift metric
                if baseline_std > 0:
                    drift_score = abs(value - baseline_mean) / baseline_std
                    feature_drift.labels(feature=feature_name).set(drift_score)

# Example usage and testing
if __name__ == "__main__":
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Initialize components
    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    feature_extractor = FeatureExtractor(redis_client)
    model = EnsembleFraudModel()
    pipeline = FraudDetectionPipeline(model, feature_extractor)
    monitor = ModelMonitor(redis_client)
    
    # Example transaction
    transaction = Transaction(
        transaction_id="tx_123456",
        user_id="user_789",
        amount=1500.0,
        merchant_category="electronics",
        transaction_time=datetime.now(),
        device_fingerprint="device_abc123",
        ip_address="192.168.1.1",
        location_country="US",
        payment_method="credit_card"
    )
    
    # Make prediction
    result = pipeline.predict_fraud(transaction)
    
    print(f"Transaction {result.transaction_id}")
    print(f"Fraud Prediction: {result.is_fraud}")
    print(f"Confidence: {result.confidence_score:.3f}")
    print(f"Risk Factors: {result.risk_factors}")
    
    # Log for monitoring
    monitor.log_prediction(transaction, result)
```

**Key Technical Concepts Demonstrated**:
- **Machine Learning Engineering**: Production-ready ML pipeline with proper abstractions
- **Data Validation**: Input validation and error handling
- **Feature Engineering**: Complex feature extraction with caching
- **Model Ensemble**: Combining multiple algorithms for better performance
- **Monitoring**: Comprehensive metrics and drift detection
- **Scalability**: Batch processing and efficient data structures
- **Production Patterns**: Proper logging, configuration, and error handling

### Sample 4: Async API Service (Python)

**Purpose**: Demonstrates modern Python async programming, API design, and production patterns.

```python
"""
High-performance async API service for order management
Demonstrates FastAPI, async patterns, caching, and production practices
"""

import asyncio
import logging
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Union
from uuid import UUID, uuid4

import aioredis
import asyncpg
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field, validator
from prometheus_client import Counter, Histogram, generate_latest
from prometheus_fastapi_instrumentator import Instrumentator
import structlog

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Metrics
request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])
cache_hits = Counter('cache_hits_total', 'Cache hits', ['cache_type'])
cache_misses = Counter('cache_misses_total', 'Cache misses', ['cache_type'])
order_events = Counter('order_events_total', 'Order events', ['event_type'])

# Models
class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderItem(BaseModel):
    product_id: UUID
    quantity: int = Field(gt=0, description="Quantity must be positive")
    price: float = Field(gt=0, description="Price must be positive")
    
    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        return round(v, 2)

class CreateOrderRequest(BaseModel):
    customer_id: UUID
    items: List[OrderItem] = Field(min_items=1, description="At least one item required")
    shipping_address: str = Field(min_length=10, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    
    @validator('items')
    def validate_items(cls, v):
        if not v:
            raise ValueError('At least one item is required')
        
        # Check for duplicate products
        product_ids = [item.product_id for item in v]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError('Duplicate products not allowed')
        
        return v

class UpdateOrderRequest(BaseModel):
    status: Optional[OrderStatus] = None
    shipping_address: Optional[str] = Field(None, min_length=10, max_length=500)
    tracking_number: Optional[str] = Field(None, min_length=5, max_length=50)
    notes: Optional[str] = Field(None, max_length=1000)

class OrderResponse(BaseModel):
    id: UUID
    customer_id: UUID
    status: OrderStatus
    items: List[OrderItem]
    total_amount: float
    shipping_address: str
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total_count: int
    page: int
    page_size: int
    has_next: bool

# Database models
class Order:
    def __init__(self, id: UUID, customer_id: UUID, status: OrderStatus, 
                 items: List[OrderItem], total_amount: float, shipping_address: str,
                 tracking_number: Optional[str] = None, notes: Optional[str] = None,
                 created_at: Optional[datetime] = None, updated_at: Optional[datetime] = None):
        self.id = id
        self.customer_id = customer_id
        self.status = status
        self.items = items
        self.total_amount = total_amount
        self.shipping_address = shipping_address
        self.tracking_number = tracking_number
        self.notes = notes
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def to_response(self) -> OrderResponse:
        return OrderResponse(
            id=self.id,
            customer_id=self.customer_id,
            status=self.status,
            items=self.items,
            total_amount=self.total_amount,
            shipping_address=self.shipping_address,
            tracking_number=self.tracking_number,
            notes=self.notes,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

# Repository
class OrderRepository:
    def __init__(self, db_pool: asyncpg.Pool, redis_client: aioredis.Redis):
        self.db_pool = db_pool
        self.redis_client = redis_client
        self.cache_ttl = 300  # 5 minutes
    
    async def create_order(self, order: Order) -> Order:
        """Create a new order with transaction support"""
        async with self.db_pool.acquire() as conn:
            async with conn.transaction():
                # Insert order
                await conn.execute("""
                    INSERT INTO orders (id, customer_id, status, total_amount, 
                                      shipping_address, tracking_number, notes, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                """, order.id, order.customer_id, order.status.value, order.total_amount,
                order.shipping_address, order.tracking_number, order.notes, 
                order.created_at, order.updated_at)
                
                # Insert order items
                for item in order.items:
                    await conn.execute("""
                        INSERT INTO order_items (order_id, product_id, quantity, price)
                        VALUES ($1, $2, $3, $4)
                    """, order.id, item.product_id, item.quantity, item.price)
        
        # Cache the order
        await self._cache_order(order)
        
        # Log event
        logger.info("Order created", order_id=str(order.id), customer_id=str(order.customer_id))
        order_events.labels(event_type="created").inc()
        
        return order
    
    async def get_order(self, order_id: UUID) -> Optional[Order]:
        """Get order by ID with caching"""
        # Try cache first
        cached_order = await self._get_cached_order(order_id)
        if cached_order:
            cache_hits.labels(cache_type="order").inc()
            return cached_order
        
        cache_misses.labels(cache_type="order").inc()
        
        # Get from database
        async with self.db_pool.acquire() as conn:
            order_row = await conn.fetchrow("""
                SELECT id, customer_id, status, total_amount, shipping_address,
                       tracking_number, notes, created_at, updated_at
                FROM orders WHERE id = $1
            """, order_id)
            
            if not order_row:
                return None
            
            # Get order items
            item_rows = await conn.fetch("""
                SELECT product_id, quantity, price
                FROM order_items WHERE order_id = $1
            """, order_id)
            
            items = [
                OrderItem(product_id=row['product_id'], quantity=row['quantity'], price=row['price'])
                for row in item_rows
            ]
            
            order = Order(
                id=order_row['id'],
                customer_id=order_row['customer_id'],
                status=OrderStatus(order_row['status']),
                items=items,
                total_amount=order_row['total_amount'],
                shipping_address=order_row['shipping_address'],
                tracking_number=order_row['tracking_number'],
                notes=order_row['notes'],
                created_at=order_row['created_at'],
                updated_at=order_row['updated_at']
            )
            
            # Cache the order
            await self._cache_order(order)
            
            return order
    
    async def update_order(self, order_id: UUID, updates: UpdateOrderRequest) -> Optional[Order]:
        """Update order with optimistic locking"""
        async with self.db_pool.acquire() as conn:
            async with conn.transaction():
                # Get current order for optimistic locking
                current_order = await self.get_order(order_id)
                if not current_order:
                    return None
                
                # Build update query dynamically
                update_fields = []
                values = []
                param_count = 1
                
                if updates.status is not None:
                    update_fields.append(f"status = ${param_count}")
                    values.append(updates.status.value)
                    param_count += 1
                
                if updates.shipping_address is not None:
                    update_fields.append(f"shipping_address = ${param_count}")
                    values.append(updates.shipping_address)
                    param_count += 1
                
                if updates.tracking_number is not None:
                    update_fields.append(f"tracking_number = ${param_count}")
                    values.append(updates.tracking_number)
                    param_count += 1
                
                if updates.notes is not None:
                    update_fields.append(f"notes = ${param_count}")
                    values.append(updates.notes)
                    param_count += 1
                
                if not update_fields:
                    return current_order
                
                # Add updated_at
                update_fields.append(f"updated_at = ${param_count}")
                values.append(datetime.utcnow())
                param_count += 1
                
                # Add WHERE clause
                values.append(order_id)
                
                query = f"""
                    UPDATE orders 
                    SET {', '.join(update_fields)}
                    WHERE id = ${param_count}
                    RETURNING id, customer_id, status, total_amount, shipping_address,
                             tracking_number, notes, created_at, updated_at
                """
                
                updated_row = await conn.fetchrow(query, *values)
                
                if not updated_row:
                    return None
                
                updated_order = Order(
                    id=updated_row['id'],
                    customer_id=updated_row['customer_id'],
                    status=OrderStatus(updated_row['status']),
                    items=current_order.items,  # Items don't change in this update
                    total_amount=updated_row['total_amount'],
                    shipping_address=updated_row['shipping_address'],
                    tracking_number=updated_row['tracking_number'],
                    notes=updated_row['notes'],
                    created_at=updated_row['created_at'],
                    updated_at=updated_row['updated_at']
                )
                
                # Invalidate cache
                await self._invalidate_order_cache(order_id)
                
                # Cache updated order
                await self._cache_order(updated_order)
                
                logger.info("Order updated", order_id=str(order_id), updates=updates.dict(exclude_unset=True))
                order_events.labels(event_type="updated").inc()
                
                return updated_order
    
    async def list_orders(self, customer_id: Optional[UUID] = None, status: Optional[OrderStatus] = None,
                         page: int = 1, page_size: int = 20) -> tuple[List[Order], int]:
        """List orders with pagination and filtering"""
        offset = (page - 1) * page_size
        
        # Build query
        where_clauses = []
        params = []
        param_count = 1
        
        if customer_id:
            where_clauses.append(f"customer_id = ${param_count}")
            params.append(customer_id)
            param_count += 1
        
        if status:
            where_clauses.append(f"status = ${param_count}")
            params.append(status.value)
            param_count += 1
        
        where_clause = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        async with self.db_pool.acquire() as conn:
            # Get total count
            count_query = f"SELECT COUNT(*) FROM orders {where_clause}"
            total_count = await conn.fetchval(count_query, *params)
            
            # Get orders
            orders_query = f"""
                SELECT id, customer_id, status, total_amount, shipping_address,
                       tracking_number, notes, created_at, updated_at
                FROM orders {where_clause}
                ORDER BY created_at DESC
                LIMIT ${param_count} OFFSET ${param_count + 1}
            """
            params.extend([page_size, offset])
            
            order_rows = await conn.fetch(orders_query, *params)
            
            orders = []
            for row in order_rows:
                # Get items for each order (could be optimized with a join)
                item_rows = await conn.fetch("""
                    SELECT product_id, quantity, price
                    FROM order_items WHERE order_id = $1
                """, row['id'])
                
                items = [
                    OrderItem(product_id=item['product_id'], quantity=item['quantity'], price=item['price'])
                    for item in item_rows
                ]
                
                order = Order(
                    id=row['id'],
                    customer_id=row['customer_id'],
                    status=OrderStatus(row['status']),
                    items=items,
                    total_amount=row['total_amount'],
                    shipping_address=row['shipping_address'],
                    tracking_number=row['tracking_number'],
                    notes=row['notes'],
                    created_at=row['created_at'],
                    updated_at=row['updated_at']
                )
                orders.append(order)
            
            return orders, total_count
    
    async def _cache_order(self, order: Order):
        """Cache order in Redis"""
        try:
            key = f"order:{order.id}"
            value = {
                'id': str(order.id),
                'customer_id': str(order.customer_id),
                'status': order.status.value,
                'items': [item.dict() for item in order.items],
                'total_amount': order.total_amount,
                'shipping_address': order.shipping_address,
                'tracking_number': order.tracking_number,
                'notes': order.notes,
                'created_at': order.created_at.isoformat(),
                'updated_at': order.updated_at.isoformat()
            }
            await self.redis_client.setex(key, self.cache_ttl, value)
        except Exception as e:
            logger.warning("Failed to cache order", order_id=str(order.id), error=str(e))
    
    async def _get_cached_order(self, order_id: UUID) -> Optional[Order]:
        """Get order from cache"""
        try:
            key = f"order:{order_id}"
            cached_data = await self.redis_client.get(key)
            if not cached_data:
                return None
            
            data = cached_data
            items = [OrderItem(**item) for item in data['items']]
            
            return Order(
                id=UUID(data['id']),
                customer_id=UUID(data['customer_id']),
                status=OrderStatus(data['status']),
                items=items,
                total_amount=data['total_amount'],
                shipping_address=data['shipping_address'],
                tracking_number=data['tracking_number'],
                notes=data['notes'],
                created_at=datetime.fromisoformat(data['created_at']),
                updated_at=datetime.fromisoformat(data['updated_at'])
            )
        except Exception as e:
            logger.warning("Failed to get cached order", order_id=str(order_id), error=str(e))
            return None
    
    async def _invalidate_order_cache(self, order_id: UUID):
        """Invalidate order cache"""
        try:
            key = f"order:{order_id}"
            await self.redis_client.delete(key)
        except Exception as e:
            logger.warning("Failed to invalidate cache", order_id=str(order_id), error=str(e))

# Service layer
class OrderService:
    def __init__(self, repository: OrderRepository):
        self.repository = repository
    
    async def create_order(self, request: CreateOrderRequest) -> OrderResponse:
        """Create a new order with business logic validation"""
        # Calculate total amount
        total_amount = sum(item.quantity * item.price for item in request.items)
        
        # Create order
        order = Order(
            id=uuid4(),
            customer_id=request.customer_id,
            status=OrderStatus.PENDING,
            items=request.items,
            total_amount=total_amount,
            shipping_address=request.shipping_address,
            notes=request.notes
        )
        
        # Additional business logic could go here
        # - Inventory validation
        # - Customer validation
        # - Fraud detection
        # - Price validation
        
        created_order = await self.repository.create_order(order)
        return created_order.to_response()
    
    async def get_order(self, order_id: UUID) -> OrderResponse:
        """Get order by ID"""
        order = await self.repository.get_order(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order.to_response()
    
    async def update_order(self, order_id: UUID, updates: UpdateOrderRequest) -> OrderResponse:
        """Update order with business logic validation"""
        # Business logic validation
        if updates.status:
            await self._validate_status_transition(order_id, updates.status)
        
        updated_order = await self.repository.update_order(order_id, updates)
        if not updated_order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return updated_order.to_response()
    
    async def list_orders(self, customer_id: Optional[UUID] = None, status: Optional[OrderStatus] = None,
                         page: int = 1, page_size: int = 20) -> OrderListResponse:
        """List orders with pagination"""
        if page_size > 100:
            page_size = 100  # Limit page size
        
        orders, total_count = await self.repository.list_orders(customer_id, status, page, page_size)
        
        has_next = (page * page_size) < total_count
        
        return OrderListResponse(
            orders=[order.to_response() for order in orders],
            total_count=total_count,
            page=page,
            page_size=page_size,
            has_next=has_next
        )
    
    async def _validate_status_transition(self, order_id: UUID, new_status: OrderStatus):
        """Validate status transition rules"""
        current_order = await self.repository.get_order(order_id)
        if not current_order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Define valid transitions
        valid_transitions = {
            OrderStatus.PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            OrderStatus.CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
            OrderStatus.PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
            OrderStatus.SHIPPED: [OrderStatus.DELIVERED],
            OrderStatus.DELIVERED: [],
            OrderStatus.CANCELLED: []
        }
        
        if new_status not in valid_transitions.get(current_order.status, []):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status transition from {current_order.status} to {new_status}"
            )

# Dependencies
class DatabaseManager:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        self.redis: Optional[aioredis.Redis] = None
    
    async def connect(self):
        """Initialize database connections"""
        # PostgreSQL connection
        self.pool = await asyncpg.create_pool(
            "postgresql://user:password@localhost:5432/orders",
            min_size=5,
            max_size=20,
            command_timeout=60
        )
        
        # Redis connection
        self.redis = aioredis.from_url(
            "redis://localhost:6379",
            encoding="utf-8",
            decode_responses=True
        )
        
        logger.info("Database connections established")
    
    async def disconnect(self):
        """Close database connections"""
        if self.pool:
            await self.pool.close()
        if self.redis:
            await self.redis.close()
        logger.info("Database connections closed")

db_manager = DatabaseManager()

async def get_order_service() -> OrderService:
    """Dependency injection for order service"""
    repository = OrderRepository(db_manager.pool, db_manager.redis)
    return OrderService(repository)

# Application setup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db_manager.connect()
    logger.info("Application started")
    yield
    # Shutdown
    await db_manager.disconnect()
    logger.info("Application shutdown")

app = FastAPI(
    title="Order Management API",
    description="High-performance async order management service",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Metrics
instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        "HTTP request",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=process_time
    )
    
    request_duration.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(process_time)
    
    return response

# Routes
@app.post("/orders", response_model=OrderResponse, status_code=201)
async def create_order(
    request: CreateOrderRequest,
    background_tasks: BackgroundTasks,
    service: OrderService = Depends(get_order_service)
) -> OrderResponse:
    """Create a new order"""
    order = await service.create_order(request)
    
    # Background task for notification
    background_tasks.add_task(send_order_notification, order.id)
    
    return order

@app.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    service: OrderService = Depends(get_order_service)
) -> OrderResponse:
    """Get order by ID"""
    return await service.get_order(order_id)

@app.patch("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: UUID,
    updates: UpdateOrderRequest,
    background_tasks: BackgroundTasks,
    service: OrderService = Depends(get_order_service)
) -> OrderResponse:
    """Update order"""
    order = await service.update_order(order_id, updates)
    
    # Background task for status change notification
    if updates.status:
        background_tasks.add_task(send_status_change_notification, order_id, updates.status)
    
    return order

@app.get("/orders", response_model=OrderListResponse)
async def list_orders(
    customer_id: Optional[UUID] = None,
    status: Optional[OrderStatus] = None,
    page: int = Field(1, ge=1),
    page_size: int = Field(20, ge=1, le=100),
    service: OrderService = Depends(get_order_service)
) -> OrderListResponse:
    """List orders with filtering and pagination"""
    return await service.list_orders(customer_id, status, page, page_size)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()

# Background tasks
async def send_order_notification(order_id: UUID):
    """Send order notification (placeholder)"""
    await asyncio.sleep(1)  # Simulate async work
    logger.info("Order notification sent", order_id=str(order_id))

async def send_status_change_notification(order_id: UUID, new_status: OrderStatus):
    """Send status change notification (placeholder)"""
    await asyncio.sleep(1)  # Simulate async work
    logger.info("Status change notification sent", order_id=str(order_id), status=new_status.value)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Key Technical Concepts Demonstrated**:
- **Async Programming**: Full async/await implementation with proper resource management
- **API Design**: RESTful API with proper HTTP status codes and validation
- **Database Patterns**: Repository pattern with connection pooling and transactions
- **Caching**: Redis caching with proper invalidation strategies
- **Monitoring**: Comprehensive metrics and structured logging
- **Production Patterns**: Health checks, graceful shutdown, middleware
- **Error Handling**: Proper exception handling and user-friendly error messages

### Sample 5: Infrastructure as Code (Terraform + Kubernetes)

**Purpose**: Demonstrates infrastructure automation, containerization, and cloud-native deployment patterns.

```hcl
# Terraform configuration for Kubernetes deployment on AWS
# terraform/main.tf

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
  }
  
  backend "s3" {
    bucket         = "terraform-state-bucket"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

# Variables
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "order-management"
}

variable "node_group_desired_size" {
  description = "Desired number of nodes"
  type        = number
  default     = 2
}

variable "node_group_max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 10
}

variable "node_instance_types" {
  description = "EC2 instance types for nodes"
  type        = list(string)
  default     = ["t3.medium", "t3.large"]
}

# Local values
locals {
  common_tags = {
    Environment = var.environment
    Project     = "order-management"
    ManagedBy   = "terraform"
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "${var.cluster_name}-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true
  
  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }
  
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }
  
  tags = local.common_tags
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = var.cluster_name
  cluster_version = "1.27"
  
  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true
  
  # OIDC Identity provider
  cluster_identity_providers = {
    sts = {
      client_id = "sts.amazonaws.com"
    }
  }
  
  # Managed node group
  eks_managed_node_groups = {
    main = {
      name = "main-node-group"
      
      instance_types = var.node_instance_types
      
      min_size     = 1
      max_size     = var.node_group_max_size
      desired_size = var.node_group_desired_size
      
      # Launch template configuration
      launch_template_name            = "${var.cluster_name}-node-group"
      launch_template_use_name_prefix = true
      launch_template_version         = "$Latest"
      
      vpc_security_group_ids = [aws_security_group.node_group_sg.id]
      
      # EBS optimized
      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = 50
            volume_type          = "gp3"
            iops                 = 3000
            throughput           = 150
            encrypted            = true
            delete_on_termination = true
          }
        }
      }
      
      metadata_options = {
        http_endpoint               = "enabled"
        http_tokens                = "required"
        http_put_response_hop_limit = 2
        instance_metadata_tags      = "disabled"
      }
      
      tags = local.common_tags
    }
  }
  
  # Add-ons
  cluster_addons = {
    coredns = {
      resolve_conflicts = "OVERWRITE"
    }
    kube-proxy = {}
    vpc-cni = {
      resolve_conflicts = "OVERWRITE"
    }
    aws-ebs-csi-driver = {
      resolve_conflicts = "OVERWRITE"
    }
  }
  
  tags = local.common_tags
}

# Additional security group for node group
resource "aws_security_group" "node_group_sg" {
  name_prefix = "${var.cluster_name}-node-group-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-node-group-sg"
  })
}

# RDS PostgreSQL
resource "aws_db_subnet_group" "postgres" {
  name       = "${var.cluster_name}-postgres-subnet-group"
  subnet_ids = module.vpc.private_subnets
  
  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-postgres-subnet-group"
  })
}

resource "aws_security_group" "postgres" {
  name_prefix = "${var.cluster_name}-postgres-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }
  
  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-postgres-sg"
  })
}

resource "aws_db_instance" "postgres" {
  identifier = "${var.cluster_name}-postgres"
  
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = "orders"
  username = "orderuser"
  password = "changeme123!"  # In production, use AWS Secrets Manager
  
  vpc_security_group_ids = [aws_security_group.postgres.id]
  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = true
  deletion_protection = false
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_monitoring.arn
  
  tags = local.common_tags
}

# IAM role for RDS monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.cluster_name}-rds-monitoring"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.cluster_name}-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets
  
  tags = local.common_tags
}

resource "aws_security_group" "redis" {
  name_prefix = "${var.cluster_name}-redis-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }
  
  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-redis-sg"
  })
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "${var.cluster_name}-redis"
  description                = "Redis cluster for ${var.cluster_name}"
  
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = local.common_tags
}

# Outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = module.eks.cluster_name
}

output "postgres_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  sensitive   = true
}
```

```yaml
# Kubernetes manifests
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: order-management
  labels:
    name: order-management
    istio-injection: enabled

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: order-api-config
  namespace: order-management
data:
  DATABASE_HOST: "order-management-postgres.cluster-xxx.us-west-2.rds.amazonaws.com"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "orders"
  REDIS_HOST: "order-management-redis.xxx.cache.amazonaws.com"
  REDIS_PORT: "6379"
  LOG_LEVEL: "INFO"
  METRICS_PORT: "9090"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: order-api-secrets
  namespace: order-management
type: Opaque
data:
  DATABASE_USER: b3JkZXJ1c2Vy  # base64 encoded "orderuser"
  DATABASE_PASSWORD: Y2hhbmdlbWUxMjMh  # base64 encoded "changeme123!"

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-api
  namespace: order-management
  labels:
    app: order-api
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: order-api
  template:
    metadata:
      labels:
        app: order-api
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: order-api
      containers:
      - name: order-api
        image: order-api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
          name: http
          protocol: TCP
        - containerPort: 9090
          name: metrics
          protocol: TCP
        env:
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: order-api-config
              key: DATABASE_HOST
        - name: DATABASE_PORT
          valueFrom:
            configMapKeyRef:
              name: order-api-config
              key: DATABASE_PORT
        - name: DATABASE_NAME
          valueFrom:
            configMapKeyRef:
              name: order-api-config
              key: DATABASE_NAME
        - name: DATABASE_USER
          valueFrom:
            secretKeyRef:
              name: order-api-secrets
              key: DATABASE_USER
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: order-api-secrets
              key: DATABASE_PASSWORD
        - name: REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: order-api-config
              key: REDIS_HOST
        - name: REDIS_PORT
          valueFrom:
            configMapKeyRef:
              name: order-api-config
              key: REDIS_PORT
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: order-api-config
              key: LOG_LEVEL
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 1000
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: order-api
  namespace: order-management
  labels:
    app: order-api
spec:
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: 8000
    protocol: TCP
    name: http
  - port: 9090
    targetPort: 9090
    protocol: TCP
    name: metrics
  selector:
    app: order-api

---
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-api-hpa
  namespace: order-management
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"

---
# k8s/pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: order-api-pdb
  namespace: order-management
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: order-api

---
# k8s/serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: order-api
  namespace: order-management
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT:role/order-api-role

---
# k8s/networkpolicy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: order-api-network-policy
  namespace: order-management
spec:
  podSelector:
    matchLabels:
      app: order-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: istio-system
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 8000
    - protocol: TCP
      port: 9090
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 5432  # PostgreSQL
    - protocol: TCP
      port: 6379  # Redis
    - protocol: TCP
      port: 443   # HTTPS
    - protocol: TCP
      port: 53    # DNS
    - protocol: UDP
      port: 53    # DNS
```

```dockerfile
# Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories and set permissions
RUN mkdir -p /app/logs && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

**Key Technical Concepts Demonstrated**:
- **Infrastructure as Code**: Complete Terraform configuration for AWS resources
- **Container Orchestration**: Kubernetes manifests with best practices
- **High Availability**: Multi-AZ deployment with auto-scaling and pod disruption budgets
- **Security**: Network policies, security contexts, and IAM roles
- **Monitoring**: Health checks, metrics collection, and observability
- **DevOps Patterns**: Rolling updates, resource limits, and configuration management

## Clean Code Principles for Interviews

### 1. Readability and Clarity
```python
# Bad: Unclear variable names and logic
def calc(d, r):
    return d * r * 365

# Good: Clear intent and readable
def calculate_annual_revenue(daily_revenue: float, retention_rate: float) -> float:
    """Calculate projected annual revenue based on daily revenue and retention rate."""
    days_in_year = 365
    return daily_revenue * retention_rate * days_in_year
```

### 2. Single Responsibility Principle
```python
# Bad: Multiple responsibilities
class UserManager:
    def save_user(self, user):
        # Validate user
        if not user.email:
            raise ValueError("Email required")
        
        # Send email
        send_welcome_email(user.email)
        
        # Save to database
        db.save(user)

# Good: Separated concerns
class UserValidator:
    def validate(self, user):
        if not user.email:
            raise ValueError("Email required")

class UserRepository:
    def save(self, user):
        return db.save(user)

class UserService:
    def __init__(self, validator, repository, email_service):
        self.validator = validator
        self.repository = repository
        self.email_service = email_service
    
    def create_user(self, user):
        self.validator.validate(user)
        saved_user = self.repository.save(user)
        self.email_service.send_welcome_email(user.email)
        return saved_user
```

### 3. Error Handling
```python
# Bad: Silent failures
def process_payment(amount):
    try:
        result = payment_api.charge(amount)
        return result
    except:
        return None

# Good: Explicit error handling
def process_payment(amount: float) -> PaymentResult:
    """Process payment and return result with clear error information."""
    try:
        if amount <= 0:
            raise PaymentError("Amount must be positive")
        
        result = payment_api.charge(amount)
        return PaymentResult(success=True, transaction_id=result.id)
    
    except PaymentAPIError as e:
        logger.error(f"Payment API error: {e}")
        raise PaymentError(f"Payment failed: {e.message}")
    
    except Exception as e:
        logger.error(f"Unexpected error in payment processing: {e}")
        raise PaymentError("Payment processing failed")
```

### 4. Documentation and Comments
```python
def calculate_fibonacci_iterative(n: int) -> int:
    """
    Calculate the nth Fibonacci number using iterative approach.
    
    Args:
        n: Position in Fibonacci sequence (0-indexed)
        
    Returns:
        The nth Fibonacci number
        
    Raises:
        ValueError: If n is negative
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    
    Examples:
        >>> calculate_fibonacci_iterative(0)
        0
        >>> calculate_fibonacci_iterative(5)
        5
    """
    if n < 0:
        raise ValueError("Fibonacci sequence is not defined for negative numbers")
    
    if n <= 1:
        return n
    
    # Use two variables to track previous two numbers
    prev2, prev1 = 0, 1
    
    for i in range(2, n + 1):
        current = prev1 + prev2
        prev2, prev1 = prev1, current
    
    return prev1
```

## GitHub Portfolio Organization

### Repository Structure
```
portfolio/
   README.md                          # Portfolio overview
   projects/
      distributed-cache/             # Major project 1
         README.md                  # Project overview
         src/                       # Source code
         docs/                      # Documentation
         tests/                     # Test files
         benchmarks/                # Performance tests
      ml-fraud-detection/            # Major project 2
      async-api-service/             # Major project 3
   algorithms/                        # Algorithm implementations
      sorting/
      graph/
      dynamic-programming/
   system-design/                     # System design examples
      load-balancer/
      message-queue/
      distributed-db/
   infrastructure/                    # IaC examples
      terraform/
      kubernetes/
      ci-cd/
   docs/
       case-studies/                  # Detailed case studies
       architecture-decisions/        # ADRs
       lessons-learned/
```

### README Template
```markdown
# [Project Name]

## Overview
Brief description of what this project does and why it's interesting.

## Key Technical Achievements
- Specific technical accomplishments
- Performance improvements with metrics
- Scale or complexity handled

## Architecture
High-level architecture diagram and explanation.

## Technologies Used
- Primary languages and frameworks
- Databases and infrastructure
- Third-party services and APIs

## Performance Metrics
- Response times
- Throughput
- Resource utilization
- Scale achieved

## Running the Code
Clear instructions for setup and execution.

## Design Decisions
Key architectural and technical decisions made.

## Lessons Learned
What worked well and what could be improved.
```

### Profile README
```markdown
# Technical Portfolio

Senior Software Engineer with X years of experience building scalable distributed systems and leading technical teams.

## =€ Featured Projects

### [Distributed Cache System](./projects/distributed-cache)
Built a Redis-compatible distributed cache handling 1M+ requests/second with <1ms latency.
- **Technologies**: Go, Redis, Kubernetes
- **Scale**: 99.99% uptime, 10TB+ data
- **Impact**: 40% performance improvement across platform

### [ML Fraud Detection Pipeline](./projects/ml-fraud-detection)
Real-time fraud detection system processing 500K+ transactions/day.
- **Technologies**: Python, Apache Kafka, TensorFlow
- **Scale**: <50ms prediction latency
- **Impact**: 78% reduction in fraud losses

## =à Technical Skills

**Languages**: Python, Go, Java, JavaScript/TypeScript  
**Systems**: Kubernetes, Docker, AWS, Terraform  
**Databases**: PostgreSQL, Redis, MongoDB, Elasticsearch  
**Tools**: Git, Jenkins, Prometheus, Grafana

## =Ê GitHub Stats
[GitHub stats badges and contribution graphs]

## =Ý Technical Writing
- [Architecture Decision Records](./docs/architecture-decisions/)
- [System Design Case Studies](./docs/case-studies/)
- [Technical Blog Posts](./docs/blog-posts/)

## =ë Contact
[Contact information and social links]
```

Your code samples should tell a story about your technical journey, problem-solving approach, and growth as an engineer. Focus on demonstrating not just what you can build, but how you think about technical problems, make trade-offs, and deliver business value through code.