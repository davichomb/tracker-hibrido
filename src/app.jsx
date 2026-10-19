const { useState, useEffect, useRef, useMemo } = React,
  T = {
    bg: "#F5F5F7",
    surface: "#FFFFFF",
    surfaceMuted: "#EEEEF0",
    text: "#0A0A0B",
    mut: "#6E6E73",
    line: "rgba(0,0,0,0.09)",
    primary: "#111111",
    accent: "#0071E3",
    ok: "#208A5B",
    warn: "#9A5A00",
    track: "#D9D9DC",
    overlay: "linear-gradient(180deg, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.82) 100%)",
    panelOverlay: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.52))",
    heroShadow: "0 18px 45px rgba(0,0,0,0.12)",
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    ease: "cubic-bezier(0.2,0.8,0.2,1)",
    focus: "0 0 0 3px rgba(0,113,227,0.45)",
  },
  TYPE = {
    display: {
      fontSize: "clamp(48px, 14vw, 86px)",
      fontWeight: 650,
      lineHeight: 0.9,
      letterSpacing: "-0.075em",
    },
    title: { fontSize: 17, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em" },
    body: { fontSize: 13, fontWeight: 400, lineHeight: 1.5 },
    label: {
      fontSize: 9,
      fontWeight: 720,
      lineHeight: 1.2,
      letterSpacing: "0.13em",
      textTransform: "uppercase",
    },
    numeric: { fontSize: 40, fontWeight: 650, letterSpacing: "-0.07em" },
  },
  R = { hero: 30, card: 22, control: 15, button: 18, circle: 999 },
  IMG = (typeof window < "u" && window.IMG) || {},
  IMGPOS = (typeof window < "u" && window.IMGPOS) || {},
  imgOf = (e) => IMG[e] || null,
  posOf = (e) => {
    const a = IMGPOS[e];
    return a ? `${a[0]}% ${a[1]}%` : "center";
  },
  store = {
    async get(e) {
      try {
        const a = localStorage.getItem("th:" + e);
        return a ? JSON.parse(a) : null;
      } catch {
        return null;
      }
    },
    async set(e, a) {
      try {
        localStorage.setItem("th:" + e, JSON.stringify(a));
      } catch {}
    },
  },
  PULLUP_TARGETS = { 1: "8", 2: "10", 3: "12", 4: "6", 5: "12", 6: "14", 7: "16", 8: "MÁX" },
  ASSIST_TARGETS = {
    1: "4 × 6 con banda",
    2: "4 × 7",
    3: "4 × 8",
    4: "2 × 6 suave",
    5: "Banda ligera · 4 × 6",
    6: "4 × 7",
    7: "4 × 8–10",
    8: "3 × 6 suave",
  },
  WEEK_NOTES = {
    1: "Calibración · RIR 3 · pesos conservadores",
    2: "Añade 1 rep por serie · RIR 2–3",
    3: "Primera sobrecarga · +2.5–5% arriba",
    4: "Descarga · reduce series 40–50% · RIR 4",
    5: "Reinicio productivo · RIR 2",
    6: "Sobrecarga · fallo solo en última de aislamientos",
    7: "Mayor estímulo · compuestos RIR 1",
    8: "Evaluación · −30–40% volumen · prueba de máximo",
  },
  // img: clave de la foto en /img (o lista de claves para superseries). null = no hay foto fiable:
  // se muestra la tarjeta neutra, nunca la foto de otro ejercicio. imgNote aclara variantes de equipo.
  mkEx = (e, a, t, i, r, s, o, n) => ({ id: e, name: a, scheme: t, rir: i, rest: r, img: s, tip: o, imgNote: n }),
  ROUTINE = {
    1: {
      title: "Tracción",
      sub: "Espalda · Dominadas · Bíceps · Pantorrillas",
      hero: "pullups",
      warmup: [
        "Caminata rápida 3 min",
        "Rotaciones torácicas 8/lado",
        "Dominadas escapulares 2×6–8",
        "Jalón brazos rectos con banda 2×12",
        "Series progresivas del primer jalón",
      ],
      warmupImg: "scapular-pullup",
      exercises: [
        {
          id: "pullups",
          name: "Dominadas estrictas",
          special: "pullups",
          rest: 120,
          img: "pullups",
          tip: "Inicia desde brazos extendidos · depresión escapular primero · pecho a la barra · sin balanceo. Series de 1–2 reps hasta completar el objetivo semanal.",
        },
        mkEx("jalon", "Jalón al pecho (neutro o supino)", "3 × 6–10", "2", 150, "pulldown", undefined, "Foto: agarre prono abierto"),
        mkEx("remo-apoyo", "Remo con pecho apoyado", "3 × 8–12", "2", 120, "chest-row"),
        mkEx("remo-uni", "Remo unilateral en polea", "2 × 10–14 /lado", "2", 90, "cable-row", undefined, "Foto: versión a dos manos"),
        mkEx(
          "apertura-inv",
          "Apertura inversa (máquina/polea)",
          "3 × 12–20",
          "1–2",
          75,
          "reverse-fly-machine",
        ),
        mkEx("curl-inc", "Curl inclinado con mancuernas", "3 × 8–12", "1–2", 75, "incline-curl-bench"),
        mkEx("curl-mart", "Curl martillo", "2 × 10–15", "1–2", 75, "hammer-curl"),
        mkEx("pant-pie", "Pantorrilla de pie", "4 × 8–12", "1–2", 75, "standing-calf"),
      ],
    },
    2: {
      title: "Empuje",
      sub: "Pecho · Hombros · Tríceps · Abdomen",
      hero: "incline-press",
      warmup: [
        "Caminata rápida 3 min",
        "Círculos de hombros 10/dirección",
        "Rotación externa con banda 2×12",
        "Flexiones escapulares 2×8",
        "Series progresivas del press inclinado",
      ],
      warmupImg: "band-external-rotation",
      exercises: [
        mkEx(
          "press-inc",
          "Press inclinado (barra o mancuernas)",
          "3 × 5–8",
          "2",
          180,
          "incline-press",
          "Nunca al fallo.",
        ),
        mkEx("press-pecho", "Press de pecho en máquina", "3 × 8–12", "2", 120, "chest-press-machine"),
        mkEx("press-hombro", "Press de hombro en máquina", "3 × 6–10", "2", 120, "shoulder-press", undefined, "Foto: versión con mancuernas"),
        mkEx(
          "fondos",
          "Fondos en paralelas",
          "2 × 6–10",
          "2",
          120,
          "dips",
          "Rango completo y controlado. Al lograr 2×10 con RIR 2, añade carga ligera. No profundices si hay tensión incómoda en hombros.",
        ),
        mkEx(
          "laterales",
          "Elevación lateral (polea/máquina)",
          "4 × 12–20",
          "1–2",
          75,
          "cable-lateral-raise",
        ),
        mkEx(
          "triceps-cuerda",
          "Extensión de tríceps con cuerda",
          "3 × 10–15",
          "1–2",
          75,
          "triceps-rope",
        ),
        mkEx("rodillas", "Elevaciones de rodillas colgado", "3 × 8–15", "2", 60, "hanging-raise"),
        mkEx("pallof", "Press Pallof", "2 × 10–15 /lado", "2", 60, "pallof"),
      ],
    },
    3: {
      rest: !0,
      title: "Descanso",
      sub: "Recuperación activa · camina · duerme bien",
      hero: "hip-flexor",
    },
    4: {
      title: "Piernas",
      sub: "Piernas · Pantorrillas · Abdomen",
      hero: "leg-press",
      warmup: [
        "Caminata con inclinación 4 min",
        "Movilidad de tobillo 10/lado",
        "Cadera 90/90 8/lado",
        "Sentadilla peso corporal 2×10",
        "Bisagra de cadera 2×10",
        "Series progresivas de prensa",
      ],
      warmupImg: "ankle",
      exercises: [
        mkEx("prensa", "Prensa inclinada", "4 × 6–10", "2", 180, "leg-press"),
        mkEx(
          "rdl",
          "Peso muerto rumano",
          "3 × 6–10",
          "2–3",
          180,
          "rdl",
          "Rodillas semiflexionadas · barra pegada al cuerpo · tensión en isquios · detén antes de perder neutralidad. Mínimo RIR 2.",
          "Foto: versión con mancuernas",
        ),
        mkEx("bulgara", "Sentadilla búlgara", "3 × 8–12 /pierna", "2", 120, "split-squat"),
        mkEx("femoral", "Curl femoral (sentado/acostado)", "3 × 10–15", "1–2", 75, "leg-curl"),
        mkEx(
          "cuadriceps",
          "Extensión de cuádriceps",
          "2 × 12–15",
          "1–2",
          75,
          "leg-extension",
        ),
        mkEx("pant-sent", "Pantorrilla sentado o en prensa", "4 × 10–15", "1", 75, "seated-calf"),
        mkEx("abwheel", "Ab wheel", "3 × 6–12", "2", 60, "ab-wheel"),
        mkEx("plancha-lat", "Plancha lateral", "2 × 25–45 s /lado", "técnica", 45, "side-plank"),
      ],
    },
    5: {
      title: "Torso mixto",
      sub: "2ª sesión de dominadas · Piernas ligeras",
      hero: "band-pullup",
      warmup: [
        "Caminata rápida 3 min",
        "Dominadas escapulares 2×6",
        "Rotación externa con banda 2×12",
        "Serie ligera de remo y press",
      ],
      warmupImg: "scapular-pullup",
      exercises: [
        {
          id: "pullups-band",
          name: "Dominadas asistidas con banda",
          special: "assist",
          rest: 120,
          img: "band-pullup",
          tip: "Cuando completes 4×10 con RIR 2, cambia a una banda con menos asistencia.",
        },
        mkEx("remo-apoyo2", "Remo con pecho apoyado", "3 × 8–12", "2", 120, "chest-row"),
        mkEx(
          "press-hombro2",
          "Press de hombro en máquina",
          "2 × 8–12",
          "2",
          120,
          "shoulder-press",
          undefined,
          "Foto: versión con mancuernas",
        ),
        mkEx("apertura", "Apertura de pecho en polea", "2 × 12–15", "1–2", 75, "cable-fly"),
        mkEx("laterales2", "Elevaciones laterales", "3 × 12–20", "1–2", 75, "lateral-raise"),
        mkEx(
          "predicador",
          "Curl predicador (máquina/polea)",
          "3 × 8–12",
          "1–2",
          75,
          "preacher-curl",
        ),
        mkEx(
          "triceps-oh",
          "Extensión de tríceps sobre la cabeza",
          "2 × 10–15",
          "1–2",
          75,
          "overhead-triceps",
        ),
        mkEx(
          "super-piernas",
          "Superserie: ext. cuádriceps + curl femoral",
          "2 × 12–15 c/u",
          "3",
          60,
          ["leg-extension", "leg-curl"],
          "Ligera. No comprometas el 4×4 de mañana.",
        ),
        mkEx("pant-maq", "Pantorrilla en máquina", "3 × 12–20", "1–2", 60, "seated-calf"),
      ],
    },
    6: {
      cardio: !0,
      title: "Norwegian 4×4",
      sub: "Cardio · Abdomen · Movilidad",
      hero: "treadmill",
    },
    0: { rest: !0, title: "Descanso", sub: "Domingo · desconecta y recupera", hero: "hip-flexor" },
  },
  DAY_ORDER = [1, 2, 3, 4, 5, 6, 0],
  DAY_LETTER = { 1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S", 0: "D" },
  DAY_NAME = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    0: "Domingo",
  },
  ABS_SAT = [
    { t: "Dead bug controlado · 2 × 8–12 /lado", img: "dead-bug" },
    { t: "Hollow-body hold · 3 × 15–30 s", img: "hollow-body" },
    { t: "Bird dog con pausa · 2 × 8 /lado", img: "bird-dog" },
  ],
  MOB_SAT = [
    { t: "Cadera 90/90 · 2 × 8", img: "hip-90-90" },
    { t: "Flexor de cadera · 2 × 40 s /lado", img: "hip-flexor" },
    { t: "Tobillo contra pared · 2 × 10 /lado", img: "ankle", n: "Foto: el mismo gesto, sin pared" },
    { t: "Open book torácico · 2 × 8 /lado", img: "open-book" },
    { t: "Estiramiento de dorsal · 2 × 40 s", img: "lat-stretch" },
    { t: "Deslizamientos en pared · 2 × 10", img: "wall-slides" },
    { t: "Muñecas en cuatro apoyos · 2 × 10", img: "wrist-quadruped" },
    { t: "Colgado de barra · 2 × 20–30 s", img: "scapular-pullup" },
  ],
  todayKey = () => new Date().getDay(),
  fmtTime = (e) => `${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`,
  // Fecha local (no UTC): una sesión o comida de las 21:00 cuenta para hoy, no para mañana.
  isoDate = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
  buzz = (p) => {
    try {
      (!navigator.userActivation || navigator.userActivation.hasBeenActive) && navigator.vibrate && navigator.vibrate(p);
    } catch {}
  },
  audio = { ctx: null },
  unlockAudio = () => {
    try {
      audio.ctx || (audio.ctx = new (window.AudioContext || window.webkitAudioContext)());
      audio.ctx.state === "suspended" && audio.ctx.resume();
    } catch {}
  },
  _unlockOnTap = typeof document < "u" && document.addEventListener("pointerdown", () => unlockAudio(), { passive: !0 }),
  beep = () => {
    try {
      unlockAudio();
      const e = audio.ctx,
        a = e.createOscillator(),
        t = e.createGain();
      (a.connect(t),
        t.connect(e.destination),
        (a.frequency.value = 880),
        (t.gain.value = 0.15),
        a.start(),
        a.stop(e.currentTime + 0.35));
      setTimeout(() => {
        try {
          const o2 = e.createOscillator(), g2 = e.createGain();
          (o2.connect(g2), g2.connect(e.destination), (o2.frequency.value = 880), (g2.gain.value = 0.15), o2.start(), o2.stop(e.currentTime + 0.35));
        } catch {}
      }, 450);
    } catch {}
    buzz([220, 90, 220]);
  },
  // Foto de un ejercicio. id puede ser una clave, una lista (superserie: fotos lado a lado) o null.
  // Sin foto fiable se pinta una tarjeta neutra con una mancuerna, nunca la foto de otro ejercicio.
  Photo = ({ id: e, alt: a, height: t, radius: i = R.card, overlay: r, children: s, style: o, note: n }) => {
    const ids = (Array.isArray(e) ? e : e ? [e] : []).filter((k) => imgOf(k)),
      dark = !!r,
      glyph = typeof t === "number" ? Math.max(18, Math.min(64, Math.round(t * 0.34))) : 64;
    return (
      <div
        style={{
          position: "relative",
          height: t,
          borderRadius: i,
          overflow: "hidden",
          background: dark && !ids.length ? "linear-gradient(160deg, #3A3A3C, #1C1C1E)" : T.surfaceMuted,
          display: "flex",
          ...o,
        }}
      >
        {ids.length ? (
          ids.map((k, j) => (
            <img
              key={k}
              src={imgOf(k)}
              alt={j === 0 ? a || "" : ""}
              style={{
                flex: 1,
                minWidth: 0,
                height: "100%",
                objectFit: "cover",
                objectPosition: posOf(k),
                display: "block",
                borderLeft: j ? "2px solid #FFFFFF" : "none",
              }}
            />
          ))
        ) : (
          <div
            role="img"
            aria-label={a || ""}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: dark ? "flex-start" : "center",
              justifyContent: dark ? "flex-end" : "center",
              padding: dark ? 22 : 0,
            }}
          >
            <DumbbellGlyph size={glyph} color={dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)"} />
          </div>
        )}
        {n && ids.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: t === 108 ? 6 : 12,
              left: t === 108 ? 6 : 12,
              ...TYPE.label,
              fontSize: 9.5,
              color: "#FFFFFF",
              background: "rgba(0,0,0,0.55)",
              padding: "6px 9px",
              borderRadius: R.circle,
              letterSpacing: "0.06em",
              textTransform: "none",
            }}
          >
            {n}
          </span>
        )}
        {r && <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: r }} />}
        {s}
      </div>
    );
  },
  DumbbellGlyph = ({ size: e = 40, color: a = T.mut }) => (
    <svg width={e} height={e} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke={a} strokeWidth="1.8" strokeLinecap="round">
      <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
    </svg>
  ),
  Label =({ children: e, color: a = T.mut, style: t }) =>
    React.createElement("div", { style: { ...TYPE.label, color: a, ...t } }, e),
  Card = ({ children: e, style: a, minHeight: t = 138, pad: i = 18 }) =>
    React.createElement(
      "div",
      {
        style: {
          background: T.surface,
          border: `1px solid ${T.line}`,
          borderRadius: R.card,
          padding: i,
          minHeight: t,
          boxSizing: "border-box",
          ...a,
        },
      },
      e,
    ),
  PrimaryButton = ({ children: e, onClick: a, disabled: t, tone: i = "dark", style: r, noArrow: na }) => {
    const s = t ? T.surfaceMuted : i === "accent" ? T.accent : T.primary,
      o = t ? T.mut : "#FFFFFF";
    return React.createElement(
      "button",
      {
        onClick: a,
        disabled: t,
        style: {
          height: 58,
          width: "100%",
          background: s,
          color: o,
          border: "none",
          borderRadius: R.button,
          padding: "0 10px 0 22px",
          cursor: t ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          font: `700 16px/1 ${T.font}`,
          letterSpacing: "-0.02em",
          transition: `transform 160ms ${T.ease}, background 160ms ${T.ease}`,
          ...r,
        },
        onPointerDown: (l) => !t && (l.currentTarget.style.transform = "scale(0.985)"),
        onPointerUp: (l) => (l.currentTarget.style.transform = "scale(1)"),
        onPointerLeave: (l) => (l.currentTarget.style.transform = "scale(1)"),
      },
      React.createElement("span", null, e),
      !na && React.createElement(
        "span",
        {
          "aria-hidden": "true",
          style: {
            width: 38,
            height: 38,
            borderRadius: R.circle,
            flexShrink: 0,
            background: t ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          },
        },
        "→",
      ),
    );
  },
  QuietButton = ({ children: e, onClick: a, disabled: t, style: i }) =>
    React.createElement(
      "button",
      {
        onClick: a,
        disabled: t,
        style: {
          height: 58,
          width: "100%",
          background: T.surface,
          color: t ? T.mut : T.text,
          border: `1px solid ${T.line}`,
          borderRadius: R.button,
          cursor: t ? "default" : "pointer",
          font: `600 15px/1 ${T.font}`,
          letterSpacing: "-0.02em",
          opacity: t ? 0.5 : 1,
          ...i,
        },
      },
      e,
    ),
  Ring = ({ size: e, progress: a, stroke: t = 8, color: i = T.primary, track: r = T.track, children: s }) => {
    const o = (e - t) / 2,
      l = 2 * Math.PI * o;
    return React.createElement(
      "div",
      { style: { position: "relative", width: e, height: e } },
      React.createElement(
        "svg",
        {
          width: e,
          height: e,
          style: { transform: "rotate(-90deg)", display: "block" },
          "aria-hidden": "true",
        },
        React.createElement("circle", {
          cx: e / 2,
          cy: e / 2,
          r: o,
          fill: "none",
          stroke: r,
          strokeWidth: t,
        }),
        React.createElement("circle", {
          cx: e / 2,
          cy: e / 2,
          r: o,
          fill: "none",
          stroke: i,
          strokeWidth: t,
          strokeLinecap: "round",
          strokeDasharray: l,
          strokeDashoffset: l * (1 - Math.max(0, Math.min(1, a))),
          style: { transition: `stroke-dashoffset 900ms ${T.ease}, stroke 300ms ${T.ease}` },
        }),
      ),
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        s,
      ),
    );
  },
  // grow: ocupa el ancho disponible en una fila flex (para que nada se salga en móviles estrechos).
  NumInput = ({ value: e, onChange: a, placeholder: t, width: i = 74, suffix: r, ariaLabel: s, grow: g }) =>
    React.createElement(
      "label",
      {
        style: {
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          ...(g ? { flex: 1, minWidth: 0 } : null),
        },
      },
      React.createElement("input", {
        type: "number",
        inputMode: "decimal",
        min: 0,
        step: "any",
        value: e,
        placeholder: t,
        "aria-label": s || t,
        onChange: (o) => a(o.target.value),
        style: {
          width: g ? "100%" : i,
          height: 46,
          padding: r ? "0 26px 0 8px" : "0 8px",
          boxSizing: "border-box",
          borderRadius: R.control,
          textAlign: "center",
          background: T.surfaceMuted,
          border: "1px solid transparent",
          color: T.text,
          font: `600 16px/1 ${T.font}`,
          letterSpacing: "-0.03em",
          outline: "none",
        },
      }),
      r &&
        React.createElement(
          "span",
          {
            "aria-hidden": "true",
            style: { position: "absolute", right: 9, fontSize: 10, color: T.mut, pointerEvents: "none" },
          },
          r,
        ),
    ),
  Header = ({ title: e, onBack: a, right: t }) =>
    React.createElement(
      "header",
      {
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 66,
          zIndex: 40,
          background: "rgba(245,245,247,0.84)",
          backdropFilter: "saturate(180%) blur(22px)",
          WebkitBackdropFilter: "saturate(180%) blur(22px)",
          borderBottom: `1px solid ${T.line}`,
        },
      },
      React.createElement(
        "div",
        {
          style: {
            maxWidth: 560,
            margin: "0 auto",
            height: "100%",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxSizing: "border-box",
          },
        },
        a &&
          React.createElement(
            "button",
            {
              onClick: a,
              "aria-label": "Volver",
              style: {
                width: 44,
                height: 44,
                marginLeft: -8,
                borderRadius: R.circle,
                border: "none",
                background: "transparent",
                color: T.text,
                fontSize: 22,
                cursor: "pointer",
                lineHeight: 1,
              },
            },
            "‹",
          ),
        React.createElement(
          "div",
          {
            style: {
              ...TYPE.title,
              color: T.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          },
          e,
        ),
        React.createElement(
          "div",
          { style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 } },
          t,
        ),
      ),
    ),
  // tabbed: deja hueco para la barra de pestañas inferior.
  Screen = ({ children: e, tabbed: a }) =>
    React.createElement(
      "main",
      {
        style: {
          padding: a ? "84px 14px calc(104px + env(safe-area-inset-bottom))" : "84px 14px 42px",
          maxWidth: 560,
          margin: "0 auto",
          animation: `enter 350ms ${T.ease} both`,
        },
      },
      e,
    );
