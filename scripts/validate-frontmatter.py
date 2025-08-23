#!/usr/bin/env python3
"""
Validate YAML front-matter in markdown files according to SystemCraft content standards.

This script ensures all markdown files have complete and valid YAML front-matter
metadata as defined in CONTENT_STANDARDS.md.
"""

import yaml
import sys
import re
from pathlib import Path
from typing import Dict, List, Set, Optional
from datetime import datetime

# Required fields for all content types
REQUIRED_FIELDS = {
    'title', 'summary', 'content_type', 'audience', 
    'difficulty', 'estimated_time', 'tags', 'last_updated', 'version', 'status'
}

# Valid values for enumerated fields
VALID_CONTENT_TYPES = {
    'guide', 'tutorial', 'reference', 'assessment', 
    'template', 'overview', 'deep_dive', 'checklist'
}

VALID_AUDIENCES = {'L6', 'L7'}
VALID_DIFFICULTIES = {'beginner', 'intermediate', 'advanced', 'expert'}
VALID_STATUSES = {'published', 'draft', 'archived', 'review_needed'}

# Content type specific required fields
CONTENT_TYPE_REQUIREMENTS = {
    'guide': {'guide_type', 'deliverables', 'success_criteria'},
    'tutorial': {'tutorial_type', 'skills_taught', 'validation_method'},
    'reference': {'reference_type', 'lookup_optimized', 'comprehensive_coverage'},
    'assessment': {'assessment_type', 'scoring_method', 'feedback_type'},
}

# Valid tag categories
PRIMARY_TAGS = {
    'system-design', 'coding', 'behavioral', 'fundamentals', 
    'practice', 'deep-dive', 'assessment', 'portfolio'
}

SKILL_TAGS = {
    'leadership', 'technical-strategy', 'scalability', 'aws', 
    'algorithms', 'communication', 'decision-making', 'team-building'
}

LEVEL_TAGS = {'L6', 'L7'}

FORMAT_TAGS = {
    'interactive', 'checklist', 'template', 'case-study', 
    'framework', 'reference'
}

def extract_frontmatter(file_path: Path) -> Optional[Dict]:
    """Extract YAML front-matter from markdown file."""
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Check for front-matter existence
        if not content.startswith('---\n'):
            return None
            
        # Extract front-matter
        parts = content.split('---\n', 2)
        if len(parts) < 3:
            return None
            
        return yaml.safe_load(parts[1])
        
    except Exception as e:
        print(f"Error reading {file_path}: {str(e)}")
        return None

def validate_required_fields(frontmatter: Dict, file_path: Path) -> List[str]:
    """Validate that all required fields are present."""
    errors = []
    
    missing_fields = REQUIRED_FIELDS - set(frontmatter.keys())
    if missing_fields:
        errors.append(f"Missing required fields: {missing_fields}")
    
    # Check content type specific requirements
    content_type = frontmatter.get('content_type')
    if content_type in CONTENT_TYPE_REQUIREMENTS:
        required_for_type = CONTENT_TYPE_REQUIREMENTS[content_type]
        missing_type_fields = required_for_type - set(frontmatter.keys())
        if missing_type_fields:
            errors.append(f"Missing {content_type}-specific fields: {missing_type_fields}")
    
    return errors

def validate_field_values(frontmatter: Dict, file_path: Path) -> List[str]:
    """Validate the values of front-matter fields."""
    errors = []
    
    # Validate content_type
    content_type = frontmatter.get('content_type')
    if content_type and content_type not in VALID_CONTENT_TYPES:
        errors.append(f"Invalid content_type: {content_type}. Must be one of {VALID_CONTENT_TYPES}")
    
    # Validate audience
    audience = frontmatter.get('audience')
    if audience:
        if not isinstance(audience, list):
            errors.append("Audience must be a list")
        else:
            invalid_audiences = set(audience) - VALID_AUDIENCES
            if invalid_audiences:
                errors.append(f"Invalid audience values: {invalid_audiences}")
    
    # Validate difficulty
    difficulty = frontmatter.get('difficulty')
    if difficulty and difficulty not in VALID_DIFFICULTIES:
        errors.append(f"Invalid difficulty: {difficulty}. Must be one of {VALID_DIFFICULTIES}")
    
    # Validate status
    status = frontmatter.get('status')
    if status and status not in VALID_STATUSES:
        errors.append(f"Invalid status: {status}. Must be one of {VALID_STATUSES}")
    
    # Validate tags
    tags = frontmatter.get('tags')
    if tags:
        if not isinstance(tags, list):
            errors.append("Tags must be a list")
        elif len(tags) < 2:
            errors.append("Must have at least 2 tags")
        elif len(tags) > 6:
            errors.append("Must have no more than 6 tags")
    
    # Validate title length
    title = frontmatter.get('title')
    if title and len(title) > 60:
        errors.append(f"Title too long ({len(title)} chars). Maximum 60 characters.")
    
    # Validate summary is one sentence
    summary = frontmatter.get('summary')
    if summary:
        sentence_count = len([s for s in summary.split('.') if s.strip()])
        if sentence_count > 1:
            errors.append("Summary should be one clear sentence")
    
    # Validate date format
    last_updated = frontmatter.get('last_updated')
    if last_updated:
        try:
            datetime.strptime(str(last_updated), '%Y-%m-%d')
        except ValueError:
            errors.append("last_updated must be in YYYY-MM-DD format")
    
    # Validate version format
    version = frontmatter.get('version')
    if version and not re.match(r'^\d+\.\d+$', str(version)):
        errors.append("Version must be in format X.Y (e.g., '1.0')")
    
    return errors

