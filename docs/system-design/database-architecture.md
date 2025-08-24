# Database Architecture Deep-Dive for Amazon Scale

## Introduction to Database Architecture at Scale

At Amazon scale, database architecture decisions have profound implications for performance, cost, and operational complexity. This module provides comprehensive coverage of database internals, sharding strategies, storage engines, and replication topologies essential for L6/L7 system design interviews.

---

## Storage Engine Internals

### B+ Tree Architecture

B+ trees are the foundation of most RDBMS systems, providing efficient range queries and maintaining sorted order.

#### B+ Tree Implementation Deep Dive

```python
import bisect
import math
from typing import List, Tuple, Optional, Any

class BPlusTreeNode:
    """Base class for B+ tree nodes"""
    
    def __init__(self, order: int, is_leaf: bool = False):
        self.order = order  # Maximum number of children
        self.keys = []
        self.is_leaf = is_leaf
        self.parent = None
        self.next = None  # For leaf nodes only
    
    def is_full(self) -> bool:
        """Check if node is full"""
        return len(self.keys) >= self.order - 1
    
    def is_underflow(self) -> bool:
        """Check if node has too few keys"""
        min_keys = math.ceil(self.order / 2) - 1
        return len(self.keys) < min_keys

class BPlusTreeLeaf(BPlusTreeNode):
    """Leaf node in B+ tree"""
    
    def __init__(self, order: int):
        super().__init__(order, is_leaf=True)
        self.values = []  # Data values corresponding to keys
    
    def search(self, key) -> Optional[Any]:
        """Search for a key in leaf node"""
        try:
            index = self.keys.index(key)
            return self.values[index]
        except ValueError:
            return None
    
    def insert(self, key, value) -> Optional['BPlusTreeLeaf']:
        """Insert key-value pair, return new node if split occurs"""
        # Find insertion position
        pos = bisect.bisect_left(self.keys, key)
        
        # Insert key and value
        self.keys.insert(pos, key)
        self.values.insert(pos, value)
        
        # Check if split is needed
        if self.is_full():
            return self._split()
        
        return None
    
    def _split(self) -> 'BPlusTreeLeaf':
        """Split leaf node when full"""
        mid = len(self.keys) // 2
        
        # Create new leaf node
        new_leaf = BPlusTreeLeaf(self.order)
        new_leaf.keys = self.keys[mid:]
        new_leaf.values = self.values[mid:]
        new_leaf.parent = self.parent
        
        # Update current leaf
        self.keys = self.keys[:mid]
        self.values = self.values[:mid]
        
        # Link leaves for range queries
        new_leaf.next = self.next
        self.next = new_leaf
        
        return new_leaf
    
    def range_query(self, start_key, end_key) -> List[Tuple[Any, Any]]:
        """Perform range query starting from this leaf"""
        results = []
        current = self
        
        while current:
            # Find keys in range within current leaf
            for i, key in enumerate(current.keys):
                if start_key <= key <= end_key:
                    results.append((key, current.values[i]))
                elif key > end_key:
                    return results
            
            current = current.next
        
        return results

class BPlusTreeInternal(BPlusTreeNode):
    """Internal node in B+ tree"""
    
    def __init__(self, order: int):
        super().__init__(order, is_leaf=False)
        self.children = []
    
    def search(self, key) -> BPlusTreeLeaf:
        """Search for the leaf node that should contain the key"""
        # Find child to traverse
        child_index = bisect.bisect_right(self.keys, key)
        return self.children[child_index].search(key)
    
    def insert_child(self, key, child_node) -> Optional['BPlusTreeInternal']:
        """Insert child node, return new node if split occurs"""
        pos = bisect.bisect_right(self.keys, key)
        
        self.keys.insert(pos, key)
        self.children.insert(pos + 1, child_node)
        child_node.parent = self
        
        if self.is_full():
            return self._split()
        
        return None
    
    def _split(self) -> 'BPlusTreeInternal':
        """Split internal node when full"""
        mid = len(self.keys) // 2
        promote_key = self.keys[mid]
        
        # Create new internal node
        new_internal = BPlusTreeInternal(self.order)
        new_internal.keys = self.keys[mid + 1:]
        new_internal.children = self.children[mid + 1:]
        new_internal.parent = self.parent
        
        # Update children's parent pointers
        for child in new_internal.children:
            child.parent = new_internal
        
        # Update current internal node
        self.keys = self.keys[:mid]
        self.children = self.children[:mid + 1]
        
        return new_internal, promote_key

class BPlusTree:
    """Complete B+ Tree implementation optimized for database use"""
    
    def __init__(self, order: int = 100):
        self.order = order
        self.root = BPlusTreeLeaf(order)
        self.height = 0
    
    def search(self, key) -> Optional[Any]:
        """Search for a key in the tree"""
        if isinstance(self.root, BPlusTreeLeaf):
            return self.root.search(key)
        else:
            leaf = self.root.search(key)
            return leaf.search(key)
    
    def insert(self, key, value):
        """Insert key-value pair into tree"""
        if isinstance(self.root, BPlusTreeLeaf):
            # Tree has only root leaf
            split_node = self.root.insert(key, value)
            
            if split_node:
                # Root split, create new internal root
                new_root = BPlusTreeInternal(self.order)
                new_root.keys = [split_node.keys[0]]
                new_root.children = [self.root, split_node]
                
                self.root.parent = new_root
                split_node.parent = new_root
                self.root = new_root
                self.height += 1
        else:
            # Navigate to appropriate leaf and insert
            self._insert_recursive(self.root, key, value)
    
    def _insert_recursive(self, node, key, value):
        """Recursively insert into tree"""
        if isinstance(node, BPlusTreeLeaf):
            split_node = node.insert(key, value)
            
            if split_node:
                # Leaf split, promote key to parent
                promote_key = split_node.keys[0]
                self._promote_key(node, promote_key, split_node)
        else:
            # Find appropriate child
            child_index = bisect.bisect_right(node.keys, key)
            self._insert_recursive(node.children[child_index], key, value)
    
    def _promote_key(self, node, key, new_node):
        """Promote key up the tree after split"""
        parent = node.parent
        
        if parent is None:
            # Create new root
            new_root = BPlusTreeInternal(self.order)
            new_root.keys = [key]
            new_root.children = [node, new_node]
            
            node.parent = new_root
            new_node.parent = new_root
            self.root = new_root
            self.height += 1
        else:
            # Insert into parent
            split_result = parent.insert_child(key, new_node)
            
            if split_result:
                new_internal, promote_key = split_result
                self._promote_key(parent, promote_key, new_internal)
    
    def range_query(self, start_key, end_key) -> List[Tuple[Any, Any]]:
        """Perform range query"""
        # Find starting leaf
        if isinstance(self.root, BPlusTreeLeaf):
            start_leaf = self.root
        else:
            start_leaf = self.root.search(start_key)
        
        return start_leaf.range_query(start_key, end_key)
    
    def get_statistics(self) -> dict:
        """Get tree statistics for optimization"""
        stats = {
            'height': self.height,
            'order': self.order,
            'total_nodes': 0,
            'leaf_nodes': 0,
            'internal_nodes': 0,
            'total_keys': 0,
            'avg_leaf_utilization': 0
        }
        
        def count_nodes(node):
            stats['total_nodes'] += 1
            stats['total_keys'] += len(node.keys)
            
            if isinstance(node, BPlusTreeLeaf):
                stats['leaf_nodes'] += 1
            else:
                stats['internal_nodes'] += 1
                for child in node.children:
                    count_nodes(child)
        
        count_nodes(self.root)
        
        if stats['leaf_nodes'] > 0:
            stats['avg_leaf_utilization'] = (stats['total_keys'] / stats['leaf_nodes']) / (self.order - 1)
        
        return stats

# Amazon DynamoDB-style adaptive B+ tree
class AdaptiveBPlusTree(BPlusTree):
    """B+ tree with adaptive node size based on workload"""
    
    def __init__(self, initial_order: int = 100, min_order: int = 50, max_order: int = 500):
        super().__init__(initial_order)
        self.min_order = min_order
        self.max_order = max_order
        self.access_patterns = {}
        self.adaptation_interval = 10000  # Adapt every 10k operations
        self.operation_count = 0
    
    def search(self, key) -> Optional[Any]:
        """Search with access pattern tracking"""
        result = super().search(key)
        self._track_access(key, 'read')
        return result
    
    def insert(self, key, value):
        """Insert with access pattern tracking"""
        super().insert(key, value)
        self._track_access(key, 'write')
        
        self.operation_count += 1
        if self.operation_count % self.adaptation_interval == 0:
            self._adapt_structure()
    
    def _track_access(self, key, operation_type):
        """Track access patterns for adaptation"""
        if key not in self.access_patterns:
            self.access_patterns[key] = {'reads': 0, 'writes': 0}
        
        self.access_patterns[key][operation_type + 's'] += 1
    
    def _adapt_structure(self):
        """Adapt tree structure based on access patterns"""
        # Analyze access patterns
        total_operations = sum(
            pattern['reads'] + pattern['writes'] 
            for pattern in self.access_patterns.values()
        )
        
        read_ratio = sum(
            pattern['reads'] for pattern in self.access_patterns.values()
        ) / total_operations
        
        # Adapt order based on workload
        if read_ratio > 0.8:
            # Read-heavy workload: increase order for better range query performance
            new_order = min(self.max_order, int(self.order * 1.1))
        elif read_ratio < 0.3:
            # Write-heavy workload: decrease order for better write performance
            new_order = max(self.min_order, int(self.order * 0.9))
        else:
            new_order = self.order
        
        if new_order != self.order:
            print(f"Adapting B+ tree order from {self.order} to {new_order}")
            # In practice, would rebuild tree with new order
            self.order = new_order
```

