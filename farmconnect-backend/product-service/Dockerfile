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
RUN mvn -q -pl product-service -am dependency:go-offline

COPY product-service/src ./product-service/src
WORKDIR /build/product-service
RUN mvn -q clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /build/product-service/target/*.jar app.jar
# Product images are uploaded to this volume-mounted directory at runtime
RUN mkdir -p /app/uploads/products && chown -R spring:spring /app
USER spring

EXPOSE 8082
ENV JAVA_OPTS=""

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:8082/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
