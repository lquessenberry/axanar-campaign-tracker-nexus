import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  MapPin, 
  Link2, 
  Mail, 
  Gift, 
  DollarSign, 
  HelpCircle 
} from 'lucide-react';

export type SupportCategory = 
  | 'missing_contributions' 
  | 'address_issues' 
  | 'account_merge' 
  | 'email_change' 
  | 'perks_rewards' 
  | 'new_donation' 
  | 'general';

interface CategoryOption {
  value: SupportCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  helpText: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    value: 'missing_contributions',
    label: 'Missing Contributions',
    icon: TrendingUp,
    description: 'My donation history isn\'t showing',
    helpText: 'Please include: Your original email address, campaign name (Kickstarter/Indiegogo), and approximate pledge amount.'
  },
  {
    value: 'address_issues',
    label: 'Address Issues',
    icon: MapPin,
    description: 'I can\'t update my shipping address',
    helpText: 'Please include: Your current address and any error messages you received.'
  },
  {
    value: 'account_merge',
    label: 'Account Merge',
    icon: Link2,
    description: 'I have multiple accounts to combine',
    helpText: 'Please include: All email addresses associated with your accounts and your original pledge details.'
  },
  {
    value: 'email_change',
    label: 'Email Change',
    icon: Mail,
    description: 'I need to update my email address',
    helpText: 'Please include: Your old email address and the new email you want to use.'
  },
  {
    value: 'perks_rewards',
    label: 'Perks/Rewards',
    icon: Gift,
    description: 'I can\'t access my perks or rewards',
    helpText: 'Please include: The specific perk or reward you\'re having trouble with.'
  },
  {
    value: 'new_donation',
    label: 'New Donation',
    icon: DollarSign,
    description: 'I want to make a new contribution',
    helpText: 'Let us know how you\'d like to contribute and we\'ll guide you through the process.'
  },
  {
    value: 'general',
    label: 'General Question',
    icon: HelpCircle,
    description: 'Something else',
    helpText: 'Describe your question or issue in as much detail as possible.'
  }
];

interface SupportCategorySelectorProps {
  value: SupportCategory;
  onChange: (category: SupportCategory) => void;
}

const SupportCategorySelector: React.FC<SupportCategorySelectorProps> = ({ 
  value, 
  onChange 
}) => {
  const selectedCategory = CATEGORIES.find(c => c.value === value);

  return (
    <div className="space-y-4">
      <Label className="text-base">What can we help you with?</Label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isSelected = value === category.value;
          
          return (
            <Button
              key={category.value}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'h-auto py-4 px-4 flex flex-col items-start gap-2 text-left',
                isSelected && 'ring-2 ring-primary'
              )}
              onClick={() => onChange(category.value)}
            >
              <div className="flex items-center gap-3 w-full">
                <Icon className={cn(
                  'h-5 w-5 shrink-0',
                  isSelected ? 'text-primary-foreground' : 'text-primary'
                )} />
                <span className="font-medium text-base">{category.label}</span>
              </div>
              <span className={cn(
                'text-sm',
                isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}>
                {category.description}
              </span>
            </Button>
          );
        })}
      </div>

      {selectedCategory && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Helpful tip:</strong> {selectedCategory.helpText}
          </p>
        </div>
      )}
    </div>
  );
};

export default SupportCategorySelector;
export { CATEGORIES };
export type { CategoryOption };
