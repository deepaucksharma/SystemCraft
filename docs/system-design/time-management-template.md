# System Design Time Management Template

## ⏰ Strategic Time Allocation for L6/L7 System Design

System design interviews are time-constrained strategic exercises. Success requires disciplined time management, structured thinking, and clear communication. This template provides minute-by-minute guidance for 45, 60, and 90-minute sessions.

## 🎯 Time Management Philosophy

### The 70-20-10 Rule
```markdown
70% - Core Design: Architecture, components, APIs
20% - Deep Dives: Scaling, reliability, specific challenges  
10% - Questions: Clarification and interviewer engagement

Never spend more than 20% of time on any single component.
```

### L6 vs L7 Time Priorities

#### L6 Focus (Execution Excellence)
```markdown
- Requirements clarification: 15%
- High-level architecture: 35%
- Detailed component design: 30%
- Scaling and reliability: 15%
- Questions and wrap-up: 5%
```

#### L7 Focus (Strategic Vision)
```markdown
- Business context and strategy: 20%
- Architecture and trade-offs: 40%
- Scalability and evolution: 25%
- Cross-cutting concerns: 10%
- Future vision: 5%
```

## 📋 45-Minute Interview Template

### Minutes 0-8: Requirements & Scope (18%)
```markdown
**Minutes 0-2: Initial Understanding**
- [ ] "Let me understand the problem..." 
- [ ] Restate the problem in your own words
- [ ] Ask about the most important success criteria
- [ ] Identify the primary users/actors

**Minutes 2-5: Functional Requirements**
- [ ] "What are the core features needed?"
- [ ] List 3-5 key functionalities
- [ ] Prioritize: MVP vs. nice-to-have
- [ ] Clarify user workflows/journeys

**Minutes 5-8: Non-Functional Requirements**
- [ ] Scale: Users, data volume, geographic distribution
- [ ] Performance: Latency, throughput expectations
- [ ] Reliability: Uptime, consistency requirements
- [ ] Security: Authentication, authorization, compliance

**Key Questions to Ask:**
- "How many users are we designing for?"
- "What's the expected read/write ratio?"
- "Are there any latency requirements?"
- "Do we need ACID compliance?"
- "Any specific technology constraints?"

**Time Check:** 8 minutes - Should have clear requirements documented
```

### Minutes 8-15: High-Level Architecture (16%)
```markdown
**Minutes 8-10: Core Components**
- [ ] Identify 4-6 major system components
- [ ] Show data flow between components
- [ ] Indicate external dependencies
- [ ] Mark synchronous vs asynchronous interactions

**Minutes 10-13: Technology Choices**
- [ ] Database selection (SQL/NoSQL/Both)
- [ ] Caching strategy (if applicable)
- [ ] Communication protocols (REST/GraphQL/gRPC)
- [ ] Processing approach (batch/stream/both)

**Minutes 13-15: Initial Trade-offs**
- [ ] Explain 2-3 key architectural decisions
- [ ] Mention alternatives considered
- [ ] Connect choices to requirements

**Deliverable:** Clean architecture diagram with labeled components

**Time Check:** 15 minutes - High-level design complete
```

### Minutes 15-35: Detailed Design (44%)
```markdown
**Minutes 15-20: Data Model (11%)**
- [ ] Design 2-3 core entities/tables
- [ ] Show relationships and cardinalities
- [ ] Identify primary keys and indexes
- [ ] Consider data access patterns

**Minutes 20-25: API Design (11%)**
- [ ] Define 3-4 critical APIs
- [ ] Show request/response formats
- [ ] Consider error handling
- [ ] Discuss versioning strategy

**Minutes 25-30: Deep Dive Component (11%)**
- [ ] Choose most complex/interesting component
- [ ] Detail internal architecture
- [ ] Explain algorithms/data structures
- [ ] Discuss implementation challenges

**Minutes 30-35: Cross-Cutting Concerns (11%)**
- [ ] Authentication/Authorization
- [ ] Logging and Monitoring
- [ ] Error Handling and Retry Logic
- [ ] Configuration Management

**Time Check:** 35 minutes - Detailed design mostly complete
```

