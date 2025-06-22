# To-Do List

## ✅ PHASE 1 COMPLETE: Critical Issues Resolution
All critical blocking issues have been successfully resolved:

- [x] **CV Content Loading Fixed**: Migrated CVContentEditModal to ControlledRichTextEditor with error boundaries
- [x] **DOCX Upload Fixed**: Implemented dynamic mammoth import to resolve module loading errors
- [x] **Cover Letter Editor Fixed**: Updated EditableCoverLetter to use new JSON-first architecture
- [x] **Editor Migration Complete**: All components now use ControlledRichTextEditor with proper data handling
- [x] **Error Boundaries Added**: Robust error handling for editor components with fallback content
- [x] **Loading States Enhanced**: BounceLoader component for all document actions

## Critical Bugs (Previously Completed)
- [x] **Toast Notifications Still Appearing**: Auto-save toast notifications are still showing in the rich text editor despite implementation to remove them
- [x] **Ctrl+Z Undo Not Working**: Keyboard shortcut Ctrl+Z for undo functionality is not working in the rich text editor

## UI/UX Improvements - COMPLETED ✅
- [x] Analyze CV > Paste Job Description edit text area needs to be updated to the correct "Floating Label Textarea"
- [x] **CV Upload UX**: Remove "Type Confirmation Needed" tag for all CV uploads to streamline the upload process
- [x] **Document Modal Enhancement**: Review Document modal > remove "Document Content" from inside the text edit area
- [x] **Missing Breadcrumbs**: Add breadcrumbs to pricing scale page
- [x] **Auto-Open File Dialog**: When a user clicks the "Upload New CV" tab on the CV analysis page, the file upload dialog should auto-open
- [x] **Auto-Open File Dialog on Tab Switch**: When the "Saved CVs" tab is active in the Analyze Your CV section and a user clicks the "Upload New CV" tab, the file upload dialog should automatically open
- [x] **Button State Verification**: Ensure "Add to Saved CV's" button disappears after successfully saving uploaded CV to saved CV log

## Next Sprint

## Backlog

## Phase 3 (Major Features - Requires Planning)

- [ ] **Add "Edit with AI" Toggle Button**: 
  - Add toggle button to main menu (default: on)
  - When toggled 'on': AI Context menu appears on text selection
  - When toggled 'off': AI Context menu is hidden
  - Add tooltip: "Allows AI interface to improve content"
  - Requires state management and conditional rendering logic

- [ ] **Fix AI Context Menu Positioning**: 
  - Position menu slightly BELOW highlighted text (currently covering text)
  - Ensure menu doesn't collision with selected text
  - Make text remain editable when menu is visible
  - Test across different screen sizes and text positions

- [ ] **AI Context Menu in Cover Letter Editor**: 
  - Make AI context menu visible in Generate Cover Letter > View Letter
  - Apply "Edit with AI" toggle to cover letter editing
  - Ensure consistent behavior across all rich text editors
  - Test integration with cover letter save functionality

- [ ] **Fix Tooltips Site-wide**: Review entire site and implement proper tooltip behavior
  - Default hidden state until hover trigger (300ms delay)
  - Non-interactive popup with contextual information
  - Auto-dismiss when cursor leaves trigger area
  - Proper positioning (above/below/beside based on space)
  - Keyboard accessibility (Tab focus support)
  - Screen reader support via aria-label/aria-describedby

- [ ] **Fix Dropdown Menus Site-wide**: Review entire site and "Dropdown Menu" in design system 
  - Closed by default until user interaction (click/keyboard)
  - Opens adjacent to trigger with proper positioning logic
  - Single open instance (auto-close others)
  - Dismisses on outside click and Escape key
  - Full keyboard navigation (arrow keys, Enter, Esc)
  - Proper z-index and background (non-transparent)
  - Selectable options that trigger actions/selections

## Adobe PDF Processing
- [x] Fix Adobe ZIP extraction sequence (Download → Save ZIP → Unzip → Save Text)
- [x] Add ZIP content validation before extraction attempts  
- [x] Implement proper error handling for each processing step
- [x] Create storage bucket for debug files with proper permissions
- [x] Clean up and recreate adobe-debug-files storage bucket with proper RLS policies
- [x] Update file extension detection logic (.json/.zip/.txt based on Adobe response)
- [x] Implement DDMMYY-HHMMSS Original Filename User_ID naming convention
- [x] Apply non-blocking storage operations to prevent extraction failures

## Design System Improvements
- [x] **Floating Label Textarea**: Fix label alignment - "Floating Label" text should be aligned to top of edit area (not center) when not focused
- [x] **Floating Label Textarea**: When user clicks into edit area and label floats to top, it should reduce in text size (smaller than the non-floating state)
- [x] **Floating Label Input**: When user clicks into edit area and label floats to top, it should reduce in text size (smaller than the non-floating state)
- [x] **Design System Consistency**: Replicate these floating label improvements throughout the entire site wherever these components are used
- [x] **Replace UnifiedInput with FloatingLabelInput globally**: Migrated all UnifiedInput/UnifiedTextarea usage to FloatingLabelInput/FloatingLabelTextarea and removed unified-input component

