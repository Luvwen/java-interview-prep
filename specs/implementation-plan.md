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
| V3-1 | README.md + LICENCIA MIT | Archivos creados, README con instrucciones de levantamiento | **Completada** |
| V3-2 | Expansion de contenido: mas preguntas y teoria profunda para los 12 modulos existentes (min. 10 preguntas por modulo, ejemplos ampliados, conceptos avanzados) | `mvn test` + validacion de JSON | **Completada** |
| V3-3 | Expansion del modulo Spring (Spring Boot profiles, actuator, testing, transactional) + nuevo contenido sobre librerias (Hibernate, JPA, JDBC avanzado) integrado al modulo SQL/JDBC y Spring | `mvn test` | **Completada** |
| V3-4 | Expansion de patrones de diseno (mas patrones, ejemplos completos) + nueva seccion de Arquitectura (Clean Architecture, Hexagonal, Microservicios conceptos, con diagramas y codigo) | `mvn test` | **Completada** |
| V3-5 | Migracion del frontend a **Chakra UI**: instalar dependencias, reemplazar estilos, refactorizar componentes existentes, mejorar Layout, dark mode profesional, responsive | `npm run build` + `npm run dev` visual check | **Completada** |
| V3-6 | Nuevo modulo JSON: **Rellenar Codigo** (fragmentos con blanks que el usuario debe completar para que compile). Nueva vista en la UI con editor simple y validacion | `mvn test` + `npm run build` | **Completada** |
| V3-7 | Nuevo modulo JSON: **Encontrar el Bug** (fragmentos de codigo con errores intencionales que el usuario debe identificar). Nueva vista en la UI con seleccion de area del bug | `mvn test` + `npm run build` | **Completada** |
| V3-8 | Expansion extensa del modulo Testing (mas teoria, cobertura, parametrizados, mocks avanzados, tests de integracion, tests de contrato, testing en Spring Boot) | `mvn test` + `npm run build` | **Completada** |

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

## Fase 9 (V4) — Reordenamiento de modulos, mejora del IDE virtual, contenido integrado y seccion de casos reales

> Plan de la cuarta version de la app. Complementa a la V3 y se ejecuta con el mismo workflow de spec-driven development.

### Resumen

La V3 entrego contenido extenso, actividades interactivas y una UI con Chakra UI. La V4 se enfoca en cuatro frentes: **(1) reordenar los modulos** siguiendo la progresion logica que deberia tener un desarrollador Java, **(2) mejorar el IDE virtual** (tema Monokai, mejor separacion de ejemplos), **(3) integrar fragmentos de codigo dentro de cada seccion** de teoria (no solo debajo), y **(4) agregar una nueva seccion de "Casos Reales"** con situaciones cotidianas del dia a dia resueltas con codigo y explicaciones detalladas.

### Iteraciones

| Iter | Entregables | Verificacion | Estado |
|---|---|---|---|
| V4-1 | Reordenar modulos en `index.json` + actualizar orden en `TheoryModules` de la UI + actualizar `description` de modulos afectados | `mvn test` + `npm run build` | **Completada** |
| V4-2 | Cambiar tema del IDE virtual a Monokai: actualizar `CodeEditor.tsx` con colores Monokai, actualizar PrismJS theme | `npm run build` + verificacion visual | **Completada** |
| V4-3 | Reformatear contenido de los 12 modulos: integrar fragmentos de codigo inline dentro del `content` de cada topic (formato markdown con bloques de codigo), eliminar o reducir el array `examples` separado | `mvn test` + `npm run build` | **Completada** |
| V4-4 | Crear nuevo modulo "Casos Reales" (`real-world.json`): situaciones cotidianas con codigo completo y explicaciones detalladas. Registrar en `index.json` | `mvn test` + `npm run build` | **Completada** |

### Detalle por iteracion

#### V4-1: Reordenamiento de modulos

**Objetivo**: Los modulos deben seguir la progresion logica que deberia tener un desarrollador Java backend, desde los fundamentos hasta las herramientas y frameworks.

**Orden actual** (en `index.json`):
1. core-java, poo, collections, streams, concurrency, jvm, sql-jdbc, spring, testing, design-patterns, rest-http, git

**Orden propuesto**:
1. **core-java** — Fundamentos del lenguaje (tipos, referencias, control de flujo, excepciones). Base de todo.
2. **poo** — Programacion orientada a objetos (clases, herencia, polimorfismo, encapsulacion). Depende de core-java.
3. **collections** — Estructuras de datos (List, Set, Map, Queue). Requiere POO para entender interfaces.
4. **streams** — Programacion funcional (lambdas, Optional, pipelines). Requiere collections y POO (interfaces funcionales).
5. **concurrency** — Hilos y sincronizacion. Requiere collections (concurrent) y conceptos de POO.
6. **jvm** — Memoria, garbage collection, classloaders. Requiere concurrency y collections para entender la jerarquia de memoria.
7. **testing** — JUnit 5, Mockito, TDD. Se estudia ANTES de frameworks para entender la mentalidad de testing.
8. **sql-jdbc** — Bases de datos, SQL, JDBC, JPA. Independiente pero util antes de Spring.
9. **rest-http** — Conceptos de HTTP, APIs REST, verbos, status codes. Se estudia ANTES de Spring para entender que implementa.
10. **spring** — Framework Spring Boot. Requiere testing, REST/HTTP, JDBC y POO.
11. **design-patterns** — Patrones de diseno. Se estudia despues de tener experiencia con los anteriores.
12. **git** — Control de versiones. Independiente, pero logico al final como herramienta de trabajo.

**Cambios necesarios**:
- `core/src/main/resources/modules/index.json`: reordenar el array.
- `ui/src/pages/BugHuntPage.tsx`, `ui/src/pages/CodeFillPage.tsx`: actualizar el array `THEORY_MODULES` para reflejar el nuevo orden.
- `ui/src/pages/ActivityPage.tsx` o equivalente: si tiene orden hardcodeado, actualizar.
- `core/src/main/java/.../application/ModuleService.java`: si el orden importa para el catalogo, verificar.

**Decision**: El orden de los modulos en `index.json` define el orden en el catalogo. No se renombran modulos ni se mueven preguntas, solo se reordena la lista.

#### V4-2: Tema Monokai para el IDE virtual

**Objetivo**: El editor de codigo virtual debe usar la paleta de colores Monokai (el tema mas universal en editores de codigo) para que concuerde mejor con los ejemplos de los ejercicios de bug-hunt y code-fill.

