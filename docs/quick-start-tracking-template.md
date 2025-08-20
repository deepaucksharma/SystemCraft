# 📊 Progress Tracking Templates

*Simple spreadsheet templates with automated calculations to track your Amazon L6/L7 interview preparation progress*

## How to Use These Templates

1. **Copy the templates** below into Google Sheets or Excel
2. **Fill in your daily activities** as you complete them
3. **Review weekly summaries** to track progress trends
4. **Use milestone tracking** to celebrate achievements
5. **Adjust your preparation** based on data insights

**Pro Tip**: Set up these templates at the beginning of your preparation journey to see your progress compound over time.

---

## Template 1: Daily Practice Tracker

### Setup Instructions
1. Create a new Google Sheet called "Amazon Interview Prep Tracker"
2. Copy the table structure below
3. The progress percentages will calculate automatically

### Daily Practice Tracker Table

```
| Date | Coding (30min) | System Design (30min) | Behavioral (30min) | AWS Study (30min) | Mock Interview | Daily Score | Weekly Avg |
|------|---------------|----------------------|-------------------|------------------|----------------|-------------|------------|
| Mon  | ✓ (30min)     | ✓ (35min)            | ✓ (25min)         | ✓ (30min)        | -              | 100%        |            |
| Tue  | ✓ (25min)     | - (0min)             | ✓ (30min)         | ✓ (20min)        | -              | 75%         |            |
| Wed  | ✓ (40min)     | ✓ (30min)            | - (0min)          | ✓ (30min)        | -              | 75%         |            |
| Thu  | - (0min)      | ✓ (45min)            | ✓ (30min)         | ✓ (25min)        | -              | 75%         |            |
| Fri  | ✓ (30min)     | ✓ (30min)            | ✓ (30min)         | - (0min)         | ✓ (60min)      | 100%        |            |
| Sat  | ✓ (45min)     | ✓ (60min)            | - (0min)          | - (0min)         | -              | 50%         |            |
| Sun  | - (0min)      | - (0min)             | ✓ (45min)         | - (0min)         | ✓ (30min)      | 50%         | 75%        |
```

### Automated Formulas (Copy these into your spreadsheet)

**Daily Score Formula** (Column G):
```excel
=COUNTIF(B2:F2,"✓")/COUNTA(B2:F2)*100
```

**Weekly Average Formula** (Column H, on Sunday row):
```excel  
=AVERAGE(G2:G8)
```

**Monthly Progress Formula** (Add this in a summary section):
```excel
=AVERAGE(H:H)
```

---

## Template 2: Skills Progress Tracker

### Skills Assessment Matrix

```
| Skill Area | Week 1 | Week 2 | Week 3 | Week 4 | Target | Progress | Gap |
|------------|--------|--------|--------|--------|--------|----------|-----|
| System Design | 2.5/5 | 3.0/5 | 3.5/5 | 4.0/5 | 4.0/5 | ✓ | 0.0 |
| Coding | 3.0/5 | 3.0/5 | 3.5/5 | 3.5/5 | 4.0/5 | → | 0.5 |
| AWS Knowledge | 2.0/5 | 2.5/5 | 3.0/5 | 3.5/5 | 3.5/5 | ✓ | 0.0 |
| STAR Stories | 1.5/5 | 2.5/5 | 3.5/5 | 4.0/5 | 3.5/5 | ✓ | -0.5 |
| Communication | 3.5/5 | 3.5/5 | 4.0/5 | 4.0/5 | 4.0/5 | ✓ | 0.0 |
| Mock Performance | 2.0/5 | 2.5/5 | 3.0/5 | 3.5/5 | 4.0/5 | → | 0.5 |
```

### Automated Progress Formulas

**Progress Indicator Formula** (Column G):
```excel
=IF(F2<=E2,"✓",IF(E2-F2<=0.5,"→","↑"))
```

**Gap Analysis Formula** (Column H):
```excel
=E2-F2
```

**Overall Readiness Score** (Summary cell):
```excel
=AVERAGE(F2:F7)
```

---

## Template 3: Problem Practice Log

### Coding Problems Tracker

```
| Date | Problem Name | Difficulty | Time Taken | Optimal? | Pattern | Notes | Review Date |
|------|--------------|------------|------------|-----------|---------|-------|-------------|
| 1/15 | Two Sum | Easy | 15min | ✓ | Hash Map | Clean solution | 1/22 |
| 1/15 | Valid Parentheses | Easy | 12min | ✓ | Stack | Good explanation | 1/22 |
| 1/16 | LRU Cache | Medium | 45min | ✗ | Design | Need to review | 1/18 |
| 1/16 | Binary Tree Inorder | Medium | 20min | ✓ | Tree Traversal | Recursive & iterative | 1/23 |
| 1/17 | Merge Intervals | Medium | 35min | ✓ | Intervals | Sorting approach | 1/24 |
```

### System Design Problems Tracker

