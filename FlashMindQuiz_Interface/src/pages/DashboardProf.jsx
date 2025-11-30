import { useState, useEffect } from 'react';
import { Users, BookOpen, CheckCircle, Search, Eye, Edit, Trash2, BarChart3, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { useNotification } from '../components/Notification';

// Time formatting utilities from QuizReport.jsx
const formatActivity = (createdAt) => {
  if (!createdAt) return 'Récemment';
  
  try {
    const date = new Date(createdAt);
    
    if (isNaN(date.getTime())) return 'Récemment';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays} jours`;
    } else if (diffDays <= 30) {
      return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    } else {
      return 'Il y a longtemps';
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    return 'Récemment';
  }
};

const formatDateTime = (createdAt) => {
  if (!createdAt) return 'N/A';
  
  try {
    const date = new Date(createdAt);
    
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

// Participant name resolution from QuizReport.jsx
const resolveParticipantName = (participation) => {
  // Format participant name - use actual names from backend (snake_case from API)
  let name = 'Participant anonyme';
  let email = '';
  
  if (participation.user_name) {
    // Student/User with actual username
    name = participation.user_name;
    email = participation.user_email || '';
  } else if (participation.guest_name) {
    // Guest with actual pseudo
    name = participation.guest_name;
  } else if (participation.user_id) {
    // Fallback if name not provided
    name = `Étudiant ${participation.user_id}`;
  } else if (participation.guest_id) {
    // Fallback if guest name not provided
    name = `Invité ${participation.guest_id}`;
  } else if (participation.user) {
    // Complex object structure from DashboardProf.jsx existing code
    if (participation.user.student && (participation.user.student.firstName || participation.user.student.lastName)) {
      name = `${participation.user.student.firstName || ''} ${participation.user.student.lastName || ''}`.trim();
    } else if (participation.user.username) {
      name = participation.user.username;
    } else if (participation.user.email) {
      name = participation.user.email.split('@')[0];
    }
  } else if (participation.guest && participation.guest.pseudo) {
    name = participation.guest.pseudo;
  } else {
    name = participation.userId ? `Étudiant ${participation.userId}` : `Invité ${participation.guestId || 'Anonyme'}`;
  }
  
  return { name, email: email || (participation.user?.email || participation.guest?.email || '') };
};

export default function TableauDeBordProfesseur() {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    totalStudents: 0,
    completedStudents: 0,
    successRate: 0,
    completedRate: 0,
  });
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceStats, setPerformanceStats] = useState({
    completed: 0,
    inProgress: 0,
    late: 0
  });

  // Notification hook
  const { showSuccess, showError, showWarning, NotificationComponent } = useNotification();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate data first
        if (!quizService || typeof quizService.getMyQuizzes !== 'function') {
          throw new Error('Quiz service not available');
        }

        // Fetch quizzes data with validation
        const quizzesData = await quizService.getMyQuizzes();
        
        // Validate quizzes data
        if (!Array.isArray(quizzesData)) {
          throw new Error('Invalid quiz data received');
        }

        // Fetch all participations to get participant counts and calculate metrics
        const quizzesWithParticipantCounts = await Promise.all(
          quizzesData.map(async (quiz) => {
            try {
              // Validate quiz data
              if (!quiz || typeof quiz.id === 'undefined' || !quiz.title) {
                console.warn('Invalid quiz data:', quiz);
                return {
                  id: quiz?.id || Math.random(),
                  name: quiz?.title || 'Quiz sans titre',
                  icon: '📚',
                  timing: `${quiz?.duration || 0}min`,
                  questions: quiz?.questions?.length || 0,
                  participants: 0,
                  color: 'bg-[#624BFF]'
                };
              }

              const participations = await quizService.getQuizParticipations(quiz.id);
              
              // Validate participations data
              const validParticipations = Array.isArray(participations) ? participations : [];
              
              return {
                id: quiz.id,
                name: quiz.title,
                icon: '📚',
                timing: `${quiz.duration}min`,
                questions: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
                participants: validParticipations.length,
                color: 'bg-[#624BFF]'
              };
            } catch (err) {
              console.warn(`Could not fetch participations for quiz ${quiz?.id || 'unknown'}:`, err);
              return {
                id: quiz?.id || Math.random(),
                name: quiz?.title || 'Quiz sans titre',
                icon: '📚',
                timing: `${quiz?.duration || 0}min`,
                questions: quiz?.questions?.length || 0,
                participants: 0,
                color: 'bg-[#624BFF]'
              };
            }
          })
        );
        
        setQuizzes(quizzesWithParticipantCounts);
        setFilteredQuizzes(quizzesWithParticipantCounts);

        // Initialize variables for comprehensive calculations
        let totalScores = 0;
        let validScores = 0;
        let totalParticipations = 0;
        let successfulParticipations = 0; // >= 70% like QuizReport.jsx
        let failedParticipations = 0; // < 70%
        let inProgressParticipations = 0; // No score yet
        let lateParticipations = 0; // < 50%

        // Fetch top students from participations using QuizReport.jsx patterns
        const studentMap = new Map();

        // Process all quizzes and their participations
        for (const quiz of quizzesData) {
          try {
            const participations = await quizService.getQuizParticipations(quiz.id);
            const validParticipations = Array.isArray(participations) ? participations : [];
            totalParticipations += validParticipations.length;

            validParticipations.forEach(participation => {
              // Use QuizReport.jsx participant resolution
              const { name: participantName, email: participantEmail } = resolveParticipantName(participation);
              const key = participation.user_id || participation.userId || `guest-${participation.guest_id || participation.guestId}`;
              
              // Calculate performance metrics using QuizReport.jsx patterns
              if (participation.score !== null && participation.score !== undefined) {
                totalScores += participation.score;
                validScores++;
                
                if (participation.score >= 70) {
                  successfulParticipations++;
                } else if (participation.score >= 50) {
                  inProgressParticipations++;
                } else {
                  failedParticipations++;
                  lateParticipations++;
                }
              } else {
                inProgressParticipations++;
              }

              // Get activity status using QuizReport.jsx utility
              const activityStatus = formatActivity(participation.created_at || participation.createdAt);
              const timing = formatDateTime(participation.created_at || participation.createdAt);

              // Build student record using QuizReport.jsx patterns
              if (!studentMap.has(key)) {
                const avatar = participantName.charAt(0).toUpperCase() +
                  (participantName.split(' ')[1] ? participantName.split(' ')[1].charAt(0).toUpperCase() : '');
                
                studentMap.set(key, {
                  id: key,
                  name: participantName,
                  email: participantEmail,
                  activity: activityStatus,
                  timing: timing,
                  avatar: avatar,
                  score: participation.score || 0,
                  quizCount: 1,
                  bestScore: participation.score || 0
                });
              } else {
                // Update existing student record
                const existingStudent = studentMap.get(key);
                existingStudent.quizCount += 1;
                
                // Keep the best score
                if (participation.score && participation.score > existingStudent.bestScore) {
                  existingStudent.bestScore = participation.score;
                  existingStudent.score = participation.score;
                }
                
                // Update activity to most recent
                const currentActivity = formatActivity(participation.created_at || participation.createdAt);
                if (currentActivity !== 'Récemment' && currentActivity !== 'Il y a longtemps') {
                  existingStudent.activity = currentActivity;
                  existingStudent.timing = timing;
                }
              }
            });
          } catch (err) {
            console.warn(`Could not fetch participations for quiz ${quiz?.id || 'unknown'}:`, err);
          }
        }

        // Calculate comprehensive statistics using QuizReport.jsx patterns
        const avgScore = validScores > 0 ? totalScores / validScores : 0;
        const successRate = Math.round(avgScore);
        
        const performanceStats = {
          completed: totalParticipations > 0 ? Math.round((successfulParticipations / totalParticipations) * 100) : 0,
          inProgress: totalParticipations > 0 ? Math.round((inProgressParticipations / totalParticipations) * 100) : 0,
          late: totalParticipations > 0 ? Math.round((lateParticipations / totalParticipations) * 100) : 0
        };

        // Update main stats with comprehensive data
        setStats({
          totalQuizzes: quizzesData.length,
          completedQuizzes: quizzesData.filter(q => q.status === 'COMPLETED' || q.status === 'FINISHED').length,
          totalStudents: new Set(Array.from(studentMap.keys())).size, // Unique students
          completedStudents: successfulParticipations,
          successRate: successRate,
          completedRate: totalParticipations > 0 ? Math.round((validScores / totalParticipations) * 100) : 0,
        });

        // Sort students by best score and take top 5 with enhanced data
        const topStudentsData = Array.from(studentMap.values())
          .sort((a, b) => b.bestScore - a.bestScore)
          .slice(0, 5)
          .map(student => ({
            ...student,
            displayScore: `${Math.round(student.bestScore)}%`,
            quizCount: student.quizCount
          }));

        setTopStudents(topStudentsData);
        setPerformanceStats(performanceStats);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        
        // Enhanced error handling from QuizReport.jsx
        if (err.response?.status === 404) {
          setError('Tableau de bord non trouvé');
        } else if (err.response?.status === 401) {
          setError('Accès non autorisé au tableau de bord');
        } else if (err.message?.includes('Quiz service not available')) {
          setError('Service de quiz temporairement indisponible');
        } else {
          setError('Échec du chargement du tableau de bord');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredQuizzes(quizzes);
    } else {
      const filtered = quizzes.filter(quiz =>
        quiz.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchQuery, quizzes]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.')) {
      try {
        await quizService.deleteQuiz(quizId);
        // Reload quizzes after deletion
        const quizzesData = await quizService.getMyQuizzes();
        const mappedQuizzes = quizzesData.map(quiz => ({
          id: quiz.id,
          name: quiz.title,
          icon: '📚',
          timing: `${quiz.duration}min`,
          questions: quiz.questions?.length || 0,
          participants: 0,
          color: 'bg-[#624BFF]'
        }));
        setQuizzes(mappedQuizzes);
        setFilteredQuizzes(mappedQuizzes);
        showSuccess('Quiz supprimé avec succès!', 'Suppression réussie');
      } catch (error) {
        console.error('Error deleting quiz:', error);
        showError('Erreur lors de la suppression du quiz', 'Erreur');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#624BFF] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#624BFF] text-white rounded-lg hover:bg-[#513BDB]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NotificationComponent />
      <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <div className="bg-[#624BFF] text-white px-8 py-6 flex items-center justify-between shadow-md">
        <h1 className="text-3xl font-bold">Bienvenue, {`${localStorage.getItem('firstName') || 'Professeur'} ${localStorage.getItem('lastName') || ''}`.trim()}</h1>
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-white" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden shadow-md">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/007/296/447/non_2x/user-icon-in-flat-style-person-icon-client-symbol-vector.jpg"
              alt="Profil"
            />
          </div>
        </div>
      </div>

{/* Cartes statistiques pleine largeur */}
<div className="w-full bg-gray-50 py-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 px-6 md:px-12">
    {/* Carte Quiz */}
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl hover:scale-105 transition-transform">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 font-semibold text-sm">Quiz</span>
        <div className="w-12 h-12 bg-gradient-to-br from-[#E8E5FF] to-[#D9D6FF] rounded-xl flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-[#624BFF]" />
        </div>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{stats.totalQuizzes}</h2>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-semibold text-gray-800">{stats.completedQuizzes}</span>
        <span className="text-gray-400 text-xs md:text-sm">Complétés</span>
      </div>
    </div>

    {/* Carte Étudiants */}
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl hover:scale-105 transition-transform">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 font-semibold text-sm">Étudiants</span>
        <div className="w-12 h-12 bg-gradient-to-br from-[#E8E5FF] to-[#D9D6FF] rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-[#624BFF]" />
        </div>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{stats.totalStudents}</h2>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-semibold text-gray-800">{stats.completedStudents}</span>
        <span className="text-gray-400 text-xs md:text-sm">Complétés</span>
      </div>
    </div>

    {/* Carte Taux de réussite */}
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl hover:scale-105 transition-transform">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 font-semibold text-sm">Taux de réussite</span>
        <div className="w-12 h-12 bg-gradient-to-br from-[#E8E5FF] to-[#D9D6FF] rounded-xl flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-[#624BFF]" />
        </div>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{stats.successRate}%</h2>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-semibold text-gray-800">{stats.completedRate}%</span>
        <span className="text-gray-400 text-xs md:text-sm">Complétés</span>
      </div>
    </div>
     </div>

    <div className="flex justify-end w-full mt-6 px-6 md:px-12">
      <button
        onClick={() => navigate('/professor/quiz/add')}
        className="px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-[#624BFF] to-[#7C5FFF] text-white hover:shadow-lg hover:scale-105 hover:brightness-110 transition-all duration-200"
      >
        Créer un nouveau quiz
      </button>
    </div>
         
         
  
</div>



      {/* Contenu principal */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {/* Liste des quiz */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Liste des Quiz</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Rechercher un quiz..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#624BFF] w-64"
              />
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 bg-[#624BFF] text-white rounded-xl hover:bg-[#513BDB] transition-all"
                title="Effacer la recherche"
              >
                <Search className="w-5 h-5"/>
              </button>
            </div>
          </div>

    <div className="overflow-x-auto">
  <table className="w-full table-auto">
    <thead>
      <tr className="border-b-2 border-gray-200">
        <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Nom du Quiz</th>
        <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Durée</th>
        <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Questions</th>
        <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Participants</th>
        <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredQuizzes.length === 0 ? (
        <tr>
          <td colSpan="5" className="py-8 text-center text-gray-500">
            {searchQuery ? 'Aucun quiz trouvé pour cette recherche' : 'Aucun quiz disponible'}
          </td>
        </tr>
      ) : (
        filteredQuizzes.map((quiz) => (
        <tr key={quiz.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <td className="py-4 px-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${quiz.color} rounded-xl flex items-center justify-center text-white text-xl shadow-md`}>
              {quiz.icon}
            </div>
            <span className="font-semibold text-gray-900">{quiz.name}</span>
          </td>
          <td className="py-4 px-4 text-gray-600">{quiz.timing}</td>
          <td className="py-4 px-4 font-semibold text-gray-900">{quiz.questions}</td>
          <td className="py-4 px-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#624BFF]">{quiz.participants}</span>
              <span className="text-sm text-gray-500">participants</span>
            </div>
          </td>
          <td className="py-4 px-4 flex gap-2">
          <button
  onClick={() => navigate(`/professor/quiz/${quiz.id}/details`)}
  className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center"
>
  <Eye className="w-5 h-5 text-gray-600"/>
</button>

            <button
              onClick={() => navigate(`/professor/quiz/${quiz.id}/edit`)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              title="Modifier le quiz"
            >
              <Edit className="w-5 h-5 text-gray-600"/>
            </button>
            <button
              onClick={() => handleDeleteQuiz(quiz.id)}
              className="p-2 hover:bg-red-100 rounded-xl transition-colors"
              title="Supprimer le quiz"
            >
              <Trash2 className="w-5 h-5 text-red-600"/>
            </button>
            <button
  onClick={() => navigate(`/professor/quiz/${quiz.id}/report`)}
  className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center"
>
  <BarChart3 className="w-5 h-5 text-gray-600"/>
</button>

          </td>
        </tr>
        ))
      )}
    </tbody>
  </table>

  {/* Bouton "Voir tous les quizzes" en dessous du tableau */}
  <div className="mt-4 flex justify-center">
    <button className="px-6 py-3 hover:bg-gray-100 rounded-xl transition-colors font-medium text-gray-700 flex items-center justify-center">
      Voir tous les quizzes
    </button>
  </div>
