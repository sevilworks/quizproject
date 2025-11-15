import { useState } from "react";

export default function Error404() {
  const handleGoHome = () => {
    window.location.href = '/';
    console.log("Redirection vers l'accueil");
  };

  const handleGoBack = () => {
    window.history.back();
    console.log("Retour à la page précédente");
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
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .float-animation {
      animation: float 3s ease-in-out infinite;
    }
    .fade-in {
      animation: fadeIn 0.8s ease-out;
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
      .error-number {
        font-size: 120px !important;
      }
      .error-title {
        font-size: 32px !important;
      }
      .error-description {
        font-size: 16px !important;
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
      .error-number {
        font-size: 80px !important;
      }
      .error-title {
        font-size: 24px !important;
      }
      .error-description {
        font-size: 14px !important;
      }
      .error-buttons {
        flex-direction: column !important;
        gap: 15px !important;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
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
        padding: '20px',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-100px',
          left: '-100px',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          bottom: '-150px',
          right: '-150px',
          filter: 'blur(80px)'
        }}></div>

        {/* Logo */}
        <div className="logo-container" style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10
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
          right: '20px',
          zIndex: 10
        }}>
          <button style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            padding: '10px 24px',
            borderRadius: '50rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            🌐 FR
          </button>
        </div>

        {/* Error Content */}
        <div className="fade-in" style={{
          textAlign: 'center',
          maxWidth: '700px',
          zIndex: 5
        }}>
          {/* Animated Icon */}
          <div className="float-animation" style={{
            fontSize: '120px',
            marginBottom: '20px'
          }}>
            🔍
          </div>

          {/* 404 Number */}
          <h1 className="error-number" style={{
            fontSize: '150px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            textShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            lineHeight: '1'
          }}>
            404
          </h1>

          {/* Error Title */}
          <h2 className="error-title" style={{
            fontSize: '42px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px'
          }}>
            Page introuvable
          </h2>

          {/* Error Description */}
          <p className="error-description" style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Oups ! La page que vous recherchez semble avoir disparu dans les méandres du web. 
            Elle a peut-être été déplacée ou n'existe plus.
          </p>

          {/* Suggestions Box */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '40px',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '15px'
            }}>
              💡 Que faire maintenant ?
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '16px',
                marginBottom: '10px',
                paddingLeft: '25px',
                position: 'relative'
              }}>
                <span style={{ position: 'absolute', left: 0 }}>✓</span>
                Vérifiez l'URL pour vous assurer qu'elle est correcte
              </li>
              <li style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '16px',
                marginBottom: '10px',
                paddingLeft: '25px',
                position: 'relative'
              }}>
                <span style={{ position: 'absolute', left: 0 }}>✓</span>
                Retournez à la page précédente
              </li>
              <li style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '16px',
                paddingLeft: '25px',
                position: 'relative'
              }}>
                <span style={{ position: 'absolute', left: 0 }}>✓</span>
                Revenez à la page d'accueil pour explorer
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="error-buttons" style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleGoHome}
              style={{
                padding: '15px 40px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: '#17a2b8',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 8px 20px rgba(23, 162, 184, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 30px rgba(23, 162, 184, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(23, 162, 184, 0.4)';
              }}
            >
              <span style={{ fontSize: '20px' }}>🏠</span>
              Page d'accueil
            </button>

            <button
              onClick={handleGoBack}
              style={{
                padding: '15px 40px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#667eea',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 8px 20px rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 30px rgba(255, 255, 255, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(255, 255, 255, 0.3)';
              }}
            >
              <span style={{ fontSize: '20px' }}>←</span>
              Retour
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          color: 'white',
          textAlign: 'center',
          fontSize: '14px',
          width: '100%',
          padding: '0 20px',
          zIndex: 10,
          opacity: 0.8
        }}>
          <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>
            © 2025 Flash Mind Quiz Time. Tous droits réservés.
          </p>
        </div>
      </div>
    </>
  );
}