import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { 
  EnhancedCard, 
  EnhancedCardContent 
} from "@/components/ui/enhanced-card";

interface HowItWorksItem {
  id: string;
  title: string;
  description: string;
  details: string[];
}

interface HowItWorksSection {
  title: string;
  items: HowItWorksItem[];
}

interface ImprovedHowItWorksProps {
  sections: HowItWorksSection[];
}

const ImprovedHowItWorks: React.FC<ImprovedHowItWorksProps> = ({ sections }) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  const isOpen = (itemId: string) => openItems.has(itemId);

  return (
    <div className="space-y-12">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-6">
          <h2 className="text-center mb-8">
            {section.title}
          </h2>
          
          <div className="grid gap-6 md:gap-8">
            {section.items.map((item, index) => (
              <EnhancedCard
                key={item.id}
                variant={index % 2 === 0 ? "primary" : "accent"}
                className="overflow-hidden group cursor-pointer"
                onClick={() => toggleItem(item.id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <h3 className="font-semibold text-foreground">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {item.description}
                      </p>
                      
                      {/* Expandable content */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen(item.id) ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="pt-4 border-t border-border/50">
                          <ul className="space-y-3">
                            {item.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start gap-3">
                                <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                <span className="text-muted-foreground leading-relaxed">
                                  {detail}
                                </span>
                              </li>
                            ))}
                          </ul>
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

export default ImprovedHowItWorks;