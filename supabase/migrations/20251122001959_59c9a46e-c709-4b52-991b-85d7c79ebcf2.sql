-- Update Ambassador of Indiegogo Legacy title to use custom badge image
UPDATE ambassadorial_titles 
SET icon = '/images/badges/ambassador-indiegogo-legacy.png'
WHERE slug = 'ambassador-indiegogo-legacy';