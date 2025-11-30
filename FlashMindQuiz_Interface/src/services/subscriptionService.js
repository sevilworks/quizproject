import api from './api';

const BASE_URL = '/api/professor/subscription';

export const subscriptionService = {
  // Get current professor subscription
  getProfessorSubscription(professorId) {
    return api.get(`${BASE_URL}/${professorId}`);
  },

  // Get available subscription plans
  getAvailablePlans() {
    return api.get('/admin/subscriptions/plans');
  },

  // Create new subscription
  createSubscription(subscriptionData) {
    return api.post(`${BASE_URL}/create`, subscriptionData);
  },

  // Update subscription status
  updateSubscriptionStatus(subscriptionId, isActive) {
    return api.put(`${BASE_URL}/${subscriptionId}/status`, { isActive });
  },

  // Delete subscription
  deleteSubscription(subscriptionId) {
    return api.delete(`${BASE_URL}/${subscriptionId}`);
  },

  // Helper method to format dates for display
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Helper method to format price for display
  formatPrice(price) {
    return `${price} millimes`;
  },

  // Helper method to get subscription status text
  getStatusText(isActive, endDate) {
    if (!isActive) return 'Inactif';
    
    const end = new Date(endDate);
    const now = new Date();
    if (end < now) return 'Expiré';
    if ((end - now) / (1000 * 60 * 60 * 24) <= 7) return 'Expire bientôt';
    return 'Actif';
  },

  // Get billing history (mock for now - can be enhanced later)
  getBillingHistory(professorId) {
    // This could be implemented as a separate endpoint later
    // For now, we'll return mock data that matches the existing structure
    return Promise.resolve({
      data: [
        { id: 1, date: '01 Oct 2025', amount: 49900, status: 'Payé', method: 'Visa ****4242' },
        { id: 2, date: '01 Sep 2025', amount: 49900, status: 'Payé', method: 'Visa ****4242' },
        { id: 3, date: '01 Août 2025', amount: 49900, status: 'Payé', method: 'Visa ****4242' },
        { id: 4, date: '01 Juil 2025', amount: 49900, status: 'Payé', method: 'Visa ****4242' },
      ]
    });
  }
};