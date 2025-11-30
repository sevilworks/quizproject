import requests
import sys
import json
from colorama import Fore, Style, init
from datetime import datetime
init(autoreset=True)

BASE_URL = "http://localhost:8080/api"

# Store tokens for persistent sessions
sessions = {
    "admin": None,
    "professor": None,
    "student": None
}

# Utility functions
def print_success(msg):
    print(Fore.GREEN + "✓ " + msg)

def print_error(msg):
    print(Fore.RED + "✗ " + msg)

def print_info(msg):
    print(Fore.CYAN + "ℹ " + msg)

def print_warning(msg):
    print(Fore.YELLOW + "⚠ " + msg)

def print_section(msg):
    print("\n" + Fore.MAGENTA + Style.BRIGHT + "="*60)
    print(f"  {msg}")
    print("="*60 + Style.RESET_ALL)

def input_choice(prompt, choices):
    print_info(prompt)
    for i, choice in enumerate(choices, 1):
        print(f"{i}. {choice}")
    while True:
        try:
            sel = int(input(Fore.YELLOW + "Select option: "))
            if 1 <= sel <= len(choices):
                return sel
            else:
                print_error("Invalid selection. Try again.")
        except ValueError:
            print_error("Please enter a number.")

def test_endpoint(method, endpoint, token=None, json_data=None, params=None, description=""):
    """Generic endpoint tester"""
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, params=params)
        elif method == "POST":
            resp = requests.post(url, headers=headers, json=json_data)
        elif method == "PUT":
            resp = requests.put(url, headers=headers, json=json_data)
        elif method == "DELETE":
            resp = requests.delete(url, headers=headers)
        
        if resp.ok:
            print_success(f"{description} - Status: {resp.status_code}")
            return resp.json() if resp.text else None
        else:
            print_error(f"{description} - Status: {resp.status_code} - {resp.text}")
            return None
    except Exception as e:
        print_error(f"{description} - Error: {str(e)}")
        return None

# ============================================================================
# AUTHENTICATION TESTS
# ============================================================================

def test_auth_routes():
    print_section("AUTHENTICATION TESTS")
    
    # Test: Health Check
    print_info("\n[TEST] Health Check")
    test_endpoint("GET", "/test/health", description="Health endpoint")
    
    # Test: Hello endpoint
    print_info("\n[TEST] Hello endpoint")
    test_endpoint("GET", "/test/hello", description="Hello endpoint")
    
    # Test: Register Admin (if needed, usually done via database)
    # Note: Admin registration might not be exposed via API
    
    # Test: Register Professor
    print_info("\n[TEST] Register Professor")
    prof_data = {
        "username": f"prof_test_{datetime.now().timestamp()}",
        "email": f"prof_{datetime.now().timestamp()}@test.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "Professor"
    }
    prof_result = test_endpoint("POST", "/auth/register/professor", 
                                json_data=prof_data,
                                description="Register Professor")
    
    # Test: Register Student
    print_info("\n[TEST] Register Student")
    student_data = {
        "username": f"student_test_{datetime.now().timestamp()}",
        "email": f"student_{datetime.now().timestamp()}@test.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "Student"
    }
    student_result = test_endpoint("POST", "/auth/register/student",
                                   json_data=student_data,
                                   description="Register Student")
    
    # Test: Login Professor
    print_info("\n[TEST] Login Professor")
    prof_login = test_endpoint("POST", "/auth/login",
                               json_data={"username": prof_data["username"], 
                                        "password": prof_data["password"]},
                               description="Login Professor")
    if prof_login:
        sessions["professor"] = prof_login.get("token")
        print_success(f"Professor token stored: {sessions['professor'][:20]}...")
    
    # Test: Login Student
    print_info("\n[TEST] Login Student")
    student_login = test_endpoint("POST", "/auth/login",
                                  json_data={"username": student_data["username"],
                                           "password": student_data["password"]},
                                  description="Login Student")
    if student_login:
        sessions["student"] = student_login.get("token")
        print_success(f"Student token stored: {sessions['student'][:20]}...")
    
    # Test: Get Current User (Professor)
    print_info("\n[TEST] Get Current User (Professor)")
    test_endpoint("GET", "/auth/me", token=sessions["professor"],
                 description="Get current professor info")
    
    # Test: Get Current User (Student)
    print_info("\n[TEST] Get Current User (Student)")
    test_endpoint("GET", "/auth/me", token=sessions["student"],
                 description="Get current student info")
    
    return prof_data, student_data

