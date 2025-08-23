# Strategic Decision Making for Amazon L6/L7 Leaders

!!! info "Executive-Level Decision Making"
    This guide will provide frameworks for strategic technical decision making specifically for L6/L7 engineering managers, including Type 1 vs Type 2 decisions, stakeholder management, and Amazon's decision-making culture.

## = L6/L7 Decision Making Framework

### 1. Amazon's Decision Making Philosophy

#### Type 1 vs Type 2 Decisions
```markdown
**Type 1 Decisions (Irreversible):**
- Architecture choices affecting multiple teams
- Technology platform selections
- Organizational structure changes
- Major product direction shifts
- Require extensive analysis and stakeholder alignment

**Type 2 Decisions (Reversible):**
- Feature implementations
- Team process changes
- Tool selections
- Sprint priorities
- Can be made quickly with good judgment and iteration
```

#### L6/L7 Decision Authority and Scope
```markdown
**L6 Decision Scope:**
- Component architecture and technology choices
- Team structure and process decisions
- Cross-functional project prioritization
- Resource allocation within team boundaries

**L7 Decision Scope:**
- Platform and ecosystem architecture
- Organization-wide technology strategy
- Multi-team coordination and alignment
- Executive-level technical recommendations
```

### 2. Decision Making Frameworks for Technical Leaders

#### The Amazon 6-Page Decision Framework
```markdown
**Structure for Major Technical Decisions:**
1. **Problem Statement**: Clear definition of decision needed
2. **Context and Background**: Business and technical context
3. **Options Analysis**: Detailed evaluation of alternatives
4. **Recommendation**: Clear recommendation with rationale
5. **Implementation Plan**: Timeline, resources, risks
6. **Success Metrics**: How success will be measured
```

#### RACI Decision Matrix for L6/L7
```markdown
**For Complex Technical Decisions:**
- **Responsible**: Who does the work (your team)
- **Accountable**: Who owns the outcome (you as L6/L7)
- **Consulted**: Who provides input (stakeholders, experts)
- **Informed**: Who needs to know (broader organization)
```

### 3. Decision Making in Behavioral Interviews

#### Common L6/L7 Decision Questions
```markdown
**Typical Interview Scenarios:**
- "Tell me about a difficult technical decision you had to make"
- "Describe a time you made a decision with incomplete information"
- "How do you handle decisions when stakeholders disagree?"
- "Give an example of when you changed your mind about a decision"
```

## < Immediate Application

### Quick Decision Framework for Interviews
```markdown
**STAR Structure for Decision Stories:**
**Situation**: Complex technical or business context requiring decision
**Task**: Your responsibility for making the decision and outcomes
**Action**: Decision process, stakeholder consultation, analysis approach
**Result**: Decision outcome, implementation success, lessons learned
```

## 🔄 Real-World Decision Making Examples

### Case Study 1: Technology Migration Decision

**SITUATION: Legacy system migration affecting multiple teams**
```markdown
Context: 5-year-old legacy system serving 10M+ customers
Problem: System becoming maintenance burden, affecting team velocity
Options: 
- Complete rewrite (18-month project, high risk)
- Incremental modernization (3-year project, lower risk)
- Status quo with improved maintenance (short-term stability)

Stakeholders: 4 engineering teams, product management, business leadership
Constraints: Limited engineering capacity, customer impact concerns
```

**DECISION PROCESS:**
```markdown
Analysis Framework:
1. Customer Impact Assessment
   - Rewrite: Potential service disruption, but long-term performance gains
   - Incremental: Minimal disruption, gradual improvements
   - Status quo: Increasing reliability issues over time

2. Engineering Team Impact
   - Rewrite: High motivation, learning opportunity, but delivery risk
   - Incremental: Sustained team engagement, skill development
   - Status quo: Decreased team morale, technical debt accumulation

3. Business Risk Assessment
   - Rewrite: High short-term risk, high long-term value
   - Incremental: Moderate risk, moderate value
   - Status quo: Low short-term risk, high long-term business risk
```

**DECISION OUTCOME:**
Chose incremental modernization with specific criteria:
- Start with highest-risk components first
- Maintain full backward compatibility
- Measure performance improvements at each phase
- Re-evaluate approach every 6 months

**RESULT:**
- 18 months later: 60% of system modernized, zero customer impact
- Team satisfaction increased, technical debt reduced by 40%
- Gained confidence to accelerate modernization timeline

### Case Study 2: Resource Allocation Decision

**SITUATION: Limited engineering capacity, competing priorities**
```markdown
Context: 20-person engineering team, 3 major product initiatives
Options:
- Focus on single highest-priority initiative (fastest delivery)
- Split team across all initiatives (parallel progress)
- Sequence initiatives with dedicated team focus (balanced approach)

Constraints: Fixed team size, aggressive product timelines, customer commitments
```

