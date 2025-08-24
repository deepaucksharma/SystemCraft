# System-Scale Algorithms for Amazon L6/L7 Engineering Managers

!!! info "System-Scale Algorithm Mastery for Engineering Managers"
    This module covers system-scale algorithms essential for L6/L7 engineering managers working with distributed systems, focusing on practical applications in large-scale infrastructure, load balancing, and system optimization.

## Framework for System-Scale Algorithm Mastery

### Strategic Understanding for Engineering Leaders
```markdown
**L6/L7 Manager Focus:**
- Understanding algorithmic approaches to system scalability challenges
- Making informed decisions about distributed system architecture
- Evaluating trade-offs between consistency, availability, and partition tolerance
- Guiding teams on algorithmic solutions for performance bottlenecks
- Connecting algorithm choices to business requirements and operational costs

**Key System-Scale Concepts:**
- Consistent hashing for horizontal scaling
- Load balancing algorithms for traffic distribution
- Rate limiting algorithms for system protection
- Probabilistic data structures for large-scale approximations
- Distributed consensus algorithms for coordination
```

---

## Category 1: Consistent Hashing and Distribution

### Consistent Hashing with Virtual Nodes

**Core Implementation with Advanced Features:**
```python
import hashlib
import bisect
import random
from typing import Dict, List, Tuple, Set, Optional, Any
from collections import defaultdict, Counter
import time

class ConsistentHashRing:
    """Advanced consistent hashing implementation with virtual nodes."""
    
    def __init__(self, nodes: List[str] = None, virtual_nodes: int = 150, 
                 hash_function: str = 'md5'):
        """
        Initialize consistent hash ring.
        
        Args:
            nodes: Initial list of server nodes
            virtual_nodes: Number of virtual nodes per physical node
            hash_function: Hash function to use ('md5', 'sha1', 'sha256')
        """
        self.virtual_nodes = virtual_nodes
        self.hash_function = hash_function
        self.ring = {}  # hash_value -> (node, virtual_node_id)
        self.nodes = set()
        self.node_weights = {}  # node -> weight (for weighted consistent hashing)
        self._hash_func = self._get_hash_function(hash_function)
        
        # Metrics tracking
        self.metrics = {
            'total_keys_distributed': 0,
            'node_key_counts': defaultdict(int),
            'rebalance_operations': 0
        }
        
        if nodes:
            for node in nodes:
                self.add_node(node)
    
    def _get_hash_function(self, name: str):
        """Get hash function by name."""
        functions = {
            'md5': hashlib.md5,
            'sha1': hashlib.sha1,
            'sha256': hashlib.sha256
        }
        return functions.get(name, hashlib.md5)
    
    def _hash(self, key: str) -> int:
        """Generate hash value for key."""
        return int(self._hash_func(key.encode('utf-8')).hexdigest(), 16)
    
    def add_node(self, node: str, weight: float = 1.0) -> Dict[str, Any]:
        """
        Add node to the ring with optional weighting.
        Returns rebalancing metrics.
        """
        if node in self.nodes:
            return {"error": f"Node {node} already exists"}
        
        self.nodes.add(node)
        self.node_weights[node] = weight
        
        # Calculate virtual nodes based on weight
        virtual_count = int(self.virtual_nodes * weight)
        
        # Add virtual nodes to ring
        for i in range(virtual_count):
            virtual_key = f"{node}:{i}"
            hash_value = self._hash(virtual_key)
            self.ring[hash_value] = (node, i)
        
        # Sort ring for efficient lookups
        self._sorted_hashes = sorted(self.ring.keys())
        
        self.metrics['rebalance_operations'] += 1
        
        return {
            "node_added": node,
            "virtual_nodes_created": virtual_count,
            "total_virtual_nodes": len(self.ring),
            "ring_size": len(self._sorted_hashes)
        }
    
    def remove_node(self, node: str) -> Dict[str, Any]:
        """Remove node from the ring and return rebalancing info."""
        if node not in self.nodes:
            return {"error": f"Node {node} not found"}
        
        # Count keys that need to be redistributed
        keys_to_redistribute = self.metrics['node_key_counts'][node]
        
        # Remove all virtual nodes for this physical node
        to_remove = [hash_val for hash_val, (n, _) in self.ring.items() if n == node]
        
        for hash_val in to_remove:
            del self.ring[hash_val]
        
        self.nodes.remove(node)
        del self.node_weights[node]
        del self.metrics['node_key_counts'][node]
        
        # Update sorted hashes
        self._sorted_hashes = sorted(self.ring.keys())
        
        self.metrics['rebalance_operations'] += 1
        
        return {
            "node_removed": node,
            "virtual_nodes_removed": len(to_remove),
            "keys_redistributed": keys_to_redistribute,
            "remaining_nodes": len(self.nodes)
        }
    
    def get_node(self, key: str) -> Tuple[str, Dict[str, Any]]:
        """
        Get the node responsible for a key.
        Returns tuple of (node, metadata).
        """
        if not self.ring:
            raise ValueError("No nodes available in the ring")
        
        hash_value = self._hash(key)
        
        # Find the first node clockwise from the hash
        idx = bisect.bisect_right(self._sorted_hashes, hash_value)
        
        # Wrap around if necessary
        if idx == len(self._sorted_hashes):
            idx = 0
        
        chosen_hash = self._sorted_hashes[idx]
        node, virtual_id = self.ring[chosen_hash]
        
        # Update metrics
        self.metrics['total_keys_distributed'] += 1
        self.metrics['node_key_counts'][node] += 1
        
        metadata = {
            "hash_value": hash_value,
            "chosen_hash": chosen_hash,
            "virtual_node_id": virtual_id,
            "node_weight": self.node_weights[node]
        }
        
        return node, metadata
    
    def get_nodes_for_replication(self, key: str, replica_count: int = 3) -> List[str]:
        """
        Get multiple nodes for key replication.
        Returns list of nodes in preference order.
        """
        if replica_count > len(self.nodes):
            replica_count = len(self.nodes)
        
        hash_value = self._hash(key)
        idx = bisect.bisect_right(self._sorted_hashes, hash_value)
        
        selected_nodes = []
        seen_physical_nodes = set()
        
        # Walk clockwise around the ring
        for _ in range(len(self._sorted_hashes)):
            if idx >= len(self._sorted_hashes):
                idx = 0
            
            chosen_hash = self._sorted_hashes[idx]
            node, _ = self.ring[chosen_hash]
            
            if node not in seen_physical_nodes:
                selected_nodes.append(node)
                seen_physical_nodes.add(node)
                
                if len(selected_nodes) >= replica_count:
                    break
            
            idx += 1
        
        return selected_nodes
    
    def analyze_distribution(self) -> Dict[str, Any]:
        """Analyze key distribution across nodes."""
        if not self.nodes:
            return {"error": "No nodes in ring"}
        
        total_keys = self.metrics['total_keys_distributed']
        if total_keys == 0:
            return {"warning": "No keys have been distributed yet"}
        
        node_percentages = {}
        for node in self.nodes:
            count = self.metrics['node_key_counts'][node]
            node_percentages[node] = (count / total_keys) * 100
        
        # Calculate distribution statistics
        percentages = list(node_percentages.values())
        avg_percentage = sum(percentages) / len(percentages)
        max_deviation = max(abs(p - avg_percentage) for p in percentages)
        
        return {
            "total_keys": total_keys,
            "node_distributions": node_percentages,
            "average_percentage": avg_percentage,
            "max_deviation": max_deviation,
            "distribution_quality": "GOOD" if max_deviation < 10 else "POOR",
            "virtual_nodes_per_physical": {
                node: sum(1 for n, _ in self.ring.values() if n == node)
                for node in self.nodes
            }
        }
    
    def simulate_node_failure(self, failed_node: str) -> Dict[str, Any]:
        """Simulate node failure and analyze impact."""
        if failed_node not in self.nodes:
            return {"error": f"Node {failed_node} not found"}
        
        # Keys currently on the failed node
        keys_affected = self.metrics['node_key_counts'][failed_node]
        
        # Temporarily remove the node
        original_ring = self.ring.copy()
        original_sorted = self._sorted_hashes.copy()
        
        removal_result = self.remove_node(failed_node)
        
        # Analyze where keys would be redistributed
        redistribution_map = defaultdict(int)
        
        # Simulate redistribution (simplified - assumes even distribution)
        remaining_nodes = list(self.nodes)
        if remaining_nodes:
            keys_per_node = keys_affected // len(remaining_nodes)
            remainder = keys_affected % len(remaining_nodes)
            
            for i, node in enumerate(remaining_nodes):
                redistribution_map[node] = keys_per_node
                if i < remainder:
                    redistribution_map[node] += 1
        
        # Restore the ring
        self.ring = original_ring
        self._sorted_hashes = original_sorted
        self.nodes.add(failed_node)
        self.node_weights[failed_node] = self.node_weights.get(failed_node, 1.0)
        self.metrics['node_key_counts'][failed_node] = keys_affected
        
        return {
            "failed_node": failed_node,
            "keys_affected": keys_affected,
            "redistribution_map": dict(redistribution_map),
            "max_additional_load": max(redistribution_map.values()) if redistribution_map else 0,
            "impact_percentage": (keys_affected / self.metrics['total_keys_distributed'] * 100) if self.metrics['total_keys_distributed'] > 0 else 0
        }

class LoadBalancerAlgorithms:
    """Advanced load balancing algorithms for distributed systems."""
    
    def __init__(self):
        self.servers = {}  # server_id -> {capacity, current_load, weight, health_score}
        self.request_history = []  # For weighted algorithms
        self.algorithms = {
            'round_robin': self._round_robin,
            'weighted_round_robin': self._weighted_round_robin,
            'least_connections': self._least_connections,
            'weighted_least_connections': self._weighted_least_connections,
            'least_response_time': self._least_response_time,
            'ip_hash': self._ip_hash,
            'consistent_hash': self._consistent_hash
        }
        self.current_rr_index = 0
        self.consistent_hash = None
        self.server_response_times = defaultdict(list)  # server -> [response_times]
        
    def add_server(self, server_id: str, capacity: int = 100, weight: float = 1.0, 
                   health_score: float = 1.0):
        """Add server to load balancer."""
        self.servers[server_id] = {
            'capacity': capacity,
            'current_load': 0,
            'weight': weight,
            'health_score': health_score,
            'total_requests': 0,
            'failed_requests': 0
        }
        
        # Rebuild consistent hash ring if using that algorithm
        if self.consistent_hash:
            self.consistent_hash.add_node(server_id, weight)
    
    def remove_server(self, server_id: str):
        """Remove server from load balancer."""
        if server_id in self.servers:
            del self.servers[server_id]
            if self.consistent_hash:
                self.consistent_hash.remove_node(server_id)
    
    def update_server_load(self, server_id: str, load_delta: int):
        """Update server current load."""
        if server_id in self.servers:
            self.servers[server_id]['current_load'] += load_delta
            self.servers[server_id]['current_load'] = max(0, self.servers[server_id]['current_load'])
    
    def record_response_time(self, server_id: str, response_time: float):
        """Record response time for server."""
        if server_id in self.servers:
            self.server_response_times[server_id].append(response_time)
            # Keep only last 100 response times
            if len(self.server_response_times[server_id]) > 100:
                self.server_response_times[server_id].pop(0)
    
    def select_server(self, algorithm: str = 'round_robin', 
                     client_ip: str = None, request_key: str = None) -> Tuple[str, Dict]:
        """
        Select server using specified algorithm.
        Returns (server_id, selection_metadata).
        """
        if not self.servers:
            raise ValueError("No servers available")
        
        # Filter healthy servers
        healthy_servers = {
            srv_id: srv_data for srv_id, srv_data in self.servers.items()
            if srv_data['health_score'] > 0.1 and srv_data['current_load'] < srv_data['capacity']
        }
        
        if not healthy_servers:
            # Fallback to all servers if none are healthy
            healthy_servers = self.servers
        
        if algorithm not in self.algorithms:
            algorithm = 'round_robin'
        
        selected_server = self.algorithms[algorithm](healthy_servers, client_ip, request_key)
        
        # Update server metrics
        if selected_server:
            self.servers[selected_server]['total_requests'] += 1
        
        metadata = {
            'algorithm': algorithm,
            'healthy_servers_count': len(healthy_servers),
            'total_servers_count': len(self.servers),
            'server_load': self.servers[selected_server]['current_load'] if selected_server else 0
        }
        
        return selected_server, metadata
    
    def _round_robin(self, servers: Dict, client_ip: str, request_key: str) -> str:
        """Round robin algorithm."""
        server_list = list(servers.keys())
        selected = server_list[self.current_rr_index % len(server_list)]
        self.current_rr_index += 1
        return selected
    
    def _weighted_round_robin(self, servers: Dict, client_ip: str, request_key: str) -> str:
        """Weighted round robin algorithm."""
        # Create weighted list
        weighted_servers = []
        for server_id, server_data in servers.items():
            weight = max(1, int(server_data['weight'] * server_data['health_score']))
            weighted_servers.extend([server_id] * weight)
        
        if not weighted_servers:
            return list(servers.keys())[0]
        
        selected = weighted_servers[self.current_rr_index % len(weighted_servers)]
        self.current_rr_index += 1
        return selected
    
    def _least_connections(self, servers: Dict, client_ip: str, request_key: str) -> str:
        """Least connections algorithm."""
        return min(servers.keys(), key=lambda srv: servers[srv]['current_load'])
    
    def _weighted_least_connections(self, servers: Dict, client_ip: str, request_key: str) -> str:
        """Weighted least connections algorithm."""
        def connection_ratio(server_id):
            server_data = servers[server_id]
            weight = server_data['weight'] * server_data['health_score']
            if weight <= 0:
                return float('inf')
            return server_data['current_load'] / weight
        
        return min(servers.keys(), key=connection_ratio)
    
    def _least_response_time(self, servers: Dict, client_ip: str, request_key: str) -> str:
        """Least response time algorithm."""
        def avg_response_time(server_id):
            response_times = self.server_response_times.get(server_id, [1.0])
            return sum(response_times) / len(response_times)
        
        return min(servers.keys(), key=avg_response_time)
    
    def _ip_hash(self, servers: Dict, client_ip: str, request_key: str) -> str:
        """IP hash algorithm for session affinity."""
        if not client_ip:
            return self._round_robin(servers, client_ip, request_key)
        
        hash_value = hash(client_ip)
        server_list = sorted(servers.keys())  # Ensure consistent ordering
        return server_list[hash_value % len(server_list)]
    
    def _consistent_hash(self, servers: Dict, client_ip: str, request_key: str) -> str:
        """Consistent hash algorithm."""
        if not self.consistent_hash:
            self.consistent_hash = ConsistentHashRing(list(servers.keys()))
        
        key = request_key or client_ip or f"request_{time.time()}"
        selected_server, _ = self.consistent_hash.get_node(key)
        
        # Ensure selected server is still healthy
        if selected_server not in servers:
            return self._round_robin(servers, client_ip, request_key)
        
        return selected_server
    
    def analyze_load_distribution(self) -> Dict[str, Any]:
        """Analyze load distribution across servers."""
        if not self.servers:
            return {"error": "No servers configured"}
        
        total_requests = sum(srv['total_requests'] for srv in self.servers.values())
        total_load = sum(srv['current_load'] for srv in self.servers.values())
        
        server_analysis = {}
        for server_id, server_data in self.servers.items():
            utilization = server_data['current_load'] / server_data['capacity']
            request_percentage = (server_data['total_requests'] / total_requests * 100) if total_requests > 0 else 0
            avg_response_time = (sum(self.server_response_times.get(server_id, [0])) / 
                               len(self.server_response_times.get(server_id, [1])))
            
            server_analysis[server_id] = {
                'utilization_percentage': utilization * 100,
                'request_percentage': request_percentage,
                'current_load': server_data['current_load'],
                'capacity': server_data['capacity'],
                'health_score': server_data['health_score'],
                'average_response_time': avg_response_time
            }
        
        # Calculate distribution metrics
        utilizations = [analysis['utilization_percentage'] 
                       for analysis in server_analysis.values()]
        
        return {
            'server_analysis': server_analysis,
            'total_requests': total_requests,
            'total_current_load': total_load,
            'average_utilization': sum(utilizations) / len(utilizations),
            'max_utilization': max(utilizations),
            'min_utilization': min(utilizations),
            'utilization_variance': sum((u - sum(utilizations)/len(utilizations))**2 for u in utilizations) / len(utilizations),
            'load_balance_quality': 'GOOD' if max(utilizations) - min(utilizations) < 20 else 'POOR'
        }
```

