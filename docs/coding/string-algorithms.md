# String Algorithms for Amazon L6/L7 Engineering Managers

!!! info "Advanced String Algorithm Mastery for Engineering Managers"
    This module covers advanced string algorithms essential for L6/L7 engineering managers, focusing on text processing, search optimization, pattern matching, and real-world applications in system design and data processing.

## Framework for String Algorithm Mastery

### Strategic Understanding for Engineering Leaders
```markdown
**L6/L7 Manager Focus:**
- Understanding string algorithm complexity for large-scale text processing
- Making informed decisions about search and pattern matching implementations
- Evaluating trade-offs between preprocessing time and query performance
- Guiding teams on text processing optimization strategies
- Connecting string algorithm choices to business requirements and user experience

**Key String Algorithm Concepts:**
- Pattern matching algorithms for search functionality
- String preprocessing for efficient queries
- Suffix data structures for complex string operations
- Approximate string matching for fuzzy search
- String compression and encoding optimization
```

---

## Category 1: Pattern Matching Algorithms

### KMP (Knuth-Morris-Pratt) Algorithm

**Core Implementation with Advanced Features:**
```python
from typing import List, Tuple, Dict, Optional, Set, Any
from collections import defaultdict, deque
import re
import hashlib

class KMPPatternMatcher:
    """Advanced KMP pattern matching with multiple pattern support."""
    
    def __init__(self, pattern: str):
        """
        Initialize KMP pattern matcher.
        
        Args:
            pattern: The pattern to search for
        """
        self.pattern = pattern
        self.pattern_length = len(pattern)
        self.failure_function = self._compute_failure_function()
        
        # Statistics tracking
        self.stats = {
            'searches_performed': 0,
            'total_characters_scanned': 0,
            'matches_found': 0,
            'preprocessing_time': 0
        }
    
    def _compute_failure_function(self) -> List[int]:
        """
        Compute the failure function (partial match table) for KMP.
        Time complexity: O(m) where m is pattern length
        """
        if not self.pattern:
            return []
        
        failure = [0] * self.pattern_length
        j = 0
        
        for i in range(1, self.pattern_length):
            while j > 0 and self.pattern[i] != self.pattern[j]:
                j = failure[j - 1]
            
            if self.pattern[i] == self.pattern[j]:
                j += 1
            
            failure[i] = j
        
        return failure
    
    def search(self, text: str) -> List[int]:
        """
        Find all occurrences of pattern in text using KMP algorithm.
        
        Args:
            text: Text to search in
            
        Returns:
            List of starting indices where pattern is found
            
        Time complexity: O(n + m) where n is text length, m is pattern length
        """
        if not text or not self.pattern:
            return []
        
        self.stats['searches_performed'] += 1
        self.stats['total_characters_scanned'] += len(text)
        
        matches = []
        text_length = len(text)
        j = 0  # Pattern index
        
        for i in range(text_length):
            # Handle mismatches using failure function
            while j > 0 and text[i] != self.pattern[j]:
                j = self.failure_function[j - 1]
            
            # Check for character match
            if text[i] == self.pattern[j]:
                j += 1
            
            # Check if complete pattern matched
            if j == self.pattern_length:
                matches.append(i - self.pattern_length + 1)
                self.stats['matches_found'] += 1
                j = self.failure_function[j - 1]  # Continue searching for overlapping matches
        
        return matches
    
    def search_with_context(self, text: str, context_length: int = 50) -> List[Dict[str, Any]]:
        """
        Find all matches with surrounding context.
        
        Args:
            text: Text to search in
            context_length: Characters to include before and after match
            
        Returns:
            List of match dictionaries with context information
        """
        matches = self.search(text)
        results = []
        
        for match_index in matches:
            start_context = max(0, match_index - context_length)
            end_context = min(len(text), match_index + self.pattern_length + context_length)
            
            results.append({
                'index': match_index,
                'match': self.pattern,
                'context': text[start_context:end_context],
                'context_start': start_context,
                'context_end': end_context,
                'before_context': text[start_context:match_index],
                'after_context': text[match_index + self.pattern_length:end_context]
            })
        
        return results
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get pattern matching statistics."""
        return {
            'pattern': self.pattern,
            'pattern_length': self.pattern_length,
            'failure_function': self.failure_function,
            'searches_performed': self.stats['searches_performed'],
            'total_characters_scanned': self.stats['total_characters_scanned'],
            'matches_found': self.stats['matches_found'],
            'average_scan_efficiency': (
                self.stats['total_characters_scanned'] / self.stats['searches_performed']
                if self.stats['searches_performed'] > 0 else 0
            )
        }

class MultiPatternKMP:
    """Multiple pattern matching using multiple KMP instances."""
    
    def __init__(self, patterns: List[str]):
        """
        Initialize multi-pattern matcher.
        
        Args:
            patterns: List of patterns to search for
        """
        self.patterns = patterns
        self.matchers = {pattern: KMPPatternMatcher(pattern) for pattern in patterns}
        
        # Statistics
        self.stats = {
            'total_searches': 0,
            'patterns_count': len(patterns),
            'total_matches': defaultdict(int)
        }
    
    def search_all(self, text: str) -> Dict[str, List[int]]:
        """
        Search for all patterns in text.
        
        Args:
            text: Text to search in
            
        Returns:
            Dictionary mapping patterns to their match positions
        """
        self.stats['total_searches'] += 1
        results = {}
        
        for pattern in self.patterns:
            matches = self.matchers[pattern].search(text)
            results[pattern] = matches
            self.stats['total_matches'][pattern] += len(matches)
        
        return results
    
    def search_first_match(self, text: str) -> Optional[Tuple[str, int]]:
        """
        Find the first occurrence of any pattern in text.
        
        Returns:
            Tuple of (pattern, index) for first match, or None if no match
        """
        first_match = None
        first_index = len(text)
        
        for pattern in self.patterns:
            matches = self.matchers[pattern].search(text)
            if matches and matches[0] < first_index:
                first_index = matches[0]
                first_match = (pattern, first_index)
        
        return first_match
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get multi-pattern matching statistics."""
        total_matches = sum(self.stats['total_matches'].values())
        
        return {
            'patterns_count': self.stats['patterns_count'],
            'total_searches': self.stats['total_searches'],
            'total_matches_found': total_matches,
            'matches_per_pattern': dict(self.stats['total_matches']),
            'average_matches_per_search': total_matches / self.stats['total_searches'] if self.stats['total_searches'] > 0 else 0
        }

### Rabin-Karp Algorithm with Rolling Hash

class RabinKarpMatcher:
    """Rabin-Karp algorithm with rolling hash for multiple pattern matching."""
    
    def __init__(self, patterns: List[str], base: int = 256, modulus: int = 101):
        """
        Initialize Rabin-Karp matcher.
        
        Args:
            patterns: List of patterns to search for
            base: Base for polynomial rolling hash
            modulus: Modulus for hash computation (should be prime)
        """
        self.patterns = patterns
        self.base = base
        self.modulus = modulus
        
        # Precompute pattern hashes and lengths
        self.pattern_hashes = {}
        self.pattern_lengths = {}
        
        for pattern in patterns:
            self.pattern_hashes[pattern] = self._compute_hash(pattern)
            self.pattern_lengths[pattern] = len(pattern)
        
        # Group patterns by length for efficient processing
        self.patterns_by_length = defaultdict(list)
        for pattern in patterns:
            self.patterns_by_length[len(pattern)].append(pattern)
        
        # Statistics
        self.stats = {
            'hash_computations': 0,
            'hash_matches': 0,
            'string_comparisons': 0,
            'spurious_matches': 0,
            'true_matches': 0
        }
    
    def _compute_hash(self, string: str) -> int:
        """Compute polynomial rolling hash of string."""
        hash_value = 0
        for i, char in enumerate(string):
            hash_value = (hash_value * self.base + ord(char)) % self.modulus
        
        self.stats['hash_computations'] += 1
        return hash_value
    
    def _update_rolling_hash(self, old_hash: int, old_char: str, new_char: str, 
                           pattern_length: int, base_power: int) -> int:
        """Update rolling hash by removing old character and adding new one."""
        # Remove contribution of old character
        old_hash = (old_hash - ord(old_char) * base_power) % self.modulus
        
        # Shift and add new character
        new_hash = (old_hash * self.base + ord(new_char)) % self.modulus
        
        return new_hash
    
    def search(self, text: str) -> Dict[str, List[int]]:
        """
        Search for all patterns in text using Rabin-Karp algorithm.
        
        Args:
            text: Text to search in
            
        Returns:
            Dictionary mapping patterns to their match positions
        """
        if not text:
            return {pattern: [] for pattern in self.patterns}
        
        results = {pattern: [] for pattern in self.patterns}
        text_length = len(text)
        
        # Process each pattern length group
        for pattern_length, patterns_group in self.patterns_by_length.items():
            if pattern_length > text_length:
                continue
            
            # Precompute base^(pattern_length-1) for rolling hash updates
            base_power = pow(self.base, pattern_length - 1, self.modulus)
            
            # Compute initial hash of first text window
            text_hash = self._compute_hash(text[:pattern_length])
            
            # Check first window
            self._check_window_matches(text, 0, pattern_length, text_hash, patterns_group, results)
            
            # Roll through the rest of the text
            for i in range(1, text_length - pattern_length + 1):
                # Update rolling hash
                text_hash = self._update_rolling_hash(
                    text_hash, 
                    text[i - 1], 
                    text[i + pattern_length - 1], 
                    pattern_length, 
                    base_power
                )
                
                # Check current window
                self._check_window_matches(text, i, pattern_length, text_hash, patterns_group, results)
        
        return results
    
    def _check_window_matches(self, text: str, start: int, length: int, 
                            text_hash: int, patterns_group: List[str], 
                            results: Dict[str, List[int]]):
        """Check if current text window matches any patterns in the group."""
        window = text[start:start + length]
        
        for pattern in patterns_group:
            pattern_hash = self.pattern_hashes[pattern]
            
            if text_hash == pattern_hash:
                self.stats['hash_matches'] += 1
                self.stats['string_comparisons'] += 1
                
                # Hash match found, verify with string comparison
                if window == pattern:
                    results[pattern].append(start)
                    self.stats['true_matches'] += 1
                else:
                    self.stats['spurious_matches'] += 1
    
    def search_streaming(self, text_stream, buffer_size: int = 8192) -> Dict[str, List[int]]:
        """
        Search patterns in a streaming text source.
        
        Args:
            text_stream: Iterable that yields text chunks
            buffer_size: Size of overlap buffer for pattern boundary handling
            
        Returns:
            Dictionary mapping patterns to their match positions
        """
        results = {pattern: [] for pattern in self.patterns}
        
        # Determine maximum pattern length for overlap buffer
        max_pattern_length = max(len(pattern) for pattern in self.patterns) if self.patterns else 0
        overlap_size = min(buffer_size, max_pattern_length - 1)
        
        text_buffer = ""
        global_offset = 0
        
        for chunk in text_stream:
            # Add chunk to buffer
            text_buffer += chunk
            
            # Search in current buffer
            chunk_results = self.search(text_buffer)
            
            # Adjust indices to global positions and add to results
            for pattern, positions in chunk_results.items():
                for pos in positions:
                    # Only include matches that don't depend on future text
                    if pos + len(pattern) <= len(text_buffer) - overlap_size or len(chunk) == 0:
                        results[pattern].append(global_offset + pos)
            
            # Keep overlap for next iteration
            if len(text_buffer) > overlap_size:
                consumed = len(text_buffer) - overlap_size
                global_offset += consumed
                text_buffer = text_buffer[consumed:]
        
        # Process remaining buffer
        if text_buffer:
            chunk_results = self.search(text_buffer)
            for pattern, positions in chunk_results.items():
                for pos in positions:
                    results[pattern].append(global_offset + pos)
        
        return results
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get algorithm statistics."""
        total_comparisons = self.stats['string_comparisons']
        hash_efficiency = (self.stats['hash_matches'] / self.stats['hash_computations'] 
                          if self.stats['hash_computations'] > 0 else 0)
        
        return {
            'patterns_count': len(self.patterns),
            'hash_computations': self.stats['hash_computations'],
            'hash_matches': self.stats['hash_matches'],
            'string_comparisons': self.stats['string_comparisons'],
            'spurious_matches': self.stats['spurious_matches'],
            'true_matches': self.stats['true_matches'],
            'hash_efficiency': hash_efficiency,
            'spurious_rate': (self.stats['spurious_matches'] / self.stats['hash_matches'] 
                            if self.stats['hash_matches'] > 0 else 0),
            'base': self.base,
            'modulus': self.modulus
        }

### Z-Algorithm for Pattern Matching

class ZAlgorithm:
    """Z-algorithm for linear pattern matching and string analysis."""
    
    def __init__(self):
        """Initialize Z-algorithm processor."""
        self.stats = {
            'z_array_computations': 0,
            'pattern_matches_found': 0,
            'characters_processed': 0
        }
    
    def compute_z_array(self, string: str) -> List[int]:
        """
        Compute Z-array for string using Z-algorithm.
        
        Args:
            string: Input string
            
        Returns:
            Z-array where Z[i] is length of longest substring starting at i 
            which is also prefix of string
            
        Time complexity: O(n)
        """
        n = len(string)
        if n == 0:
            return []
        
        self.stats['z_array_computations'] += 1
        self.stats['characters_processed'] += n
        
        z = [0] * n
        z[0] = n  # Entire string matches itself
        
        left = right = 0
        
        for i in range(1, n):
            if i <= right:
                # We're inside a Z-box, use previously computed information
                z[i] = min(right - i + 1, z[i - left])
            
            # Try to extend match
            while i + z[i] < n and string[z[i]] == string[i + z[i]]:
                z[i] += 1
            
            # Update Z-box if we extended beyond current right boundary
            if i + z[i] - 1 > right:
                left = i
                right = i + z[i] - 1
        
        return z
    
    def pattern_search(self, text: str, pattern: str) -> List[int]:
        """
        Find all occurrences of pattern in text using Z-algorithm.
        
        Args:
            text: Text to search in
            pattern: Pattern to search for
            
        Returns:
            List of starting positions where pattern occurs
        """
        if not pattern or not text:
            return []
        
        # Create combined string: pattern$text
        combined = pattern + "$" + text
        z_array = self.compute_z_array(combined)
        
        matches = []
        pattern_length = len(pattern)
        
        # Look for Z-values equal to pattern length
        for i in range(pattern_length + 1, len(combined)):
            if z_array[i] == pattern_length:
                # Found a match at position (i - pattern_length - 1) in original text
                match_position = i - pattern_length - 1
                matches.append(match_position)
                self.stats['pattern_matches_found'] += 1
        
        return matches
    
    def find_periods(self, string: str) -> List[int]:
        """
        Find all periods of a string using Z-algorithm.
        
        Args:
            string: Input string
            
        Returns:
            List of all period lengths of the string
        """
        n = len(string)
        if n <= 1:
            return [n] if n > 0 else []
        
        z_array = self.compute_z_array(string)
        periods = []
        
        for i in range(1, n):
            if i + z_array[i] == n:
                # Found a period of length i
                periods.append(i)
        
        # The string itself is always a period
        periods.append(n)
        
        return periods
    
    def longest_common_prefix(self, strings: List[str]) -> str:
        """
        Find longest common prefix of multiple strings using Z-algorithm approach.
        
        Args:
            strings: List of strings
            
        Returns:
            Longest common prefix
        """
        if not strings:
            return ""
        
        if len(strings) == 1:
            return strings[0]
        
        # Use first string as reference
        reference = strings[0]
        lcp_length = len(reference)
        
        # Compare with each other string
        for string in strings[1:]:
            # Find LCP between reference and current string
            current_lcp = 0
            min_length = min(len(reference), len(string))
            
            for i in range(min_length):
                if reference[i] == string[i]:
                    current_lcp += 1
                else:
                    break
            
            lcp_length = min(lcp_length, current_lcp)
            
            if lcp_length == 0:
                break
        
        return reference[:lcp_length]
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get Z-algorithm statistics."""
        return {
            'z_array_computations': self.stats['z_array_computations'],
            'pattern_matches_found': self.stats['pattern_matches_found'],
            'characters_processed': self.stats['characters_processed'],
            'average_string_length': (self.stats['characters_processed'] / 
                                    self.stats['z_array_computations'] 
                                    if self.stats['z_array_computations'] > 0 else 0)
        }

---

## Category 2: Suffix Data Structures

### Suffix Array Construction and Applications

class SuffixArray:
    """Efficient suffix array construction with LCP array."""
    
    def __init__(self, text: str):
        """
        Initialize suffix array for given text.
        
        Args:
            text: Input text (should end with unique sentinel like $)
        """
        self.text = text + "$" if not text.endswith("$") else text
        self.n = len(self.text)
        self.suffix_array = self._build_suffix_array()
        self.lcp_array = self._build_lcp_array()
        
        # Statistics
        self.stats = {
            'construction_time': 0,
            'text_length': self.n,
            'suffix_array_size': len(self.suffix_array),
            'lcp_array_size': len(self.lcp_array)
        }
    
    def _build_suffix_array(self) -> List[int]:
        """
        Build suffix array using counting sort approach.
        Time complexity: O(n log n)
        """
        # Simple O(n^2 log n) approach for demonstration
        # Production implementations would use more efficient algorithms like SA-IS
        suffixes = [(self.text[i:], i) for i in range(self.n)]
        suffixes.sort()
        return [suffix[1] for suffix in suffixes]
    
    def _build_lcp_array(self) -> List[int]:
        """
        Build LCP (Longest Common Prefix) array using Kasai's algorithm.
        Time complexity: O(n)
        """
        # Inverse suffix array: rank[i] = position of suffix starting at i in sorted order
        rank = [0] * self.n
        for i in range(self.n):
            rank[self.suffix_array[i]] = i
        
        lcp = [0] * self.n
        h = 0  # Length of LCP
        
        for i in range(self.n):
            if rank[i] > 0:
                j = self.suffix_array[rank[i] - 1]
                
                # Extend LCP from previous computation
                while (i + h < self.n and j + h < self.n and 
                       self.text[i + h] == self.text[j + h]):
                    h += 1
                
                lcp[rank[i]] = h
                
                if h > 0:
                    h -= 1
        
        return lcp
    
    def pattern_search(self, pattern: str) -> List[int]:
        """
        Search for pattern using binary search on suffix array.
        
        Args:
            pattern: Pattern to search for
            
        Returns:
            List of positions where pattern occurs
            
        Time complexity: O(|pattern| * log n)
        """
        if not pattern:
            return []
        
        # Binary search for leftmost occurrence
        left = self._binary_search_left(pattern)
        if left == -1:
            return []
        
        # Binary search for rightmost occurrence  
        right = self._binary_search_right(pattern)
        
        # Extract all occurrences
        matches = []
        for i in range(left, right + 1):
            matches.append(self.suffix_array[i])
        
        return sorted(matches)
    
    def _binary_search_left(self, pattern: str) -> int:
        """Find leftmost position where pattern could be inserted."""
        left, right = 0, self.n
        result = -1
        
        while left < right:
            mid = (left + right) // 2
            suffix_start = self.suffix_array[mid]
            suffix = self.text[suffix_start:]
            
            if suffix.startswith(pattern):
                result = mid
                right = mid
            elif suffix < pattern:
                left = mid + 1
            else:
                right = mid
        
        return result
    
    def _binary_search_right(self, pattern: str) -> int:
        """Find rightmost position where pattern occurs."""
        left, right = 0, self.n
        result = -1
        
        while left < right:
            mid = (left + right) // 2
            suffix_start = self.suffix_array[mid]
            suffix = self.text[suffix_start:]
            
            if suffix.startswith(pattern):
                result = mid
                left = mid + 1
            elif suffix < pattern:
                left = mid + 1
            else:
                right = mid
        
        return result
    
    def longest_repeated_substring(self) -> Tuple[str, List[int]]:
        """
        Find longest repeated substring using LCP array.
        
        Returns:
            Tuple of (longest_repeated_substring, positions)
        """
        if self.n <= 1:
            return "", []
        
        max_lcp = 0
        max_lcp_index = 0
        
        # Find maximum LCP value
        for i in range(1, self.n):
            if self.lcp_array[i] > max_lcp:
                max_lcp = self.lcp_array[i]
                max_lcp_index = i
        
        if max_lcp == 0:
            return "", []
        
        # Extract the longest repeated substring
        suffix_start = self.suffix_array[max_lcp_index]
        longest_repeat = self.text[suffix_start:suffix_start + max_lcp]
        
        # Find all occurrences of this substring
        positions = self.pattern_search(longest_repeat)
        
        return longest_repeat, positions
    
    def count_distinct_substrings(self) -> int:
        """
        Count number of distinct substrings using suffix array.
        
        Returns:
            Number of distinct substrings
        """
        # Total number of substrings
        total_substrings = self.n * (self.n - 1) // 2
        
        # Subtract duplicate substrings using LCP array
        duplicate_substrings = sum(self.lcp_array)
        
        return total_substrings - duplicate_substrings
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get suffix array statistics."""
        return {
            'text_length': self.n,
            'suffix_array_size': len(self.suffix_array),
            'lcp_array_size': len(self.lcp_array),
            'max_lcp_value': max(self.lcp_array) if self.lcp_array else 0,
            'average_lcp_value': sum(self.lcp_array) / len(self.lcp_array) if self.lcp_array else 0,
            'distinct_substrings': self.count_distinct_substrings(),
            'memory_usage_estimate': (len(self.suffix_array) + len(self.lcp_array)) * 4  # 4 bytes per int
        }

### Suffix Tree Implementation

class SuffixTreeNode:
    """Node in a suffix tree."""
    
    def __init__(self, start: int = -1, end: Optional[int] = None):
        """
        Initialize suffix tree node.
        
        Args:
            start: Start index of edge label
            end: End index of edge label (None for leaf nodes)
        """
        self.start = start
        self.end = end
        self.children = {}  # character -> child node
        self.suffix_link = None
        self.suffix_index = -1  # For leaf nodes, index of suffix
    
    def edge_length(self) -> int:
        """Get length of edge leading to this node."""
        if self.end is None:
            return 0
        return self.end - self.start + 1

class SuffixTree:
    """Suffix tree implementation with Ukkonen's algorithm."""
    
    def __init__(self, text: str):
        """
        Build suffix tree for given text.
        
        Args:
            text: Input text
        """
        self.text = text + "$"  # Add sentinel character
        self.n = len(self.text)
        self.root = SuffixTreeNode()
        self.global_end = [-1]  # Global end pointer for leaf nodes
        
        # Build the suffix tree
        self._build_suffix_tree()
        
        # Statistics
        self.stats = {
            'text_length': self.n,
            'total_nodes': 0,
            'leaf_nodes': 0,
            'internal_nodes': 0
        }
        self._compute_statistics()
    
    def _build_suffix_tree(self):
        """Build suffix tree using Ukkonen's online algorithm."""
        # Simplified implementation - full Ukkonen's algorithm is quite complex
        # This is a basic version for educational purposes
        
        for i in range(self.n):
            self._extend_suffix_tree(i)
    
    def _extend_suffix_tree(self, pos: int):
        """Extend suffix tree with character at position pos."""
        self.global_end[0] = pos
        
        # Insert suffix starting at pos
        self._insert_suffix(pos)
    
    def _insert_suffix(self, suffix_start: int):
        """Insert a suffix into the tree."""
        current = self.root
        
        for i in range(suffix_start, self.n):
            char = self.text[i]
            
            if char not in current.children:
                # Create new leaf node
                leaf = SuffixTreeNode(i, None)
                leaf.suffix_index = suffix_start
                current.children[char] = leaf
                break
            else:
                current = current.children[char]
    
    def pattern_search(self, pattern: str) -> List[int]:
        """
        Search for pattern in suffix tree.
        
        Args:
            pattern: Pattern to search for
            
        Returns:
            List of positions where pattern occurs
        """
        if not pattern:
            return []
        
        # Navigate through tree following pattern
        current = self.root
        pattern_pos = 0
        
        while pattern_pos < len(pattern):
            char = pattern[pattern_pos]
            
            if char not in current.children:
                return []  # Pattern not found
            
            child = current.children[char]
            edge_start = child.start
            edge_end = child.end if child.end is not None else self.global_end[0]
            
            # Match characters along edge
            for edge_pos in range(edge_start, edge_end + 1):
                if pattern_pos >= len(pattern):
                    break
                
                if self.text[edge_pos] != pattern[pattern_pos]:
                    return []  # Pattern not found
                
                pattern_pos += 1
            
            current = child
        
        # Pattern found, collect all suffix indices in subtree
        return self._collect_leaf_indices(current)
    
    def _collect_leaf_indices(self, node: SuffixTreeNode) -> List[int]:
        """Collect all suffix indices in subtree rooted at node."""
        indices = []
        
        if node.suffix_index >= 0:  # Leaf node
            indices.append(node.suffix_index)
        
        # Recursively collect from children
        for child in node.children.values():
            indices.extend(self._collect_leaf_indices(child))
        
        return sorted(indices)
    
    def longest_common_substring(self, text2: str) -> Tuple[str, int, int]:
        """
        Find longest common substring between original text and text2.
        
        Args:
            text2: Second text to compare with
            
        Returns:
            Tuple of (longest_common_substring, pos_in_text1, pos_in_text2)
        """
        # Build generalized suffix tree (simplified approach)
        # In practice, this would require more sophisticated construction
        
        max_length = 0
        best_substring = ""
        pos1 = pos2 = -1
        
        # Simple O(n*m) approach for demonstration
        text1 = self.text[:-1]  # Remove sentinel
        
        for i in range(len(text1)):
            for j in range(len(text2)):
                length = 0
                while (i + length < len(text1) and 
                       j + length < len(text2) and 
                       text1[i + length] == text2[j + length]):
                    length += 1
                
                if length > max_length:
                    max_length = length
                    best_substring = text1[i:i + length]
                    pos1 = i
                    pos2 = j
        
        return best_substring, pos1, pos2
    
    def _compute_statistics(self):
        """Compute tree statistics."""
        self.stats['total_nodes'] = self._count_nodes(self.root)
        self.stats['leaf_nodes'] = self._count_leaf_nodes(self.root)
        self.stats['internal_nodes'] = self.stats['total_nodes'] - self.stats['leaf_nodes']
    
    def _count_nodes(self, node: SuffixTreeNode) -> int:
        """Count total nodes in subtree."""
        count = 1
        for child in node.children.values():
            count += self._count_nodes(child)
        return count
    
    def _count_leaf_nodes(self, node: SuffixTreeNode) -> int:
        """Count leaf nodes in subtree."""
        if node.suffix_index >= 0:  # Leaf node
            return 1
        
        count = 0
        for child in node.children.values():
            count += self._count_leaf_nodes(child)
        return count
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get suffix tree statistics."""
        return self.stats.copy()

---

## Category 3: Approximate String Matching

### Edit Distance and Fuzzy Search

class EditDistanceCalculator:
    """Advanced edit distance calculator with various distance metrics."""
    
    def __init__(self):
        """Initialize edit distance calculator."""
        self.stats = {
            'calculations_performed': 0,
            'total_operations_computed': 0,
            'cache_hits': 0,
            'cache_misses': 0
        }
        
        # Memoization cache
        self._cache = {}
    
    def levenshtein_distance(self, str1: str, str2: str, 
                           insert_cost: int = 1, delete_cost: int = 1, 
                           substitute_cost: int = 1) -> int:
        """
        Calculate Levenshtein (edit) distance between two strings.
        
        Args:
            str1: First string
            str2: Second string
            insert_cost: Cost of insertion operation
            delete_cost: Cost of deletion operation
            substitute_cost: Cost of substitution operation
            
        Returns:
            Minimum edit distance
        """
        self.stats['calculations_performed'] += 1
        
        # Check cache
        cache_key = (str1, str2, insert_cost, delete_cost, substitute_cost)
        if cache_key in self._cache:
            self.stats['cache_hits'] += 1
            return self._cache[cache_key]
        
        self.stats['cache_misses'] += 1
        
        len1, len2 = len(str1), len(str2)
        
        # Initialize DP table
        dp = [[0] * (len2 + 1) for _ in range(len1 + 1)]
        
        # Base cases
        for i in range(len1 + 1):
            dp[i][0] = i * delete_cost
        for j in range(len2 + 1):
            dp[0][j] = j * insert_cost
        
        # Fill DP table
        for i in range(1, len1 + 1):
            for j in range(1, len2 + 1):
                if str1[i-1] == str2[j-1]:
                    dp[i][j] = dp[i-1][j-1]  # No operation needed
                else:
                    dp[i][j] = min(
                        dp[i-1][j] + delete_cost,      # Deletion
                        dp[i][j-1] + insert_cost,      # Insertion
                        dp[i-1][j-1] + substitute_cost # Substitution
                    )
                
                self.stats['total_operations_computed'] += 1
        
        result = dp[len1][len2]
        self._cache[cache_key] = result
        
        return result
    
    def levenshtein_distance_with_operations(self, str1: str, str2: str) -> Tuple[int, List[str]]:
        """
        Calculate edit distance and return the sequence of operations.
        
        Returns:
            Tuple of (distance, operations_list)
        """
        len1, len2 = len(str1), len(str2)
        
        # DP table with operation tracking
        dp = [[(0, [])] for _ in range(len2 + 1)]
        for i in range(len1 + 1):
            dp.append([(0, [])] * (len2 + 1))
        
        # Base cases with operations
        for i in range(len1 + 1):
            dp[i][0] = (i, [f"delete '{str1[k]}'" for k in range(i)])
        for j in range(len2 + 1):
            dp[0][j] = (j, [f"insert '{str2[k]}'" for k in range(j)])
        
        # Fill DP table
        for i in range(1, len1 + 1):
            for j in range(1, len2 + 1):
                if str1[i-1] == str2[j-1]:
                    dp[i][j] = dp[i-1][j-1]  # No operation
                else:
                    # Consider all three operations
                    delete_option = (dp[i-1][j][0] + 1, 
                                   dp[i-1][j][1] + [f"delete '{str1[i-1]}'"])
                    insert_option = (dp[i][j-1][0] + 1, 
                                   dp[i][j-1][1] + [f"insert '{str2[j-1]}'"])
                    substitute_option = (dp[i-1][j-1][0] + 1, 
                                       dp[i-1][j-1][1] + [f"substitute '{str1[i-1]}' -> '{str2[j-1]}'"])
                    
                    dp[i][j] = min(delete_option, insert_option, substitute_option, 
                                 key=lambda x: x[0])
        
        return dp[len1][len2]
    
    def damerau_levenshtein_distance(self, str1: str, str2: str) -> int:
        """
        Calculate Damerau-Levenshtein distance (includes transposition).
        
        Args:
            str1: First string
            str2: Second string
            
        Returns:
            Damerau-Levenshtein distance
        """
        len1, len2 = len(str1), len(str2)
        
        # Create alphabet of unique characters
        alphabet = set(str1 + str2)
        max_dist = len1 + len2
        
        # Initialize distance matrix
        H = {}
        H[-1, -1] = max_dist
        
        for i in range(0, len1 + 1):
            H[i, -1] = max_dist
            H[i, 0] = i
        for j in range(0, len2 + 1):
            H[-1, j] = max_dist
            H[0, j] = j
        
        last_row = {}
        for char in alphabet:
            last_row[char] = 0
        
        for i in range(1, len1 + 1):
            last_match_col = 0
            for j in range(1, len2 + 1):
                i1 = last_row[str2[j-1]]
                j1 = last_match_col
                cost = 1
                
                if str1[i-1] == str2[j-1]:
                    cost = 0
                    last_match_col = j
                
                H[i, j] = min(
                    H[i-1, j] + 1,      # deletion
                    H[i, j-1] + 1,      # insertion
                    H[i-1, j-1] + cost, # substitution
                    H[i1-1, j1-1] + (i-i1-1) + 1 + (j-j1-1)  # transposition
                )
            
            last_row[str1[i-1]] = i
        
        return H[len1, len2]
    
    def similarity_ratio(self, str1: str, str2: str) -> float:
        """
        Calculate similarity ratio based on edit distance.
        
        Returns:
            Similarity ratio between 0 and 1 (1 = identical)
        """
        if not str1 and not str2:
            return 1.0
        
        max_length = max(len(str1), len(str2))
        if max_length == 0:
            return 1.0
        
        distance = self.levenshtein_distance(str1, str2)
        return 1.0 - (distance / max_length)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get edit distance calculator statistics."""
        cache_hit_rate = (self.stats['cache_hits'] / 
                         (self.stats['cache_hits'] + self.stats['cache_misses'])
                         if self.stats['cache_hits'] + self.stats['cache_misses'] > 0 else 0)
        
        return {
            'calculations_performed': self.stats['calculations_performed'],
            'total_operations_computed': self.stats['total_operations_computed'],
            'cache_hits': self.stats['cache_hits'],
            'cache_misses': self.stats['cache_misses'],
            'cache_hit_rate': cache_hit_rate,
            'cache_size': len(self._cache)
        }

class FuzzyStringMatcher:
    """Advanced fuzzy string matching with multiple algorithms."""
    
    def __init__(self, threshold: float = 0.6):
        """
        Initialize fuzzy matcher.
        
        Args:
            threshold: Minimum similarity threshold for matches
        """
        self.threshold = threshold
        self.edit_calculator = EditDistanceCalculator()
        self.patterns = []
        
        # Statistics
        self.stats = {
            'searches_performed': 0,
            'candidates_evaluated': 0,
            'matches_found': 0
        }
    
    def add_patterns(self, patterns: List[str]):
        """Add patterns to search database."""
        self.patterns.extend(patterns)
    
    def fuzzy_search(self, query: str, max_results: int = 10) -> List[Tuple[str, float, int]]:
        """
        Perform fuzzy search for query in patterns.
        
        Args:
            query: Query string
            max_results: Maximum number of results to return
            
        Returns:
            List of tuples: (pattern, similarity_score, edit_distance)
        """
        self.stats['searches_performed'] += 1
        
        results = []
        
        for pattern in self.patterns:
            self.stats['candidates_evaluated'] += 1
            
            # Calculate similarity
            similarity = self.edit_calculator.similarity_ratio(query, pattern)
            
            if similarity >= self.threshold:
                distance = self.edit_calculator.levenshtein_distance(query, pattern)
                results.append((pattern, similarity, distance))
                self.stats['matches_found'] += 1
        
        # Sort by similarity (descending) and edit distance (ascending)
        results.sort(key=lambda x: (-x[1], x[2]))
        
        return results[:max_results]
    
    def approximate_pattern_matching(self, text: str, pattern: str, 
                                   max_distance: int) -> List[Tuple[int, int, str]]:
        """
        Find approximate matches of pattern in text.
        
        Args:
            text: Text to search in
            pattern: Pattern to search for
            max_distance: Maximum allowed edit distance
            
        Returns:
            List of tuples: (start_position, edit_distance, matched_substring)
        """
        matches = []
        text_len = len(text)
        pattern_len = len(pattern)
        
        # Sliding window approach with edit distance calculation
        for i in range(text_len - pattern_len + max_distance + 1):
            # Consider windows of varying sizes around pattern length
            for window_size in range(max(1, pattern_len - max_distance), 
                                   min(text_len - i + 1, pattern_len + max_distance + 1)):
                
                if i + window_size <= text_len:
                    window = text[i:i + window_size]
                    distance = self.edit_calculator.levenshtein_distance(pattern, window)
                    
                    if distance <= max_distance:
                        matches.append((i, distance, window))
        
        # Remove overlapping matches, keeping the best ones
        return self._remove_overlapping_matches(matches)
    
    def _remove_overlapping_matches(self, matches: List[Tuple[int, int, str]]) -> List[Tuple[int, int, str]]:
        """Remove overlapping matches, keeping the ones with smaller edit distance."""
        if not matches:
            return []
        
        # Sort by start position and then by edit distance
        matches.sort(key=lambda x: (x[0], x[1]))
        
        result = []
        last_end = -1
        
        for start, distance, substring in matches:
            if start > last_end:  # No overlap
                result.append((start, distance, substring))
                last_end = start + len(substring) - 1
            elif distance < result[-1][1]:  # Better match overlapping
                result[-1] = (start, distance, substring)
                last_end = start + len(substring) - 1
        
        return result
    
    def phonetic_matching(self, query: str) -> List[Tuple[str, float]]:
        """
        Perform phonetic matching using Soundex-like algorithm.
        
        Args:
            query: Query string
            
        Returns:
            List of tuples: (pattern, phonetic_similarity)
        """
        query_phonetic = self._compute_phonetic_code(query)
        results = []
        
        for pattern in self.patterns:
            pattern_phonetic = self._compute_phonetic_code(pattern)
            
            # Calculate phonetic similarity
            similarity = self._phonetic_similarity(query_phonetic, pattern_phonetic)
            
            if similarity >= self.threshold:
                results.append((pattern, similarity))
        
        results.sort(key=lambda x: -x[1])
        return results
    
    def _compute_phonetic_code(self, word: str) -> str:
        """Compute simplified phonetic code (Soundex-like)."""
        if not word:
            return ""
        
        word = word.upper()
        code = word[0]  # Keep first letter
        
        # Mapping of similar sounding consonants
        mapping = {
            'B': '1', 'F': '1', 'P': '1', 'V': '1',
            'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
            'D': '3', 'T': '3',
            'L': '4',
            'M': '5', 'N': '5',
            'R': '6'
        }
        
        for char in word[1:]:
            if char in mapping:
                if code[-1] != mapping[char]:  # Avoid consecutive duplicates
                    code += mapping[char]
            # Skip vowels and other characters
        
        return code
    
    def _phonetic_similarity(self, code1: str, code2: str) -> float:
        """Calculate similarity between phonetic codes."""
        if not code1 or not code2:
            return 0.0
        
        # Use edit distance on phonetic codes
        max_length = max(len(code1), len(code2))
        distance = self.edit_calculator.levenshtein_distance(code1, code2)
        
        return 1.0 - (distance / max_length)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get fuzzy matching statistics."""
        hit_rate = (self.stats['matches_found'] / self.stats['candidates_evaluated'] 
                   if self.stats['candidates_evaluated'] > 0 else 0)
        
        return {
            'patterns_count': len(self.patterns),
            'searches_performed': self.stats['searches_performed'],
            'candidates_evaluated': self.stats['candidates_evaluated'],
            'matches_found': self.stats['matches_found'],
            'hit_rate': hit_rate,
            'threshold': self.threshold,
            'edit_distance_stats': self.edit_calculator.get_statistics()
        }
```