**DECISION FRAMEWORK:**
```markdown
**Context Gathering:**
- Customer research: Which initiative has highest customer impact?
- Technical analysis: Which approach minimizes technical risk?
- Team input: What does the team think is most sustainable?
- Business alignment: What does executive leadership prioritize?

**Decision Criteria:**
1. Customer value delivery speed
2. Technical risk and quality maintenance
3. Team sustainability and growth
4. Business strategy alignment
```

**IMPLEMENTATION:**
```markdown
**Chosen Approach:** Sequenced focus with overlapping phases
- Phase 1: Full team on highest customer impact initiative (8 weeks)
- Phase 2: Split team 70/30 between completing Phase 1 and starting Phase 2
- Phase 3: Full transition to next highest priority initiative

**Risk Mitigation:**
- Weekly stakeholder updates on progress and trade-offs
- Clear success criteria and exit conditions for each phase
- Buffer time built in for technical debt and team development
```

### Case Study 3: Technical Standard Decision

**SITUATION: Multiple teams choosing different technologies**
```markdown
Context: 15 engineering teams, growing inconsistency in technology choices
Problem: Operational complexity, knowledge sharing difficulties, hiring challenges
Decision needed: Technology standardization vs team autonomy

Options:
- Mandate single technology stack (fast standardization, reduced autonomy)
- Create recommended standards with flexibility (balanced approach)
- Maintain full team autonomy (current state, increasing complexity)
```

**CONSENSUS BUILDING PROCESS:**
```markdown
**Phase 1: Information Gathering (4 weeks)**
- Survey all teams on current technology choices and satisfaction
- Analysis of operational costs for current technology diversity
- Assessment of hiring and knowledge sharing challenges

**Phase 2: Collaborative Decision Making (3 weeks)**
- Architecture working group with representatives from each team
- Prototyping sessions with most popular technology choices
- Cost-benefit analysis of standardization vs flexibility

**Phase 3: Implementation Planning (2 weeks)**
- Migration timeline for teams using non-standard technologies
- Training and support plan for teams adopting standards
- Exception process for teams with specific technical requirements
```

**RESULT:**
- Achieved 80% standardization while maintaining team satisfaction
- Reduced operational overhead by 35%
- Improved cross-team collaboration and knowledge sharing

## 🎯 Decision Making for Behavioral Interviews

### Structuring Decision Stories with STAR+

#### Enhanced STAR Framework for Decision Questions

```markdown
**SITUATION (30% of response)**
- Business/technical context requiring decision
- Multiple stakeholders with different perspectives
- Constraints and success criteria
- Timeline pressures and resource limitations

**TASK (15% of response)**  
- Your specific role in the decision-making process
- What outcome you were responsible for achieving
- Success metrics you would be measured against

**ACTION (40% of response)**
- Information gathering and analysis process
- Stakeholder consultation and consensus building
- Decision criteria and evaluation framework
- Communication strategy for decision rollout
- Risk mitigation and contingency planning

**RESULT (15% of response)**
- Short-term outcomes and metrics
- Long-term impact and lessons learned
- What you would do differently next time
- How the decision influenced future decision-making processes
```

### Common L6/L7 Decision Scenarios

#### "Tell me about a difficult technical decision you had to make"

**Framework for Strong Response:**
```markdown
**Focus Areas:**
- Scale and complexity of the decision
- Multiple valid options with trade-offs
- Stakeholder management and consensus building
- Long-term thinking and customer impact
- Your decision-making process and rationale

**Avoid:**
- Decisions that were obviously correct
- Blaming others for constraints or pressure
- Decisions made in isolation without stakeholder input
- Focus on technical details rather than decision process
```

#### "Describe a time you made a decision with incomplete information"

**Framework for Strong Response:**
```markdown
**Key Elements:**
- Why information was incomplete (time pressure, complexity, unknowns)
- How you assessed risk vs. waiting for more information
- Decision framework you used with uncertainty
- How you planned to adapt based on new information
- Outcome and what you learned about decision-making under uncertainty
```

#### "How do you handle decisions when stakeholders disagree?"

**Framework for Strong Response:**
```markdown
**Process Elements:**
- Understanding each stakeholder's perspective and underlying concerns
- Identifying shared goals and common ground
- Creating decision criteria that stakeholders agree on
- Facilitating discussion focused on criteria rather than positions
- Making decision transparently with clear rationale
- Following up to ensure stakeholders remain engaged
```

## 📚 Related Resources
- **[STAR Framework](star-framework.md)** - Structure decision stories for interviews
- **[Leadership Principles](../fundamentals/leadership-principles.md)** - Connect decisions to Amazon values
- **[L6 Scenarios](l6-scenarios.md)** - Component-level decision examples

---

*Use our [STAR framework guide](star-framework.md) to structure your decision-making stories while this detailed guide is being developed.*