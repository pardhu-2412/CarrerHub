# CareerHub – Career Intelligence Platform (MVP)

CareerHub is a centralized career management platform designed for students and fresh graduates to organize and track their placement journey from job discovery to application tracking and interview management.

## 🚀 Technology Stack

- **Backend**: Java 17, Spring Boot 3.3.1, Spring Security, Spring Data JPA, Hibernate, JWT, Lombok, Spring Scheduling
- **Frontend**: React 18, Vite, React Router DOM, Axios, Vanilla HSL CSS
- **Database**: H2 (In-Memory for zero-config startup, default) / MySQL 8.0 (Ready-to-use profile)

---

## 🛠️ Prerequisites

- **Java**: JDK 17 (or higher) installed.
- **Node.js**: Node 18+ and NPM 10+ installed.

---

## 🏃 Getting Started

### 1. Run the Backend REST API

Navigate to the `backend` folder and run the Spring Boot application using the Maven Wrapper:

```bash
cd backend
# On Windows PowerShell:
.\mvnw.cmd spring-boot:run

# On macOS/Linux:
./mvnw spring-boot:run
```

- The API server will start on [http://localhost:8080](http://localhost:8080).
- The H2 Web Console is accessible at [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:careerhubdb`, Username: `sa`, password: `<blank>`).
- Database tables are automatically generated, and sample jobs, students, and application statuses are seeded upon startup.

### 2. Run the Frontend React App

Open a new terminal, navigate to the `frontend` folder, and start the Vite development server:

```bash
cd frontend
npm install   # If dependencies are not loaded
npm run dev
```

- Access the React web client at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Default Accounts (Seeded Data)

For demonstration and testing purposes, the application automatically seeds two users:

### Student Account (Candidate View)
- **Username**: `student`
- **Password**: `student123`
- **Role**: Student Candidate
- *Includes: pre-populated skills profile, 4 active tracked applications on the Kanban board, 1 upcoming interview round, and past analytics trend data.*

### Coordinator Account (Admin View)
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Placement Admin
- *Includes: access to the Admin Panel to create, edit, or delete job listings.*

---

## 📋 Features Walkthrough

1. **Authentication**: Secure registration and JWT-based session storage.
2. **Dashboard**: View key metrics (Offer Rate, Interview Rate) and responsive SVG charts tracking monthly applications and status distributions.
3. **Application Kanban**: Move applications dynamically across columns (Applied, In Progress, Interviewing, Offered, Rejected) with button triggers.
4. **Resume Manager**: Binary document uploads, set default labels, secure download streams, and automatic linking to applications.
5. **Interview Scheduler**: Calendar logs, platform settings (Google Meet, Zoom), meeting links, and note fields.
6. **Background Email Reminders**: Scheduled scanner task that checks for interviews happening in the next 24 hours and prints a mock SMTP message to the console and generates in-app notifications.
7. **Profile Management**: Profile summary cards, skills chip listings, and social link bindings.
8. **Admin Panel**: Portal for coordinators to post or delete active job listings.
