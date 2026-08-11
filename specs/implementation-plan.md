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

## Fase 8 (V3) — Expansion de contenido, mejora visual y nuevas secciones interactivas

> Plan de la tercera version de la app. Complementa a la V2 y se ejecuta con el mismo workflow de spec-driven development. Documento viviente: se actualiza al arrancar cada iteracion.

### Resumen

La V2 entrego actividades ludo-didacticas (quiz mixto, contra-reloj, flashcards, examen, etc.). La V3 se enfoca en tres frentes: **(1) profundizar el contenido existente** (mas preguntas, teoria mas profunda, mas ejemplos de codigo, expansion de modulos como Spring y patrones de diseno), **(2) mejorar sustancialmente la UI** (migrar a Chakra UI para un diseno profesional) y **(3) agregar nuevas secciones interactivas** (ejercicios de rellenar codigo, encontrar bugs, y testing extenso).

### Iteraciones

| Iter | Entregables | Verificacion | Estado |
|---|---|---|---|
| V3-1 | README.md + LICENCIA MIT | Archivos creados, README con instrucciones de levantamiento | Pendiente |
| V3-2 | Expansion de contenido: mas preguntas y teoria profunda para los 12 modulos existentes (min. 10 preguntas por modulo, ejemplos ampliados, conceptos avanzados) | `mvn test` + validacion de JSON | **Completada** |
| V3-3 | Expansion del modulo Spring (Spring Boot profiles, actuator, testing, transactional) + nuevo contenido sobre librerias (Hibernate, JPA, JDBC avanzado) integrado al modulo SQL/JDBC y Spring | `mvn test` | **Completada** |
| V3-4 | Expansion de patrones de diseno (mas patrones, ejemplos completos) + nueva seccion de Arquitectura (Clean Architecture, Hexagonal, Microservicios conceptos, con diagramas y codigo) | `mvn test` | **Completada** |
| V3-5 | Migracion del frontend a **Chakra UI**: instalar dependencias, reemplazar estilos, refactorizar componentes existentes, mejorar Layout, dark mode profesional, responsive | `npm run build` + `npm run dev` visual check | **Completada** |
| V3-6 | Nuevo modulo JSON: **Rellenar Codigo** (fragmentos con blanks que el usuario debe completar para que compile). Nueva vista en la UI con editor simple y validacion | `mvn test` + `npm run build` | Pendiente |
| V3-7 | Nuevo modulo JSON: **Encontrar el Bug** (fragmentos de codigo con errores intencionales que el usuario debe identificar). Nueva vista en la UI con seleccion de area del bug | `mvn test` + `npm run build` | Pendiente |
| V3-8 | Expansion extensa del modulo Testing (mas teoria, cobertura, parametrizados, mocks avanzados, tests de integracion, tests de contrato, testing en Spring Boot) | `mvn test` + `npm run build` | Pendiente |

### Detalle por iteracion

#### V3-1: README + Licencia MIT

- `README.md` en la raiz: descripcion del proyecto, stack, como levantar (backend + frontend), estructura del repo, modulos disponibles.
- `LICENSE` con texto MIT completo.

#### V3-2: Expansion de contenido de los 12 modulos

Para cada modulo existente:
- **Ampliar teoria**: secciones de "conceptos avanzados", "errores comunes en entrevistas", "comparaciones" (p. ej. ArrayList vs LinkedList, HashMap vs TreeMap).
- **Agregar ejemplos**: min. 3-5 ejemplos adicionales por topico con comentarios explicativos.
- **Agregar preguntas**: de 7 a 10+ preguntas por modulo, incluyendo mas MULTIPLE y ORDER.
- **Corregir bugs**: IDs duplicados entre preguntas TRUE_FALSE y ORDER en 7 modulos; inconsistencias de prefijos en ORDER.
- Modulos priorizados: Core Java, POO, Colecciones, Streams, Concurrencia (los mas preguntados en entrevistas).

#### V3-3: Expansion Spring + Librerias Java