### Minutes 35-42: Scale & Reliability (16%)
```markdown
**Minutes 35-37: Scaling Strategy**
- [ ] Horizontal vs vertical scaling approach
- [ ] Database scaling (sharding/partitioning)
- [ ] Caching layers and strategies
- [ ] CDN for static content

**Minutes 37-39: Reliability Improvements**
- [ ] Single points of failure identification
- [ ] Redundancy and failover mechanisms
- [ ] Circuit breakers and timeouts
- [ ] Data backup and recovery

**Minutes 39-42: Performance Optimization**
- [ ] Identify potential bottlenecks
- [ ] Propose optimization strategies
- [ ] Discuss monitoring and metrics
- [ ] Consider geographic distribution

**Time Check:** 42 minutes - Should be wrapping up technical content
```

### Minutes 42-45: Questions & Wrap-up (7%)
```markdown
**Minutes 42-44: Address Gaps**
- [ ] Ask if anything needs clarification
- [ ] Address any missed requirements
- [ ] Mention additional considerations

**Minutes 44-45: Your Questions**
- [ ] Ask about team structure
- [ ] Ask about current challenges
- [ ] Ask about technology preferences

**Final Check:** Summary of key decisions and trade-offs
```

## 📋 60-Minute Interview Template

### Minutes 0-10: Requirements & Context (17%)
```markdown
**Minutes 0-3: Problem Understanding**
- [ ] Understand business context and motivation
- [ ] Identify key stakeholders and users
- [ ] Clarify success metrics and KPIs
- [ ] Ask about timeline and launch constraints

**Minutes 3-6: Functional Requirements Deep Dive**
- [ ] List 5-7 core functionalities
- [ ] Understand user journeys in detail
- [ ] Clarify edge cases and error scenarios
- [ ] Prioritize features for MVP vs future

**Minutes 6-10: Non-Functional Requirements**
- [ ] Scale: Current and projected growth
- [ ] Performance: P95/P99 latency requirements
- [ ] Availability: SLA expectations (99.9% vs 99.99%)
- [ ] Consistency: CAP theorem trade-offs
- [ ] Security: Compliance and data protection
- [ ] Cost: Budget constraints and optimization

**Time Check:** 10 minutes - Comprehensive requirements gathered
```

### Minutes 10-18: Strategic Architecture (13%)
```markdown
**Minutes 10-13: System Boundaries**
- [ ] Define what's in scope vs out of scope
- [ ] Identify external systems and APIs
- [ ] Show user interaction patterns
- [ ] Consider mobile vs web vs API clients

**Minutes 13-16: Core Architecture**
- [ ] Design 5-8 major components
- [ ] Show synchronous and asynchronous flows
- [ ] Identify data storage needs
- [ ] Plan for horizontal scalability

**Minutes 16-18: Technology Strategy**
- [ ] Justify major technology choices
- [ ] Consider polyglot persistence
- [ ] Plan for microservices vs monolith
- [ ] Address team skills and operational complexity

**Time Check:** 18 minutes - Strategic foundation established
```

### Minutes 18-40: Detailed Design (37%)
```markdown
**Minutes 18-25: Data Architecture (12%)**
- [ ] Design comprehensive data model
- [ ] Choose appropriate databases for different needs
- [ ] Plan sharding/partitioning strategy
- [ ] Design for data consistency and integrity
- [ ] Consider data lifecycle and archiving

**Minutes 25-32: Service Design (12%)**
- [ ] Detail 2-3 core services
- [ ] Design service APIs and contracts
- [ ] Plan service discovery and communication
- [ ] Consider service mesh if applicable
- [ ] Design for fault tolerance

**Minutes 32-37: Processing Architecture (8%)**
- [ ] Design batch vs real-time processing
- [ ] Plan for data pipelines and ETL
- [ ] Consider event-driven architecture
- [ ] Design for exactly-once processing

**Minutes 37-40: Integration Patterns (5%)**
- [ ] External API integration patterns
- [ ] Message queuing and pub/sub
- [ ] Webhook and callback mechanisms
- [ ] Rate limiting and backpressure

**Time Check:** 40 minutes - Core design complete
```

### Minutes 40-55: Scale & Advanced Topics (25%)
```markdown
**Minutes 40-45: Scaling Deep Dive**
- [ ] Database scaling strategies
- [ ] Caching at multiple layers
- [ ] Load balancing approaches
- [ ] Auto-scaling policies

**Minutes 45-50: Reliability & Operations**
- [ ] Disaster recovery planning
- [ ] Multi-region deployment
- [ ] Circuit breakers and bulkheads
- [ ] Chaos engineering considerations

**Minutes 50-55: Advanced Considerations**
- [ ] Security architecture deep dive
- [ ] Compliance and audit requirements
- [ ] Cost optimization strategies
- [ ] Future evolution and migration paths

**Time Check:** 55 minutes - All technical aspects covered
```