## User Management Enhancements
- [x] **6-Digit Sequential User ID System**: Replace current 8-character alphanumeric user_id with 6-digit sequential system (000001, 000002, etc.) with alan@januscollab.com assigned 000000

## JSON File Formatting Implementation ✅
- [x] **JSON Formatting Rules**: Implemented formatting rules (bold only, H1-H3, single font, "-" bullets)
- [x] **File Processing Enhancement**: Updated text cleaning to enforce JSON formatting standards
- [x] **Bidirectional Sync**: Added 100% consistency between JSON and text versions
- [x] **Document Structure Validation**: Added well-structured document detection
- [x] **TXT → JSON Conversion**: Enhanced TXT file processing with structured JSON creation
- [x] **Adobe PDF Integration**: Updated to align with new formatting standards
- [x] **Document Verification Modal**: Enhanced with new sync functionality

## File Management Improvements
- [x] **File Upload Error Handling**: Implemented retry mechanism (max 2 attempts) with enhanced error messages and user guidance
- [x] **BounceLoader Integration**: Added loading states for save operations with duration-based display (>1 second)
- [x] **Smart "Add to Saved CVs" Button**: Hide button when CV is already saved or after successful save operation
- [x] **Saved CV List Scrolling**: Limited default view to 3 CVs with scroll capability for additional items
- [x] Update the naming convention for files stored after upload by user to {user_id} {filename (including file extension)} {timestamp (in ddmmyy-hhmmss format)}

## Edge Function Updates
- [x] **Adobe PDF Extract**: Updated to use new standardized file naming convention
- [x] **File Storage Services**: Integrated new naming utility across all file operations

## Code Cleanup
- [x] **UnifiedInput Component Removal**: Deleted unified-input.tsx component after completing migration
- [x] **Import Dependencies**: Updated all component imports to use FloatingLabelInput/FloatingLabelTextarea

## PDF Text Formatting Enhancement ✅
- [x] **Text Formatter Module**: Created dedicated formatting module with post-processing capabilities
- [x] **Adobe PDF Extract Integration**: Added formatting step after text extraction without modifying core extraction logic
- [x] **Adobe Background Process Integration**: Applied same formatting to background processing
- [x] **Storage Enhancement**: Save both raw and formatted text versions for backward compatibility
- [x] **Separation of Concerns**: Maintained procedural integrity by keeping formatting separate from extraction

## High Priority UX Issues ✅
- [x] **Fix "Storage failed" Error Message**: CVs are uploading successfully but showing false "Storage failed" error messages in the UI - fix error handling to prevent false negatives
- [x] **Fix CV Auto-Save Issue**: CVs uploaded are automatically saving to the saved CV section. The user must explicitly request a save or upload the CV via their profile page > CV management
- [x] **"Add to Saved CVs" Button State Management**: When a user uploads a CV they get presented an "Add to Saved CVs" button. If the user chooses to click and add this active CV to their saved CVs, then the "Add to Saved CVs" button should disappear
- [x] **Hide "Add to Saved CVs" for Selected CVs**: If a user chooses a CV from their saved CVs to perform the analysis, then the "Add to Saved CVs" button should disappear/be hidden from the user

## Current Critical Issues - COMPLETED ✅
- [x] **DOCX Upload Failure**: DOCX files failing with "Failed to fetch dynamically imported module" error for mammoth library - PDF uploads work fine
- [x] **Saved CVs Editor Loading Issue**: When selecting saved CVs (TXT or DOCX), they are not loading into the rich text editor
- [x] **Cover Letter Editor Empty**: Rich text editor in "Generate Cover Letter" > "View Cover Letter" is showing empty

## UI/UX Improvements - COMPLETED ✅
- [x] **"Add to Saved CVs" Button Disappear**: On Analyze CV page, when user uploads CV and clicks "Add to Saved CVs", button should immediately disappear
- [x] **Bounce Loader for Document Actions**: Show "Bounce Loader" when clicking "Remove" or "Review and edit" buttons while information loads
- [x] **Enhanced CV Upload Progress Modal**: Update to "Standard Progress" "Small" with humorous messages like "CV gremlins at work" - after 30 seconds show patience message with cancel CTA
- [x] **Enhanced Cover Letter Progress Modal**: Update cover letter generation/regeneration to "Standard Progress" "Small" with humorous messages and 30-second patience prompt

## Technical Infrastructure - COMPLETED ✅
- [x] **Complete Editor Architecture Migration**: Migrated DocumentVerificationModal from RichTextEditor to ControlledRichTextEditor
- [x] **Enhanced Error Boundaries**: Implemented EnhancedEditorErrorBoundary with retry mechanisms and content restoration
- [x] **Data Type Standardization**: Created robust conversion utilities for seamless string/JSON data handling
- [x] **Button State Management**: Implemented useButtonState hook for consistent loading/success states across components
- [x] **Legacy Component Cleanup**: Removed old RichTextEditor dependencies and standardized on new architecture
- [x] **Editor Content Loading Fixed**: Fixed CV and Cover Letter editors failing to load content properly - now uses robust content initialization
- [x] **Profile Page UI Cleanup**: Removed double headers/labels in Personal Info and Password Change tabs for cleaner UX
- [x] **Content Converter Utilities**: Created text-to-HTML conversion system for proper editor initialization

## Future Enhancements