-- Insert all next steps tasks into the Backlog sprint
INSERT INTO public.tasks (
  user_id,
  sprint_id,
  title,
  description,
  status,
  priority,
  order_index,
  created_at
)
SELECT
  auth.uid(),
  s.id,
  task_data.title,
  task_data.description,
  'todo',
  task_data.priority,
  task_data.order_index,
  now()
FROM public.sprints s,
(VALUES
  -- High Priority: Immediate Design Improvement
  ('🎨 Improve AI Context Menu Design & Search Presentation', 'Enhance the visual design of the AI context menu with better search functionality, improved presentation to users, modern UI patterns, and enhanced user experience. Focus on visual hierarchy, spacing, animations, and search result display.', 'high', 1),

  -- Immediate Opportunities
  ('🤖 Enhance Real AI Processing', 'Improve the process-ai-content edge function with better prompts, more sophisticated AI models, and enhanced processing logic. Replace fallback mock improvements with robust AI capabilities.', 'high', 2),
  ('📊 User Feedback & Analytics System', 'Track which AI suggestions users accept/reject, add usage analytics for search functionality, and implement user satisfaction ratings for AI-generated content.', 'medium', 3),
  ('🔍 Advanced Search Features', 'Add search history, saved searches, semantic search capabilities, and filters by date, relevance, and content type to enhance the search experience.', 'medium', 4),

  -- Feature Expansions
  ('🎯 AI Assistant Personalization', 'Learn from user preferences over time, customize suggestions based on user writing style, and add industry-specific AI optimizations.', 'medium', 5),
  ('👥 Collaboration Features', 'Share AI-enhanced documents with team members, add comment and review system for AI suggestions, and implement version control for document improvements.', 'low', 6),
  ('🔗 Integration Opportunities', 'Connect with popular job boards for real-time data, integrate with calendar for interview scheduling, and add LinkedIn profile analysis.', 'low', 7),

  -- Technical Improvements
  ('⚡ Performance Optimization', 'Implement caching for frequently used AI responses, add Progressive Web App (PWA) capabilities, and optimize search indexing and results.', 'medium', 8),
  ('🔒 Security & Compliance Enhancement', 'Enhanced audit logging for AI usage, data retention policies for user content, and GDPR compliance features.', 'high', 9),

  -- Business Intelligence
  ('📈 Dashboard & Reporting System', 'User engagement metrics, AI usage statistics, and success rate tracking for job applications with comprehensive analytics dashboard.', 'low', 10),
  ('💎 Premium Features Development', 'Advanced AI models for premium users, unlimited search capabilities, and priority processing queues for enhanced user tiers.', 'low', 11)
) AS task_data(title, description, priority, order_index)
WHERE s.user_id = auth.uid()
  AND s.name = 'Backlog';