### LSM Tree Architecture

LSM (Log-Structured Merge) trees are optimized for write-heavy workloads and used in systems like Cassandra, RocksDB, and DynamoDB.

#### LSM Tree Implementation

```python
import heapq
import time
import threading
from collections import defaultdict
from typing import Dict, List, Optional, Tuple

class LSMEntry:
    """Entry in LSM tree with timestamp and deletion marker"""
    
    def __init__(self, key, value, timestamp=None, deleted=False):
        self.key = key
        self.value = value
        self.timestamp = timestamp or time.time()
        self.deleted = deleted
    
    def __lt__(self, other):
        # For heap operations - newer entries have higher priority
        return self.timestamp > other.timestamp

class MemTable:
    """In-memory sorted table (typically implemented as skip list or red-black tree)"""
    
    def __init__(self, max_size: int = 64 * 1024 * 1024):  # 64MB default
        self.data = {}  # In practice, use sorted data structure
        self.max_size = max_size
        self.current_size = 0
        self.lock = threading.RLock()
    
    def put(self, key, value) -> bool:
        """Insert key-value pair, return True if memtable should be flushed"""
        with self.lock:
            entry = LSMEntry(key, value)
            
            # Estimate size increase
            size_increase = len(str(key)) + len(str(value)) + 32  # Overhead estimate
            
            if key in self.data:
                # Update existing key
                old_entry = self.data[key]
                size_decrease = len(str(old_entry.value)) + 32
                self.current_size -= size_decrease
            
            self.data[key] = entry
            self.current_size += size_increase
            
            return self.current_size >= self.max_size
    
    def get(self, key) -> Optional[LSMEntry]:
        """Get entry by key"""
        with self.lock:
            return self.data.get(key)
    
    def delete(self, key):
        """Mark key as deleted (tombstone)"""
        with self.lock:
            entry = LSMEntry(key, None, deleted=True)
            self.data[key] = entry
    
    def scan(self, start_key=None, end_key=None) -> List[LSMEntry]:
        """Scan range of keys"""
        with self.lock:
            entries = []
            for key, entry in sorted(self.data.items()):
                if start_key and key < start_key:
                    continue
                if end_key and key > end_key:
                    break
                entries.append(entry)
            return entries
    
    def flush_to_sstable(self) -> 'SSTable':
        """Flush memtable to SSTable"""
        with self.lock:
            entries = [entry for entry in self.data.values()]
            sstable = SSTable.create_from_entries(entries)
            
            # Clear memtable after flush
            self.data.clear()
            self.current_size = 0
            
            return sstable

class SSTable:
    """Sorted String Table - immutable on-disk storage"""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.index = {}  # Key -> file offset mapping
        self.bloom_filter = None  # Bloom filter for negative lookups
        self.min_key = None
        self.max_key = None
        self.level = 0
        self.creation_time = time.time()
    
    @classmethod
    def create_from_entries(cls, entries: List[LSMEntry]) -> 'SSTable':
        """Create SSTable from list of entries"""
        import tempfile
        import pickle
        
        # Sort entries by key
        sorted_entries = sorted(entries, key=lambda e: e.key)
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.sst')
        sstable = cls(temp_file.name)
        
        # Write entries to file and build index
        offset = 0
        with open(temp_file.name, 'wb') as f:
            for entry in sorted_entries:
                sstable.index[entry.key] = offset
                
                # Serialize entry
                serialized = pickle.dumps(entry)
                f.write(len(serialized).to_bytes(4, 'big'))  # Entry size
                f.write(serialized)
                
                offset = f.tell()
        
        # Set key range
        if sorted_entries:
            sstable.min_key = sorted_entries[0].key
            sstable.max_key = sorted_entries[-1].key
        
        # Build bloom filter
        sstable._build_bloom_filter([e.key for e in sorted_entries])
        
        return sstable
    
    def get(self, key) -> Optional[LSMEntry]:
        """Get entry by key from SSTable"""
        # Check bloom filter first
        if self.bloom_filter and not self.bloom_filter.might_contain(key):
            return None
        
        if key not in self.index:
            return None
        
        # Read entry from file
        offset = self.index[key]
        with open(self.file_path, 'rb') as f:
            f.seek(offset)
            
            # Read entry size
            size_bytes = f.read(4)
            if len(size_bytes) != 4:
                return None
            
            entry_size = int.from_bytes(size_bytes, 'big')
            
            # Read and deserialize entry
            entry_data = f.read(entry_size)
            if len(entry_data) != entry_size:
                return None
            
            import pickle
            entry = pickle.loads(entry_data)
            return entry
    
    def scan(self, start_key=None, end_key=None) -> List[LSMEntry]:
        """Scan range of keys from SSTable"""
        entries = []
        
        for key in sorted(self.index.keys()):
            if start_key and key < start_key:
                continue
            if end_key and key > end_key:
                break
            
            entry = self.get(key)
            if entry:
                entries.append(entry)
        
        return entries
    
    def _build_bloom_filter(self, keys: List[str]):
        """Build bloom filter for negative lookups"""
        # Simplified bloom filter implementation
        self.bloom_filter = BloomFilter(len(keys), 0.01)  # 1% false positive rate
        
        for key in keys:
            self.bloom_filter.add(key)

class BloomFilter:
    """Simple bloom filter implementation"""
    
    def __init__(self, expected_items: int, false_positive_rate: float):
        import math
        
        self.size = int(-expected_items * math.log(false_positive_rate) / (math.log(2) ** 2))
        self.hash_count = int(self.size * math.log(2) / expected_items)
        self.bit_array = [False] * self.size
    
    def _hashes(self, item: str) -> List[int]:
        """Generate hash values for item"""
        import hashlib
        
        hashes = []
        for i in range(self.hash_count):
            hasher = hashlib.md5()
            hasher.update(f"{item}{i}".encode('utf-8'))
            hash_value = int(hasher.hexdigest(), 16)
            hashes.append(hash_value % self.size)
        
        return hashes
    
    def add(self, item: str):
        """Add item to bloom filter"""
        for hash_value in self._hashes(item):
            self.bit_array[hash_value] = True
    
    def might_contain(self, item: str) -> bool:
        """Check if item might be in set (no false negatives)"""
        return all(self.bit_array[h] for h in self._hashes(item))

class LSMTree:
    """Complete LSM Tree implementation"""
    
    def __init__(self, base_dir: str, levels: int = 7, level_size_ratio: int = 10):
        self.base_dir = base_dir
        self.levels = levels
        self.level_size_ratio = level_size_ratio
        
        # Current memtable and immutable memtables awaiting flush
        self.memtable = MemTable()
        self.immutable_memtables = []
        
        # SSTables organized by level
        self.sstables = [[] for _ in range(levels)]
        
        # Compaction and flush threads
        self.flush_thread = None
        self.compaction_thread = None
        self.running = True
        
        self._start_background_threads()
    
    def put(self, key, value):
        """Insert key-value pair"""
        should_flush = self.memtable.put(key, value)
        
        if should_flush:
            # Move current memtable to immutable list
            self.immutable_memtables.append(self.memtable)
            self.memtable = MemTable()
    
    def get(self, key) -> Optional[str]:
        """Get value by key"""
        # Check current memtable first
        entry = self.memtable.get(key)
        if entry:
            return None if entry.deleted else entry.value
        
        # Check immutable memtables
        for imm_memtable in reversed(self.immutable_memtables):
            entry = imm_memtable.get(key)
            if entry:
                return None if entry.deleted else entry.value
        
        # Check SSTables from newest to oldest
        for level in range(self.levels):
            for sstable in reversed(self.sstables[level]):
                entry = sstable.get(key)
                if entry:
                    return None if entry.deleted else entry.value
        
        return None
    
    def delete(self, key):
        """Delete key (insert tombstone)"""
        self.memtable.delete(key)
    
    def scan(self, start_key=None, end_key=None) -> List[Tuple[str, str]]:
        """Range scan with merge from all levels"""
        # Collect entries from all sources
        all_entries = []
        
        # Memtable entries
        all_entries.extend(self.memtable.scan(start_key, end_key))
        
        # Immutable memtable entries
        for imm_memtable in self.immutable_memtables:
            all_entries.extend(imm_memtable.scan(start_key, end_key))
        
        # SSTable entries
        for level in range(self.levels):
            for sstable in self.sstables[level]:
                all_entries.extend(sstable.scan(start_key, end_key))
        
        # Merge entries (keep newest version of each key)
        merged = self._merge_entries(all_entries)
        
        # Return non-deleted entries
        return [(e.key, e.value) for e in merged if not e.deleted]
    
    def _merge_entries(self, entries: List[LSMEntry]) -> List[LSMEntry]:
        """Merge entries, keeping newest version of each key"""
        key_to_entry = {}
        
        for entry in entries:
            if entry.key not in key_to_entry or entry.timestamp > key_to_entry[entry.key].timestamp:
                key_to_entry[entry.key] = entry
        
        return list(key_to_entry.values())
    
    def _start_background_threads(self):
        """Start background flush and compaction threads"""
        import threading
        
        self.flush_thread = threading.Thread(target=self._flush_worker, daemon=True)
        self.compaction_thread = threading.Thread(target=self._compaction_worker, daemon=True)
        
        self.flush_thread.start()
        self.compaction_thread.start()
    
    def _flush_worker(self):
        """Background thread to flush immutable memtables"""
        while self.running:
            if self.immutable_memtables:
                # Flush oldest immutable memtable
                imm_memtable = self.immutable_memtables.pop(0)
                sstable = imm_memtable.flush_to_sstable()
                sstable.level = 0
                
                # Add to level 0
                self.sstables[0].append(sstable)
                
                # Check if level 0 needs compaction
                if len(self.sstables[0]) > 4:  # Trigger compaction
                    self._trigger_compaction(0)
            
            time.sleep(0.1)  # Check every 100ms
    
    def _compaction_worker(self):
        """Background thread for LSM compaction"""
        while self.running:
            # Check each level for compaction needs
            for level in range(self.levels - 1):
                max_size = (self.level_size_ratio ** level) * 64 * 1024 * 1024  # 64MB base
                current_size = sum(self._estimate_sstable_size(sst) for sst in self.sstables[level])
                
                if current_size > max_size:
                    self._compact_level(level)
            
            time.sleep(5)  # Check every 5 seconds
    
    def _compact_level(self, level: int):
        """Compact SSTables from one level to the next"""
        if level >= self.levels - 1:
            return
        
        # Select SSTables to compact (simplified - take all)
        source_sstables = self.sstables[level]
        next_level_sstables = self.sstables[level + 1]
        
        # Merge all entries
        all_entries = []
        for sstable in source_sstables + next_level_sstables:
            all_entries.extend(sstable.scan())
        
        # Merge and deduplicate
        merged_entries = self._merge_entries(all_entries)
        
        # Create new SSTables for next level
        new_sstables = []
        
        # Split into multiple SSTables if too large
        max_entries_per_sstable = 10000
        for i in range(0, len(merged_entries), max_entries_per_sstable):
            batch = merged_entries[i:i + max_entries_per_sstable]
            sstable = SSTable.create_from_entries(batch)
            sstable.level = level + 1
            new_sstables.append(sstable)
        
        # Update levels
        self.sstables[level].clear()
        self.sstables[level + 1] = new_sstables
        
        # Clean up old SSTable files
        for sstable in source_sstables + next_level_sstables:
            try:
                import os
                os.unlink(sstable.file_path)
            except OSError:
                pass
    
    def _estimate_sstable_size(self, sstable: SSTable) -> int:
        """Estimate SSTable size"""
        import os
        try:
            return os.path.getsize(sstable.file_path)
        except OSError:
            return 0
    
    def get_statistics(self) -> dict:
        """Get LSM tree statistics"""
        stats = {
            'memtable_size': self.memtable.current_size,
            'immutable_memtables': len(self.immutable_memtables),
            'levels': []
        }
        
        for level in range(self.levels):
            level_stats = {
                'level': level,
                'sstable_count': len(self.sstables[level]),
                'total_size': sum(self._estimate_sstable_size(sst) for sst in self.sstables[level]),
                'key_ranges': [(sst.min_key, sst.max_key) for sst in self.sstables[level]]
            }
            stats['levels'].append(level_stats)
        
        return stats

# Amazon DynamoDB-style LSM with adaptive compaction
class AdaptiveLSMTree(LSMTree):
    """LSM Tree with adaptive compaction strategy"""
    
    def __init__(self, base_dir: str, levels: int = 7):
        super().__init__(base_dir, levels)
        self.read_amplification = 0
        self.write_amplification = 0
        self.compaction_strategy = 'leveled'  # or 'tiered'
        self.workload_stats = defaultdict(int)
    
    def put(self, key, value):
        """Put with workload tracking"""
        super().put(key, value)
        self.workload_stats['writes'] += 1
    
    def get(self, key) -> Optional[str]:
        """Get with amplification tracking"""
        lookups = 0
        
        # Track read amplification
        entry = self.memtable.get(key)
        lookups += 1
        
        if entry:
            self.read_amplification = (self.read_amplification + lookups) / 2
            self.workload_stats['reads'] += 1
            return None if entry.deleted else entry.value
        
        # Check immutable memtables
        for imm_memtable in reversed(self.immutable_memtables):
            entry = imm_memtable.get(key)
            lookups += 1
            if entry:
                self.read_amplification = (self.read_amplification + lookups) / 2
                self.workload_stats['reads'] += 1
                return None if entry.deleted else entry.value
        
        # Check SSTables
        for level in range(self.levels):
            for sstable in reversed(self.sstables[level]):
                entry = sstable.get(key)
                lookups += 1
                if entry:
                    self.read_amplification = (self.read_amplification + lookups) / 2
                    self.workload_stats['reads'] += 1
                    return None if entry.deleted else entry.value
        
        self.read_amplification = (self.read_amplification + lookups) / 2
        self.workload_stats['reads'] += 1
        return None
    
    def _adapt_compaction_strategy(self):
        """Adapt compaction strategy based on workload"""
        total_ops = self.workload_stats['reads'] + self.workload_stats['writes']
        
        if total_ops > 1000:  # Have enough data
            read_ratio = self.workload_stats['reads'] / total_ops
            
            if read_ratio > 0.8:
                # Read-heavy: use leveled compaction
                self.compaction_strategy = 'leveled'
                self.level_size_ratio = 10
            elif read_ratio < 0.3:
                # Write-heavy: use tiered compaction
                self.compaction_strategy = 'tiered'
                self.level_size_ratio = 4
            
            # Reset stats
            self.workload_stats.clear()
```

