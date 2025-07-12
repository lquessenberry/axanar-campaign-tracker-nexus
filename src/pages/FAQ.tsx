import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import EmailTest from "@/components/EmailTest";

const FAQ = () => {
  const generalFaqs = [
    {
      question: "What is Axanar?",
      answer: "Axanar takes place 21 years before the events of 'Where no man has gone before', the first Star Trek episode, and tells the story of Garth of Izar and his crew during the Four Years War, the war with the Klingon Empire that almost tore the Federation apart. Garth was a legendary Starfleet captain, who was the hero of the Battle of Axanar."
    },
    {
      question: "What is the status of the Axanar films?",
      answer: "Axanar Productions continues work on the Axanar series. For the most up-to-date information on current productions and releases, please visit our official website or social media channels."
    },
    {
      question: "How is Axanar funded?",
      answer: "Axanar is primarily funded through fan donations and crowdfunding campaigns. Our contributors are passionate about bringing high-quality, Star Trek-inspired content to life. This platform helps manage our crowdfunding initiatives and provide rewards to our generous supporters."
    },
    {
      question: "Who created Axanar?",
      answer: "Axanar was created by Alec Peters and a team of dedicated professionals from the film industry and Star Trek fan community. Many of our team members have worked on official Star Trek productions and other major film and television projects."
    }
  ];

  const platformFaqs = [
    {
      question: "Why has the platform been migrated?",
      answer: "We've migrated from our previous Laravel/Artisan platform to this new system due to stability, security, and performance issues with the old system. The new platform provides better protection for your donor information and a more reliable experience."
    },
    {
      question: "Can I create a new account to support Axanar?",
      answer: "Currently, this platform is exclusively for existing donors who previously supported Axanar projects. We are not accepting new registrations at this time. The platform's purpose is to help existing donors recover their accounts and update their information."
    },
    {
      question: "How do I recover my donor account?",
      answer: "Click on the 'Login' button and select 'Recover Account'. Enter the email address you used for your original donation. You'll receive instructions to verify your identity and set up a new password for the migrated platform."
    },
    {
      question: "Is my donation history and reward information preserved?",
      answer: "Yes, we've migrated all donor information including your pledge history, reward entitlements, and shipping details from the previous system. Please verify this information after recovering your account to ensure everything is accurate."
    },
    {
      question: "What if my shipping address needs to be updated?",
      answer: "After recovering your account, you can update your profile information, including your shipping address. Having accurate shipping information is essential for us to deliver any physical rewards you're entitled to receive."
    },
    {
      question: "What if I can't remember what email I used for my donation?",
      answer: "If you can't remember which email you used or are having trouble recovering your account, please contact our admin team through the Support page. They can help verify your identity and assist with account recovery."
    }
  ];

  const technicalFaqs = [
    {
      question: "I'm having trouble recovering my account. What should I do?",
      answer: "If you're experiencing difficulties recovering your account, first make sure you're using the correct email address that you used for your original donation. If problems persist, please contact our admin team through the Support page for personalized assistance."
    },
    {
      question: "Is the new platform secure?",
      answer: "Yes, our new platform implements modern security practices to protect your data. We've significantly improved security compared to our previous Laravel/Artisan system, including better encryption, secure authentication methods, and regular security updates."
    },
    {
      question: "Can I use the platform on mobile devices?",
      answer: "Yes, our new platform is fully responsive and optimized for mobile devices. You can recover your account, update your information, and view your pledge history from your smartphone or tablet."
    },
    {
      question: "What data was migrated from the old system?",
      answer: "We migrated all essential donor information including your name, email, contact details, pledge history, reward entitlements, and shipping preferences. Some peripheral data like comment history might not have been transferred if it wasn't relevant to your donor status."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Header */}
        <section className="bg-axanar-dark text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-axanar-silver max-w-3xl mx-auto">
              Find answers about our platform migration and how existing donors can recover their accounts.
            </p>
          </div>
        </section>
        
        {/* FAQ Sections */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                About Axanar
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {generalFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`general-${index}`} className="border rounded-lg bg-white shadow-sm px-2">
                    <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Platform Migration & Account Recovery
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {platformFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`platform-${index}`} className="border rounded-lg bg-white shadow-sm px-2">
                    <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Technical Support & Data Migration
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {technicalFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`technical-${index}`} className="border rounded-lg bg-white shadow-sm px-2">
                    <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            {/* Email Test Section */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Email Test
              </h2>
              <EmailTest />
            </div>
            
            <div className="text-center">
              <p className="text-lg mb-4">
                Still have questions?
              </p>
              <Link to="/support" className="inline-block bg-axanar-teal hover:bg-axanar-teal/90 text-white font-medium py-3 px-6 rounded-full">
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