---

## Category 2: Rate Limiting Algorithms

### Advanced Rate Limiting Implementation

**Production-Ready Rate Limiters:**
```python
class TokenBucketLimiter:
    """Token bucket rate limiter implementation."""
    
    def __init__(self, capacity: int, refill_rate: float, refill_period: float = 1.0):
        """
        Initialize token bucket limiter.
        
        Args:
            capacity: Maximum number of tokens in bucket
            refill_rate: Tokens added per refill_period
            refill_period: Time period for refill (seconds)
        """
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.refill_period = refill_period
        self.buckets = {}  # client_id -> {'tokens': int, 'last_refill': float}
        self.stats = {
            'total_requests': 0,
            'allowed_requests': 0,
            'denied_requests': 0
        }
    
    def allow_request(self, client_id: str, tokens_requested: int = 1) -> bool:
        """Check if request should be allowed."""
        current_time = time.time()
        
        if client_id not in self.buckets:
            self.buckets[client_id] = {
                'tokens': self.capacity,
                'last_refill': current_time
            }
        
        bucket = self.buckets[client_id]
        
        # Refill tokens based on time elapsed
        time_elapsed = current_time - bucket['last_refill']
        tokens_to_add = (time_elapsed / self.refill_period) * self.refill_rate
        bucket['tokens'] = min(self.capacity, bucket['tokens'] + tokens_to_add)
        bucket['last_refill'] = current_time
        
        self.stats['total_requests'] += 1
        
        # Check if enough tokens available
        if bucket['tokens'] >= tokens_requested:
            bucket['tokens'] -= tokens_requested
            self.stats['allowed_requests'] += 1
            return True
        else:
            self.stats['denied_requests'] += 1
            return False
    
    def get_remaining_capacity(self, client_id: str) -> int:
        """Get remaining tokens for client."""
        if client_id not in self.buckets:
            return self.capacity
        return int(self.buckets[client_id]['tokens'])
    
    def get_reset_time(self, client_id: str) -> float:
        """Get time until bucket is full."""
        if client_id not in self.buckets:
            return 0
        
        bucket = self.buckets[client_id]
        tokens_needed = self.capacity - bucket['tokens']
        if tokens_needed <= 0:
            return 0
        
        return (tokens_needed / self.refill_rate) * self.refill_period
    
    def get_statistics(self) -> Dict:
        """Get limiter statistics."""
        total = self.stats['total_requests']
        return {
            'total_requests': total,
            'allowed_requests': self.stats['allowed_requests'],
            'denied_requests': self.stats['denied_requests'],
            'allow_rate': self.stats['allowed_requests'] / total if total > 0 else 0,
            'active_clients': len(self.buckets),
            'algorithm': 'token_bucket'
        }

class SlidingWindowCounterLimiter:
    """Memory-efficient sliding window counter rate limiter."""
    
    def __init__(self, limit: int, window_size: float, sub_windows: int = 10):
        """
        Initialize sliding window counter limiter.
        
        Args:
            limit: Maximum requests per window
            window_size: Window size in seconds
            sub_windows: Number of sub-windows for granularity
        """
        self.limit = limit
        self.window_size = window_size
        self.sub_windows = sub_windows
        self.sub_window_size = window_size / sub_windows
        self.counters = defaultdict(lambda: defaultdict(int))  # client -> {window_id: count}
        self.stats = {
            'total_requests': 0,
            'allowed_requests': 0,
            'denied_requests': 0
        }
    
    def _get_window_id(self, timestamp: float) -> int:
        """Get sub-window ID for timestamp."""
        return int(timestamp // self.sub_window_size)
    
    def _get_current_count(self, client_id: str, current_time: float) -> int:
        """Get current request count in sliding window."""
        current_window_id = self._get_window_id(current_time)
        client_counters = self.counters[client_id]
        
        # Clean old sub-windows
        cutoff_window_id = current_window_id - self.sub_windows
        to_remove = [wid for wid in client_counters if wid <= cutoff_window_id]
        for wid in to_remove:
            del client_counters[wid]
        
        # Sum requests in current sliding window
        total_count = 0
        for window_id in range(current_window_id - self.sub_windows + 1, current_window_id + 1):
            total_count += client_counters.get(window_id, 0)
        
        return total_count
    
    def allow_request(self, client_id: str, tokens_requested: int = 1) -> bool:
        """Check if request should be allowed."""
        current_time = time.time()
        current_count = self._get_current_count(client_id, current_time)
        
        self.stats['total_requests'] += 1
        
        if current_count + tokens_requested <= self.limit:
            # Add to current sub-window
            window_id = self._get_window_id(current_time)
            self.counters[client_id][window_id] += tokens_requested
            self.stats['allowed_requests'] += 1
            return True
        else:
            self.stats['denied_requests'] += 1
            return False
    
    def get_remaining_capacity(self, client_id: str) -> int:
        """Get remaining capacity for client."""
        current_time = time.time()
        current_count = self._get_current_count(client_id, current_time)
        return max(0, self.limit - current_count)
    
    def get_reset_time(self, client_id: str) -> float:
        """Get approximate time until capacity resets."""
        return self.sub_window_size  # Approximate - one sub-window
    
    def get_statistics(self) -> Dict:
        """Get limiter statistics."""
        total = self.stats['total_requests']
        memory_usage = sum(len(counters) for counters in self.counters.values())
        
        return {
            'total_requests': total,
            'allowed_requests': self.stats['allowed_requests'],
            'denied_requests': self.stats['denied_requests'],
            'allow_rate': self.stats['allowed_requests'] / total if total > 0 else 0,
            'active_clients': len(self.counters),
            'algorithm': 'sliding_window_counter',
            'sub_windows': self.sub_windows,
            'memory_usage_windows': memory_usage
        }

class RateLimitingSystem:
    """Advanced rate limiting system with multiple algorithms."""
    
    def __init__(self):
        self.limiters = {}
        self.algorithms = {
            'token_bucket': TokenBucketLimiter,
            'sliding_window_counter': SlidingWindowCounterLimiter,
        }
    
    def create_limiter(self, limiter_id: str, algorithm: str, **kwargs) -> bool:
        """Create a new rate limiter."""
        if algorithm not in self.algorithms:
            raise ValueError(f"Unknown algorithm: {algorithm}")
        
        self.limiters[limiter_id] = self.algorithms[algorithm](**kwargs)
        return True
    
    def check_rate_limit(self, limiter_id: str, client_id: str, 
                        tokens_requested: int = 1) -> Tuple[bool, Dict]:
        """Check if request should be allowed."""
        if limiter_id not in self.limiters:
            return True, {"error": "Limiter not found"}
        
        limiter = self.limiters[limiter_id]
        allowed = limiter.allow_request(client_id, tokens_requested)
        
        metadata = {
            'limiter_type': limiter.__class__.__name__,
            'tokens_requested': tokens_requested,
            'remaining_capacity': limiter.get_remaining_capacity(client_id),
            'reset_time': limiter.get_reset_time(client_id)
        }
        
        return allowed, metadata
    
    def get_limiter_stats(self, limiter_id: str) -> Dict:
        """Get statistics for a rate limiter."""
        if limiter_id not in self.limiters:
            return {"error": "Limiter not found"}
        
        limiter = self.limiters[limiter_id]
        return limiter.get_statistics()
```