# ============================================================================
# PROFESSOR TESTS
# ============================================================================

def test_professor_routes():
    print_section("PROFESSOR TESTS")
    
    if not sessions["professor"]:
        print_error("No professor token available. Run authentication tests first.")
        return None, None
    
    token = sessions["professor"]
    
    # Test: Create Quiz
    print_info("\n[TEST] Create Quiz")
    quiz_data = {
        "title": f"Test Quiz {datetime.now().timestamp()}",
        "description": "Comprehensive test quiz for API testing",
        "duration": 30
    }
    quiz = test_endpoint("POST", "/quiz/create", token=token,
                        json_data=quiz_data,
                        description="Create Quiz")
    
    if not quiz:
        print_error("Failed to create quiz. Aborting professor tests.")
        return None, None
    
    quiz_id = quiz.get("id")
    quiz_code = quiz.get("code")
    print_success(f"Quiz created: ID={quiz_id}, Code={quiz_code}")
    
    # Test: Get My Quizzes
    print_info("\n[TEST] Get My Quizzes")
    test_endpoint("GET", "/quiz/my-quizzes", token=token,
                 description="List professor's quizzes")
    
    # Test: Get Quiz By ID
    print_info("\n[TEST] Get Quiz By ID")
    test_endpoint("GET", f"/quiz/{quiz_id}", token=token,
                 description=f"Get quiz details for ID {quiz_id}")
    
    # Test: Update Quiz
    print_info("\n[TEST] Update Quiz")
    update_data = {
        "title": f"Updated Quiz {datetime.now().timestamp()}",
        "description": "Updated description",
        "duration": 45
    }
    test_endpoint("PUT", f"/quiz/{quiz_id}", token=token,
                 json_data=update_data,
                 description=f"Update quiz {quiz_id}")
    
    # Test: Add Question to Quiz
    print_info("\n[TEST] Add Question to Quiz")
    question_data = {"questionText": "What is the capital of France?"}
    question = test_endpoint("POST", f"/quiz/{quiz_id}/questions", token=token,
                            json_data=question_data,
                            description=f"Add question to quiz {quiz_id}")
    
    question_id = question.get("id") if question else None
    
    if question_id:
        # Test: Add Correct Response
        print_info("\n[TEST] Add Correct Response")
        response_data = {"responseText": "Paris", "isCorrect": True}
        test_endpoint("POST", f"/quiz/questions/{question_id}/responses", 
                     token=token,
                     json_data=response_data,
                     description="Add correct response")
        
        # Test: Add Incorrect Responses
        print_info("\n[TEST] Add Incorrect Responses")
        for city in ["London", "Berlin", "Madrid"]:
            response_data = {"responseText": city, "isCorrect": False}
            test_endpoint("POST", f"/quiz/questions/{question_id}/responses",
                         token=token,
                         json_data=response_data,
                         description=f"Add incorrect response: {city}")
        
        # Add another question
        print_info("\n[TEST] Add Second Question")
        question2_data = {"questionText": "What is 2 + 2?"}
        question2 = test_endpoint("POST", f"/quiz/{quiz_id}/questions", 
                                 token=token,
                                 json_data=question2_data,
                                 description="Add second question")
        
        question2_id = question2.get("id") if question2 else None
        
        if question2_id:
            # Add responses to second question
            for answer, correct in [("4", True), ("3", False), ("5", False), ("22", False)]:
                response_data = {"responseText": answer, "isCorrect": correct}
                test_endpoint("POST", f"/quiz/questions/{question2_id}/responses",
                             token=token,
                             json_data=response_data,
                             description=f"Add response: {answer}")
    
    # Test: Get Quiz Participations (should be empty)
    print_info("\n[TEST] Get Quiz Participations")
    test_endpoint("GET", f"/quiz/{quiz_id}/participations", token=token,
                 description=f"Get participations for quiz {quiz_id}")
    
    return quiz_id, quiz_code

# ============================================================================
# STUDENT TESTS
# ============================================================================

