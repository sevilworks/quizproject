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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedParticipation, setSelectedParticipation] = useState(null);
  const [participationDetails, setParticipationDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
    // Format participant name - use actual names from backend (snake_case from API)
    let name = 'Participant anonyme';
    let email = '';
    
    if (p.user_name) {
      // Student/User with actual username
      name = p.user_name;
      email = p.user_email || '';
    } else if (p.guest_name) {
      // Guest with actual pseudo
      name = p.guest_name;
    } else if (p.user_id) {
      // Fallback if name not provided
      name = `Étudiant ${p.user_id}`;
    } else if (p.guest_id) {
      // Fallback if guest name not provided
      name = `Invité ${p.guest_id}`;
    }

    // Format activity (last activity time)
    let activity = 'Récemment';
    let timing = 'N/A';
    
    if (p.created_at) {
      try {
        // Handle LocalDateTime from backend (format: "2024-01-15T10:30:00")
        const createdAt = new Date(p.created_at);
        
        if (!isNaN(createdAt.getTime())) {
          const now = new Date();
          const diffTime = Math.abs(now - createdAt);
          const diffMinutes = Math.floor(diffTime / (1000 * 60));
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffMinutes < 60) {
            activity = `Il y a ${diffMinutes} min`;
          } else if (diffHours < 24) {
            activity = `Il y a ${diffHours}h`;
          } else if (diffDays === 0) {
            activity = 'Aujourd\'hui';
          } else if (diffDays === 1) {
            activity = 'Hier';
          } else if (diffDays <= 7) {
            activity = `Il y a ${diffDays} jours`;
          } else if (diffDays <= 30) {
            activity = `Il y a ${Math.floor(diffDays / 7)} semaines`;
          } else {
            activity = 'Il y a longtemps';
          }

          // Format timing
          timing = createdAt.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }

    // Create avatar
    const avatar = name.charAt(0).toUpperCase() + (name.split(' ')[1] ? name.split(' ')[1].charAt(0).toUpperCase() : '');

    return {
      id: p.id,
      name,
      email,
      activity,
      timing,
      avatar,
      score: p.score !== null && p.score !== undefined ? `${Math.round(p.score)}%` : 'N/A'
    };
  });

  const handleViewDetails = async (participation) => {
    setSelectedParticipation(participation);
    setIsDialogOpen(true);
    setLoadingDetails(true);
    
    try {
      // Parse student_responses JSON data
      let parsedResponses = [];
      const responsesData = participation.student_responses;
      
      if (responsesData) {
        try {
          parsedResponses = JSON.parse(responsesData);
          
          // Enrich responses with actual question and answer texts
          const enrichedResponses = parsedResponses.map(response => {
            const question = quiz.questions?.find(q => q.id === response.questionId);
            if (!question) {
              return response;
            }
            
            const selectedResponse = question.responses?.find(r => r.id === response.selectedResponseId);
            const correctResponse = question.responses?.find(r => r.is_correct || r.isCorrect);
            
            return {
              ...response,
              questionText: question.question_text || question.questionText || 'Question non disponible',
              studentAnswer: selectedResponse?.responseText || selectedResponse?.responseText || 'Pas de réponse',
              correctAnswer: correctResponse?.responseText || correctResponse?.responseText || 'Réponse correcte non disponible'
            };
          });
          
          parsedResponses = enrichedResponses;
        } catch (error) {
          console.error('Error parsing student responses:', error);
          parsedResponses = [];
        }
      }
      
      setParticipationDetails({
        ...participation,
        studentResponses: parsedResponses
      });
    } catch (error) {
      console.error('Error loading participation details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedParticipation(null);
    setParticipationDetails(null);
  };

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
          {participants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun participant pour le moment</p>
              <p className="text-gray-400 text-sm mt-2">Les participants apparaîtront ici une fois qu'ils auront complété le quiz</p>
            </div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Nom</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Score</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Dernière activité</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Date/Heure</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#624BFF] to-[#7C5FFF] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                          {p.avatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{p.name}</span>
                          {p.email && <span className="text-xs text-gray-500">{p.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-bold ${
                        p.score !== 'N/A' && parseFloat(p.score) >= 70
                          ? 'text-green-600'
                          : p.score !== 'N/A'
                          ? 'text-red-600'
                          : 'text-gray-400'
                      }`}>
                        {p.score}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{p.activity}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{p.timing}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleViewDetails(participations.find(part => part.id === p.id))}
                        className="px-4 py-2 text-sm text-[#624BFF] border border-[#624BFF] rounded-lg hover:bg-[#EDEBFF] flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-4 h-4"/> Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Dialog Component */}
      {isDialogOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={closeDialog}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {loadingDetails ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                <p>Chargement des détails...</p>
              </div>
            ) : (
              <>
                {/* Dialog Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '30px',
                  borderBottom: '2px solid #e9ecef',
                  paddingBottom: '20px'
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#333',
                      marginBottom: '10px'
                    }}>
                      📋 Détails de la participation
                    </h2>
                    <div style={{
                      display: 'flex',
                      gap: '20px',
                      fontSize: '14px',
                      color: '#6c757d',
                      flexWrap: 'wrap'
                    }}>
                      <span>👤 {participants.find(p => p.id === selectedParticipation?.id)?.name}</span>
                      <span>🏅 Score: {Math.round(participationDetails?.score || 0)}%</span>
                      <span>📅 {participationDetails?.created_at ? new Date(participationDetails.created_at).toLocaleDateString('fr-FR') : ''}</span>
                    </div>
                  </div>
                  <button
                    onClick={closeDialog}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#6c757d',
                      padding: '5px'
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Quiz Summary */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '20px',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎯</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#624BFF' }}>
                      {Math.round(participationDetails?.score || 0)}%
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>Score final</div>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#624BFF' }}>
                      {participationDetails?.studentResponses?.length || 0}
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>Questions</div>
                  </div>
                </div>

                {/* Questions Details */}
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '20px'
                  }}>
                    📚 Détail des réponses
                  </h3>

                  {participationDetails?.studentResponses && participationDetails.studentResponses.length > 0 ? (
                    <div>
                      {participationDetails.studentResponses.map((response, index) => (
                        <div
                          key={index}
                          style={{
                            border: `2px solid ${response.isCorrect ? '#28a745' : '#dc3545'}`,
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '15px',
                            backgroundColor: response.isCorrect ? '#d4edda' : '#f8d7da'
                          }}
                        >
                          <div style={{ marginBottom: '15px' }}>
                            <h4 style={{
                              fontSize: '16px',
                              fontWeight: 'bold',
                              color: '#333',
                              marginBottom: '10px'
                            }}>
                              Question {index + 1}
                            </h4>
                            <p style={{
                              fontSize: '15px',
                              color: '#333',
                              lineHeight: '1.5'
                            }}>
                              {response.questionText || 'Question non disponible'}
                            </p>
                          </div>

                          <div style={{ display: 'grid', gap: '10px' }}>
                            <div style={{
                              padding: '10px',
                              backgroundColor: response.isCorrect ? '#28a745' : '#dc3545',
                              color: 'white',
                              borderRadius: '8px',
                              fontWeight: 'bold'
                            }}>
                              {response.isCorrect ? '✓' : '✗'} Réponse de l'étudiant: {response.studentAnswer || 'Pas de réponse'}
                            </div>

                            {!response.isCorrect && response.correctAnswer && (
                              <div style={{
                                padding: '10px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                borderRadius: '8px'
                              }}>
                                ✓ Bonne réponse: {response.correctAnswer}
                              </div>
                            )}

                            {response.timeSpent && (
                              <div style={{
                                fontSize: '14px',
                                color: '#6c757d'
                              }}>
                                ⏱️ Temps passé: {response.timeSpent} secondes
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#6c757d'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
                      <p>Aucune donnée de réponse détaillée disponible</p>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '30px',
                  paddingTop: '20px',
                  borderTop: '2px solid #e9ecef'
                }}>
                  <button
                    onClick={closeDialog}
                    style={{
                      padding: '12px 30px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: '#624BFF',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
