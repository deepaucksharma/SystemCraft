# Mock Coding Problems for Amazon L6/L7 Interviews

!!! info "Realistic Coding Interview Practice"
    This collection will provide realistic coding problems specifically designed for Amazon L6/L7 Engineering Manager interviews, with focus on manager-level expectations.

## 📖 Temporary Resources

While this mock problem set is being developed, use these resources:

### Immediate Practice
- **[Coding Strategy](strategy.md)** - Manager-level approach to coding interviews
- **[Amazon Top 100](amazon-top-100.md)** - Amazon-specific problem collection
- **[Problem Patterns](patterns.md)** - Essential coding patterns
- **[Algorithms Guide](algorithms.md)** - Core algorithmic knowledge

### Recommended Mock Platforms
- **Pramp** - Free peer-to-peer mock interviews
- **Interviewing.io** - Professional mock interviews with feedback
- **CodeSignal** - Amazon-style assessments
- **LeetCode Mock Assessments** - Timed problem sets

### Manager-Level Mock Focus

**Problem Difficulty**: 
- **L6**: Easy to Medium problems, emphasis on clean code and explanation
- **L7**: Medium problems, focus on system thinking and optimization

**Time Expectations**:
- **Setup & Understanding**: 3-5 minutes
- **Coding**: 15-20 minutes
- **Testing & Optimization**: 5-10 minutes
- **Discussion**: 5-10 minutes

## 🎯 L6 Engineering Manager Problem Set

### Problem 1: Design a Cache System (Medium Difficulty)

**Problem Statement:**
```
Design and implement a cache system that supports:
- get(key): Retrieve value associated with key
- put(key, value): Store key-value pair
- Automatic eviction when cache reaches capacity using LRU policy
- Thread-safe operations

Capacity: Up to 1000 entries
Time Limit: 25 minutes coding + 10 minutes discussion
```

**L6 Manager Expectations:**
- Clean, readable code with good variable naming
- Demonstrate understanding of data structure trade-offs
- Explain design decisions and time/space complexity
- Show ability to handle edge cases

**Sample Solution Framework:**
```python
class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.order = OrderedDict()
        
    def get(self, key: int) -> int:
        if key in self.cache:
            # Move to end (most recently used)
            self.order.move_to_end(key)
            return self.cache[key]
        return -1
    
    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            # Update existing key
            self.cache[key] = value
            self.order.move_to_end(key)
        else:
            # Add new key
            if len(self.cache) >= self.capacity:
                # Remove least recently used
                lru_key = next(iter(self.order))
                del self.cache[lru_key]
                del self.order[lru_key]
            
            self.cache[key] = value
            self.order[key] = True
```

**Follow-up Discussion Points:**
- How would you make this thread-safe?
- What if we needed to support expiration times?
- How would you monitor cache hit rates in production?
- What are the trade-offs vs using a third-party solution like Redis?

### Problem 2: Rate Limiter Implementation (Medium Difficulty)

**Problem Statement:**
```
Implement a rate limiter that allows N requests per time window.
Support both per-user and global rate limiting.

Requirements:
- allowRequest(userId): Returns true if request is allowed
- Support sliding window algorithm
- Handle concurrent requests efficiently

Example: 100 requests per user per minute
Time Limit: 30 minutes coding + 15 minutes discussion
```

**Sample Solution Approach:**
```python
from collections import deque
import time

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_size: int):
        self.max_requests = max_requests
        self.window_size = window_size
        self.user_windows = {}  # userId -> deque of timestamps
        
    def allow_request(self, user_id: str) -> bool:
        current_time = int(time.time())
        
        if user_id not in self.user_windows:
            self.user_windows[user_id] = deque()
        
        window = self.user_windows[user_id]
        
        # Remove expired timestamps
        while window and window[0] <= current_time - self.window_size:
            window.popleft()
        
        # Check if we can allow this request
        if len(window) < self.max_requests:
            window.append(current_time)
            return True
        
        return False
```

**Manager-Level Discussion:**
- How would you distribute this across multiple servers?
- What data store would you use for persistence?
- How would you handle different rate limits for different API endpoints?
- What monitoring and alerting would you implement?

