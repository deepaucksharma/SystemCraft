#!/usr/bin/env python3
"""
Comprehensive content metrics analyzer for SystemCraft site.
Analyzes word counts, reading times, code examples, and more.
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict, Counter
import yaml

class ContentMetricsAnalyzer:
    def __init__(self, docs_dir):
        self.docs_dir = Path(docs_dir)
        self.metrics = {
            'total_files': 0,
            'total_words': 0,
            'total_characters': 0,
            'sections': defaultdict(lambda: {
                'files': 0,
                'words': 0,
                'code_examples': 0,
                'external_links': 0,
                'templates': 0,
                'practice_problems': 0
            }),
            'code_examples': {
                'total': 0,
                'by_language': defaultdict(int),
                'by_section': defaultdict(int)
            },
            'templates': [],
            'external_resources': [],
            'practice_problems': {
                'behavioral': 0,
                'coding': 0,
                'system_design': 0,
                'total': 0
            },
            'reading_times': {},
            'file_types': defaultdict(int),
            'content_depth': defaultdict(list)
        }

    def analyze_frontmatter(self, content):
        """Extract frontmatter from markdown files"""
        frontmatter = {}
        if content.startswith('---'):
            try:
                end_idx = content.find('---', 3)
                if end_idx > 0:
                    yaml_content = content[3:end_idx]
                    frontmatter = yaml.safe_load(yaml_content) or {}
                    content = content[end_idx + 3:].strip()
            except:
                pass
        return frontmatter, content

    def count_words(self, text):
        """Count words in text, excluding code blocks"""
        # Remove code blocks
        text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
        text = re.sub(r'`[^`]+`', '', text)
        
        # Remove markdown syntax
        text = re.sub(r'[#*_\[\](){}]', '', text)
        text = re.sub(r'https?://\S+', '', text)
        
        words = text.split()
        return len([w for w in words if w.strip()])

    def extract_code_examples(self, content):
        """Extract and count code examples"""
        code_blocks = re.findall(r'```(\w*)\n(.*?)```', content, re.DOTALL)
        inline_code = re.findall(r'`([^`]+)`', content)
        
        languages = []
        for lang, code in code_blocks:
            if lang:
                languages.append(lang.lower())
            else:
                languages.append('text')
        
        return len(code_blocks) + len(inline_code), languages

    def extract_external_links(self, content):
        """Extract external links"""
        links = re.findall(r'https?://[^\s\)]+', content)
        return [link for link in links if 'github.com' not in link or 'systemcraft' not in link.lower()]

    def count_practice_problems(self, content, filepath):
        """Count practice problems based on content patterns"""
        problems = 0
        
        # Look for numbered lists with problem indicators
        problem_patterns = [
            r'\d+\.\s*(Design|Implement|Build|Create|Write)',
            r'##\s*(Problem|Exercise|Challenge)',
            r'\*\*Problem\s*\d+',
            r'### Question \d+'
        ]
        
        for pattern in problem_patterns:
            problems += len(re.findall(pattern, content, re.IGNORECASE))
        
        return problems

    def calculate_reading_time(self, word_count):
        """Calculate reading time assuming 200 words per minute"""
        return max(1, round(word_count / 200))

    def get_section_from_path(self, filepath):
        """Determine section from file path"""
        parts = filepath.parts
        if len(parts) > 1:
            return parts[1]  # First subdirectory after docs/
        return 'root'

    def analyze_file(self, filepath):
        """Analyze a single markdown file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            return

        frontmatter, content = self.analyze_frontmatter(content)
        
        # Basic metrics
        word_count = self.count_words(content)
        char_count = len(content)
        code_count, languages = self.extract_code_examples(content)
        external_links = self.extract_external_links(content)
        practice_problems = self.count_practice_problems(content, filepath)
        
        # Section classification
        section = self.get_section_from_path(filepath.relative_to(self.docs_dir))
        
        # Update metrics
        self.metrics['total_files'] += 1
        self.metrics['total_words'] += word_count
        self.metrics['total_characters'] += char_count
        
        self.metrics['sections'][section]['files'] += 1
        self.metrics['sections'][section]['words'] += word_count
        self.metrics['sections'][section]['code_examples'] += code_count
        self.metrics['sections'][section]['external_links'] += len(external_links)
        self.metrics['sections'][section]['practice_problems'] += practice_problems
        
        # Code examples
        self.metrics['code_examples']['total'] += code_count
        self.metrics['code_examples']['by_section'][section] += code_count
        for lang in languages:
            self.metrics['code_examples']['by_language'][lang] += 1
        
        # Templates
        if '_templates' in str(filepath) or 'template' in filepath.name.lower():
            self.metrics['templates'].append(str(filepath.relative_to(self.docs_dir)))
            self.metrics['sections'][section]['templates'] += 1
        
        # External resources
        self.metrics['external_resources'].extend(external_links)
        
        # Practice problems by type
        if 'behavioral' in str(filepath).lower():
            self.metrics['practice_problems']['behavioral'] += practice_problems
        elif 'coding' in str(filepath).lower():
            self.metrics['practice_problems']['coding'] += practice_problems
        elif 'system-design' in str(filepath).lower() or 'system_design' in str(filepath).lower():
            self.metrics['practice_problems']['system_design'] += practice_problems
        
        self.metrics['practice_problems']['total'] += practice_problems
        
        # Reading time
        reading_time = self.calculate_reading_time(word_count)
        self.metrics['reading_times'][str(filepath.relative_to(self.docs_dir))] = reading_time
        
        # File type
        self.metrics['file_types'][filepath.suffix] += 1

    def analyze_all_files(self):
        """Analyze all markdown files in the docs directory"""
        for filepath in self.docs_dir.rglob('*.md'):
            self.analyze_file(filepath)
        
        # Calculate totals and percentages
        self.calculate_summary_metrics()

    def calculate_summary_metrics(self):
        """Calculate summary metrics and reading time estimates"""
        # Reading time by section
        section_reading_times = {}
        for section, data in self.metrics['sections'].items():
            section_reading_times[section] = self.calculate_reading_time(data['words'])
        
        self.metrics['reading_time_by_section'] = section_reading_times
        
        # Total reading time
        self.metrics['total_reading_time'] = self.calculate_reading_time(self.metrics['total_words'])
        
        # Content distribution percentages
        total_words = self.metrics['total_words']
        content_distribution = {}
        for section, data in self.metrics['sections'].items():
            content_distribution[section] = {
                'percentage': round((data['words'] / total_words) * 100, 1) if total_words > 0 else 0,
                'words': data['words']
            }
        
        self.metrics['content_distribution'] = content_distribution
        
        # Unique external resources
        self.metrics['unique_external_resources'] = len(set(self.metrics['external_resources']))

    def generate_report(self):
        """Generate a comprehensive metrics report"""
        return {
            'summary': {
                'total_files': self.metrics['total_files'],
                'total_words': self.metrics['total_words'],
                'total_reading_time_minutes': self.metrics['total_reading_time'],
                'total_reading_time_hours': round(self.metrics['total_reading_time'] / 60, 1),
                'average_words_per_file': round(self.metrics['total_words'] / max(1, self.metrics['total_files'])),
                'total_code_examples': self.metrics['code_examples']['total'],
                'total_templates': len(self.metrics['templates']),
                'total_practice_problems': self.metrics['practice_problems']['total'],
                'unique_external_resources': self.metrics['unique_external_resources']
            },
            'content_distribution': self.metrics['content_distribution'],
            'section_details': dict(self.metrics['sections']),
            'reading_times': {
                'by_section': self.metrics['reading_time_by_section'],
                'total': self.metrics['total_reading_time']
            },
            'code_examples': {
                'total': self.metrics['code_examples']['total'],
                'by_language': dict(self.metrics['code_examples']['by_language']),
                'by_section': dict(self.metrics['code_examples']['by_section'])
            },
            'practice_problems': dict(self.metrics['practice_problems']),
            'templates': self.metrics['templates'],
            'preparation_paths': self.calculate_preparation_paths()
        }

    def calculate_preparation_paths(self):
        """Calculate reading time estimates for different preparation paths"""
        paths = {}
        
        # Quick start path (essentials only)
        quick_sections = ['fundamentals', 'getting-started', 'practice']
        quick_time = sum(self.metrics['reading_time_by_section'].get(s, 0) for s in quick_sections)
        
        # L6 path
        l6_sections = ['fundamentals', 'behavioral', 'coding', 'system-design', 'practice']
        l6_time = sum(self.metrics['reading_time_by_section'].get(s, 0) for s in l6_sections)
        
        # L7 path (comprehensive)
        l7_sections = ['fundamentals', 'behavioral', 'coding', 'system-design', 'deep-dives', 'portfolio', 'practice']
        l7_time = sum(self.metrics['reading_time_by_section'].get(s, 0) for s in l7_sections)
        
        # Complete path (everything)
        complete_time = self.metrics['total_reading_time']
        
        return {
            'quick_start': {'minutes': quick_time, 'hours': round(quick_time / 60, 1)},
            'l6_preparation': {'minutes': l6_time, 'hours': round(l6_time / 60, 1)},
            'l7_preparation': {'minutes': l7_time, 'hours': round(l7_time / 60, 1)},
            'complete_study': {'minutes': complete_time, 'hours': round(complete_time / 60, 1)}
        }

