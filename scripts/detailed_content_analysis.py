#!/usr/bin/env python3
"""
Enhanced content analysis with proper section categorization and preparation path calculation.
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict

class DetailedContentAnalyzer:
    def __init__(self, docs_dir):
        self.docs_dir = Path(docs_dir)
        self.section_mapping = {
            # Core preparation sections
            'fundamentals': ['fundamentals', 'getting-started.md', 'index.md'],
            'behavioral': ['behavioral', 'l6-scenarios.md', 'l7-scenarios.md', 'behavioral-questions.md'],
            'coding': ['coding', 'algorithms.md', 'data-structures.md', 'patterns.md', 'amazon-top-100.md', 'strategy.md'],
            'system_design': ['system-design', 'l6-problems.md', 'l7-problems.md', 'case-studies.md', 'well-architected.md', 'aws-services.md', 'scale-architecture.md', 'fundamentals.md'],
            'deep_dives': ['deep-dives', 'distributed-systems.md', 'consistency-models.md', 'performance-scale.md', 'security.md', 'incident-response.md'],
            'portfolio': ['portfolio', 'architecture-diagrams.md', 'case-study-templates.md', 'code-samples.md', 'decision-records.md', 'technical-portfolio.md'],
            'practice': ['practice', '12-week-plan.md', '6-week-plan.md', 'weekly-plan.md', 'resources.md', 'mock-interviews.md', 'coding-practice.md', 'self-assessment.md', 'comprehensive-timeline.md', 'system-design-problems.md', 'skill-assessment.md'],
            'compensation': ['compensation', 'negotiation-guide.md'],
            'experiences': ['experiences', 'question-database.md', 'candidate-quotes.md', 'failure-case-studies.md', 'timeline-examples.md', 'success-templates.md', 'technical-examples.md'],
            'templates': ['_templates', 'assessment-template.md', 'behavioral-interview-template.md', 'coding-problem-template.md', 'l6-system-design-template.md', 'l7-system-design-template.md', 'reference-template.md', 'tutorial-template.md', 'guide-template.md', 'problem-template.md', 'section-overview-template.md', 'quick-reference-template.md', 'star-story-template.md', 'star-plus-plus-template.md', 'writing-assignment-template.md', '60-day-pip-template.md', 'prep-checklist-template.md', 'time-management-template.md'],
            'interactive': ['interactive', 'learning-objectives-framework.md', 'assessment-tools.md', 'analytics-dashboard.md', 'design-canvas.md'],
            'resources': ['resources', 'video-learning.md'],
            'includes': ['_includes', 'common-questions.md', 'interview-rounds.md', 'l6-vs-l7-summary.md', 'lp-abbreviations.md', 'comp-summary.md', 'lp-list.md', 'star-template.md'],
            'other': []
        }
        
        self.metrics = defaultdict(lambda: {
            'files': 0,
            'words': 0,
            'reading_minutes': 0,
            'code_examples': 0,
            'practice_problems': 0,
            'templates': 0,
            'external_links': 0
        })
        
        self.content_analysis = {
            'total_metrics': {},
            'section_metrics': {},
            'preparation_paths': {},
            'content_completeness': {},
            'resource_availability': {},
            'comparison_to_standards': {}
        }

    def categorize_file(self, filepath):
        """Categorize a file into the appropriate section"""
        rel_path = filepath.relative_to(self.docs_dir)
        path_str = str(rel_path)
        filename = filepath.name
        
        for section, patterns in self.section_mapping.items():
            for pattern in patterns:
                if pattern in path_str or pattern == filename:
                    return section
        
        # Fallback: use directory name
        if len(rel_path.parts) > 1:
            return rel_path.parts[0]
        return 'other'

    def analyze_file_content(self, filepath):
        """Analyze content of a single file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            return None

        # Remove frontmatter
        if content.startswith('---'):
            try:
                end_idx = content.find('---', 3)
                if end_idx > 0:
                    content = content[end_idx + 3:].strip()
            except:
                pass

        # Count words (excluding code blocks)
        text_content = re.sub(r'```.*?```', '', content, flags=re.DOTALL)
        text_content = re.sub(r'`[^`]+`', '', text_content)
        text_content = re.sub(r'[#*_\[\](){}]', '', text_content)
        words = len([w for w in text_content.split() if w.strip()])

        # Count code examples
        code_blocks = len(re.findall(r'```', content)) // 2
        inline_code = len(re.findall(r'`[^`]+`', content))
        code_examples = code_blocks + inline_code

        # Count practice problems
        problem_patterns = [
            r'\d+\.\s*(Design|Implement|Build|Create|Write|Question)',
            r'##\s*(Problem|Exercise|Challenge|Question)',
            r'\*\*Problem\s*\d+',
            r'### (Question|Problem) \d+',
            r'#### (Scenario|Question)'
        ]
        practice_problems = sum(len(re.findall(pattern, content, re.IGNORECASE)) for pattern in problem_patterns)

        # Count external links
        external_links = len([link for link in re.findall(r'https?://[^\s\)]+', content) 
                             if 'github.com' not in link or 'systemcraft' not in link.lower()])

        # Check if it's a template
        is_template = ('template' in filepath.name.lower() or 
                      '_templates' in str(filepath) or
                      'template' in content.lower()[:500])

        return {
            'words': words,
            'reading_minutes': max(1, words // 200),
            'code_examples': code_examples,
            'practice_problems': practice_problems,
            'external_links': external_links,
            'is_template': is_template
        }

    def analyze_all_content(self):
        """Analyze all markdown files"""
        total_metrics = {
            'files': 0,
            'words': 0,
            'reading_hours': 0,
            'code_examples': 0,
            'practice_problems': 0,
            'templates': 0,
            'external_links': 0
        }

        for filepath in self.docs_dir.rglob('*.md'):
            analysis = self.analyze_file_content(filepath)
            if not analysis:
                continue

            section = self.categorize_file(filepath)
            
            # Update section metrics
            self.metrics[section]['files'] += 1
            self.metrics[section]['words'] += analysis['words']
            self.metrics[section]['reading_minutes'] += analysis['reading_minutes']
            self.metrics[section]['code_examples'] += analysis['code_examples']
            self.metrics[section]['practice_problems'] += analysis['practice_problems']
            self.metrics[section]['external_links'] += analysis['external_links']
            if analysis['is_template']:
                self.metrics[section]['templates'] += 1

            # Update totals
            total_metrics['files'] += 1
            total_metrics['words'] += analysis['words']
            total_metrics['reading_hours'] += analysis['reading_minutes'] / 60
            total_metrics['code_examples'] += analysis['code_examples']
            total_metrics['practice_problems'] += analysis['practice_problems']
            total_metrics['external_links'] += analysis['external_links']
            if analysis['is_template']:
                total_metrics['templates'] += 1

        self.content_analysis['total_metrics'] = total_metrics
        self.content_analysis['section_metrics'] = dict(self.metrics)

    def calculate_preparation_paths(self):
        """Calculate time requirements for different preparation paths"""
        paths = {
            'quick_start': {
                'sections': ['fundamentals', 'practice'],
                'description': 'Essential basics for immediate interview prep'
            },
            'l6_preparation': {
                'sections': ['fundamentals', 'behavioral', 'coding', 'system_design', 'practice'],
                'description': 'Complete L6 (Senior SDE) preparation'
            },
            'l7_preparation': {
                'sections': ['fundamentals', 'behavioral', 'coding', 'system_design', 'deep_dives', 'portfolio', 'practice'],
                'description': 'Complete L7 (Principal SDE) preparation'
            },
            'comprehensive': {
                'sections': ['fundamentals', 'behavioral', 'coding', 'system_design', 'deep_dives', 'portfolio', 'practice', 'compensation', 'experiences'],
                'description': 'Complete mastery of all content'
            }
        }

        for path_name, path_info in paths.items():
            total_minutes = sum(self.metrics[section]['reading_minutes'] for section in path_info['sections'])
            total_problems = sum(self.metrics[section]['practice_problems'] for section in path_info['sections'])
            
            # Add practice time estimate (2-3x reading time for active practice)
            practice_multiplier = 2.5
            estimated_total_minutes = total_minutes * practice_multiplier
            
            self.content_analysis['preparation_paths'][path_name] = {
                'reading_hours': round(total_minutes / 60, 1),
                'estimated_total_hours': round(estimated_total_minutes / 60, 1),
                'practice_problems': total_problems,
                'sections_included': path_info['sections'],
                'description': path_info['description']
            }

    def assess_content_completeness(self):
        """Assess completeness of content in each area"""
        completeness = {}
        
        # Industry standard benchmarks for interview prep content
        standards = {
            'behavioral': {
                'min_scenarios': 20,
                'min_words': 8000,
                'min_reading_hours': 4
            },
            'coding': {
                'min_problems': 150,
                'min_words': 15000,
                'min_reading_hours': 8
            },
            'system_design': {
                'min_problems': 20,
                'min_words': 10000,
                'min_reading_hours': 6
            },
            'fundamentals': {
                'min_words': 5000,
                'min_reading_hours': 3
            }
        }
        
        for section, standard in standards.items():
            section_data = self.metrics[section]
            reading_hours = section_data['reading_minutes'] / 60
            
            completeness[section] = {
                'word_completeness': min(100, (section_data['words'] / standard['min_words']) * 100),
                'reading_time_completeness': min(100, (reading_hours / standard['min_reading_hours']) * 100),
                'practice_problems': section_data['practice_problems'],
                'assessment': 'comprehensive' if reading_hours >= standard['min_reading_hours'] else 'adequate' if reading_hours >= standard['min_reading_hours'] * 0.7 else 'needs_expansion'
            }
            
            if 'min_problems' in standard:
                completeness[section]['problem_completeness'] = min(100, (section_data['practice_problems'] / standard['min_problems']) * 100)

        self.content_analysis['content_completeness'] = completeness

    def analyze_resource_availability(self):
        """Analyze availability of different resource types"""
        resources = {
            'templates': sum(self.metrics[section]['templates'] for section in self.metrics),
            'code_examples': sum(self.metrics[section]['code_examples'] for section in self.metrics),
            'practice_problems': sum(self.metrics[section]['practice_problems'] for section in self.metrics),
            'external_references': sum(self.metrics[section]['external_links'] for section in self.metrics),
            'interactive_tools': self.metrics['interactive']['files'],
            'study_plans': len([f for f in self.docs_dir.glob('**/practice/*plan*.md')]),
            'assessment_tools': len([f for f in self.docs_dir.glob('**/*assessment*.md')])
        }
        
        self.content_analysis['resource_availability'] = resources

    def compare_to_industry_standards(self):
        """Compare to typical interview preparation requirements"""
        total_hours = self.content_analysis['total_metrics']['reading_hours']
        
        # Industry benchmarks for interview prep
        benchmarks = {
            'typical_l6_prep_hours': 100,  # 3-4 months, 6-8 hours/week
            'typical_l7_prep_hours': 150,  # 4-6 months, 8-10 hours/week
            'minimum_coding_problems': 200,
            'minimum_system_design_problems': 15,
            'minimum_behavioral_scenarios': 30
        }
        
        comparison = {
            'content_coverage': {
                'l6_coverage_percentage': min(100, (self.content_analysis['preparation_paths']['l6_preparation']['estimated_total_hours'] / benchmarks['typical_l6_prep_hours']) * 100),
                'l7_coverage_percentage': min(100, (self.content_analysis['preparation_paths']['l7_preparation']['estimated_total_hours'] / benchmarks['typical_l7_prep_hours']) * 100)
            },
            'problem_coverage': {
                'coding_problems_vs_minimum': (self.metrics['coding']['practice_problems'] / benchmarks['minimum_coding_problems']) * 100,
                'system_design_problems_vs_minimum': (self.metrics['system_design']['practice_problems'] / benchmarks['minimum_system_design_problems']) * 100,
                'behavioral_scenarios_vs_minimum': (self.metrics['behavioral']['practice_problems'] / benchmarks['minimum_behavioral_scenarios']) * 100
            }
        }
        
        self.content_analysis['comparison_to_standards'] = comparison

    def generate_comprehensive_report(self):
        """Generate the final comprehensive report"""
        self.analyze_all_content()
        self.calculate_preparation_paths()
        self.assess_content_completeness()
        self.analyze_resource_availability()
        self.compare_to_industry_standards()
        
        return self.content_analysis

def main():
    analyzer = DetailedContentAnalyzer('/home/deepak/SystemCraft/docs')
    report = analyzer.generate_comprehensive_report()
    
    # Save detailed report
    with open('/home/deepak/SystemCraft/comprehensive_content_analysis.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print("=== SYSTEMCRAFT COMPREHENSIVE CONTENT ANALYSIS ===\n")
    
    # Total Metrics
    total = report['total_metrics']
    print("📊 TOTAL CONTENT METRICS")
    print(f"Total Files: {total['files']}")
    print(f"Total Words: {total['words']:,}")
    print(f"Total Reading Time: {total['reading_hours']:.1f} hours")
    print(f"Code Examples: {total['code_examples']:,}")
    print(f"Practice Problems: {total['practice_problems']}")
    print(f"Templates: {total['templates']}")
    print(f"External Links: {total['external_links']}")
    
    # Section Breakdown
    print(f"\n📚 CONTENT BY SECTION")
    for section, data in sorted(report['section_metrics'].items(), key=lambda x: x[1]['words'], reverse=True):
        if data['words'] > 0:
            reading_hours = data['reading_minutes'] / 60
            print(f"{section.replace('_', ' ').title()}: {data['words']:,} words ({reading_hours:.1f}h, {data['practice_problems']} problems)")
    
    # Preparation Paths
    print(f"\n🎯 PREPARATION PATH ESTIMATES")
    for path, data in report['preparation_paths'].items():
        print(f"{path.replace('_', ' ').title()}:")
        print(f"  Reading: {data['reading_hours']} hours")
        print(f"  With Practice: {data['estimated_total_hours']} hours")
        print(f"  Problems: {data['practice_problems']}")
        print(f"  Description: {data['description']}")
        print()
    
    # Content Completeness
    print(f"✅ CONTENT COMPLETENESS ASSESSMENT")
    for section, data in report['content_completeness'].items():
        print(f"{section.title()}:")
        print(f"  Word Coverage: {data['word_completeness']:.1f}%")
        print(f"  Reading Time: {data['reading_time_completeness']:.1f}%")
        if 'problem_completeness' in data:
            print(f"  Problem Coverage: {data['problem_completeness']:.1f}%")
        print(f"  Assessment: {data['assessment'].replace('_', ' ').title()}")
        print()
    
    # Resource Availability
    print(f"🛠️ RESOURCE AVAILABILITY")
    resources = report['resource_availability']
    for resource, count in resources.items():
        print(f"{resource.replace('_', ' ').title()}: {count}")
    
    # Industry Comparison
    print(f"\n📈 INDUSTRY STANDARD COMPARISON")
    comparison = report['comparison_to_standards']
    print(f"L6 Prep Coverage: {comparison['content_coverage']['l6_coverage_percentage']:.1f}%")
    print(f"L7 Prep Coverage: {comparison['content_coverage']['l7_coverage_percentage']:.1f}%")
    print(f"Coding Problems vs. Minimum: {comparison['problem_coverage']['coding_problems_vs_minimum']:.1f}%")
    print(f"System Design vs. Minimum: {comparison['problem_coverage']['system_design_problems_vs_minimum']:.1f}%")
    print(f"Behavioral Scenarios vs. Minimum: {comparison['problem_coverage']['behavioral_scenarios_vs_minimum']:.1f}%")

if __name__ == "__main__":
    main()