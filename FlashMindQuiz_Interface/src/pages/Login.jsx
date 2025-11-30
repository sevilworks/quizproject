import { useState } from "react";
import { authService } from '../services/authService';
import { Toaster, toast } from 'react-hot-toast';
import { useNotification } from '../components/Notification';


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour la réinitialisation
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Notification hook
  const { showSuccess, showError, showWarning, NotificationComponent } = useNotification();

const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showError("Veuillez remplir tous les champs !", "Champs requis");
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.login(email, password);

      // Redirection automatique selon le rôle
      authService.redirectToDashboard(data.role);
      
      // Ensure loading state is reset after successful login
      setIsLoading(false);

    } catch (error) {
      const errorMessage = error.message || error.response?.data?.message || error.response?.data?.error || 'Email ou mot de passe incorrect';
      
      // Show error message via toast notification
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      showError("Veuillez entrer votre adresse email", "Email requis");
      return;
    }

    setResetLoading(true);

    try {
      await authService.requestPasswordReset(resetEmail);
      setResetSent(true);
      showSuccess("Email de réinitialisation envoyé avec succès !", "Email envoyé");
    } catch (error) {
      showError("Erreur lors de l'envoi de l'email de réinitialisation", "Erreur");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignup = () => {
    console.log("Redirection vers inscription");
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setResetSent(false);
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
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .slide-in {
      animation: slideIn 0.3s ease-out;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
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
      .login-card {
        padding: 40px 30px !important;
        margin: 20px !important;
      }
      .login-title {
        font-size: 28px !important;
      }
      .avatar-icon {
        width: 70px !important;
        height: 70px !important;
        font-size: 35px !important;
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
      .login-card {
        padding: 30px 20px !important;
        margin: 10px !important;
        border-radius: 20px !important;
      }
      .login-title {
        font-size: 24px !important;
      }
      .login-subtitle {
        font-size: 14px !important;
      }
      .avatar-icon {
        width: 60px !important;
        height: 60px !important;
        font-size: 30px !important;
        margin-bottom: 20px !important;
      }
      .social-buttons {
        flex-direction: column !important;
      }
      .footer-text {
        font-size: 12px !important;
        padding: 0 10px !important;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      
      {/* Modal de réinitialisation de mot de passe */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={resetForgotPassword}>
          <div 
            className="slide-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '40px 30px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              width: '100%',
              maxWidth: '400px',
              textAlign: 'center'
            }}
          >
            {!resetSent ? (
              <>
                <div style={{
                  width: '70px',
                  height: '70px',
                  backgroundColor: '#f5576c',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '35px',
                  margin: '0 auto 20px',
                  boxShadow: '0 5px 15px rgba(245, 87, 108, 0.4)'
                }}>
                  🔐
                </div>

                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#000'
                }}>
                  Mot de passe oublié ?
                </h3>

                <p style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  marginBottom: '25px',
                  lineHeight: '1.5'
                }}>
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '20px'
                    }}>
                      📧
                    </span>
                    <input
                      type="email"
                      placeholder="votre.email@exemple.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '15px 15px 15px 50px',
                        fontSize: '16px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        backgroundColor: '#f5f5f5',
                        color: '#333',
                        outline: 'none',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#f5576c'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '25px'
                }}>
                  <button
                    onClick={resetForgotPassword}
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333',
                      backgroundColor: 'white',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'border-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.borderColor = '#f5576c'}
                    onMouseOut={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: resetLoading ? '#ccc' : '#f5576c',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: resetLoading ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => !resetLoading && (e.target.style.backgroundColor = '#e74c3c')}
                    onMouseOut={(e) => !resetLoading && (e.target.style.backgroundColor = '#f5576c')}
                  >
                    {resetLoading ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{
                  width: '70px',
                  height: '70px',
                  backgroundColor: '#28a745',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '35px',
                  margin: '0 auto 20px',
                  boxShadow: '0 5px 15px rgba(40, 167, 69, 0.4)'
                }}>
                  ✅
                </div>

                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: '#000'
                }}>
                  Email envoyé !
                </h3>

                <p style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  marginBottom: '25px',
                  lineHeight: '1.5'
                }}>
                  Un lien de réinitialisation a été envoyé à <strong>{resetEmail}</strong>. 
                  Vérifiez votre boîte de réception et suivez les instructions.
                </p>

                <button
                  onClick={resetForgotPassword}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: '#28a745',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                  Compris
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        padding: '20px'
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

        {/* Langue */}
        <div className="lang-button" style={{
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

        {/* Login Card */}
        <div className="fade-in login-card" style={{
          backgroundColor: 'white',
          borderRadius: '30px',
          padding: '50px 40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '450px',
          textAlign: 'center'
        }}>
          <div className="avatar-icon" style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#667eea',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            margin: '0 auto 25px',
            boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)'
          }}>
            👤
          </div>

          <h2 className="login-title" style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#000'
          }}>
            Bienvenue !
          </h2>

          <p className="login-subtitle" style={{
            fontSize: '16px',
            color: '#6c757d',
            marginBottom: '30px'
          }}>
            Connectez-vous à votre compte
          </p>

          {/* Email Input */}
          <div style={{
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <div style={{
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px'
              }}>
                📧
              </span>
              <input
                type="email"
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%',
                  padding: '15px 15px 15px 50px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{
            marginBottom: '25px',
            textAlign: 'left'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '8px'
            }}>
              Mot de passe
            </label>
            <div style={{
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px'
              }}>
                🔒
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%',
                  padding: '15px 50px 15px 50px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div style={{
            textAlign: 'right',
            marginBottom: '25px'
          }}>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setShowForgotPassword(true);
              }}
              style={{
                fontSize: '14px',
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Mot de passe oublié ?
            </a>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: isLoading ? '#ccc' : '#17a2b8',
              border: 'none',
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#138496')}
            onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#17a2b8')}
          >
            {isLoading ? 'Connexion...' : 'Se connecter →'}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '25px 0',
            gap: '10px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
            <span style={{ fontSize: '14px', color: '#6c757d' }}>OU</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
          </div>

          {/* Social Login Buttons */}
          <div className="social-buttons" style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <button style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              backgroundColor: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'border-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
            onMouseOut={(e) => e.target.style.borderColor = '#e0e0e0'}
            >
              <span style={{ fontSize: '20px' }}>🔵</span>
              Google
            </button>
            <button style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              backgroundColor: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'border-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
            onMouseOut={(e) => e.target.style.borderColor = '#e0e0e0'}
            >
              <span style={{ fontSize: '20px' }}>📘</span>
              Facebook
            </button>
          </div>

          {/* Signup Link */}
          <p style={{
            fontSize: '14px',
            color: '#6c757d'
          }}>
            Vous n'avez pas de compte ?{' '}
            <a 
              href="signup" 
              onClick={handleSignup}
              style={{
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              S'inscrire
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="footer-text" style={{
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