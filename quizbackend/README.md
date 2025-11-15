# Quiz Platform Backend

A comprehensive Spring Boot REST API for a quiz platform that allows professors to create quizzes and students/guests to participate.

## Features

### 🎯 Core Functionality
- **User Authentication**: JWT-based authentication for professors, students, and admins
- **Quiz Management**: Create, edit, delete, and manage quizzes with questions and responses
- **Participation System**: Students and guests can participate in quizzes
- **Role-based Access**: Different permissions for Admin, Professor, Student, and Guest users
- **Subscription Management**: Support for different professor subscription tiers

### 👥 User Roles
- **Admin**: Global system management, user oversight, subscription management
- **Professor**: Create and manage quizzes, view participation results
- **Student**: Participate in quizzes, view personal results
- **Guest**: Participate in quizzes without registration (temporary)

### 🛠️ Technology Stack
- **Backend**: Spring Boot 3.3.4
- **Database**: MySQL 8.0
- **Security**: Spring Security with JWT
- **ORM**: Spring Data JPA with Hibernate
- **Build Tool**: Maven
- **Java Version**: 17+

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Git

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd quizbackend
```

### 2. Database Setup
1. Install MySQL 8.0+
2. Create a database named `quiz_platform`:
```sql
CREATE DATABASE quiz_platform;
```

### 3. Configure Database Connection
Update `src/main/resources/application.properties`:
```properties
# Update these values according to your MySQL setup
spring.datasource.url=jdbc:mysql://localhost:3306/quiz_platform
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 4. Build and Run
```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080/api`

## Default Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@quizplatform.com`

### Default Subscriptions
1. **Free**: $0.00 for 30 days
2. **Premium**: $9.99 for 30 days  
3. **VIP**: $19.99 for 30 days

## API Documentation

The complete API documentation is available in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

### Quick Start Examples

#### 1. Admin Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### 2. Register a Professor
```bash
curl -X POST http://localhost:8080/api/auth/register/professor \
  -H "Content-Type: application/json" \
  -d '{
    "username":"prof1",
    "email":"prof1@test.com",
    "password":"password123",
    "firstName":"John",
    "lastName":"Doe"
  }'
```

#### 3. Create a Quiz
```bash
curl -X POST http://localhost:8080/api/quiz/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Math Quiz",
    "description":"Basic math questions",
    "duration":30
  }'
```

## Testing

### Automated Testing
Run the provided test script to verify the API functionality:
```bash
./test-api.sh
```

### Manual Testing
1. Start the application
2. Use the API documentation to test endpoints
3. Use tools like Postman or curl for API testing

## Project Structure

```
src/main/java/com/quizbackend/
├── config/                 # Configuration classes
├── controller/             # REST controllers
├── dto/                   # Data Transfer Objects
├── entity/                # JPA entities
├── exception/             # Exception handling
├── repository/            # Data repositories
├── security/              # Security configuration
└── service/               # Business logic services
```

## Key Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register/student` - Student registration
- `POST /auth/register/professor` - Professor registration

### Quiz Management
- `POST /quiz/create` - Create quiz (Professor)
- `GET /quiz/my-quizzes` - Get professor's quizzes
- `POST /quiz/{id}/questions` - Add question to quiz
- `GET /quiz/join/{code}` - Join quiz by code (Public)

### Admin
- `GET /admin/users/professors` - Get all professors
- `GET /admin/subscriptions` - Get all subscriptions
- `POST /admin/subscriptions` - Create subscription

## Database Schema

The application uses the following main entities:
- **User** (Base entity with inheritance)
- **Admin, Professor, Student** (User subclasses)
- **Guest** (Separate entity for non-registered users)
- **Quiz, Question, Response** (Quiz content)
- **Participation** (Quiz participation records)
- **Subscription** (Professor subscription plans)

## Security Features

- JWT-based authentication
- Role-based authorization
- Password encryption with BCrypt
- CORS configuration for frontend integration
- Input validation and error handling

## Development

### Adding New Features
1. Create entity classes in `entity/` package
2. Add repositories in `repository/` package
3. Implement business logic in `service/` package
4. Create REST endpoints in `controller/` package
5. Add validation using DTOs in `dto/` package

### Code Style
- Follow Spring Boot conventions
- Use Lombok for reducing boilerplate code
- Implement proper exception handling
- Add comprehensive validation

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `application.properties`
   - Ensure database `quiz_platform` exists

2. **Port Already in Use**
   - Change port in `application.properties`: `server.port=8081`

3. **JWT Token Issues**
   - Ensure JWT secret is at least 32 characters
   - Check token expiration settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository.