**Colores Monokai** (referencia):
- Fondo: `#272822`
- Texto default: `#f8f8f2`
- Keywords/reservadas: `#f92672` (rosa)
- Strings: `#e6db74` (amarillo)
- Comments: `#75715e` (gris)
- Functions: `#a6e22e` (verde)
- Numbers/constants: `#ae81ff` (violeta)
- Types/classes: `#66d9ef` (cyan)
- Operators: `#f92672`
- Line numbers bg: `#2d2d2d`
- Line numbers text: `#90908a`

**Cambios en `CodeEditor.tsx`**:
- Reemplazar el fondo `gray.900` por `#272822`.
- Reemplazar el color de texto `green.300` por `#f8f8f2`.
- Actualizar el background del gutter de numeros de linea.
- Importar o crear un CSS override para PrismJS que use la paleta Monokai.
- Actualizar el color del caret a blanco.

**Archivos a modificar**:
- `ui/src/components/CodeEditor.tsx`: colores inline y estilos.
- `ui/src/styles/` o `ui/src/index.css`: override de PrismJS theme (si existe).
- Crear `ui/src/styles/monokai-prism.css` si no existe un theme Monokai para Prism.

**Verificacion**: `npm run build` + verificacion visual de que el editor muestra colores Monokai.

#### V4-3: Contenido integrado (codigo inline en cada seccion)

**Objetivo**: Cada topic dentro de un modulo debe tener fragmentos de codigo que expliquen los conceptos de forma inline, no todos los ejemplos agrupados debajo de la seccion de texto.

**Problema actual**: El formato JSON de los topics tiene:
```json
{
  "id": "core-primitives",
  "title": "Tipos primitivos",
  "content": "Texto largo...",
  "examples": ["ejemplo1", "ejemplo2", ...]
}
```

Los `examples` se muestran todos juntos debajo del `content`. El usuario pide que cada concepto tenga su ejemplo de codigo integrado.

**Formato propuesto** (nuevo campo `sections`):
```json
{
  "id": "core-primitives",
  "title": "Tipos primitivos",
  "sections": [
    {
      "title": "Primitivos basicos",
      "text": "Java tiene 8 tipos primitivos: byte, short, int, long...",
      "code": "int max = Integer.MAX_VALUE;\nlong big = 9_000_000_000L;"
    },
    {
      "title": "Autoboxing y cache",
      "text": "Cada primitivo tiene un wrapper. El cache de Integer...",
      "code": "Integer a = 127; Integer b = 127;\nSystem.out.println(a == b); // true (cache)\n\nInteger c = 200; Integer d = 200;\nSystem.out.println(c == d); // false"
    },
    {
      "title": "Errores comunes en entrevistas",
      "text": "Comparar wrappers con == fuera del cache...",
      "code": "Integer e = null;\nint f = e; // NullPointerException!"
    }
  ],
  "examples": []  // se mantiene por compatibilidad, pero se puede vaciar
}
```

**Decisiones**:
- `sections` es un array de objetos `{title, text, code?}`. El `code` es opcional.
- `content` se mantiene como fallback para topics que no se reformatean (backward compatible).
- `examples` se mantiene vacio o se elimina gradualmente.
- El frontend (`ModuleDetailPage.tsx` o equivalente) debe renderizar `sections` si existe, y caer a `content` + `examples` si no.
- Se reformatean los 12 modulos existentes, uno por iteracion.

**Archivos a modificar**:
- `ui/src/pages/ModuleDetailPage.tsx` o `ui/src/components/TopicRenderer.tsx`: renderizar `sections` con bloque de texto + bloque de codigo intercalados.
- `core/src/main/resources/modules/*.json`: reformatear cada modulo.
- `core/src/main/java/.../domain/Topic.java`: agregar campo `sections` (o usar un tipo nuevo `TopicSection`).

**Verificacion por modulo**: `mvn test` + `npm run build`.

#### V4-4: Seccion de "Casos Reales" (Real World)

**Objetivo**: Agregar una nueva **seccion separada** (no un modulo en el catalogo) donde se muestre, con codigo completo y explicaciones detalladas, situaciones cotidianas del dia a dia de un programador Java y la manera ideal de resolverlo. Cada caso incluye ejercicios de practica con su resolucion.

**Tipo de contenido**: No es un modulo de teoria ni un quiz. Es una coleccion de **recetas** (recipes) o **guias practicas** que muestran como resolver problemas reales paso a paso, con ejercicios para que el usuario practique.

**Navegacion**: Seccion separada con boton dedicado en el nav/sidebar, NO incluida en el catalogo de modulos. El boton dice "Casos Reales" o "Real World" y lleva a una vista dedicada.

