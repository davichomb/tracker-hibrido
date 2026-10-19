# Tracker Híbrido

App de seguimiento para un programa de entrenamiento híbrido de 8 semanas: hipertrofia con máquinas y peso libre, progresión de dominadas estrictas y cardio por intervalos (protocolo 4×4).

Pensada para usarse con una mano, entre series, desde el teléfono.

## Qué hace

- **Comidas** — objetivos diarios del plan nutricional (día de entreno 170 g proteína · 85 g grasas · 190 g carbohidratos = 2.205 kcal; día de descanso 170 · 85 · 150 = 2.045 kcal). Cada comida se marca con un toque —también desde la pantalla de inicio— y se deshace con otro. Admite "hecha con cambios", extras fuera del plan, días pasados, cambiar un día de entreno a descanso y resumen de los últimos 7 días. Las comidas y sus gramos se editan en **Mi plan**.
- **Sesión guiada** — un ejercicio a la vez, con foto, series × repeticiones y RIR objetivo. Si no hay una foto fiable del ejercicio se muestra una tarjeta neutra, nunca la foto de otro; las fotos de una variante (p. ej. con mancuernas) llevan una etiqueta que lo dice.
- **Registro por serie** — carga en kg, repeticiones y RIR real, más notas por ejercicio.
- **Temporizador de descanso** — arranca solo al marcar una serie, con aviso sonoro y vibración.
- **Progresión de dominadas** — contador con el objetivo semanal, en versión estricta y asistida con banda.
- **Cardio 4×4** — temporizador por fases (calentamiento, 4 intervalos, recuperaciones, vuelta a la calma) y registro de velocidad, inclinación, frecuencia cardíaca y esfuerzo percibido.
- **Progreso** — tendencia de peso corporal y dominadas por semana, con aviso cuando la fatiga sugiere reducir volumen.
- **Copia de seguridad** — exportar e importar todo el historial como archivo JSON.
- **Se comporta como una app** — el botón atrás del móvil vuelve a la pantalla anterior y cierra ventanas; al reabrirla retoma la sesión, el ejercicio y el descanso donde los dejaste; los temporizadores siguen la hora real aunque bloquees el móvil; la pantalla no se apaga mientras entrenas; y abre sin conexión.

## Privacidad

Toda la información se guarda en el `localStorage` del navegador, en el propio dispositivo.

- No hay servidor, base de datos ni cuenta de usuario.
- No hay analítica, rastreo ni publicidad.
- La app no envía datos a ningún sitio: la política de seguridad del documento incluye `connect-src 'none'`, que se lo impide a nivel de navegador. La única petición es la del propio `sw.js`, que descarga de su misma dirección la versión nueva de la app para poder abrirla sin conexión.
- El nombre y el peso objetivo se piden al abrir la app por primera vez y nunca salen del dispositivo.

La app usa las tipografías del sistema: no descarga nada externo.

## Instalación

Se puede abrir directamente el archivo `index.html`, pero para instalarla como app conviene publicarla en una URL `https`:

1. Sube `index.html` a cualquier hosting estático (GitHub Pages, Netlify, Cloudflare Pages).
2. Abre la URL en Chrome (Android) o Safari (iOS).
3. Menú del navegador → **Instalar app** o **Añadir a pantalla de inicio**.

Queda con icono propio y se abre en pantalla completa. Todo el código va incrustado en un solo archivo y `sw.js` guarda una copia en el teléfono, así que funciona sin conexión. Las actualizaciones se descargan en segundo plano y se ven la siguiente vez que abres la app.

## Detalles técnicos

`index.html` es un único archivo autónomo (React 18, la app y las fotos van incrustados). Se genera a partir de:

- `src/app.jsx` — código de la app.
- `img/*.webp` — fotos de ejercicios (generadas con IA, en blanco y negro, sin metadatos); cada ejercicio la referencia por su nombre de archivo (campo `img`).
- `src/head.html`, `src/manifest.js`, `src/vendor/` — cabecera, manifiesto de instalación y React.

Para regenerarlo tras un cambio (requiere Node.js):

```bash
npm install
npm run build
```

`npm run serve` lo sirve en http://127.0.0.1:8790 para probarlo en el navegador.

## Aviso

Esto es una herramienta de registro, no un consejo médico. Ante dolor u opresión en el pecho, mareo, palpitaciones inusuales o dificultad respiratoria desproporcionada, detén el ejercicio y consulta a un profesional de la salud. Antes de empezar un programa de entrenamiento intenso, consulta con tu médico.

## Licencia

MIT