### Minutes 55-60: Strategic Discussion (8%)
```markdown
**Minutes 55-58: Trade-offs and Alternatives**
- [ ] Summarize key architectural decisions
- [ ] Discuss alternatives and why they were rejected
- [ ] Identify areas for future optimization
- [ ] Consider organizational/team implications

**Minutes 58-60: Questions and Next Steps**
- [ ] Ask about team structure and processes
- [ ] Discuss current system challenges
- [ ] Ask about technology adoption processes
```

## 📋 90-Minute Interview Template (L7 Focus)

### Minutes 0-15: Business Context & Strategy (17%)
```markdown
**Minutes 0-5: Business Deep Dive**
- [ ] Understand market position and competitive landscape
- [ ] Clarify business model and revenue streams
- [ ] Identify key business metrics and growth drivers
- [ ] Understand regulatory and compliance context

**Minutes 5-10: Strategic Requirements**
- [ ] Multi-year vision and roadmap alignment
- [ ] International expansion considerations
- [ ] Acquisition and partnership implications
- [ ] Platform vs product strategic decisions

**Minutes 10-15: Organizational Context**
- [ ] Team structure and skill sets
- [ ] Budget and resource constraints
- [ ] Technology debt and legacy systems
- [ ] Risk tolerance and innovation appetite

**Time Check:** 15 minutes - Strategic foundation established
```

### Minutes 15-30: Architecture Vision (17%)
```markdown
**Minutes 15-20: Platform Strategy**
- [ ] Design for multiple products/teams
- [ ] Consider build vs buy vs partner decisions
- [ ] Plan for API economy and ecosystem
- [ ] Design organizational boundaries

**Minutes 20-25: Technology Strategy**
- [ ] Multi-year technology evolution
- [ ] Cloud-native vs hybrid approaches
- [ ] Emerging technology adoption (AI/ML, blockchain, etc.)
- [ ] Technology standardization vs innovation balance

**Minutes 25-30: Architecture Principles**
- [ ] Establish design principles and constraints
- [ ] Define architectural decision records process
- [ ] Plan for technology evaluation and adoption
- [ ] Consider open source vs proprietary trade-offs

**Time Check:** 30 minutes - Strategic architecture vision clear
```

### Minutes 30-65: Comprehensive Design (39%)
```markdown
**Minutes 30-40: Core Platform Design (11%)**
- [ ] Design platform services and abstractions
- [ ] Plan multi-tenant architecture
- [ ] Design for multiple deployment models
- [ ] Consider edge computing and distributed systems

**Minutes 40-50: Data Platform Architecture (11%)**
- [ ] Design comprehensive data strategy
- [ ] Plan for real-time and batch analytics
- [ ] Consider data mesh vs data lake approaches
- [ ] Design for ML/AI workloads

**Minutes 50-60: Security & Compliance Architecture (11%)**
- [ ] Zero-trust security model
- [ ] Identity and access management at scale
- [ ] Data privacy and sovereignty
- [ ] Compliance automation and reporting

**Minutes 60-65: Developer Experience Platform (6%)**
- [ ] CI/CD and deployment automation
- [ ] Observability and debugging tools
- [ ] Developer self-service capabilities
- [ ] Inner-sourcing and collaboration tools

**Time Check:** 65 minutes - Comprehensive platform design complete
```

### Minutes 65-80: Advanced Topics (17%)
```markdown
**Minutes 65-70: Global Scale Challenges**
- [ ] Multi-region active-active architecture
- [ ] Data residency and sovereignty
- [ ] Network optimization and edge computing
- [ ] Cross-region disaster recovery

**Minutes 70-75: Operational Excellence**
- [ ] Site reliability engineering practices
- [ ] Chaos engineering and resilience testing
- [ ] Capacity planning and cost optimization
- [ ] Incident response and post-mortem culture

**Minutes 75-80: Innovation and Evolution**
- [ ] Technology experimentation framework
- [ ] Migration strategies for legacy systems
- [ ] A/B testing and feature flag infrastructure
- [ ] Machine learning operations (MLOps)

**Time Check:** 80 minutes - All advanced topics covered
```

