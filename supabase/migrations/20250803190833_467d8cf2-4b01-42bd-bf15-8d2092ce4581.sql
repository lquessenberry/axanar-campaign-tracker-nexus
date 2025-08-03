-- Add bio column to donors table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donors' AND column_name = 'bio'
    ) THEN
        ALTER TABLE donors ADD COLUMN bio text;
    END IF;
END $$;