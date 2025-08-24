# Advanced Distributed Systems Concepts for Amazon L6/L7 Interviews

## Introduction to Advanced Distributed Systems

At Amazon scale, distributed systems challenges go far beyond basic load balancing and database replication. L6 and L7 system design interviews require deep understanding of consensus algorithms, distributed locking, conflict resolution, and Byzantine fault tolerance. This module provides comprehensive coverage of advanced distributed systems concepts essential for Amazon-scale architecture.

---

## Consensus Algorithms at Scale

### Raft Consensus Algorithm

Raft is a consensus algorithm designed for understandability while maintaining correctness. It's used in systems like etcd, Consul, and Amazon's internal services.

#### Raft Algorithm Components

**Leader Election Process**:
```python
class RaftNode:
    def __init__(self, node_id, cluster_nodes):
        self.node_id = node_id
        self.cluster_nodes = cluster_nodes
        self.state = "follower"  # follower, candidate, leader
        self.current_term = 0
        self.voted_for = None
        self.log = []
        self.commit_index = 0
        self.last_applied = 0
        
    def start_election(self):
        """Candidate initiates leader election"""
        self.state = "candidate"
        self.current_term += 1
        self.voted_for = self.node_id
        
        # Vote for self
        votes_received = 1
        
        # Request votes from other nodes
        for node in self.cluster_nodes:
            if node != self.node_id:
                vote_request = {
                    'term': self.current_term,
                    'candidate_id': self.node_id,
                    'last_log_index': len(self.log) - 1,
                    'last_log_term': self.log[-1]['term'] if self.log else 0
                }
                
                if self.request_vote(node, vote_request):
                    votes_received += 1
        
        # Become leader if majority votes received
        majority_threshold = (len(self.cluster_nodes) + 1) // 2 + 1
        if votes_received >= majority_threshold:
            self.become_leader()
    
    def become_leader(self):
        """Transition to leader state and start heartbeats"""
        self.state = "leader"
        print(f"Node {self.node_id} became leader for term {self.current_term}")
        
        # Initialize leader state
        self.next_index = {node: len(self.log) for node in self.cluster_nodes}
        self.match_index = {node: 0 for node in self.cluster_nodes}
        
        # Start sending heartbeats
        self.send_heartbeats()
    
    def append_entries(self, entries):
        """Leader replicates log entries to followers"""
        if self.state != "leader":
            return False
        
        success_count = 1  # Leader counts as success
        
        for follower in self.cluster_nodes:
            if follower == self.node_id:
                continue
                
            # Prepare append entries request
            prev_log_index = self.next_index[follower] - 1
            prev_log_term = self.log[prev_log_index]['term'] if prev_log_index >= 0 else 0
            
            append_request = {
                'term': self.current_term,
                'leader_id': self.node_id,
                'prev_log_index': prev_log_index,
                'prev_log_term': prev_log_term,
                'entries': entries,
                'leader_commit': self.commit_index
            }
            
            if self.send_append_entries(follower, append_request):
                success_count += 1
                self.next_index[follower] = len(self.log)
                self.match_index[follower] = len(self.log) - 1
        
        # Commit if majority replicated
        if success_count >= majority_threshold:
            self.commit_index = len(self.log) - 1
            return True
        
        return False

# Real-world implementation considerations for Amazon scale
class OptimizedRaftNode(RaftNode):
    def __init__(self, node_id, cluster_nodes):
        super().__init__(node_id, cluster_nodes)
        self.batch_size = 1000  # Batch multiple entries
        self.heartbeat_interval = 150  # milliseconds
        self.election_timeout = random.randint(150, 300)  # randomized
        
    def batch_append_entries(self, entries_batch):
        """Optimized batching for high throughput"""
        if len(entries_batch) > self.batch_size:
            # Split large batches to avoid memory issues
            for i in range(0, len(entries_batch), self.batch_size):
                batch = entries_batch[i:i + self.batch_size]
                self.append_entries(batch)
        else:
            self.append_entries(entries_batch)
```

#### Raft Performance Optimizations for Amazon Scale

**Pipeline Optimization**:
```python
class PipelinedRaft(RaftNode):
    def __init__(self, node_id, cluster_nodes):
        super().__init__(node_id, cluster_nodes)
        self.pending_entries = {}  # Track in-flight entries
        self.max_pipeline_depth = 100
        
    def pipelined_append(self, entries):
        """Pipeline multiple append entries requests"""
        pipeline_id = self.generate_pipeline_id()
        self.pending_entries[pipeline_id] = {
            'entries': entries,
            'timestamp': time.time(),
            'acks_received': 0
        }
        
        # Send to all followers without waiting
        for follower in self.cluster_nodes:
            if follower != self.node_id:
                self.send_append_entries_async(follower, entries, pipeline_id)
    
    def handle_append_ack(self, follower_id, pipeline_id, success):
        """Handle asynchronous append entries acknowledgments"""
        if pipeline_id in self.pending_entries:
            if success:
                self.pending_entries[pipeline_id]['acks_received'] += 1
                
            # Check if majority achieved
            majority_threshold = (len(self.cluster_nodes) + 1) // 2
            if self.pending_entries[pipeline_id]['acks_received'] >= majority_threshold:
                self.commit_pipelined_entries(pipeline_id)
                del self.pending_entries[pipeline_id]
```

### PBFT (Practical Byzantine Fault Tolerance)

PBFT enables consensus in the presence of Byzantine failures, crucial for financial systems and blockchain applications.

#### PBFT Three-Phase Protocol

