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

## Related Resources
- **[Coding Strategy](strategy.md)** - Overall L6/L7 coding interview approach
- **[Data Structures](data-structures.md)** - Foundation for algorithmic thinking
- **[Amazon Top 100](amazon-top-100.md)** - Practice problems using these algorithms
- **[System Design](../system-design/index.md)** - Applying algorithms in architecture

---

*This algorithms guide provides the strategic algorithmic thinking required for L6/L7 engineering managers, focusing on business impact and system design integration rather than just implementation details.*