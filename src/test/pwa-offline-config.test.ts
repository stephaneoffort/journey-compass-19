import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Contrôle statique de la configuration PWA / Workbox déclarée dans vite.config.ts.
 * Ces règles garantissent que le mode hors-ligne fonctionne comme prévu :
 * - le shell HTML/JS/CSS est pré-caché,
 * - les appels backend Supabase sont servis via NetworkFirst (donc lisibles offline via cache),
 * - les callbacks OAuth ne sont jamais interceptés par le service worker.
 */
describe("PWA offline configuration (vite.config.ts)", () => {
  const config = readFileSync(resolve(__dirname, "../../vite.config.ts"), "utf-8");

  it("précache les assets essentiels de l'app shell", () => {
    expect(config).toMatch(/globPatterns:\s*\[[^\]]*js[^\]]*css[^\]]*html/);
  });

  it("applique une stratégie NetworkFirst aux appels Supabase (fallback cache offline)", () => {
    expect(config).toMatch(/supabase\\\.co/);
    expect(config).toMatch(/handler:\s*"NetworkFirst"/);
    expect(config).toMatch(/cacheName:\s*"supabase-cache"/);
  });

  it("expire le cache Supabase après 24h maximum", () => {
    expect(config).toMatch(/maxAgeSeconds:\s*60\s*\*\s*60\s*\*\s*24/);
  });

  it("exclut /~oauth du fallback SPA pour éviter de casser la connexion Google", () => {
    expect(config).toMatch(/navigateFallbackDenylist:\s*\[\s*\/\^\\\/~oauth\//);
  });

  it("déclare un manifest PWA installable (standalone)", () => {
    expect(config).toMatch(/display:\s*"standalone"/);
    expect(config).toMatch(/registerType:\s*"autoUpdate"/);
  });
});
