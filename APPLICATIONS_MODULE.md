# JobFlow Backend - Applications Module

## Overview

This is the Applications module for the JobFlow backend. It handles job application tracking, status management, and filtering with pagination support.

## Features

- ✅ Create job applications
- ✅ Retrieve all applications with pagination
- ✅ Get specific application by ID
- ✅ Update application details
- ✅ Update application status
- ✅ Delete applications
- ✅ Filter by status, company, priority
- ✅ Advanced multi-criteria filtering
- ✅ Application statistics for dashboard
- ✅ User-level data isolation (JWT secured)
- ✅ Comprehensive validation

## Project Structure

```
backend/src/main/java/com/jobflow/applications/
├── controller/
│   └── ApplicationController.java
├── service/
│   └── ApplicationService.java
├── repository/
│   └── ApplicationRepository.java
├── entity/
│   └── Application.java
├── dto/
│   ├── CreateApplicationRequest.java
│   ├── UpdateApplicationRequest.java
│   ├── ApplicationResponse.java
│   └── ApplicationStatsResponse.java
├── mapper/
│   └── ApplicationMapper.java
├── enums/
│   ├── ApplicationStatus.java
│   ├── Priority.java
│   ├── WorkMode.java
│   └── EmploymentType.java
└── exception/
    ├── ApplicationNotFoundException.java
    └── UnauthorizedAccessException.java
```

## Database Schema

### Applications Table

```sql
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    job_id VARCHAR(100),
    location VARCHAR(255),
    work_mode VARCHAR(50),
    employment_type VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    application_date DATE NOT NULL,
    applied_through VARCHAR(255),
    email_used VARCHAR(255),
    phone_used VARCHAR(20),
    notes TEXT,
    cooldown_period INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Enums

### ApplicationStatus

```
APPLIED
OA_RECEIVED
OA_SUBMITTED
INTERVIEW_SCHEDULED
INTERVIEW_IN_PROGRESS
INTERVIEW_COMPLETED
OFFER_RECEIVED
REJECTED
WITHDRAWN
HOLD
```

### Priority

```
LOW
MEDIUM
HIGH
CRITICAL
```

### WorkMode

```
REMOTE
ONSITE
HYBRID
```

### EmploymentType

```
FULL_TIME
PART_TIME
CONTRACT
INTERNSHIP
FREELANCE
```

## API Endpoints

### Base URL
```
http://localhost:8080/api/applications
```

### Authorization
All endpoints (except health check) require JWT token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

---

### 1. Create Application

**Endpoint**: `POST /api/applications`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "companyName": "Google",
  "role": "Software Engineer",
  "jobId": "JOB123456",
  "location": "San Francisco, CA",
  "workMode": "HYBRID",
  "employmentType": "FULL_TIME",
  "status": "APPLIED",
  "priority": "HIGH",
  "applicationDate": "2026-05-20",
  "appliedThrough": "LinkedIn",
  "emailUsed": "john@example.com",
  "phoneUsed": "+1-555-0123",
  "notes": "Applied through referral from John Doe",
  "cooldownPeriod": 180
}
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "userId": 1,
  "companyName": "Google",
  "role": "Software Engineer",
  "jobId": "JOB123456",
  "location": "San Francisco, CA",
  "workMode": "HYBRID",
  "employmentType": "FULL_TIME",
  "status": "APPLIED",
  "priority": "HIGH",
  "applicationDate": "2026-05-20",
  "appliedThrough": "LinkedIn",
  "emailUsed": "john@example.com",
  "phoneUsed": "+1-555-0123",
  "notes": "Applied through referral from John Doe",
  "cooldownPeriod": 180,
  "createdAt": "2026-05-20T10:30:00",
  "updatedAt": "2026-05-20T10:30:00"
}
```

**Validation Rules**:
- companyName: Required, min 1 char
- role: Required, min 1 char
- status: Required
- applicationDate: Required

---

### 2. Get All Applications

**Endpoint**: `GET /api/applications?page=0&size=10`

