# Essential Algorithms for Amazon L6/L7 Engineering Managers

!!! info "Manager-Level Algorithm Understanding"
    This guide focuses on algorithmic thinking and problem-solving approaches essential for L6/L7 engineering managers, emphasizing when and why to use different algorithms rather than implementation details.

## L6/L7 Algorithm Framework

### 1. Algorithmic Thinking for Engineering Managers

#### Strategic Understanding vs Implementation Details
```markdown
**L6/L7 Manager Focus:**
- Understanding algorithm complexity and performance characteristics
- Knowing when to recommend different algorithmic approaches
- Ability to evaluate and guide technical proposals involving algorithms
- Connecting algorithmic choices to business and system requirements

**Key Concepts:**
- Time and space complexity analysis (Big O)
- Trade-offs between different algorithmic approaches
- Practical applications in system design and architecture
- Performance implications for large-scale systems
```

### 2. Core Algorithm Categories

## Category 1: Sorting and Searching Algorithms

### Binary Search and Variants

**Core Algorithm:**
```python
def binary_search(arr, target):
    """Standard binary search implementation."""
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
```

**Manager Applications:**
- Database indexing strategies
- System configuration lookups
- Load balancing algorithms
- Cache eviction policies

**Advanced Variants:**
```python
def search_first_occurrence(arr, target):
    """Find first occurrence of target."""
    left, right = 0, len(arr) - 1
    result = -1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            result = mid
            right = mid - 1  # Continue searching left
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result

def search_in_rotated_array(nums, target):
    """Search in rotated sorted array."""
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if nums[mid] == target:
            return mid
        
        # Determine which half is sorted
        if nums[left] <= nums[mid]:  # Left half is sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:  # Right half is sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    
    return -1
```

**Business Context:**
- Time Complexity: O(log n)
- Space Complexity: O(1)
- Use Cases: Efficient lookups in sorted data, database queries
- Trade-offs: Requires sorted data vs linear search flexibility

### Sorting Algorithms

**Merge Sort (Stable, Divide & Conquer):**
```python
def merge_sort(arr):
    """Merge sort with stable sorting property."""
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    """Merge two sorted arrays."""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

**Quick Sort (In-place, Average O(n log n)):**
```python
def quick_sort(arr, low=0, high=None):
    """In-place quick sort implementation."""
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        pivot = partition(arr, low, high)
        quick_sort(arr, low, pivot - 1)
        quick_sort(arr, pivot + 1, high)

def partition(arr, low, high):
    """Partition array around pivot."""
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
```

**Manager Decision Matrix:**
| Algorithm | Time (Avg) | Time (Worst) | Space | Stable | Use Case |
|-----------|------------|--------------|-------|---------|----------|
| Merge Sort | O(n log n) | O(n log n) | O(n) | Yes | External sorting, guaranteed performance |
| Quick Sort | O(n log n) | O(n²) | O(log n) | No | In-memory sorting, average case performance |
| Heap Sort | O(n log n) | O(n log n) | O(1) | No | Memory-constrained environments |

## Category 2: Graph Algorithms

### Breadth-First Search (BFS)

**Core Implementation:**
```python
from collections import deque

def bfs(graph, start):
    """BFS traversal of graph."""
    visited = set()
    queue = deque([start])
    result = []
    
    while queue:
        node = queue.popleft()
        if node not in visited:
            visited.add(node)
            result.append(node)
            
            # Add neighbors to queue
            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    queue.append(neighbor)
    
    return result

def shortest_path_bfs(graph, start, end):
    """Find shortest path using BFS."""
    if start == end:
        return [start]
    
    visited = set()
    queue = deque([(start, [start])])
    
    while queue:
        node, path = queue.popleft()
        
        if node in visited:
            continue
        visited.add(node)
        
        for neighbor in graph.get(node, []):
            if neighbor == end:
                return path + [neighbor]
            
            if neighbor not in visited:
                queue.append((neighbor, path + [neighbor]))
    
    return None  # No path found
```

**System Applications:**
- Network routing protocols
- Social network analysis (friends of friends)
- Dependency resolution systems
- Load balancing across servers

### Depth-First Search (DFS)

**Recursive and Iterative Implementations:**
```python
def dfs_recursive(graph, node, visited=None):
    """Recursive DFS implementation."""
    if visited is None:
        visited = set()
    
    visited.add(node)
    result = [node]
    
    for neighbor in graph.get(node, []):
        if neighbor not in visited:
            result.extend(dfs_recursive(graph, neighbor, visited))
    
    return result

def dfs_iterative(graph, start):
    """Iterative DFS using stack."""
    visited = set()
    stack = [start]
    result = []
    
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            result.append(node)
            
            # Add neighbors to stack (reverse order for consistent traversal)
            for neighbor in reversed(graph.get(node, [])):
                if neighbor not in visited:
                    stack.append(neighbor)
    
    return result

def detect_cycle_dfs(graph):
    """Detect cycle in directed graph using DFS."""
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in graph}
    
    def has_cycle(node):
        if color[node] == GRAY:
            return True  # Back edge found
        
        if color[node] == BLACK:
            return False  # Already processed
        
        color[node] = GRAY
        for neighbor in graph.get(node, []):
            if has_cycle(neighbor):
                return True
        
        color[node] = BLACK
        return False
    
    for node in graph:
        if color[node] == WHITE:
            if has_cycle(node):
                return True
    return False
```

**Business Applications:**
- Dependency analysis in microservices
- File system traversal
- Compiler optimization
- Task scheduling with dependencies

### Topological Sort

**Implementation for Task Scheduling:**
```python
def topological_sort_kahn(graph):
    """Kahn's algorithm for topological sorting."""
    # Calculate in-degrees
    in_degree = {node: 0 for node in graph}
    for node in graph:
        for neighbor in graph[node]:
            in_degree[neighbor] = in_degree.get(neighbor, 0) + 1
    
    # Find nodes with no incoming edges
    queue = deque([node for node in in_degree if in_degree[node] == 0])
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        # Remove edges from current node
        for neighbor in graph.get(node, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    # Check if topological sort is possible (no cycles)
    if len(result) != len(graph):
        return None  # Cycle detected
    
    return result

def topological_sort_dfs(graph):
    """DFS-based topological sorting."""
    visited = set()
    stack = []
    
    def dfs(node):
        visited.add(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                dfs(neighbor)
        stack.append(node)
    
    for node in graph:
        if node not in visited:
            dfs(node)
    
    return stack[::-1]  # Reverse to get correct order
```

**Manager Use Cases:**
- Build system dependency resolution
- Task scheduling in distributed systems
- Database query optimization
- Package management systems

### Shortest Path Algorithms

**Dijkstra's Algorithm:**
```python
import heapq

def dijkstra(graph, start):
    """Dijkstra's algorithm for shortest paths."""
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    visited = set()
    
    while pq:
        current_distance, current = heapq.heappop(pq)
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor, weight in graph[current].items():
            distance = current_distance + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    
    return distances

def dijkstra_with_path(graph, start, end):
    """Dijkstra with path reconstruction."""
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    previous = {node: None for node in graph}
    pq = [(0, start)]
    visited = set()
    
    while pq:
        current_distance, current = heapq.heappop(pq)
        
        if current == end:
            break
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor, weight in graph[current].items():
            distance = current_distance + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current
                heapq.heappush(pq, (distance, neighbor))
    
    # Reconstruct path
    path = []
    current = end
    while current is not None:
        path.append(current)
        current = previous[current]
    
    return distances[end], path[::-1]
```

**System Design Applications:**
- Network routing optimization
- GPS navigation systems  
- Load balancer path selection
- Cost optimization in cloud infrastructure

## Category 3: Dynamic Programming

### Classic DP Problems with System Applications

**Longest Common Subsequence (LCS):**
```python
def lcs_length(text1, text2):
    """Find length of longest common subsequence."""
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]

def lcs_string(text1, text2):
    """Return the actual LCS string."""
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Build DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    # Reconstruct LCS
    lcs = []
    i, j = m, n
    while i > 0 and j > 0:
        if text1[i-1] == text2[j-1]:
            lcs.append(text1[i-1])
            i -= 1
            j -= 1
        elif dp[i-1][j] > dp[i][j-1]:
            i -= 1
        else:
            j -= 1
    
    return ''.join(lcs[::-1])
```

**Business Applications:**
- Version control diff algorithms
- DNA sequence analysis in bioinformatics
- Text similarity in search engines
- Code plagiarism detection

**Knapsack Problem (Resource Optimization):**
```python
def knapsack_01(weights, values, capacity):
    """0/1 Knapsack problem solution."""
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(
                    dp[i-1][w],  # Don't include current item
                    dp[i-1][w - weights[i-1]] + values[i-1]  # Include current item
                )
            else:
                dp[i][w] = dp[i-1][w]
    
    return dp[n][capacity]

def knapsack_with_items(weights, values, capacity):
    """Return both max value and selected items."""
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    # Build DP table
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(
                    dp[i-1][w],
                    dp[i-1][w - weights[i-1]] + values[i-1]
                )
            else:
                dp[i][w] = dp[i-1][w]
    
    # Find selected items
    selected_items = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i-1][w]:
            selected_items.append(i-1)
            w -= weights[i-1]
    
    return dp[n][capacity], selected_items[::-1]