/* ---------- Comportamiento de app en el móvil ---------- */
// Botón atrás: cada ventana abierta (hoja, descanso) es una "capa". Atrás cierra la capa de arriba;
// sin capas, vuelve a la pantalla anterior. Si una capa se cierra con un botón, se retira su entrada del historial.
// BOOT marca las entradas del historial creadas en este arranque: tras una recarga, las antiguas se saltan.
const BOOT = Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  NAV = { layers: [], ignore: 0, after: null },
  useBackLayer = (onBack) => {
    const ref = useRef(onBack);
    ref.current = onBack;
    useEffect(() => {
      const layer = { byBack: !1, fn: () => ((layer.byBack = !0), ref.current()) };
      try {
        const st = history.state || {};
        history.pushState({ ...st, layer: (st.layer || 0) + 1, idx: (st.idx || 0) + 1 }, "");
      } catch {}
      NAV.layers.push(layer);
      return () => {
        const q = NAV.layers.indexOf(layer);
        q >= 0 && NAV.layers.splice(q, 1);
        if (!layer.byBack) (NAV.ignore++, history.back());
      };
    }, []);
  },
  // Mantiene la pantalla encendida mientras entrenas (sesión, cardio, descanso).
  useWakeLock = (on) =>
    useEffect(() => {
      if (!on || !("wakeLock" in navigator)) return;
      let lock = null,
        dead = !1;
      const get = async () => {
          try {
            lock = await navigator.wakeLock.request("screen");
          } catch {}
        },
        vis = () => document.visibilityState === "visible" && !dead && get();
      get();
      document.addEventListener("visibilitychange", vis);
      return () => {
        ((dead = !0), document.removeEventListener("visibilitychange", vis), lock && lock.release().catch(() => {}));
      };
    }, [on]),
  // Reloj que se refresca cada 250 ms y al volver a la app (los temporizadores van por hora real, no por "ticks").
  useNow = (on) => {
    const [now, setNow] = useState(Date.now);
    useEffect(() => {
      if (!on) return;
      const tick = () => setNow(Date.now()),
        id = setInterval(tick, 250);
      document.addEventListener("visibilitychange", tick);
      return () => (clearInterval(id), document.removeEventListener("visibilitychange", tick));
    }, [on]);
    return now;
  };

