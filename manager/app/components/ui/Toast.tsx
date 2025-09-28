import { useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaExclamationCircle, 
  FaTimes,
  FaInfoCircle 
} from 'react-icons/fa';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  onClose: () => void;
}

export function Toast({ message, type, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const typeStyles = {
    success: {
      container: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200',
      icon: 'text-white',
      progress: 'bg-white'
    },
    error: {
      container: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-200',
      icon: 'text-white',
      progress: 'bg-white'
    },
    info: {
      container: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-cyan-200',
      icon: 'text-white',
      progress: 'bg-white'
    }
  };

  const icons = {
    success: <FaCheckCircle className="w-5 h-5" />,
    error: <FaExclamationCircle className="w-5 h-5" />,
    info: <FaInfoCircle className="w-5 h-5" />
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${styles.container} rounded-xl flex items-start space-x-3 max-w-sm p-4 relative overflow-hidden`}>
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-black/10">
          <div 
            className={`h-full ${styles.progress} transition-all duration-4000 ease-linear`}
            style={{ 
              width: visible ? '0%' : '100%',
              animation: visible ? 'shrink 4s linear forwards' : 'none'
            }}
          />
        </div>

        <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
          {icons[type]}
        </div>
        <div className="flex-1">
          <span className="font-medium text-sm leading-relaxed">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-white/10"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}