def unbounded_knapsack(weights, values, capacity):
    """Unbounded knapsack (unlimited items of each type)."""
    dp = [0] * (capacity + 1)
    
    for w in range(1, capacity + 1):
        for i in range(len(weights)):
            if weights[i] <= w:
                dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    
    return dp[capacity]
```

**System Design Applications:**
- Resource allocation in cloud computing
- Task scheduling with constraints
- Cache management with size limits
- Budget optimization across projects

**Coin Change Problem:**
```python
def coin_change_min(coins, amount):
    """Minimum coins needed to make amount."""
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1

def coin_change_ways(coins, amount):
    """Number of ways to make amount."""
    dp = [0] * (amount + 1)
    dp[0] = 1
    
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] += dp[i - coin]
    
    return dp[amount]
```

**Business Applications:**
- Currency exchange optimization
- Change-making in payment systems
- Resource unit optimization
- Pricing strategy combinations

### Edit Distance (Levenshtein Distance)

```python
def edit_distance(word1, word2):
    """Calculate minimum edit distance between two strings."""
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Initialize base cases
    for i in range(m + 1):
        dp[i][0] = i  # Delete all characters from word1
    for j in range(n + 1):
        dp[0][j] = j  # Insert all characters to make word2
    
    # Fill DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]  # No operation needed
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j],      # Delete from word1
                    dp[i][j-1],      # Insert into word1
                    dp[i-1][j-1]     # Replace in word1
                )
    
    return dp[m][n]

def edit_distance_with_operations(word1, word2):
    """Return edit distance and the operations needed."""
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Initialize and fill DP table (same as above)
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    
    # Reconstruct operations
    operations = []
    i, j = m, n
    while i > 0 or j > 0:
        if i > 0 and j > 0 and word1[i-1] == word2[j-1]:
            i -= 1
            j -= 1
        elif i > 0 and j > 0 and dp[i][j] == dp[i-1][j-1] + 1:
            operations.append(f"Replace '{word1[i-1]}' with '{word2[j-1]}'")
            i -= 1
            j -= 1
        elif i > 0 and dp[i][j] == dp[i-1][j] + 1:
            operations.append(f"Delete '{word1[i-1]}'")
            i -= 1
        elif j > 0 and dp[i][j] == dp[i][j-1] + 1:
            operations.append(f"Insert '{word2[j-1]}'")
            j -= 1
    
    return dp[m][n], operations[::-1]
```

**Applications in Systems:**
- Spell checkers and autocorrect
- Version control systems (diff algorithms)
- DNA sequence alignment
- Fuzzy string matching in search

## Category 4: Tree Algorithms

### Binary Search Tree Operations

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def insert_bst(root, val):
    """Insert value into BST."""
    if not root:
        return TreeNode(val)
    
    if val < root.val:
        root.left = insert_bst(root.left, val)
    else:
        root.right = insert_bst(root.right, val)
    
    return root

def search_bst(root, val):
    """Search for value in BST."""
    if not root or root.val == val:
        return root
    
    if val < root.val:
        return search_bst(root.left, val)
    else:
        return search_bst(root.right, val)

def delete_bst(root, val):
    """Delete value from BST."""
    if not root:
        return root
    
    if val < root.val:
        root.left = delete_bst(root.left, val)
    elif val > root.val:
        root.right = delete_bst(root.right, val)
    else:
        # Node to be deleted found
        if not root.left:
            return root.right
        elif not root.right:
            return root.left
        
        # Node with two children
        min_larger_node = find_min(root.right)
        root.val = min_larger_node.val
        root.right = delete_bst(root.right, min_larger_node.val)
    
    return root

def find_min(root):
    """Find minimum value node in BST."""
    while root.left:
        root = root.left
    return root
```

### Tree Traversal Algorithms

```python
def inorder_traversal(root):
    """Inorder traversal (left, root, right)."""
    result = []
    
    def inorder(node):
        if node:
            inorder(node.left)
            result.append(node.val)
            inorder(node.right)
    
    inorder(root)
    return result

def preorder_traversal(root):
    """Preorder traversal (root, left, right)."""
    result = []
    
    def preorder(node):
        if node:
            result.append(node.val)
            preorder(node.left)
            preorder(node.right)
    
    preorder(root)
    return result

def postorder_traversal(root):
    """Postorder traversal (left, right, root)."""
    result = []
    
    def postorder(node):
        if node:
            postorder(node.left)
            postorder(node.right)
            result.append(node.val)
    
    postorder(root)
    return result

def level_order_traversal(root):
    """Level order traversal using queue."""
    if not root:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        level_size = len(queue)
        level = []
        
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.val)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        result.append(level)
    
    return result
```

### Tree Validation and Properties

```python
def is_valid_bst(root):
    """Validate if tree is a valid BST."""
    def validate(node, min_val, max_val):
        if not node:
            return True
        
        if node.val <= min_val or node.val >= max_val:
            return False
        
        return (validate(node.left, min_val, node.val) and
                validate(node.right, node.val, max_val))
    
    return validate(root, float('-inf'), float('inf'))

def max_depth(root):
    """Find maximum depth of binary tree."""
    if not root:
        return 0
    
    return 1 + max(max_depth(root.left), max_depth(root.right))

def is_balanced(root):
    """Check if binary tree is height-balanced."""
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
    
    _, balanced = check_balance(root)
    return balanced

def lowest_common_ancestor(root, p, q):
    """Find LCA of two nodes in BST."""
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root
    return None
```

## Category 5: String Algorithms

### Pattern Matching Algorithms

