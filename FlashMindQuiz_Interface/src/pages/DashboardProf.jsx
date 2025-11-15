import { useState, useEffect } from 'react';
import { Users, BookOpen, CheckCircle, Search, Eye, Edit, Trash2, BarChart3, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
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
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch quizzes
        const quizzesData = await quizService.getMyQuizzes();
        setQuizzes(quizzesData.map(quiz => ({
          id: quiz.id,
          name: quiz.title,
          icon: '📚',
          timing: `${quiz.duration}min`,
          questions: quiz.questions?.length || 0,
          participants: [], // We'll calculate this from participations
          color: 'bg-[#624BFF]'
        })));

        // Calculate stats from quizzes and participations
        let totalParticipations = 0;
        let totalScores = 0;
        let validScores = 0;

        for (const quiz of quizzesData) {
          try {
            const participations = await quizService.getQuizParticipations(quiz.id);
            totalParticipations += participations.length;

            participations.forEach(p => {
              if (p.score != null) {
                totalScores += p.score;
                validScores++;
              }
            });
          } catch (err) {
            console.warn(`Could not fetch participations for quiz ${quiz.id}:`, err);
          }
        }

        const avgScore = validScores > 0 ? totalScores / validScores : 0;
        const successRate = Math.round(avgScore);

        setStats({
          totalQuizzes: quizzesData.length,
          completedQuizzes: quizzesData.length, // Assuming all quizzes are "completed" if created
          totalStudents: totalParticipations,
          completedStudents: totalParticipations, // All participations are completed
          successRate: successRate,
          completedRate: totalParticipations > 0 ? Math.round((validScores / totalParticipations) * 100) : 0,
        });

        // Fetch top students from participations
        const studentMap = new Map();
        const recentParticipations = [];

        for (const quiz of quizzesData) {
          try {
            const participations = await quizService.getQuizParticipations(quiz.id);
            participations.forEach(p => {
              const key = p.userId || `guest-${p.guestId}`;
              if (!studentMap.has(key)) {
                studentMap.set(key, {
                  id: key,
                  name: p.userId ? `Student ${p.userId}` : `Guest ${p.guestId}`,
                  email: p.userId ? `student${p.userId}@example.com` : `guest${p.guestId}@example.com`,
                  activity: 'Récemment',
                  score: p.score || 0
                });
              }
              recentParticipations.push({ ...p, quizTitle: quiz.title, participantKey: key });
            });
          } catch (err) {
            console.warn(`Could not fetch participations for quiz ${quiz.id}:`, err);
          }
        }

        // Sort students by score and take top 5
        const topStudentsData = Array.from(studentMap.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(student => ({
            ...student,
            activity: student.activity
          }));

        setTopStudents(topStudentsData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <div className="bg-[#624BFF] text-white px-8 py-6 flex items-center justify-between shadow-md">
        <h1 className="text-3xl font-bold">Bienvenue, Tasnim</h1>
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
                placeholder="Rechercher" 
                className="pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#624BFF]"
              />
              <button className="p-2 bg-[#624BFF] text-white rounded-xl hover:bg-[#513BDB] transition-all">
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
      {quizzes.map((quiz) => (
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
            <div className="flex items-center -space-x-2">
              {quiz.participants.map((p, idx) => (
                <div key={idx} className="w-8 h-8 rounded-full bg-[#624BFF] flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md">
                  {idx + 1}
                </div>
              ))}
            </div>
          </td>
          <td className="py-4 px-4 flex gap-2">
          <button
  onClick={() => navigate(`/professor/quiz/${quiz.id}/details`)}
  className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center"
>
  <Eye className="w-5 h-5 text-gray-600"/>
</button>

            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Edit className="w-5 h-5 text-gray-600"/>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Trash2 className="w-5 h-5 text-gray-600"/>
            </button>
            <button
  onClick={() => navigate(`/professor/quiz/${quiz.id}/report`)}
  className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center"
>
  <BarChart3 className="w-5 h-5 text-gray-600"/>
</button>

          </td>
        </tr>
      ))}
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
          {/* Performance Moyenne */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Performance Moyenne</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="text-gray-400 text-2xl">⋮</span>
              </button>
            </div>
            <div className="flex flex-col items-center py-6">
              <div className="relative w-56 h-28 mb-6">
                <svg className="w-full h-full" viewBox="0 0 200 100">
                  <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="#f3f4f6" strokeWidth="18" strokeLinecap="round"/>
                  <path d="M 20 90 A 80 80 0 0 1 70 30" fill="none" stroke="#FF6B6B" strokeWidth="18" strokeLinecap="round"/>
                  <path d="M 70 30 A 80 80 0 0 1 130 30" fill="none" stroke="#FACC15" strokeWidth="18" strokeLinecap="round"/>
                  <path d="M 130 30 A 80 80 0 0 1 180 90" fill="none" stroke="#624BFF" strokeWidth="18" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex items-center justify-center gap-12">
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-[#624BFF]"/>
                    <span className="text-3xl font-bold text-gray-900">76%</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Complétés</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-[#FACC15] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">↻</span>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">32%</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">En cours</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">×</span>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">13%</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">En retard</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top 5 Étudiants */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top 5 Étudiants</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {topStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#E8E5FF] flex items-center justify-center overflow-hidden shadow-md">
                      <img 
                        src="https://static.vecteezy.com/system/resources/previews/007/296/447/non_2x/user-icon-in-flat-style-person-icon-client-symbol-vector.jpg"
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium">{student.activity}</span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <span className="text-gray-400 text-2xl">⋮</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
