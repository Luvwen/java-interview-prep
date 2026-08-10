# Plan V2 — Actividades para testear conocimientos

> Plan de la segunda version de la app. Complementa a la descripcion funcional/tecnica y se ejecuta con el mismo workflow de spec-driven development: **cada actividad arranca actualizando este documento y los specs** antes de escribir codigo.
> Estado: **completada** — V2-1 a V2-7 todas las iteraciones entregadas.

## 1. Objetivo

La V1 cubre "aprender" (teoria + quiz por modulo) y "medir" (progreso global). La V2 agrega **actividades lúdicas y dirigidas para testear y fijar lo aprendido**: modos de juego sobre el banco de preguntas existente, nuevos formatos de pregunta, repeticion espaciada de lo fallado y estadisticas por tema. El objetivo es que el usuario consolide conocimiento activo (recuperar, no solo leer) y que la app detecte y ataque sus puntos debiles.

Principios que respeta la V2:

- Reutiliza el dominio, el contenido JSON y el `progress.json` de la V1 (sin romper la CLI ni la UI actual).
- No ejecuta codigo enviado por el usuario (se mantiene el no-alcance de V1); los retos de codigo son de **ordenamiento/reconstruccion** de bloques, no de ejecucion.
- Cada actividad es opcional y desacoplada: se puede entregar en iteraciones independientes.
- Las estadisticas y las actividades se basan en intentos reales (quiz submit), no en auto-reporte.

## 2. Alcance y no-alcance

### Dentro de alcance

- Nuevos **modos de actividad**: contra-reloj, mixto aleatorio, verdadero/falso, tarjetas de repaso (flashcards), repaso de errores, ordenar codigo, examen simulado, reto del dia y racha diaria.
- Nuevos **formatos de pregunta**: `TRUE_FALSE` y `ORDER` (ademas de `SINGLE` y `MULTIPLE` existentes).
- **Estadisticas** por modulo/tema (aciertos, errores, mejor puntaje) y **repaso espaciado** de preguntas falladas.
- Extension del archivo de progreso (backward compatible) y de la API REST y la UI web.

### Fuera de alcance

- Ejecucion/evaluacion de codigo arbitrario del usuario.
- Multiusuario, autenticacion, sincronizacion en la nube.
- Generacion automatica de preguntas (IA); el banco sigue siendo curado a mano.
- Cambios al contenido de los 12 modulos de V1 (solo se agregan formatos nuevos al mismo banco).

## 3. Actividades propuestas

Cada actividad se describe con su mecanica, UX y criterios de aceptacion. Se entregan en el orden sugerido en la seccion 5.

### A1. Quiz contra-reloj (modo time attack)

- **Mecanica**: el mismo quiz de un modulo, pero con cronometro. Variante por pregunta (p. ej. 45s por pregunta, se pasa de largo si se agota) y variante global (tiempo total configurable).
- **UX**: barra de progreso temporal visual; al agotarse el tiempo se cuenta como respuesta incorrecta y se muestra el feedback igual que en el modo normal. Resultado con tiempo total y puntaje.
- **Registra**: el intento cuenta en progreso y estadisticas igual que un quiz normal; el tiempo queda guardado para ranking local (mejor tiempo por modulo).
- **Aceptacion**: el quiz contra-reloj reutiliza la misma evaluacion; el tiempo se persiste; superar el tiempo por pregunta no rompe el flujo.

### A2. Quiz mixto aleatorio (modo repaso general)

- **Mecanica**: el usuario elige cuantos modulos incluir (o "todos") y cuantas preguntas (p. ej. 5/10/15). La app selecciona preguntas aleatorias del banco seleccionado, mezclando formatos (`SINGLE`, `MULTIPLE`, `TRUE_FALSE`).
- **UX**: una unica sesion con feedback por pregunta al finalizar; barra de avance global.
- **Registra**: estadisticas por modulo (sumadas por separado), pero **no** cambia el estado de un modulo del progreso (no completa nada).
- **Aceptacion**: la seleccion es aleatoria y equilibrada (sin repetir pregunta en la misma sesion); las estadisticas por modulo se agregan correctamente.

### A3. Preguntas verdadero/falso

- **Mecanica**: nuevo formato `TRUE_FALSE`. Cada pregunta tiene un enunciado y dos opciones (Verdadero/Falso) pero se modela como `options` de dos elementos y `correctIndexes` de un elemento (compatible con la evaluacion actual) o como un `type` dedicado. Se decide: **`type: TRUE_FALSE`** con `options: ["Verdadero", "Falso"]`.
- **Contenido**: se convierten/redactan preguntas nuevas de este formato para los 12 modulos (minimo 2 por modulo).
- **Aceptacion**: el tipo se corrige como opcion unica; la API no filtra `correctIndexes`; la UI los renderiza como un toggle de dos botones.

### A4. Tarjetas de repaso (flashcards + repeticion espaciada)