**KMP (Knuth-Morris-Pratt) Algorithm:**
```python
def kmp_search(text, pattern):
    """KMP pattern matching algorithm."""
    def compute_lps(pattern):
        """Compute longest proper prefix which is also suffix."""
        m = len(pattern)
        lps = [0] * m
        length = 0
        i = 1
        
        while i < m:
            if pattern[i] == pattern[length]:
                length += 1
                lps[i] = length
                i += 1
            else:
                if length != 0:
                    length = lps[length - 1]
                else:
                    lps[i] = 0
                    i += 1
        return lps
    
    n, m = len(text), len(pattern)
    if m == 0:
        return []
    
    lps = compute_lps(pattern)
    matches = []
    i = j = 0
    
    while i < n:
        if pattern[j] == text[i]:
            i += 1
            j += 1
        
        if j == m:
            matches.append(i - j)
            j = lps[j - 1]
        elif i < n and pattern[j] != text[i]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
    
    return matches
```

**Rabin-Karp Algorithm (Rolling Hash):**
```python
def rabin_karp_search(text, pattern):
    """Rabin-Karp pattern matching with rolling hash."""
    def hash_function(s, end):
        """Simple polynomial hash function."""
        h = 0
        for i in range(end):
            h = h * 256 + ord(s[i])
        return h
    
    def rolling_hash(h, old_char, new_char, pattern_len, base_power):
        """Update hash by removing old_char and adding new_char."""
        h -= ord(old_char) * base_power
        h = h * 256 + ord(new_char)
        return h
    
    n, m = len(text), len(pattern)
    if m > n:
        return []
    
    base = 256
    base_power = base ** (m - 1)
    
    pattern_hash = hash_function(pattern, m)
    text_hash = hash_function(text, m)
    
    matches = []
    
    for i in range(n - m + 1):
        if pattern_hash == text_hash:
            # Hash match - verify actual string
            if text[i:i + m] == pattern:
                matches.append(i)
        
        # Calculate hash for next window
        if i < n - m:
            text_hash = rolling_hash(text_hash, text[i], text[i + m], m, base_power)
    
    return matches
```

### String Transformation Algorithms

**Z Algorithm (Linear Pattern Matching):**
```python
def z_algorithm(s):
    """Z algorithm for pattern matching."""
    n = len(s)
    z = [0] * n
    z[0] = n
    l, r = 0, 0
    
    for i in range(1, n):
        if i <= r:
            z[i] = min(r - i + 1, z[i - l])
        
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        
        if i + z[i] - 1 > r:
            l, r = i, i + z[i] - 1
    
    return z

def find_pattern_z(text, pattern):
    """Find pattern in text using Z algorithm."""
    combined = pattern + "$" + text
    z = z_algorithm(combined)
    
    matches = []
    pattern_len = len(pattern)
    
    for i in range(pattern_len + 1, len(combined)):
        if z[i] == pattern_len:
            matches.append(i - pattern_len - 1)
    
    return matches
```

**Longest Palindromic Substring:**
```python
def longest_palindromic_substring(s):
    """Find longest palindromic substring."""
    def expand_around_center(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return right - left - 1
    
    start = 0
    max_len = 0
    
    for i in range(len(s)):
        # Check for odd length palindromes
        len1 = expand_around_center(i, i)
        # Check for even length palindromes
        len2 = expand_around_center(i, i + 1)
        
        current_max = max(len1, len2)
        if current_max > max_len:
            max_len = current_max
            start = i - (current_max - 1) // 2
    
    return s[start:start + max_len]

def manacher_algorithm(s):
    """Manacher's algorithm for finding all palindromes."""
    # Preprocess string to handle even length palindromes
    processed = '#'.join('^{}$'.format(s))
    n = len(processed)
    P = [0] * n  # P[i] = length of palindrome centered at i
    center = right = 0
    
    for i in range(1, n - 1):
        mirror = 2 * center - i
        
        if i < right:
            P[i] = min(right - i, P[mirror])
        
        # Try to expand palindrome centered at i
        try:
            while processed[i + (P[i] + 1)] == processed[i - (P[i] + 1)]:
                P[i] += 1
        except IndexError:
            pass
        
        # If palindrome centered at i extends past right, adjust center and right
        if i + P[i] > right:
            center, right = i, i + P[i]
    
    # Find the longest palindrome
    max_len = 0
    center_index = 0
    for i in range(1, n - 1):
        if P[i] > max_len:
            max_len = P[i]
            center_index = i
    
    start = (center_index - max_len) // 2
    return s[start:start + max_len]
```

## Algorithm Complexity Analysis

### Big O Complexity Reference

**Time Complexity Hierarchy:**
```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n) < O(n!)

Constant < Logarithmic < Linear < Log-linear < Quadratic < Exponential < Factorial
```

**Common Algorithm Complexities:**

| Algorithm Type | Best Case | Average Case | Worst Case | Space |
|----------------|-----------|--------------|------------|-------|
| Binary Search | O(1) | O(log n) | O(log n) | O(1) |
| Linear Search | O(1) | O(n) | O(n) | O(1) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) |
| BFS/DFS | O(V + E) | O(V + E) | O(V + E) | O(V) |
| Dijkstra | O(V²) | O(E + V log V) | O(E + V log V) | O(V) |
| Dynamic Programming | Varies | O(n × m) | O(n × m) | O(n × m) |

### Space-Time Trade-offs

**Optimization Strategies:**
```python
# Time-optimized approach (more space)
def fibonacci_memoized(n, memo={}):
    """Fibonacci with memoization - O(n) time, O(n) space."""
    if n in memo:
        return memo[n]
    if n <= 2:
        return 1
    memo[n] = fibonacci_memoized(n-1, memo) + fibonacci_memoized(n-2, memo)
    return memo[n]

# Space-optimized approach (more time if called repeatedly)
def fibonacci_iterative(n):
    """Fibonacci iterative - O(n) time, O(1) space."""
    if n <= 2:
        return 1
    a, b = 1, 1
    for _ in range(2, n):
        a, b = b, a + b
    return b

# Matrix exponentiation approach - O(log n) time, O(1) space
def fibonacci_matrix(n):
    """Fibonacci using matrix exponentiation."""
    def matrix_multiply(A, B):
        return [[A[0][0]*B[0][0] + A[0][1]*B[1][0], A[0][0]*B[0][1] + A[0][1]*B[1][1]],
                [A[1][0]*B[0][0] + A[1][1]*B[1][0], A[1][0]*B[0][1] + A[1][1]*B[1][1]]]
    
    def matrix_power(matrix, power):
        if power == 1:
            return matrix
        if power % 2 == 0:
            half = matrix_power(matrix, power // 2)
            return matrix_multiply(half, half)
        else:
            return matrix_multiply(matrix, matrix_power(matrix, power - 1))
    
    if n <= 2:
        return 1
    base_matrix = [[1, 1], [1, 0]]
    result_matrix = matrix_power(base_matrix, n - 1)
    return result_matrix[0][0]
```

## System Design Integration

### Algorithm Selection Framework

**Decision Matrix for Algorithm Selection:**

| System Requirement | Recommended Algorithms | Trade-off Considerations |
|-------------------|----------------------|------------------------|
| Real-time Response | Binary Search, Hash Tables | Low latency vs. preprocessing cost |
| Large Dataset Processing | External Sort, MapReduce | Scalability vs. complexity |
| Frequent Updates | Balanced Trees, Skip Lists | Update cost vs. query performance |
| Pattern Matching | KMP, Rabin-Karp | Preprocessing vs. multiple searches |
| Graph Processing | BFS/DFS, Dijkstra | Memory usage vs. computation time |
| String Processing | Trie, Suffix Arrays | Space efficiency vs. query speed |

