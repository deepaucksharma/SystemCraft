#!/bin/bash

# SystemCraft Content Validation Framework
# Automated content quality assurance and link validation

set -e

DOCS_DIR="/home/deepak/SystemCraft/docs"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/validation-$(date +%Y%m%d-%H%M).log"

echo "=== SystemCraft Content Validation Framework ===" | tee "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_FILES=0
ISSUES_FOUND=0
LINKS_CHECKED=0
BROKEN_LINKS=0

log_info() {
    echo -e "${BLUE}INFO:${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}ERROR:${NC} $1" | tee -a "$LOG_FILE"
    ((ISSUES_FOUND++))
}

log_success() {
    echo -e "${GREEN}SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

# Function 1: Validate file naming conventions
validate_naming_conventions() {
    log_info "Validating file naming conventions..."
    
    while IFS= read -r -d '' file; do
        ((TOTAL_FILES++))
        basename=$(basename "$file")
        
        # Check for uppercase letters (except allowed files)
        if [[ "$basename" =~ [A-Z] ]] && [[ "$basename" != "SECURITY.md" ]] && [[ "$basename" != "README.md" ]]; then
            log_error "Uppercase in filename: $file"
        fi
        
        # Check for underscores (should use hyphens)
        if [[ "$basename" =~ _ ]]; then
            log_error "Underscore in filename (use hyphens): $file"
        fi
        
        # Check for spaces
        if [[ "$basename" =~ \  ]]; then
            log_error "Space in filename: $file"
        fi
        
    done < <(find "$DOCS_DIR" -name "*.md" -print0)
}

# Function 2: Validate internal links
validate_internal_links() {
    log_info "Validating internal links..."
    
    while IFS= read -r -d '' file; do
        # Extract all markdown links
        grep -n '\[.*\](.*\.md)' "$file" | while read -r line; do
            ((LINKS_CHECKED++))
            line_num=$(echo "$line" | cut -d: -f1)
            link_text=$(echo "$line" | sed 's/.*\[.*\](\([^)]*\)).*/\1/')
            
            # Skip external links
            if [[ "$link_text" =~ ^https?:// ]]; then
                continue
            fi
            
            # Convert relative paths to absolute paths for checking
            if [[ "$link_text" =~ ^\.\. ]]; then
                log_warning "Relative path found in $file:$line_num - $link_text"
                # Convert to absolute path for validation
                dir_path=$(dirname "$file")
                abs_path=$(realpath -m "$dir_path/$link_text")
            elif [[ "$link_text" =~ ^/ ]]; then
                abs_path="$DOCS_DIR$link_text"
            else
                # Same directory link
                dir_path=$(dirname "$file")
                abs_path="$dir_path/$link_text"
            fi
            
            # Check if target file exists
            if [[ ! -f "$abs_path" ]]; then
                log_error "Broken link in $file:$line_num -> $link_text (target: $abs_path)"
                ((BROKEN_LINKS++))
            fi
        done
    done < <(find "$DOCS_DIR" -name "*.md" -print0)
}

# Function 3: Validate template compliance
validate_template_compliance() {
    log_info "Validating template compliance..."
    
    while IFS= read -r -d '' file; do
        # Skip template files themselves
        if [[ "$file" =~ content-templates ]]; then
            continue
        fi
        
        # Check for required elements in content files
        if ! grep -q "^# " "$file"; then
            log_error "Missing main heading: $file"
        fi
        
        # Check for placeholder text in published content
        if grep -qi "TODO\|PLACEHOLDER\|FIXME\|Coming soon" "$file"; then
            log_warning "Placeholder content found: $file"
        fi
        
        # Check index files have proper navigation
        if [[ $(basename "$file") == "index.md" ]]; then
            if ! grep -q "\[.*\](" "$file"; then
                log_warning "Index file lacks navigation links: $file"
            fi
        fi
        
    done < <(find "$DOCS_DIR" -name "*.md" -not -path "*/content-templates/*" -print0)
}

# Function 4: Check for duplicate content
check_duplicate_content() {
    log_info "Checking for duplicate content patterns..."
    
    # Look for files with very similar titles
    find "$DOCS_DIR" -name "*.md" -exec basename {} \; | sort | uniq -d | while read -r duplicate; do
        if [[ -n "$duplicate" ]]; then
            log_warning "Potential duplicate filename pattern: $duplicate"
            find "$DOCS_DIR" -name "$duplicate" -exec echo "  Found: {}" \;
        fi
    done
}

# Function 5: Validate content structure
validate_content_structure() {
    log_info "Validating content structure and organization..."
    
    # Check that major sections have index files
    for section in behavioral coding system-design practice fundamentals; do
        if [[ ! -f "$DOCS_DIR/$section/index.md" ]]; then
            log_error "Missing index file for section: $section"
        fi
    done
    
    # Check for orphaned files (files not linked from anywhere)
    log_info "Checking for orphaned files..."
    
    while IFS= read -r -d '' file; do
        filename=$(basename "$file")
        relative_path=${file#$DOCS_DIR/}
        
        # Skip index files and special files
        if [[ "$filename" == "index.md" ]] || [[ "$relative_path" == "getting-started.md" ]] || [[ "$relative_path" == "content-map.md" ]]; then
            continue
        fi
        
        # Check if file is referenced anywhere
        if ! grep -r -q "$filename\|$relative_path" "$DOCS_DIR" --exclude-dir=.git 2>/dev/null; then
            log_warning "Potential orphaned file (not linked): $relative_path"
        fi
    done < <(find "$DOCS_DIR" -name "*.md" -print0)
}

# Function 6: Performance and SEO checks
validate_performance_seo() {
    log_info "Validating performance and SEO factors..."
    
    while IFS= read -r -d '' file; do
        # Check file size (warn if > 100KB)
        file_size=$(stat -c%s "$file")
        if ((file_size > 102400)); then
            log_warning "Large file size ($(($file_size/1024))KB): $file"
        fi
        
        # Check for extremely long lines that might affect readability
        if grep -q '.\{200,\}' "$file"; then
            log_warning "Very long lines found: $file"
        fi
        
    done < <(find "$DOCS_DIR" -name "*.md" -print0)
}

# Function 7: Generate content statistics
generate_statistics() {
    log_info "Generating content statistics..."
    
    total_md_files=$(find "$DOCS_DIR" -name "*.md" | wc -l)
    total_directories=$(find "$DOCS_DIR" -type d | wc -l)
    total_size=$(du -sh "$DOCS_DIR" | cut -f1)
    
    echo "" | tee -a "$LOG_FILE"
    echo "=== CONTENT STATISTICS ===" | tee -a "$LOG_FILE"
    echo "Total markdown files: $total_md_files" | tee -a "$LOG_FILE"
    echo "Total directories: $total_directories" | tee -a "$LOG_FILE"
    echo "Total documentation size: $total_size" | tee -a "$LOG_FILE"
    echo "Files processed: $TOTAL_FILES" | tee -a "$LOG_FILE"
    echo "Links checked: $LINKS_CHECKED" | tee -a "$LOG_FILE"
    echo "Broken links found: $BROKEN_LINKS" | tee -a "$LOG_FILE"
    echo "Total issues found: $ISSUES_FOUND" | tee -a "$LOG_FILE"
}

# Main execution
main() {
    log_info "Starting comprehensive content validation..."
    
    validate_naming_conventions
    validate_internal_links
    validate_template_compliance
    check_duplicate_content
    validate_content_structure
    validate_performance_seo
    generate_statistics
    
    echo "" | tee -a "$LOG_FILE"
    echo "=== VALIDATION SUMMARY ===" | tee -a "$LOG_FILE"
    
    if ((ISSUES_FOUND == 0)); then
        log_success "All validations passed! Content is well-organized and error-free."
    else
        log_error "Found $ISSUES_FOUND issues that need attention."
        echo "" | tee -a "$LOG_FILE"
        echo "Please review the issues above and fix them to maintain content quality." | tee -a "$LOG_FILE"
        echo "For help with fixes, see: /content-governance-standards.md" | tee -a "$LOG_FILE"
    fi
    
    echo "" | tee -a "$LOG_FILE"
    echo "Validation complete: $(date)" | tee -a "$LOG_FILE"
    echo "Full log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
    
    # Return appropriate exit code
    if ((ISSUES_FOUND > 0)); then
        exit 1
    fi
}

# Run main function
main "$@"