#!/usr/bin/env python3
"""
Automatically add YAML front-matter to markdown files based on content analysis.

This script analyzes existing markdown files and adds appropriate front-matter
metadata according to SystemCraft content standards.
"""

import re
import yaml
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

def analyze_file_content(file_path: Path, content: str) -> Dict:
    """Analyze file content to determine appropriate metadata."""
    metadata = {}
    
    # Extract title from first heading
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if title_match:
        title = title_match.group(1).strip()
        # Clean up title (remove emojis and extra formatting)
        title = re.sub(r'[📚🎯🏗️🔧⚡🛡️🎬🚀📊🔍📈✅🎓💡⚠️📋🗓️🔄📝🎉🌐🛠️]', '', title).strip()
        metadata['title'] = title[:60]  # Limit to 60 characters
    
    # Determine content type based on file location and content
    metadata['content_type'] = determine_content_type(file_path, content)
    
    # Determine audience based on content and location
    metadata['audience'] = determine_audience(file_path, content)
    
    # Determine difficulty based on content analysis
    metadata['difficulty'] = determine_difficulty(content)
    
    # Generate summary from content
    metadata['summary'] = generate_summary(content, metadata['content_type'])
    
    # Estimate reading time
    metadata['estimated_time'] = estimate_reading_time(content)
    
    # Generate appropriate tags
    metadata['tags'] = generate_tags(file_path, content, metadata['content_type'])
    
    # Set standard metadata
    metadata['last_updated'] = datetime.now().strftime('%Y-%m-%d')
    metadata['version'] = '1.0'
    metadata['status'] = 'published'
    
    # Add content-type specific metadata
    type_specific = generate_type_specific_metadata(metadata['content_type'], file_path, content)
    metadata.update(type_specific)
    
    return metadata

def determine_content_type(file_path: Path, content: str) -> str:
    """Determine content type based on file path and content."""
    file_name = file_path.name.lower()
    content_lower = content.lower()
    
    # Template files
    if 'template' in file_name or file_path.parent.name == '_templates':
        return 'template'
    
    # Assessment files
    if any(word in file_name for word in ['assessment', 'quiz', 'evaluation', 'readiness']):
        return 'assessment'
    
    # Reference files (quick lookups, checklists, etc.)
    if any(word in file_name for word in ['reference', 'checklist', 'quick']):
        return 'reference'
    
    # Tutorial indicators
    tutorial_indicators = ['tutorial', 'hands-on', 'step-by-step', 'implementation']
    if any(indicator in content_lower for indicator in tutorial_indicators):
        return 'tutorial'
    
    # Guide indicators (comprehensive, step-by-step learning)
    guide_indicators = ['complete guide', 'comprehensive', 'step-by-step', 'getting started']
    if any(indicator in content_lower for indicator in guide_indicators):
        return 'guide'
    
    # Deep dive content
    if 'deep' in file_name or file_path.parent.name == 'deep-dives':
        return 'deep_dive'
    
    # Index files are typically overviews
    if file_name == 'index.md':
        return 'overview'
    
    # Default to guide for most content
    return 'guide'

def determine_audience(file_path: Path, content: str) -> List[str]:
    """Determine target audience based on content and location."""
    content_lower = content.lower()
    
    # Check for explicit L6/L7 mentions
    has_l6 = 'l6' in content_lower or 'senior engineering manager' in content_lower
    has_l7 = 'l7' in content_lower or 'principal engineering manager' in content_lower
    
    if has_l6 and has_l7:
        return ['L6', 'L7']
    elif has_l7:
        return ['L7']
    elif has_l6:
        return ['L6']
    
    # Determine by content complexity
    advanced_indicators = [
        'platform', 'organization', 'strategic', 'vision', 'transformation',
        'industry', 'innovation', 'billion', 'petabyte', 'executive'
    ]
    
    if any(indicator in content_lower for indicator in advanced_indicators):
        return ['L7']
    
    # Default to both levels
    return ['L6', 'L7']

def determine_difficulty(content: str) -> str:
    """Determine difficulty level based on content analysis."""
    content_lower = content.lower()
    
    # Expert level indicators
    expert_indicators = [
        'expert', 'advanced', 'complex', 'sophisticated', 'cutting-edge',
        'breakthrough', 'innovation', 'research', 'novel'
    ]
    
    # Beginner level indicators
    beginner_indicators = [
        'getting started', 'introduction', 'basics', 'fundamentals',
        'beginner', 'simple', 'easy', 'basic'
    ]
    
    # Advanced level indicators
    advanced_indicators = [
        'advanced', 'complex', 'sophisticated', 'deep dive',
        'expert', 'mastery', 'comprehensive'
    ]
    
    if any(indicator in content_lower for indicator in expert_indicators):
        return 'expert'
    elif any(indicator in content_lower for indicator in beginner_indicators):
        return 'beginner'
    elif any(indicator in content_lower for indicator in advanced_indicators):
        return 'advanced'
    
    # Default to intermediate
    return 'intermediate'

