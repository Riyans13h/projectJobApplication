# JobFlow Backend - Authentication Module

## Overview

This is the authentication module for the JobFlow backend, built with Spring Boot, JWT, and PostgreSQL.

## Features

- ✅ User registration with validation
- ✅ User login with JWT tokens
- ✅ BCrypt password hashing
- ✅ JWT token generation and validation
- ✅ Spring Security configuration
- ✅ CORS support
- ✅ Global exception handling
- ✅ Request validation

## Tech Stack

- **Java**: 21
- **Framework**: Spring Boot 3.3.0
- **Build Tool**: Maven
- **Database**: PostgreSQL
- **Security**: Spring Security + JWT (JJWT)
- **ORM**: Spring Data JPA / Hibernate

## Project Structure

```
backend/
├── src/main/java/com/jobflow/
│   ├── JobflowApplication.java
│   ├── auth/
│   │   ├── controller/
│   │   │   └── AuthController.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   └── JwtService.java
│   │   ├── repository/
│   │   │   └── UserRepository.java
│   │   ├── entity/
│   │   │   └── User.java
│   │   ├── dto/
│   │   │   ├── RegisterRequest.java
│   │   │   ├── LoginRequest.java
│   │   │   └── AuthResponse.java
│   │   ├── security/
│   │   │   ├── SecurityConfig.java
│   │   │   └── JwtFilter.java
│   │   └── exception/
│   │       ├── AuthenticationException.java
│   │       ├── UserAlreadyExistsException.java
│   │       └── InvalidTokenException.java
│   └── common/
│       └── exception/
│           ├── GlobalExceptionHandler.java
│           └── ErrorResponse.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
│       └── V1__create_users.sql
├── pom.xml
├── Dockerfile
└── .env
```

## Setup Instructions

### Prerequisites

- Java 21
- Maven 3.8+
- PostgreSQL 14+

### 1. Clone Repository

```bash
cd /home/iiita/projectJobApplication/backend
```

### 2. Configure Database

Update `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/jobflow
    username: jobflow
    password: jobflow
```

Or set environment variables:
```bash
export DB_USERNAME=jobflow
export DB_PASSWORD=jobflow
```

### 3. Configure JWT Secret

Update `src/main/resources/application.yml` or set environment variable:

```bash
export JWT_SECRET_KEY=your-super-secret-key-change-this-in-production
```

### 4. Build Project

```bash
mvn clean install
```

### 5. Run Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Endpoints

### Base URL
```
http://localhost:8080/api
```

### 1. Register User

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Response (201 Created)**:
```json
{
  "userId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```

**Validation Rules**:
- First name: 2-50 characters, required
- Last name: 2-50 characters, required
- Email: valid email format, unique, required
- Password: minimum 8 characters, required
- Password must match confirmPassword

**Error Response (409 Conflict)**:
```json
{
  "timestamp": "2026-05-20T10:30:00",
  "status": 409,
  "message": "User with email john@example.com already exists",
  "error": "User Already Exists"
}
```

### 2. Login User

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK)**:
```json
{
  "userId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "timestamp": "2026-05-20T10:30:00",
  "status": 401,
  "message": "Invalid email or password",
  "error": "Authentication Failed"
}
```

### 3. Health Check

**Endpoint**: `GET /auth/health`

**Response (200 OK)**:
```
Auth service is running
```

## Using JWT Token

### Include Token in Requests

After receiving the token from login/register, include it in subsequent requests:

```bash
curl -H "Authorization: Bearer <your-token>" \
  http://localhost:8080/api/protected-endpoint
```

### Token Structure

The JWT token contains:
- **header**: Algorithm and token type
- **payload**: User ID, email, full name, issued time, expiration time
- **signature**: HMAC SHA-256 signed with secret key

### Token Expiration

- Default expiration: 24 hours (86400000 milliseconds)
- Configure in `application.yml`:

```yaml
jwt:
  expiration: 86400000  # in milliseconds
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON users(email);
```

## Security Features

### 1. Password Hashing
- Uses BCrypt with salt rounds for secure password storage
- Never stores plain text passwords

### 2. JWT Authentication
- Stateless authentication mechanism
- Token validated on every request
- Extractable claims: userId, email, fullName

### 3. Spring Security
- Method-level security support
- Request-level authorization
- CORS configuration for frontend integration

### 4. Exception Handling
- Global exception handler with proper HTTP status codes
- Validation error response with field-level details
- Consistent error response format

## Configuration

### CORS Settings

```yaml
spring:
  security:
    cors:
      allowed-origins: http://localhost:3000
      allowed-methods: GET,POST,PUT,DELETE,OPTIONS
      allowed-headers: "*"
      allow-credentials: true
```

### JWT Settings

```yaml
jwt:
  secret-key: your-secret-key-here
  expiration: 86400000  # 24 hours
```

## Testing with cURL

### Register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

## Docker Setup

### Build Docker Image

```bash
mvn clean install
docker build -t jobflow-backend:latest .
```

### Run Docker Container

```bash
docker run -p 8080:8080 \
  -e DB_USERNAME=jobflow \
  -e DB_PASSWORD=jobflow \
  -e JWT_SECRET_KEY=your-secret-key \
  jobflow-backend:latest
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_USERNAME | Database username | jobflow |
| DB_PASSWORD | Database password | jobflow |
| DB_URL | Database URL | jdbc:postgresql://localhost:5432/jobflow |
| JWT_SECRET_KEY | JWT signing secret | (must be set) |
| SERVER_PORT | Server port | 8080 |
| CORS_ALLOWED_ORIGINS | Allowed CORS origins | http://localhost:3000 |

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] OAuth2 integration (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Refresh token implementation
- [ ] User profile endpoints
- [ ] Role-based access control

## Troubleshooting

### JWT Token Expired
- Check if token is still valid using expiration time
- Request new token by logging in again

### Validation Errors
- Ensure all required fields are provided
- Follow field validation rules (min/max length, format)
- Check error response for specific field errors

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in application.yml
- Ensure database exists and is accessible

### CORS Issues
- Verify frontend URL is in allowed-origins
- Check preflight OPTIONS request
- Ensure credentials are set correctly

## License

This project is part of JobFlow - Job Application Management Platform.

## Next Steps

After authentication module setup:
1. Create Applications module
2. Create Contacts/CRM module
3. Create Interview tracking module
4. Integrate with frontend