- **Mecanica**: por cada topico se muestra el titulo/idea y una tarjeta con el contenido "oculto" que se voltea. El usuario autoevalua: "sabia" / "no sabia". Con repeticion espaciada simple: las tarjetas "no sabia" vuelven a aparecer al final de la sesion y pesan mas en sesiones siguientes.
- **UX**: modo de pantalla completa con volteo animado; contador de la sesion; resumen final (X sabia / Y no sabia) que puede disparar un mini-quiz de las falladas.
- **Registra**: resultados de autoevaluacion en estadisticas (campo separado, no cuenta como quiz aprobado).
- **Aceptacion**: el volteo muestra contenido sin revelar respuestas de quiz; la priorizacion de "no sabia" funciona dentro de la sesion; los datos persisten.

### A5. Repaso de errores (banco de falladas)

- **Mecanica**: la app recopila las preguntas que el usuario respondio mal en cualquier quiz. El modo "Repasar errores" presenta un quiz de solo esas preguntas (por modulo o global). Al responder correctamente N veces seguidas (p. ej. 2), la pregunta sale del banco de pendientes.
- **UX**: indicador de "preguntas por repasar" en el dashboard; la sesion es identica a un quiz normal.
- **Registra**: contador de aciertos consecutivos por pregunta.
- **Aceptacion**: una pregunta fallada aparece en el banco; dos aciertos consecutivos la sacan; los datos persisten entre sesiones.

### A6. Reto de ordenar codigo

- **Mecanica**: nuevo formato `ORDER`. Se muestran 3-5 bloques de codigo desordenados; el usuario los ordena arrastrando (o con botones arriba/abajo en desktop). Se corrige por **orden exacto** (secuencia completa correcta).
- **UX**: drag & drop simple (HTML5 + manejo manual de estado, sin libreria) con feedback visual; puntaje parcial si es un quiz mixto (1 punto si el orden completo es correcto).
- **Registra**: como pregunta del banco, cuenta en quiz y estadisticas.
- **Aceptacion**: la evaluacion exige la secuencia exacta; la UI permite reordenar y confirmar; el tipo se modela en el JSON de contenido.

### A7. Examen simulado de entrevista

- **Mecanica**: configuracion previa: modulos incluidos, cantidad de preguntas (p. ej. 20) y tiempo limite total (p. ej. 25 min). Una vez iniciado, no se puede volver atras y no hay feedback hasta el final (modo "examen").
- **UX**: pantalla de config, pantalla de examen con navegacion entre preguntas, y pantalla de resultado con detalle por pregunta.
- **Registra**: el intento como `examAttempt` con puntaje, tiempo y fecha; no modifica el estado de modulos.
- **Aceptacion**: el flujo no permite volver atras; al agotar el tiempo se entrega automaticamente; el resultado persiste y se puede comparar con intentos previos.

### A8. Racha diaria y reto del dia

- **Mecanica**: un "reto del dia" (5 preguntas fijas para la fecha, determinista por dia) que otorga la racha: responderlo completa el dia de la racha; faltar un dia la reinicia. Se muestra la racha actual y el calendario breve.
- **UX**: tarjeta destacada en el dashboard con el reto de hoy y la racha.
- **Registra**: `streakDays`, `lastStreakDate` y `dailyChallengeDate` en progreso.
- **Aceptacion**: el reto es el mismo para todos en la misma fecha (deterministico); completarlo suma al dia; no completarlo no rompe nada; la racha persiste.

### A9. Estadisticas por tema (dashboard de fortalezas/debilidades)

- **Mecanica**: sobre todos los intentos registrados se calculan: aciertos/errores por modulo y por topico, mejor puntaje, promedio, tiempo promedio y porcentaje por tipo de pregunta. Se marca cada topico como "debil" (< 60% de aciertos acumulados) o "fuerte".
- **UX**: nueva vista "Estadisticas" con barras por modulo y listado de topicos debiles con acceso directo a su contenido y a un mini-quiz.
- **Registra**: no registra nada; solo lee.
- **Aceptacion**: los numeros son consistentes con los intentos guardados; los topicos debiles se calculan con la regla definida.

## 4. Impacto tecnico

### 4.1 Dominio (`core/domain`)

- `QuestionType` gana `TRUE_FALSE` y `ORDER`.
- Nueva entidad `Attempt` (o `QuizAttempt`): `quizId`, `score`, `total`, `passed`, `durationSeconds`, `mode` (NORMAL/TIME_ATTACK/MIXED/EXAM/ERROR_REVIEW), `date`.
- Nueva logica de evaluacion para `ORDER` (secuencia exacta) — reemplaza/amplia `QuizService.evaluate`.
- Regla de repaso: `consecutiveCorrect` por pregunta en `QuizResult` o en un nuevo `ReviewState`.
- Regla de racha: deterministica sobre `lastStreakDate` y fecha actual (ZonedDateTime, zona local).

