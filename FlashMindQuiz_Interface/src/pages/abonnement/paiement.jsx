import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CreditCard, Lock, CheckCircle, ArrowLeft, Calendar, Shield, Crown } from 'lucide-react';

export default function PagePaiement() {
  const navigate = useNavigate(); // pour navigation
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    email: '',
    country: 'Tunisie',
  });

  const premiumPlan = {
    id: 'premium',
    name: 'Premium Pro',
    price: 49900, 
    duration: 'mois',
    features: ['Étudiants illimités', 'Quizzes illimités', 'Sécurité renforcée', 'Génération de quiz par IA', 'Statistiques avancées'],
    color: 'from-[#6B4FFF] to-[#8B6FFF]',
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Paiement effectué avec succès ! Votre abonnement Premium Pro a été renouvelé.');
  };

  const goBack = () => {
    navigate('/professor/abonnement'); // revenir à la page abonnement
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
     <div className="bg-[#624BFF] text-white px-8 py-6 flex items-center justify-between shadow-md"> 
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-xl transition-all"
          >
            <ArrowLeft className="w-7 h-7 text-white" />
          </button>
         <h1 className="text-3xl font-bold">Renouveler l'abonnement</h1>  
        </div>
        <div className="flex items-center gap-6">
          <button className="relative p-3 hover:bg-white hover:bg-opacity-10 rounded-xl transition-all">
            <Bell className="w-7 h-7 text-white" />
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

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section gauche - Informations de paiement */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Informations de paiement</h2>
                
                {/* Méthodes de paiement */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Méthode de paiement</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#6B4FFF] bg-[#F5F3FF]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                      <p className="text-sm font-semibold text-gray-900">Carte</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === 'paypal'
                          ? 'border-[#6B4FFF] bg-[#F5F3FF]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">💳</div>
                      <p className="text-sm font-semibold text-gray-900">PayPal</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === 'bank'
                          ? 'border-[#6B4FFF] bg-[#F5F3FF]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">🏦</div>
                      <p className="text-sm font-semibold text-gray-900">Virement bancaire</p>
                    </button>
                  </div>
                </div>

                {/* Formulaire de carte */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Numéro de carte</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="5359 4010 2951 2944"
                          className="w-full pl-5 pr-14 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#624BFF] focus:border-transparent text-base"
                          required
                        />
                        <CreditCard className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Nom du titulaire</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="Tasnim Belghith"
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#624BFF] focus:border-transparent text-base"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Date d'expiration</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/AA"
                            className="w-full pl-5 pr-14 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#624BFF] focus:border-transparent text-base"
                            required
                          />
                          <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">CVV</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="693"
                            maxLength="3"
                            className="w-full pl-5 pr-14 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#624BFF] focus:border-transparent text-base"
                            required
                          />
                          <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Adresse e-mail</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="votre.email@example.com"
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#624BFF] focus:border-transparent text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Pays</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#624BFF] focus:border-transparent text-base"
                      >
                        <option value="Tunisie">Tunisie</option>
                        <option value="France">France</option>
                        <option value="USA">États-Unis</option>
                        <option value="UK">Royaume-Uni</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                  </form>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💳</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Paiement PayPal</h3>
                    <p className="text-gray-600 mb-6">Vous serez redirigé vers PayPal pour compléter votre paiement</p>
                    <button className="px-8 py-4 bg-[#0070BA] text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all">
                      Continuer avec PayPal
                    </button>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏦</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Virement bancaire</h3>
                    <p className="text-gray-600 mb-6">Les détails du transfert seront envoyés par e-mail</p>
                    <button className="px-8 py-4 bg-gradient-to-r from-[#6B4FFF] to-[#8B6FFF] text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all">
                      Obtenir les détails
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section droite - Résumé de la commande */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Résumé de la commande</h2>
                
                <div className={`bg-gradient-to-br ${premiumPlan.color} rounded-2xl p-6 mb-6 text-white`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Crown className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">{premiumPlan.name}</h3>
                  </div>
                  <p className="text-white text-opacity-90 text-sm">Abonnement mensuel</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Sous-total</span>
                    <span className="font-semibold">{premiumPlan.price} millimes</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Taxe (TVA 19%)</span>
                    <span className="font-semibold">{Math.round(premiumPlan.price * 0.19)} millimes</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-4 flex justify-between text-gray-900">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-xl font-bold">{Math.round(premiumPlan.price * 1.19)} millimes</span>
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-blue-900 mb-1">Paiement sécurisé</h4>
                      <p className="text-blue-800 text-xs">Vos informations de paiement sont cryptées et sécurisées</p>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-gradient-to-r from-[#6B4FFF] to-[#8B6FFF] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    Effectuer le paiement
                  </button>
                )}

                <p className="text-center text-gray-500 text-xs mt-4">
                  En complétant cet achat, vous acceptez nos Conditions d'utilisation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
