# Quick Reference Guide for Amazon L6/L7 Interviews

## 🚀 Interview Day Cheat Sheet

### Pre-Interview Checklist
- [ ] Test video/audio setup
- [ ] Prepare blank paper and pen
- [ ] Have water ready
- [ ] Review STAR stories
- [ ] Warm up with easy problem
- [ ] Review this guide

## 📊 Key Numbers to Memorize

### System Scale Metrics
```python
# Latency Numbers Every Engineer Should Know (2024)
L1_cache_reference = 0.5  # ns
Branch_mispredict = 5  # ns  
L2_cache_reference = 7  # ns
Mutex_lock_unlock = 25  # ns
Main_memory_reference = 100  # ns
Send_1KB_over_1Gbps = 10_000  # ns (10 μs)
SSD_random_read = 150_000  # ns (150 μs)
Read_1MB_from_SSD = 1_000_000  # ns (1 ms)
HDD_seek = 10_000_000  # ns (10 ms)
Read_1MB_from_HDD = 20_000_000  # ns (20 ms)
Send_packet_CA_to_Netherlands = 150_000_000  # ns (150 ms)
```

### AWS Service Limits
| Service | Key Limits | Notes |
|---------|-----------|-------|
| **DynamoDB** | 40K RCU/WCU per table | Auto-scaling available |
| **S3** | 3.5K PUT/POST/DELETE per prefix | 5.5K GET/HEAD |
| **Lambda** | 15 min timeout, 10GB memory | 1000 concurrent default |
| **SQS** | 256KB message size | 14 days retention |
| **API Gateway** | 10K requests/sec | 29 sec timeout |
| **EC2** | 20 instances default | Increasable via support |

### Capacity Planning
```python
# Quick Estimations
1M requests/day = ~12 requests/second
1B requests/month = ~400 requests/second
1 photo (compressed) = ~200KB
1 minute HD video = ~50MB
1TB = 1000GB = 1_000_000MB
```

## 🏗️ System Design Template

### 1. Requirements (5 min)
```markdown
Functional:
- Feature 1: [Description]
- Feature 2: [Description]

Non-Functional:
- Users: [Number]
- Requests: [QPS]
- Latency: [p50/p99]
- Availability: [99.9% or 99.99%]
- Data: [Volume]
```

### 2. Capacity Estimation (3 min)
```python
users = 100_000_000
daily_active = users * 0.1
requests_per_user = 10
total_requests = daily_active * requests_per_user
qps = total_requests / 86400
peak_qps = qps * 3  # 3x for peak
```

### 3. High-Level Design (10 min)
```
[Client] --> [CDN] --> [LB] --> [API Gateway]
                                      |
                            [Service Layer]
                                      |
                        [Cache] <-- [Database]
```

### 4. Detailed Components (15 min)
- API Design
- Data Model
- Algorithm Choice
- Service Breakdown

### 5. Scale & Optimize (10 min)
- Caching Strategy
- Database Sharding
- Load Balancing
- CDN Usage

### 6. Handle Failures (5 min)
- Single points of failure
- Data loss scenarios
- Network partitions
- Cascading failures

## 💻 Coding Patterns Quick Reference

### Two Pointers
```python
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        curr_sum = arr[left] + arr[right]
        if curr_sum == target:
            return [left, right]
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return []
```

### Sliding Window
```python
def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    for i in range(k, len(arr)):
        window_sum = window_sum - arr[i-k] + arr[i]
        max_sum = max(max_sum, window_sum)
    
    return max_sum
```

### BFS Template
```python
from collections import deque

def bfs(root):
    if not root:
        return
    
    queue = deque([root])
    visited = set([root])
    
    while queue:
        node = queue.popleft()
        # Process node
        for neighbor in node.neighbors:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```

### DFS Template
```python
def dfs(node, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(node)
    # Process node
    
    for neighbor in node.neighbors:
        if neighbor not in visited:
            dfs(neighbor, visited)
    
    return visited
```

### Binary Search
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
```

## 🎭 STAR Story Template

**For comprehensive guidance**: [STAR Framework Mastery Guide](behavioral/star-framework.md)

### Quick STAR Format
```markdown
S: At [Company], our [system] was experiencing [problem]
   affecting [X users/$ impact].

T: As [role], I needed to [objective] within [constraints].

A: I [action 1], [action 2], and [action 3].
   Specifically, I [technical detail] and [leadership action].

R: This resulted in [metric improvement], saving [$X] and
   improving [customer metric]. I learned [lesson].
