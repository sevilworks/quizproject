import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, AlertTriangle, Info } from 'lucide-react';

const Notification = ({ 
  type = 'success', // 'success', 'error', 'warning', 'info'
  title, 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 // Changed default to 3 seconds
}) => {
  const [show, setShow] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setIsClosing(false);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShow(false);
      onClose?.();
    }, 300);
  };

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'from-green-50 to-green-100 border-green-200';
      case 'error':
        return 'from-red-50 to-red-100 border-red-200';
      case 'warning':
        return 'from-yellow-50 to-yellow-100 border-yellow-200';
      case 'info':
        return 'from-blue-50 to-blue-100 border-blue-200';
      default:
        return 'from-green-50 to-green-100 border-green-200';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      case 'info':
        return 'text-blue-900';
      default:
        return 'text-green-900';
    }
  };

  const getMessageColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-green-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div 
        className={`
          max-w-sm w-full bg-gradient-to-r ${getBgColor()} 
          border-2 rounded-2xl shadow-2xl pointer-events-auto
          transform transition-all duration-300 ease-in-out
          ${isClosing ? 'translate-x-[20px] opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
          ${show ? 'animate-slide-in-right' : ''}
        `}
      >
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 flex-1">
              {title && (
                <h3 className={`text-sm font-bold ${getTitleColor()} mb-1`}>
                  {title}
                </h3>
              )}
              <p className={`text-xs ${getMessageColor()}`}>
                {message}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom hook for managing notifications
export const useNotification = () => {
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
    duration: 3000,
  });

  const showNotification = (type, message, title = '', duration = 3000) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message,
      duration,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const NotificationComponent = () => (
    <Notification
      type={notification.type}
      title={notification.title}
      message={notification.message}
      isVisible={notification.isVisible}
      onClose={hideNotification}
      duration={notification.duration}
    />
  );

  return {
    showSuccess: (message, title, duration = 3000) => showNotification('success', message, title, duration),
    showError: (message, title, duration = 3000) => showNotification('error', message, title, duration),
    showWarning: (message, title, duration = 3000) => showNotification('warning', message, title, duration),
    showInfo: (message, title, duration = 3000) => showNotification('info', message, title, duration),
    NotificationComponent,
  };
};

export default Notification;