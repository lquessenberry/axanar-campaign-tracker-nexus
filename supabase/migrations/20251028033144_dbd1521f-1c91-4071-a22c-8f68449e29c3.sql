-- Update naval ranks to Starfleet ranks
UPDATE forum_ranks 
SET name = 'Crewman', 
    slug = 'crewman',
    description = 'Basic Starfleet crew member; eligible to upvote posts.'
WHERE slug = 'able-seaman';

UPDATE forum_ranks 
SET name = 'Crewman First Class', 
    slug = 'crewman-first-class',
    description = 'Experienced crew member; beta feature access.'
WHERE slug = 'senior-chief-petty-officer';