# SystemCraft Content Standards and Style Guide

## Executive Summary

This document establishes comprehensive content standards for SystemCraft's Amazon L6/L7 engineering manager interview preparation materials. These standards ensure consistent quality, readability, and learning effectiveness across all documentation.

## Content Philosophy

### Core Principles

**1. Learner-Centric Design**
- Every piece of content should directly serve interview preparation needs
- Balance depth with accessibility - comprehensive but not overwhelming
- Prioritize practical application over theoretical knowledge
- Include real-world examples and actual interview experiences

**2. Consistent Quality Standards**
- Uniform formatting and structure across similar content types
- Consistent depth and treatment of topics
- Standardized examples and scenarios
- Coherent voice and tone throughout

**3. Evidence-Based Content**
- Use real interview feedback and candidate experiences
- Include quantified examples and metrics
- Reference actual Amazon practices and systems
- Validate content against current interview trends

## Content Length Standards

### Optimal Length Guidelines

| Content Type | Target Word Count | Max Word Count | Rationale |
|-------------|:-----------------:|:--------------:|-----------|
| **Guide/Tutorial** | 3,000-5,000 | 6,000 | Deep enough for mastery, not overwhelming |
| **Scenario/Example** | 800-1,200 | 1,500 | Detailed but focused on key learning |
| **Reference/Cheat Sheet** | 500-1,000 | 1,200 | Quick reference, scannable |
| **Index/Overview** | 800-1,500 | 2,000 | Comprehensive navigation without duplication |
| **Problem Set** | 4,000-6,000 | 8,000 | Multiple examples with detailed solutions |

### Section-Specific Standards

**Behavioral Content:**
- Individual scenarios: 800-1,200 words each
- STAR examples: 400-600 words each
- Section overview: 1,200-1,800 words
- **Target**: Reduce from 46,908 to ~25,000 words total

**Deep Dives:**
- Core technical topics: 4,000-6,000 words each
- Specialized topics: 2,500-4,000 words each
- Implementation examples: 800-1,200 words each
- **Target**: Expand from 6,267 to ~18,000 words total

**System Design:**
- Problem descriptions: 1,200-1,800 words each
- Solution walkthroughs: 2,000-3,000 words each
- Pattern guides: 3,000-4,500 words each

## Formatting Standards

### Heading Hierarchy

```markdown
# Main Topic Title (H1)
## Major Section (H2)
### Subsection (H3)
#### Detail Section (H4)
##### Minor Detail (H5)
###### Inline Header (H6 - use sparingly)
```

**Rules:**
- H1: One per document (main title)
- H2: Major sections, no more than 8 per document
- H3: Primary subsections, logical grouping
- H4: Detailed breakdowns, implementation specifics
- H5/H6: Use only when absolutely necessary for clarity

### Admonition Usage Standards

**Primary Admonitions (use consistently):**

```markdown
!!! info "Context Information"
    Provides background, definitions, or explanatory content

!!! tip "Actionable Advice" 
    Specific, actionable guidance for improvement

!!! warning "Important Considerations"
    Critical information that could affect success

!!! success "Positive Examples"
    Success stories, best practices, achievements

!!! danger "Critical Issues"
    Serious problems, red flags, or major risks
```

**Specialized Admonitions (use sparingly):**

```markdown
!!! quote "Real Experiences"
    Direct quotes from candidates or interviewers

!!! example "Detailed Examples"
    Extended code samples or detailed walkthroughs
```

### Table Formatting

**Consistent table structure:**

```markdown
| Column Header | Centered Data | Right-Aligned Data |
|:--------------|:-------------:|-------------------:|
| Left-aligned | Centered | Right-aligned |
| Content... | Content... | Content... |
```

**Standards:**
- Always include header row
- Use consistent alignment (left for text, center for short data, right for numbers)
- Maximum 5 columns for readability
- Keep cell content concise (< 50 characters when possible)

### Code Block Standards

**Language specification required:**

```python
# Always specify language
def example_function():
    """Include docstrings for clarity"""
    return "formatted code"
```

**Comment standards:**
- Include explanatory comments
- Use docstrings for functions/classes
- Add inline comments for complex logic
- Include security considerations where relevant

### List Formatting

**Bullet Lists:**
- Use `-` for primary bullet points
- Use `  -` for secondary (indented) bullet points
- Keep items parallel in structure
- Limit to 3 levels of nesting

**Numbered Lists:**
1. Use for sequential steps or processes
2. Include transition words for flow
3. Maintain consistent verb tense
4. Break long lists into subsections

## Writing Style Standards

### Voice and Tone

**Characteristics:**
- **Professional but accessible** - Expert knowledge conveyed clearly
- **Confident and supportive** - Encouraging while maintaining authority  
- **Practical and action-oriented** - Focus on application over theory
- **Concise and scannable** - Respect reader's time and attention

### Language Guidelines

**Do:**
- Use active voice ("You will design..." not "The system will be designed...")
- Write in second person ("You" addressing the reader)
- Use specific, concrete examples
- Include quantified metrics and results
- Define technical terms when first introduced
- Use parallel structure in lists and headings

**Avoid:**
- Passive voice and weak constructions
- Unnecessary jargon or acronyms without explanation
- Hedge words ("might," "possibly," "perhaps")
- Overly complex sentences (> 25 words)
- Repetitive content across sections

### Sentence Structure

**Guidelines:**
- Average sentence length: 15-20 words
- Vary sentence length for readability
- Use transition words between paragraphs
- Start sections with clear topic sentences
- End sections with actionable next steps

