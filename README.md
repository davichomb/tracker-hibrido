# Tracker Híbrido

App de seguimiento para un programa de entrenamiento híbrido de 8 semanas: hipertrofia con máquinas y peso libre, progresión de dominadas estrictas y cardio por intervalos (protocolo 4×4).

Pensada para usarse con una mano, entre series, desde el teléfono.

## Qué hace

- **Sesión guiada** — un ejercicio a la vez, con ilustración, series × repeticiones y RIR objetivo.
- **Registro por serie** — carga en kg, repeticiones y RIR real, más notas por ejercicio.
- **Temporizador de descanso** — arranca solo al marcar una serie, con aviso sonoro y vibración.
- **Progresión de dominadas** — contador con el objetivo semanal, en versión estricta y asistida con banda.
- **Cardio 4×4** — temporizador por fases (calentamiento, 4 intervalos, recuperaciones, vuelta a la calma) y registro de velocidad, inclinación, frecuencia cardíaca y esfuerzo percibido.
- **Progreso** — tendencia de peso corporal y dominadas por semana, con aviso cuando la fatiga sugiere reducir volumen.
- **Copia de seguridad** — exportar e importar todo el historial como archivo JSON.

## Privacidad

Toda la información se guarda en el `localStorage` del navegador, en el propio dispositivo.

- No hay servidor, base de datos ni cuenta de usuario.
- No hay analítica, rastreo ni publicidad.
- La app no realiza ninguna petición de red: la política de seguridad del documento incluye `connect-src 'none'`, que se lo impide a nivel de navegador.
- El nombre y el peso objetivo se piden al abrir la app por primera vez y nunca salen del dispositivo.

La única descarga externa son las tipografías desde Google Fonts. Si prefieres evitarla, elimina la línea `@import` de Google Fonts en el archivo: la app seguirá funcionando con tipografías del sistema.

## Instalación

Se puede abrir directamente el archivo `index.html`, pero para instalarla como app conviene publicarla en una URL `https`:

1. Sube `index.html` a cualquier hosting estático (GitHub Pages, Netlify, Cloudflare Pages).
2. Abre la URL en Chrome (Android) o Safari (iOS).
3. Menú del navegador → **Instalar app** o **Añadir a pantalla de inicio**.

Queda con icono propio y se abre en pantalla completa. Todo el código va incrustado en un solo archivo, así que funciona sin conexión.

## Detalles técnicos

Un único archivo HTML autónomo, sin build ni dependencias externas. React 18 va empaquetado dentro. El código fuente sin compilar está en `tracker-hibrido.jsx`.

## Aviso

Esto es una herramienta de registro, no un consejo médico. Ante dolor u opresión en el pecho, mareo, palpitaciones inusuales o dificultad respiratoria desproporcionada, detén el ejercicio y consulta a un profesional de la salud. Antes de empezar un programa de entrenamiento intenso, consulta con tu médico.

## Licencia

MIT