```python
class PBFTNode:
    def __init__(self, node_id, total_nodes):
        self.node_id = node_id
        self.total_nodes = total_nodes
        self.byzantine_threshold = (total_nodes - 1) // 3
        self.view_number = 0
        self.sequence_number = 0
        self.state = {}
        
        # Message logs for each phase
        self.pre_prepare_log = {}
        self.prepare_log = {}
        self.commit_log = {}
    
    def is_primary(self):
        """Determine if this node is the primary for current view"""
        return self.node_id == (self.view_number % self.total_nodes)
    
    def client_request(self, request):
        """Handle client request (primary only)"""
        if not self.is_primary():
            return False
        
        # Create pre-prepare message
        pre_prepare_msg = {
            'view': self.view_number,
            'sequence': self.sequence_number,
            'digest': self.compute_digest(request),
            'request': request
        }
        
        self.sequence_number += 1
        
        # Send pre-prepare to all backups
        self.broadcast_pre_prepare(pre_prepare_msg)
        return True
    
    def handle_pre_prepare(self, msg):
        """Handle pre-prepare message (backup nodes)"""
        if self.is_primary():
            return  # Primary doesn't process pre-prepare
        
        # Validate pre-prepare message
        if not self.validate_pre_prepare(msg):
            return
        
        # Store pre-prepare and send prepare
        key = (msg['view'], msg['sequence'])
        self.pre_prepare_log[key] = msg
        
        prepare_msg = {
            'view': msg['view'],
            'sequence': msg['sequence'],
            'digest': msg['digest'],
            'node_id': self.node_id
        }
        
        self.broadcast_prepare(prepare_msg)
    
    def handle_prepare(self, msg):
        """Handle prepare message"""
        key = (msg['view'], msg['sequence'])
        
        # Store prepare message
        if key not in self.prepare_log:
            self.prepare_log[key] = []
        self.prepare_log[key].append(msg)
        
        # Check if we have enough prepare messages (2f)
        if len(self.prepare_log[key]) >= 2 * self.byzantine_threshold:
            if self.prepared(msg['view'], msg['sequence'], msg['digest']):
                commit_msg = {
                    'view': msg['view'],
                    'sequence': msg['sequence'],
                    'digest': msg['digest'],
                    'node_id': self.node_id
                }
                self.broadcast_commit(commit_msg)
    
    def handle_commit(self, msg):
        """Handle commit message"""
        key = (msg['view'], msg['sequence'])
        
        # Store commit message
        if key not in self.commit_log:
            self.commit_log[key] = []
        self.commit_log[key].append(msg)
        
        # Check if we have enough commit messages (2f+1)
        if len(self.commit_log[key]) >= 2 * self.byzantine_threshold + 1:
            if self.committed_local(msg['view'], msg['sequence'], msg['digest']):
                self.execute_request(msg['view'], msg['sequence'])
    
    def prepared(self, view, sequence, digest):
        """Check if request is prepared"""
        key = (view, sequence)
        
        # Must have matching pre-prepare
        if key not in self.pre_prepare_log:
            return False
        
        pre_prepare = self.pre_prepare_log[key]
        if pre_prepare['digest'] != digest:
            return False
        
        # Must have 2f matching prepare messages
        if key not in self.prepare_log:
            return False
        
        matching_prepares = [p for p in self.prepare_log[key] if p['digest'] == digest]
        return len(matching_prepares) >= 2 * self.byzantine_threshold
    
    def committed_local(self, view, sequence, digest):
        """Check if request is committed locally"""
        return (self.prepared(view, sequence, digest) and 
                len([c for c in self.commit_log.get((view, sequence), []) 
                     if c['digest'] == digest]) >= 2 * self.byzantine_threshold + 1)
```

#### PBFT Optimizations for Production Systems

**Checkpoint Protocol**:
```python
class OptimizedPBFTNode(PBFTNode):
    def __init__(self, node_id, total_nodes):
        super().__init__(node_id, total_nodes)
        self.checkpoint_interval = 100
        self.checkpoints = {}
        self.stable_checkpoint = 0
        
    def should_checkpoint(self):
        """Determine if checkpointing is needed"""
        return self.sequence_number % self.checkpoint_interval == 0
    
    def create_checkpoint(self):
        """Create checkpoint of current state"""
        checkpoint_msg = {
            'sequence': self.sequence_number,
            'digest': self.compute_state_digest(),
            'node_id': self.node_id
        }
        
        self.checkpoints[self.sequence_number] = checkpoint_msg
        self.broadcast_checkpoint(checkpoint_msg)
    
    def garbage_collect(self):
        """Remove old messages after stable checkpoint"""
        # Remove messages older than stable checkpoint
        keys_to_remove = []
        for key in self.pre_prepare_log:
            if key[1] <= self.stable_checkpoint:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.pre_prepare_log[key]
            if key in self.prepare_log:
                del self.prepare_log[key]
            if key in self.commit_log:
                del self.commit_log[key]
```

---

## Distributed Locking Mechanisms

### Redlock Algorithm Implementation

Redlock provides distributed locking across multiple Redis instances, offering better fault tolerance than single-instance locking.

