import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Mail, Phone, Users, HelpCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AxanarCTA from "@/components/AxanarCTA";
import Lottie from "lottie-react";

const Support = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });

  // Lottie animation state
  const [animationData, setAnimationData] = useState<any | null>(null);

  useEffect(() => {
    const url = "https://vsarkftwkontkfcodbyk.supabase.co/storage/v1/object/public/backgrounds/axanar-verse-starfleet-officers-offering-support.json";
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load Lottie JSON: ${res.status}`);
        return res.json();
      })
      .then((data) => setAnimationData(data))
      .catch((err) => {
        console.error("Failed to load Lottie animation:", err);
        setAnimationData(null);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you'd typically send the form data to your backend
    console.log("Form submitted:", formData);
    // For now, just simulate a successful submission
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Header */}
        <section className="bg-axanar-dark text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contact Support
            </h1>
            <p className="text-xl text-axanar-silver max-w-3xl mx-auto">
              Need help? We're here to assist you with any questions or issues.
            </p>
          </div>
        </section>
        
        {/* Support Options */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="aspect-[16/6] rounded-lg overflow-hidden border border-primary/20 mb-12">
              {animationData ? (
                <Lottie
                  animationData={animationData}
                  loop
                  autoplay
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <img
                  src="/images/support.jpg"
                  alt="Support team ready to assist"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-axanar-teal/10 p-3 inline-flex mb-4">
                    <Mail className="h-6 w-6 text-axanar-teal" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Email Support</h3>
                  <p className="text-muted-foreground mb-4">
                    For general inquiries and non-urgent issues
                  </p>
                  <a href="mailto:support@axanarcampaigns.com" className="text-axanar-teal font-medium hover:underline">
                    support@axanarcampaigns.com
                  </a>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-axanar-teal/10 p-3 inline-flex mb-4">
                    <Users className="h-6 w-6 text-axanar-teal" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Community Forum</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect with other backers and get community support
                  </p>
                  <a href="https://community.axanarcampaigns.com" className="text-axanar-teal font-medium hover:underline">
                    Visit the Forum
                  </a>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-axanar-teal/10 p-3 inline-flex mb-4">
                    <Phone className="h-6 w-6 text-axanar-teal" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Phone Support</h3>
                  <p className="text-muted-foreground mb-4">
                    Available Monday to Friday, 9am to 5pm PT
                  </p>
                  <a href="tel:+18005551234" className="text-axanar-teal font-medium hover:underline">
                    +1 (800) 555-1234
                  </a>
                </CardContent>
              </Card>
            </div>
            
            {/* FAQ Section */}
            <div className="text-center mb-12">
              <HelpCircle className="h-8 w-8 mx-auto text-axanar-teal mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Check our FAQ
              </h2>
              <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                Many common questions are answered in our Frequently Asked Questions section.
                You might find a quick solution there!
              </p>
              <Button variant="outline" className="border-axanar-teal text-axanar-teal hover:bg-axanar-teal/10" asChild>
                <a href="/faq">View FAQ</a>
              </Button>
            </div>
            
            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">
                    Send us a Message
                  </h2>
                  
                  {formSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for contacting us. We'll get back to you as soon as possible.
                      </p>
                      <Button onClick={() => setFormSubmitted(false)} className="bg-axanar-teal hover:bg-axanar-teal/90">
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Your email"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input 
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Subject of your message"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={handleSelectChange}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="account">Account Issues</SelectItem>
                            <SelectItem value="payment">Payment Problems</SelectItem>
                            <SelectItem value="rewards">Rewards Questions</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea 
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Please describe your issue or question in detail"
                          rows={6}
                          required
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-axanar-teal hover:bg-axanar-teal/90 w-full md:w-auto"
                      >
                        Send Message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* CTA Section */}
            <div className="mt-16">
              <AxanarCTA
                badge="Starfleet Communications Open"
                title="Still Need Assistance, Captain?"
                description="Our dedicated support crew is standing by on all frequencies. Whether you need help with account recovery or have questions about the mission, we're here to help."
                buttons={[
                  {
                    to: "/auth",
                    text: "Try Account Recovery",
                    emoji: "🔐",
                    primary: true
                  },
                  {
                    to: "/faq",
                    text: "Check Database",
                    emoji: "📊"
                  }
                ]}
                subtitle="Remember: No mission is accomplished alone. We're in this together."
              />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Support;
