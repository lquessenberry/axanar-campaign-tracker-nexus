import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { 
  EnhancedCard, 
  EnhancedCardContent 
} from "@/components/ui/enhanced-card";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

interface ImprovedFAQProps {
  sections: FAQSection[];
  sectionVariant?: 'primary' | 'accent' | 'secondary' | 'muted';
}

const ImprovedFAQ: React.FC<ImprovedFAQProps> = ({ sections, sectionVariant = 'primary' }) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const isOpen = (id: string) => openItems.has(id);

  // Determine card variants based on section variant
  const getCardVariant = (index: number) => {
    const variants = {
      primary: ['primary', 'accent', 'default'],
      accent: ['accent', 'primary', 'success'],
      secondary: ['success', 'warning', 'primary'],
      muted: ['default', 'success', 'accent']
    };
    return variants[sectionVariant][index % 3] as 'primary' | 'accent' | 'default' | 'success' | 'warning' | 'destructive';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              {section.title}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-6">
            {section.items.map((item, index) => (
              <EnhancedCard
                key={item.id}
                variant={getCardVariant(index)}
                className="overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl backdrop-blur-sm border border-border/50"
                onClick={() => toggleItem(item.id)}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mt-1 flex-shrink-0 shadow-lg">
                          <HelpCircle className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground leading-snug">
                          {item.question}
                        </h3>
                      </div>
                      
                      {/* Expandable Answer */}
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          isOpen(item.id) 
                            ? 'max-h-96 opacity-100' 
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="pt-6 border-t border-border/30 ml-14">
                          <div 
                            className="text-muted-foreground leading-relaxed text-base"
                            dangerouslySetInnerHTML={{ __html: item.answer }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300 shadow-md">
                        {isOpen(item.id) ? (
                          <ChevronUp 
                            className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" 
                          />
                        ) : (
                          <ChevronDown 
                            className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImprovedFAQ;