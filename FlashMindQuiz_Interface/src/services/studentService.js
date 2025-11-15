import api from './api';

export const studentService = {
  // Get student profile
  getProfile: async () => {
    const response = await api.get('/student/profile');
    return response.data;
  },

  // Update student profile
  updateProfile: async (profileData) => {
    const response = await api.put('/student/profile', profileData);
    return response.data;
  },

  // Get student statistics
  getStats: async () => {
    console.log("Fetching student stats...");
    const response = await api.get('/student/stats');
    console.log("Student stats response:", response.data);
    return response.data;
  },

  // Get detailed statistics
  getDetailedStats: async () => {
    const response = await api.get('/student/stats/detailed');
    return response.data;
  },

  // Get statistics summary
  getStatsSummary: async () => {
    const response = await api.get('/student/stats/summary');
    return response.data;
  },

  // Get quiz history
  getQuizHistory: async () => {
    const response = await api.get('/student/history');
    return response.data;
  },

  // Get participation details
  getParticipationDetails: async (participationId) => {
    const response = await api.get(`/student/participation/${participationId}`);
    return response.data;
  },

  // Get global leaderboard
  getLeaderboard: async (limit = 10) => {
    const response = await api.get(`/student/leaderboard?limit=${limit}`);
    return response.data;
  },

  // Get most active students
  getMostActiveStudents: async (limit = 10) => {
    const response = await api.get(`/student/most-active?limit=${limit}`);
    return response.data;
  },

  // Get recommended quizzes
  getRecommendedQuizzes: async (limit = 5) => {
    const response = await api.get(`/student/recommended-quizzes?limit=${limit}`);
    return response.data;
  },

  // Check if student can participate in a quiz
  canParticipateInQuiz: async (quizId) => {
    const response = await api.get(`/student/quiz/${quizId}/can-participate`);
    return response.data;
  }
};