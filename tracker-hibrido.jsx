import { useState, useEffect, useRef, useMemo } from "react";

/* ============================================================
   TRACKER HÍBRIDO — App de gimnasio
   Plan 8 semanas · Hipertrofia + Dominadas + Norwegian 4×4
   Estética: minimalista, foco total, "menos pero mejor"
   ============================================================ */

const C = {
  bg: "#060D1A",
  surface: "#0B1524",
  card: "#0E1B2E",
  line: "rgba(255,255,255,0.08)",
  text: "#EAF1FA",
  mut: "#7E8CA3",
  cyan: "#22D3EE",
  vio: "#7C3AED",
  ok: "#34D399",
  warn: "#F59E0B",
  red: "#F87171",
};

/* ---------- Persistencia (window.storage con fallback) ---------- */
const mem = {};
const store = {
  async get(k) {
    try {
      const r = await window.storage.get(k);
      return r && r.value ? JSON.parse(r.value) : null;
    } catch (e) {
      return mem[k] || null;
    }
  },
  async set(k, v) {
    mem[k] = v;
    try {
      await window.storage.set(k, JSON.stringify(v));
    } catch (e) {}
  },
};

/* ---------- Datos del programa ---------- */
const PULLUP_TARGETS = { 1: "8", 2: "10", 3: "12", 4: "6", 5: "12", 6: "14", 7: "16", 8: "MÁX" };
const ASSIST_TARGETS = {
  1: "4 × 6 con banda", 2: "4 × 7", 3: "4 × 8", 4: "2 × 6 suave",
  5: "Banda ligera · 4 × 6", 6: "4 × 7", 7: "4 × 8–10", 8: "3 × 6 suave",
};
const WEEK_NOTES = {
  1: "Calibración · RIR 3 · pesos conservadores",
  2: "Añade 1 rep por serie · RIR 2–3",
  3: "Primera sobrecarga · +2.5–5% arriba",
  4: "DESCARGA · reduce series 40–50% · RIR 4",
  5: "Reinicio productivo · RIR 2",
  6: "Sobrecarga · fallo permitido en última serie de aislamientos",
  7: "Mayor estímulo · compuestos RIR 1",
  8: "EVALUACIÓN · −30–40% volumen · prueba máx. dominadas",
};

const mkEx = (id, name, scheme, rir, rest, icon, tip) => ({ id, name, scheme, rir, rest, icon, tip });

