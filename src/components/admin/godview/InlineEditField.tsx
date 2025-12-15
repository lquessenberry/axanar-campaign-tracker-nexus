import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Pencil, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface InlineEditFieldProps {
  value: string | number | null | undefined;
  onSave: (value: string | number | null) => Promise<void> | void;
  type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea';
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  displayClassName?: string;
  emptyText?: string;
  prefix?: string;
  suffix?: string;
  error?: string;
  ariaLabel?: string;
  formatDisplay?: (value: string | number | null | undefined) => string;
}

const InlineEditField = ({
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder = 'Enter value...',
  disabled = false,
  className,
  displayClassName,
  emptyText = '—',
  prefix,
  suffix,
  error: externalError,
  ariaLabel,
  formatDisplay,
}: InlineEditFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(String(value ?? ''));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Reset edit value when value prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(String(value ?? ''));
    }
  }, [value, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  // Clear external error when editing
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const startEditing = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(String(value ?? ''));
    setError(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue(String(value ?? ''));
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      let saveValue: string | number | null = editValue;
      
      if (type === 'number') {
        saveValue = editValue === '' ? null : parseFloat(editValue);
        if (saveValue !== null && isNaN(saveValue as number)) {
          setError('Please enter a valid number');
          setIsSaving(false);
          return;
        }
      }

      await onSave(saveValue);
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const displayValue = () => {
    if (formatDisplay) {
      return formatDisplay(value);
    }
    
    if (value === null || value === undefined || value === '') {
      return emptyText;
    }

    if (type === 'select') {
      const option = options.find(o => o.value === String(value));
      return option?.label ?? String(value);
    }

    if (type === 'number' && typeof value === 'number') {
      return value.toLocaleString();
    }

    if (type === 'date' && value) {
      return new Date(String(value)).toLocaleDateString();
    }

    return String(value);
  };

  // Display mode
  if (!isEditing) {
    return (
      <div
        className={cn(
          'group relative flex items-center gap-1 cursor-pointer rounded px-1 -mx-1',
          'hover:bg-muted/50 transition-colors',
          disabled && 'cursor-not-allowed opacity-60',
          displayClassName
        )}
        onClick={startEditing}
        onKeyDown={(e) => e.key === 'Enter' && startEditing()}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={ariaLabel ?? `Edit ${placeholder}`}
      >
        <span className={cn('flex items-center gap-1', className)}>
          {prefix && <span className="text-muted-foreground">{prefix}</span>}
          <span className={value === null || value === undefined || value === '' ? 'text-muted-foreground italic' : ''}>
            {displayValue()}
          </span>
          {suffix && <span className="text-muted-foreground">{suffix}</span>}
        </span>
        <Pencil
          className={cn(
            'h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity',
            disabled && 'hidden'
          )}
        />
      </div>
    );
  }

  // Edit mode
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {type === 'select' ? (
        <Select
          value={editValue}
          onValueChange={setEditValue}
          disabled={isSaving}
        >
          <SelectTrigger className="h-8 min-w-[120px]">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'textarea' ? (
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSaving}
          className={cn('min-h-[60px] text-sm', error && 'border-destructive')}
          aria-label={ariaLabel}
          aria-invalid={!!error}
        />
      ) : (
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type === 'number' ? 'number' : type === 'date' ? 'date' : type === 'email' ? 'email' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSaving}
          className={cn('h-8 min-w-[100px]', error && 'border-destructive')}
          aria-label={ariaLabel}
          aria-invalid={!!error}
        />
      )}

      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10"
        onClick={handleSave}
        disabled={isSaving}
        aria-label="Save"
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>

      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={cancelEditing}
        disabled={isSaving}
        aria-label="Cancel"
      >
        <X className="h-4 w-4" />
      </Button>

      {error && (
        <span className="text-xs text-destructive ml-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default InlineEditField;
