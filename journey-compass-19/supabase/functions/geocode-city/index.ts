import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GeocodeRequest {
  city: string;
  country: string;
  countryName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Verify user token by decoding JWT and getting user
    const token = authHeader.replace('Bearer ', '');
    let userId: string;
    
    try {
      // Decode JWT to get user id
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      
      // Verify user exists
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError || !userData?.user) {
        throw new Error('User not found');
      }
    } catch {
      console.error('Auth error: Invalid token');
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', userId);

    const { city, country, countryName }: GeocodeRequest = await req.json();

    if (!city || !country || !countryName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: city, country, countryName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Geocoding city: ${city}, ${countryName}`);

    // First check if city already exists in custom_cities
    const { data: existingCity } = await supabase
      .from('custom_cities')
      .select('*')
      .eq('city', city)
      .eq('country', country)
      .maybeSingle();

    if (existingCity) {
      console.log('City found in database:', existingCity);
      return new Response(
        JSON.stringify({
          success: true,
          city: existingCity.city,
          country: existingCity.country,
          countryName: existingCity.country_name,
          lat: parseFloat(existingCity.lat),
          lng: parseFloat(existingCity.lng),
          source: 'database',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Nominatim API (OpenStreetMap)
    const searchQuery = `${city}, ${countryName}`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;
    
    console.log('Calling Nominatim:', nominatimUrl);

    const nominatimResponse = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'TripTracker/1.0 (contact@triptracker.app)',
      },
    });

    if (!nominatimResponse.ok) {
      console.error('Nominatim API error:', nominatimResponse.status);
      return new Response(
        JSON.stringify({ error: 'Geocoding service unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: NominatimResult[] = await nominatimResponse.json();
    console.log('Nominatim results:', results);

    if (!results || results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'City not found', city, country }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = results[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Save to database
    const { error: insertError } = await supabase
      .from('custom_cities')
      .insert({
        city,
        country,
        country_name: countryName,
        lat,
        lng,
        user_id: userId,
      });

    if (insertError) {
      // If it's a duplicate, that's fine - another user might have added it
      if (insertError.code !== '23505') {
        console.error('Insert error:', insertError);
      }
    }

    console.log(`Successfully geocoded ${city}: ${lat}, ${lng}`);

    return new Response(
      JSON.stringify({
        success: true,
        city,
        country,
        countryName,
        lat,
        lng,
        source: 'nominatim',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Geocode error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
