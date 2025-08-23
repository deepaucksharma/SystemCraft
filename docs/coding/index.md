# Coding Preparation for Amazon L6/L7 Engineering Managers

## 🎯 The Reality of Coding for EMs (2024-2025)

!!! warning "Critical Update from 2024-2025"
    **May 2024**: "Amazon doesn't ask to code unless super optimal solution approach given"
    
    **L7 Loops**: Often 0-1 coding rounds, focus on architectural implications
    
    **January 2024**: "Master system design and behavioral over coding"

Despite this trend, coding remains a credibility gate. You must demonstrate you can still think algorithmically and write clean code under pressure.

## 📊 Coding Requirements by Level

### L6 vs L7 Coding Expectations

| Aspect | L6 Requirement | L7 Requirement |
|--------|:-------------:|:-------------:|
| **Number of Rounds** | 1-2 rounds | 0-1 rounds |
| **Difficulty Level** | LeetCode Medium | Medium (if asked) |
| **Time per Problem** | 30-40 minutes | 20-30 minutes |
| **Focus** | Clean, optimal code | Design patterns & trade-offs |
| **Language Choice** | Python, Java, C++ | Any (Python preferred) |
| **Evaluation** | Correctness + efficiency | Approach + architecture |

## 🔥 Actual Coding Questions from 2024-2025 Interviews

### Confirmed L6 Questions

#### 1. Longest Substring Without Repeating Characters
**Asked**: December 2024, Senior Engineering Manager (L6)
```python
def length_of_longest_substring(s: str) -> int:
    """
    Time: O(n), Space: O(min(n, m)) where m is size of charset
    """
    if not isinstance(s, str):
        raise TypeError("Input must be a string")
    if not s:
        return 0
    
    char_index = {}
    max_length = 0
    start = 0
    
    for i, char in enumerate(s):
        if char in char_index and char_index[char] >= start:
            start = char_index[char] + 1
        char_index[char] = i
        max_length = max(max_length, i - start + 1)
    
    return max_length

# Follow-up: Handle Unicode characters
# Follow-up: What if we want the actual substring?
```

#### 2. LRU Cache Implementation
**Asked**: January 2025, Multiple L6 loops
```python
class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head
    
    def _add_node(self, node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node
    
    def _remove_node(self, node):
        prev = node.prev
        next_node = node.next
        prev.next = next_node
        next_node.prev = prev
    
    def _move_to_head(self, node):
        self._remove_node(node)
        self._add_node(node)
    
    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self._move_to_head(node)
            return node.value
        return -1
    
    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._move_to_head(node)
        else:
            node = Node(key, value)
            self.cache[key] = node
            self._add_node(node)
            
            if len(self.cache) > self.capacity:
                tail = self.tail.prev
                self._remove_node(tail)
                del self.cache[tail.key]

# Discussion points:
# - Thread safety considerations
# - Distributed cache implications
# - TTL implementation
```

#### 3. Number of Islands (Graph Problem)
**Asked**: November 2024, System Design follow-up
```python
def num_islands(grid: List[List[str]]) -> int:
    """
    Find number of islands in 2D grid
    Time: O(m*n), Space: O(min(m,n)) for BFS queue
    """
    if not grid:
        return 0
    
    rows, cols = len(grid), len(grid[0])
    islands = 0
    
    def bfs(r, c):
        queue = collections.deque([(r, c)])
        grid[r][c] = '0'  # Mark as visited
        
        while queue:
            row, col = queue.popleft()
            directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
            
            for dr, dc in directions:
                r, c = row + dr, col + dc
                if (0 <= r < rows and 0 <= c < cols and 
                    grid[r][c] == '1'):
                    queue.append((r, c))
                    grid[r][c] = '0'
    
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                islands += 1
                bfs(r, c)
    
    return islands

# Follow-up: What if grid doesn't fit in memory?
# Follow-up: Parallel processing approach?
```

### L7 Coding Discussions (When Asked)