```python
import redis
import time
import random
import hashlib

class RedlockClient:
    def __init__(self, redis_nodes, retry_count=3, retry_delay=0.2, clock_drift_factor=0.01):
        self.redis_nodes = [redis.Redis(**node) for node in redis_nodes]
        self.retry_count = retry_count
        self.retry_delay = retry_delay
        self.clock_drift_factor = clock_drift_factor
        self.quorum = len(redis_nodes) // 2 + 1
    
    def acquire_lock(self, resource, ttl_ms, value=None):
        """Acquire distributed lock using Redlock algorithm"""
        if value is None:
            value = self._generate_lock_value()
        
        for _ in range(self.retry_count):
            start_time = time.time() * 1000  # milliseconds
            
            # Try to acquire lock on majority of instances
            locks_acquired = 0
            for redis_instance in self.redis_nodes:
                if self._acquire_single_lock(redis_instance, resource, value, ttl_ms):
                    locks_acquired += 1
            
            # Calculate elapsed time and drift
            elapsed_time = (time.time() * 1000) - start_time
            drift = (ttl_ms * self.clock_drift_factor) + 2
            
            # Check if we have majority and sufficient time remaining
            validity_time = ttl_ms - elapsed_time - drift
            
            if locks_acquired >= self.quorum and validity_time > 0:
                return {
                    'validity_time': validity_time,
                    'resource': resource,
                    'value': value
                }
            else:
                # Failed to acquire majority, release any acquired locks
                self.release_lock(resource, value)
                
                # Wait before retry
                time.sleep(random.uniform(0, self.retry_delay))
        
        return None
    
    def _acquire_single_lock(self, redis_instance, resource, value, ttl_ms):
        """Acquire lock on single Redis instance"""
        try:
            # Use SET with NX (not exist) and PX (expire in milliseconds)
            result = redis_instance.set(resource, value, nx=True, px=ttl_ms)
            return result is True
        except Exception:
            return False
    
    def release_lock(self, resource, value):
        """Release distributed lock"""
        release_script = """
        if redis.call("get",KEYS[1]) == ARGV[1] then
            return redis.call("del",KEYS[1])
        else
            return 0
        end
        """
        
        for redis_instance in self.redis_nodes:
            try:
                redis_instance.eval(release_script, 1, resource, value)
            except Exception:
                # Log but continue with other instances
                pass
    
    def _generate_lock_value(self):
        """Generate unique lock value"""
        return hashlib.sha256(
            f"{time.time()}{random.random()}".encode()
        ).hexdigest()

# Usage example for Amazon-scale distributed locking
class AmazonScaleDistributedLock:
    def __init__(self, redis_clusters):
        self.redis_clusters = redis_clusters
        self.redlock_clients = {}
        
        # Create Redlock client for each cluster region
        for region, nodes in redis_clusters.items():
            self.redlock_clients[region] = RedlockClient(nodes)
    
    def acquire_global_lock(self, resource, ttl_ms, preferred_region=None):
        """Acquire lock with regional preference"""
        regions = [preferred_region] if preferred_region else list(self.redlock_clients.keys())
        regions.extend([r for r in self.redlock_clients.keys() if r != preferred_region])
        
        for region in regions:
            client = self.redlock_clients[region]
            lock = client.acquire_lock(resource, ttl_ms)
            if lock:
                lock['region'] = region
                return lock
        
        return None
```

### ZooKeeper-based Distributed Locking

ZooKeeper provides strong consistency guarantees for distributed coordination.

```python
from kazoo.client import KazooClient
from kazoo.recipe.lock import Lock
import time

class ZooKeeperDistributedLock:
    def __init__(self, zk_hosts, timeout=10):
        self.zk_hosts = zk_hosts
        self.timeout = timeout
        self.client = None
        self.locks = {}
    
    def connect(self):
        """Establish ZooKeeper connection"""
        self.client = KazooClient(hosts=self.zk_hosts)
        self.client.start(timeout=self.timeout)
    
    def disconnect(self):
        """Close ZooKeeper connection"""
        if self.client:
            self.client.stop()
    
    def acquire_lock(self, lock_path, blocking=True, timeout=None):
        """Acquire distributed lock using ZooKeeper"""
        if not self.client:
            self.connect()
        
        # Ensure lock path exists
        self.client.ensure_path(f"/locks/{lock_path}")
        
        # Create lock object
        lock = Lock(self.client, f"/locks/{lock_path}")
        
        try:
            acquired = lock.acquire(blocking=blocking, timeout=timeout)
            if acquired:
                self.locks[lock_path] = lock
                return True
            return False
        except Exception as e:
            print(f"Failed to acquire lock {lock_path}: {e}")
            return False
    
    def release_lock(self, lock_path):
        """Release distributed lock"""
        if lock_path in self.locks:
            try:
                self.locks[lock_path].release()
                del self.locks[lock_path]
                return True
            except Exception as e:
                print(f"Failed to release lock {lock_path}: {e}")
                return False
        return False

# Advanced ZooKeeper patterns for Amazon scale
class HierarchicalLocking:
    def __init__(self, zk_client):
        self.zk_client = zk_client
    
    def acquire_hierarchical_lock(self, resource_hierarchy):
        """Acquire locks in hierarchical order to prevent deadlocks"""
        # Sort resources to ensure consistent ordering
        sorted_resources = sorted(resource_hierarchy)
        acquired_locks = []
        
        try:
            for resource in sorted_resources:
                lock = Lock(self.zk_client, f"/locks/{resource}")
                if lock.acquire(timeout=30):
                    acquired_locks.append(lock)
                else:
                    # Failed to acquire, release all and return False
                    for acquired_lock in acquired_locks:
                        acquired_lock.release()
                    return False
            
            return acquired_locks
        except Exception:
            # Release any acquired locks on error
            for lock in acquired_locks:
                try:
                    lock.release()
                except:
                    pass
            return False
```

### DynamoDB-based Distributed Locking

For AWS-native applications, DynamoDB provides a scalable locking mechanism.