// Descanso entre series. Cuenta contra una hora de fin: si bloqueas el móvil o sales de la app,
// al volver muestra el tiempo real que queda.
function RestOverlay({ rest: e, onClose: a, onExtend: t }) {
  const now = useNow(!0),
    left = Math.max(0, Math.ceil((e.end - now) / 1e3)),
    o = left <= 0,
    beeped = useRef(!1);
  (useBackLayer(a), useWakeLock(!o));
  useEffect(() => {
    o && !beeped.current && Date.now() - e.end < 5e3 && ((beeped.current = !0), beep());
  }, [o]);
  return (
    <div
      role="dialog"
      aria-label="Descanso entre series"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: `enter 350ms ${T.ease} both`,
      }}
    >
      <Label style={{ marginBottom: 26 }}>{o ? "Siguiente serie" : "Descanso"}</Label>
      <Ring size={275} progress={o ? 0 : left / e.total} stroke={10} color={o ? T.ok : T.primary}>
        <div style={{ ...TYPE.display, fontSize: 64, color: T.text }}>{o ? "Ya" : fmtTime(left)}</div>
      </Ring>
      <div style={{ display: "flex", gap: 10, marginTop: 34, width: "100%", maxWidth: 340 }}>
        {!o && <QuietButton onClick={t}>+30 s</QuietButton>}
        <PrimaryButton onClick={a}>{o ? "Continuar" : "Saltar"}</PrimaryButton>
      </div>
    </div>
  );
}
// Una serie: carga, repeticiones y ✓ en la primera línea; RIR debajo, con botones a tamaño de dedo.
// Cabe en móviles de 320 px sin desbordar la tarjeta.
function SetRow({ n: e, data: a, onChange: t, onDone: i, hint: h = {}, timed: tm }) {
  const r = a || {};
  return (
    <div style={{ padding: "12px 0", borderTop: e === 1 ? "none" : `1px solid ${T.line}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 24, flexShrink: 0, ...TYPE.label, fontSize: 10, color: r.done ? T.ok : T.mut }}>S{e}</span>
        {!tm && <NumInput value={r.kg ?? ""} onChange={(s) => t({ ...r, kg: s })} placeholder={h.kg || "0"} suffix="kg" grow ariaLabel={`Carga serie ${e}`} />}
        <NumInput value={r.reps ?? ""} onChange={(s) => t({ ...r, reps: s })} placeholder={h.reps || "0"} suffix={tm ? "seg" : "rep"} grow ariaLabel={tm ? `Segundos serie ${e}` : `Repeticiones serie ${e}`} />
        <button
          onClick={i}
          aria-label={r.done ? `Desmarcar serie ${e}` : `Marcar serie ${e} como hecha`}
          aria-pressed={!!r.done}
          style={{
            width: 46,
            height: 46,
            borderRadius: R.control,
            flexShrink: 0,
            cursor: "pointer",
            background: r.done ? T.ok : T.surfaceMuted,
            border: "1px solid transparent",
            color: r.done ? "#FFFFFF" : T.mut,
            fontSize: 17,
            fontWeight: 700,
            transition: `background 200ms ${T.ease}`,
          }}
        >
          ✓
        </button>
      </div>
      {!tm && <div role="group" aria-label={`RIR serie ${e}`} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, paddingLeft: 32 }}>
        <span style={{ ...TYPE.label, color: T.mut, width: 26, flexShrink: 0 }}>RIR</span>
        {[0, 1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => t({ ...r, rir: r.rir === s ? null : s })}
            aria-pressed={r.rir === s}
            aria-label={`RIR ${s}`}
            style={{
              flex: 1,
              maxWidth: 56,
              height: 40,
              borderRadius: 12,
              cursor: "pointer",
              font: `700 14px/1 ${T.font}`,
              background: r.rir === s ? T.accent : T.surfaceMuted,
              color: r.rir === s ? "#FFFFFF" : T.mut,
              border: "1px solid transparent",
            }}
          >
            {s}
          </button>
        ))}
      </div>}
    </div>
  );
}
const parseSetCount = (e) => {
  const a = /^(\d+)\s*×/.exec(e || "");
  return a ? parseInt(a[1], 10) : 3;
};
// prev: lo que registraste en este ejercicio la semana anterior (mismo día). Sirve de referencia:
// aparece en gris en cada serie y, si marcas ✓ sin escribir, se apunta ese valor.
function ExerciseCard({ ex: e, week: a, data: t, onData: i, onRest: r, prev: pv }) {
  const [s, o] = useState(!1),
    l = e.special === "pullups",
    b = e.special === "assist",
    y = b ? parseInt(ASSIST_TARGETS[a], 10) || 4 : parseSetCount(e.scheme),
    f = t.sets || [],
    x = l ? PULLUP_TARGETS[a] : b ? ASSIST_TARGETS[a] : null,
    u = t.pullTotal || 0,
    m = a === 8 ? null : parseInt(PULLUP_TARGETS[a], 10),
    d = (S, c) => {
      const p = [...f];
      ((p[S] = c), i({ ...t, sets: p }));
    },
    timed = /\d\s*s\b/.test(e.scheme || ""),
    ps = (pv && pv.sets) || [],
    hintOf = (S) => {
      const before = f[S - 1] || {},
        last = ps[S] || {};
      return { kg: String(before.kg || last.kg || ""), reps: String(last.reps || before.reps || "") };
    },
    k = (S) => {
      const c = f[S] || {},
        h = hintOf(S),
        p = [...f];
      ((p[S] = c.done ? { ...c, done: !1 } : { ...c, kg: c.kg || (timed ? c.kg : h.kg) || c.kg, reps: c.reps || h.reps || c.reps, done: !0 }),
        i({ ...t, sets: p }),
        c.done || (buzz(12), r(e.rest)));
    },
    lastWeek = ps.filter((q) => q && (q.kg || q.reps)).map((q) => (timed ? `${q.reps} s` : q.kg ? `${q.kg}×${q.reps || "?"}` : `${q.reps} rep`));
  return React.createElement(
    "div",
    { style: { animation: `enter 350ms ${T.ease} both` } },
    React.createElement(
      Photo,
      {
        id: e.img,
        alt: e.name,
        note: e.imgNote,
        height: 260,
        radius: 26,
        overlay: T.panelOverlay,
        style: { boxShadow: T.heroShadow },
      },
      React.createElement(
        "div",
        { style: { position: "absolute", left: 18, right: 18, bottom: 16, color: "#FFFFFF" } },
        React.createElement(
          Label,
          { color: "rgba(255,255,255,0.75)" },
          l ? `Objetivo ${x}` : b ? x : e.scheme,
        ),
        React.createElement(
          "div",
          { style: { ...TYPE.title, fontSize: 22, marginTop: 6, textShadow: "0 1px 12px rgba(0,0,0,0.4)" } },
          e.name,
        ),
      ),
    ),
    React.createElement(
      "div",
      { style: { display: "flex", gap: 8, margin: "14px 0", flexWrap: "wrap" } },
      e.rir && React.createElement(Pill, null, "RIR ", e.rir),
      React.createElement(Pill, null, "Descanso ", fmtTime(e.rest)),
      e.tip &&
        React.createElement(
          "button",
          {
            onClick: () => o(!s),
            "aria-expanded": s,
            style: {
              ...TYPE.label,
              color: T.accent,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "10px 2px",
              minHeight: 44,
            },
          },
          s ? "Ocultar técnica" : "Ver técnica",
        ),
    ),
    s &&
      e.tip &&
      React.createElement(
        Card,
        { minHeight: 0, pad: 16, style: { marginBottom: 12, background: T.surfaceMuted, border: "none" } },
        React.createElement("div", { style: { ...TYPE.body, color: T.text } }, e.tip),
      ),
    l
      ? React.createElement(
          Card,
          { minHeight: 0, pad: 20 },
          React.createElement(Label, null, "Dominadas acumuladas"),
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 14, marginTop: 12 } },
            React.createElement(
              "button",
              {
                onClick: () => i({ ...t, pullTotal: Math.max(0, u - 1) }),
                "aria-label": "Restar una repetición",
                style: stepBtn,
              },
              "−",
            ),
            React.createElement(
              "div",
              { style: { flex: 1, textAlign: "center" } },
              React.createElement(
                "div",
                { style: { ...TYPE.display, fontSize: 62, color: T.text } },
                u,
                m ? React.createElement("span", { style: { color: T.mut, fontSize: 26 } }, " / ", m) : null,
              ),
            ),
            React.createElement(
              "button",
              {
                onClick: () => {
                  (i({ ...t, pullTotal: u + 1 }), r(e.rest));
                },
                "aria-label": "Sumar una repetición",
                style: { ...stepBtn, background: T.primary, color: "#FFFFFF" },
              },
              "+",
            ),
          ),
          m &&
            React.createElement(
              "div",
              {
                style: {
                  height: 4,
                  borderRadius: R.circle,
                  background: T.track,
                  margin: "18px 0 0",
                  overflow: "hidden",
                },
              },
              React.createElement("div", {
                style: {
                  height: "100%",
                  width: `${Math.min(100, (u / m) * 100)}%`,
                  background: u >= m ? T.ok : T.primary,
                  borderRadius: R.circle,
                  transition: `width 350ms ${T.ease}`,
                },
              }),
            ),
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
                alignItems: "center",
              },
            },
            React.createElement(
              "span",
              { style: { ...TYPE.body, color: m && u >= m ? T.ok : T.mut } },
              m && u >= m ? "Objetivo semanal cumplido" : "Series de 1–2 reps, sin fallo técnico",
            ),
            React.createElement(
              "button",
              {
                onClick: () => {
                  (i({ ...t, pullTotal: u + 2 }), r(e.rest));
                },
                "aria-label": "Sumar dos repeticiones",
                style: {
                  ...TYPE.label,
                  fontSize: 12,
                  color: T.accent,
                  background: T.surfaceMuted,
                  border: "none",
                  borderRadius: R.circle,
                  cursor: "pointer",
                  minHeight: 44,
                  minWidth: 56,
                },
              },
              "+2",
            ),
          ),
        )
      : React.createElement(
          Card,
          { minHeight: 0, pad: 18 },
          lastWeek.length > 0 &&
            React.createElement(
              "div",
              { style: { ...TYPE.body, fontSize: 12.5, color: T.mut, marginBottom: 6 } },
              "Semana pasada: ",
              React.createElement("b", { style: { color: T.text, fontWeight: 600 } }, lastWeek.join(" · ")),
            ),
          Array.from({ length: y }).map((S, c) =>
            React.createElement(SetRow, {
              key: c,
              n: c + 1,
              data: f[c],
              hint: hintOf(c),
              timed,
              onChange: (p) => d(c, p),
              onDone: () => k(c),
            }),
          ),
        ),
    React.createElement(
      Card,
      { minHeight: 0, pad: 16, style: { marginTop: 10 } },
      React.createElement(Label, null, "Notas"),
      React.createElement("textarea", {
        value: t.note || "",
        onChange: (S) => i({ ...t, note: S.target.value }),
        placeholder: "Sensaciones, ajustes de carga, técnica…",
        "aria-label": "Notas del ejercicio",
        rows: 2,
        style: {
          marginTop: 8,
          width: "100%",
          boxSizing: "border-box",
          border: "none",
          background: "transparent",
          color: T.text,
          font: `400 16px/1.5 ${T.font}`,
          resize: "vertical",
          outline: "none",
          padding: 0,
        },
      }),
    ),
  );
}
const stepBtn = {
    width: 46,
    height: 46,
    borderRadius: R.control,
    flexShrink: 0,
    cursor: "pointer",
    background: T.surfaceMuted,
    border: "1px solid transparent",
    color: T.text,
    font: `600 22px/1 ${T.font}`,
  },
  Pill = ({ children: e }) =>
    React.createElement(
      "span",
      {
        style: {
          ...TYPE.label,
          color: T.mut,
          background: T.surfaceMuted,
          padding: "9px 12px",
          borderRadius: R.circle,
          display: "inline-flex",
          alignItems: "center",
        },
      },
      e,
    );
// sessKey identifica la sesión (semana + día): el ejercicio en curso, el calentamiento y el descanso
// se guardan con ella para retomarlos tal cual al volver a abrir la app.
function SessionView({ dayKey: e, week: a, log: t, setLog: i, onFinish: r, onBack: s, sessKey: sk }) {
  const o = ROUTINE[e],
    saved = (() => {
      const v = lsGet("ui:sess");
      return v && v.key === sk ? v : {};
    })(),
    savedRest = (() => {
      const v = lsGet("ui:rest");
      return v && v.key === sk && v.end > Date.now() - 6e4 ? v : null;
    })(),
    [l, setIdx] = useState(() => Math.min(Math.max(0, saved.idx || 0), o.exercises.length - 1)),
    [y, setRest] = useState(savedRest),
    // El calentamiento se muestra al empezar; desaparece al pasar de ejercicio o si ya hay series registradas.
    [x, setWarm] = useState(() => saved.warm !== !1 && !Object.keys(t.ex || {}).length),
    b = (n) => (setIdx(n), setWarm(!1), window.scrollTo({ top: 0, behavior: "smooth" })),
    prevLog = lsGet(`log:w${a - 1}:d${e}`),
    f = (sec) => {
      const v = { key: sk, end: Date.now() + sec * 1e3, total: sec };
      (setRest(v), lsSet("ui:rest", v));
    },
    closeRest = () => {
      (setRest(null), lsSet("ui:rest", null));
    },
    extendRest = () =>
      setRest((v) => {
        const nv = { ...v, end: Math.max(v.end, Date.now()) + 3e4, total: v.total + 30 };
        return (lsSet("ui:rest", nv), nv);
      }),
    u = (v) => setWarm(v),
    m = o.exercises,
    d = m[l],
    k = (t.ex && t.ex[d.id]) || {},
    S = (n) => i({ ...t, ex: { ...(t.ex || {}), [d.id]: n } }),
    c = (n) => {
      const g = (t.ex && t.ex[n.id]) || {};
      return n.special === "pullups" ? (g.pullTotal || 0) > 0 : (g.sets || []).some((I) => I && I.done);
    },
    p = m.filter(c).length;
  useEffect(() => lsSet("ui:sess", { key: sk, idx: l, warm: x }), [l, x, sk]);
  useWakeLock(!0);
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Header, {
      title: o.title,
      onBack: s,
      right: React.createElement(Label, null, p, " de ", m.length),
    }),
    React.createElement(
      Screen,
      null,
      React.createElement(
        "div",
        {
          style: {
            height: 3,
            borderRadius: R.circle,
            background: T.track,
            marginBottom: 18,
            overflow: "hidden",
          },
        },
        React.createElement("div", {
          style: {
            height: "100%",
            width: `${((l + 1) / m.length) * 100}%`,
            background: T.primary,
            transition: `width 350ms ${T.ease}`,
          },
        }),
      ),
      x &&
        React.createElement(
          Card,
          { minHeight: 0, pad: 18, style: { marginBottom: 14, animation: `enter 350ms ${T.ease} both` } },
          React.createElement(
            "div",
            { style: { display: "flex", gap: 14 } },
            React.createElement(Photo, {
              id: o.warmupImg,
              alt: "",
              height: 74,
              radius: R.control,
              style: { width: 74, flexShrink: 0 },
            }),
            React.createElement(
              "div",
              { style: { minWidth: 0, flex: 1 } },
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  },
                },
                React.createElement(Label, null, "Calentamiento"),
                React.createElement(
                  "button",
                  {
                    onClick: () => u(!1),
                    style: {
                      ...TYPE.label,
                      color: T.accent,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      minHeight: 44,
                      marginTop: -14,
                    },
                  },
                  "Listo",
                ),
              ),
              React.createElement(
                "ul",
                { style: { margin: "8px 0 0", paddingLeft: 16, ...TYPE.body, color: T.mut } },
                o.warmup.map((n, g) => React.createElement("li", { key: g, style: { marginBottom: 2 } }, n)),
              ),
            ),
          ),
        ),
      React.createElement(ExerciseCard, { key: d.id, ex: d, week: a, data: k, onData: S, onRest: f, prev: prevLog && prevLog.ex ? prevLog.ex[d.id] : null }),
      React.createElement(
        "div",
        {
          role: "tablist",
          "aria-label": "Ejercicios",
          style: {
            display: "flex",
            gap: 0,
            justifyContent: "center",
            margin: "14px 0 8px",
            flexWrap: "wrap",
          },
        },
        // Punto visible pequeño, zona táctil de 44 px de alto.
        m.map((n, g) => (
          <button
            key={n.id}
            onClick={() => b(g)}
            role="tab"
            aria-selected={g === l}
            aria-label={n.name}
            style={{ height: 44, minWidth: 32, padding: "0 4px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <span
              aria-hidden="true"
              style={{
                width: g === l ? 26 : 8,
                height: 8,
                borderRadius: R.circle,
                background: g === l ? T.primary : c(n) ? T.ok : T.track,
                transition: `all 350ms ${T.ease}`,
              }}
            />
          </button>
        )),
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 10,
            position: "sticky",
            bottom: 0,
            zIndex: 30,
            margin: "0 -14px",
            padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
            background: "rgba(245,245,247,0.92)",
            backdropFilter: "saturate(180%) blur(18px)",
            WebkitBackdropFilter: "saturate(180%) blur(18px)",
            borderTop: `1px solid ${T.line}`,
          },
        },
        React.createElement(
          QuietButton,
          { onClick: () => b(Math.max(0, l - 1)), disabled: l === 0, style: { flex: 0.7 } },
          "Anterior",
        ),
        l < m.length - 1
          ? React.createElement(PrimaryButton, { onClick: () => b(l + 1) }, "Siguiente")
          : React.createElement(PrimaryButton, { onClick: r, tone: "accent" }, "Terminar sesión"),
      ),
    ),
    y && React.createElement(RestOverlay, { rest: y, onClose: closeRest, onExtend: extendRest }),
  );
}
const CARDIO_PHASES = [
  {
    label: "Calentamiento",
    dur: 600,
    zone: "60–70% FCmáx",
    tip: "Termina caliente, aún pudiendo hablar",
  },
  { label: "Intervalo 1", dur: 240, zone: "85–95% FCmáx", hot: !0 },
  { label: "Recuperación", dur: 180, zone: "60–70% FCmáx" },
  { label: "Intervalo 2", dur: 240, zone: "85–95% FCmáx", hot: !0 },
  { label: "Recuperación", dur: 180, zone: "60–70% FCmáx" },
  { label: "Intervalo 3", dur: 240, zone: "85–95% FCmáx", hot: !0 },
  { label: "Recuperación", dur: 180, zone: "60–70% FCmáx" },
  { label: "Intervalo 4", dur: 240, zone: "85–95% FCmáx", hot: !0 },
  { label: "Vuelta a la calma", dur: 300, zone: "Reduce gradualmente", tip: "No te detengas bruscamente" },
];
// El temporizador del 4×4 va por hora real (endAt): si se bloquea el móvil o sales de la app,
// al volver está en la fase y el segundo correctos. El estado se guarda en el registro de la sesión.
const phaseDur = (n) => (n < CARDIO_PHASES.length ? CARDIO_PHASES[n].dur : 0);
function CardioView({ week: e, log: a, setLog: t, onFinish: i, onBack: r }) {
  const tm = a.timer || { phase: a.phase || 0, left: a.left ?? CARDIO_PHASES[0].dur, endAt: null },
    y = !!tm.endAt,
    now = useNow(y),
    lastBeep = useRef(0);
  let s = tm.phase,
    end = tm.endAt;
  if (y) for (; s < CARDIO_PHASES.length && now >= end; ) (s++, (end += phaseDur(s) * 1e3));
  const l = s >= CARDIO_PHASES.length ? 0 : y ? Math.max(0, Math.ceil((end - now) / 1e3)) : tm.left,
    x = CARDIO_PHASES[s],
    u = s >= CARDIO_PHASES.length,
    setTimer = (v) => t({ ...a, timer: v, phase: v.phase }),
    toggle = () =>
      y ? setTimer({ phase: s, left: l, endAt: null }) : setTimer({ phase: s, left: l, endAt: Date.now() + l * 1e3 }),
    [undo, setUndo] = useState(null),
    skip = () => {
      const n = s + 1,
        before = { phase: s, left: l, endAt: y ? Date.now() + l * 1e3 : null };
      setTimer({ phase: n, left: phaseDur(n), endAt: y && n < CARDIO_PHASES.length ? Date.now() + phaseDur(n) * 1e3 : null });
      setUndo({ ...before, t: Date.now() });
    };
  useEffect(() => {
    if (!undo) return;
    const id = setTimeout(() => setUndo(null), 5e3);
    return () => clearTimeout(id);
  }, [undo]);
  // Al cambiar de fase en directo: pitido y se guarda la fase nueva.
  useEffect(() => {
    if (!y || s === tm.phase) return;
    (Date.now() - lastBeep.current > 2e3 && now - (end - phaseDur(s) * 1e3) < 3e3 && ((lastBeep.current = Date.now()), beep()),
      setTimer({ phase: s, left: l, endAt: u ? null : end }));
  }, [s]);
  useWakeLock(y);
  const m = a.intervals || [{}, {}, {}, {}],
    d = (c, p, n) => t({ ...a, intervals: m.map((g, I) => (I === c ? { ...g, [p]: n } : g)) }),
    k = a.checks || {},
    S = (c) => t({ ...a, checks: { ...k, [c]: !k[c] } });
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Header, {
      title: "Norwegian 4×4",
      onBack: r,
      right: React.createElement(Label, null, "Semana ", e),
    }),
    React.createElement(
      Screen,
      null,
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "center", margin: "4px 0 10px" } },
        React.createElement(
          Ring,
          {
            size: 275,
            stroke: 10,
            progress: u ? 0 : l / x.dur,
            color: u ? T.ok : x.hot ? T.primary : T.accent,
          },
          React.createElement(
            "div",
            { style: { ...TYPE.display, fontSize: 62, color: T.text } },
            u ? "Fin" : fmtTime(l),
          ),
          React.createElement(
            Label,
            { color: u ? T.ok : x.hot ? T.text : T.accent, style: { marginTop: 8 } },
            u ? "Completado" : x.label,
          ),
          !u && React.createElement("div", { style: { ...TYPE.body, color: T.mut, marginTop: 4 } }, x.zone),
        ),
      ),
      !u &&
        x.tip &&
        React.createElement(
          "div",
          { style: { ...TYPE.body, color: T.mut, textAlign: "center", marginBottom: 14 } },
          x.tip,
        ),
      !u &&
        React.createElement(
          "div",
          { style: { display: "flex", gap: 10, marginBottom: 16 } },
          React.createElement(
            PrimaryButton,
            { onClick: toggle, noArrow: !0 },
            y ? "Pausar" : s === 0 && l === CARDIO_PHASES[0].dur ? "Iniciar" : "Reanudar",
          ),
          React.createElement(
            QuietButton,
            {
              style: { flex: 0.55 },
              onClick: undo
                ? () => Date.now() - undo.t > 700 && (setTimer({ phase: undo.phase, left: undo.left, endAt: undo.endAt ? Date.now() + undo.left * 1e3 : null }), setUndo(null))
                : skip,
            },
            undo ? "Deshacer" : "Saltar",
          ),
        ),
      React.createElement(
        "div",
        {
          "aria-hidden": "true",
          style: { display: "flex", gap: 4, justifyContent: "center", marginBottom: 20 },
        },
        CARDIO_PHASES.map((c, p) =>
          React.createElement("div", {
            key: p,
            style: {
              width: c.hot ? 24 : 12,
              height: 6,
              borderRadius: R.circle,
              background: p < s ? T.ok : p === s ? (c.hot ? T.primary : T.accent) : T.track,
              transition: `background 350ms ${T.ease}`,
            },
          }),
        ),
      ),
      React.createElement(
        Card,
        { minHeight: 0, pad: 18, style: { marginBottom: 12 } },
        React.createElement(Label, null, "Registro de intervalos"),
        React.createElement(
          "div",
          { style: { marginTop: 10 } },
          m.map((c, p) =>
            React.createElement(
              "div",
              {
                key: p,
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 0",
                  borderTop: p === 0 ? "none" : `1px solid ${T.line}`,
                },
              },
              React.createElement("span", { style: { width: 20, ...TYPE.label, color: T.mut } }, p + 1),
              React.createElement(NumInput, {
                value: c.vel ?? "",
                onChange: (n) => d(p, "vel", n),
                placeholder: "0",
                suffix: "km/h",
                width: 70,
                ariaLabel: `Velocidad intervalo ${p + 1}`,
              }),
              React.createElement(NumInput, {
                value: c.inc ?? "",
                onChange: (n) => d(p, "inc", n),
                placeholder: "0",
                suffix: "%",
                width: 58,
                ariaLabel: `Inclinación intervalo ${p + 1}`,
              }),
              React.createElement(NumInput, {
                value: c.fc ?? "",
                onChange: (n) => d(p, "fc", n),
                placeholder: "0",
                suffix: "ppm",
                width: 66,
                ariaLabel: `Frecuencia cardíaca intervalo ${p + 1}`,
              }),
              React.createElement(NumInput, {
                value: c.rpe ?? "",
                onChange: (n) => d(p, "rpe", n),
                placeholder: "RPE",
                width: 54,
                ariaLabel: `Esfuerzo percibido intervalo ${p + 1}`,
              }),
            ),
          ),
        ),
      ),
      [
        ["Abdomen", ABS_SAT, "abs"],
        ["Movilidad", MOB_SAT, "mob"],
      ].map(([c, p, n]) =>
        React.createElement(
          Card,
          { key: n, minHeight: 0, pad: 18, style: { marginBottom: 12 } },
          React.createElement(Label, null, c),
          React.createElement(
            "div",
            { style: { marginTop: 6 } },
            p.map((g, I) => {
              const $ = `${n}${I}`,
                B = !!k[$];
              return React.createElement(
                "button",
                {
                  key: $,
                  onClick: () => S($),
                  "aria-pressed": B,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    borderTop: I === 0 ? "none" : `1px solid ${T.line}`,
                    padding: "10px 0",
                    cursor: "pointer",
                    minHeight: 44,
                  },
                },
                React.createElement(Photo, {
                  id: g.img,
                  alt: "",
                  height: 44,
                  radius: 12,
                  style: { width: 44, flexShrink: 0, opacity: B ? 0.45 : 1 },
                }),
                React.createElement(
                  "span",
                  {
                    style: {
                      ...TYPE.body,
                      flex: 1,
                      color: B ? T.mut : T.text,
                      textDecoration: B ? "line-through" : "none",
                    },
                  },
                  g.t,
                  g.n && <span style={{ display: "block", fontSize: 11.5, color: T.mut, textDecoration: "none" }}>{g.n}</span>,
                ),
                React.createElement(
                  "span",
                  {
                    "aria-hidden": "true",
                    style: {
                      width: 26,
                      height: 26,
                      borderRadius: R.circle,
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: B ? T.primary : T.surfaceMuted,
                      color: B ? "#FFF" : T.mut,
                      fontSize: 13,
                    },
                  },
                  "✓",
                ),
              );
            }),
          ),
        ),
      ),
      React.createElement(PrimaryButton, { onClick: i, tone: "accent" }, "Terminar sesión"),
    ),
  );
}
// Lo que escribes se guarda como borrador (ui:checkin) por si cierras la app antes de guardar.
function CheckinView({ onSave: e, onSkip: a }) {
  const draft = lsGet("ui:checkin") || {},
    [t, i] = useState(draft.energia ?? null),
    [r, s] = useState(draft.sueno || ""),
    [o, l] = useState(draft.peso || ""),
    [b, y] = useState(draft.molestias || "");
  useEffect(() => lsSet("ui:checkin", { energia: t, sueno: r, peso: o, molestias: b }), [t, r, o, b]);
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Header, { title: "Sesión completada" }),
    React.createElement(
      Screen,
      null,
      React.createElement(
        "div",
        { style: { ...TYPE.display, color: T.text, margin: "6px 0 22px" } },
        "Bien",
        React.createElement("br", null),
        "hecho.",
      ),
      React.createElement(
        Card,
        { minHeight: 0, pad: 18, style: { marginBottom: 10 } },
        React.createElement(Label, null, "Energía de hoy"),
        React.createElement(
          "div",
          {
            role: "group",
            "aria-label": "Energía de hoy",
            style: { display: "flex", gap: 6, marginTop: 12 },
          },
          [1, 2, 3, 4, 5].map((f) =>
            React.createElement(
              "button",
              {
                key: f,
                onClick: () => i(f),
                "aria-pressed": t === f,
                style: {
                  flex: 1,
                  height: 52,
                  borderRadius: R.control,
                  cursor: "pointer",
                  border: "1px solid transparent",
                  background: t === f ? T.primary : T.surfaceMuted,
                  color: t === f ? "#FFF" : T.mut,
                  font: `600 16px/1 ${T.font}`,
                },
              },
              f,
            ),
          ),
        ),
        React.createElement(
          "div",
          { style: { ...TYPE.body, color: T.mut, marginTop: 8 } },
          "1 es agotado · 5 es con energía de sobra",
        ),
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 10, marginBottom: 10 } },
        React.createElement(
          Card,
          { minHeight: 0, pad: 18, style: { flex: 1 } },
          React.createElement(Label, null, "Sueño anoche"),
          React.createElement(
            "div",
            { style: { marginTop: 12 } },
            React.createElement(NumInput, {
              value: r,
              onChange: s,
              placeholder: "0",
              suffix: "h",
              width: 86,
              ariaLabel: "Horas de sueño",
            }),
          ),
        ),
        React.createElement(
          Card,
          { minHeight: 0, pad: 18, style: { flex: 1 } },
          React.createElement(Label, null, "Peso corporal"),
          React.createElement(
            "div",
            { style: { marginTop: 12 } },
            React.createElement(NumInput, {
              value: o,
              onChange: l,
              placeholder: "0",
              suffix: "kg",
              width: 86,
              ariaLabel: "Peso corporal",
            }),
          ),
        ),
      ),
      React.createElement(
        Card,
        { minHeight: 0, pad: 18, style: { marginBottom: 16 } },
        React.createElement(Label, null, "Molestias"),
        React.createElement("input", {
          value: b,
          onChange: (f) => y(f.target.value),
          placeholder: "Ninguna",
          "aria-label": "Molestias",
          style: {
            marginTop: 10,
            width: "100%",
            boxSizing: "border-box",
            height: 46,
            padding: "0 12px",
            borderRadius: R.control,
            background: T.surfaceMuted,
            border: "1px solid transparent",
            color: T.text,
            font: `400 16px/1 ${T.font}`,
            outline: "none",
          },
        }),
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 10 } },
        React.createElement(QuietButton, { onClick: a, style: { flex: 0.7 } }, "Omitir datos"),
        React.createElement(
          PrimaryButton,
          { onClick: () => e({ energia: t, sueno: r, peso: o, molestias: b }) },
          "Guardar registro",
        ),
      ),
    ),
  );
}
function WeightLogger({ weights: e, onAdd: a }) {
  const [t, i] = useState(""),
    [r, s] = useState(isoDate()),
    o = e.some((b) => b.d === r),
    l = () => {
      const b = parseFloat(String(t).replace(",", "."));
      !isFinite(b) || b <= 0 || (a(r, b), i(""));
    };
  return React.createElement(
    "div",
    { style: { marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.line}` } },
    React.createElement(Label, null, "Registrar peso"),
    React.createElement(
      "div",
      { style: { display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" } },
      React.createElement(NumInput, {
        value: t,
        onChange: i,
        placeholder: "0",
        suffix: "kg",
        width: 96,
        ariaLabel: "Peso de hoy",
      }),
      React.createElement("input", {
        type: "date",
        value: r,
        max: isoDate(),
        onChange: (b) => s(b.target.value),
        "aria-label": "Fecha del registro",
        style: {
          height: 46,
          padding: "0 10px",
          borderRadius: R.control,
          background: T.surfaceMuted,
          border: "1px solid transparent",
          color: T.text,
          font: `500 16px/1 ${T.font}`,
          outline: "none",
        },
      }),
      React.createElement(
        "button",
        {
          onClick: l,
          disabled: !t,
          style: {
            height: 46,
            flex: 1,
            minWidth: 96,
            borderRadius: R.control,
            border: "none",
            background: t ? T.primary : T.surfaceMuted,
            color: t ? "#FFFFFF" : T.mut,
            font: `700 14px/1 ${T.font}`,
            cursor: t ? "pointer" : "default",
          },
        },
        "Guardar",
      ),
    ),
    React.createElement(
      "div",
      { style: { ...TYPE.body, color: T.mut, marginTop: 10 } },
      o
        ? "Ya hay un registro en esa fecha: guardar lo reemplaza."
        : "Pésate a la misma hora, en ayunas y después del baño.",
    ),
  );
}
function ProgressView({ summary: e, week: a, onBack: t, profile: i = {}, weights: r = [], onAddWeight: s }) {
  const o = [...r].sort((n, g) => (n.d < g.d ? -1 : 1)),
    l = {};
  e.filter((n) => n.day === 1 && n.pullups != null).forEach((n) => {
    l[n.w] = Math.max(l[n.w] || 0, n.pullups);
  });
  const b = e.length,
    y = e.filter((n) => n.energia),
    f = y.length ? y.reduce((n, g) => n + g.energia, 0) / y.length : 0,
    x = e.slice(-2).filter((n) => n.energia && n.energia <= 2).length >= 2,
    u = o.length ? o[o.length - 1].v : null,
    m = o.length > 1 ? u - o[0].v : null,
    d = u && i.goal ? u - parseFloat(i.goal) : null,
    k = 300,
    S = 110;
  let c = "",
    p = [];
  if (o.length > 0) {
    const n = o.map(($) => $.v),
      g = Math.min(...n) - 0.5,
      I = Math.max(...n) + 0.5;
    ((p = o.map(($, B) => ({
      x: o.length === 1 ? k / 2 : (B / (o.length - 1)) * (k - 20) + 10,
      y: S - 12 - (($.v - g) / (I - g || 1)) * (S - 26),
      v: $.v,
    }))),
      (c = p.map(($, B) => `${B === 0 ? "M" : "L"}${$.x} ${$.y}`).join(" ")));
  }
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Header, { title: "Progreso", onBack: t }),
    React.createElement(
      Screen,
      { tabbed: !t },
      x &&
        React.createElement(
          Card,
          {
            minHeight: 0,
            pad: 16,
            style: { marginBottom: 10, background: "#FFF7EA", borderColor: "rgba(154,90,0,0.25)" },
          },
          React.createElement(Label, { color: T.warn }, "Atención"),
          React.createElement(
            "div",
            { style: { ...TYPE.body, color: T.text, marginTop: 6 } },
            "Energía baja en tus últimas sesiones. Si además duermes mal o caen tus cargas, el plan indica reducir el volumen entre 20 y 30 %, no entrenar más.",
          ),
        ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 10, marginBottom: 10 } },
        [
          [b, "Sesiones"],
          [`S${a}`, "Semana"],
          [f ? f.toFixed(1) : "—", "Energía media"],
        ].map(([n, g], I) =>
          React.createElement(
            Card,
            {
              key: I,
              minHeight: 118,
              pad: 16,
              style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" },
            },
            React.createElement(Label, null, g),
            React.createElement("div", { style: { ...TYPE.numeric, fontSize: 34, color: T.text } }, n),
          ),
        ),
      ),
      React.createElement(
        Card,
        { minHeight: 0, pad: 18, style: { marginBottom: 10 } },
        React.createElement(Label, null, "Peso corporal", i.goal ? ` · meta ${i.goal} kg` : ""),
        o.length === 0
          ? React.createElement(
              "div",
              { style: { ...TYPE.body, color: T.mut, padding: "14px 0 0" } },
              "Aún no hay registros. Anota tu peso aquí abajo y verás la tendencia.",
            )
          : React.createElement(
              React.Fragment,
              null,
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    marginTop: 10,
                    flexWrap: "wrap",
                  },
                },
                React.createElement(
                  "span",
                  { style: { ...TYPE.numeric, color: T.text } },
                  u,
                  React.createElement("span", { style: { fontSize: 18, color: T.mut } }, " kg"),
                ),
                m !== null &&
                  m !== 0 &&
                  React.createElement(
                    "span",
                    { style: { ...TYPE.body, color: m < 0 ? T.ok : T.mut } },
                    m < 0 ? "−" : "+",
                    Math.abs(m).toFixed(1),
                    " kg desde el inicio",
                  ),
              ),
              d !== null &&
                React.createElement(
                  "div",
                  { style: { ...TYPE.body, color: T.mut, marginTop: 4 } },
                  d > 0 ? `Faltan ${d.toFixed(1)} kg para tu meta` : "Meta alcanzada",
                ),
              React.createElement(
                "svg",
                {
                  viewBox: `0 0 ${k} ${S}`,
                  style: { width: "100%", marginTop: 10 },
                  role: "img",
                  "aria-label": "Tendencia de peso corporal",
                },
                React.createElement("path", {
                  d: c,
                  fill: "none",
                  stroke: T.primary,
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                }),
                p.map((n, g) =>
                  React.createElement(
                    "g",
                    { key: g },
                    React.createElement("circle", {
                      cx: n.x,
                      cy: n.y,
                      r: "3",
                      fill: T.surface,
                      stroke: T.primary,
                      strokeWidth: "2",
                    }),
                    (g === 0 || g === p.length - 1) &&
                      React.createElement(
                        "text",
                        {
                          x: n.x,
                          y: n.y - 9,
                          fill: T.mut,
                          fontSize: "10",
                          textAnchor: "middle",
                          fontFamily: T.font,
                        },
                        n.v,
                      ),
                  ),
                ),
              ),
              React.createElement(
                "div",
                { style: { ...TYPE.body, color: T.mut, fontSize: 11.5 } },
                o.length,
                " ",
                o.length === 1 ? "registro" : "registros",
                " · el último el ",
                o[o.length - 1].d,
              ),
            ),
        React.createElement(WeightLogger, { weights: o, onAdd: s }),
      ),
      React.createElement(
        Card,
        { minHeight: 0, pad: 18 },
        React.createElement(Label, null, "Dominadas estrictas por semana"),
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "flex-end", gap: 6, height: 130, marginTop: 16 } },
          [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
            const g = l[n] || 0,
              I = n === 8 ? 16 : parseInt(PULLUP_TARGETS[n], 10);
            return React.createElement(
              "div",
              {
                key: n,
                style: {
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  height: "100%",
                  justifyContent: "flex-end",
                },
              },
              g > 0 &&
                React.createElement("span", { style: { fontSize: 11, color: T.mut, fontFamily: T.font } }, g),
              React.createElement("div", {
                style: {
                  width: "100%",
                  borderRadius: 6,
                  minHeight: 3,
                  height: `${Math.max(3, (g / 18) * 100)}%`,
                  background: g >= I ? T.ok : g > 0 ? T.primary : T.track,
                  transition: `height 350ms ${T.ease}`,
                },
              }),
              React.createElement("span", { style: { ...TYPE.label, color: n === a ? T.text : T.mut } }, n),
            );
          }),
        ),
        React.createElement(
          "div",
          { style: { ...TYPE.body, color: T.mut, marginTop: 12 } },
          "Objetivo del ciclo: superar claramente tu máximo actual.",
        ),
      ),
    ),
  );
}
function SetupView({ profile: e, first: a, onSave: t, onClose: i, onExport: r, onImport: s, persisted: o }) {
  const [l, b] = useState(e.name || ""),
    [y, f] = useState(e.goal || ""),
    x = useRef(null),
    u = {
      width: "100%",
      boxSizing: "border-box",
      height: 46,
      padding: "0 12px",
      borderRadius: R.control,
      background: T.surfaceMuted,
      border: "1px solid transparent",
      color: T.text,
      font: `400 16px/1 ${T.font}`,
      outline: "none",
    };
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Header, { title: a ? "Bienvenido" : "Ajustes", onBack: a ? null : i }),
    React.createElement(
      Screen,
      null,
      a &&
        React.createElement(
          "div",
          { style: { ...TYPE.display, color: T.text, margin: "6px 0 20px" } },
          "Tu plan,",
          React.createElement("br", null),
          "semana a",
          React.createElement("br", null),
          "semana.",
        ),
      React.createElement(
        Card,
        { minHeight: 0, pad: 18, style: { marginBottom: 10 } },
        React.createElement(Label, null, "Cómo te llamamos"),
        React.createElement("input", {
          value: l,
          onChange: (m) => b(m.target.value),
          placeholder: "Tu nombre (opcional)",
          "aria-label": "Tu nombre",
          style: { ...u, marginTop: 10 },
        }),
        React.createElement(
          "div",
          { style: { marginTop: 16 } },
          React.createElement(Label, null, "Peso objetivo"),
          React.createElement(
            "div",
            { style: { marginTop: 10 } },
            React.createElement(NumInput, {
              value: y,
              onChange: f,
              placeholder: "0",
              suffix: "kg",
              width: 100,
              ariaLabel: "Peso objetivo",
            }),
          ),
        ),
      ),
      React.createElement(
        Card,
        { minHeight: 0, pad: 18, style: { marginBottom: 10 } },
        React.createElement(Label, null, "Copia de seguridad"),
        React.createElement(
          "div",
          { style: { ...TYPE.body, color: T.mut, margin: "8px 0 14px" } },
          "Descarga tu historial como archivo, o restáuralo en otro navegador o teléfono.",
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 10 } },
          React.createElement(QuietButton, { onClick: r }, "Exportar"),
          React.createElement(QuietButton, { onClick: () => x.current && x.current.click() }, "Importar"),
        ),
        React.createElement("input", {
          ref: x,
          type: "file",
          accept: "application/json,.json",
          style: { display: "none" },
          onChange: (m) => {
            const d = m.target.files && m.target.files[0];
            (d && s(d), (m.target.value = ""));
          },
        }),
      ),
      React.createElement(
        Card,
        { minHeight: 0, pad: 18, style: { marginBottom: 16 } },
        React.createElement(Label, null, "Dónde viven tus datos"),
        React.createElement(
          "div",
          { style: { ...TYPE.body, color: T.mut, marginTop: 8 } },
          "Todo lo que registras se guarda en este navegador, en este teléfono. No hay servidor ni cuenta, y la app no puede enviar información a ningún sitio.",
        ),
        React.createElement(
          "div",
          {
            style: {
              marginTop: 14,
              padding: 12,
              borderRadius: R.control,
              background: o ? "#EDF7F1" : "#FFF7EA",
              border: `1px solid ${o ? "rgba(32,138,91,0.25)" : "rgba(154,90,0,0.25)"}`,
            },
          },
          React.createElement(
            Label,
            { color: o ? T.ok : T.warn },
            o ? "Almacenamiento protegido" : "Sin protección reforzada",
          ),
          React.createElement(
            "div",
            { style: { ...TYPE.body, color: T.text, marginTop: 6 } },
            o
              ? "El navegador no borrará tu historial para liberar espacio."
              : "Exporta una copia cada pocas semanas para no depender del navegador.",
          ),
        ),
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 10 } },
        !a && React.createElement(QuietButton, { onClick: i, style: { flex: 0.55 } }, "Cancelar"),
        React.createElement(
          PrimaryButton,
          { onClick: () => t({ name: l.trim(), goal: y.trim() }) },
          a ? "Empezar" : "Guardar",
        ),
      ),
    ),
  );
}
function Home({
  week: e,
  setWeek: a,
  selDay: t,
  setSelDay: i,
  summary: r,
  onStart: s,
  onProgress: o,
  profile: l,
  onSettings: b,
  mealBar: mb,
}) {
  const y = ROUTINE[t],
    f = todayKey(),
    x = r.some((d) => d.date === isoDate() && d.day === t),
    u = DAY_ORDER.filter((d) => !ROUTINE[d].rest && r.some((k) => k.w === e && k.day === d)).length,
    m = DAY_ORDER.filter((d) => !ROUTINE[d].rest).length;
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Header, {
      title: l.name ? `Hola, ${l.name}` : "Tracker Híbrido",
      right: React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            onClick: b,
            "aria-label": "Ajustes",
            style: {
              width: 44,
              height: 44,
              marginRight: -8,
              borderRadius: R.circle,
              border: "none",
              background: "transparent",
              color: T.text,
              fontSize: 17,
              cursor: "pointer",
            },
          },
          "⚙",
        ),
      ),
    }),
    React.createElement(
      Screen,
      { tabbed: !0 },
      mb,
      React.createElement(
        Photo,
        {
          id: y.hero,
          alt: y.title,
          height: "min(50svh, 430px)",
          radius: R.hero,
          overlay: T.overlay,
          style: { minHeight: 330, boxShadow: T.heroShadow, marginBottom: 10 },
        },
        React.createElement(
          "div",
          { style: { position: "absolute", top: 18, right: 18 } },
          React.createElement(
            Ring,
            { size: 82, stroke: 5, progress: u / m, color: "#FFFFFF", track: "rgba(255,255,255,0.3)" },
            React.createElement("span", { style: { ...TYPE.label, color: "#FFFFFF" } }, u, "/", m),
          ),
        ),
        React.createElement(
          "div",
          { style: { position: "absolute", left: 20, right: 20, bottom: 22, color: "#FFFFFF" } },
          React.createElement(
            Label,
            { color: "rgba(255,255,255,0.8)" },
            DAY_NAME[t],
            t === f ? " · hoy" : "",
          ),
          React.createElement(
            "h1",
            { style: { ...TYPE.display, margin: "10px 0 8px", maxWidth: "80%" } },
            y.title,
          ),
          React.createElement(
            "div",
            { style: { ...TYPE.body, color: "rgba(255,255,255,0.78)", maxWidth: "88%" } },
            y.sub,
          ),
        ),
      ),
      React.createElement(
        "div",
        {
          role: "group",
          "aria-label": "Día de la semana",
          style: { display: "flex", gap: 5, marginBottom: 10 },
        },
        DAY_ORDER.map((d) => {
          const k = t === d,
            S = r.some((c) => c.w === e && c.day === d);
          return React.createElement(
            "button",
            {
              key: d,
              onClick: () => i(d),
              "aria-pressed": k,
              "aria-label": DAY_NAME[d],
              style: {
                flex: 1,
                height: 56,
                borderRadius: R.control,
                cursor: "pointer",
                background: k ? T.primary : T.surface,
                border: `1px solid ${k ? T.primary : d === f ? "rgba(0,113,227,0.5)" : T.line}`,
                color: k ? "#FFFFFF" : ROUTINE[d].rest ? T.mut : T.text,
                font: `700 15px/1 ${T.font}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                transition: `all 200ms ${T.ease}`,
              },
            },
            DAY_LETTER[d],
            React.createElement("span", {
              "aria-hidden": "true",
              style: {
                width: 4,
                height: 4,
                borderRadius: R.circle,
                background: S ? (k ? "#FFFFFF" : T.ok) : "transparent",
              },
            }),
          );
        }),
      ),
      y.rest
        ? React.createElement(
            Card,
            { minHeight: 0, pad: 18, style: { marginBottom: 10 } },
            React.createElement(Label, null, "Sin sesión"),
            React.createElement(
              "div",
              { style: { ...TYPE.body, color: T.mut, margin: "8px 0 14px" } },
              "El descanso también es entrenamiento. Camina, hidrátate y duerme entre 7 y 8 horas.",
            ),
            React.createElement(QuietButton, { onClick: o }, "Registrar peso"),
          )
        : React.createElement(
            PrimaryButton,
            { onClick: s, style: { marginBottom: 10 } },
            x ? "Continuar sesión" : y.cardio ? "Iniciar 4×4" : "Iniciar sesión",
          ),
      React.createElement(
        Card,
        { minHeight: 0, pad: 18, style: { marginBottom: 10 } },
        React.createElement(Label, null, "Ciclo de 8 semanas"),
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 14, marginTop: 12 } },
          React.createElement(
            "button",
            { onClick: () => a(Math.max(1, e - 1)), "aria-label": "Semana anterior", style: stepBtn },
            "−",
          ),
          React.createElement(
            "div",
            { style: { flex: 1, textAlign: "center" } },
            React.createElement(
              "div",
              { style: { ...TYPE.numeric, color: T.text } },
              e,
              React.createElement("span", { style: { color: T.mut, fontSize: 20 } }, " / 8"),
            ),
          ),
          React.createElement(
            "button",
            { onClick: () => a(Math.min(8, e + 1)), "aria-label": "Semana siguiente", style: stepBtn },
            "+",
          ),
        ),
        React.createElement(
          "div",
          {
            style: {
              ...TYPE.body,
              color: e === 4 || e === 8 ? T.warn : T.mut,
              marginTop: 12,
              textAlign: "center",
            },
          },
          WEEK_NOTES[e],
        ),
      ),
      (t === 1 || t === 5) &&
        React.createElement(
          Card,
          { minHeight: 0, pad: 18, style: { marginBottom: 10 } },
          React.createElement(Label, null, "Dominadas esta semana"),
          React.createElement(
            "div",
            { style: { ...TYPE.numeric, color: T.text, marginTop: 10, fontSize: t === 1 ? 40 : 24 } },
            t === 1 ? `${PULLUP_TARGETS[e]} reps` : ASSIST_TARGETS[e],
          ),
          React.createElement(
            "div",
            { style: { ...TYPE.body, color: T.mut, marginTop: 6 } },
            t === 1 ? "Estrictas, en series de 1–2 repeticiones" : "Asistidas con banda",
          ),
        ),
      !y.rest &&
        !y.cardio &&
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              gap: 10,
              overflowX: "auto",
              padding: "0 0 4px",
              margin: "0 0 10px",
              scrollbarWidth: "none",
            },
          },
          y.exercises.map((d) =>
            React.createElement(
              "div",
              { key: d.id, style: { flexShrink: 0, width: 108 } },
              React.createElement(Photo, { id: d.img, alt: d.name, height: 108, radius: R.control, note: d.imgNote && "Variante" }),
              React.createElement(
                "div",
                { style: { ...TYPE.body, fontSize: 11, color: T.mut, marginTop: 6, lineHeight: 1.35 } },
                d.name.split(" (")[0],
              ),
            ),
          ),
        ),
      React.createElement(
        "div",
        { style: { ...TYPE.body, color: T.mut, textAlign: "center", marginTop: 26, fontSize: 11.5 } },
        "Compuestos nunca al fallo. La serie termina cuando se deteriora la técnica.",
        React.createElement("br", null),
        "Ante dolor en el pecho, mareo o palpitaciones, detente y consulta a un médico.",
      ),
    ),
  );
}
/* ---------- Nutrición ---------- */
// Objetivos del plan nutricional (g/día). Las kcal se calculan: 4 por g de proteína y carbohidrato, 9 por g de grasa.
const NUTRI_DEFAULT = {
    targets: { train: { p: 170, g: 85, c: 190 }, rest: { p: 170, g: 85, c: 150 } },
    meals: [],
  },
  MEAL_PRESETS = {
    3: ["Desayuno", "Almuerzo", "Cena"],
    4: ["Desayuno", "Almuerzo", "Merienda", "Cena"],
    5: ["Desayuno", "Media mañana", "Almuerzo", "Merienda", "Cena"],
    6: ["Desayuno", "Media mañana", "Almuerzo", "Merienda", "Cena", "Antes de dormir"],
  },
  MACROS = [
    ["p", "Proteína"],
    ["g", "Grasas"],
    ["c", "Carbohidratos"],
  ],
  WHEN = [
    ["all", "Todos los días"],
    ["train", "Días de entreno"],
    ["rest", "Días de descanso"],
  ],
  MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  num = (v) => {
    const n = parseFloat(String(v ?? "").replace(",", "."));
    return isFinite(n) && n > 0 ? n : 0;
  },
  kcalOf = (m) => Math.round(num(m.p) * 4 + num(m.g) * 9 + num(m.c) * 4),
  hasMacros = (m) => !!m && (num(m.p) > 0 || num(m.g) > 0 || num(m.c) > 0),
  fmtN = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."),
  macroLine = (m) =>
    hasMacros(m)
      ? `${fmtN(num(m.p))} prot · ${fmtN(num(m.g))} grasa · ${fmtN(num(m.c))} carb · ${fmtN(kcalOf(m))} kcal`
      : "",
  lsGet = (k) => {
    try {
      const v = localStorage.getItem("th:" + k);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  lsSet = (k, v) => {
    try {
      localStorage.setItem("th:" + k, JSON.stringify(v));
    } catch {}
  },
  uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  dateFromIso = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  },
  addDays = (s, n) => {
    const d = dateFromIso(s);
    return (d.setDate(d.getDate() + n), isoDate(d));
  },
  defaultDayType = (s) => (ROUTINE[dateFromIso(s).getDay()].rest ? "rest" : "train"),
  fmtDay = (s) => {
    const d = dateFromIso(s),
      t = isoDate(),
      base = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
    return s === t ? `Hoy · ${base}` : s === addDays(t, -1) ? `Ayer · ${base}` : `${DAY_NAME[d.getDay()]} ${base}`;
  },
  // Lee el plan guardado y rellena lo que falte (p. ej. una copia importada incompleta) con los valores por defecto.
  loadPlan = () => {
    const p = lsGet("nutri:plan");
    if (!p || typeof p !== "object") return NUTRI_DEFAULT;
    const tg = p.targets || {};
    return {
      ...p,
      targets: { train: { ...NUTRI_DEFAULT.targets.train, ...tg.train }, rest: { ...NUTRI_DEFAULT.targets.rest, ...tg.rest } },
      meals: Array.isArray(p.meals) ? p.meals.filter((m) => m && m.id) : [],
    };
  },
  // Todo lo que se ve de un día: tipo, comidas que tocan, hechas, totales y objetivo.
  // Cada marca guarda copia de nombre y gramos (snap) y cada día copia de los objetivos (tg):
  // editar el plan después no reescribe el pasado. Si la comida no tenía gramos al marcarla,
  // se usan los del plan actual (completar el plan sí actualiza esos días).
  // Una comida marcada sigue en su día aunque luego cambie su "cuándo toca" (off) o se borre del plan (gone);
  // en días pasados se muestra con el nombre que tenía al marcarla.
  dayInfo = (plan, rec, date) => {
    const type = rec.type === "train" || rec.type === "rest" ? rec.type : defaultDayType(date),
      done = rec.done && typeof rec.done === "object" && !Array.isArray(rec.done) ? rec.done : {},
      past = date < isoDate(),
      nameOf = (m) => (past && done[m.id] && done[m.id].snap && done[m.id].snap.name) || m.name,
      fits = (m) => m.when === "all" || m.when === type,
      byId = new Map(plan.meals.map((m) => [m.id, m])),
      meals = [
        ...plan.meals.filter(fits).map((m) => ({ ...m, name: nameOf(m) })),
        ...Object.entries(done)
          .filter(([id, d]) => d && typeof d === "object" && !(byId.has(id) && fits(byId.get(id))) && (byId.has(id) || d.snap))
          .map(([id, d]) => (byId.has(id) ? { ...byId.get(id), name: nameOf(byId.get(id)), off: !0 } : { id, ...d.snap, gone: !0 })),
      ],
      extra = Array.isArray(rec.extra) ? rec.extra.filter((x) => x && typeof x === "object") : [],
      tot = { p: 0, g: 0, c: 0 },
      src = (m, d) => (hasMacros(d.adj) ? d.adj : hasMacros(d.snap) ? d.snap : m);
    for (const m of meals) {
      const d = done[m.id];
      if (!d) continue;
      for (const [k] of MACROS) tot[k] += num(src(m, d)[k]);
    }
    for (const x of extra) for (const [k] of MACROS) tot[k] += num(x[k]);
    tot.kcal = kcalOf(tot);
    // Objetivos congelados solo para días ya pasados; hoy siempre sigue al plan.
    const tgs = (past && rec.tg && typeof rec.tg === "object" && rec.tg[type]) ? rec.tg : plan.targets,
      target = { ...NUTRI_DEFAULT.targets[type], ...tgs[type] };
    target.kcal = kcalOf(target);
    return {
      type,
      typeIsDefault: !rec.type,
      meals,
      done,
      extra,
      tot,
      target,
      shown: (m) => (done[m.id] ? src(m, done[m.id]) : m),
      doneCount: meals.filter((m) => done[m.id]).length,
      tracked: meals.some((m) => done[m.id] && hasMacros(src(m, done[m.id]))) || extra.some(hasMacros),
    };
  };

const ForkGlyph = ({ size: e = 22, color: a = "currentColor" }) => (
  <svg width={e} height={e} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke={a} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 21V3c-2.2 1.2-3.5 3.6-3.5 7v3H17" />
  </svg>
);
const BarsGlyph = ({ size: e = 22, color: a = "currentColor" }) => (
  <svg width={e} height={e} viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="16" x2="4" y2="10" />
    <line x1="10" y1="16" x2="10" y2="4" />
    <line x1="16" y1="16" x2="16" y2="8" />
  </svg>
);

function TabBar({ tab, onTab }) {
  const items = [
    ["home", "Entreno", <DumbbellGlyph size={24} color="currentColor" />],
    ["nutrition", "Comidas", <ForkGlyph size={22} />],
    ["progress", "Progreso", <BarsGlyph size={20} />],
  ];
  return (
    <nav
      aria-label="Secciones"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 45,
        background: "rgba(245,245,247,0.9)",
        backdropFilter: "saturate(180%) blur(22px)",
        WebkitBackdropFilter: "saturate(180%) blur(22px)",
        borderTop: `1px solid ${T.line}`,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto", display: "flex" }}>
        {items.map(([k, l, ic]) => (
          <button
            key={k}
            onClick={() => onTab(k)}
            aria-current={tab === k ? "page" : undefined}
            style={{
              flex: 1,
              height: 62,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: tab === k ? T.text : T.mut,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              font: `${tab === k ? 700 : 600} 11px/1 ${T.font}`,
              letterSpacing: "0.01em",
            }}
          >
            {ic}
            {l}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Toast({ toast, onAction }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: 14,
        right: 14,
        bottom: "calc(76px + env(safe-area-inset-bottom))",
        zIndex: 80,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        key={toast.id}
        style={{
          pointerEvents: "auto",
          maxWidth: 532,
          width: "100%",
          background: "#1C1C1E",
          color: "#FFFFFF",
          borderRadius: R.control,
          padding: "0 6px 0 16px",
          minHeight: 52,
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          animation: `enter 250ms ${T.ease} both`,
          font: `500 14px/1.35 ${T.font}`,
        }}
      >
        <span style={{ flex: 1, padding: "10px 0" }}>{toast.msg}</span>
        {toast.action && (
          <button
            onClick={onAction}
            style={{
              minHeight: 44,
              padding: "0 12px",
              border: "none",
              background: "transparent",
              color: "#6CB4FF",
              font: `700 14px/1 ${T.font}`,
              cursor: "pointer",
            }}
          >
            {toast.action}
          </button>
        )}
      </div>
    </div>
  );
}

function Sheet({ title, onClose, children, dirty }) {
  useBackLayer(onClose);
  useEffect(() => {
    const k = (ev) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div
      onClick={() => dirty || onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(0,0,0,0.32)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        animation: `fade 200ms ${T.ease} both`,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(ev) => ev.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "88svh",
          overflowY: "auto",
          background: T.bg,
          borderRadius: "26px 26px 0 0",
          padding: "10px 16px calc(20px + env(safe-area-inset-bottom))",
          animation: `rise 300ms ${T.ease} both`,
        }}
      >
        <div aria-hidden="true" style={{ width: 38, height: 5, borderRadius: 9, background: T.track, margin: "0 auto 12px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ ...TYPE.title, fontSize: 19, flex: 1 }}>{title}</div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ width: 44, height: 44, borderRadius: R.circle, border: "none", background: T.surfaceMuted, color: T.text, fontSize: 18, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  height: 46,
  padding: "0 12px",
  borderRadius: R.control,
  background: T.surfaceMuted,
  border: "1px solid transparent",
  color: T.text,
  font: `400 16px/1 ${T.font}`,
  outline: "none",
};

function MacroInputs({ value: e, onChange: a }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {MACROS.map(([k, l]) => (
        <div key={k} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ ...TYPE.label, color: T.mut, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l}</span>
          <NumInput value={e[k] ?? ""} onChange={(v) => a({ ...e, [k]: v })} placeholder="0" suffix="g" grow ariaLabel={`${l} en gramos`} />
        </div>
      ))}
    </div>
  );
}

function MealRow({ meal: m, entry: d, shown, onToggle, onMore, last }) {
  const done = !!d,
    sub = m.gone
      ? "Ya no está en tu plan"
      : m.off
        ? `Ahora toca solo en ${m.when === "train" ? "entreno" : "descanso"}`
      : done && d.note
        ? `Con cambios: ${d.note}`
        : macroLine(shown ? shown(m) : m);
  return (
    <div style={{ display: "flex", alignItems: "center", borderTop: last === 0 ? "none" : `1px solid ${T.line}` }}>
      <button
        onClick={onToggle}
        aria-pressed={done}
        aria-label={done ? `Quitar marca: ${m.name}` : `Marcar comida: ${m.name}`}
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 62,
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "none",
          border: "none",
          padding: "10px 0",
          textAlign: "left",
          cursor: "pointer",
          color: T.text,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: R.circle,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: done ? T.ok : "transparent",
            border: `2px solid ${done ? T.ok : "rgba(0,0,0,0.22)"}`,
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 700,
            transition: `all 200ms ${T.ease}`,
            transform: done ? "scale(1)" : "scale(0.94)",
          }}
        >
          {done ? "✓" : ""}
        </span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: "block", font: `650 16px/1.25 ${T.font}`, letterSpacing: "-0.02em", color: done ? T.mut : T.text }}>{m.name}</span>
          {sub && (
            <span style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, ...TYPE.body, fontSize: 12.5, lineHeight: 1.35, color: T.mut, marginTop: 2, overflow: "hidden" }}>
              {sub}
            </span>
          )}
        </span>
      </button>
      {onMore && (
        <button
          onClick={onMore}
          aria-label={`Opciones de ${m.name}`}
          style={{ width: 44, height: 44, flexShrink: 0, border: "none", background: "transparent", color: T.mut, fontSize: 20, cursor: "pointer", borderRadius: R.circle }}
        >
          ⋯
        </button>
      )}
    </div>
  );
}

// Franja de la pantalla de inicio: la siguiente comida pendiente, marcable con un toque.
// Tras marcar, el botón confirma "Hecha" y queda bloqueado un instante: un doble toque no marca dos comidas.
function NextMealBar({ info: e, onToggle: a, onOpen: t }) {
  const [just, setJust] = useState(null),
    timer = useRef(null),
    pending = e.meals.find((m) => !e.done[m.id]),
    held = just && e.done[just] ? just : null,
    next = held ? e.meals.find((m) => m.id === held) : pending,
    all = e.meals.length > 0 && !pending && !held;
  useEffect(() => () => clearTimeout(timer.current), []);
  const mark = () => {
    if (held || !next) return;
    (a(next), setJust(next.id), clearTimeout(timer.current), (timer.current = setTimeout(() => setJust(null), 1200)));
  };
  return (
    <Card minHeight={0} pad={14} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
      <button
        onClick={t}
        style={{ flex: 1, minWidth: 0, minHeight: 44, background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: T.text }}
      >
        <Label>{e.meals.length ? `Comidas de hoy · ${e.doneCount} de ${e.meals.length}` : "Comidas de hoy"}</Label>
        <div style={{ font: `650 16px/1.25 ${T.font}`, letterSpacing: "-0.02em", marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {!e.meals.length ? "Configura tus comidas ›" : all ? "Todas marcadas ✓" : held ? `${next.name} ✓` : `Siguiente: ${next.name}`}
        </div>
      </button>
      {next && (
        <button
          onClick={mark}
          aria-disabled={!!held}
          aria-label={held ? `Comida hecha: ${next.name}` : `Marcar comida: ${next.name}`}
          style={{
            height: 46,
            minWidth: 96,
            padding: "0 16px",
            borderRadius: R.control,
            border: "none",
            background: held ? T.ok : T.primary,
            color: "#FFFFFF",
            font: `700 14px/1 ${T.font}`,
            cursor: held ? "default" : "pointer",
            flexShrink: 0,
            transition: `background 200ms ${T.ease}`,
          }}
        >
          {held ? "Hecha ✓" : "✓ Hecha"}
        </button>
      )}
    </Card>
  );
}

function MacroBar({ label: e, value: a, target: t, unit: i = "g" }) {
  const pct = t > 0 ? a / t : 0,
    over = pct > 1.1;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ ...TYPE.label, color: T.mut }}>{e}</span>
        <span style={{ font: `600 13px/1 ${T.font}`, color: over ? T.warn : T.text }}>
          {fmtN(a)} <span style={{ color: T.mut, fontWeight: 500 }}>/ {fmtN(t)} {i}</span>
        </span>
      </div>
      <div style={{ height: 6, borderRadius: R.circle, background: T.track, marginTop: 8, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, pct * 100)}%`,
            borderRadius: R.circle,
            background: over ? T.warn : pct >= 0.9 ? T.ok : T.primary,
            transition: `width 450ms ${T.ease}`,
          }}
        />
      </div>
    </div>
  );
}

function MealSheet({ meal: e, entry: a, date: t, onClose: i, onSave: r, onUnmark: s, onEditPlan: o }) {
  const [note, setNote] = useState((a && a.note) || ""),
    base = (a && a.snap) || e,
    [adj, setAdj] = useState((a && a.adj) || { p: base.p ?? "", g: base.g ?? "", c: base.c ?? "" }),
    changed = !!note.trim() || MACROS.some(([k]) => num(adj[k]) !== num(base[k]));
  return (
    <Sheet title={e.name} onClose={i} dirty={changed}>
      <div style={{ ...TYPE.body, color: T.mut, marginTop: -8, marginBottom: 14 }}>
        {fmtDay(t)}
        {hasMacros(e) ? ` · Plan: ${macroLine(e)}` : ""}
      </div>
      {!a && (
        <PrimaryButton
          onClick={() => {
            (r({}), i());
          }}
          tone="accent"
          style={{ marginBottom: 10 }}
        >
          Hecha tal cual
        </PrimaryButton>
      )}
      <Card minHeight={0} pad={16} style={{ marginBottom: 10 }}>
        <Label>Hecha con cambios</Label>
        <textarea
          value={note}
          onChange={(ev) => setNote(ev.target.value)}
          placeholder="Ej.: pollo en vez de pavo, media ración de arroz…"
          rows={2}
          aria-label="Qué cambiaste"
          style={{ ...fieldStyle, height: "auto", padding: 12, marginTop: 10, resize: "vertical", font: `400 16px/1.4 ${T.font}` }}
        />
        <div style={{ ...TYPE.body, color: T.mut, margin: "12px 0 8px" }}>Macros reales (opcional)</div>
        <MacroInputs value={adj} onChange={setAdj} />
        <PrimaryButton
          disabled={!changed}
          onClick={() => {
            (r({ note: note.trim() || undefined, adj: hasMacros(adj) ? adj : undefined }), i());
          }}
          style={{ marginTop: 14 }}
        >
          Guardar con cambios
        </PrimaryButton>
        {!changed && <div style={{ ...TYPE.body, color: T.mut, marginTop: 8 }}>Escribe qué cambiaste o ajusta los gramos.</div>}
      </Card>
      <div style={{ display: "flex", gap: 10 }}>
        {a && (
          <QuietButton
            onClick={() => {
              (s(), i());
            }}
          >
            Desmarcar
          </QuietButton>
        )}
        <QuietButton
          onClick={() => {
            (i(), o());
          }}
        >
          Editar en mi plan
        </QuietButton>
      </div>
    </Sheet>
  );
}

function ExtraSheet({ onClose: e, onAdd: a }) {
  const [name, setName] = useState(""),
    [m, setM] = useState({ p: "", g: "", c: "" }),
    ok = name.trim() || hasMacros(m);
  return (
    <Sheet title="Fuera del plan" onClose={e} dirty={!!ok}>
      <div style={{ ...TYPE.body, color: T.mut, marginTop: -8, marginBottom: 14 }}>Un snack, una comida libre o un extra: suma a los totales del día.</div>
      <Card minHeight={0} pad={16} style={{ marginBottom: 10 }}>
        <Label>Qué fue</Label>
        <input value={name} onChange={(ev) => setName(ev.target.value)} placeholder="Ej.: barrita de proteína" aria-label="Qué comiste" style={{ ...fieldStyle, marginTop: 10, marginBottom: 14 }} />
        <MacroInputs value={m} onChange={setM} />
      </Card>
      <PrimaryButton
        disabled={!ok}
        onClick={() => {
          (a({ id: uid(), name: name.trim() || "Extra", ...m }), e());
        }}
      >
        Añadir
      </PrimaryButton>
    </Sheet>
  );
}

function NutritionView({ plan: e, date: a, setDate: t, info: i, week: r, onToggle: s, onSaveMeal: o, onUnmark: l, onSetType: b, onAddExtra: y, onRemoveExtra: f, onPreset: x, onEditPlan: u }) {
  const [sheet, setSheet] = useState(null),
    today = isoDate(),
    isToday = a === today,
    sheetMeal = sheet && sheet !== "extra" ? e.meals.find((m) => m.id === sheet) : null;
  return (
    <>
      <Header
        title="Comidas"
        right={
          <button onClick={u} style={{ ...TYPE.label, fontSize: 10.5, color: T.accent, background: "none", border: "none", minHeight: 44, padding: "0 4px", cursor: "pointer" }}>
            Mi plan
          </button>
        }
      />
      <Screen tabbed>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <button onClick={() => t(addDays(a, -1))} aria-label="Día anterior" style={stepBtn}>
            ‹
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ ...TYPE.title }}>{fmtDay(a)}</div>
            {!isToday && (
              <button onClick={() => t(today)} style={{ ...TYPE.label, color: T.accent, background: "none", border: "none", cursor: "pointer", minHeight: 30, marginTop: 2 }}>
                Volver a hoy
              </button>
            )}
          </div>
          <button onClick={() => t(addDays(a, 1))} disabled={isToday} aria-label="Día siguiente" style={{ ...stepBtn, opacity: isToday ? 0.35 : 1, cursor: isToday ? "default" : "pointer" }}>
            ›
          </button>
        </div>
        <div role="radiogroup" aria-label="Tipo de día" style={{ display: "flex", gap: 4, padding: 4, background: T.surfaceMuted, borderRadius: R.control, marginBottom: 10 }}>
          {[
            ["train", "Día de entreno"],
            ["rest", "Día de descanso"],
          ].map(([k, l]) => (
            <button
              key={k}
              role="radio"
              aria-checked={i.type === k}
              onClick={() => b(k)}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: i.type === k ? T.surface : "transparent",
                boxShadow: i.type === k ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                color: i.type === k ? T.text : T.mut,
                font: `${i.type === k ? 700 : 600} 14px/1 ${T.font}`,
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <Card minHeight={0} pad={18} style={{ marginBottom: 10 }}>
          <Label>{i.type === "train" ? "Objetivo día de entreno" : "Objetivo día de descanso"}</Label>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <span style={{ ...TYPE.numeric, color: T.text }}>{fmtN(i.tot.kcal)}</span>
            <span style={{ ...TYPE.body, fontSize: 15, color: T.mut }}>/ {fmtN(i.target.kcal)} kcal</span>
          </div>
          {MACROS.map(([k, l]) => (
            <MacroBar key={k} label={l} value={i.tot[k]} target={num(i.target[k])} />
          ))}
          {!i.tracked && i.meals.length > 0 && !e.meals.some(hasMacros) && (
            <div style={{ ...TYPE.body, color: T.mut, marginTop: 14 }}>
              Para que las barras avancen solas, añade los gramos de cada comida en <b style={{ color: T.text }}>Mi plan</b>.
            </div>
          )}
        </Card>
        <Card minHeight={0} pad={18} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Label>Comidas</Label>
            {i.meals.length > 0 && <Label color={i.doneCount === i.meals.length ? T.ok : T.mut}>{i.doneCount} de {i.meals.length}</Label>}
          </div>
          {e.meals.length === 0 ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ font: `650 17px/1.3 ${T.font}`, letterSpacing: "-0.02em" }}>¿Cuántas comidas haces al día?</div>
              <div style={{ ...TYPE.body, color: T.mut, margin: "6px 0 14px" }}>Las creo con nombres estándar; luego puedes renombrarlas y añadir sus gramos.</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => x(n)}
                    style={{ flex: 1, height: 52, borderRadius: R.control, border: "none", background: T.primary, color: "#FFFFFF", font: `700 17px/1 ${T.font}`, cursor: "pointer" }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ) : i.meals.length === 0 ? (
            <div style={{ ...TYPE.body, color: T.mut, marginTop: 10 }}>
              Ninguna comida de tu plan está asignada a los {i.type === "train" ? "días de entreno" : "días de descanso"}. Cámbialo en <b style={{ color: T.text }}>Mi plan</b>.
            </div>
          ) : (
            <div style={{ marginTop: 4 }}>
              {i.meals.map((m, j) => (
                <MealRow key={m.id} meal={m} entry={i.done[m.id]} shown={i.shown} last={j} onToggle={() => s(m)} onMore={m.gone ? undefined : () => setSheet(m.id)} />
              ))}
            </div>
          )}
        </Card>
        <Card minHeight={0} pad={18} style={{ marginBottom: 10 }}>
          <Label>Fuera del plan</Label>
          {i.extra.map((x2, j) => (
            <div key={x2.id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, borderTop: j === 0 ? "none" : `1px solid ${T.line}`, marginTop: j === 0 ? 6 : 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: `600 15px/1.3 ${T.font}` }}>{x2.name}</div>
                {hasMacros(x2) && <div style={{ ...TYPE.body, fontSize: 12.5, color: T.mut }}>{macroLine(x2)}</div>}
              </div>
              <button
                onClick={() => f(x2)}
                aria-label={`Quitar ${x2.name}`}
                style={{ width: 44, height: 44, border: "none", background: "transparent", color: T.mut, fontSize: 16, cursor: "pointer", borderRadius: R.circle }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => setSheet("extra")}
            style={{ marginTop: 8, minHeight: 44, padding: 0, background: "none", border: "none", color: T.accent, font: `600 15px/1 ${T.font}`, cursor: "pointer" }}
          >
            + Añadir algo fuera del plan
          </button>
        </Card>
        <Card minHeight={0} pad={10}>
          <Label style={{ margin: "4px 0 0 8px" }}>Últimos 7 días</Label>
          <div style={{ display: "flex", gap: 2, marginTop: 14 }}>
            {r.days.map((d) => {
              const pct = d.total ? d.done / d.total : 0,
                sel = d.date === a;
              return (
                <button
                  key={d.date}
                  onClick={() => t(d.date)}
                  aria-label={d.na ? `${fmtDay(d.date)}: antes de tu plan` : `${fmtDay(d.date)}: ${d.done} de ${d.total} comidas`}
                  aria-pressed={sel}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    opacity: d.na ? 0.45 : 1,
                    height: 74,
                    borderRadius: R.control,
                    cursor: "pointer",
                    border: `1px solid ${sel ? T.primary : T.line}`,
                    background: T.surface,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 6,
                    padding: "8px 0",
                  }}
                >
                  <span style={{ width: 10, height: 34, borderRadius: R.circle, background: T.track, overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
                    <span style={{ width: "100%", height: `${pct * 100}%`, background: pct >= 1 ? T.ok : T.primary, borderRadius: R.circle }} />
                  </span>
                  <span style={{ ...TYPE.label, color: sel ? T.text : T.mut }}>{DAY_LETTER[dateFromIso(d.date).getDay()]}</span>
                </button>
              );
            })}
          </div>
          <div style={{ ...TYPE.body, color: T.mut, marginTop: 12 }}>
            {r.total
              ? `${r.done} de ${r.total} comidas marcadas (${Math.round((r.done / r.total) * 100)} %)${r.counted < 7 ? ` en ${r.counted === 1 ? "1 día" : `${r.counted} días`} con plan` : ""}.`
              : "Aún no hay comidas que contar."}
            {r.protDays ? ` Proteína media en los días con registro: ${fmtN(r.protAvg)} g.` : ""}
          </div>
        </Card>
      </Screen>
      {sheetMeal && (
        <MealSheet
          key={sheetMeal.id + a}
          meal={sheetMeal}
          entry={i.done[sheetMeal.id]}
          date={a}
          onClose={() => setSheet(null)}
          onSave={(v) => o(sheetMeal, v)}
          onUnmark={() => l(sheetMeal)}
          onEditPlan={u}
        />
      )}
      {sheet === "extra" && <ExtraSheet onClose={() => setSheet(null)} onAdd={y} />}
    </>
  );
}

function PlanView({ plan: e, onChange: a, onDeleteMeal: t, onBack: i }) {
  const setTarget = (type, v) => a({ ...e, targets: { ...e.targets, [type]: v } }),
    setMeal = (id, patch) => a({ ...e, meals: e.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) }),
    move = (j, d) => {
      const ms = [...e.meals],
        k = j + d;
      k < 0 || k >= ms.length || (([ms[j], ms[k]] = [ms[k], ms[j]]), a({ ...e, meals: ms }));
    },
    addMeal = () => a({ ...e, meals: [...e.meals, { id: uid(), name: `Comida ${e.meals.length + 1}`, when: "all", p: "", g: "", c: "" }] });
  return (
    <>
      <Header title="Mi plan" onBack={i} />
      <Screen>
        <div style={{ ...TYPE.body, color: T.mut, margin: "0 2px 12px" }}>Los cambios se guardan solos.</div>
        <Card minHeight={0} pad={18} style={{ marginBottom: 10 }}>
          <Label>Objetivos diarios</Label>
          {[
            ["train", "Día de entreno"],
            ["rest", "Día de descanso"],
          ].map(([k, l]) => (
            <div key={k} style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ font: `650 15px/1 ${T.font}` }}>{l}</span>
                <span style={{ ...TYPE.body, color: T.mut }}>{fmtN(kcalOf(e.targets[k]))} kcal</span>
              </div>
              <MacroInputs value={e.targets[k]} onChange={(v) => setTarget(k, v)} />
            </div>
          ))}
          <div style={{ ...TYPE.body, color: T.mut, marginTop: 14 }}>
            Por defecto, los días con sesión o cardio cuentan como entreno y miércoles y domingo como descanso. En Comidas puedes cambiar el tipo de un día concreto.
          </div>
          {JSON.stringify(MACROS.map(([q]) => [num(e.targets.train[q]), num(e.targets.rest[q])])) !==
            JSON.stringify(MACROS.map(([q]) => [NUTRI_DEFAULT.targets.train[q], NUTRI_DEFAULT.targets.rest[q]])) && (
            <button
              onClick={() => a({ ...e, targets: { train: { ...NUTRI_DEFAULT.targets.train }, rest: { ...NUTRI_DEFAULT.targets.rest } } })}
              style={{ marginTop: 6, minHeight: 44, padding: 0, background: "none", border: "none", color: T.accent, font: `600 14px/1 ${T.font}`, cursor: "pointer" }}
            >
              Volver a los objetivos del plan (2.205 / 2.045 kcal)
            </button>
          )}
        </Card>
        <Card minHeight={0} pad={18} style={{ marginBottom: 10 }}>
          <Label>Comidas del plan</Label>
          {e.meals.length === 0 && <div style={{ ...TYPE.body, color: T.mut, marginTop: 10 }}>Aún no hay comidas. Añade la primera.</div>}
          {e.meals.map((m, j) => (
            <div key={m.id} style={{ borderTop: j === 0 ? "none" : `1px solid ${T.line}`, padding: "14px 0", marginTop: j === 0 ? 6 : 0 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input value={m.name} onChange={(ev) => setMeal(m.id, { name: ev.target.value })} onBlur={() => m.name.trim() || setMeal(m.id, { name: `Comida ${j + 1}` })} aria-label="Nombre de la comida" style={{ ...fieldStyle, flex: 1, fontWeight: 600 }} />
                <button onClick={() => move(j, -1)} disabled={j === 0} aria-label={`Subir ${m.name}`} style={{ ...stepBtn, width: 40, fontSize: 16, opacity: j === 0 ? 0.35 : 1 }}>
                  ↑
                </button>
                <button onClick={() => move(j, 1)} disabled={j === e.meals.length - 1} aria-label={`Bajar ${m.name}`} style={{ ...stepBtn, width: 40, fontSize: 16, opacity: j === e.meals.length - 1 ? 0.35 : 1 }}>
                  ↓
                </button>
              </div>
              <div role="radiogroup" aria-label={`Cuándo toca ${m.name}`} style={{ display: "flex", gap: 6, margin: "10px 0", flexWrap: "wrap" }}>
                {WHEN.map(([k, l]) => (
                  <button
                    key={k}
                    role="radio"
                    aria-checked={m.when === k}
                    onClick={() => setMeal(m.id, { when: k })}
                    style={{
                      minHeight: 36,
                      padding: "0 12px",
                      borderRadius: R.circle,
                      cursor: "pointer",
                      border: `1px solid ${m.when === k ? T.primary : T.line}`,
                      background: m.when === k ? T.primary : T.surface,
                      color: m.when === k ? "#FFFFFF" : T.mut,
                      font: `600 12.5px/1 ${T.font}`,
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <MacroInputs value={m} onChange={(v) => setMeal(m.id, { p: v.p, g: v.g, c: v.c })} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <span style={{ ...TYPE.body, color: T.mut }}>{hasMacros(m) ? `${fmtN(kcalOf(m))} kcal` : "Gramos opcionales"}</span>
                <button onClick={() => t(m)} aria-label={`Eliminar ${m.name} del plan`} style={{ minHeight: 44, padding: "0 4px", background: "none", border: "none", color: "#C0392B", font: `600 14px/1 ${T.font}`, cursor: "pointer" }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          <QuietButton onClick={addMeal} style={{ marginTop: 8 }}>
            + Añadir comida
          </QuietButton>
        </Card>
        {e.meals.some(hasMacros) && (
          <Card minHeight={0} pad={16} style={{ background: T.surfaceMuted, border: "none" }}>
            <div style={{ ...TYPE.body, color: T.text }}>
              {[
                ["train", "entreno"],
                ["rest", "descanso"],
              ].map(([k, l]) => {
                const ms = e.meals.filter((m) => m.when === "all" || m.when === k),
                  s = { p: 0, g: 0, c: 0 };
                ms.forEach((m) => MACROS.forEach(([q]) => (s[q] += num(m[q]))));
                return (
                  <div key={k}>
                    Suma de comidas en día de {l}: <b>{fmtN(kcalOf(s))} kcal</b> de {fmtN(kcalOf(e.targets[k]))} ({fmtN(s.p)} prot · {fmtN(s.g)} grasa · {fmtN(s.c)} carb)
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </Screen>
    </>
  );
}

function App() {
  const [e, a] = useState(!1),
    [t, i] = useState("home"),
    [r, s] = useState(1),
    [o, l] = useState(() => {
      const h = todayKey();
      return ROUTINE[h] ? h : 1;
    }),
    [b, y] = useState([]),
    [f, x] = useState([]),
    [u, m] = useState({}),
    [d, k] = useState({}),
    [S, c] = useState(null),
    p = `log:w${r}:d${o}`;
  // Nutrición: el plan vive en estado; los registros de cada día se leen de localStorage al pintar.
  const [plan, setPlanState] = useState(loadPlan),
    [nDate, setNDate] = useState(isoDate),
    [, setNRev] = useState(0),
    [toast, setToast] = useState(null),
    toastTimer = useRef(null),
    showToast = (msg, action, fn) => {
      clearTimeout(toastTimer.current);
      setToast({ id: uid(), msg, action, fn });
      toastTimer.current = setTimeout(() => setToast(null), 4500);
    },
    runToast = () => {
      const fn = toast && toast.fn;
      (clearTimeout(toastTimer.current), setToast(null), fn && fn());
    },
    getRec = (dt) => {
      const r = lsGet("nutri:" + dt);
      return r && typeof r === "object" && !Array.isArray(r) ? r : {};
    },
    // Cada día guarda copia de los objetivos (tg). Hoy se refresca en cada escritura y al cambiar el plan;
    // así, cuando el día pasa, queda congelado con los objetivos que tuvo.
    putRec = (dt, rec, targets = plan.targets) => {
      (lsSet("nutri:" + dt, { ...rec, tg: dt >= isoDate() || !rec.tg ? targets : rec.tg }), setNRev((v) => v + 1));
    },
    // since: día en que el plan tuvo su primera comida; el resumen semanal no cuenta días anteriores.
    savePlan = (pl) => {
      const next = pl.meals.length && !pl.since ? { ...pl, since: isoDate() } : pl,
        td = isoDate(),
        recToday = lsGet("nutri:" + td);
      (setPlanState(next), lsSet("nutri:plan", next));
      recToday && typeof recToday === "object" && putRec(td, recToday, next.targets);
    },
    // Navegación: go = pantalla nueva encima (atrás vuelve), swap = sustituye la actual, back = atrás.
    // Las pestañas que no son Entreno se apilan sobre Entreno: atrás desde ellas vuelve a Entreno y luego sale.
    curView = useRef("home"),
    selDayRef = useRef(o),
    pendingY = useRef(null),
    go = (v) => {
      const run = () => {
        try {
          const st = history.state || {};
          (history.replaceState({ ...st, y: window.scrollY, d: selDayRef.current, boot: BOOT }, ""),
            history.pushState({ v, d: selDayRef.current, boot: BOOT, idx: (st.idx || 0) + 1 }, ""));
        } catch {}
        (i(v), window.scrollTo(0, 0));
      };
      NAV.layers.length ? (NAV.after = run) : run();
    },
    swap = (v) => {
      try {
        history.replaceState({ v, d: selDayRef.current, boot: BOOT, idx: (history.state && history.state.idx) || 0 }, "");
      } catch {}
      (i(v), window.scrollTo(0, 0));
    },
    back = () => history.back(),
    // Primer arranque: Ajustes es la pantalla base (no hay nada debajo), así que se sustituye por Entreno.
    firstRun = useRef(!1),
    leaveSetup = () => (firstRun.current ? ((firstRun.current = !1), swap("home")) : back()),
    setTab = (tb) => {
      if (tb === "nutrition") setNDate(isoDate());
      lsSet("ui:tab", tb);
      if (tb === curView.current) return window.scrollTo({ top: 0, behavior: "smooth" });
      curView.current === "home" ? go(tb) : tb === "home" ? back() : swap(tb);
    },
    snapOf = (ml) => ({ name: ml.name, p: ml.p, g: ml.g, c: ml.c }),
    toggleMeal = (dt, ml) => {
      const rec = getRec(dt),
        prev = (rec.done || {})[ml.id],
        done = { ...(rec.done || {}) };
      prev ? delete done[ml.id] : (done[ml.id] = { t: Date.now(), snap: snapOf(ml) });
      putRec(dt, { ...rec, done });
      buzz(12);
      showToast(prev ? `Marca quitada: ${ml.name}` : `Comida hecha: ${ml.name} ✓`, "Deshacer", () => {
        const r2 = getRec(dt),
          d2 = { ...(r2.done || {}) };
        prev ? (d2[ml.id] = prev) : delete d2[ml.id];
        putRec(dt, { ...r2, done: d2 });
      });
    },
    saveMeal = (dt, ml, v) => {
      const rec = getRec(dt),
        prev = (rec.done || {})[ml.id];
      putRec(dt, { ...rec, done: { ...(rec.done || {}), [ml.id]: { t: Date.now(), snap: (prev && prev.snap) || snapOf(ml), ...v } } });
      showToast(v.note || v.adj ? `Guardado con cambios: ${ml.name}` : `Comida hecha: ${ml.name} ✓`);
    },
    unmarkMeal = (dt, ml) => {
      const rec = getRec(dt);
      (rec.done || {})[ml.id] && toggleMeal(dt, ml);
    },
    setDayType = (dt, tp) => {
      const rec = getRec(dt);
      putRec(dt, { ...rec, type: tp === defaultDayType(dt) ? undefined : tp });
    },
    addExtra = (dt, xx) => {
      const rec = getRec(dt);
      (putRec(dt, { ...rec, extra: [...(Array.isArray(rec.extra) ? rec.extra : []), xx] }), showToast(`Añadido fuera del plan: ${xx.name}`));
    },
    removeExtra = (dt, xx) => {
      const rec = getRec(dt),
        list = Array.isArray(rec.extra) ? rec.extra : [],
        idx = list.findIndex((q) => q && q.id === xx.id);
      putRec(dt, { ...rec, extra: list.filter((q) => !q || q.id !== xx.id) });
      showToast(`Quitado: ${xx.name}`, "Deshacer", () => {
        const r2 = getRec(dt),
          ex = [...(Array.isArray(r2.extra) ? r2.extra : [])];
        (ex.splice(idx, 0, xx), putRec(dt, { ...r2, extra: ex }));
      });
    },
    applyPreset = (n) => {
      savePlan({ ...plan, meals: MEAL_PRESETS[n].map((nm) => ({ id: uid(), name: nm, when: "all", p: "", g: "", c: "" })) });
      showToast(`Listo: ${n} comidas. Añade sus gramos cuando quieras.`, "Mi plan", () => go("plan"));
    },
    deleteMeal = (ml) => {
      const before = plan;
      savePlan({ ...plan, meals: plan.meals.filter((q) => q.id !== ml.id) });
      showToast(`Quitada del plan: ${ml.name}`, "Deshacer", () => savePlan(before));
    },
    today = isoDate(),
    todayInfo = dayInfo(plan, getRec(today), today),
    nInfo = dayInfo(plan, getRec(nDate), nDate),
    week = (() => {
      const days = [];
      let done = 0,
        total = 0,
        prot = 0,
        protDays = 0,
        counted = 0;
      for (let q = 6; q >= 0; q--) {
        const dt = addDays(today, -q),
          rec = getRec(dt),
          inf = dayInfo(plan, rec, dt),
          na = !!plan.since && dt < plan.since && !inf.doneCount && !inf.extra.length;
        days.push({ date: dt, done: inf.doneCount, total: inf.meals.length, na });
        if (na) continue;
        ((counted += 1), (done += inf.doneCount), (total += inf.meals.length));
        inf.tracked && ((prot += inf.tot.p), protDays++);
      }
      return { days, done, total, counted, protDays, protAvg: protDays ? prot / protDays : 0 };
    })();
  (useEffect(() => {
    (async () => {
      try {
        if (navigator.storage && navigator.storage.persist) {
          let h = await navigator.storage.persisted();
          (h || (h = await navigator.storage.persist()), c(h));
        }
      } catch {
        c(null);
      }
    })();
  }, []),
    useEffect(() => {
      (async () => {
        const h = await store.get("meta");
        h && h.week && s(h.week);
        const v = await store.get("summary");
        v && y(v);
        let C = await store.get("weights");
        if (!C) {
          C = (v || [])
            .filter((w) => w.peso)
            .map((w) => ({ d: w.date, v: parseFloat(w.peso) }))
            .filter((w) => isFinite(w.v));
          const L = {};
          (C.forEach((w) => {
            L[w.d] = w.v;
          }),
            (C = Object.entries(L)
              .map(([w, E]) => ({ d: w, v: E }))
              .sort((w, E) => (w.d < E.d ? -1 : 1))),
            C.length && (await store.set("weights", C)));
        }
        x(C || []);
        const F = await store.get("profile"),
          lastTab = lsGet("ui:tab"),
          rt = lsGet("ui:route"),
          fresh = rt && rt.date === isoDate() && Date.now() - rt.at < 8 * 3600e3,
          baseIdx = (history.state && history.state.idx) || 0,
          push = (v, d) => {
            try {
              const st = history.state || {};
              history.pushState({ v, d, boot: BOOT, idx: (st.idx || 0) + 1 }, "");
            } catch {}
          };
        try {
          const resume = fresh && ROUTINE[rt.d] ? rt.d : todayKey();
          history.replaceState({ v: F ? "home" : "setup", d: resume, boot: BOOT, idx: baseIdx }, "");
        } catch {}
        if (!F) ((firstRun.current = !0), i("setup"));
        else {
          k(F);
          if (fresh && ["session", "cardio", "checkin"].includes(rt.v) && ROUTINE[rt.d] && !ROUTINE[rt.d].rest) {
            const wk = (h && h.week) || 1,
              lg = await store.get(`log:w${wk}:d${rt.d}`);
            (l(rt.d), (selDayRef.current = rt.d), m(lg || {}), (loadedKey.current = `log:w${wk}:d${rt.d}`), push(rt.v, rt.d), i(rt.v));
          } else if (fresh && rt.v === "plan") (push("nutrition"), push("plan"), i("plan"));
          else if (rt && rt.date === isoDate() && ["nutrition", "progress"].includes(lastTab)) (push(lastTab), i(lastTab));
        }
        a(!0);
      })();
    }, []));
  useEffect(() => {
    const onPop = (ev) => {
      if (NAV.ignore > 0) {
        NAV.ignore--;
        const after = NAV.after;
        return ((NAV.after = null), after && after());
      }
      if (NAV.layers.length) return NAV.layers[NAV.layers.length - 1].fn();
      const st = ev.state || {};
      if (!st.v || st.boot !== BOOT) {
        if ((st.idx || 0) > 0) return history.go(-st.idx);
        try {
          history.replaceState({ v: "home", d: selDayRef.current, boot: BOOT, idx: 0 }, "");
        } catch {}
        return i("home");
      }
      // Atrás en el check-in: la sesión cuenta igual (con lo que hubieras escrito).
      curView.current === "checkin" && st.v !== "checkin" && checkinSave.current && checkinSave.current(lsGet("ui:checkin") || {});
      pendingY.current = st.y || 0;
      st.d != null && ROUTINE[st.d] && l(st.d);
      if (["session", "cardio", "checkin"].includes(st.v)) {
        const key = `log:w${weekRef.current}:d${st.d}`;
        loadedKey.current = null;
        return store.get(key).then((lg) => (m(lg || {}), (loadedKey.current = key), i(st.v)));
      }
      i(st.v);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    ((curView.current = t), (selDayRef.current = o));
    e && t !== "setup" && lsSet("ui:route", { v: t, d: o, date: isoDate(), at: Date.now() });
    e && ["home", "nutrition", "progress"].includes(t) && lsSet("ui:tab", t);
  }, [t, o, e]);
  React.useLayoutEffect(() => {
    pendingY.current != null && (window.scrollTo(0, pendingY.current), (pendingY.current = null));
  }, [t]);
  useWakeLock(t === "session" || t === "cardio");
  const n = async (h, v) => {
      const F = [...f.filter((L) => L.d !== h), { d: h, v: Math.round(v * 10) / 10 }].sort((L, w) =>
        L.d < w.d ? -1 : 1,
      );
      (x(F), await store.set("weights", F));
    },
    g = (h) => {
      (s(h), store.set("meta", { week: h }));
    },
    loadedKey = useRef(null),
    checkinSave = useRef(null),
    weekRef = useRef(1);
  weekRef.current = r;
  // Cada cambio de la sesión se guarda al momento, y solo si es el registro de esa sesión (nunca uno vacío o de otro día).
  useEffect(() => {
    (t === "session" || t === "cardio") && loadedKey.current === p && store.set(p, u);
  }, [u, t, p]);
  const $ = async () => {
      const h = await store.get(p);
      (m(h || {}), (loadedKey.current = p), go(ROUTINE[o].cardio ? "cardio" : "session"));
    },
    B = () => (lsSet("ui:rest", null), swap("checkin")),
    P = async (h) => {
      (k(h), await store.set("profile", h), leaveSetup());
    },
    M = async (h, stay) => {
      const v = u.ex && (u.ex.pullups || null),
        C = {
          w: r,
          day: o,
          date: isoDate(),
          pullups: o === 1 && v ? v.pullTotal || 0 : null,
          energia: h.energia || null,
          peso: h.peso || null,
          sueno: h.sueno || null,
          molestias: h.molestias || null,
        },
        F = [...b.filter((w) => !(w.w === r && w.day === o && w.date === C.date)), C];
      (y(F), await store.set("summary", F));
      const L = parseFloat(String(h.peso || "").replace(",", "."));
      (isFinite(L) && L > 0 && (await n(C.date, L)),
        await store.set(p, { ...u, checkin: h, done: !0 }),
        lsSet("ui:checkin", null),
        lsSet("ui:sess", null),
        stay || back());
    },
    // Copia de seguridad: todo lo que la app guarda (claves th:*), incluida la nutrición.
    A = async () => {
      const h = { app: "tracker-hibrido", version: 2, exported: new Date().toISOString(), store: {} };
      try {
        for (let q = 0; q < localStorage.length; q++) {
          const key = localStorage.key(q);
          key && key.startsWith("th:") && key !== "th:ui:tab" && (h.store[key.slice(3)] = lsGet(key.slice(3)));
        }
      } catch {}
      const v = new Blob([JSON.stringify(h, null, 2)], { type: "application/json" }),
        C = document.createElement("a");
      ((C.href = URL.createObjectURL(v)),
        (C.download = `tracker-hibrido-${isoDate()}.json`),
        C.click(),
        setTimeout(() => URL.revokeObjectURL(C.href), 2e3),
        showToast("Copia descargada"));
    },
    z = async (h) => {
      try {
        const v = JSON.parse(await h.text());
        if (!v || v.app !== "tracker-hibrido" || !v.store) throw new Error("formato");
        for (const [C, F] of Object.entries(v.store)) F != null && (await store.set(C, F));
        (v.store.meta && v.store.meta.week && s(v.store.meta.week),
          v.store.summary && y(v.store.summary),
          v.store.profile && k(v.store.profile),
          v.store.weights && x(v.store.weights),
          setPlanState(loadPlan()),
          setNRev((q) => q + 1),
          leaveSetup(),
          showToast("Datos restaurados correctamente"));
      } catch {
        showToast("Ese archivo no es una copia de Tracker Híbrido. Elige el .json que exportaste desde la app.");
      }
    };
  checkinSave.current = (h) => M(h, !0);
  if (!e)
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.mut, fontFamily: T.font, fontSize: 13 }}>
        Cargando tu plan…
      </div>
    );
  const tabbed = t === "home" || t === "nutrition" || t === "progress";
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.font }}>
      <style>{`
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        html{touch-action:manipulation}
        button{-webkit-user-select:none;user-select:none;touch-action:manipulation}
        img{-webkit-touch-callout:none}
        body{margin:0;background:${T.bg}}
        input::placeholder,textarea::placeholder{color:${T.mut};opacity:.75}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        button:focus-visible,input:focus-visible,textarea:focus-visible{outline:none;box-shadow:${T.focus}}
        button:disabled{cursor:default}
        img{-webkit-user-drag:none}
        ::-webkit-scrollbar{display:none}
        @keyframes enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        @keyframes rise{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}
        @media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}
      `}</style>
      {t === "home" && (
        <Home
          week={r}
          setWeek={g}
          selDay={o}
          setSelDay={l}
          summary={b}
          onStart={$}
          onProgress={() => setTab("progress")}
          profile={d}
          onSettings={() => go("setup")}
          mealBar={<NextMealBar info={todayInfo} onToggle={(ml) => toggleMeal(today, ml)} onOpen={() => setTab("nutrition")} />}
        />
      )}
      {t === "nutrition" && (
        <NutritionView
          plan={plan}
          date={nDate}
          setDate={(dt) => (setNDate(dt > today ? today : dt), window.scrollTo(0, 0))}
          info={nInfo}
          week={week}
          onToggle={(ml) => toggleMeal(nDate, ml)}
          onSaveMeal={(ml, v) => saveMeal(nDate, ml, v)}
          onUnmark={(ml) => unmarkMeal(nDate, ml)}
          onSetType={(tp) => setDayType(nDate, tp)}
          onAddExtra={(xx) => addExtra(nDate, xx)}
          onRemoveExtra={(xx) => removeExtra(nDate, xx)}
          onPreset={applyPreset}
          onEditPlan={() => go("plan")}
        />
      )}
      {t === "plan" && <PlanView plan={plan} onChange={savePlan} onDeleteMeal={deleteMeal} onBack={back} />}
      {t === "setup" && (
        <SetupView
          profile={d}
          first={!d.name && !d.goal && b.length === 0}
          onSave={P}
          onClose={back}
          onExport={A}
          onImport={z}
          persisted={S}
        />
      )}
      {t === "session" && <SessionView dayKey={o} week={r} log={u} setLog={m} onFinish={B} onBack={back} sessKey={p} />}
      {t === "cardio" && <CardioView week={r} log={u} setLog={m} onFinish={B} onBack={back} />}
      {t === "checkin" && <CheckinView onSave={M} onSkip={() => M({})} />}
      {t === "progress" && <ProgressView summary={b} week={r} profile={d} weights={f} onAddWeight={n} />}
      {tabbed && <TabBar tab={t} onTab={setTab} />}
      <Toast toast={toast} onAction={runToast} />
    </div>
  );
}
// Si algo falla al pintar, en vez de una pantalla en blanco: explicación, recargar y copia de los datos.
class ErrorBoundary extends React.Component {
  constructor(p) {
    (super(p), (this.state = { err: null }));
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  download() {
    const store = {};
    try {
      for (let q = 0; q < localStorage.length; q++) {
        const k = localStorage.key(q);
        k && k.startsWith("th:") && (store[k.slice(3)] = JSON.parse(localStorage.getItem(k)));
      }
    } catch {}
    const a = document.createElement("a");
    ((a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: "tracker-hibrido", version: 2, exported: new Date().toISOString(), store }, null, 2)], { type: "application/json" }))),
      (a.download = `tracker-hibrido-${isoDate()}.json`),
      a.click());
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <main style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.font, padding: "60px 20px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ ...TYPE.title, fontSize: 24 }}>Algo no ha cargado bien</div>
        <div style={{ ...TYPE.body, fontSize: 15, color: T.mut, margin: "10px 0 24px" }}>
          Tus datos siguen guardados en este teléfono. Prueba a recargar; si se repite, descarga una copia por seguridad.
        </div>
        <PrimaryButton onClick={() => location.reload()}>Recargar</PrimaryButton>
        <QuietButton onClick={() => this.download()} style={{ marginTop: 10 }}>
          Descargar copia de mis datos
        </QuietButton>
      </main>
    );
  }
}
ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
