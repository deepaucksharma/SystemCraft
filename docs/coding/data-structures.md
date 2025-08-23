# Essential Data Structures for Amazon L6/L7 Engineering Managers

!!! info "Manager-Focused Data Structures Mastery"
    This guide covers essential data structures specifically for L6/L7 engineering managers, focusing on understanding when and why to use each structure, performance characteristics, and real-world applications in system design.

## L6/L7 Data Structures Framework

### 1. Why Data Structures Matter for Engineering Managers

#### Strategic Understanding vs Implementation
```markdown
**L6/L7 Manager Focus:**
- When to recommend each data structure for team projects
- Performance characteristics and trade-offs for business decisions
- Real-world applications in system design and architecture
- Ability to evaluate and guide senior engineers' technical choices

**Interview Expectations:**
- Demonstrate familiarity with core data structures
- Explain appropriate use cases and performance implications
- Show ability to make informed technical recommendations
- Connect data structure choices to business and operational outcomes
```

### 2. Manager-Level Decision Framework

**Data Structure Selection Criteria:**
- Performance requirements (time/space complexity)
- Scalability needs (how data grows over time)
- Team expertise and maintenance complexity
- Integration with existing systems
- Cost implications (memory, compute, development time)

---

## Category 1: Fundamental Data Structures

### Arrays and Dynamic Arrays

**Core Concepts:**
```python
# Static Array (Fixed Size)
def demonstrate_array_operations():
    """Core array operations and their complexities."""
    # Arrays provide O(1) access by index
    arr = [1, 2, 3, 4, 5]
    
    # Access: O(1)
    element = arr[2]  # Gets element at index 2
    
    # Search: O(n) for unsorted, O(log n) for sorted
    def linear_search(arr, target):
        for i, value in enumerate(arr):
            if value == target:
                return i
        return -1
    
    def binary_search(arr, target):
        left, right = 0, len(arr) - 1
        while left <= right:
            mid = (left + right) // 2
            if arr[mid] == target:
                return mid
            elif arr[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1
    
    # Insertion: O(n) worst case (shifting elements)
    def insert_at_position(arr, pos, value):
        return arr[:pos] + [value] + arr[pos:]
    
    # Deletion: O(n) worst case (shifting elements)
    def delete_at_position(arr, pos):
        return arr[:pos] + arr[pos+1:]

# Dynamic Array (List in Python)
class DynamicArray:
    """Custom dynamic array implementation."""
    
    def __init__(self, initial_capacity=2):
        self.capacity = initial_capacity
        self.size = 0
        self.data = [None] * self.capacity
    
    def __getitem__(self, index):
        """O(1) access by index."""
        if 0 <= index < self.size:
            return self.data[index]
        raise IndexError("Index out of range")
    
    def __setitem__(self, index, value):
        """O(1) assignment by index."""
        if 0 <= index < self.size:
            self.data[index] = value
        else:
            raise IndexError("Index out of range")
    
    def append(self, value):
        """O(1) amortized, O(n) worst case when resizing."""
        if self.size >= self.capacity:
            self._resize()
        
        self.data[self.size] = value
        self.size += 1
    
    def _resize(self):
        """Double the capacity when full."""
        old_data = self.data
        self.capacity *= 2
        self.data = [None] * self.capacity
        
        for i in range(self.size):
            self.data[i] = old_data[i]
    
    def pop(self):
        """O(1) removal from end."""
        if self.size == 0:
            raise IndexError("Pop from empty array")
        
        self.size -= 1
        return self.data[self.size]
    
    def insert(self, index, value):
        """O(n) insertion at arbitrary position."""
        if index < 0 or index > self.size:
            raise IndexError("Index out of range")
        
        if self.size >= self.capacity:
            self._resize()
        
        # Shift elements to the right
        for i in range(self.size, index, -1):
            self.data[i] = self.data[i-1]
        
        self.data[index] = value
        self.size += 1
    
    def __len__(self):
        return self.size
    
    def __str__(self):
        return '[' + ', '.join(str(self.data[i]) for i in range(self.size)) + ']'
```

**Time & Space Complexity:**
| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Access by index | O(1) | O(1) |
| Search (unsorted) | O(n) | O(1) |
| Search (sorted) | O(log n) | O(1) |
| Insertion at end | O(1) amortized | O(1) |
| Insertion at middle | O(n) | O(1) |
| Deletion at end | O(1) | O(1) |
| Deletion at middle | O(n) | O(1) |

**Business Applications:**
- **Caching layers**: Fast access to frequently used data
- **Time series data**: Stock prices, metrics, logging
- **Configuration arrays**: Feature flags, A/B test variants
- **Image processing**: Pixel data manipulation
- **Real-time analytics**: Moving averages, rolling calculations

**Manager Decision Points:**
- Choose arrays when you need predictable O(1) access patterns
- Consider memory locality benefits for performance-critical systems
- Evaluate insertion/deletion frequency vs access frequency
- Factor in cache performance for large datasets

### Linked Lists

**Core Implementation:**
```python
class ListNode:
    """Node for singly linked list."""
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class SinglyLinkedList:
    """Singly linked list implementation."""
    
    def __init__(self):
        self.head = None
        self.size = 0
    
    def prepend(self, val):
        """O(1) insertion at beginning."""
        new_node = ListNode(val)
        new_node.next = self.head
        self.head = new_node
        self.size += 1
    
    def append(self, val):
        """O(n) insertion at end."""
        new_node = ListNode(val)
        if not self.head:
            self.head = new_node
        else:
            current = self.head
            while current.next:
                current = current.next
            current.next = new_node
        self.size += 1
    
    def insert_at_position(self, pos, val):
        """O(n) insertion at arbitrary position."""
        if pos == 0:
            self.prepend(val)
            return
        
        if pos < 0 or pos > self.size:
            raise IndexError("Position out of range")
        
        new_node = ListNode(val)
        current = self.head
        for _ in range(pos - 1):
            current = current.next
        
        new_node.next = current.next
        current.next = new_node
        self.size += 1
    
    def delete(self, val):
        """O(n) deletion of first occurrence."""
        if not self.head:
            return False
        
        if self.head.val == val:
            self.head = self.head.next
            self.size -= 1
            return True
        
        current = self.head
        while current.next:
            if current.next.val == val:
                current.next = current.next.next
                self.size -= 1
                return True
            current = current.next
        
        return False
    
    def find(self, val):
        """O(n) search for value."""
        current = self.head
        position = 0
        while current:
            if current.val == val:
                return position
            current = current.next
            position += 1
        return -1
    
    def reverse(self):
        """O(n) reversal of linked list."""
        prev = None
        current = self.head
        
        while current:
            next_temp = current.next
            current.next = prev
            prev = current
            current = next_temp
        
        self.head = prev
    
    def __len__(self):
        return self.size
    
    def __str__(self):
        result = []
        current = self.head
        while current:
            result.append(str(current.val))
            current = current.next
        return " -> ".join(result)

class DoublyLinkedNode:
    """Node for doubly linked list."""
    def __init__(self, val=0, prev=None, next=None):
        self.val = val
        self.prev = prev
        self.next = next

class DoublyLinkedList:
    """Doubly linked list with O(1) operations at both ends."""
    
    def __init__(self):
        # Sentinel nodes to simplify edge cases
        self.head = DoublyLinkedNode(0)
        self.tail = DoublyLinkedNode(0)
        self.head.next = self.tail
        self.tail.prev = self.head
        self.size = 0
    
    def add_first(self, val):
        """O(1) insertion at beginning."""
        self._add_after(self.head, val)
    
    def add_last(self, val):
        """O(1) insertion at end."""
        self._add_before(self.tail, val)
    
    def _add_after(self, node, val):
        """Add new node after given node."""
        new_node = DoublyLinkedNode(val)
        new_node.next = node.next
        new_node.prev = node
        node.next.prev = new_node
        node.next = new_node
        self.size += 1
    
    def _add_before(self, node, val):
        """Add new node before given node."""
        new_node = DoublyLinkedNode(val)
        new_node.next = node
        new_node.prev = node.prev
        node.prev.next = new_node
        node.prev = new_node
        self.size += 1
    
    def remove_first(self):
        """O(1) removal from beginning."""
        if self.size == 0:
            raise IndexError("Remove from empty list")
        return self._remove_node(self.head.next)
    
    def remove_last(self):
        """O(1) removal from end."""
        if self.size == 0:
            raise IndexError("Remove from empty list")
        return self._remove_node(self.tail.prev)
    
    def _remove_node(self, node):
        """Remove specific node."""
        node.prev.next = node.next
        node.next.prev = node.prev
        self.size -= 1
        return node.val
    
    def __len__(self):
        return self.size
```

