# Series Locker API

A **production-ready Node.js backend API** for Series Locker, a series tracking and management application. Built with **Express.js**, **MongoDB**, and **JWT authentication**.[1]

**Live API:** `https://series-locker-api.onrender.com`

**Frontend Repository:** [Series-Locker-App](https://github.com/AmmarAlhmoud/Series-Locker-App)

**Live Application:** [https://series-locker.netlify.app](https://series-locker.netlify.app)

***

## Features

- **User Authentication** with JWT tokens and secure password hashing[2]
- **Series Management** — Create, read, update, delete series entries[3]
- **Advanced Filtering & Search** — Filter by name, country, date with pagination[4]
- **Email Services** — Automated welcome and password reset notifications[5]
- **Password Reset** — Secure token-based password recovery
- **Error Handling** — Centralized error management[6]
- **Protected Routes** — Authentication middleware for secure endpoints

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js v20 LTS |
| **Framework** | Express.js v4.21.1 |
| **Database** | MongoDB with Mongoose v8.0.3 |
| **Authentication** | JWT (jsonwebtoken) |
| **Security** | bcrypt, Helmet, CORS, rate-limiting |
| **Email** | Nodemailer + SendGrid |
| **Validation** | Custom error handling |

***

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB (local or Atlas)
- SendGrid account (optional, for production emails)

### Installation

```bash
# Clone repository
git clone https://github.com/AmmarAlhmoud/Series-Locker-API.git
cd Series-Locker-API

# Install dependencies
npm install

# Copy environment variables
cp config.env.example config.env

# Edit config.env with your credentials
```

### Running Locally

```bash
# Development with hot reload
npm run dev

# Production
npm start

# Server runs on: http://localhost:8000
```

***

## Environment Variables

```env
NODE_ENV=production
PORT=8000

# Database
DATABASE=mongodb+srv://username:<PASSWORD>@cluster.mongodb.net/series-locker
DATABASE_PASSWORD=your_password_here
DATABASE_LOCAL=mongodb://localhost:27017/series-locker

# Authentication
JWT_COOKIE_EXPIRES_IN=7
SECRET_KEY=your_jwt_secret_key_minimum_32_characters
SECRET_EXPIRES_IN=7d

# Email
From_Email=noreply@serieslocker.com
HOST_URL=https://series-locker.netlify.app
SENDGRID_USERNAME=your_sendgrid_email@example.com
SENDGRID_PASSWORD=SG.your_sendgrid_api_key
```

***

## API Endpoints

### Authentication[2]

- `POST /api/users/signup` — Register new user
- `POST /api/users/login` — User login
- `GET /api/users/logout` — User logout
- `POST /api/users/forgotPassword` — Request password reset
- `PATCH /api/users/resetPassword/:token` — Reset password

### Series Management[3]

- `GET /api/series` — Get all series (with filtering, search, pagination)[4]
- `POST /api/series` — Create new series
- `GET /api/series/:id` — Get specific series
- `PATCH /api/series/:id` — Update series
- `DELETE /api/series/:id` — Delete series

### Query Parameters[4]

```bash
# Search
GET /api/series?search=Breaking

# Filter
GET /api/series?country=USA&watchingType=Watched

# Sort
GET /api/series?sort=-createdAt

# Pagination
GET /api/series?page=1

# Select fields
GET /api/series?fields=name,country
```

***

## Request Examples

### Sign Up

```bash
POST /api/users/signup
Content-Type: application/json

{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "passwordConfirm": "SecurePass123!"
}
```

### Create Series

```bash
POST /api/series
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Breaking Bad",
  "country": "USA",
  "watchingType": "Watched",
  "url": "https://www.imdb.com/title/tt0903747/"
}
```

***

## Project Structure

```
Series-Locker-API/
├── Controllers/          # Business logic
├── Models/               # Mongoose schemas
├── Routes/               # API endpoints
├── Utils/                # Helpers (filtering, email, errors)
├── views/                # Email templates (Pug)
├── server.js             # Entry point
├── app.js                # Express config
└── config.env            # Environment variables
```

***

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- CORS protection
- Rate limiting
- Data sanitization (XSS, NoSQL injection)
- HTTP security headers (Helmet)

***

## Deployment

Deploy to Render with Node v20.11.1 and configure environment variables.[1]

***
## License
This project is licensed under the ISC License — see LICENSE file for details.​
***
**Built with ❤️ by Ammar Alhmoud** — Series tracking made simple.