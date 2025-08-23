#!/usr/bin/env python3
"""
Validate content standards compliance for SystemCraft markdown files.

This script checks content quality, structure, and adherence to editorial guidelines
as defined in CONTENT_STANDARDS.md.
"""

import re
import yaml
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple
import markdown
from bs4 import BeautifulSoup

def extract_frontmatter_and_content(file_path: Path) -> Tuple[Dict, str]:
    """Extract YAML front-matter and content from markdown file."""
    try:
        content = file_path.read_text(encoding='utf-8')
        
        if not content.startswith('---\n'):
            return {}, content
            
        parts = content.split('---\n', 2)
        if len(parts) < 3:
            return {}, content
            
        frontmatter = yaml.safe_load(parts[1])
        main_content = parts[2]
        
        return frontmatter, main_content
        
    except Exception as e:
        return {}, ""

def validate_content_structure(frontmatter: Dict, content: str, file_path: Path) -> List[str]:
    """Validate content follows proper structure for its type."""
    errors = []
    content_type = frontmatter.get('content_type', 'unknown')
    
    # Check for required sections based on content type
    structure_requirements = {
        'guide': {
            'required_sections': ['overview', 'learning', 'prerequisites', 'main content', 'summary', 'next steps'],
            'suggested_headings': ['what you\'ll master', 'learning outcomes', 'prerequisites', 'key takeaways']
        },
        'tutorial': {
            'required_sections': ['what you\'ll build', 'getting started', 'implementation', 'testing', 'next steps'],
            'suggested_headings': ['tutorial overview', 'environment setup', 'core implementation']
        },
        'reference': {
            'required_sections': ['quick reference', 'core concepts', 'patterns', 'examples'],
            'suggested_headings': ['tl;dr', 'quick reference', 'essential information']
        },
        'assessment': {
            'required_sections': ['overview', 'instructions', 'questions', 'scoring', 'results'],
            'suggested_headings': ['assessment overview', 'scoring guide', 'results analysis']
        }
    }
    
    if content_type in structure_requirements:
        requirements = structure_requirements[content_type]
        content_lower = content.lower()
        
        # Check for suggested headings
        found_headings = 0
        for heading in requirements['suggested_headings']:
            if heading in content_lower:
                found_headings += 1
        
        if found_headings < len(requirements['suggested_headings']) // 2:
            errors.append(f"Content may be missing recommended structure for {content_type}")
    
    return errors

def validate_writing_quality(content: str, file_path: Path) -> List[str]:
    """Validate writing quality and style guidelines."""
    errors = []
    
    # Check for common writing issues
    lines = content.split('\n')
    
    for i, line in enumerate(lines, 1):
        line_lower = line.lower().strip()
        
        # Check for passive voice (basic detection)
        passive_indicators = ['is being', 'was being', 'will be', 'has been', 'have been']
        if any(indicator in line_lower for indicator in passive_indicators):
            if i < 20:  # Only check first 20 lines to avoid false positives
                errors.append(f"Line {i}: Consider using active voice instead of passive")
        
        # Check for weak phrases
        weak_phrases = ['it should be noted', 'it is important to note', 'please note', 'obviously', 'clearly']
        for phrase in weak_phrases:
            if phrase in line_lower:
                errors.append(f"Line {i}: Avoid weak phrase '{phrase}'")
        
        # Check for overly complex sentences
        if len(line.split()) > 30:
            errors.append(f"Line {i}: Consider breaking down long sentence for readability")
    
    # Check for consistent terminology
    terminology_checks = {
        'L6': ['l6', 'level 6', 'level-6'],
        'L7': ['l7', 'level 7', 'level-7'],
        'Amazon': ['amazon.com', 'AMZN'],
        'API': ['api', 'Api'],
        'AWS': ['aws', 'Aws']
    }
    
    for correct_term, variations in terminology_checks.items():
        content_lines = content.split('\n')
        for i, line in enumerate(content_lines, 1):
            for variation in variations:
                if variation in line and correct_term not in line:
                    errors.append(f"Line {i}: Use consistent terminology '{correct_term}' instead of '{variation}'")
    
    return errors