```python
import boto3
import time
import uuid
from botocore.exceptions import ClientError

class DynamoDBDistributedLock:
    def __init__(self, table_name, region='us-east-1'):
        self.dynamodb = boto3.resource('dynamodb', region_name=region)
        self.table = self.dynamodb.Table(table_name)
        self.locks = {}
    
    def acquire_lock(self, lock_name, ttl_seconds=300, owner_id=None):
        """Acquire distributed lock using DynamoDB conditional writes"""
        if owner_id is None:
            owner_id = str(uuid.uuid4())
        
        current_time = int(time.time())
        expiry_time = current_time + ttl_seconds
        
        try:
            # Try to acquire lock with conditional write
            self.table.put_item(
                Item={
                    'lock_name': lock_name,
                    'owner_id': owner_id,
                    'acquired_time': current_time,
                    'expiry_time': expiry_time,
                    'ttl': expiry_time  # DynamoDB TTL attribute
                },
                ConditionExpression='attribute_not_exists(lock_name) OR expiry_time < :current_time',
                ExpressionAttributeValues={':current_time': current_time}
            )
            
            # Successfully acquired lock
            self.locks[lock_name] = {
                'owner_id': owner_id,
                'expiry_time': expiry_time
            }
            return owner_id
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                # Lock already held by another owner
                return None
            raise
    
    def release_lock(self, lock_name, owner_id):
        """Release distributed lock with ownership verification"""
        try:
            self.table.delete_item(
                Key={'lock_name': lock_name},
                ConditionExpression='owner_id = :owner_id',
                ExpressionAttributeValues={':owner_id': owner_id}
            )
            
            if lock_name in self.locks:
                del self.locks[lock_name]
            return True
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                # Lock not owned by this owner
                return False
            raise
    
    def extend_lock(self, lock_name, owner_id, additional_seconds=300):
        """Extend lock TTL for ongoing operations"""
        current_time = int(time.time())
        new_expiry = current_time + additional_seconds
        
        try:
            self.table.update_item(
                Key={'lock_name': lock_name},
                UpdateExpression='SET expiry_time = :new_expiry, ttl = :new_expiry',
                ConditionExpression='owner_id = :owner_id AND expiry_time > :current_time',
                ExpressionAttributeValues={
                    ':owner_id': owner_id,
                    ':current_time': current_time,
                    ':new_expiry': new_expiry
                }
            )
            
            if lock_name in self.locks:
                self.locks[lock_name]['expiry_time'] = new_expiry
            return True
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                return False
            raise

# Production-ready lock manager with retry and backoff
class ProductionLockManager:
    def __init__(self, dynamodb_lock, max_retries=3, base_delay=0.1):
        self.lock_client = dynamodb_lock
        self.max_retries = max_retries
        self.base_delay = base_delay
    
    def acquire_with_retry(self, lock_name, ttl_seconds=300):
        """Acquire lock with exponential backoff retry"""
        for attempt in range(self.max_retries + 1):
            owner_id = self.lock_client.acquire_lock(lock_name, ttl_seconds)
            if owner_id:
                return owner_id
            
            if attempt < self.max_retries:
                delay = self.base_delay * (2 ** attempt)
                time.sleep(delay)
        
        return None
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        # Release all held locks on context exit
        for lock_name, lock_info in list(self.lock_client.locks.items()):
            self.lock_client.release_lock(lock_name, lock_info['owner_id'])
```

---

## Vector Clocks and Logical Timestamps

Vector clocks enable partial ordering of events in distributed systems without requiring clock synchronization.

### Vector Clock Implementation

```python
class VectorClock:
    def __init__(self, node_id, initial_nodes=None):
        self.node_id = node_id
        self.clock = {}
        
        # Initialize with known nodes
        if initial_nodes:
            for node in initial_nodes:
                self.clock[node] = 0
        
        # Ensure own node is in clock
        self.clock[node_id] = 0
    
    def tick(self):
        """Increment local logical time"""
        self.clock[self.node_id] += 1
        return self.copy()
    
    def update(self, other_clock):
        """Update vector clock on message receipt"""
        # Increment local time
        self.clock[self.node_id] += 1
        
        # Update with maximum of each component
        for node_id, timestamp in other_clock.clock.items():
            if node_id != self.node_id:
                current_time = self.clock.get(node_id, 0)
                self.clock[node_id] = max(current_time, timestamp)
        
        return self.copy()
    
    def compare(self, other):
        """Compare two vector clocks for causality"""
        # Get all nodes from both clocks
        all_nodes = set(self.clock.keys()) | set(other.clock.keys())
        
        self_less = False
        other_less = False
        
        for node in all_nodes:
            self_time = self.clock.get(node, 0)
            other_time = other.clock.get(node, 0)
            
            if self_time < other_time:
                other_less = True
            elif self_time > other_time:
                self_less = True
        
        if self_less and not other_less:
            return "after"  # self happens after other
        elif other_less and not self_less:
            return "before"  # self happens before other
        elif not self_less and not other_less:
            return "equal"   # concurrent events
        else:
            return "concurrent"  # partial ordering
    
    def copy(self):
        """Create deep copy of vector clock"""
        new_clock = VectorClock(self.node_id)
        new_clock.clock = self.clock.copy()
        return new_clock
    
    def __str__(self):
        return f"VectorClock({self.node_id}): {self.clock}"

# Example usage in distributed system
class DistributedNode:
    def __init__(self, node_id, peers):
        self.node_id = node_id
        self.peers = peers
        self.vector_clock = VectorClock(node_id, [node_id] + peers)
        self.message_log = []
    
    def send_message(self, recipient, payload):
        """Send message with vector clock timestamp"""
        # Increment local time before sending
        timestamp = self.vector_clock.tick()
        
        message = {
            'sender': self.node_id,
            'recipient': recipient,
            'payload': payload,
            'timestamp': timestamp,
            'message_id': len(self.message_log)
        }
        
        self.message_log.append(message)
        return message
    
    def receive_message(self, message):
        """Receive message and update vector clock"""
        # Update vector clock with received timestamp
        self.vector_clock.update(message['timestamp'])
        
        # Process message
        self.process_message(message)
    
    def process_message(self, message):
        """Process received message (application-specific logic)"""
        print(f"Node {self.node_id} processed message: {message['payload']}")
        print(f"Updated vector clock: {self.vector_clock}")

# Amazon-scale vector clock optimizations
class CompressedVectorClock:
    def __init__(self, node_id, compression_threshold=100):
        self.node_id = node_id
        self.clock = {}
        self.compression_threshold = compression_threshold
    
    def compress(self):
        """Compress vector clock by removing inactive nodes"""
        # Keep only recently active nodes
        current_time = max(self.clock.values())
        threshold_time = current_time - self.compression_threshold
        
        compressed_clock = {
            node: timestamp 
            for node, timestamp in self.clock.items()
            if timestamp > threshold_time or node == self.node_id
        }
        
        self.clock = compressed_clock
    
    def should_compress(self):
        """Determine if compression is needed"""
        return len(self.clock) > self.compression_threshold
```

