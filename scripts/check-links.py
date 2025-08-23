#!/usr/bin/env python3
"""
Validate internal links in markdown files according to SystemCraft content standards.

This script checks that all internal links point to existing files and follow
the established linking conventions.
"""

import re
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple
from urllib.parse import urlparse, unquote

def extract_markdown_links(content: str) -> List[Tuple[str, str]]:
    """Extract all markdown links from content."""
    # Match markdown link syntax: [text](url)
    link_pattern = r'\[([^\]]*)\]\(([^)]+)\)'
    links = re.findall(link_pattern, content)
    
    # Also match reference-style links: [text][ref]
    ref_pattern = r'\[([^\]]*)\]\[([^\]]+)\]'
    ref_links = re.findall(ref_pattern, content)
    
    # Extract reference definitions: [ref]: url
    ref_def_pattern = r'^\[([^\]]+)\]:\s*(.+)$'
    ref_definitions = {}
    for line in content.split('\n'):
        match = re.match(ref_def_pattern, line.strip())
        if match:
            ref_definitions[match.group(1)] = match.group(2)
    
    # Resolve reference-style links
    all_links = links.copy()
    for text, ref in ref_links:
        if ref in ref_definitions:
            all_links.append((text, ref_definitions[ref]))
    
    return all_links

def is_internal_link(url: str) -> bool:
    """Check if a URL is an internal link."""
    # Parse URL to check if it's internal
    parsed = urlparse(url)
    
    # External links (have scheme)
    if parsed.scheme in ['http', 'https', 'ftp']:
        return False
    
    # Email links
    if parsed.scheme == 'mailto':
        return False
    
    # Fragment-only links (anchors on same page)
    if url.startswith('#'):
        return False
    
    # Everything else is considered internal
    return True

def resolve_relative_path(current_file: Path, link_url: str) -> Path:
    """Resolve relative path from current file to linked file."""
    # Remove fragment (anchor) from URL
    url_without_fragment = link_url.split('#')[0]
    
    # URL decode the path
    decoded_url = unquote(url_without_fragment)
    
    # Handle different path types
    if decoded_url.startswith('/'):
        # Absolute path from docs root
        return Path('docs') / decoded_url.lstrip('/')
    else:
        # Relative path from current file
        return (current_file.parent / decoded_url).resolve()

def validate_internal_links(file_path: Path) -> List[str]:
    """Validate all internal links in a markdown file."""
    errors = []
    
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        return [f"Error reading file: {str(e)}"]
    
    # Extract all links
    links = extract_markdown_links(content)
    
    for link_text, link_url in links:
        # Skip external links
        if not is_internal_link(link_url):
            continue
        
        # Skip anchor-only links (same page)
        if link_url.startswith('#'):
            continue
        
        try:
            # Resolve the target path
            target_path = resolve_relative_path(file_path, link_url)
            
            # Check if target exists
            if not target_path.exists():
                errors.append(f"Broken link: [{link_text}]({link_url}) -> {target_path}")
                continue
            
            # Check link conventions
            link_errors = validate_link_conventions(link_text, link_url, file_path, target_path)
            errors.extend(link_errors)
            
        except Exception as e:
            errors.append(f"Error processing link [{link_text}]({link_url}): {str(e)}")
    
    return errors

def validate_link_conventions(link_text: str, link_url: str, source_file: Path, target_path: Path) -> List[str]:
    """Validate that links follow SystemCraft conventions."""
    errors = []
    
    # Check for descriptive link text
    generic_texts = {'here', 'click here', 'link', 'this', 'read more', 'more info'}
    if link_text.lower().strip() in generic_texts:
        errors.append(f"Non-descriptive link text: [{link_text}]({link_url})")
    
    # Check for proper relative paths
    if link_url.startswith('./') or link_url.startswith('../'):
        # This is good - explicit relative path
        pass
    elif '/' in link_url and not link_url.startswith('/'):
        # Check if it's a proper relative path
        levels_up = len([part for part in source_file.parent.parts if part != 'docs'])
        if levels_up > 0 and not link_url.startswith('../'):
            # Might need ../ for proper relative path
            if target_path.exists():
                # Path works but might not be conventional
                pass
            else:
                errors.append(f"Potentially incorrect relative path: [{link_text}]({link_url})")
    
    # Check file extension consistency
    if target_path.suffix == '.md' and not link_url.endswith('.md'):
        errors.append(f"Missing .md extension: [{link_text}]({link_url})")
    
    # Check for links to index files
    if target_path.name == 'index.md' and link_url.endswith('index.md'):
        # Suggest linking to directory instead
        suggested_url = link_url.replace('/index.md', '/')
        if suggested_url != link_url:
            errors.append(f"Consider linking to directory: [{link_text}]({suggested_url}) instead of [{link_text}]({link_url})")
    
    return errors