**Formato propuesto** (`real-world.json`):
```json
{
  "id": "real-world",
  "title": "Casos Reales del Dia a Dia",
  "description": "Situaciones cotidianas que enfrenta un programador Java backend, resueltas con las mejores practicas. Cada caso incluye el problema, la solucion paso a paso, el codigo completo y los puntos clave para entrevistas.",
  "cases": [
    {
      "id": "rw-token-refresh",
      "title": "Generacion y refresh eficiente de JWT tokens",
      "category": "Seguridad / Autenticacion",
      "difficulty": "intermediate",
      "problem": "Un usuario se autentica y recibe un access token (15 min) y un refresh token (7 dias). Cuando el access token expira, el cliente debe renovarlo sin que el usuario vuelva a loguearse. Explicar el flujo completo y mostrar el codigo.",
      "sections": [
        {
          "title": "Flujo de autenticacion",
          "text": "El cliente envia credenciales al endpoint /auth/login. El servidor valida, genera un access token JWT (corto plazo) y un refresh token (largo plazo). El access token se envia en el header Authorization: Bearer <token>...",
          "code": "// Login endpoint\n@PostMapping(\"/auth/login\")\npublic ResponseEntity<TokenResponse> login(@RequestBody LoginRequest req) {\n    User user = userService.authenticate(req.email(), req.password());\n    String accessToken = jwtService.generateAccessToken(user);\n    String refreshToken = jwtService.generateRefreshToken(user);\n    return ResponseEntity.ok(new TokenResponse(accessToken, refreshToken));\n}"
        },
        {
          "title": "Refresh del token",
          "text": "Cuando el access token expira (401), el cliente envia el refresh token a /auth/refresh. El servidor valida el refresh token, verifica que no este revocado, y genera un nuevo access token...",
          "code": "// Refresh endpoint\n@PostMapping(\"/auth/refresh\")\npublic ResponseEntity<TokenResponse> refresh(@RequestBody RefreshRequest req) {\n    if (tokenService.isRevoked(req.refreshToken())) {\n        throw new UnauthorizedException(\"Token revocado\");\n    }\n    Claims claims = jwtService.parseToken(req.refreshToken());\n    User user = userService.findById(claims.getSubject());\n    String newAccessToken = jwtService.generateAccessToken(user);\n    return ResponseEntity.ok(new TokenResponse(newAccessToken, req.refreshToken()));\n}"
        },
        {
          "title": "Seguridad: blacklist y rotacion",
          "text": "Para invalidar tokens se usa una blacklist (Redis o DB). El refresh token se rota: cada uso genera uno nuevo y el anterior se invalida. Esto limita la ventana de uso si un token es comprometido...",
          "code": "// Token blacklist con Redis\n@Service\npublic class TokenBlacklistService {\n    private final RedisTemplate<String, String> redis;\n    \n    public void revoke(String token, Duration ttl) {\n        redis.opsForValue().set(\"blacklist:\" + token, \"1\", ttl);\n    }\n    \n    public boolean isRevoked(String token) {\n        return redis.hasKey(\"blacklist:\" + token);\n    }\n}"
        }
      ],
      "keyPoints": [
        "Access tokens: corta vida (15-30 min), se envian en cada request.",
        "Refresh tokens: vida larga (7-30 dias), solo se usan para renovar.",
        "Rotacion de refresh tokens: cada uso genera uno nuevo.",
        "Blacklist para invalidacion inmediata (logout, password change).",
        "Nunca guardar JWT en localStorage; usar httpOnly cookies o memory."
      ],
      "interviewQuestions": [
        "¿Que diferencia hay entre un access token y un refresh token?",
        "¿Que pasa si un JWT es robado? ¿Como lo invalidas?",
        "¿Por que se recomienda rotar los refresh tokens?"
      ]
    },
    {
      "id": "rw-crud-best-practices",
      "title": "CRUD completo con las mejores practicas",
      "category": "API REST / Spring Boot",
      "difficulty": "intermediate",
      "problem": "Crear un CRUD completo para una entidad 'Product' usando Spring Boot, JPA, validacion, manejo de errores y DTOs. Mostrar la estructura de archivos y el codigo de cada capa.",
      "sections": [
        {
          "title": "Estructura de archivos",
          "text": "Una aplicacion Spring Boot bien organizada sigue la convencion de paquetes por capa...",
          "code": "com.example.demo/\n  controller/\n    ProductController.java\n  service/\n    ProductService.java\n    impl/\n      ProductServiceImpl.java\n  repository/\n    ProductRepository.java\n  model/\n    entity/\n      Product.java\n    dto/\n      ProductRequest.java\n      ProductResponse.java\n    exception/\n      ResourceNotFoundException.java\n      ErrorResponse.java\n  config/\n    GlobalExceptionHandler.java"
        },
        {
          "title": "Entidad y Repository",
          "text": "La entidad JPA mapea a la tabla. El repository extiende JpaRepository y agrega metodos customizados...",
          "code": "@Entity\n@Table(name = \"products\")\npublic class Product {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    \n    @Column(nullable = false)\n    private String name;\n    \n    private String description;\n    \n    @Column(nullable = false)\n    private BigDecimal price;\n    \n    @Column(nullable = false)\n    private Integer stock;\n    \n    @CreationTimestamp\n    private LocalDateTime createdAt;\n}\n\n@Repository\npublic interface ProductRepository extends JpaRepository<Product, Long> {\n    List<Product> findBynameContainingIgnoreCase(String name);\n    boolean existsByName(String name);\n}"
        },
        {
          "title": "DTOs y Validacion",
          "text": "Los DTOs separan la entidad de la API. La validacion se hace con anotaciones de Jakarta Validation...",
          "code": "public record ProductRequest(\n    @NotBlank(message = \"Nombre es requerido\")\n    @Size(min = 2, max = 100)\n    String name,\n    \n    @Size(max = 500)\n    String description,\n    \n    @NotNull @Positive\n    BigDecimal price,\n    \n    @NotNull @Min(0)\n    Integer stock\n) {}\n\npublic record ProductResponse(\n    Long id, String name, String description,\n    BigDecimal price, Integer stock, LocalDateTime createdAt\n) {\n    public static ProductResponse from(Product p) {\n        return new ProductResponse(p.getId(), p.getName(),\n            p.getDescription(), p.getPrice(), p.getStock(), p.getCreatedAt());\n    }\n}"
        },
        {
          "title": "Service y Controller",
          "text": "El service contiene la logica de negocio. El controller maneja HTTP y delega al service...",
          "code": "@Service\n@RequiredArgsConstructor\npublic class ProductServiceImpl implements ProductService {\n    private final ProductRepository repository;\n    \n    public List<ProductResponse> findAll() {\n        return repository.findAll().stream()\n            .map(ProductResponse::from)\n            .toList();\n    }\n    \n    public ProductResponse findById(Long id) {\n        Product p = repository.findById(id)\n            .orElseThrow(() -> new ResourceNotFoundException(\"Product\", id));\n        return ProductResponse.from(p);\n    }\n    \n    public ProductResponse create(ProductRequest req) {\n        Product p = new Product();\n        p.setName(req.name());\n        p.setDescription(req.description());\n        p.setPrice(req.price());\n        p.setStock(req.stock());\n        return ProductResponse.from(repository.save(p));\n    }\n}\n\n@RestController\n@RequestMapping(\"/api/products\")\n@RequiredArgsConstructor\npublic class ProductController {\n    private final ProductService service;\n    \n    @GetMapping\n    public List<ProductResponse> findAll() { return service.findAll(); }\n    \n    @GetMapping(\"/{id}\")\n    public ProductResponse findById(@PathVariable Long id) { return service.findById(id); }\n    \n    @PostMapping\n    @ResponseStatus(HttpStatus.CREATED)\n    public ProductResponse create(@Valid @RequestBody ProductRequest req) { return service.create(req); }\n    \n    @PutMapping(\"/{id}\")\n    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {\n        return service.update(id, req);\n    }\n    \n    @DeleteMapping(\"/{id}\")\n    @ResponseStatus(HttpStatus.NO_CONTENT)\n    public void delete(@PathVariable Long id) { service.delete(id); }\n}"
        },
        {
          "title": "Manejo de errores global",
          "text": "Un GlobalExceptionHandler centraliza el manejo de excepciones y retorna respuestas consistentes...",
          "code": "@RestControllerAdvice\npublic class GlobalExceptionHandler {\n    \n    @ExceptionHandler(ResourceNotFoundException.class)\n    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {\n        return ResponseEntity.status(HttpStatus.NOT_FOUND)\n            .body(new ErrorResponse(404, ex.getMessage()));\n    }\n    \n    @ExceptionHandler(MethodArgumentNotValidException.class)\n    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {\n        String msg = ex.getBindingResult().getFieldErrors().stream()\n            .map(e -> e.getField() + \": \" + e.getDefaultMessage())\n            .collect(Collectors.joining(\", \"));\n        return ResponseEntity.badRequest().body(new ErrorResponse(400, msg));\n    }\n}"
        }
      ],
      "keyPoints": [
        "Separar entidades de DTOs: la entidad no se expone en la API.",
        "Usar validacion con anotaciones (@NotBlank, @Positive, etc.).",
        "GlobalExceptionHandler para respuestas de error consistentes.",
        "Service layer para logica de negocio, Controller para HTTP.",
        "Usar ResponseEntity para controlar status codes."
      ]
    },
    {
      "id": "rw-design-patterns",
      "title": "Patrones de diseno en la vida real",
      "category": "Arquitectura / Patrones",
      "difficulty": "advanced",
      "problem": "Mostrar como se aplican los patrones de diseno mas comunes en proyectos reales de Java, no como ejemplos aislados sino como soluciones a problemas que aparecen todos los dias.",
      "sections": [
        {
          "title": "Strategy: diferentes algoritmos intercambiables",
          "text": "Cuando tenés que calcular algo de varias formas (descuento porcentaje, descuento fijo, envio gratis) y no querés un if-else gigante...",
          "code": "// Interfaz del estrategia\npublic interface PricingStrategy {\n    BigDecimal calculateDiscount(Order order);\n}\n\n// Estrategias concretas\n@Component(\"percentageDiscount\")\npublic class PercentageDiscountStrategy implements PricingStrategy {\n    public BigDecimal calculateDiscount(Order order) {\n        return order.getTotal().multiply(BigDecimal.valueOf(0.10));\n    }\n}\n\n@Component(\"fixedDiscount\")\npublic class FixedDiscountStrategy implements PricingStrategy {\n    public BigDecimal calculateDiscount(Order order) {\n        return BigDecimal.valueOf(500);\n    }\n}\n\n// Uso con Spring\n@Service\npublic class OrderService {\n    private final Map<String, PricingStrategy> strategies;\n    \n    public OrderService(Map<String, PricingStrategy> strategies) {\n        this.strategies = strategies;\n    }\n    \n    public BigDecimal applyDiscount(Order order, String strategyName) {\n        return strategies.get(strategyName).calculateDiscount(order);\n    }\n}"
        },
        {
          "title": "Observer: notificaciones en cascada",
          "text": "Cuando una accion debe disparar multiples efectos (guardar en DB, enviar email, notificar al canal de Slack) sin acoplar el origen...",
          "code": "// Evento base\npublic record OrderCreatedEvent(Long orderId, String customerEmail, BigDecimal total) {}\n\n// Listener interface\n@FunctionalInterface\npublic interface OrderEventListener {\n    void onOrderCreated(OrderCreatedEvent event);\n}\n\n// Listeners concretos\n@Component\npublic class SendEmailListener implements OrderEventListener {\n    public void onOrderCreated(OrderCreatedEvent event) {\n        emailService.send(event.customerEmail(), \"Tu orden #\" + event.orderId() + \" fue creada\");\n    }\n}\n\n@Component\npublic class UpdateStockListener implements OrderEventListener {\n    public void onOrderCreated(OrderCreatedEvent event) {\n        stockService.reserve(event.orderId());\n    }\n}\n\n// Publisher\n@Service\npublic class OrderEventPublisher {\n    private final List<OrderEventListener> listeners;\n    \n    public void publish(OrderCreatedEvent event) {\n        listeners.forEach(l -> l.onOrderCreated(event));\n    }\n}"
        },
        {
          "title": "Factory: creacion de objetos complejos",
          "text": "Cuando la creacion de un objeto requiere pasos configurables o diferentes representaciones segun el contexto...",
          "code": "public interface NotificationSender {\n    void send(String to, String message);\n}\n\n@Component\npublic class NotificationFactory {\n    private final Map<NotificationType, NotificationSender> senders;\n    \n    public NotificationFactory(List<NotificationSender> senderList) {\n        this.senders = senderList.stream()\n            .collect(Collectors.toMap(\n                s -> s.getClass().getAnnotation(NotificationType.class).value(),\n                Function.identity()\n            ));\n    }\n    \n    public NotificationSender getSender(NotificationType type) {\n        return Optional.ofNullable(senders.get(type))\n            .orElseThrow(() -> new IllegalArgumentException(\"Tipo no soportado: \" + type));\n    }\n}"
        }
      ],
      "keyPoints": [
        "Strategy: reemplaza if-else/switch largos con objetos intercambiables.",
        "Observer: desacopla el emisor de los receptores de eventos.",
        "Factory: centraliza la creacion de objetos complejos.",
        "En Spring, los beans inyectados como Map<String, T> son factories naturales.",
        "No sobreusar patrones: un if-simple es mejor que un Strategy de una sola variante."
      ]
    },
    {
      "id": "rw-project-structure",
      "title": "Estructura de archivos de un proyecto Spring Boot",
      "category": "Arquitectura / Organizacion",
      "difficulty": "beginner",
      "problem": "Mostrar la estructura recomendada de carpetas y paquetes para un proyecto Spring Boot real, explicando que va en cada lugar y por que.",
      "sections": [
        {
          "title": "Estructura base",
          "text": "La convencion de Spring Boot organiza el codigo por capas (controller, service, repository) dentro de un paquete raiz...",
          "code": "src/main/java/com/example/app/\n  config/                    // Configuracion general\n    SecurityConfig.java\n    WebConfig.java\n    OpenApiConfig.java\n  controller/                // Endpoints REST\n    ProductController.java\n    AuthController.java\n    UserController.java\n  service/                   // Logica de negocio\n    ProductService.java\n    AuthService.java\n  service/impl/              // Implementaciones\n    ProductServiceImpl.java\n    AuthServiceImpl.java\n  repository/                // Acceso a datos\n    ProductRepository.java\n    UserRepository.java\n  model/                     // Modelos\n    entity/                  // Entidades JPA\n      Product.java\n      User.java\n    dto/                     // Data Transfer Objects\n      ProductRequest.java\n      ProductResponse.java\n      LoginRequest.java\n    enums/                   // Enumeraciones\n      Role.java\n      OrderStatus.java\n    exception/               // Excepciones custom\n      ResourceNotFoundException.java\n      DuplicateResourceException.java\n  security/                  // Seguridad\n    JwtTokenProvider.java\n    JwtAuthenticationFilter.java\n  util/                      // Utilidades (usar poco)\n    PaginationUtil.java\nresources/\n  application.yml\n  application-dev.yml\n  application-prod.yml\n  db/migration/              // Migraciones Flyway\n    V1__create_products_table.sql"
        },
        {
          "title": "Cuando crear una clase nueva",
          "text": "La regla practica: si modifica algo → service. Si recibe HTTP → controller. Si accede a DB → repository. Si es un dato que viaja entre capas → DTO. Si es un error custom → exception.",
          "code": "// EJEMPLO: Flujo completo de un endpoint GET /api/products/{id}\n\n// 1. Controller recibe la request\n@GetMapping(\"/{id}\")\npublic ProductResponse findById(@PathVariable Long id) {\n    return productService.findById(id);  // delega\n}\n\n// 2. Service busca y transforma\npublic ProductResponse findById(Long id) {\n    Product entity = productRepository.findById(id)\n        .orElseThrow(() -> new ResourceNotFoundException(\"Product\", id));\n    return ProductResponse.from(entity);  // entidad → DTO\n}\n\n// 3. Repository consulta la DB\n// (JpaRepository provee findById automaticamente)"
        },
        {
          "title": "Evitar estas errores comunes",
          "text": "Los errores mas frecuentes en la estructura de un proyecto Spring Boot...",
          "code": "// MAL: Logica de negocio en el Controller\n@RestController\npublic class ProductController {\n    @PostMapping\n    public Product create(@RequestBody Product p) {\n        if (p.getPrice().compareTo(BigDecimal.ZERO) < 0) throw new Exception();\n        // ... 50 lineas de logica ...\n        return productRepository.save(p);\n    }\n}\n\n// BIEN: Controller delgado, Service con logica\n@RestController\npublic class ProductController {\n    @PostMapping\n    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest req) {\n        return ResponseEntity.status(CREATED).body(productService.create(req));\n    }\n}\n\n// MAL: Exponer entidades JPA directamente en la API\n@GetMapping(\"/{id}\")\npublic Product findById(@PathVariable Long id) {\n    return productRepository.findById(id).orElseThrow();  // expone lazy proxies, passwords, etc.\n}\n\n// BIEN: Siempre usar DTOs\n@GetMapping(\"/{id}\")\npublic ProductResponse findById(@PathVariable Long id) {\n    return ProductResponse.from(productService.findById(id));\n}"
        }
      ],
      "keyPoints": [
        "Controller: solo recibe HTTP, valida input, delega al Service.",
        "Service: logica de negocio, transacciones, transformaciones.",
        "Repository: acceso a datos, queries customizadas.",
        "DTOs: nunca exponer entidades JPA directamente en la API.",
        "Exceptions custom: claras y descriptivas, no generericException.",
        "config/: configuracion de seguridad, CORS, OpenAPI, etc."
      ]
    },
    {
      "id": "rw-error-handling",
      "title": "Manejo de errores profesional en una API REST",
      "category": "API REST / Calidad",
      "difficulty": "intermediate",
      "problem": "Como manejar errores de forma consistente y profesional en una API REST, incluyendo validacion, errores de negocio, y errores de infraestructura.",
      "sections": [
        {
          "title": "Jerarquia de excepciones custom",
          "text": "Crear excepciones que representen problemas de negocio, no usar RuntimeException generico...",
          "code": "// Excepcion base\npublic abstract class BusinessException extends RuntimeException {\n    private final int statusCode;\n    \n    protected BusinessException(String message, int statusCode) {\n        super(message);\n        this.statusCode = statusCode;\n    }\n    \n    public int getStatusCode() { return statusCode; }\n}\n\n// Excepciones concretas\npublic class ResourceNotFoundException extends BusinessException {\n    public ResourceNotFoundException(String resource, Long id) {\n        super(resource + \" with id \" + id + \" not found\", 404);\n    }\n}\n\npublic class DuplicateResourceException extends BusinessException {\n    public DuplicateResourceException(String resource, String field, String value) {\n        super(resource + \" with \" + field + \"=\" + value + \" already exists\", 409);\n    }\n}\n\npublic class InsufficientStockException extends BusinessException {\n    public InsufficientStockException(Long productId, int requested, int available) {\n        super(\"Product \" + productId + \": requested \" + requested + \", available \" + available, 422);\n    }\n}"
        },
        {
          "title": "Respuesta de error estandarizada",
          "text": "Todos los errores deben tener la misma estructura para que el frontend pueda manejarlos consistentemente...",
          "code": "public record ErrorResponse(\n    int status,\n    String message,\n    String path,\n    LocalDateTime timestamp,\n    List<FieldError> fieldErrors  // solo para 400\n) {\n    public record FieldError(String field, String message) {}\n    \n    public static ErrorResponse of(int status, String message, String path) {\n        return new ErrorResponse(status, message, path, LocalDateTime.now(), List.of());\n    }\n    \n    public static ErrorResponse of(int status, String message, String path, List<FieldError> fields) {\n        return new ErrorResponse(status, message, path, LocalDateTime.now(), fields);\n    }\n}\n\n// Ejemplo de respuesta JSON:\n// {\n//   \"status\": 400,\n//   \"message\": \"Validacion fallida\",\n//   \"path\": \"/api/products\",\n//   \"timestamp\": \"2025-01-15T10:30:00\",\n//   \"fieldErrors\": [\n//     {\"field\": \"name\", \"message\": \"Nombre es requerido\"},\n//     {\"field\": \"price\", \"message\": \"Debe ser positivo\"}\n//   ]\n// }"
        }
      ],
      "keyPoints": [
        "Nunca usar Exception generico: crear excepciones de negocio especificas.",
        "Respuesta de error estandarizada: status, message, path, timestamp.",
        "GlobalExceptionHandler para centralizar el manejo.",
        "FieldErrors para errores de validacion (400).",
        "Logear errores internos (500) pero no exponer stack trace al cliente."
      ]
    },
    {
      "id": "rw-testing-strategy",
      "title": "Estrategia de testing completa en un proyecto real",
      "category": "Testing / Calidad",
      "difficulty": "advanced",
      "problem": "Definir la piramide de testing, que testear en cada capa, y como configurar el entorno de testing para un proyecto Spring Boot.",
      "sections": [
        {
          "title": "Piramide de testing",
          "text": "La piramide de testing define la proporcion de tests: muchos unit (rapidos, baratos), menos integration (medios), y pocos e2e (lentos, caros)...",
          "code": "/*\n * Piramide de testing:\n * \n *        /  E2E  \\          <- pocos, lentos (WireMock, TestContainers)\n *       / Integration \\      <- medios, @SpringBootTest\n *      /   Unit Tests   \\    <- muchos, rapidos (@ExtendWith(MockitoExtension))\n *     /__________________\\\n * \n * Regla practica:\n * - Unit: 70% (tested with mocks, <1s each)\n * - Integration: 25% (DB, API, Spring context)\n * - E2E: 5% (flujo completo, browser o HTTP real)\n */"
        },
        {
          "title": "Test unitario con Mockito",
          "text": "Los tests unitarios no usan Spring context. Son rapidos y aislados. Se mockean las dependencias...",
          "code": "@ExtendWith(MockitoExtension.class)\nclass ProductServiceTest {\n\n    @Mock\n    private ProductRepository repository;\n    \n    @InjectMocks\n    private ProductServiceImpl service;\n    \n    @Test\n    void shouldReturnProduct_whenExists() {\n        // Arrange\n        Product product = new Product(1L, \"Laptop\", new BigDecimal(\"999.99\"), 10);\n        when(repository.findById(1L)).thenReturn(Optional.of(product));\n        \n        // Act\n        ProductResponse result = service.findById(1L);\n        \n        // Assert\n        assertThat(result.name()).isEqualTo(\"Laptop\");\n        assertThat(result.price()).isEqualByComparingTo(new BigDecimal(\"999.99\"));\n        verify(repository).findById(1L);\n    }\n    \n    @Test\n    void shouldThrow_whenProductNotFound() {\n        when(repository.findById(99L)).thenReturn(Optional.empty());\n        \n        assertThatThrownBy(() -> service.findById(99L))\n            .isInstanceOf(ResourceNotFoundException.class)\n            .hasMessageContaining(\"99\");\n    }\n}"
        },
        {
          "title": "Test de integracion con base de datos",
          "text": "Los tests de integracion prueban la interaccion con la DB real. Usan @SpringBootTest y un H2 o TestContainers...",
          "code": "@SpringBootTest\n@ActiveProfiles(\"test\")\nclass ProductRepositoryTest {\n\n    @Autowired\n    private ProductRepository repository;\n    \n    @Autowired\n    private TestEntityManager entityManager;\n    \n    @BeforeEach\n    void setup() {\n        entityManager.persistAndFlush(new Product(null, \"Test\", \"Desc\", new BigDecimal(\"10\"), 5));\n    }\n    \n    @Test\n    void shouldFindByNameContainingIgnoreCase() {\n        List<Product> results = repository.findBynameContainingIgnoreCase(\"test\");\n        assertThat(results).hasSize(1);\n        assertThat(results.get(0).getName()).isEqualTo(\"Test\");\n    }\n    \n    @Test\n    @Transactional\n    void shouldDetectDuplicateName() {\n        assertThat(repository.existsByName(\"Test\")).isTrue();\n        assertThat(repository.existsByName(\"NonExistent\")).isFalse();\n    }\n}"
        }
      ],
      "keyPoints": [
        "Unit tests: rapidos, mocks, sin Spring context. 70% de la piramide.",
        "Integration tests: con DB y Spring context. 25%.",
        "E2E tests: flujo completo. 5%.",
        "Usar @ActiveProfiles(\"test\") para separar config de test.",
        "TestEntityManager para setup de datos en integration tests.",
        "Siempre Arrange-Act-Assert (AAA)."
      ]
    }
  ]
}
```