---

## CRDT (Conflict-Free Replicated Data Types)

CRDTs enable eventual consistency without requiring coordination, perfect for distributed systems with network partitions.

### G-Counter (Grow-only Counter) CRDT

```python
class GCounter:
    """Grow-only Counter CRDT implementation"""
    
    def __init__(self, node_id):
        self.node_id = node_id
        self.counters = {node_id: 0}
    
    def increment(self, value=1):
        """Increment counter for this node"""
        self.counters[self.node_id] = self.counters.get(self.node_id, 0) + value
    
    def value(self):
        """Get current counter value (sum of all node counters)"""
        return sum(self.counters.values())
    
    def merge(self, other):
        """Merge with another G-Counter (commutative, associative, idempotent)"""
        # Take maximum value for each node
        all_nodes = set(self.counters.keys()) | set(other.counters.keys())
        
        merged = GCounter(self.node_id)
        for node in all_nodes:
            self_value = self.counters.get(node, 0)
            other_value = other.counters.get(node, 0)
            merged.counters[node] = max(self_value, other_value)
        
        return merged
    
    def compare(self, other):
        """Compare two G-Counters for partial ordering"""
        all_nodes = set(self.counters.keys()) | set(other.counters.keys())
        
        self_dominates = True
        other_dominates = True
        
        for node in all_nodes:
            self_value = self.counters.get(node, 0)
            other_value = other.counters.get(node, 0)
            
            if self_value < other_value:
                self_dominates = False
            if self_value > other_value:
                other_dominates = False
        
        if self_dominates and other_dominates:
            return "equal"
        elif self_dominates:
            return "dominates"
        elif other_dominates:
            return "dominated"
        else:
            return "concurrent"

# PN-Counter (Increment/Decrement Counter)
class PNCounter:
    """PN-Counter CRDT for increment and decrement operations"""
    
    def __init__(self, node_id):
        self.node_id = node_id
        self.positive = GCounter(node_id)
        self.negative = GCounter(node_id)
    
    def increment(self, value=1):
        """Increment counter"""
        self.positive.increment(value)
    
    def decrement(self, value=1):
        """Decrement counter"""
        self.negative.increment(value)
    
    def value(self):
        """Get current counter value"""
        return self.positive.value() - self.negative.value()
    
    def merge(self, other):
        """Merge with another PN-Counter"""
        merged = PNCounter(self.node_id)
        merged.positive = self.positive.merge(other.positive)
        merged.negative = self.negative.merge(other.negative)
        return merged

# G-Set (Grow-only Set) CRDT
class GSet:
    """Grow-only Set CRDT"""
    
    def __init__(self):
        self.elements = set()
    
    def add(self, element):
        """Add element to set"""
        self.elements.add(element)
    
    def contains(self, element):
        """Check if element is in set"""
        return element in self.elements
    
    def merge(self, other):
        """Merge with another G-Set"""
        merged = GSet()
        merged.elements = self.elements | other.elements
        return merged
    
    def __iter__(self):
        return iter(self.elements)
    
    def __len__(self):
        return len(self.elements)

# LWW-Register (Last-Write-Wins Register) CRDT
class LWWRegister:
    """Last-Write-Wins Register CRDT"""
    
    def __init__(self, initial_value=None, timestamp=0):
        self.value = initial_value
        self.timestamp = timestamp
    
    def assign(self, value, timestamp):
        """Assign value with timestamp"""
        if timestamp > self.timestamp:
            self.value = value
            self.timestamp = timestamp
        elif timestamp == self.timestamp:
            # Use deterministic tie-breaking (e.g., lexicographic order)
            if str(value) > str(self.value):
                self.value = value
    
    def get(self):
        """Get current value"""
        return self.value
    
    def merge(self, other):
        """Merge with another LWW-Register"""
        merged = LWWRegister()
        
        if self.timestamp > other.timestamp:
            merged.value = self.value
            merged.timestamp = self.timestamp
        elif other.timestamp > self.timestamp:
            merged.value = other.value
            merged.timestamp = other.timestamp
        else:
            # Timestamps equal, use deterministic tie-breaking
            if str(self.value) > str(other.value):
                merged.value = self.value
                merged.timestamp = self.timestamp
            else:
                merged.value = other.value
                merged.timestamp = other.timestamp
        
        return merged

# OR-Set (Observed-Remove Set) CRDT for add/remove operations
class ORSet:
    """Observed-Remove Set CRDT supporting both add and remove operations"""
    
    def __init__(self):
        self.added = {}  # element -> set of unique tags
        self.removed = set()  # set of removed tags
    
    def add(self, element, tag=None):
        """Add element with unique tag"""
        if tag is None:
            tag = self._generate_unique_tag()
        
        if element not in self.added:
            self.added[element] = set()
        
        self.added[element].add(tag)
        return tag
    
    def remove(self, element):
        """Remove element by marking all its tags as removed"""
        if element in self.added:
            # Mark all current tags for this element as removed
            for tag in self.added[element]:
                self.removed.add(tag)
    
    def contains(self, element):
        """Check if element is in set"""
        if element not in self.added:
            return False
        
        # Element exists if it has at least one tag not in removed set
        return bool(self.added[element] - self.removed)
    
    def merge(self, other):
        """Merge with another OR-Set"""
        merged = ORSet()
        
        # Merge added elements
        all_elements = set(self.added.keys()) | set(other.added.keys())
        for element in all_elements:
            self_tags = self.added.get(element, set())
            other_tags = other.added.get(element, set())
            merged.added[element] = self_tags | other_tags
        
        # Merge removed tags
        merged.removed = self.removed | other.removed
        
        return merged
    
    def _generate_unique_tag(self):
        """Generate unique tag for element"""
        import uuid
        return str(uuid.uuid4())

# Amazon-scale CRDT optimization example
class OptimizedORSet(ORSet):
    def __init__(self, compression_threshold=1000):
        super().__init__()
        self.compression_threshold = compression_threshold
        self.version = 0
    
    def compress(self):
        """Compress CRDT state by garbage collecting removed elements"""
        # Remove elements that are fully removed
        elements_to_remove = []
        
        for element, tags in self.added.items():
            if tags.issubset(self.removed):
                elements_to_remove.append(element)
        
        for element in elements_to_remove:
            del self.added[element]
        
        # Clean up old removed tags
        active_tags = set()
        for tags in self.added.values():
            active_tags.update(tags)
        
        self.removed = self.removed & active_tags
        self.version += 1
    
    def should_compress(self):
        """Determine if compression is needed"""
        return len(self.removed) > self.compression_threshold
```

