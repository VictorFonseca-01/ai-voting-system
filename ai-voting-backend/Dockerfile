# ─── Stage 1: Build ─────────────────────────────────────────────
FROM maven:3.9.5-eclipse-temurin-17 AS builder
WORKDIR /app

# Copia pom.xml e baixa dependências (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia código-fonte e compila o JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Runtime ────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copia apenas o JAR final do stage de build
COPY --from=builder /app/target/*.jar app.jar

# Expõe a porta do Spring Boot
EXPOSE 8080

# Comando para iniciar a aplicação com o perfil 'docker' ativado
ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]
