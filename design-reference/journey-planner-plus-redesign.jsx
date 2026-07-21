import { useState } from "react";

// ————————————————————————————————————————————
// Journey Planner Plus — Refonte "Mes voyages" (maquette)
// Style : sobre, aéré (Notion / Linear), cohérent avec agendatour v2
// Thèmes clair / sombre — mobile-first
// ————————————————————————————————————————————

const TRIPS = [
  {
    id: 1,
    name: "Tour 2026 JKR",
    dates: "14 juil. → 30 sept. 2026",
    legs: [
      { from: "Opole", cc: "PL", mode: "start" },
      { from: "Prague", cc: "CZ", mode: "bus" },
      { from: "Bratislava", cc: "SK", mode: "car" },
      { from: "Wien", cc: "AT", mode: "car" },
      { from: "Bad Salzungen", cc: "DE", mode: "car" },
      { from: "Immenstadt im Allgäu", cc: "DE", mode: "car" },
      { from: "Budapest", cc: "HU", mode: "car" },
      { from: "București", cc: "RO", mode: "plane" },
      { from: "Sofia", cc: "BG", mode: "plane" },
      { from: "Benalmádena", cc: "ES", mode: "car" },
      { from: "Varsovie", cc: "PL", mode: "plane" },
    ],
    km: "8 353",
    co2: "1 951",
    cost: null,
  },
  {
    id: 2,
    name: "Warsaw chateau",
    dates: "30 juin 2026",
    legs: [
      { from: "Tillé", cc: "FR", mode: "start" },
      { from: "Paris", cc: "FR", mode: "train" },
      { from: "Tillé", cc: "FR", mode: "plane" },
    ],
    km: "1 427",
    co2: "352",
    cost: "18 €",
  },
];

// Icônes pleines, figuratives (style Material rounded), colorées par mode
const ICON_PATHS = {
  // Bus de face : carrosserie, pare-brise, roues
  bus: "M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1A1.5 1.5 0 116 15.5 1.5 1.5 0 017.5 17zm9 0a1.5 1.5 0 111.5-1.5 1.5 1.5 0 01-1.5 1.5zM18 11H6V6h12v5z",
  // Voiture de profil : capot, habitacle, roues
  car: "M18.92 6.01A1.5 1.5 0 0017.5 5h-11a1.5 1.5 0 00-1.42 1.01L3 12v8a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-8l-2.08-5.99zM6.5 16A1.5 1.5 0 118 14.5 1.5 1.5 0 016.5 16zm11 0a1.5 1.5 0 111.5-1.5 1.5 1.5 0 01-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
  // Avion vu de dessus : fuselage + ailes
  plane: "M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
  // Train de face : cabine, fenêtre, roues, rails
  train: "M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5V21h2.23l2-2h3.54l2 2H18v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17A1.5 1.5 0 119 15.5 1.5 1.5 0 017.5 17zm9 0a1.5 1.5 0 111.5-1.5 1.5 1.5 0 01-1.5 1.5zM18 10H6V6h12v4z",
  // Départ : épingle de carte pleine
  start: "M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1114.5 9 2.5 2.5 0 0112 11.5z",
  // Hébergement : lit
  bed: "M7 14a3 3 0 100-6 3 3 0 000 6zm13-6h-8v7H4V5H2v15h2v-3h16v3h2v-9a3 3 0 00-3-3z",
};

