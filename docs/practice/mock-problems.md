# Mock Interview Problems for L6/L7 Engineering Managers

## Overview

This collection contains 20 realistic mock interview problems designed specifically for Amazon L6/L7 Engineering Manager interviews. Each problem mirrors actual interview scenarios and complexity levels.

---

## 📊 Behavioral Interview Scenarios

### Problem 1: Technical Debt vs Feature Delivery
**Context:** You're 6 weeks from a major product launch. Your team discovers significant technical debt that could impact system stability, but addressing it would delay the launch by 3 weeks.

**What to demonstrate:**
- Decision-making under pressure
- Stakeholder communication
- Risk assessment and mitigation
- Business vs technical trade-offs

**Key questions to address:**
- How do you evaluate the trade-off?
- Who do you involve in the decision?
- How do you communicate to stakeholders?
- What's your contingency plan?

---

### Problem 2: Underperforming Senior Engineer
**Context:** A previously high-performing senior engineer on your team has been underdelivering for 3 months. They're critical to your current project and have deep domain knowledge.

**What to demonstrate:**
- Performance management skills
- Empathy and coaching ability
- Project risk management
- Team dynamics handling

**Key questions to address:**
- How do you approach the conversation?
- What support structures do you put in place?
- How do you protect project delivery?
- When do you escalate?

---

### Problem 3: Cross-Team Conflict Resolution
**Context:** Your team and another team disagree on API design. The other team wants REST, your team prefers GraphQL. The project is blocked for 2 weeks.

**What to demonstrate:**
- Conflict resolution skills
- Technical decision-making
- Influence without authority
- Finding win-win solutions

**Key questions to address:**
- How do you break the deadlock?
- What data drives the decision?
- How do you maintain relationships?
- What's the long-term solution?

---

### Problem 4: Diversity Hiring Challenge
**Context:** Your team of 15 engineers has no gender diversity. You have 3 open positions and want to improve diversity while maintaining high hiring standards.

**What to demonstrate:**
- Commitment to diversity and inclusion
- Creative sourcing strategies
- Bias mitigation in hiring
- Building inclusive culture

**Key questions to address:**
- What specific actions do you take?
- How do you address team culture?
- How do you measure success?
- What partnerships do you build?

---

### Problem 5: Failed Production Deployment
**Context:** A deployment your team pushed caused a 2-hour outage affecting 1M customers. It's the third incident this quarter from your team.

**What to demonstrate:**
- Ownership and accountability
- Root cause analysis skills
- Process improvement mindset
- Learning from failure

**Key questions to address:**
- How do you handle immediate response?
- What's your communication strategy?
- How do you prevent recurrence?
- How do you rebuild team confidence?

---

## 🏗️ System Design Problems

### Problem 6: Global Video Streaming Platform
**Requirements:**
- Support 100M daily active users globally
- Stream 4K video with < 100ms start time
- Handle live events with 10M concurrent viewers
- 99.99% availability requirement

**Design considerations:**
- CDN architecture and edge locations
- Video encoding and adaptive bitrate
- Global traffic management
- Storage and bandwidth optimization
- Live streaming infrastructure

**L6 Focus:** Design the video delivery system
**L7 Focus:** Design the entire platform architecture including organizational structure

---

### Problem 7: Real-time Fraud Detection System
**Requirements:**
- Process 1M transactions per second
- Detect fraud in < 100ms
- False positive rate < 0.1%
- Support ML model updates without downtime

**Design considerations:**
- Stream processing architecture
- ML model serving infrastructure
- Feature store design
- Real-time vs batch processing
- Feedback loop for model improvement

**L6 Focus:** Design the real-time processing pipeline
**L7 Focus:** Design the complete ML platform and team structure

---

### Problem 8: E-commerce Recommendation Engine
**Requirements:**
- Personalized recommendations for 500M users
- Update recommendations in real-time
- Support A/B testing at scale
- Process 10B events daily

**Design considerations:**
- Collaborative filtering vs content-based
- Real-time personalization architecture
- Offline model training pipeline
- Experimentation platform
- Privacy and data governance

**L6 Focus:** Design the recommendation service
**L7 Focus:** Build the complete personalization platform

---

