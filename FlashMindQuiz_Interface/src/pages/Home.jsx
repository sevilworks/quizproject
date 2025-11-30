import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from '../components/Notification';

export default function Home() {
const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [emoji, setEmoji] = useState("😀");
  const [showQuiz, setShowQuiz] = useState(false);

  // Notification hook
  const { showSuccess, showError, showWarning, NotificationComponent } = useNotification();

  const commencer = () => {
    if (!nom.trim()) {
      showError("Merci d'entrer votre nom !", "Nom requis");
      return;
    }
    
    // Pour utiliser avec React Router, décommentez les lignes suivantes:
    // 
    navigate(`/quiz?nom=${encodeURIComponent(nom)}&emoji=${encodeURIComponent(emoji)}`);
    
    // Pour l'instant, on simule le passage au quiz
    setShowQuiz(true);
    console.log(`Navigation vers Quiz avec: Nom=${nom}, Emoji=${emoji}`);
  };

  const emojis = ["😀", "😎", "🤓", "🥳", "😇", "🦸‍♂️", "🧙‍♀️", "👑"];

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
  `;

  if (showQuiz) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Bienvenue {nom} {emoji}</h1>
          <p style={{ marginTop: '20px', fontSize: '18px' }}>
            Le quiz va commencer...
          </p>
          <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.8 }}>
            (Intégrez votre composant Quiz ici ou configurez React Router pour la navigation)
          </p>
          <button 
            onClick={() => setShowQuiz(false)}
            style={{
              marginTop: '30px',
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NotificationComponent />
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

        {/* Carte centrale */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '30px',
          padding: '50px 40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '30px',
            color: '#000'
          }}>
            Choose an emoji
          </h2>

          <select
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            style={{
              width: '100%',
              padding: '15px 20px',
              fontSize: '18px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              backgroundColor: '#f5f5f5',
              marginBottom: '40px',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23343a40\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M2 5l6 6 6-6\'/%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '16px 12px',
              paddingRight: '40px',
              color: '#333',
              textAlign: 'left'
            }}
          >
            {emojis.map((e, i) => (
              <option key={i} value={e} style={{ color: '#333' }}>
                {e} Select an emoji
              </option>
            ))}
          </select>

          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#000'
          }}>
            Enter your name :
          </h3>

          <input
            type="text"
            placeholder="Enter your name"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                commencer();
              }
            }}
            style={{
              width: '100%',
              padding: '15px 20px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: '#e9ecef',
              marginBottom: '30px',
              textAlign: 'center',
              color: '#333'
            }}
          />

          <button
            onClick={commencer}
            style={{
              width: '60%',
              padding: '15px',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: '#17a2b8',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#138496'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#17a2b8'}
          >
            validate ➜
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