### Minutes 80-90: Strategic Wrap-up (11%)
```markdown
**Minutes 80-85: Organizational Implications**
- [ ] Team structure and Conway's Law
- [ ] Hiring and skill development needs
- [ ] Technology adoption and change management
- [ ] Culture and process implications

**Minutes 85-90: Vision and Roadmap**
- [ ] 1-year, 2-year, 5-year evolution
- [ ] Key milestones and decision points
- [ ] Success metrics and KPIs
- [ ] Risk mitigation and contingency plans
```

## 🎯 Time Management Techniques

### The Pomodoro Approach
```markdown
**5-Minute Cycles:**
- Minutes 0-5: Requirements
- Minutes 5-10: Architecture  
- Minutes 10-15: Deep dive 1
- Minutes 15-20: Deep dive 2
- etc.

Set mental alarms for each 5-minute boundary.
```

### The Pyramid Method
```markdown
**Start Broad, Go Deep:**
1. Overview (top of pyramid)
2. Major components (middle)
3. Detailed subsystems (bottom)
4. Scaling considerations (foundation)

Spend equal time at each level.
```

### The Checkpoint Strategy
```markdown
**Regular Check-ins:**
- 25% mark: "Am I on track for basic design?"
- 50% mark: "Do I have enough detail?"
- 75% mark: "What critical areas am I missing?"
- 90% mark: "What questions should I ask?"
```

## ⚠️ Common Time Management Pitfalls

### Time Wasters to Avoid
```markdown
❌ **Over-architecting early:** Don't design perfect APIs in minute 10
❌ **Rabbit holes:** Don't spend 15 minutes on authentication details
❌ **Technology debates:** Don't argue PostgreSQL vs MySQL for 10 minutes
❌ **Perfect diagrams:** Don't spend time making beautiful drawings
❌ **Implementation details:** Don't code algorithms on the whiteboard
```

### Time Savers to Leverage
```markdown
✅ **Template phrases:** "Let's assume standard authentication..."
✅ **Standard patterns:** Use well-known architectural patterns
✅ **Defer details:** "We can discuss sharding strategies later"
✅ **Time boxing:** "Let me spend 5 minutes on the API design"
✅ **Summarizing:** Regularly summarize key decisions
```

## 📊 Time Tracking Template

### Practice Session Tracker
```markdown
**Session Date:** [Date]
**Duration:** [45/60/90 minutes]
**Problem:** [System being designed]

**Time Breakdown:**
- Requirements: [X minutes] - [On track/Behind/Ahead]
- Architecture: [X minutes] - [On track/Behind/Ahead]  
- Detailed Design: [X minutes] - [On track/Behind/Ahead]
- Scaling: [X minutes] - [On track/Behind/Ahead]
- Questions: [X minutes] - [On track/Behind/Ahead]

**What I Covered:**
- [List of topics addressed]

**What I Missed:**
- [List of topics not covered]

**Time Management Grade:** [A/B/C/D/F]
**Areas for Improvement:**
- [Specific time management issues]
```

### Interview Day Checklist
```markdown
**Pre-Interview (2 minutes before):**
- [ ] Set mental timer awareness
- [ ] Review time allocation plan
- [ ] Prepare opening questions
- [ ] Plan transition phrases

**During Interview:**
- [ ] Check time at 25%, 50%, 75% marks
- [ ] Use transition phrases between sections
- [ ] Defer low-priority details
- [ ] Save time for questions

**Post-Interview Self-Assessment:**
- [ ] Did I cover all requirements?
- [ ] Did I show appropriate depth?
- [ ] Did I demonstrate strategic thinking?
- [ ] Did I engage the interviewer?
```

## 🚀 Practice Progression

### Week 1: Basic Time Awareness
- [ ] Practice with timer visible
- [ ] Focus on hitting major milestones
- [ ] Don't worry about perfect content
- [ ] Build time intuition

### Week 2: Content Optimization
- [ ] Identify your natural pace
- [ ] Practice deferring details
- [ ] Work on smooth transitions
- [ ] Balance breadth vs depth

### Week 3: Advanced Techniques
- [ ] Practice without visible timer
- [ ] Master the checkpoint strategy
- [ ] Adapt to different time constraints
- [ ] Handle interviewer interruptions

### Week 4: Interview Simulation
- [ ] Full mock interviews with time pressure
- [ ] Practice with different interviewers
- [ ] Handle various system complexities
- [ ] Master the strategic wrap-up

---

**Remember: Time management in system design is about demonstrating judgment - knowing what to cover deeply vs what to mention briefly. Practice until the time allocation becomes intuitive, allowing you to focus on showcasing your architectural thinking.**