```
| Date | Problem | Time | Completeness | Areas Covered | Missing Elements | Grade |
|------|---------|------|--------------|---------------|------------------|-------|
| 1/18 | URL Shortener | 45min | 85% | DB, API, Cache, Scale | Monitoring | B+ |
| 1/20 | Chat System | 50min | 90% | WebSocket, DB, Push | Security details | A- |
| 1/22 | News Feed | 60min | 80% | Timeline, Ranking | CDN, Analytics | B |
| 1/24 | Rate Limiter | 40min | 95% | Algorithms, Storage | Distributed sync | A |
```

### Success Rate Calculations

**Coding Success Rate Formula**:
```excel
=COUNTIF(E:E,"✓")/COUNTA(E:E)*100
```

**Average Time Formula**:
```excel
=AVERAGE(D:D)
```

**System Design Average Grade Formula** (convert grades to numbers first):
```excel
=AVERAGE(G:G)
```

---

## Template 4: STAR Stories Tracker

### Story Development Progress

```
| Leadership Principle | Story 1 | Story 2 | Story 3 | Best Story | Confidence | Last Practice |
|---------------------|---------|---------|---------|------------|------------|---------------|
| Customer Obsession | Draft | Complete | - | Story 2 | 4/5 | 1/20 |
| Ownership | Complete | Complete | Draft | Story 1 | 5/5 | 1/18 |
| Invent & Simplify | Complete | Draft | - | Story 1 | 4/5 | 1/22 |
| Are Right, A Lot | Draft | - | - | - | 2/5 | 1/15 |
| Learn and Be Curious | Complete | Complete | Complete | Story 2 | 5/5 | 1/21 |
| Hire & Develop Best | Complete | Draft | - | Story 1 | 4/5 | 1/19 |
```

### Story Quality Metrics

```
| Story Title | Situation Clear | Task Defined | Action Detailed | Result Quantified | Leadership Shown | Overall Score |
|-------------|----------------|--------------|-----------------|------------------|------------------|---------------|
| Database Migration | ✓ | ✓ | ✓ | ✓ | ✓ | 10/10 |
| Team Conflict Resolution | ✓ | ✓ | ✓ | ✓ | ✓ | 10/10 |
| Process Improvement | ✓ | ✓ | ✓ | ✗ | ✓ | 8/10 |
| Cross-team Collaboration | ✓ | ✓ | ✗ | ✓ | ✓ | 8/10 |
```

**Story Readiness Formula**:
```excel
=COUNTIF(C2:G2,"✓")/5*100
```

**Average Story Quality**:
```excel
=AVERAGE(G:G)
```

---

## Template 5: Mock Interview Performance Tracker

### Mock Interview Results

```
| Date | Interviewer | Type | Technical Score | Behavioral Score | Communication | Overall | Key Feedback | Action Items |
|------|-------------|------|----------------|------------------|---------------|---------|--------------|-------------|
| 1/18 | Sarah (Senior SWE) | System Design | 7/10 | 8/10 | 8/10 | B+ | Good technical depth, work on time management | Practice 45min limit |
| 1/22 | Mike (EM) | Behavioral | 6/10 | 9/10 | 8/10 | B | Great stories, need more technical examples | Add technical leadership stories |
| 1/25 | Alex (Principal) | Full Loop | 8/10 | 8/10 | 9/10 | A- | Strong overall, minor AWS gaps | Study DynamoDB patterns |
```

### Performance Trend Analysis

**Average Scores Over Time**:
```excel
Technical Trend: =AVERAGE(D2:D4)
Behavioral Trend: =AVERAGE(E2:E4) 
Communication Trend: =AVERAGE(F2:F4)
```

**Improvement Rate**:
```excel
=((Latest_Score - First_Score) / First_Score) * 100
```

---

## Template 6: Weekly Summary Dashboard

### Week of [Date] Summary

```
| Metric | Target | Actual | Status | Variance |
|--------|--------|--------|---------|----------|
| Practice Sessions | 5 | 4 | ⚠️ | -20% |
| Coding Problems | 8 | 6 | ⚠️ | -25% |
| System Design | 2 | 2 | ✅ | 0% |
| Story Development | 3 | 4 | ✅ | +33% |
| Mock Interviews | 1 | 1 | ✅ | 0% |
| Study Hours | 12 | 10.5 | ⚠️ | -12.5% |
```

### Automated Status Indicators

**Status Formula**:
```excel
=IF(C2>=B2,"✅",IF(C2>=B2*0.8,"⚠️","❌"))
```

**Variance Formula**:
```excel
=(C2-B2)/B2*100
```

---

## Template 7: Milestone & Goal Tracker

### Major Milestones