def validate_tag_taxonomy(frontmatter: Dict, file_path: Path) -> List[str]:
    """Validate tags follow the established taxonomy."""
    errors = []
    tags = frontmatter.get('tags', [])
    
    if not tags:
        return errors
    
    # Check for at least one primary category tag
    primary_tags_present = set(tags) & PRIMARY_TAGS
    if not primary_tags_present:
        errors.append(f"Must include at least one primary category tag: {PRIMARY_TAGS}")
    
    # Check for level tags if audience is specified
    audience = frontmatter.get('audience', [])
    level_tags_present = set(tags) & LEVEL_TAGS
    if audience and not level_tags_present:
        errors.append("Should include level tags (L6, L7) when audience is specified")
    
    # Validate all tags are recognized
    all_valid_tags = PRIMARY_TAGS | SKILL_TAGS | LEVEL_TAGS | FORMAT_TAGS
    invalid_tags = set(tags) - all_valid_tags
    if invalid_tags:
        errors.append(f"Unrecognized tags: {invalid_tags}")
    
    return errors

def validate_content_consistency(frontmatter: Dict, file_path: Path) -> List[str]:
    """Validate consistency between metadata and file location/name."""
    errors = []
    
    # Check if file is in appropriate directory
    content_type = frontmatter.get('content_type')
    file_dir = file_path.parent.name
    
    # Directory mapping expectations
    directory_mappings = {
        'guide': ['fundamentals', 'system-design', 'coding', 'behavioral', 'practice'],
        'tutorial': ['coding', 'system-design', 'interactive'],
        'reference': ['_templates', 'fundamentals', 'system-design'],
        'assessment': ['practice', 'interactive'],
        'template': ['_templates'],
    }
    
    if content_type in directory_mappings:
        expected_dirs = directory_mappings[content_type]
        if file_dir not in expected_dirs and file_dir != 'docs':  # docs is root
            errors.append(f"Content type '{content_type}' should be in one of: {expected_dirs}")
    
    # Check file naming convention
    file_name = file_path.stem
    if content_type == 'template' and not file_name.endswith('-template'):
        errors.append("Template files should end with '-template'")
    
    if content_type == 'assessment' and 'assessment' not in file_name:
        errors.append("Assessment files should include 'assessment' in the name")
    
    return errors

def validate_frontmatter(file_path: Path) -> List[str]:
    """Validate YAML front-matter in a markdown file."""
    errors = []
    
    # Extract front-matter
    frontmatter = extract_frontmatter(file_path)
    if frontmatter is None:
        errors.append("Missing or invalid YAML front-matter")
        return errors
    
    # Run all validation checks
    errors.extend(validate_required_fields(frontmatter, file_path))
    errors.extend(validate_field_values(frontmatter, file_path))
    errors.extend(validate_tag_taxonomy(frontmatter, file_path))
    errors.extend(validate_content_consistency(frontmatter, file_path))
    
    return errors

def check_excluded_files(file_path: Path) -> bool:
    """Check if file should be excluded from validation."""
    excluded_patterns = [
        'README.md',
        'CONTENT_STANDARDS.md',
        'ENHANCEMENT_SUMMARY.md',
        'CONTENT_IMPROVEMENT_PLAN.md',
        'index.md'  # Index files may have different requirements
    ]
    
    return any(pattern in str(file_path) for pattern in excluded_patterns)

def main():
    """Validate all markdown files in docs directory."""
    docs_dir = Path('docs')
    if not docs_dir.exists():
        print("ERROR: docs directory not found")
        sys.exit(1)
    
    all_errors = []
    files_checked = 0
    files_with_errors = 0
    
    print("🔍 Validating YAML front-matter in markdown files...")
    print()
    
    for md_file in docs_dir.rglob('*.md'):
        # Skip excluded files
        if check_excluded_files(md_file):
            continue
            
        files_checked += 1
        errors = validate_frontmatter(md_file)
        
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
    print(f"📊 Validation Summary:")
    print(f"   Files checked: {files_checked}")
    print(f"   Files with errors: {files_with_errors}")
    print(f"   Files passing: {files_checked - files_with_errors}")
    print(f"   Total errors: {len(all_errors)}")
    
    if all_errors:
        print()
        print("🎯 Next Steps:")
        print("1. Add missing YAML front-matter to files without it")
        print("2. Fix validation errors listed above")
        print("3. Run validation again to verify fixes")
        print("4. Refer to CONTENT_STANDARDS.md for detailed requirements")
        sys.exit(1)
    else:
        print()
        print("🎉 All front-matter validation passed!")
        print("   All markdown files meet SystemCraft content standards")

if __name__ == '__main__':
    main()