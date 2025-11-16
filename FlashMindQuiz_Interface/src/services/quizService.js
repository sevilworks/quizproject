import api from './api';

export const quizService = {
  // Create quiz (Professor)
  createQuiz: async (quizData) => {
    const response = await api.post('/quiz/create', quizData);
    return response.data;
  },

  // Update quiz (Professor)
  updateQuiz: async (quizId, quizData) => {
    const response = await api.put(`/quiz/${quizId}`, quizData);
    return response.data;
  },

  // Delete quiz (Professor)
  deleteQuiz: async (quizId) => {
    const response = await api.delete(`/quiz/${quizId}`);
    return response;
  },

  // Get my quizzes (Professor)
  getMyQuizzes: async () => {
    const response = await api.get('/quiz/my-quizzes');
    return response.data;
  },

  // Récupérer un quiz par code (Public)
  getQuizByCode: async (code) => {
    const response = await api.get(`/quiz/join/${code}`);
    return response.data;
  },

  // Add question to quiz (Professor)
  addQuestion: async (quizId, questionData) => {
    const response = await api.post(`/quiz/${quizId}/questions`, questionData);
    return response.data;
  },

  // Add response to question (Professor)
  addResponse: async (questionId, responseData) => {
    const response = await api.post(`/quiz/questions/${questionId}/responses`, responseData);
    return response.data;
  },

  // Update question (Professor)
  updateQuestion: async (questionId, questionData) => {
    const response = await api.put(`/quiz/questions/${questionId}`, questionData);
    return response.data;
  },

  // Delete question (Professor)
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/quiz/questions/${questionId}`);
    return response.data;
  },

  // Update response (Professor)
  updateResponse: async (responseId, responseData) => {
    const response = await api.put(`/quiz/responses/${responseId}`, responseData);
    return response.data;
  },

  // Delete response (Professor)
  deleteResponse: async (responseId) => {
    const response = await api.delete(`/quiz/responses/${responseId}`);
    return response.data;
  },

  // Soumettre les réponses du quiz
  submitQuizAnswers: async (quizId, data) => {
    console.log("📡 API call: POST /quiz/${quizId}/submit");
    console.log("📤 Sending data:", JSON.stringify(data, null, 2));
    console.log("🔍 Data type:", typeof data);
    console.log("🔍 Data keys:", Object.keys(data));
    
    // Create payload matching backend SubmitQuizRequest DTO
    // Backend expects: selectedResponseIds (array) and studentResponses (JSON string)
    const payload = {
      selectedResponseIds: data.selectedResponseIds,
      studentResponses: data.studentResponses  // Already a JSON string from Quiz.jsx
    };
    
    console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));
    console.log("🎯 selectedResponseIds:", payload.selectedResponseIds);
    console.log("🎯 studentResponses (JSON string):", payload.studentResponses);
    
    const response = await api.post(`/quiz/${quizId}/submit`, payload);
    console.log("✅ Response received:", response.data);
    return response.data;
  },

  // Get quiz participations (Professor)
  getQuizParticipations: async (quizId) => {
    const response = await api.get(`/quiz/${quizId}/participations`);
    return response.data;
  },

  // Démarrer un quiz - Note: Not explicitly in API doc, handle gracefully
  startQuiz: async (quizId) => {
    console.warn("Start quiz not explicitly implemented in backend");
    return { message: "Start quiz functionality may not be available" };
  },

  // Get quiz questions - Note: Not directly available, may need to get full quiz
  getQuizQuestions: async (quizId) => {
    console.warn("Get quiz questions not directly available, getting full quiz");
    console.log("🔍 Fetching full quiz for questions, ID:", quizId);
    const quiz = await quizService.getQuizById(quizId);
    console.log("📋 Full quiz response:", quiz);
    console.log("❓ Extracted questions:", quiz.questions);
    return quiz.questions || [];
  },

  // Get quiz by ID
  getQuizById: async (id) => {
    const response = await api.get(`/quiz/${id}`);
    return response.data;
  },

  // Get public quizzes - Note: Not in API doc, handle gracefully
  getPublicQuizzes: async () => {
    console.warn("Get public quizzes not implemented in backend");
    return [];
  // Get quiz report data (Professor) - includes quiz details and participations
  getQuizReport: async (quizId) => {
    const response = await api.get(`/quiz/${quizId}/report`);
    return response.data;
  }
  }
};