### Performance Optimization Strategies

**Caching and Memoization:**
```python
from functools import lru_cache
import time

class CachedAlgorithms:
    def __init__(self):
        self.cache = {}
    
    @lru_cache(maxsize=1000)
    def expensive_computation(self, n):
        """Example of expensive computation with caching."""
        time.sleep(0.01)  # Simulate expensive operation
        return n * n + sum(range(n))
    
    def fibonacci_with_custom_cache(self, n):
        """Custom caching implementation."""
        if n in self.cache:
            return self.cache[n]
        
        if n <= 2:
            result = 1
        else:
            result = (self.fibonacci_with_custom_cache(n-1) + 
                     self.fibonacci_with_custom_cache(n-2))
        
        self.cache[n] = result
        return result
    
    def clear_cache(self):
        """Clear custom cache."""
        self.cache.clear()
        self.expensive_computation.cache_clear()
```

**Parallel Processing:**
```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import multiprocessing as mp

def parallel_merge_sort(arr, num_processes=None):
    """Parallel merge sort implementation."""
    if num_processes is None:
        num_processes = mp.cpu_count()
    
    def merge_sort_chunk(chunk):
        """Sort individual chunks."""
        if len(chunk) <= 1:
            return chunk
        
        mid = len(chunk) // 2
        left = merge_sort_chunk(chunk[:mid])
        right = merge_sort_chunk(chunk[mid:])
        return merge(left, right)
    
    if len(arr) <= 1000 or num_processes <= 1:
        return merge_sort_chunk(arr)
    
    # Split array into chunks for parallel processing
    chunk_size = len(arr) // num_processes
    chunks = [arr[i:i + chunk_size] for i in range(0, len(arr), chunk_size)]
    
    with ProcessPoolExecutor(max_workers=num_processes) as executor:
        sorted_chunks = list(executor.map(merge_sort_chunk, chunks))
    
    # Merge all sorted chunks
    while len(sorted_chunks) > 1:
        new_chunks = []
        for i in range(0, len(sorted_chunks), 2):
            if i + 1 < len(sorted_chunks):
                merged = merge(sorted_chunks[i], sorted_chunks[i + 1])
                new_chunks.append(merged)
            else:
                new_chunks.append(sorted_chunks[i])
        sorted_chunks = new_chunks
    
    return sorted_chunks[0] if sorted_chunks else []
```

## Manager-Level Decision Framework

### Algorithm Selection Criteria

**Business Impact Assessment:**
```python
class AlgorithmDecisionFramework:
    def __init__(self):
        self.criteria = {
            'performance': 0.3,    # Response time requirements
            'scalability': 0.25,   # Growth capacity
            'maintenance': 0.2,    # Team expertise and complexity
            'cost': 0.15,         # Infrastructure and development cost
            'reliability': 0.1     # Error handling and robustness
        }
    
    def evaluate_algorithm(self, algorithm_metrics):
        """
        Evaluate algorithm based on business criteria.
        
        algorithm_metrics = {
            'performance': score (1-10),
            'scalability': score (1-10),
            'maintenance': score (1-10),
            'cost': score (1-10),
            'reliability': score (1-10)
        }
        """
        total_score = 0
        for criterion, weight in self.criteria.items():
            total_score += algorithm_metrics.get(criterion, 0) * weight
        
        return total_score
    
    def compare_algorithms(self, algorithms):
        """Compare multiple algorithms and rank them."""
        results = []
        for name, metrics in algorithms.items():
            score = self.evaluate_algorithm(metrics)
            results.append((name, score, metrics))
        
        return sorted(results, key=lambda x: x[1], reverse=True)
```

### Risk Assessment and Mitigation

**Algorithm Risk Matrix:**
```yaml
High Risk - High Impact:
  - Custom algorithms with complex edge cases
  - Algorithms with exponential time complexity
  - Single-threaded bottlenecks in critical paths
  - Algorithms requiring significant memory allocation

Medium Risk - Medium Impact:
  - Third-party algorithm libraries with dependencies
  - Algorithms with quadratic complexity on large datasets
  - Cache-dependent algorithms in distributed systems

Low Risk - High Value:
  - Well-established algorithms (binary search, merge sort)
  - Algorithms with proven performance characteristics
  - Standard library implementations
```

### Interview Integration

**System Design Connection Points:**
1. **Database Indexing**: B-trees, hash indexes, LSM trees
2. **Caching Strategies**: LRU, LFU, consistent hashing
3. **Load Balancing**: Round-robin, weighted algorithms, consistent hashing
4. **Search Systems**: Inverted indexes, ranking algorithms, fuzzy matching
5. **Recommendation Systems**: Collaborative filtering, content-based algorithms
6. **Distributed Systems**: Consensus algorithms, replication strategies
7. **Message Processing**: Queue algorithms, priority queues, streaming algorithms

**Manager-Level Discussion Points:**
- When to optimize vs. when to use standard solutions
- Trade-offs between development time and performance
- Team skill requirements for different algorithmic approaches
- Scalability planning and algorithm evolution strategies
- Risk mitigation for algorithmic complexity

## Category 6: Advanced Algorithm Patterns

### Sliding Window Technique

**Two-Pointer Sliding Window:**
```python
def max_sum_subarray(arr, k):
    """Maximum sum subarray of size k."""
    if len(arr) < k:
        return -1
    
    # Calculate sum of first window
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    # Slide the window
    for i in range(k, len(arr)):
        window_sum = window_sum - arr[i - k] + arr[i]
        max_sum = max(max_sum, window_sum)
    
    return max_sum

def longest_substring_without_repeating(s):
    """Find longest substring without repeating characters."""
    char_set = set()
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        
        char_set.add(s[right])
        max_length = max(max_length, right - left + 1)
    
    return max_length

def min_window_substring(s, t):
    """Minimum window substring containing all characters of t."""
    from collections import Counter, defaultdict
    
    if len(s) < len(t):
        return ""
    
    target_count = Counter(t)
    required = len(target_count)
    formed = 0
    
    window_counts = defaultdict(int)
    left, right = 0, 0
    
    min_len = float('inf')
    min_left = 0
    
    while right < len(s):
        # Expand window
        char = s[right]
        window_counts[char] += 1
        
        if char in target_count and window_counts[char] == target_count[char]:
            formed += 1
        
        # Contract window
        while left <= right and formed == required:
            # Update minimum window
            if right - left + 1 < min_len:
                min_len = right - left + 1
                min_left = left
            
            # Remove from left
            char = s[left]
            window_counts[char] -= 1
            if char in target_count and window_counts[char] < target_count[char]:
                formed -= 1
            
            left += 1
        
        right += 1
    
    return "" if min_len == float('inf') else s[min_left:min_left + min_len]
```

**Business Applications:**
- **Performance monitoring**: Moving averages for metrics
- **Rate limiting**: Sliding window counters
- **Data streaming**: Real-time analytics windows
- **Load balancing**: Request distribution over time

### Two Pointers Technique

**Fast and Slow Pointers:**
```python
def has_cycle(head):
    """Detect cycle in linked list using Floyd's algorithm."""
    slow = fast = head
    
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            return True
    
    return False

def find_cycle_start(head):
    """Find start of cycle in linked list."""
    slow = fast = head
    
    # Find meeting point
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            break
    else:
        return None  # No cycle
    
    # Find start of cycle
    slow = head
    while slow != fast:
        slow = slow.next
        fast = fast.next
    
    return slow

def remove_nth_from_end(head, n):
    """Remove nth node from end of list."""
    dummy = ListNode(0)
    dummy.next = head
    fast = slow = dummy
    
    # Move fast n+1 steps ahead
    for _ in range(n + 1):
        fast = fast.next
    
    # Move both pointers
    while fast:
        fast = fast.next
        slow = slow.next
    
    # Remove node
    slow.next = slow.next.next
    
    return dummy.next
```

