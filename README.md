# 🎓 Student Life Toolkit - Backend API

A comprehensive REST API backend for student life management, built with **Express.js**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**. This project features AI-powered study analytics, focus sessions, and comprehensive learning tracking.

## 🚀 Features

### 📚 Core Modules

- **Authentication System** - JWT-based secure authentication
- **Class Schedule Management** - Organize and track academic classes
- **Budget Tracking** - Monitor income and expenses
- **Exam & Q&A System** - AI-powered question generation with Gemini AI
- **Study Planning** - Task-based study organization
- **Note Management** - Create and share study notes
- **Study Groups** - Collaborative learning platform

### 🧠 AI-Powered Learning Features

- **Subject/Course Management** - Track subjects with semester support
- **Study Session Tracking** - Monitor time spent studying
- **Focus Mode Sessions** - Pomodoro, Deep Work, and custom focus modes
- **AI Study Analytics** - Gemini AI-powered session analysis and report cards
- **Notes Validation** - AI validation to ensure actual reading comprehension
- **Codeforces-style Streaks** - Gamified study tracking
- **Reading Material Management** - AI topic extraction from uploaded content

## 🛠️ Technology Stack

- **Runtime**: Node.js v14+
- **Framework**: Express.js v4.21.2
- **Language**: TypeScript v5.7.3
- **Database**: PostgreSQL with Prisma ORM v6.2.1
- **AI Integration**: Google Gemini AI
- **Validation**: Zod
- **Authentication**: JWT
- **Rate Limiting**: Express Rate Limit
- **CORS**: Enabled for cross-origin requests

## 🏗️ Architecture

### Clean Modular Architecture

- **Module-based structure** instead of traditional MVC
- **Service Layer Pattern** for business logic separation
- **Controller Layer** for request/response handling
- **Validation Layer** with Zod schemas
- **Shared Utilities** for common operations

## 🚦 Getting Started

### Prerequisites

```bash
Node.js v14+
PostgreSQL
npm or yarn
```

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd studentToolKit/server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Configure your database and API keys

# Setup database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://studenttoolkit:studenttoolkit@localhost:5432/studenttoolkit"
JWT_SECRET="your-jwt-secret"
GEMINI_API_KEY="your-gemini-api-key"
PORT=5000
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

---

