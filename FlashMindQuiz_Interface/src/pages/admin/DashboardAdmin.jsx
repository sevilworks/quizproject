import { useState, useEffect } from 'react';
import { Users, BookOpen, CreditCard, MessageSquare, TrendingUp, CheckCircle, Clock, XCircle, Loader, AlertCircle } from 'lucide-react';
import adminService from '../../services/adminService';

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeQuizzes: 0,
    pendingQuizzes: 0,
    subscriptions: 0,
    reclamations: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch recent activities from API
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        // Fetch recent users, quizzes, and subscriptions
        const [users, quizzes, subscriptions] = await Promise.all([
          adminService.getProfessors().catch(() => []),
          adminService.getQuizzes().catch(() => []),
          adminService.getSubscriptions().catch(() => [])
        ]);

        // Process recent activities from API data
        const activities = [];
        
        // Add recent users
        if (users && users.length > 0) {
          activities.push({
            id: 1,
            type: 'user',
            action: 'Nouvel utilisateur inscrit',
            user: users[0]?.user?.fullName || users[0]?.fullName || 'Professeur',
            time: '5 min'
          });
        }

        // Add recent quizzes
        if (quizzes && quizzes.length > 0) {
          activities.push({
            id: 2,
            type: 'quiz',
            action: 'Quiz en attente de validation',
            user: quizzes[0]?.professor?.fullName || 'Prof.',
            time: '15 min'
          });
        }

        // Add recent subscriptions
        if (subscriptions && subscriptions.length > 0) {
          activities.push({
            id: 3,
            type: 'subscription',
            action: 'Nouvel abonnement',
            user: subscriptions[0]?.professor?.user?.fullName || 'Prof.',
            time: '1h'
          });
        }

        // Add a placeholder reclamation (since no API endpoint exists yet)
        activities.push({
          id: 4,
          type: 'reclamation',
          action: 'Nouvelle réclamation',
          user: 'Étudiant',
          time: '2h'
        });

        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        // Keep static data as fallback
        setRecentActivities([
          { id: 1, type: 'user', action: 'Nouvel utilisateur inscrit', user: 'Ahmed Ben Ali', time: '5 min' },
          { id: 2, type: 'quiz', action: 'Quiz en attente de validation', user: 'Prof. Sara', time: '15 min' },
          { id: 3, type: 'subscription', action: 'Nouvel abonnement', user: 'Prof. Mohamed', time: '1h' },
          { id: 4, type: 'reclamation', action: 'Nouvelle réclamation', user: 'Étudiant Amine', time: '2h' }
        ]);
      }
    };

    fetchRecentActivities();
  }, []);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await adminService.getDashboardStats();
        
        setStats({
          totalUsers: dashboardData.users?.total || 0,
          activeQuizzes: dashboardData.quizzes?.active || 0,
          pendingQuizzes: 0, // Will be updated when we have quiz validation endpoints
          subscriptions: dashboardData.subscriptions?.total || 0,
          reclamations: 15 // Static for now as no reclamation endpoint exists
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Erreur lors du chargement des statistiques');
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
{/* Header */}
<header className="bg-[#624BFF] shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Tableau de Bord Admin</h1>
        <p className="text-gray-100 text-sm mt-1">Bienvenue sur Flash_Mind - Gestion Administrative</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-white">Admin</p>
          <p className="text-xs text-gray-200">Administrateur</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#624BFF] font-bold">
          A
        </div>
      </div>
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Utilisateurs"
            value={stats.totalUsers}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend="+12%"
          />
          <StatCard
            icon={BookOpen}
            title="Quiz Actifs"
            value={stats.activeQuizzes}
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend="+8%"
          />
          <StatCard
            icon={Clock}
            title="Quiz en Attente"
            value={stats.pendingQuizzes}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
          />
          <StatCard
            icon={CreditCard}
            title="Abonnements"
            value={stats.subscriptions}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            trend="+15%"
          />
        </div>

{/* Quick Actions */}
<div className="bg-white rounded-xl shadow-sm p-1 border-2 border-[#624BFF] mb-8">
  <div className="bg-white rounded-lg p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <button
        onClick={() => window.location.href = "/admin/users"}
        className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all cursor-pointer"
      >
        <Users className="w-8 h-8 text-blue-600 mb-2" />
        <span className="text-sm font-medium text-gray-900">Gérer Utilisateurs</span>
      </button>

      <button
      onClick={() => window.location.href = "/admin/quizzes"}
      className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all"
      >
        <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
        <span className="text-sm font-medium text-gray-900">Valider Quiz</span>
      </button>

      <button
         onClick={() => window.location.href = "/admin/subscriptions"}
      className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all">
        <CreditCard className="w-8 h-8 text-purple-600 mb-2" />
        <span className="text-sm font-medium text-gray-900">Abonnements</span>
      </button>

      <button
         onClick={() => window.location.href = "/admin/reclamations"}
      className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all">
        <MessageSquare className="w-8 h-8 text-orange-600 mb-2" />
        <span className="text-sm font-medium text-gray-900">Réclamations</span>
      </button>
    </div>
  </div>
</div>



        {/* Recent Activities & Pending Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activités Récentes</h2>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'user' ? 'bg-blue-100' :
                    activity.type === 'quiz' ? 'bg-green-100' :
                    activity.type === 'subscription' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'user' && <Users className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'quiz' && <BookOpen className="w-5 h-5 text-green-600" />}
                    {activity.type === 'subscription' && <CreditCard className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'reclamation' && <MessageSquare className="w-5 h-5 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Validations */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions en Attente</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Quiz à valider</p>
                    <p className="text-xs text-gray-600">{stats.pendingQuizzes || 0} quiz en attente</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = "/admin/quizzes"}
                  className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Voir
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Réclamations</p>
                    <p className="text-xs text-gray-600">{stats.reclamations || 0} réclamations non traitées</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = "/admin/reclamations"}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Traiter
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nouveaux utilisateurs</p>
                    <p className="text-xs text-gray-600">{stats.totalUsers || 0} utilisateurs total</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = "/admin/users"}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}