---

## Byzantine Fault Tolerance Patterns

Byzantine fault tolerance is crucial for systems that must operate correctly despite arbitrary failures, including malicious behavior.

### Byzantine Quorum Systems

```python
class ByzantineQuorum:
    """Byzantine fault tolerant quorum system"""
    
    def __init__(self, total_nodes, byzantine_nodes):
        self.total_nodes = total_nodes
        self.byzantine_nodes = byzantine_nodes
        self.fault_threshold = byzantine_nodes
        
        # Byzantine quorum requirements
        self.read_quorum = byzantine_nodes + 1
        self.write_quorum = byzantine_nodes + 1
        
        # Validate configuration
        if total_nodes < 3 * byzantine_nodes + 1:
            raise ValueError("Need at least 3f+1 nodes for f Byzantine failures")
    
    def can_tolerate_failures(self, failed_nodes):
        """Check if system can tolerate given number of failures"""
        return failed_nodes <= self.fault_threshold
    
    def minimum_responses_needed(self, operation_type):
        """Get minimum responses needed for operation"""
        if operation_type == "read":
            return self.read_quorum
        elif operation_type == "write":
            return self.write_quorum
        else:
            raise ValueError("Unknown operation type")

# Byzantine Agreement Protocol
class ByzantineAgreement:
    """Byzantine Agreement implementation using authenticated messages"""
    
    def __init__(self, node_id, total_nodes, private_key, public_keys):
        self.node_id = node_id
        self.total_nodes = total_nodes
        self.byzantine_threshold = (total_nodes - 1) // 3
        self.private_key = private_key
        self.public_keys = public_keys  # Map of node_id -> public_key
        
        self.proposals = {}
        self.votes = {}
        self.decisions = {}
    
    def propose_value(self, round_id, value):
        """Propose a value for Byzantine agreement"""
        # Create signed proposal
        proposal = {
            'round_id': round_id,
            'value': value,
            'proposer': self.node_id,
            'timestamp': time.time()
        }
        
        signature = self._sign_message(proposal)
        signed_proposal = {
            'proposal': proposal,
            'signature': signature
        }
        
        # Broadcast to all nodes
        self._broadcast_proposal(signed_proposal)
        return signed_proposal
    
    def handle_proposal(self, signed_proposal):
        """Handle received proposal"""
        proposal = signed_proposal['proposal']
        signature = signed_proposal['signature']
        
        # Verify signature
        if not self._verify_signature(proposal, signature, proposal['proposer']):
            return False
        
        round_id = proposal['round_id']
        if round_id not in self.proposals:
            self.proposals[round_id] = []
        
        self.proposals[round_id].append(signed_proposal)
        
        # Check if we have enough proposals to vote
        if len(self.proposals[round_id]) >= self.byzantine_threshold + 1:
            self._vote_on_proposals(round_id)
    
    def _vote_on_proposals(self, round_id):
        """Vote on received proposals"""
        proposals = self.proposals[round_id]
        
        # Simple majority voting (can be enhanced with more sophisticated logic)
        value_counts = {}
        for signed_proposal in proposals:
            value = signed_proposal['proposal']['value']
            value_counts[value] = value_counts.get(value, 0) + 1
        
        # Vote for most frequent value
        if value_counts:
            chosen_value = max(value_counts, key=value_counts.get)
            
            vote = {
                'round_id': round_id,
                'value': chosen_value,
                'voter': self.node_id,
                'timestamp': time.time()
            }
            
            signature = self._sign_message(vote)
            signed_vote = {
                'vote': vote,
                'signature': signature
            }
            
            self._broadcast_vote(signed_vote)
    
    def handle_vote(self, signed_vote):
        """Handle received vote"""
        vote = signed_vote['vote']
        signature = signed_vote['signature']
        
        # Verify signature
        if not self._verify_signature(vote, signature, vote['voter']):
            return False
        
        round_id = vote['round_id']
        if round_id not in self.votes:
            self.votes[round_id] = []
        
        self.votes[round_id].append(signed_vote)
        
        # Check if we have enough votes to decide
        if len(self.votes[round_id]) >= 2 * self.byzantine_threshold + 1:
            self._make_decision(round_id)
    
    def _make_decision(self, round_id):
        """Make final decision based on votes"""
        votes = self.votes[round_id]
        
        # Count votes for each value
        value_counts = {}
        for signed_vote in votes:
            value = signed_vote['vote']['value']
            value_counts[value] = value_counts.get(value, 0) + 1
        
        # Decision requires more than 2f+1 votes
        threshold = 2 * self.byzantine_threshold + 1
        for value, count in value_counts.items():
            if count >= threshold:
                self.decisions[round_id] = value
                return value
        
        return None
    
    def _sign_message(self, message):
        """Sign message with private key"""
        # Simplified signing - use proper cryptographic library in production
        import hashlib
        import hmac
        
        message_hash = hashlib.sha256(str(message).encode()).hexdigest()
        return hmac.new(self.private_key.encode(), message_hash.encode(), hashlib.sha256).hexdigest()
    
    def _verify_signature(self, message, signature, signer_node_id):
        """Verify message signature"""
        if signer_node_id not in self.public_keys:
            return False
        
        public_key = self.public_keys[signer_node_id]
        expected_signature = self._sign_message_with_key(message, public_key)
        return hmac.compare_digest(signature, expected_signature)
    
    def _sign_message_with_key(self, message, key):
        """Sign message with given key"""
        import hashlib
        import hmac
        
        message_hash = hashlib.sha256(str(message).encode()).hexdigest()
        return hmac.new(key.encode(), message_hash.encode(), hashlib.sha256).hexdigest()
```

