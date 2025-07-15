import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
        <div key={sectionIndex} className="mb-12">
          <h2 className="mb-8">{section.title}</h2>
          
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
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <h3 className="font-heading font-medium text-card-foreground pr-4">
                    {item.question}
                  </h3>
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
                  id={`faq-answer-${item.id}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen(item.id) 
                      ? 'max-h-96 opacity-100' 
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-5">
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
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

export default ImprovedFAQ;