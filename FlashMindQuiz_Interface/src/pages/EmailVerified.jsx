import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authService } from '../services/authService';

export default function EmailVerified() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const success = searchParams.get("success");

    // Check if we've already attempted verification for this token
    const verificationKey = `email_verification_${token}`;
    const alreadyAttempted = localStorage.getItem(verificationKey);

    // Prevent multiple effect executions
    if (verificationAttempted.current || alreadyAttempted) {
      return;
    }

    // If token is provided in URL and verification hasn't been attempted yet
    if (token && !verificationAttempted.current && !alreadyAttempted) {
      console.log("Starting email verification with token:", token);
      verificationAttempted.current = true;
      
      // Mark this token as attempted immediately
      localStorage.setItem(verificationKey, "attempted");
      
      // Use setTimeout to prevent immediate re-renders from triggering again
      setTimeout(() => {
        handleVerification(token);
      }, 0);
    } else if (success === "true") {
      verificationAttempted.current = true;
      setStatus("success");
      setMessage("Votre email a été vérifié avec succès !");
    } else if (!token && !success) {
      verificationAttempted.current = true;
      setStatus("error");
      setMessage("Aucun token de vérification fourni.");
    }
  }, [searchParams]);

  const handleVerification = async (token) => {
    const verificationKey = `email_verification_${token}`;
    
    try {
      console.log("Making verification request for token:", token);
      const response = await authService.verifyEmail(token);
      console.log("Verification successful:", response);
      setStatus("success");
      setMessage(response.message || "Votre email a été vérifié avec succès !");
      
      // Clean up localStorage key after successful verification
      localStorage.removeItem(verificationKey);
      
      // Clear the token from URL after successful verification
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("token");
      setSearchParams(newSearchParams);
      
    } catch (error) {
      console.log("Verification failed:", error);
      setStatus("error");
      setMessage(error.response?.data?.message || error.response?.data?.error || "Le lien de vérification est invalide ou a expiré.");
      
      // Clean up localStorage key after failed verification
      localStorage.removeItem(verificationKey);
      
      // Clear the token from URL after failed verification
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("token");
      setSearchParams(newSearchParams);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
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
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }
    .fade-in {
      animation: fadeIn 0.8s ease-out;
    }
    .bounce {
      animation: bounce 2s infinite;
    }
    .pulse {
      animation: pulse 2s infinite;
    }
    .success-bg {
      background: linear-gradient(135deg, #28a745 0%, #18392B 100%);
    }
    .error-bg {
      background: linear-gradient(135deg, #dc3545 0%, #e83e8c 100%);
    }
    .loading-bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .verification-card {
      background: white;
      border-radius: 30px;
      padding: 60px 40px;
      box-shadow: 0 25px 80px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 500px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .verification-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #28a745, #20c997, #28a745);
      background-size: 200% 100%;
      animation: shimmer 3s infinite linear;
    }
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    .success-icon {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60px;
      margin: 0 auto 30px;
      box-shadow: 0 15px 40px rgba(40, 167, 69, 0.4);
      position: relative;
    }
    .success-icon::after {
      content: '';
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      border: 3px solid rgba(40, 167, 69, 0.2);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    .error-icon {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #dc3545 0%, #e83e8c 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60px;
      margin: 0 auto 30px;
      box-shadow: 0 15px 40px rgba(220, 53, 69, 0.4);
    }
    .loading-icon {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60px;
      margin: 0 auto 30px;
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
      animation: spin 2s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .login-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 40px;
      border-radius: 50px;
      cursor: pointer;
      font-size: 18px;
      font-weight: 600;
      margin-top: 30px;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }
    .login-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
    }
    .retry-button {
      background: linear-gradient(135deg, #dc3545 0%, #e83e8c 100%);
      color: white;
      border: none;
      padding: 16px 40px;
      border-radius: 50px;
      cursor: pointer;
      font-size: 18px;
      font-weight: 600;
      margin-top: 30px;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(220, 53, 69, 0.4);
    }
    .retry-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(220, 53, 69, 0.6);
    }
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #ffd700;
      border-radius: 50%;
      animation: confetti-fall 5s linear infinite;
    }
    @keyframes confetti-fall {
      0% {
        transform: translateY(-100px) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
    
    @media (max-width: 768px) {
      .logo-text {
        font-size: 24px !important;
      }
      .logo-circle {
        width: 40px !important;
        height: 40px !important;
        font-size: 22px !important;
      }
      .verification-card {
        padding: 40px 30px !important;
        margin: 20px !important;
      }
    }
    
    @media (max-width: 480px) {
      .logo-container {
        top: 10px !important;
        left: 10px !important;
        gap: 8px !important;
      }
      .logo-text {
        font-size: 20px !important;
      }
      .logo-circle {
        width: 35px !important;
        height: 35px !important;
        font-size: 18px !important;
      }
      .lang-button {
        top: 10px !important;
        right: 10px !important;
        padding: 8px 18px !important;
        font-size: 14px !important;
      }
      .verification-card {
        padding: 30px 20px !important;
        margin: 10px !important;
        border-radius: 20px !important;
      }
      .success-icon, .error-icon, .loading-icon {
        width: 80px !important;
        height: 80px !important;
        font-size: 40px !important;
      }
    }
  `;

  const Confetti = () => {
    const confetti = [];
    for (let i = 0; i < 50; i++) {
      confetti.push(
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            background: `hsl(${Math.random() * 360}, 100%, 50%)`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
          }}
        />
      );
    }
    return <>{confetti}</>;
  };

  if (status === "loading") {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-bg" style={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          padding: '20px',
          overflow: 'auto'
        }}>
          {/* Logo */}
          <div className="logo-container" style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div className="logo-circle" style={{
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
            <span className="logo-text" style={{
              color: 'white',
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>
              FLASH_MIND
            </span>
          </div>

          <div className="fade-in verification-card">
            <div className="loading-icon">
              ⏳
            </div>

            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#000'
            }}>
              Vérification en cours
            </h2>

            <p style={{
              fontSize: '18px',
              color: '#6c757d',
              lineHeight: '1.6'
            }}>
              Nous vérifions votre email...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className={status === "success" ? "success-bg" : "error-bg"} style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        padding: '20px',
        overflow: 'auto'
      }}>
        {/* Confetti pour le succès */}
        {status === "success" && <Confetti />}

        {/* Logo */}
        <div className="logo-container" style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div className="logo-circle" style={{
            width: '50px',
            height: '50px',
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '28px',
            color: status === "success" ? '#28a745' : '#dc3545'
          }}>
            Q
          </div>
          <span className="logo-text" style={{
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>
            FLASH_MIND
          </span>
        </div>

        {/* Langue */}
        <div className="lang-button" style={{
          position: 'absolute',
          top: '20px',
          right: '20px'
        }}>
          <button style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
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

        <div className="fade-in verification-card">
          {status === "success" ? (
            <>
              <div className="success-icon bounce">
                ✅
              </div>

              <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '15px',
                color: '#000'
              }}>
                Félicitations !
              </h2>

              <p style={{
                fontSize: '18px',
                color: '#6c757d',
                marginBottom: '10px',
                lineHeight: '1.6'
              }}>
                {message}
              </p>

              <p style={{
                fontSize: '16px',
                color: '#28a745',
                fontWeight: '600',
                marginBottom: '30px'
              }}>
                Votre compte est maintenant activé
              </p>

              <button
                onClick={handleLoginRedirect}
                className="login-button"
              >
                Se connecter 🚀
              </button>
            </>
          ) : (
            <>
              <div className="error-icon">
                ❌
              </div>

              <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '15px',
                color: '#000'
              }}>
                Oups !
              </h2>

              <p style={{
                fontSize: '18px',
                color: '#6c757d',
                marginBottom: '20px',
                lineHeight: '1.6'
              }}>
                {message}
              </p>

              <p style={{
                fontSize: '14px',
                color: '#dc3545',
                fontStyle: 'italic',
                marginBottom: '30px'
              }}>
                Le lien de vérification peut être expiré ou invalide
              </p>

              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleLoginRedirect}
                  className="login-button"
                  style={{ marginTop: 0 }}
                >
                  Page de connexion
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="retry-button"
                  style={{ marginTop: 0 }}
                >
                  Réessayer
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          color: 'white',
          textAlign: 'center',
          fontSize: '14px',
          width: '100%',
          padding: '0 20px'
        }}>
          <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>
            © 2025 FlashMind. Tous droits réservés.
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