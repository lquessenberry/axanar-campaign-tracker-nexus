import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Header */}
        <section className="bg-axanar-dark text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-axanar-silver max-w-3xl mx-auto">
              Last Updated: June 29, 2025
            </p>
          </div>
        </section>
        
        {/* Privacy Content */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="prose max-w-none">
              <h2>1. Introduction</h2>
              <p>
                Axanar Productions ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you visit our website 
                axanarcampaigns.com, including any other media form, media channel, mobile website, or mobile application 
                related or connected thereto (collectively, the "Site").
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, 
                please do not access the Site.
              </p>
              
              <h2>2. Information We Collect</h2>
              
              <h3>Personal Data</h3>
              <p>
                We may collect personal identification information from you in a variety of ways, including, but not 
                limited to, when you visit our site, register on the site, place an order, subscribe to the newsletter, 
                respond to a survey, fill out a form, and in connection with other activities, services, features or 
                resources we make available on our Site. You may be asked for, as appropriate:
              </p>
              <ul>
                <li>Name</li>
                <li>Email address</li>
                <li>Mailing address</li>
                <li>Phone number</li>
                <li>Credit card information (for donations/purchases)</li>
              </ul>
              
              <h3>Non-Personal Data</h3>
              <p>
                We may collect non-personal identification information about you whenever you interact with our Site. 
                Non-personal identification information may include:
              </p>
              <ul>
                <li>Browser name</li>
                <li>Type of computer or device</li>
                <li>Technical information about your means of connection to our Site, such as operating system and 
                Internet service providers utilized</li>
                <li>IP address</li>
                <li>Usage details and patterns</li>
              </ul>
              
              <h2>3. How We Use Your Information</h2>
              <p>
                We may use the information we collect from you for the following purposes:
              </p>
              <ul>
                <li>To personalize your experience and deliver content most relevant to you</li>
                <li>To improve our website to better serve you</li>
                <li>To process transactions and send related information including confirmations and receipts</li>
                <li>To administer promotions, surveys, or other site features</li>
                <li>To send periodic emails regarding your donations, orders, or other products and services</li>
                <li>To follow up after correspondence (email or phone inquiries)</li>
              </ul>
              
              <h2>4. Cookies and Tracking Technologies</h2>
              <p>
                We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help 
                customize the Site and improve your experience. When you access the Site, your personal information is 
                not collected through the use of tracking technology. Most browsers are set to accept cookies by default.
                You can remove or reject cookies, but be aware that such action could affect the availability and 
                functionality of the Site.
              </p>
              
              <h2>5. Third-Party Websites</h2>
              <p>
                The Site may contain links to third-party websites and applications of interest, including advertisements
                and external services, that are not affiliated with us. Once you have used these links to leave the Site, 
                any information you provide to these third parties is not covered by this Privacy Policy, and we cannot 
                guarantee the safety and privacy of your information.
              </p>
              
              <h2>6. Security of Your Information</h2>
              <p>
                We use administrative, technical, and physical security measures to help protect your personal information.
                While we have taken reasonable steps to secure the personal information you provide to us, please be aware
                that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission
                can be guaranteed against any interception or other type of misuse.
              </p>
              
              <h2>7. Children's Privacy</h2>
              <p>
                The Site is not directed to children under the age of 13, and we do not knowingly collect personal 
                information from children under the age of 13. If we learn we have collected or received personal 
                information from a child under the age of 13, we will delete that information.
              </p>
              
              <h2>8. Your Rights</h2>
              <p>
                You have certain rights regarding your personal information:
              </p>
              <ul>
                <li><strong>Access:</strong> You can request copies of your personal information.</li>
                <li><strong>Rectification:</strong> You can ask us to correct inaccurate information or complete 
                incomplete information.</li>
                <li><strong>Erasure:</strong> You can ask us to erase your personal information in certain circumstances.</li>
                <li><strong>Restrict processing:</strong> You can ask us to restrict the processing of your information 
                in certain circumstances.</li>
                <li><strong>Object to processing:</strong> You have the right to object to certain types of processing, 
                such as direct marketing.</li>
                <li><strong>Data portability:</strong> You can ask for a copy of your information in a machine-readable 
                format.</li>
              </ul>
              
              <h2>9. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this 
                Privacy Policy periodically for any changes.
              </p>
              
              <h2>10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@axanarcampaigns.com.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