def test_student_routes(quiz_id, quiz_code):
    print_section("STUDENT TESTS")
    
    if not sessions["student"]:
        print_error("No student token available. Run authentication tests first.")
        return
    
    if not quiz_code:
        print_error("No quiz code available. Run professor tests first.")
        return
    
    token = sessions["student"]
    
    # Test: Get Quiz By Code
    print_info("\n[TEST] Get Quiz By Code")
    test_endpoint("GET", f"/quiz/join/{quiz_code}", token=token,
                 description=f"Get quiz details by code {quiz_code}")
    
    # Test: Participate in Quiz
    print_info("\n[TEST] Participate in Quiz")
    participation = test_endpoint("POST", f"/quiz/join/{quiz_code}", token=token,
                                 description=f"Join quiz with code {quiz_code}")
    
    # Test: Get My Participations (before submission)
    print_info("\n[TEST] Get My Participations (Before Submission)")
    test_endpoint("GET", "/quiz/my-participations", token=token,
                 description="List student's participations")
    
    # Get quiz details to find question IDs and response IDs
    print_info("\n[TEST] Get Quiz Details for Submission")
    quiz_details = test_endpoint("GET", f"/quiz/{quiz_id}", token=token,
                                description="Get quiz details for answers")
    
    # Extract response IDs (select correct answers)
    response_ids = []
    if quiz_details and "questions" in quiz_details:
        for question in quiz_details["questions"]:
            if "responses" in question:
                for response in question["responses"]:
                    if response.get("isCorrect"):
                        response_ids.append(response["id"])
                        break
    
    # Test: Submit Quiz (with correct answers - should get 100%)
    if response_ids:
        print_info("\n[TEST] Submit Quiz (Correct Answers)")
        submission_data = {
            "selectedResponseIds": response_ids,
            "guestId": None
        }
        result = test_endpoint("POST", f"/quiz/{quiz_id}/submit", token=token,
                              json_data=submission_data,
                              description="Submit quiz answers (correct)")
        if result:
            score = result.get('score', 0)
            print_success(f"Quiz submitted! Score: {score}%")
            if score == 100.0:
                print_success("✓ Score correctly calculated as 100% for correct answers")
            else:
                print_error(f"✗ Expected 100% for correct answers, got {score}%")

    # Test: Submit Quiz with incorrect answers (should get < 100%)
    if response_ids and len(response_ids) > 1:
        print_info("\n[TEST] Submit Quiz (Incorrect Answers)")
        # Submit with only some correct answers (first one correct, others wrong)
        partial_correct_ids = [response_ids[0]]  # Only first correct answer
        submission_data = {
            "selectedResponseIds": partial_correct_ids,
            "guestId": None
        }
        result = test_endpoint("POST", f"/quiz/{quiz_id}/submit", token=token,
                              json_data=submission_data,
                              description="Submit quiz answers (partial/incorrect)")
        if result:
            score = result.get('score', 100)
            print_success(f"Quiz submitted! Score: {score}%")
            if score < 100.0:
                print_success(f"✓ Score correctly calculated as {score}% (< 100%) for incorrect answers")
            else:
                print_error(f"✗ Expected < 100% for incorrect answers, got {score}%")
    
    # Test: Get My Participations (after submission)
    print_info("\n[TEST] Get My Participations (After Submission)")
    test_endpoint("GET", "/quiz/my-participations", token=token,
                 description="List student's participations after submission")

# ============================================================================
# GUEST TESTS
# ============================================================================

def test_guest_routes(quiz_id, quiz_code):
    print_section("GUEST TESTS")
    
    if not quiz_code:
        print_error("No quiz code available. Run professor tests first.")
        return
    
    # Test: Create Guest
    print_info("\n[TEST] Create Guest")
    guest_data = {
        "pseudo": f"Guest_{datetime.now().timestamp()}",
        "email": f"guest_{datetime.now().timestamp()}@test.com"
    }
    guest = test_endpoint("POST", "/quiz/guest/create",
                         json_data=guest_data,
                         description="Create guest user")
    
    if not guest:
        print_error("Failed to create guest. Aborting guest tests.")
        return
    
    guest_id = guest.get("id")
    print_success(f"Guest created: ID={guest_id}")
    
    # Test: Get Guest
    print_info("\n[TEST] Get Guest")
    test_endpoint("GET", f"/quiz/guest/{guest_id}",
                 description=f"Get guest info for ID {guest_id}")
    
    # Test: Guest Get Quiz By Code
    print_info("\n[TEST] Guest - Get Quiz By Code")
    test_endpoint("GET", f"/quiz/join/{quiz_code}",
                 description=f"Guest view quiz with code {quiz_code}")
    
    # Get quiz details for guest submission
    print_info("\n[TEST] Guest - Get Quiz Details")
    quiz_details = test_endpoint("GET", f"/quiz/{quiz_id}",
                                description="Guest get quiz details")
    
    # Extract response IDs for guest submission
    response_ids = []
    if quiz_details and "questions" in quiz_details:
        for question in quiz_details["questions"]:
            if "responses" in question and question["responses"]:
                # Guest selects first response (may be wrong)
                response_ids.append(question["responses"][0]["id"])
    
    # Test: Guest Submit Quiz
    if response_ids:
        print_info("\n[TEST] Guest Submit Quiz")
        submission_data = {
            "selectedResponseIds": response_ids,
            "guestId": guest_id
        }
        result = test_endpoint("POST", f"/quiz/{quiz_id}/submit",
                              json_data=submission_data,
                              description="Guest submit quiz")
        if result:
            print_success(f"Guest quiz submitted! Score: {result.get('score', 'N/A')}%")

