import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    hcaptcha: any;
  }
}

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const { toast } = useToast();

  // Load hCaptcha script
  useState(() => {
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setCaptchaLoaded(true);
      // Render captcha
      if (window.hcaptcha) {
        window.hcaptcha.render('hcaptcha-container', {
          sitekey: '50b2fe65-b00b-4b9e-ad62-3ba471098be2', // Test site key
          callback: (token: string) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(null),
          'error-callback': () => setCaptchaToken(null)
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!captchaToken) {
      toast({
        title: "Error",
        description: "Please complete the captcha verification",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'support@axanar.com',
          cc: ['support@axanar.com', 'alec@axanar.com'],
          replyTo: formData.email,
          subject: `Contact Form: ${formData.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">New Contact Form Submission</h2>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${formData.name}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>Subject:</strong> ${formData.subject}</p>
              </div>
              <div style="margin: 20px 0;">
                <h3 style="color: #374151;">Message:</h3>
                <p style="line-height: 1.6;">${formData.message.replace(/\n/g, '<br>')}</p>
              </div>
              <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #6b7280; font-size: 14px;">
                This message was sent from the Axanar contact form.
                <br>
                Time submitted: ${new Date().toLocaleString()}
              </p>
            </div>
          `,
          text: `
New Contact Form Submission

Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

Time submitted: ${new Date().toLocaleString()}
          `
        }
      });

      if (error) {
        console.error('Contact form error:', error);
        toast({
          title: "Error",
          description: `Failed to send message: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Contact form sent successfully:', data);
        toast({
          title: "Message Sent",
          description: "Thank you for contacting us! We'll get back to you soon.",
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setCaptchaToken(null);
        
        // Reset captcha
        if (window.hcaptcha) {
          window.hcaptcha.reset();
        }
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Contact Support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name *
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Subject *
          </label>
          <Input
            id="subject"
            name="subject"
            placeholder="What is this regarding?"
            value={formData.subject}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message *
          </label>
          <Textarea
            id="message"
            name="message"
            rows={6}
            placeholder="Please describe your inquiry or issue in detail..."
            value={formData.message}
            onChange={handleInputChange}
            required
          />
        </div>
        
        {/* hCaptcha */}
        <div className="flex justify-center">
          <div id="hcaptcha-container"></div>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !captchaToken}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Message...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
        
        <p className="text-sm text-muted-foreground text-center">
          All fields marked with * are required. Your message will be sent to our support team.
        </p>
      </CardContent>
    </Card>
  );
};

export default ContactForm;