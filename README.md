# EduGest 360

EduGest 360 is a full-stack educational management platform designed to
centralize and simplify academic and administrative management.

The project is composed of a React frontend and a Node.js/Express.js backend,
with a layered backend architecture designed to support future database
integration and scalable development.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Backend](#backend)
- [Backend Architecture](#backend-architecture)
- [API Endpoints](#api-endpoints)
- [Frontend](#frontend)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Git Workflow](#git-workflow)
- [Conventional Commits](#conventional-commits)
- [Development Guidelines](#development-guidelines)
- [Project Status](#project-status)

---

## Project Overview

EduGest 360 aims to provide a centralized platform for managing educational
activities and academic information.

The platform is being developed as a full-stack web application with a
separate frontend and backend.

### Main Components

- Frontend web application
- Backend REST API
- Authentication and authorization
- Student management
- Teacher management
- Course management
- Academic management
- Attendance management
- Notifications
- Future database integration

---

## Technologies

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend

- Node.js
- Express.js
- JavaScript
- REST API

### Development Tools

- Git
- GitHub
- npm
- VS Code
- Postman / REST Client

---

## Project Structure

```text
EDUGEST 360/
│
├── Backend/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   │
│   └── src/
│       ├── app.js
│       ├── server.js
│       │
│       ├── controllers/
│       │   └── test.controller.js
│       │
│       ├── middlewares/
│       │   ├── logger.js
│       │   └── errorHandler.js
│       │
│       ├── routes/
│       │   └── test.routes.js
│       │
│       ├── services/
│       │   └── welcome.service.js
│       │
│       └── utils/
│           └── response.js
│
├── Frontend/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   │
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── main.jsx
│       └── assets/
│
├── docs/
└── README.md