import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import azzouni from './XXXNX.png';

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const lottieRef = useRef(null);
  const navigate = useNavigate(); // Hook pour la navigation

  useEffect(() => {
    const loadLottie = async () => {
      try {
        // Charger le script DotLottie
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs';
        script.type = 'module';
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
        
        // Créer l'élément dotlottie-player
        if (lottieRef.current && !lottieRef.current.querySelector('dotlottie-player')) {
          const player = document.createElement('dotlottie-player');
          player.setAttribute('src', 'https://lottie.host/1483e8b2-61af-408c-b2f0-c20ce45eaa07/8eRdSyO9Q1.lottie');
          player.setAttribute('background', 'transparent');
          player.setAttribute('speed', '1');
          player.setAttribute('style', 'width: 100%; height: 100%');
          player.setAttribute('loop', '');
          player.setAttribute('autoplay', '');
          lottieRef.current.appendChild(player);
        }
      } catch (error) {
        console.log('Erreur chargement Lottie:', error);
      }
    };

    loadLottie();
  }, []);

  const handleLogin = () => {
    navigate('/login'); // Redirection vers la page login
  };

  const handleSignup = () => {
    navigate('/signup'); // Redirection vers la page signup
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
      animation: fadeIn 0.8s ease-out;
    }
    .developer-img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid white;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      margin: 0 auto 15px;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflow: 'auto'
      }}>
        {/* Header */}
        <header style={{
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

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={handleLogin}
              style={{
                padding: '10px 25px',
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
              Se connecter
            </button>
            <button
              onClick={handleSignup}
              style={{
                padding: '10px 25px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: '#17a2b8',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              S'inscrire
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{
          padding: '60px 40px 40px',
          textAlign: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className="fade-in">
            <h2 style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '15px',
              lineHeight: '1.2'
            }}>
              Testez vos connaissances avec 
              <br />
              <span style={{ color: '#ffd700' }}>FLASH_MIND</span>
            </h2>
            <p style={{
              fontSize: '22px',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.6',
              maxWidth: '800px',
              margin: '0 auto 20px'
            }}>
              La plateforme ultime pour améliorer vos compétences à travers des quiz interactifs et stimulants
            </p>
            
            {/* Lottie Animation */}
            <div style={{
              width: '300px',
              height: '300px',
              margin: '10px auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div ref={lottieRef} style={{ 
                width: '100%', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}></div>
            </div>

            <button
              onClick={handleSignup} // Le bouton "Commencer maintenant" redirige aussi vers signup
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
                transition: 'all 0.3s'
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
              Commencer maintenant →
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section style={{
          padding: '60px 40px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h3 style={{
              fontSize: '42px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginBottom: '50px'
            }}>
              Pourquoi choisir Flash Mind ?
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px'
            }}>
              {/* Feature 1 */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '35px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>🎯</div>
                <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                  Quiz Personnalisés
                </h4>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                  Créez et participez à des quiz adaptés à votre niveau et vos centres d'intérêt
                </p>
              </div>

              {/* Feature 2 */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '35px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>⏱️</div>
                <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                  Défis Chronométrés
                </h4>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                  Testez votre rapidité avec des questions chronométrées pour améliorer vos réflexes
                </p>
              </div>

              {/* Feature 3 */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '35px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>🏆</div>
                <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                  Classements & Scores
                </h4>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                  Comparez vos performances et suivez votre progression avec des statistiques détaillées
                </p>
              </div>

              {/* Feature 4 */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '35px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>📚</div>
                <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                  Thèmes Variés
                </h4>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                  Des quiz sur React, JavaScript, et bien d'autres technologies modernes
                </p>
              </div>

              {/* Feature 5 */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '35px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>🎨</div>
                <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                  Interface Intuitive
                </h4>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                  Une expérience utilisateur fluide et agréable avec un design moderne
                </p>
              </div>

              {/* Feature 6 */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '35px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>💡</div>
                <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                  Apprentissage Ludique
                </h4>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                  Apprenez en vous amusant avec des questions interactives et engageantes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section style={{
          padding: '60px 40px',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '30px'
          }}>
            À propos de Flash Mind
          </h3>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.8',
            maxWidth: '800px',
            margin: '0 auto 50px'
          }}>
            Flash Mind est une plateforme éducative innovante conçue pour rendre l'apprentissage interactif et amusant. 
            Notre mission est de fournir aux étudiants et aux professionnels un outil efficace pour tester et améliorer 
            leurs connaissances dans divers domaines technologiques. Avec des quiz chronométrés, des classements en temps 
            réel et une interface intuitive, nous transformons l'apprentissage en une expérience captivante.
          </p>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '40px',
            marginTop: '40px'
          }}>
            <h4 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '30px'
            }}>
              Développé par
            </h4>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '30px'
            }}>
              <div style={{
                textAlign: 'center'
              }}>
                <img 
                  src={azzouni}
                  alt="Développeur 1" 
                  className="developer-img"
                />
                <h5 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>
                Amen Allah EL AZZOUNI
                </h5>
                <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Chef de projet - Full Stack Developer
                </p>
              </div>

              <div style={{
                textAlign: 'center'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80" 
                  alt="Développeur 2" 
                  className="developer-img"
                />
                <h5 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>
                  Nom Développeur 2
                </h5>
                <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Frontend Developer
                </p>
              </div>

              <div style={{
                textAlign: 'center'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80" 
                  alt="Développeur 3" 
                  className="developer-img"
                />
                <h5 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>
                  Nom Développeur 3
                </h5>
                <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Backend Developer
                </p>
              </div>
              
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '40px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          color: 'white'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold' }}>
            © 2025 Flash Mind Quiz Time. Tous droits réservés.
          </p>
          <div>
            <a href="#" style={{
              color: 'white',
              textDecoration: 'underline',
              marginRight: '20px',
              fontSize: '14px'
            }}>
              Politique de confidentialité
            </a>
            <a href="#" style={{
              color: 'white',
              textDecoration: 'underline',
              fontSize: '14px'
            }}>
              Conditions d'utilisation
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}