**Time & Space Complexity:**
| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Access by index | O(n) | O(1) |
| Search | O(n) | O(1) |
| Insertion at beginning | O(1) | O(1) |
| Insertion at end | O(n) singly, O(1) doubly | O(1) |
| Deletion at beginning | O(1) | O(1) |
| Deletion at end | O(n) singly, O(1) doubly | O(1) |
| Deletion arbitrary | O(n) | O(1) |

**Business Applications:**
- **Undo/Redo functionality**: Text editors, graphic software
- **Music playlists**: Navigation between songs
- **Browser history**: Back/forward navigation
- **LRU cache implementation**: Efficient cache eviction
- **Task queues**: Job processing systems

### Stacks

**Core Implementation:**
```python
class Stack:
    """Stack implementation with list."""
    
    def __init__(self):
        self.items = []
    
    def push(self, item):
        """O(1) push operation."""
        self.items.append(item)
    
    def pop(self):
        """O(1) pop operation."""
        if self.is_empty():
            raise IndexError("Pop from empty stack")
        return self.items.pop()
    
    def peek(self):
        """O(1) peek at top element."""
        if self.is_empty():
            raise IndexError("Peek at empty stack")
        return self.items[-1]
    
    def is_empty(self):
        """O(1) empty check."""
        return len(self.items) == 0
    
    def size(self):
        """O(1) size check."""
        return len(self.items)
    
    def __str__(self):
        return f"Stack({self.items})"

class MinStack:
    """Stack with O(1) min operation."""
    
    def __init__(self):
        self.stack = []
        self.min_stack = []
    
    def push(self, val):
        """Push value and track minimum."""
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
    
    def pop(self):
        """Pop value and update minimum."""
        if not self.stack:
            raise IndexError("Pop from empty stack")
        
        val = self.stack.pop()
        if val == self.min_stack[-1]:
            self.min_stack.pop()
        return val
    
    def top(self):
        """Get top element."""
        if not self.stack:
            raise IndexError("Top from empty stack")
        return self.stack[-1]
    
    def get_min(self):
        """Get minimum element in O(1)."""
        if not self.min_stack:
            raise IndexError("Get min from empty stack")
        return self.min_stack[-1]

# Stack Applications
def balanced_parentheses(s):
    """Check if parentheses are balanced."""
    stack = []
    pairs = {'(': ')', '[': ']', '{': '}'}
    
    for char in s:
        if char in pairs:
            stack.append(char)
        elif char in pairs.values():
            if not stack or pairs[stack.pop()] != char:
                return False
    
    return len(stack) == 0

def evaluate_postfix(expression):
    """Evaluate postfix expression."""
    stack = []
    operators = {'+', '-', '*', '/'}
    
    for token in expression.split():
        if token in operators:
            if len(stack) < 2:
                raise ValueError("Invalid expression")
            
            b = stack.pop()
            a = stack.pop()
            
            if token == '+':
                result = a + b
            elif token == '-':
                result = a - b
            elif token == '*':
                result = a * b
            elif token == '/':
                result = a / b
            
            stack.append(result)
        else:
            stack.append(float(token))
    
    if len(stack) != 1:
        raise ValueError("Invalid expression")
    
    return stack[0]

def infix_to_postfix(expression):
    """Convert infix to postfix notation."""
    precedence = {'+': 1, '-': 1, '*': 2, '/': 2, '^': 3}
    stack = []
    result = []
    
    for char in expression:
        if char.isalnum():
            result.append(char)
        elif char == '(':
            stack.append(char)
        elif char == ')':
            while stack and stack[-1] != '(':
                result.append(stack.pop())
            stack.pop()  # Remove '('
        elif char in precedence:
            while (stack and stack[-1] != '(' and
                   stack[-1] in precedence and
                   precedence[stack[-1]] >= precedence[char]):
                result.append(stack.pop())
            stack.append(char)
    
    while stack:
        result.append(stack.pop())
    
    return ' '.join(result)
```

**Business Applications:**
- **Function call management**: Programming language runtime
- **Browser history**: Back button functionality
- **Expression evaluation**: Calculators, compilers
- **Undo operations**: Text editors, graphic applications
- **Depth-first search**: Graph algorithms, file system traversal

### Queues

**Core Implementation:**
```python
from collections import deque

class Queue:
    """Queue implementation using deque."""
    
    def __init__(self):
        self.items = deque()
    
    def enqueue(self, item):
        """O(1) enqueue operation."""
        self.items.append(item)
    
    def dequeue(self):
        """O(1) dequeue operation."""
        if self.is_empty():
            raise IndexError("Dequeue from empty queue")
        return self.items.popleft()
    
    def front(self):
        """O(1) peek at front element."""
        if self.is_empty():
            raise IndexError("Front of empty queue")
        return self.items[0]
    
    def is_empty(self):
        """O(1) empty check."""
        return len(self.items) == 0
    
    def size(self):
        """O(1) size check."""
        return len(self.items)
    
    def __str__(self):
        return f"Queue({list(self.items)})"

class CircularQueue:
    """Fixed-size circular queue."""
    
    def __init__(self, capacity):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front = 0
        self.rear = -1
        self.size = 0
    
    def enqueue(self, item):
        """Add item to rear of queue."""
        if self.is_full():
            raise OverflowError("Queue is full")
        
        self.rear = (self.rear + 1) % self.capacity
        self.queue[self.rear] = item
        self.size += 1
    
    def dequeue(self):
        """Remove item from front of queue."""
        if self.is_empty():
            raise IndexError("Dequeue from empty queue")
        
        item = self.queue[self.front]
        self.queue[self.front] = None  # Clear reference
        self.front = (self.front + 1) % self.capacity
        self.size -= 1
        return item
    
    def peek(self):
        """Peek at front element."""
        if self.is_empty():
            raise IndexError("Peek at empty queue")
        return self.queue[self.front]
    
    def is_empty(self):
        return self.size == 0
    
    def is_full(self):
        return self.size == self.capacity
    
    def __len__(self):
        return self.size

import heapq

class PriorityQueue:
    """Priority queue implementation using heap."""
    
    def __init__(self):
        self.heap = []
        self.index = 0
    
    def put(self, item, priority):
        """Add item with priority (lower number = higher priority)."""
        heapq.heappush(self.heap, (priority, self.index, item))
        self.index += 1
    
    def get(self):
        """Remove and return highest priority item."""
        if self.is_empty():
            raise IndexError("Get from empty queue")
        return heapq.heappop(self.heap)[2]
    
    def peek(self):
        """Peek at highest priority item."""
        if self.is_empty():
            raise IndexError("Peek at empty queue")
        return self.heap[0][2]
    
    def is_empty(self):
        return len(self.heap) == 0
    
    def size(self):
        return len(self.heap)

# Queue Applications
def bfs_traversal(graph, start):
    """Breadth-first search using queue."""
    visited = set()
    queue = Queue()
    result = []
    
    queue.enqueue(start)
    visited.add(start)
    
    while not queue.is_empty():
        node = queue.dequeue()
        result.append(node)
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.enqueue(neighbor)
    
    return result

def sliding_window_maximum(nums, k):
    """Find maximum in each sliding window."""
    from collections import deque
    
    dq = deque()  # Store indices
    result = []
    
    for i, num in enumerate(nums):
        # Remove indices outside current window
        while dq and dq[0] <= i - k:
            dq.popleft()
        
        # Remove indices of smaller elements
        while dq and nums[dq[-1]] < num:
            dq.pop()
        
        dq.append(i)
        
        # Add maximum of current window to result
        if i >= k - 1:
            result.append(nums[dq[0]])
    
    return result
```