def validate_technical_accuracy(frontmatter: Dict, content: str, file_path: Path) -> List[str]:
    """Validate technical content for accuracy and completeness."""
    errors = []
    
    # Check for outdated information
    outdated_patterns = [
        r'python\s+[12]\.',  # Python 2.x references
        r'node\s+[0-9]\.',   # Very old Node.js versions
        r'java\s+[1-7]\.',   # Old Java versions
        r'aws\s+cli\s+v1',  # AWS CLI v1
    ]
    
    for pattern in outdated_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            errors.append(f"Potentially outdated technical reference: {pattern}")
    
    # Check for proper code examples
    code_blocks = re.findall(r'```(\w+)?\n(.*?)```', content, re.DOTALL)
    for i, (language, code) in enumerate(code_blocks):
        if language:
            # Check for common code issues
            if language.lower() == 'python':
                if 'print ' in code and 'print(' not in code:
                    errors.append(f"Code block {i+1}: Use Python 3 print() function")
            
            if language.lower() in ['bash', 'sh']:
                if '#!/bin/bash' not in code and code.count('\n') > 3:
                    errors.append(f"Code block {i+1}: Consider adding shebang for multi-line scripts")
    
    # Check for AWS service accuracy
    aws_services = {
        'ec2': 'Amazon EC2',
        's3': 'Amazon S3',
        'rds': 'Amazon RDS',
        'lambda': 'AWS Lambda',
        'dynamodb': 'Amazon DynamoDB',
        'cloudfront': 'Amazon CloudFront'
    }
    
    content_lower = content.lower()
    for service_key, proper_name in aws_services.items():
        # Check for inconsistent service naming
        if service_key in content_lower and proper_name not in content:
            # This might be acceptable, so make it a warning
            pass
    
    return errors

def validate_accessibility(content: str, file_path: Path) -> List[str]:
    """Validate content for accessibility and inclusion."""
    errors = []
    
    # Check for descriptive link text
    links = re.findall(r'\[([^\]]*)\]\([^)]+\)', content)
    for link_text in links:
        generic_texts = {'here', 'click here', 'link', 'this', 'read more'}
        if link_text.lower().strip() in generic_texts:
            errors.append(f"Non-descriptive link text: '{link_text}'")
    
    # Check for alt text on images
    images = re.findall(r'!\[([^\]]*)\]\([^)]+\)', content)
    for alt_text in images:
        if not alt_text.strip():
            errors.append("Image missing alt text for accessibility")
    
    # Check for inclusive language
    potentially_exclusive = [
        'guys', 'whitelist', 'blacklist', 'master/slave', 'sanity check',
        'dummy', 'crazy', 'insane'
    ]
    
    content_lower = content.lower()
    for term in potentially_exclusive:
        if term in content_lower:
            suggestions = {
                'guys': 'everyone/folks/team',
                'whitelist': 'allowlist',
                'blacklist': 'blocklist',
                'master/slave': 'primary/replica',
                'sanity check': 'validation/verification',
                'dummy': 'placeholder/sample',
                'crazy': 'unexpected/unusual',
                'insane': 'extreme/significant'
            }
            suggestion = suggestions.get(term, 'more inclusive alternative')
            errors.append(f"Consider replacing '{term}' with {suggestion}")
    
    return errors

def validate_amazon_context(frontmatter: Dict, content: str, file_path: Path) -> List[str]:
    """Validate Amazon-specific context and accuracy."""
    errors = []
    
    # Check for Amazon Leadership Principles accuracy
    leadership_principles = {
        'customer obsession', 'ownership', 'invent and simplify', 'are right a lot',
        'learn and be curious', 'hire and develop the best', 'insist on the highest standards',
        'think big', 'bias for action', 'frugality', 'earn trust', 'dive deep',
        'have backbone disagree and commit', 'deliver results', 'strive to be earth\'s best employer',
        'success and scale bring broad responsibility'
    }
    
    content_lower = content.lower()
    
    # Check for incorrect principle names
    incorrect_principles = [
        'customer first', 'take ownership', 'be curious', 'hire the best',
        'high standards', 'disagree and commit', 'get results'
    ]
    
    for incorrect in incorrect_principles:
        if incorrect in content_lower:
            errors.append(f"Potentially incorrect Leadership Principle reference: '{incorrect}'")
    
    # Check for appropriate scale references
    audience = frontmatter.get('audience', [])
    if 'L7' in audience:
        # L7 content should mention large scale
        scale_indicators = ['billion', 'petabyte', 'organization', 'platform', 'industry']
        if not any(indicator in content_lower for indicator in scale_indicators):
            errors.append("L7 content should include organizational/platform scale examples")
    
    # Check for interview context
    if 'interview' in str(file_path).lower():
        interview_elements = ['star', 'behavioral', 'technical', 'system design']
        found_elements = sum(1 for element in interview_elements if element in content_lower)
        if found_elements == 0:
            errors.append("Interview content should reference relevant interview elements")
    
    return errors

