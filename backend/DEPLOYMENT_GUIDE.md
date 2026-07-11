# CareerHub Backend — Render Deployment Guide

Follow this guide to deploy the Spring Boot backend to Render using Docker and a production MySQL database.

## 1. Setup Database
Ensure you have a running MySQL database instance. You can create one on Render, Clever Cloud, Aiven, or AWS RDS.

## 2. Render Web Service Settings
When creating the Web Service on Render:
1. **Repository**: Link your repository.
2. **Environment**: Select `Docker`.
3. **Docker Context**: Set the context to `backend` (if you deploy the backend directory alone) or set **Docker Path** to `./backend/Dockerfile`.

## 3. Environment Variables
Add the following key-value pairs in the **Environment** tab of your Render Web Service settings:

| Variable Name | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | **Yes** | `prod` | Activates the `application-prod.properties` configuration for MySQL datasource and security settings. |
| `SPRING_DATASOURCE_URL` | **Yes** | `jdbc:mysql://<mysql-host>:3306/<db-name>?useSSL=true&allowPublicKeyRetrieval=true` | JDBC URL for connecting to your MySQL instance. |
| `SPRING_DATASOURCE_USERNAME` | **Yes** | `db_user_example` | Database authentication username. |
| `SPRING_DATASOURCE_PASSWORD` | **Yes** | `db_pass_secure_123` | Database authentication password. |
| `JWT_SECRET` | **Yes** | `dGhpcy1pcy1hLXNlY3VyZS1zZWNyZXQta2V5LXRvLWJlLXVzZWQtZm9yLWNhcmVlcmh1Yi1tdnAtYXBwbGljYXRpb24=` | Secret key (base64-encoded, min 256 bits) used to sign and verify user JWT sessions. |
| `PORT` | No | `8080` | Bind port (Render sets this dynamically, and Spring Boot reads it from the environment). |

---

## 4. Local Development Fallback
Local runs do not require setting environment variables. Running:
```bash
.\mvnw.cmd spring-boot:run
```
will automatically fall back to the default profile, which uses:
- In-memory H2 database (`jdbc:h2:mem:careerhubdb`).
- Embedded H2 Console on `http://localhost:8080/h2-console`.
- Hardcoded secure JWT key fallback.