</div>

  
        </div>

        {/* Section inférieure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 5 Étudiants */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Top 5 Étudiants</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="text-gray-400 text-2xl">⋮</span>
              </button>
            </div>
            
            {topStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun étudiant pour le moment</p>
                <p className="text-gray-400 text-sm mt-2">Les étudiants apparaîtront ici une fois qu'ils auront complété des quiz</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {topStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#624BFF] to-[#7C5FFF] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {student.avatar || student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-[#624BFF] text-white px-2 py-1 rounded-full font-bold">
                            #{index + 1}
                          </span>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {student.email && `${student.email} • `}
                          {student.quizCount > 1 ? `${student.quizCount} quiz complétés` : `${student.quizCount} quiz complété`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{student.timing}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          student.bestScore >= 70 ? 'text-green-600' :
                          student.bestScore >= 50 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {student.displayScore}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{student.activity}</span>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <span className="text-gray-400 text-2xl">⋮</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Moyenne */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Performance Moyenne</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="text-gray-400 text-2xl">⋮</span>
              </button>
            </div>
            
            {/* Performance Analytics */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-green-50 rounded-2xl">
                <div className="text-2xl font-bold text-green-600">{performanceStats.completed}%</div>
                <div className="text-sm text-green-700 font-medium">Réussite (≥70%)</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-2xl">
                <div className="text-2xl font-bold text-orange-600">{performanceStats.inProgress}%</div>
                <div className="text-sm text-orange-700 font-medium">En cours (50-69%)</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-2xl">
                <div className="text-2xl font-bold text-red-600">{performanceStats.late}%</div>
                <div className="text-sm text-red-700 font-medium">À améliorer (moins de 50%)</div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Taux de réussite global</span>
                  <span className="font-semibold">{stats.successRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.successRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Quiz complétés</span>
                  <span className="font-semibold">{stats.completedRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completedRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