const ROUTINE = {
  1: {
    title: "Tracción",
    sub: "Espalda · Dominadas · Bíceps · Pantorrillas",
    accent: C.cyan,
    warmup: ["Caminata rápida 3 min", "Rotaciones torácicas 8/lado", "Dominadas escapulares 2×6–8", "Jalón brazos rectos con banda 2×12", "Series progresivas del primer jalón"],
    exercises: [
      { id: "pullups", name: "Dominadas estrictas", special: "pullups", rest: 120, icon: "pullup", tip: "Inicia desde brazos extendidos · depresión escapular primero · pecho a la barra · sin balanceo. Series de 1–2 reps hasta completar el objetivo semanal." },
      mkEx("jalon", "Jalón al pecho (neutro o supino)", "3 × 6–10", "2", 150, "pulldown"),
      mkEx("remo-apoyo", "Remo con pecho apoyado", "3 × 8–12", "2", 120, "row"),
      mkEx("remo-uni", "Remo unilateral en polea", "2 × 10–14 /lado", "2", 90, "cablerow"),
      mkEx("apertura-inv", "Apertura inversa (máquina/polea)", "3 × 12–20", "1–2", 75, "reversefly"),
      mkEx("curl-inc", "Curl inclinado con mancuernas", "3 × 8–12", "1–2", 75, "curl"),
      mkEx("curl-mart", "Curl martillo", "2 × 10–15", "1–2", 75, "hammer"),
      mkEx("pant-pie", "Pantorrilla de pie", "4 × 8–12", "1–2", 75, "calf"),
    ],
  },
  2: {
    title: "Empuje",
    sub: "Pecho · Hombros · Tríceps · Abdomen",
    accent: C.vio,
    warmup: ["Caminata rápida 3 min", "Círculos de hombros 10/dirección", "Rotación externa con banda 2×12", "Flexiones escapulares 2×8", "Series progresivas del press inclinado"],
    exercises: [
      mkEx("press-inc", "Press inclinado (barra o mancuernas)", "3 × 5–8", "2", 180, "inclinepress", "Nunca al fallo."),
      mkEx("press-pecho", "Press de pecho en máquina", "3 × 8–12", "2", 120, "chestpress"),
      mkEx("press-hombro", "Press de hombro en máquina", "3 × 6–10", "2", 120, "shoulderpress"),
      mkEx("fondos", "Fondos en paralelas", "2 × 6–10", "2", 120, "dips", "Rango completo y controlado. Al lograr 2×10 con RIR 2, añade carga ligera. No profundices si hay tensión incómoda en hombros."),
      mkEx("laterales", "Elevación lateral (polea/máquina)", "4 × 12–20", "1–2", 75, "lateral"),
      mkEx("triceps-cuerda", "Extensión de tríceps con cuerda", "3 × 10–15", "1–2", 75, "triceps"),
      mkEx("rodillas", "Elevaciones de rodillas colgado", "3 × 8–15", "2", 60, "kneeraise"),
      mkEx("pallof", "Press Pallof", "2 × 10–15 /lado", "2", 60, "pallof"),
    ],
  },
  3: { rest: true, title: "Descanso", sub: "Recuperación activa · camina · duerme bien" },
  4: {
    title: "Piernas",
    sub: "Piernas · Pantorrillas · Abdomen",
    accent: C.cyan,
    warmup: ["Caminata con inclinación 4 min", "Movilidad de tobillo 10/lado", "Cadera 90/90 8/lado", "Sentadilla peso corporal 2×10", "Bisagra de cadera 2×10", "Series progresivas de prensa"],
    exercises: [
      mkEx("prensa", "Prensa inclinada", "4 × 6–10", "2", 180, "legpress"),
      mkEx("rdl", "Peso muerto rumano", "3 × 6–10", "2–3", 180, "rdl", "Rodillas semiflexionadas · barra pegada al cuerpo · tensión en isquios · detén antes de perder neutralidad. Mínimo RIR 2."),
      mkEx("bulgara", "Sentadilla búlgara", "3 × 8–12 /pierna", "2", 120, "bulgarian"),
      mkEx("femoral", "Curl femoral (sentado/acostado)", "3 × 10–15", "1–2", 75, "legcurl"),
      mkEx("cuadriceps", "Extensión de cuádriceps", "2 × 12–15", "1–2", 75, "legext"),
      mkEx("pant-sent", "Pantorrilla sentado o en prensa", "4 × 10–15", "1", 75, "calf"),
      mkEx("abwheel", "Ab wheel", "3 × 6–12", "2", 60, "abwheel"),
      mkEx("plancha-lat", "Plancha lateral", "2 × 25–45 s /lado", "técnica", 45, "sideplank"),
    ],
  },
  5: {
    title: "Torso mixto",
    sub: "2ª sesión de dominadas · Piernas ligeras",
    accent: C.vio,
    warmup: ["Caminata rápida 3 min", "Dominadas escapulares 2×6", "Rotación externa con banda 2×12", "Serie ligera de remo y press"],
    exercises: [
      { id: "pullups-band", name: "Dominadas asistidas con banda", special: "assist", rest: 120, icon: "bandpull", tip: "Cuando completes 4×10 con RIR 2, cambia a una banda con menos asistencia." },
      mkEx("remo-apoyo2", "Remo con pecho apoyado", "3 × 8–12", "2", 120, "row"),
      mkEx("press-hombro2", "Press de hombro en máquina", "2 × 8–12", "2", 120, "shoulderpress"),
      mkEx("apertura", "Apertura de pecho en polea", "2 × 12–15", "1–2", 75, "fly"),
      mkEx("laterales2", "Elevaciones laterales", "3 × 12–20", "1–2", 75, "lateral"),
      mkEx("predicador", "Curl predicador (máquina/polea)", "3 × 8–12", "1–2", 75, "curl"),
      mkEx("triceps-oh", "Extensión de tríceps sobre la cabeza", "2 × 10–15", "1–2", 75, "tricepsoh"),
      mkEx("super-piernas", "Superserie: ext. cuádriceps + curl femoral", "2 × 12–15 c/u", "3", 60, "legext", "Ligera. No comprometas el 4×4 de mañana."),
      mkEx("pant-maq", "Pantorrilla en máquina", "3 × 12–20", "1–2", 60, "calf"),
    ],
  },
  6: { cardio: true, title: "Norwegian 4×4", sub: "Cardio · Abdomen · Movilidad", accent: C.cyan },
  0: { rest: true, title: "Descanso", sub: "Domingo · desconecta y recupera" },
};

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LETTER = { 1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S", 0: "D" };
const DAY_NAME = { 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 0: "Domingo" };

const ABS_SAT = ["Dead bug controlado · 2 × 8–12 /lado", "Hollow-body hold · 3 × 15–30 s", "Bird dog con pausa · 2 × 8 /lado"];
const MOB_SAT = ["Cadera 90/90 · 2 × 8", "Flexor de cadera · 2 × 40 s /lado", "Tobillo contra pared · 2 × 10 /lado", "Open book torácico · 2 × 8 /lado", "Estiramiento de dorsal · 2 × 40 s", "Deslizamientos en pared · 2 × 10", "Muñecas en cuatro apoyos · 2 × 10", "Colgado de barra · 2 × 20–30 s"];

/* ---------- Iconos SVG de ejercicios (line-art propio) ---------- */
const P = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const ICONS = {
  pullup: (
    <g {...P}>
      <line x1="10" y1="10" x2="54" y2="10" strokeWidth="2.6" />
      <circle cx="32" cy="22" r="4.2" />
      <path d="M22 10 L28 19 M42 10 L36 19" />
      <path d="M32 26 L32 41 M32 41 L26 54 M32 41 L38 54" />
    </g>
  ),
  bandpull: (
    <g {...P}>
      <line x1="10" y1="10" x2="54" y2="10" strokeWidth="2.6" />
      <circle cx="32" cy="22" r="4.2" />
      <path d="M22 10 L28 19 M42 10 L36 19" />
      <path d="M32 26 L32 40 M32 40 L27 52 M32 40 L37 52" />
      <path d="M26 10 Q22 34 30 51" strokeDasharray="3 3" opacity="0.7" />
    </g>
  ),
  pulldown: (
    <g {...P}>
      <path d="M12 10 Q32 4 52 10" strokeWidth="2.4" />
      <path d="M18 11 L26 22 M46 11 L38 22" />
      <circle cx="32" cy="26" r="4.2" />
      <path d="M32 30 L32 44 L44 44 L44 56 M32 44 L28 56" />
    </g>
  ),
  row: (
    <g {...P}>
      <path d="M10 52 L44 24" strokeWidth="2.4" />
      <circle cx="48" cy="20" r="4.2" />
      <path d="M38 30 L38 46" />
      <rect x="33" y="46" width="10" height="4" rx="1.5" />
      <path d="M20 52 L20 58 M36 40 L36 58" opacity="0.5" />
    </g>
  ),
  cablerow: (
    <g {...P}>
      <circle cx="54" cy="24" r="4" />
      <path d="M50 24 L34 30" strokeDasharray="3 3" opacity="0.8" />
      <circle cx="24" cy="20" r="4.2" />
      <path d="M24 24 L24 40 L36 40 L36 54 M24 40 L18 54 M26 28 L34 30" />
    </g>
  ),
  reversefly: (
    <g {...P}>
      <circle cx="32" cy="16" r="4.2" />
      <path d="M32 20 L32 38 M32 38 L26 54 M32 38 L38 54" />
      <path d="M30 26 Q16 22 10 28 M34 26 Q48 22 54 28" />
      <path d="M12 24 L10 28 L14 30 M52 24 L54 28 L50 30" opacity="0.7" />
    </g>
  ),
  fly: (
    <g {...P}>
      <circle cx="32" cy="16" r="4.2" />
      <path d="M32 20 L32 40 M32 40 L26 55 M32 40 L38 55" />
      <path d="M30 27 Q18 30 14 26 M34 27 Q46 30 50 26" />
      <circle cx="13" cy="25" r="2.2" /> <circle cx="51" cy="25" r="2.2" />
    </g>
  ),
  curl: (
    <g {...P}>
      <circle cx="30" cy="13" r="4.2" />
      <path d="M30 17 L30 38 M30 38 L25 55 M30 38 L36 55" />
      <path d="M30 22 L38 30 L36 18" />
      <circle cx="35.5" cy="15.5" r="3" />
    </g>
  ),
  hammer: (
    <g {...P}>
      <circle cx="30" cy="13" r="4.2" />
      <path d="M30 17 L30 38 M30 38 L25 55 M30 38 L36 55" />
      <path d="M30 22 L39 28 L42 20" />
      <rect x="39" y="14" width="6" height="7" rx="1.5" />
    </g>
  ),
  calf: (
    <g {...P}>
      <rect x="20" y="50" width="24" height="7" rx="1.5" />
      <circle cx="32" cy="10" r="4.2" />
      <path d="M32 14 L32 32 M32 32 L31 44 L31 50 M32 32 L34 44 L34 50" />
      <path d="M27 50 L27 46 M38 50 L38 46" opacity="0.6" />
      <path d="M46 40 L46 32 M43 35 L46 32 L49 35" opacity="0.7" />
    </g>
  ),
  inclinepress: (
    <g {...P}>
      <path d="M12 54 L34 34 L48 34" strokeWidth="2.4" />
      <circle cx="38" cy="26" r="4" />
      <path d="M34 30 L42 20" />
      <line x1="26" y1="14" x2="58" y2="14" strokeWidth="2.6" />
      <path d="M40 22 L42 15" />
      <rect x="28" y="10" width="4" height="8" rx="1" /> <rect x="52" y="10" width="4" height="8" rx="1" />
    </g>
  ),
  chestpress: (
    <g {...P}>
      <circle cx="20" cy="18" r="4.2" />
      <path d="M20 22 L20 42 L32 42 L32 56 M20 42 L15 56" />
      <path d="M22 27 L40 27 M22 33 L40 33" />
      <rect x="40" y="24" width="5" height="12" rx="1.5" />
    </g>
  ),
  shoulderpress: (
    <g {...P}>
      <circle cx="32" cy="22" r="4.2" />
      <path d="M32 26 L32 44 L42 44 L42 56 M32 44 L26 56" />
      <path d="M26 20 L22 10 M38 20 L42 10" />
      <line x1="16" y1="9" x2="48" y2="9" strokeWidth="2.4" />
    </g>
  ),
  dips: (
    <g {...P}>
      <path d="M14 20 L14 56 M50 20 L50 56" strokeWidth="2.4" />
      <path d="M10 20 L20 20 M44 20 L54 20" strokeWidth="2.4" />
      <circle cx="32" cy="16" r="4.2" />
      <path d="M32 20 L32 36 M32 36 L28 50 M32 36 L37 48" />
      <path d="M29 24 L17 21 M35 24 L47 21" />
    </g>
  ),
  lateral: (
    <g {...P}>
      <circle cx="32" cy="13" r="4.2" />
      <path d="M32 17 L32 38 M32 38 L26 55 M32 38 L38 55" />
      <path d="M30 23 L14 26 M34 23 L50 26" />
      <circle cx="12" cy="27" r="2.4" /> <circle cx="52" cy="27" r="2.4" />
    </g>
  ),
  triceps: (
    <g {...P}>
      <circle cx="32" cy="6" r="2" />
      <path d="M32 8 L32 22" strokeDasharray="3 3" opacity="0.8" />
      <circle cx="26" cy="18" r="4.2" />
      <path d="M26 22 L26 42 M26 42 L22 56 M26 42 L31 56" />
      <path d="M28 27 L34 30 L34 40" />
      <path d="M30 41 L38 41" />
    </g>
  ),
  tricepsoh: (
    <g {...P}>
      <circle cx="32" cy="16" r="4.2" />
      <path d="M32 20 L32 42 M32 42 L26 56 M32 42 L38 56" />
      <path d="M29 22 L24 12 L28 6 M35 22 L40 12 L36 6" />
      <circle cx="32" cy="5" r="2.6" />
    </g>
  ),
  kneeraise: (
    <g {...P}>
      <line x1="12" y1="9" x2="52" y2="9" strokeWidth="2.6" />
      <path d="M24 9 L28 18 M40 9 L36 18" />
      <circle cx="32" cy="21" r="4.2" />
      <path d="M32 25 L32 38 M32 38 L42 36 M42 36 L42 46" />
    </g>
  ),
  pallof: (
    <g {...P}>
      <path d="M8 24 L8 40" strokeWidth="2.4" />
      <path d="M8 30 L26 30" strokeDasharray="3 3" opacity="0.8" />
      <circle cx="34" cy="14" r="4.2" />
      <path d="M34 18 L34 40 M34 40 L28 56 M34 40 L40 56" />
      <path d="M34 26 L26 30 M34 26 L27 33" />
    </g>
  ),
  legpress: (
    <g {...P}>
      <path d="M44 12 L56 40" strokeWidth="2.6" />
      <circle cx="16" cy="34" r="4.2" />
      <path d="M18 38 L26 46 M26 46 L38 34 M38 34 L47 27" />
      <path d="M12 46 L34 56" opacity="0.5" />
    </g>
  ),
  rdl: (
    <g {...P}>
      <circle cx="46" cy="22" r="4.2" />
      <path d="M43 25 L26 33 M26 33 L26 56" />
      <path d="M40 29 L40 42" />
      <line x1="30" y1="42" x2="50" y2="42" strokeWidth="2.4" />
      <circle cx="30" cy="42" r="3.4" /> <circle cx="50" cy="42" r="3.4" />
    </g>
  ),
  bulgarian: (
    <g {...P}>
      <rect x="42" y="38" width="14" height="10" rx="1.5" />
      <circle cx="24" cy="12" r="4.2" />
      <path d="M24 16 L24 32 M24 32 L18 42 L18 56 M24 32 L36 36 L44 38" />
    </g>
  ),
  legcurl: (
    <g {...P}>
      <path d="M8 40 L40 40" strokeWidth="2.4" />
      <circle cx="12" cy="35" r="4" />
      <path d="M16 38 L38 38 M38 38 L46 30" />
      <circle cx="48" cy="28" r="3" />
    </g>
  ),
  legext: (
    <g {...P}>
      <circle cx="22" cy="16" r="4.2" />
      <path d="M22 20 L22 38 L36 38 M36 38 L50 34" />
      <circle cx="52" cy="33" r="3" />
      <path d="M18 38 L18 56" opacity="0.6" />
    </g>
  ),
  abwheel: (
    <g {...P}>
      <circle cx="46" cy="46" r="7" />
      <circle cx="46" cy="46" r="1.6" />
      <circle cx="16" cy="24" r="4.2" />
      <path d="M16 28 L20 42 L14 52 M19 32 L40 44" />
    </g>
  ),
  sideplank: (
    <g {...P}>
      <circle cx="14" cy="26" r="4.2" />
      <path d="M17 29 L52 44" strokeWidth="2.4" />
      <path d="M20 32 L20 44 M46 42 L52 52" />
    </g>
  ),
  run: (
    <g {...P}>
      <path d="M8 52 L56 52 L50 58 L14 58 Z" />
      <circle cx="34" cy="14" r="4.2" />
      <path d="M34 18 L32 32 M32 32 L24 40 L28 50 M32 32 L42 38 L42 48 M34 22 L44 24 M34 22 L26 18" />
    </g>
  ),
  mobility: (
    <g {...P}>
      <circle cx="20" cy="18" r="4.2" />
      <path d="M20 22 L26 36 L48 36 M26 36 L14 48 M48 36 L54 30" />
    </g>
  ),
};
const Icon = ({ t, size = 56, color = C.cyan, style }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} style={{ color, ...style }} aria-hidden="true">
    {ICONS[t] || ICONS.mobility}
  </svg>
);

