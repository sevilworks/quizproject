import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from '../services/authService';
import { studentService } from '../services/studentService';

export default function StudentStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState('overview'); // overview, history, performance
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quizDetails, setQuizDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const user = authService.getCurrentUser();
  const studentName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.username || "Étudiant";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les statistiques
      console.log("Fetching student stats...");
      const statsData = await studentService.getStats();
      console.log("Raw stats data:", statsData);
      console.log("Stats data keys:", Object.keys(statsData || {}));
      console.log("Stats data values:", statsData);
      setStats(statsData);

      // Charger l'historique des quiz
      console.log("Fetching quiz history...");
      const historyData = await studentService.getQuizHistory();
      console.log("Raw history data:", historyData);
      setQuizHistory(historyData || []);

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

const handleGoBack = () => {
    navigate('/student/dashboard');
  };

  const handleQuizCardClick = async (quiz) => {
    setSelectedQuiz(quiz);
    setIsDialogOpen(true);
    setLoadingDetails(true);
    
    try {
      // Parse student_responses JSON data (API returns snake_case)
      let parsedResponses = [];
      console.log('🔍 Quiz data received:', quiz);
      console.log('🔍 student_responses field:', quiz.student_responses);
      
      // API returns snake_case field name
      const responsesData = quiz.student_responses || quiz.studentResponses;
      
      if (responsesData) {
        try {
          parsedResponses = JSON.parse(responsesData);
          console.log('✅ Parsed responses:', parsedResponses);
          console.log('✅ Number of responses:', parsedResponses.length);
          
          // Fetch quiz details to get question and answer texts
          console.log('🔍 Fetching quiz details for quiz ID:', quiz.quiz_id || quiz.quizId);
          const quizService = (await import('../services/quizService')).quizService;
          const quizDetailsData = await quizService.getQuizById(quiz.quiz_id || quiz.quizId);
          console.log('📋 Quiz details fetched:', quizDetailsData);
          
          // Enrich responses with actual question and answer texts
          const enrichedResponses = parsedResponses.map(response => {
            const question = quizDetailsData.questions?.find(q => q.id === response.questionId);
            if (!question) {
              console.warn(`⚠️ Question not found for ID: ${response.questionId}`);
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
          
          console.log('✅ Enriched responses:', enrichedResponses);
          parsedResponses = enrichedResponses;
          
        } catch (error) {
          console.error('❌ Error parsing/enriching student responses:', error);
          console.error('❌ Raw data:', responsesData);
          parsedResponses = [];
        }
      } else {
        console.warn('⚠️ No student_responses field found in quiz data');
        console.warn('⚠️ Available fields:', Object.keys(quiz));
      }
      
      setQuizDetails({
        ...quiz,
        studentResponses: parsedResponses
      });
    } catch (error) {
      console.error('Error loading quiz details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedQuiz(null);
    setQuizDetails(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#17a2b8';
    if (score >= 40) return '#ffc107';
    return '#dc3545';
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { label: 'Excellent', emoji: '🏆', color: '#FFD700' };
    if (percentage >= 75) return { label: 'Très Bien', emoji: '🌟', color: '#28a745' };
    if (percentage >= 60) return { label: 'Bien', emoji: '👍', color: '#17a2b8' };
    if (percentage >= 40) return { label: 'Moyen', emoji: '📚', color: '#ffc107' };
    return { label: 'À améliorer', emoji: '💪', color: '#dc3545' };
  };

  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    .stat-card {
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.2) !important;
    }
    .tab-button {
      transition: all 0.3s ease;
    }
    .tab-button.active {
      background-color: white !important;
      color: #667eea !important;
    }
    
@media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr !important;
      }
      .tabs {
        flex-direction: column !important;
      }
    }
    .quiz-card-clickable {
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .quiz-card-clickable:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.3) !important;
    }
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .dialog-content {
      background-color: white;
      border-radius: 20px;
      padding: 30px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    }
    .question-item {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
    }
    .question-item.correct {
      border-color: #28a745;
      background-color: #d4edda;
    }
    .question-item.incorrect {
      border-color: #dc3545;
      background-color: #f8d7da;
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
            Chargement des statistiques...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflow: 'auto',
        paddingBottom: '40px'
      }}>
        {/* Header */}
        <header style={{
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={handleGoBack}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              ←
            </button>
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '28px',
              color: '#667eea'
            }}>
              Q
            </div>
            <h1 style={{
              color: 'white',
              margin: 0,
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>
              FLASH_MIND
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '8px 20px',
              borderRadius: '25px'
            }}>
              <span style={{ fontSize: '24px' }}>😀</span>
              <span style={{ color: 'white', fontWeight: '600' }}>{studentName}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#667eea',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Déconnexion
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          {/* Page Title */}
          <div className="fade-in" style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h2 style={{
              fontSize: '42px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '10px'
            }}>
              📊 Mes Statistiques
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              Suivez votre progression et vos performances
            </p>
          </div>

          {/* Tabs */}
          <div className="fade-in tabs" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '40px',
            flexWrap: 'wrap'
          }}>
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: activeTab === 'overview' ? '#667eea' : 'white',
                backgroundColor: activeTab === 'overview' ? 'white' : 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer'
              }}
            >
              📈 Vue d'ensemble
            </button>
            <button
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: activeTab === 'history' ? '#667eea' : 'white',
                backgroundColor: activeTab === 'history' ? 'white' : 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer'
              }}
            >
              📋 Historique
            </button>
            <button
              className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: activeTab === 'performance' ? '#667eea' : 'white',
                backgroundColor: activeTab === 'performance' ? 'white' : 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer'
              }}
            >
              🎯 Performance
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="fade-in">
              {/* Stats Cards */}
              <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '25px',
                marginBottom: '40px'
              }}>
                <div className="stat-card" style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏆</div>
                  <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
                    {stats?.total_quizzes || 0}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6c757d' }}>Quiz complétés</p>
                </div>

                <div className="stat-card" style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>⭐</div>
                  <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
                    {stats?.average_score ? stats.average_score.toFixed(1) : '0.0'}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6c757d' }}>Score moyen</p>
                </div>

                <div className="stat-card" style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔥</div>
                  <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
                    {stats?.current_streak || 0}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6c757d' }}>Jours de série</p>
                </div>

                <div className="stat-card" style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>💯</div>
                  <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
                    {stats?.best_score ? Math.round(stats.best_score) : 0}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6c757d' }}>Meilleur score</p>
                </div>

                <div className="stat-card" style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
                  <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
                    {stats?.perfect_quizzes || 0}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6c757d' }}>Quiz parfaits</p>
                </div>

                <div className="stat-card" style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
                  <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
                    {stats?.success_rate ? stats.success_rate.toFixed(1) : '0.0'}%
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6c757d' }}>Taux de réussite</p>
                </div>
              </div>

              {/* Performance Graph */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '30px',
                marginBottom: '30px'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '20px'
                }}>
                  📈 Évolution de vos performances
                </h3>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '15px',
                  padding: '30px',
                  textAlign: 'center'
                }}>
                  {stats?.success_rate ? (
                    <>
                      <div style={{
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        border: `15px solid ${getScoreColor(stats.success_rate)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                      }}>
                        <div style={{
                          fontSize: '48px',
                          fontWeight: 'bold',
                          color: getScoreColor(stats.success_rate)
                        }}>
                          {Math.round(stats.success_rate)}%
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6c757d'
                        }}>
                          Réussite globale
                        </div>
                      </div>
                      {(() => {
                        const perf = getPerformanceLevel(stats.success_rate);
                        return (
                          <div style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: perf.color
                          }}>
                            {perf.emoji} {perf.label}
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <p style={{ color: '#6c757d' }}>Aucune donnée disponible</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="fade-in">
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '30px'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '20px'
                }}>
                  📋 Historique des quiz
                </h3>

                {quizHistory.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
                    <h4 style={{ fontSize: '24px', marginBottom: '10px' }}>
                      Aucun quiz complété
                    </h4>
                    <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                      Commencez à faire des quiz pour voir votre historique ici
                    </p>
                    <button
                      onClick={handleGoBack}
                      style={{
                        padding: '12px 30px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: '#17a2b8',
                        border: 'none',
                        borderRadius: '15px',
                        cursor: 'pointer'
                      }}
                    >
                      Voir les quiz disponibles
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gap: '20px'
                  }}>
{quizHistory.map((quiz, index) => (
                      <div
                        key={quiz.participationId || index}
                        className="quiz-card-clickable"
                        onClick={() => handleQuizCardClick(quiz)}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '15px',
                          padding: '25px',
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr auto',
                          gap: '20px',
                          alignItems: 'center',
                          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        }}
                      >
                        {/* Score Circle */}
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          backgroundColor: getScoreColor(quiz.score || 0),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '20px'
                        }}>
                          {Math.round(quiz.score || 0)}
                        </div>

                        {/* Quiz Info */}
                        <div>
                          <h4 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#333',
                            marginBottom: '5px'
                          }}>
                            {quiz.quizTitle}
                          </h4>
                          <p style={{
                            fontSize: '14px',
                            color: '#6c757d',
                            marginBottom: '10px'
                          }}>
                            {quiz.quizDescription || 'Aucune description'}
                          </p>
                          <div style={{
                            display: 'flex',
                            gap: '15px',
                            flexWrap: 'wrap',
                            fontSize: '14px',
                            color: '#6c757d'
                          }}>
                            <span>👨‍🏫 {quiz.professorName}</span>
                            <span>🏅 Rang: {quiz.rank}/{quiz.totalParticipants}</span>
                            <span>📅 {new Date(quiz.completedAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>

                        {/* Badge */}
                        <div style={{
                          textAlign: 'center'
                        }}>
                          {quiz.score >= 90 ? (
                            <div>
                              <div style={{ fontSize: '40px' }}>🏆</div>
                              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#FFD700' }}>
                                Excellent
                              </div>
                            </div>
                          ) : quiz.score >= 75 ? (
                            <div>
                              <div style={{ fontSize: '40px' }}>🌟</div>
                              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#28a745' }}>
                                Très bien
                              </div>
                            </div>
                          ) : quiz.score >= 60 ? (
                            <div>
                              <div style={{ fontSize: '40px' }}>👍</div>
                              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#17a2b8' }}>
                                Bien
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: '40px' }}>📚</div>
                              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffc107' }}>
                                À revoir
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="fade-in">
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '30px'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '20px'
                }}>
                  🎯 Analyse de performance
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {/* Performance par difficulté */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    padding: '25px'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#333',
                      marginBottom: '20px'
                    }}>
                      Performance par difficulté
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#ff6b6b',
                      marginBottom: '15px',
                      fontStyle: 'italic'
                    }}>
                      ⚠️ DUMMY DATA - Uses hardcoded values
                    </p>
                    <div style={{ display: 'grid', gap: '15px' }}>
                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '5px'
                        }}>
                          <span style={{ color: '#6c757d' }}>Facile</span>
                          <span style={{ fontWeight: 'bold' }}>85%</span>
                        </div>
                        <div style={{
                          height: '10px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '5px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: '85%',
                            height: '100%',
                            backgroundColor: '#28a745'
                          }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '5px'
                        }}>
                          <span style={{ color: '#6c757d' }}>Moyen</span>
                          <span style={{ fontWeight: 'bold' }}>70%</span>
                        </div>
                        <div style={{
                          height: '10px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '5px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: '70%',
                            height: '100%',
                            backgroundColor: '#ffc107'
                          }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '5px'
                        }}>
                          <span style={{ color: '#6c757d' }}>Difficile</span>
                          <span style={{ fontWeight: 'bold' }}>55%</span>
                        </div>
                        <div style={{
                          height: '10px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '5px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: '55%',
                            height: '100%',
                            backgroundColor: '#dc3545'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Temps moyen */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    padding: '25px',
                    textAlign: 'center'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#333',
                      marginBottom: '20px'
                    }}>
                      Temps moyen par quiz
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#ff6b6b',
                      marginBottom: '15px',
                      fontStyle: 'italic'
                    }}>
                      ⚠️ DUMMY DATA - Uses hardcoded values
                    </p>
                    <div style={{ fontSize: '64px', marginBottom: '10px' }}>⏱️</div>
                    <div style={{
                      fontSize: '36px',
                      fontWeight: 'bold',
                      color: '#667eea',
                      marginBottom: '5px'
                    }}>
                      12:30
                    </div>
                    <div style={{ color: '#6c757d' }}>minutes</div>
                  </div>

                  {/* Points forts */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    padding: '25px'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#333',
                      marginBottom: '20px'
                    }}>
                      🌟 Points forts
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#ff6b6b',
                      marginBottom: '15px',
                      fontStyle: 'italic'
                    }}>
                      ⚠️ DUMMY DATA - Uses hardcoded values
                    </p>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#d4edda',
                        borderRadius: '8px',
                        color: '#155724'
                      }}>
                        ✓ Très bon en React.js
                      </div>
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#d4edda',
                        borderRadius: '8px',
                        color: '#155724'
                      }}>
                        ✓ Excellent en CSS
                      </div>
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#d4edda',
                        borderRadius: '8px',
                        color: '#155724'
                      }}>
                        ✓ Rapidité de réponse
                      </div>
                    </div>
                  </div>

                  {/* À améliorer */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    padding: '25px'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#333',
                      marginBottom: '20px'
                    }}>
                      💪 À améliorer
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#ff6b6b',
                      marginBottom: '15px',
                      fontStyle: 'italic'
                    }}>
                      ⚠️ DUMMY DATA - Uses hardcoded values
                    </p>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '8px',
                        color: '#856404'
}}>
! Approfondir JavaScript ES6+
</div>
<div style={{
padding: '10px',
backgroundColor: '#fff3cd',
borderRadius: '8px',
color: '#856404'
}}>
! Travailler Node.js
</div>
<div style={{
padding: '10px',
backgroundColor: '#fff3cd',
borderRadius: '8px',
color: '#856404'
}}>
! Améliorer la gestion du temps
</div>
</div>
</div>
</div>
  {/* Recommandations */}
  <div style={{
              marginTop: '30px',
              backgroundColor: 'white',
              borderRadius: '15px',
              padding: '25px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '15px'
              }}>
                💡 Recommandations
              </h4>
              <p style={{
                fontSize: '12px',
                color: '#ff6b6b',
                marginBottom: '15px',
                fontStyle: 'italic'
              }}>
                ⚠️ DUMMY DATA - Uses hardcoded values
              </p>
              <div style={{
                display: 'grid',
                gap: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    📚
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      marginBottom: '5px',
                      color: '#333'
                    }}>
                      Pratiquez régulièrement
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                      Essayez de faire au moins un quiz par jour pour maintenir votre série
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    🎯
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      marginBottom: '5px',
                      color: '#333'
                    }}>
                      Concentrez-vous sur vos faiblesses
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                      Refaites les quiz où vous avez obtenu moins de 60% pour vous améliorer
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    ⏱️
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      marginBottom: '5px',
                      color: '#333'
                    }}>
                      Gérez mieux votre temps
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                      Prenez le temps de bien lire chaque question avant de répondre
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

{/* Dialog Component */}
      {isDialogOpen && (
        <div className="dialog-overlay" onClick={closeDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
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
                      📋 {quizDetails?.quizTitle}
                    </h2>
                    <div style={{
                      display: 'flex',
                      gap: '20px',
                      fontSize: '14px',
                      color: '#6c757d'
                    }}>
                      <span>🏅 Score: {Math.round(quizDetails?.score || 0)}%</span>
                      <span>📅 {quizDetails?.completedAt ? new Date(quizDetails.completedAt).toLocaleDateString('fr-FR') : ''}</span>
                      <span>👨‍🏫 {quizDetails?.professorName}</span>
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                      {Math.round(quizDetails?.score || 0)}%
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>Score final</div>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏆</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                      {quizDetails?.rank}/{quizDetails?.totalParticipants}
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>Classement</div>
                  </div>

                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                      {quizDetails?.studentResponses?.length || 0}
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

                  {quizDetails?.studentResponses && quizDetails.studentResponses.length > 0 ? (
                    <div>
                      {quizDetails.studentResponses.map((response, index) => (
                        <div
                          key={index}
                          className={`question-item ${response.isCorrect ? 'correct' : 'incorrect'}`}
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
                              ✓ Votre réponse: {response.studentAnswer || 'Pas de réponse'}
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
                      backgroundColor: '#667eea',
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

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        color: 'white',
        fontSize: '14px',
        padding: '20px',
        marginTop: '40px'
      }}>
        <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>
          © 2025 Flash Mind Quiz Time. Tous droits réservés.
        </p>
      </div>
    </div>
  </>
);
}