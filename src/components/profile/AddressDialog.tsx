import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserAddress, useUpdateAddress } from "@/hooks/useUserAddress";
import { toast } from "sonner";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddressDialog: React.FC<AddressDialogProps> = ({ open, onOpenChange }) => {
  const { data: address } = useUserAddress();
  const updateAddress = useUpdateAddress();

  const [formData, setFormData] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    if (address) {
      setFormData({
        address1: address.address1 || '',
        address2: address.address2 || '',
        city: address.city || '',
        state: address.state || '',
        postal_code: address.postal_code || '',
        country: address.country || '',
        phone: address.phone || '',
      });
    }
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📍 Submitting address form from AddressDialog:', formData);
    
    // Client-side validation
    if (!formData.address1.trim() || !formData.city.trim() || !formData.state.trim() || 
        !formData.postal_code.trim() || !formData.country.trim()) {
      toast.error("Please fill in all required fields", {
        description: "Address, City, State, Postal Code, and Country are required"
      });
      return;
    }
    
    try {
      // Show loading toast
      const loadingToast = toast.loading("Saving your shipping address...");
      
      const result = await updateAddress.mutateAsync(formData);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      console.log('✅ Address saved successfully:', result);
      
      toast.success("Shipping address saved successfully!", {
        description: "Your address has been verified and saved to the database"
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Error in address submission:', error);
      
      // Parse error message for better user feedback
      let errorTitle = "Failed to update shipping address";
      let errorDescription = error?.message || "An unexpected error occurred";
      
      // Check for specific error types
      if (errorDescription.includes('not linked to a donor record')) {
        errorTitle = "Account Linkage Issue";
        errorDescription = "Your account needs to be linked to your donor record. Please contact support@axanar.com with your email address.";
      } else if (errorDescription.includes('verify your donor account')) {
        errorTitle = "Account Verification Failed";
        errorDescription = "We couldn't verify your donor account. Please contact support@axanar.com for assistance.";
      } else if (errorDescription.includes('could not be verified')) {
        errorTitle = "Save Verification Failed";
        errorDescription = "The address may have been saved, but we couldn't confirm it. Please refresh the page to check.";
      }
      
      toast.error(errorTitle, {
        description: errorDescription,
        duration: 7000,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Shipping Address</DialogTitle>
          <DialogDescription>
            Update your primary shipping address for orders and deliveries.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="address1">Address Line 1 *</Label>
            <Input
              id="address1"
              value={formData.address1}
              onChange={(e) => handleInputChange('address1', e.target.value)}
              placeholder="Street address"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="address2">Address Line 2</Label>
            <Input
              id="address2"
              value={formData.address2}
              onChange={(e) => handleInputChange('address2', e.target.value)}
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="state">State/Province *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="State"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postal_code">Postal Code *</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                placeholder="ZIP/Postal code"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Country"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Phone number (optional)"
              type="tel"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateAddress.isPending}
              className="flex-1"
            >
              {updateAddress.isPending ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;