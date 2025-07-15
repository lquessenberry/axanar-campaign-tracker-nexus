import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="space-y-8">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <h2 className="mb-6">
            {section.title}
          </h2>
          
          <div className="space-y-4">
            {section.items.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
                  aria-expanded={isOpen(item.id)}
                  aria-controls={`how-it-works-details-${item.id}`}
                >
                  <div className="flex-1 pr-4">
                    <h3 className="font-heading font-medium text-card-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {isOpen(item.id) ? (
                      <ChevronUp 
                        className="h-5 w-5 text-muted-foreground transition-transform duration-200" 
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronDown 
                        className="h-5 w-5 text-muted-foreground transition-transform duration-200" 
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </button>
                
                <div
                  id={`how-it-works-details-${item.id}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen(item.id) ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  aria-hidden={!isOpen(item.id)}
                >
                  <div className="px-6 pb-5 border-t border-border/50 pt-4">
                    <ul className="space-y-3">
                      {item.details.map((detail, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                          <span className="text-muted-foreground leading-relaxed">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImprovedHowItWorks;