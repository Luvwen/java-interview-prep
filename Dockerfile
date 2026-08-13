FROM node:20-slim AS frontend
WORKDIR /app/ui
COPY ui/package.json ui/package-lock.json ./
RUN npm ci
COPY ui/ ./
RUN npm run build

FROM eclipse-temurin:21-jdk AS backend
WORKDIR /app
COPY pom.xml ./
COPY core/pom.xml core/
COPY web/pom.xml web/
RUN mvn dependency:go-offline -B
COPY core/ core/
COPY web/ web/
RUN mvn package -DskipTests -B
COPY --from=frontend /app/ui/dist web/src/main/resources/static/
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend /app/web/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
