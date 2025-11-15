import { useState } from 'react';
import { Search, Filter, CreditCard, Calendar, CheckCircle, Clock, XCircle, TrendingUp, User, DollarSign, BarChart3, PieChart, Activity, Plus, X, Crown, Eye, PlayCircle } from 'lucide-react';

export default function ListAbonnement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [showReport, setShowReport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [subscriptions, setSubscriptions] = useState([
    { id: 1, professor: 'Prof. Kawthar Chayeb', email: 'kawthar@gmail.com', plan: 'Premium', price: 49.99, status: 'active', startDate: '2025-01-15', endDate: '2025-02-15', paymentMethod: 'Carte Bancaire' },
    { id: 2, professor: 'Prof. Tasnim Belghith', email: 'tasnim@gmail.com', plan: 'Basic', price: 19.99, status: 'active', startDate: '2025-03-01', endDate: '2025-06-01', paymentMethod: 'PayPal' },
    { id: 3, professor: 'Prof. Rabeb Chtiti', email: 'rabeb@gmail.com', plan: 'Diamond', price: 99.99, status: 'active', startDate: '2025-02-01', endDate: '2025-05-01', paymentMethod: 'Virement' },
    { id: 4, professor: 'Prof. Karim Gharbi', email: 'karim@example.com', plan: 'Pro', price: 29.99, status: 'active', startDate: '2025-02-15', endDate: '2025-05-15', paymentMethod: 'Virement' },
    { id: 5, professor: 'Prof. Amen Azzouni', email: 'jerbi@gmail.com', plan: 'Basic', price: 19.99, status: 'pending', startDate: '2025-10-14', endDate: '2025-11-14', paymentMethod: 'Carte Bancaire' },
    { id: 6, professor: 'Prof. Aziz Mdalal', email: 'aziz@gmail.com', plan: 'Diamond', price: 99.99, status: 'active', startDate: '2025-05-01', endDate: '2025-08-01', paymentMethod: 'PayPal' },
    // Nouveaux professeurs en attente
    { id: 7, professor: 'Prof. Sarah Ben Ali', email: 'sarah.benali@example.com', plan: 'Pro', price: 29.99, status: 'pending', startDate: '2025-10-20', endDate: '2025-11-20', paymentMethod: 'Carte Bancaire' },
    { id: 8, professor: 'Prof. Mohamed Trabelsi', email: 'mohamed.trabelsi@example.com', plan: 'Premium', price: 49.99, status: 'pending', startDate: '2025-10-18', endDate: '2025-11-18', paymentMethod: 'PayPal' },
    { id: 9, professor: 'Prof. Leila Jlassi', email: 'leila.jlassi@example.com', plan: 'Basic', price: 19.99, status: 'pending', startDate: '2025-10-22', endDate: '2025-11-22', paymentMethod: 'Virement' },
    { id: 10, professor: 'Prof. Houssem Ghanmi', email: 'houssem.ghanmi@example.com', plan: 'Diamond', price: 99.99, status: 'pending', startDate: '2025-10-25', endDate: '2025-11-25', paymentMethod: 'Carte Bancaire' },
    // Nouveaux professeurs expirés
    { id: 11, professor: 'Prof. Amira Chaouch', email: 'amira.chaouch@example.com', plan: 'Pro', price: 29.99, status: 'expired', startDate: '2024-08-01', endDate: '2024-11-01', paymentMethod: 'PayPal' },
    { id: 12, professor: 'Prof. Youssef Hammami', email: 'youssef.hammami@example.com', plan: 'Premium', price: 49.99, status: 'expired', startDate: '2024-07-15', endDate: '2024-10-15', paymentMethod: 'Virement' },
    { id: 13, professor: 'Prof. Nadia Fersi', email: 'nadia.fersi@example.com', plan: 'Basic', price: 19.99, status: 'expired', startDate: '2024-09-01', endDate: '2024-12-01', paymentMethod: 'Carte Bancaire' },
    { id: 14, professor: 'Prof. Sami Boukadida', email: 'sami.boukadida@example.com', plan: 'Diamond', price: 99.99, status: 'expired', startDate: '2024-06-10', endDate: '2024-09-10', paymentMethod: 'PayPal' },
    { id: 15, professor: 'Prof. Ines Ben Yedder', email: 'ines.benyedder@example.com', plan: 'Pro', price: 29.99, status: 'expired', startDate: '2024-08-20', endDate: '2024-11-20', paymentMethod: 'Virement' }
  ]);

  // État pour le formulaire d'ajout
  const [newSubscription, setNewSubscription] = useState({
    professor: '',
    email: '',
    plan: 'Basic',
    price: 19.99,
    status: 'active',
    startDate: '',
    duration: '1',
    endDate: '',
    paymentMethod: 'Carte Bancaire'
  });

  // Options de durée
  const durationOptions = [
    { value: '1', label: '1 mois' },
    { value: '3', label: '3 mois' },
    { value: '6', label: '6 mois' },
    { value: '12', label: '12 mois' }
  ];

  // Fonction pour calculer la date de fin
  const calculateEndDate = (startDate, durationMonths) => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(start.getMonth() + parseInt(durationMonths));
    
    return end.toISOString().split('T')[0];
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const pendingCount = subscriptions.filter(s => s.status === 'pending').length;
  const expiredCount = subscriptions.filter(s => s.status === 'expired').length;
  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.price, 0);

  // Prix des plans
  const planPrices = {
    'Basic': 19.99,
    'Pro': 29.99,
    'Premium': 49.99,
    'Diamond': 99.99
  };

  // Fonction pour obtenir la couleur du badge selon le plan
  const getPlanColor = (plan) => {
    switch (plan) {
      case 'Diamond':
        return 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white';
      case 'Premium':
        return 'bg-purple-100 text-purple-700';
      case 'Pro':
        return 'bg-blue-100 text-blue-700';
      case 'Basic':
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Gestionnaire pour l'ajout d'abonnement
  const handleAddSubscription = (e) => {
    e.preventDefault();
    
    const endDate = calculateEndDate(newSubscription.startDate, newSubscription.duration);
    
    const newSub = {
      id: subscriptions.length + 1,
      ...newSubscription,
      price: parseFloat(newSubscription.price),
      endDate: endDate
    };
    
    setSubscriptions([...subscriptions, newSub]);
    setShowAddForm(false);
    setNewSubscription({
      professor: '',
      email: '',
      plan: 'Basic',
      price: 19.99,
      status: 'active',
      startDate: '',
      duration: '1',
      endDate: '',
      paymentMethod: 'Carte Bancaire'
    });
  };

  // Mise à jour des champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setNewSubscription(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      if (name === 'startDate' || name === 'duration') {
        updated.endDate = calculateEndDate(
          name === 'startDate' ? value : updated.startDate,
          name === 'duration' ? value : updated.duration
        );
      }
      
      return updated;
    });
  };

  // Mise à jour automatique du prix selon le plan
  const handlePlanChange = (e) => {
    const plan = e.target.value;
    setNewSubscription(prev => ({
      ...prev,
      plan: plan,
      price: planPrices[plan]
    }));
  };

  // Fonction pour afficher les détails d'un abonnement
  const handleShowDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
  };

  // Fonction pour activer un abonnement en attente
  const handleActivateSubscription = (subscriptionId) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === subscriptionId 
        ? { ...sub, status: 'active' }
        : sub
    ));
  };

  // Fonction pour renouveler un abonnement expiré
  const handleRenewSubscription = (subscriptionId) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === subscriptionId 
        ? { 
            ...sub, 
            status: 'active',
            startDate: new Date().toISOString().split('T')[0],
            endDate: calculateEndDate(new Date().toISOString().split('T')[0], '1')
          }
        : sub
    ));
  };

  // Fonction pour calculer les jours restants
  const calculateDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Fonction pour calculer les jours depuis l'expiration
  const calculateDaysSinceExpired = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = today - end;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Données pour les graphiques du rapport mensuel
  const quizStats = {
    monthlyData: [45, 52, 48, 67, 55, 60, 58, 72, 65, 70, 68, 47],
    subjectDistribution: [
      { subject: 'Mathématiques', value: 35, color: '#624BFF' },
      { subject: 'Sciences', value: 25, color: '#10B981' },
      { subject: 'Histoire', value: 20, color: '#F59E0B' },
      { subject: 'Français', value: 15, color: '#EF4444' },
      { subject: 'Autres', value: 5, color: '#6B7280' }
    ],
    weeklyParticipation: [124, 189, 156, 145, 178, 201, 165],
    successRateBySubject: [
      { subject: 'Mathématiques', rate: 82 },
      { subject: 'Sciences', rate: 75 },
      { subject: 'Histoire', rate: 68 },
      { subject: 'Français', rate: 71 }
    ]
  };

  // Composants graphiques pour le rapport
  const BarChart = ({ data, title, color = '#624BFF' }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>
      <div className="flex items-end justify-between h-32 gap-1">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full rounded-t transition-all duration-300 hover:opacity-80"
              style={{
                height: `${(value / Math.max(...data)) * 100}%`,
                backgroundColor: color,
                minHeight: '4px'
              }}
            />
            <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const PieChartComponent = ({ data, title }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg viewBox="0 0 32 32" className="w-32 h-32 transform -rotate-90">
            {data.reduce((acc, item, index) => {
              const previousValue = acc.reduce((sum, i) => sum + i.value, 0);
              const circumference = 2 * Math.PI * 15.9155;
              const strokeDasharray = `${(item.value / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((previousValue / 100) * circumference);
              
              acc.push(
                <circle
                  key={index}
                  cx="16"
                  cy="16"
                  r="15.9155"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="2"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              );
              return acc;
            }, [])}
          </svg>
        </div>
        <div className="space-y-2 w-full">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-sm mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600">{item.subject}</span>
              </div>
              <span className="font-medium text-gray-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max = 100, color = '#624BFF' }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${(value / max) * 100}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#624BFF] text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Gestion des Abonnements</h1>
              <p className="text-purple-100 text-sm mt-1">Surveiller et gérer les abonnements des professeurs</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-white text-[#624BFF] font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
               + Ajouter Abonnement
              </button>
              <button 
                onClick={() => setShowReport(!showReport)}
                className="px-6 py-3 bg-white text-[#624BFF] font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {showReport ? 'Retour aux Abonnements' : 'Rapport Mensuel'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal d'ajout d'abonnement */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Nouvel Abonnement</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubscription} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professeur *
                </label>
                <input
                  type="text"
                  name="professor"
                  value={newSubscription.professor}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nom du professeur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newSubscription.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan *
                  </label>
                  <select
                    name="plan"
                    value={newSubscription.plan}
                    onChange={handlePlanChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Premium">Premium</option>
                    <option value="Diamond">Diamond</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (DT)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={newSubscription.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut *
                  </label>
                  <select
                    name="status"
                    value={newSubscription.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="active">Actif</option>
                    <option value="pending">En attente</option>
                    <option value="expired">Expiré</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode de Paiement *
                  </label>
                  <select
                    name="paymentMethod"
                    value={newSubscription.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Carte Bancaire">Carte Bancaire</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Virement">Virement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de Début *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={newSubscription.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée de l'abonnement *
                  </label>
                  <select
                    name="duration"
                    value={newSubscription.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newSubscription.endDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Date de fin calculée :</strong> {newSubscription.endDate}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Ajouter l'Abonnement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détails de l'abonnement */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Détails de l'Abonnement</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedSubscription.professor.charAt(5)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedSubscription.professor}</h3>
                  <p className="text-gray-600">{selectedSubscription.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan d'abonnement</label>
                    <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${getPlanColor(selectedSubscription.plan)}`}>
                      {selectedSubscription.plan === 'Diamond' && <Crown className="w-4 h-4 mr-1" />}
                      {selectedSubscription.plan}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix</label>
                    <p className="text-lg font-bold text-gray-900">{selectedSubscription.price.toFixed(2)} DT</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
                    <div className="flex items-center text-gray-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      {selectedSubscription.paymentMethod}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Début: {selectedSubscription.startDate}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Fin: {selectedSubscription.endDate}</span>
                      </div>
                      {selectedSubscription.status === 'active' && (
                        <div className="flex items-center text-sm text-green-600 font-medium">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{calculateDaysRemaining(selectedSubscription.endDate)} jours restants</span>
                        </div>
                      )}
                      {selectedSubscription.status === 'expired' && (
                        <div className="flex items-center text-sm text-red-600 font-medium">
                          <XCircle className="w-4 h-4 mr-2" />
                          <span>Expiré depuis {calculateDaysSinceExpired(selectedSubscription.endDate)} jours</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      selectedSubscription.status === 'active' ? 'bg-green-100 text-green-700' :
                      selectedSubscription.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedSubscription.status === 'active' ? 'Actif' :
                       selectedSubscription.status === 'pending' ? 'En attente' : 'Expiré'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                {selectedSubscription.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleActivateSubscription(selectedSubscription.id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Activer l'abonnement
                  </button>
                )}
                {selectedSubscription.status === 'expired' && (
                  <button
                    onClick={() => {
                      handleRenewSubscription(selectedSubscription.id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Renouveler
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {showReport ? (
          // RAPPORT MENSUEL AVEC GRAPHIQUES
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-800">Rapport Mensuel - Statistiques Quiz</h2>
                <span className="text-sm text-gray-500">Mois de Octobre 2025</span>
              </div>
              <p className="text-gray-600">Analyse des performances et participation aux quiz ce mois-ci</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="text-purple-600 text-sm font-medium">Quiz Créés</div>
                <div className="text-2xl font-bold text-purple-700 mt-2">47</div>
                <div className="text-green-600 text-sm mt-1">↑ 12% vs mois dernier</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-blue-600 text-sm font-medium">Participations</div>
                <div className="text-2xl font-bold text-blue-700 mt-2">1,248</div>
                <div className="text-green-600 text-sm mt-1">↑ 8% vs mois dernier</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-green-600 text-sm font-medium">Taux de Réussite</div>
                <div className="text-2xl font-bold text-green-700 mt-2">78%</div>
                <div className="text-green-600 text-sm mt-1">↑ 5% vs mois dernier</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <div className="text-orange-600 text-sm font-medium">Temps Moyen</div>
                <div className="text-2xl font-bold text-orange-700 mt-2">12min</div>
                <div className="text-gray-600 text-sm mt-1">stable</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Participation Hebdomadaire */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-800">Participation Hebdomadaire</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-3 h-3 bg-[#624BFF] rounded-full"></div>
                    <span>Semaine en cours</span>
                  </div>
                </div>
                
                <div className="flex items-end justify-between h-48 gap-3 px-2">
                  {[
                    { day: 'Lun', value: 124, label: 'Lundi' },
                    { day: 'Mar', value: 189, label: 'Mardi' },
                    { day: 'Mer', value: 156, label: 'Mercredi' },
                    { day: 'Jeu', value: 145, label: 'Jeudi' },
                    { day: 'Ven', value: 178, label: 'Vendredi' },
                    { day: 'Sam', value: 201, label: 'Samedi' },
                    { day: 'Dim', value: 165, label: 'Dimanche' }
                  ].map((item, index) => {
                    const maxValue = 201;
                    const height = (item.value / maxValue) * 100;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1 group relative">
                        <div className="relative w-full flex justify-center">
                          <div
                            className="w-10 rounded-t-lg transition-all duration-500 hover:shadow-lg group-hover:scale-105 relative"
                            style={{
                              height: `${height}%`,
                              minHeight: '20px',
                              background: `linear-gradient(to top, #624BFF, #8B7AFF)`,
                              cursor: 'pointer'
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                              {item.label}: {item.value} participants
                            </div>
                          </div>
                        </div>
                        
                        <span className="text-sm font-medium text-gray-600 mt-3">{item.day}</span>
                        
                        <span className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Total semaine: 1,158 participants</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +15% vs semaine dernière
                  </span>
                </div>
              </div>

              {/* Répartition par Matière */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-800">Répartition par Matière</h4>
                  <div className="text-sm text-gray-500">
                    Total: 100 quiz
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 32 32" className="w-48 h-48 transform -rotate-90">
                      {[
                        { value: 35, color: '#624BFF' },
                        { value: 25, color: '#10B981' },
                        { value: 20, color: '#F59E0B' },
                        { value: 15, color: '#EF4444' },
                        { value: 5, color: '#6B7280' }
                      ].reduce((acc, item, index) => {
                        const previousValue = acc.reduce((sum, i) => sum + i.value, 0);
                        const circumference = 2 * Math.PI * 15.9155;
                        const strokeDasharray = `${(item.value / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -((previousValue / 100) * circumference);
                        
                        acc.push(
                          <circle
                            key={index}
                            cx="16"
                            cy="16"
                            r="15.9155"
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth="3"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-700"
                          />
                        );
                        return acc;
                      }, [])}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">100%</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 ml-6 space-y-4">
                    {[
                      { subject: 'Mathématiques', value: 35, color: '#624BFF' },
                      { subject: 'Sciences', value: 25, color: '#10B981' },
                      { subject: 'Histoire', value: 20, color: '#F59E0B' },
                      { subject: 'Français', value: 15, color: '#EF4444' },
                      { subject: 'Autres', value: 5, color: '#6B7280' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3 transition-transform group-hover:scale-110"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{item.value}%</div>
                          <div className="text-xs text-gray-500">
                            {item.value} quiz
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Taux de Réussite par Matière */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-800">Taux de Réussite par Matière</h4>
                  <div className="text-sm text-green-600 font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Moyenne: 76.5%
                  </div>
                </div>
                <div className="space-y-5">
                  {[
                    { subject: 'Mathématiques', rate: 82 },
                    { subject: 'Sciences', rate: 75 },
                    { subject: 'Histoire', rate: 68 },
                    { subject: 'Français', rate: 71 }
                  ].map((item, index) => {
                    const colors = ['#624BFF', '#10B981', '#F59E0B', '#EF4444'];
                    const color = colors[index];
                    return (
                      <div key={index} className="group">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-3 transition-transform group-hover:scale-125"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-gray-900 mr-2">{item.rate}%</span>
                            {item.rate >= 80 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : item.rate >= 70 ? (
                              <Clock className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg"
                            style={{
                              width: `${item.rate}%`,
                              backgroundColor: color,
                              background: `linear-gradient(90deg, ${color}, ${color}DD)`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Performance globale</span>
                    <span>Excellent en Mathématiques</span>
                  </div>
                </div>
              </div>

              {/* Évolution Mensuelle des Quiz */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-800">Évolution Mensuelle des Quiz</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>2024</span>
                  </div>
                </div>
                
                <div className="flex items-end justify-between h-48 gap-2 px-1">
                  {[
                    { month: 'J', value: 45, name: 'Janvier' },
                    { month: 'F', value: 52, name: 'Février' },
                    { month: 'M', value: 48, name: 'Mars' },
                    { month: 'A', value: 67, name: 'Avril' },
                    { month: 'M', value: 55, name: 'Mai' },
                    { month: 'J', value: 60, name: 'Juin' },
                    { month: 'J', value: 58, name: 'Juillet' },
                    { month: 'A', value: 72, name: 'Août' },
                    { month: 'S', value: 65, name: 'Septembre' },
                    { month: 'O', value: 70, name: 'Octobre' },
                    { month: 'N', value: 68, name: 'Novembre' },
                    { month: 'D', value: 47, name: 'Décembre' }
                  ].map((item, index) => {
                    const maxValue = 72;
                    const height = (item.value / maxValue) * 100;
                    const isCurrentMonth = item.month === 'N';
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1 group relative">
                        <div className="relative w-full flex justify-center">
                          <div
                            className={`w-7 rounded-t-lg transition-all duration-500 hover:shadow-lg group-hover:scale-105 ${
                              isCurrentMonth ? 'ring-2 ring-green-400 ring-opacity-50' : ''
                            }`}
                            style={{
                              height: `${height}%`,
                              minHeight: '15px',
                              background: `linear-gradient(to top, #10B981, #34D399)`,
                              cursor: 'pointer'
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                              {item.name}: {item.value} quiz
                            </div>
                          </div>
                        </div>
                        
                        <span className={`text-sm font-medium mt-3 ${
                          isCurrentMonth ? 'text-green-600 font-bold' : 'text-gray-600'
                        }`}>
                          {item.month}
                        </span>
                        
                        <span className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Total annuel: 707 quiz</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +22% vs 2023
                  </span>
                </div>
              </div>
            </div>

            {/* Quiz Populaires */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-800">Quiz les Plus Populaires</h3>
                </div>
                <div className="text-sm text-gray-500">
                  Classement par participation
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: "Quiz de Mathématiques Avancées", participants: 284, growth: 12, rank: 1 },
                  { name: "Histoire de France - Révolution", participants: 197, growth: 8, rank: 2 },
                  { name: "Sciences Physiques - Mécanique", participants: 165, growth: 15, rank: 3 },
                  { name: "Grammaire Française - Niveau Expert", participants: 142, growth: 5, rank: 4 },
                  { name: "Géographie Mondiale - Capitales", participants: 128, growth: -2, rank: 5 }
                ].map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 ${
                        quiz.rank === 1 ? 'bg-yellow-500' :
                        quiz.rank === 2 ? 'bg-gray-400' :
                        quiz.rank === 3 ? 'bg-orange-500' : 'bg-purple-500'
                      }`}>
                        {quiz.rank}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                          {quiz.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Créé le 15 Nov 2024
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{quiz.participants}</div>
                      <div className={`text-xs flex items-center justify-end ${
                        quiz.growth > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {quiz.growth > 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingUp className="w-3 h-3 mr-1 transform rotate-180" />
                        )}
                        {Math.abs(quiz.growth)}% ce mois
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Moyenne: 183 participants/quiz
                  </span>
                  <button className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors flex items-center">
                    Voir tous les quiz
                    <TrendingUp className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // INTERFACE NORMALE DES ABONNEMENTS
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Actifs</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{activeCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% ce mois
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">En Attente</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{pendingCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-orange-600">
                  <Clock className="w-4 h-4 mr-1" />
                  En attente de paiement
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Expirés</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{expiredCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-red-600">
                  <XCircle className="w-4 h-4 mr-1" />
                  Nécessitent renouvellement
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Revenu Mensuel</p>
                    <p className="text-3xl font-bold mt-1">{totalRevenue.toFixed(2)} DT</p>
                  </div>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-purple-100">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +18% vs mois dernier
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="active">Actifs</option>
                      <option value="pending">En attente</option>
                      <option value="expired">Expirés</option>
                    </select>
                  </div>
                  <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="all">Tous les plans</option>
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Premium">Premium</option>
                    <option value="Diamond">Diamond</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Professeur</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prix</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Période</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paiement</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSubscriptions.map(sub => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                              {sub.professor.charAt(5)}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{sub.professor}</p>
                              <p className="text-xs text-gray-500">{sub.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(sub.plan)} ${
                            sub.plan === 'Diamond' ? 'flex items-center gap-1' : ''
                          }`}>
                            {sub.plan === 'Diamond' && <Crown className="w-3 h-3" />}
                            {sub.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                            {sub.price.toFixed(2)} DT
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <Calendar className="w-3 h-3 mr-1" />
                              Début: {sub.startDate}
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <Calendar className="w-3 h-3 mr-1" />
                              Fin: {sub.endDate}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                            {sub.paymentMethod}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            sub.status === 'active' ? 'bg-green-100 text-green-700' :
                            sub.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {sub.status === 'active' ? 'Actif' :
                             sub.status === 'pending' ? 'En attente' : 'Expiré'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleShowDetails(sub)}
                              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Détails
                            </button>
                            {sub.status === 'pending' && (
                              <button 
                                onClick={() => handleActivateSubscription(sub.id)}
                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                              >
                                <PlayCircle className="w-3 h-3" />
                                Activer
                              </button>
                            )}
                            {sub.status === 'expired' && (
                              <button 
                                onClick={() => handleRenewSubscription(sub.id)}
                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Renouveler
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}