const Icon = ({ mode, className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={ICON_PATHS[mode] || ICON_PATHS.start} />
  </svg>
);

const MODE_LABEL = { bus: "Bus", car: "Voiture", plane: "Avion", train: "Train", start: "Départ", bed: "Hébergement" };

const T = {
  light: {
    page: "bg-white text-slate-900",
    subtle: "text-slate-400",
    faint: "text-slate-300",
    border: "border-slate-100",
    divide: "divide-slate-100",
    hover: "hover:bg-slate-50",
    card: "border border-slate-200",
    chip: "bg-slate-100 text-slate-500",
    line: "bg-slate-200",
    modes: {
      plane: "bg-sky-100 text-sky-600",
      train: "bg-violet-100 text-violet-600",
      car: "bg-amber-100 text-amber-600",
      bus: "bg-emerald-100 text-emerald-600",
      bed: "bg-rose-100 text-rose-500",
      start: "bg-slate-200 text-slate-600",
    },
    primaryBtn: "text-white bg-slate-900 hover:bg-slate-700",
    ghostBtn: "text-slate-400 hover:bg-slate-50 hover:text-slate-700",
    co2ok: "text-emerald-600",
    co2warn: "text-amber-600",
    navBar: "bg-white border-t border-slate-100",
    navIdle: "text-slate-400",
    navActive: "text-slate-900",
  },
  dark: {
    page: "bg-slate-950 text-slate-100",
    subtle: "text-slate-500",
    faint: "text-slate-600",
    border: "border-slate-800",
    divide: "divide-slate-800",
    hover: "hover:bg-slate-900",
    card: "border border-slate-800",
    chip: "bg-slate-800 text-slate-400",
    line: "bg-slate-800",
    modes: {
      plane: "bg-sky-900 text-sky-300",
      train: "bg-violet-900 text-violet-300",
      car: "bg-amber-900 text-amber-300",
      bus: "bg-emerald-900 text-emerald-300",
      bed: "bg-rose-900 text-rose-300",
      start: "bg-slate-800 text-slate-300",
    },
    primaryBtn: "text-slate-900 bg-slate-100 hover:bg-white",
    ghostBtn: "text-slate-500 hover:bg-slate-800 hover:text-slate-200",
    co2ok: "text-emerald-400",
    co2warn: "text-amber-400",
    navBar: "bg-slate-950 border-t border-slate-800",
    navIdle: "text-slate-600",
    navActive: "text-slate-100",
  },
};

function TripCard({ trip, t, expanded, onToggle }) {
  const shownLegs = expanded ? trip.legs : trip.legs.slice(0, 4);
  const hidden = trip.legs.length - shownLegs.length;
  const heavyCo2 = parseInt(trip.co2.replace(/\s/g, "")) > 1000;

  return (
    <article className={`rounded-xl ${t.card}`}>
      {/* En-tête */}
      <header className="flex items-start justify-between p-4 pb-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{trip.name}</h2>
          <p className={`text-xs mt-0.5 ${t.subtle}`}>{trip.dates}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${t.chip}`}>
            {trip.legs.length} étapes
          </span>
          <button className={`w-7 h-7 flex items-center justify-center rounded-md text-lg leading-none transition-colors ${t.ghostBtn}`} aria-label="Ajouter un trajet">
            +
          </button>
        </div>
      </header>

      {/* Timeline verticale des étapes */}
      <div className="px-4">
        <ol className="relative">
          {shownLegs.map((leg, i) => (
            <li key={i} className="flex gap-3 relative pb-3 last:pb-1">
              {/* Ligne verticale */}
              {i < shownLegs.length - 1 && (
                <span className={`absolute left-[13px] top-7 bottom-0 w-px ${t.line}`} />
              )}
              <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center ${t.modes[leg.mode] || t.modes.start}`} title={MODE_LABEL[leg.mode]}>
                <Icon mode={leg.mode} className="w-4 h-4" />
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-sm truncate">
                  {leg.from}
                  <span className={`ml-1.5 text-[10px] font-medium uppercase ${t.faint}`}>{leg.cc}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
        {hidden > 0 && !expanded && (
          <button onClick={onToggle} className={`text-xs font-medium mb-2 ml-10 ${t.subtle} hover:underline`}>
            + {hidden} autres étapes
          </button>
        )}
        {expanded && trip.legs.length > 4 && (
          <button onClick={onToggle} className={`text-xs font-medium mb-2 ml-10 ${t.subtle} hover:underline`}>
            Réduire
          </button>
        )}
      </div>

      {/* Stats — ligne sobre séparée par bordure fine */}
      <footer className={`flex items-center gap-6 px-4 py-3 mt-1 border-t text-sm ${t.border}`}>
        <div>
          <span className="font-semibold">{trip.km}</span>
          <span className={`ml-1 text-xs ${t.subtle}`}>km</span>
        </div>
        <div>
          <span className={`font-semibold ${heavyCo2 ? t.co2warn : t.co2ok}`}>{trip.co2}</span>
          <span className={`ml-1 text-xs ${t.subtle}`}>kg CO₂</span>
        </div>
        {trip.cost && (
          <div className="ml-auto">
            <span className="font-semibold">{trip.cost}</span>
            <span className={`ml-1 text-xs ${t.subtle}`}>total</span>
          </div>
        )}
      </footer>
    </article>
  );
}

export default function JourneyPlannerRedesign() {
  const [theme, setTheme] = useState("dark");
  const [expandedId, setExpandedId] = useState(null);
  const t = T[theme];

  return (
    <div className={`min-h-screen transition-colors ${t.page}`} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 pb-24">

        {/* Header */}
        <header className="flex items-end justify-between pt-8 pb-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Mes voyages</h1>
            <p className={`text-xs mt-0.5 ${t.subtle}`}>{TRIPS.length} voyages enregistrés</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Changer de thème"
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${t.ghostBtn}`}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <button className={`text-sm font-medium rounded-lg px-3.5 py-2 transition-colors ${t.primaryBtn}`}>
              + Voyage
            </button>
          </div>
        </header>

        {/* Liste des voyages */}
        <div className="space-y-4">
          {TRIPS.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              t={t}
              expanded={expandedId === trip.id}
              onToggle={() => setExpandedId(expandedId === trip.id ? null : trip.id)}
            />
          ))}
        </div>

        {/* Barre de navigation basse (mobile) */}
        <nav className={`fixed bottom-0 left-0 right-0 ${t.navBar}`}>
          <div className="max-w-xl mx-auto flex items-center justify-around py-2.5 text-[10px] font-medium">
            {[
              ["Accueil", "M3 11l9-8 9 8M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9"],
              ["Voyages", "M10.5 20l2-6.5L19 7l-1.5-1.5L11 12 4.5 10 3 11.5l5.5 2.5L10.5 20z"],
              ["Ajouter", "M12 5v14M5 12h14"],
              ["Agenda", "M8 3v3M16 3v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"],
              ["Carte", "M9 4l6 2 6-2v14l-6 2-6-2-6 2V6l6-2zM9 4v14M15 6v14"],
            ].map(([label, d], i) => (
              <button key={label} className={`flex flex-col items-center gap-1 px-3 ${i === 1 ? t.navActive : t.navIdle}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d={d} />
                </svg>
                {label}
              </button>
            ))}
          </div>
        </nav>

        <footer className={`pt-6 text-[11px] ${t.faint}`}>
          Maquette de refonte — Journey Planner Plus · thème {theme === "light" ? "clair" : "sombre"}
        </footer>
      </div>
    </div>
  );
}