/* ---------- Utilidades ---------- */
const todayKey = () => new Date().getDay();
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const isoDate = () => new Date().toISOString().slice(0, 10);
const beep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; g.gain.value = 0.15;
    o.start(); o.stop(ctx.currentTime + 0.35);
  } catch (e) {}
  if (navigator.vibrate) navigator.vibrate([220, 90, 220]);
};

/* ---------- Componentes base ---------- */
const Chip = ({ active, onClick, children, color = C.cyan }) => (
  <button
    onClick={onClick}
    style={{
      padding: "7px 13px", borderRadius: 99, fontSize: 14, fontWeight: 600,
      fontFamily: "'Space Grotesk', sans-serif",
      background: active ? color : "rgba(255,255,255,0.05)",
      color: active ? "#04121C" : C.mut,
      border: `1px solid ${active ? color : C.line}`,
      cursor: "pointer", transition: "all .18s ease",
    }}
  >
    {children}
  </button>
);

const NumInput = ({ value, onChange, placeholder, width = 64, suffix }) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
    <input
      type="number" inputMode="decimal" value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width, padding: "10px 8px", borderRadius: 12, textAlign: "center",
        background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}`,
        color: C.text, fontSize: 16, fontFamily: "'Space Grotesk', sans-serif", outline: "none",
      }}
    />
    {suffix && <span style={{ position: "absolute", right: 6, fontSize: 10, color: C.mut }}>{suffix}</span>}
  </div>
);

const Btn = ({ onClick, children, kind = "primary", style, disabled }) => {
  const base = {
    primary: { background: `linear-gradient(135deg, ${C.cyan}, ${C.vio})`, color: "#050B14", border: "none" },
    ghost: { background: "rgba(255,255,255,0.05)", color: C.text, border: `1px solid ${C.line}` },
    danger: { background: "rgba(248,113,113,0.12)", color: C.red, border: `1px solid rgba(248,113,113,0.3)` },
  }[kind];
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        ...base, padding: "14px 22px", borderRadius: 16, fontSize: 16, fontWeight: 700,
        fontFamily: "'Space Grotesk', sans-serif", cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1, transition: "transform .12s ease", width: "100%",
        ...style,
      }}
      onPointerDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.97)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
};

/* ---------- Timer de descanso (overlay) ---------- */
function RestOverlay({ seconds, onClose }) {
  const [left, setLeft] = useState(seconds);
  const [total, setTotal] = useState(seconds);
  const done = left <= 0;
  useEffect(() => {
    if (done) { beep(); return; }
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [done]);
  const R = 88, circ = 2 * Math.PI * R;
  const prog = Math.max(0, left / total);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60, background: "rgba(4,9,18,0.96)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: "fadeIn .25s ease", padding: 24,
    }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.mut, letterSpacing: 3, fontSize: 13, textTransform: "uppercase", marginBottom: 18 }}>
        {done ? "¡A la siguiente serie!" : "Descanso"}
      </div>
      <div style={{ position: "relative", width: 220, height: 220 }}>
        <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="110" cy="110" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <circle cx="110" cy="110" r={R} fill="none" stroke={done ? C.ok : C.cyan} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)}
            style={{ transition: "stroke-dashoffset 1s linear, stroke .3s" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, color: done ? C.ok : C.text, letterSpacing: 2,
        }}>
          {done ? "GO" : fmtTime(left)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 30, width: "100%", maxWidth: 320 }}>
        {!done && <Btn kind="ghost" onClick={() => { setLeft((l) => l + 30); setTotal((t) => t + 30); }}>+30 s</Btn>}
        <Btn onClick={onClose}>{done ? "Continuar" : "Saltar"}</Btn>
      </div>
    </div>
  );
}

/* ---------- Tarjeta de ejercicio ---------- */
function SetRow({ n, data, onChange, onDone, accent }) {
  const d = data || {};
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
      borderBottom: `1px solid ${C.line}`, opacity: d.done ? 0.9 : 1,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 99, flexShrink: 0, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
        background: d.done ? accent : "rgba(255,255,255,0.06)", color: d.done ? "#04121C" : C.mut,
        transition: "all .2s",
      }}>{n}</div>
      <NumInput value={d.kg ?? ""} onChange={(v) => onChange({ ...d, kg: v })} placeholder="kg" width={62} />
      <span style={{ color: C.mut, fontSize: 13 }}>×</span>
      <NumInput value={d.reps ?? ""} onChange={(v) => onChange({ ...d, reps: v })} placeholder="reps" width={62} />
      <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
        {[0, 1, 2, 3].map((r) => (
          <button key={r} onClick={() => onChange({ ...d, rir: d.rir === r ? null : r })}
            style={{
              width: 28, height: 28, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              background: d.rir === r ? C.vio : "rgba(255,255,255,0.05)",
              color: d.rir === r ? "#fff" : C.mut, border: `1px solid ${d.rir === r ? C.vio : C.line}`,
            }}>{r}</button>
        ))}
      </div>
      <button onClick={onDone}
        style={{
          width: 34, height: 34, borderRadius: 12, flexShrink: 0, cursor: "pointer",
          background: d.done ? C.ok : "rgba(255,255,255,0.05)", border: `1px solid ${d.done ? C.ok : C.line}`,
          color: d.done ? "#04121C" : C.mut, fontSize: 16, transition: "all .2s",
        }}>✓</button>
    </div>
  );
}

function parseSetCount(scheme) {
  const m = /^(\d+)\s*×/.exec(scheme || "");
  return m ? parseInt(m[1], 10) : 3;
}

function ExerciseCard({ ex, week, data, onData, onRest, accent }) {
  const [showTip, setShowTip] = useState(false);
  const isPull = ex.special === "pullups";
  const isAssist = ex.special === "assist";
  const setCount = isAssist ? parseInt(ASSIST_TARGETS[week], 10) || 4 : parseSetCount(ex.scheme);
  const sets = data.sets || [];
  const note = data.note || "";
  const target = isPull ? PULLUP_TARGETS[week] : isAssist ? ASSIST_TARGETS[week] : null;

  const setSet = (i, v) => {
    const ns = [...sets]; ns[i] = v; onData({ ...data, sets: ns });
  };
  const markDone = (i) => {
    const d = sets[i] || {};
    const ns = [...sets]; ns[i] = { ...d, done: !d.done };
    onData({ ...data, sets: ns });
    if (!d.done) onRest(ex.rest);
  };

  const pullTotal = data.pullTotal || 0;
  const pullGoal = week === 8 ? null : parseInt(PULLUP_TARGETS[week], 10);

  return (
    <div style={{
      background: C.card, borderRadius: 24, border: `1px solid ${C.line}`, padding: 22,
      animation: "slideUp .35s ease",
    }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{
          width: 76, height: 76, borderRadius: 20, flexShrink: 0,
          background: "rgba(255,255,255,0.04)", border: `1px solid ${C.line}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon t={ex.icon} size={54} color={accent} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, lineHeight: 1.25 }}>{ex.name}</div>
          <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {target
              ? <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: accent, letterSpacing: 1 }}>
                  {isPull ? `${target} REPS TOTALES` : target.toUpperCase()}
                </span>
              : <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: accent, letterSpacing: 1 }}>{ex.scheme}</span>}
            {ex.rir && <span style={{ fontSize: 12, color: C.mut, background: "rgba(255,255,255,0.05)", padding: "3px 9px", borderRadius: 99, border: `1px solid ${C.line}` }}>RIR {ex.rir}</span>}
            <span style={{ fontSize: 12, color: C.mut }}>⏱ {fmtTime(ex.rest)}</span>
          </div>
        </div>
      </div>

      {ex.tip && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setShowTip(!showTip)} style={{
            background: "none", border: "none", color: C.cyan, fontSize: 13, cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif", padding: 0,
          }}>{showTip ? "− Ocultar técnica" : "+ Ver técnica"}</button>
          {showTip && <div style={{ marginTop: 8, fontSize: 13.5, color: C.mut, lineHeight: 1.55, background: "rgba(34,211,238,0.05)", border: `1px solid rgba(34,211,238,0.15)`, borderRadius: 14, padding: 12 }}>{ex.tip}</div>}
        </div>
      )}

      {isPull ? (
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 88, lineHeight: 1, color: C.text }}>
            {pullTotal}<span style={{ fontSize: 34, color: C.mut }}>{pullGoal ? ` / ${pullGoal}` : ""}</span>
          </div>
          <div style={{ fontSize: 12, color: C.mut, letterSpacing: 2, textTransform: "uppercase" }}>dominadas estrictas acumuladas</div>
          {pullGoal && (
            <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", margin: "14px 0", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, (pullTotal / pullGoal) * 100)}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.vio})`, transition: "width .4s ease", borderRadius: 99 }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Btn kind="ghost" onClick={() => onData({ ...data, pullTotal: Math.max(0, pullTotal - 1) })} style={{ flex: 1 }}>−1</Btn>
            <Btn onClick={() => { onData({ ...data, pullTotal: pullTotal + 1 }); onRest(ex.rest); }} style={{ flex: 2 }}>+1 rep</Btn>
            <Btn kind="ghost" onClick={() => { onData({ ...data, pullTotal: pullTotal + 2 }); onRest(ex.rest); }} style={{ flex: 1 }}>+2</Btn>
          </div>
          {pullGoal && pullTotal >= pullGoal && (
            <div style={{ marginTop: 12, color: C.ok, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>🎯 Objetivo semanal completado</div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>
          {Array.from({ length: setCount }).map((_, i) => (
            <SetRow key={i} n={i + 1} data={sets[i]} accent={accent}
              onChange={(v) => setSet(i, v)} onDone={() => markDone(i)} />
          ))}
        </div>
      )}

      <textarea
        value={note} onChange={(e) => onData({ ...data, note: e.target.value })}
        placeholder="Notas · sensaciones, ajustes de peso, técnica…"
        rows={2}
        style={{
          marginTop: 16, width: "100%", boxSizing: "border-box", borderRadius: 14, padding: 12,
          background: "rgba(255,255,255,0.04)", border: `1px solid ${C.line}`, color: C.text,
          fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", resize: "vertical", outline: "none",
        }}
      />
    </div>
  );
}

/* ---------- Vista de sesión de fuerza ---------- */
function SessionView({ dayKey, week, log, setLog, onFinish, onBack }) {
  const day = ROUTINE[dayKey];
  const [idx, setIdx] = useState(0);
  const [rest, setRest] = useState(null);
  const [showWarmup, setShowWarmup] = useState(true);
  const exs = day.exercises;
  const ex = exs[idx];
  const exData = (log.ex && log.ex[ex.id]) || {};
  const setExData = (v) => setLog({ ...log, ex: { ...(log.ex || {}), [ex.id]: v } });

  const doneCount = exs.filter((e) => {
    const d = (log.ex && log.ex[e.id]) || {};
    if (e.special === "pullups") return (d.pullTotal || 0) > 0;
    return (d.sets || []).some((s) => s && s.done);
  }).length;

  return (
    <div style={{ paddingBottom: 120 }}>
      <header style={{ padding: "18px 4px 8px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.line}`, borderRadius: 12, color: C.text, width: 40, height: 40, fontSize: 18, cursor: "pointer" }}>‹</button>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1.5, lineHeight: 1 }}>{day.title}</div>
          <div style={{ fontSize: 12.5, color: C.mut }}>{DAY_NAME[dayKey]} · Semana {week}</div>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: day.accent }}>
          {doneCount}/{exs.length}
        </div>
      </header>

      {/* barra de progreso */}
      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", margin: "6px 0 16px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((idx + 1) / exs.length) * 100}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.vio})`, transition: "width .35s ease" }} />
      </div>

      {showWarmup && (
        <div style={{ background: "rgba(124,58,237,0.08)", border: `1px solid rgba(124,58,237,0.25)`, borderRadius: 20, padding: 18, marginBottom: 16, animation: "slideUp .3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1.5, color: C.vio === day.accent ? C.cyan : C.vio }}>CALENTAMIENTO</span>
            <button onClick={() => setShowWarmup(false)} style={{ background: "none", border: "none", color: C.mut, cursor: "pointer", fontSize: 13 }}>Listo ✓</button>
          </div>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: C.mut, fontSize: 13.5, lineHeight: 1.8 }}>
            {day.warmup.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <ExerciseCard ex={ex} week={week} data={exData} onData={setExData} onRest={(s) => setRest(s)} accent={day.accent} />

      {/* navegación entre ejercicios */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "18px 0" }}>
        {exs.map((e, i) => {
          const d = (log.ex && log.ex[e.id]) || {};
          const has = e.special === "pullups" ? (d.pullTotal || 0) > 0 : (d.sets || []).some((s) => s && s.done);
          return (
            <button key={e.id} onClick={() => setIdx(i)} aria-label={e.name}
              style={{
                width: i === idx ? 24 : 9, height: 9, borderRadius: 99, border: "none", cursor: "pointer",
                background: i === idx ? day.accent : has ? C.ok : "rgba(255,255,255,0.15)",
                transition: "all .25s ease",
              }} />
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Btn kind="ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>Anterior</Btn>
        {idx < exs.length - 1
          ? <Btn onClick={() => setIdx(idx + 1)}>Siguiente</Btn>
          : <Btn onClick={onFinish} style={{ background: C.ok, color: "#04121C" }}>Terminar sesión</Btn>}
      </div>

      {rest !== null && <RestOverlay seconds={rest} onClose={() => setRest(null)} />}
    </div>
  );
}

/* ---------- Norwegian 4×4 ---------- */
const CARDIO_PHASES = [
  { label: "Calentamiento", dur: 600, zone: "60–70% FCmáx", tip: "Termina caliente, aún pudiendo hablar" },
  { label: "Intervalo 1", dur: 240, zone: "85–95% FCmáx", hot: true, log: 0 },
  { label: "Recuperación", dur: 180, zone: "60–70% FCmáx" },
  { label: "Intervalo 2", dur: 240, zone: "85–95% FCmáx", hot: true, log: 1 },
  { label: "Recuperación", dur: 180, zone: "60–70% FCmáx" },
  { label: "Intervalo 3", dur: 240, zone: "85–95% FCmáx", hot: true, log: 2 },
  { label: "Recuperación", dur: 180, zone: "60–70% FCmáx" },
  { label: "Intervalo 4", dur: 240, zone: "85–95% FCmáx", hot: true, log: 3 },
  { label: "Vuelta a la calma", dur: 300, zone: "Reduce gradualmente", tip: "No te detengas bruscamente" },
];

function CardioView({ week, log, setLog, onFinish, onBack }) {
  const [phase, setPhase] = useState(log.phase || 0);
  const [left, setLeft] = useState(log.left ?? CARDIO_PHASES[0].dur);
  const [running, setRunning] = useState(false);
  const p = CARDIO_PHASES[phase];
  const finished = phase >= CARDIO_PHASES.length;

  useEffect(() => {
    if (!running || finished) return;
    const t = setInterval(() => setLeft((l) => {
      if (l <= 1) {
        beep();
        const np = phase + 1;
        setPhase(np);
        return np < CARDIO_PHASES.length ? CARDIO_PHASES[np].dur : 0;
      }
      return l - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [running, phase, finished]);

  useEffect(() => { setLog({ ...log, phase, left }); }, [phase]);

  const intervals = log.intervals || [{}, {}, {}, {}];
  const setInt = (i, f, v) => {
    const ni = intervals.map((x, j) => (j === i ? { ...x, [f]: v } : x));
    setLog({ ...log, intervals: ni });
  };
  const checks = log.checks || {};
  const toggleCheck = (k) => setLog({ ...log, checks: { ...checks, [k]: !checks[k] } });

  const R = 100, circ = 2 * Math.PI * R;
  const prog = finished ? 0 : left / p.dur;

  return (
    <div style={{ paddingBottom: 120 }}>
      <header style={{ padding: "18px 4px 12px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.line}`, borderRadius: 12, color: C.text, width: 40, height: 40, fontSize: 18, cursor: "pointer" }}>‹</button>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1.5, lineHeight: 1 }}>Norwegian 4×4</div>
          <div style={{ fontSize: 12.5, color: C.mut }}>Sábado · Semana {week}{week === 4 ? " · Descarga: 3 × 4 min zona baja" : ""}</div>
        </div>
      </header>

      {/* Timer central */}
      <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
        <div style={{ position: "relative", width: 250, height: 250, margin: "0 auto" }}>
          <svg width="250" height="250" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="125" cy="125" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
            <circle cx="125" cy="125" r={R} fill="none"
              stroke={finished ? C.ok : p.hot ? C.red : C.cyan} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)}
              style={{ transition: "stroke-dashoffset 1s linear, stroke .4s" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, lineHeight: 1 }}>
              {finished ? "FIN" : fmtTime(left)}
            </div>
            <div style={{ fontSize: 13, color: finished ? C.ok : p.hot ? C.red : C.cyan, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}>
              {finished ? "Cardio completado" : p.label}
            </div>
            {!finished && <div style={{ fontSize: 12, color: C.mut, marginTop: 4 }}>{p.zone}</div>}
          </div>
        </div>
        {!finished && p.tip && <div style={{ fontSize: 12.5, color: C.mut, marginTop: 8 }}>{p.tip}</div>}
        <div style={{ display: "flex", gap: 10, maxWidth: 340, margin: "16px auto 0" }}>
          {!finished && <Btn onClick={() => setRunning(!running)}>{running ? "Pausa" : phase === 0 && left === CARDIO_PHASES[0].dur ? "Iniciar" : "Reanudar"}</Btn>}
          {!finished && <Btn kind="ghost" onClick={() => {
            const np = phase + 1;
            setPhase(np); setLeft(np < CARDIO_PHASES.length ? CARDIO_PHASES[np].dur : 0);
          }} style={{ flex: 0.6 }}>Saltar ›</Btn>}
        </div>
      </div>

      {/* fases */}
      <div style={{ display: "flex", gap: 5, justifyContent: "center", margin: "16px 0 20px", flexWrap: "wrap" }}>
        {CARDIO_PHASES.map((f, i) => (
          <div key={i} style={{
            width: f.hot ? 26 : 14, height: 8, borderRadius: 99,
            background: i < phase ? C.ok : i === phase ? (f.hot ? C.red : C.cyan) : "rgba(255,255,255,0.12)",
            transition: "background .3s",
          }} />
        ))}
      </div>

      {/* registro de intervalos */}
      <div style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.line}`, padding: 18, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1.5, marginBottom: 10 }}>REGISTRO DE INTERVALOS</div>
        {intervals.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.line}` : "none" }}>
            <span style={{ width: 22, fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: C.red }}>{i + 1}</span>
            <NumInput value={it.vel ?? ""} onChange={(v) => setInt(i, "vel", v)} placeholder="vel" width={62} suffix="km/h" />
            <NumInput value={it.inc ?? ""} onChange={(v) => setInt(i, "inc", v)} placeholder="incl" width={56} suffix="%" />
            <NumInput value={it.fc ?? ""} onChange={(v) => setInt(i, "fc", v)} placeholder="FC" width={56} suffix="ppm" />
            <NumInput value={it.rpe ?? ""} onChange={(v) => setInt(i, "rpe", v)} placeholder="RPE" width={52} />
          </div>
        ))}
      </div>

      {/* abdomen + movilidad */}
      {[["ABDOMEN", ABS_SAT, "abs"], ["MOVILIDAD", MOB_SAT, "mob"]].map(([title, list, pref]) => (
        <div key={pref} style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.line}`, padding: 18, marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1.5, marginBottom: 6 }}>{title}</div>
          {list.map((item, i) => {
            const k = `${pref}${i}`;
            return (
              <button key={k} onClick={() => toggleCheck(k)} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                background: "none", border: "none", padding: "9px 0", cursor: "pointer",
                borderBottom: i < list.length - 1 ? `1px solid ${C.line}` : "none",
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 8, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: checks[k] ? C.ok : "rgba(255,255,255,0.06)", border: `1px solid ${checks[k] ? C.ok : C.line}`,
                  color: "#04121C", fontSize: 13, transition: "all .2s",
                }}>{checks[k] ? "✓" : ""}</span>
                <span style={{ fontSize: 14, color: checks[k] ? C.mut : C.text, textDecoration: checks[k] ? "line-through" : "none", fontFamily: "'Space Grotesk', sans-serif" }}>{item}</span>
              </button>
            );
          })}
        </div>
      ))}

      <Btn onClick={onFinish} style={{ background: C.ok, color: "#04121C" }}>Terminar sesión</Btn>
    </div>
  );
}

/* ---------- Check-in post sesión ---------- */
function CheckinView({ onSave, onSkip }) {
  const [energia, setEnergia] = useState(null);
  const [sueno, setSueno] = useState("");
  const [peso, setPeso] = useState("");
  const [molestias, setMolestias] = useState("");
  return (
    <div style={{ padding: "30px 0 120px", animation: "slideUp .35s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <div style={{ fontSize: 44 }}>💪</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 2 }}>SESIÓN COMPLETADA</div>
        <div style={{ color: C.mut, fontSize: 14 }}>30 segundos de registro. Tu yo de la semana 8 te lo agradecerá.</div>
      </div>

      <div style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.line}`, padding: 20, display: "grid", gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: C.mut, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Energía de hoy</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Chip key={n} active={energia === n} onClick={() => setEnergia(n)}>{["😵", "😮‍💨", "😐", "🙂", "🔥"][n - 1]} {n}</Chip>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13, color: C.mut, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Sueño anoche</div>
            <NumInput value={sueno} onChange={setSueno} placeholder="h" width={80} suffix="hrs" />
          </div>
          <div>
            <div style={{ fontSize: 13, color: C.mut, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Peso corporal</div>
            <NumInput value={peso} onChange={setPeso} placeholder="—" width={80} suffix="kg" />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.mut, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Molestias (zona e intensidad)</div>
          <input value={molestias} onChange={(e) => setMolestias(e.target.value)} placeholder="Ninguna 🙌"
            style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.line}`, color: C.text, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <Btn kind="ghost" onClick={onSkip} style={{ flex: 0.6 }}>Omitir</Btn>
        <Btn onClick={() => onSave({ energia, sueno, peso, molestias })}>Guardar registro</Btn>
      </div>
    </div>
  );
}

/* ---------- Progreso ---------- */
function ProgressView({ summary, week, onBack, profile = {} }) {
  const pesos = summary.filter((s) => s.peso).map((s) => ({ d: s.date, v: parseFloat(s.peso) }));
  const pullByWeek = {};
  summary.filter((s) => s.day === 1 && s.pullups != null).forEach((s) => { pullByWeek[s.w] = Math.max(pullByWeek[s.w] || 0, s.pullups); });
  const sessions = summary.length;
  const avgEnergy = summary.filter((s) => s.energia).reduce((a, s, _, arr) => a + s.energia / arr.length, 0);

  const W = 300, H = 110;
  let pesoPath = "", pesoPts = [];
  if (pesos.length > 0) {
    const vals = pesos.map((p) => p.v);
    const min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
    pesoPts = pesos.map((p, i) => ({
      x: pesos.length === 1 ? W / 2 : (i / (pesos.length - 1)) * (W - 20) + 10,
      y: H - 12 - ((p.v - min) / (max - min || 1)) * (H - 24),
      v: p.v,
    }));
    pesoPath = pesoPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  }

  const lowEnergy = summary.slice(-2).filter((s) => s.energia && s.energia <= 2).length >= 2;

  return (
    <div style={{ paddingBottom: 120 }}>
      <header style={{ padding: "18px 4px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.line}`, borderRadius: 12, color: C.text, width: 40, height: 40, fontSize: 18, cursor: "pointer" }}>‹</button>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 1.5 }}>Tu progreso</div>
      </header>

      {lowEnergy && (
        <div style={{ background: "rgba(245,158,11,0.1)", border: `1px solid rgba(245,158,11,0.35)`, borderRadius: 18, padding: 16, marginBottom: 16, fontSize: 13.5, color: C.warn, lineHeight: 1.5 }}>
          ⚠️ Energía baja en tus últimas sesiones. Si además duermes mal o caen tus cargas, el plan indica <b>reducir volumen 20–30%</b> — no entrenar más.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[[sessions, "sesiones"], [`S${week}`, "semana actual"], [avgEnergy ? avgEnergy.toFixed(1) : "—", "energía media"]].map(([v, l], i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: "16px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, lineHeight: 1, color: C.cyan }}>{v}</div>
            <div style={{ fontSize: 11, color: C.mut, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 22, padding: 18, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1.5 }}>PESO CORPORAL{profile.goal ? <span style={{ color: C.mut, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0 }}> · meta {profile.goal} kg</span> : null}</div>
        {pesos.length === 0 ? (
          <div style={{ color: C.mut, fontSize: 13.5, padding: "18px 0" }}>Registra tu peso al terminar cada sesión y aquí verás la tendencia.</div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", marginTop: 8 }}>
            <path d={pesoPath} fill="none" stroke={C.cyan} strokeWidth="2.5" strokeLinecap="round" />
            {pesoPts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="3.5" fill={C.bg} stroke={C.cyan} strokeWidth="2" />
                {(i === 0 || i === pesoPts.length - 1) && (
                  <text x={p.x} y={p.y - 8} fill={C.text} fontSize="11" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif">{p.v}</text>
                )}
              </g>
            ))}
          </svg>
        )}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 22, padding: 18 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1.5 }}>DOMINADAS ESTRICTAS <span style={{ color: C.mut, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0 }}>· por semana</span></div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginTop: 14 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => {
            const v = pullByWeek[w] || 0;
            const goal = w === 8 ? 16 : parseInt(PULLUP_TARGETS[w], 10);
            return (
              <div key={w} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
                {v > 0 && <span style={{ fontSize: 11, color: C.text, fontFamily: "'Space Grotesk', sans-serif" }}>{v}</span>}
                <div style={{
                  width: "100%", borderRadius: 8,
                  height: `${Math.max(4, (v / 18) * 100)}%`,
                  background: v >= goal ? `linear-gradient(180deg, ${C.cyan}, ${C.vio})` : v > 0 ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.06)",
                  transition: "height .4s ease",
                }} />
                <span style={{ fontSize: 10, color: w === week ? C.cyan : C.mut, fontFamily: "'Space Grotesk', sans-serif", fontWeight: w === week ? 700 : 400 }}>S{w}</span>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: C.mut, marginTop: 10 }}>Objetivo del ciclo: superar claramente tu máximo actual. 🎯</div>
      </div>
    </div>
  );
}