**Topics cubiertos en la seccion "Casos Reales"** (ordenados del mas facil al mas dificil):

| Caso | Categoria | Dificultad | Temas cubiertos |
|---|---|---|---|
| Estructura de archivos | Organizacion | Basico | Paquetes por capa, convenciones Spring Boot |
| CRUD completo | API REST | Intermedio | Spring Boot, JPA, DTOs, validacion, manejo de errores |
| Manejo de errores profesional | API REST | Intermedio | Excepciones custom, respuesta estandarizada |
| JWT Token y Refresh | Seguridad | Intermedio | JWT, refresh tokens, blacklist, rotacion, Redis |
| Estrategia de testing | Testing | Avanzado | Piramide de testing, Mockito, integracion |
| Patrones en la vida real | Arquitectura | Avanzado | Strategy, Observer, Factory con Spring |

**Archivos a crear/modificar**:
- `core/src/main/resources/modules/real-world.json`: contenido de la seccion.
- `core/src/main/java/.../domain/RealWorldCase.java`: modelo para el caso.
- `ui/src/pages/RealWorldPage.tsx`: vista dedicada para la seccion de casos reales.
- `ui/src/App.tsx`: agregar navegacion a la seccion (seccion separada, NO un modulo en el catalogo).
- `ui/src/useNavigation.ts`: agregar estado `"real-world"`.