---

## Category 4: Business Applications and System Integration

### Real-World String Processing Systems

```python
class DocumentSearchEngine:
    """Document search engine using advanced string algorithms."""
    
    def __init__(self):
        """Initialize document search engine."""
        self.documents = {}  # doc_id -> content
        self.document_metadata = {}  # doc_id -> metadata
        
        # String processing components
        self.kmp_matchers = {}  # pattern -> KMPPatternMatcher
        self.suffix_arrays = {}  # doc_id -> SuffixArray
        self.fuzzy_matcher = FuzzyStringMatcher(threshold=0.7)
        
        # Indexing
        self.inverted_index = defaultdict(set)  # word -> set of doc_ids
        self.word_positions = defaultdict(lambda: defaultdict(list))  # word -> doc_id -> [positions]
        
        # Statistics
        self.stats = {
            'documents_indexed': 0,
            'total_words_indexed': 0,
            'searches_performed': 0,
            'average_search_time': 0.0
        }
    
    def add_document(self, doc_id: str, content: str, metadata: Dict = None):
        """
        Add document to search engine.
        
        Args:
            doc_id: Unique document identifier
            content: Document content
            metadata: Optional document metadata
        """
        self.documents[doc_id] = content
        self.document_metadata[doc_id] = metadata or {}
        
        # Build suffix array for complex queries
        self.suffix_arrays[doc_id] = SuffixArray(content.lower())
        
        # Build inverted index
        words = self._tokenize(content)
        for position, word in enumerate(words):
            word = word.lower()
            self.inverted_index[word].add(doc_id)
            self.word_positions[word][doc_id].append(position)
        
        # Add to fuzzy matcher
        self.fuzzy_matcher.add_patterns([content])
        
        self.stats['documents_indexed'] += 1
        self.stats['total_words_indexed'] += len(words)
    
    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into words."""
        # Simple tokenization - in production, use more sophisticated methods
        import re
        return re.findall(r'\b\w+\b', text.lower())
    
    def exact_search(self, query: str) -> List[Dict[str, Any]]:
        """
        Perform exact phrase search.
        
        Args:
            query: Exact phrase to search for
            
        Returns:
            List of search results with document info and match positions
        """
        self.stats['searches_performed'] += 1
        start_time = time.time()
        
        results = []
        
        for doc_id, content in self.documents.items():
            # Use KMP for exact matching
            if query not in self.kmp_matchers:
                self.kmp_matchers[query] = KMPPatternMatcher(query.lower())
            
            matcher = self.kmp_matchers[query]
            matches = matcher.search(content.lower())
            
            if matches:
                # Get context for each match
                contexts = matcher.search_with_context(content.lower(), 100)
                
                results.append({
                    'document_id': doc_id,
                    'content': content,
                    'metadata': self.document_metadata[doc_id],
                    'matches': matches,
                    'match_count': len(matches),
                    'contexts': contexts,
                    'relevance_score': len(matches) / len(content)  # Simple relevance
                })
        
        # Sort by relevance
        results.sort(key=lambda x: -x['relevance_score'])
        
        search_time = time.time() - start_time
        self._update_search_time(search_time)
        
        return results
    
    def fuzzy_search(self, query: str, max_distance: int = 2) -> List[Dict[str, Any]]:
        """
        Perform fuzzy search allowing for typos and variations.
        
        Args:
            query: Search query
            max_distance: Maximum edit distance allowed
            
        Returns:
            List of search results with similarity scores
        """
        self.stats['searches_performed'] += 1
        start_time = time.time()
        
        results = []
        
        for doc_id, content in self.documents.items():
            # Use fuzzy matcher for approximate matching
            fuzzy_results = self.fuzzy_matcher.approximate_pattern_matching(
                content.lower(), query.lower(), max_distance
            )
            
            if fuzzy_results:
                # Calculate overall similarity score
                avg_distance = sum(result[1] for result in fuzzy_results) / len(fuzzy_results)
                similarity = 1.0 - (avg_distance / len(query))
                
                results.append({
                    'document_id': doc_id,
                    'content': content,
                    'metadata': self.document_metadata[doc_id],
                    'fuzzy_matches': fuzzy_results,
                    'similarity_score': similarity,
                    'average_edit_distance': avg_distance
                })
        
        # Sort by similarity
        results.sort(key=lambda x: -x['similarity_score'])
        
        search_time = time.time() - start_time
        self._update_search_time(search_time)
        
        return results
    
    def boolean_search(self, query: str) -> List[Dict[str, Any]]:
        """
        Perform boolean search with AND, OR, NOT operations.
        
        Args:
            query: Boolean query (e.g., "python AND machine OR learning NOT tutorial")
            
        Returns:
            List of matching documents
        """
        self.stats['searches_performed'] += 1
        start_time = time.time()
        
        # Parse boolean query (simplified parser)
        results = self._parse_boolean_query(query)
        
        search_time = time.time() - start_time
        self._update_search_time(search_time)
        
        return results
    
    def _parse_boolean_query(self, query: str) -> List[Dict[str, Any]]:
        """Parse and execute boolean query."""
        # Simplified boolean query parser
        # In production, use a proper query parser
        
        tokens = query.upper().split()
        
        if 'AND' in tokens:
            # Handle AND operation
            terms = [token.lower() for token in tokens if token not in ['AND', 'OR', 'NOT']]
            
            # Find documents containing all terms
            if terms:
                result_docs = set(self.inverted_index[terms[0]])
                for term in terms[1:]:
                    result_docs &= self.inverted_index[term]
            else:
                result_docs = set()
        
        elif 'OR' in tokens:
            # Handle OR operation
            terms = [token.lower() for token in tokens if token not in ['AND', 'OR', 'NOT']]
            
            result_docs = set()
            for term in terms:
                result_docs |= self.inverted_index[term]
        
        else:
            # Simple term search
            term = query.lower().strip()
            result_docs = self.inverted_index[term]
        
        # Build results
        results = []
        for doc_id in result_docs:
            results.append({
                'document_id': doc_id,
                'content': self.documents[doc_id],
                'metadata': self.document_metadata[doc_id],
                'relevance_score': 1.0  # Simple scoring
            })
        
        return results
    
    def substring_search(self, pattern: str) -> List[Dict[str, Any]]:
        """
        Search for substring using suffix arrays.
        
        Args:
            pattern: Substring pattern to search for
            
        Returns:
            List of documents containing the substring
        """
        self.stats['searches_performed'] += 1
        start_time = time.time()
        
        results = []
        
        for doc_id, suffix_array in self.suffix_arrays.items():
            matches = suffix_array.pattern_search(pattern.lower())
            
            if matches:
                content = self.documents[doc_id]
                results.append({
                    'document_id': doc_id,
                    'content': content,
                    'metadata': self.document_metadata[doc_id],
                    'matches': matches,
                    'match_count': len(matches),
                    'relevance_score': len(matches) / len(content)
                })
        
        results.sort(key=lambda x: -x['relevance_score'])
        
        search_time = time.time() - start_time
        self._update_search_time(search_time)
        
        return results
    
    def find_similar_documents(self, doc_id: str, threshold: float = 0.5) -> List[Dict[str, Any]]:
        """
        Find documents similar to given document.
        
        Args:
            doc_id: Reference document ID
            threshold: Minimum similarity threshold
            
        Returns:
            List of similar documents with similarity scores
        """
        if doc_id not in self.documents:
            return []
        
        reference_content = self.documents[doc_id]
        edit_calculator = EditDistanceCalculator()
        results = []
        
        for other_id, other_content in self.documents.items():
            if other_id != doc_id:
                similarity = edit_calculator.similarity_ratio(reference_content, other_content)
                
                if similarity >= threshold:
                    results.append({
                        'document_id': other_id,
                        'content': other_content,
                        'metadata': self.document_metadata[other_id],
                        'similarity_score': similarity
                    })
        
        results.sort(key=lambda x: -x['similarity_score'])
        return results
    
    def get_document_statistics(self) -> Dict[str, Any]:
        """Get comprehensive document statistics."""
        total_content_length = sum(len(content) for content in self.documents.values())
        
        # Find longest repeated substring across all documents
        longest_repeats = {}
        for doc_id, suffix_array in self.suffix_arrays.items():
            longest_repeat, positions = suffix_array.longest_repeated_substring()
            if longest_repeat:
                longest_repeats[doc_id] = {
                    'substring': longest_repeat,
                    'length': len(longest_repeat),
                    'occurrences': len(positions)
                }
        
        return {
            'total_documents': len(self.documents),
            'total_content_length': total_content_length,
            'average_document_length': total_content_length / len(self.documents) if self.documents else 0,
            'total_unique_words': len(self.inverted_index),
            'searches_performed': self.stats['searches_performed'],
            'average_search_time_ms': self.stats['average_search_time'] * 1000,
            'longest_repeated_substrings': longest_repeats,
            'index_size_estimate': len(self.inverted_index) * 50  # Rough estimate in bytes
        }
    
    def _update_search_time(self, search_time: float):
        """Update average search time statistics."""
        if self.stats['searches_performed'] == 1:
            self.stats['average_search_time'] = search_time
        else:
            # Moving average
            self.stats['average_search_time'] = (
                (self.stats['average_search_time'] * (self.stats['searches_performed'] - 1) + search_time) /
                self.stats['searches_performed']
            )

# Text Processing Pipeline
class TextProcessingPipeline:
    """Advanced text processing pipeline for production systems."""
    
    def __init__(self):
        """Initialize text processing pipeline."""
        self.processors = {
            'normalization': self._normalize_text,
            'tokenization': self._tokenize_text,
            'pattern_extraction': self._extract_patterns,
            'similarity_analysis': self._analyze_similarity,
            'compression': self._compress_text
        }
        
        # Initialize string algorithms
        self.z_algorithm = ZAlgorithm()
        self.edit_calculator = EditDistanceCalculator()
        
        # Statistics
        self.stats = {
            'texts_processed': 0,
            'total_processing_time': 0,
            'compression_ratios': [],
            'pattern_counts': defaultdict(int)
        }
    
    def process_text(self, text: str, operations: List[str] = None) -> Dict[str, Any]:
        """
        Process text through specified operations.
        
        Args:
            text: Input text
            operations: List of operations to perform
            
        Returns:
            Dictionary with processing results
        """
        if operations is None:
            operations = ['normalization', 'tokenization', 'pattern_extraction']
        
        start_time = time.time()
        results = {'original_text': text}
        
        current_text = text
        for operation in operations:
            if operation in self.processors:
                result = self.processors[operation](current_text)
                results[operation] = result
                
                # Update current text for chained operations
                if isinstance(result, str):
                    current_text = result
        
        processing_time = time.time() - start_time
        results['processing_time'] = processing_time
        
        # Update statistics
        self.stats['texts_processed'] += 1
        self.stats['total_processing_time'] += processing_time
        
        return results
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text (lowercase, remove extra spaces, etc.)."""
        import re
        
        # Convert to lowercase
        normalized = text.lower()
        
        # Remove extra whitespace
        normalized = re.sub(r'\s+', ' ', normalized)
        
        # Remove special characters (keeping basic punctuation)
        normalized = re.sub(r'[^\w\s\.,!?;:]', '', normalized)
        
        return normalized.strip()
    
    def _tokenize_text(self, text: str) -> List[str]:
        """Tokenize text into words and sentences."""
        import re
        
        # Word tokenization
        words = re.findall(r'\b\w+\b', text.lower())
        
        # Sentence tokenization (simple approach)
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        return {
            'words': words,
            'sentences': sentences,
            'word_count': len(words),
            'sentence_count': len(sentences)
        }
    
    def _extract_patterns(self, text: str) -> Dict[str, Any]:
        """Extract various patterns from text."""
        patterns = {
            'email_addresses': re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text),
            'phone_numbers': re.findall(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text),
            'urls': re.findall(r'https?://[^\s]+', text),
            'dates': re.findall(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b', text),
            'numbers': re.findall(r'\b\d+\.?\d*\b', text)
        }
        
        # Find repeated substrings using Z-algorithm
        z_array = self.z_algorithm.compute_z_array(text)
        periods = self.z_algorithm.find_periods(text)
        
        patterns['z_array_info'] = {
            'periods': periods,
            'max_z_value': max(z_array) if z_array else 0
        }
        
        # Update pattern statistics
        for pattern_type, matches in patterns.items():
            if isinstance(matches, list):
                self.stats['pattern_counts'][pattern_type] += len(matches)
        
        return patterns
    
    def _analyze_similarity(self, text: str) -> Dict[str, Any]:
        """Analyze text similarity patterns."""
        # Split into sentences for similarity analysis
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        similarity_matrix = []
        for i, sent1 in enumerate(sentences):
            row = []
            for j, sent2 in enumerate(sentences):
                if i == j:
                    similarity = 1.0
                else:
                    similarity = self.edit_calculator.similarity_ratio(sent1, sent2)
                row.append(similarity)
            similarity_matrix.append(row)
        
        # Find most similar sentence pairs
        similar_pairs = []
        for i in range(len(sentences)):
            for j in range(i + 1, len(sentences)):
                similarity = similarity_matrix[i][j]
                if similarity > 0.7:  # Threshold for similar sentences
                    similar_pairs.append({
                        'sentence1_index': i,
                        'sentence2_index': j,
                        'sentence1': sentences[i],
                        'sentence2': sentences[j],
                        'similarity': similarity
                    })
        
        return {
            'sentence_count': len(sentences),
            'similarity_matrix': similarity_matrix,
            'similar_pairs': similar_pairs,
            'average_sentence_length': sum(len(s) for s in sentences) / len(sentences) if sentences else 0
        }
    
    def _compress_text(self, text: str) -> Dict[str, Any]:
        """Analyze text compressibility and patterns."""
        import zlib
        
        # Simple compression analysis
        original_size = len(text.encode('utf-8'))
        compressed_data = zlib.compress(text.encode('utf-8'))
        compressed_size = len(compressed_data)
        
        compression_ratio = compressed_size / original_size if original_size > 0 else 0
        self.stats['compression_ratios'].append(compression_ratio)
        
        # Character frequency analysis
        char_freq = defaultdict(int)
        for char in text:
            char_freq[char] += 1
        
        # Most common characters
        common_chars = sorted(char_freq.items(), key=lambda x: -x[1])[:10]
        
        return {
            'original_size': original_size,
            'compressed_size': compressed_size,
            'compression_ratio': compression_ratio,
            'space_saved_percentage': (1 - compression_ratio) * 100,
            'character_frequency': dict(char_freq),
            'most_common_characters': common_chars,
            'unique_characters': len(char_freq)
        }
    
    def get_pipeline_statistics(self) -> Dict[str, Any]:
        """Get comprehensive pipeline statistics."""
        avg_processing_time = (self.stats['total_processing_time'] / self.stats['texts_processed'] 
                             if self.stats['texts_processed'] > 0 else 0)
        
        avg_compression_ratio = (sum(self.stats['compression_ratios']) / len(self.stats['compression_ratios'])
                               if self.stats['compression_ratios'] else 0)
        
        return {
            'texts_processed': self.stats['texts_processed'],
            'total_processing_time': self.stats['total_processing_time'],
            'average_processing_time': avg_processing_time,
            'pattern_counts': dict(self.stats['pattern_counts']),
            'average_compression_ratio': avg_compression_ratio,
            'z_algorithm_stats': self.z_algorithm.get_statistics(),
            'edit_distance_stats': self.edit_calculator.get_statistics()
        }
```

