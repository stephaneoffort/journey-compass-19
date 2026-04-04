import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import * as XLSX from "npm:xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const transportLabels: Record<string, string> = {
  plane: "Avion",
  train: "Train",
  car: "Voiture",
  bus: "Bus",
  boat: "Bateau",
  metro: "Métro",
  logement: "Logement",
  frais: "Frais divers",
};

const bookingStatusLabels: Record<string, string> = {
  recherche: "En recherche",
  trouve: "Trouvé",
  achete: "Acheté",
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeStr?: string | null): string {
  if (!timeStr) return "";
  return timeStr.slice(0, 5);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse optional body params
    let recipientOverride: string | null = null;
    let requestUserId: string | null = null;
    try {
      const body = await req.json();
      recipientOverride = body?.recipientEmail || null;
      requestUserId = body?.userId || null;
    } catch {
      // no body = cron mode
    }

    // Calculate date range: previous month
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startDate = firstDayLastMonth.toISOString().split("T")[0];
    const endDate = lastDayLastMonth.toISOString().split("T")[0];

    const monthName = firstDayLastMonth.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

    // If specific user requested, only process that user
    let profiles: { user_id: string; full_name: string | null }[];
    
    if (requestUserId) {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("user_id, full_name")
        .eq("user_id", requestUserId)
        .single();
      if (error || !data) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      profiles = [data];
    } else {
      const { data, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("user_id, full_name");
      if (profilesError) throw profilesError;
      if (!data || data.length === 0) {
        return new Response(JSON.stringify({ message: "No users found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      profiles = data;
    }

    let sentCount = 0;

    for (const profile of profiles) {
      const userId = profile.user_id;

      // Get user email (for name fallback)
      const { data: userData, error: userError } =
        await supabaseAdmin.auth.admin.getUserById(userId);
      if (userError || !userData?.user?.email) continue;

      // Use recipient override or default to user's own email
      const userEmail = recipientOverride || userData.user.email;
      const userName = profile.full_name || userData.user.email.split("@")[0];

      const userName = profile.full_name || userEmail.split("@")[0];

      // Get trips for this user in the date range
      const { data: trips, error: tripsError } = await supabaseAdmin
        .from("trips")
        .select("*")
        .eq("user_id", userId)
        .gte("departure_date", startDate)
        .lte("departure_date", endDate)
        .order("departure_date", { ascending: true });

      if (tripsError || !trips || trips.length === 0) continue;

      // Get invoices for these trips with 15-day signed URLs
      const tripIds = trips.map((t) => t.id);
      const { data: invoices } = await supabaseAdmin
        .from("invoices")
        .select("*")
        .in("trip_id", tripIds);

      const invoiceMap = new Map<string, { fileName: string; url: string }[]>();

      if (invoices) {
        for (const invoice of invoices) {
          const { data: urlData } = await supabaseAdmin.storage
            .from("invoices")
            .createSignedUrl(invoice.file_path, 60 * 60 * 24 * 15); // 15 days

          if (urlData?.signedUrl) {
            const existing = invoiceMap.get(invoice.trip_id) || [];
            existing.push({
              fileName: invoice.file_name,
              url: urlData.signedUrl,
            });
            invoiceMap.set(invoice.trip_id, existing);
          }
        }
      }

      // Generate Excel
      const wb = XLSX.utils.book_new();

      // === Sheet 1: Résumé ===
      const totalDistance = trips.reduce((s, t) => s + (t.distance_km || 0), 0);
      const totalCo2 = trips.reduce((s, t) => s + (t.co2_kg || 0), 0);
      const totalPrice = trips.reduce((s, t) => {
        let p = t.price || 0;
        p += t.toll_expense || 0;
        p += t.parking_expense || 0;
        p += t.other_expense || 0;
        return s + p;
      }, 0);

      const summaryData = [
        ["RAPPORT MENSUEL - TRIPTRACKER"],
        [],
        ["Période", `${monthName}`],
        ["Utilisateur", userName],
        [],
        ["RÉCAPITULATIF"],
        ["Nombre de déplacements", trips.length],
        ["Distance totale (km)", totalDistance],
        ["Émissions CO₂ (kg)", Math.round(totalCo2 * 100) / 100],
        ["Coût total (€)", Math.round(totalPrice * 100) / 100],
        [],
        ["Généré le", new Date().toLocaleDateString("fr-FR")],
        [],
        [
          "Note",
          "Les liens de téléchargement des factures sont valides pendant 15 jours.",
        ],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary["!cols"] = [{ wch: 25 }, { wch: 35 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé");

      // === Sheet 2: Détail ===
      const tripsHeader = [
        "#",
        "Date",
        "Heure départ",
        "Ville départ",
        "Pays départ",
        "Ville arrivée",
        "Pays arrivée",
        "Heure arrivée",
        "Transport",
        "Compagnie",
        "N° Billet",
        "Distance (km)",
        "CO₂ (kg)",
        "Prix (€)",
        "Péage (€)",
        "Parking (€)",
        "Autres frais (€)",
        "Total (€)",
        "Statut",
        "Notes",
      ];

      const tripsRows = trips.map((t, i) => [
        i + 1,
        formatDate(t.departure_date),
        formatTime(t.departure_time),
        t.departure_city,
        t.departure_country_name,
        t.arrival_city,
        t.arrival_country_name,
        formatTime(t.arrival_time),
        transportLabels[t.transport_type] || t.transport_type,
        t.company || "",
        t.ticket_number || "",
        t.distance_km || 0,
        Math.round((t.co2_kg || 0) * 100) / 100,
        t.price || 0,
        t.toll_expense || 0,
        t.parking_expense || 0,
        t.other_expense || 0,
        (t.price || 0) +
          (t.toll_expense || 0) +
          (t.parking_expense || 0) +
          (t.other_expense || 0),
        bookingStatusLabels[t.booking_status] || "",
        t.notes || "",
      ]);

      const totalsRow = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "TOTAL",
        totalDistance,
        Math.round(totalCo2 * 100) / 100,
        Math.round(
          trips.reduce((s, t) => s + (t.price || 0), 0) * 100
        ) / 100,
        Math.round(
          trips.reduce((s, t) => s + (t.toll_expense || 0), 0) * 100
        ) / 100,
        Math.round(
          trips.reduce((s, t) => s + (t.parking_expense || 0), 0) * 100
        ) / 100,
        Math.round(
          trips.reduce((s, t) => s + (t.other_expense || 0), 0) * 100
        ) / 100,
        Math.round(totalPrice * 100) / 100,
        "",
        "",
      ];

      const wsTrips = XLSX.utils.aoa_to_sheet([
        tripsHeader,
        ...tripsRows,
        [],
        totalsRow,
      ]);
      wsTrips["!cols"] = [
        { wch: 5 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 30 },
      ];
      XLSX.utils.book_append_sheet(wb, wsTrips, "Détail");

      // === Sheet 3: Factures avec liens individuels ===
      const invoicesHeader = [
        "#",
        "Trajet",
        "Date",
        "Fichier",
        "Lien de téléchargement (valide 15 jours)",
      ];
      const invoicesRows: (string | number)[][] = [];

      trips.forEach((trip, idx) => {
        const tripInvoices = invoiceMap.get(trip.id) || [];
        tripInvoices.forEach((inv) => {
          invoicesRows.push([
            idx + 1,
            `${trip.departure_city} → ${trip.arrival_city}`,
            formatDate(trip.departure_date),
            inv.fileName,
            inv.url,
          ]);
        });
      });

      if (invoicesRows.length > 0) {
        const wsInvoices = XLSX.utils.aoa_to_sheet([
          invoicesHeader,
          ...invoicesRows,
        ]);
        wsInvoices["!cols"] = [
          { wch: 5 },
          { wch: 30 },
          { wch: 15 },
          { wch: 30 },
          { wch: 80 },
        ];
        XLSX.utils.book_append_sheet(wb, wsInvoices, "Factures");
      }

      // Generate Excel buffer
      const excelBuffer = XLSX.write(wb, {
        type: "buffer",
        bookType: "xlsx",
      });

      // Upload Excel to storage instead of attaching
      const reportFileName = `reports/${userId}/rapport-${monthName.replace(/\s/g, "-")}.xlsx`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("invoices")
        .upload(reportFileName, excelBuffer, {
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          upsert: true,
        });

      let excelDownloadUrl = "";
      if (!uploadError) {
        const { data: signedData } = await supabaseAdmin.storage
          .from("invoices")
          .createSignedUrl(reportFileName, 60 * 60 * 24 * 15); // 15 days
        excelDownloadUrl = signedData?.signedUrl || "";
      }

      // Build invoice links HTML for email body
      let invoiceLinksHtml = "";
      if (invoicesRows.length > 0) {
        invoiceLinksHtml = `
          <h3 style="color: #0ea5e9; margin-top: 24px;">📎 Factures et reçus</h3>
          <p style="color: #888; font-size: 13px;">Cliquez sur chaque lien pour télécharger le fichier. Les liens sont valides pendant 15 jours.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
            <tr style="background: #1a1a2e; color: #fff;">
              <th style="padding: 8px; text-align: left;">Trajet</th>
              <th style="padding: 8px; text-align: left;">Fichier</th>
              <th style="padding: 8px; text-align: left;">Télécharger</th>
            </tr>
            ${invoicesRows
              .map(
                (row) => `
              <tr style="border-bottom: 1px solid #2a2a3e;">
                <td style="padding: 8px; color: #e2e2e2;">${row[1]}</td>
                <td style="padding: 8px; color: #e2e2e2;">${row[3]}</td>
                <td style="padding: 8px;"><a href="${row[4]}" style="color: #0ea5e9; text-decoration: underline;">📥 Télécharger</a></td>
              </tr>
            `
              )
              .join("")}
          </table>
        `;
      }

      // Build Excel download link section
      const excelLinkHtml = excelDownloadUrl
        ? `
          <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="color: #0ea5e9; margin-top: 0;">📊 Rapport Excel complet</h3>
            <p style="color: #888; font-size: 13px; margin-bottom: 16px;">Le fichier contient le résumé, le détail des trajets et les liens vers vos factures.</p>
            <a href="${excelDownloadUrl}" style="display: inline-block; background: #0ea5e9; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">📥 Télécharger le rapport Excel</a>
            <p style="color: #666; font-size: 11px; margin-top: 12px;">Lien valide pendant 15 jours</p>
          </div>
        `
        : "";

      // Send email (no attachment, just links)
      const emailResponse = await resend.emails.send({
        from: "TripTracker <onboarding@resend.dev>",
        to: [userEmail],
        subject: `📊 Rapport mensuel TripTracker - ${monthName}`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e2e2e2; padding: 32px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0ea5e9; margin: 0;">✈️ TripTracker</h1>
              <p style="color: #888;">Rapport mensuel - ${monthName}</p>
            </div>
            
            <p>Bonjour ${userName},</p>
            <p>Voici le récapitulatif de vos déplacements pour le mois de <strong>${monthName}</strong>.</p>
            
            <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #0ea5e9; margin-top: 0;">📋 Résumé</h3>
              <table style="width: 100%;">
                <tr><td style="padding: 4px 0; color: #888;">Déplacements</td><td style="text-align: right; font-weight: bold;">${trips.length}</td></tr>
                <tr><td style="padding: 4px 0; color: #888;">Distance totale</td><td style="text-align: right; font-weight: bold;">${totalDistance} km</td></tr>
                <tr><td style="padding: 4px 0; color: #888;">CO₂ émis</td><td style="text-align: right; font-weight: bold;">${Math.round(totalCo2 * 100) / 100} kg</td></tr>
                <tr><td style="padding: 4px 0; color: #888;">Coût total</td><td style="text-align: right; font-weight: bold; color: #0ea5e9;">${Math.round(totalPrice * 100) / 100} €</td></tr>
              </table>
            </div>

            ${excelLinkHtml}

            ${invoiceLinksHtml}
            
            <hr style="border-color: #2a2a3e; margin: 24px 0;" />
            <p style="color: #666; font-size: 12px; text-align: center;">
              TripTracker - Suivi de déplacements professionnels
            </p>
          </div>
        `,
      });

      console.log(`Email sent to ${userEmail}:`, emailResponse);
      sentCount++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${sentCount} rapport(s) envoyé(s)`,
        period: monthName,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in monthly-report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