**Decisiones resueltas**:
- **Ubicacion**: Los casos reales van como una **seccion separada** con boton dedicado en el nav, NO como un modulo mas en el catalogo de modulos.
- **Ejercicios de practica**: Cada caso tiene al final una seccion `"exercises"` con ejercicios para el usuario intentar, y debajo la resucion completa con codigo.
- **Orden**: Los casos se muestran ordenados del mas facil al mas dificil (beginner → intermediate → advanced). No hay filtrado, solo el listado ordenado.

**Formato de ejercicios por caso** (campo `exercises` al final de cada caso):
```json
{
  "id": "rw-crud-best-practices",
  "...": "...",
  "sections": [ ... ],
  "keyPoints": [ ... ],
  "exercises": [
    {
      "title": "Exercise 1: Crear un CRUD para 'Order'",
      "description": "Usando el patron del caso CRUD, crear un CRUD completo para una entidad Order con los campos: id, customerName, total (BigDecimal), status (enum: PENDING, CONFIRMED, SHIPPED). Incluir: entity, repository, DTOs (request/response), service, controller, y manejo de errores.",
      "hints": [
        "Usa @Enumerated(EnumType.STRING) para el campo status.",
        "Agrega un endpoint extra: GET /api/orders/status/{status} que filtre por estado.",
        "El total debe ser @PositiveOrZero, no @Positive (puede ser 0 en órdenes vacías)."
      ],
      "solution": {
        "files": [
          {
            "path": "model/entity/Order.java",
            "code": "@Entity\n@Table(name = \"orders\")\npublic class Order {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    \n    @Column(nullable = false)\n    private String customerName;\n    \n    @NotNull @PositiveOrZero\n    private BigDecimal total;\n    \n    @Enumerated(EnumType.STRING)\n    @Column(nullable = false)\n    private OrderStatus status = OrderStatus.PENDING;\n    \n    @CreationTimestamp\n    private LocalDateTime createdAt;\n}"
          },
          {
            "path": "model/enums/OrderStatus.java",
            "code": "public enum OrderStatus {\n    PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED\n}"
          },
          {
            "path": "model/dto/OrderRequest.java",
            "code": "public record OrderRequest(\n    @NotBlank String customerName,\n    @NotNull @PositiveOrZero BigDecimal total,\n    OrderStatus status\n) {}"
          },
          {
            "path": "model/dto/OrderResponse.java",
            "code": "public record OrderResponse(Long id, String customerName, BigDecimal total, OrderStatus status, LocalDateTime createdAt) {\n    public static OrderResponse from(Order o) {\n        return new OrderResponse(o.getId(), o.getCustomerName(), o.getTotal(), o.getStatus(), o.getCreatedAt());\n    }\n}"
          },
          {
            "path": "repository/OrderRepository.java",
            "code": "@Repository\npublic interface OrderRepository extends JpaRepository<Order, Long> {\n    List<Order> findByStatus(OrderStatus status);\n}"
          },
          {
            "path": "service/OrderService.java",
            "code": "@Service\n@RequiredArgsConstructor\npublic class OrderService {\n    private final OrderRepository repository;\n    \n    public List<OrderResponse> findAll() {\n        return repository.findAll().stream().map(OrderResponse::from).toList();\n    }\n    \n    public OrderResponse findById(Long id) {\n        return OrderResponse.from(repository.findById(id)\n            .orElseThrow(() -> new ResourceNotFoundException(\"Order\", id)));\n    }\n    \n    public List<OrderResponse> findByStatus(OrderStatus status) {\n        return repository.findByStatus(status).stream().map(OrderResponse::from).toList();\n    }\n    \n    public OrderResponse create(OrderRequest req) {\n        Order order = new Order();\n        order.setCustomerName(req.customerName());\n        order.setTotal(req.total());\n        order.setStatus(req.status() != null ? req.status() : OrderStatus.PENDING);\n        return OrderResponse.from(repository.save(order));\n    }\n    \n    public OrderResponse update(Long id, OrderRequest req) {\n        Order order = repository.findById(id)\n            .orElseThrow(() -> new ResourceNotFoundException(\"Order\", id));\n        order.setCustomerName(req.customerName());\n        order.setTotal(req.total());\n        order.setStatus(req.status());\n        return OrderResponse.from(repository.save(order));\n    }\n    \n    public void delete(Long id) {\n        if (!repository.existsById(id)) throw new ResourceNotFoundException(\"Order\", id);\n        repository.deleteById(id);\n    }\n}"
          },
          {
            "path": "controller/OrderController.java",
            "code": "@RestController\n@RequestMapping(\"/api/orders\")\n@RequiredArgsConstructor\npublic class OrderController {\n    private final OrderService service;\n    \n    @GetMapping\n    public List<OrderResponse> findAll() { return service.findAll(); }\n    \n    @GetMapping(\"/{id}\")\n    public OrderResponse findById(@PathVariable Long id) { return service.findById(id); }\n    \n    @GetMapping(\"/status/{status}\")\n    public List<OrderResponse> findByStatus(@PathVariable OrderStatus status) { return service.findByStatus(status); }\n    \n    @PostMapping\n    @ResponseStatus(HttpStatus.CREATED)\n    public OrderResponse create(@Valid @RequestBody OrderRequest req) { return service.create(req); }\n    \n    @PutMapping(\"/{id}\")\n    public OrderResponse update(@PathVariable Long id, @Valid @RequestBody OrderRequest req) { return service.update(id, req); }\n    \n    @DeleteMapping(\"/{id}\")\n    @ResponseStatus(HttpStatus.NO_CONTENT)\n    public void delete(@PathVariable Long id) { service.delete(id); }\n}"
          }
        ]
      }
    },
    {
      "title": "Exercise 2: Test unitario del OrderService",
      "description": "Escribir tests unitarios con Mockito para el OrderService. Probar: findAll, findById (existe y no existe), create, delete (existe y no existe).",
      "hints": [
        "Usa @ExtendWith(MockitoExtension.class) y @Mock para el repository.",
        "Para delete, usa verify(repository).deleteById(id) para confirmar que se llamo.",
        "Para findById cuando no existe, verifica el mensaje de la excepcion."
      ],
      "solution": {
        "files": [
          {
            "path": "OrderServiceTest.java",
            "code": "@ExtendWith(MockitoExtension.class)\nclass OrderServiceTest {\n\n    @Mock\n    private OrderRepository repository;\n    \n    @InjectMocks\n    private OrderService service;\n    \n    @Test\n    void shouldReturnAllOrders() {\n        Order order = new Order();\n        order.setId(1L);\n        order.setCustomerName(\"Juan\");\n        when(repository.findAll()).thenReturn(List.of(order));\n        \n        List<OrderResponse> result = service.findAll();\n        \n        assertThat(result).hasSize(1);\n        assertThat(result.get(0).customerName()).isEqualTo(\"Juan\");\n    }\n    \n    @Test\n    void shouldReturnOrder_whenExists() {\n        Order order = new Order();\n        order.setId(1L);\n        when(repository.findById(1L)).thenReturn(Optional.of(order));\n        \n        OrderResponse result = service.findById(1L);\n        assertThat(result.id()).isEqualTo(1L);\n    }\n    \n    @Test\n    void shouldThrow_whenOrderNotFound() {\n        when(repository.findById(99L)).thenReturn(Optional.empty());\n        \n        assertThatThrownBy(() -> service.findById(99L))\n            .isInstanceOf(ResourceNotFoundException.class)\n            .hasMessageContaining(\"99\");\n    }\n    \n    @Test\n    void shouldCreateOrder() {\n        OrderRequest req = new OrderRequest(\"Maria\", new BigDecimal(\"5000\"), null);\n        Order saved = new Order();\n        saved.setId(1L);\n        when(repository.save(any(Order.class))).thenReturn(saved);\n        \n        OrderResponse result = service.create(req);\n        assertThat(result.id()).isEqualTo(1L);\n        verify(repository).save(any(Order.class));\n    }\n    \n    @Test\n    void shouldDeleteOrder_whenExists() {\n        when(repository.existsById(1L)).thenReturn(true);\n        \n        service.delete(1L);\n        verify(repository).deleteById(1L);\n    }\n    \n    @Test\n    void shouldThrow_whenDeletingNonExistentOrder() {\n        when(repository.existsById(99L)).thenReturn(false);\n        \n        assertThatThrownBy(() -> service.delete(99L))\n            .isInstanceOf(ResourceNotFoundException.class);\n    }\n}"
          }
        ]
      }
    }
  ]
}
```

