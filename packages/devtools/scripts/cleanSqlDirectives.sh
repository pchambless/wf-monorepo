#!/bin/bash

# Clean SQL Directive Comments
# Removes all directive comments from SQL view files

echo "🧹 Cleaning directive comments from SQL views..."

# Find all SQL files in views directories
find sql/views -name "*.sql" -type f | while read -r file; do
    echo "  🔄 Processing $file"
    
    # Create a temporary file for the cleaned version
    temp_file="${file}.tmp"
    
    # Process the file line by line to remove directive comments
    while IFS= read -r line; do
        # Check if line contains directive patterns and remove them
        if [[ "$line" =~ -- .*[PK\;|sys\;|type:|entity:|widget:|req\;|grp:|width:|label:|tableHide|formHide|parentKey|valField|dispField|multiLine|searchable] ]]; then
            # Remove everything from " -- " onwards if it contains directive patterns
            cleaned_line=$(echo "$line" | sed 's/ -- .*$//')
            echo "$cleaned_line" >> "$temp_file"
        else
            # Keep the line as-is
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace original file if changes were made
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        echo "    ✅ Cleaned directives from $file"
    else
        rm "$temp_file"
        echo "    ℹ️  No directive comments found in $file"
    fi
done

echo "✅ SQL view cleanup complete!"
