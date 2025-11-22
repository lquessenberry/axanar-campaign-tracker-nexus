-- Update all ambassadorial title descriptions with fun, engaging text
-- Universal Title (1)
UPDATE ambassadorial_titles SET description = $$Welcome to the Federation! Every contributor, no matter the amount, joins our diplomatic corps. Your support helps build the Axanar universe, one credit at a time.$$ WHERE slug = 'foundation-contributor';

-- Indiegogo Titles (9)
UPDATE ambassadorial_titles SET description = $$Elite access to virtual Captain's Summit with exclusive behind-the-scenes content. Lead the recovery mission from your personal viewscreen!$$ WHERE slug = 'ambassador-indiegogo-legacy';

UPDATE ambassadorial_titles SET description = $$Receive a personalized thank-you video message. Your diplomatic efforts in the recovery mission are celebrated with this unique memento!$$ WHERE slug = 'minister-resilience-envoys';

UPDATE ambassadorial_titles SET description = $$Own a piece of Axanar history with an authentic signed recovery script. Perfect for framing in your ready room!$$ WHERE slug = 'deputy-chief-resilience-scripts';

UPDATE ambassadorial_titles SET description = $$Bear the prestigious gold recovery challenge coin—a symbol of your unwavering support during the critical recovery campaign!$$ WHERE slug = 'consul-general-resilience';

UPDATE ambassadorial_titles SET description = $$Collect all four exclusive recovery patches in this ultimate set. Display your diplomatic credentials with pride!$$ WHERE slug = 'consul-patch-pantheons';

UPDATE ambassadorial_titles SET description = $$Access the stunning 200+ page digital art book showcasing Axanar's incredible visual development. A treasure trove for any art enthusiast!$$ WHERE slug = 'first-secretary-artistic';

UPDATE ambassadorial_titles SET description = $$Rally the crew with exclusive recovery campaign apparel! Wear your support with this unique T-shirt design.$$ WHERE slug = 'second-secretary-rally';

UPDATE ambassadorial_titles SET description = $$Display a signed crew badge—a tangible connection to the brave souls who serve aboard Axanar vessels!$$ WHERE slug = 'third-secretary-badge';

UPDATE ambassadorial_titles SET description = $$Start your patch collection with this essential recovery set. The first step in your diplomatic insignia journey!$$ WHERE slug = 'attache-recovery-emblems';

-- Kickstarter Titles (16)
UPDATE ambassadorial_titles SET description = $$The ultimate honor—name a starship or set piece in the Axanar universe! Your legacy will live on in Federation history!$$ WHERE slug = 'grand-ambassador-nomenclature';

UPDATE ambassadorial_titles SET description = $$Executive Producer credit plus VIP set visit! Walk where legends are made and see filmmaking magic firsthand!$$ WHERE slug = 'ambassador-executive-enclaves';

UPDATE ambassadorial_titles SET description = $$Full Producer credit with an authentic Captain's chair replica for your command center. Take your place in the producer's lounge!$$ WHERE slug = 'ambassador-extraordinary-plenipotentiary';

UPDATE ambassadorial_titles SET description = $$Associate Producer credit with on-screen recognition! Your name scrolls through history in every viewing!$$ WHERE slug = 'ambassador-extraordinary';

UPDATE ambassadorial_titles SET description = $$Lights, camera, YOU! Get a walk-on speaking role in Axanar. Become part of the story you helped create!$$ WHERE slug = 'ambassador-cameo-protocols';

UPDATE ambassadorial_titles SET description = $$VIP access to the premiere screening and exclusive Captain's Summit. Rub elbows with the crew and creators!$$ WHERE slug = 'ambassador-at-large-event';

UPDATE ambassadorial_titles SET description = $$Receive a personalized video message from the production team. A heartfelt thank-you delivered directly to you!$$ WHERE slug = 'charge-video-envoys';

UPDATE ambassadorial_titles SET description = $$Producer credit on Axanar! Your name joins the ranks of those who made it all possible!$$ WHERE slug = 'minister-credit-accords';

