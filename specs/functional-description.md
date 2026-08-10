# Descripcion Funcional

## 1. Proposito y contexto

Aplicacion de aprendizaje de **Java** cuyo objetivo es preparar al usuario para **entrevistas tecnicas** de desarrollo backend/Java. La aplicacion centraliza teoria, ejemplos y ejercicios de practica organizados por temas, y permite al usuario medir su progreso mientras estudia.

Surge de la necesidad de estudiar Java de forma dirigida: en lugar de una lista dispersa de recursos, la app ofrece un recorrido estructurado por los temas que se preguntan con mas frecuencia en procesos de seleccion.

## 2. Usuarios objetivo

- Desarrolladores/as que se preparan para entrevistas tecnicas de Java (junior a mid).
- Personas que repasan conceptos de Java antes de un proceso de seleccion o certificacion.
- Uso individual: no hay roles, cuentas ni administracion en la primera version.

## 3. Caracteristicas propuestas

### 3.1 Modulos tematicos

Contenido de teoria y ejemplos organizado por modulos. Modulos iniciales propuestos (el listado es abierto y se amplia iterativamente):

- **Core Java**: tipos primitivos, referencias, modificadores, control de flujo, excepciones.
- **POO**: clases, interfaces, herencia, polimorfismo, encapsulacion, composicion.
- **Colecciones**: `List`, `Set`, `Map`, `Queue`, equals/hashCode, inmutabilidad.
- **Streams y lambdas**: interfaces funcionales, `Optional`, operaciones de pipeline.
- **Concurrencia**: `Thread`, `Runnable`, `ExecutorService`, sincronizacion, `volatile`, `synchronized`, locks.
- **JVM y memoria**: stack vs heap, garbage collector, classloader, tipos de referencia.
- **SQL y JDBC**: queries basicas, joins, transacciones, `PreparedStatement`.
- **Spring**: IoC e inyeccion de dependencias, beans, Spring Boot, autoconfiguracion, starters y controllers REST.
- **Testing**: JUnit 5, asserts, TDD, mocks (Mockito) y tests de integracion.
- **Patrones de diseno**: creacionales, estructurales y de comportamiento con ejemplos en Java.
- **REST y HTTP**: protocolo HTTP, verbos, codigos de estado, JSON y diseno de APIs.
- **Git**: control de versiones, branching, merge/rebase y flujos de trabajo.

Cada modulo expone: objetivos de aprendizaje, teoria resumida, ejemplos de codigo y un quiz de autoevaluacion.

### 3.2 Ejercicios de practica

- Banco de ejercicios por tema con enunciado y solucion de referencia (proximas iteraciones).
- Los ejercicios se resuelven en el entorno del usuario; la app los presenta como material de estudio, no como ejecutor de codigo en la primera version.

### 3.3 Quiz de autoevaluacion

- Preguntas de opcion multiple por modulo, con feedback inmediato (correcto/incorrecto + explicacion).
- Soporta preguntas de **opcion unica**, **opcion multiple**, **verdadero/falso** (`TRUE_FALSE`) y **ordenar codigo** (`ORDER`).
- Las preguntas `TRUE_FALSE` tienen exactamente dos opciones (`Verdadero` / `Falso`) y una unica respuesta correcta; en la UI se responden como un toggle.
- Las preguntas `ORDER` muestran 3-5 bloques de codigo desordenados; el usuario los ordena arrastrando o con botones arriba/abajo. Se corrige por secuencia exacta.

### 3.6 Actividades V2 (segunda version)