## 🎯 L7 Engineering Manager Problem Set

### Problem 3: Design a Distributed ID Generator (Hard Difficulty)

**Problem Statement:**
```
Design a service that generates unique IDs across a distributed system.

Requirements:
- Globally unique IDs
- Roughly sortable by timestamp
- High throughput (100k+ IDs/second)
- No single point of failure
- 64-bit integer format

Time Limit: 35 minutes coding + 25 minutes system design discussion
```

**L7 Manager Approach:**
```python
class DistributedIDGenerator:
    def __init__(self, machine_id: int, datacenter_id: int):
        self.machine_id = machine_id & 0x1F  # 5 bits
        self.datacenter_id = datacenter_id & 0x1F  # 5 bits
        self.sequence = 0
        self.last_timestamp = -1
        
        # Snowflake algorithm bit allocation:
        # 1 bit: unused (sign bit)
        # 41 bits: timestamp (milliseconds since epoch)
        # 5 bits: datacenter ID
        # 5 bits: machine ID  
        # 12 bits: sequence number
        
    def generate_id(self) -> int:
        timestamp = self._current_timestamp()
        
        if timestamp < self.last_timestamp:
            raise Exception("Clock moved backwards")
        
        if timestamp == self.last_timestamp:
            # Same millisecond - increment sequence
            self.sequence = (self.sequence + 1) & 0xFFF  # 12 bits
            if self.sequence == 0:
                # Sequence overflow - wait for next millisecond
                timestamp = self._wait_next_millisecond(timestamp)
        else:
            self.sequence = 0
        
        self.last_timestamp = timestamp
        
        # Combine all parts into 64-bit ID
        id_value = ((timestamp << 22) |
                   (self.datacenter_id << 17) |
                   (self.machine_id << 12) |
                   self.sequence)
        
        return id_value
    
    def _current_timestamp(self) -> int:
        return int(time.time() * 1000)
    
    def _wait_next_millisecond(self, last_timestamp: int) -> int:
        timestamp = self._current_timestamp()
        while timestamp <= last_timestamp:
            timestamp = self._current_timestamp()
        return timestamp
```

**L7-Level System Design Discussion:**
- How do you assign machine IDs across datacenters?
- What happens when a machine restarts? Clock skew issues?
- How would you monitor and alert on ID generation health?
- Alternative approaches: Database sequences, UUID variations, hybrid approaches?
- How would you handle capacity planning for ID generation?

### Problem 4: Implement Consistent Hashing (Hard Difficulty)

**Problem Statement:**
```
Implement a consistent hashing ring for distributing data across servers.

Requirements:
- Add/remove servers with minimal data movement
- Support virtual nodes for load balancing
- Handle server failures gracefully
- Demonstrate with cache distribution example

Time Limit: 40 minutes coding + 20 minutes architecture discussion
```

**Implementation Framework:**
```python
import hashlib
from bisect import bisect_left, bisect_right
from typing import List, Dict, Any

class ConsistentHashing:
    def __init__(self, replicas: int = 100):
        self.replicas = replicas
        self.ring = {}  # hash -> server
        self.sorted_keys = []  # sorted hash values
        
    def add_server(self, server: str) -> None:
        for i in range(self.replicas):
            key = self._hash(f"{server}:{i}")
            self.ring[key] = server
            
        self.sorted_keys = sorted(self.ring.keys())
        
    def remove_server(self, server: str) -> None:
        for i in range(self.replicas):
            key = self._hash(f"{server}:{i}")
            if key in self.ring:
                del self.ring[key]
                
        self.sorted_keys = sorted(self.ring.keys())
    
    def get_server(self, key: str) -> str:
        if not self.ring:
            return None
            
        hash_key = self._hash(key)
        idx = bisect_right(self.sorted_keys, hash_key)
        
        if idx == len(self.sorted_keys):
            idx = 0  # Wrap around to first server
            
        return self.ring[self.sorted_keys[idx]]
    
    def _hash(self, key: str) -> int:
        return int(hashlib.md5(key.encode()).hexdigest(), 16)
    
    def get_distribution_stats(self) -> Dict[str, int]:
        # For testing - see how keys are distributed
        stats = {}
        test_keys = [f"key_{i}" for i in range(10000)]
        
        for key in test_keys:
            server = self.get_server(key)
            stats[server] = stats.get(server, 0) + 1
            
        return stats
```

