-- Clear password reset rate limit entries for testing
-- This will allow testing the password reset flow again
DELETE FROM password_reset_attempts WHERE email = 'lquessenberry+spoof1@gmail.com';