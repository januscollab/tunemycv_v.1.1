-- Create comprehensive UX audit and improvement tasks in priority sprints
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
  -- SPRINT 1: FOUNDATIONAL UX IMPROVEMENTS (High Priority)
  ('🎯 Standardize Micro-Interactions & Animations', 'Create consistent hover, focus, and click states across all components. Implement standard easing (cubic-bezier(0.34, 1.56, 0.64, 1)) for delightful transitions. Add scale effects (0.98) for button clicks and subtle bounce effects for success states.', 'high', 1),
  ('🔧 Enhanced Modal System Standardization', 'Standardize all modals with consistent backdrop blur, entrance/exit animations, sizing patterns, and ESC key handling. Implement overlay dimming transitions and unified close button positioning across all dialogs.', 'high', 2),
  ('⚡ Loading States & Skeleton Improvements', 'Add skeleton loaders for all data fetching states, implement progressive loading patterns, and create consistent spinner animations. Include success state micro-animations for form submissions and API calls.', 'high', 3),
  ('🎨 Enhanced Button & Form Consistency', 'Standardize button hover states, focus rings, and disabled states. Improve form field validation states with inline feedback, floating labels, and smooth error/success transitions.', 'high', 4),

  -- SPRINT 2: NAVIGATION & USER FLOW (Medium-High Priority)
  ('🧭 Enhanced Navigation Experience', 'Improve sticky navigation with smoother transitions, add breadcrumb navigation for complex flows, implement smart active states, and enhance mobile menu with staggered animations.', 'high', 5),
  ('📱 Mobile Experience Polish', 'Optimize touch targets (44px minimum), improve gesture handling, enhance mobile modal presentations, and add swipe-friendly interactions for cards and lists.', 'medium', 6),
  ('🔍 Search & Filter UX Enhancement', 'Add instant search feedback, implement search history, create smart filtering with clear visual states, and add empty state illustrations with helpful guidance.', 'medium', 7),
  ('📋 Enhanced Form Experience', 'Implement multi-step form progress indicators, add smart field validation, create auto-save functionality with visual feedback, and improve field grouping with clear visual hierarchy.', 'medium', 8),

  -- SPRINT 3: VISUAL HIERARCHY & CONTENT (Medium Priority)  
  ('🏗️ Layout & Spacing Consistency', 'Audit and standardize spacing patterns, implement consistent card layouts, improve visual hierarchy with better typography scales, and enhance grid systems for better content organization.', 'medium', 9),
  ('🌈 Color System Enhancement', 'Refine semantic color usage, improve contrast ratios for accessibility, add status color variations (success-50, warning-100, etc.), and enhance dark mode color harmony.', 'medium', 10),
  ('📝 Typography & Content Enhancement', 'Implement consistent heading hierarchy, improve text density and readability, add smart truncation patterns, and enhance content spacing for better scanability.', 'medium', 11),
  ('🖼️ Visual Feedback System', 'Add contextual icons throughout the interface, implement progress indicators for multi-step processes, create success/error state animations, and enhance empty states with engaging illustrations.', 'medium', 12),

  -- SPRINT 4: ADVANCED INTERACTIONS (Lower Priority)
  ('🎪 Delightful Micro-Interactions', 'Add personality through subtle animations: card hover lift effects, button ripple animations, smooth page transitions, and celebration animations for achievements.', 'low', 13),
  ('🔄 Smart State Management', 'Implement optimistic UI updates, add undo/redo functionality where appropriate, create smart auto-refresh patterns, and enhance real-time feedback for user actions.', 'low', 14),
  ('♿ Accessibility & Usability', 'Improve keyboard navigation flow, enhance screen reader support, add skip links, implement better focus management, and ensure all interactive elements meet accessibility standards.', 'low', 15),
  ('📊 User Experience Analytics', 'Add interaction tracking for UX insights, implement user journey mapping, create heatmap tracking setup, and add performance monitoring for UX metrics.', 'low', 16),

  -- SPRINT 5: POLISH & OPTIMIZATION (Future Enhancements)
  ('✨ Advanced Animations & Transitions', 'Implement page transition animations, add parallax effects where appropriate, create advanced loading sequences, and enhance element enter/exit animations.', 'low', 17),
  ('🎨 Custom Illustration Integration', 'Design and implement custom illustrations for empty states, error pages, onboarding flows, and feature highlights to add personality and warmth to the interface.', 'low', 18),
  ('🔮 Advanced AI Context Menu Redesign', 'Complete redesign of AI context menu with enhanced visual design, better search presentation, improved categorization, modern UI patterns, and smooth animations.', 'high', 19),
  ('🌟 Brand Personality Integration', 'Enhance the interface with subtle brand personality touches, custom cursor effects for interactive elements, and warm, welcoming micro-copy throughout the user journey.', 'low', 20)
) AS task_data(title, description, priority, order_index)
WHERE s.user_id = auth.uid()
  AND s.name = 'Priority';