**Business Applications:**
- **Task scheduling**: Job queues, background processing
- **Breadth-first search**: Social networks, recommendation systems
- **Load balancing**: Request distribution across servers
- **Buffer management**: Streaming data, message queues
- **Rate limiting**: API request throttling

---

## Category 2: Hash-Based Data Structures

### Hash Tables (Dictionaries/Maps)

**Core Implementation:**
```python
class HashTable:
    """Hash table implementation with chaining for collision resolution."""
    
    def __init__(self, initial_capacity=16):
        self.capacity = initial_capacity
        self.size = 0
        self.buckets = [[] for _ in range(self.capacity)]
        self.load_factor_threshold = 0.75
    
    def _hash(self, key):
        """Simple hash function."""
        return hash(key) % self.capacity
    
    def _resize(self):
        """Resize hash table when load factor exceeds threshold."""
        old_buckets = self.buckets
        self.capacity *= 2
        self.size = 0
        self.buckets = [[] for _ in range(self.capacity)]
        
        # Rehash all existing key-value pairs
        for bucket in old_buckets:
            for key, value in bucket:
                self.put(key, value)
    
    def put(self, key, value):
        """Insert or update key-value pair."""
        if self.size >= self.capacity * self.load_factor_threshold:
            self._resize()
        
        index = self._hash(key)
        bucket = self.buckets[index]
        
        # Update existing key
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        
        # Add new key-value pair
        bucket.append((key, value))
        self.size += 1
    
    def get(self, key):
        """Get value by key."""
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for k, v in bucket:
            if k == key:
                return v
        
        raise KeyError(f"Key '{key}' not found")
    
    def delete(self, key):
        """Delete key-value pair."""
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for i, (k, v) in enumerate(bucket):
            if k == key:
                del bucket[i]
                self.size -= 1
                return v
        
        raise KeyError(f"Key '{key}' not found")
    
    def contains(self, key):
        """Check if key exists."""
        try:
            self.get(key)
            return True
        except KeyError:
            return False
    
    def keys(self):
        """Get all keys."""
        keys = []
        for bucket in self.buckets:
            for key, _ in bucket:
                keys.append(key)
        return keys
    
    def values(self):
        """Get all values."""
        values = []
        for bucket in self.buckets:
            for _, value in bucket:
                values.append(value)
        return values
    
    def items(self):
        """Get all key-value pairs."""
        items = []
        for bucket in self.buckets:
            for key, value in bucket:
                items.append((key, value))
        return items
    
    def load_factor(self):
        """Calculate current load factor."""
        return self.size / self.capacity
    
    def __len__(self):
        return self.size
    
    def __str__(self):
        items = self.items()
        return '{' + ', '.join(f'{k}: {v}' for k, v in items) + '}'

class BloomFilter:
    """Probabilistic data structure for set membership."""
    
    def __init__(self, capacity, error_rate=0.1):
        import math
        
        self.capacity = capacity
        self.error_rate = error_rate
        
        # Calculate optimal bit array size and hash function count
        self.bit_count = int(-capacity * math.log(error_rate) / (math.log(2) ** 2))
        self.hash_count = int(self.bit_count * math.log(2) / capacity)
        
        self.bit_array = [False] * self.bit_count
        self.item_count = 0
    
    def _hashes(self, item):
        """Generate multiple hash values for item."""
        import hashlib
        
        hash1 = int(hashlib.md5(str(item).encode()).hexdigest(), 16)
        hash2 = int(hashlib.sha1(str(item).encode()).hexdigest(), 16)
        
        hashes = []
        for i in range(self.hash_count):
            hash_val = (hash1 + i * hash2) % self.bit_count
            hashes.append(hash_val)
        
        return hashes
    
    def add(self, item):
        """Add item to bloom filter."""
        for hash_val in self._hashes(item):
            self.bit_array[hash_val] = True
        self.item_count += 1
    
    def contains(self, item):
        """Check if item might be in set (no false negatives)."""
        for hash_val in self._hashes(item):
            if not self.bit_array[hash_val]:
                return False
        return True
    
    def false_positive_probability(self):
        """Calculate current false positive probability."""
        import math
        return (1 - math.exp(-self.hash_count * self.item_count / self.bit_count)) ** self.hash_count

# Hash Table Applications
class LRUCache:
    """Least Recently Used cache implementation."""
    
    def __init__(self, capacity):
        from collections import OrderedDict
        self.capacity = capacity
        self.cache = OrderedDict()
    
    def get(self, key):
        """Get value and mark as recently used."""
        if key not in self.cache:
            return -1
        
        # Move to end (most recently used)
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key, value):
        """Put key-value pair, evict LRU if needed."""
        if key in self.cache:
            # Update existing key
            self.cache[key] = value
            self.cache.move_to_end(key)
        else:
            # Add new key
            if len(self.cache) >= self.capacity:
                # Remove least recently used (first item)
                self.cache.popitem(last=False)
            
            self.cache[key] = value

def two_sum(nums, target):
    """Find two numbers that add up to target."""
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

def group_anagrams(strs):
    """Group anagrams together."""
    from collections import defaultdict
    
    groups = defaultdict(list)
    for s in strs:
        # Sort characters to create key
        key = ''.join(sorted(s))
        groups[key].append(s)
    
    return list(groups.values())
```

**Hash Function Properties:**
- **Deterministic**: Same input produces same output
- **Uniform distribution**: Minimizes collisions
- **Fast computation**: O(1) hash calculation
- **Avalanche effect**: Small input changes cause large output changes

**Collision Resolution Strategies:**
- **Chaining**: Store multiple values in same bucket using linked lists
- **Open addressing**: Find alternative positions when collision occurs
- **Robin Hood hashing**: Minimize variance in probe distances
- **Cuckoo hashing**: Guaranteed O(1) worst-case lookup

**Business Applications:**
- **Caching systems**: Redis, Memcached, application-level caches
- **Database indexing**: Hash indexes for equality queries
- **Distributed systems**: Consistent hashing for load balancing
- **Deduplication**: File systems, data processing pipelines
- **Session management**: User authentication, shopping carts

### Hash Sets

**Core Implementation:**
```python
class HashSet:
    """Hash set implementation for unique elements."""
    
    def __init__(self, initial_capacity=16):
        self.capacity = initial_capacity
        self.size = 0
        self.buckets = [[] for _ in range(self.capacity)]
        self.load_factor_threshold = 0.75
    
    def _hash(self, item):
        """Hash function for items."""
        return hash(item) % self.capacity
    
    def _resize(self):
        """Resize when load factor exceeds threshold."""
        old_buckets = self.buckets
        self.capacity *= 2
        self.size = 0
        self.buckets = [[] for _ in range(self.capacity)]
        
        # Rehash all existing items
        for bucket in old_buckets:
            for item in bucket:
                self.add(item)
    
    def add(self, item):
        """Add item to set."""
        if self.contains(item):
            return  # Already exists
        
        if self.size >= self.capacity * self.load_factor_threshold:
            self._resize()
        
        index = self._hash(item)
        self.buckets[index].append(item)
        self.size += 1
    
    def remove(self, item):
        """Remove item from set."""
        index = self._hash(item)
        bucket = self.buckets[index]
        
        for i, element in enumerate(bucket):
            if element == item:
                del bucket[i]
                self.size -= 1
                return
        
        raise KeyError(f"Item '{item}' not found")
    
    def contains(self, item):
        """Check if item is in set."""
        index = self._hash(item)
        bucket = self.buckets[index]
        return item in bucket
    
    def union(self, other):
        """Return union of two sets."""
        result = HashSet()
        for item in self:
            result.add(item)
        for item in other:
            result.add(item)
        return result
    
    def intersection(self, other):
        """Return intersection of two sets."""
        result = HashSet()
        for item in self:
            if item in other:
                result.add(item)
        return result
    
    def difference(self, other):
        """Return difference of two sets."""
        result = HashSet()
        for item in self:
            if item not in other:
                result.add(item)
        return result
    
    def __iter__(self):
        """Iterator support."""
        for bucket in self.buckets:
            for item in bucket:
                yield item
    
    def __len__(self):
        return self.size
    
    def __contains__(self, item):
        return self.contains(item)
    
    def __str__(self):
        items = list(self)
        return '{' + ', '.join(str(item) for item in items) + '}'
```