def validate_metadata_consistency(frontmatter: Dict, content: str, file_path: Path) -> List[str]:
    """Validate that metadata is consistent with content."""
    errors = []
    
    # Check title consistency
    title = frontmatter.get('title', '')
    first_heading = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if first_heading:
        content_title = first_heading.group(1).strip()
        # Remove emojis for comparison
        content_title_clean = re.sub(r'[📚🎯🏗️🔧⚡🛡️🎬🚀📊🔍📈✅🎓💡⚠️📋🗓️🔄📝🎉🌐🛠️]', '', content_title).strip()
        if title.lower() != content_title_clean.lower():
            errors.append(f"Title mismatch: metadata='{title}' vs content='{content_title_clean}'")
    
    # Check estimated time vs content length
    estimated_time = frontmatter.get('estimated_time', '')
    word_count = len(content.split())
    
    if estimated_time:
        # Extract minutes from time estimate
        time_match = re.search(r'(\d+)', estimated_time)
        if time_match:
            estimated_minutes = int(time_match.group(1))
            # Rough calculation: 200 words per minute
            actual_minutes = word_count // 200
            
            if abs(estimated_minutes - actual_minutes) > max(5, estimated_minutes * 0.5):
                errors.append(f"Time estimate may be inaccurate: {estimated_time} for {word_count} words")
    
    # Check difficulty vs content complexity
    difficulty = frontmatter.get('difficulty', '')
    if difficulty:
        complex_indicators = ['advanced', 'expert', 'sophisticated', 'complex', 'cutting-edge']
        simple_indicators = ['basic', 'simple', 'introduction', 'getting started', 'beginner']
        
        content_lower = content.lower()
        has_complex = any(indicator in content_lower for indicator in complex_indicators)
        has_simple = any(indicator in content_lower for indicator in simple_indicators)
        
        if difficulty in ['beginner', 'intermediate'] and has_complex and not has_simple:
            errors.append(f"Difficulty '{difficulty}' may not match complex content")
        elif difficulty in ['advanced', 'expert'] and has_simple and not has_complex:
            errors.append(f"Difficulty '{difficulty}' may not match simple content")
    
    return errors

def validate_content_file(file_path: Path) -> List[str]:
    """Validate a single content file against all standards."""
    all_errors = []
    
    # Extract front-matter and content
    frontmatter, content = extract_frontmatter_and_content(file_path)
    
    if not frontmatter:
        all_errors.append("Missing YAML front-matter")
        return all_errors
    
    # Run all validation checks
    all_errors.extend(validate_content_structure(frontmatter, content, file_path))
    all_errors.extend(validate_writing_quality(content, file_path))
    all_errors.extend(validate_technical_accuracy(frontmatter, content, file_path))
    all_errors.extend(validate_accessibility(content, file_path))
    all_errors.extend(validate_amazon_context(frontmatter, content, file_path))
    all_errors.extend(validate_metadata_consistency(frontmatter, content, file_path))
    
    return all_errors

def should_exclude_file(file_path: Path) -> bool:
    """Check if file should be excluded from content validation."""
    excluded_patterns = [
        'README.md',
        'CONTENT_STANDARDS.md',
        'ENHANCEMENT_SUMMARY.md',
        'CONTENT_IMPROVEMENT_PLAN.md',
        '_templates/',  # Templates are examples
        '_includes/'    # Include files are fragments
    ]
    
    return any(pattern in str(file_path) for pattern in excluded_patterns)

def main():
    """Validate all markdown files for content standards compliance."""
    docs_dir = Path('docs')
    if not docs_dir.exists():
        print("ERROR: docs directory not found")
        sys.exit(1)
    
    print("📋 Validating content standards compliance...")
    print()
    
    all_errors = []
    files_checked = 0
    files_with_errors = 0
    
    for md_file in docs_dir.rglob('*.md'):
        # Skip excluded files
        if should_exclude_file(md_file):
            continue
            
        files_checked += 1
        errors = validate_content_file(md_file)
        
        if errors:
            files_with_errors += 1
            print(f"❌ {md_file}")
            for error in errors:
                print(f"   • {error}")
            print()
            all_errors.extend([f"{md_file}: {error}" for error in errors])
        else:
            print(f"✅ {md_file}")
    
    # Summary
    print()
    print("=" * 60)
    print(f"📊 Content Validation Summary:")
    print(f"   Files checked: {files_checked}")
    print(f"   Files with issues: {files_with_errors}")
    print(f"   Files passing: {files_checked - files_with_errors}")
    print(f"   Total issues: {len(all_errors)}")
    
    if all_errors:
        print()
        print("🎯 Content Quality Recommendations:")
        print("1. Review and fix writing quality issues")
        print("2. Ensure technical accuracy and current information")
        print("3. Improve accessibility with descriptive links and alt text")
        print("4. Verify Amazon-specific context and terminology")
        print("5. Align metadata with actual content")
        print("6. Refer to CONTENT_STANDARDS.md for detailed guidelines")
        
        # Don't fail the build for content quality issues, just warn
        print()
        print("⚠️  Content quality issues found but not blocking build.")
        print("   Please address these issues to improve content quality.")
    else:
        print()
        print("🎉 All content validation passed!")
        print("   Content meets SystemCraft quality standards")

if __name__ == '__main__':
    main()