def generate_summary(content: str, content_type: str) -> str:
    """Generate a concise summary based on content analysis."""
    # Try to find existing summary-like content
    lines = content.split('\n')
    
    # Look for description in admonitions or intro paragraphs
    for i, line in enumerate(lines[:20]):  # Check first 20 lines
        line = line.strip()
        if line.startswith('!!! ') and 'info' in line:
            # Check next few lines for content
            for j in range(i+1, min(i+5, len(lines))):
                desc_line = lines[j].strip()
                if desc_line and not desc_line.startswith('!'):
                    return desc_line[:150] + ('...' if len(desc_line) > 150 else '')
        
        # Look for descriptive paragraphs after heading
        if line and not line.startswith('#') and not line.startswith('!') and len(line) > 50:
            return line[:150] + ('...' if len(line) > 150 else '')
    
    # Generate default summary based on content type
    type_summaries = {
        'guide': 'Comprehensive guide covering essential concepts and practical implementation',
        'tutorial': 'Hands-on tutorial with step-by-step implementation instructions',
        'reference': 'Quick reference guide with essential information and lookup tables',
        'assessment': 'Assessment tool to evaluate knowledge and identify improvement areas',
        'template': 'Reusable template for consistent content creation',
        'overview': 'Overview of key concepts and their practical applications',
        'deep_dive': 'In-depth exploration of advanced concepts and techniques',
        'checklist': 'Practical checklist for validation and quality assurance'
    }
    
    return type_summaries.get(content_type, 'Essential information for interview preparation')

