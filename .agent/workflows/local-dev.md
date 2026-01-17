---
description: How to start the entire development environment (Backend, Frontend, Database)
---

# Local Development Setup

Follow these steps to get the full stack running locally.

## 1. Start the Database
The project uses PostgreSQL which is configured in `docker-compose.yml`.
// turbo
```bash
docker-compose up -d db
```

## 2. Start the Backend (Spring Boot)
Wait for the database to be ready, then start the Java backend.
// turbo
```bash
cd financial-tracker && ./mvnw spring-boot:run
```
> [!NOTE]
> The backend runs on `http://localhost:8082` by default.

## 3. Start the Frontend (Vite + React)
In a separate terminal, start the development server for the frontend.
// turbo
```bash
cd financial-tracker-frontend && npm install && npm run dev
```
> [!TIP]
> The frontend will be accessible at `http://localhost:5173`.

## 4. Verify Connection
Open `http://localhost:5173` in your browser. You should be greeted with the login page.
