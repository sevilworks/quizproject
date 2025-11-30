import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { quizService } from '../services/quizService';
import { studentService } from '../services/studentService';
import { useNotification } from '../components/Notification';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [quizCode, setQuizCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Notification hook
  const { showSuccess, showError, showWarning, NotificationComponent } = useNotification();

  const user = authService.getCurrentUser();
  const studentName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : (user?.firstName || user?.lastName)
      ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      : user?.username || "Étudiant";
  const studentEmoji = "😀";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      console.log("Loading data for student dashboard...");
      console.log("Current user data:", user);

      // Charger les quiz publics
      const quizzesData = await quizService.getPublicQuizzes();
      console.log("Public quizzes data:", quizzesData);
      setPublicQuizzes(quizzesData || []);

      // Charger les statistiques
      const statsData = await studentService.getStats();
      console.log("Student stats data:", statsData);
      setStats({
        total_quizzes: statsData.total_quizzes || 0,
        average_score: statsData.average_score || 0,
        current_streak: statsData.current_streak || 0
      });

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      // Données par défaut en cas d'erreur
      setPublicQuizzes([
        {
          id: 1,
          title: "React.js Fundamentals",
          description: "Test your knowledge of React basics",
          questionCount: 10,
          duration: 15,
          difficulty: "Facile",
          professorName: "Prof. Smith"
        },
        {
          id: 2,
          title: "JavaScript ES6+",
          description: "Modern JavaScript features and syntax",
          questionCount: 15,
          duration: 20,
          difficulty: "Moyen",
          professorName: "Prof. Johnson"
        },
        {
          id: 3,
          title: "CSS Flexbox & Grid",
          description: "Master modern CSS layout techniques",
          questionCount: 12,
          duration: 18,
          difficulty: "Facile",
          professorName: "Prof. Williams"
        },
        {
          id: 4,
          title: "Node.js Backend",
          description: "Server-side JavaScript with Node",
          questionCount: 20,
          duration: 25,
          difficulty: "Difficile",
          professorName: "Prof. Anderson"
        }
      ]);
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!quizCode.trim()) {
      showError("Veuillez entrer un code de quiz !", "Code requis");
      return;
    }
    
    try {
      const quiz = await quizService.getQuizByCode(quizCode);
      showSuccess("Quiz trouvé ! Redirection en cours...", "Succès");
      setTimeout(() => {
        window.location.href = `/student/quiz/${quiz.id}`;
      }, 1000);
    } catch (error) {
      showError("Code de quiz invalide ou quiz introuvable", "Erreur");
    }
  };

  const handleStartQuiz = (quizId) => {
    window.location.href = `/student/quiz/${quizId}`;
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleUsernameClick = () => {
    navigate('/student/stats');
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case "facile": return "#28a745";
      case "moyen": return "#ffc107";
      case "difficile": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const filteredQuizzes = publicQuizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    .quiz-card {
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .quiz-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.2) !important;
    }
    
    @media (max-width: 768px) {
      .logo-text {
        font-size: 24px !important;
      }
      .dashboard-title {
        font-size: 28px !important;
      }
      .quiz-grid {
        grid-template-columns: 1fr !important;
      }
      .header-actions {
        flex-direction: column !important;
        align-items: stretch !important;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr !important;
      }
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
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            Chargement...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NotificationComponent />
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
            <h1 className="logo-text" style={{
              color: 'white',
              margin: 0,
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>
              FLASH_MIND
            </h1>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '8px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onClick={handleUsernameClick}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              <span style={{ fontSize: '24px' }}>{studentEmoji}</span>
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
          {/* Welcome Section */}
          <div className="fade-in" style={{
            textAlign: 'center',
            marginBottom: '50px'
          }}>
            <h2 className="dashboard-title" style={{
              fontSize: '42px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '15px'
            }}>
              Bienvenue, {studentName} ! 👋
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '30px'
            }}>
              Prêt à tester vos connaissances ?
            </p>

            {/* Join by Code Button */}
            <button
              onClick={() => setShowCodeInput(!showCodeInput)}
              style={{
                padding: '18px 50px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: '#17a2b8',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                transition: 'all 0.3s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
              }}
            >
              <span style={{ fontSize: '24px' }}>🔑</span>
              Rejoindre un quiz par code
            </button>

            {/* Code Input */}
            {showCodeInput && (
              <div className="fade-in" style={{
                marginTop: '30px',
                display: 'flex',
                justifyContent: 'center',
                gap: '15px',
                flexWrap: 'wrap'
              }}>
                <input
                  type="text"
                  placeholder="Entrez le code du quiz"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinByCode()}
                  style={{
                    padding: '15px 25px',
                    fontSize: '18px',
                    border: 'none',
                    borderRadius: '15px',
                    backgroundColor: 'white',
                    color: '#333',
                    minWidth: '250px',
                    textAlign: 'center',
                    fontWeight: '600',
                    letterSpacing: '2px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleJoinByCode}
                  style={{
                    padding: '15px 35px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: '#28a745',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                  Rejoindre →
                </button>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="fade-in stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '50px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏆</div>
              <h4 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>
                {stats.total_quizzes}
              </h4>
              <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Quiz complétés
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>⭐</div>
              <h4 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>
                {typeof stats.average_score === 'number' ? stats.average_score.toFixed(1) : '0.0'}
              </h4>
              <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Score moyen
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔥</div>
              <h4 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>
                {stats.current_streak} jours
              </h4>
              <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Série actuelle
              </p>
            </div>
          </div>

          {/* Public Quizzes Section */}
          <div className="fade-in" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '30px',
            padding: '40px',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <h3 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0
              }}>
                📚 Quiz Publics
              </h3>
              
              {/* Search Bar */}
              <div style={{
                position: 'relative',
                flex: '0 1 300px'
              }}>
                <input
                  type="text"
                  placeholder="Rechercher un quiz..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 45px 12px 15px',
                    fontSize: '16px',
                    border: 'none',
                    borderRadius: '25px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    outline: 'none'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px'
                }}>
                  🔍
                </span>
              </div>
            </div>

            {filteredQuizzes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
                <h4 style={{ fontSize: '24px', marginBottom: '10px' }}>
                  Aucun quiz trouvé
                </h4>
                <p style={{ fontSize: '16px' }}>
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <span style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    {filteredQuizzes.length} quiz disponible{filteredQuizzes.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Quiz Grid */}
                <div className="quiz-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '25px'
                }}>
                  {filteredQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="quiz-card"
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '25px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '15px'
                      }}>
                        <h4 style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#333',
                          margin: 0,
                          flex: 1
                        }}>
                          {quiz.title}
                        </h4>
                        <span style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'white',
                          backgroundColor: getDifficultyColor(quiz.difficulty),
                          borderRadius: '12px',
                          marginLeft: '10px',
                          whiteSpace: 'nowrap'
                        }}>
                          {quiz.difficulty || 'Moyen'}
                        </span>
                      </div>

                      <p style={{
                        fontSize: '14px',
                        color: '#6c757d',
                        marginBottom: '20px',
                        lineHeight: '1.5',
                        minHeight: '40px'
                      }}>
                        {quiz.description}
                      </p>

                      <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginBottom: '20px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '14px',
                          color: '#6c757d'
                        }}>
                          <span>📝</span>
                          <span>{quiz.questionCount || 10} questions</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '14px',
                          color: '#6c757d'
                        }}>
                          <span>⏱️</span>
                          <span>{quiz.duration || 15} min</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '14px',
                          color: '#6c757d'
                        }}>
                          <span>👨‍🏫</span>
                          <span>{quiz.professorName || 'Prof.'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartQuiz(quiz.id)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: 'white',
                          backgroundColor: '#667eea',
                          border: 'none',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#5568d3'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
                      >
                        Commencer le quiz →
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

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
          <div>
            <a href="#" style={{ color: 'white', textDecoration: 'underline', marginRight: '20px' }}>
              Politique de confidentialité
            </a>
            <a href="#" style={{ color: 'white', textDecoration: 'underline' }}>
              Conditions d'utilisation
            </a>
          </div>
        </div>
      </div>
    </>
  );
}