---

## Category 3: Tree Data Structures

### Binary Trees

**Core Implementation:**
```python
class TreeNode:
    """Binary tree node."""
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class BinaryTree:
    """Binary tree with common operations."""
    
    def __init__(self, root=None):
        self.root = root
    
    def insert_level_order(self, values):
        """Insert values in level order."""
        if not values:
            return
        
        self.root = TreeNode(values[0])
        queue = [self.root]
        i = 1
        
        while queue and i < len(values):
            node = queue.pop(0)
            
            if i < len(values) and values[i] is not None:
                node.left = TreeNode(values[i])
                queue.append(node.left)
            i += 1
            
            if i < len(values) and values[i] is not None:
                node.right = TreeNode(values[i])
                queue.append(node.right)
            i += 1
    
    def inorder_traversal(self, node=None):
        """Inorder traversal: left, root, right."""
        if node is None:
            node = self.root
        
        result = []
        if node:
            result.extend(self.inorder_traversal(node.left))
            result.append(node.val)
            result.extend(self.inorder_traversal(node.right))
        return result
    
    def preorder_traversal(self, node=None):
        """Preorder traversal: root, left, right."""
        if node is None:
            node = self.root
        
        result = []
        if node:
            result.append(node.val)
            result.extend(self.preorder_traversal(node.left))
            result.extend(self.preorder_traversal(node.right))
        return result
    
    def postorder_traversal(self, node=None):
        """Postorder traversal: left, right, root."""
        if node is None:
            node = self.root
        
        result = []
        if node:
            result.extend(self.postorder_traversal(node.left))
            result.extend(self.postorder_traversal(node.right))
            result.append(node.val)
        return result
    
    def level_order_traversal(self):
        """Level order traversal using queue."""
        if not self.root:
            return []
        
        result = []
        queue = [self.root]
        
        while queue:
            level_size = len(queue)
            level = []
            
            for _ in range(level_size):
                node = queue.pop(0)
                level.append(node.val)
                
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            
            result.append(level)
        
        return result
    
    def height(self, node=None):
        """Calculate height of tree."""
        if node is None:
            node = self.root
        
        if not node:
            return 0
        
        return 1 + max(self.height(node.left), self.height(node.right))
    
    def is_balanced(self, node=None):
        """Check if tree is height-balanced."""
        if node is None:
            node = self.root
        
        def check_balance(node):
            if not node:
                return 0, True
            
            left_height, left_balanced = check_balance(node.left)
            if not left_balanced:
                return 0, False
            
            right_height, right_balanced = check_balance(node.right)
            if not right_balanced:
                return 0, False
            
            balanced = abs(left_height - right_height) <= 1
            height = max(left_height, right_height) + 1
            
            return height, balanced
        
        _, balanced = check_balance(node)
        return balanced
    
    def diameter(self, node=None):
        """Find diameter of tree (longest path between any two nodes)."""
        if node is None:
            node = self.root
        
        def calculate_diameter(node):
            if not node:
                return 0, 0  # height, diameter
            
            left_height, left_diameter = calculate_diameter(node.left)
            right_height, right_diameter = calculate_diameter(node.right)
            
            current_height = 1 + max(left_height, right_height)
            current_diameter = max(
                left_diameter,
                right_diameter,
                left_height + right_height
            )
            
            return current_height, current_diameter
        
        _, diameter = calculate_diameter(node)
        return diameter
    
    def lowest_common_ancestor(self, p, q, node=None):
        """Find LCA of two nodes in binary tree."""
        if node is None:
            node = self.root
        
        if not node or node == p or node == q:
            return node
        
        left = self.lowest_common_ancestor(p, q, node.left)
        right = self.lowest_common_ancestor(p, q, node.right)
        
        if left and right:
            return node
        
        return left or right

### Binary Search Trees

class BinarySearchTree:
    """Binary Search Tree implementation."""
    
    def __init__(self):
        self.root = None
    
    def insert(self, val):
        """Insert value into BST."""
        self.root = self._insert_recursive(self.root, val)
    
    def _insert_recursive(self, node, val):
        """Recursive helper for insertion."""
        if not node:
            return TreeNode(val)
        
        if val < node.val:
            node.left = self._insert_recursive(node.left, val)
        elif val > node.val:
            node.right = self._insert_recursive(node.right, val)
        
        return node
    
    def search(self, val):
        """Search for value in BST."""
        return self._search_recursive(self.root, val)
    
    def _search_recursive(self, node, val):
        """Recursive helper for search."""
        if not node or node.val == val:
            return node
        
        if val < node.val:
            return self._search_recursive(node.left, val)
        else:
            return self._search_recursive(node.right, val)
    
    def delete(self, val):
        """Delete value from BST."""
        self.root = self._delete_recursive(self.root, val)
    
    def _delete_recursive(self, node, val):
        """Recursive helper for deletion."""
        if not node:
            return node
        
        if val < node.val:
            node.left = self._delete_recursive(node.left, val)
        elif val > node.val:
            node.right = self._delete_recursive(node.right, val)
        else:
            # Node to be deleted found
            if not node.left:
                return node.right
            elif not node.right:
                return node.left
            
            # Node with two children - get inorder successor
            min_node = self._find_min(node.right)
            node.val = min_node.val
            node.right = self._delete_recursive(node.right, min_node.val)
        
        return node
    
    def _find_min(self, node):
        """Find minimum value node."""
        while node.left:
            node = node.left
        return node
    
    def _find_max(self, node):
        """Find maximum value node."""
        while node.right:
            node = node.right
        return node
    
    def inorder(self):
        """Inorder traversal (sorted order for BST)."""
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node, result):
        """Recursive inorder traversal."""
        if node:
            self._inorder_recursive(node.left, result)
            result.append(node.val)
            self._inorder_recursive(node.right, result)
    
    def is_valid_bst(self):
        """Validate if tree is a valid BST."""
        def validate(node, min_val, max_val):
            if not node:
                return True
            
            if node.val <= min_val or node.val >= max_val:
                return False
            
            return (validate(node.left, min_val, node.val) and
                    validate(node.right, node.val, max_val))
        
        return validate(self.root, float('-inf'), float('inf'))
    
    def range_query(self, low, high):
        """Find all values in range [low, high]."""
        result = []
        self._range_query_recursive(self.root, low, high, result)
        return result
    
    def _range_query_recursive(self, node, low, high, result):
        """Recursive range query."""
        if not node:
            return
        
        if low <= node.val <= high:
            result.append(node.val)
        
        if low < node.val:
            self._range_query_recursive(node.left, low, high, result)
        
        if node.val < high:
            self._range_query_recursive(node.right, low, high, result)
```

### AVL Trees (Self-Balancing)

