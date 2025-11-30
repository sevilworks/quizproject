import { useState, useEffect } from 'react';
import { Bell, Crown, Calendar, CreditCard, CheckCircle, AlertTriangle, X, Loader2, Star, Zap, Users, BarChart3, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import { authService } from '../../services/authService';

export default function AbonnementProfesseur() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationClosed, setNotificationClosed] = useState(false);
  
  // Real data from API
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

      // Load subscription data for all professors with subscriptions
      const subscriptionResponse = await subscriptionService.getProfessorSubscription(professorId);
      const subscriptionData = subscriptionResponse.data;
      
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
        setPlans(plansResponse.data);
      } catch (planError) {
        // Use default plans if backend fails
        setPlans(defaultPlans);
      }

    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError(err.message || 'Erreur lors du chargement des données d\'abonnement');
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
        <h1 className="text-3xl font-bold">Détail d'abonnement</h1>  
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

      {/* Notification */}
      {showNotification && hasActiveSubscription && isExpiringSoon && (
        <div className="flex justify-center mt-8">
          <div className="w-full max-w-4xl bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-3xl p-6 shadow-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">⚠️ Abonnement bientôt expiré !</h3>
                <p className="text-gray-700">
                  Votre abonnement expirera dans <span className="font-bold text-orange-600">{daysRemaining} jours</span>. 
                  Renouvelez maintenant pour continuer à profiter de toutes les fonctionnalités premium !
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-[#6B4FFF] to-[#8B6FFF] text-white rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all">
                <Link to="/professor/paiement">Renouveler</Link>
              </button>
              <button 
                onClick={closeNotification}
                className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto px-8 py-8">
        {/* Current Subscription Status */}
        {hasActiveSubscription && subscription ? (
          /* Vue Abonnement - Abonnement actuel */
          <div className="bg-gradient-to-br from-[#6B4FFF] via-[#7B5FFF] to-[#8B6FFF] rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Crown className="w-9 h-9 text-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{getPlanName()}</h2>
                    <p className="text-white text-opacity-80 text-sm">Abonnement Premium</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="font-semibold">{getStatusText()}</span>
                  </div>
                </div>
              </div>

              {/* Détails de l'abonnement */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="bg-white bg-opacity-10 rounded-2xl p-5 backdrop-blur-sm">
                  <Calendar className="w-6 h-6 mb-3 text-white text-opacity-80" />
                  <p className="text-white text-opacity-70 text-sm mb-1">Date de début</p>
                  <p className="text-xl font-bold">{formatDate(subscription.startDate)}</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-2xl p-5 backdrop-blur-sm">
                  <Calendar className="w-6 h-6 mb-3 text-white text-opacity-80" />
                  <p className="text-white text-opacity-70 text-sm mb-1">Date de fin</p>
                  <p className="text-xl font-bold">{formatDate(subscription.endDate)}</p>
                </div>
                {isExpiringSoon && (
                  <div className="bg-white bg-opacity-10 rounded-2xl p-5 backdrop-blur-sm border-2 border-orange-300">
                    <AlertTriangle className="w-6 h-6 mb-3 text-orange-300" />
                    <p className="text-white text-opacity-70 text-sm mb-1">Jours restants</p>
                    <p className="text-xl font-bold text-orange-300">{daysRemaining} jours</p>
                  </div>
                )}
                <div className="bg-white bg-opacity-10 rounded-2xl p-5 backdrop-blur-sm">
                  <CreditCard className="w-6 h-6 mb-3 text-white text-opacity-80" />
                  <p className="text-white text-opacity-70 text-sm mb-1">Prix mensuel</p>
                  <p className="text-xl font-bold">{formatPrice(subscription.price)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Vue FREE - Catalogue de plans */
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl p-8 mb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full -ml-16 -mt-16"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500 opacity-10 rounded-full -mr-20 -mb-20"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">🚀 Passez au Premium !</h2>
              <p className="text-xl text-gray-600 mb-8">Débloquez toutes les fonctionnalités avancées</p>
            </div>
          </div>
        )}

        {/* Fonctionnalités et plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Fonctionnalités */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Fonctionnalités incluses</h2>
            <div className="space-y-4">
              {[
                { name: 'Quiz illimités', included: true, icon: '📝' },
                { name: 'Étudiants illimités', included: true, icon: '👥' },
                { name: 'Statistiques avancées', included: true, icon: '📊' },
                { name: 'Sécurité renforcée', included: true, icon: '🔒' },
                { name: 'Génération de quiz par IA', included: true, icon: '🤖' },
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                    feature.included ? 'bg-gray-100 border-2 border-gray-300' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      feature.included ? 'bg-gray-200' : 'bg-gray-200'
                    }`}>
                      {feature.icon}
                    </div>
                    <div>
                      <span className={`font-semibold text-lg ${
                        feature.included ? 'text-gray-900' : 'text-gray-500'
                      }`}>{feature.name}</span>
                      {feature.description && <p className="text-sm text-gray-500">{feature.description}</p>}
                    </div>
                  </div>
                  {feature.included ? (
                    <CheckCircle className="w-6 h-6 text-gray-500" />
                  ) : (
                    <X className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Plans disponibles */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Plans disponibles</h2>
            <div className="space-y-4">
              {plans.map((plan, idx) => (
                <div 
                  key={idx}
                  className={`relative p-6 rounded-2xl transition-all hover:shadow-lg ${
                    hasActiveSubscription && subscription && subscription.planType === plan.name 
                      ? 'border-4 border-gray-300' 
                      : 'border-2 border-gray-200'
                  }`}
                >
                  {hasActiveSubscription && subscription && subscription.planType === plan.name && (
                    <div className="absolute -top-3 left-6 px-4 py-1 bg-gray-300 text-white text-xs font-bold rounded-full">
                      PLAN ACTUEL
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.students} étudiants • {plan.quizzes} quizzes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">{plan.priceText}</p>
                      <p className="text-gray-500 text-sm">par mois</p>
                    </div>
                  </div>
                  <button 
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      hasActiveSubscription && subscription && subscription.planType === plan.name
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-400 text-white hover:shadow-lg'
                    }`}
                    disabled={hasActiveSubscription && subscription && subscription.planType === plan.name}
                  >
                    {hasActiveSubscription && subscription && subscription.planType === plan.name 
                      ? 'Plan actif' 
                      : 'Sélectionner'
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historique de facturation */}
        {billingHistory.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Historique de facturation</h2>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                Télécharger tout
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 text-gray-500 font-semibold text-sm">Date</th>
                    <th className="text-left py-4 px-4 text-gray-500 font-semibold text-sm">Montant</th>
                    <th className="text-left py-4 px-4 text-gray-500 font-semibold text-sm">Statut</th>
                    <th className="text-left py-4 px-4 text-gray-500 font-semibold text-sm">Méthode</th>
                    <th className="text-left py-4 px-4 text-gray-500 font-semibold text-sm">Facture</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((bill) => (
                    <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-4 text-gray-900 font-medium">{bill.date}</td>
                      <td className="py-5 px-4 text-gray-900 font-bold">{bill.amount} millimes</td>
                      <td className="py-5 px-4 font-bold">{bill.status}</td>
                      <td className="py-5 px-4 text-gray-600">{bill.method}</td>
                      <td className="py-5 px-4">
                        <button className="px-4 py-2 bg-[#6B4FFF] text-white rounded-lg font-semibold hover:bg-[#5B3FEF] transition-all">
                          Télécharger
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