#### Design Pattern Focus Example
**Topic**: Rate Limiting Implementation
```python
import time
from collections import deque
from threading import Lock

class RateLimiter:
    """
    L7 Discussion: Distributed rate limiting at scale
    """
    
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = deque()
        self.lock = Lock()
    
    def allow_request(self) -> bool:
        with self.lock:
            current_time = time.time()
            
            # Remove old requests outside window
            while self.requests and self.requests[0] <= current_time - self.window_seconds:
                self.requests.popleft()
            
            if len(self.requests) < self.max_requests:
                self.requests.append(current_time)
                return True
            
            return False

# L7 Discussion Points:
# 1. How to make this distributed? (Redis with Lua scripts)
# 2. Handle clock skew across servers
# 3. Different algorithms: Token bucket vs sliding window
# 4. Per-user vs per-IP vs per-API limiting
# 5. Graceful degradation strategies
```

## 📚 Must-Know Patterns for Amazon Interviews

### 1. Two Pointers Pattern

**When to Use**: Arrays, strings, linked lists
**Key Problems**: Two sum, container with most water, 3sum

```python
def two_sum_sorted(nums: List[int], target: int) -> List[int]:
    """
    Classic two pointer approach
    Time: O(n), Space: O(1)
    """
    if not nums:
        return []
    if len(nums) < 2:
        return []
        
    left, right = 0, len(nums) - 1
    
    while left < right:
        current_sum = nums[left] + nums[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return []
```

### 2. Sliding Window Pattern

**When to Use**: Subarray/substring problems
**Key Problems**: Maximum subarray, longest substring

```python
def max_sum_subarray(nums: List[int], k: int) -> int:
    """
    Fixed size sliding window
    Time: O(n), Space: O(1)
    """
    if len(nums) < k:
        return 0
    
    window_sum = sum(nums[:k])
    max_sum = window_sum
    
    for i in range(k, len(nums)):
        window_sum = window_sum - nums[i-k] + nums[i]
        max_sum = max(max_sum, window_sum)
    
    return max_sum

def longest_substring_k_distinct(s: str, k: int) -> int:
    """
    Variable size sliding window
    Time: O(n), Space: O(k)
    """
    char_count = {}
    max_length = 0
    left = 0
    
    for right in range(len(s)):
        char_count[s[right]] = char_count.get(s[right], 0) + 1
        
        while len(char_count) > k:
            char_count[s[left]] -= 1
            if char_count[s[left]] == 0:
                del char_count[s[left]]
            left += 1
        
        max_length = max(max_length, right - left + 1)
    
    return max_length
```

### 3. BFS/DFS Patterns

**When to Use**: Trees, graphs, matrices
**Key Problems**: Islands, shortest path, tree traversal

```python
# BFS Template
from collections import deque

def bfs_template(root):
    if not root:
        return
    
    queue = deque([root])
    visited = set([root])
    level = 0
    
    while queue:
        size = len(queue)
        for _ in range(size):
            node = queue.popleft()
            # Process node
            
            for neighbor in get_neighbors(node):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        level += 1

# DFS Template
def dfs_template(node, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(node)
    # Process node
    
    for neighbor in get_neighbors(node):
        if neighbor not in visited:
            dfs_template(neighbor, visited)
    
    return visited
```

### 4. Dynamic Programming (Basic for L6)

**When to Use**: Optimization problems, counting problems
**Key Problems**: Coin change, climbing stairs, knapsack

```python
def coin_change(coins: List[int], amount: int) -> int:
    """
    Classic DP problem
    Time: O(amount * len(coins)), Space: O(amount)
    """
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1
```

### 5. Binary Search Variations

**When to Use**: Sorted arrays, search space reduction
**Key Problems**: Search rotated array, find peak element

```python
def search_rotated_array(nums: List[int], target: int) -> int:
    """
    Binary search in rotated sorted array
    Time: O(log n), Space: O(1)
    """
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if nums[mid] == target:
            return mid
        
        # Left half is sorted
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        # Right half is sorted
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    
    return -1
```

## 🎮 Amazon's Top 100 LeetCode Problems

### Priority Problems for L6 (Must Do)

| Problem | Pattern | Difficulty | Frequency |
|---------|---------|------------|-----------|
| Two Sum | Hash Table | Easy | Very High |
| LRU Cache | Design | Medium | Very High |
| Number of Islands | BFS/DFS | Medium | High |
| Meeting Rooms II | Intervals | Medium | High |
| Reorder Data in Log Files | Sorting | Easy | High |
| K Closest Points | Heap | Medium | High |
| Merge K Sorted Lists | Heap/Merge | Hard | Medium |
| Word Ladder | BFS | Medium | Medium |
| Rotting Oranges | BFS | Medium | High |
| Min Stack | Design | Easy | High |

