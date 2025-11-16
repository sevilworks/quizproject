import { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle, User, Calendar, Send, Construction, Info, Loader } from 'lucide-react';
import adminService from '../../../services/adminService.js';

export default function ListReclamation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reclamations data
  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch reclamations from API (may not exist yet)
        const reclamationsData = await adminService.getReclamations().catch(() => null);
        
        if (reclamationsData) {
          // Process and normalize reclamation data from API
          const processedReclamations = reclamationsData.map(rec => ({
            id: rec.id,
            student: rec.student?.user?.fullName || rec.student?.fullName || rec.student?.username || 'N/A',
            email: rec.student?.user?.email || rec.student?.email || 'N/A',
            subject: rec.subject || 'Sujet non spécifié',
            message: rec.message || 'Message non disponible',
            category: rec.category || 'Général',
            priority: rec.priority || 'medium',
            status: rec.status || 'pending',
            createdAt: rec.createdAt ? new Date(rec.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            responses: rec.responses || []
          }));
          
          setReclamations(processedReclamations);
        } else {
          // Use fallback static data with API integration patterns
          console.log('Using fallback data - API endpoint not available yet');
          setReclamations([
            {
              id: 1,
              student: 'Ahmed Ben Ali',
              email: 'ahmed@example.com',
              subject: 'Problème d\'accès au quiz',
              message: 'Je ne peux pas accéder au quiz de mathématiques. Le système affiche une erreur 404.',
              category: 'Technique',
              priority: 'high',
              status: 'pending',
              createdAt: '2024-10-14 10:30',
              responses: []
            },
            {
              id: 2,
              student: 'Leila Khaled',
              email: 'leila@example.com',
              subject: 'Note incorrecte',
              message: 'Ma note finale pour le quiz d\'histoire ne correspond pas à mes réponses correctes.',
              category: 'Notes',
              priority: 'medium',
              status: 'in_progress',
              createdAt: '2024-10-13 14:20',
              responses: [
                { date: '2024-10-13 15:00', text: 'Nous examinons votre cas. Merci de votre patience.' }
              ]
            },
            {
              id: 3,
              student: 'Amine Sassi',
              email: 'amine@example.com',
              subject: 'Question sur l\'abonnement',
              message: 'Comment puis-je annuler mon abonnement premium ?',
              category: 'Abonnement',
              priority: 'low',
              status: 'resolved',
              createdAt: '2024-10-12 09:15',
              responses: [
                { date: '2024-10-12 10:30', text: 'Vous pouvez annuler depuis votre profil > Paramètres > Abonnement.' }
              ]
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching reclamations:', err);
        setError('Erreur lors du chargement des réclamations');
        // Keep fallback data on error
        setReclamations([
          {
            id: 1,
            student: 'Démonstration',
            email: 'demo@example.com',
            subject: 'Fonctionnalité en développement',
            message: 'Les données de démonstration sont affichées car l\'API backend n\'est pas encore disponible.',
            category: 'Système',
            priority: 'medium',
            status: 'pending',
            createdAt: new Date().toISOString().split('T')[0],
            responses: []
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReclamations();
  }, []);

  const filteredReclamations = reclamations.filter(rec => {
    const matchesSearch = rec.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || rec.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingCount = reclamations.filter(r => r.status === 'pending').length;
  const inProgressCount = reclamations.filter(r => r.status === 'in_progress').length;
  const resolvedCount = reclamations.filter(r => r.status === 'resolved').length;

  // Function to send response to reclamation
  const handleSendResponse = async () => {
    if (!responseText.trim() || !selectedReclamation) return;
    
    try {
      setError(null);
      
      // Try to send response via API
      const responseData = {
        reclamationId: selectedReclamation.id,
        response: responseText.trim(),
        sentAt: new Date().toISOString()
      };
      
      await adminService.sendReclamationResponse(responseData).catch(() => {
        // Fallback to local update if API not available
        console.log('API not available, updating locally');
        setReclamations(reclamations.map(rec =>
          rec.id === selectedReclamation.id
            ? {
                ...rec,
                responses: [
                  ...rec.responses,
                  { date: new Date().toISOString().split('T')[0], text: responseText.trim() }
                ],
                status: 'in_progress'
              }
            : rec
        ));
        return { success: true };
      });
      
      // Clear response and close modal
      setResponseText('');
      setSelectedReclamation(null);
      
    } catch (err) {
      console.error('Error sending response:', err);
      setError('Erreur lors de l\'envoi de la réponse');
    }
  };

  // Function to mark reclamation as resolved
  const handleMarkAsResolved = async () => {
    if (!selectedReclamation) return;
    
    try {
      setError(null);
      
      // Try to update status via API
      await adminService.updateReclamationStatus(selectedReclamation.id, 'resolved').catch(() => {
        // Fallback to local update if API not available
        console.log('API not available, updating locally');
        setReclamations(reclamations.map(rec =>
          rec.id === selectedReclamation.id
            ? { ...rec, status: 'resolved' }
            : rec
        ));
        return { success: true };
      });
      
      // Close modal
      setSelectedReclamation(null);
      
    } catch (err) {
      console.error('Error marking as resolved:', err);
      setError('Erreur lors de la résolution de la réclamation');
    }
  };

  const ReclamationDetailModal = ({ reclamation, onClose }) => {
    if (!reclamation) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Détails de la Réclamation</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                reclamation.priority === 'high' ? 'bg-red-100 text-red-700' :
                reclamation.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {reclamation.priority === 'high' ? 'Haute priorité' :
                 reclamation.priority === 'medium' ? 'Priorité moyenne' : 'Faible priorité'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                reclamation.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                reclamation.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }`}>
                {reclamation.status === 'pending' ? 'En attente' :
                 reclamation.status === 'in_progress' ? 'En cours' : 'Résolue'}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {reclamation.category}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {reclamation.student.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{reclamation.student}</p>
                  <p className="text-sm text-gray-500">{reclamation.email}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Calendar className="w-4 h-4 mr-2" />
                {reclamation.createdAt}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{reclamation.subject}</h3>
              <p className="text-gray-700 leading-relaxed">{reclamation.message}</p>
            </div>

            {reclamation.responses.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Historique des réponses</h3>
                {reclamation.responses.map((response, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      {response.date} - Admin
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{response.text}</p>
                  </div>
                ))}
              </div>
            )}

            {reclamation.status !== 'resolved' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Envoyer une réponse</h3>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Tapez votre réponse ici... Vous pouvez écrire un message aussi long que nécessaire."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {responseText.length} caractères
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSendResponse}
                      disabled={!responseText.trim()}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      Envoyer la réponse
                    </button>
                    <button 
                      onClick={handleMarkAsResolved}
                      className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Marquer comme Résolue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#624BFF] text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Gestion des Réclamations</h1>
              <p className="text-purple-100 text-sm mt-1">Traiter les réclamations des étudiants</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white text-[#624BFF] px-6 py-3 rounded-lg font-medium">
                {pendingCount} urgentes
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Feature Not Implemented Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Construction className="h-6 w-6 text-amber-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-amber-800">
                Fonctionnalité en Développement
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  La gestion des réclamations est en cours de développement. Les endpoints backend
                  ne sont pas encore implémentés. Les données affichées sont des données de démonstration statiques.
                </p>
                <p className="mt-2">
                  <strong>Prochaines étapes :</strong> Création des endpoints API pour la gestion des réclamations
                  côté backend, puis intégration complète dans cette interface.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En Cours</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Résolues</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{resolvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par étudiant ou sujet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="resolved">Résolues</option>
                </select>
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Toutes priorités</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Faible</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredReclamations.map(rec => (
            <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-1 ${
                rec.priority === 'high' ? 'bg-red-500' :
                rec.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
              }`} />
              
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {rec.student.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{rec.subject}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{rec.student}</span>
                          <span className="text-gray-400">•</span>
                          <Calendar className="w-4 h-4" />
                          <span>{rec.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{rec.message}</p>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rec.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        rec.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {rec.status === 'pending' ? 'En attente' :
                         rec.status === 'in_progress' ? 'En cours' : 'Résolue'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.priority === 'high' ? 'Haute' :
                         rec.priority === 'medium' ? 'Moyenne' : 'Faible'}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {rec.category}
                      </span>
                      {rec.responses.length > 0 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {rec.responses.length} réponse{rec.responses.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReclamation(rec)}
                    className="ml-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Traiter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <ReclamationDetailModal 
        reclamation={selectedReclamation} 
        onClose={() => {
          setSelectedReclamation(null);
          setResponseText('');
        }} 
      />
    </div>
  );
}