## Content Templates

### Scenario Template

```markdown
### [Scenario Name]: [Clear, Descriptive Title]

#### The Interview Question
*"[Exact question as typically asked in interviews]"*

#### What the Interviewer is Evaluating
- **[Primary Competency]** - [Brief explanation]
- **[Secondary Competency]** - [Brief explanation]
- **[Tertiary Competency]** - [Brief explanation]

#### Complete STAR Response Example

**Situation (30-45 seconds)**
"[Specific context with concrete details, metrics, and scope]"

**Task (15-30 seconds)**  
"[Your specific responsibility and goals]"

**Action (90-120 seconds)**
"[Detailed walkthrough of your approach, decisions, and execution]"

**Result (30-45 seconds)**
"[Quantified outcomes and lasting impact]"

#### Follow-up Questions and Responses
**Likely follow-up**: "[Common probe question]"
**Strong response**: "[Prepared answer addressing the probe]"

#### Leadership Principles Demonstrated
- **Primary LP**: [Name] - [How it was demonstrated]
- **Secondary LP**: [Name] - [Supporting evidence]

#### Key Success Factors
- [Critical element that made this effective]
- [Important technique or approach]
- [Learning or insight to apply elsewhere]
```

### Technical Guide Template

```markdown
# [Topic Name] for Amazon L6/L7 Engineering Leaders

## Executive Summary

[2-3 sentences explaining why this topic matters for L6/L7 interviews and what the reader will learn]

**Key Learning Outcomes:**
- [Specific skill or knowledge]
- [Practical application ability] 
- [Interview-relevant competency]

---

## Part I: Foundational Concepts

### 1. [Core Concept]

[Explanation with practical examples]

#### Real-World Application
[How this applies in Amazon-scale systems]

#### Interview Relevance  
[How this knowledge appears in interviews]

### 2. [Advanced Concept]

[Building on foundation with complexity]

---

## Part II: Practical Implementation

### [Implementation Topic]

[Code examples, architectural patterns, or detailed procedures]

```language
// Code example with comments
function implementationExample() {
    // Explanation of approach
    return result;
}
```

---

## Part III: Leadership Application

### Making Technical Decisions
[How to apply this knowledge as an L6/L7 leader]

### Communicating to Stakeholders
[How to explain technical concepts to business stakeholders]

### Team Guidance
[How to mentor and guide team members on this topic]

---

## Interview Scenarios

### Scenario 1: [Interview Question Type]
**Question**: "[Typical interview question]"
**L6/L7 Response Framework**: [Structured approach to answering]

---

## Key Takeaways

**For L6 Candidates:**
- [Level-appropriate focus areas]
- [Specific preparation recommendations]

**For L7 Candidates:**  
- [Strategic and organizational considerations]
- [Advanced preparation recommendations]

**Next Steps:**
1. [Immediate action item]
2. [Practice recommendation]
3. [Further learning suggestion]
```

## Content Quality Checklist

### Before Publishing Content

**Structure and Flow:**
- [ ] Clear learning objectives stated upfront
- [ ] Logical progression from basic to advanced concepts
- [ ] Smooth transitions between sections
- [ ] Actionable next steps provided

**Content Quality:**
- [ ] Real-world examples included
- [ ] Quantified metrics and results provided
- [ ] Technical accuracy verified
- [ ] Appropriate depth for target audience (L6/L7)

**Formatting Consistency:**
- [ ] Heading hierarchy follows standards
- [ ] Admonitions used appropriately
- [ ] Code blocks include language specification
- [ ] Tables formatted consistently

**Language and Style:**
- [ ] Active voice used throughout
- [ ] Technical terms defined on first use
- [ ] Sentence length varied (15-20 words average)
- [ ] Professional but accessible tone

**Interview Relevance:**
- [ ] Connects to actual interview experiences
- [ ] Includes leadership principles alignment
- [ ] Provides practical application guidance
- [ ] Addresses both L6 and L7 expectations where applicable

## Content Maintenance Process

### Regular Review Schedule

**Monthly:**
- Update candidate feedback and recent interview questions
- Refresh metrics and examples with current data
- Check external links and references

**Quarterly:**  
- Comprehensive style and consistency review
- Update technical examples with latest Amazon practices
- Validate content against current interview trends

**Annually:**
- Major structural review and optimization
- Technology stack updates
- Compensation and process updates

### Continuous Improvement

**Metrics to Track:**
- Content engagement and completion rates
- User feedback and success stories
- Interview success correlation with content usage
- Content freshness and accuracy

**Feedback Integration:**
- Regular candidate survey feedback
- Interview experience updates
- Amazon employee validation
- Community contributions and corrections

---

## Implementation Priority

### Phase 1: Critical Standards (Immediate)
1. Establish consistent formatting across all existing content
2. Standardize admonition usage throughout site
3. Implement heading hierarchy standards
4. Apply content length guidelines to problematic sections

### Phase 2: Content Enhancement (1-2 months)  
1. Expand thin sections using approved templates
2. Streamline overwhelming sections for better usability
3. Add missing concrete examples and metrics
4. Improve cross-referencing between related topics

### Phase 3: Advanced Features (2-3 months)
1. Implement content quality checklist for all updates
2. Establish content maintenance process
3. Create contributor guidelines
4. Build content performance monitoring

---

This style guide serves as the foundation for creating consistent, high-quality content that effectively prepares candidates for Amazon L6/L7 engineering manager interviews. All content should be evaluated against these standards before publication.