## 🔐 Authentication Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token"
  }
}
```

---

## 📅 Class Management Endpoints

### Create Class

```http
POST /classes
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Computer Science",
  "instructor": "Dr. Smith",
  "dayOfWeek": "Monday",
  "startTime": "09:00",
  "endTime": "11:00",
  "location": "Room 101",
  "color": "#3B82F6",
  "description": "Advanced algorithms course"
}
```

### Get All Classes

```http
GET /classes
Authorization: Bearer <token>
```

### Update Class

```http
PATCH /classes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": "Room 205",
  "startTime": "10:00"
}
```

### Delete Class

```http
DELETE /classes/:id
Authorization: Bearer <token>
```

---

## 💰 Budget Management Endpoints

### Create Budget Entry

```http
POST /budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Monthly Allowance",
  "amount": 500.00,
  "type": "INCOME",
  "category": "Allowance",
  "description": "Monthly allowance from parents",
  "date": "2024-01-01T00:00:00.000Z"
}
```

### Get Budget Entries

```http
GET /budgets?page=1&limit=10&type=INCOME&category=Food
Authorization: Bearer <token>
```

### Get Budget Analytics

```http
GET /budgets/analytics?period=month
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalIncome": 1500.0,
    "totalExpenses": 800.0,
    "balance": 700.0,
    "categoryBreakdown": [
      {
        "category": "Food",
        "amount": 300.0,
        "percentage": 37.5
      }
    ]
  }
}
```

---

## 📝 Exam & Q&A Endpoints (AI-Powered)

### Create Exam Question

```http
POST /exams/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Mathematics",
  "question": "What is the derivative of x²?",
  "questionType": "MCQ",
  "difficulty": "MEDIUM",
  "options": ["2x", "x", "2", "x²"],
  "correctAnswer": "2x",
  "explanation": "Using the power rule: d/dx(x²) = 2x"
}
```

### Generate AI Questions

```http
POST /exams/questions/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Computer Science",
  "topic": "Data Structures",
  "questionType": "MCQ",
  "difficulty": "HARD",
  "count": 5
}
```

### Get Questions with Filters

```http
GET /exams/questions?subject=Mathematics&difficulty=MEDIUM&questionType=MCQ&page=1&limit=10
Authorization: Bearer <token>
```

---

## 📋 Study Planning Endpoints

### Create Study Plan

```http
POST /study-plans
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Final Exam Preparation",
  "subject": "Computer Science",
  "description": "Comprehensive study plan for CS final exam",
  "priority": "HIGH",
  "deadline": "2024-12-15T23:59:59.000Z",
  "estimatedHours": 40
}
```

### Add Study Task

```http
POST /study-plans/:planId/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Review Data Structures",
  "description": "Go through all data structure concepts",
  "dueDate": "2024-12-10T23:59:59.000Z"
}
```

### Update Task Status

```http
PATCH /study-plans/:planId/tasks/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true
}
```

---

## 📓 Notes Management Endpoints

### Create Note

```http
POST /notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Algorithm Complexity",
  "content": "Big O notation measures algorithm efficiency...",
  "subject": "Computer Science",
  "tags": ["algorithms", "complexity", "big-o"],
  "isPublic": false
}
```

### Search Notes

```http
GET /notes?search=algorithm&subject=Computer Science&tags=complexity&page=1&limit=10
Authorization: Bearer <token>
```

### Share Note with Study Group

```http
PATCH /notes/:id/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "studyGroupId": "group-uuid",
  "isPublic": true
}
```

---

## 👥 Study Groups Endpoints

### Create Study Group

```http
POST /study-groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "CS Final Exam Group",
  "description": "Study group for computer science final exam",
  "subject": "Computer Science",
  "isPublic": true,
  "maxMembers": 10
}
```

### Join Study Group

```http
POST /study-groups/:id/join
Authorization: Bearer <token>
```

### Get Group Members

```http
GET /study-groups/:id/members
Authorization: Bearer <token>
```

---

## 🎯 Subject & Course Management (Advanced Learning Features)

### Create Subject/Course

```http
POST /subjects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Advanced Machine Learning",
  "code": "CS590",
  "type": "COURSE",
  "description": "Graduate level ML course",
  "credits": 3,
  "instructor": "Dr. Johnson",
  "semester": "Fall 2024",
  "semesterStart": "2024-08-26T00:00:00.000Z",
  "semesterEnd": "2024-12-15T00:00:00.000Z",
  "duration": "FOUR_MONTHS",
  "nextExamDate": "2024-12-10T09:00:00.000Z",
  "examType": "Final",
  "isExamImportant": true,
  "targetHoursPerWeek": 8,
  "color": "#8B5CF6"
}
```

### Get Subjects with Filters

```http
GET /subjects?type=COURSE&semester=Fall 2024&isArchived=false&hasUpcomingExam=true&search=machine&page=1&limit=10
Authorization: Bearer <token>
```

### Get Subject Analytics

```http
GET /subjects/:id/analytics?period=week
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "subject": {
      "id": "uuid",
      "name": "Advanced Machine Learning",
      "totalHoursStudied": 45.5
    },
    "weeklyProgress": {
      "totalHours": 12.5,
      "targetHours": 8,
      "progressPercentage": 156.25,
      "dailyBreakdown": [
        {
          "date": "2024-01-01",
          "hours": 2.5
        }
      ]
    },
    "overallProgress": {
      "totalHoursStudied": 45.5,
      "averageSessionDuration": 1.8,
      "totalSessions": 25,
      "averageProductivity": 8.2
    },
    "upcomingEvents": [
      {
        "type": "exam",
        "date": "2024-12-10T09:00:00.000Z",
        "description": "Final - Advanced Machine Learning"
      }
    ]
  }
}
```

---

## ⏱️ Study Session Tracking

### Create Study Session

```http
POST /subjects/study-sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "subjectId": "subject-uuid",
  "startTime": "2024-01-01T09:00:00.000Z",
  "endTime": "2024-01-01T11:00:00.000Z",
  "notes": "Studied neural networks and backpropagation",
  "productivity": 8
}
```

### Get Study Sessions

```http
GET /subjects/study-sessions?subjectId=uuid&startDate=2024-01-01&endDate=2024-01-07&page=1&limit=10
Authorization: Bearer <token>
```

### Update Study Session

```http
PATCH /subjects/study-sessions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "endTime": "2024-01-01T11:30:00.000Z",
  "notes": "Extended session to cover more concepts",
  "productivity": 9
}
```

---

## 🎯 Focus Mode Sessions

### Create Focus Session

```http
POST /subjects/focus-sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "subjectId": "subject-uuid",
  "mode": "POMODORO",
  "title": "Deep Learning Study Session",
  "description": "Focus on convolutional neural networks"
}
```

### Focus Session Actions

```http
# Start focus session
POST /subjects/focus-sessions/:id/start
Authorization: Bearer <token>

