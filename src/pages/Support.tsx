import { useState, useEffect, useRef } from "react";
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

const Support = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationData = null; // legacy var removed; ensures no runtime refs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });

  // Set video playback speed to half
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
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
    console.log("Form submitted:", formData);
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Header */}
        <section className="bg-background text-foreground py-12 border-b">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contact Support
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Need help? We're here to assist you with any questions or issues.
            </p>
          </div>
        </section>
        
        {/* Support Options */}
        <section className="relative py-12 px-4 overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover blur-lg"
            >
              <source src="https://vsarkftwkontkfcodbyk.supabase.co/storage/v1/object/public/backgrounds/grok-video-02fbc9a7-3bc9-4af0-8bd7-3d90966861e5.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay for better readability */}
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm"></div>
          </div>
          
          <div className="container mx-auto relative z-10">
                <div className="aspect-[16/6] rounded-lg overflow-hidden border border-primary/20 mb-12">
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="https://vsarkftwkontkfcodbyk.supabase.co/storage/v1/object/public/backgrounds/grok-video-2b554a15-1907-4afb-8a63-adec085e0206(2).mp4" type="video/mp4" />
                  </video>
                </div>
            
            {/* FAQ Section */}
            <div className="text-center mb-12">
              <HelpCircle className="h-8 w-8 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Check our FAQ
              </h2>
              <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                Many common questions are answered in our Frequently Asked Questions section.
                You might find a quick solution there!
              </p>
              <Button variant="outline" asChild>
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
                      <Button onClick={() => setFormSubmitted(false)}>
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
                        className="w-full md:w-auto"
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
