import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SearchRequest {
  query: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
    country_code?: string;
  };
}

interface CityResult {
  city: string;
  country: string;
  countryName: string;
  lat: number;
  lng: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client 
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Verify user token using admin.auth.getUser
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.getUserById(
      // First decode the JWT to get the user id
      JSON.parse(atob(token.split('.')[1])).sub
    );
    
    // Alternative: validate through the API directly
    if (authError || !userData?.user) {
      // Try the other method - get user from token
      const { data: tokenUser, error: tokenError } = await supabaseAdmin.auth.getUser(token);
      
      if (tokenError || !tokenUser?.user) {
        console.error('Auth error:', authError || tokenError);
        return new Response(
          JSON.stringify({ error: 'Invalid authorization token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Use the user from token validation
      const user = tokenUser.user;
      return await processSearch(req, supabaseAdmin, user.id);
    }

    const user = userData.user;
    console.log('User authenticated:', user.id);

    return await processSearch(req, supabaseAdmin, user.id);

  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error), results: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processSearch(req: Request, supabase: ReturnType<typeof createClient>, userId: string) {
  const { query }: SearchRequest = await req.json();

  if (!query || query.length < 3) {
    return new Response(
      JSON.stringify({ error: 'Query must be at least 3 characters', results: [] }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Searching city: ${query}`);

  // Call Nominatim API (OpenStreetMap) to search for cities
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&featuretype=city`;
  
  console.log('Calling Nominatim:', nominatimUrl);

  const nominatimResponse = await fetch(nominatimUrl, {
    headers: {
      'User-Agent': 'TripTracker/1.0 (contact@triptracker.app)',
    },
  });

  if (!nominatimResponse.ok) {
    console.error('Nominatim API error:', nominatimResponse.status);
    return new Response(
      JSON.stringify({ error: 'Geocoding service unavailable', results: [] }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const nominatimResults: NominatimResult[] = await nominatimResponse.json();
  console.log('Nominatim results:', nominatimResults.length);

  const results: CityResult[] = [];
  
  for (const result of nominatimResults) {
    const cityName = result.address?.city || 
                     result.address?.town || 
                     result.address?.village || 
                     result.address?.municipality ||
                     result.display_name.split(',')[0];
    
    const countryName = result.address?.country || 'Unknown';
    const countryCode = result.address?.country_code?.toUpperCase() || 'XX';
    
    // Avoid duplicates
    if (!results.some(r => r.city === cityName && r.country === countryCode)) {
      const cityResult: CityResult = {
        city: cityName,
        country: countryCode,
        countryName: countryName,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
      
      results.push(cityResult);
      
      // Save to database for future use
      const { error: insertError } = await supabase
        .from('custom_cities')
        .insert({
          city: cityName,
          country: countryCode,
          country_name: countryName,
          lat: cityResult.lat,
          lng: cityResult.lng,
          user_id: userId,
        });
      
      if (insertError && insertError.code !== '23505') {
        console.error('Insert error:', insertError);
      } else {
        console.log(`Saved city: ${cityName}, ${countryName}`);
      }
    }
  }

  console.log(`Found ${results.length} cities for query: ${query}`);

  return new Response(
    JSON.stringify({
      success: true,
      results,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
