import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RewardUpdate {
  id: string;
  minimum_amount: number;
  is_physical: boolean;
  requires_shipping: boolean;
  description?: string;
  estimated_ship_date?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth header to verify admin status
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with service role for updates
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create client with user token to check admin status
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user is admin
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: adminData } = await supabaseUser
      .from('admin_users')
      .select('is_super_admin')
      .eq('user_id', user.id)
      .single()

    if (!adminData?.is_super_admin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Define all reward updates based on campaign research
    const rewardUpdates: RewardUpdate[] = [
      // Indiegogo Axanar Campaign
      { id: 'b45df119-6954-459d-ab4a-d40276d69f0d', minimum_amount: 10, is_physical: false, requires_shipping: false, description: 'Digital perks including forum access and exclusive content', estimated_ship_date: '2015-09-01' }, // FOUNDATION DONOR PACKAGE
      { id: 'f8dd91d3-d791-4e7a-a0ef-882bd6b6e733', minimum_amount: 15, is_physical: false, requires_shipping: false, description: 'Digital PDF script', estimated_ship_date: '2016-08-01' }, // AXANAR SCRIPTS
      { id: '4b01b155-5636-4287-b9da-6fa0010ab426', minimum_amount: 20, is_physical: false, requires_shipping: false, description: 'Illustrated script PDF with photos and behind-the-scenes content', estimated_ship_date: '2016-08-01' }, // AXANAR ILLUSTRATED SCRIPTS
      { id: '4d6f6d5a-0367-4e3e-8814-c7f4a1d63659', minimum_amount: 25, is_physical: false, requires_shipping: false, description: 'Digital download of Axanar', estimated_ship_date: '2016-08-01' }, // AXANAR DIGITAL DOWNLOAD
      { id: 'f17578a4-bf15-47ef-bf02-4af500fd12f2', minimum_amount: 30, is_physical: false, requires_shipping: false, description: 'Special digital package', estimated_ship_date: '2015-11-01' }, // Digital Bits Special
      { id: '26b1a541-90ce-4b23-a21a-438be2331492', minimum_amount: 35, is_physical: true, requires_shipping: true, description: 'Embroidered Fourth Fleet patch', estimated_ship_date: '2016-09-01' }, // FOURTH FLEET PATCH
      { id: 'c666f62e-91e9-4853-8832-09d88a6ed5fa', minimum_amount: 50, is_physical: true, requires_shipping: true, description: 'Embroidered ship patches for Sonya and Sam', estimated_ship_date: '2016-09-01' }, // SONYA & SAM SHIP PATCHES
      { id: '8f635df5-dc6b-4dfd-8578-a5ef68f71f01', minimum_amount: 50, is_physical: true, requires_shipping: true, description: 'Axanar T-shirt', estimated_ship_date: '2016-09-01' }, // AXANAR T-SHIRT
      { id: '98fd9989-4b91-4cf0-bdd0-b900b908f958', minimum_amount: 60, is_physical: true, requires_shipping: true, description: 'Physical soundtrack CD', estimated_ship_date: '2016-09-01' }, // AXANAR SOUNDTRACK CD
      { id: '190d131f-3d45-4f6f-8eb4-d97e37203e1a', minimum_amount: 75, is_physical: true, requires_shipping: true, description: 'First day production crew badge', estimated_ship_date: '2016-09-01' }, // AXANAR FIRST DAY CREW BADGE
      { id: 'c3b34692-c67d-44e8-870c-8f0c0f393bd5', minimum_amount: 75, is_physical: true, requires_shipping: true, description: 'Blu-ray disc of Axanar', estimated_ship_date: '2016-09-01' }, // AXANAR BLU-RAY
      { id: '0f3cc0c5-d0bc-4e66-b25d-1a5921acd91b', minimum_amount: 100, is_physical: true, requires_shipping: true, description: 'Crew badge signed by cast', estimated_ship_date: '2016-09-01' }, // Axanar Signed Crew Badge
      { id: '21053490-7812-47d0-9f1a-fadcb7fb551b', minimum_amount: 100, is_physical: true, requires_shipping: true, description: 'Signed photo from cast member', estimated_ship_date: '2016-09-01' }, // CAST MEMBER SIGNED PHOTO
      { id: '60bc8b89-8804-444a-8442-3034e9881798', minimum_amount: 150, is_physical: true, requires_shipping: true, description: 'Complete collection of mission patches', estimated_ship_date: '2016-09-01' }, // ULTIMATE PATCH COLLECTION
      { id: 'e0aaddbf-03c1-4829-b79e-4e88899cabfa', minimum_amount: 150, is_physical: true, requires_shipping: true, description: 'Starfleet Cadet jumpsuit costume', estimated_ship_date: '2016-12-01' }, // STARFLEET CADET JUMPSUIT
      { id: '86295efe-d284-411b-8be1-3a3d4ca5683a', minimum_amount: 150, is_physical: true, requires_shipping: true, description: 'Photo signed by multiple cast members', estimated_ship_date: '2016-09-01' }, // CAST SIGNED PHOTO
      { id: '1a03c92f-10d9-40be-865c-e909b98d12d8', minimum_amount: 150, is_physical: true, requires_shipping: true, description: 'USS Ares dedication plaque', estimated_ship_date: '2016-12-01' }, // USS ARES DEDICATION PLAQUE
      { id: '32cbd77d-ef1c-42d8-b25b-6bd5becf4d11', minimum_amount: 200, is_physical: true, requires_shipping: true, description: 'USS Ares uniform tunic', estimated_ship_date: '2016-12-01' }, // USS ARES TUNIC
      { id: '404401e8-2134-4d11-903e-4cd8746031c8', minimum_amount: 200, is_physical: true, requires_shipping: true, description: 'Deluxe Blu-ray set with extras', estimated_ship_date: '2016-12-01' }, // AXANAR DELUXE BLU-RAY SET
      { id: 'c0cbf129-7651-4dc7-abef-7b955c14a04b', minimum_amount: 200, is_physical: true, requires_shipping: true, description: 'Bound and signed script book', estimated_ship_date: '2016-12-01' }, // BOUND SIGNED SCRIPT
      { id: 'cc3019c7-4ef4-4382-96c0-9fd42dfc731c', minimum_amount: 300, is_physical: true, requires_shipping: true, description: 'First day of production clapper board', estimated_ship_date: '2017-01-01' }, // First Day Production Clapper
      { id: 'b4413281-5aff-4715-bc60-26a504c247b5', minimum_amount: 500, is_physical: false, requires_shipping: false, description: 'Visit the set and have a meal with cast and crew' }, // SET VISIT & MEAL W/ CAST, CREW
      { id: 'd207259a-d22f-4d19-b25a-4afe0403a603', minimum_amount: 500, is_physical: true, requires_shipping: true, description: 'Ultimate collectors package with multiple items', estimated_ship_date: '2017-03-01' }, // The Ultimate Collectors Pack
      { id: 'ac9eca0c-5d43-42fb-85c0-1a121dd45d36', minimum_amount: 1000, is_physical: false, requires_shipping: false, description: 'Have lunch with actors Kate Vernon (Kharn) and J.G. Hertzler (Garth)' }, // Lunch with Kharn and Garth!
      { id: 'a6041f1a-ed36-4397-b929-3f3f3d34cbf5', minimum_amount: 2000, is_physical: false, requires_shipping: false, description: 'Work as a production assistant on set for a week' }, // BE A PRODUCTION ASSISTANT
      { id: '87b18952-5da0-4a63-a42b-9deba5c1632e', minimum_amount: 5000, is_physical: false, requires_shipping: false, description: 'Be a featured extra in Axanar with IMDB credit' }, // BE AN EXTRA IN AXANAR
      { id: 'e3b3a19b-37e0-4399-9198-eeee2c0a6e72', minimum_amount: 10000, is_physical: false, requires_shipping: false, description: 'Associate Producer credit' }, // BE AN ASSOCIATE PRODUCER
      // Secret perks
      { id: '3d568360-5989-44f8-83cd-5e9de9416c3a', minimum_amount: 100, is_physical: false, requires_shipping: false, description: 'Surprise perk' }, // Secret Perk # 1
      { id: '35ee7a96-4e0d-4728-8c02-40d030a387e6', minimum_amount: 100, is_physical: false, requires_shipping: false, description: 'Surprise perk' }, // SECRET PERK # 2
      { id: 'd1df290f-9193-43f6-95b0-9a035baf410b', minimum_amount: 100, is_physical: false, requires_shipping: false, description: 'Surprise perk' }, // Secret Perk # 3
    ]

    // Perform updates
    let updated = 0
    let failed = 0
    const errors: string[] = []

    for (const update of rewardUpdates) {
      const { error } = await supabase
        .from('rewards')
        .update({
          minimum_amount: update.minimum_amount,
          is_physical: update.is_physical,
          requires_shipping: update.requires_shipping,
          description: update.description || null,
          estimated_ship_date: update.estimated_ship_date || null,
        })
        .eq('id', update.id)

      if (error) {
        failed++
        errors.push(`Failed to update ${update.id}: ${error.message}`)
      } else {
        updated++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated,
        failed,
        errors,
        message: `Updated ${updated} rewards, ${failed} failed`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
