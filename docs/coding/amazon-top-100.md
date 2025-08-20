# Amazon Top 100 Coding Problems

!!! info "Amazon L6/L7 Engineering Manager Interview Preparation"
    This curated collection features the most frequently asked coding problems in Amazon engineering manager interviews, specifically designed for L6/L7 positions. The problems are organized by pattern type and difficulty, focusing on practical algorithms that relate to real-world systems and leadership scenarios.

## Introduction

This document contains 100 carefully selected coding problems that represent the most common interview questions for Amazon L6 and L7 Engineering Manager positions. Each problem includes:

- **Problem statement** with clear constraints
- **Example input/output** for verification
- **Optimal solution approach** with detailed explanation
- **Time and space complexity analysis**
- **Production-ready Python implementation**
- **Amazon business context** connecting to real systems
- **Management insights** for technical leadership
- **Similar problem patterns** for deeper understanding

### Difficulty Distribution
- **Easy**: 20 problems (20%) - Foundation concepts
- **Medium**: 70 problems (70%) - Core competency
- **Hard**: 10 problems (10%) - Advanced problem solving

### Problem Categories Overview

| Category | Problems | Focus Area |
|----------|----------|------------|
| Arrays & Strings | 20 | Data manipulation, optimization |
| Two Pointers | 10 | Efficient searching, space optimization |
| Sliding Window | 10 | Stream processing, real-time analysis |
| Hash Tables | 10 | Fast lookups, caching strategies |
| Trees & Graphs | 15 | Hierarchical data, network analysis |
| Dynamic Programming | 10 | Optimization, resource planning |
| Stack & Queue | 10 | Processing pipelines, state management |
| Binary Search | 5 | Efficient searching, system scaling |
| Design Problems | 5 | System architecture, scalability |
| Mathematical | 5 | Algorithmic thinking, edge cases |

---

## Category 1: Arrays & Strings (20 Problems)

### Easy Difficulty (6 problems)

