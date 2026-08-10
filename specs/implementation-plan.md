# Plan de Implementacion

> Plan maestro derivado de la descripcion funcional y tecnica. Se actualiza junto con los specs; las fases se ejecutan en orden y cada una cierra con su verificacion.

## Decisiones resueltas

| Area | Decision |
|---|---|
| JDK | 21 LTS (instalada: 21.0.9) |
| Build | Maven, instalacion local |
| Persistencia | JSON con Jackson -> `~/.javatheory/progress.json` |
| Aprobacion de quiz | >=70% |
| Progreso global | modulos completados / total de modulos |
| Root package | `com.javatheory` |
| Modulos | 12 en total: 7 iniciales (Core Java -> POO -> Colecciones -> Streams/lambdas -> Concurrencia -> JVM/memoria -> SQL/JDBC) + 5 de ampliacion (Spring -> Testing -> Patrones de diseno -> REST/HTTP -> Git) |
| Teoria | Explicacion extensa (tipo tutorial) |
| Contenido | Archivos JSON en `src/main/resources` |
| Fase 2 (UI) | Web: React + Vite + API REST en Spring Boot |
| Coexistencia | CLI y UI conviven sobre el mismo dominio y el mismo `progress.json` |

## Fase 0 — Actualizacion de specs (contrato viviente)

- **`specs/functional-description.md`**: resolver seccion 8; fijar regla de aprobacion (70%) y regla de progreso global (modulos completados); sumar la UI web al alcance futuro (secciones 3/4), manteniendo la CLI como alcance v1.
- **`specs/technical-description.md`**: fijar JDK 21, Jackson, ruta de progreso, root package; ajustar el nivel de detalle de la teoria a extensa; agregar ADR D-07 (UI web fase 2: multi-modulo; el no-alcance "sin backend" aplica solo a v1) y diagramas de arquitectura objetivo (React -> API REST Spring Boot -> dominio compartido).
- **`AGENTS.md`**: actualizar toolchain (JDK 21, Jackson, Maven local) y workflow reflejando dos fases: CLI (single-module) y UI web (multi-modulo Spring Boot + React).

## Fase 1 — Setup del proyecto

1. Instalar Maven local (winget disponible); verificar `mvn -version`.
2. Crear `pom.xml`: `groupId com.javatheory`, artifact `java-learn-theory`, release 21, JUnit 5 (Jupiter) + surefire, Jackson databind. Modulo unico.
3. Crear layout: `src/main/java/com/javatheory/...`, `src/test/java/...`, `src/main/resources/modules/`.
4. Verificacion: `mvn -q compile`.

## Fase 2 — Fundacion (dominio + infraestructura + servicios)

- `domain/`: `Module`, `Topic`, `Question`, `QuizResult`, `Progress` + reglas puras (umbral 70%, porcentaje = completados/total, transiciones Pendiente->EnCurso->Completado).
- `infrastructure/`: `ProgressRepository` (Jackson, `~/.javatheory/progress.json`), `ModuleLoader` (JSON de resources).
- `application/`: `ModuleService`, `QuizService`, `ProgressService`.
- Tests JUnit 5: puntaje/umbral/porcentaje/transiciones + round-trip del repositorio con archivo temporal.
- Verificacion: `mvn test`.

## Fase 3 — CLI (presentacion)

- `Main`, menu/navegacion, `QuizRunner`, `ProgressView` sobre stdin/stdout; UC-01 a UC-06.
- Verificacion: `mvn -q package` + ejecucion manual + `mvn test`.

## Fase 4 — Contenido de los 7 modulos (una iteracion por modulo)

- Autorar teoria extensa + ejemplos + quiz como JSON; tests de carga/parsing por modulo.
- Orden: Core Java -> POO -> Colecciones -> Streams/lambdas -> Concurrencia -> JVM/memoria -> SQL/JDBC.
- Verificacion por iteracion: `mvn test`.

## Fase 6 — Ampliacion del catalogo (5 modulos nuevos)

- Autorar en el mismo formato JSON: Spring, Testing, Patrones de diseno, REST y HTTP, Git (teoria extensa + ejemplos + quiz de 4 preguntas cada uno).
- Registrar los 5 archivos en `index.json` manteniendo el orden; actualizar los tests que fijan el conteo (12 modulos).
- Verificacion: `mvn test` + `npm run build` en `ui/` (el catalogo del front es dinamico).

## Fase 5 — UI moderna (React + Vite + Spring Boot), al cerrar la CLI

1. Refactor a **multi-modulo Maven**: modulo `core` (dominio/servicios/infraestructura/contenido, compartido) + modulo `web` (API REST Spring Boot).
2. API REST (misma logica y mismo `progress.json` que la CLI):
   - `GET /api/modules` — catalogo con estado.
   - `GET /api/modules/{id}` — detalle con topics; 404 si no existe.
   - `GET /api/modules/{id}/quiz` — preguntas sin `correctIndexes`.
   - `POST /api/modules/{id}/quiz` — `{"answers":[[int],...]}` -> `{score, total, passed, feedback}`.
   - `POST /api/modules/{id}/complete` — marcar completado (204).
   - `GET /api/progress` — estados por modulo + `overallPercent`.
3. Frontend **React + Vite + TypeScript** en `ui/` (SPA, navegacion por estado):
   - Catalogo de modulos con estado de progreso.
   - Detalle de modulo: teoria extensa + ejemplos y acceso al quiz.
   - Quiz interactivo (opcion unica/multiple) + pantalla de resultado con feedback.
   - Dashboard de progreso (estados + porcentaje global).
   - `vite.config.ts` con proxy `/api` -> `http://localhost:8080`.
4. Verificacion: `mvn test` + `npm run build` en `ui/` + arranque conjunto (`mvn -pl web spring-boot:run` + `npm run dev`) probando la API via proxy.

## Notas

- No se inicializa git ni se hacen commits salvo pedido explicito.
- La instalacion de Maven modifica el sistema (se ejecuta en Fase 1).
- El cierre de las fases 5 y 6 incluye la UI web completa (UC-01 a UC-06, incluido "marcar como completado" y la maquina de estados reflejada en la UI) sobre 12 modulos.

## Fase 7 (V2) — Actividades para testear conocimientos

- Plan detallado en [`specs/v2-plan.md`](./v2-plan.md): modos de juego (quiz contra reloj, mixto aleatorio, verdadero/falso, tarjetas de repaso), estadisticas por tema, repaso de errores y retos de ordenar codigo.
- Se ejecuta al cerrar la fase 6 y reutiliza el dominio, el `progress.json` y la API REST existentes; todo arranca actualizando los specs.
