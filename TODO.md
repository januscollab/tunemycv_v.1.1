# To-Do List

## UI/UX Improvements
- [ ] Analyze CV > Paste Job Description edit text area needs to be updated to the correct "Floating Label Textarea"

## Adobe PDF Processing
- [x] Fix Adobe ZIP extraction sequence (Download → Save ZIP → Unzip → Save Text)
- [x] Add ZIP content validation before extraction attempts  
- [x] Implement proper error handling for each processing step
- [x] Create storage bucket for debug files with proper permissions
- [x] Clean up and recreate adobe-debug-files storage bucket with proper RLS policies
- [x] Update file extension detection logic (.json/.zip/.txt based on Adobe response)
- [x] Implement DDMMYY-HHMMSS Original Filename User_ID naming convention
- [x] Apply non-blocking storage operations to prevent extraction failures

## Future Enhancements
- [ ] Add more comprehensive PDF validation
- [ ] Implement retry logic for failed Adobe API calls
- [ ] Add user-facing progress indicators for long-running extractions