```python
class AVLNode:
    """AVL tree node with height information."""
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
        self.height = 1

class AVLTree:
    """AVL Tree (self-balancing BST) implementation."""
    
    def __init__(self):
        self.root = None
    
    def get_height(self, node):
        """Get height of node."""
        if not node:
            return 0
        return node.height
    
    def get_balance(self, node):
        """Get balance factor of node."""
        if not node:
            return 0
        return self.get_height(node.left) - self.get_height(node.right)
    
    def update_height(self, node):
        """Update height of node."""
        if node:
            node.height = 1 + max(self.get_height(node.left), 
                                  self.get_height(node.right))
    
    def rotate_right(self, y):
        """Right rotation."""
        x = y.left
        T2 = x.right
        
        # Perform rotation
        x.right = y
        y.left = T2
        
        # Update heights
        self.update_height(y)
        self.update_height(x)
        
        return x
    
    def rotate_left(self, x):
        """Left rotation."""
        y = x.right
        T2 = y.left
        
        # Perform rotation
        y.left = x
        x.right = T2
        
        # Update heights
        self.update_height(x)
        self.update_height(y)
        
        return y
    
    def insert(self, val):
        """Insert value into AVL tree."""
        self.root = self._insert_recursive(self.root, val)
    
    def _insert_recursive(self, node, val):
        """Recursive insertion with rebalancing."""
        # Standard BST insertion
        if not node:
            return AVLNode(val)
        
        if val < node.val:
            node.left = self._insert_recursive(node.left, val)
        elif val > node.val:
            node.right = self._insert_recursive(node.right, val)
        else:
            return node  # Duplicate values not allowed
        
        # Update height
        self.update_height(node)
        
        # Get balance factor
        balance = self.get_balance(node)
        
        # Left-Left case
        if balance > 1 and val < node.left.val:
            return self.rotate_right(node)
        
        # Right-Right case
        if balance < -1 and val > node.right.val:
            return self.rotate_left(node)
        
        # Left-Right case
        if balance > 1 and val > node.left.val:
            node.left = self.rotate_left(node.left)
            return self.rotate_right(node)
        
        # Right-Left case
        if balance < -1 and val < node.right.val:
            node.right = self.rotate_right(node.right)
            return self.rotate_left(node)
        
        return node
    
    def delete(self, val):
        """Delete value from AVL tree."""
        self.root = self._delete_recursive(self.root, val)
    
    def _delete_recursive(self, node, val):
        """Recursive deletion with rebalancing."""
        # Standard BST deletion
        if not node:
            return node
        
        if val < node.val:
            node.left = self._delete_recursive(node.left, val)
        elif val > node.val:
            node.right = self._delete_recursive(node.right, val)
        else:
            if not node.left or not node.right:
                temp = node.left or node.right
                if not temp:
                    temp = node
                    node = None
                else:
                    node = temp
            else:
                # Node with two children
                temp = self._find_min(node.right)
                node.val = temp.val
                node.right = self._delete_recursive(node.right, temp.val)
        
        if not node:
            return node
        
        # Update height
        self.update_height(node)
        
        # Get balance factor
        balance = self.get_balance(node)
        
        # Left-Left case
        if balance > 1 and self.get_balance(node.left) >= 0:
            return self.rotate_right(node)
        
        # Left-Right case
        if balance > 1 and self.get_balance(node.left) < 0:
            node.left = self.rotate_left(node.left)
            return self.rotate_right(node)
        
        # Right-Right case
        if balance < -1 and self.get_balance(node.right) <= 0:
            return self.rotate_left(node)
        
        # Right-Left case
        if balance < -1 and self.get_balance(node.right) > 0:
            node.right = self.rotate_right(node.right)
            return self.rotate_left(node)
        
        return node
    
    def _find_min(self, node):
        """Find minimum value node."""
        while node.left:
            node = node.left
        return node
```

**Tree Complexity Analysis:**
| Operation | Binary Tree | BST (Balanced) | BST (Unbalanced) | AVL Tree |
|-----------|-------------|----------------|------------------|----------|
| Search | O(n) | O(log n) | O(n) | O(log n) |
| Insertion | O(n) | O(log n) | O(n) | O(log n) |
| Deletion | O(n) | O(log n) | O(n) | O(log n) |
| Space | O(n) | O(n) | O(n) | O(n) |

**Business Applications:**
- **Database indexing**: B-trees, B+ trees for efficient queries
- **File systems**: Directory structures, file organization
- **Expression parsing**: Abstract syntax trees in compilers
- **Decision trees**: Machine learning, business rule engines
- **Hierarchical data**: Organization charts, category trees

---

## Category 4: Graph Data Structures

### Graph Representations

