-- Fix incorrect auth_user_id linking for lee@bbqberry.com
-- This donor should be linked to auth user 40c7444c-85d4-4d50-a7b0-9c4a2ca5d9f6, not 4862bb86-6f9b-4b7d-aa74-e4bee1d50342

UPDATE donors 
SET auth_user_id = '40c7444c-85d4-4d50-a7b0-9c4a2ca5d9f6'
WHERE email = 'lee@bbqberry.com' 
  AND auth_user_id = '4862bb86-6f9b-4b7d-aa74-e4bee1d50342';

-- Verify the fix
SELECT 
  email,
  auth_user_id,
  'Fixed linking' as status
FROM donors 
WHERE email IN ('lquessenberry@gmail.com', 'lee@bbqberry.com')
ORDER BY email;