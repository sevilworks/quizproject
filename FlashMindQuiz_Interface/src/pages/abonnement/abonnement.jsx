import { useState, useEffect } from 'react';
import { Bell, Crown, Calendar, CreditCard, CheckCircle, AlertTriangle, X, Loader2, Star, Zap, Users, BarChart3, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import { authService } from '../../services/authService';
import FreeProfessorView from '../../components/FreeProfessorView';
import VipProfessorView from '../../components/VipProfessorView';

export default function AbonnementProfesseur() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationClosed, setNotificationClosed] = useState(false);
  
  // Real data from API
  const [role, setRole] = useState('PROFESSOR_FREE');
  const [subscription, setSubscription] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [plans, setPlans] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Enhanced subscription plans with better structure
  const defaultPlans = [
    {
      id: 'free',
      name: 'Plan Gratuit',
      price: 0,
      originalPrice: 0,
      duration: 'mois',
      popular: false,
      features: [
        'Jusqu\'à 3 quiz',
        'Jusqu\'à 50 étudiants',
        'Statistiques de base',
        'Support par email'
      ],
      limitations: [
        'Pas de génération IA',
        'Pas de rapports avancés',
        'Pas de sécurité renforcée'
      ],
      color: 'from-gray-500 to-gray-600',
      icon: Users,
      disabled: true
    },
    {
      id: 'premium',
      name: 'Plan Premium',
      price: 29.99,
      originalPrice: 49.99,
      duration: 'mois',
      popular: true,
      features: [
        'Quiz illimités',
        'Étudiants illimités',
        'Génération de quiz par IA',
        'Statistiques avancées',
        'Rapports détaillés',
        'Support prioritaire 24/7',
        'Sécurité renforcée',
        'Exportation des données'
      ],
      color: 'from-blue-500 to-blue-600',
      icon: Zap,
      disabled: false
    },
    {
      id: 'enterprise',
      name: 'Plan Entreprise',
      price: 99.99,
      originalPrice: 149.99,
      duration: 'mois',
      popular: false,
      features: [
        'Toutes les fonctionnalités Premium',
        'API personnalisée',
        'Intégration SSO',
        'Formation personnalisée',
        'Gestionnaire de compte dédié',
        'SLA 99.9%',
        'Audit de sécurité',
        'Support téléphonique'
      ],
      color: 'from-purple-500 to-purple-600',
      icon: Crown,
      disabled: false
    }
  ];

  // Load subscription data on component mount
  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current professor ID from auth context
      const user = authService.getCurrentUser();
      if (!user || !(user.role === 'PROFESSOR_FREE' || user.role === 'PROFESSOR_VIP')) {
        throw new Error('Utilisateur non autorisé');
      }

      setCurrentUser(user);
      const professorId = user.userId;

      // Load enhanced subscription data including role information
      const subscriptionResponse = await subscriptionService.getEnhancedProfessorSubscription(professorId);
      const subscriptionData = subscriptionResponse;
      
      // Set role from response (or fallback to user.role for safety)
      setRole(subscriptionData.role || user.role || 'PROFESSOR_FREE');
      setSubscription(subscriptionData.subscription);
      setHasActiveSubscription(subscriptionData.hasActiveSubscription);
      if (subscriptionData.daysRemaining !== undefined) {
        setDaysRemaining(subscriptionData.daysRemaining);
      }
      if (subscriptionData.isExpiringSoon !== undefined) {
        setIsExpiringSoon(subscriptionData.isExpiringSoon);
      }

      // Load billing history for users with subscriptions
      if (subscriptionData.hasActiveSubscription) {
        const billingResponse = await subscriptionService.getBillingHistory(professorId);
        setBillingHistory(billingResponse.data);

        // Show notification if subscription is expiring soon
        if (subscriptionData.isExpiringSoon && !notificationClosed) {
          setShowNotification(true);
        }
      }

      // Load available plans (for both FREE and VIP users)
      try {
        const plansResponse = await subscriptionService.getAvailablePlans();
        const apiPlans = plansResponse.data;
        
        // Ensure API plans have the required structure, merge with defaults if needed
        if (apiPlans && Array.isArray(apiPlans) && apiPlans.length > 0) {
          const mergedPlans = apiPlans.map(apiPlan => ({
            ...apiPlan,
            features: apiPlan.features || [],
            limitations: apiPlan.limitations || [],
            icon: apiPlan.icon || Crown,
            color: apiPlan.color || 'from-gray-500 to-gray-600'
          }));
          setPlans(mergedPlans);
        } else {
          setPlans(defaultPlans);
        }
      } catch (planError) {
        // Use default plans if backend fails
        setPlans(defaultPlans);
      }

    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError(err.message || 'Erreur lors du chargement des données d\'abonnement');
      // Set default plans even on error to ensure UI doesn't break
      setPlans(defaultPlans);
    } finally {
      setLoading(false);
    }
  };

  const closeNotification = () => {
    setShowNotification(false);
    setNotificationClosed(true);
  };

  // Helper functions to format data
  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    return subscriptionService.formatDate(dateString);
  };

  const formatPrice = (price) => {
    return subscriptionService.formatPrice(price);
  };

  const getStatusText = () => {
    if (!hasActiveSubscription) return 'Aucun abonnement';
    if (!subscription) return 'Chargement...';
    return subscriptionService.getStatusText(subscription.isActive, subscription.endDate);
  };

  const getPlanName = () => {
    if (!subscription) return 'Aucun abonnement';
    return subscription.planType || 'Plan inconnu';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#6B4FFF] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement de vos informations d'abonnement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadSubscriptionData}
            className="px-6 py-3 bg-[#6B4FFF] text-white rounded-xl font-bold hover:bg-[#5B3FEF] transition-all"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <div className="bg-[#624BFF] text-white px-8 py-6 flex items-center justify-between shadow-md">
        <h1 className="text-3xl font-bold">Abonnements</h1>  
        <div className="flex items-center gap-6">
          <button className="relative p-3 hover:bg-white hover:bg-opacity-10 rounded-xl transition-all">
            <Bell className="w-7 h-7 text-white" />
            {showNotification && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-[#FF4B6B] rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          <div className="w-14 h-14 rounded-full bg-white bg-opacity-30 flex items-center justify-center overflow-hidden shadow-lg border-2 border-white border-opacity-50">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/007/296/447/non_2x/user-icon-in-flat-style-person-icon-client-symbol-vector.jpg"
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Content - Conditional Rendering Based on Role */}
      <div className="flex-1 overflow-auto px-8 py-8">
        {role === 'PROFESSOR_VIP' ? (
          <VipProfessorView
            subscription={subscription}
            hasActiveSubscription={hasActiveSubscription}
            daysRemaining={daysRemaining}
            isExpiringSoon={isExpiringSoon}
            billingHistory={billingHistory}
            showNotification={showNotification}
            onCloseNotification={closeNotification}
            onRefreshData={loadSubscriptionData}
          />
        ) : (
          <FreeProfessorView
            plans={plans}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
}