import React from 'react';
import { Crown, Zap, Users, CheckCircle, X, ArrowRight, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FreeProfessorView = ({ plans, currentUser }) => {
  const navigate = useNavigate();

  const defaultPlans = [
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

  const plansToShow = (Array.isArray(plans) && plans.length > 0 ? plans : defaultPlans)
    .filter(plan => plan?.id !== 'free'); // Remove free plan for FREE professors

  const handlePlanSelect = (plan) => {
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
  };

  return (
    <div className="space-y-12">
      {/* Welcome Section for Free Professors */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full -ml-16 -mt-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500 opacity-10 rounded-full -mr-20 -mb-20"></div>
        
        <div className="relative z-10">
          <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue, {currentUser?.firstName || 'Professeur'} !
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            Vous êtes actuellement sur le plan gratuit
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Passez à un plan premium pour débloquer toutes les fonctionnalités avancées
          </p>
          <button
            onClick={() => document.getElementById('plans-section').scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
          >
            Voir les plans disponibles <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Current Limitations */}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
            <X className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Limitations du plan gratuit</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-gray-700">Jusqu'à 3 quiz seulement</span>
            </div>
            <div className="flex items-center gap-3">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-gray-700">Jusqu'à 50 étudiants maximum</span>
            </div>
            <div className="flex items-center gap-3">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-gray-700">Pas de génération de quiz par IA</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-gray-700">Statistiques de base uniquement</span>
            </div>
            <div className="flex items-center gap-3">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-gray-700">Pas de rapports avancés</span>
            </div>
            <div className="flex items-center gap-3">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-gray-700">Support par email uniquement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div id="plans-section">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choisissez votre plan premium</h2>
          <p className="text-xl text-gray-600">Débloquez toutes les fonctionnalités pour créer des quiz exceptionnels</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {plansToShow.map((plan, idx) => {
            const IconComponent = plan?.icon || Crown;
            return (
              <div
                key={plan?.id || idx}
                className={`relative bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan?.popular 
                    ? 'border-blue-500 ring-4 ring-blue-100' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
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
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan?.color} flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan?.name || 'Plan'}</h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {(plan?.originalPrice || 0) > (plan?.price || 0) && (
                        <span className="text-lg text-gray-500 line-through">${plan?.originalPrice}</span>
                      )}
                      <span className="text-4xl font-bold text-gray-900">
                        ${plan?.price || 0}
                      </span>
                      <span className="text-gray-500">/{plan?.duration || 'mois'}</span>
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
                  </ul>

                  <button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={plan?.disabled}
                    className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
                      plan?.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                        : plan?.disabled
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {plan?.disabled ? 'Non disponible' : 'Choisir ce plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">IA Intégrée</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Générez automatiquement des quiz professionnels en quelques secondes avec notre IA avancée.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Génération automatique</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Questions personnalisables</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Différents formats de questions</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Gestion illimitée</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Créez autant de quiz que vous voulez pour un nombre illimité d'étudiants.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Quiz illimités</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Étudiants illimités</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Classes multiples</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FreeProfessorView;