def estimate_reading_time(content: str) -> str:
    """Estimate reading time based on content length."""
    # Average reading speed: 200 words per minute
    word_count = len(content.split())
    reading_minutes = max(1, word_count // 200)
    
    if reading_minutes < 5:
        return f"{reading_minutes * 5} min"  # Round to 5-minute increments for short content
    elif reading_minutes < 15:
        return f"{reading_minutes} min"
    elif reading_minutes < 60:
        return f"{(reading_minutes // 5) * 5} min"  # Round to 5-minute increments
    else:
        hours = reading_minutes // 60
        mins = reading_minutes % 60
        if mins > 0:
            return f"{hours}h {mins}m"
        else:
            return f"{hours}h"

def generate_tags(file_path: Path, content: str, content_type: str) -> List[str]:
    """Generate appropriate tags based on file analysis."""
    tags = []
    content_lower = content.lower()
    
    # Primary category tags based on directory
    dir_mapping = {
        'system-design': 'system-design',
        'coding': 'coding',
        'behavioral': 'behavioral',
        'fundamentals': 'fundamentals',
        'practice': 'practice',
        'deep-dives': 'deep-dive',
        'portfolio': 'portfolio',
        'interactive': 'assessment'
    }
    
    parent_dir = file_path.parent.name
    if parent_dir in dir_mapping:
        tags.append(dir_mapping[parent_dir])
    
    # Skill-based tags
    skill_mapping = {
        'leadership': ['leadership', 'team', 'management', 'people'],
        'scalability': ['scale', 'scalability', 'performance', 'optimization'],
        'aws': ['aws', 'amazon web services', 'cloud'],
        'algorithms': ['algorithm', 'coding', 'programming', 'data structure'],
        'communication': ['communication', 'presentation', 'influence'],
        'decision-making': ['decision', 'trade-off', 'choice'],
        'technical-strategy': ['strategy', 'vision', 'architecture', 'platform']
    }
    
    for tag, keywords in skill_mapping.items():
        if any(keyword in content_lower for keyword in keywords):
            tags.append(tag)
    
    # Level tags
    if 'l6' in content_lower or 'senior engineering manager' in content_lower:
        tags.append('L6')
    if 'l7' in content_lower or 'principal engineering manager' in content_lower:
        tags.append('L7')
    
    # Format tags based on content type
    format_mapping = {
        'assessment': 'assessment',
        'template': 'template',
        'reference': 'reference',
        'tutorial': 'hands-on'
    }
    
    if content_type in format_mapping:
        tags.append(format_mapping[content_type])
    
    # Ensure we have 2-6 tags
    if len(tags) < 2:
        # Add default tags based on content type
        default_tags = ['interview-prep', 'amazon']
        for tag in default_tags:
            if tag not in tags:
                tags.append(tag)
                if len(tags) >= 2:
                    break
    
    return tags[:6]  # Limit to 6 tags

def generate_type_specific_metadata(content_type: str, file_path: Path, content: str) -> Dict:
    """Generate content-type specific metadata."""
    metadata = {}
    
    if content_type == 'guide':
        metadata['guide_type'] = 'preparation'  # Default
        metadata['deliverables'] = ['knowledge mastery', 'practical understanding']
        metadata['success_criteria'] = ['can explain concepts clearly', 'ready for interview questions']
    
    elif content_type == 'tutorial':
        metadata['tutorial_type'] = 'hands_on'
        metadata['skills_taught'] = ['practical implementation', 'technical proficiency']
        metadata['validation_method'] = 'self_check'
    
    elif content_type == 'reference':
        metadata['reference_type'] = 'patterns'
        metadata['lookup_optimized'] = True
        metadata['comprehensive_coverage'] = True
    
    elif content_type == 'assessment':
        metadata['assessment_type'] = 'readiness_check'
        metadata['scoring_method'] = 'points'
        metadata['feedback_type'] = 'detailed_report'
    
    # Add common extended metadata
    metadata['prerequisites'] = []
    metadata['learning_objectives'] = [
        'Understand core concepts',
        'Apply knowledge in interview contexts',
        'Demonstrate competency at appropriate level'
    ]
    metadata['related_content'] = []
    
    # Content management metadata
    metadata['contributors'] = ['systemcraft']
    metadata['review_date'] = (datetime.now().replace(month=datetime.now().month + 1)).strftime('%Y-%m-%d')
    metadata['content_owner'] = 'systemcraft'
    metadata['technical_depth'] = 'component'
    metadata['interview_focus'] = 'technical'
    
    return metadata

def add_frontmatter_to_file(file_path: Path, metadata: Dict) -> bool:
    """Add YAML front-matter to a markdown file."""
    try:
        # Read existing content
        content = file_path.read_text(encoding='utf-8')
        
        # Check if front-matter already exists
        if content.startswith('---\n'):
            print(f"⏭️  Skipping {file_path} (already has front-matter)")
            return True
        
        # Generate YAML front-matter
        yaml_content = yaml.dump(metadata, default_flow_style=False, sort_keys=False, width=80)
        
        # Combine front-matter with existing content
        new_content = f"---\n{yaml_content}---\n\n{content}"
        
        # Write back to file
        file_path.write_text(new_content, encoding='utf-8')
        
        print(f"✅ Added front-matter to {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {str(e)}")
        return False

def should_exclude_file(file_path: Path) -> bool:
    """Check if file should be excluded from front-matter addition."""
    excluded_files = {
        'README.md',
        'CONTENT_STANDARDS.md',
        'ENHANCEMENT_SUMMARY.md',
        'CONTENT_IMPROVEMENT_PLAN.md'
    }
    
    return file_path.name in excluded_files

def main():
    """Add front-matter to all markdown files in docs directory."""
    docs_dir = Path('docs')
    if not docs_dir.exists():
        print("ERROR: docs directory not found")
        return
    
    print("📝 Adding YAML front-matter to markdown files...")
    print()
    
    files_processed = 0
    files_updated = 0
    files_skipped = 0
    files_error = 0
    
    for md_file in docs_dir.rglob('*.md'):
        if should_exclude_file(md_file):
            print(f"⏭️  Excluding {md_file}")
            files_skipped += 1
            continue
        
        files_processed += 1
        
        try:
            # Read and analyze content
            content = md_file.read_text(encoding='utf-8')
            
            # Skip if already has front-matter
            if content.startswith('---\n'):
                print(f"⏭️  {md_file} (already has front-matter)")
                files_skipped += 1
                continue
            
            # Generate metadata
            metadata = analyze_file_content(md_file, content)
            
            # Add front-matter
            if add_frontmatter_to_file(md_file, metadata):
                files_updated += 1
            else:
                files_error += 1
                
        except Exception as e:
            print(f"❌ Error processing {md_file}: {str(e)}")
            files_error += 1
    
    # Summary
    print()
    print("=" * 60)
    print(f"📊 Front-matter Addition Summary:")
    print(f"   Files processed: {files_processed}")
    print(f"   Files updated: {files_updated}")
    print(f"   Files skipped: {files_skipped}")
    print(f"   Files with errors: {files_error}")
    
    if files_updated > 0:
        print()
        print("🎯 Next Steps:")
        print("1. Review generated front-matter for accuracy")
        print("2. Run validate-frontmatter.py to check compliance")
        print("3. Manually adjust metadata as needed")
        print("4. Update any generated summaries or tags")
        print()
        print("📝 Note: Generated metadata is a starting point.")
        print("   Please review and refine as needed for accuracy.")

if __name__ == '__main__':
    main()