### Problem 9: Global IoT Platform
**Requirements:**
- Support 100M IoT devices
- Process 1TB of telemetry data per hour
- Real-time alerting with 1-second latency
- 99.999% message delivery guarantee

**Design considerations:**
- MQTT vs custom protocol
- Time-series data storage
- Edge computing strategy
- Device management at scale
- Security and authentication

**L6 Focus:** Design the data ingestion pipeline
**L7 Focus:** Design the complete IoT ecosystem

---

### Problem 10: Multi-Region Database Platform
**Requirements:**
- Support ACID transactions globally
- < 10ms read latency in-region
- Automatic failover with < 30s RTO
- Handle 1M writes per second

**Design considerations:**
- Consensus algorithms (Raft, Paxos)
- Geo-replication strategy
- Consistency models
- Shard management
- Disaster recovery

**L6 Focus:** Design the replication system
**L7 Focus:** Build the complete database platform

---

## 💻 Coding Problems

### Problem 11: LRU Cache with Expiration
**Problem:** Implement an LRU cache that also supports time-based expiration of entries.

```python
class ExpiringLRUCache:
    def __init__(self, capacity: int, default_ttl: int):
        """
        capacity: maximum number of items
        default_ttl: default time-to-live in seconds
        """
        pass
    
    def get(self, key: str) -> Optional[Any]:
        """Get value, return None if expired or not found"""
        pass
    
    def put(self, key: str, value: Any, ttl: Optional[int] = None):
        """Add/update with optional custom TTL"""
        pass
```

**What to evaluate:**
- Code organization and clarity
- Time/space complexity analysis
- Edge case handling
- Testing approach

---

### Problem 12: Task Scheduler
**Problem:** Design a task scheduler that executes tasks based on dependencies.

```python
class Task:
    def __init__(self, id: str, dependencies: List[str]):
        self.id = id
        self.dependencies = dependencies

def schedule_tasks(tasks: List[Task]) -> List[str]:
    """
    Return execution order respecting dependencies
    Detect and report circular dependencies
    """
    pass
```

**What to evaluate:**
- Graph algorithm knowledge
- Error handling
- Code efficiency
- Problem-solving approach

---

### Problem 13: Rate Limiter
**Problem:** Implement a distributed rate limiter using token bucket algorithm.

```python
class RateLimiter:
    def __init__(self, rate: int, burst: int):
        """
        rate: tokens per second
        burst: maximum burst size
        """
        pass
    
    def allow_request(self, tokens: int = 1) -> bool:
        """Check if request is allowed"""
        pass
```

**What to evaluate:**
- Concurrency handling
- Distributed systems thinking
- Algorithm implementation
- Performance considerations

---

### Problem 14: Log Aggregator
**Problem:** Merge K sorted log files into a single sorted output.

```python
class LogEntry:
    def __init__(self, timestamp: int, message: str):
        self.timestamp = timestamp
        self.message = message

def merge_logs(log_files: List[Iterator[LogEntry]]) -> Iterator[LogEntry]:
    """
    Merge multiple sorted log streams
    Handle very large files efficiently
    """
    pass
```

**What to evaluate:**
- Heap/priority queue usage
- Memory efficiency
- Iterator pattern understanding
- Scalability considerations

---

### Problem 15: Service Health Checker
**Problem:** Build a service health monitoring system with cascading checks.

```python
class HealthChecker:
    def __init__(self):
        self.checks = {}
        self.dependencies = {}
    
    def register_check(self, name: str, check_fn: Callable, 
                       depends_on: List[str] = None):
        """Register a health check with dependencies"""
        pass
    
    def run_checks(self) -> Dict[str, bool]:
        """Run all checks respecting dependencies"""
        pass
```

**What to evaluate:**
- System design thinking in code
- Dependency management
- Error propagation
- Extensibility

---

## 🎯 Leadership & Organizational Scenarios

### Problem 16: Team Reorganization
**Context:** You're merging two teams (Team A: 8 engineers, Team B: 12 engineers) with different cultures and tech stacks. Team A uses Java/Spring, Team B uses Python/Django.

**Challenge:**
- How do you structure the new organization?
- How do you handle technology standardization?
- How do you address cultural differences?
- How do you minimize productivity loss?

**L6 Considerations:**
- Team formation strategy
- Technology migration plan
- Knowledge transfer approach
- Sprint planning during transition

