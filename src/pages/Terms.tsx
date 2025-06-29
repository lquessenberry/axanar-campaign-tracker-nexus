import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Header */}
        <section className="bg-axanar-dark text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-axanar-silver max-w-3xl mx-auto">
              Last Updated: June 29, 2025
            </p>
          </div>
        </section>
        
        {/* Terms Content */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="prose max-w-none">
              <h2>1. Introduction</h2>
              <p>
                These Terms of Service ("Terms") govern your access to and use of the Axanar Campaign Tracker website, 
                including any content, functionality, and services offered on or through axanarcampaigns.com (the "Platform").
              </p>
              <p>
                By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, 
                you must not access or use the Platform.
              </p>
              
              <h2>2. Definitions</h2>
              <p>
                <strong>"We," "Us," or "Our"</strong> refers to Axanar Productions, the operators of the Platform.
              </p>
              <p>
                <strong>"User," "You," or "Your"</strong> refers to any individual who accesses or uses the Platform.
              </p>
              <p>
                <strong>"Content"</strong> refers to any text, images, videos, audio, or other material that is posted, uploaded, 
                or otherwise made available through the Platform.
              </p>
              
              <h2>3. User Accounts</h2>
              <p>
                To access certain features of the Platform, you may be required to register for an account. You agree to provide 
                accurate, current, and complete information during the registration process and to update such information to 
                keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding your password and for all activities that occur under your account. You agree 
                to notify us immediately of any unauthorized use of your account.
              </p>
              
              <h2>4. Crowdfunding and Donations</h2>
              <p>
                The Platform facilitates crowdfunding campaigns for Axanar productions and related projects. By contributing to 
                a campaign, you acknowledge and agree to the following:
              </p>
              <ul>
                <li>
                  Your contribution is voluntary and does not guarantee any ownership rights in the resulting production.
                </li>
                <li>
                  Project timelines, perks, and deliverables are estimates and subject to change.
                </li>
                <li>
                  You are responsible for providing accurate information for the delivery of any perks.
                </li>
                <li>
                  We reserve the right to refund contributions at our discretion.
                </li>
              </ul>
              
              <h2>5. User Conduct</h2>
              <p>
                You agree not to use the Platform to:
              </p>
              <ul>
                <li>
                  Violate any applicable laws or regulations.
                </li>
                <li>
                  Infringe upon the rights of others, including intellectual property rights.
                </li>
                <li>
                  Harass, abuse, or harm another person or entity.
                </li>
                <li>
                  Upload or transmit viruses, malware, or other malicious code.
                </li>
                <li>
                  Interfere with or disrupt the Platform or servers or networks connected to the Platform.
                </li>
                <li>
                  Collect or harvest any information from the Platform without authorization.
                </li>
              </ul>
              
              <h2>6. Intellectual Property</h2>
              <p>
                The Platform and its original content, features, and functionality are owned by Axanar Productions and are 
                protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                Axanar Productions acknowledges that the Star Trek franchise and its associated trademarks, characters, and 
                other intellectual property are owned by CBS Studios Inc. and Paramount Pictures Corporation. Axanar is an 
                unauthorized fan production and is not endorsed by, sponsored by, or affiliated with CBS, Paramount Pictures, 
                or any other Star Trek franchise rights holders.
              </p>
              
              <h2>7. User Content</h2>
              <p>
                You retain ownership of any content you submit to the Platform. By submitting content, you grant us a 
                non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, and 
                distribute your content in connection with the Platform and our business operations.
              </p>
              
              <h2>8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Axanar Productions shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or 
                indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your access to or 
                use of or inability to access or use the Platform.
              </p>
              
              <h2>9. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the Platform at our sole discretion, without 
                prior notice or liability, for any reason, including breach of these Terms.
              </p>
              
              <h2>10. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
                provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              
              <h2>11. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at legal@axanarcampaigns.com.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
