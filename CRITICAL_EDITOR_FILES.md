# 🚨 CRITICAL EDITOR FILES - DO NOT MODIFY WITHOUT EXPLICIT USER REQUEST

## Files Protected by this Alert System:

### Core Editor Components
- `src/components/ui/rich-text-editor.tsx` - Main rich text editor component
- `src/components/cover-letter/EditableCoverLetter.tsx` - Cover letter editor
- `src/hooks/useJsonFirstEditor.ts` - JSON-first editor hook
- `src/utils/documentJsonUtils.ts` - Document JSON utilities
- `src/utils/jsonHtmlConverters.ts` - JSON/HTML conversion utilities
- `src/utils/editorDataConverter.ts` - Editor data conversion utilities

### Loading and Saving Functions
- Any function containing "load", "save", "convert", "parse" in editor-related files
- Content initialization and persistence logic
- JSON/HTML conversion functions

## ⚠️ WARNING PROTOCOL

**BEFORE making ANY changes to these files:**

1. **STOP** and alert the user with: "🚨 CRITICAL EDITOR FILE MODIFICATION ALERT"
2. **ASK** explicit permission: "I need to modify [filename] which is a protected editor file. This could potentially break text loading/saving. Do you want me to proceed?"
3. **WAIT** for explicit user confirmation before proceeding
4. **BACKUP** the current state by describing what will change

## Current Issues to Track:
- Text displaying as raw HTML instead of formatted content
- Save/load cycle corruption
- JSON/HTML conversion problems

## Last Known Working State:
- Date: [To be updated when working]
- Description: [To be updated when confirmed working]