```python
from collections import defaultdict, deque
import heapq

class Graph:
    """Graph implementation with adjacency list."""
    
    def __init__(self, directed=False):
        self.graph = defaultdict(list)
        self.directed = directed
    
    def add_edge(self, u, v, weight=1):
        """Add edge between vertices u and v."""
        self.graph[u].append((v, weight))
        if not self.directed:
            self.graph[v].append((u, weight))
    
    def add_vertex(self, vertex):
        """Add isolated vertex."""
        if vertex not in self.graph:
            self.graph[vertex] = []
    
    def get_vertices(self):
        """Get all vertices."""
        return list(self.graph.keys())
    
    def get_edges(self):
        """Get all edges."""
        edges = []
        for u in self.graph:
            for v, weight in self.graph[u]:
                if self.directed or u <= v:  # Avoid duplicates in undirected
                    edges.append((u, v, weight))
        return edges
    
    def has_edge(self, u, v):
        """Check if edge exists."""
        for vertex, _ in self.graph[u]:
            if vertex == v:
                return True
        return False
    
    def get_neighbors(self, vertex):
        """Get neighbors of vertex."""
        return [v for v, _ in self.graph[vertex]]
    
    def degree(self, vertex):
        """Get degree of vertex."""
        return len(self.graph[vertex])
    
    def __str__(self):
        result = []
        for vertex in self.graph:
            neighbors = ', '.join(f'{v}({w})' for v, w in self.graph[vertex])
            result.append(f'{vertex}: [{neighbors}]')
        return '\n'.join(result)

class WeightedGraph:
    """Weighted graph with adjacency matrix representation."""
    
    def __init__(self, num_vertices, directed=False):
        self.num_vertices = num_vertices
        self.directed = directed
        self.matrix = [[float('inf')] * num_vertices for _ in range(num_vertices)]
        
        # Distance from vertex to itself is 0
        for i in range(num_vertices):
            self.matrix[i][i] = 0
    
    def add_edge(self, u, v, weight):
        """Add weighted edge."""
        self.matrix[u][v] = weight
        if not self.directed:
            self.matrix[v][u] = weight
    
    def has_edge(self, u, v):
        """Check if edge exists."""
        return self.matrix[u][v] != float('inf')
    
    def get_weight(self, u, v):
        """Get weight of edge."""
        return self.matrix[u][v]
    
    def floyd_warshall(self):
        """Find shortest paths between all pairs of vertices."""
        dist = [row[:] for row in self.matrix]  # Copy matrix
        
        for k in range(self.num_vertices):
            for i in range(self.num_vertices):
                for j in range(self.num_vertices):
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
        
        return dist
    
    def __str__(self):
        result = []
        for row in self.matrix:
            result.append('[' + ', '.join(f'{w:4}' if w != float('inf') else '  ∞' 
                                         for w in row) + ']')
        return '\n'.join(result)

# Graph Algorithms
def dfs(graph, start, visited=None):
    """Depth-first search traversal."""
    if visited is None:
        visited = set()
    
    visited.add(start)
    result = [start]
    
    for neighbor, _ in graph.graph[start]:
        if neighbor not in visited:
            result.extend(dfs(graph, neighbor, visited))
    
    return result

def bfs(graph, start):
    """Breadth-first search traversal."""
    visited = set()
    queue = deque([start])
    result = []
    
    while queue:
        vertex = queue.popleft()
        if vertex not in visited:
            visited.add(vertex)
            result.append(vertex)
            
            for neighbor, _ in graph.graph[vertex]:
                if neighbor not in visited:
                    queue.append(neighbor)
    
    return result

def dijkstra(graph, start):
    """Dijkstra's shortest path algorithm."""
    distances = {vertex: float('inf') for vertex in graph.graph}
    distances[start] = 0
    previous = {vertex: None for vertex in graph.graph}
    
    pq = [(0, start)]
    visited = set()
    
    while pq:
        current_distance, current = heapq.heappop(pq)
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor, weight in graph.graph[current]:
            distance = current_distance + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current
                heapq.heappush(pq, (distance, neighbor))
    
    return distances, previous

def bellman_ford(graph, start):
    """Bellman-Ford algorithm (handles negative weights)."""
    distances = {vertex: float('inf') for vertex in graph.graph}
    distances[start] = 0
    
    # Relax edges V-1 times
    vertices = list(graph.graph.keys())
    for _ in range(len(vertices) - 1):
        for u in graph.graph:
            for v, weight in graph.graph[u]:
                if distances[u] + weight < distances[v]:
                    distances[v] = distances[u] + weight
    
    # Check for negative cycles
    for u in graph.graph:
        for v, weight in graph.graph[u]:
            if distances[u] + weight < distances[v]:
                raise ValueError("Graph contains negative cycle")
    
    return distances

def topological_sort(graph):
    """Topological sort using Kahn's algorithm."""
    in_degree = {vertex: 0 for vertex in graph.graph}
    
    # Calculate in-degrees
    for u in graph.graph:
        for v, _ in graph.graph[u]:
            in_degree[v] = in_degree.get(v, 0) + 1
    
    # Find vertices with no incoming edges
    queue = deque([v for v in in_degree if in_degree[v] == 0])
    result = []
    
    while queue:
        vertex = queue.popleft()
        result.append(vertex)
        
        # Remove edges from current vertex
        for neighbor, _ in graph.graph[vertex]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    if len(result) != len(in_degree):
        raise ValueError("Graph contains cycle - topological sort not possible")
    
    return result

def detect_cycle_undirected(graph):
    """Detect cycle in undirected graph using DFS."""
    visited = set()
    
    def dfs_cycle(vertex, parent):
        visited.add(vertex)
        
        for neighbor, _ in graph.graph[vertex]:
            if neighbor not in visited:
                if dfs_cycle(neighbor, vertex):
                    return True
            elif parent != neighbor:
                return True  # Back edge found
        
        return False
    
    for vertex in graph.graph:
        if vertex not in visited:
            if dfs_cycle(vertex, None):
                return True
    
    return False

def detect_cycle_directed(graph):
    """Detect cycle in directed graph using DFS with colors."""
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {vertex: WHITE for vertex in graph.graph}
    
    def dfs_cycle(vertex):
        if color[vertex] == GRAY:
            return True  # Back edge found
        
        if color[vertex] == BLACK:
            return False  # Already processed
        
        color[vertex] = GRAY
        for neighbor, _ in graph.graph[vertex]:
            if dfs_cycle(neighbor):
                return True
        
        color[vertex] = BLACK
        return False
    
    for vertex in graph.graph:
        if color[vertex] == WHITE:
            if dfs_cycle(vertex):
                return True
    
    return False

class UnionFind:
    """Union-Find (Disjoint Set) data structure."""
    
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.components = n
    
    def find(self, x):
        """Find root of x with path compression."""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x, y):
        """Union sets containing x and y."""
        root_x = self.find(x)
        root_y = self.find(y)
        
        if root_x == root_y:
            return False  # Already in same set
        
        # Union by rank
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        
        self.components -= 1
        return True
    
    def connected(self, x, y):
        """Check if x and y are in same set."""
        return self.find(x) == self.find(y)
    
    def count_components(self):
        """Get number of connected components."""
        return self.components

def kruskal_mst(graph):
    """Kruskal's algorithm for Minimum Spanning Tree."""
    edges = graph.get_edges()
    edges.sort(key=lambda x: x[2])  # Sort by weight
    
    # Create vertex mapping
    vertices = list(graph.graph.keys())
    vertex_map = {v: i for i, v in enumerate(vertices)}
    
    uf = UnionFind(len(vertices))
    mst = []
    total_weight = 0
    
    for u, v, weight in edges:
        u_idx = vertex_map[u]
        v_idx = vertex_map[v]
        
        if uf.union(u_idx, v_idx):
            mst.append((u, v, weight))
            total_weight += weight
            
            if len(mst) == len(vertices) - 1:
                break
    
    return mst, total_weight

def prim_mst(graph, start):
    """Prim's algorithm for Minimum Spanning Tree."""
    mst = []
    visited = {start}
    edges = []
    
    # Add all edges from start vertex
    for neighbor, weight in graph.graph[start]:
        heapq.heappush(edges, (weight, start, neighbor))
    
    while edges and len(visited) < len(graph.graph):
        weight, u, v = heapq.heappop(edges)
        
        if v in visited:
            continue
        
        # Add edge to MST
        mst.append((u, v, weight))
        visited.add(v)
        
        # Add all edges from new vertex
        for neighbor, edge_weight in graph.graph[v]:
            if neighbor not in visited:
                heapq.heappush(edges, (edge_weight, v, neighbor))
    
    total_weight = sum(weight for _, _, weight in mst)
    return mst, total_weight
```

**Graph Algorithm Complexities:**
| Algorithm | Time Complexity | Space Complexity | Use Case |
|-----------|----------------|------------------|----------|
| DFS | O(V + E) | O(V) | Topological sort, cycle detection |
| BFS | O(V + E) | O(V) | Shortest path (unweighted), level traversal |
| Dijkstra | O(E + V log V) | O(V) | Shortest path (positive weights) |
| Bellman-Ford | O(VE) | O(V) | Shortest path (negative weights) |
| Floyd-Warshall | O(V³) | O(V²) | All-pairs shortest paths |
| Kruskal's MST | O(E log E) | O(V) | Minimum spanning tree |
| Prim's MST | O(E + V log V) | O(V) | Minimum spanning tree |

**Business Applications:**
- **Social networks**: Friend recommendations, influence analysis
- **Transportation**: Route optimization, traffic management
- **Network infrastructure**: Internet routing, load balancing
- **Supply chain**: Logistics optimization, dependency management
- **Recommendation systems**: Collaborative filtering, content networks

---

## Category 5: Specialized Data Structures

### Heap (Priority Queue)