**L7 Architecture Discussion:**
- How do you handle data migration when servers are added/removed?
- What's the impact on cache hit rates during scaling events?
- How would you implement this in a microservices architecture?
- Trade-offs between consistency and availability during server changes?
- Monitoring and observability for consistent hashing performance?

## 🚀 Practical Mock Interview Sessions

### 45-Minute L6 Mock Interview Script

**Phase 1: Problem Introduction (5 minutes)**
```
Interviewer: "Today we're going to work on a caching problem. In your role as an engineering manager, you might need to implement or guide your team on caching solutions.

I'd like you to design and implement an LRU cache with get() and put() operations. The cache should have a fixed capacity and evict the least recently used item when full.

Before we start coding, can you clarify the requirements and think about your approach?"

Candidate should ask:
- What's the expected capacity range?
- Are there thread safety requirements?
- What should get() return if key doesn't exist?
- Any performance requirements?
```

**Phase 2: Design Discussion (5 minutes)**
```
Expected candidate response:
"For LRU cache, I need to track both the storage and the access order. I'm thinking of using:
- Hash map for O(1) key lookup
- Doubly linked list to maintain LRU order
- Or Python's OrderedDict which combines both

The key insight is that I need O(1) access and O(1) updates to the LRU order."

Interviewer follow-up:
"That sounds good. Let's go with the approach you're most comfortable with. Please start implementing."
```

**Phase 3: Coding (25 minutes)**
- Monitor code quality, variable naming, structure
- Let candidate work with minimal interruption
- Take notes on approach, problem-solving process
- Help with syntax if needed, focus on logic

**Phase 4: Testing & Edge Cases (5 minutes)**
```
Interviewer: "Can you walk me through how your code handles these cases:
1. Adding to empty cache
2. Adding when cache is at capacity
3. Getting a key that doesn't exist
4. Updating an existing key

Let's trace through a quick example with capacity 2:
put(1, 'a'), put(2, 'b'), get(1), put(3, 'c') - what happens?"
```

**Phase 5: Follow-up Discussion (5 minutes)**
```
Manager-focused questions:
- "How would you make this thread-safe for a production system?"
- "What monitoring would you add to track cache performance?"
- "If your team proposed using Redis instead, how would you evaluate that decision?"
- "What would be your concerns deploying this in a high-traffic service?"
```

### 45-Minute L7 Mock Interview Script

**Phase 1: Problem Framing (7 minutes)**
```
Interviewer: "As an L7 engineering leader, you often need to make architecture decisions about distributed systems. 

Today's problem: Design a distributed unique ID generation service. This service needs to generate millions of unique IDs per second across multiple datacenters for our global e-commerce platform.

Before we dive into implementation, let's discuss the requirements and constraints."

Candidate should explore:
- Scale requirements (QPS, global distribution)
- ID properties (sortability, format constraints)
- Consistency requirements
- Failure handling
```

**Phase 2: High-Level Design (8 minutes)**
- Candidate should propose approach (Snowflake, UUID, database, etc.)
- Discuss trade-offs between approaches
- Focus on distributed systems considerations

**Phase 3: Implementation (20 minutes)**
- Focus on core algorithm implementation
- Handle edge cases (clock skew, sequence overflow)
- Code quality appropriate for L7 level

**Phase 4: System Integration Discussion (10 minutes)**
```
L7-focused questions:
- "How would you deploy this across 5 datacenters?"
- "What's your strategy for handling machine ID assignment?"
- "How do you ensure this service meets 99.99% availability?"
- "What operational concerns would you have?"
- "How would you performance test this system?"
```

---

*For immediate mock interview preparation, start with [Coding Strategy](strategy.md) and practice on platforms like Pramp while this comprehensive mock problem collection is being developed.*