---

## Category 3: Probabilistic Data Structures

### Bloom Filters and Count-Min Sketch

**Advanced Probabilistic Implementations:**
```python
import math
import array
from typing import Any, Dict, List, Tuple

class BloomFilter:
    """Production-ready Bloom filter implementation."""
    
    def __init__(self, capacity: int, error_rate: float = 0.1):
        """
        Initialize Bloom filter.
        
        Args:
            capacity: Expected number of elements
            error_rate: Desired false positive rate
        """
        self.capacity = capacity
        self.error_rate = error_rate
        
        # Calculate optimal bit array size and hash function count
        self.bit_count = self._calculate_bit_count(capacity, error_rate)
        self.hash_count = self._calculate_hash_count(self.bit_count, capacity)
        
        # Use bit array for memory efficiency
        self.bit_array = array.array('B', [0] * ((self.bit_count + 7) // 8))
        self.item_count = 0
        
        # Statistics tracking
        self.stats = {
            'items_added': 0,
            'lookup_count': 0,
            'estimated_false_positives': 0
        }
    
    def _calculate_bit_count(self, capacity: int, error_rate: float) -> int:
        """Calculate optimal bit array size."""
        return int(-capacity * math.log(error_rate) / (math.log(2) ** 2))
    
    def _calculate_hash_count(self, bit_count: int, capacity: int) -> int:
        """Calculate optimal number of hash functions."""
        return max(1, int(bit_count * math.log(2) / capacity))
    
    def _get_hash_values(self, item: Any) -> List[int]:
        """Generate multiple hash values using double hashing."""
        # Convert item to string for consistent hashing
        item_str = str(item).encode('utf-8')
        
        # Primary hashes
        hash1 = int(hashlib.md5(item_str).hexdigest(), 16)
        hash2 = int(hashlib.sha1(item_str).hexdigest(), 16)
        
        # Generate k hash values using double hashing
        hash_values = []
        for i in range(self.hash_count):
            combined_hash = (hash1 + i * hash2) % self.bit_count
            hash_values.append(combined_hash)
        
        return hash_values
    
    def _set_bit(self, position: int):
        """Set bit at position."""
        byte_index = position // 8
        bit_index = position % 8
        self.bit_array[byte_index] |= (1 << bit_index)
    
    def _get_bit(self, position: int) -> bool:
        """Get bit at position."""
        byte_index = position // 8
        bit_index = position % 8
        return bool(self.bit_array[byte_index] & (1 << bit_index))
    
    def add(self, item: Any):
        """Add item to Bloom filter."""
        hash_values = self._get_hash_values(item)
        
        for hash_value in hash_values:
            self._set_bit(hash_value)
        
        self.item_count += 1
        self.stats['items_added'] += 1
    
    def contains(self, item: Any) -> bool:
        """Check if item might be in the filter."""
        self.stats['lookup_count'] += 1
        
        hash_values = self._get_hash_values(item)
        
        for hash_value in hash_values:
            if not self._get_bit(hash_value):
                return False
        
        return True
    
    def current_false_positive_rate(self) -> float:
        """Calculate current false positive rate."""
        if self.item_count == 0:
            return 0.0
        
        # Theoretical false positive rate
        return (1 - math.exp(-self.hash_count * self.item_count / self.bit_count)) ** self.hash_count
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive filter statistics."""
        bits_set = sum(bin(byte).count('1') for byte in self.bit_array)
        fill_ratio = bits_set / self.bit_count
        
        return {
            'capacity': self.capacity,
            'item_count': self.item_count,
            'bit_count': self.bit_count,
            'hash_count': self.hash_count,
            'bits_set': bits_set,
            'fill_ratio': fill_ratio,
            'current_false_positive_rate': self.current_false_positive_rate(),
            'target_error_rate': self.error_rate,
            'memory_usage_bytes': len(self.bit_array),
            'lookup_count': self.stats['lookup_count'],
            'items_added': self.stats['items_added']
        }

class CountMinSketch:
    """Count-Min Sketch for frequency estimation in data streams."""
    
    def __init__(self, width: int = 1000, depth: int = 7):
        """
        Initialize Count-Min Sketch.
        
        Args:
            width: Width of each hash table (affects accuracy)
            depth: Number of hash tables (affects confidence)
        """
        self.width = width
        self.depth = depth
        
        # Create depth x width matrix
        self.sketch = [[0 for _ in range(width)] for _ in range(depth)]
        
        # Total count for statistics
        self.total_count = 0
        
        # Hash functions (using different seeds)
        self.hash_functions = []
        for i in range(depth):
            seed = i * 982451653 + 1  # Large prime for good distribution
            self.hash_functions.append(lambda x, s=seed: hash((x, s)) % width)
        
        # Statistics
        self.stats = {
            'items_added': 0,
            'queries_made': 0,
        }
    
    def add(self, item: Any, count: int = 1):
        """Add item with count to the sketch."""
        for i in range(self.depth):
            hash_value = self.hash_functions[i](item)
            self.sketch[i][hash_value] += count
        
        self.total_count += count
        self.stats['items_added'] += 1
    
    def estimate_frequency(self, item: Any) -> int:
        """Estimate frequency of item."""
        self.stats['queries_made'] += 1
        
        min_count = float('inf')
        for i in range(self.depth):
            hash_value = self.hash_functions[i](item)
            min_count = min(min_count, self.sketch[i][hash_value])
        
        return int(min_count)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get sketch statistics."""
        return {
            'width': self.width,
            'depth': self.depth,
            'total_count': self.total_count,
            'memory_usage_cells': self.width * self.depth,
            'memory_usage_bytes': self.width * self.depth * 4,  # 4 bytes per int
            'items_added': self.stats['items_added'],
            'queries_made': self.stats['queries_made'],
            'estimated_error_rate': 2.0 / self.width  # Theoretical error bound
        }

class HyperLogLog:
    """HyperLogLog for cardinality estimation."""
    
    def __init__(self, precision: int = 14):
        """
        Initialize HyperLogLog.
        
        Args:
            precision: Precision parameter (4-16, higher = more accurate)
        """
        self.precision = precision
        self.m = 1 << precision  # 2^precision buckets
        self.buckets = [0] * self.m
        
        # Alpha constant for bias correction
        if self.m >= 128:
            self.alpha = 0.7213 / (1 + 1.079 / self.m)
        elif self.m >= 64:
            self.alpha = 0.709
        elif self.m >= 32:
            self.alpha = 0.697
        elif self.m >= 16:
            self.alpha = 0.673
        else:
            self.alpha = 0.5
        
        # Statistics
        self.stats = {
            'items_added': 0,
            'cardinality_queries': 0
        }
    
    def _hash(self, item: Any) -> int:
        """Hash function for item."""
        return hash(str(item)) & ((1 << 32) - 1)  # 32-bit hash
    
    def _leading_zeros(self, hash_value: int) -> int:
        """Count leading zeros in binary representation."""
        if hash_value == 0:
            return 32
        
        return (hash_value ^ (hash_value - 1)).bit_length() - 1
    
    def add(self, item: Any):
        """Add item to HyperLogLog."""
        hash_value = self._hash(item)
        
        # Use first 'precision' bits for bucket selection
        bucket = hash_value & ((1 << self.precision) - 1)
        
        # Use remaining bits for leading zero count
        remaining_hash = hash_value >> self.precision
        leading_zeros = self._leading_zeros(remaining_hash) + 1
        
        # Update bucket with maximum leading zeros seen
        self.buckets[bucket] = max(self.buckets[bucket], leading_zeros)
        
        self.stats['items_added'] += 1
    
    def cardinality(self) -> int:
        """Estimate cardinality."""
        self.stats['cardinality_queries'] += 1
        
        # Raw estimate
        raw_estimate = self.alpha * (self.m ** 2) / sum(2**(-x) for x in self.buckets)
        
        # Apply corrections for small and large ranges
        if raw_estimate <= 2.5 * self.m:
            # Small range correction
            zeros = self.buckets.count(0)
            if zeros != 0:
                return int(self.m * math.log(self.m / float(zeros)))
        elif raw_estimate <= (1.0/30.0) * (1 << 32):
            # Intermediate range, no correction
            return int(raw_estimate)
        else:
            # Large range correction
            return int(-1 * (1 << 32) * math.log(1 - raw_estimate / (1 << 32)))
        
        return int(raw_estimate)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get estimator statistics."""
        standard_error = 1.04 / math.sqrt(self.m)
        
        return {
            'precision': self.precision,
            'buckets': self.m,
            'memory_usage_bytes': self.m,  # 1 byte per bucket
            'standard_error': standard_error,
            'items_added': self.stats['items_added'],
            'cardinality_queries': self.stats['cardinality_queries'],
            'current_cardinality': self.cardinality()
        }
```