- A partir de la V2 la app suma actividades dirigidas para testear conocimientos (contra-reloj, mixto, flashcards, repaso de errores, ordenar codigo, examen, racha, estadisticas). El plan detallado vive en [`specs/v2-plan.md`](./v2-plan.md).
- La iteracion **V2-1** incorpora el formato `TRUE_FALSE` al banco de preguntas de los 12 modulos (minimo 2 por modulo), al dominio/evaluacion, a la API y a la UI.
- La iteracion **V2-2** incorpora: (a) **Quiz mixto aleatorio (A2)**: el usuario elige modulos y cantidad de preguntas; la app selecciona aleatoriamente del banco mezclando formatos; no cambia estado de modulos; registra estadisticas por pregunta. (b) **Repaso de errores (A5)**: recopila preguntas respondidas incorrectamente; sesion de repaso que elimina del banco al acertar 2 veces seguidas. Ambos modos dependen de `questionStats` (estadisticas por pregunta) y `attempts` (registro de intentos) en el progreso.
- La iteracion **V2-3** incorpora **Quiz contra-reloj (A1)**: variante por pregunta (tiempo configurable por pregunta, se pasa si se agota) y variante global (tiempo total). El tiempo se registra en `durationSeconds` del `Attempt`. La UI muestra una barra de progreso temporal visual.
- La iteracion **V2-4** incorpora **Reto de ordenar codigo (A6)**: nuevo formato `ORDER`. Se muestran 3-5 bloques de codigo desordenados; el usuario los ordena arrastrando (o con botones arriba/abajo). Se corrige por orden exacto (secuencia completa correcta).
- La iteracion **V2-5** incorpora **Flashcards (A4)**: el usuario selecciona modulos y recorre tarjetas con conceptos clave. Voltea la tarjeta para ver el contenido y se autoevalua ("sabia" / "no sabia"). Las tarjetas "no sabia" vuelven a aparecer al final de la sesion.
- La iteracion **V2-6** incorpora **Examen simulado (A7)**: configuracion previa (modulos, cantidad de preguntas, tiempo limite). Una vez iniciado no se puede volver atras y no hay feedback hasta el final. El tiempo corre y al agotarse se entrega automaticamente.
- La iteracion **V2-7** incorpora: (a) **Racha diaria (A8)**: reto del dia (5 preguntas fijas por fecha, deterministas) que mantiene la racha; completar el reto suma el dia, faltar lo reinicia. (b) **Estadisticas por modulo (A9)**: dashboard con aciertos/errores por modulo, mejor puntaje, promedio, tiempo promedio y topicos debiles (< 60%).
- La iteracion **V3-2** incorpora **Expansion de contenido**: ampliacion de teoria con conceptos avanzados y errores comunes en entrevistas, ejemplos adicionales por topico (min. 3-5), y expansion del banco de preguntas a 10+ por modulo incluyendo mas MULTIPLE y ORDER. Prioridad: Core Java, POO, Colecciones, Streams, Concurrencia. Tambien corrige bugs de IDs duplicados entre preguntas TRUE_FALSE y ORDER en 7 modulos.

### 3.4 Seguimiento de progreso

- Registro local del estado de cada modulo (pendiente / en curso / completado) y resultados de quizzes.
- Visualizacion del avance global (porcentaje por tema y total).
- **Estadisticas por pregunta** (`questionStats`): aciertos, errores y aciertos consecutivos por cada pregunta del banco.
- **Registro de intentos** (`attempts`): cada quiz resuelto queda registrado con modo (normal, mixto, contra-reloj, examen), modulos involucrados, puntaje, tiempo y fecha.
- **Racha diaria** (`streak`): dias consecutivos completando el reto del dia.

### 3.5 UI web (fase 2)

Una vez estable la CLI, la app crece con una **UI web moderna** (SPA React + Vite consumiendo una API REST en Spring Boot) que ofrece las mismas funcionalidades de catalogo, teoria, quiz y progreso en el navegador. La CLI y la UI conviven: ambas comparten el mismo dominio y el mismo archivo de progreso local.