- **Spring existente**: agregar topics sobre Spring Boot profiles, @ConfigurationProperties, Actuator, @Transactional, Spring Data conceptos, testing con @SpringBootTest.
- **SQL/JDBC**: expandir con JDBC avanzado (DataSource, connection pooling, Batch updates), integrar conceptos de JPA/Hibernate como topics dentro del modulo (no como modulo separado, sino como evolucion de JDBC).
- El modulo SQL/JDBC pasaria a llamarse **"SQL, JDBC y Persistencia"** cubriendo JDBC basico -> JPA/Hibernate -> Spring Data.

#### V3-4: Patrones de diseno + Arquitectura

- **Patrones**: agregar mas patrones (Chain of Responsibility, Command, Mediator, Visitor, Flyweight, Bridge) con ejemplos completos en Java. Expandir SOLID con ejemplos de violaciones y como corregirlas.
- **Arquitectura**: nuevo topic dentro de patrones de diseno o nuevo modulo dedicado. Contenido: Clean Architecture (Circle), Hexagonal (Ports & Adapters), Arquitectura por Capas, Microservicios (conceptos, Cuando SI / Cuando NO), monolito vs microservicios. Incluir diagramas Mermaid y ejemplos de codigo.

#### V3-5: Migracion a Chakra UI

- Instalar: `@chakra-ui/react`, `@chakra-ui/icons`, `framer-motion` (peer dep).
- Refactorizar cada componente existente para usar componentes Chakra (`Box`, `Flex`, `Text`, `Button`, `Badge`, `Card`, `SimpleGrid`, `Tabs`, etc.).
- Mantener el dark mode existente usando el sistema de temas de Chakra.
- Mejorar: sombras, bordes redondeados, spacing consistente, tipografia, hover states, transiciones.
- `styles.css` se reduce drasticamente (Chakra maneja los estilos via props).

#### V3-6: Modulo "Rellenar Codigo"

- Nuevo tipo de pregunta: `CODE_FILL` en `QuestionType`.
- Formato JSON: `{ "id", "text" (enunciado), "codeTemplate" (codigo con ___BLANK___), "blanks" (array con la respuesta correcta de cada blank), "explanation" }`.
- UI: textarea por cada blank, validacion al submit, feedback con el codigo completo resaltado.
- Crear modulo JSON `code-fill.json` con 10+ ejercicios cubriendo distintos temas.

#### V3-7: Modulo "Encontrar el Bug"

- Nuevo tipo de pregunta: `BUG_HUNT` en `QuestionType`.
- Formato JSON: `{ "id", "text" (enunciado), "code" (codigo con bug), "bugLine" (linea o region del bug), "options" (posibles respuestas: que tipo de bug es), "correctIndexes", "explanation" }`.
- UI: codigo con syntax highlighting, el usuario selecciona la linea/region del bug, feedback con explicacion.
- Crear modulo JSON `bug-hunt.json` con 10+ ejercicios.

#### V3-8: Expansion Testing

- Expandir el modulo `testing.json` existente con:
  - JUnit 5 avanzado: `@ParameterizedTest`, `@ValueSource`, `@CsvSource`, `@MethodSource`, `@Nested`, `@DisplayName`, lifecycle callbacks.
  - Mockito avanzado: `verify`, `argumentCaptor`, `doReturn/doThrow`, `spy`, `@Captor`, `@ExtendWith(MockitoExtension.class)`.
  - Tests de integracion: `@SpringBootTest`, `@WebMvcTest`, `TestRestTemplate`, `MockMvc`.
  - Testing de APIs REST: contratos, status codes, response bodies.
  - Cobertura de codigo: Jacoco, metrics.
  - TDD workflow detallado con ejemplo paso a paso.
  - Anti-patrones en testing.
- De 7 a 15+ preguntas en el modulo.

### Criterios de exito de V3

- Cada modulo tiene min. 10 preguntas y teoria profunda con multiples ejemplos.
- El frontend usa Chakra UI con un look profesional, dark mode, responsive.
- Las secciones de "Rellenar Codigo" y "Encontrar el Bug" funcionan como modulos interactivos.
- El modulo de Testing cubre desde basico hasta avanzado (parametrizados, mocks, integracion).
- Spring incluye perfiles, actuator, transaccionalidad y testing.
- Arquitectura esta cubierta con diagramas y ejemplos de codigo.
- README清楚 explica como levantar el proyecto.
- Licencia MIT presente.