# ============================================================================
# ADMIN TESTS
# ============================================================================

def test_admin_routes(quiz_id):
    print_section("ADMIN TESTS")
    
    # Note: Admin token needs to be manually provided or created via database
    # For this test, we'll prompt for admin credentials
    
    print_warning("Admin tests require admin credentials.")
    admin_username = input("Admin username (or press Enter to skip): ")
    
    if not admin_username:
        print_warning("Skipping admin tests.")
        return
    
    admin_password = input("Admin password: ")
    
    # Test: Admin Login
    print_info("\n[TEST] Admin Login")
    admin_login = test_endpoint("POST", "/auth/login",
                                json_data={"username": admin_username,
                                         "password": admin_password},
                                description="Admin login")
    
    if not admin_login:
        print_error("Admin login failed. Skipping admin tests.")
        return
    
    admin_token = admin_login.get("token")
    sessions["admin"] = admin_token
    print_success(f"Admin token stored: {admin_token[:20]}...")
    
    # Test: Get All Students
    print_info("\n[TEST] Get All Students")
    test_endpoint("GET", "/admin/users/students", token=admin_token,
                 description="List all students")
    
    # Test: Get All Professors
    print_info("\n[TEST] Get All Professors")
    professors = test_endpoint("GET", "/admin/users/professors", token=admin_token,
                               description="List all professors")
    
    # Test: Get All Admins
    print_info("\n[TEST] Get All Admins")
    test_endpoint("GET", "/admin/users/admins", token=admin_token,
                 description="List all admins")
    
    # Test: Get All Guests
    print_info("\n[TEST] Get All Guests")
    test_endpoint("GET", "/admin/users/guests", token=admin_token,
                 description="List all guests")
    
    # Test: Get All Quizzes
    print_info("\n[TEST] Get All Quizzes")
    test_endpoint("GET", "/admin/quizzes", token=admin_token,
                 description="List all quizzes")
    
    # Test: Create Subscription
    print_info("\n[TEST] Create Subscription")
    sub_data = {
        "name": f"Test Subscription {datetime.now().timestamp()}",
        "price": 29.99,
        "duration_days": 30
    }
    subscription = test_endpoint("POST", "/admin/subscriptions", token=admin_token,
                                json_data=sub_data,
                                description="Create subscription")
    
    sub_id = subscription.get("id") if subscription else None
    
    # Test: Get All Subscriptions
    print_info("\n[TEST] Get All Subscriptions")
    test_endpoint("GET", "/admin/subscriptions", token=admin_token,
                 description="List all subscriptions")
    
    if sub_id and professors:
        # Test: Assign Subscription to Professor
        print_info("\n[TEST] Assign Subscription to Professor")
        prof_id = professors[0].get("userId") if isinstance(professors, list) else None
        if prof_id:
            assign_data = {"subscriptionId": sub_id}
            test_endpoint("POST", f"/admin/professors/{prof_id}/assign-subscription",
                         token=admin_token,
                         json_data=assign_data,
                         description=f"Assign subscription to professor {prof_id}")
    
    if sub_id:
        # Test: Update Subscription
        print_info("\n[TEST] Update Subscription")
        update_sub = {
            "name": f"Updated Subscription {datetime.now().timestamp()}",
            "price": 39.99,
            "durationDays": 60
        }
        test_endpoint("PUT", f"/admin/subscriptions/{sub_id}", token=admin_token,
                     json_data=update_sub,
                     description=f"Update subscription {sub_id}")
        
        # Test: Delete Subscription
        print_info("\n[TEST] Delete Subscription")
        test_endpoint("DELETE", f"/admin/subscriptions/{sub_id}", token=admin_token,
                     description=f"Delete subscription {sub_id}")
    
    # Test: Admin Delete Quiz (optional, be careful)
    # Uncomment if you want to test quiz deletion
    # print_info("\n[TEST] Admin Delete Quiz")
    # test_endpoint("DELETE", f"/admin/quizzes/{quiz_id}", token=admin_token,
    #              description=f"Admin delete quiz {quiz_id}")