### Byzantine Fault Tolerant State Machine

```python
class ByzantineFaultTolerantStateMachine:
    """State machine that tolerates Byzantine failures"""
    
    def __init__(self, node_id, total_nodes, initial_state=None):
        self.node_id = node_id
        self.total_nodes = total_nodes
        self.byzantine_threshold = (total_nodes - 1) // 3
        self.state = initial_state or {}
        self.operation_log = []
        self.checkpoints = {}
        
    def execute_operation(self, operation, byzantine_agreement):
        """Execute operation using Byzantine agreement"""
        # Propose operation through Byzantine agreement
        round_id = len(self.operation_log)
        proposal_result = byzantine_agreement.propose_value(round_id, operation)
        
        if proposal_result:
            # Wait for agreement to complete
            agreed_operation = self._wait_for_agreement(byzantine_agreement, round_id)
            
            if agreed_operation:
                # Apply agreed operation to state
                self._apply_operation(agreed_operation)
                self.operation_log.append(agreed_operation)
                return True
        
        return False
    
    def _apply_operation(self, operation):
        """Apply operation to state machine"""
        op_type = operation.get('type')
        
        if op_type == 'set':
            key = operation['key']
            value = operation['value']
            self.state[key] = value
        elif op_type == 'delete':
            key = operation['key']
            if key in self.state:
                del self.state[key]
        elif op_type == 'increment':
            key = operation['key']
            delta = operation.get('delta', 1)
            self.state[key] = self.state.get(key, 0) + delta
    
    def create_checkpoint(self):
        """Create checkpoint of current state"""
        checkpoint_id = len(self.operation_log)
        self.checkpoints[checkpoint_id] = {
            'state': self.state.copy(),
            'operation_count': len(self.operation_log),
            'timestamp': time.time()
        }
        
        # Garbage collect old checkpoints
        if len(self.checkpoints) > 10:
            oldest_checkpoint = min(self.checkpoints.keys())
            del self.checkpoints[oldest_checkpoint]
    
    def recover_from_checkpoint(self, checkpoint_id):
        """Recover state from checkpoint"""
        if checkpoint_id in self.checkpoints:
            checkpoint = self.checkpoints[checkpoint_id]
            self.state = checkpoint['state'].copy()
            
            # Replay operations after checkpoint
            start_index = checkpoint['operation_count']
            for i in range(start_index, len(self.operation_log)):
                self._apply_operation(self.operation_log[i])
    
    def _wait_for_agreement(self, byzantine_agreement, round_id, timeout=30):
        """Wait for Byzantine agreement to complete"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if round_id in byzantine_agreement.decisions:
                return byzantine_agreement.decisions[round_id]
            time.sleep(0.1)
        
        return None
```

---

## Advanced Consistency Models

Understanding consistency models is crucial for designing distributed systems that meet specific application requirements.

### Consistency Model Implementations

