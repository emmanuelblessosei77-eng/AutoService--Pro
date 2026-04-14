import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';

interface ServiceStatus {
  id: string;
  serviceName: string;
  vehicle: string;
  status: 'scheduled' | 'in-progress' | 'waiting-approval' | 'completed';
  progress: number;
  estimatedTime: number;
  elapsedTime: number;
  mechanic: string;
  nextStep?: string;
}

interface LiveServiceTrackerProps {
  services: ServiceStatus[];
}

export function LiveServiceTracker({ services }) {
  const [liveServices, setLiveServices] = useState(services);
  const [updatedTimes, setUpdatedTimes] = useState>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveServices(prev =>
        prev.map(service => {
          if (service.status === 'in-progress' && service.progress  ({
        ...prev,
        timestamp: Date.now(),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'completed':
        return ;
      case 'in-progress':
        return ;
      case 'waiting-approval':
        return ;
      default:
        return ;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'waiting-approval':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    
      {liveServices.map(service => (
        
          
            
              {/* Status Icon */}
              
                {getStatusIcon(service.status)}
              

              {/* Service Info */}
              
                {service.serviceName}
                {service.vehicle}
                Mechanic: {service.mechanic}
              

              {/* Status Badge */}
              
                
                  {service.status.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
                
              

              {/* Progress Bar */}
              
                
                  
                
                {Math.round(service.progress)}% Complete
              

              {/* Time Info */}
              
                Elapsed Time
                {formatTime(service.elapsedTime)}
                of {formatTime(service.estimatedTime)}
              
            

            {/* Next Step */}
            {service.nextStep && service.status === 'in-progress' && (
              
                
                  Next Step: {service.nextStep}
                
              
            )}

            {/* Completion Info */}
            {service.status === 'completed' && (
              
                
                  
                  Service completed successfully
                
              
            )}
          
        
      ))}
    
  );
}

export function ServiceStatusOverview() {
  const [stats, setStats] = useState({
    activeServices,
    completedToday,
    averageTime: 1.5,
  });

  return (
    
      
        
          Active Services
        
        
          {stats.activeServices}
          Currently in progress
        
      

      
        
          Completed Today
        
        
          {stats.completedToday}
          Services finished
        
      

      
        
          Avg. Service Time
        
        
          {stats.averageTime}h
          Average duration
        
      
    
  );
}




