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
import { MapPin, Edit3, Save, X, Package, AlertCircle, CheckCircle, Home, Phone, Globe } from "lucide-react";
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
      <DaystromCard className="overflow-hidden border-2 border-primary/20">
        {/* Header with prominent status */}
        <div className="p-6 pb-5 bg-gradient-to-br from-primary/5 via-transparent to-transparent border-b-2 border-border/30">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4 flex-1">
              <motion.div 
                className="p-3 rounded-daystrom-medium bg-primary/15 border border-primary/30"
                whileHover={{ scale: 1.05 }}
                transition={DAYSTROM_SPRINGS.snappy}
              >
                <MapPin className="h-6 w-6 text-primary" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-2xl font-light tracking-wide mb-2 text-foreground">Shipping Address</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {hasPhysicalRewards 
                    ? `Your address is required to ship ${physicalRewards.length} physical reward${physicalRewards.length !== 1 ? 's' : ''}`
                    : 'Add your shipping address for physical rewards and merchandise'}
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
                    variant={hasAddress ? "outline" : "default"}
                    size="lg"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 min-h-[48px] px-6 font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Edit3 className="h-5 w-5" />
                    {hasAddress ? 'Edit Address' : 'Add Address'}
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Prominent Status Indicator */}
          {hasPhysicalRewards && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-5"
            >
              <div className={`flex items-center gap-3 p-4 rounded-daystrom-medium border-2 ${
                hasAddress 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                {hasAddress ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-500">Ready for Shipment</p>
                      <p className="text-sm text-muted-foreground">Your rewards can be shipped to this address</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 animate-pulse" />
                    <div>
                      <p className="font-medium text-amber-500">Action Required</p>
                      <p className="text-sm text-muted-foreground">Add your address to receive physical rewards</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={DAYSTROM_SPRINGS.gentle}
              className="p-6 bg-muted/20"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Street Address Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm text-foreground">Street Address</h4>
                  </div>
                  
                  <div>
                    <Label htmlFor="address1" className="text-sm font-medium flex items-center gap-1.5">
                      <span>Address Line 1</span>
                      <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Input
                      id="address1"
                      value={formData.address1}
                      onChange={(e) => setFormData(prev => ({ ...prev, address1: e.target.value }))}
                      placeholder="123 Main Street"
                      className="mt-2 h-12 text-base"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address2" className="text-sm font-medium">
                      Address Line 2 <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="address2"
                      value={formData.address2}
                      onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
                      placeholder="Apartment, suite, unit, etc."
                      className="mt-2 h-12 text-base"
                    />
                  </div>
                </div>

                {/* Location Section */}
                <div className="space-y-4 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm text-foreground">Location Details</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium flex items-center gap-1.5">
                        <span>City</span>
                        <span className="text-destructive text-xs">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City name"
                        className="mt-2 h-12 text-base"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium flex items-center gap-1.5">
                        <span>State / Province</span>
                        <span className="text-destructive text-xs">*</span>
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State or province"
                        className="mt-2 h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postal_code" className="text-sm font-medium flex items-center gap-1.5">
                        <span>Postal Code</span>
                        <span className="text-destructive text-xs">*</span>
                      </Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                        placeholder="ZIP or postal code"
                        className="mt-2 h-12 text-base"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium flex items-center gap-1.5">
                        <span>Country</span>
                        <span className="text-destructive text-xs">*</span>
                      </Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        placeholder="Country name"
                        className="mt-2 h-12 text-base"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-4 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm text-foreground">Contact Information</h4>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      type="tel"
                      className="mt-2 h-12 text-base"
                    />
                    <p className="text-xs text-muted-foreground mt-2">For delivery notifications and questions</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateAddress.isPending}
                    className="flex-1 h-12 gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateAddress.isPending}
                    className="flex-1 h-12 gap-2 font-medium shadow-md"
                  >
                    <Save className="h-4 w-4" />
                    {updateAddress.isPending ? 'Saving Address...' : 'Save Address'}
                  </Button>
                </div>
              </form>
            </motion.div>
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
                <div className="space-y-4">
                  <div className="p-5 rounded-daystrom-medium bg-card border border-border/50">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-daystrom-small bg-primary/10 border border-primary/20">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-base font-medium text-foreground">{formData.address1}</p>
                        {formData.address2 && (
                          <p className="text-sm text-muted-foreground">{formData.address2}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {formData.city}, {formData.state} {formData.postal_code}
                        </p>
                        <p className="text-sm font-medium text-foreground">{formData.country}</p>
                      </div>
                    </div>
                    
                    {formData.phone && (
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{formData.phone}</p>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Need to update your address? Click "Edit Address" above
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <motion.div 
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 mb-6"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Package className="h-10 w-10 text-primary" />
                  </motion.div>
                  <h4 className="text-xl font-medium mb-3 text-foreground">No Shipping Address</h4>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                    {hasPhysicalRewards 
                      ? 'You have physical rewards waiting! Add your shipping address so we can send them to you.'
                      : 'Add your shipping address now to be ready for any physical rewards or merchandise.'}
                  </p>
                  <Button
                    size="lg"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 min-h-[48px] px-8 font-medium shadow-lg"
                  >
                    <MapPin className="h-5 w-5" />
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