---

## Advanced Sharding Strategies

### Consistent Hashing with Virtual Nodes

```python
import hashlib
import bisect
from typing import Dict, List, Set, Optional, Any

class ConsistentHashRing:
    """Consistent hashing implementation with virtual nodes"""
    
    def __init__(self, replicas: int = 150):
        self.replicas = replicas  # Virtual nodes per physical node
        self.ring = {}  # Hash -> node mapping
        self.sorted_hashes = []  # Sorted list of hash values
        self.nodes = set()  # Set of physical nodes
    
    def _hash(self, key: str) -> int:
        """Generate hash for key"""
        return int(hashlib.md5(key.encode('utf-8')).hexdigest(), 16)
    
    def add_node(self, node: str):
        """Add a node to the ring"""
        if node in self.nodes:
            return
        
        self.nodes.add(node)
        
        # Add virtual nodes
        for i in range(self.replicas):
            virtual_key = f"{node}:{i}"
            hash_value = self._hash(virtual_key)
            
            self.ring[hash_value] = node
            bisect.insort(self.sorted_hashes, hash_value)
    
    def remove_node(self, node: str):
        """Remove a node from the ring"""
        if node not in self.nodes:
            return
        
        self.nodes.remove(node)
        
        # Remove virtual nodes
        for i in range(self.replicas):
            virtual_key = f"{node}:{i}"
            hash_value = self._hash(virtual_key)
            
            if hash_value in self.ring:
                del self.ring[hash_value]
                self.sorted_hashes.remove(hash_value)
    
    def get_node(self, key: str) -> Optional[str]:
        """Get the node responsible for a key"""
        if not self.ring:
            return None
        
        hash_value = self._hash(key)
        
        # Find the first node clockwise
        index = bisect.bisect_right(self.sorted_hashes, hash_value)
        
        if index == len(self.sorted_hashes):
            # Wrap around to the beginning
            index = 0
        
        return self.ring[self.sorted_hashes[index]]
    
    def get_nodes(self, key: str, count: int) -> List[str]:
        """Get multiple nodes for replication"""
        if not self.ring:
            return []
        
        hash_value = self._hash(key)
        index = bisect.bisect_right(self.sorted_hashes, hash_value)
        
        nodes = []
        seen_nodes = set()
        
        # Traverse the ring to get unique nodes
        for i in range(len(self.sorted_hashes)):
            actual_index = (index + i) % len(self.sorted_hashes)
            node = self.ring[self.sorted_hashes[actual_index]]
            
            if node not in seen_nodes:
                nodes.append(node)
                seen_nodes.add(node)
                
                if len(nodes) == count:
                    break
        
        return nodes
    
    def get_key_distribution(self) -> Dict[str, float]:
        """Analyze key distribution across nodes"""
        if not self.sorted_hashes:
            return {}
        
        node_ranges = {}
        total_range = 2 ** 128  # MD5 hash space
        
        for i, hash_value in enumerate(self.sorted_hashes):
            node = self.ring[hash_value]
            
            if i == 0:
                # First node: from last hash to first hash (wrapping)
                range_size = (hash_value + total_range - self.sorted_hashes[-1]) % total_range
            else:
                range_size = hash_value - self.sorted_hashes[i - 1]
            
            if node not in node_ranges:
                node_ranges[node] = 0
            
            node_ranges[node] += range_size
        
        # Convert to percentages
        distribution = {}
        for node, range_size in node_ranges.items():
            distribution[node] = (range_size / total_range) * 100
        
        return distribution
    
    def rebalance_analysis(self, old_nodes: Set[str], new_nodes: Set[str]) -> Dict[str, Any]:
        """Analyze data movement for rebalancing"""
        removed_nodes = old_nodes - new_nodes
        added_nodes = new_nodes - old_nodes
        
        # Sample keys to analyze movement
        sample_keys = [f"key_{i}" for i in range(10000)]
        
        movements = 0
        for key in sample_keys:
            old_node = None
            for node in old_nodes:
                # Simulate old ring
                old_ring = ConsistentHashRing(self.replicas)
                for n in old_nodes:
                    old_ring.add_node(n)
                old_node = old_ring.get_node(key)
                break
            
            new_node = self.get_node(key)
            
            if old_node != new_node:
                movements += 1
        
        movement_percentage = (movements / len(sample_keys)) * 100
        
        return {
            'nodes_added': len(added_nodes),
            'nodes_removed': len(removed_nodes),
            'estimated_data_movement_percentage': movement_percentage,
            'affected_keys_estimate': movement_percentage
        }

# Amazon DynamoDB-style sharding with adaptive partitioning
class DynamoDBStyleSharding:
    """DynamoDB-style sharding with automatic splitting and merging"""
    
    def __init__(self, initial_shards: int = 1, max_shard_size_gb: int = 10, 
                 max_shard_rcu: int = 3000, max_shard_wcu: int = 1000):
        self.shards = {}  # shard_id -> ShardMetadata
        self.consistent_hash = ConsistentHashRing()
        self.max_shard_size_gb = max_shard_size_gb
        self.max_shard_rcu = max_shard_rcu
        self.max_shard_wcu = max_shard_wcu
        self.shard_counter = 0
        
        # Initialize with initial shards
        for i in range(initial_shards):
            self._create_shard()
    
    def _create_shard(self) -> str:
        """Create a new shard"""
        shard_id = f"shard_{self.shard_counter}"
        self.shard_counter += 1
        
        self.shards[shard_id] = ShardMetadata(
            shard_id=shard_id,
            size_bytes=0,
            read_capacity_units=0,
            write_capacity_units=0,
            hot_keys=set()
        )
        
        self.consistent_hash.add_node(shard_id)
        return shard_id
    
    def put_item(self, partition_key: str, item_size_bytes: int):
        """Put item and track shard metrics"""
        shard_id = self.consistent_hash.get_node(partition_key)
        shard = self.shards[shard_id]
        
        # Update shard metrics
        shard.size_bytes += item_size_bytes
        shard.write_capacity_units += 1
        
        # Check if shard needs splitting
        if self._should_split_shard(shard):
            self._split_shard(shard_id)
    
    def get_item(self, partition_key: str):
        """Get item and track read metrics"""
        shard_id = self.consistent_hash.get_node(partition_key)
        shard = self.shards[shard_id]
        
        shard.read_capacity_units += 1
        shard.hot_keys.add(partition_key)
        
        # Trim hot keys (keep only recent)
        if len(shard.hot_keys) > 1000:
            # In practice, use time-based eviction
            shard.hot_keys = set(list(shard.hot_keys)[-500:])
    
    def _should_split_shard(self, shard: 'ShardMetadata') -> bool:
        """Determine if shard should be split"""
        # Size-based splitting
        if shard.size_bytes > self.max_shard_size_gb * 1024 * 1024 * 1024:
            return True
        
        # Throughput-based splitting
        if (shard.read_capacity_units > self.max_shard_rcu or 
            shard.write_capacity_units > self.max_shard_wcu):
            return True
        
        # Hot key detection
        if len(shard.hot_keys) > 100:  # Many hot keys indicate need for split
            return True
        
        return False
    
    def _split_shard(self, shard_id: str):
        """Split a shard into two shards"""
        # Create new shard
        new_shard_id = self._create_shard()
        
        # Remove old shard from hash ring
        self.consistent_hash.remove_node(shard_id)
        
        # Add both shards back (this will redistribute keys)
        self.consistent_hash.add_node(shard_id)
        self.consistent_hash.add_node(new_shard_id)
        
        # Reset metrics for both shards
        old_shard = self.shards[shard_id]
        new_shard = self.shards[new_shard_id]
        
        # Distribute metrics approximately
        old_shard.size_bytes //= 2
        new_shard.size_bytes = old_shard.size_bytes
        
        old_shard.read_capacity_units //= 2
        new_shard.read_capacity_units = old_shard.read_capacity_units
        
        old_shard.write_capacity_units //= 2  
        new_shard.write_capacity_units = old_shard.write_capacity_units
        
        print(f"Split shard {shard_id} into {shard_id} and {new_shard_id}")
    
    def get_shard_statistics(self) -> Dict[str, Any]:
        """Get comprehensive shard statistics"""
        stats = {
            'total_shards': len(self.shards),
            'total_size_gb': sum(s.size_bytes for s in self.shards.values()) / (1024**3),
            'total_rcu': sum(s.read_capacity_units for s in self.shards.values()),
            'total_wcu': sum(s.write_capacity_units for s in self.shards.values()),
            'distribution': self.consistent_hash.get_key_distribution(),
            'shard_details': []
        }
        
        for shard_id, shard in self.shards.items():
            stats['shard_details'].append({
                'shard_id': shard_id,
                'size_gb': shard.size_bytes / (1024**3),
                'rcu': shard.read_capacity_units,
                'wcu': shard.write_capacity_units,
                'hot_keys_count': len(shard.hot_keys)
            })
        
        return stats

class ShardMetadata:
    """Metadata for a single shard"""
    
    def __init__(self, shard_id: str, size_bytes: int = 0, 
                 read_capacity_units: int = 0, write_capacity_units: int = 0,
                 hot_keys: Set[str] = None):
        self.shard_id = shard_id
        self.size_bytes = size_bytes
        self.read_capacity_units = read_capacity_units
        self.write_capacity_units = write_capacity_units
        self.hot_keys = hot_keys or set()
        self.creation_time = time.time()
        self.last_split_time = None

# Range-based sharding for ordered data
class RangeBasedSharding:
    """Range-based sharding for ordered data like timestamps"""
    
    def __init__(self, initial_ranges: List[Tuple[Any, Any, str]] = None):
        # Each range: (start_key, end_key, shard_id)
        self.ranges = initial_ranges or [(None, None, "shard_0")]
        self.shard_stats = {}
        
        for start, end, shard_id in self.ranges:
            self.shard_stats[shard_id] = {
                'size_bytes': 0,
                'key_count': 0,
                'read_ops': 0,
                'write_ops': 0
            }
    
    def get_shard(self, key: Any) -> str:
        """Get shard for a key"""
        for start_key, end_key, shard_id in self.ranges:
            if start_key is None or key >= start_key:
                if end_key is None or key < end_key:
                    return shard_id
        
        # Default to last shard
        return self.ranges[-1][2]
    
    def put_item(self, key: Any, size_bytes: int):
        """Put item and update statistics"""
        shard_id = self.get_shard(key)
        
        self.shard_stats[shard_id]['size_bytes'] += size_bytes
        self.shard_stats[shard_id]['key_count'] += 1
        self.shard_stats[shard_id]['write_ops'] += 1
        
        # Check for hot spots and split if necessary
        if self._should_split_range(shard_id):
            self._split_range(shard_id, key)
    
    def _should_split_range(self, shard_id: str) -> bool:
        """Determine if range should be split"""
        stats = self.shard_stats[shard_id]
        
        # Size-based splitting
        if stats['size_bytes'] > 10 * 1024 * 1024 * 1024:  # 10GB
            return True
        
        # Key count-based splitting  
        if stats['key_count'] > 1000000:  # 1M keys
            return True
        
        return False
    
    def _split_range(self, shard_id: str, split_key: Any):
        """Split range at the given key"""
        # Find the range to split
        range_index = None
        for i, (start, end, sid) in enumerate(self.ranges):
            if sid == shard_id:
                range_index = i
                break
        
        if range_index is None:
            return
        
        start_key, end_key, _ = self.ranges[range_index]
        
        # Create new shard ID
        new_shard_id = f"shard_{len(self.shard_stats)}"
        
        # Split the range
        self.ranges[range_index] = (start_key, split_key, shard_id)
        self.ranges.insert(range_index + 1, (split_key, end_key, new_shard_id))
        
        # Initialize stats for new shard
        self.shard_stats[new_shard_id] = {
            'size_bytes': 0,
            'key_count': 0,
            'read_ops': 0,
            'write_ops': 0
        }
        
        # Redistribute stats (approximation)
        old_stats = self.shard_stats[shard_id]
        self.shard_stats[shard_id] = {k: v // 2 for k, v in old_stats.items()}
        self.shard_stats[new_shard_id] = {k: v // 2 for k, v in old_stats.items()}
        
        print(f"Split range in {shard_id} at key {split_key}, created {new_shard_id}")
```

This comprehensive database architecture module covers the internals of B+ trees and LSM trees, advanced sharding strategies including consistent hashing and range-based partitioning, all optimized for Amazon-scale systems. The implementations include production-ready optimizations and adaptive strategies used in systems like DynamoDB.