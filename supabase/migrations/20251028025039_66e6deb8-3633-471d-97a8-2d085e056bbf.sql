-- Update pinned post author from lquessenberry to lee
UPDATE forum_threads 
SET author_username = 'lee' 
WHERE author_username = 'lquessenberry';