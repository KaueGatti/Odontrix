FROM ubuntu:latest
LABEL authors="kaueg"

ENTRYPOINT ["top", "-b"]

# Etapa 1
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app

# Copia só dependências primeiro
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

RUN ./mvnw dependency:go-offline

# Agora copia o resto
COPY src src

RUN ./mvnw clean package -DskipTests

# Etapa 2 — Imagem final
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]