def find_orphaned_files(docs_dir: Path) -> List[Path]:
    """Find markdown files that are not linked from anywhere."""
    all_md_files = set(docs_dir.rglob('*.md'))
    linked_files = set()
    
    # Exclude certain files from orphan check
    excluded_from_orphan_check = {
        'README.md',
        'CONTENT_STANDARDS.md',
        'ENHANCEMENT_SUMMARY.md',
        'CONTENT_IMPROVEMENT_PLAN.md'
    }
    
    for md_file in all_md_files:
        if md_file.name in excluded_from_orphan_check:
            continue
            
        try:
            content = md_file.read_text(encoding='utf-8')
            links = extract_markdown_links(content)
            
            for _, link_url in links:
                if is_internal_link(link_url) and not link_url.startswith('#'):
                    try:
                        target_path = resolve_relative_path(md_file, link_url)
                        if target_path.exists() and target_path.suffix == '.md':
                            linked_files.add(target_path)
                    except:
                        pass  # Skip problematic links for orphan detection
        except:
            pass  # Skip files we can't read
    
    # Also check mkdocs.yml for navigation links
    mkdocs_file = Path('mkdocs.yml')
    if mkdocs_file.exists():
        try:
            mkdocs_content = mkdocs_file.read_text(encoding='utf-8')
            # Simple extraction of .md files from nav section
            md_references = re.findall(r'(\w+[\w/-]*\.md)', mkdocs_content)
            for ref in md_references:
                nav_file = Path('docs') / ref
                if nav_file.exists():
                    linked_files.add(nav_file.resolve())
        except:
            pass
    
    # Find orphaned files
    orphaned = []
    for md_file in all_md_files:
        if md_file.name in excluded_from_orphan_check:
            continue
        if md_file.resolve() not in linked_files:
            orphaned.append(md_file)
    
    return orphaned

def check_navigation_consistency(docs_dir: Path) -> List[str]:
    """Check that navigation in mkdocs.yml is consistent with actual files."""
    errors = []
    mkdocs_file = Path('mkdocs.yml')
    
    if not mkdocs_file.exists():
        return ["mkdocs.yml not found"]
    
    try:
        mkdocs_content = mkdocs_file.read_text(encoding='utf-8')
        
        # Extract file references from navigation
        md_references = re.findall(r'(\w+[\w/-]*\.md)', mkdocs_content)
        
        for ref in md_references:
            nav_file = docs_dir / ref
            if not nav_file.exists():
                errors.append(f"Navigation references non-existent file: {ref}")
    
    except Exception as e:
        errors.append(f"Error reading mkdocs.yml: {str(e)}")
    
    return errors

def main():
    """Validate all internal links in docs directory."""
    docs_dir = Path('docs')
    if not docs_dir.exists():
        print("ERROR: docs directory not found")
        sys.exit(1)
    
    print("🔗 Validating internal links in markdown files...")
    print()
    
    all_errors = []
    files_checked = 0
    files_with_errors = 0
    
    # Check individual file links
    for md_file in docs_dir.rglob('*.md'):
        files_checked += 1
        errors = validate_internal_links(md_file)
        
        if errors:
            files_with_errors += 1
            print(f"❌ {md_file}")
            for error in errors:
                print(f"   • {error}")
            print()
            all_errors.extend(errors)
        else:
            print(f"✅ {md_file}")
    
    # Check for orphaned files
    print()
    print("🔍 Checking for orphaned files...")
    orphaned_files = find_orphaned_files(docs_dir)
    if orphaned_files:
        print("⚠️  Orphaned files (not linked from anywhere):")
        for orphan in orphaned_files:
            print(f"   • {orphan}")
            all_errors.append(f"Orphaned file: {orphan}")
        print()
    else:
        print("✅ No orphaned files found")
    
    # Check navigation consistency
    print()
    print("📑 Checking navigation consistency...")
    nav_errors = check_navigation_consistency(docs_dir)
    if nav_errors:
        print("❌ Navigation issues:")
        for error in nav_errors:
            print(f"   • {error}")
        all_errors.extend(nav_errors)
        print()
    else:
        print("✅ Navigation is consistent")
    
    # Summary
    print()
    print("=" * 60)
    print(f"📊 Link Validation Summary:")
    print(f"   Files checked: {files_checked}")
    print(f"   Files with link errors: {files_with_errors}")
    print(f"   Orphaned files: {len(orphaned_files)}")
    print(f"   Navigation errors: {len(nav_errors)}")
    print(f"   Total issues: {len(all_errors)}")
    
    if all_errors:
        print()
        print("🎯 Next Steps:")
        print("1. Fix broken internal links")
        print("2. Update link text to be more descriptive")
        print("3. Consider linking orphaned files from relevant content")
        print("4. Update navigation in mkdocs.yml if needed")
        print("5. Run validation again to verify fixes")
        sys.exit(1)
    else:
        print()
        print("🎉 All link validation passed!")
        print("   All internal links are working correctly")

if __name__ == '__main__':
    main()