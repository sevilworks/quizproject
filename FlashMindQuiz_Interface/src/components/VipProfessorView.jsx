import React from 'react';
import { Bell, Crown, Calendar, CreditCard, CheckCircle, AlertTriangle, X, Loader2, Star, Download, Shield, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../services/subscriptionService';

const VipProfessorView = ({ subscription, hasActiveSubscription, daysRemaining, isExpiringSoon, billingHistory, showNotification, onCloseNotification, onRefreshData }) => {
  const navigate = useNavigate();

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    return subscriptionService.formatDate(dateString);
  };

  const formatPrice = (price) => {
    return subscriptionService.formatPrice(price);
  };

  const getStatusText = () => {
    if (!hasActiveSubscription) return 'Aucun abonnement actif';
    if (!subscription) return 'Chargement...';
    return subscriptionService.getStatusText(subscription.isActive, subscription.endDate);
  };

  const getPlanName = () => {
    if (!subscription) return 'Aucun abonnement';
    return subscription.planType || 'Plan inconnu';
  };

  return (
    <div className="space-y-8">
      {/* Notification for expiring subscriptions */}
      {showNotification && hasActiveSubscription && isExpiringSoon && (
        <div className="flex justify-center">
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
                onClick={onCloseNotification}
                className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      {hasActiveSubscription && subscription ? (
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
                  <p className="text-white text-opacity-80">Abonnement Premium Actif</p>
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
              <button
                onClick={onRefreshData}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-all"
              >
                Actualiser
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-3xl shadow-xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500 opacity-10 rounded-full -ml-16 -mt-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-500 opacity-10 rounded-full -mr-20 -mb-20"></div>
          
          <div className="relative z-10">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Problème avec l'abonnement</h2>
            <p className="text-xl text-gray-600 mb-2">
              Nous ne trouvons pas d'abonnement actif pour votre compte VIP
            </p>
            <p className="text-lg text-gray-500 mb-8">
              Veuillez contacter le support ou réessayer de configurer votre abonnement
            </p>
            <button
              onClick={onRefreshData}
              className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Loader2 className="w-5 h-5" />
              Actualiser les données
            </button>
          </div>
        </div>
      )}

      {/* Benefits of VIP Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Statistiques Avancées</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Analysez les performances de vos étudiants avec des outils d'analyse complets.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Rapports détaillés</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Graphiques interactifs</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Métriques personnalisées</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Sécurité Renforcée</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Protégez vos données et celles de vos étudiants avec les plus hauts standards.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Chiffrement end-to-end</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Sauvegarde automatique</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Conformité RGPD</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Support Prioritaire</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Bénéficiez d'un support client premium avec des temps de réponse optimisés.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Support 24/7</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Chat en direct</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Priorité absolue</span>
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
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#6B4FFF] text-white rounded-lg font-semibold hover:bg-[#5B3FEF] transition-all">
                        <Download className="w-4 h-4" />
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
  );
};

export default VipProfessorView;