# Prompt para Lovable

Este repo es un formulario de diagnóstico ("Readiness") de Strategic Mates, una consultora de Florida que convierte pequeños negocios de dueños hispanos (construcción, remodelación, mantenimiento) en empresas franquiciables en 180 días. Funciona completo con datos de prueba: corré `npm install` y `npm run dev`. El contrato de datos está en CONTRACT.md y NO se puede cambiar: el backend ya existe.

## Qué quiero que hagas

Mejorar el diseño visual y la experiencia, sin tocar el flujo, las preguntas, el payload ni el resultado que llega del servidor. Tiene que verse como una página diseñada por una agencia con la marca de Strategic Mates, no como un template.

## Guía de marca (obligatoria)

- Colores: azul institucional #153f58 (dominante, 60 %), azul oscuro #08293d, azul medio #5f96b5, azul claro #dbe6f3 (secundarios, 30 %), dorados #d09700 principal, #a77e00 oscuro, #ebb944 claro (solo acento, 10 %), texto negro #000, blanco sobre fondos oscuros. No uses ningún otro color salvo rojo para errores de validación.
- Tipografías: Inter (cuerpo Regular 400, títulos SemiBold 600) y Archivo (destacados, números, botones). Ya están cargadas en index.css. Nada de otras fuentes.
- Logo: /brand/logo-horizontal.png para fondo blanco, /brand/logo-horizontal-white.png para fondo azul, /isotipo.png como ícono. Mínimo 41 px de alto. No lo rotes, no le cambies colores, no lo pongas sobre degradados que no sean el de marca (#153f58 a #08293d).
- Patrón gráfico: tablero de ajedrez con cuadrados de puntas redondeadas, en azul medio al 30 % y 70 % de opacidad, como racimo en una esquina. Ya existe el componente Escaques.jsx.
- Personalidad: "The Grand Master". Seguro, directo, cercano al dueño de negocio hispano. Lema: "The right move!".

## Reglas de diseño

- Prohibido: emojis, iconos decorativos en grilla, fondos de color al 10 % sin borde, etiquetas redondas tipo pill, cajitas numeradas en las opciones, sombras blandas por todos lados, degradados fuera del de marca, verde y ámbar para estados.
- Bordes visibles de 1 px, radio 8 px, mucho aire, jerarquía tipográfica clara.
- Una pregunta por pantalla, opciones como filas grandes clickeables, contador "NN / 18" y barra de progreso dorada. Teclado: 1 a 4 elige, Enter continúa. Mobile first.
- El resultado tiene que tener gráfica y poco texto: medidor de puntaje arriba, las seis áreas con barras, dos fortalezas, hasta tres prioridades, y un bloque de cierre en azul con degradado de marca que deje claro que el negocio necesita a Strategic Mates, con botón blanco "Quiero conversar sobre el apadrinamiento".
- Nunca la palabra "no" en los textos del resultado. El veredicto es "Estás preparado" o "Ya estás en camino", nunca un rechazo.

## Lo que sí podés cambiar

Composición, espaciados, tamaños, animaciones suaves entre preguntas, ilustración del patrón de tablero, cómo se ve el medidor y las barras, la intro, los estados vacíos y de error. Todo lo que es texto está en src/pages/publicAssessment/readiness/readinessCopy.js en español e inglés con las mismas claves: si cambiás un texto, cambialo en los dos idiomas.

## Lo que no podés cambiar

Las 18 preguntas y sus opciones (readinessQuestions.js), el orden de las pantallas, el payload que arma readinessForm.js, el shape del resultado (CONTRACT.md), las claves del copy, los tests.

Empezá por el resultado y por las opciones de las preguntas, que es lo que más se ve. Mostrame primero una propuesta en desktop y móvil antes de tocar todo.