# ============================================================================
# CLEANUP TESTS
# ============================================================================

def test_cleanup(quiz_id):
    print_section("CLEANUP TESTS")
    
    if not sessions["professor"]:
        print_error("No professor token available for cleanup.")
        return
    
    token = sessions["professor"]
    
    # Test: Delete Quiz
    print_info("\n[TEST] Delete Quiz")
    test_endpoint("DELETE", f"/quiz/{quiz_id}", token=token,
                 description=f"Delete quiz {quiz_id}")
    
    # Verify deletion
    print_info("\n[TEST] Verify Quiz Deletion")
    test_endpoint("GET", f"/quiz/{quiz_id}", token=token,
                 description=f"Attempt to get deleted quiz {quiz_id} (should fail)")

# ============================================================================
# COMPREHENSIVE TEST SUITE
# ============================================================================

def run_comprehensive_test_suite():
    print(Fore.MAGENTA + Style.BRIGHT + "\n" + "="*60)
    print("  COMPREHENSIVE QUIZ PLATFORM API TEST SUITE")
    print("="*60 + Style.RESET_ALL)
    print_info(f"Testing API at: {BASE_URL}")
    print_info(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    try:
        # 1. Authentication Tests
        prof_data, student_data = test_auth_routes()
        
        # 2. Professor Tests
        quiz_id, quiz_code = test_professor_routes()
        
        # 3. Student Tests
        if quiz_id and quiz_code:
            test_student_routes(quiz_id, quiz_code)
        
        # 4. Guest Tests
        if quiz_id and quiz_code:
            test_guest_routes(quiz_id, quiz_code)
        
        # 5. Admin Tests
        if quiz_id:
            test_admin_routes(quiz_id)
        
        # 6. Cleanup Tests
        if quiz_id:
            test_cleanup(quiz_id)
        
        print_section("TEST SUITE COMPLETED")
        print_success("All tests executed successfully!")
        print_info(f"End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print_error(f"Test suite failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

# ============================================================================
# INTERACTIVE MENU
# ============================================================================

def interactive_menu():
    print(Fore.MAGENTA + Style.BRIGHT + "\n=== Quiz Platform Interactive Test ===\n")
    while True:
        sel = input_choice("Select Test Suite:", [
            "Run Comprehensive Test Suite (All Routes)",
            "Test Authentication Only",
            "Test Professor Routes Only",
            "Test Student Routes Only",
            "Test Guest Routes Only",
            "Test Admin Routes Only",
            "Login as Professor",
            "Login as Student",
            "View Stored Sessions",
            "Exit"
        ])
        
        if sel == 1:
            run_comprehensive_test_suite()
        elif sel == 2:
            test_auth_routes()
        elif sel == 3:
            test_professor_routes()
        elif sel == 4:
            quiz_id = input("Enter Quiz ID: ")
            quiz_code = input("Enter Quiz Code: ")
            test_student_routes(quiz_id, quiz_code)
        elif sel == 5:
            quiz_id = input("Enter Quiz ID: ")
            quiz_code = input("Enter Quiz Code: ")
            test_guest_routes(quiz_id, quiz_code)
        elif sel == 6:
            quiz_id = input("Enter Quiz ID (or press Enter to skip): ")
            test_admin_routes(quiz_id if quiz_id else None)
        elif sel == 7:
            username = input("Username: ")
            password = input("Password: ")
            result = test_endpoint("POST", "/auth/login",
                                  json_data={"username": username, "password": password},
                                  description="Login Professor")
            if result:
                sessions["professor"] = result.get("token")
        elif sel == 8:
            username = input("Username: ")
            password = input("Password: ")
            result = test_endpoint("POST", "/auth/login",
                                  json_data={"username": username, "password": password},
                                  description="Login Student")
            if result:
                sessions["student"] = result.get("token")
        elif sel == 9:
            print_section("STORED SESSIONS")
            for role, token in sessions.items():
                if token:
                    print_success(f"{role.upper()}: {token[:30]}...")
                else:
                    print_warning(f"{role.upper()}: Not logged in")
        elif sel == 10:
            print_info("Exiting...")
            sys.exit(0)

# ============================================================================
# MAIN
# ============================================================================

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--auto":
        run_comprehensive_test_suite()
    else:
        interactive_menu()

if __name__ == "__main__":
    main()