**Left-Right Pointers:**
```python
def two_sum_sorted(numbers, target):
    """Two sum on sorted array."""
    left, right = 0, len(numbers) - 1
    
    while left < right:
        current_sum = numbers[left] + numbers[right]
        if current_sum == target:
            return [left + 1, right + 1]  # 1-indexed
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return []

def three_sum(nums):
    """Find all unique triplets that sum to zero."""
    nums.sort()
    result = []
    
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue  # Skip duplicates
        
        left, right = i + 1, len(nums) - 1
        
        while left < right:
            current_sum = nums[i] + nums[left] + nums[right]
            
            if current_sum == 0:
                result.append([nums[i], nums[left], nums[right]])
                
                # Skip duplicates
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                
                left += 1
                right -= 1
            elif current_sum < 0:
                left += 1
            else:
                right -= 1
    
    return result

def container_with_most_water(height):
    """Find container that holds most water."""
    left, right = 0, len(height) - 1
    max_area = 0
    
    while left < right:
        width = right - left
        min_height = min(height[left], height[right])
        current_area = width * min_height
        max_area = max(max_area, current_area)
        
        # Move pointer with smaller height
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_area
```

### Backtracking Algorithms

**Core Backtracking Framework:**
```python
def backtrack_template(solution, options):
    """Generic backtracking template."""
    if is_complete(solution):
        result.append(solution.copy())
        return
    
    for option in get_options(options):
        if is_valid(solution, option):
            solution.append(option)  # Make choice
            backtrack_template(solution, updated_options)
            solution.pop()  # Backtrack

def generate_parentheses(n):
    """Generate all valid parentheses combinations."""
    def backtrack(solution, open_count, close_count):
        if len(solution) == 2 * n:
            result.append(solution)
            return
        
        if open_count < n:
            backtrack(solution + "(", open_count + 1, close_count)
        
        if close_count < open_count:
            backtrack(solution + ")", open_count, close_count + 1)
    
    result = []
    backtrack("", 0, 0)
    return result

def n_queens(n):
    """Solve N-Queens problem."""
    def is_safe(board, row, col):
        # Check column
        for i in range(row):
            if board[i][col] == 'Q':
                return False
        
        # Check diagonals
        for i, j in zip(range(row - 1, -1, -1), range(col - 1, -1, -1)):
            if board[i][j] == 'Q':
                return False
        
        for i, j in zip(range(row - 1, -1, -1), range(col + 1, n)):
            if board[i][j] == 'Q':
                return False
        
        return True
    
    def solve(board, row):
        if row == n:
            result.append([''.join(row) for row in board])
            return
        
        for col in range(n):
            if is_safe(board, row, col):
                board[row][col] = 'Q'
                solve(board, row + 1)
                board[row][col] = '.'
    
    result = []
    board = [['.' for _ in range(n)] for _ in range(n)]
    solve(board, 0)
    return result

def sudoku_solver(board):
    """Solve Sudoku puzzle."""
    def is_valid(board, row, col, num):
        # Check row
        for j in range(9):
            if board[row][j] == num:
                return False
        
        # Check column
        for i in range(9):
            if board[i][col] == num:
                return False
        
        # Check 3x3 box
        box_row, box_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                if board[i][j] == num:
                    return False
        
        return True
    
    def solve(board):
        for i in range(9):
            for j in range(9):
                if board[i][j] == '.':
                    for num in '123456789':
                        if is_valid(board, i, j, num):
                            board[i][j] = num
                            if solve(board):
                                return True
                            board[i][j] = '.'
                    return False
        return True
    
    solve(board)
    return board
```

### Greedy Algorithms

**Activity Selection and Scheduling:**
```python
def activity_selection(activities):
    """Select maximum number of non-overlapping activities."""
    # Sort by end time
    activities.sort(key=lambda x: x[1])
    
    selected = [activities[0]]
    last_end_time = activities[0][1]
    
    for start, end in activities[1:]:
        if start >= last_end_time:
            selected.append((start, end))
            last_end_time = end
    
    return selected

def job_scheduling_with_profit(jobs):
    """Schedule jobs to maximize profit."""
    # Sort by profit in descending order
    jobs.sort(key=lambda x: x[2], reverse=True)
    
    max_deadline = max(job[1] for job in jobs)
    schedule = [None] * (max_deadline + 1)
    total_profit = 0
    
    for job_id, deadline, profit in jobs:
        # Find latest available slot before deadline
        for slot in range(deadline, 0, -1):
            if schedule[slot] is None:
                schedule[slot] = job_id
                total_profit += profit
                break
    
    return [job for job in schedule if job is not None], total_profit

def fractional_knapsack(items, capacity):
    """Fractional knapsack problem."""
    # Calculate value per weight ratio
    items_with_ratio = [(value/weight, weight, value, i) 
                       for i, (weight, value) in enumerate(items)]
    items_with_ratio.sort(reverse=True)
    
    total_value = 0
    result = [0] * len(items)
    
    for ratio, weight, value, index in items_with_ratio:
        if capacity >= weight:
            # Take full item
            result[index] = 1
            total_value += value
            capacity -= weight
        else:
            # Take fraction of item
            result[index] = capacity / weight
            total_value += ratio * capacity
            break
    
    return result, total_value

def huffman_coding(frequencies):
    """Build Huffman coding tree."""
    import heapq
    
    class Node:
        def __init__(self, char=None, freq=0, left=None, right=None):
            self.char = char
            self.freq = freq
            self.left = left
            self.right = right
        
        def __lt__(self, other):
            return self.freq < other.freq
    
    heap = [Node(char, freq) for char, freq in frequencies.items()]
    heapq.heapify(heap)
    
    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        merged = Node(freq=left.freq + right.freq, left=left, right=right)
        heapq.heappush(heap, merged)
    
    root = heap[0]
    
    # Generate codes
    codes = {}
    
    def generate_codes(node, code=""):
        if node.char:  # Leaf node
            codes[node.char] = code or "0"
        else:
            generate_codes(node.left, code + "0")
            generate_codes(node.right, code + "1")
    
    generate_codes(root)
    return codes
```

## Category 7: Advanced Dynamic Programming

### Multi-dimensional DP Problems

**2D Dynamic Programming:**
```python
def unique_paths_with_obstacles(grid):
    """Count paths in grid with obstacles."""
    m, n = len(grid), len(grid[0])
    if grid[0][0] == 1 or grid[m-1][n-1] == 1:
        return 0
    
    dp = [[0] * n for _ in range(m)]
    dp[0][0] = 1
    
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 1:
                dp[i][j] = 0
            else:
                if i > 0:
                    dp[i][j] += dp[i-1][j]
                if j > 0:
                    dp[i][j] += dp[i][j-1]
    
    return dp[m-1][n-1]

def minimum_path_sum(grid):
    """Find minimum path sum from top-left to bottom-right."""
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    
    dp[0][0] = grid[0][0]
    
    # Initialize first row
    for j in range(1, n):
        dp[0][j] = dp[0][j-1] + grid[0][j]
    
    # Initialize first column
    for i in range(1, m):
        dp[i][0] = dp[i-1][0] + grid[i][0]
    
    # Fill DP table
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]
    
    return dp[m-1][n-1]

def regular_expression_matching(s, p):
    """Regular expression matching with . and *."""
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    
    # Base case: empty pattern matches empty string
    dp[0][0] = True
    
    # Handle patterns like a*, a*b*, a*b*c*
    for j in range(2, n + 1):
        if p[j-1] == '*':
            dp[0][j] = dp[0][j-2]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j-1] == '*':
                # Two cases: use * or don't use *
                dp[i][j] = dp[i][j-2]  # Don't use *
                
                if p[j-2] == '.' or p[j-2] == s[i-1]:
                    dp[i][j] = dp[i][j] or dp[i-1][j]  # Use *
            else:
                if p[j-1] == '.' or p[j-1] == s[i-1]:
                    dp[i][j] = dp[i-1][j-1]
    
    return dp[m][n]
```

