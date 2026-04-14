import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronDown, Star, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface QuickActionPanelProps {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: 'blue' | 'red' | 'green' | 'yellow' | 'orange';
  actions: Array void;
    color?: 'blue' | 'green' | 'red' | 'orange';
  }>;
  details?: Array;
}

export function QuickActionPanel({
  title,
  icon,
  badge,
  badgeColor = 'blue',
  actions,
  details,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const badgeColors = {
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  const actionColors = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    red: 'bg-red-50 text-red-700 hover:bg-red-100',
    orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
  };

  return (
    
      
         setIsExpanded(!isExpanded)}
          className="flex items-center justify-between cursor-pointer p-4 -m-4"
        >
          
            {icon}
            
              {title}
              {badge && (
                {badge}
              )}
            
          
          
        
      

      {isExpanded && (
        
          {details && (
            
              {details.map((detail, idx) => (
                
                  {detail.label}
                  {detail.value}
                
              ))}
            
          )}

          
            {actions.map((action, idx) => (
              
                {action.icon && {action.icon}}
                {action.label}
                
              
            ))}
          
        
      )}
    
  );
}

interface QuickActionGridProps {
  panels: QuickActionPanelProps[];
  columns?: 1 | 2 | 3;
}

export function QuickActionGrid({ panels, columns = 2 }) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
  };

  return (
    
      {panels.map((panel, idx) => (
        
      ))}
    
  );
}

interface FavoriteActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function FavoriteAction({
  icon,
  label,
  onClick,
  isFavorite = false,
  onToggleFavorite,
}) {
  return (
    
      
        {icon}
        {label}
      
      {onToggleFavorite && (
         {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          
        
      )}
    
  );
}

interface ActionChipsProps {
  actions: Array void;
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'red' | 'orange';
  }>;
}

export function ActionChips({ actions }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    red: 'bg-red-100 text-red-700 hover:bg-red-200',
    orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  };

  return (
    
      {actions.map((action, idx) => (
        
          {action.icon && {action.icon}}
          {action.label}
        
      ))}
    
  );
}