/* ---------- Home ---------- */
function Home({ week, setWeek, selDay, setSelDay, summary, onStart, onProgress, profile, onSettings }) {
  const day = ROUTINE[selDay];
  const today = todayKey();
  const doneToday = summary.some((s) => s.date === isoDate() && s.day === selDay);

  return (
    <div style={{ paddingBottom: 40 }}>
      <header style={{ padding: "26px 4px 4px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, color: C.mut, letterSpacing: 3, textTransform: "uppercase" }}>
            {profile.name ? `Hola ${profile.name} 👋` : "Hola 👋"}
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, margin: "2px 0 0", letterSpacing: 1.5, lineHeight: 1 }}>
            TRACKER <span style={{ background: `linear-gradient(90deg, ${C.cyan}, ${C.vio})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HÍBRIDO</span>
          </h1>
        </div>
        <button onClick={onSettings} aria-label="Ajustes"
          style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}`, color: C.mut, fontSize: 17, cursor: "pointer" }}>⚙</button>
      </header>

      {/* selector de semana */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "18px 0 6px" }}>
        <button onClick={() => setWeek(Math.max(1, week - 1))} style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.line}`, color: C.text, fontSize: 17, cursor: "pointer" }}>‹</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2 }}>SEMANA {week} <span style={{ color: C.mut }}>/ 8</span></div>
          <div style={{ fontSize: 12, color: week === 4 || week === 8 ? C.warn : C.mut }}>{WEEK_NOTES[week]}</div>
        </div>
        <button onClick={() => setWeek(Math.min(8, week + 1))} style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.line}`, color: C.text, fontSize: 17, cursor: "pointer" }}>›</button>
      </div>

      {/* selector de día */}
      <div style={{ display: "flex", gap: 6, margin: "14px 0 18px" }}>
        {DAY_ORDER.map((d) => {
          const isRest = ROUTINE[d].rest;
          const done = summary.some((s) => s.w === week && s.day === d);
          return (
            <button key={d} onClick={() => setSelDay(d)} style={{
              flex: 1, padding: "10px 0 8px", borderRadius: 14, cursor: "pointer",
              background: selDay === d ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${selDay === d ? C.cyan : d === today ? "rgba(124,58,237,0.5)" : C.line}`,
              transition: "all .2s",
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, color: selDay === d ? C.cyan : isRest ? "rgba(126,140,163,0.5)" : C.text }}>{DAY_LETTER[d]}</div>
              <div style={{ fontSize: 9, marginTop: 1, color: done ? C.ok : "transparent" }}>●</div>
            </button>
          );
        })}
      </div>

      {/* tarjeta del día */}
      <div style={{
        background: day.rest ? C.card : `linear-gradient(160deg, rgba(34,211,238,0.10), rgba(124,58,237,0.10)), ${C.card}`,
        borderRadius: 28, border: `1px solid ${C.line}`, padding: 26, animation: "slideUp .3s ease",
      }}>
        <div style={{ fontSize: 12, color: C.mut, letterSpacing: 2.5, textTransform: "uppercase" }}>
          {DAY_NAME[selDay]}{selDay === today ? " · HOY" : ""}
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, lineHeight: 1, margin: "6px 0 4px", letterSpacing: 1 }}>{day.title}</div>
        <div style={{ color: C.mut, fontSize: 14.5 }}>{day.sub}</div>

        {day.rest ? (
          <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14, color: C.mut, fontSize: 14 }}>
            <Icon t="mobility" size={44} color={C.mut} />
            El descanso también es entrenamiento. Camina, hidrátate y duerme 7–8 h.
          </div>
        ) : day.cardio ? (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
              {["4 × 4 min @ 85–95%", "3 min recuperación", "Abdomen + movilidad"].map((t, i) => (
                <span key={i} style={{ fontSize: 12.5, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}`, padding: "6px 12px", borderRadius: 99, color: C.mut }}>{t}</span>
              ))}
            </div>
            <Btn onClick={onStart}>{doneToday ? "Ver / continuar sesión" : "Iniciar 4×4"}</Btn>
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, margin: "0 -4px 14px", scrollbarWidth: "none" }}>
              {day.exercises.map((e) => (
                <div key={e.id} style={{ flexShrink: 0, textAlign: "center", width: 66 }}>
                  <div style={{ width: 58, height: 58, margin: "0 auto", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon t={e.icon} size={42} color={day.accent} />
                  </div>
                  <div style={{ fontSize: 9.5, color: C.mut, marginTop: 5, lineHeight: 1.25 }}>{e.name.split(" (")[0].split(" con ")[0]}</div>
                </div>
              ))}
            </div>
            {(selDay === 1 || selDay === 5) && (
              <div style={{ fontSize: 13, color: C.cyan, marginBottom: 14, fontFamily: "'Space Grotesk', sans-serif" }}>
                🎯 Dominadas esta semana: <b>{selDay === 1 ? `${PULLUP_TARGETS[week]} reps estrictas` : ASSIST_TARGETS[week]}</b>
              </div>
            )}
            <Btn onClick={onStart}>{doneToday ? "Ver / continuar sesión" : "Iniciar sesión"}</Btn>
          </div>
        )}
      </div>

      <button onClick={onProgress} style={{
        marginTop: 14, width: "100%", padding: 18, borderRadius: 22, cursor: "pointer",
        background: C.card, border: `1px solid ${C.line}`, color: C.text,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontFamily: "'Space Grotesk', sans-serif", fontSize: 15.5, fontWeight: 600,
      }}>
        <span>📈 Progreso · dominadas y peso</span>
        <span style={{ color: C.mut }}>›</span>
      </button>

      <div style={{ textAlign: "center", color: "rgba(126,140,163,0.55)", fontSize: 11.5, marginTop: 26, lineHeight: 1.7 }}>
        Compuestos nunca al fallo · La serie termina cuando se deteriora la técnica<br />
        Si aparece dolor de pecho, mareo o palpitaciones: detente y consulta a un médico.
      </div>
    </div>
  );
}