El frontend usa **Chakra UI v2** con dark mode profesional, tokens de color semanticos centralizados (`colors.ts`) y componentes compartidos (`QuestionRenderer`, `QuizFeedback`) que eliminan duplicacion. La navegacion se resuelve con un custom hook (`useNavigation.ts`) que sincroniza el estado con la API de historial del navegador, permitiendo que el boton "Atras" del navegador funcione como el boton "Volver" interno de la app.

La UI web se organiza en 10 vistas:

- **Catalogo de modulos**: lista los 12 modulos con su estado de progreso (pendiente / en curso / completado).
- **Detalle de modulo**: teoria extensa de cada topico con sus ejemplos de codigo, acceso al quiz, badge con el estado actual del modulo y accion "marcar como completado" (UC-06).
- **Quiz interactivo**: preguntas de opcion unica, multiple, verdadero/falso y ordenar codigo (drag-and-drop + flechas arriba/abajo); al enviar, muestra puntaje (aprueba con >=70%), estado aprobado/desaprobado y feedback por pregunta. El resultado queda registrado en el progreso y avanza la maquina de estados del modulo.
- **Hub de actividades**: acceso a los 6 modos de juego: Quiz mixto, Repaso de errores, Contra-reloj, Ordenar codigo, Flashcards, Examen.
- **Quiz mixto**: seleccion de modulos y cantidad de preguntas; sesion aleatoria con mezcla de formatos.
- **Repaso de errores**: recopula preguntas con errores historicos; al acertar 2 veces seguidas se retira del repaso.
- **Quiz contra-reloj**: timer por pregunta con tiempo configurable; si se agota, se salta.
- **Flashcards**: tarjetas con concepto clave; el usuario voltear y se autoevalua ("sabia" / "no sabia").
- **Examen simulado**: configuracion (modulos, cantidad, tiempo), navegacion forward-only, sin feedback hasta el final, auto-entrega al agotar tiempo.
- **Progreso**: dashboard con el estado de cada modulo, un resumen de modulos completados sobre el total, el porcentaje global de avance, la racha diaria y la accion "Resetear progreso".

La maquina de estados de un modulo se transiciona desde la UI: **pendiente -> en curso** al intentar resolver su quiz sin aprobar, y **-> completado** al aprobar el quiz (>=70%) o al marcarlo manualmente con la accion UC-06.

## 4. Alcance y no-alcance

### Dentro de alcance (primera version)

- CLI (interfaz de linea de comandos) para navegar modulos, ver teoria y resolver quizzes.
- Contenido de los modulos iniciales definidos en 3.1.
- Registro de progreso local (persistencia en archivo dentro del repo del usuario).

### Fuera de alcance (no-alcance)

- GUI / interfaz web **en la primera version (CLI)**; la UI web es la fase 2 (ver 3.5).
- Multi-usuario, autenticacion, backend servidor ni base de datos central **en v1**; la fase 2 agrega una API REST local (sin multiusuario ni autenticacion).
- Ejecucion o evaluacion de codigo enviado por el usuario.
- Contenido de entrevistas no relacionado con Java (algoritmos genericos, sistemas, etc.).
- Material en otros idiomas (el contenido se redacta en espanol).

## 5. Restricciones tecnicas

- **Java** con **Maven, modulo unico**.
- Layout estandar Maven: `src/main/java` y `src/test/java`.
- Testing: JUnit 5.
- Dependencias minimas; priorizar la libreria estandar.
- Documentacion y specs en espanol; codigo y commits en ingles.

## 6. Casos de uso iniciales