def main():
    analyzer = ContentMetricsAnalyzer('/home/deepak/SystemCraft/docs')
    analyzer.analyze_all_files()
    report = analyzer.generate_report()
    
    # Save detailed report
    with open('/home/deepak/SystemCraft/content_metrics_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    # Print summary
    print("=== SYSTEMCRAFT CONTENT METRICS ANALYSIS ===\n")
    
    summary = report['summary']
    print(f"📊 OVERVIEW")
    print(f"Total Files: {summary['total_files']}")
    print(f"Total Words: {summary['total_words']:,}")
    print(f"Total Reading Time: {summary['total_reading_time_hours']} hours ({summary['total_reading_time_minutes']} minutes)")
    print(f"Average Words per File: {summary['average_words_per_file']}")
    print(f"Code Examples: {summary['total_code_examples']}")
    print(f"Templates: {summary['total_templates']}")
    print(f"Practice Problems: {summary['total_practice_problems']}")
    print(f"External Resources: {summary['unique_external_resources']}")
    
    print(f"\n🎯 PREPARATION PATH ESTIMATES")
    paths = report['preparation_paths']
    print(f"Quick Start: {paths['quick_start']['hours']} hours")
    print(f"L6 Preparation: {paths['l6_preparation']['hours']} hours")
    print(f"L7 Preparation: {paths['l7_preparation']['hours']} hours")
    print(f"Complete Study: {paths['complete_study']['hours']} hours")
    
    print(f"\n📚 CONTENT DISTRIBUTION")
    for section, data in sorted(report['content_distribution'].items(), key=lambda x: x[1]['words'], reverse=True):
        if data['words'] > 0:
            print(f"{section}: {data['percentage']}% ({data['words']:,} words)")
    
    print(f"\n💻 CODE EXAMPLES BY LANGUAGE")
    for lang, count in sorted(report['code_examples']['by_language'].items(), key=lambda x: x[1], reverse=True):
        if count > 0:
            print(f"{lang}: {count}")
    
    print(f"\n🏃 PRACTICE PROBLEMS BREAKDOWN")
    problems = report['practice_problems']
    print(f"Behavioral: {problems['behavioral']}")
    print(f"Coding: {problems['coding']}")
    print(f"System Design: {problems['system_design']}")
    print(f"Total: {problems['total']}")

if __name__ == "__main__":
    main()