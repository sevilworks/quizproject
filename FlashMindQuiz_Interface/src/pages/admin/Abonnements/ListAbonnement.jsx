import { useState, useEffect } from 'react';
import { Search, Filter, CreditCard, Calendar, CheckCircle, Clock, XCircle, TrendingUp, User, DollarSign, BarChart3, PieChart, Activity, Plus, X, Crown, Eye, PlayCircle, Loader, AlertCircle } from 'lucide-react';
import adminService from '../../../services/adminService.js';

export default function ListAbonnement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [showReport, setShowReport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  
  // État pour le formulaire d'ajout
  const [newSubscription, setNewSubscription] = useState({
    professorId: '',
    plan: 'Basic',
    price: 19.99,
    status: 'active',
    startDate: '',
    duration: '1',
    endDate: '',
    paymentMethod: 'Carte Bancaire'
  });

  // État pour les professeurs gratuits
  const [freeProfessors, setFreeProfessors] = useState([]);
  const [loadingFreeProfessors, setLoadingFreeProfessors] = useState(false);

  // Fetch subscriptions data
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const subscriptionsData = await adminService.getSubscriptions();
        
        // Process and normalize subscription data
        const processedSubscriptions = subscriptionsData.map(sub => ({
          id: sub.id,
          professor: sub.professor?.user?.fullName || sub.professor?.fullName || sub.professor?.username || 'N/A',
          email: sub.professor?.user?.email || sub.professor?.email || 'N/A',
          plan: sub.planType || sub.type || 'Basic',
          price: sub.price || 0,
          status: sub.isActive ? 'active' : 'inactive',
          startDate: sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          paymentMethod: sub.paymentMethod || 'Carte Bancaire',
          isActive: sub.isActive !== false
        }));
        
        setSubscriptions(processedSubscriptions);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError('Erreur lors du chargement des abonnements');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

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

  // Fonction pour obtenir FREE professors
  const fetchFreeProfessors = async () => {
    try {
      setLoadingFreeProfessors(true);
      const freeProf = await adminService.getFreeProfessors();
      setFreeProfessors(freeProf);
    } catch (err) {
      console.error('Error fetching free professors:', err);
      setError('Erreur lors du chargement des professeurs gratuits');
    } finally {
      setLoadingFreeProfessors(false);
    }
  };

  // Fonction pour ouvrir le formulaire et charger les FREE professors
  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setError(null);
    fetchFreeProfessors();
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
  const handleAddSubscription = async (e) => {
    e.preventDefault();
    
    if (!newSubscription.professorId) {
      setError('Veuillez sélectionner un professeur');
      return;
    }
    
    try {
      const endDate = calculateEndDate(newSubscription.startDate, newSubscription.duration);
      
      const selectedProfessor = freeProfessors.find(p => p.user_id === parseInt(newSubscription.professorId));
      if (!selectedProfessor) {
        setError('Professeur sélectionné invalide');
        return;
      }
      
      const subscriptionData = {
        professorId: parseInt(newSubscription.professorId),
        planType: newSubscription.plan,
        price: parseFloat(newSubscription.price),
        startDate: newSubscription.startDate,
        endDate: endDate,
        paymentMethod: newSubscription.paymentMethod,
        isActive: newSubscription.status === 'active'
      };
      
      await adminService.createSubscription(subscriptionData);
      
      // Refresh the subscriptions list
      const updatedSubscriptions = await adminService.getSubscriptions();
      const processedSubscriptions = updatedSubscriptions.map(sub => ({
        id: sub.id,
        professor: sub.professor?.user?.fullName || sub.professor?.fullName || sub.professor?.username || 'N/A',
        email: sub.professor?.user?.email || sub.professor?.email || 'N/A',
        plan: sub.planType || sub.type || 'Basic',
        price: sub.price || 0,
        status: sub.isActive ? 'active' : 'inactive',
        startDate: sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: sub.paymentMethod || 'Carte Bancaire',
        isActive: sub.isActive !== false
      }));
      
      setSubscriptions(processedSubscriptions);
      setShowAddForm(false);
      setNewSubscription({
        professorId: '',
        plan: 'Basic',
        price: 19.99,
        status: 'active',
        startDate: '',
        duration: '1',
        endDate: '',
        paymentMethod: 'Carte Bancaire'
      });
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError('Erreur lors de la création de l\'abonnement');
    }
  };

  // Gestionnaire pour la sélection du professeur
  const handleProfessorChange = (e) => {
    const professorId = e.target.value;
    const selectedProfessor = freeProfessors.find(p => p.user_id === parseInt(professorId));
    
    setNewSubscription(prev => ({
      ...prev,
      professorId: professorId,
      professorName: selectedProfessor ?
        ((selectedProfessor.first_name && selectedProfessor.last_name)
          ? `${selectedProfessor.first_name} ${selectedProfessor.last_name}`.trim()
          : `Professeur ${selectedProfessor.user_id}`) : ''
    }));
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

  // Fonction pour supprimer un abonnement
  const handleDeleteSubscription = async (subscriptionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      try {
        await adminService.deleteSubscription(subscriptionId);
        setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
      } catch (err) {
        console.error('Error deleting subscription:', err);
        setError('Erreur lors de la suppression de l\'abonnement');
      }
    }
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
                onClick={handleOpenAddForm}
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
                  Professeur Gratuit (FREE) *
                </label>
                {loadingFreeProfessors ? (
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-gray-600">Chargement des professeurs...</span>
                    </div>
                  </div>
                ) : (
                  <select
                    name="professorId"
                    value={newSubscription.professorId}
                    onChange={handleProfessorChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">-- Sélectionner un professeur gratuit --</option>
                    {freeProfessors.map(professor => {
                      const fullName = (professor.first_name && professor.last_name)
                        ? `${professor.first_name} ${professor.last_name}`.trim()
                        : `Professeur ${professor.user_id}`;
                      
                      return (
                        <option key={professor.user_id} value={professor.user_id}>
                          {fullName}
                        </option>
                      );
                    })}
                  </select>
                )}
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
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSubscription({
                      professorId: '',
                      plan: 'Basic',
                      price: 19.99,
                      status: 'active',
                      startDate: '',
                      duration: '1',
                      endDate: '',
                      paymentMethod: 'Carte Bancaire'
                    });
                    setFreeProfessors([]);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newSubscription.professorId}
                  className={`flex-1 px-4 py-3 font-medium rounded-lg transition-colors ${
                    !newSubscription.professorId
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
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
                  {selectedSubscription.professor.charAt(0)}
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {showReport ? (
          // RAPPORT MENSUEL AVEC GRAPHIQUES
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-800">Rapport Mensuel - Statistiques Quiz</h2>
                <span className="text-sm text-gray-500">Mois de Novembre 2025</span>
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
                              {sub.professor.charAt(0)}
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