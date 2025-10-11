---
description: "Generate session accomplishments and next steps summary"
allowed-tools: []
---

# Session Summary Generator

Generate a comprehensive session summary with accomplishments, statistics, next steps, and key learnings.

## Instructions

Create a detailed markdown summary of the current session including:

1. **Session Header** - Topic and date
2. **✅ Accomplishments** - What was built/fixed/improved
3. **📊 Statistics** - Numbers (files created, functions added, bugs fixed)
4. **🚀 Next Steps** - Prioritized list of what to do next
5. **💡 Key Learnings** - Important concepts, decisions, patterns discovered
6. **📝 Code Snippets** (optional) - Reference patterns for future use

## Output Format

**IMPORTANT:** Output markdown text ONLY. Do NOT use the Write tool to create a file.

User will copy/paste this into their own session document.

## Structure Template

```markdown
# [Session Topic] - [Date YYYY-MM-DD]

**Focus:** [One-line summary]

---

## ✅ Major Accomplishments

### 1. [Category]
- Bullet points of what was done
- Be specific with file paths and function names

### 2. [Category]
...

---

## 📊 Statistics

- Files created: X
- Files modified: Y
- Functions added: Z
- Bugs fixed: N

---

## 🚀 Next Steps

### Immediate (Next Session)
1. [Task with clear action]
2. [Task with clear action]

### Short Term
3. [Task]
4. [Task]

### Future
5. [Enhancement idea]

---

## 💡 Key Learnings

### [Concept/Pattern Name]
- What we learned
- Why it matters
- How to apply it

---

## 📝 Code Snippets (Optional)

```javascript
// Useful pattern discovered
```

---

**Status:** [Current state - ready for next steps, needs testing, etc.]
```

## Token Efficiency

This command saves tokens by:
- Not writing files (user copies/pastes)
- Allowing user to name the file
- Reusing existing session context
