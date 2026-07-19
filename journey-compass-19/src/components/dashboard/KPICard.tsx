import { ReactNode, useEffect, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  icon: ReactNode;
  label: string;
  value: number;
  suffix?: string;
  variant?: 'default' | 'plane' | 'train' | 'car' | 'bus';
  delay?: number;
}

export const KPICard = forwardRef<HTMLDivElement, KPICardProps>(
  ({ icon, label, value, suffix = '', variant = 'default', delay = 0 }, ref) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(true);
        
        // Animate value
        const duration = 1000;
        const steps = 30;
        const increment = value / steps;
        let current = 0;
        
        const interval = setInterval(() => {
          current += increment;
          if (current >= value) {
            setDisplayValue(value);
            clearInterval(interval);
          } else {
            setDisplayValue(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(interval);
      }, delay);

      return () => clearTimeout(timer);
    }, [value, delay]);

    return (
      <div 
        ref={ref}
        className={cn(
          'kpi-card transition-all duration-500',
          variant !== 'default' && `transport-${variant}`,
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
      >
        <div className="relative z-10">
          <div className="text-2xl mb-2">{icon}</div>
          <div className="stat-value">
            {displayValue.toLocaleString('fr-FR')}{suffix}
          </div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    );
  }
);

KPICard.displayName = 'KPICard';