**3D Dynamic Programming:**
```python
def distinct_subsequences(s, t):
    """Count distinct subsequences of s that equal t."""
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Empty string t can be formed by deleting all chars from any string s
    for i in range(m + 1):
        dp[i][0] = 1
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i-1][j]  # Don't use s[i-1]
            
            if s[i-1] == t[j-1]:
                dp[i][j] += dp[i-1][j-1]  # Use s[i-1]
    
    return dp[m][n]

def interleaving_string(s1, s2, s3):
    """Check if s3 is interleaving of s1 and s2."""
    m, n, l = len(s1), len(s2), len(s3)
    
    if m + n != l:
        return False
    
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    
    # Fill first row (using only s2)
    for j in range(1, n + 1):
        dp[0][j] = dp[0][j-1] and s2[j-1] == s3[j-1]
    
    # Fill first column (using only s1)
    for i in range(1, m + 1):
        dp[i][0] = dp[i-1][0] and s1[i-1] == s3[i-1]
    
    # Fill rest of table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = ((dp[i-1][j] and s1[i-1] == s3[i+j-1]) or
                       (dp[i][j-1] and s2[j-1] == s3[i+j-1]))
    
    return dp[m][n]
```

### State Machine DP

**Stock Trading Problems:**
```python
def best_time_to_buy_sell_stock_with_cooldown(prices):
    """Stock trading with cooldown period."""
    if not prices:
        return 0
    
    n = len(prices)
    # States: hold[i] = max profit when holding stock on day i
    #         sold[i] = max profit when sold stock on day i
    #         rest[i] = max profit when resting on day i
    
    hold = [0] * n
    sold = [0] * n
    rest = [0] * n
    
    hold[0] = -prices[0]  # Buy on first day
    
    for i in range(1, n):
        hold[i] = max(hold[i-1], rest[i-1] - prices[i])  # Keep holding or buy
        sold[i] = hold[i-1] + prices[i]  # Sell
        rest[i] = max(rest[i-1], sold[i-1])  # Rest
    
    return max(sold[n-1], rest[n-1])

def best_time_to_buy_sell_stock_with_fee(prices, fee):
    """Stock trading with transaction fee."""
    if not prices:
        return 0
    
    cash = 0  # Max profit when not holding stock
    hold = -prices[0]  # Max profit when holding stock
    
    for i in range(1, len(prices)):
        cash = max(cash, hold + prices[i] - fee)  # Sell stock
        hold = max(hold, cash - prices[i])  # Buy stock
    
    return cash
```

### Bitmask DP

**Traveling Salesman Problem:**
```python
def tsp(graph):
    """Traveling Salesman Problem using bitmask DP."""
    n = len(graph)
    
    # dp[mask][i] = minimum cost to visit all cities in mask and end at city i
    dp = [[float('inf')] * n for _ in range(1 << n)]
    
    # Start at city 0
    dp[1][0] = 0
    
    for mask in range(1 << n):
        for u in range(n):
            if not (mask & (1 << u)):
                continue
            
            for v in range(n):
                if mask & (1 << v):
                    continue
                
                new_mask = mask | (1 << v)
                dp[new_mask][v] = min(dp[new_mask][v], 
                                     dp[mask][u] + graph[u][v])
    
    # Return to starting city
    result = float('inf')
    for i in range(1, n):
        result = min(result, dp[(1 << n) - 1][i] + graph[i][0])
    
    return result
```

## Category 8: Graph Algorithms (Advanced)

### Network Flow Algorithms

**Maximum Flow (Ford-Fulkerson):**
```python
def max_flow_ford_fulkerson(graph, source, sink):
    """Find maximum flow using Ford-Fulkerson algorithm."""
    from collections import defaultdict, deque
    
    def bfs_find_path(graph, source, sink, parent):
        """Find augmenting path using BFS."""
        visited = set([source])
        queue = deque([source])
        
        while queue:
            u = queue.popleft()
            
            for v in graph[u]:
                if v not in visited and graph[u][v] > 0:
                    visited.add(v)
                    parent[v] = u
                    if v == sink:
                        return True
                    queue.append(v)
        return False
    
    # Create residual graph
    residual = defaultdict(lambda: defaultdict(int))
    for u in graph:
        for v in graph[u]:
            residual[u][v] = graph[u][v]
    
    parent = {}
    max_flow_value = 0
    
    # Find augmenting paths
    while bfs_find_path(residual, source, sink, parent):
        # Find minimum residual capacity along the path
        path_flow = float('inf')
        s = sink
        while s != source:
            path_flow = min(path_flow, residual[parent[s]][s])
            s = parent[s]
        
        # Add path flow to overall flow
        max_flow_value += path_flow
        
        # Update residual capacities
        v = sink
        while v != source:
            u = parent[v]
            residual[u][v] -= path_flow
            residual[v][u] += path_flow
            v = parent[v]
    
    return max_flow_value

def min_cut(graph, source, sink):
    """Find minimum cut using max flow."""
    # After finding max flow, find reachable vertices from source
    max_flow_value = max_flow_ford_fulkerson(graph, source, sink)
    
    # Find vertices reachable from source in residual graph
    # Implementation details for finding the actual cut...
    return max_flow_value
```

### Advanced Tree Algorithms

**Lowest Common Ancestor (LCA):**
```python
class LCABinaryLifting:
    """LCA using binary lifting technique."""
    
    def __init__(self, tree, root):
        self.n = len(tree)
        self.LOG = 20  # log2(max_n)
        self.tree = tree
        self.root = root
        
        self.depth = [0] * self.n
        self.parent = [[-1] * self.LOG for _ in range(self.n)]
        
        self._preprocess()
    
    def _preprocess(self):
        """Preprocess tree for LCA queries."""
        # DFS to fill parent[0] and depth
        def dfs(u, p, d):
            self.parent[u][0] = p
            self.depth[u] = d
            
            for v in self.tree[u]:
                if v != p:
                    dfs(v, u, d + 1)
        
        dfs(self.root, -1, 0)
        
        # Fill parent table using binary lifting
        for j in range(1, self.LOG):
            for i in range(self.n):
                if self.parent[i][j-1] != -1:
                    self.parent[i][j] = self.parent[self.parent[i][j-1]][j-1]
    
    def lca(self, u, v):
        """Find LCA of nodes u and v."""
        if self.depth[u] < self.depth[v]:
            u, v = v, u
        
        # Bring u to same level as v
        diff = self.depth[u] - self.depth[v]
        for i in range(self.LOG):
            if (diff >> i) & 1:
                u = self.parent[u][i]
        
        if u == v:
            return u
        
        # Binary search for LCA
        for i in range(self.LOG - 1, -1, -1):
            if self.parent[u][i] != self.parent[v][i]:
                u = self.parent[u][i]
                v = self.parent[v][i]
        
        return self.parent[u][0]
    
    def distance(self, u, v):
        """Find distance between nodes u and v."""
        return self.depth[u] + self.depth[v] - 2 * self.depth[self.lca(u, v)]
```

