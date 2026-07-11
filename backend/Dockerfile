# Stage 1: Build the application
FROM maven:3.8.8-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
# Pre-fetch dependencies to speed up subsequent builds
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Production JRE runner
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/platform-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "app.jar"]
