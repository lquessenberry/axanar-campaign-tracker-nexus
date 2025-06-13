

-- Create a view that accurately calculates campaign statistics
CREATE OR REPLACE VIEW campaign_totals AS
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.provider,
    c.start_date,
    c.end_date,
    c.active,
    c.goal_amount,
    COALESCE(SUM(p.amount), 0) as total_amount,
    COUNT(DISTINCT p.donor_id) as backers_count,
    COUNT(p.id) as total_pledges
FROM campaigns c
LEFT JOIN pledges p ON c.id = p.campaign_id
GROUP BY c.id, c.name, c.provider, c.start_date, c.end_date, c.active, c.goal_amount
ORDER BY c.created_at DESC;