## Category 9: String Algorithms (Advanced)

### Advanced Pattern Matching

**Aho-Corasick Algorithm:**
```python
class AhoCorasick:
    """Aho-Corasick algorithm for multiple pattern matching."""
    
    def __init__(self):
        self.goto = {}
        self.fail = {}
        self.output = {}
        self.states = 0
    
    def build_automaton(self, patterns):
        """Build the Aho-Corasick automaton."""
        # Build goto function
        for pattern in patterns:
            current_state = 0
            for char in pattern:
                if (current_state, char) not in self.goto:
                    self.states += 1
                    self.goto[(current_state, char)] = self.states
                current_state = self.goto[(current_state, char)]
            
            # Add pattern to output function
            if current_state not in self.output:
                self.output[current_state] = []
            self.output[current_state].append(pattern)
        
        # Build failure function
        from collections import deque
        
        queue = deque()
        
        # Initialize failure for depth 1 states
        for char in 'abcdefghijklmnopqrstuvwxyz':
            if (0, char) in self.goto:
                state = self.goto[(0, char)]
                self.fail[state] = 0
                queue.append(state)
        
        # Build failure function using BFS
        while queue:
            current_state = queue.popleft()
            
            for char in 'abcdefghijklmnopqrstuvwxyz':
                if (current_state, char) not in self.goto:
                    continue
                
                next_state = self.goto[(current_state, char)]
                queue.append(next_state)
                
                # Find failure state
                fail_state = self.fail[current_state]
                while fail_state != 0 and (fail_state, char) not in self.goto:
                    fail_state = self.fail[fail_state]
                
                if (fail_state, char) in self.goto:
                    self.fail[next_state] = self.goto[(fail_state, char)]
                else:
                    self.fail[next_state] = 0
                
                # Copy output
                fail_output = self.output.get(self.fail[next_state], [])
                if next_state not in self.output:
                    self.output[next_state] = []
                self.output[next_state].extend(fail_output)
    
    def search(self, text):
        """Search for patterns in text."""
        matches = []
        current_state = 0
        
        for i, char in enumerate(text):
            # Follow failure links
            while current_state != 0 and (current_state, char) not in self.goto:
                current_state = self.fail[current_state]
            
            if (current_state, char) in self.goto:
                current_state = self.goto[(current_state, char)]
            
            # Check for matches
            if current_state in self.output:
                for pattern in self.output[current_state]:
                    matches.append((i - len(pattern) + 1, pattern))
        
        return matches
```

**Suffix Array and LCP Array:**
```python
def build_suffix_array(s):
    """Build suffix array using counting sort."""
    n = len(s)
    suffixes = [(s[i:], i) for i in range(n)]
    suffixes.sort()
    return [suffix[1] for suffix in suffixes]

def build_lcp_array(s, suffix_array):
    """Build LCP array from suffix array."""
    n = len(s)
    rank = [0] * n
    lcp = [0] * (n - 1)
    
    # Build rank array
    for i in range(n):
        rank[suffix_array[i]] = i
    
    h = 0
    for i in range(n):
        if rank[i] > 0:
            j = suffix_array[rank[i] - 1]
            while i + h < n and j + h < n and s[i + h] == s[j + h]:
                h += 1
            lcp[rank[i] - 1] = h
            if h > 0:
                h -= 1
    
    return lcp

def longest_repeated_substring(s):
    """Find longest repeated substring using suffix array."""
    suffix_array = build_suffix_array(s)
    lcp = build_lcp_array(s, suffix_array)
    
    max_lcp = max(lcp) if lcp else 0
    if max_lcp == 0:
        return ""
    
    idx = lcp.index(max_lcp)
    start = suffix_array[idx]
    return s[start:start + max_lcp]
```

## Category 10: Computational Geometry

### Basic Geometric Algorithms

**Point and Line Operations:**
```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def distance(self, other):
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5

def cross_product(a, b, c):
    """Cross product of vectors AB and AC."""
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)

def orientation(p, q, r):
    """Find orientation of triplet (p, q, r)."""
    val = cross_product(p, q, r)
    if val == 0:
        return 0  # Collinear
    return 1 if val > 0 else 2  # Clockwise or counterclockwise

def convex_hull_graham_scan(points):
    """Find convex hull using Graham scan."""
    n = len(points)
    if n < 3:
        return points
    
    # Find bottom-most point (or leftmost in case of tie)
    bottom = min(points, key=lambda p: (p.y, p.x))
    
    # Sort points by polar angle with respect to bottom point
    def polar_angle_key(p):
        if p == bottom:
            return -math.pi, 0
        angle = math.atan2(p.y - bottom.y, p.x - bottom.x)
        dist = bottom.distance(p)
        return angle, dist
    
    import math
    sorted_points = sorted(points, key=polar_angle_key)
    
    # Create convex hull
    hull = []
    for point in sorted_points:
        while len(hull) > 1 and cross_product(hull[-2], hull[-1], point) <= 0:
            hull.pop()
        hull.append(point)
    
    return hull

def closest_pair_of_points(points):
    """Find closest pair of points using divide and conquer."""
    def distance(p1, p2):
        return ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) ** 0.5
    
    def closest_pair_rec(px, py):
        n = len(px)
        
        # Base case
        if n <= 3:
            min_dist = float('inf')
            pair = None
            for i in range(n):
                for j in range(i + 1, n):
                    dist = distance(px[i], px[j])
                    if dist < min_dist:
                        min_dist = dist
                        pair = (px[i], px[j])
            return min_dist, pair
        
        # Divide
        mid = n // 2
        midpoint = px[mid]
        
        pyl = [point for point in py if point.x <= midpoint.x]
        pyr = [point for point in py if point.x > midpoint.x]
        
        # Conquer
        dl, pair_l = closest_pair_rec(px[:mid], pyl)
        dr, pair_r = closest_pair_rec(px[mid:], pyr)
        
        # Find minimum of two halves
        min_dist = dl
        min_pair = pair_l
        if dr < min_dist:
            min_dist = dr
            min_pair = pair_r
        
        # Check strip
        strip = [point for point in py if abs(point.x - midpoint.x) < min_dist]
        
        for i in range(len(strip)):
            j = i + 1
            while j < len(strip) and (strip[j].y - strip[i].y) < min_dist:
                dist = distance(strip[i], strip[j])
                if dist < min_dist:
                    min_dist = dist
                    min_pair = (strip[i], strip[j])
                j += 1
        
        return min_dist, min_pair
    
    # Sort points
    px = sorted(points, key=lambda p: p.x)
    py = sorted(points, key=lambda p: p.y)
    
    return closest_pair_rec(px, py)
```

## Manager-Level Algorithm Selection Framework

### Algorithm Complexity Decision Matrix