### 4.2 Persistencia (`core/infrastructure` + `progress.json`)

- Extension backward compatible de `progress.json`:
  - `quizResults` -> se mantiene; se agrega `attempts` con los nuevos campos.
  - `questionStats`: `{questionId -> {correct, wrong, streak}}`.
  - `streak`: `{current, lastDate, dailyDate}`.
  - `statsByTopic`: derivada, se puede calcular on-the-fly (no se persiste).
- El `ProgressRepository` debe tolerar archivos V1 (defaults para los campos nuevos) para no romper la CLI/UI existente.

### 4.3 API REST (`web`)

| Metodo y ruta | Descripcion |
|---|---|
| `GET /api/modules/{id}/quiz?mode=time_attack` | quiz con config de tiempo (o parametros dedicados) |
| `POST /api/quiz/mixed` | `{moduleIds, count}` -> sesion mixta |
| `POST /api/quiz/errors` | sesion de repaso de falladas |
| `GET /api/progress/statistics` | estadisticas por modulo/topico |
| `POST /api/attempts` | registro de intentos especiales (examen, flashcards) |
| `GET /api/streak` | racha y reto del dia |

- Los nuevos tipos de pregunta fluyen por los DTOs existentes (`QuizQuestionDto.type`, `options`).

### 4.4 Frontend (`ui`)

- Nuevas vistas: `TimeAttackPage`, `MixedQuizPage`, `FlashcardsPage`, `ErrorReviewPage`, `OrderQuizPage` (o componente de reordenamiento), `ExamPage`, `StatisticsPage`.
- Componentes nuevos: `TimerBar`, `FlipCard`, `ReorderList`, `StatBars`.
- `types.ts` y `api.ts` se amplian con los nuevos DTOs/endpoints.
- La navegacion por estado de `App.tsx` crece a un "hub de actividades" (tarjetas de modo) ademas de las vistas de V1.

### 4.5 Contenido

- Se redactan preguntas `TRUE_FALSE` (min. 2 por modulo) y `ORDER` (min. 1-2 por modulo) en los JSON de los 12 modulos.
- `ModuleCatalogTest` se amplia para validar los nuevos formatos.

## 5. Iteraciones sugeridas (cada una cierra con verificacion)

| Iter | Entregables | Verificacion | Estado |
|---|---|---|---|
| V2-1 | `TRUE_FALSE` en dominio/evaluacion + API + UI (toggle) + 2 preguntas por modulo | `mvn test` + `npm run build` + prueba manual | **Completada** (39 core + 8 web verdes; build OK) |
| V2-2 | A2 mixto aleatorio + A5 repaso de errores (dependen de `attempts` y `questionStats`) | idem | **Completada** (56 tests verdes; build OK) |
| V2-3 | A1 contra-reloj (timer) + registro de `durationSeconds` | idem | **Completada** (56 tests verdes; build OK) |
| V2-4 | A6 ordenar codigo (`ORDER`: dominio + evaluacion exacta + drag&drop) | idem | **Completada** (57 tests verdes; build OK) |
| V2-5 | A4 flashcards + repeticion espaciada simple | idem | **Completada** (57 tests verdes; build OK) |
| V2-6 | A7 examen simulado | idem | **Completada** (57 tests verdes; build OK) |
| V2-7 | A8 racha/reto del dia + A9 estadisticas + hub de actividades | idem + arranque conjunto back/front | **Completada** (57 tests verdes; build OK) |

## 6. Decisiones abiertas (se resuelven al arrancar cada iteracion, en los specs)

- `ORDER`: ¿puntaje parcial si parte de la secuencia es correcta, o solo exacto? (propuesta: solo exacto en V1 de la actividad).
- `TRUE_FALSE`: ¿tipo dedicado o `SINGLE` con 2 opciones? (propuesta: tipo dedicado para filtrar en UI/estadisticas).
- Flashcards: ¿la autoevaluacion "sabia/no sabia" cuenta en estadisticas globales? (propuesta: cuenta en una metrica separada para no contaminar aciertos reales).
- Racha: zona horaria del usuario (fecha local del navegador vs servidor).
- Repaso espaciado: umbral de aciertos consecutivos (propuesta: 2) y ventana de reaparicion (propuesta: 1 dia, 3 dias, 7 dias).
- Examen: penalizacion por tiempo o solo corte de tiempo (propuesta: solo corte, sin penalizacion).

## 7. Criterios de exito de V2

- El usuario puede elegir al menos 4 modos de actividad distintos ademas del quiz normal.
- Las estadisticas reflejan fielmente los intentos y destacan los topicos debiles accionables.
- El banco de falladas reduce su tamano cuando el usuario acierta repetidamente.
- `progress.json` de V1 sigue cargando sin errores (backward compatible).
- Toda la funcionalidad sigue disponible en CLI y UI sobre el mismo archivo de progreso.
