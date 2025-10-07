import React, { useEffect, useState } from 'react';
import './MobileOptimized.css';

interface MobileOptimizedProps {
  children: React.ReactNode;
}

// Hook để detect mobile device
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

// Hook để detect touch device
export const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
};

// Component wrapper cho mobile optimization
export const MobileOptimized: React.FC<MobileOptimizedProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();

  useEffect(() => {
    // Prevent zoom on double tap for iOS
    if (isMobile) {
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (event) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, false);

      // Prevent pull-to-refresh on mobile
      document.body.style.overscrollBehavior = 'contain';
    }

    return () => {
      if (isMobile) {
        document.body.style.overscrollBehavior = 'auto';
      }
    };
  }, [isMobile]);

  return (
    <div 
      className={`mobile-optimized ${isMobile ? 'is-mobile' : ''} ${isTouch ? 'is-touch' : ''}`}
      data-mobile={isMobile}
      data-touch={isTouch}
    >
      {children}
    </div>
  );
};

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#FF4D85',
  text 
}) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div 
        className="spinner" 
        style={{ borderTopColor: color, borderLeftColor: color }}
      ></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

// Touch-friendly Button Component
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      // Add haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      onClick();
    }
  };

  return (
    <button
      className={`touch-button ${variant} ${size} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading ? (
        <LoadingSpinner size="small" color={variant === 'primary' ? '#fff' : '#FF4D85'} />
      ) : (
        children
      )}
    </button>
  );
};

// Mobile-friendly Modal Component
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true
}) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div 
        className={`mobile-modal-content ${isMobile ? 'mobile' : 'desktop'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="mobile-modal-header">
            {title && <h3 className="mobile-modal-title">{title}</h3>}
            {showCloseButton && (
              <button 
                className="mobile-modal-close"
                onClick={onClose}
                aria-label="Đóng"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="mobile-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Swipeable Card Component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const diffX = currentX - startX;
    const threshold = 100;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (diffX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  const transform = isDragging ? `translateX(${(currentX - startX) * 0.1}px)` : 'translateX(0)';

  return (
    <div
      className={`swipeable-card ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform, transition: isDragging ? 'none' : 'transform 0.3s ease' }}
    >
      {children}
    </div>
  );
};

export default MobileOptimized;