---

## Category 4: System Integration and Business Applications

### Real-World System Architecture Applications

```python
class DistributedCacheSystem:
    """Distributed caching system using consistent hashing and probabilistic data structures."""
    
    def __init__(self, cache_nodes: List[str], bloom_filter_size: int = 10000):
        """
        Initialize distributed cache system.
        
        Args:
            cache_nodes: List of cache server identifiers
            bloom_filter_size: Size of bloom filter for negative cache
        """
        self.consistent_hash = ConsistentHashRing(cache_nodes, virtual_nodes=150)
        self.load_balancer = LoadBalancerAlgorithms()
        self.rate_limiter = RateLimitingSystem()
        
        # Add cache nodes to load balancer
        for node in cache_nodes:
            self.load_balancer.add_server(node, capacity=1000, weight=1.0)
        
        # Bloom filter for negative caching
        self.negative_cache_bloom = BloomFilter(bloom_filter_size, 0.01)
        
        # System metrics
        self.metrics = {
            'total_requests': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'negative_cache_hits': 0,
            'load_balancer_selections': defaultdict(int),
            'node_failures': 0
        }
        
        # Rate limiting per client
        self.rate_limiter.create_limiter('global', 'token_bucket', 
                                       capacity=1000, refill_rate=100, refill_period=1.0)
    
    def get(self, key: str, client_id: str = "default") -> Tuple[Any, Dict[str, Any]]:
        """
        Get value from distributed cache.
        
        Returns: (value, metadata)
        """
        self.metrics['total_requests'] += 1
        
        # Check rate limiting
        allowed, rate_limit_meta = self.rate_limiter.check_rate_limit('global', client_id)
        if not allowed:
            return None, {
                'status': 'rate_limited',
                'rate_limit_info': rate_limit_meta
            }
        
        # Check negative cache bloom filter first
        if self.negative_cache_bloom.contains(key):
            self.metrics['negative_cache_hits'] += 1
            return None, {
                'status': 'negative_cache_hit',
                'source': 'bloom_filter'
            }
        
        # Get target cache node using consistent hashing
        cache_node, node_meta = self.consistent_hash.get_node(key)
        
        # Update load balancer metrics
        self.load_balancer.update_server_load(cache_node, 1)
        self.metrics['load_balancer_selections'][cache_node] += 1
        
        # Simulate cache lookup (in reality, this would be a network call)
        cache_hit = self._simulate_cache_lookup(key, cache_node)
        
        if cache_hit:
            self.metrics['cache_hits'] += 1
            self.load_balancer.record_response_time(cache_node, 0.005)  # 5ms response
            
            return f"cached_value_{key}", {
                'status': 'cache_hit',
                'cache_node': cache_node,
                'response_time_ms': 5,
                'node_metadata': node_meta
            }
        else:
            self.metrics['cache_misses'] += 1
            self.load_balancer.record_response_time(cache_node, 0.050)  # 50ms response (cache miss)
            
            # Add to negative cache bloom filter
            self.negative_cache_bloom.add(key)
            
            return None, {
                'status': 'cache_miss',
                'cache_node': cache_node,
                'response_time_ms': 50,
                'added_to_negative_cache': True
            }
    
    def _simulate_cache_lookup(self, key: str, node: str) -> bool:
        """Simulate cache lookup with realistic hit rates."""
        # Simulate 70% cache hit rate
        return random.random() < 0.7
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get comprehensive system health metrics."""
        # Load balancer analysis
        lb_analysis = self.load_balancer.analyze_load_distribution()
        
        # Cache distribution analysis
        cache_distribution = self.consistent_hash.analyze_distribution()
        
        # Bloom filter statistics
        bloom_stats = self.negative_cache_bloom.get_statistics()
        
        # Calculate overall health score
        total_requests = self.metrics['total_requests']
        cache_hit_rate = self.metrics['cache_hits'] / total_requests if total_requests > 0 else 0
        negative_cache_effectiveness = self.metrics['negative_cache_hits'] / total_requests if total_requests > 0 else 0
        
        health_score = (
            cache_hit_rate * 0.4 +  # 40% weight for cache hit rate
            (1 - bloom_stats['current_false_positive_rate']) * 0.2 +  # 20% weight for bloom filter accuracy
            (1 - max(0, lb_analysis['utilization_variance'] - 10) / 90) * 0.2 +  # 20% weight for load balance
            min(1.0, len(self.consistent_hash.nodes) / 5) * 0.2  # 20% weight for redundancy
        )
        
        return {
            'overall_health_score': health_score,
            'cache_metrics': {
                'total_requests': total_requests,
                'cache_hit_rate': cache_hit_rate,
                'cache_miss_rate': 1 - cache_hit_rate,
                'negative_cache_hit_rate': negative_cache_effectiveness
            },
            'load_balancer_health': lb_analysis,
            'cache_distribution_health': cache_distribution,
            'bloom_filter_health': bloom_stats,
            'node_count': len(self.consistent_hash.nodes),
            'failure_count': self.metrics['node_failures']
        }

# Production Implementation Guidelines
class SystemScaleROICalculator:
    """Calculate ROI for system-scale algorithm implementations."""
    
    @staticmethod
    def calculate_consistent_hashing_roi(current_redistribution_time: float,
                                       new_redistribution_time: float,
                                       scaling_events_per_month: int,
                                       engineer_hourly_rate: float = 150) -> Dict:
        """Calculate ROI for implementing consistent hashing."""
        monthly_time_saved = (current_redistribution_time - new_redistribution_time) * scaling_events_per_month
        monthly_cost_saved = monthly_time_saved * engineer_hourly_rate
        annual_savings = monthly_cost_saved * 12
        
        implementation_cost = 40 * engineer_hourly_rate  # 1 week implementation
        
        return {
            'annual_savings': annual_savings,
            'implementation_cost': implementation_cost,
            'payback_period_months': implementation_cost / monthly_cost_saved if monthly_cost_saved > 0 else float('inf'),
            'roi_percentage': ((annual_savings - implementation_cost) / implementation_cost * 100) if implementation_cost > 0 else 0
        }
    
    @staticmethod
    def calculate_rate_limiting_roi(ddos_incidents_per_year: int,
                                  average_downtime_hours: float,
                                  revenue_per_hour: float) -> Dict:
        """Calculate ROI for implementing rate limiting."""
        annual_downtime_cost = ddos_incidents_per_year * average_downtime_hours * revenue_per_hour
        implementation_cost = 2000  # Implementation and infrastructure
        annual_operating_cost = 500  # Monitoring and maintenance
        
        # Assume rate limiting prevents 80% of DDoS impact
        annual_savings = annual_downtime_cost * 0.8
        net_annual_benefit = annual_savings - annual_operating_cost
        
        return {
            'annual_savings': annual_savings,
            'implementation_cost': implementation_cost,
            'annual_operating_cost': annual_operating_cost,
            'net_annual_benefit': net_annual_benefit,
            'roi_percentage': (net_annual_benefit / implementation_cost * 100) if implementation_cost > 0 else 0
        }
```