```

## 🎯 Leadership Principles Quick Guide

### Most Important for L6
1. **Deliver Results** - Show consistent execution
2. **Ownership** - Take end-to-end responsibility  
3. **Dive Deep** - Demonstrate technical depth
4. **Earn Trust** - Build team relationships
5. **Learn and Be Curious** - Show growth mindset

### Most Important for L7
1. **Think Big** - Demonstrate vision
2. **Invent and Simplify** - Show innovation
3. **Are Right, A Lot** - Strategic decisions
4. **Have Backbone** - Influence upward
5. **Hire and Develop** - Build organizations

## 🔧 AWS Services Quick Reference

### Compute
- **EC2**: Virtual servers
- **Lambda**: Serverless functions
- **ECS/EKS**: Container orchestration

### Storage
- **S3**: Object storage
- **EBS**: Block storage
- **EFS**: File storage

### Database
- **RDS**: Relational (MySQL, PostgreSQL)
- **DynamoDB**: NoSQL key-value
- **ElastiCache**: In-memory cache
- **Redshift**: Data warehouse

### Networking
- **VPC**: Virtual private cloud
- **CloudFront**: CDN
- **Route 53**: DNS
- **API Gateway**: API management

### Messaging
- **SQS**: Queue service
- **SNS**: Pub/sub notifications
- **EventBridge**: Event bus
- **Kinesis**: Stream processing

## 📝 Common Behavioral Questions

### L6 Level
- Tell me about a time you disagreed with your manager
- Describe a situation where you had to make a decision with incomplete information
- How did you handle an underperforming team member?
- Give an example of when you failed
- Describe your most challenging technical project

### L7 Level
- How did you drive organizational change?
- Describe influencing a decision at VP level
- Tell me about building a platform used by multiple teams
- How did you handle competing priorities from different VPs?
- Describe creating a multi-year technical strategy

## ⚡ Time Management Tips

### Coding Interview (45 min)
- 0-5 min: Understand problem
- 5-10 min: Discuss approach
- 10-30 min: Code solution
- 30-35 min: Test and debug
- 35-40 min: Optimize
- 40-45 min: Questions

### System Design (60 min)
- 0-5 min: Requirements
- 5-10 min: Estimation
- 10-25 min: High-level design
- 25-45 min: Deep dive
- 45-55 min: Scale and optimize
- 55-60 min: Wrap up

### Behavioral (45 min)
- 0-5 min: Introduction
- 5-40 min: 3-4 STAR stories
- 40-45 min: Your questions

## 🚨 Red Flags to Avoid

### Technical
- ❌ Over-engineering simple problems
- ❌ Ignoring requirements
- ❌ Not considering trade-offs
- ❌ Forgetting about failures
- ❌ No cost consideration

### Behavioral
- ❌ Blaming others
- ❌ No quantified results
- ❌ Theoretical examples
- ❌ Not showing growth
- ❌ Weak leadership examples

### Communication
- ❌ Not asking questions
- ❌ Rambling answers
- ❌ Getting defensive
- ❌ Not thinking out loud
- ❌ Poor time management

## ✅ Success Formulas

### System Design Success
```
Success = Clear Communication + 
          Structured Approach + 
          Trade-off Analysis + 
          Scale Considerations + 
          Practical Experience
```

### Coding Success
```
Success = Problem Understanding + 
          Clean Code + 
          Optimal Algorithm + 
          Edge Cases + 
          Clear Explanation
```

### Behavioral Success
```
Success = Relevant Stories + 
          STAR Structure + 
          Quantified Impact + 
          Leadership Principles + 
          Self-Reflection
```

## 🎯 Final Interview Tips

1. **Be yourself** - Authenticity matters
2. **Think out loud** - Share your process
3. **Ask questions** - Show curiosity
4. **Stay calm** - Mistakes are okay
5. **Be specific** - Use real examples
6. **Show impact** - Quantify results
7. **Demonstrate growth** - Learn from failures
8. **Prepare questions** - Show interest

## 📞 Questions to Ask Interviewers

### About the Role
- What are the biggest challenges facing this team?
- What does success look like in this role?
- How is the team structured?

### About the Team
- What's the team's tech stack?
- How do you handle on-call?
- What's the team culture like?

### About Growth
- What learning opportunities are available?
- How is performance evaluated?
- What's the path to L7/L8?

---

!!! success "You're Ready!"
    Keep this guide handy during your preparation and review it the night before your interview. Remember: you've prepared thoroughly, trust your preparation, and show them what you can do!

---

*Good luck with your interview! 🚀*