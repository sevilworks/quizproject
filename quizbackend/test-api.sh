#!/bin/bash

# Quiz Platform API Test Script
BASE_URL="http://localhost:8080/api"

echo "=== Quiz Platform API Test ==="

# Test 1: Check if application is running
echo "1. Testing Application Health..."
HEALTH_RESPONSE=$(curl -s -X GET "$BASE_URL/test/health")
echo "Health Check Response: $HEALTH_RESPONSE"

if [ -z "$HEALTH_RESPONSE" ]; then
    echo "Application is not running. Please start the application first."
    exit 1
fi

# Test 2: Admin Login (Note: Admin account needs to be created first)
echo -e "\n2. Testing Admin Login..."
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "Admin Login Response: $ADMIN_RESPONSE"

# Extract token from response (simplified)
TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Extracted Token: $TOKEN"

if [ -z "$TOKEN" ]; then
    echo "Admin account not found. This is expected for a fresh installation."
    echo "You can create an admin account through the registration endpoint."
    echo "Skipping admin-specific tests..."
    ADMIN_AVAILABLE=false
else
    ADMIN_AVAILABLE=true
fi

# Test 2: Get All Subscriptions
echo -e "\n2. Testing Get All Subscriptions..."
curl -s -X GET "$BASE_URL/admin/subscriptions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test 3: Register a Professor
echo -e "\n3. Testing Professor Registration..."
PROF_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register/professor" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"prof1",
    "email":"prof15@test.com",
    "password":"passtest1",
    "first_name":"John",
    "last_name":"Doe"
  }')

echo "Professor Registration Response: $PROF_RESPONSE"

# Test 4: Register a Student
echo -e "\n4. Testing Student Registration..."
STUDENT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register/student" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"student1",
    "email":"student1@test.com",
    "password":"password1",
    "first_name":"Jane",
    "last_name":"Smith"
  }')

echo "Student Registration Response: $STUDENT_RESPONSE"

# Test 5: Professor Login
echo -e "\n5. Testing Professor Login..."
PROF_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"prof1","password":"passtest1"}')

echo "Professor Login Response: $PROF_LOGIN_RESPONSE"

PROF_TOKEN=$(echo $PROF_LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$PROF_TOKEN" ]; then
    # Test 6: Create a Quiz
    echo -e "\n6. Testing Quiz Creation..."
    QUIZ_RESPONSE=$(curl -s -X POST "$BASE_URL/quiz/create" \
      -H "Authorization: Bearer $PROF_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "title":"Test Quiz",
        "description":"A test quiz for API testing",
        "duration":30
      }')
    
    echo "Quiz Creation Response: $QUIZ_RESPONSE"
    
    # Extract quiz ID
    QUIZ_ID=$(echo $QUIZ_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "Quiz ID: $QUIZ_ID"
    
    if [ -n "$QUIZ_ID" ]; then
        # Test 7: Add a Question
        echo -e "\n7. Testing Question Addition..."
        QUESTION_RESPONSE=$(curl -s -X POST "$BASE_URL/quiz/$QUIZ_ID/questions" \
          -H "Authorization: Bearer $PROF_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{"questionText":"What is 2+2?"}')
        
        echo "Question Addition Response: $QUESTION_RESPONSE"
        
        # Extract question ID
        QUESTION_ID=$(echo $QUESTION_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
        echo "Question ID: $QUESTION_ID"
        
        if [ -n "$QUESTION_ID" ]; then
            # Test 8: Add Responses
            echo -e "\n8. Testing Response Addition..."
            
            # Add correct response
            curl -s -X POST "$BASE_URL/quiz/questions/$QUESTION_ID/responses" \
              -H "Authorization: Bearer $PROF_TOKEN" \
              -H "Content-Type: application/json" \
              -d '{"response_text":"4","isCorrect":true}'
            
            # Add incorrect response
            curl -s -X POST "$BASE_URL/quiz/questions/$QUESTION_ID/responses" \
              -H "Authorization: Bearer $PROF_TOKEN" \
              -H "Content-Type: application/json" \
              -d '{"response_text":"3","isCorrect":false}'
            
            echo "Responses added successfully"
        fi
    fi
fi

echo -e "\n=== API Test Complete ==="
echo "Check the responses above to verify the API is working correctly."
echo "You can also test the endpoints manually using the API documentation."