1. **UC-01 Ver catalogo de modulos**: el usuario lista los modulos disponibles con su estado de progreso.
2. **UC-02 Ver contenido de un modulo**: el usuario navega a un modulo y lee teoria + ejemplos.
3. **UC-03 Resolver quiz**: el usuario responde un quiz de un modulo y recibe feedback por pregunta.
4. **UC-04 Ver resultado del quiz**: el usuario ve su puntaje al terminar un quiz.
5. **UC-05 Ver progreso general**: el usuario consulta el avance por tema y total.
6. **UC-06 Marcar modulo como completado**: el usuario indica que termino un modulo.
7. **UC-07 Quiz mixto aleatorio**: el usuario elige modulos y cantidad; responde una sesion aleatoria y recibe feedback.
8. **UC-08 Repaso de errores**: el usuario repasa las preguntas que erro previamente; al acertar 2 veces seguidas se retiran.
9. **UC-09 Quiz contra-reloj**: el usuario elige tiempo por pregunta; el timer corre y se salta al agotarse.
10. **UC-10 Reto de ordenar codigo**: el usuario ordena bloques de codigo desordenados por secuencia correcta.
11. **UC-11 Flashcards**: el usuario revisa tarjetas de conceptos y se autoevalua sabia/no sabia.
12. **UC-12 Examen simulado**: el usuario configura un examen (modulos, cantidad, tiempo), lo resuelve forward-only y recibe feedback al final.
13. **UC-13 Racha diaria**: el usuario completa el reto del dia (5 preguntas) y mantiene su racha.
14. **UC-14 Ver estadisticas**: el usuario consulta aciertos/errores por modulo, mejor puntaje, promedio y topicos debiles.
15. **UC-15 Resetear progreso**: el usuario borra todo el progreso registrado y empieza de cero.

### 3.7 Manejo de errores HTTP

Cuando la API REST responde con un codigo de error (400, 404, 403, 500), la UI muestra una vista de error con un diseno visual claro que incluye: codigo de estado, titulo descriptivo en espanol, breve explicacion de la causa probable y un boton para volver a la pantalla anterior. Los errores se clasifican:

- **400 Bad Request**: la solicitud es invalida ( parametros faltantes, count > preguntas disponibles, etc.).
- **403 Forbidden**: acceso no autorizado (normalmente no ocurre en la app local; se muestra si CORS falla o el endpoint esta restringido).
- **404 Not Found**: el recurso solicitado (modulo, quiz, endpoint) no existe.
- **500 Internal Server Error**: error inesperado del servidor.

## 7. Criterios de aceptacion por feature

- **Catalogo de modulos**: listar todos los modulos definidos; mostrar estado de cada uno.
- **Contenido de modulo**: al seleccionar un modulo, mostrar teoria, ejemplos y enlace al quiz; el contenido del modulo esta definido en el spec.
- **Quiz**: cada pregunta se corrige al responder; las preguntas incorrectas muestran explicacion; el puntaje final es correcto segun las respuestas dadas.
- **Quiz mixto**: al seleccionar modulos y cantidad, se genera una sesion aleatoria con mezcla de formatos; el resultado no afecta el estado de los modulos.
- **Repaso de errores**: muestra preguntas con errores historicos; al acertar 2 veces seguidas se retira de la sesion.
- **Contra-reloj**: el timer por pregunta corre; al agotarse se salta la pregunta y se registra como incorrecta.
- **Ordenar codigo**: las preguntas `ORDER` se evaluan por secuencia exacta; drag-and-drop y botones arriba/abajo funcionan.
- **Flashcards**: las tarjetas se voltean con animacion; el usuario marca sabia/no sabia; las "no sabia" vuelven al final.
- **Examen**: una vez iniciado no se puede volver atras; no hay feedback hasta el final; el tiempo corre y al agotarse se entrega automaticamente.
- **Racha diaria**: completar el reto del dia (5 preguntas) suma el dia a la racha; faltar o no completar la reinicia.
- **Estadisticas**: el dashboard muestra aciertos/errores por modulo, mejor puntaje, promedio, tiempo promedio y topicos debiles (< 60%).
- **Resetear progreso**: la accion borra todo el progreso registrado y devuelve los modulos a pendiente.
- **Progreso**: los cambios de estado y resultados persisten entre ejecuciones; el porcentaje refleja los modulos completados / quizzes aprobados segun la regla definida en el spec.
- **Manejo de errores HTTP**: ante un error 400/403/404/500, la UI muestra una vista visual con codigo, titulo, descripcion y boton de retorno. La app no muestra stacktraces ni errores crudos al usuario.

