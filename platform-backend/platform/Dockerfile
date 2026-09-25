# Build : compilation du jar Spring Boot (tests exclus, nécessitent une BDD)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle
COPY src src
RUN chmod +x gradlew && ./gradlew bootJar -x test --no-daemon

# Runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd -r spring
COPY --from=build /app/build/libs/*.jar app.jar
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
