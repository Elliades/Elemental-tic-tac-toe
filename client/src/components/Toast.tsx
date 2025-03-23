import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}) => {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  
  useEffect(() => {
    // Start fading out after 2/3 of the duration
    const fadeStartTime = duration * 2/3;
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
    }, fadeStartTime);
    
    // Close the toast after the full duration
    const closeTimer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);
  
  if (!visible) return null;
  
  // Determine styles based on toast type
  const getBackgroundColor = () => {
    switch(type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': 
      default: return '#2196f3';
    }
  };
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: getBackgroundColor(),
        color: 'white',
        padding: '12px 24px',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        maxWidth: '80%',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: opacity,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      <span>{message}</span>
      <button 
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          marginLeft: '15px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast; 