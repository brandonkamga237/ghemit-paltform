# Build : compilation du jar Spring Boot (tests exclus, nécessitent une BDD)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle
COPY domain/build.gradle domain/
COPY application/build.gradle application/
COPY infrastructure/build.gradle infrastructure/
COPY bootstrap/build.gradle bootstrap/
COPY domain/src domain/src
COPY application/src application/src
COPY infrastructure/src infrastructure/src
COPY bootstrap/src bootstrap/src
RUN chmod +x gradlew && ./gradlew :bootstrap:bootJar -x test --no-daemon

# Runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd -r spring
COPY --from=build /app/bootstrap/build/libs/*.jar app.jar
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
