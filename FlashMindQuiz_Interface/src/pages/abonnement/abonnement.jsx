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
              <button
                onClick={() => navigate('/professor/paiement')}
                className="px-6 py-3 bg-gradient-to-r from-[#6B4FFF] to-[#8B6FFF] text-white rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all"
              >
                Renouveler
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-8 py-8">
        {/* Current Subscription Status */}
        {hasActiveSubscription && subscription ? (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-[#6B4FFF] via-[#7B5FFF] to-[#8B6FFF] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Crown className="w-9 h-9 text-yellow-300" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{getPlanName()}</h2>
                      <p className="text-white text-opacity-80">Abonnement Actif</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span className="font-semibold">{getStatusText()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => navigate('/professor/paiement')}
                    className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-xl font-bold backdrop-blur-sm hover:bg-opacity-30 transition-all"
                  >
                    Gérer l'abonnement
                  </button>
                  <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-all">
                    Télécharger la facture
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full -ml-16 -mt-16"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500 opacity-10 rounded-full -mr-20 -mb-20"></div>
              
              <div className="relative z-10">
                <Sparkles className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Passez au Premium !</h2>
                <p className="text-xl text-gray-600 mb-8">Débloquez toutes les fonctionnalités avancées pour créer des quiz exceptionnels</p>
                <button
                  onClick={() => document.getElementById('plans-section').scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Voir les plans <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div id="plans-section" className="mb-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choisissez votre plan</h2>
            <p className="text-xl text-gray-600">Des solutions adaptées à tous vos besoins pédagogiques</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {(Array.isArray(plans) && plans.length > 0 ? plans : defaultPlans).map((plan, idx) => {
              const IconComponent = plan?.icon || Crown;
              return (
                <div
                  key={plan?.id || idx}
                  className={`relative bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    plan?.popular 
                      ? 'border-blue-500 ring-4 ring-blue-100' 
                      : 'border-gray-200 hover:border-blue-300'
                  } ${plan?.disabled ? 'opacity-75' : ''}`}
                >
                  {plan?.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Plus populaire
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="text-center mb-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan?.name || 'Plan'}</h3>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {(plan?.originalPrice || 0) > (plan?.price || 0) && (
                          <span className="text-lg text-gray-500 line-through">${plan?.originalPrice}</span>
                        )}
                        <span className="text-4xl font-bold text-gray-900">
                          {(plan?.price || 0) === 0 ? 'Gratuit' : `$${plan?.price || 0}`}
                        </span>
                        {(plan?.price || 0) > 0 && (
                          <span className="text-gray-500">/{plan?.duration || 'mois'}</span>
                        )}
                      </div>
                      {(plan?.originalPrice || 0) > (plan?.price || 0) && (
                        <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          <Sparkles className="w-3 h-3" />
                          Économisez ${(plan?.originalPrice || 0) - (plan?.price || 0)}
                        </div>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8">
                      {(plan.features || []).map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                      {(plan.limitations || []).map((limitation, limitIdx) => (
                        <li key={limitIdx} className="flex items-center gap-3 opacity-60">
                          <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-500">{limitation}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        if (!plan?.disabled && plan?.id !== 'free') {
                          // Create a serializable version of the plan (removing React components)
                          const serializablePlan = {
                            id: plan.id,
                            name: plan.name,
                            price: plan.price,
                            originalPrice: plan.originalPrice,
                            duration: plan.duration,
                            popular: plan.popular,
                            features: plan.features,
                            limitations: plan.limitations,
                            color: plan.color,
                            disabled: plan.disabled
                          };
                          navigate('/professor/paiement', { state: { selectedPlan: serializablePlan } });
                        }
                      }}
                      disabled={plan?.disabled || plan?.id === 'free'}
                      className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
                        plan?.popular
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                          : plan?.disabled || plan?.id === 'free'
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {plan?.id === 'free' 
                        ? 'Plan actuel' 
                        : hasActiveSubscription && subscription?.planType === plan?.name
                        ? 'Plan actif'
                        : 'Choisir ce plan'
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Analysez vos performances</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Obtenez des insights détaillés sur les performances de vos étudiants avec nos outils d'analyse avancés.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Rapports en temps réel</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Graphiques interactifs</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Exportation des données</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Sécurité garantie</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Vos données et celles de vos étudiants sont protégées par les plus hauts standards de sécurité.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Chiffrement end-to-end</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Conformité RGPD</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Sauvegarde automatique</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Billing History */}
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
                      <td className="py-5 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          bill.status === 'Payé' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
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