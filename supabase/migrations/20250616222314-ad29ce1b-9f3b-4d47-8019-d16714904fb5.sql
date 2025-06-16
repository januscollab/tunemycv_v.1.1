-- Add AI story generation function for DevSuite
CREATE OR REPLACE FUNCTION enhance_task_story(
  task_title TEXT,
  existing_description TEXT DEFAULT '',
  context_info TEXT DEFAULT 'General'
) RETURNS TEXT AS $$
BEGIN
  -- Simple story structure enhancement without AI
  -- This is a fallback function when AI is not available
  
  IF task_title IS NULL OR task_title = '' THEN
    RETURN 'Please provide a task title first.';
  END IF;
  
  -- Basic story template
  RETURN FORMAT(
    'As a user working on %s, I want to implement the following:

Title: %s

Context: %s

%s

Acceptance Criteria:
• Feature should be implemented according to requirements
• Code should be well-tested and documented
• Implementation should follow best practices
• Feature should be responsive and accessible

Progress Tracking:
• Break down into smaller subtasks if needed
• Test functionality thoroughly
• Review code quality
• Validate with stakeholders

Dependencies:
• Review existing codebase
• Ensure no conflicts with current features
• Consider performance implications',
    context_info,
    task_title,
    context_info,
    CASE 
      WHEN existing_description IS NOT NULL AND existing_description != '' 
      THEN 'Description: ' || existing_description 
      ELSE 'Description: (No additional description provided)'
    END
  );
END;
$$ LANGUAGE plpgsql;