# Shared Component Library

This directory contains reusable components for the Amazon L6/L7 Interview Prep documentation. These components extract the most authoritative content from our comprehensive guides and make it easily reusable across multiple contexts.

## 📁 Available Components

### 🌟 Core Framework Components

#### `star-template.md`
**Purpose:** Standard STAR framework structure and guidance  
**Best for:** Behavioral interview preparation sections  
**Usage:** `{% include "_includes/star-template.md" %}`

**Contains:**
- Core STAR structure (Situation, Task, Action, Result)
- Story quality requirements and checklists
- Level-specific expectations (L6 vs L7)
- Power phrases by Leadership Principle
- Common pitfalls and how to avoid them

**Use when:** Any page discussing behavioral interviews or story preparation

---

#### `l6-vs-l7-summary.md`
**Purpose:** Concise comparison between L6 and L7 roles  
**Best for:** Quick reference sections and decision-making content  
**Usage:** `{% include "_includes/l6-vs-l7-summary.md" %}`

**Contains:**
- Comprehensive comparison matrix (scope, influence, compensation)
- Role focus differences
- Interview process variations
- Decision framework for level targeting
- Reality check on promotion statistics

**Use when:** Helping users understand which level to target or explaining differences

---

### 📚 Reference Components

#### `lp-list.md`
**Purpose:** Complete list of all 16 Amazon Leadership Principles  
**Best for:** Reference sections and comprehensive LP coverage  
**Usage:** `{% include "_includes/lp-list.md" %}`

**Contains:**
- All 16 Leadership Principles with official definitions
- Grouped by theme (Core, Execution, Trust, Results)
- L6/L7 focus areas
- Critical evaluation notes

**Use when:** Providing complete LP reference or comprehensive preparation guides

---

#### `lp-abbreviations.md`
**Purpose:** Quick reference for Leadership Principle abbreviations  
**Best for:** Study aids and quick reference pages  
**Usage:** `{% include "_includes/lp-abbreviations.md" %}`

**Contains:**
- Standard abbreviations and memory aids
- Thematic groupings
- Memory techniques and acronyms
- Interview story mapping guidance

**Use when:** Creating study guides or quick reference materials

---

#### `interview-rounds.md`
**Purpose:** Standard Amazon interview process structure  
**Best for:** Process overview and preparation planning  
**Usage:** `{% include "_includes/interview-rounds.md" %}`

**Contains:**
- Complete interview timeline and flow
- Round-by-round breakdown with durations and focus areas
- L6 vs L7 process differences
- Success rates and preparation guidance
- Red flags that eliminate candidates

**Use when:** Explaining the interview process or creating preparation timelines

---

### 💰 Practical Components

#### `comp-summary.md`
**Purpose:** Compensation overview and negotiation guidance  
**Best for:** Offer evaluation and negotiation preparation  
**Usage:** `{% include "_includes/comp-summary.md" %}`

**Contains:**
- 2024-2025 compensation ranges by location and level
- Amazon's unique vesting schedule explanation
- Negotiation priorities and strategies
- Comparison with other tech companies
- Red flags in compensation discussions

**Use when:** Discussing compensation, offers, or negotiation strategy

---

#### `common-questions.md`
**Purpose:** Frequently asked interview questions by category  
**Best for:** Interview preparation and practice sections  
**Usage:** `{% include "_includes/common-questions.md" %}`

**Contains:**
- System design questions by level
- Behavioral questions by Leadership Principle
- Technical leadership scenarios
- Crisis and pressure questions
- Follow-up question patterns

**Use when:** Providing practice questions or interview preparation materials

---

## 🎯 Usage Guidelines

### When to Use Shared Components

✅ **Use shared components when:**
- Content appears in 3+ different pages
- Information needs to stay synchronized across sections
- You want to ensure consistency of critical information
- Creating quick reference or summary sections
- Building study guides or checklists