```
| Milestone | Target Date | Actual Date | Status | Success Criteria | Notes |
|-----------|-------------|-------------|---------|------------------|-------|
| Foundation Complete | 2/15 | 2/18 | ✅ | Score 3.5/5 in all areas | 3 days late but achieved |
| Technical Readiness | 3/1 | - | 🟡 | System design + coding fluent | On track |
| Stories Complete | 3/8 | - | 🟡 | 2 stories per LP, 4/5 confidence | 60% complete |
| Mock Interview Success | 3/15 | - | ⚪ | Consistent B+ or better | Not started |
| Interview Ready | 3/22 | - | ⚪ | 85% readiness checklist | Scheduled |
```

### Goal Achievement Tracking

**Completion Rate**:
```excel
=COUNTIF(D:D,"✅")/COUNTA(D:D)*100
```

**Days Until Next Milestone**:
```excel
=B2-TODAY()
```

---

## Template 8: Time Investment Tracker

### Weekly Time Allocation

```
| Week | Coding | System Design | Behavioral | AWS Study | Mock Interviews | Total | Target | Variance |
|------|--------|---------------|------------|-----------|----------------|-------|---------|----------|
| 1 | 3.5h | 4h | 2h | 2.5h | 1h | 13h | 12h | +8% |
| 2 | 3h | 3.5h | 3h | 2h | 1.5h | 13h | 12h | +8% |
| 3 | 2.5h | 4h | 3.5h | 1.5h | 2h | 13.5h | 12h | +13% |
| 4 | 3h | 3h | 4h | 1h | 2.5h | 13.5h | 12h | +13% |
```

### Time Efficiency Analysis

**Hours per Problem Solved**:
```excel
=Total_Coding_Hours/Problems_Solved
```

**ROI on Mock Interviews**:
```excel
=Performance_Improvement/Mock_Interview_Hours
```

---

## Automated Dashboard Setup

### Key Metrics Summary (Place at top of main sheet)

```
===========================================
     AMAZON INTERVIEW PREP DASHBOARD
===========================================

Overall Readiness:     [85%] ✅
Days to Interview:      [23 days]
Practice Streak:        [12 days] 🔥

This Week:
├─ Practice Sessions:   4/5 ⚠️
├─ Coding Problems:     6/8 ⚠️
├─ Stories Developed:   3/2 ✅
└─ Study Hours:        10.5/12 ⚠️

Skill Levels:
├─ System Design:      4.0/5 ✅
├─ Coding:            3.5/5 ⚠️
├─ AWS Knowledge:      3.5/5 ✅
├─ Behavioral:        4.0/5 ✅
└─ Mock Performance:   3.5/5 ⚠️

Next Milestones:
├─ Technical Readiness: Mar 1 (8 days)
├─ Stories Complete:   Mar 8 (15 days)
└─ Interview Ready:    Mar 22 (29 days)
```

### Quick Setup Guide for Google Sheets

1. **Create new sheet**: "Amazon Interview Tracker"
2. **Set up tabs**: Daily, Skills, Problems, Stories, Mocks, Weekly, Milestones
3. **Copy formulas**: Use the formulas provided above
4. **Conditional formatting**: 
   - Green for ✅ (>=target)
   - Yellow for ⚠️ (80-99% of target)
   - Red for ❌ (<80% of target)
5. **Set up data validation**: Create dropdown lists for common entries

### Mobile Tracking Option

For quick daily updates, create a simple mobile-friendly version:

```
| Date | Coding | Design | Stories | AWS | Mock | Score |
|------|--------|--------|---------|-----|------|-------|
| Today| ✓      | ✓      | ✓       | -   | -    | 75%   |
```

---

## 🎯 Using Your Tracking Data

### Weekly Review Questions
1. **What patterns do I see in my most productive days?**
2. **Which skills are improving fastest/slowest?**
3. **Am I spending time on the right activities?**
4. **What obstacles keep preventing me from hitting targets?**
5. **How can I adjust next week for better results?**

### Red Flag Indicators
- **Declining performance** in mock interviews
- **Stagnant skill scores** for 2+ weeks
- **Consistently missing** daily practice targets
- **Low confidence scores** in key story areas
- **Increasing time per problem** without improved accuracy

### Success Indicators  
- **Steady upward trend** in all skill areas
- **Consistent 80%+** completion of daily targets
- **Improving mock interview** scores over time
- **Decreasing time** to solve problems with maintained quality
- **Growing confidence** across all preparation areas

---

## 💡 Pro Tips for Effective Tracking

1. **Update daily**: Spend 2-3 minutes each evening updating your tracker
2. **Be honest**: Accurate data is more valuable than impressive-looking numbers
3. **Focus on trends**: Weekly and monthly trends matter more than daily fluctuations
4. **Celebrate wins**: Acknowledge when you hit milestones and targets
5. **Adjust based on data**: Let your tracking inform changes to your study plan

**Remember**: The goal of tracking is insight, not perfection. Use this data to optimize your preparation and build confidence in your progress.

---

*Copy these templates into Google Sheets or Excel and customize them for your specific preparation timeline and goals. Consistent tracking will help you prepare more effectively and interview with confidence.*