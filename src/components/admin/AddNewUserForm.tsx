import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddNewUserFormProps {
  onUserCreated: () => void;
}

const AddNewUserForm = ({ onUserCreated }: AddNewUserFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isContentManager, setIsContentManager] = useState(false);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating new user account:', { email, firstName, lastName, isSuperAdmin, isContentManager });
      
      // Create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email.trim(),
        password: password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          full_name: `${firstName.trim()} ${lastName.trim()}`.trim() || undefined,
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user - no user data returned');
      }

      console.log('User created successfully:', authData.user.id);

      // Add admin privileges if specified
      if (isSuperAdmin || isContentManager) {
        const { error: adminError } = await supabase.rpc('add_admin_user', {
          target_email: email.trim(),
          make_super_admin: isSuperAdmin,
          make_content_manager: isContentManager
        });

        if (adminError) {
          console.error('Error adding admin privileges:', adminError);
          toast({
            title: "Warning",
            description: `User created but failed to add admin privileges: ${adminError.message}`,
            variant: "destructive",
          });
        }
      }

      // Send welcome email if requested
      if (sendWelcomeEmail) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
              to: email.trim(),
              subject: "Welcome to AXANAR Admin System",
              html: `
                <h1>Welcome to AXANAR Admin System!</h1>
                <p>Hello ${firstName || 'Admin'},</p>
                <p>Your admin account has been created successfully.</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${password}</p>
                <p>Please log in and change your password immediately for security.</p>
                <p>Best regards,<br>The AXANAR Team</p>
              `,
              from: "AXANAR Admin <onboarding@resend.dev>"
            }
          });

          if (emailError) {
            console.error('Email error:', emailError);
            toast({
              title: "Warning", 
              description: "User created but welcome email failed to send",
              variant: "destructive",
            });
          } else {
            console.log('Welcome email sent successfully');
          }
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          toast({
            title: "Warning",
            description: "User created but welcome email failed to send",
            variant: "destructive",
          });
        }
      }

      const roleText = [];
      if (isSuperAdmin) roleText.push("Super Admin");
      if (isContentManager) roleText.push("Content Manager");
      const roleDescription = roleText.length > 0 ? ` with roles: ${roleText.join(", ")}` : " with basic access";

      toast({
        title: "Success",
        description: `New user ${email} created successfully${roleDescription}${sendWelcomeEmail ? '. Welcome email sent.' : ''}`,
      });

      // Reset form
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setIsSuperAdmin(false);
      setIsContentManager(false);
      setSendWelcomeEmail(true);
      
      onUserCreated();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <UserPlus className="h-5 w-5 text-primary" />
          Create New User Account
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Create a new user account with optional admin privileges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                type="text"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                type="text"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user-email">Email Address</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user-password">Password</Label>
            <div className="flex gap-2">
              <Input
                id="user-password"
                type="text"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateRandomPassword}
                className="whitespace-nowrap"
              >
                Generate
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Admin Roles</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-super-admin"
                checked={isSuperAdmin}
                onCheckedChange={(checked) => setIsSuperAdmin(checked as boolean)}
              />
              <Label htmlFor="new-super-admin" className="text-sm">
                Super Admin (full system access)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-content-manager"
                checked={isContentManager}
                onCheckedChange={(checked) => setIsContentManager(checked as boolean)}
              />
              <Label htmlFor="new-content-manager" className="text-sm">
                Content Manager (content management access)
              </Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="send-welcome-email"
              checked={sendWelcomeEmail}
              onCheckedChange={(checked) => setSendWelcomeEmail(checked as boolean)}
            />
            <Label htmlFor="send-welcome-email" className="text-sm flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Send welcome email with login credentials
            </Label>
          </div>

          <Button type="submit" disabled={isCreating} className="w-full">
            {isCreating ? "Creating User..." : "Create User Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddNewUserForm;