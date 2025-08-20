# Content Standards for Amazon L6/L7 Interview Prep Site

*Version 1.0 | Last Updated: January 2025*

## 🎯 Purpose & Scope

This document establishes comprehensive content standards for the Amazon L6/L7 Engineering Manager Interview Prep site. These standards ensure consistency, quality, and maintainability across all content while optimizing the user experience for interview preparation.

### Goals
- **Consistency**: Uniform formatting and structure across all content
- **Quality**: High standards for accuracy, clarity, and usefulness
- **Maintainability**: Easy to update and expand content
- **User Experience**: Clear navigation and progressive learning
- **Professional Presentation**: Amazon-caliber content quality

---

## 📝 Content Formatting Standards

### Header Hierarchy

**Standard Structure:**
```markdown
# Page Title (H1) - Only one per page
## Major Sections (H2) - Main content divisions  
### Subsections (H3) - Topic breakdowns
#### Details (H4) - Specific items or sub-topics
##### Notes (H5) - Minor details (use sparingly)
```

**Examples:**
```markdown
# System Design Fundamentals
## Core Concepts
### Scalability Patterns
#### Horizontal Scaling
##### Load Balancer Configuration
```

**Rules:**
- ✅ Only one H1 per page (the page title)
- ✅ Use H2 for major sections
- ✅ Use H3 for subsections within major sections
- ✅ Keep hierarchy logical and sequential
- ❌ Don't skip header levels (H2 → H4)
- ❌ Don't use headers for emphasis

### Table Standards

**Consistent Format:**
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Data     | Data     | Data     |
| Data     | Data     | Data     |
```

**Alignment Rules:**
```markdown
| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Text         | Text           | Numbers       |
| Content      | Content        | $1,000        |
```

**Best Practices:**
- ✅ Use consistent column widths when possible
- ✅ Align currency and numbers to the right
- ✅ Center-align headers when appropriate
- ✅ Keep cell content concise
- ❌ Don't create tables wider than readable on mobile
- ❌ Don't put complex formatting inside table cells

### Code Block Standards

**Always Include Language Identifier:**
```python
# Python example with language identifier
def example_function():
    """Clear docstring explaining the function."""
    return "result"
```

```yaml
# YAML example with language identifier
configuration:
  setting: value
  another_setting: value
```

```javascript
// JavaScript example with language identifier
function exampleFunction() {
    // Clear comments explaining the code
    return 'result';
}
```

**Comment Standards:**
- ✅ Include language identifier on all code blocks
- ✅ Add comments explaining complex logic
- ✅ Include complexity analysis in comments when relevant
- ✅ Use descriptive variable names
- ❌ Don't include code without explanation
- ❌ Don't use generic variable names (x, y, z)

### List Standards

**Unordered Lists:**
```markdown
- Main point with clear description
  - Sub-point with additional detail
  - Another sub-point
- Second main point
- Third main point
```

**Ordered Lists:**
```markdown
1. **Step Name**: Clear description of what to do
2. **Step Name**: Another clear action item
3. **Step Name**: Final step with outcome
```

**Checklist Format:**
```markdown
- [ ] Task description with specific outcome
- [ ] Another task with measurable result
- [x] Completed task example
```

---

## 🎨 Visual Standards

### Emoji Usage

**Consistent Emoji Indicators:**
- 🎯 **Key Points**: Important concepts or goals
- 📊 **Data/Metrics**: Numbers, statistics, benchmarks
- 🚀 **Action Items**: Next steps or implementation
- 🔍 **Deep Dive**: Detailed analysis or exploration
- ⚡ **Performance**: Speed, optimization, efficiency
- 🛠️ **Tools/Technology**: Technical solutions and platforms
- 💡 **Tips**: Helpful insights or pro tips
- 🚨 **Warnings**: Common mistakes or pitfalls
- ✅ **Success**: Positive outcomes or best practices
- ❌ **Mistakes**: Things to avoid or anti-patterns

**Rules:**
- ✅ Use consistently throughout the site
- ✅ Limit to one emoji per line/section header
- ✅ Choose emojis that enhance understanding
- ❌ Don't overuse emojis (max 1-2 per paragraph)
- ❌ Don't use emojis in formal documentation titles

### Callout Boxes (Admonitions)

**Standard Types:**
```markdown
!!! success "Achievement/Positive Outcome"
    Use for success stories, achievements, or positive examples.

!!! tip "Helpful Advice"
    Use for pro tips, helpful insights, or best practices.

!!! warning "Important Caution"
    Use for common mistakes, pitfalls, or things to avoid.

!!! danger "Critical Risk"
    Use for serious mistakes that could fail interviews.

!!! info "Additional Information"
    Use for supplementary details or context.

!!! quote "Candidate Insights"
    Use for real candidate quotes and experiences.

!!! question "Self-Assessment"
    Use for questions to help readers evaluate themselves.