**Verificacion**: `mvn test` + `npm run build` + verificacion de que la seccion renderiza correctamente con todo el contenido.

### Criterios de exito de V4

- Los modulos estan ordenados segun la progresion logica de aprendizaje de un dev Java backend.
- El IDE virtual usa colores Monokai y concuerda con los ejemplos de ejercicios.
- Cada topic tiene fragmentos de codigo inline explicando los conceptos, no todos agrupados abajo.
- La seccion "Casos Reales" es una **seccion separada** con boton dedicado en el nav (no un modulo en el catalogo).
- Cada caso real tiene al menos 2 ejercicios de practica con su resolucion completa.
- Los casos reales cubren situaciones que aparecen en entrevistas y en el dia a dia laboral.
- Toda la funcionalidad existente sigue funcionando (backward compatible).

## Fase 10 (V5) — Pulido final, mobile, progreso en frontend y deploy en Render

> Plan de la quinta version de la app. Complementa a la V4 y se ejecuta con el mismo workflow de spec-driven development.

### Resumen

La V4 entrego modulos reordenados, Monokai, codigo inline y Casos Reales. La V5 se enfoca en cinco frentes: **(1) agregar indices (TOC) en cada modulo** para navegacion rapida entre topics, **(2) pulir el layout** (espaciado, tipografia, cards, sombras), **(3) hacer que toda la app funcione en mobile** (hamburger menu, code overflow, layouts adaptivos), **(4) mover el progreso al frontend** (localStorage + guest ID automatico) para que al hostear cada usuario tenga su progreso, y **(5) preparar el deploy en Render** (Dockerfile multi-stage, SPA fallback, application.properties).

