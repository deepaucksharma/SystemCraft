# Coding Problem Template for Amazon L6/L7 Manager Interviews

## 💻 Problem: [Problem Name]

**Difficulty:** Medium (L6) / Hard (L7)  
**Time Allocation:** 30-45 minutes  
**Topics:** [Data structures/algorithms involved]  
**Amazon Context:** [Real-world application at Amazon scale]  
**Manager Focus:** [Why managers need to understand this problem]

---

## 📋 Problem Statement

### Business Context
[Explain the real-world business problem this algorithm solves, particularly in Amazon's context]

### Problem Description
[Clear, concise problem statement with examples]

**Input:** [Description of input parameters]  
**Output:** [Description of expected output]  
**Constraints:** [Time/space limitations and input bounds]

### Example Cases
```
Input: [example input]
Output: [expected output]
Explanation: [why this is the correct output]

Input: [edge case example]
Output: [expected output for edge case]
Explanation: [reasoning for edge case handling]
```

---

## 🎯 Manager Interview Approach

### Initial Problem Analysis (5 minutes)
**Questions to Ask:**
- What are the performance requirements in production?
- How large can the input data sets be?
- What are the error handling expectations?
- Are there any specific constraints or edge cases to consider?

**Manager Mindset:**
- Think about this as a component your team would maintain
- Consider code readability and debugging requirements
- Think about testing strategy and edge case coverage

### Solution Strategy Discussion
**Approach Options:**
1. **Brute Force Approach:** [Simple but inefficient solution]
   - Time: O(?) | Space: O(?)
   - When appropriate: Small datasets, prototype/proof-of-concept
   
2. **Optimized Approach:** [Better algorithmic solution]
   - Time: O(?) | Space: O(?)
   - When appropriate: Production systems, large-scale data
   
3. **Production-Ready Approach:** [Optimized + robust error handling]
   - Time: O(?) | Space: O(?)
   - When appropriate: Mission-critical systems, team maintenance

---

## 🚀 Complete Solution Implementation

### Optimized Solution
```python
def solution_function(input_param):
    """
    [Clear description of what this function does]
    
    Args:
        input_param: [Description with type and constraints]
        
    Returns:
        [Description of return value and type]
        
    Time Complexity: O(?)
    Space Complexity: O(?)
    
    Manager Notes:
    - This implementation prioritizes readability and maintainability
    - Error handling included for production robustness
    - Key invariants documented for team understanding
    """
    
    # Input validation (production consideration)
    if not input_param or len(input_param) == 0:
        return default_return_value
    
    # Main algorithm implementation
    # Step 1: [Describe what this step accomplishes]
    step1_result = initialize_data_structures()
    
    # Step 2: [Describe the core algorithm logic]
    for item in input_param:
        # Process each item with clear logic
        processed_item = process_item(item)
        update_result(step1_result, processed_item)
    
    # Step 3: [Describe finalization/return logic]
    return finalize_result(step1_result)

def helper_function(item):
    """Helper function with single responsibility."""
    # Clear, testable helper functions
    pass

# Example usage and basic testing
if __name__ == "__main__":
    # Test case 1: Normal case
    test_input = [example_data]
    expected = [expected_result]
    result = solution_function(test_input)
    assert result == expected, f"Expected {expected}, got {result}"
    
    # Test case 2: Edge case
    edge_case_input = [edge_case_data]
    edge_expected = [edge_case_result]
    edge_result = solution_function(edge_case_input)
    assert edge_result == edge_expected, f"Expected {edge_expected}, got {edge_result}"
    
    print("All test cases passed!")
```

### Alternative Approaches Discussion
```python
# Alternative 1: Space-optimized version
def space_optimized_solution(input_param):
    """
    Trade memory for slightly more complex logic.
    Good for memory-constrained environments.
    """
    pass

# Alternative 2: Time-optimized version  
def time_optimized_solution(input_param):
    """
    Use additional memory for faster execution.
    Good for high-throughput scenarios.
    """
    pass
```

---

## 📊 Complexity Analysis

### Time Complexity Breakdown
- **Best Case:** O(?) - [When this occurs]
- **Average Case:** O(?) - [Typical scenario]
- **Worst Case:** O(?) - [When this occurs and why]

**Manager Explanation:**
[Explain complexity in business terms - how performance scales with data growth]

### Space Complexity Analysis
- **Auxiliary Space:** O(?) - [Additional memory used]
- **Total Space:** O(?) - [Including input space]

**Production Considerations:**
- Memory usage patterns and garbage collection impact
- Scalability considerations for large datasets
- Memory vs CPU trade-offs

---

## 🏗️ Production Implementation Considerations

### Code Quality and Maintainability
```python
class ProductionSolution:
    """
    Production-ready implementation with proper error handling,
    logging, and monitoring integration.
    """
    
    def __init__(self, config=None):
        self.config = config or self._get_default_config()
        self.metrics = MetricsCollector()
        self.logger = self._setup_logging()
    
    def solve(self, input_data):
        """
        Main solving function with production concerns.
        """
        try:
            # Input validation
            self._validate_input(input_data)
            
            # Performance monitoring
            start_time = time.time()
            
            # Core algorithm
            result = self._core_algorithm(input_data)
            
            # Metrics and logging
            execution_time = time.time() - start_time
            self.metrics.record_execution_time(execution_time)
            self.logger.info(f"Processed {len(input_data)} items in {execution_time:.3f}s")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Algorithm failed: {str(e)}")
            self.metrics.increment_error_count()
            raise
    
    def _validate_input(self, input_data):
        """Comprehensive input validation."""
        if not input_data:
            raise ValueError("Input cannot be empty")
        # Add more validation as needed
    
    def _core_algorithm(self, input_data):
        """Core algorithm separated for testability."""
        # Implementation here
        pass
```

### Testing Strategy
```python
import unittest
from unittest.mock import patch, MagicMock

class TestSolution(unittest.TestCase):
    """Comprehensive test suite for production code."""
    
    def setUp(self):
        self.solution = ProductionSolution()
    
    def test_normal_cases(self):
        """Test normal input cases."""
        test_cases = [
            ([input1], expected1),
            ([input2], expected2),
        ]
        
        for input_data, expected in test_cases:
            with self.subTest(input_data=input_data):
                result = self.solution.solve(input_data)
                self.assertEqual(result, expected)
    
    def test_edge_cases(self):
        """Test edge cases and boundary conditions."""
        # Empty input
        with self.assertRaises(ValueError):
            self.solution.solve([])
        
        # Single element
        result = self.solution.solve([single_element])
        self.assertEqual(result, expected_single)
    
    def test_performance(self):
        """Test performance characteristics."""
        large_input = [generate_large_test_data()]
        start_time = time.time()
        result = self.solution.solve(large_input)
        execution_time = time.time() - start_time
        
        # Assert reasonable performance
        self.assertLess(execution_time, acceptable_time_limit)
    
    @patch('solution_module.MetricsCollector')
    def test_metrics_collection(self, mock_metrics):
        """Test that metrics are properly collected."""
        self.solution.solve([test_data])
        mock_metrics.return_value.record_execution_time.assert_called_once()
```

---

## 🎭 Follow-up Questions and Manager Responses

### Technical Deep Dive Questions
**Q1: "How would you optimize this for very large datasets that don't fit in memory?"**

**Manager Response:**
"I'd consider several approaches: First, implement streaming processing to handle data in chunks. Second, use external sorting techniques if ordering is required. Third, leverage distributed computing frameworks like Spark for horizontal scaling. The choice depends on our infrastructure and latency requirements. I'd also work with the infrastructure team to understand our cluster capabilities and cost implications."

**Q2: "What if this needed to handle 1000x more requests per second?"**

**Manager Response:**
"At that scale, we'd need to architect for high throughput. I'd consider: caching frequently computed results, using async processing where possible, implementing circuit breakers for fault tolerance, and potentially pre-computing results for common inputs. We'd also need comprehensive monitoring and alerting to detect performance degradation early."

**Q3: "How would you ensure this code is maintainable by your team?"**

**Manager Response:**
"Code maintainability is crucial for team productivity. I'd ensure: comprehensive unit tests with high coverage, clear documentation and inline comments, consistent coding standards enforced through CI/CD, regular code reviews focusing on readability, and knowledge sharing sessions to ensure team understanding. I'd also implement proper logging and monitoring so issues can be debugged quickly."

### Leadership Principle Applications
**Customer Obsession:** "How does optimizing this algorithm benefit our customers?"
**Ownership:** "How would you ensure this code remains performant over time?"
**Invent and Simplify:** "Can you think of a simpler approach that meets our requirements?"

---

## 🚨 Common Manager Interview Mistakes

### Technical Mistakes
- **Over-optimization:** Don't optimize prematurely without understanding requirements
- **Under-explanation:** Always explain your thought process and trade-offs
- **Ignoring edge cases:** Consider and handle boundary conditions
- **Poor variable names:** Use descriptive names that make code self-documenting

### Manager-Specific Mistakes
- **Not considering team impact:** Think about code your team would maintain
- **Ignoring production concerns:** Consider monitoring, error handling, testing
- **Missing business context:** Connect technical solutions to business value
- **Over-engineering:** Choose solutions appropriate for the problem scale

---

## 📚 Related Problems and Practice

### Similar Problems for Practice
- [Related Problem 1] - [How it builds on this problem]
- [Related Problem 2] - [Different technique, similar concepts]
- [Related Problem 3] - [Harder version with additional constraints]

### Recommended Study Path
1. **Master the basic algorithm** - Understand time/space complexity
2. **Implement with proper error handling** - Production-ready code
3. **Practice explaining trade-offs** - Manager communication skills
4. **Extend with additional requirements** - Scalability and reliability

---

## ✅ Manager Interview Success Checklist

### Technical Competence
- [ ] Solution works correctly for all test cases
- [ ] Optimal or near-optimal time/space complexity
- [ ] Clean, readable code with good variable names
- [ ] Proper error handling and edge case management
- [ ] Clear explanation of algorithm approach

### Manager Leadership
- [ ] Demonstrates understanding of production concerns
- [ ] Explains trade-offs in business terms
- [ ] Shows consideration for team maintainability
- [ ] Connects solution to customer value
- [ ] Handles follow-up questions with depth

### Interview Performance
- [ ] Clarifies requirements before coding
- [ ] Explains approach before implementation
- [ ] Tests solution with multiple cases
- [ ] Handles time pressure appropriately
- [ ] Communicates clearly throughout process

---

*Template Version: 1.0 | Optimized for L6/L7 Amazon Engineering Manager coding interviews*