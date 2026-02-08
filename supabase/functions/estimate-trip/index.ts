import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TripEstimateRequest {
  departureCity: string;
  arrivalCity: string;
  transportType: string;
  distanceKm: number;
  stopovers?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { departureCity, arrivalCity, transportType, distanceKm, stopovers } = await req.json() as TripEstimateRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const stopoverText = stopovers && stopovers.length > 0 
      ? `avec escales à ${stopovers.join(", ")}` 
      : "";

    const systemPrompt = `Tu es un expert en transport et en environnement. Tu estimes le temps de trajet et l'empreinte carbone pour différents modes de transport.

Réponds UNIQUEMENT avec un objet JSON valide sans aucun texte avant ou après. Le format exact est:
{
  "estimatedDurationMinutes": number,
  "estimatedCo2Kg": number,
  "durationRange": { "min": number, "max": number },
  "co2Comparison": string,
  "tips": string[],
  "confidence": "high" | "medium" | "low"
}

Règles pour les estimations:
- Avion: ~800 km/h en vol, +2h pour embarquement/débarquement, CO2 ~255g/km
- Train (TGV): ~250 km/h, +30min marge, CO2 ~14g/km
- Train régional: ~80 km/h, CO2 ~20g/km
- Voiture: ~80 km/h autoroute, ~50 km/h en ville, CO2 ~171g/km
- Bus: ~70 km/h, CO2 ~89g/km
- Bateau: ~40 km/h, CO2 ~245g/km
- Métro: ~30 km/h, CO2 ~8g/km

Pour co2Comparison, compare avec un trajet équivalent en voiture.
Pour tips, donne 2-3 conseils pertinents pour réduire l'empreinte ou optimiser le trajet.`;

    const userPrompt = `Estime le temps de trajet et les émissions CO2 pour:
- Départ: ${departureCity}
- Arrivée: ${arrivalCity}
- Distance: ${distanceKm} km
- Transport: ${transportType}
${stopoverText}

Prends en compte les temps d'attente, correspondances et conditions réalistes.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from the AI
    let estimate;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        estimate = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback to basic calculation
      const speedByTransport: Record<string, number> = {
        plane: 800,
        train: 200,
        car: 80,
        bus: 70,
        boat: 40,
        metro: 30,
      };
      const co2PerKm: Record<string, number> = {
        plane: 0.255,
        train: 0.014,
        car: 0.171,
        bus: 0.089,
        boat: 0.245,
        metro: 0.008,
      };
      
      const speed = speedByTransport[transportType] || 80;
      const co2Rate = co2PerKm[transportType] || 0.171;
      const baseDuration = (distanceKm / speed) * 60;
      const overhead = transportType === 'plane' ? 120 : 30;
      
      estimate = {
        estimatedDurationMinutes: Math.round(baseDuration + overhead),
        estimatedCo2Kg: Math.round(distanceKm * co2Rate * 10) / 10,
        durationRange: {
          min: Math.round(baseDuration * 0.9 + overhead),
          max: Math.round(baseDuration * 1.2 + overhead),
        },
        co2Comparison: `Équivalent à ${Math.round(distanceKm * 0.171)} kg en voiture`,
        tips: ["Privilégiez le train pour réduire votre empreinte", "Voyagez léger pour diminuer la consommation"],
        confidence: "low" as const,
      };
    }

    return new Response(JSON.stringify(estimate), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("estimate-trip error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
