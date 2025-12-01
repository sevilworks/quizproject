import { useState } from "react";
import { authService } from '../services/authService';
import { useNotification } from '../components/Notification.jsx';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "student"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
const [loading, setLoading] = useState(false);
  const { showSuccess, showError, NotificationComponent } = useNotification();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSignup = async () => {
    // Validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim() ||
        !formData.firstName.trim() || !formData.lastName.trim()) {
      showError("Veuillez remplir tous les champs obligatoires !", "Champs requis");
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      showError("Les mots de passe ne correspondent pas !", "Mots de passe différents");
      return;
    }
  
    if (formData.password.length < 8) {
      showError("Le mot de passe doit contenir au moins 8 caractères !", "Mot de passe trop court");
      return;
    }

    setLoading(true);
  
    try {
      const response = await authService.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      });
      
      // Check if email verification is required based on new backend response
      if (response.emailVerificationRequired || response.message?.includes('vérification') || response.message?.includes('vérifiez')) {
        setSignupSuccess(true);
      } else {
        // Fallback: if no verification required, show success and redirect to login
        showSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.", "Compte créé");
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      showError(error.response?.data?.error || error.response?.data?.message || "Erreur lors de l'inscription", "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await authService.resendVerificationEmail(formData.email);
      showSuccess("Email de vérification renvoyé avec succès !", "Email envoyé");
    } catch (error) {
      showError(error.response?.data?.error || "Erreur lors de l'envoi de l'email de vérification", "Erreur");
    }
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  // Styles CSS
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
    
    .verification-success {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }
    .verification-card {
      background: white;
      border-radius: 30px;
      padding: 50px 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 500px;
      text-align: center;
    }
    .success-icon {
      width: 100px;
      height: 100px;
      background: #28a745;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 50px;
      margin: 0 auto 25px;
      box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
    }
    .resend-button {
      background-color: #17a2b8;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      margin: 10px;
      transition: background-color 0.3s;
    }
    .resend-button:hover {
      background-color: #138496;
    }
    .login-button {
      background-color: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      margin: 10px;
      transition: background-color 0.3s;
    }
    .login-button:hover {
      background-color: #5a6fd8;
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
      .signup-card, .verification-card {
        padding: 40px 30px !important;
        margin: 20px !important;
      }
      .signup-title {
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
      .lang-button {
        top: 10px !important;
        right: 10px !important;
        padding: 8px 18px !important;
        font-size: 14px !important;
      }
      .signup-card, .verification-card {
        padding: 30px 20px !important;
        margin: 10px !important;
        border-radius: 20px !important;
      }
      .signup-title {
        font-size: 24px !important;
      }
      .role-buttons {
        flex-direction: column !important;
      }
    }
  `;

  // Si l'inscription est réussie, afficher le message de vérification
  if (signupSuccess) {
    return (
      <>
        <style>{styles}</style>
        <div className="verification-success" style={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          padding: '20px',
          paddingTop: '100px',
          paddingBottom: '80px',
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
              color: '#28a745'
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

          {/* Carte de vérification */}
          <div className="fade-in verification-card">
            <div className="success-icon">
              ✉️
            </div>

            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#000'
            }}>
              Vérification requise
            </h2>

            <p style={{
              fontSize: '18px',
              color: '#6c757d',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              Un email de vérification a été envoyé à <strong>{formData.email}</strong>
            </p>

            <p style={{
              fontSize: '16px',
              color: '#6c757d',
              marginBottom: '30px',
              lineHeight: '1.5'
            }}>
              Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification pour activer votre compte.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              alignItems: 'center'
            }}>
              <button
                onClick={handleResendVerification}
                className="resend-button"
              >
                Renvoyer l'email de vérification
              </button>

              <button
                onClick={handleLoginRedirect}
                className="login-button"
              >
                Aller à la page de connexion
              </button>
            </div>

            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              marginTop: '25px',
              fontStyle: 'italic'
            }}>
              💡 Conseil : Vérifiez également vos courriers indésirables (spam)
            </p>
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

  // Formulaire d'inscription normal
  return (
    <>
      <NotificationComponent />
      <style>{styles}</style>
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        padding: '20px',
        paddingTop: '100px',
        paddingBottom: '80px',
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

        {/* Signup Card */}
        <div className="fade-in signup-card" style={{
          backgroundColor: 'white',
          borderRadius: '30px',
          padding: '50px 40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <div style={{
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
            ✏️
          </div>

          <h2 className="signup-title" style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#000'
          }}>
            Créer un compte
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#6c757d',
            marginBottom: '30px'
          }}>
            Rejoignez Flash Mind aujourd'hui
          </p>

          {/* Role Selection */}
          <div style={{
            marginBottom: '25px',
            textAlign: 'left'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '10px'
            }}>
              Je suis un(e) :
            </label>
            <div className="role-buttons" style={{
              display: 'flex',
              gap: '15px'
            }}>
              <button
                onClick={() => setFormData({...formData, role: 'student'})}
                style={{
                  flex: 1,
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: formData.role === 'student' ? 'white' : '#333',
                  backgroundColor: formData.role === 'student' ? '#667eea' : 'white',
                  border: `2px solid ${formData.role === 'student' ? '#667eea' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '20px' }}>🎓</span>
                Étudiant
              </button>
              <button
                onClick={() => setFormData({...formData, role: 'professor'})}
                style={{
                  flex: 1,
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: formData.role === 'professor' ? 'white' : '#333',
                  backgroundColor: formData.role === 'professor' ? '#667eea' : 'white',
                  border: `2px solid ${formData.role === 'professor' ? '#667eea' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '20px' }}>👨‍🏫</span>
                Professeur
              </button>
            </div>
          </div>

          {/* Name Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                Prénom
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="Prénom"
                value={formData.firstName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
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

            <div style={{ textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Nom"
                value={formData.lastName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
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

          {/* Username */}
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
              Nom d'utilisateur
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px'
              }}>
                👤
              </span>
              <input
                type="text"
                name="username"
                placeholder="nom_utilisateur"
                value={formData.username}
                onChange={handleChange}
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

          {/* Email */}
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
                name="email"
                placeholder="votre.email@exemple.com"
                value={formData.email}
                onChange={handleChange}
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

          {/* Password */}
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
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
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
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
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

          {/* Confirm Password */}
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
            <div style={{ position: 'relative' }}>
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
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
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
          </div>

          {/* Signup Button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: loading ? '#6c757d' : '#17a2b8',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#138496')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#17a2b8')}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire →'}
          </button>

          {/* Login Link */}
          <p style={{
            fontSize: '14px',
            color: '#6c757d'
          }}>
            Vous avez déjà un compte ?{' '}
            <a 
              href="login" 
              style={{
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Se connecter
            </a>
          </p>
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