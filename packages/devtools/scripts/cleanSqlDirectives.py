#!/usr/bin/env python3

"""
Clean SQL Directive Comments
Removes all directive comments from SQL view files
"""

import os
import re
import glob

def clean_sql_file(file_path):
    """Clean directive comments from a single SQL file"""
    print(f"  🔄 Processing {file_path}")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    cleaned_lines = []
    changes_made = False
    
    # Directive patterns to look for
    directive_patterns = [
        'PK;', 'sys;', 'type:', 'entity:', 'widget:', 'req;', 'grp:', 
        'width:', 'label:', 'tableHide', 'formHide', 'parentKey', 
        'valField', 'dispField', 'multiLine', 'searchable'
    ]
    
    for line in lines:
        # Check if line contains a directive comment
        if ' -- ' in line:
            comment_part = line.split(' -- ', 1)[1] if ' -- ' in line else ''
            
            # Check if comment contains directive patterns
            has_directives = any(pattern in comment_part for pattern in directive_patterns)
            
            if has_directives:
                # Remove the directive comment
                cleaned_line = line.split(' -- ')[0]
                cleaned_lines.append(cleaned_line)
                changes_made = True
                print(f"    🧹 Removed directive: {comment_part[:50]}...")
            else:
                # Keep regular comments
                cleaned_lines.append(line)
        else:
            # Keep lines without comments
            cleaned_lines.append(line)
    
    if changes_made:
        # Write cleaned content back to file
        with open(file_path, 'w') as f:
            f.write('\n'.join(cleaned_lines))
        print(f"    ✅ Cleaned directives from {file_path}")
        return True
    else:
        print(f"    ℹ️  No directive comments found in {file_path}")
        return False

def main():
    """Main cleanup function"""
    print("🧹 Cleaning directive comments from SQL views...")
    
    # Find all SQL files in views directories
    sql_files = glob.glob('sql/views/**/*.sql', recursive=True)
    
    total_files = 0
    cleaned_files = 0
    
    for sql_file in sql_files:
        total_files += 1
        if clean_sql_file(sql_file):
            cleaned_files += 1
    
    print(f"\n✅ SQL view cleanup complete!")
    print(f"📊 Processed {total_files} files, cleaned {cleaned_files} files")

if __name__ == '__main__':
    main()
