#!/bin/bash

# Fix Relative Paths - Convert remaining relative paths to absolute paths
# This script completes the cross-reference fixes started during reorganization

set -e

DOCS_DIR="/home/deepak/SystemCraft/docs"

echo "=== Fixing Remaining Relative Path References ==="
echo "Started: $(date)"
echo ""

# Color codes for output  
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FIXED_COUNT=0

log_fix() {
    echo -e "${GREEN}FIXED:${NC} $1"
    ((FIXED_COUNT++))
}

log_processing() {
    echo -e "${YELLOW}PROCESSING:${NC} $1"
}

# Function to fix relative paths in a file
fix_file_paths() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    log_processing "$(basename "$file")"
    
    # Use sed to replace relative paths with absolute paths
    sed -E 's|\]\(\.\./([^)]+)\)|(/ \1)|g' "$file" > "$temp_file"
    
    # Check if any changes were made
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        log_fix "$(basename "$file")"
    else
        rm "$temp_file"
    fi
}

# Priority files to fix (from content map analysis)
echo "Fixing high-priority files with many cross-references..."
echo ""

# High Priority Files
HIGH_PRIORITY_FILES=(
    "$DOCS_DIR/practice/6-week-plan.md"
    "$DOCS_DIR/practice/weekly-plan.md"
    "$DOCS_DIR/practice/index.md"
    "$DOCS_DIR/practice/competency-checkpoints.md"
    "$DOCS_DIR/behavioral/index.md"
    "$DOCS_DIR/behavioral/decision-making.md"
    "$DOCS_DIR/practice/progress-tracking-system.md"
    "$DOCS_DIR/practice/diagnostic-gap-analysis.md"
    "$DOCS_DIR/interview-process/written-assessment-guide.md"
)

for file in "${HIGH_PRIORITY_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        fix_file_paths "$file"
    fi
done

echo ""
echo "Fixing navigation links in section index files..."
echo ""

# Navigation Links (Medium Priority)
NAV_FILES=(
    "$DOCS_DIR/foundational-mindset/index.md"
    "$DOCS_DIR/2025-considerations/index.md"
    "$DOCS_DIR/red-flags-success/index.md"
    "$DOCS_DIR/story-engineering/index.md"
    "$DOCS_DIR/interview-mechanics/index.md"
    "$DOCS_DIR/level-playbooks/index.md"
    "$DOCS_DIR/experiences/index.md"
    "$DOCS_DIR/study-plans/index.md"
)

for file in "${NAV_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        fix_file_paths "$file"
    fi
done

echo ""
echo "Processing remaining files..."
echo ""

# Process all remaining markdown files
while IFS= read -r -d '' file; do
    # Skip already processed files and templates
    if [[ "$file" =~ content-templates ]] || [[ "$file" =~ scripts ]]; then
        continue
    fi
    
    # Check if file contains relative paths
    if grep -q '\]\(\.\.' "$file"; then
        fix_file_paths "$file"
    fi
done < <(find "$DOCS_DIR" -name "*.md" -print0)

echo ""
echo "=== SUMMARY ==="
echo "Files processed with relative path fixes: $FIXED_COUNT"
echo "Cross-reference conversion complete: $(date)"

# Run validation to check our work
if [[ -x "$DOCS_DIR/../scripts/validate-content.sh" ]]; then
    echo ""
    echo "Running validation to verify fixes..."
    "$DOCS_DIR/../scripts/validate-content.sh" | grep -E "(INFO|SUCCESS|ERROR)"
fi

echo ""
echo "✅ Relative path fixes complete!"
echo "All cross-references should now use absolute paths for better maintainability."