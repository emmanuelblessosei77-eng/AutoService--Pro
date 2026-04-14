import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  custom?: (value) => boolean;
  message: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  validation?: ValidationRule[];
  multiline?: boolean;
  rows?: number;
  onChange?: (value) => void;
  onValidationChange?: (isValid) => void;
}

export function InteractiveFormField({
  label,
  name,
  type = 'text',
  placeholder,
  validation,
  multiline = false,
  rows = 4,
  onChange,
  onValidationChange,
}) {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const [validationState, setValidationState] = useState('idle');
  const [errors, setErrors] = useState([]);

  const validateField = (fieldValue) => {
    if (!validation || validation.length === 0) {
      setValidationState('valid');
      onValidationChange?.(true);
      return;
    }

    setValidationState('validating');

    setTimeout(() => {
      const fieldErrors: string[] = [];

      for (const rule of validation) {
        let isValid = true;

        if (rule.pattern && !rule.pattern.test(fieldValue)) {
          isValid = false;
        }

        if (rule.minLength && fieldValue.length  rule.maxLength) {
          isValid = false;
        }

        if (rule.custom && !rule.custom(fieldValue)) {
          isValid = false;
        }

        if (!isValid) {
          fieldErrors.push(rule.message);
        }
      }

      setErrors(fieldErrors);
      const isValid = fieldErrors.length === 0;
      setValidationState(isValid ? 'valid' : 'invalid');
      onValidationChange?.(isValid);
    }, 300);
  };

  useEffect(() => {
    if (touched) {
      validateField(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    validateField(value);
  };

  return (
    
      
        {label}
        {touched && (
          
            {validationState === 'validating' && (
              
            )}
            {validationState === 'valid' && (
              
                
                Valid
              
            )}
            {validationState === 'invalid' && (
              
                
                Invalid
              
            )}
          
        )}
      

      {multiline ? (
        
      ) : (
        
      )}

      {touched && errors.length > 0 && (
        
          {errors.map((error, idx) => (
            
              
              {error}
            
          ))}
        
      )}
    
  );
}

interface QuickActionFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value) => void;
  options: string[];
  theme?: 'blue' | 'green' | 'orange' | 'purple';
}

export function QuickActionField({
  icon,
  label,
  value,
  onChange,
  options,
  theme = 'blue',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const themeClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 text-green-900 hover:bg-green-100',
    orange: 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100',
    purple: 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100',
  };

  return (
    
       setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg transition-all ${themeClasses[theme]}`}
      >
        {icon}
        
          {label}
          {value || 'Not selected'}
        
      

      {isOpen && (
        
          {options.map((option, idx) => (
             {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-0 transition-colors"
            >
              {option}
            
          ))}
        
      )}
    
  );
}

export function FormFieldGroup({ children }: { children: React.ReactNode }) {
  return {children};
}




