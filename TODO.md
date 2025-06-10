# To-Do List

## Critical Bugs (Immediate Attention Required)
- [x] **Toast Notifications Still Appearing**: Auto-save toast notifications are still showing in the rich text editor despite implementation to remove them
- [x] **Ctrl+Z Undo Not Working**: Keyboard shortcut Ctrl+Z for undo functionality is not working in the rich text editor

## UI/UX Improvements
- [x] Analyze CV > Paste Job Description edit text area needs to be updated to the correct "Floating Label Textarea"
- [x] **CV Upload UX**: Remove "Type Confirmation Needed" tag for all CV uploads to streamline the upload process
- [ ] **Document Modal Enhancement**: Review Document modal > remove "Document Content" from inside the text edit area
- [ ] **Missing Breadcrumbs**: Add breadcrumbs to pricing scale page
- [ ] **Auto-Open File Dialog**: When a user clicks the "Upload New CV" tab on the CV analysis page, the file upload dialog should auto-open
- [ ] **Auto-Open File Dialog on Tab Switch**: When the "Saved CVs" tab is active in the Analyze Your CV section and a user clicks the "Upload New CV" tab, the file upload dialog should automatically open
- [ ] **Button State Verification**: Ensure "Add to Saved CV's" button disappears after successfully saving uploaded CV to saved CV log

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

## Future Enhancements