---

## Manager-Level Decision Framework

### Algorithm Selection for System Scale

**Decision Matrix for L6/L7 Engineering Managers:**

| System Requirement | Recommended Algorithm | Business Justification | Operational Considerations |
|-------------------|----------------------|----------------------|---------------------------|
| **Horizontal Scaling** | Consistent Hashing | Minimizes data redistribution costs | Monitor virtual node distribution |
| **Load Distribution** | Weighted Round Robin | Balances performance with simplicity | Requires health monitoring |
| **API Protection** | Token Bucket + Sliding Window | Flexible rate limiting with burst handling | Tune for business tier requirements |
| **Duplicate Detection** | Bloom Filter | Memory-efficient approximation | Accept small false positive rate |
| **Frequency Analysis** | Count-Min Sketch | Handles high-velocity streams | Trade accuracy for speed |
| **Cardinality Estimation** | HyperLogLog | Minimal memory for large datasets | Standard error ~1.04/sqrt(m) |

### Implementation Checklist for Engineering Managers

**Consistent Hashing Implementation:**
- Choose virtual node count (150-200 per physical node)
- Implement gradual migration strategy
- Monitor key distribution metrics
- Plan for node failure scenarios

**Rate Limiting Deployment:**
- Start with conservative limits
- Implement monitoring and alerting
- Provide clear error messages to clients
- Plan for legitimate traffic spikes

**Probabilistic Data Structures:**
- Validate accuracy requirements vs memory constraints
- Implement periodic resets for time-based analysis
- Monitor false positive rates
- Plan for data structure sizing

---

## Related Resources and Integration

- **[Advanced Graph Algorithms](advanced-graph-algorithms.md)** - Network topology and routing optimization
- **[System Design Fundamentals](../system-design/fundamentals.md)** - Architectural patterns using these algorithms
- **[Performance Scale Architecture](../deep-dives/performance-scale.md)** - Scaling considerations and patterns
- **[Distributed Systems Deep Dive](../deep-dives/distributed-systems.md)** - Advanced distributed computing concepts

---

*This System-Scale Algorithms guide provides L6/L7 engineering managers with the algorithmic foundation needed for making informed decisions about large-scale system architecture, focusing on practical applications and business impact while maintaining technical depth required for Amazon interviews.*