```python
class MaxHeap:
    """Max heap implementation."""
    
    def __init__(self):
        self.heap = []
    
    def parent(self, i):
        """Get parent index."""
        return (i - 1) // 2
    
    def left_child(self, i):
        """Get left child index."""
        return 2 * i + 1
    
    def right_child(self, i):
        """Get right child index."""
        return 2 * i + 2
    
    def swap(self, i, j):
        """Swap elements at indices i and j."""
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]
    
    def insert(self, val):
        """Insert value into heap."""
        self.heap.append(val)
        self.heapify_up(len(self.heap) - 1)
    
    def heapify_up(self, i):
        """Maintain heap property upward."""
        parent_idx = self.parent(i)
        if i > 0 and self.heap[i] > self.heap[parent_idx]:
            self.swap(i, parent_idx)
            self.heapify_up(parent_idx)
    
    def extract_max(self):
        """Remove and return maximum element."""
        if not self.heap:
            raise IndexError("Extract from empty heap")
        
        if len(self.heap) == 1:
            return self.heap.pop()
        
        max_val = self.heap[0]
        self.heap[0] = self.heap.pop()
        self.heapify_down(0)
        return max_val
    
    def heapify_down(self, i):
        """Maintain heap property downward."""
        left = self.left_child(i)
        right = self.right_child(i)
        largest = i
        
        if left < len(self.heap) and self.heap[left] > self.heap[largest]:
            largest = left
        
        if right < len(self.heap) and self.heap[right] > self.heap[largest]:
            largest = right
        
        if largest != i:
            self.swap(i, largest)
            self.heapify_down(largest)
    
    def peek(self):
        """Get maximum element without removing."""
        if not self.heap:
            raise IndexError("Peek at empty heap")
        return self.heap[0]
    
    def size(self):
        """Get heap size."""
        return len(self.heap)
    
    def is_empty(self):
        """Check if heap is empty."""
        return len(self.heap) == 0
    
    @classmethod
    def heapify(cls, arr):
        """Build heap from array in O(n) time."""
        heap = cls()
        heap.heap = arr[:]
        
        # Start from last non-leaf node
        for i in range(len(arr) // 2 - 1, -1, -1):
            heap.heapify_down(i)
        
        return heap

class MinHeap:
    """Min heap implementation."""
    
    def __init__(self):
        self.heap = []
    
    def parent(self, i):
        return (i - 1) // 2
    
    def left_child(self, i):
        return 2 * i + 1
    
    def right_child(self, i):
        return 2 * i + 2
    
    def swap(self, i, j):
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]
    
    def insert(self, val):
        """Insert value into min heap."""
        self.heap.append(val)
        self.heapify_up(len(self.heap) - 1)
    
    def heapify_up(self, i):
        """Maintain min heap property upward."""
        parent_idx = self.parent(i)
        if i > 0 and self.heap[i] < self.heap[parent_idx]:
            self.swap(i, parent_idx)
            self.heapify_up(parent_idx)
    
    def extract_min(self):
        """Remove and return minimum element."""
        if not self.heap:
            raise IndexError("Extract from empty heap")
        
        if len(self.heap) == 1:
            return self.heap.pop()
        
        min_val = self.heap[0]
        self.heap[0] = self.heap.pop()
        self.heapify_down(0)
        return min_val
    
    def heapify_down(self, i):
        """Maintain min heap property downward."""
        left = self.left_child(i)
        right = self.right_child(i)
        smallest = i
        
        if left < len(self.heap) and self.heap[left] < self.heap[smallest]:
            smallest = left
        
        if right < len(self.heap) and self.heap[right] < self.heap[smallest]:
            smallest = right
        
        if smallest != i:
            self.swap(i, smallest)
            self.heapify_down(smallest)
    
    def peek(self):
        """Get minimum element without removing."""
        if not self.heap:
            raise IndexError("Peek at empty heap")
        return self.heap[0]

# Heap Applications
def find_kth_largest(nums, k):
    """Find kth largest element using min heap."""
    import heapq
    
    heap = nums[:k]
    heapq.heapify(heap)
    
    for num in nums[k:]:
        if num > heap[0]:
            heapq.heapreplace(heap, num)
    
    return heap[0]

def merge_k_sorted_lists(lists):
    """Merge k sorted lists using heap."""
    import heapq
    
    heap = []
    result = []
    
    # Initialize heap with first element from each list
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], i, 0))
    
    while heap:
        val, list_idx, elem_idx = heapq.heappop(heap)
        result.append(val)
        
        # Add next element from same list
        if elem_idx + 1 < len(lists[list_idx]):
            next_val = lists[list_idx][elem_idx + 1]
            heapq.heappush(heap, (next_val, list_idx, elem_idx + 1))
    
    return result

class MedianFinder:
    """Find median in stream of integers."""
    
    def __init__(self):
        self.max_heap = []  # For smaller half (negated for max behavior)
        self.min_heap = []  # For larger half
    
    def add_number(self, num):
        """Add number to data structure."""
        import heapq
        
        if not self.max_heap or num <= -self.max_heap[0]:
            heapq.heappush(self.max_heap, -num)
        else:
            heapq.heappush(self.min_heap, num)
        
        # Balance heaps
        if len(self.max_heap) > len(self.min_heap) + 1:
            val = -heapq.heappop(self.max_heap)
            heapq.heappush(self.min_heap, val)
        elif len(self.min_heap) > len(self.max_heap) + 1:
            val = heapq.heappop(self.min_heap)
            heapq.heappush(self.max_heap, -val)
    
    def find_median(self):
        """Find median of all numbers."""
        if len(self.max_heap) == len(self.min_heap):
            return (-self.max_heap[0] + self.min_heap[0]) / 2
        elif len(self.max_heap) > len(self.min_heap):
            return -self.max_heap[0]
        else:
            return self.min_heap[0]
```

### Trie (Prefix Tree)

```python
class TrieNode:
    """Trie node with character storage."""
    
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False
        self.word_count = 0

class Trie:
    """Trie (prefix tree) implementation."""
    
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word):
        """Insert word into trie."""
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
            node.word_count += 1
        
        node.is_end_of_word = True
    
    def search(self, word):
        """Search for exact word in trie."""
        node = self._find_node(word)
        return node is not None and node.is_end_of_word
    
    def starts_with(self, prefix):
        """Check if any word starts with prefix."""
        return self._find_node(prefix) is not None
    
    def _find_node(self, prefix):
        """Find node corresponding to prefix."""
        node = self.root
        for char in prefix:
            if char not in node.children:
                return None
            node = node.children[char]
        return node
    
    def delete(self, word):
        """Delete word from trie."""
        def _delete_helper(node, word, index):
            if index == len(word):
                if not node.is_end_of_word:
                    return False  # Word doesn't exist
                
                node.is_end_of_word = False
                return len(node.children) == 0  # Delete node if no children
            
            char = word[index]
            child_node = node.children.get(char)
            
            if not child_node:
                return False  # Word doesn't exist
            
            should_delete_child = _delete_helper(child_node, word, index + 1)
            
            if should_delete_child:
                del node.children[char]
                return (not node.is_end_of_word and 
                        len(node.children) == 0)
            
            return False
        
        _delete_helper(self.root, word, 0)
    
    def get_all_words_with_prefix(self, prefix):
        """Get all words that start with prefix."""
        node = self._find_node(prefix)
        if not node:
            return []
        
        words = []
        self._collect_words(node, prefix, words)
        return words
    
    def _collect_words(self, node, current_word, words):
        """Recursively collect all words from node."""
        if node.is_end_of_word:
            words.append(current_word)
        
        for char, child_node in node.children.items():
            self._collect_words(child_node, current_word + char, words)
    
    def count_words_with_prefix(self, prefix):
        """Count words that start with prefix."""
        node = self._find_node(prefix)
        if not node:
            return 0
        return node.word_count
    
    def longest_common_prefix(self):
        """Find longest common prefix of all words."""
        if not self.root.children:
            return ""
        
        prefix = ""
        node = self.root
        
        while len(node.children) == 1 and not node.is_end_of_word:
            char = next(iter(node.children.keys()))
            prefix += char
            node = node.children[char]
        
        return prefix

# Trie Applications
def word_search_ii(board, words):
    """Find all words in 2D board using trie."""
    def build_trie(words):
        trie = Trie()
        for word in words:
            trie.insert(word)
        return trie
    
    def dfs(i, j, node, path, visited):
        if (i < 0 or i >= len(board) or j < 0 or j >= len(board[0]) or
            (i, j) in visited or board[i][j] not in node.children):
            return
        
        char = board[i][j]
        child_node = node.children[char]
        path += char
        visited.add((i, j))
        
        if child_node.is_end_of_word:
            result.add(path)
        
        # Explore all 4 directions
        for di, dj in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            dfs(i + di, j + dj, child_node, path, visited)
        
        visited.remove((i, j))
    
    trie = build_trie(words)
    result = set()
    
    for i in range(len(board)):
        for j in range(len(board[0])):
            dfs(i, j, trie.root, "", set())
    
    return list(result)

class AutocompleteSystem:
    """Autocomplete system using trie."""
    
    def __init__(self, sentences, times):
        self.trie = Trie()
        self.current_input = ""
        
        # Build trie with sentence frequencies
        for sentence, frequency in zip(sentences, times):
            self._insert_with_frequency(sentence, frequency)
    
    def _insert_with_frequency(self, sentence, frequency):
        """Insert sentence with frequency information."""
        node = self.trie.root
        for char in sentence:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        
        node.is_end_of_word = True
        node.frequency = getattr(node, 'frequency', 0) + frequency
    
    def input(self, c):
        """Process input character."""
        if c == '#':
            # End of sentence - add to trie
            self._insert_with_frequency(self.current_input, 1)
            self.current_input = ""
            return []
        
        self.current_input += c
        
        # Find node for current input
        node = self.trie._find_node(self.current_input)
        if not node:
            return []
        
        # Get all completions
        completions = []
        self._get_completions(node, self.current_input, completions)
        
        # Sort by frequency (descending) then lexicographically
        completions.sort(key=lambda x: (-x[1], x[0]))
        
        return [sentence for sentence, _ in completions[:3]]
    
    def _get_completions(self, node, prefix, completions):
        """Get all sentence completions from current node."""
        if node.is_end_of_word:
            frequency = getattr(node, 'frequency', 1)
            completions.append((prefix, frequency))
        
        for char, child_node in node.children.items():
            self._get_completions(child_node, prefix + char, completions)
```