```python
# Eventual Consistency with Conflict Resolution
class EventualConsistencyStore:
    def __init__(self, node_id, conflict_resolver=None):
        self.node_id = node_id
        self.data = {}
        self.vector_clock = VectorClock(node_id)
        self.conflict_resolver = conflict_resolver or self._default_resolver
    
    def put(self, key, value):
        """Put operation with timestamp"""
        timestamp = self.vector_clock.tick()
        
        version = {
            'value': value,
            'timestamp': timestamp,
            'node_id': self.node_id
        }
        
        if key not in self.data:
            self.data[key] = []
        
        self.data[key].append(version)
        return version
    
    def get(self, key):
        """Get operation with conflict resolution"""
        if key not in self.data:
            return None
        
        versions = self.data[key]
        if len(versions) == 1:
            return versions[0]['value']
        
        # Resolve conflicts
        return self.conflict_resolver(versions)
    
    def merge(self, other_store):
        """Merge with another store"""
        for key, other_versions in other_store.data.items():
            if key not in self.data:
                self.data[key] = []
            
            # Merge versions and resolve conflicts
            all_versions = self.data[key] + other_versions
            self.data[key] = self._deduplicate_versions(all_versions)
        
        # Update vector clock
        self.vector_clock.update(other_store.vector_clock)
    
    def _default_resolver(self, versions):
        """Default last-writer-wins conflict resolution"""
        latest_version = max(versions, key=lambda v: v['timestamp'].clock[v['node_id']])
        return latest_version['value']
    
    def _deduplicate_versions(self, versions):
        """Remove duplicate versions"""
        seen = set()
        unique_versions = []
        
        for version in versions:
            version_key = (version['node_id'], version['timestamp'].clock[version['node_id']])
            if version_key not in seen:
                seen.add(version_key)
                unique_versions.append(version)
        
        return unique_versions

# Causal Consistency Implementation
class CausalConsistencyStore:
    def __init__(self, node_id):
        self.node_id = node_id
        self.data = {}
        self.vector_clock = VectorClock(node_id)
        self.causal_dependencies = {}  # operation_id -> vector_clock
    
    def put(self, key, value, depends_on=None):
        """Put with causal dependencies"""
        # Update vector clock for this operation
        operation_clock = self.vector_clock.tick()
        
        # Track causal dependencies
        dependencies = []
        if depends_on:
            for dep_op_id in depends_on:
                if dep_op_id in self.causal_dependencies:
                    dependencies.append(self.causal_dependencies[dep_op_id])
        
        operation_id = f"{self.node_id}:{operation_clock.clock[self.node_id]}"
        
        self.data[key] = {
            'value': value,
            'operation_id': operation_id,
            'timestamp': operation_clock,
            'dependencies': dependencies
        }
        
        self.causal_dependencies[operation_id] = operation_clock.copy()
        return operation_id
    
    def get(self, key):
        """Get operation respecting causal ordering"""
        if key not in self.data:
            return None
        
        entry = self.data[key]
        
        # Check if all causal dependencies are satisfied
        if self._dependencies_satisfied(entry['dependencies']):
            return entry['value']
        else:
            # Dependencies not satisfied yet
            return None
    
    def _dependencies_satisfied(self, dependencies):
        """Check if all causal dependencies are satisfied"""
        for dep_clock in dependencies:
            # Check if this node has progressed past the dependency
            if not self._clock_satisfies_dependency(self.vector_clock, dep_clock):
                return False
        return True
    
    def _clock_satisfies_dependency(self, current_clock, dependency_clock):
        """Check if current clock satisfies dependency"""
        for node_id, dep_time in dependency_clock.clock.items():
            current_time = current_clock.clock.get(node_id, 0)
            if current_time < dep_time:
                return False
        return True

# Sequential Consistency Implementation
class SequentialConsistencyStore:
    def __init__(self, node_id):
        self.node_id = node_id
        self.data = {}
        self.global_sequence = []
        self.local_sequence_number = 0
        self.pending_operations = []
    
    def put(self, key, value):
        """Put operation with sequential consistency"""
        self.local_sequence_number += 1
        
        operation = {
            'type': 'put',
            'key': key,
            'value': value,
            'node_id': self.node_id,
            'local_seq': self.local_sequence_number,
            'timestamp': time.time()
        }
        
        # Add to pending operations
        self.pending_operations.append(operation)
        
        # Try to order operations globally
        self._process_pending_operations()
        
        return operation
    
    def get(self, key):
        """Get operation with sequential consistency"""
        # Process any pending operations first
        self._process_pending_operations()
        
        return self.data.get(key)
    
    def _process_pending_operations(self):
        """Process pending operations in global sequential order"""
        # Sort pending operations by timestamp (simplified ordering)
        self.pending_operations.sort(key=lambda op: (op['timestamp'], op['node_id']))
        
        # Apply operations in order
        for operation in self.pending_operations:
            if operation['type'] == 'put':
                self.data[operation['key']] = operation['value']
            
            self.global_sequence.append(operation)
        
        # Clear pending operations
        self.pending_operations.clear()
```

This comprehensive module provides the advanced distributed systems concepts essential for Amazon L6/L7 system design interviews. Each concept includes production-ready implementations with optimizations for Amazon-scale systems.

Key takeaways:
- Consensus algorithms (Raft, PBFT) provide strong consistency guarantees
- Distributed locking enables coordination across services
- Vector clocks and CRDTs enable conflict-free distributed computing
- Byzantine fault tolerance handles arbitrary failures including malicious behavior
- Different consistency models offer trade-offs between performance and correctness

These concepts form the foundation for designing robust, scalable distributed systems that can handle Amazon's massive scale and stringent reliability requirements.