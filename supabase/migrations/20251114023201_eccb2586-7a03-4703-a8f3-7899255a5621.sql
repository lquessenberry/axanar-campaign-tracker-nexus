-- Add shipping tracking fields to rewards table
ALTER TABLE rewards 
ADD COLUMN is_physical BOOLEAN DEFAULT false,
ADD COLUMN requires_shipping BOOLEAN DEFAULT false,
ADD COLUMN estimated_ship_date DATE;

-- Add delivery tracking fields to pledges table
ALTER TABLE pledges
ADD COLUMN shipping_status TEXT CHECK (shipping_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
ADD COLUMN shipped_at TIMESTAMPTZ,
ADD COLUMN delivered_at TIMESTAMPTZ,
ADD COLUMN tracking_number TEXT,
ADD COLUMN shipping_notes TEXT;

-- Create index for faster queries on shipping status
CREATE INDEX idx_pledges_shipping_status ON pledges(shipping_status);
CREATE INDEX idx_rewards_requires_shipping ON rewards(requires_shipping);

-- Update existing rewards that appear to be physical items based on their names
UPDATE rewards 
SET is_physical = true, 
    requires_shipping = true 
WHERE LOWER(name) LIKE '%blu-ray%' 
   OR LOWER(name) LIKE '%patch%'
   OR LOWER(name) LIKE '%badge%'
   OR LOWER(name) LIKE '%plaque%'
   OR LOWER(name) LIKE '%photo%'
   OR LOWER(name) LIKE '%signed%'
   OR LOWER(name) LIKE '%ship%'
   OR LOWER(description) LIKE '%physical%'
   OR LOWER(description) LIKE '%shipping%';

COMMENT ON COLUMN rewards.is_physical IS 'Whether this reward is a physical item';
COMMENT ON COLUMN rewards.requires_shipping IS 'Whether this reward needs to be shipped to backers';
COMMENT ON COLUMN pledges.shipping_status IS 'Current shipping status: pending, processing, shipped, delivered, cancelled';
COMMENT ON COLUMN pledges.tracking_number IS 'Shipping carrier tracking number';