**Real-time Systems:**
```python
class AlgorithmSelector:
    """Framework for selecting algorithms based on constraints."""
    
    def __init__(self):
        self.complexity_thresholds = {
            'real_time': {'time': 'O(1)', 'space': 'O(1)'},
            'interactive': {'time': 'O(log n)', 'space': 'O(n)'},
            'batch_processing': {'time': 'O(n log n)', 'space': 'O(n)'},
            'offline_analysis': {'time': 'O(n²)', 'space': 'O(n²)'}
        }
    
    def recommend_sorting_algorithm(self, data_size, memory_constraint, stability_required):
        """Recommend sorting algorithm based on constraints."""
        if data_size < 50:
            return "insertion_sort", "Small dataset, simple implementation"
        
        if memory_constraint == 'tight':
            if stability_required:
                return "merge_sort", "Stable, predictable O(n log n)"
            else:
                return "heap_sort", "O(1) space, guaranteed O(n log n)"
        
        if stability_required:
            return "merge_sort", "Stable sorting with O(n log n)"
        else:
            return "quick_sort", "Average O(n log n), cache-friendly"
    
    def recommend_search_algorithm(self, data_structure, data_size, update_frequency):
        """Recommend search algorithm based on usage patterns."""
        if update_frequency == 'high':
            if data_size < 1000:
                return "linear_search", "Simple, good for small dynamic data"
            else:
                return "hash_table", "O(1) search and updates"
        
        if data_structure == 'sorted_array':
            return "binary_search", "O(log n) search on sorted data"
        elif data_structure == 'unsorted':
            if data_size > 10000:
                return "hash_table", "Build index for large datasets"
            else:
                return "linear_search", "Simple for small datasets"
        
        return "binary_search", "Default recommendation"
```

### Performance Monitoring and Optimization

**Algorithm Performance Analyzer:**
```python
import time
import tracemalloc
from functools import wraps

def performance_monitor(func):
    """Decorator to monitor algorithm performance."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Start monitoring
        tracemalloc.start()
        start_time = time.time()
        
        # Execute function
        result = func(*args, **kwargs)
        
        # Measure performance
        end_time = time.time()
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        
        # Log performance metrics
        execution_time = end_time - start_time
        memory_usage = peak / 1024 / 1024  # MB
        
        print(f"{func.__name__} Performance:")
        print(f"  Execution time: {execution_time:.4f} seconds")
        print(f"  Peak memory: {memory_usage:.2f} MB")
        print(f"  Input size: {len(args[0]) if args and hasattr(args[0], '__len__') else 'N/A'}")
        
        return result
    return wrapper

class AlgorithmBenchmark:
    """Benchmark different algorithms for the same problem."""
    
    def __init__(self):
        self.results = {}
    
    def benchmark_sorting(self, data_sizes=[100, 1000, 10000]):
        """Benchmark different sorting algorithms."""
        import random
        
        algorithms = {
            'quick_sort': self.quick_sort,
            'merge_sort': self.merge_sort,
            'heap_sort': self.heap_sort,
            'python_sort': lambda arr: sorted(arr)
        }
        
        for size in data_sizes:
            print(f"\nBenchmarking with data size: {size}")
            data = [random.randint(1, 1000) for _ in range(size)]
            
            for name, algorithm in algorithms.items():
                data_copy = data[:]
                
                start_time = time.time()
                result = algorithm(data_copy)
                end_time = time.time()
                
                execution_time = end_time - start_time
                self.results[f"{name}_{size}"] = execution_time
                
                print(f"  {name}: {execution_time:.4f} seconds")
    
    def quick_sort(self, arr):
        """Quick sort implementation."""
        if len(arr) <= 1:
            return arr
        
        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]
        
        return self.quick_sort(left) + middle + self.quick_sort(right)
    
    def merge_sort(self, arr):
        """Merge sort implementation."""
        if len(arr) <= 1:
            return arr
        
        mid = len(arr) // 2
        left = self.merge_sort(arr[:mid])
        right = self.merge_sort(arr[mid:])
        
        return self.merge(left, right)
    
    def merge(self, left, right):
        """Merge two sorted arrays."""
        result = []
        i = j = 0
        
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        
        result.extend(left[i:])
        result.extend(right[j:])
        return result
    
    def heap_sort(self, arr):
        """Heap sort implementation."""
        import heapq
        heapq.heapify(arr)
        return [heapq.heappop(arr) for _ in range(len(arr))]
```

## Business Impact Assessment Framework

### Cost-Benefit Analysis for Algorithm Selection

**Algorithm ROI Calculator:**
```python
class AlgorithmROICalculator:
    """Calculate ROI for different algorithmic approaches."""
    
    def __init__(self):
        self.development_costs = {
            'simple': 1,    # 1 week
            'moderate': 4,  # 1 month
            'complex': 12   # 3 months
        }
        
        self.maintenance_multipliers = {
            'simple': 0.1,
            'moderate': 0.2,
            'complex': 0.4
        }
    
    def calculate_performance_savings(self, old_complexity, new_complexity, 
                                    data_size, operations_per_day):
        """Calculate performance improvement savings."""
        # Simplified calculation based on complexity reduction
        old_time = self.estimate_execution_time(old_complexity, data_size)
        new_time = self.estimate_execution_time(new_complexity, data_size)
        
        time_saved_per_operation = max(0, old_time - new_time)
        daily_savings = time_saved_per_operation * operations_per_day
        
        # Convert to cost savings (assuming server cost per second)
        cost_per_second = 0.001  # $0.001 per second of compute
        annual_savings = daily_savings * 365 * cost_per_second
        
        return annual_savings
    
    def estimate_execution_time(self, complexity, data_size):
        """Estimate execution time based on complexity."""
        import math
        
        complexity_factors = {
            'O(1)': 1,
            'O(log n)': math.log2(data_size),
            'O(n)': data_size,
            'O(n log n)': data_size * math.log2(data_size),
            'O(n²)': data_size ** 2
        }
        
        return complexity_factors.get(complexity, data_size) * 1e-6  # microseconds
    
    def roi_analysis(self, current_solution, proposed_solution, 
                    data_size, operations_per_day):
        """Complete ROI analysis for algorithm change."""
        # Calculate development costs
        dev_cost = self.development_costs[proposed_solution['complexity_level']]
        maintenance_cost = dev_cost * self.maintenance_multipliers[proposed_solution['complexity_level']]
        
        # Calculate performance savings
        annual_savings = self.calculate_performance_savings(
            current_solution['time_complexity'],
            proposed_solution['time_complexity'],
            data_size,
            operations_per_day
        )
        
        # Calculate ROI
        total_cost = dev_cost + maintenance_cost
        roi = (annual_savings - total_cost) / total_cost * 100
        
        return {
            'development_cost_weeks': dev_cost,
            'annual_maintenance_cost_weeks': maintenance_cost,
            'annual_performance_savings': annual_savings,
            'roi_percentage': roi,
            'payback_period_months': total_cost / (annual_savings / 12) if annual_savings > 0 else float('inf')
        }

# Example usage
calculator = AlgorithmROICalculator()

current = {
    'time_complexity': 'O(n²)',
    'space_complexity': 'O(n)'
}

proposed = {
    'time_complexity': 'O(n log n)',
    'space_complexity': 'O(n)',
    'complexity_level': 'moderate'
}

analysis = calculator.roi_analysis(current, proposed, 100000, 1000)
print("Algorithm Change ROI Analysis:")
for key, value in analysis.items():
    print(f"  {key}: {value}")
```

## Related Resources
- **[Coding Strategy](strategy.md)** - Overall L6/L7 coding interview approach
- **[Data Structures](data-structures.md)** - Foundation for algorithmic thinking
- **[Amazon Top 100](amazon-top-100.md)** - Practice problems using these algorithms
- **[System Design](../system-design/index.md)** - Applying algorithms in architecture

---

*This comprehensive algorithms guide provides the strategic algorithmic thinking required for L6/L7 engineering managers, focusing on business impact and system design integration while covering advanced patterns and optimization techniques essential for senior technical leadership roles.*