# Pause focus session
POST /subjects/focus-sessions/:id/pause
Authorization: Bearer <token>

# Resume focus session
POST /subjects/focus-sessions/:id/resume
Authorization: Bearer <token>

# Complete focus session
POST /subjects/focus-sessions/:id/complete
Authorization: Bearer <token>

# Cancel focus session
POST /subjects/focus-sessions/:id/cancel
Authorization: Bearer <token>
```

### Focus Mode Types

- **POMODORO**: 25min focus, 5min break
- **DEEP_WORK**: 90min focus, 20min break
- **MARATHON**: 120min focus, 30min break
- **CUSTOM**: User-defined durations

---

## 📊 Time Tracking & Analytics

### Get Time Tracking Report

```http
GET /subjects/analytics/time-tracking?period=week&startDate=2024-01-01&endDate=2024-01-07&subjectId=uuid
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "daily": [
      {
        "date": "2024-01-01",
        "totalHours": 4.5,
        "sessions": 3,
        "subjects": [
          {
            "subjectId": "uuid",
            "subjectName": "Machine Learning",
            "hours": 2.5,
            "color": "#8B5CF6"
          }
        ]
      }
    ],
    "weekly": {
      "totalHours": 28.5,
      "averagePerDay": 4.07,
      "mostStudiedSubject": {
        "id": "uuid",
        "name": "Machine Learning",
        "hours": 12.5
      },
      "leastStudiedSubject": {
        "id": "uuid",
        "name": "Statistics",
        "hours": 3.2
      }
    },
    "monthly": {
      "totalHours": 115.5,
      "averagePerWeek": 28.87,
      "progressTrend": "increasing",
      "monthlyGoalProgress": 85.2
    }
  }
}
```

### Dashboard Overview

```http
GET /subjects/dashboard/overview
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "activeSubjects": [...],
    "todaysSessions": [...],
    "activeFocusSessions": [...],
    "upcomingExams": [...],
    "weeklyProgress": {
      "totalHours": 28.5,
      "averagePerDay": 4.07,
      "mostStudiedSubject": {...}
    },
    "stats": {
      "totalSubjects": 6,
      "todayHours": 4.5,
      "activeFocusSessionsCount": 1,
      "upcomingExamsCount": 3
    }
  }
}
```

---

## 🧠 AI-Powered Learning Features

### Upload Reading Material

```http
POST /learning/materials
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction to Neural Networks",
  "description": "Comprehensive guide to understanding neural networks",
  "type": "PDF",
  "fileUrl": "https://example.com/neural-networks.pdf",
  "subjectId": "subject-uuid"
}
```

### AI Topic Extraction

```http
POST /learning/materials/:id/process-ai
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "topics": ["Neural Networks", "Backpropagation", "Gradient Descent"],
    "keyPoints": ["Mathematical foundations", "Implementation details"],
    "difficulty": "MEDIUM",
    "estimatedReadTime": 45,
    "summary": "Comprehensive introduction to neural network concepts..."
  }
}
```

### Generate Study Report

```http
POST /learning/reports/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "STUDY_SESSION",
  "title": "Neural Networks Study Session Report",
  "sessionDuration": 120,
  "sessionDate": "2024-01-01T09:00:00.000Z",
  "subjectId": "subject-uuid",
  "studySessionId": "session-uuid"
}
```

### Upload Notes for AI Validation

```http
POST /learning/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Neural Networks Summary",
  "content": "Neural networks are computational models inspired by biological neural networks...",
  "subjectId": "subject-uuid",
  "readingMaterialId": "material-uuid"
}
```

### AI Notes Validation

```http
POST /learning/notes/:id/validate
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "comprehensionScore": 85,
    "completenessScore": 78,
    "accuracyScore": 92,
    "missingTopics": ["Convolutional layers", "Dropout techniques"],
    "suggestions": ["Add more examples", "Include mathematical formulas"],
    "feedback": "Good understanding demonstrated, but could benefit from more technical depth",
    "coveragePercentage": 75
  }
}
```

### Learning Streaks

```http
POST /learning/streaks
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "DAILY_STUDY",
  "title": "Daily Study Streak",
  "description": "Study at least 2 hours every day",
  "targetValue": 2,
  "targetUnit": "hours",
  "subjectId": "subject-uuid"
}
```

### Add Streak Entry

```http
POST /learning/streaks/:id/entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-01",
  "value": 2.5,
  "goalMet": true,
  "notes": "Productive study session on neural networks"
}
```

### Learning Dashboard

```http
GET /learning/dashboard
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overallStats": {
      "totalReadingMaterials": 15,
      "totalStudyReports": 25,
      "totalNotesUploaded": 30,
      "averageComprehensionScore": 82.5,
      "totalStudyTime": 156.5
    },
    "currentStreaks": [...],
    "recentReports": [...],
    "weeklyProgress": {
      "studyHours": 28.5,
      "materialsRead": 5,
      "notesValidated": 8,
      "averageScores": {
        "comprehension": 85,
        "focus": 78,
        "productivity": 82
      }
    },
    "aiInsights": {
      "strongSubjects": ["Machine Learning", "Statistics"],
      "weakSubjects": ["Linear Algebra"],
      "recommendedFocus": ["Practice more problems", "Review fundamentals"],
      "learningTrends": ["Improving comprehension", "Consistent study habits"]
    }
  }
}
```

---

## 📊 Standard Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "meta": {
    // Pagination info (when applicable)
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

---

## 🔒 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer your-jwt-token-here
```

---

## 📈 Rate Limiting

- **Standard endpoints**: 100 requests per 15 minutes
- **AI endpoints**: 10 requests per minute (due to API costs)

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 🎯 AI Integration

This project showcases advanced AI integration using **Google Gemini AI** for:

- **Automatic Question Generation** for exams
- **Study Session Analysis** and report card generation
- **Notes Validation** to ensure reading comprehension
- **Topic Extraction** from uploaded materials
- **Personalized Study Recommendations**

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎉 Showcase Highlights

✅ **Comprehensive Learning Management System** with AI integration  
✅ **Clean Architecture** with modular design patterns  
✅ **AI-Powered Features** using Google Gemini AI  
✅ **Advanced Time Tracking** with focus modes and analytics  
✅ **Gamified Learning** with Codeforces-style streaks  
✅ **Real-time Study Analytics** and personalized insights  
✅ **Code Quality Excellence** with recent refactoring achievements  
✅ **Scalable Backend** ready for production deployment

---

_Built with ❤️ using Express.js, TypeScript, PostgreSQL, and AI_
