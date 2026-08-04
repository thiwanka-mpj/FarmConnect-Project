# ---- Build stage ----
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /build

COPY docker-maven-settings.xml /root/.m2/settings.xml

COPY pom.xml ./pom.xml
COPY discovery-service/pom.xml ./discovery-service/pom.xml
COPY config-server/pom.xml ./config-server/pom.xml
COPY api-gateway/pom.xml ./api-gateway/pom.xml
COPY user-service/pom.xml ./user-service/pom.xml
COPY product-service/pom.xml ./product-service/pom.xml
COPY order-service/pom.xml ./order-service/pom.xml
COPY admin-service/pom.xml ./admin-service/pom.xml
RUN mvn -q -pl config-server -am dependency:go-offline

COPY config-server/src ./config-server/src
WORKDIR /build/config-server
RUN mvn -q clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /build/config-server/target/*.jar app.jar
RUN chown spring:spring app.jar
USER spring

EXPOSE 8888
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
    CMD wget -qO- http://localhost:8888/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