---

## Manager-Level Decision Framework

### String Algorithm Selection Guide

**Decision Matrix for L6/L7 Engineering Managers:**

| Use Case | Recommended Algorithm | Complexity | Business Justification |
|----------|----------------------|------------|----------------------|
| **Exact Search** | KMP Algorithm | O(n+m) | Guaranteed linear performance for exact matches |
| **Multiple Patterns** | Rabin-Karp | O(nm) avg | Hash-based efficiency for many patterns |
| **Fuzzy Search** | Edit Distance | O(nm) | User-friendly typo tolerance |
| **Substring Queries** | Suffix Array | O(m log n) | Excellent for complex substring operations |
| **Document Similarity** | Edit Distance + Hashing | O(nm) | Balance accuracy with performance |
| **Real-time Search** | Z-Algorithm | O(n) | Linear time for streaming applications |

### Implementation Guidelines for Engineering Managers

**Performance Considerations:**
- Preprocessing vs. query time trade-offs
- Memory usage for large text corpora
- Scalability for real-time systems
- Cache efficiency for repeated queries

**Business Impact Assessment:**
- User experience improvements from better search
- Operational cost reduction through efficiency
- Development time vs. performance benefits
- Maintenance complexity considerations

---

## Related Resources and Integration

- **[Advanced Graph Algorithms](advanced-graph-algorithms.md)** - Text graph analysis and document networks
- **[System-Scale Algorithms](system-scale-algorithms.md)** - Large-scale text processing systems
- **[System Design Fundamentals](../system-design/fundamentals.md)** - Search system architecture
- **[Performance Optimization](../deep-dives/performance-scale.md)** - Text processing at scale

---

*This String Algorithms guide provides L6/L7 engineering managers with advanced text processing capabilities essential for building scalable search systems, document processing pipelines, and user-facing text applications, combining algorithmic depth with practical business applications.*