-- Insert the new official forum post about platform updates with proper author_user_id
INSERT INTO forum_threads (
  id,
  title,
  content,
  category,
  author_username,
  author_user_id,
  author_rank_name,
  author_rank_min_points,
  author_badges,
  author_signature,
  is_pinned,
  is_official,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '🚀 Platform Update: Performance Boost & Cosmic UI Transformation',
  '**Major Platform Updates - Stardate 2025.321** 🌌

Greetings, Fleet! We''ve just completed a major platform upgrade that brings significant performance improvements and a stunning new visual experience. Here''s what''s new:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⚡ Chat System Performance Overhaul

We''ve completely rebuilt the messaging system for lightning-fast performance:

✅ **Database Optimizations**
- Messages now load 5-10x faster with smart SQL queries
- Pagination system loads 50 messages at a time (no more lag!)
- Efficient realtime updates (only new messages, not everything)

✅ **Frontend Speed Boost**
- Instant message sending with optimistic updates
- Smooth scrolling for long conversations
- Better state management with Zustand
- Auto-scroll to latest messages

**You''ll notice:** Chat feels instant now. No more waiting for messages to load or update!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🌌 Cosmic Forum Transformation

The forum has received a stunning visual overhaul inspired by premium modern interfaces:

✨ **New Visual Features**
- Immersive cosmic/nebula gradient background
- Animated starfield that follows your mouse
- Three gorgeous themes: Dark, Light, and Nebula
- Smooth Framer Motion animations throughout
- Premium glassmorphism effects

✨ **Enhanced Thread Cards**
- Beautiful hover animations
- Gradient borders and cosmic styling
- Improved visual hierarchy
- Better mobile responsiveness

**You''ll notice:** The forum now feels premium, futuristic, and incredibly smooth to navigate!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🛡️ Security Improvements

Behind the scenes, we''ve hardened security:
- Fixed potential redirect vulnerabilities
- Enhanced input validation
- Better protection against phishing attempts

Your data and account remain secure!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 What''s Next?

We''re continuing to improve the platform with upcoming features:
- LCARS "Subspace Relay Text" theme for chat
- More forum customization options
- Additional performance optimizations
- Mobile app enhancements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 💬 Feedback Welcome!

Try out the new features and let us know what you think! Report any issues or suggestions in this thread.

**Special thanks** to everyone for their patience and support as we continue improving this platform. Your feedback drives these enhancements!

🖖 Live Long and Prosper!
- The Axanar Platform Team',
  'announcements',
  'lee',
  '4862bb86-6f9b-4b7d-aa74-e4bee1d50342',
  'Fleet Admiral',
  999999,
  '[{"label": "Official", "icon": "⭐"}, {"label": "Production Team", "icon": "🎬"}, {"label": "Administrator", "icon": "🛡️"}]'::jsonb,
  E'🖖 Lee Quessenberry - Axanar Productions\n━━━━━━━━━━━━━━━━━━━━━━━━\n"Live Long and Prosper"',
  true,
  true,
  now(),
  now()
);