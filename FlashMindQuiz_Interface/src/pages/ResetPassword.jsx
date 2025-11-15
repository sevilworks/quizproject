import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from '../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValidating, setTokenValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Validation du token au chargement
  useEffect(() => {
    if (!token) {
      setErrorMessage("Token de réinitialisation manquant");
      setTokenValidating(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      await authService.validateResetToken(token);
      setTokenValid(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Token invalide ou expiré");
      setTokenValid(false);
    } finally {
      setTokenValidating(false);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!/[A-Z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une majuscule";
    }
    if (!/[a-z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une minuscule";
    }
    if (!/[0-9]/.test(password)) {
      return "Le mot de passe doit contenir au moins un chiffre";
    }
    return null;
  };

  const handleResetPassword = async () => {
    // Validation des champs
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage("Veuillez remplir tous les champs");
      return;
    }

    // Validation de la force du mot de passe
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    // Vérification de la correspondance
    if (newPassword !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await authService.resetPassword(token, newPassword);
      setResetSuccess(true);
      
      // Redirection vers login après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength <= 2) return '#f5576c';
    if (strength === 3) return '#ffc107';
    return '#28a745';
  };

  const getStrengthText = (strength) => {
    if (strength <= 2) return 'Faible';
    if (strength === 3) return 'Moyen';
    return 'Fort';
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
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    
    .pulse {
      animation: pulse 2s infinite;
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    
    .spinner {
      animation: spin 1s linear infinite;
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
      .reset-card {
        padding: 40px 30px !important;
        margin: 20px !important;
      }
      .reset-title {
        font-size: 28px !important;
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
      .reset-card {
        padding: 30px 20px !important;
        margin: 10px !important;
        border-radius: 20px !important;
      }
      .reset-title {
        font-size: 24px !important;
      }
      .reset-subtitle {
        font-size: 14px !important;
      }
    }
  `;

  // Écran de chargement
  if (tokenValidating) {
    return (
      <>
        <style>{styles}</style>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{
              width: '60px',
              height: '60px',
              border: '6px solid rgba(255,255,255,0.3)',
              borderTop: '6px solid white',
              borderRadius: '50%',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
              Vérification du lien...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Token invalide
  if (!tokenValid) {
    return (
      <>
        <style>{styles}</style>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '20px'
        }}>
          <div className="fade-in" style={{
            backgroundColor: 'white',
            borderRadius: '30px',
            padding: '50px 40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f5576c',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 25px',
              boxShadow: '0 5px 15px rgba(245, 87, 108, 0.4)'
            }}>
              ⚠️
            </div>

            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#000'
            }}>
              Lien invalide ou expiré
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#6c757d',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              {errorMessage || "Ce lien de réinitialisation n'est plus valide. Il a peut-être expiré ou a déjà été utilisé."}
            </p>

            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: '#f5576c',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e74c3c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f5576c'}
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </>
    );
  }

  // Succès de la réinitialisation
  if (resetSuccess) {
    return (
      <>
        <style>{styles}</style>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '20px'
        }}>
          <div className="fade-in" style={{
            backgroundColor: 'white',
            borderRadius: '30px',
            padding: '50px 40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <div className="pulse" style={{
              width: '100px',
              height: '100px',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '50px',
              margin: '0 auto 25px',
              boxShadow: '0 10px 30px rgba(40, 167, 69, 0.4)'
            }}>
              ✅
            </div>

            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#000'
            }}>
              Mot de passe réinitialisé !
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#6c757d',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Votre mot de passe a été réinitialisé avec succès. 
              Vous allez être redirigé vers la page de connexion dans quelques secondes...
            </p>

            <div style={{
              backgroundColor: '#d4edda',
              border: '2px solid #28a745',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '25px'
            }}>
              <p style={{
                color: '#155724',
                fontSize: '14px',
                margin: 0,
                fontWeight: '600'
              }}>
                🔒 Conseil de sécurité : Ne partagez jamais votre mot de passe avec quiconque
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '18px',
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
              Se connecter maintenant
            </button>
          </div>
        </div>
      </>
    );
  }

  const passwordStrength = getPasswordStrength(newPassword);

  // Formulaire de réinitialisation
  return (
    <>
      <style>{styles}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
            color: '#f5576c'
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

        {/* Reset Card */}
        <div className="fade-in reset-card" style={{
          backgroundColor: 'white',
          borderRadius: '30px',
          padding: '50px 40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#f5576c',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            margin: '0 auto 25px',
            boxShadow: '0 5px 15px rgba(245, 87, 108, 0.4)'
          }}>
            🔐
          </div>

          <h2 className="reset-title" style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#000'
          }}>
            Nouveau mot de passe
          </h2>

          <p className="reset-subtitle" style={{
            fontSize: '16px',
            color: '#6c757d',
            marginBottom: '30px',
            lineHeight: '1.5'
          }}>
            Choisissez un mot de passe fort pour sécuriser votre compte
          </p>

          {/* Message d'erreur */}
          {errorMessage && (
            <div style={{
              backgroundColor: '#f8d7da',
              border: '2px solid #f5576c',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <p style={{
                color: '#721c24',
                fontSize: '14px',
                margin: 0,
                fontWeight: '600'
              }}>
                ⚠️ {errorMessage}
              </p>
            </div>
          )}

          {/* New Password Input */}
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
              Nouveau mot de passe
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
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                onFocus={(e) => e.target.style.borderColor = '#f5576c'}
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

            {/* Password Strength Indicator */}
            {newPassword && (
              <div style={{ marginTop: '10px' }}>
                <div style={{
                  display: 'flex',
                  gap: '5px',
                  marginBottom: '5px'
                }}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        height: '4px',
                        backgroundColor: level <= passwordStrength ? getStrengthColor(passwordStrength) : '#e0e0e0',
                        borderRadius: '2px',
                        transition: 'background-color 0.3s'
                      }}
                    />
                  ))}
                </div>
                <p style={{
                  fontSize: '12px',
                  color: getStrengthColor(passwordStrength),
                  fontWeight: '600',
                  margin: 0
                }}>
                  Force : {getStrengthText(passwordStrength)}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
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
              Confirmer le mot de passe
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
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
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
                onFocus={(e) => e.target.style.borderColor = '#f5576c'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Match Indicator */}
            {confirmPassword && (
              <p style={{
                fontSize: '12px',
                color: newPassword === confirmPassword ? '#28a745' : '#f5576c',
                fontWeight: '600',
                marginTop: '8px'
              }}>
                {newPassword === confirmPassword ? '✅ Les mots de passe correspondent' : '❌ Les mots de passe ne correspondent pas'}
              </p>
            )}
          </div>

          {/* Security Tips */}
          <div style={{
            backgroundColor: '#e8f4f8',
            border: '2px solid #17a2b8',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '25px',
            textAlign: 'left'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#0c5460',
              margin: '0 0 8px 0',
              fontWeight: '600'
            }}>
              💡 Conseils pour un mot de passe fort :
            </p>
            <ul style={{
              fontSize: '12px',
              color: '#0c5460',
              margin: 0,
              paddingLeft: '20px',
              lineHeight: '1.6'
            }}>
              <li>Au moins 8 caractères</li>
              <li>Majuscules et minuscules</li>
              <li>Au moins un chiffre</li>
              <li>Caractères spéciaux recommandés</li>
            </ul>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetPassword}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: isLoading ? '#ccc' : '#f5576c',
              border: 'none',
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#e74c3c')}
            onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#f5576c')}
          >
            {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>

          {/* Back to Login */}
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
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
            ← Retour à la connexion
          </button>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          color: 'white',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>
            © 2025 Quiz Time. Tous droits réservés.
          </p>
        </div>
      </div>
    </>
  );
}