/* ---------- Ajustes / primer arranque ---------- */
function SetupView({ profile, first, onSave, onClose, onExport, onImport }) {
  const [name, setName] = useState(profile.name || "");
  const [goal, setGoal] = useState(profile.goal || "");
  const fileRef = useRef(null);
  return (
    <div style={{ padding: "30px 0 60px", animation: "slideUp .35s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 2, lineHeight: 1 }}>
          {first ? "BIENVENIDO" : "AJUSTES"}
        </div>
        <div style={{ color: C.mut, fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>
          {first
            ? "Dos datos opcionales para personalizar la app. Se guardan solo en este dispositivo."
            : "Tus datos viven únicamente en este navegador."}
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.line}`, padding: 20, display: "grid", gap: 18 }}>
        <div>
          <div style={{ fontSize: 13, color: C.mut, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Cómo te llamamos</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre (opcional)"
            style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.line}`, color: C.text, fontSize: 15, fontFamily: "'Space Grotesk', sans-serif", outline: "none" }} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.mut, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Peso objetivo</div>
          <NumInput value={goal} onChange={setGoal} placeholder="—" width={96} suffix="kg" />
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.line}`, padding: 20, marginTop: 14 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: 1.5 }}>COPIA DE SEGURIDAD</div>
        <div style={{ fontSize: 13, color: C.mut, margin: "6px 0 14px", lineHeight: 1.5 }}>
          Descarga tu historial como archivo, o restáuralo en otro navegador o teléfono.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn kind="ghost" onClick={onExport}>Exportar datos</Btn>
          <Btn kind="ghost" onClick={() => fileRef.current && fileRef.current.click()}>Importar</Btn>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) onImport(f); e.target.value = ""; }} />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        {!first && <Btn kind="ghost" onClick={onClose} style={{ flex: 0.6 }}>Cancelar</Btn>}
        <Btn onClick={() => onSave({ name: name.trim(), goal: goal.trim() })}>
          {first ? "Empezar a entrenar" : "Guardar"}
        </Btn>
      </div>
    </div>
  );
}

/* ---------- App raíz ---------- */
export default function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("home"); // home | session | cardio | checkin | progress
  const [week, setWeekState] = useState(1);
  const [selDay, setSelDay] = useState(() => {
    const t = todayKey();
    return ROUTINE[t] ? t : 1;
  });
  const [summary, setSummary] = useState([]);
  const [log, setLog] = useState({});
  const logKey = `log:w${week}:d${selDay}`;

  const [profile, setProfile] = useState({});

  useEffect(() => {
    (async () => {
      const meta = await store.get("meta");
      if (meta && meta.week) setWeekState(meta.week);
      const sum = await store.get("summary");
      if (sum) setSummary(sum);
      const prof = await store.get("profile");
      if (prof) setProfile(prof); else setView("setup");
      setReady(true);
    })();
  }, []);

  const saveProfile = async (p) => {
    setProfile(p);
    await store.set("profile", p);
    setView("home");
  };

  const exportData = async () => {
    const keys = ["meta", "summary", "profile"];
    const data = { app: "tracker-hibrido", version: 1, exported: new Date().toISOString(), store: {} };
    for (const k of keys) data.store[k] = await store.get(k);
    for (let w = 1; w <= 8; w++) for (const d of DAY_ORDER) {
      const k = `log:w${w}:d${d}`;
      const v = await store.get(k);
      if (v) data.store[k] = v;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tracker-hibrido-${isoDate()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const importData = async (file) => {
    try {
      const txt = await file.text();
      const data = JSON.parse(txt);
      if (!data || data.app !== "tracker-hibrido" || !data.store) throw new Error("formato");
      for (const [k, v] of Object.entries(data.store)) if (v != null) await store.set(k, v);
      const meta = data.store.meta, sum = data.store.summary, prof = data.store.profile;
      if (meta && meta.week) setWeekState(meta.week);
      if (sum) setSummary(sum);
      if (prof) setProfile(prof);
      setView("home");
      alert("Datos restaurados correctamente.");
    } catch (e) {
      alert("Ese archivo no es una copia válida de Tracker Híbrido. Elige el .json que exportaste desde la app.");
    }
  };

  const setWeek = (w) => { setWeekState(w); store.set("meta", { week: w }); };

  // autoguardado del log activo
  const saveTimer = useRef(null);
  useEffect(() => {
    if (view !== "session" && view !== "cardio") return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => store.set(logKey, log), 500);
    return () => clearTimeout(saveTimer.current);
  }, [log, view, logKey]);

  const openSession = async () => {
    const saved = await store.get(logKey);
    setLog(saved || {});
    setView(ROUTINE[selDay].cardio ? "cardio" : "session");
  };

  const finishSession = () => setView("checkin");

  const saveCheckin = async (chk) => {
    const pullEx = log.ex && (log.ex["pullups"] || null);
    const entry = {
      w: week, day: selDay, date: isoDate(),
      pullups: selDay === 1 && pullEx ? pullEx.pullTotal || 0 : null,
      energia: chk.energia || null,
      peso: chk.peso || null,
      sueno: chk.sueno || null,
      molestias: chk.molestias || null,
    };
    const ns = [...summary.filter((s) => !(s.w === week && s.day === selDay && s.date === entry.date)), entry];
    setSummary(ns);
    await store.set("summary", ns);
    await store.set(logKey, { ...log, checkin: chk, done: true });
    setView("home");
  };

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.mut, fontFamily: "'Space Grotesk', sans-serif" }}>
        Cargando tu plan…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(1000px 500px at 80% -10%, rgba(124,58,237,0.12), transparent), radial-gradient(800px 400px at 0% 0%, rgba(34,211,238,0.08), transparent), ${C.bg}`, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        body { margin: 0; }
        input::placeholder, textarea::placeholder { color: rgba(126,140,163,0.6); }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important } }
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 18px", fontFamily: "'Space Grotesk', sans-serif" }}>
        {view === "home" && (
          <Home week={week} setWeek={setWeek} selDay={selDay} setSelDay={setSelDay}
            summary={summary} onStart={openSession} onProgress={() => setView("progress")}
            profile={profile} onSettings={() => setView("setup")} />
        )}
        {view === "setup" && (
          <SetupView profile={profile} first={!profile.name && !profile.goal && summary.length === 0}
            onSave={saveProfile} onClose={() => setView("home")}
            onExport={exportData} onImport={importData} />
        )}
        {view === "session" && (
          <SessionView dayKey={selDay} week={week} log={log} setLog={setLog}
            onFinish={finishSession} onBack={() => setView("home")} />
        )}
        {view === "cardio" && (
          <CardioView week={week} log={log} setLog={setLog}
            onFinish={finishSession} onBack={() => setView("home")} />
        )}
        {view === "checkin" && <CheckinView onSave={saveCheckin} onSkip={() => setView("home")} />}
        {view === "progress" && <ProgressView summary={summary} week={week} profile={profile} onBack={() => setView("home")} />}
      </div>
    </div>
  );
}
