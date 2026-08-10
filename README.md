# Java Theory - Entrevistas Tecnicas

Aplicacion de aprendizaje de Java orientada a entrevistas tecnicas. Contiene teoria, ejemplos de codigo y quizzes de autoevaluacion organizados por temas, con un dashboard de progreso y multiples modos de practica.

## Stack

- **Backend**: Java 21 LTS + Maven (multi-modulo: `core` + `web`)
- **API REST**: Spring Boot 3.3
- **Frontend**: React 19 + Vite 6 + TypeScript
- **Testing**: JUnit 5 (Jupiter) + Mockito
- **Persistencia**: JSON con Jackson en `~/.javatheory/progress.json`

## Modulos disponibles

| # | Modulo | Temas |
|---|--------|-------|
| 1 | Core Java | Tipos primitivos, referencias, modificadores, control de flujo, excepciones |
| 2 | POO | Clases, encapsulacion, herencia, polimorfismo, interfaces, composicion |
| 3 | Colecciones | List, Set, Map, Queue, equals/hashCode, inmutabilidad, complejidad |
| 4 | Streams y Lambdas | Lambdas, interfaces funcionales, pipeline, Optional |
| 5 | Concurrencia | Thread, ExecutorService, sincronizacion, thread safety |
| 6 | JVM y Memoria | Stack vs heap, garbage collector, classloader, tipos de referencia |
| 7 | SQL y JDBC | Queries, joins, transacciones, PreparedStatement |
| 8 | Spring | IoC/DI, beans, Spring Boot, autoconfiguracion, REST controllers |
| 9 | Testing | JUnit 5, TDD, Mockito, unit vs integration tests |
| 10 | Patrones de Diseno | Creacionales, estructurales, de comportamiento, SOLID |
| 11 | REST y HTTP | HTTP, verbos, status codes, diseno de APIs |
| 12 | Git | Control de versiones, branching, merge/rebase |

## Modos de practica

- **Quiz normal**: preguntas por modulo con feedback inmediato (70% para aprobar)
- **Quiz mixto**: combina preguntas de varios modulos de forma aleatoria
- **Contra-reloj**: quiz con tiempo limitado por pregunta
- **Verdadero/Falso**: toggle de dos opciones
- **Ordenar codigo**: drag-and-drop para secuenciar bloques
- **Flashcards**: tarjetas de repaso con autoevaluacion
- **Repaso de errores**: repite preguntas falladas hasta acertar 2 veces seguidas
- **Examen simulado**: configuracion previa, sin feedback hasta el final
- **Racha diaria**: reto del dia con 5 preguntas deterministas
- **Estadisticas**: dashboard de fortalezas y debilidades por tema

## Como levantar el proyecto

### Prerequisitos

- Java 21 JDK
- Maven (instalacion local)
- Node.js 18+ y npm

### Backend (API REST)

```bash
# Compilar e instalar dependencias
mvn clean install -DskipTests

# Levantar el backend (puerto 8080)
mvn -pl web spring-boot:run
```

### Frontend (otra terminal)

```bash
cd ui
npm install
npm run dev
```

El frontend corre en `http://localhost:5174` con proxy de `/api` hacia el backend en `:8080`.

### CLI (alternativa)

```bash
# Ejecutar la interfaz de linea de comandos
mvn -pl core exec:java
```

## Estructura del repo

```
java-interview-prep/
├── core/                    # Dominio, servicios, infraestructura, contenido
│   └── src/main/resources/modules/   # Contenido JSON de los 12 modulos
├── web/                     # API REST (Spring Boot)
├── ui/                      # Frontend (React + Vite + TypeScript)
├── specs/                   # Specs del proyecto (descripciones, plan)
└── pom.xml                  # Parent POM (multi-modulo)
```

## Ejecutar tests

```bash
# Todos los tests
mvn test

# Build del frontend
cd ui && npm run build
```

## Licencia

[MIT](LICENSE)