## 8. Reglas definidas (decisiones tomadas)

Reglas que antes eran preguntas abiertas y quedan fijadas:

- **Aprobacion de un quiz**: se aprueba con **70% o mas** de respuestas correctas.
- **Progreso global**: el porcentaje global = modulos con estado `completado` / total de modulos. Los resultados de quizzes no pesan en el global (aunque se registran).
- **Transiciones de estado de un modulo**: pendiente -> en curso al intentar un quiz sin aprobar; -> completado al aprobar (>=70%) o al marcarlo manualmente. El estado `en curso` se muestra en catalogo, detalle y progreso.
- **Persistencia**: el progreso se guarda en **JSON** en `~/.javatheory/progress.json`.
- **Contenido de los modulos**: 12 modulos (7 iniciales + 5 de ampliacion), con teoria de tipo **explicacion extensa**, almacenados como archivos JSON en `src/main/resources`.
- **Orden de implementacion**: Core Java -> POO -> Colecciones -> Streams y lambdas -> Concurrencia -> JVM y memoria -> SQL/JDBC -> Spring -> Testing -> Patrones de diseno -> REST y HTTP -> Git.
- **UI web**: la fase 2 (React + Vite + API REST en Spring Boot) comparte dominio y archivo de progreso con la CLI. La SPA tiene 4 vistas (catalogo, detalle de modulo, quiz, progreso); sin autenticacion ni multiusuario.
- **Formato `TRUE_FALSE`**: cada pregunta tiene `options: ["Verdadero", "Falso"]` y `correctIndexes` con un unico elemento (`[0]` verdadero, `[1]` falso); se corrige con la misma regla de coincidencia exacta que `SINGLE`.
- **Formato `ORDER`**: `correctOrder` contiene la secuencia de indices correcta; se evalua contra el orden exacto proporcionado por el usuario.
- **Quiz mixto (`QuizMode.MIXED`)**: genera una sesion aleatoria de preguntas mezclando `SINGLE`, `MULTIPLE`, `TRUE_FALSE` y `ORDER`; los modulos elegidos se filtran del banco global. Si `count` supera la cantidad de preguntas disponibles en los modulos seleccionados, se ajusta (clamp) al maximo disponible en vez de fallar.
- **Repaso de errores (`QuizMode.ERRORS`)**: selecciona preguntas con `wrongCount > 0` y `correctStreak < 2`; al llegar a 2 aciertos consecutivos se retira.
- **Contra-reloj (`QuizMode.TIME_ATTACK`)**: cada pregunta lleva un timer en segundos; al agotarse se marca como incorrecta y se avanza. El tiempo se registra en `durationSeconds` del `Attempt`.
- **Flashcards**: tarjetas con conceptos clave; se autoevaluan sabia/no sabia; las "no sabia" se reciclan al final de la sesion.
- **Examen (`QuizMode.EXAM`)**: configuracion previa (modulos, cantidad, tiempo total); navegacion forward-only (sin ir atras); sin feedback hasta el final; auto-entrega al agotar tiempo.
- **Racha diaria**: el reto del dia tiene 5 preguntas fijas por fecha (deterministas); completar el reto suma el dia a la racha consecutiva.
- **Estadisticas por modulo**: aciertos, errores, mejor puntaje, promedio y tiempo promedio; topicos debiles son los que tienen < 60% de aciertos.
- **Reset de progreso**: `DELETE /api/progress` borra el archivo y devuelve un `Progress` vacio.

_Nota: este documento es el contrato viviente del proyecto. Se actualiza continuamente a medida que se aprende o cambia el alcance; toda iteracion de implementacion arranca actualizando este archivo antes de escribir codigo._