```

**Usage Guidelines:**
- ✅ Use sparingly for maximum impact
- ✅ Keep content concise and focused
- ✅ Choose the right type for the content
- ❌ Don't nest callouts inside other callouts
- ❌ Don't use multiple callouts in succession

### Link Standards

**Internal Links:**
```markdown
See [Leadership Principles Guide](../fundamentals/leadership-principles.md)
Review [System Design Basics](../system-design/fundamentals.md)
Check the [Quick Reference](../quick-reference.md)
```

**External Links:**
```markdown
[AWS Documentation](https://docs.aws.amazon.com/dynamodb/) - Official DynamoDB guide
[High Scalability](http://highscalability.com/) - Industry scaling patterns
[Amazon Builder's Library](https://aws.amazon.com/builders-library/) - Amazon's engineering practices
```

**Rules:**
- ✅ Use relative paths for internal links
- ✅ Include descriptive text for external links
- ✅ Test all links regularly
- ✅ Use meaningful anchor text
- ❌ Don't use "click here" or "read more"
- ❌ Don't link to broken or outdated resources

---

## 📚 Content Templates

### Template Usage Guidelines

**When to Use Templates:**
- ✅ Creating new content sections
- ✅ Ensuring consistency across similar content
- ✅ Establishing structure for complex topics
- ✅ Onboarding new contributors

**Template Locations:**
All templates are stored in `/docs/_templates/`:
- `problem-template.md` - For coding/system design problems
- `star-story-template.md` - For behavioral interview stories
- `section-overview-template.md` - For index/overview pages
- `quick-reference-template.md` - For summary/reference content

**Customization Guidelines:**
- ✅ Adapt templates to fit specific content needs
- ✅ Maintain the core structure while customizing
- ✅ Remove template instructions before publishing
- ❌ Don't ignore the template structure entirely
- ❌ Don't include template placeholder text in final content

### Content Structure Standards

**Problem/Topic Pages:**
```markdown
# Title
## Overview/Introduction
## Core Concepts
## Implementation/Approach
## Examples/Applications
## Best Practices
## Common Pitfalls
## Next Steps/Related Topics
```

**Index/Overview Pages:**
```markdown
# Section Title
## Section Overview
## Learning Path
## Core Content
## Quick Start Guide
## Success Factors
## Progress Tracking
## Next Steps
```

**Reference Pages:**
```markdown
# Topic Quick Reference
## Essential Overview
## Core Framework
## Key Metrics
## Tools & Technologies
## Common Questions
## Success Checklist
```

---

## 📏 Writing Standards

### Tone & Voice

**Target Tone:**
- **Professional**: Amazon-caliber content quality
- **Authoritative**: Based on real experience and data
- **Practical**: Actionable and immediately useful
- **Supportive**: Encouraging while realistic
- **Concise**: Respectful of reader's time

**Voice Characteristics:**
- ✅ Direct and clear communication
- ✅ Specific examples and concrete numbers
- ✅ Balanced optimism with realistic expectations
- ✅ Focus on actionable insights
- ❌ Avoid marketing speak or overselling
- ❌ Don't use overly casual language
- ❌ Avoid absolute statements without evidence

### Content Quality Standards

**Accuracy Requirements:**
- ✅ Verify all facts and figures
- ✅ Use recent examples (2023-2025)
- ✅ Include sources for external claims
- ✅ Update content regularly

**Clarity Standards:**
- ✅ One main idea per paragraph
- ✅ Clear topic sentences
- ✅ Logical flow between sections
- ✅ Defined technical terms

**Usefulness Criteria:**
- ✅ Actionable advice and specific steps
- ✅ Real examples and case studies
- ✅ Measurable outcomes and metrics
- ✅ Clear success criteria

### Technical Writing Guidelines

**Number Formatting:**
- Currency: $150,000 (no decimals unless necessary)
- Percentages: 85% (no space before %)
- Large numbers: 1.5M users, 100K requests
- Dates: "January 2025" (Month YYYY format)
- Time: 6-month timeline, 3-4 weeks

**Technical Terms:**
- ✅ Define acronyms on first use: "DynamoDB Global Secondary Index (GSI)"
- ✅ Use consistent terminology throughout
- ✅ Link to definitions when helpful
- ❌ Don't assume all readers know all technical terms

**Code and Configuration:**
- ✅ Include working, tested examples
- ✅ Explain complex logic in comments
- ✅ Use realistic variable names and values
- ✅ Include error handling where relevant

---

## 🔄 Cross-Reference Standards

### Internal Linking Strategy

**Link Hierarchy:**
```
Main Section → Subsection → Specific Topic → Related Topics
```

**Reference Patterns:**
- **Upward References**: Link to broader context
- **Lateral References**: Link to related topics at same level
- **Downward References**: Link to specific implementations

**Standard Phrases:**
```markdown
See [Complete Guide](../fundamentals/index.md) for comprehensive coverage
Review [Fundamentals](../fundamentals/index.md) before proceeding
Check [Quick Reference](../quick-reference.md) for summary
Explore [Advanced Topics](../deep-dives/index.md) for deeper dive
```

### Content Dependencies

**Prerequisites:**
- ✅ Clearly indicate required background knowledge
- ✅ Link to prerequisite content
- ✅ Provide brief context when necessary

**Progressive Disclosure:**
- ✅ Start with basics and build complexity
- ✅ Use clear section progression
- ✅ Provide clear next steps

---

## 📱 Responsive Design Standards

### Mobile-First Approach

**Content Considerations:**
- ✅ Keep line lengths readable on mobile
- ✅ Use responsive table designs
- ✅ Optimize images for mobile viewing
- ✅ Test navigation on small screens

**Table Handling:**
- For wide tables, consider:
  - Breaking into multiple smaller tables
  - Using responsive table layouts
  - Providing horizontal scroll with clear indicators

### Print-Friendly Formats

**Printer Optimization:**
- ✅ Ensure content is readable in black and white
- ✅ Use page break considerations for long content
- ✅ Include print-friendly versions of references

---

## 🔧 Maintenance Standards

### Content Lifecycle

**Creation Checklist:**
- [ ] Content follows appropriate template
- [ ] All formatting standards applied
- [ ] Internal links tested and working
- [ ] External links verified and current
- [ ] Content reviewed for accuracy
- [ ] Mobile display verified

**Update Requirements:**
- **Quarterly**: Review for outdated information
- **Semi-annually**: Update examples and case studies
- **Annually**: Comprehensive content audit

**Version Control:**
- ✅ Include "Last Updated" dates on all pages
- ✅ Document significant changes
- ✅ Maintain changelog for major updates

### Quality Assurance

**Review Process:**
1. **Technical Review**: Verify accuracy of technical content
2. **Editorial Review**: Check formatting and writing standards
3. **User Testing**: Validate usefulness and clarity
4. **Final Approval**: Confirm content meets all standards

**Performance Monitoring:**
- Track user engagement with content
- Monitor for outdated links or information
- Collect feedback for continuous improvement

---

## 📊 Metrics & Analytics

### Content Success Metrics

**Engagement Indicators:**
- Time spent on page
- Bounce rate and exit points
- Internal link click-through rates
- User progression through learning paths

**Quality Indicators:**
- User feedback and ratings
- Content completion rates
- Reference usage patterns
- Mobile vs desktop engagement

**Maintenance Metrics:**
- Content freshness (last update dates)
- Broken link detection
- Load time performance
- Search functionality effectiveness

---

## ✅ Compliance Checklist

### Before Publishing New Content

**Content Standards:**
- [ ] Follows appropriate template structure
- [ ] Uses consistent header hierarchy
- [ ] Includes proper formatting (tables, code blocks, lists)
- [ ] Uses standard emoji indicators appropriately
- [ ] Includes relevant callout boxes with correct types

**Technical Standards:**
- [ ] All internal links use relative paths and work correctly
- [ ] External links include descriptive text and open correctly
- [ ] Code blocks include language identifiers and comments
- [ ] Images have alt text and appropriate sizing

**Quality Standards:**
- [ ] Content is accurate and up-to-date
- [ ] Writing follows tone and voice guidelines
- [ ] Technical terms are defined or linked
- [ ] Numbers and dates use standard formatting

**User Experience:**
- [ ] Content is mobile-friendly
- [ ] Navigation is clear and logical
- [ ] Prerequisites are clearly indicated
- [ ] Next steps are provided

**Maintenance:**
- [ ] Last updated date is current
- [ ] Content owner is identified
- [ ] Review schedule is established

---

## 🎯 Implementation Guidelines

### For Content Creators

**Getting Started:**
1. Choose appropriate template from `_templates/`
2. Review this standards document
3. Create content following guidelines
4. Use checklist before publishing
5. Schedule regular reviews

**Best Practices:**
- Start with user needs and work backward
- Use real examples and specific numbers
- Test content with target audience
- Iterate based on feedback

### For Content Reviewers

**Review Focus Areas:**
1. **Accuracy**: Verify facts, figures, and technical details
2. **Consistency**: Check adherence to formatting standards
3. **Clarity**: Ensure content is understandable and useful
4. **Completeness**: Confirm all required sections are included

**Review Tools:**
- Standards checklist (above)
- Link checker for internal/external links
- Mobile preview for responsive design
- Print preview for print-friendly formats

---

## 🔄 Evolution & Updates

### Standards Evolution

**Review Schedule:**
- **Monthly**: Quick review of standards effectiveness
- **Quarterly**: Minor updates based on user feedback
- **Annually**: Major review and revision cycle

**Change Process:**
1. Identify need for standards change
2. Draft proposed changes
3. Review with stakeholders
4. Test changes on sample content
5. Update standards documentation
6. Communicate changes to team
7. Update existing content as needed

### Continuous Improvement

**Feedback Collection:**
- User experience feedback
- Content creator input
- Performance analytics
- Industry best practice updates

**Adaptation Strategy:**
- Maintain core principles while adapting to new needs
- Balance consistency with flexibility
- Prioritize user experience in all decisions

---

*This document serves as the definitive guide for all content creation and maintenance on the Amazon L6/L7 Interview Prep site. All contributors should familiarize themselves with these standards and refer to them regularly.*

---

**Document Metadata:**
- **Owner**: Content Team
- **Version**: 1.0
- **Last Updated**: January 2025
- **Next Review**: April 2025
- **Related Documents**: Template files in `_templates/` directory