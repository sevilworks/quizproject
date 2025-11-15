import React, { useState, useEffect } from 'react';
import { FileText, Users, CheckCircle, Clock, Eye } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { quizService } from '../../services/quizService';

export default function QuizReport() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [stats, setStats] = useState({
    questionCount: 0,
    participantCount: 0,
    successRate: '0%',
    duration: '0 min'
  });

  // Validate quiz ID parameter
  const quizId = parseInt(id);
  if (isNaN(quizId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">ID du quiz invalide</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#624BFF] text-white rounded-lg hover:bg-[#513BDB]"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchQuizReportData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch quiz details
        const quizData = await quizService.getQuizById(quizId);
        if (!quizData) {
          throw new Error('Quiz not found');
        }
        setQuiz(quizData);

        // Fetch participations
        const participationsData = await quizService.getQuizParticipations(quizId);
        setParticipations(participationsData);

        // Calculate statistics
        const questionCount = quizData.questions ? quizData.questions.length : 0;
        const participantCount = participationsData.length;

        // Calculate success rate
        let successRate = '0%';
        if (participationsData.length > 0) {
          const successful = participationsData.filter(p => p.score && p.score >= 70).length;
          successRate = Math.round((successful / participationsData.length) * 100) + '%';
        }

        // Duration (assuming it's stored in minutes or default to 30)
        const duration = quizData.duration ? quizData.duration + ' min' : '30 min';

        setStats({
          questionCount,
          participantCount,
          successRate,
          duration
        });

      } catch (err) {
        console.error('Error fetching quiz report data:', err);
        if (err.response?.status === 404) {
          setError('Rapport du quiz introuvable');
        } else if (err.response?.status === 401) {
          setError('Accès non autorisé à ce rapport');
        } else {
          setError('Échec du chargement du rapport du quiz');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuizReportData();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#624BFF] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du rapport du quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Rapport non trouvé'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#624BFF] text-white rounded-lg hover:bg-[#513BDB]"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Get real questions from quiz data
  const questions = quiz.questions ? quiz.questions.map(q => q.question_text || q.questionText || q.question || `Question ${q.id}`) : [];

  // Calculate performance data
  const successful = participations.filter(p => p.score && p.score >= 70).length;
  const failed = participations.filter(p => p.score && p.score < 70).length;
  const totalParticipants = participations.length;
  const maxHeight = 200;

  const successHeight = totalParticipants > 0 ? (successful / totalParticipants) * maxHeight : 0;
  const failureHeight = totalParticipants > 0 ? (failed / totalParticipants) * maxHeight : 0;
  const remainingHeight = maxHeight - successHeight - failureHeight;

  // Transform participations data for display
  const participants = participations.map(p => {
    // Format participant name
    let name = 'Participant anonyme';
    if (p.userId) {
      name = `Étudiant ${p.userId}`;
    } else if (p.guestId) {
      name = `Invité ${p.guestId}`;
    }

    // Format activity (last activity time)
    const createdAt = new Date(p.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let activity = 'Récemment';
    if (diffDays === 1) activity = 'Aujourd\'hui';
    else if (diffDays === 2) activity = 'Hier';
    else if (diffDays <= 7) activity = 'Cette semaine';
    else activity = 'Il y a longtemps';

    // Format timing
    const timing = createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Create avatar
    const avatar = name.charAt(0).toUpperCase() + (name.split(' ')[1] ? name.split(' ')[1].charAt(0).toUpperCase() : '');

    return {
      id: p.id,
      name,
      activity,
      timing,
      avatar,
      score: p.score
    };
  });

  // Cartes statistiques
  const statsCards = [
    {
      title: 'Nombre de questions',
      value: stats.questionCount,
      icon: <FileText className="w-5 h-5 text-[#624BFF]"/>,
      bg: 'bg-[#EDEBFF]'
    },
    {
      title: 'Participants',
      value: stats.participantCount,
      icon: <Users className="w-5 h-5 text-[#624BFF]"/>,
      bg: 'bg-[#EDEBFF]'
    },
    {
      title: 'Taux de réussite',
      value: stats.successRate,
      icon: <CheckCircle className="w-5 h-5 text-[#624BFF]"/>,
      bg: 'bg-[#EDEBFF]'
    },
    {
      title: 'Durée du quiz',
      value: stats.duration,
      icon: <Clock className="w-5 h-5 text-[#624BFF]"/>,
      bg: 'bg-[#EDEBFF]'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <div className="bg-[#624BFF] text-white px-8 py-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rapport du quiz</h1>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-8 mt-6">
        {statsCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-lg p-6 flex flex-col justify-between hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 font-semibold">{card.title}</span>
              <div className={`w-10 h-10 ${card.bg} rounded flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{card.value}</h2>
          </div>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto px-8 py-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Questions du Quiz</h2>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="text-sm text-gray-700">
                  <span className="font-medium">{idx + 1}.</span> {q}
                </div>
              ))}
            </div>
          </div>

          {/* Performance des participants */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Performance des étudiants</h2>
            <div className="flex items-end justify-center gap-8 h-64">
              <div className="flex flex-col items-center">
                <div className="bg-green-500 rounded-lg transition-all duration-300" style={{ width: '80px', height: `${successHeight}px` }}></div>
                <span className="text-xs text-gray-600 mt-2">Réussite</span>
                <span className="text-sm font-semibold">{successful}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-red-500 rounded-lg transition-all duration-300" style={{ width: '80px', height: `${failureHeight}px` }}></div>
                <span className="text-xs text-gray-600 mt-2">Échec</span>
                <span className="text-sm font-semibold">{failed}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gray-400 rounded-lg transition-all duration-300" style={{ width: '80px', height: `${remainingHeight}px` }}></div>
                <span className="text-xs text-gray-600 mt-2">Incomplet</span>
                <span className="text-sm font-semibold">{totalParticipants - successful - failed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des participants */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mt-6 overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Liste des participants</h2>
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Nom</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Dernière activité</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Temps</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#624BFF] to-[#7C5FFF] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {p.avatar}
                  </div>
                    <span className="font-semibold text-gray-900">{p.name}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{p.activity}</td>
                  <td className="py-4 px-4 text-gray-600">{p.timing}</td>
                  <td className="py-4 px-4">
                    <button className="px-4 py-2 text-sm text-[#624BFF] border border-[#624BFF] rounded-lg hover:bg-[#EDEBFF] flex items-center gap-1">
                      <Eye className="w-4 h-4"/> Voir performance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