**L7 Considerations:**
- Organizational design principles
- Long-term platform strategy
- Culture transformation program
- Success metrics and timeline

---

### Problem 17: Budget Cut Response
**Context:** Your organization's budget is cut by 30%. You need to maintain critical services while reducing costs.

**Challenge:**
- How do you prioritize what to keep?
- How do you communicate to the team?
- How do you maintain morale?
- How do you handle potential layoffs?

**L6 Considerations:**
- Project prioritization framework
- Resource optimization strategies
- Team communication plan
- Skill redeployment options

**L7 Considerations:**
- Strategic portfolio decisions
- Organizational restructuring
- Vendor and contract negotiations
- Long-term sustainability plan

---

### Problem 18: Technical Strategy Shift
**Context:** Company decides to migrate from on-premise to cloud. You own 5 critical services with 99.99% SLA requirements.

**Challenge:**
- How do you plan the migration?
- How do you maintain SLAs during transition?
- How do you upskill the team?
- How do you manage stakeholder expectations?

**L6 Considerations:**
- Migration architecture design
- Risk mitigation strategies
- Team training program
- Incremental delivery plan

**L7 Considerations:**
- Enterprise migration strategy
- Organizational change management
- Vendor selection and negotiations
- Industry best practices adoption

---

### Problem 19: Innovation vs Stability
**Context:** Your team maintains legacy systems generating $100M revenue. The business wants new features, but the system is fragile.

**Challenge:**
- How do you balance innovation with stability?
- How do you modernize incrementally?
- How do you build team capabilities?
- How do you measure success?

**L6 Considerations:**
- Strangler fig pattern implementation
- Test coverage improvement
- Feature flag strategy
- Technical debt management

**L7 Considerations:**
- Platform modernization roadmap
- Investment justification
- Risk management framework
- Organizational capability building

---

### Problem 20: Crisis Management
**Context:** Major security breach detected. Customer data potentially exposed. You're the incident commander.

**Challenge:**
- How do you coordinate response?
- How do you communicate internally/externally?
- How do you investigate root cause?
- How do you prevent recurrence?

**L6 Considerations:**
- Incident response execution
- Technical investigation lead
- Team coordination
- Immediate remediation

**L7 Considerations:**
- Executive communication
- Legal and compliance coordination
- Company-wide security review
- Long-term security strategy

---

## 📝 How to Use These Problems

### Preparation Strategy

1. **Individual Practice**
   - Spend 45-60 minutes per problem
   - Write out complete solutions
   - Time yourself for coding problems
   - Record yourself for behavioral scenarios

2. **Mock Interview Sessions**
   - Partner with other candidates
   - Rotate interviewer/interviewee roles
   - Provide structured feedback
   - Focus on communication clarity

3. **Solution Development**
   - Start with high-level approach
   - Identify key decision points
   - Consider multiple solutions
   - Explain trade-offs clearly

4. **Feedback Integration**
   - Review solutions with seniors
   - Identify improvement areas
   - Practice weak areas more
   - Build solution patterns

### Evaluation Criteria

**Technical Competence**
- Solution correctness and completeness
- Scalability considerations
- Performance optimization
- Best practices application

**Leadership Qualities**
- Strategic thinking
- Stakeholder management
- Team development focus
- Business alignment

**Communication Skills**
- Problem clarification
- Structured presentation
- Trade-off articulation
- Question handling

**Amazon Leadership Principles**
- Clear LP demonstration
- Multiple LP coverage
- Authentic examples
- Measurable impact

---

## 🎓 Additional Practice Resources

### Behavioral Scenarios
- Create 2-3 STAR stories per Leadership Principle
- Practice 2-minute and 5-minute versions
- Prepare for deep dive questions
- Quantify all impacts

### System Design
- Practice on whiteboard/virtual board
- Build component library
- Study Amazon services
- Review scaling patterns

### Coding Skills
- Daily coding practice (30 mins)
- Focus on clean, readable code
- Practice explaining while coding
- Cover data structures thoroughly

### Leadership Scenarios
- Study organizational design
- Learn change management
- Practice stakeholder communication
- Develop decision frameworks

---

*Remember: These problems are designed to be challenging. Focus on demonstrating your thought process, asking clarifying questions, and showing how you balance technical and business considerations.*