import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { authService } from '../services/authService';
import { useNotification } from '../components/Notification';
import { QuizSecurityManager, securityUtils } from '../utils/quizSecurity';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  // Non-intrusive security state
  const [securityViolations, setSecurityViolations] = useState(0);
  const [securityActive, setSecurityActive] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [showFraudPopup, setShowFraudPopup] = useState(false);
  const [participationId, setParticipationId] = useState(null);

  const user = authService.getCurrentUser();
  const securityManagerRef = useRef(null);
  const questionElementsRef = useRef([]);

  // Notification hook
  const { showSuccess, showError, showWarning, NotificationComponent } = useNotification();

  useEffect(() => {
    loadQuiz();
  }, [id]);

  useEffect(() => {
    if (quizStarted && timeRemaining > 0 && quiz) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
        setTotalTime(totalTime + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && quizStarted) {
      handleNext();
    }
  }, [timeRemaining, quizStarted, quiz]);

  // Cleanup security manager when component unmounts
  useEffect(() => {
    return () => {
      if (securityManagerRef.current) {
        securityManagerRef.current.stop();
        securityManagerRef.current = null;
      }
      securityUtils.removeAllOverlays();
    };
  }, []);

  // Create participation entry when quiz starts
  const createParticipationEntry = async () => {
    try {
      const participation = await quizService.createParticipation(id);
      setParticipationId(participation.id);
      console.log('📝 Participation created:', participation.id);
      return participation;
    } catch (error) {
      console.error('Error creating participation:', error);
      
      // Check if it's a duplicate participation error
      if (error.response?.data?.error?.includes('already participated') ||
          error.message?.includes('already participated')) {
        showError('Vous avez déjà participié à ce quiz. Redirection vers vos résultats...', 'Participation duplicate');
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 3000);
        throw new Error('DUPLICATE_PARTICIPATION');
      }
      
      throw error;
    }
  };

  // Mark participation as fraud
  const markParticipationAsFraud = async () => {
    if (!participationId) return;
    
    try {
      await quizService.markAsFraud(participationId);
      console.log('🚫 Participation marked as fraud:', participationId);
    } catch (error) {
      console.error('Error marking participation as fraud:', error);
    }
  };

  // Non-intrusive security management
  const initializeSecurity = async () => {
    try {
      // Create participation entry first
      const participation = await createParticipationEntry();
      console.log('✅ Security initialization started with participation:', participation.id);
    } catch (error) {
      if (error.message === 'DUPLICATE_PARTICIPATION') {
        // Error already handled in createParticipationEntry
        return;
      }
      showError('Erreur lors de l\'initialisation du quiz', 'Erreur');
      return;
    }

    try {
      if (securityManagerRef.current) {
        securityManagerRef.current.stop();
      }

      const manager = new QuizSecurityManager({
        maxViolations: 3,
        warningTimeout: 5000,
        activityThreshold: 30000,
        showDevToolsWarning: true
      });

      // Set up violation handler (non-intrusive)
      manager.onViolation(async (violation, violationCount) => {
        console.warn('🚨 Security violation detected:', violation.type);
        setSecurityViolations(violationCount);
        
        let message = '';
        switch (violation.type) {
          case 'COPY_EVENT_BLOCKED':
          case 'COPY_SHORTCUT_BLOCKED':
            message = '⚠️ Copie détectée - Veuillez répondre sans copier';
            break;
          case 'PASTE_EVENT_BLOCKED':
          case 'PASTE_SHORTCUT_BLOCKED':
            message = '⚠️ Collage détecté - Veuillez répondre sans coller';
            break;
          case 'TAB_SWITCH_DETECTED':
            message = '⚠️ Changement d\'onglet détecté - Restez sur le quiz';
            break;
          case 'WINDOW_BLUR_DETECTED':
            message = '⚠️ Vous avez quitté la fenêtre - Restez concentré';
            break;
          case 'WINDOW_CLOSE_ATTEMPT':
            message = '⚠️ Tentative de fermeture détectée';
            break;
          case 'DEV_TOOLS_BLOCKED':
          case 'DEV_TOOLS_DETECTED':
            message = '⚠️ Outils de développement détectés';
            break;
          case 'REFRESH_BLOCKED':
            message = '⚠️ Actualisation détectée';
            break;
          case 'CONTEXT_MENU_BLOCKED':
            message = '⚠️ Menu contextuel détecté';
            break;
          case 'MAX_VIOLATIONS_REACHED':
            await handleMaxViolationsReached();
            return;
          default:
            message = `⚠️ Action détectée: ${violation.type}`;
        }
        
        // Show warning after 2 violations
        if (violationCount >= 2) {
          showSecurityWarningMessage(message);
        }
      });

      // Set up activity monitoring
      manager.onActivity((lastActivity) => {
        console.log('User activity detected:', new Date(lastActivity).toLocaleTimeString());
      });

      securityManagerRef.current = manager;
      manager.start();
      setSecurityActive(true);
      
      console.log('🛡️ Non-intrusive security monitoring initialized');
    } catch (error) {
      console.error('Error initializing security:', error);
      showError('Erreur lors de l\'initialisation de la surveillance', 'Erreur de sécurité');
    }
  };

  const stopSecurity = () => {
    if (securityManagerRef.current) {
      securityManagerRef.current.stop();
      securityManagerRef.current = null;
    }
    setSecurityActive(false);
    securityUtils.removeAllOverlays();
    console.log('🛡️ Security monitoring stopped');
  };

  const showSecurityWarningMessage = (message) => {
    setWarningMessage(message);
    setShowSecurityWarning(true);
    
    setTimeout(() => {
      setShowSecurityWarning(false);
    }, 3000);
  };

  const handleMaxViolationsReached = async () => {
    console.log('🚫 Max violations reached - marking as fraud');
    
    try {
      // Mark participation as fraud
      await markParticipationAsFraud();
      
      // Show red toast notification for fraud
      showError(
        'Vous êtes marqué comme commettant une fraude pour ce quiz en raison de violations de sécurité multiples.',
        'Marquage de fraude',
        8000 // Show for 8 seconds
      );
      
    } catch (error) {
      console.error('Error marking participation as fraud:', error);
      showError('Erreur lors du marquage de fraude', 'Erreur de système');
    }
    
    // Show fraud popup
    setShowFraudPopup(true);
  };

  const handleFraudPopupClose = () => {
    setShowFraudPopup(false);
    // Redirect to dashboard
    navigate('/student/dashboard');
  };

  const loadQuiz = async () => {
    try {
      console.log("🔍 Loading quiz with ID:", id);
      const data = await quizService.getQuizById(id);
      console.log("📋 Quiz data received:", data);
      setQuiz(data);

      console.log("❓ Fetching questions for quiz ID:", id);
      const questionsData = await quizService.getQuizQuestions(id);
      console.log("📝 Questions data received:", questionsData);
      console.log("📊 Questions array length:", questionsData.length);
      console.log("📋 Questions array:", questionsData);
      setQuestions(questionsData);

      setLoading(false);
    } catch (error) {
      console.error("❌ Erreur lors du chargement du quiz:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      showError("Erreur lors du chargement du quiz", "Erreur");
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);
    }
  };

  const handleStartQuiz = async () => {
    setQuizStarted(true);
    setTimeRemaining(30);
    await initializeSecurity();
    
    // Apply text selection prevention to questions only
    setTimeout(() => {
      const questionElements = document.querySelectorAll('.question-text');
      questionElementsRef.current = questionElements;
      securityUtils.preventTextSelectionOnQuestions(questionElements);
    }, 100);
  };

  const handleAnswerSelect = (response) => {
    setSelectedAnswer(response);
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion].id,
      selectedResponseId: selectedAnswer?.id || null,
      isCorrect: selectedAnswer?.isCorrect || false,
      timeSpent: 30 - timeRemaining
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeRemaining(30);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]?.selectedAnswer || null);
      setTimeRemaining(30);
    }
  };

  const finishQuiz = async (finalAnswers) => {
    try {
      // Stop security monitoring before finishing
      stopSecurity();

      // Extract selected response IDs for API submission
      const selectedResponseIds = finalAnswers.map(answer => answer.selectedResponseId).filter(id => id !== null);

      console.log("🚀 Submitting quiz answers for quiz ID:", id);
      console.log("📤 Request body data:", { ids: selectedResponseIds });
      console.log("📊 SelectedResponseIds array:", selectedResponseIds);
      console.log("📋 Final answers array:", finalAnswers);
      console.log("🔒 Security violations:", securityViolations);

      // Submit quiz and get backend-calculated score
      const participation = await quizService.submitQuizAnswers(id, {
        selectedResponseIds: selectedResponseIds,
        studentResponses: JSON.stringify(finalAnswers),
        securityViolations: securityViolations
      });
      const backendPercentage = parseFloat(participation.score);

      // Calculate score out of 1250 points using backend percentage
      const score = (backendPercentage / 100) * 1250;

      const result = {
        quizId: id,
        score: score,
        percentage: backendPercentage,
        correctAnswers: Math.round((backendPercentage / 100) * questions.length),
        totalQuestions: questions.length,
        totalTime: totalTime,
        answers: finalAnswers,
        securityViolations: securityViolations
      };

      // Navigate to results page
      navigate(`/student/results`, {
        state: {
          result,
          quiz,
          studentName: `${user.firstName} ${user.lastName}`
        }
      });
    } catch (error) {
      console.error("Erreur lors de la soumission du quiz:", error);
      showWarning("Vous avez déjà participé à ce quiz", "Participation déjà enregistrée");
    }
  };

  const progressPercentage = questions.length > 0 
    ? ((currentQuestion + 1) / questions.length) * 100 
    : 0;

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
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    .slide-in {
      animation: slideIn 0.3s ease-out;
    }
    .question-text {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
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
            Chargement du quiz...
          </div>
        </div>
      </>
    );
  }

  if (!quizStarted) {
    return (
      <>
        <style>{styles}</style>
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
          {/* Logo */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
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
            <span style={{
              color: 'white',
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>
              FLASH_MIND
            </span>
          </div>

          <div className="fade-in" style={{
            backgroundColor: 'white',
            borderRadius: '30px',
            padding: '50px 40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            width: '100%',
            maxWidth: '700px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>

            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '20px'
            }}>
              {quiz.title}
            </h1>

            <p style={{
              fontSize: '18px',
              color: '#6c757d',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              {quiz.description}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '20px',
              marginBottom: '40px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '15px'
            }}>
              <div>
                <div style={{ fontSize: '32px', marginBottom: '5px' }}>📚</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                  {questions.length}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>Questions</div>
              </div>

              <div>
                <div style={{ fontSize: '32px', marginBottom: '5px' }}>⏱️</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                  {quiz.duration}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>Minutes</div>
              </div>

              <div>
                <div style={{ fontSize: '32px', marginBottom: '5px' }}>🏆</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                  1250
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>Points Max</div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#856404' }}>
                ⚠️ Instructions :
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
                <li>Vous avez 30 secondes par question</li>
                <li>Une seule réponse par question</li>
                <li>Le quiz commence dès que vous cliquez sur "Commencer"</li>
              </ul>
            </div>

            <div style={{
              backgroundColor: '#d1ecf1',
              border: '1px solid #bee5eb',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#0c5460' }}>
                🛡️ Détection de fraude non-intrusive :
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c5460' }}>
                <li>Vos actions sont surveillées en arrière-plan</li>
                <li>3 violations de sécurité = markage comme fraude</li>
                <li>Violations : changement d'onglet, copier/coller, etc.</li>
                <li>Navigation et copie restent possibles (non bloquantes)</li>
              </ul>
            </div>

            <button
              onClick={handleStartQuiz}
              style={{
                width: '100%',
                padding: '18px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: '#17a2b8',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#138496'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#17a2b8'}
            >
              Commencer le Quiz →
            </button>

            <button
              onClick={() => navigate('/student/dashboard')}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#6c757d',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                marginTop: '15px'
              }}
            >
              ← Retour au tableau de bord
            </button>
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
        <div style={{
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
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

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '8px 20px',
            borderRadius: '25px',
            color: 'white',
            fontWeight: '600'
          }}>
            <span>{user?.firstName} {user?.lastName}</span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          maxWidth: '900px',
          margin: '40px auto',
          padding: '0 20px'
        }}>
          {/* Timer */}
          <div className="fade-in" style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <div style={{
              fontSize: '24px',
              color: timeRemaining < 10 ? '#dc3545' : 'white',
              fontWeight: 'bold',
              animation: timeRemaining < 10 ? 'pulse 1s infinite' : 'none'
            }}>
              ⏱️ Temps restant: {String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:{String(timeRemaining % 60).padStart(2, '0')}
            </div>
          </div>

          {/* Security Warning Display */}
          {showSecurityWarning && (
            <div className="slide-in" style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                backgroundColor: '#ffc107',
                color: '#856404',
                padding: '12px 20px',
                borderRadius: '15px',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                display: 'inline-block',
                animation: 'pulse 2s infinite'
              }}>
                {warningMessage}
                {securityViolations > 0 && (
                  <span style={{ marginLeft: '10px' }}>
                    ({securityViolations}/3 violations)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Security Status Indicator */}
          {securityActive && (
            <div className="fade-in" style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(40, 167, 69, 0.9)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#28a745',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s infinite'
                }}></div>
                🛡️ Surveillance active
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              height: '50px',
              borderRadius: '25px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                backgroundColor: '#17a2b8',
                borderRadius: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                transition: 'width 0.3s ease'
              }}>
                Question {currentQuestion + 1} sur {questions.length}
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="fade-in" style={{
            backgroundColor: 'white',
            borderRadius: '25px',
            padding: '40px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
            marginBottom: '30px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginBottom: '30px',
              gap: '15px'
            }}>
              <div style={{ fontSize: '40px', marginTop: '5px' }}>❓</div>
              <h2 className="question-text" style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#333',
                margin: 0,
                flex: 1,
                lineHeight: '1.4',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}>
                {questions[currentQuestion]?.question_text || questions[currentQuestion]?.questionText || 'Question not loaded'}
              </h2>
            </div>

            <h5 style={{
              color: '#667eea',
              fontWeight: 'bold',
              marginBottom: '20px',
              fontSize: '18px'
            }}>
              Sélectionnez une réponse :
            </h5>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {questions[currentQuestion]?.responses?.map((response, index) => (
                <button
                  key={response.id}
                  onClick={() => handleAnswerSelect(response)}
                  style={{
                    padding: '25px',
                    fontSize: '18px',
                    fontWeight: '600',
                    borderRadius: '15px',
                    border: selectedAnswer?.id === response.id ? '3px solid #667eea' : '2px solid #dee2e6',
                    backgroundColor: selectedAnswer?.id === response.id ? '#667eea' : 'white',
                    color: selectedAnswer?.id === response.id ? 'white' : '#333',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    if (selectedAnswer?.id !== response.id) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedAnswer?.id !== response.id) {
                      e.target.style.borderColor = '#dee2e6';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      border: `2px solid ${selectedAnswer?.id === response.id ? 'white' : '#667eea'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selectedAnswer?.id === response.id ? 'white' : 'transparent',
                      color: selectedAnswer?.id === response.id ? '#667eea' : 'transparent',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {selectedAnswer?.id === response.id && '✓'}
                    </div>
                    <span style={{ flex: 1 }}>{response.responseText || response.responseText || 'Response not loaded'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              style={{
                padding: '15px 35px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: currentQuestion === 0 ? '#6c757d' : '#667eea',
                border: 'none',
                borderRadius: '15px',
                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                opacity: currentQuestion === 0 ? 0.5 : 1,
                transition: 'all 0.3s'
              }}
            >
              ← Précédent
            </button>

            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              style={{
                padding: '15px 35px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: !selectedAnswer ? '#6c757d' : '#17a2b8',
                border: 'none',
                borderRadius: '15px',
                cursor: !selectedAnswer ? 'not-allowed' : 'pointer',
                opacity: !selectedAnswer ? 0.5 : 1,
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                if (selectedAnswer) {
                  e.target.style.backgroundColor = '#138496';
                }
              }}
              onMouseOut={(e) => {
                if (selectedAnswer) {
                  e.target.style.backgroundColor = '#17a2b8';
                }
              }}
            >
              {currentQuestion === questions.length - 1 ? 'Terminer' : 'Suivant'} →
            </button>
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
          <p style={{ fontWeight: 'bold' }}>
            © 2025 Flash Mind Quiz Time. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Fraud Detection Popup */}
      {showFraudPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          backdropFilter: 'blur(5px)'
        }}>
          <div className="fade-in" style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
            
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#dc3545',
              marginBottom: '20px'
            }}>
              Participation marquée comme fraude
            </h2>
            
            <p style={{
              fontSize: '18px',
              color: '#6c757d',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Votre participation a été marquée comme fraude en raison de nombreuses violations de sécurité détectées.
            </p>
            
            <div style={{
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '30px',
              color: '#721c24'
            }}>
              <strong>Violations détectées :</strong> {securityViolations}<br/>
              <small>Limite autorisée : 3 violations maximum</small>
            </div>
            
            <button
              onClick={handleFraudPopupClose}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: '#dc3545',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      )}
    </>
  );
}