### Additional for Complete Prep

[Full list of 100 problems with solutions available in our problem bank]

## ⏱️ Time Management Strategy

### 45-Minute Coding Interview Breakdown

```
0-5 min: Understand & Clarify
- Read problem carefully
- Ask clarifying questions
- Confirm examples
- Discuss edge cases

5-10 min: Design Approach
- Discuss 2-3 approaches
- Analyze time/space complexity
- Choose optimal approach
- Get interviewer buy-in

10-30 min: Implementation
- Write clean, modular code
- Use meaningful variable names
- Add comments for complex logic
- Handle edge cases

30-38 min: Testing
- Walk through example
- Test edge cases
- Fix any bugs

38-43 min: Optimization
- Discuss optimizations
- Implement if time permits
- Discuss trade-offs

43-45 min: Questions
- Ask about team/tech stack
- Show interest
```

## 💡 Coding Best Practices for Interviews

### Code Quality Checklist

```python
# ✅ GOOD: Clear, production-ready code
def find_duplicates(nums: List[int]) -> List[int]:
    """
    Find all duplicates in array where 1 ≤ a[i] ≤ n
    Time: O(n), Space: O(1) - modifies input
    """
    duplicates = []
    
    for num in nums:
        index = abs(num) - 1
        if nums[index] < 0:
            duplicates.append(abs(num))
        else:
            nums[index] = -nums[index]
    
    # Restore array
    for i in range(len(nums)):
        nums[i] = abs(nums[i])
    
    return duplicates

# ❌ BAD: Unclear, no error handling
def findDup(a):
    d = []
    for i in a:
        idx = abs(i) - 1
        if a[idx] < 0:
            d.append(abs(i))
        a[idx] = -a[idx]
    return d
```

### Communication During Coding

**What to Say While Coding:**
- "Let me handle the edge case where the array is empty"
- "I'm using a hashmap here for O(1) lookups"
- "This gives us O(n) time complexity with O(k) space"
- "Let me trace through an example to verify"

## 📈 Preparation Timeline

### Month 1-2: Foundation (50 problems)
- Week 1-2: Easy problems (20)
- Week 3-4: Two pointers, sliding window (15)
- Week 5-6: BFS/DFS basics (15)
- Week 7-8: Review and reinforce

### Month 3-4: Core Patterns (50 problems)
- Week 9-10: Binary search variations (15)
- Week 11-12: Basic DP (15)
- Week 13-14: Heap/Priority Queue (10)
- Week 15-16: Design problems (10)

### Month 5-6: Polish (50 problems)
- Week 17-18: Medium problems mix (20)
- Week 19-20: Mock interviews (15)
- Week 21-22: Weak areas (10)
- Week 23-24: Final review (5)

## 🎯 L6 vs L7 Coding Strategy

### L6 Strategy
- Master the fundamentals
- Focus on clean, optimal solutions
- Be ready for 2 problems
- Practice explaining while coding

### L7 Strategy
- Focus on system design implications
- Be ready to discuss but not code
- If asked to code, keep it high-level
- Emphasize architectural decisions

## ⚠️ Common Coding Interview Mistakes

1. **Not asking clarifying questions**
2. **Jumping to code too quickly**
3. **Not considering edge cases**
4. **Poor variable naming**
5. **Not testing the solution**
6. **Getting stuck and not asking for hints**
7. **Optimizing prematurely**

## 🚀 Resources for Practice

### Online Platforms
- **LeetCode**: Filter by Amazon tag
- **HackerRank**: Amazon-specific prep
- **Pramp**: Free mock interviews
- **InterviewBit**: Structured path

### Books
- "Cracking the Coding Interview" - Classic prep
- "Elements of Programming Interviews" - Advanced
- "Grokking the Coding Interview" - Pattern-based

### Time Investment
- L6: 2 problems daily (1 hour)
- L7: 3 problems weekly (30 min each)

---

!!! tip "Final Advice"
    For L6/L7 EM roles, coding is about demonstrating you haven't lost touch with technical work. You don't need to be a competitive programmer, but you must show clean thinking and good engineering practices. Focus on communication and approach over perfect syntax.

---

*Next: [Coding Strategy Deep Dive](strategy.md) →*