import api from './api';

export const adminService = {
  // User Management Methods
  // Get all professors with their associated data
  getProfessors: async () => {
    console.log("📡 API call: GET /admin/users/professors");
    const response = await api.get('/admin/users/professors');
    console.log("✅ Professors response received:", response.data);
    return response.data;
  },

  // Get all students
  getStudents: async () => {
    console.log("📡 API call: GET /admin/users/students");
    const response = await api.get('/admin/users/students');
    console.log("✅ Students response received:", response.data);
    return response.data;
  },

  // Get all guests
  getGuests: async () => {
    console.log("📡 API call: GET /admin/users/guests");
    const response = await api.get('/admin/users/guests');
    console.log("✅ Guests response received:", response.data);
    return response.data;
  },

  // Get all admins
  getAdmins: async () => {
    console.log("📡 API call: GET /admin/users/admins");
    const response = await api.get('/admin/users/admins');
    console.log("✅ Admins response received:", response.data);
    return response.data;
  },

  // Subscription Management Methods
  // Get all subscriptions
  getSubscriptions: async () => {
    console.log("📡 API call: GET /admin/subscriptions");
    const response = await api.get('/admin/subscriptions');
    console.log("✅ Subscriptions response received:", response.data);
    return response.data;
  },

  // Create new subscription
  createSubscription: async (subscriptionData) => {
    console.log("📡 API call: POST /admin/subscriptions");
    console.log("📤 Sending subscription data:", JSON.stringify(subscriptionData, null, 2));
    const response = await api.post('/admin/subscriptions', subscriptionData);
    console.log("✅ Subscription created successfully:", response.data);
    return response.data;
  },

  // Update existing subscription
  updateSubscription: async (subscriptionId, subscriptionData) => {
    console.log("📡 API call: PUT /admin/subscriptions/" + subscriptionId);
    console.log("📤 Updating subscription with data:", JSON.stringify(subscriptionData, null, 2));
    const response = await api.put(`/admin/subscriptions/${subscriptionId}`, subscriptionData);
    console.log("✅ Subscription updated successfully:", response.data);
    return response.data;
  },

  // Delete subscription
  deleteSubscription: async (subscriptionId) => {
    console.log("📡 API call: DELETE /admin/subscriptions/" + subscriptionId);
    const response = await api.delete(`/admin/subscriptions/${subscriptionId}`);
    console.log("✅ Subscription deleted successfully");
    return response;
  },

  // Assign subscription to professor
  assignSubscriptionToProfessor: async (professorId, subscriptionId) => {
    console.log("📡 API call: POST /admin/professors/" + professorId + "/assign-subscription");
    console.log("📤 Assigning subscription " + subscriptionId + " to professor " + professorId);
    const payload = { subscriptionId: subscriptionId };
    const response = await api.post(`/admin/professors/${professorId}/assign-subscription`, payload);
    console.log("✅ Subscription assigned successfully:", response.data);
    return response.data;
  },

  // Quiz Management Methods
  // Get all quizzes with complete data
  getQuizzes: async () => {
    console.log("📡 API call: GET /admin/quizzes");
    const response = await api.get('/admin/quizzes');
    console.log("✅ Quizzes response received:", response.data);
    return response.data;
  },

  // Delete quiz by ID
  deleteQuiz: async (quizId) => {
    console.log("📡 API call: DELETE /admin/quizzes/" + quizId);
    const response = await api.delete(`/admin/quizzes/${quizId}`);
    console.log("✅ Quiz deleted successfully");
    return response;
  },

  // Admin Statistics/Dashboard Methods
  // Get dashboard statistics and analytics
  getDashboardStats: async () => {
    console.log("📡 API call: GET /admin/dashboard/stats");
    
    try {
      // Fetch multiple data sources for comprehensive dashboard stats
      const [usersData, subscriptionsData, quizzesData] = await Promise.all([
        adminService.getAllUsersCount(),
        adminService.getSubscriptionsStats(),
        adminService.getQuizzesStats()
      ]);

      const dashboardStats = {
        users: usersData,
        subscriptions: subscriptionsData,
        quizzes: quizzesData,
        timestamp: new Date().toISOString()
      };

      console.log("✅ Dashboard stats compiled:", dashboardStats);
      return dashboardStats;
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // Helper method to get user counts by role
  getAllUsersCount: async () => {
    console.log("🔄 Fetching user counts by role...");
    try {
      const [professors, students, guests, admins] = await Promise.all([
        adminService.getProfessors(),
        adminService.getStudents(),
        adminService.getGuests(),
        adminService.getAdmins()
      ]);

      return {
        total: professors.length + students.length + guests.length + admins.length,
        professors: professors.length,
        students: students.length,
        guests: guests.length,
        admins: admins.length
      };
    } catch (error) {
      console.error("❌ Error fetching user counts:", error);
      return {
        total: 0,
        professors: 0,
        students: 0,
        guests: 0,
        admins: 0
      };
    }
  },

  // Helper method to get subscription statistics
  getSubscriptionsStats: async () => {
    console.log("🔄 Fetching subscription statistics...");
    try {
      const subscriptions = await adminService.getSubscriptions();
      
      const stats = {
        total: subscriptions.length,
        active: subscriptions.filter(sub => sub.isActive !== false).length,
        inactive: subscriptions.filter(sub => sub.isActive === false).length,
        list: subscriptions
      };

      return stats;
    } catch (error) {
      console.error("❌ Error fetching subscription stats:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        list: []
      };
    }
  },

  // Helper method to get quiz statistics
  getQuizzesStats: async () => {
    console.log("🔄 Fetching quiz statistics...");
    try {
      const quizzes = await adminService.getQuizzes();
      
      const stats = {
        total: quizzes.length,
        active: quizzes.filter(quiz => quiz.isActive !== false).length,
        inactive: quizzes.filter(quiz => quiz.isActive === false).length,
        byProfessor: {},
        totalQuestions: quizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0),
        list: quizzes
      };

      // Count quizzes by professor
      quizzes.forEach(quiz => {
        const professorId = quiz.professor_id || quiz.professor?.id || 'unknown';
        stats.byProfessor[professorId] = (stats.byProfessor[professorId] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("❌ Error fetching quiz stats:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byProfessor: {},
        totalQuestions: 0,
        list: []
      };
    }
  },

  // Additional utility methods for admin operations

  // Get comprehensive user information for admin dashboard
  getAllUsersOverview: async () => {
    console.log("🔄 Fetching comprehensive user overview...");
    try {
      const [professors, students, guests, admins] = await Promise.all([
        adminService.getProfessors(),
        adminService.getStudents(),
        adminService.getGuests(),
        adminService.getAdmins()
      ]);

      return {
        professors: professors.map(prof => ({
          ...prof,
          userType: 'professor',
          fullName: prof.user?.fullName || prof.fullName || prof.username
        })),
        students: students.map(student => ({
          ...student,
          userType: 'student',
          fullName: student.user?.fullName || student.fullName || student.username
        })),
        guests: guests.map(guest => ({
          ...guest,
          userType: 'guest',
          fullName: guest.user?.fullName || guest.fullName || guest.username
        })),
        admins: admins.map(admin => ({
          ...admin,
          userType: 'admin',
          fullName: admin.user?.fullName || admin.fullName || admin.username
        }))
      };
    } catch (error) {
      console.error("❌ Error fetching users overview:", error);
      throw error;
    }
  },

  // Health check method for admin service
  healthCheck: async () => {
    console.log("🔄 Performing admin service health check...");
    try {
      // Test with a simple admin endpoint
      await adminService.getAdmins();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'adminService',
        version: '1.0.0'
      };
    } catch (error) {
      console.error("❌ Admin service health check failed:", error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'adminService',
        error: error.message
      };
    }
  },

  // Reclamation Management Methods (placeholder for future implementation)
  // Get all reclamations
  getReclamations: async () => {
    console.log("📡 API call: GET /admin/reclamations");
    try {
      const response = await api.get('/admin/reclamations');
      console.log("✅ Reclamations response received:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Reclamations endpoint not available yet:", error);
      // Throw error to allow fallback in components
      throw error;
    }
  },

  // Send response to a reclamation
  sendReclamationResponse: async (responseData) => {
    console.log("📡 API call: POST /admin/reclamations/" + responseData.reclamationId + "/responses");
    console.log("📤 Sending response data:", JSON.stringify(responseData, null, 2));
    try {
      const response = await api.post(`/admin/reclamations/${responseData.reclamationId}/responses`, {
        response: responseData.response,
        sentAt: responseData.sentAt
      });
      console.log("✅ Response sent successfully:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Send response endpoint not available yet:", error);
      throw error;
    }
  },

  // Update reclamation status
  updateReclamationStatus: async (reclamationId, status) => {
    console.log("📡 API call: PUT /admin/reclamations/" + reclamationId + "/status");
    console.log("📤 Updating reclamation status to:", status);
    try {
      const response = await api.put(`/admin/reclamations/${reclamationId}/status`, { status });
      console.log("✅ Reclamation status updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Update status endpoint not available yet:", error);
      throw error;
    }
  },

  // Delete reclamation
  deleteReclamation: async (reclamationId) => {
    console.log("📡 API call: DELETE /admin/reclamations/" + reclamationId);
    try {
      const response = await api.delete(`/admin/reclamations/${reclamationId}`);
      console.log("✅ Reclamation deleted successfully");
      return response;
    } catch (error) {
      console.warn("⚠️ Delete reclamation endpoint not available yet:", error);
      throw error;
    }
  }
};

export default adminService;