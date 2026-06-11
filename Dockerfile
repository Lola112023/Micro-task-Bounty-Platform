# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend JAR (with frontend dist embedded)
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY backend/ /app/backend/
WORKDIR /app/backend
RUN chmod +x mvnw && ./mvnw package -DskipTests -B

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/target/TaskBountyPlatform-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
