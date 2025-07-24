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
}

const ImprovedFAQ: React.FC<ImprovedFAQProps> = ({ sections }) => {
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

  return (
    <div className="max-w-4xl mx-auto">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-16">
          <h2 className="text-center mb-10">{section.title}</h2>
          
          <div className="space-y-6">
            {section.items.map((item, index) => (
              <EnhancedCard
                key={item.id}
                variant={index % 3 === 0 ? "primary" : index % 3 === 1 ? "accent" : "success"}
                className="overflow-hidden group cursor-pointer"
                onClick={() => toggleItem(item.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0">
                          <HelpCircle className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground leading-snug">
                          {item.question}
                        </h3>
                      </div>
                      
                      {/* Expandable Answer */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen(item.id) 
                            ? 'max-h-96 opacity-100' 
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="pt-4 border-t border-border/50 ml-11">
                          <p className="text-muted-foreground leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        {isOpen(item.id) ? (
                          <ChevronUp 
                            className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" 
                          />
                        ) : (
                          <ChevronDown 
                            className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" 
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