UPDATE ambassadorial_titles SET description = $$Script signed by the legendary cast—Hatch, Todd, Graham, and Hertzler! A collector's dream come true!$$ WHERE slug = 'deputy-chief-cast-signatures';

UPDATE ambassadorial_titles SET description = $$Bear the prestigious gold challenge coin—a symbol of your exceptional support for Axanar!$$ WHERE slug = 'consul-general-auric-legacy';

UPDATE ambassadorial_titles SET description = $$The ultimate patch collection! All campaign patches in one magnificent set for the completionist collector!$$ WHERE slug = 'consul-patch-mastery';

UPDATE ambassadorial_titles SET description = $$Access the comprehensive digital art book showcasing Axanar's visual splendor. Hundreds of pages of production art!$$ WHERE slug = 'first-secretary-archives';

UPDATE ambassadorial_titles SET description = $$Represent your support with exclusive Axanar apparel! Limited edition shirt designs for true supporters!$$ WHERE slug = 'second-secretary-attire';

UPDATE ambassadorial_titles SET description = $$Own two exclusive signed crew badges—double the authenticity, double the prestige!$$ WHERE slug = 'third-secretary-badges-dual';

UPDATE ambassadorial_titles SET description = $$Collect all four exclusive patches from the original campaign. A complete set for your diplomatic regalia!$$ WHERE slug = 'attache-patch-protocols';

UPDATE ambassadorial_titles SET description = $$Essential supporter status! Your contribution helps keep the fleet operational. Every credit counts!$$ WHERE slug = 'diplomatic-liaison-operations';

-- Prelude to Axanar Titles (12)
UPDATE ambassadorial_titles SET description = $$The crown jewel of Prelude support! Premier access and recognition for your extraordinary $1,000 contribution!$$ WHERE slug = 'ambassador-prelude-paramount';

UPDATE ambassadorial_titles SET description = $$Diplomatic corps leadership tier! Your $750 contribution ensures Prelude's lasting legacy!$$ WHERE slug = 'minister-prelude-legacy';

UPDATE ambassadorial_titles SET description = $$Champion supporter of Prelude! Your $500 contribution helped launch the Axanar phenomenon!$$ WHERE slug = 'consul-general-prelude-champion';

UPDATE ambassadorial_titles SET description = $$Major supporter of Prelude! Your $250 contribution was instrumental in creating this groundbreaking short film!$$ WHERE slug = 'consul-prelude-benefactor';

UPDATE ambassadorial_titles SET description = $$Significant supporter of the Prelude mission! Your $100 contribution helped prove the concept!$$ WHERE slug = 'first-secretary-prelude-patron';

UPDATE ambassadorial_titles SET description = $$Dedicated Prelude supporter! Your $75 contribution helped establish the visual standards!$$ WHERE slug = 'second-secretary-prelude-advocate';

UPDATE ambassadorial_titles SET description = $$Core Prelude supporter! Your $50 contribution was part of the foundation!$$ WHERE slug = 'third-secretary-prelude-supporter';

UPDATE ambassadorial_titles SET description = $$Active Prelude contributor! Your $25 contribution joined the initial wave of support!$$ WHERE slug = 'attache-prelude-contributor';

UPDATE ambassadorial_titles SET description = $$Early Prelude believer! Your $15 contribution showed faith in the vision!$$ WHERE slug = 'liaison-prelude-believer';

UPDATE ambassadorial_titles SET description = $$Prelude pioneer! Your $10 contribution was there at the beginning!$$ WHERE slug = 'envoy-prelude-pioneer';

UPDATE ambassadorial_titles SET description = $$Initial Prelude supporter! Your $5 contribution helped prove there was an audience!$$ WHERE slug = 'deputy-prelude-initial';

UPDATE ambassadorial_titles SET description = $$First Prelude contributor! Even a dollar mattered in launching this incredible journey!$$ WHERE slug = 'attache-prelude-first';