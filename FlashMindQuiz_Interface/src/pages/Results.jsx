import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, quiz, studentName } = location.state || {};

  if (!result) {
    navigate('/student/dashboard');
    return null;
  }

  const user = authService.getCurrentUser();
  const displayName = studentName || `${user?.firstName} ${user?.lastName}` || 'Étudiant';

  const handleReplay = () => {
    navigate(`/student/quiz/${result.quizId}`);
  };

  const handleMainMenu = () => {
    navigate('/student/dashboard');
  };

  const minutes = Math.floor(result.totalTime / 60);
  const seconds = result.totalTime % 60;
  const timeElapsed = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const getPerformanceMessage = () => {
    const percentage = result.percentage;
    if (percentage === 100) return { emoji: '🏆', message: 'Parfait ! Score maximum !', color: '#FFD700' };
    if (percentage >= 80) return { emoji: '🌟', message: 'Excellent travail !', color: '#28a745' };
    if (percentage >= 60) return { emoji: '👍', message: 'Bien joué !', color: '#17a2b8' };
    if (percentage >= 40) return { emoji: '📚', message: 'Continuez vos efforts !', color: '#ffc107' };
    return { emoji: '💪', message: 'Ne lâchez rien, réessayez !', color: '#dc3545' };
  };

  const performance = getPerformanceMessage();

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
    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }
    .fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    .scale-in {
      animation: scaleIn 0.5s ease-out;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div style={{
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflow: 'auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
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

        {/* Langue */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px'
        }}>
          <button style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '50rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            🌐 FR
          </button>
        </div>

        {/* Results Card */}
        <div className="fade-in" style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '30px',
          padding: '50px 40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '700px',
          textAlign: 'center'
        }}>
          {/* Performance Icon and Message */}
          <div className="scale-in" style={{
            fontSize: '80px',
            marginBottom: '20px'
          }}>
            {performance.emoji}
          </div>

          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: performance.color,
            marginBottom: '10px'
          }}>
            {performance.message}
          </h2>

          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#000'
          }}>
            {displayName}
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#6c757d',
            marginBottom: '5px'
          }}>
            Final Score
          </p>
          <h2 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#667eea',
            marginBottom: '30px'
          }}>
            {Math.round(result.score)}
          </h2>

          {/* Score Percentage Circle */}
          <div style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            border: `10px solid ${performance.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px',
            backgroundColor: 'white'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: performance.color
            }}>
              {Math.round(result.percentage)}%
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* Left Column - Achievements */}
            <div style={{
              backgroundColor: '#e9ecef',
              borderRadius: '15px',
              padding: '20px',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <span style={{ fontSize: '28px' }}>🏆</span>
                <span style={{ fontSize: '16px', color: '#6c757d', fontWeight: '600' }}>
                  {result.percentage >= 80 ? 'Star Winner' : result.percentage >= 60 ? 'Good Job' : 'Keep Trying'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '28px' }}>
                  {result.percentage >= 90 ? '🥇' : result.percentage >= 70 ? '🥈' : '🥉'}
                </span>
                <span style={{ fontSize: '16px', color: '#6c757d', fontWeight: '600' }}>
                  {result.percentage >= 90 ? '1st position' : result.percentage >= 70 ? '2nd position' : '3rd position'}
                </span>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div style={{
              backgroundColor: '#e9ecef',
              borderRadius: '15px',
              padding: '20px',
              textAlign: 'left'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '15px',
                color: '#000'
            }}>
            Summary of responses
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#28a745', fontSize: '18px' }}>✓</span>
              <span style={{ fontSize: '14px', color: '#6c757d' }}>Correct answers</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{Math.round((result.percentage / 100) * result.totalQuestions)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⚪</span>
              <span style={{ fontSize: '14px', color: '#6c757d' }}>Total questions</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{result.totalQuestions}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⏱️</span>
              <span style={{ fontSize: '14px', color: '#6c757d' }}>Time elapsed</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{timeElapsed}</span>
          </div>
        </div>
      </div>

      {/* Quiz Information */}
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '30px',
        textAlign: 'left'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#856404' }}>
          📝 Quiz: {quiz?.title || 'Quiz'}
        </div>
        <div style={{ fontSize: '14px', color: '#856404' }}>
          {quiz?.description || 'Description non disponible'}
        </div>
      </div>

      {/* Buttons */}
      <button
        onClick={handleReplay}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: '#17a2b8',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          marginBottom: '15px',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#138496'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#17a2b8'}
      >
        🔄 Refaire le quiz
      </button>

      <button
        onClick={handleMainMenu}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333',
          backgroundColor: 'white',
          border: '2px solid #dee2e6',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
        onMouseOut={(e) => e.target.style.borderColor = '#dee2e6'}
      >
        🏠 Retour au tableau de bord
      </button>
    </div>

    {/* Footer */}
    <div style={{
      position: 'absolute',
      bottom: '20px',
      color: 'white',
      textAlign: 'center',
      fontSize: '14px',
      width: '100%',
      padding: '0 20px'
    }}>
      <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        © 2025 Quiz Time. Tous droits réservés.
      </p>
      <div>
        <a href="#" style={{
          color: 'white',
          textDecoration: 'underline',
          marginRight: '10px'
        }}>
          Politique de confidentialité
        </a>
        <span>|</span>
        <a href="#" style={{
          color: 'white',
          textDecoration: 'underline',
          marginLeft: '10px'
        }}>
          Conditions d'utilisation
        </a>
      </div>
    </div>
  </div>
</>
);
}