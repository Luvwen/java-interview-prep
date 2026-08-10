# AGENTS.md

## Proposito del repo

Aplicacion de aprendizaje de Java orientada a entrevistas tecnicas. El repo comienza vacio y crece mediante iteraciones guiadas por spec-driven development.

## Toolchain

- **Java 21 LTS** con **Maven** (instalacion local; NO se usa el wrapper `mvnw`).
- v1: **modulo unico**, layout `src/main/java` + `src/test/java`.
- Testing: JUnit 5 (Jupiter) + surefire.
- Dependencias minimas; excepcion justificada: **Jackson** (persistencia JSON).
- Progreso persistido en `~/.javatheory/progress.json` (JSON con Jackson).
- Fase 2 (al cerrar la CLI): **UI web** React + Vite + API REST en Spring Boot; el proyecto pasa a **multi-modulo Maven** (`core` compartido + `web`). CLI y UI comparten el mismo dominio y el mismo archivo de progreso.
- Frontend de fase 2: **SPA React + Vite + TypeScript** en `ui/` (sin router; navegacion por estado). Dev: `mvn -pl web spring-boot:run` (back :8080) + `npm run dev` en `ui/` (front :5174, proxy `/api` -> :8080).
- Verificacion esperada por iteracion: `mvn test`; para cambios de frontend ademas `npm run build` (o `npm run dev`) en `ui/`.

## Workflow (convencion clave): Spec-Driven Development

- Toda feature arranca **actualizando los specs ANTES de escribir codigo**:
  - `specs/functional-description.md` — que hace la app (alcance funcional).
  - `specs/technical-description.md` — como se construye (stack, ADR, arquitectura).
- Los specs son el contrato viviente: se actualizan continuamente a medida que se aprende o cambia el alcance, no se dejan atras.
- Implementar solo lo que los specs describen; si aparece algo no contemplado, primero se actualiza el spec correspondiente.

## Idioma

- Documentacion y specs: **espanol**.
- Codigo (clases, variables, metodos) y commits: **ingles**.