**Query Parameters**:
- `page`: Page number (default: 0)
- `size`: Page size (default: 10)

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "content": [
    {
      "id": 1,
      "userId": 1,
      "companyName": "Google",
      "role": "Software Engineer",
      "status": "APPLIED",
      "priority": "HIGH",
      "applicationDate": "2026-05-20",
      "createdAt": "2026-05-20T10:30:00",
      "updatedAt": "2026-05-20T10:30:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": [],
    "offset": 0,
    "unpaged": false,
    "paged": true
  },
  "totalPages": 1,
  "totalElements": 1,
  "last": true,
  "size": 10,
  "number": 0,
  "sort": [],
  "numberOfElements": 1,
  "first": true,
  "empty": false
}
```

---

### 3. Get Application by ID

**Endpoint**: `GET /api/applications/{id}`

**Path Parameters**:
- `id`: Application ID

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "userId": 1,
  "companyName": "Google",
  "role": "Software Engineer",
  "jobId": "JOB123456",
  "location": "San Francisco, CA",
  "workMode": "HYBRID",
  "employmentType": "FULL_TIME",
  "status": "APPLIED",
  "priority": "HIGH",
  "applicationDate": "2026-05-20",
  "appliedThrough": "LinkedIn",
  "emailUsed": "john@example.com",
  "phoneUsed": "+1-555-0123",
  "notes": "Applied through referral",
  "cooldownPeriod": 180,
  "createdAt": "2026-05-20T10:30:00",
  "updatedAt": "2026-05-20T10:30:00"
}
```

**Error Response (404 Not Found)**:
```json
{
  "timestamp": "2026-05-20T10:35:00",
  "status": 404,
  "message": "Application not found with id: 999",
  "error": "Application Not Found"
}
```

---

### 4. Update Application

**Endpoint**: `PUT /api/applications/{id}`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body** (All fields optional):
```json
{
  "companyName": "Google",
  "role": "Senior Software Engineer",
  "priority": "CRITICAL",
  "notes": "Updated notes"
}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "userId": 1,
  "companyName": "Google",
  "role": "Senior Software Engineer",
  "priority": "CRITICAL",
  "notes": "Updated notes",
  "status": "APPLIED",
  "applicationDate": "2026-05-20",
  "createdAt": "2026-05-20T10:30:00",
  "updatedAt": "2026-05-20T10:35:00"
}
```

---

### 5. Update Application Status

**Endpoint**: `PATCH /api/applications/{id}/status?status=INTERVIEW_SCHEDULED`

**Query Parameters**:
- `status`: New application status (required)

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "userId": 1,
  "companyName": "Google",
  "status": "INTERVIEW_SCHEDULED",
  "priority": "HIGH",
  "updatedAt": "2026-05-20T10:40:00"
}
```

---

### 6. Delete Application

**Endpoint**: `DELETE /api/applications/{id}`

**Headers**:
```
Authorization: Bearer <token>
```

**Response (204 No Content)**

---

### 7. Filter by Status

**Endpoint**: `GET /api/applications/filter/status?status=APPLIED&page=0&size=10`

**Query Parameters**:
- `status`: ApplicationStatus enum value (required)
- `page`: Page number (default: 0)
- `size`: Page size (default: 10)

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**: Paginated list of applications with specified status

---

### 8. Filter by Company

**Endpoint**: `GET /api/applications/filter/company?company=Google&page=0&size=10`

**Query Parameters**:
- `company`: Company name (case-insensitive, partial match) (required)
- `page`: Page number (default: 0)
- `size`: Page size (default: 10)

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**: Paginated list of applications for specified company

---

### 9. Filter by Priority

**Endpoint**: `GET /api/applications/filter/priority?priority=HIGH&page=0&size=10`

**Query Parameters**:
- `priority`: Priority enum value (required)
- `page`: Page number (default: 0)
- `size`: Page size (default: 10)

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**: Paginated list of applications with specified priority

---

### 10. Advanced Multi-Filter

**Endpoint**: `GET /api/applications/filter?status=APPLIED&company=Google&priority=HIGH&page=0&size=10`

**Query Parameters**:
- `status`: ApplicationStatus (optional)
- `company`: Company name (optional, case-insensitive)
- `priority`: Priority (optional)
- `page`: Page number (default: 0)
- `size`: Page size (default: 10)

**Headers**:
```
Authorization: Bearer <token>
```

**Example**:
```bash
GET /api/applications/filter?status=APPLIED&company=Google&priority=HIGH&page=0&size=10
```

**Response (200 OK)**: Paginated list of applications matching all filters

---

### 11. Get Application Statistics

**Endpoint**: `GET /api/applications/stats`

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "totalApplications": 25,
  "appliedCount": 12,
  "oaReceivedCount": 5,
  "interviewScheduledCount": 4,
  "offersCount": 2,
  "rejectedCount": 2,
  "highPriorityCount": 8,
  "activeCooldownCount": 0
}
```

