-- Clear recent recovery attempts for testing
DELETE FROM account_recovery_attempts 
WHERE email = 'lquessenberry+spoof1@gmail.com' 
AND created_at > now() - interval '1 hour';