**Business Applications:**
- **Search engines**: Autocomplete, spell correction, query suggestions
- **Text processing**: Word validation, prefix matching
- **IP routing**: Network routing tables, longest prefix matching
- **File systems**: Path completion, directory navigation
- **DNA analysis**: Genetic sequence matching, pattern discovery

---

## Data Structure Selection Guide

### Performance Comparison Matrix

| Data Structure | Access | Search | Insert | Delete | Space | Best Use Case |
|----------------|--------|--------|--------|--------|-------|---------------|
| Array | O(1) | O(n) | O(n) | O(n) | O(n) | Fixed-size collections, frequent access |
| Dynamic Array | O(1) | O(n) | O(1)* | O(n) | O(n) | Variable-size collections, stack operations |
| Linked List | O(n) | O(n) | O(1) | O(1) | O(n) | Frequent insertion/deletion |
| Stack | - | - | O(1) | O(1) | O(n) | LIFO operations, recursion |
| Queue | - | - | O(1) | O(1) | O(n) | FIFO operations, BFS |
| Hash Table | - | O(1)* | O(1)* | O(1)* | O(n) | Fast lookups, caching |
| Binary Search Tree | - | O(log n)* | O(log n)* | O(log n)* | O(n) | Sorted data, range queries |
| Heap | - | O(n) | O(log n) | O(log n) | O(n) | Priority operations |
| Trie | - | O(m) | O(m) | O(m) | O(ALPHABET_SIZE × N × M) | String operations, prefixes |

*Amortized or average case

### Decision Framework for Managers

**Key Questions to Ask:**
1. **What operations are most frequent?** (Access, search, insert, delete)
2. **What are the performance requirements?** (Latency, throughput)
3. **How does the data size scale?** (Fixed, linear growth, exponential)
4. **What are the memory constraints?** (Cache-friendly, memory-limited)
5. **How complex can maintenance be?** (Team expertise, debugging needs)

**Recommendation Matrix:**

| Requirement | Primary Choice | Alternative | Reason |
|-------------|---------------|-------------|---------|
| Fast random access | Array/Dynamic Array | - | O(1) indexing |
| Fast search | Hash Table | BST | O(1) vs O(log n) lookup |
| Maintaining order | BST/AVL Tree | Sorted Array | Efficient insertion with order |
| Range queries | BST/B-Tree | Sorted Array | Log time range operations |
| Priority operations | Heap | Sorted Array | O(log n) vs O(n) insertion |
| String operations | Trie | Hash Table | Prefix matching capabilities |
| Graph operations | Adjacency List | Adjacency Matrix | Space efficiency for sparse graphs |
| Frequent insertion/deletion | Linked List | Dynamic Array | O(1) vs O(n) operations |
| LIFO operations | Stack | Dynamic Array | Semantic clarity |
| FIFO operations | Queue | Deque | Semantic clarity |

### Real-World System Applications

**E-commerce Platform:**
- **Product catalog**: Hash table for fast lookups, Trie for search suggestions
- **Shopping cart**: Hash table for item storage, priority queue for recommendations
- **Order processing**: Queue for order pipeline, graph for logistics optimization
- **Inventory tracking**: Hash table for item counts, heap for low-stock alerts

**Social Media Platform:**
- **User profiles**: Hash table for fast user lookup
- **Friend networks**: Graph for social connections, adjacency list representation
- **News feed**: Priority queue for feed ranking, timeline as array
- **Message threads**: Linked list for conversation history

**Search Engine:**
- **Web pages**: Trie for URL matching, hash table for page metadata
- **Index**: Inverted index using hash tables, B-trees for large-scale storage
- **Query processing**: Trie for autocompletion, priority queue for result ranking
- **Crawling**: Queue for URL frontier, hash set for visited URLs

### Memory and Cache Considerations

**Cache-Friendly Data Structures:**
- **Arrays**: Excellent cache locality due to contiguous memory
- **B-Trees**: Designed for block-based storage systems
- **Packed structures**: Minimize memory overhead

**Memory-Efficient Choices:**
- **Bit arrays**: For boolean flags and sets
- **Compressed tries**: For large string collections
- **Bloom filters**: For approximate membership testing

**Trade-off Analysis:**
- **Space vs Time**: Hash tables use more memory for faster access
- **Predictable vs Optimal**: Arrays provide predictable performance
- **Simplicity vs Efficiency**: Simple structures often perform better in practice

---

## Interview Strategy and Tips

### Coding Interview Approach

**Step 1: Problem Understanding**
- Ask clarifying questions about data size and constraints
- Understand the types of operations needed
- Identify performance requirements

**Step 2: Data Structure Selection**
- Consider multiple options and explain trade-offs
- Start with simple solution, then optimize
- Justify your choice with complexity analysis

**Step 3: Implementation Strategy**
- Write clean, readable code
- Handle edge cases explicitly
- Test with examples during coding

**Step 4: Optimization Discussion**
- Discuss alternative approaches
- Analyze time and space complexity
- Consider real-world scalability concerns

### Manager-Level Interview Focus

**Technical Leadership Questions:**
- "How would you guide your team in choosing between different data structures?"
- "What factors do you consider when evaluating data structure performance in production?"
- "How do you balance code simplicity with performance optimization?"

**System Design Integration:**
- Connect data structure choices to system architecture
- Discuss scalability implications
- Consider distributed system challenges

**Business Impact Discussion:**
- Relate performance characteristics to business metrics
- Discuss cost implications of different choices
- Consider maintenance and team productivity factors

### Common Pitfalls to Avoid

1. **Over-optimization**: Don't choose complex structures for simple problems
2. **Ignoring constraints**: Consider memory, latency, and scalability requirements
3. **Poor complexity analysis**: Understand amortized vs worst-case scenarios
4. **Neglecting edge cases**: Handle empty inputs, single elements, and boundary conditions
5. **Code quality issues**: Write clean, maintainable code even under pressure

---

## Summary

This comprehensive guide covers the essential data structures needed for Amazon L6/L7 engineering manager interviews. Key takeaways:

**Core Competencies:**
- Understand when and why to use each data structure
- Analyze performance characteristics and trade-offs
- Connect technical choices to business outcomes
- Demonstrate ability to guide and mentor teams

**Business Focus:**
- Performance impacts on user experience and costs
- Scalability considerations for growing systems
- Team productivity and maintenance implications
- Risk assessment and mitigation strategies

**Interview Success:**
- Practice implementing core data structures from scratch
- Focus on explaining trade-offs and design decisions
- Connect technical concepts to real-world applications
- Demonstrate leadership thinking about technical choices

## Related Resources
- **[Algorithms](algorithms.md)** - Algorithmic patterns using these data structures
- **[Amazon Top 100](amazon-top-100.md)** - Practice problems featuring these structures
- **[Coding Strategy](strategy.md)** - Overall approach for L6/L7 coding interviews
- **[System Design](../system-design/index.md)** - Applying data structures to system architecture

---

*This data structures guide provides the foundation for technical decision-making required of L6/L7 engineering managers, emphasizing strategic understanding over implementation details while maintaining the technical depth needed for Amazon interviews.*