✅ **Good examples:**
- Adding STAR framework to multiple behavioral prep pages
- Including L6 vs L7 comparison in decision-making sections
- Providing LP reference in multiple preparation guides
- Standardizing compensation info across offer-related content

### When to Use Inline Content

❌ **Use inline content when:**
- Information is highly specific to one context
- Content needs significant customization for the specific page
- Including only a small subset of the component content
- The component would feel disconnected from surrounding content

❌ **Examples of inline use:**
- Page-specific examples and case studies
- Contextual explanations that reference specific page content
- Customized checklists that combine multiple component concepts
- Narrative content that flows with the specific page story

### Component Customization Points

Each component includes customization markers for:

#### Context-Specific Modifications
```markdown
<!-- Customization Point: Add page-specific examples here -->
<!-- Customization Point: Modify for specific audience (L6 vs L7) -->
<!-- Customization Point: Add local links to related sections -->
```

#### Content Adaptation
- **Audience Level:** Components can be filtered for L6 or L7 specific content
- **Depth:** Some components support brief vs comprehensive versions
- **Focus Area:** Technical vs behavioral vs strategic emphasis

### Integration Best Practices

#### 1. Contextual Introduction
Always introduce shared components with context:

```markdown
## STAR Framework Overview

The following provides the standard STAR structure used throughout Amazon interviews:

{% include "_includes/star-template.md" %}

For L6-specific STAR examples, see [L6 Behavioral Scenarios](../behavioral/l6-scenarios.md).
```

#### 2. Follow-up Links
Connect components to detailed content:

```markdown
{% include "_includes/l6-vs-l7-summary.md" %}

For complete analysis and detailed examples, see the [comprehensive L6 vs L7 comparison](../fundamentals/l6-vs-l7.md).
```

#### 3. Selective Inclusion
Use components strategically, not automatically:

```markdown
<!-- Include full LP list in comprehensive guides -->
{% include "_includes/lp-list.md" %}

<!-- Include only abbreviations in quick reference -->
{% include "_includes/lp-abbreviations.md" %}
```

## 🔧 Maintenance Guidelines

### Updating Components

**Component updates should:**
- Maintain backward compatibility with existing includes
- Preserve customization points and comments
- Update version information when content changes significantly
- Reflect the most current and authoritative information

**Update triggers:**
- New Amazon interview data or process changes
- Compensation benchmarks refresh (quarterly)
- Leadership Principle updates or emphasis changes
- User feedback indicating inaccuracies or gaps

### Quality Standards

All shared components must maintain:
- **Accuracy:** Information verified against multiple sources
- **Completeness:** Comprehensive coverage of the topic area
- **Clarity:** Clear, actionable guidance without jargon
- **Consistency:** Aligned with terminology guide and content standards
- **Relevance:** Focus on information that helps interview success

### Testing Component Changes

Before updating components:
1. Identify all pages that include the component
2. Review how changes affect each context
3. Test that customization points still work
4. Verify links and cross-references remain valid
5. Update version information and change notes

---

## 📊 Component Usage Analytics

Track which components are most valuable:

| Component | Usage Frequency | Primary Context | Update Frequency |
|-----------|----------------|-----------------|------------------|
| `star-template.md` | High | Behavioral prep | Quarterly |
| `l6-vs-l7-summary.md` | High | Decision making | Annually |
| `lp-list.md` | Medium | Reference sections | As needed |
| `lp-abbreviations.md` | Medium | Study guides | Annually |
| `interview-rounds.md` | High | Process overview | Semi-annually |
| `comp-summary.md` | High | Negotiation prep | Quarterly |
| `common-questions.md` | High | Practice sessions | Semi-annually |

---

## 🚀 Future Enhancements

Potential additional components:
- **Technical stack requirements** by team type
- **Common system design patterns** for quick reference
- **Negotiation email templates** for different scenarios
- **Timeline templates** for different preparation lengths
- **Self-assessment checklists** by competency area

---

*Component Library Version: 1.0 | Created: January 2025*  
*For questions or suggestions, contribute through the standard documentation process.*