### Iteraciones

| Iter | Entregables | Verificacion | Estado |
|---|---|---|---|
| V5-1 | Module TOC: tabla de contenidos sticky en ModulePage con topics clickeables y highlight del topic actual via IntersectionObserver | `npm run build` | **Completada** |
| V5-2 | Layout polish: cards con border-radius 16px, sombras sutiles, gradientes, tipografia mejorada (letterSpacing, fontWeight), transiciones suaves | `npm run build` | **Completada** |
| V5-3 | Mobile: hamburger menu con Drawer en header, code overflow-x auto en CodeEditor y CodeBlock, paddings responsivos | `npm run build` | **Completada** |
| V5-4 | Frontend progress: ProgressStore en localStorage, GuestId UUID automatico, api.ts lee/escribe localmente, stats y streak computados localmente | `npm run build` | **Completada** |
| V5-5 | Deploy prep: Dockerfile multi-stage (node → java), render.yaml, application.properties, WebConfig.java (SPA fallback), web/pom.xml (resource copying) | `mvn test` + `npm run build` | **Completada** |
| V5-6 | Verificacion final: build completo, test, checklist de deploy | Todos los anteriores | **Completada** |

### Detalle por iteracion

#### V5-1: Module TOC (Tabla de Contenidos)

**Objetivo**: Al abrir un modulo, mostrar un indice sticky con los topics del modulo. Click en un topic hace scroll suave.

