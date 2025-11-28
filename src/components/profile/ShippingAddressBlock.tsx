import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DaystromCard } from "@/components/ui/daystrom-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useUserAddress, useUpdateAddress } from "@/hooks/useUserAddress";
import { useUserRewards } from "@/hooks/useUserRewards";
import { DAYSTROM_SPRINGS } from "@/lib/daystrom-springs";
import { MapPin, Edit3, Save, X, Package, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const ShippingAddressBlock: React.FC = () => {
  const { data: address, isLoading } = useUserAddress();
  const { data: pledges } = useUserRewards();
  const updateAddress = useUpdateAddress();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
  });

  // Check if user has physical rewards
  const physicalRewards = pledges?.filter(p => p.reward?.requires_shipping) || [];
  const hasPhysicalRewards = physicalRewards.length > 0;
  const hasAddress = address && address.address1;

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
    
    // Client-side validation
    if (!formData.address1.trim() || !formData.city.trim() || !formData.state.trim() || 
        !formData.postal_code.trim() || !formData.country.trim()) {
      toast.error("Please fill in all required fields", {
        description: "Address, City, State, Postal Code, and Country are required"
      });
      return;
    }
    
    console.log('📍 Submitting address from ShippingAddressBlock');
    
    try {
      // Show loading toast
      const loadingToast = toast.loading("Saving your shipping address...");
      
      await updateAddress.mutateAsync(formData);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success with verification message
      toast.success("Shipping address saved successfully!", {
        description: "Your address has been verified and saved to the database"
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('❌ Address save error:', error);
      
      // Parse error message for better user feedback
      let errorTitle = "Failed to update shipping address";
      let errorDescription = error?.message || "An unexpected error occurred";
      
      // Check for specific error types
      if (errorDescription.includes('not linked to a donor record')) {
        errorTitle = "Account Linkage Issue";
        errorDescription = "Your account needs to be linked to your donor record. Please contact axanartech@gmail.com";
      } else if (errorDescription.includes('verify your donor account')) {
        errorTitle = "Account Verification Failed";
        errorDescription = "We couldn't verify your donor account. Please contact axanartech@gmail.com";
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

  const handleCancel = () => {
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
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <DaystromCard className="p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading shipping address...</span>
        </div>
      </DaystromCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={DAYSTROM_SPRINGS.gentle}
    >
      <DaystromCard className="overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-daystrom-small bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-light tracking-wide">Shipping Address</h3>
                <p className="text-sm text-muted-foreground">
                  {hasPhysicalRewards 
                    ? `Required for ${physicalRewards.length} physical reward${physicalRewards.length !== 1 ? 's' : ''}`
                    : 'For physical rewards and merchandise'}
                </p>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="edit-button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={DAYSTROM_SPRINGS.snappy}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    {hasAddress ? 'Edit' : 'Add Address'}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="action-buttons"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={DAYSTROM_SPRINGS.snappy}
                  className="flex gap-2"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={updateAddress.isPending}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={updateAddress.isPending}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateAddress.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Indicator */}
          {hasPhysicalRewards && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4"
            >
              <Badge 
                variant={hasAddress ? "default" : "outline"}
                className={`gap-2 ${hasAddress ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}
              >
                {hasAddress ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Ready for shipment
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    Address required
                  </>
                )}
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form
              key="edit-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={DAYSTROM_SPRINGS.gentle}
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >
              <div>
                <Label htmlFor="address1" className="text-sm font-medium">
                  Address Line 1 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address1"
                  value={formData.address1}
                  onChange={(e) => setFormData(prev => ({ ...prev, address1: e.target.value }))}
                  placeholder="Street address"
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address2" className="text-sm font-medium">
                  Address Line 2
                </Label>
                <Input
                  id="address2"
                  value={formData.address2}
                  onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
                  placeholder="Apartment, suite, etc. (optional)"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium">
                    State/Province <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code" className="text-sm font-medium">
                    Postal Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="ZIP/Postal code"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Country"
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number (optional)"
                  type="tel"
                  className="mt-1.5"
                />
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="view-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={DAYSTROM_SPRINGS.gentle}
              className="p-6"
            >
              {hasAddress ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{formData.address1}</p>
                      {formData.address2 && (
                        <p className="text-muted-foreground">{formData.address2}</p>
                      )}
                      <p className="text-muted-foreground">
                        {formData.city}, {formData.state} {formData.postal_code}
                      </p>
                      <p className="text-muted-foreground">{formData.country}</p>
                      {formData.phone && (
                        <p className="text-sm text-muted-foreground mt-2">
                          📞 {formData.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-2">No shipping address on file</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {hasPhysicalRewards 
                      ? 'Add your address to receive your physical rewards'
                      : 'Add your address for future physical rewards'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Add Shipping Address
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DaystromCard>
    </motion.div>
  );
};
