import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Donor {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  donor_name?: string;
  email: string;
}

interface DonorEmailDialogProps {
  donor: Donor | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (donorId: string, email: string, emailData: { subject: string, message: string }) => void;
  isSending?: boolean;
}

const DonorEmailDialog = ({ donor, isOpen, onClose, onSend, isSending = false }: DonorEmailDialogProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const handleSend = () => {
    if (donor && subject && message) {
      onSend(donor.id, donor.email, { subject, message });
    }
  };
  
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset form fields when closing
      setSubject("");
      setMessage("");
    }
  };
  
  if (!donor) return null;

  // Get recipient name for display
  const recipientName = donor.full_name || 
    `${donor.first_name || ''} ${donor.last_name || ''}`.trim() || 
    donor.donor_name || 
    donor.email.split('@')[0];
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Email to {recipientName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input id="recipient" value={donor.email} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="Email subject"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Type your message here..."
              className="min-h-[200px]"
              required
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSend} 
            disabled={isSending || !subject || !message}
          >
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DonorEmailDialog;
