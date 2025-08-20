<!-- 
Compensation Summary - Shared Component
Quick compensation overview for Amazon L6/L7 roles.
Usage: {% include "_includes/comp-summary.md" %}
-->

## 💰 Amazon L6/L7 Compensation Summary (2024-2025)

### L6: Senior Engineering Manager

| Location | Base Salary | RSU (4 years) | Sign-on Y1/Y2 | Total Y1 | 4-yr Avg |
|----------|------------|---------------|---------------|----------|----------|
| **Seattle** | $170K-$190K | $250K-$400K | $75K/$50K | $280K-$350K | $225K-$290K |
| **San Francisco** | $180K-$200K | $280K-$450K | $80K/$60K | $300K-$380K | $240K-$312K |
| **New York** | $175K-$195K | $260K-$420K | $75K/$55K | $290K-$365K | $230K-$300K |
| **Remote** | $160K-$180K | $230K-$360K | $65K/$40K | $260K-$320K | $205K-$270K |

### L7: Principal Engineering Manager

| Location | Base Salary | RSU (4 years) | Sign-on Y1/Y2 | Total Y1 | 4-yr Avg |
|----------|------------|---------------|---------------|----------|----------|
| **Seattle** | $220K-$260K | $550K-$900K | $140K/$100K | $410K-$520K | $357K-$485K |
| **San Francisco** | $235K-$275K | $600K-$1M | $150K/$110K | $435K-$560K | $385K-$525K |
| **New York** | $225K-$265K | $570K-$950K | $145K/$105K | $420K-$540K | $367K-$502K |
| **Remote** | $200K-$240K | $500K-$800K | $120K/$80K | $370K-$470K | $325K-$440K |

### Amazon's Unique Vesting Schedule

**RSU Vesting Pattern (Back-loaded):**
- **Year 1:** 5% vest
- **Year 2:** 15% vest
- **Year 3:** 40% vest (20% every 6 months)
- **Year 4:** 40% vest (20% every 6 months)

**Sign-on Bonuses** compensate for low RSU vesting in years 1-2.

### Negotiation Priorities

#### L6 Negotiation Order:
1. **RSU Package** - Highest long-term impact
2. **Sign-on Bonus** - Immediate cash flow
3. **Base Salary** - Least flexible
4. **Start Date** - Can affect signing bonus

#### L7 Negotiation Order:
1. **RSU Package** - Can vary by $400K+
2. **Base Salary** - More negotiable at L7
3. **Sign-on Structure** - Year 2 bonus often overlooked
4. **Title/Level** - Consider L7+ designation

### Quick Comparison vs Other Companies

| Company | L6 Equivalent | Pros | Cons |
|---------|--------------|------|------|
| **Google** | L5 | Better WLB, equal pay | Slower promotion |
| **Meta** | E6 | Higher RSU, better vesting | Higher pressure |
| **Microsoft** | Principal EM | Better WLB, stable | Lower total comp |
| **Netflix** | Senior EM | Highest cash comp | No equity, high pressure |

### Key Negotiation Tips

🎯 **Never accept first offer immediately**  
🎯 **Research market rates on levels.fyi**  
🎯 **Get competing offers when possible**  
🎯 **Negotiate multiple dimensions (base + RSU + signing)**  
🎯 **Focus on level negotiation - can be worth $200K+ over 4 years**

### Red Flags in Compensation

⚠️ **Offer >20% below market with no movement**  
⚠️ **"Best and final offer" on first negotiation attempt**  
⚠️ **No sign-on bonus despite leaving unvested equity**  
⚠️ **Downlevel attempts to save budget**  
⚠️ **Pressure tactics ("24 hours to decide")**

### Total Compensation Calculator

```python
def amazon_total_comp(base, rsu_total, sign_y1, sign_y2):
    year_1 = base + (rsu_total * 0.05) + sign_y1
    year_2 = base + (rsu_total * 0.15) + sign_y2  
    year_3 = base + (rsu_total * 0.40)
    year_4 = base + (rsu_total * 0.40)
    return (year_1 + year_2 + year_3 + year_4) / 4
```