**1. Two Sum (LeetCode #1)**
```python
def two_sum(nums, target):
    """Find two numbers that add up to target."""
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []

# Example: nums = [2,7,11,15], target = 9 → [0,1]
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Inventory matching, price optimization
- **Manager Insight**: Explain hash table trade-offs to team
- **Similar**: Two Sum II, 3Sum, 4Sum

**2. Valid Palindrome (LeetCode #125)**
```python
def is_palindrome(s):
    """Check if string is a valid palindrome."""
    left, right = 0, len(s) - 1
    
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        
        if s[left].lower() != s[right].lower():
            return False
        
        left += 1
        right -= 1
    
    return True

# Example: "A man, a plan, a canal: Panama" → True
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Data validation, input sanitization
- **Manager Insight**: Discuss edge case handling importance
- **Similar**: Valid Palindrome II, Longest Palindromic Substring

**3. Best Time to Buy and Sell Stock (LeetCode #121)**
```python
def max_profit(prices):
    """Maximum profit from single buy/sell."""
    min_price = float('inf')
    max_profit = 0
    
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    
    return max_profit

# Example: [7,1,5,3,6,4] → 5 (buy at 1, sell at 6)
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Cost optimization, resource allocation
- **Manager Insight**: Connect to business metrics and KPIs
- **Similar**: Best Time to Buy and Sell Stock II, III, IV

**4. Valid Parentheses (LeetCode #20)**
```python
def is_valid(s):
    """Check if parentheses are properly matched."""
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    
    return not stack

# Example: "()[]{}" → True, "([)]" → False
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Configuration validation, JSON parsing
- **Manager Insight**: Discuss stack-based parsing in systems
- **Similar**: Generate Parentheses, Longest Valid Parentheses

**5. Longest Common Prefix (LeetCode #14)**
```python
def longest_common_prefix(strs):
    """Find longest common prefix among strings."""
    if not strs:
        return ""
    
    prefix = strs[0]
    for string in strs[1:]:
        while not string.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    
    return prefix

# Example: ["flower","flow","flight"] → "fl"
```
- **Time**: O(S) where S is sum of all characters, **Space**: O(1)
- **Amazon Context**: URL routing, path matching
- **Manager Insight**: Optimization for large datasets
- **Similar**: Longest Common Subsequence, Find Common Characters

**6. Merge Sorted Array (LeetCode #88)**
```python
def merge(nums1, m, nums2, n):
    """Merge nums2 into nums1 in-place."""
    p1, p2 = m - 1, n - 1
    write_index = m + n - 1
    
    while p1 >= 0 and p2 >= 0:
        if nums1[p1] > nums2[p2]:
            nums1[write_index] = nums1[p1]
            p1 -= 1
        else:
            nums1[write_index] = nums2[p2]
            p2 -= 1
        write_index -= 1
    
    # Copy remaining elements from nums2
    while p2 >= 0:
        nums1[write_index] = nums2[p2]
        p2 -= 1
        write_index -= 1

# Example: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3 → [1,2,2,3,5,6]
```
- **Time**: O(m + n), **Space**: O(1)
- **Amazon Context**: Data merging, batch processing
- **Manager Insight**: In-place algorithms for memory efficiency
- **Similar**: Merge Two Sorted Lists, Merge k Sorted Arrays

### Medium Difficulty (12 problems)

**7. Maximum Subarray (LeetCode #53)**
```python
def max_subarray(nums):
    """Find maximum sum of contiguous subarray (Kadane's Algorithm)."""
    max_sum = current_sum = nums[0]
    
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    
    return max_sum

# Example: [-2,1,-3,4,-1,2,1,-5,4] → 6 ([4,-1,2,1])
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Performance metrics analysis, trend detection
- **Manager Insight**: Dynamic programming fundamentals
- **Similar**: Maximum Product Subarray, Maximum Subarray Sum with One Deletion

**8. Product of Array Except Self (LeetCode #238)**
```python
def product_except_self(nums):
    """Product of all elements except current."""
    n = len(nums)
    result = [1] * n
    
    # Left products
    for i in range(1, n):
        result[i] = result[i-1] * nums[i-1]
    
    # Right products
    right = 1
    for i in range(n-1, -1, -1):
        result[i] *= right
        right *= nums[i]
    
    return result

# Example: [1,2,3,4] → [24,12,8,6]
```
- **Time**: O(n), **Space**: O(1) excluding output
- **Amazon Context**: Metrics aggregation, business intelligence
- **Manager Insight**: Space-time trade-offs in large systems
- **Similar**: Product of the Last K Numbers, Maximum Product Subarray

**9. Container With Most Water (LeetCode #11)**
```python
def max_area(height):
    """Find container that holds most water."""
    left, right = 0, len(height) - 1
    max_water = 0
    
    while left < right:
        width = right - left
        current_water = min(height[left], height[right]) * width
        max_water = max(max_water, current_water)
        
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_water

# Example: [1,8,6,2,5,4,8,3,7] → 49
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Resource optimization, capacity planning
- **Manager Insight**: Greedy algorithm principles
- **Similar**: Trapping Rain Water, Largest Rectangle in Histogram

**10. 3Sum (LeetCode #15)**
```python
def three_sum(nums):
    """Find all unique triplets that sum to zero."""
    nums.sort()
    result = []
    
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i-1]:
            continue
            
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left+1]:
                    left += 1
                while left < right and nums[right] == nums[right-1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    
    return result

# Example: [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]
```
- **Time**: O(n²), **Space**: O(1) excluding output
- **Amazon Context**: Team composition, resource allocation
- **Manager Insight**: Complexity management in algorithms
- **Similar**: 3Sum Closest, 4Sum, 3Sum Smaller

**11. Group Anagrams (LeetCode #49)**
```python
def group_anagrams(strs):
    """Group strings that are anagrams."""
    from collections import defaultdict
    
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        groups[key].append(s)
    
    return list(groups.values())

# Example: ["eat","tea","tan","ate","nat","bat"] → [["eat","tea","ate"],["tan","nat"],["bat"]]
```
- **Time**: O(n * k log k), **Space**: O(n * k)
- **Amazon Context**: Data deduplication, categorization
- **Manager Insight**: Hash function design choices
- **Similar**: Group Shifted Strings, Find All Anagrams

**12. Longest Substring Without Repeating Characters (LeetCode #3)**
```python
def length_of_longest_substring(s):
    """Length of longest substring without repeating chars."""
    char_map = {}
    left = max_length = 0
    
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_length = max(max_length, right - left + 1)
    
    return max_length

# Example: "abcabcbb" → 3 ("abc")
```
- **Time**: O(n), **Space**: O(min(m,n))
- **Amazon Context**: Session management, caching strategies
- **Manager Insight**: Sliding window pattern applications
- **Similar**: Longest Repeating Character Replacement, Minimum Window Substring

**13. String to Integer (atoi) (LeetCode #8)**
```python
def my_atoi(s):
    """Convert string to integer with constraints."""
    i = 0
    sign = 1
    result = 0
    
    # Skip whitespace
    while i < len(s) and s[i] == ' ':
        i += 1
    
    # Handle sign
    if i < len(s) and s[i] in '+-':
        sign = -1 if s[i] == '-' else 1
        i += 1
    
    # Convert digits
    while i < len(s) and s[i].isdigit():
        result = result * 10 + int(s[i])
        i += 1
    
    result *= sign
    
    # Handle overflow
    return max(-2**31, min(2**31 - 1, result))

# Example: "   -42" → -42, "4193 with words" → 4193
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Input validation, data parsing
- **Manager Insight**: Robust error handling patterns
- **Similar**: String to Integer (atoi), Reverse Integer

**14. Longest Palindromic Substring (LeetCode #5)**
```python
def longest_palindrome(s):
    """Find longest palindromic substring."""
    def expand_around_center(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return right - left - 1
    
    start = end = 0
    
    for i in range(len(s)):
        len1 = expand_around_center(i, i)      # odd length
        len2 = expand_around_center(i, i + 1)  # even length
        max_len = max(len1, len2)
        
        if max_len > end - start:
            start = i - (max_len - 1) // 2
            end = i + max_len // 2
    
    return s[start:end + 1]

# Example: "babad" → "bab" or "aba"
```
- **Time**: O(n²), **Space**: O(1)
- **Amazon Context**: Pattern matching, data analysis
- **Manager Insight**: Center expansion technique
- **Similar**: Palindromic Substrings, Shortest Palindrome

**15. ZigZag Conversion (LeetCode #6)**
```python
def convert(s, num_rows):
    """Convert string to zigzag pattern."""
    if num_rows == 1:
        return s
    
    rows = [''] * min(num_rows, len(s))
    current_row = 0
    going_down = False
    
    for char in s:
        rows[current_row] += char
        
        if current_row == 0 or current_row == num_rows - 1:
            going_down = not going_down
        
        current_row += 1 if going_down else -1
    
    return ''.join(rows)

# Example: "PAYPALISHIRING", numRows = 3 → "PAHNAPLSIIGYIR"
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Data formatting, report generation
- **Manager Insight**: Pattern simulation techniques
- **Similar**: Diagonal Traverse, Spiral Matrix

**16. Integer to Roman (LeetCode #12)**
```python
def int_to_roman(num):
    """Convert integer to Roman numeral."""
    values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
    
    result = ""
    for i in range(len(values)):
        count = num // values[i]
        result += symbols[i] * count
        num %= values[i]
    
    return result

# Example: 1994 → "MCMXCIV"
```
- **Time**: O(1), **Space**: O(1)
- **Amazon Context**: Data representation, format conversion
- **Manager Insight**: Greedy algorithm applications
- **Similar**: Roman to Integer, Integer to English Words

**17. Generate Parentheses (LeetCode #22)**
```python
def generate_parentheses(n):
    """Generate all valid parentheses combinations."""
    result = []
    
    def backtrack(current, open_count, close_count):
        if len(current) == 2 * n:
            result.append(current)
            return
        
        if open_count < n:
            backtrack(current + "(", open_count + 1, close_count)
        
        if close_count < open_count:
            backtrack(current + ")", open_count, close_count + 1)
    
    backtrack("", 0, 0)
    return result

# Example: n = 3 → ["((()))","(()())","(())()","()(())","()()()"]
```
- **Time**: O(4^n / √n), **Space**: O(4^n / √n)
- **Amazon Context**: Configuration generation, valid combinations
- **Manager Insight**: Backtracking algorithm patterns
- **Similar**: Valid Parentheses, Remove Invalid Parentheses

**18. Letter Combinations of Phone Number (LeetCode #17)**
```python
def letter_combinations(digits):
    """Generate letter combinations from phone number."""
    if not digits:
        return []
    
    mapping = {
        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
        '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
    }
    
    result = []
    
    def backtrack(index, path):
        if index == len(digits):
            result.append(path)
            return
        
        letters = mapping[digits[index]]
        for letter in letters:
            backtrack(index + 1, path + letter)
    
    backtrack(0, "")
    return result

# Example: "23" → ["ad","ae","af","bd","be","bf","cd","ce","cf"]
```
- **Time**: O(3^m × 4^n), **Space**: O(3^m × 4^n)
- **Amazon Context**: Search suggestions, autocompletion
- **Manager Insight**: Combinatorial problem solving
- **Similar**: Generate Parentheses, Combination Sum

### Hard Difficulty (2 problems)

**19. Minimum Window Substring (LeetCode #76)**
```python
def min_window(s, t):
    """Find minimum window containing all chars of t."""
    from collections import Counter, defaultdict
    
    if not s or not t:
        return ""
    
    dict_t = Counter(t)
    required = len(dict_t)
    formed = 0
    window_counts = defaultdict(int)
    
    l, r = 0, 0
    ans = float('inf'), None, None
    
    while r < len(s):
        character = s[r]
        window_counts[character] += 1
        
        if character in dict_t and window_counts[character] == dict_t[character]:
            formed += 1
        
        while l <= r and formed == required:
            character = s[l]
            
            if r - l + 1 < ans[0]:
                ans = (r - l + 1, l, r)
            
            window_counts[character] -= 1
            if character in dict_t and window_counts[character] < dict_t[character]:
                formed -= 1
            
            l += 1
        
        r += 1
    
    return "" if ans[0] == float('inf') else s[ans[1]: ans[2] + 1]

# Example: s = "ADOBECODEBANC", t = "ABC" → "BANC"
```
- **Time**: O(|s| + |t|), **Space**: O(|s| + |t|)
- **Amazon Context**: Log analysis, pattern extraction
- **Manager Insight**: Advanced sliding window techniques
- **Similar**: Substring with Concatenation of All Words, Find All Anagrams

**20. Text Justification (LeetCode #68)**
```python
def full_justify(words, max_width):
    """Justify text to fit max width."""
    result = []
    i = 0
    
    while i < len(words):
        # Find words that fit in current line
        j = i
        line_length = len(words[i])
        
        while j + 1 < len(words) and line_length + 1 + len(words[j + 1]) <= max_width:
            j += 1
            line_length += 1 + len(words[j])
        
        # Build justified line
        if j == len(words) - 1 or j == i:  # Last line or single word
            line = ' '.join(words[i:j+1])
            line += ' ' * (max_width - len(line))
        else:
            spaces_needed = max_width - sum(len(word) for word in words[i:j+1])
            gaps = j - i
            
            line = ""
            for k in range(i, j):
                line += words[k]
                if k < j:
                    spaces = spaces_needed // gaps
                    if k - i < spaces_needed % gaps:
                        spaces += 1
                    line += ' ' * spaces
            line += words[j]
        
        result.append(line)
        i = j + 1
    
    return result

# Example: words = ["This", "is", "an", "example"], maxWidth = 16
# → ["This    is    an","example         "]
```
- **Time**: O(n), **Space**: O(1) excluding output
- **Amazon Context**: Report formatting, document generation
- **Manager Insight**: Complex string manipulation requirements
- **Similar**: Reorder Data in Log Files, Valid Word Abbreviation

---

## Category 2: Two Pointers (10 Problems)

### Easy Difficulty (4 problems)

**21. Two Sum II - Input Array Is Sorted (LeetCode #167)**
```python
def two_sum(numbers, target):
    """Find two numbers in sorted array that add to target."""
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

# Example: numbers = [2,7,11,15], target = 9 → [1,2]
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Efficient searching in sorted data
- **Manager Insight**: Leverage data properties for optimization
- **Similar**: Two Sum, 3Sum, Pair with Target Sum

**22. Remove Duplicates from Sorted Array (LeetCode #26)**
```python
def remove_duplicates(nums):
    """Remove duplicates in-place from sorted array."""
    if not nums:
        return 0
    
    write_index = 1
    
    for read_index in range(1, len(nums)):
        if nums[read_index] != nums[read_index - 1]:
            nums[write_index] = nums[read_index]
            write_index += 1
    
    return write_index

# Example: [1,1,2] → length = 2, nums = [1,2,_]
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Data deduplication, cleanup processes
- **Manager Insight**: In-place algorithms for memory efficiency
- **Similar**: Remove Element, Remove Duplicates from Sorted Array II

**23. Move Zeroes (LeetCode #283)**
```python
def move_zeroes(nums):
    """Move all zeros to end while maintaining relative order."""
    write_index = 0
    
    for read_index in range(len(nums)):
        if nums[read_index] != 0:
            nums[write_index] = nums[read_index]
            write_index += 1
    
    while write_index < len(nums):
        nums[write_index] = 0
        write_index += 1

# Example: [0,1,0,3,12] → [1,3,12,0,0]
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Data filtering, null value handling
- **Manager Insight**: Stable partitioning algorithms
- **Similar**: Remove Element, Partition Array

**24. Squares of a Sorted Array (LeetCode #977)**
```python
def sorted_squares(nums):
    """Return sorted squares of array elements."""
    result = [0] * len(nums)
    left, right = 0, len(nums) - 1
    write_index = len(nums) - 1
    
    while left <= right:
        left_square = nums[left] ** 2
        right_square = nums[right] ** 2
        
        if left_square > right_square:
            result[write_index] = left_square
            left += 1
        else:
            result[write_index] = right_square
            right -= 1
        
        write_index -= 1
    
    return result

# Example: [-4,-1,0,3,10] → [0,1,9,16,100]
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Data transformation, metrics processing
- **Manager Insight**: Handling negative values efficiently
- **Similar**: Sort Colors, Merge Sorted Array

### Medium Difficulty (5 problems)

**25. 3Sum Closest (LeetCode #16)**
```python
def three_sum_closest(nums, target):
    """Find three numbers whose sum is closest to target."""
    nums.sort()
    closest_sum = float('inf')
    
    for i in range(len(nums) - 2):
        left, right = i + 1, len(nums) - 1
        
        while left < right:
            current_sum = nums[i] + nums[left] + nums[right]
            
            if abs(current_sum - target) < abs(closest_sum - target):
                closest_sum = current_sum
            
            if current_sum < target:
                left += 1
            elif current_sum > target:
                right -= 1
            else:
                return current_sum
    
    return closest_sum

# Example: nums = [-1,2,1,-4], target = 1 → 2
```
- **Time**: O(n²), **Space**: O(1)
- **Amazon Context**: Optimization problems, resource allocation
- **Manager Insight**: Approximation algorithms in constraints
- **Similar**: 3Sum, 4Sum Closest, Closest Binary Search Tree Value

**26. Sort Colors (LeetCode #75)**
```python
def sort_colors(nums):
    """Sort array with only 0s, 1s, and 2s."""
    left, current, right = 0, 0, len(nums) - 1
    
    while current <= right:
        if nums[current] == 0:
            nums[left], nums[current] = nums[current], nums[left]
            left += 1
            current += 1
        elif nums[current] == 1:
            current += 1
        else:  # nums[current] == 2
            nums[current], nums[right] = nums[right], nums[current]
            right -= 1
            # Don't increment current as we need to check swapped element

# Example: [2,0,2,1,1,0] → [0,0,1,1,2,2]
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Data categorization, priority sorting
- **Manager Insight**: Dutch national flag algorithm
- **Similar**: Partition Array, Move Zeroes

**27. Container With Most Water (LeetCode #11)**
```python
def max_area(height):
    """Find container that holds most water."""
    left, right = 0, len(height) - 1
    max_water = 0
    
    while left < right:
        width = right - left
        current_water = min(height[left], height[right]) * width
        max_water = max(max_water, current_water)
        
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_water

# Example: [1,8,6,2,5,4,8,3,7] → 49
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Resource optimization, capacity planning
- **Manager Insight**: Greedy approach vs brute force trade-offs
- **Similar**: Trapping Rain Water, Largest Rectangle

**28. Remove Nth Node From End of List (LeetCode #19)**
```python
def remove_nth_from_end(head, n):
    """Remove nth node from end of linked list."""
    dummy = ListNode(0)
    dummy.next = head
    first = second = dummy
    
    # Move first pointer n+1 steps ahead
    for _ in range(n + 1):
        first = first.next
    
    # Move both pointers until first reaches end
    while first:
        first = first.next
        second = second.next
    
    # Remove the nth node
    second.next = second.next.next
    
    return dummy.next

# Example: [1,2,3,4,5], n = 2 → [1,2,3,5]
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Data structure manipulation, list operations
- **Manager Insight**: One-pass algorithms using two pointers
- **Similar**: Middle of Linked List, Delete Node in Linked List

**29. Partition Labels (LeetCode #763)**
```python
def partition_labels(s):
    """Partition string into as many parts as possible."""
    last_occurrence = {char: i for i, char in enumerate(s)}
    partitions = []
    start = end = 0
    
    for i, char in enumerate(s):
        end = max(end, last_occurrence[char])
        
        if i == end:
            partitions.append(end - start + 1)
            start = i + 1
    
    return partitions

# Example: "ababcbacadefegdehijhklij" → [9,7,8]
```
- **Time**: O(n), **Space**: O(1) - limited alphabet
- **Amazon Context**: Data segmentation, batch processing
- **Manager Insight**: Greedy partitioning strategies
- **Similar**: Merge Intervals, Non-overlapping Intervals

### Hard Difficulty (1 problem)

**30. Trapping Rain Water (LeetCode #42)**
```python
def trap(height):
    """Calculate trapped rainwater."""
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    
    return water

# Example: [0,1,0,2,1,0,1,3,2,1,2,1] → 6
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Capacity planning, resource utilization
- **Manager Insight**: Complex optimization with constraints
- **Similar**: Container With Most Water, Largest Rectangle

---

## Category 3: Sliding Window (10 Problems)

### Easy Difficulty (3 problems)

**31. Maximum Average Subarray I (LeetCode #643)**
```python
def find_max_average(nums, k):
    """Find maximum average of contiguous subarray of length k."""
    current_sum = sum(nums[:k])
    max_sum = current_sum
    
    for i in range(k, len(nums)):
        current_sum = current_sum - nums[i-k] + nums[i]
        max_sum = max(max_sum, current_sum)
    
    return max_sum / k

# Example: nums = [1,12,-5,-6,50,3], k = 4 → 12.75
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Performance metrics, moving averages
- **Manager Insight**: Fixed-size window optimization
- **Similar**: Moving Average from Data Stream, Max Sum of Rectangle

**32. Contains Duplicate II (LeetCode #219)**
```python
def contains_nearby_duplicate(nums, k):
    """Check if duplicate exists within k distance."""
    seen = {}
    
    for i, num in enumerate(nums):
        if num in seen and i - seen[num] <= k:
            return True
        seen[num] = i
    
    return False

# Example: nums = [1,2,3,1], k = 3 → True
```
- **Time**: O(n), **Space**: O(min(n,k))
- **Amazon Context**: Fraud detection, duplicate checking
- **Manager Insight**: Time-window based validation
- **Similar**: Contains Duplicate, Contains Duplicate III

**33. Minimum Size Subarray Sum (LeetCode #209)**
```python
def min_subarray_len(target, nums):
    """Minimum length subarray with sum >= target."""
    left = current_sum = 0
    min_length = float('inf')
    
    for right in range(len(nums)):
        current_sum += nums[right]
        
        while current_sum >= target:
            min_length = min(min_length, right - left + 1)
            current_sum -= nums[left]
            left += 1
    
    return min_length if min_length != float('inf') else 0

# Example: target = 7, nums = [2,3,1,2,4,3] → 2
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Resource allocation, threshold optimization
- **Manager Insight**: Variable-size window techniques
- **Similar**: Maximum Size Subarray Sum Equals k, Subarray Sum Equals K

### Medium Difficulty (6 problems)

**34. Longest Substring Without Repeating Characters (LeetCode #3)**
```python
def length_of_longest_substring(s):
    """Length of longest substring without repeating chars."""
    char_map = {}
    left = max_length = 0
    
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_length = max(max_length, right - left + 1)
    
    return max_length

# Example: "abcabcbb" → 3
```
- **Time**: O(n), **Space**: O(min(m,n))
- **Amazon Context**: Session management, unique access patterns
- **Manager Insight**: Character frequency tracking
- **Similar**: Longest Repeating Character Replacement, Fruit Into Baskets

**35. Longest Repeating Character Replacement (LeetCode #424)**
```python
def character_replacement(s, k):
    """Longest substring with same character after k replacements."""
    from collections import defaultdict
    
    char_count = defaultdict(int)
    left = max_length = max_freq = 0
    
    for right in range(len(s)):
        char_count[s[right]] += 1
        max_freq = max(max_freq, char_count[s[right]])
        
        # If window size - most frequent char > k, shrink window
        if right - left + 1 - max_freq > k:
            char_count[s[left]] -= 1
            left += 1
        
        max_length = max(max_length, right - left + 1)
    
    return max_length

# Example: s = "ABAB", k = 2 → 4
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Data normalization, error correction
- **Manager Insight**: Frequency-based optimization
- **Similar**: Max Consecutive Ones III, Longest Substring with At Most K Distinct

**36. Permutation in String (LeetCode #567)**
```python
def check_inclusion(s1, s2):
    """Check if s2 contains permutation of s1."""
    from collections import Counter
    
    if len(s1) > len(s2):
        return False
    
    s1_count = Counter(s1)
    window_count = Counter(s2[:len(s1)])
    
    if window_count == s1_count:
        return True
    
    for i in range(len(s1), len(s2)):
        # Add new character
        window_count[s2[i]] += 1
        
        # Remove old character
        old_char = s2[i - len(s1)]
        window_count[old_char] -= 1
        if window_count[old_char] == 0:
            del window_count[old_char]
        
        if window_count == s1_count:
            return True
    
    return False

# Example: s1 = "ab", s2 = "eidbaooo" → True
```
- **Time**: O(n), **Space**: O(k)
- **Amazon Context**: Pattern matching, anagram detection
- **Manager Insight**: Fixed-window string matching
- **Similar**: Find All Anagrams in a String, Substring with Concatenation

**37. Max Consecutive Ones III (LeetCode #1004)**
```python
def longest_ones(nums, k):
    """Longest subarray with at most k zeros flipped."""
    left = zeros_count = max_length = 0
    
    for right in range(len(nums)):
        if nums[right] == 0:
            zeros_count += 1
        
        while zeros_count > k:
            if nums[left] == 0:
                zeros_count -= 1
            left += 1
        
        max_length = max(max_length, right - left + 1)
    
    return max_length

# Example: nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2 → 6
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: System reliability, uptime optimization
- **Manager Insight**: Constraint-based window expansion
- **Similar**: Max Consecutive Ones, Longest Repeating Character Replacement

**38. Fruit Into Baskets (LeetCode #904)**
```python
def total_fruit(fruits):
    """Maximum fruits you can collect with 2 baskets."""
    from collections import defaultdict
    
    basket = defaultdict(int)
    left = max_fruits = 0
    
    for right in range(len(fruits)):
        basket[fruits[right]] += 1
        
        while len(basket) > 2:
            basket[fruits[left]] -= 1
            if basket[fruits[left]] == 0:
                del basket[fruits[left]]
            left += 1
        
        max_fruits = max(max_fruits, right - left + 1)
    
    return max_fruits

# Example: fruits = [1,2,1] → 3
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Resource optimization, capacity constraints
- **Manager Insight**: At-most-K distinct elements pattern
- **Similar**: Longest Substring with At Most Two Distinct Characters

**39. Subarrays with K Different Integers (LeetCode #992)**
```python
def subarrays_with_k_distinct(nums, k):
    """Count subarrays with exactly k distinct integers."""
    def at_most_k(k):
        from collections import defaultdict
        count = defaultdict(int)
        left = result = 0
        
        for right in range(len(nums)):
            if count[nums[right]] == 0:
                k -= 1
            count[nums[right]] += 1
            
            while k < 0:
                count[nums[left]] -= 1
                if count[nums[left]] == 0:
                    k += 1
                left += 1
            
            result += right - left + 1
        
        return result
    
    return at_most_k(k) - at_most_k(k - 1)

# Example: nums = [1,2,1,2,3], k = 2 → 7
```
- **Time**: O(n), **Space**: O(k)
- **Amazon Context**: Analytics, distinct value counting
- **Manager Insight**: Exactly-K problems using at-most-K
- **Similar**: Binary Subarrays With Sum, Count Number of Nice Subarrays

### Hard Difficulty (1 problem)

**40. Sliding Window Maximum (LeetCode #239)**
```python
def max_sliding_window(nums, k):
    """Maximum in each sliding window of size k."""
    from collections import deque
    
    dq = deque()
    result = []
    
    for i, num in enumerate(nums):
        # Remove elements outside window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        
        # Remove smaller elements
        while dq and nums[dq[-1]] < num:
            dq.pop()
        
        dq.append(i)
        
        # Add to result if window is complete
        if i >= k - 1:
            result.append(nums[dq[0]])
    
    return result

# Example: nums = [1,3,-1,-3,5,3,6,7], k = 3 → [3,3,5,5,6,7]
```
- **Time**: O(n), **Space**: O(k)
- **Amazon Context**: Real-time metrics, monitoring dashboards
- **Manager Insight**: Monotonic deque optimization
- **Similar**: Sliding Window Minimum, Constrained Subsequence Sum

---

## Category 4: Hash Tables (10 Problems)

### Easy Difficulty (4 problems)

**41. Contains Duplicate (LeetCode #217)**
```python
def contains_duplicate(nums):
    """Check if array contains duplicates."""
    return len(nums) != len(set(nums))

# Alternative O(n) space approach:
def contains_duplicate_optimized(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False

# Example: [1,2,3,1] → True
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Data validation, duplicate detection
- **Manager Insight**: Set operations for uniqueness checks
- **Similar**: Contains Duplicate II, Contains Duplicate III

**42. Valid Anagram (LeetCode #242)**
```python
def is_anagram(s, t):
    """Check if two strings are anagrams."""
    from collections import Counter
    return Counter(s) == Counter(t)

# Alternative sorting approach:
def is_anagram_sort(s, t):
    return sorted(s) == sorted(t)

# Example: s = "anagram", t = "nagaram" → True
```
- **Time**: O(n), **Space**: O(1) - limited alphabet
- **Amazon Context**: Text analysis, content comparison
- **Manager Insight**: Character frequency comparison
- **Similar**: Group Anagrams, Find All Anagrams

**43. Two Sum (LeetCode #1)**
```python
def two_sum(nums, target):
    """Find two numbers that add up to target."""
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []

# Example: nums = [2,7,11,15], target = 9 → [0,1]
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Pair finding, complement lookup
- **Manager Insight**: Hash map for O(1) lookups
- **Similar**: Two Sum II, 3Sum, 4Sum

**44. Happy Number (LeetCode #202)**
```python
def is_happy(n):
    """Check if number is happy."""
    def get_sum_of_squares(num):
        total = 0
        while num:
            digit = num % 10
            total += digit * digit
            num //= 10
        return total
    
    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        n = get_sum_of_squares(n)
    
    return n == 1

# Example: 19 → True (1→1, 9→81, 8→64, 1→1, 4→16, 6→36, 3→9, 6→36...)
```
- **Time**: O(log n), **Space**: O(log n)
- **Amazon Context**: Validation algorithms, cycle detection
- **Manager Insight**: Cycle detection using hash sets
- **Similar**: Linked List Cycle, Find the Duplicate Number

### Medium Difficulty (5 problems)

**45. Group Anagrams (LeetCode #49)**
```python
def group_anagrams(strs):
    """Group strings that are anagrams."""
    from collections import defaultdict
    
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        groups[key].append(s)
    
    return list(groups.values())

# Example: ["eat","tea","tan","ate","nat","bat"] → [["eat","tea","ate"],["tan","nat"],["bat"]]
```
- **Time**: O(n * k log k), **Space**: O(n * k)
- **Amazon Context**: Data categorization, content grouping
- **Manager Insight**: Canonical form for grouping
- **Similar**: Valid Anagram, Find All Anagrams

**46. Top K Frequent Elements (LeetCode #347)**
```python
def top_k_frequent(nums, k):
    """Find k most frequent elements."""
    from collections import Counter
    import heapq
    
    count = Counter(nums)
    return heapq.nlargest(k, count.keys(), key=count.get)

# Alternative bucket sort approach:
def top_k_frequent_bucket(nums, k):
    from collections import Counter
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    
    for num, freq in count.items():
        buckets[freq].append(num)
    
    result = []
    for i in range(len(buckets) - 1, -1, -1):
        for num in buckets[i]:
            result.append(num)
            if len(result) == k:
                return result

# Example: nums = [1,1,1,2,2,3], k = 2 → [1,2]
```
- **Time**: O(n log k), **Space**: O(n)
- **Amazon Context**: Analytics, trending analysis
- **Manager Insight**: Frequency-based ranking systems
- **Similar**: Kth Largest Element, Top K Frequent Words

**47. Longest Consecutive Sequence (LeetCode #128)**
```python
def longest_consecutive(nums):
    """Find length of longest consecutive sequence."""
    num_set = set(nums)
    longest = 0
    
    for num in num_set:
        # Only start counting from sequence start
        if num - 1 not in num_set:
            current_num = num
            current_streak = 1
            
            while current_num + 1 in num_set:
                current_num += 1
                current_streak += 1
            
            longest = max(longest, current_streak)
    
    return longest

# Example: [100,4,200,1,3,2] → 4 ([1,2,3,4])
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Sequence analysis, data continuity
- **Manager Insight**: Set-based sequence detection
- **Similar**: Binary Tree Longest Consecutive Sequence

**48. Subarray Sum Equals K (LeetCode #560)**
```python
def subarray_sum(nums, k):
    """Count subarrays with sum equal to k."""
    from collections import defaultdict
    
    count = 0
    prefix_sum = 0
    sum_count = defaultdict(int)
    sum_count[0] = 1  # Empty prefix
    
    for num in nums:
        prefix_sum += num
        count += sum_count[prefix_sum - k]
        sum_count[prefix_sum] += 1
    
    return count

# Example: nums = [1,1,1], k = 2 → 2
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Financial analysis, target sum finding
- **Manager Insight**: Prefix sum with hash map optimization
- **Similar**: Two Sum, Continuous Subarray Sum

**49. 4Sum II (LeetCode #454)**
```python
def four_sum_count(nums1, nums2, nums3, nums4):
    """Count tuples with sum equal to 0."""
    from collections import defaultdict
    
    # Count sums of pairs from first two arrays
    sum_count = defaultdict(int)
    for a in nums1:
        for b in nums2:
            sum_count[a + b] += 1
    
    count = 0
    # Check if complement exists in remaining arrays
    for c in nums3:
        for d in nums4:
            count += sum_count[-(c + d)]
    
    return count

# Example: nums1 = [1,2], nums2 = [-2,-1], nums3 = [-1,2], nums4 = [0,2] → 2
```
- **Time**: O(n²), **Space**: O(n²)
- **Amazon Context**: Multi-dimensional analysis, correlation finding
- **Manager Insight**: Hash map to reduce complexity from O(n⁴) to O(n²)
- **Similar**: 4Sum, Two Sum, 3Sum

### Hard Difficulty (1 problem)

**50. First Missing Positive (LeetCode #41)**
```python
def first_missing_positive(nums):
    """Find smallest missing positive integer."""
    n = len(nums)
    
    # Mark presence of numbers 1 to n
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            nums[nums[i] - 1], nums[i] = nums[i], nums[nums[i] - 1]
    
    # Find first missing positive
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    
    return n + 1

# Example: [3,4,-1,1] → 2
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Resource tracking, ID generation
- **Manager Insight**: Array as hash map using indices
- **Similar**: Missing Number, Find All Numbers Disappeared

---

## Category 5: Trees & Graphs (15 Problems)

### Easy Difficulty (6 problems)

**51. Maximum Depth of Binary Tree (LeetCode #104)**
```python
def max_depth(root):
    """Find maximum depth of binary tree."""
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

# Iterative approach:
def max_depth_iterative(root):
    if not root:
        return 0
    
    from collections import deque
    queue = deque([(root, 1)])
    max_depth = 0
    
    while queue:
        node, depth = queue.popleft()
        max_depth = max(max_depth, depth)
        
        if node.left:
            queue.append((node.left, depth + 1))
        if node.right:
            queue.append((node.right, depth + 1))
    
    return max_depth

# Example: [3,9,20,null,null,15,7] → 3
```
- **Time**: O(n), **Space**: O(h) where h is height
- **Amazon Context**: System hierarchy analysis, org chart depth
- **Manager Insight**: Tree traversal fundamentals
- **Similar**: Minimum Depth of Binary Tree, Balanced Binary Tree

**52. Same Tree (LeetCode #100)**
```python
def is_same_tree(p, q):
    """Check if two trees are the same."""
    if not p and not q:
        return True
    if not p or not q:
        return False
    return (p.val == q.val and 
            is_same_tree(p.left, q.left) and 
            is_same_tree(p.right, q.right))

# Example: p = [1,2,3], q = [1,2,3] → True
```
- **Time**: O(n), **Space**: O(h)
- **Amazon Context**: Configuration comparison, system validation
- **Manager Insight**: Structural equality checking
- **Similar**: Symmetric Tree, Subtree of Another Tree

**53. Invert Binary Tree (LeetCode #226)**
```python
def invert_tree(root):
    """Invert a binary tree."""
    if not root:
        return None
    
    root.left, root.right = root.right, root.left
    invert_tree(root.left)
    invert_tree(root.right)
    
    return root

# Example: [4,2,7,1,3,6,9] → [4,7,2,9,6,3,1]
```
- **Time**: O(n), **Space**: O(h)
- **Amazon Context**: Data transformation, mirror operations
- **Manager Insight**: In-place tree manipulation
- **Similar**: Symmetric Tree, Binary Tree Upside Down

**54. Path Sum (LeetCode #112)**
```python
def has_path_sum(root, target_sum):
    """Check if path from root to leaf sums to target."""
    if not root:
        return False
    
    if not root.left and not root.right:
        return root.val == target_sum
    
    return (has_path_sum(root.left, target_sum - root.val) or
            has_path_sum(root.right, target_sum - root.val))

# Example: root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22 → True
```
- **Time**: O(n), **Space**: O(h)
- **Amazon Context**: Budget validation, resource tracking
- **Manager Insight**: Path-based decision making
- **Similar**: Path Sum II, Path Sum III

**55. Symmetric Tree (LeetCode #101)**
```python
def is_symmetric(root):
    """Check if tree is symmetric."""
    def is_mirror(t1, t2):
        if not t1 and not t2:
            return True
        if not t1 or not t2:
            return False
        return (t1.val == t2.val and 
                is_mirror(t1.left, t2.right) and 
                is_mirror(t1.right, t2.left))
    
    return is_mirror(root, root)

# Example: [1,2,2,3,4,4,3] → True
```
- **Time**: O(n), **Space**: O(h)
- **Amazon Context**: Data validation, symmetry checking
- **Manager Insight**: Mirror image comparison
- **Similar**: Same Tree, Invert Binary Tree

**56. Binary Tree Level Order Traversal (LeetCode #102)**
```python
def level_order(root):
    """Level order traversal of binary tree."""
    if not root:
        return []
    
    from collections import deque
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

# Example: [3,9,20,null,null,15,7] → [[3],[9,20],[15,7]]
```
- **Time**: O(n), **Space**: O(w) where w is max width
- **Amazon Context**: Hierarchical reporting, level-wise processing
- **Manager Insight**: BFS traversal pattern
- **Similar**: Binary Tree Level Order Traversal II, Binary Tree Zigzag

### Medium Difficulty (7 problems)

**57. Validate Binary Search Tree (LeetCode #98)**
```python
def is_valid_bst(root):
    """Validate binary search tree."""
    def validate(node, min_val, max_val):
        if not node:
            return True
        
        if node.val <= min_val or node.val >= max_val:
            return False
        
        return (validate(node.left, min_val, node.val) and
                validate(node.right, node.val, max_val))
    
    return validate(root, float('-inf'), float('inf'))

# Example: [2,1,3] → True, [5,1,4,null,null,3,6] → False
```
- **Time**: O(n), **Space**: O(h)
- **Amazon Context**: Data integrity validation, ordered system verification
- **Manager Insight**: Property validation with constraints
- **Similar**: Recover Binary Search Tree, Convert Sorted Array to BST

**58. Lowest Common Ancestor of a Binary Tree (LeetCode #236)**
```python
def lowest_common_ancestor(root, p, q):
    """Find LCA in binary tree."""
    if not root or root == p or root == q:
        return root
    
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    
    if left and right:
        return root
    
    return left or right

# Example: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1 → 3
```
- **Time**: O(n), **Space**: O(h)
- **Amazon Context**: Hierarchy management, common parent finding
- **Manager Insight**: Bottom-up tree search
- **Similar**: Lowest Common Ancestor of BST, Lowest Common Ancestor III

**59. Binary Tree Maximum Path Sum (LeetCode #124)**
```python
def max_path_sum(root):
    """Find maximum path sum in binary tree."""
    max_sum = float('-inf')
    
    def max_gain(node):
        nonlocal max_sum
        if not node:
            return 0
        
        left_gain = max(max_gain(node.left), 0)
        right_gain = max(max_gain(node.right), 0)
        
        current_max = node.val + left_gain + right_gain
        max_sum = max(max_sum, current_max)
        
        return node.val + max(left_gain, right_gain)
    
    max_gain(root)
    return max_sum

# Example: [1,2,3] → 6, [-10,9,20,null,null,15,7] → 42
```
- **Time**: O(n), **Space**: O(h)
- **Amazon Context**: Optimization analysis, maximum value paths
- **Manager Insight**: Complex optimization with choices
- **Similar**: Diameter of Binary Tree, Binary Tree Maximum Width

**60. Construct Binary Tree from Preorder and Inorder (LeetCode #105)**
```python
def build_tree(preorder, inorder):
    """Build tree from preorder and inorder traversals."""
    if not preorder or not inorder:
        return None
    
    root = TreeNode(preorder[0])
    mid = inorder.index(preorder[0])
    
    root.left = build_tree(preorder[1:mid+1], inorder[:mid])
    root.right = build_tree(preorder[mid+1:], inorder[mid+1:])
    
    return root

# Optimized version with index map:
def build_tree_optimized(preorder, inorder):
    inorder_map = {val: i for i, val in enumerate(inorder)}
    preorder_idx = [0]
    
    def helper(left, right):
        if left > right:
            return None
        
        root_val = preorder[preorder_idx[0]]
        preorder_idx[0] += 1
        root = TreeNode(root_val)
        
        mid = inorder_map[root_val]
        root.left = helper(left, mid - 1)
        root.right = helper(mid + 1, right)
        
        return root
    
    return helper(0, len(inorder) - 1)

# Example: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7] → tree
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: System reconstruction, data restoration
- **Manager Insight**: Tree construction from traversals
- **Similar**: Construct Binary Tree from Inorder and Postorder

**61. Serialize and Deserialize Binary Tree (LeetCode #297)**
```python
def serialize(root):
    """Serialize binary tree to string."""
    def preorder(node):
        if not node:
            vals.append("#")
        else:
            vals.append(str(node.val))
            preorder(node.left)
            preorder(node.right)
    
    vals = []
    preorder(root)
    return ','.join(vals)

def deserialize(data):
    """Deserialize string to binary tree."""
    def build_tree():
        val = next(vals)
        if val == "#":
            return None
        node = TreeNode(int(val))
        node.left = build_tree()
        node.right = build_tree()
        return node
    
    vals = iter(data.split(','))
    return build_tree()

# Example: [1,2,3,null,null,4,5] → "1,2,#,#,3,4,#,#,5,#,#"
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Data persistence, caching strategies
- **Manager Insight**: Tree serialization protocols
- **Similar**: Serialize and Deserialize BST, Encode and Decode Strings

**62. Number of Islands (LeetCode #200)**
```python
def num_islands(grid):
    """Count number of islands in grid."""
    if not grid or not grid[0]:
        return 0
    
    rows, cols = len(grid), len(grid[0])
    islands = 0
    
    def dfs(r, c):
        if (r < 0 or r >= rows or c < 0 or c >= cols or 
            grid[r][c] != '1'):
            return
        
        grid[r][c] = '0'  # Mark as visited
        
        # Visit all adjacent cells
        dfs(r-1, c)
        dfs(r+1, c)
        dfs(r, c-1)
        dfs(r, c+1)
    
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                islands += 1
                dfs(r, c)
    
    return islands

# Example: grid = [["1","1","0"],["1","1","0"],["0","0","1"]] → 2
```
- **Time**: O(m*n), **Space**: O(m*n)
- **Amazon Context**: Network analysis, cluster detection
- **Manager Insight**: Connected components in graphs
- **Similar**: Number of Connected Components, Max Area of Island

**63. Clone Graph (LeetCode #133)**
```python
def clone_graph(node):
    """Clone an undirected graph."""
    if not node:
        return None
    
    visited = {}
    
    def dfs(node):
        if node in visited:
            return visited[node]
        
        clone = Node(node.val)
        visited[node] = clone
        
        for neighbor in node.neighbors:
            clone.neighbors.append(dfs(neighbor))
        
        return clone
    
    return dfs(node)

# BFS approach:
def clone_graph_bfs(node):
    if not node:
        return None
    
    from collections import deque
    visited = {node: Node(node.val)}
    queue = deque([node])
    
    while queue:
        current = queue.popleft()
        
        for neighbor in current.neighbors:
            if neighbor not in visited:
                visited[neighbor] = Node(neighbor.val)
                queue.append(neighbor)
            
            visited[current].neighbors.append(visited[neighbor])
    
    return visited[node]

# Example: adjList = [[2,4],[1,3],[2,4],[1,3]] → cloned graph
```
- **Time**: O(V + E), **Space**: O(V)
- **Amazon Context**: System replication, backup creation
- **Manager Insight**: Graph traversal and cloning
- **Similar**: Copy List with Random Pointer, Clone N-ary Tree

### Hard Difficulty (2 problems)

**64. Binary Tree Maximum Path Sum (Already covered above)**

**65. Word Ladder (LeetCode #127)**
```python
def ladder_length(begin_word, end_word, word_list):
    """Find length of shortest transformation sequence."""
    if end_word not in word_list:
        return 0
    
    from collections import deque, defaultdict
    
    # Build adjacency list
    neighbors = defaultdict(list)
    word_list.append(begin_word)
    
    for word in word_list:
        for i in range(len(word)):
            pattern = word[:i] + "*" + word[i+1:]
            neighbors[pattern].append(word)
    
    # BFS
    visited = {begin_word}
    queue = deque([begin_word])
    level = 1
    
    while queue:
        for _ in range(len(queue)):
            word = queue.popleft()
            
            if word == end_word:
                return level
            
            for i in range(len(word)):
                pattern = word[:i] + "*" + word[i+1:]
                
                for neighbor in neighbors[pattern]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
        
        level += 1
    
    return 0

# Example: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"] → 5
```
- **Time**: O(M² × N), **Space**: O(M² × N)
- **Amazon Context**: System migration paths, dependency resolution
- **Manager Insight**: Shortest path in unweighted graphs
- **Similar**: Word Ladder II, Minimum Genetic Mutation

---

## Category 6: Dynamic Programming (10 Problems)

### Easy Difficulty (3 problems)

**66. Climbing Stairs (LeetCode #70)**
```python
def climb_stairs(n):
    """Number of ways to climb n stairs."""
    if n <= 2:
        return n
    
    prev2, prev1 = 1, 2
    for i in range(3, n + 1):
        current = prev1 + prev2
        prev2, prev1 = prev1, current
    
    return prev1

# Example: n = 3 → 3 (1+1+1, 1+2, 2+1)
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Resource scaling, capacity planning
- **Manager Insight**: Basic DP optimization from recursion
- **Similar**: Fibonacci Number, Min Cost Climbing Stairs

**67. House Robber (LeetCode #198)**
```python
def rob(nums):
    """Maximum money that can be robbed."""
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    
    prev2, prev1 = nums[0], max(nums[0], nums[1])
    
    for i in range(2, len(nums)):
        current = max(prev1, prev2 + nums[i])
        prev2, prev1 = prev1, current
    
    return prev1

# Example: [2,7,9,3,1] → 12 (2+9+1)
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Resource optimization with constraints
- **Manager Insight**: State-based decision making
- **Similar**: House Robber II, House Robber III

**68. Maximum Subarray (LeetCode #53)**
```python
def max_subarray(nums):
    """Find maximum sum of contiguous subarray (Kadane's Algorithm)."""
    max_sum = current_sum = nums[0]
    
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    
    return max_sum

# Example: [-2,1,-3,4,-1,2,1,-5,4] → 6
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Performance metrics analysis
- **Manager Insight**: Optimal substructure principle
- **Similar**: Maximum Product Subarray, Maximum Sum Circular Subarray

### Medium Difficulty (6 problems)

**69. Coin Change (LeetCode #322)**
```python
def coin_change(coins, amount):
    """Minimum coins to make amount."""
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1

# Example: coins = [1,3,4], amount = 6 → 2 (3+3)
```
- **Time**: O(amount × coins), **Space**: O(amount)
- **Amazon Context**: Cost optimization, resource allocation
- **Manager Insight**: Unbounded knapsack variant
- **Similar**: Coin Change 2, Combination Sum IV

**70. Longest Increasing Subsequence (LeetCode #300)**
```python
def length_of_lis(nums):
    """Length of longest increasing subsequence."""
    if not nums:
        return 0
    
    dp = [1] * len(nums)
    
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    
    return max(dp)

# O(n log n) solution using binary search:
def length_of_lis_optimized(nums):
    import bisect
    tails = []
    
    for num in nums:
        pos = bisect.bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)
        else:
            tails[pos] = num
    
    return len(tails)

# Example: [10,9,2,5,3,7,101,18] → 4
```
- **Time**: O(n²) or O(n log n), **Space**: O(n)
- **Amazon Context**: Growth analysis, trend detection
- **Manager Insight**: Patience sorting algorithm
- **Similar**: Russian Doll Envelopes, Number of LIS

**71. Word Break (LeetCode #139)**
```python
def word_break(s, word_dict):
    """Check if string can be segmented using dictionary."""
    dp = [False] * (len(s) + 1)
    dp[0] = True
    word_set = set(word_dict)
    
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break
    
    return dp[len(s)]

# Example: s = "leetcode", wordDict = ["leet","code"] → True
```
- **Time**: O(n³), **Space**: O(n)
- **Amazon Context**: Text processing, parsing validation
- **Manager Insight**: Substring validation with memoization
- **Similar**: Word Break II, Concatenated Words

**72. Unique Paths (LeetCode #62)**
```python
def unique_paths(m, n):
    """Number of unique paths in grid."""
    dp = [[1] * n for _ in range(m)]
    
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    
    return dp[m-1][n-1]

# Space optimized version:
def unique_paths_optimized(m, n):
    dp = [1] * n
    
    for i in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j-1]
    
    return dp[n-1]

# Example: m = 3, n = 7 → 28
```
- **Time**: O(m*n), **Space**: O(m*n) or O(n)
- **Amazon Context**: Path planning, routing optimization
- **Manager Insight**: Grid-based DP patterns
- **Similar**: Unique Paths II, Minimum Path Sum

**73. Decode Ways (LeetCode #91)**
```python
def num_decodings(s):
    """Number of ways to decode string."""
    if not s or s[0] == '0':
        return 0
    
    prev2, prev1 = 1, 1
    
    for i in range(1, len(s)):
        current = 0
        
        # Single digit
        if s[i] != '0':
            current += prev1
        
        # Two digits
        two_digit = int(s[i-1:i+1])
        if 10 <= two_digit <= 26:
            current += prev2
        
        prev2, prev1 = prev1, current
    
    return prev1

# Example: "12" → 2 ("AB" or "L"), "226" → 3
```
- **Time**: O(n), **Space**: O(1)
- **Amazon Context**: Encoding/decoding systems, format validation
- **Manager Insight**: Multiple choice DP optimization
- **Similar**: Decode Ways II, Number of Ways to Stay in Same Place

**74. Edit Distance (LeetCode #72)**
```python
def min_distance(word1, word2):
    """Minimum operations to convert word1 to word2."""
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Initialize base cases
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    
    # Fill DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j],    # Delete
                    dp[i][j-1],    # Insert
                    dp[i-1][j-1]   # Replace
                )
    
    return dp[m][n]

# Example: word1 = "horse", word2 = "ros" → 3
```
- **Time**: O(m*n), **Space**: O(m*n)
- **Amazon Context**: Spell check, fuzzy matching systems
- **Manager Insight**: String distance algorithms
- **Similar**: One Edit Distance, Delete Operation for Two Strings

### Hard Difficulty (1 problem)

**75. Regular Expression Matching (LeetCode #10)**
```python
def is_match(s, p):
    """Check if string matches pattern with . and *."""
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    
    # Base case
    dp[0][0] = True
    
    # Handle patterns like a*, a*b*, a*b*c*
    for j in range(2, n + 1):
        if p[j-1] == '*':
            dp[0][j] = dp[0][j-2]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j-1] == '*':
                # Zero occurrences
                dp[i][j] = dp[i][j-2]
                
                # One or more occurrences
                if p[j-2] == '.' or p[j-2] == s[i-1]:
                    dp[i][j] |= dp[i-1][j]
            else:
                # Exact match or wildcard
                if p[j-1] == '.' or p[j-1] == s[i-1]:
                    dp[i][j] = dp[i-1][j-1]
    
    return dp[m][n]

# Example: s = "aa", p = "a*" → True
```
- **Time**: O(m*n), **Space**: O(m*n)
- **Amazon Context**: Pattern matching, regex validation
- **Manager Insight**: Complex state transitions in DP
- **Similar**: Wildcard Matching, Expression Add Operators

---

## Category 7: Stack & Queue (10 Problems)

### Easy Difficulty (4 problems)

**76. Valid Parentheses (LeetCode #20)**
```python
def is_valid(s):
    """Check if parentheses are properly matched."""
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    
    return not stack

# Example: "()[]{}" → True, "([)]" → False
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Configuration validation, bracket matching
- **Manager Insight**: Stack for LIFO matching problems
- **Similar**: Generate Parentheses, Remove Invalid Parentheses

**77. Implement Queue using Stacks (LeetCode #232)**
```python
class MyQueue:
    """Queue implementation using two stacks."""
    
    def __init__(self):
        self.input_stack = []
        self.output_stack = []
    
    def push(self, x):
        """Push element to back of queue."""
        self.input_stack.append(x)
    
    def pop(self):
        """Remove element from front of queue."""
        self.peek()
        return self.output_stack.pop()
    
    def peek(self):
        """Get front element."""
        if not self.output_stack:
            while self.input_stack:
                self.output_stack.append(self.input_stack.pop())
        return self.output_stack[-1]
    
    def empty(self):
        """Check if queue is empty."""
        return not self.input_stack and not self.output_stack

# Example: queue.push(1); queue.push(2); queue.peek() → 1; queue.pop() → 1
```
- **Time**: O(1) amortized, **Space**: O(n)
- **Amazon Context**: Data structure design, system interfaces
- **Manager Insight**: Amortized analysis importance
- **Similar**: Implement Stack using Queues, Design Circular Queue

**78. Min Stack (LeetCode #155)**
```python
class MinStack:
    """Stack with constant time minimum element access."""
    
    def __init__(self):
        self.stack = []
        self.min_stack = []
    
    def push(self, val):
        """Push element onto stack."""
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
    
    def pop(self):
        """Remove top element."""
        if self.stack:
            val = self.stack.pop()
            if val == self.min_stack[-1]:
                self.min_stack.pop()
    
    def top(self):
        """Get top element."""
        return self.stack[-1] if self.stack else None
    
    def get_min(self):
        """Get minimum element."""
        return self.min_stack[-1] if self.min_stack else None

# Example: minStack.push(-2); minStack.push(0); minStack.getMin() → -2
```
- **Time**: O(1) all operations, **Space**: O(n)
- **Amazon Context**: Monitoring systems, metric tracking
- **Manager Insight**: Auxiliary data structures for optimization
- **Similar**: Max Stack, Design a Stack With Increment Operation

**79. Backspace String Compare (LeetCode #844)**
```python
def backspace_compare(s, t):
    """Compare strings after backspace operations."""
    def build_string(string):
        stack = []
        for char in string:
            if char != '#':
                stack.append(char)
            elif stack:
                stack.pop()
        return ''.join(stack)
    
    return build_string(s) == build_string(t)

# Space optimized two-pointer approach:
def backspace_compare_optimized(s, t):
    def get_next_char(string, index):
        backspace_count = 0
        while index >= 0:
            if string[index] == '#':
                backspace_count += 1
            elif backspace_count > 0:
                backspace_count -= 1
            else:
                break
            index -= 1
        return index
    
    i, j = len(s) - 1, len(t) - 1
    
    while i >= 0 or j >= 0:
        i = get_next_char(s, i)
        j = get_next_char(t, j)
        
        if i < 0 and j < 0:
            return True
        if i < 0 or j < 0:
            return False
        if s[i] != t[j]:
            return False
        
        i -= 1
        j -= 1
    
    return True

# Example: s = "ab#c", t = "ad#c" → True
```
- **Time**: O(n), **Space**: O(n) or O(1)
- **Amazon Context**: Text processing, undo operations
- **Manager Insight**: Stack simulation vs space optimization
- **Similar**: Remove All Adjacent Duplicates, Asteroid Collision

### Medium Difficulty (5 problems)

**80. Daily Temperatures (LeetCode #739)**
```python
def daily_temperatures(temperatures):
    """Days until warmer temperature for each day."""
    result = [0] * len(temperatures)
    stack = []  # Store indices
    
    for i, temp in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < temp:
            prev_index = stack.pop()
            result[prev_index] = i - prev_index
        stack.append(i)
    
    return result

# Example: [73,74,75,71,69,72,76,73] → [1,1,4,2,1,1,0,0]
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Time series analysis, next greater element
- **Manager Insight**: Monotonic stack applications
- **Similar**: Next Greater Element, Next Greater Element II

**81. Evaluate Reverse Polish Notation (LeetCode #150)**
```python
def eval_rpn(tokens):
    """Evaluate expression in Reverse Polish Notation."""
    stack = []
    
    for token in tokens:
        if token in ['+', '-', '*', '/']:
            b = stack.pop()
            a = stack.pop()
            
            if token == '+':
                stack.append(a + b)
            elif token == '-':
                stack.append(a - b)
            elif token == '*':
                stack.append(a * b)
            else:  # token == '/'
                # Truncate towards zero
                stack.append(int(a / b))
        else:
            stack.append(int(token))
    
    return stack[0]

# Example: ["2","1","+","3","*"] → 9 ((2+1)*3)
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Expression evaluation, calculator implementation
- **Manager Insight**: Stack-based expression parsing
- **Similar**: Basic Calculator, Basic Calculator II

**82. Decode String (LeetCode #394)**
```python
def decode_string(s):
    """Decode string with nested brackets."""
    stack = []
    current_string = ""
    current_num = 0
    
    for char in s:
        if char.isdigit():
            current_num = current_num * 10 + int(char)
        elif char == '[':
            stack.append((current_string, current_num))
            current_string = ""
            current_num = 0
        elif char == ']':
            prev_string, num = stack.pop()
            current_string = prev_string + current_string * num
        else:
            current_string += char
    
    return current_string

# Example: "3[a2[c]]" → "accaccacc"
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: String processing, nested structure parsing
- **Manager Insight**: Stack for nested operations
- **Similar**: Number of Atoms, Parse Lisp Expression

**83. Asteroid Collision (LeetCode #735)**
```python
def asteroid_collision(asteroids):
    """Simulate asteroid collisions."""
    stack = []
    
    for asteroid in asteroids:
        while stack and asteroid < 0 < stack[-1]:
            if stack[-1] < -asteroid:
                stack.pop()
                continue
            elif stack[-1] == -asteroid:
                stack.pop()
            break
        else:
            stack.append(asteroid)
    
    return stack

# Example: [5,10,-5] → [5,10], [8,-8] → [], [10,2,-5] → [10]
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Simulation, collision detection
- **Manager Insight**: State machine with stack
- **Similar**: Car Fleet, Remove All Adjacent Duplicates

**84. Sliding Window Maximum (LeetCode #239)**
```python
def max_sliding_window(nums, k):
    """Maximum in each sliding window of size k."""
    from collections import deque
    
    dq = deque()
    result = []
    
    for i, num in enumerate(nums):
        # Remove elements outside window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        
        # Remove smaller elements
        while dq and nums[dq[-1]] < num:
            dq.pop()
        
        dq.append(i)
        
        # Add to result if window is complete
        if i >= k - 1:
            result.append(nums[dq[0]])
    
    return result

# Example: nums = [1,3,-1,-3,5,3,6,7], k = 3 → [3,3,5,5,6,7]
```
- **Time**: O(n), **Space**: O(k)
- **Amazon Context**: Real-time monitoring, window-based analytics
- **Manager Insight**: Monotonic deque for range queries
- **Similar**: Sliding Window Minimum, Constrained Subsequence Sum

### Hard Difficulty (1 problem)

**85. Largest Rectangle in Histogram (LeetCode #84)**
```python
def largest_rectangle_area(heights):
    """Find largest rectangle area in histogram."""
    stack = []
    max_area = 0
    
    for i, height in enumerate(heights):
        while stack and heights[stack[-1]] > height:
            h = heights[stack.pop()]
            w = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, h * w)
        stack.append(i)
    
    while stack:
        h = heights[stack.pop()]
        w = len(heights) if not stack else len(heights) - stack[-1] - 1
        max_area = max(max_area, h * w)
    
    return max_area

# Example: [2,1,5,6,2,3] → 10
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Resource utilization, capacity optimization
- **Manager Insight**: Stack for range optimization problems
- **Similar**: Maximal Rectangle, Remove K Digits

---

## Category 8: Binary Search (5 Problems)

### Easy Difficulty (2 problems)

**86. Binary Search (LeetCode #704)**
```python
def search(nums, target):
    """Binary search in sorted array."""
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Example: nums = [-1,0,3,5,9,12], target = 9 → 4
```
- **Time**: O(log n), **Space**: O(1)
- **Amazon Context**: Efficient lookups, data retrieval
- **Manager Insight**: Logarithmic search fundamentals
- **Similar**: Search Insert Position, Find Peak Element

**87. First Bad Version (LeetCode #278)**
```python
def first_bad_version(n):
    """Find first bad version using isBadVersion API."""
    left, right = 1, n
    
    while left < right:
        mid = (left + right) // 2
        
        if isBadVersion(mid):
            right = mid
        else:
            left = mid + 1
    
    return left

# Example: n = 5, bad = 4 → 4
```
- **Time**: O(log n), **Space**: O(1)
- **Amazon Context**: Bug detection, version control
- **Manager Insight**: API-based binary search
- **Similar**: Search Insert Position, Find Peak Element

### Medium Difficulty (2 problems)

**88. Search in Rotated Sorted Array (LeetCode #33)**
```python
def search_rotated(nums, target):
    """Search in rotated sorted array."""
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
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

# Example: nums = [4,5,6,7,0,1,2], target = 0 → 4
```
- **Time**: O(log n), **Space**: O(1)
- **Amazon Context**: Distributed system searches, circular buffers
- **Manager Insight**: Modified binary search for rotated data
- **Similar**: Search in Rotated Sorted Array II, Find Minimum in Rotated Sorted Array

**89. Find Peak Element (LeetCode #162)**
```python
def find_peak_element(nums):
    """Find peak element in array."""
    left, right = 0, len(nums) - 1
    
    while left < right:
        mid = (left + right) // 2
        
        if nums[mid] > nums[mid + 1]:
            right = mid
        else:
            left = mid + 1
    
    return left

# Example: nums = [1,2,3,1] → 2
```
- **Time**: O(log n), **Space**: O(1)
- **Amazon Context**: Performance analysis, local maxima detection
- **Manager Insight**: Binary search on unimodal functions
- **Similar**: Peak Index in Mountain Array, Find Peak Element II

### Hard Difficulty (1 problem)

**90. Median of Two Sorted Arrays (LeetCode #4)**
```python
def find_median_sorted_arrays(nums1, nums2):
    """Find median of two sorted arrays."""
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    
    m, n = len(nums1), len(nums2)
    left, right = 0, m
    
    while left <= right:
        partition_x = (left + right) // 2
        partition_y = (m + n + 1) // 2 - partition_x
        
        max_left_x = float('-inf') if partition_x == 0 else nums1[partition_x - 1]
        min_right_x = float('inf') if partition_x == m else nums1[partition_x]
        
        max_left_y = float('-inf') if partition_y == 0 else nums2[partition_y - 1]
        min_right_y = float('inf') if partition_y == n else nums2[partition_y]
        
        if max_left_x <= min_right_y and max_left_y <= min_right_x:
            if (m + n) % 2 == 0:
                return (max(max_left_x, max_left_y) + min(min_right_x, min_right_y)) / 2
            else:
                return max(max_left_x, max_left_y)
        elif max_left_x > min_right_y:
            right = partition_x - 1
        else:
            left = partition_x + 1

# Example: nums1 = [1,3], nums2 = [2] → 2.0
```
- **Time**: O(log(min(m,n))), **Space**: O(1)
- **Amazon Context**: Data analysis, statistical computation
- **Manager Insight**: Binary search on answer space
- **Similar**: Kth Smallest Element in Sorted Matrix

---

## Category 9: Design Problems (5 Problems)

### Medium Difficulty (4 problems)

**91. LRU Cache (LeetCode #146)**
```python
class LRUCache:
    """Least Recently Used Cache implementation."""
    
    class Node:
        def __init__(self, key=0, val=0):
            self.key = key
            self.val = val
            self.prev = None
            self.next = None
    
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        
        # Create dummy head and tail
        self.head = self.Node()
        self.tail = self.Node()
        self.head.next = self.tail
        self.tail.prev = self.head
    
    def _add_node(self, node):
        """Add node right after head."""
        node.prev = self.head
        node.next = self.head.next
        
        self.head.next.prev = node
        self.head.next = node
    
    def _remove_node(self, node):
        """Remove an existing node."""
        prev_node = node.prev
        next_node = node.next
        
        prev_node.next = next_node
        next_node.prev = prev_node
    
    def _move_to_head(self, node):
        """Move node to head."""
        self._remove_node(node)
        self._add_node(node)
    
    def _pop_tail(self):
        """Remove last node."""
        last_node = self.tail.prev
        self._remove_node(last_node)
        return last_node
    
    def get(self, key):
        """Get value and mark as recently used."""
        node = self.cache.get(key)
        
        if not node:
            return -1
        
        self._move_to_head(node)
        return node.val
    
    def put(self, key, value):
        """Put key-value pair."""
        node = self.cache.get(key)
        
        if not node:
            new_node = self.Node(key, value)
            
            self.cache[key] = new_node
            self._add_node(new_node)
            
            if len(self.cache) > self.capacity:
                tail = self._pop_tail()
                del self.cache[tail.key]
        else:
            node.val = value
            self._move_to_head(node)

# Example: cache = LRUCache(2); cache.put(1,1); cache.get(1) → 1
```
- **Time**: O(1) for both get and put, **Space**: O(capacity)
- **Amazon Context**: Caching systems, memory management
- **Manager Insight**: Combining hash map with doubly linked list
- **Similar**: LFU Cache, Design Twitter

**92. Design Add and Search Words Data Structure (LeetCode #211)**
```python
class WordDictionary:
    """Add and search words with wildcard support."""
    
    class TrieNode:
        def __init__(self):
            self.children = {}
            self.is_word = False
    
    def __init__(self):
        self.root = self.TrieNode()
    
    def add_word(self, word):
        """Add word to data structure."""
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = self.TrieNode()
            node = node.children[char]
        node.is_word = True
    
    def search(self, word):
        """Search word with wildcard '.' support."""
        def dfs(node, index):
            if index == len(word):
                return node.is_word
            
            char = word[index]
            if char == '.':
                for child in node.children.values():
                    if dfs(child, index + 1):
                        return True
                return False
            else:
                if char not in node.children:
                    return False
                return dfs(node.children[char], index + 1)
        
        return dfs(self.root, 0)

# Example: wd.addWord("bad"); wd.search("pad") → False; wd.search(".ad") → True
```
- **Time**: O(m) for add, O(m*26^k) for search worst case, **Space**: O(ALPHABET_SIZE * N * M)
- **Amazon Context**: Search systems, pattern matching
- **Manager Insight**: Trie with backtracking for wildcards
- **Similar**: Implement Trie, Word Search II

**93. Design Twitter (LeetCode #355)**
```python
class Twitter:
    """Simple Twitter-like social media system."""
    
    def __init__(self):
        self.timestamp = 0
        self.user_tweets = {}  # user_id -> list of (timestamp, tweet_id)
        self.user_follows = {}  # user_id -> set of followed user_ids
    
    def post_tweet(self, user_id, tweet_id):
        """User posts a tweet."""
        if user_id not in self.user_tweets:
            self.user_tweets[user_id] = []
        
        self.user_tweets[user_id].append((self.timestamp, tweet_id))
        self.timestamp += 1
    
    def get_news_feed(self, user_id):
        """Get 10 most recent tweets from user and followees."""
        import heapq
        
        # Collect all relevant tweets
        tweets = []
        
        # User's own tweets
        if user_id in self.user_tweets:
            tweets.extend(self.user_tweets[user_id])
        
        # Followees' tweets
        if user_id in self.user_follows:
            for followee_id in self.user_follows[user_id]:
                if followee_id in self.user_tweets:
                    tweets.extend(self.user_tweets[followee_id])
        
        # Get 10 most recent
        tweets.sort(reverse=True)  # Sort by timestamp descending
        return [tweet_id for _, tweet_id in tweets[:10]]
    
    def follow(self, follower_id, followee_id):
        """Follower follows followee."""
        if follower_id not in self.user_follows:
            self.user_follows[follower_id] = set()
        self.user_follows[follower_id].add(followee_id)
    
    def unfollow(self, follower_id, followee_id):
        """Follower unfollows followee."""
        if (follower_id in self.user_follows and 
            followee_id in self.user_follows[follower_id]):
            self.user_follows[follower_id].remove(followee_id)

# Example: twitter.postTweet(1, 5); twitter.getNewsFeed(1) → [5]
```
- **Time**: O(n log n) for news feed, O(1) for others, **Space**: O(n)
- **Amazon Context**: Social media systems, feed algorithms
- **Manager Insight**: System design with multiple operations
- **Similar**: Design Chat System, Design Instagram

**94. Insert Delete GetRandom O(1) (LeetCode #380)**
```python
class RandomizedSet:
    """Data structure with O(1) insert, delete, and getRandom."""
    
    def __init__(self):
        self.vals = []
        self.val_to_index = {}
    
    def insert(self, val):
        """Insert value, return False if already exists."""
        if val in self.val_to_index:
            return False
        
        self.vals.append(val)
        self.val_to_index[val] = len(self.vals) - 1
        return True
    
    def remove(self, val):
        """Remove value, return False if doesn't exist."""
        if val not in self.val_to_index:
            return False
        
        # Move last element to position of element to delete
        last_val = self.vals[-1]
        index_to_remove = self.val_to_index[val]
        
        self.vals[index_to_remove] = last_val
        self.val_to_index[last_val] = index_to_remove
        
        # Remove last element
        self.vals.pop()
        del self.val_to_index[val]
        
        return True
    
    def get_random(self):
        """Get random element."""
        import random
        return random.choice(self.vals)

# Example: rs.insert(1) → True; rs.remove(2) → False; rs.getRandom() → 1
```
- **Time**: O(1) for all operations, **Space**: O(n)
- **Amazon Context**: Random sampling, A/B testing systems
- **Manager Insight**: Array and hash map combination for O(1) operations
- **Similar**: Insert Delete GetRandom O(1) - Duplicates allowed

### Hard Difficulty (1 problem)

**95. Design In-Memory File System (LeetCode #588)**
```python
class FileSystem:
    """In-memory file system with directories and files."""
    
    class Node:
        def __init__(self):
            self.is_file = False
            self.content = ""
            self.children = {}
    
    def __init__(self):
        self.root = self.Node()
    
    def _get_node(self, path):
        """Get node at given path."""
        node = self.root
        if path == "/":
            return node
        
        parts = path.split("/")[1:]  # Skip empty first part
        for part in parts:
            if part not in node.children:
                return None
            node = node.children[part]
        return node
    
    def _create_path(self, path):
        """Create path if it doesn't exist."""
        node = self.root
        if path == "/":
            return node
        
        parts = path.split("/")[1:]
        for part in parts:
            if part not in node.children:
                node.children[part] = self.Node()
            node = node.children[part]
        return node
    
    def ls(self, path):
        """List contents of directory or return file name."""
        node = self._get_node(path)
        if not node:
            return []
        
        if node.is_file:
            return [path.split("/")[-1]]
        
        return sorted(node.children.keys())
    
    def mkdir(self, path):
        """Create directory."""
        self._create_path(path)
    
    def add_content_to_file(self, file_path, content):
        """Add content to file."""
        node = self._create_path(file_path)
        node.is_file = True
        node.content += content
    
    def read_content_from_file(self, file_path):
        """Read content from file."""
        node = self._get_node(file_path)
        return node.content if node and node.is_file else ""

# Example: fs.mkdir("/a/b/c"); fs.addContentToFile("/a/b/c/d", "hello"); fs.readContentFromFile("/a/b/c/d") → "hello"
```
- **Time**: O(m) where m is path length, **Space**: O(total content)
- **Amazon Context**: File storage systems, directory management
- **Manager Insight**: Tree-based file system representation
- **Similar**: Design File System, Design Log Storage System

---

## Category 10: Mathematical (5 Problems)

### Easy Difficulty (2 problems)

**96. Palindrome Number (LeetCode #9)**
```python
def is_palindrome(x):
    """Check if integer is palindrome."""
    if x < 0:
        return False
    
    original = x
    reversed_num = 0
    
    while x > 0:
        reversed_num = reversed_num * 10 + x % 10
        x //= 10
    
    return original == reversed_num

# Alternative without converting to string:
def is_palindrome_half(x):
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    
    reversed_half = 0
    while x > reversed_half:
        reversed_half = reversed_half * 10 + x % 10
        x //= 10
    
    return x == reversed_half or x == reversed_half // 10

# Example: 121 → True, -121 → False
```
- **Time**: O(log n), **Space**: O(1)
- **Amazon Context**: Data validation, number processing
- **Manager Insight**: Mathematical manipulation vs string conversion
- **Similar**: Reverse Integer, Valid Perfect Square

**97. Fizz Buzz (LeetCode #412)**
```python
def fizz_buzz(n):
    """Return fizz buzz sequence from 1 to n."""
    result = []
    
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    
    return result

# More extensible approach:
def fizz_buzz_extensible(n):
    result = []
    
    for i in range(1, n + 1):
        output = ""
        if i % 3 == 0:
            output += "Fizz"
        if i % 5 == 0:
            output += "Buzz"
        
        result.append(output or str(i))
    
    return result

# Example: n = 15 → ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Interview warm-up, basic logic
- **Manager Insight**: Code clarity and extensibility
- **Similar**: Count and Say, Print Zero Even Odd

### Medium Difficulty (2 problems)

**98. Pow(x, n) (LeetCode #50)**
```python
def my_pow(x, n):
    """Calculate x raised to power n."""
    if n < 0:
        x = 1 / x
        n = -n
    
    result = 1
    current_power = x
    
    while n > 0:
        if n % 2 == 1:
            result *= current_power
        current_power *= current_power
        n //= 2
    
    return result

# Recursive approach:
def my_pow_recursive(x, n):
    def helper(x, n):
        if n == 0:
            return 1
        
        half = helper(x, n // 2)
        if n % 2 == 0:
            return half * half
        else:
            return half * half * x
    
    if n < 0:
        return 1 / helper(x, -n)
    return helper(x, n)

# Example: x = 2.0, n = 10 → 1024.0
```
- **Time**: O(log n), **Space**: O(1) or O(log n) for recursive
- **Amazon Context**: Mathematical computations, algorithms optimization
- **Manager Insight**: Exponentiation by squaring
- **Similar**: Super Pow, Sqrt(x)

**99. Sqrt(x) (LeetCode #69)**
```python
def my_sqrt(x):
    """Find integer square root."""
    if x < 2:
        return x
    
    left, right = 1, x // 2
    
    while left <= right:
        mid = (left + right) // 2
        square = mid * mid
        
        if square == x:
            return mid
        elif square < x:
            left = mid + 1
        else:
            right = mid - 1
    
    return right  # Return floor of square root

# Newton's method approach:
def my_sqrt_newton(x):
    if x < 2:
        return x
    
    x0 = x
    x1 = (x0 + x / x0) / 2
    
    while abs(x0 - x1) >= 1:
        x0 = x1
        x1 = (x0 + x / x0) / 2
    
    return int(x1)

# Example: x = 8 → 2
```
- **Time**: O(log n), **Space**: O(1)
- **Amazon Context**: Mathematical computations, approximation algorithms
- **Manager Insight**: Binary search vs Newton's method
- **Similar**: Valid Perfect Square, Pow(x, n)

### Hard Difficulty (1 problem)

**100. Basic Calculator (LeetCode #224)**
```python
def calculate(s):
    """Evaluate basic mathematical expression with parentheses."""
    stack = []
    result = 0
    number = 0
    sign = 1
    
    for char in s:
        if char.isdigit():
            number = number * 10 + int(char)
        elif char == '+':
            result += sign * number
            number = 0
            sign = 1
        elif char == '-':
            result += sign * number
            number = 0
            sign = -1
        elif char == '(':
            # Push current result and sign to stack
            stack.append(result)
            stack.append(sign)
            # Reset for new sub-expression
            result = 0
            sign = 1
        elif char == ')':
            # Complete current number
            result += sign * number
            number = 0
            
            # Pop sign and previous result
            result *= stack.pop()  # sign before parentheses
            result += stack.pop()  # result before parentheses
    
    return result + sign * number

# Example: " 2-1 + 2 " → 3, "(1+(4+5+2)-3)+(6+8)" → 23
```
- **Time**: O(n), **Space**: O(n)
- **Amazon Context**: Expression evaluation, formula processing
- **Manager Insight**: Stack-based parsing with state management
- **Similar**: Basic Calculator II, Basic Calculator III

---

## Interview Guidelines for Engineering Managers

### L6 Level Expectations

**Technical Competency:**
- Solve Easy and Medium problems efficiently
- Explain time/space complexity clearly
- Handle edge cases systematically
- Write clean, readable code

**Communication Skills:**
- Start with clarifying questions
- Think out loud during problem solving
- Explain trade-offs between solutions
- Connect algorithms to business context

**Leadership Context:**
- Discuss how you'd guide team members
- Explain architectural considerations
- Consider operational implications
- Address scalability concerns

### L7 Level Expectations

**Advanced Problem Solving:**
- Handle Hard problems with multiple approaches
- Optimize for both time and space
- Design scalable solutions
- Consider system-wide implications

**Technical Leadership:**
- Explain complex algorithms simply
- Discuss performance at scale
- Connect to system design concepts
- Evaluate different architectural approaches

**Management Perspective:**
- How would you mentor junior engineers?
- Code review and quality standards
- Technical decision making process
- Risk assessment and mitigation

### Time Management Strategy

| Problem Difficulty | Time Allocation | Focus Areas |
|-------------------|----------------|-------------|
| Easy | 15-20 minutes | Clean implementation, edge cases |
| Medium | 25-35 minutes | Optimization, multiple approaches |
| Hard | 35-45 minutes | Complex logic, scalability discussion |

### Common Follow-up Questions

1. **Optimization**: "Can you improve the complexity?"
2. **Scale**: "How would this work with billions of records?"
3. **Variations**: "What if constraints changed?"
4. **Production**: "How would you deploy this?"
5. **Testing**: "How would you validate this solution?"
6. **Maintenance**: "How would you make this more robust?"

### Practice Schedule for Managers

#### Phase 1: Foundation (Weeks 1-2)
- **Goal**: Refresh algorithmic thinking
- **Focus**: Easy problems (30+ problems)
- **Time**: 1-2 hours daily
- **Emphasis**: Pattern recognition, clean code

#### Phase 2: Skill Building (Weeks 3-4)
- **Goal**: Master core patterns
- **Focus**: Medium problems (50+ problems)
- **Time**: 1.5-2 hours daily
- **Emphasis**: Optimization, multiple solutions

#### Phase 3: Advanced Preparation (Weeks 5-6)
- **Goal**: Handle complex scenarios
- **Focus**: Hard problems + system design
- **Time**: 2+ hours daily
- **Emphasis**: Leadership explanations, scalability

#### Phase 4: Mock Interviews (Weeks 7-8)
- **Goal**: Interview simulation
- **Focus**: Timed practice, communication
- **Time**: 2+ hours daily
- **Emphasis**: Explaining thought process, handling pressure

### Tips for Managers Returning to Coding

1. **Start Simple**: Begin with Easy problems to build confidence
2. **Pattern Recognition**: Focus on common patterns rather than memorizing solutions
3. **Business Context**: Always connect problems to real-world scenarios
4. **Communication**: Practice explaining complex concepts simply
5. **Leadership Angle**: Discuss how you'd guide team members through similar problems
6. **Time Management**: Practice with actual timers to build interview stamina
7. **Mock Interviews**: Schedule practice sessions with peers or mentors
8. **System Design**: Connect coding problems to larger system architecture
9. **Code Quality**: Emphasize maintainable, readable code over clever tricks
10. **Stay Current**: Review recent Amazon engineering blog posts and case studies

### Key Success Factors

- **Preparation**: Consistent daily practice over cramming
- **Understanding**: Focus on principles over memorization
- **Communication**: Clear explanation of thought process
- **Leadership**: Demonstrate technical mentoring capabilities
- **Adaptability**: Handle unexpected variations gracefully
- **Business Acumen**: Connect technical solutions to business value

Remember: Amazon values customer obsession, ownership, and long-term thinking. Demonstrate these principles through your problem-solving approach and communication style.