---

## cURL Examples

### Register and Get Token
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123"
  }'

# Save the token from response as:
TOKEN="your-token-here"
```

### Create Application
```bash
curl -X POST http://localhost:8080/api/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Google",
    "role": "Software Engineer",
    "jobId": "JOB123456",
    "location": "San Francisco",
    "workMode": "HYBRID",
    "employmentType": "FULL_TIME",
    "status": "APPLIED",
    "priority": "HIGH",
    "applicationDate": "2026-05-20",
    "appliedThrough": "LinkedIn"
  }'
```

### Get All Applications
```bash
curl -X GET "http://localhost:8080/api/applications?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Application by ID
```bash
curl -X GET "http://localhost:8080/api/applications/1" \
  -H "Authorization: Bearer $TOKEN"
```

### Update Application
```bash
curl -X PUT "http://localhost:8080/api/applications/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "CRITICAL",
    "notes": "Updated notes"
  }'
```

### Update Status
```bash
curl -X PATCH "http://localhost:8080/api/applications/1/status?status=INTERVIEW_SCHEDULED" \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Application
```bash
curl -X DELETE "http://localhost:8080/api/applications/1" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Status
```bash
curl -X GET "http://localhost:8080/api/applications/filter/status?status=APPLIED&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Company
```bash
curl -X GET "http://localhost:8080/api/applications/filter/company?company=Google&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Advanced Filter
```bash
curl -X GET "http://localhost:8080/api/applications/filter?status=APPLIED&company=Google&priority=HIGH" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Statistics
```bash
curl -X GET "http://localhost:8080/api/applications/stats" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "timestamp": "2026-05-20T10:30:00",
  "status": 400,
  "message": "Validation failed",
  "error": "Invalid Input",
  "validationErrors": {
    "companyName": "Company name is required",
    "role": "Role is required"
  }
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "timestamp": "2026-05-20T10:30:00",
  "status": 401,
  "message": "Invalid JWT token",
  "error": "Invalid Token"
}
```

### 403 Forbidden - Unauthorized Access
```json
{
  "timestamp": "2026-05-20T10:30:00",
  "status": 403,
  "message": "You do not have permission to access this application",
  "error": "Unauthorized Access"
}
```

### 404 Not Found
```json
{
  "timestamp": "2026-05-20T10:30:00",
  "status": 404,
  "message": "Application not found with id: 999",
  "error": "Application Not Found"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2026-05-20T10:30:00",
  "status": 500,
  "message": "An unexpected error occurred",
  "error": "Internal Server Error"
}
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page`: Zero-based page number (default: 0)
- `size`: Page size (default: 10)

**Response Format**:
```json
{
  "content": [...],
  "pageable": {...},
  "totalPages": 5,
  "totalElements": 45,
  "last": false,
  "size": 10,
  "number": 0,
  "numberOfElements": 10,
  "first": true,
  "empty": false
}
```

---

## Security Features

### User Data Isolation
- Users can only access their own applications
- JWT token userId is extracted and used for all queries
- No cross-user data access possible

### Authorization
- All endpoints require valid JWT token
- Token must be included in `Authorization: Bearer <token>` header

### Validation
- Request validation with detailed error messages
- Field-level validation annotations
- Enum validation for status/priority

---

## Implementation Notes

### Constructor Injection
All components use constructor injection with `@RequiredArgsConstructor` from Lombok:
```java
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper applicationMapper;
}
```

### Service Layer
- Handles all business logic
- User isolation checks
- Exception handling
- Transactional operations

### Controller Layer
- Extracts userId from JWT token
- Delegates to service
- Returns appropriate HTTP status codes

### Repository Layer
- Custom query methods for filtering
- Pagination support
- Performance indexes on common queries

---

## Next Steps

1. Create Interview Tracking Module
2. Create Contacts/CRM Module
3. Create Timeline Module
4. Create Dashboard Analytics Module
5. Create Cooldown Tracking Module
6. Integrate with Frontend (Next.js)

---

## Troubleshooting

### "Unauthorized Access" Error
- Verify JWT token is valid and not expired
- Check token is included in Authorization header
- Ensure application belongs to authenticated user

### "Application Not Found" Error
- Verify application ID exists
- Check application belongs to authenticated user
- Confirm application hasn't been deleted

### Pagination Issues
- Page numbering starts from 0
- Size parameter must be > 0
- totalPages shows actual number of pages available

---

## License

This project is part of JobFlow - Job Application Management Platform.