**Implementacion**:
- Componente `ModuleTOC` en `ModulePage.tsx`
- Desktop: sticky panel a la derecha con lista de topics
- Mobile: panel collapsible con boton "Indice del modulo"
- `IntersectionObserver` para highlight del topic actual
- Scroll suave con `element.scrollIntoView({ behavior: "smooth" })`

**Archivos**: `ui/src/pages/ModulePage.tsx`

#### V5-2: Layout Polish

**Objetivo**: Mejorar la sensacion visual sin cambiar la paleta.

**Cambios**:
- `colors.ts`: agregar tokens `shadow`, `shadowLg`, `gradient`
- `theme.ts`: transiciones globales, border-radius 10px en botones
- Cards: `borderRadius: 16px`, `boxShadow`, `gradient` background
- Headings: `letterSpacing: -0.02em`, `fontWeight: 700`
- Container: `maxW: 1040px`
- Transiciones: `all 0.2s ease` en cards y botones

**Archivos**: `colors.ts`, `theme.ts`, `CatalogPage.tsx`, `ModulePage.tsx`, `App.tsx`

#### V5-3: Mobile Responsiveness

**Objetivo**: Que toda la app funcione en mobile (< 768px).

**Soluciones**:
- Header: hamburger menu con `Drawer` de Chakra en mobile, botones horizontales en desktop
- Code: `overflow-x: auto` en CodeEditor y CodeBlock (antes era `hidden`)
- Container: paddings responsivos (`px: { base: 3, md: 4 }`)
- Nav items: visibles en desktop, en drawer en mobile

**Archivos**: `App.tsx`, `CodeEditor.tsx`, `CodeBlock.tsx`

#### V5-4: Frontend Progress + Guest ID

**Objetivo**: Mover progreso al frontend. Guest ID automatico.

**Arquitectura**:
- `store/GuestId.ts`: UUID v4 via `crypto.randomUUID()`, guardado en `javatheory_guest_id`
- `store/ProgressStore.ts`: localStorage con chave `javatheory_progress`
  - `getProgress()`, `markModule()`, `recordQuizResult()`, `reset()`
- `api.ts`: `getProgress()` y `resetProgress()` ahora usan localStorage
- `completeModule()` actualiza localStorage ademas de llamar al backend
- `getStats()` y `getStreak()` computados localmente desde el progreso

**Archivos**: `store/GuestId.ts` (nuevo), `store/ProgressStore.ts` (nuevo), `api.ts`

#### V5-5: Deploy Prep (Render)

**Objetivo**: Preparar para deployar en Render como un solo servicio.

**Implementacion**:
- `Dockerfile`: multi-stage (node:20 → eclipse-temurin:21-jdk → eclipse-temurin:21-jre)
- `render.yaml`: service type web, docker runtime
- `application.properties`: `server.port=${PORT:8080}`
- `WebConfig.java`: SPA fallback (todas las rutas sirven `index.html`)
- `web/pom.xml`: resource copying de `ui/dist` a `static/`

**Archivos**: `Dockerfile` (nuevo), `render.yaml` (nuevo), `application.properties` (nuevo), `WebConfig.java` (nuevo), `web/pom.xml`

### Criterios de exito de V5

- El TOC funciona con scroll suave y highlight del topic actual.
- Las cards tienen sombras, gradientes y bordes redondeados.
- El hamburger menu funciona en mobile.
- El codigo es scrollable en pantallas chicas.
- El progreso persiste en localStorage al recargar la pagina.
- El guest ID se genera automaticamente en el primer acceso.
- El Dockerfile builda la app completa (frontend + backend).
- `render.yaml` esta configurado para Render.
- El SPA fallback funciona (recargar en `/module/core-java` no da 404).
- `mvn test` pasa (44/44).
- `npm run build` no tiene errores de TypeScript.
