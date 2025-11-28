import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
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

// LCARS Haptic Button Component with visual feedback
const LCARSButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline";
  size?: "lg" | "default";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}> = ({ children, onClick, variant = "default", size = "default", disabled = false, className = "", type = "button" }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    // Create ripple effect at click position
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
    
    onClick?.();
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={DAYSTROM_SPRINGS.snappy}
    >
      {/* LCARS Flash on press */}
      <motion.div
        className="absolute inset-0 bg-primary/30 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        whileTap={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-primary/40 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ width: 0, height: 0, opacity: 0.8 }}
          animate={{ 
            width: 200, 
            height: 200, 
            opacity: 0 
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
      
      {children}
    </motion.button>
  );
};

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
                whileHover={{ 
                  scale: 1.08,
                  boxShadow: "0 0 20px var(--primary)",
                  borderColor: "hsl(var(--primary) / 0.6)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={DAYSTROM_SPRINGS.snappy}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, -5, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <MapPin className="h-6 w-6 text-primary" />
                </motion.div>
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
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  transition={DAYSTROM_SPRINGS.snappy}
                >
                  <LCARSButton
                    variant={hasAddress ? "outline" : "default"}
                    size="lg"
                    onClick={() => setIsEditing(true)}
                    className={`gap-2 min-h-[48px] px-6 font-medium shadow-md border-2 rounded-daystrom-medium ${
                      hasAddress 
                        ? 'border-primary/40 bg-card hover:bg-primary/10' 
                        : 'border-primary bg-primary hover:bg-primary/90'
                    } transition-colors`}
                  >
                    <motion.div
                      animate={{ rotate: [0, 15, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      <Edit3 className="h-5 w-5" />
                    </motion.div>
                    {hasAddress ? 'Edit Address' : 'Add Address'}
                  </LCARSButton>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Prominent Status Indicator with LCARS animation */}
          {hasPhysicalRewards && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              transition={DAYSTROM_SPRINGS.gentle}
              className="mt-5"
            >
              <motion.div 
                className={`flex items-center gap-3 p-4 rounded-daystrom-medium border-2 relative overflow-hidden ${
                  hasAddress 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
                whileHover={{ scale: 1.01 }}
                transition={DAYSTROM_SPRINGS.snappy}
              >
                {/* LCARS sweep animation */}
                <motion.div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    hasAddress ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                  animate={{ 
                    height: ['0%', '100%', '100%', '0%'],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {hasAddress ? (
                  <>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <motion.p 
                        className="font-medium text-green-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        Ready for Shipment
                      </motion.p>
                      <motion.p 
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Your rewards can be shipped to this address
                      </motion.p>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <motion.p 
                        className="font-medium text-amber-500"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Action Required
                      </motion.p>
                      <p className="text-sm text-muted-foreground">Add your address to receive physical rewards</p>
                    </div>
                  </>
                )}
              </motion.div>
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
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div 
                    className="flex items-center gap-2 mb-3"
                    whileHover={{ x: 4 }}
                    transition={DAYSTROM_SPRINGS.snappy}
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Home className="h-4 w-4 text-primary" />
                    </motion.div>
                    <h4 className="font-medium text-sm text-foreground">Street Address</h4>
                  </motion.div>
                  
                  <div>
                    <Label htmlFor="address1" className="text-sm font-medium flex items-center gap-1.5">
                      <span>Address Line 1</span>
                      <span className="text-destructive text-xs">*</span>
                    </Label>
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      transition={DAYSTROM_SPRINGS.snappy}
                    >
                      <Input
                        id="address1"
                        value={formData.address1}
                        onChange={(e) => setFormData(prev => ({ ...prev, address1: e.target.value }))}
                        placeholder="123 Main Street"
                        className="mt-2 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                      />
                    </motion.div>
                  </div>

                  <div>
                    <Label htmlFor="address2" className="text-sm font-medium">
                      Address Line 2 <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      transition={DAYSTROM_SPRINGS.snappy}
                    >
                      <Input
                        id="address2"
                        value={formData.address2}
                        onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
                        placeholder="Apartment, suite, unit, etc."
                        className="mt-2 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Location Section */}
                <motion.div 
                  className="space-y-4 pt-2 border-t border-border/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="flex items-center gap-2 mb-3"
                    whileHover={{ x: 4 }}
                    transition={DAYSTROM_SPRINGS.snappy}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Globe className="h-4 w-4 text-primary" />
                    </motion.div>
                    <h4 className="font-medium text-sm text-foreground">Location Details</h4>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium flex items-center gap-1.5">
                        <span>City</span>
                        <span className="text-destructive text-xs">*</span>
                      </Label>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        transition={DAYSTROM_SPRINGS.snappy}
                      >
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="City name"
                          className="mt-2 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </motion.div>
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium flex items-center gap-1.5">
                        <span>State / Province</span>
                        <span className="text-destructive text-xs">*</span>
                      </Label>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        transition={DAYSTROM_SPRINGS.snappy}
                      >
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="State or province"
                          className="mt-2 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </motion.div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postal_code" className="text-sm font-medium flex items-center gap-1.5">
                        <span>Postal Code</span>
                        <span className="text-destructive text-xs">*</span>
                      </Label>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        transition={DAYSTROM_SPRINGS.snappy}
                      >
                        <Input
                          id="postal_code"
                          value={formData.postal_code}
                          onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                          placeholder="ZIP or postal code"
                          className="mt-2 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </motion.div>
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium flex items-center gap-1.5">
                        <span>Country</span>
                        <span className="text-destructive text-xs">*</span>
                      </Label>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        transition={DAYSTROM_SPRINGS.snappy}
                      >
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="Country name"
                          className="mt-2 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Contact Section */}
                <motion.div 
                  className="space-y-4 pt-2 border-t border-border/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div 
                    className="flex items-center gap-2 mb-3"
                    whileHover={{ x: 4 }}
                    transition={DAYSTROM_SPRINGS.snappy}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Phone className="h-4 w-4 text-primary" />
                    </motion.div>
                    <h4 className="font-medium text-sm text-foreground">Contact Information</h4>
                  </motion.div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      transition={DAYSTROM_SPRINGS.snappy}
                    >
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                        type="tel"
                        className="mt-2 h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </motion.div>
                    <motion.p 
                      className="text-xs text-muted-foreground mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      For delivery notifications and questions
                    </motion.p>
                  </div>
                </motion.div>

                {/* Action Buttons with LCARS haptics */}
                <div className="flex gap-3 pt-4">
                  <LCARSButton
                    type="button"
                    onClick={handleCancel}
                    disabled={updateAddress.isPending}
                    className="flex-1 h-12 gap-2 border-2 border-border bg-card hover:bg-muted rounded-daystrom-medium font-medium transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </LCARSButton>
                  <LCARSButton
                    type="submit"
                    disabled={updateAddress.isPending}
                    className="flex-1 h-12 gap-2 font-medium shadow-lg border-2 border-primary bg-primary hover:bg-primary/90 text-primary-foreground rounded-daystrom-medium transition-colors"
                  >
                    <motion.div
                      animate={updateAddress.isPending ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Save className="h-4 w-4" />
                    </motion.div>
                    {updateAddress.isPending ? 'Saving Address...' : 'Save Address'}
                  </LCARSButton>
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
                  <motion.div 
                    className="p-5 rounded-daystrom-medium bg-card border-2 border-primary/20 relative overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={DAYSTROM_SPRINGS.gentle}
                    whileHover={{ 
                      borderColor: "hsl(var(--primary) / 0.4)",
                      boxShadow: "0 0 20px hsl(var(--primary) / 0.2)"
                    }}
                  >
                    {/* LCARS corner accent */}
                    <motion.div
                      className="absolute top-0 right-0 w-16 h-16 bg-primary/10"
                      style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    
                    <div className="flex items-start gap-4 relative">
                      <motion.div 
                        className="p-2.5 rounded-daystrom-small bg-primary/10 border border-primary/20"
                        whileHover={{ 
                          scale: 1.1,
                          boxShadow: "0 0 15px hsl(var(--primary) / 0.5)"
                        }}
                        transition={DAYSTROM_SPRINGS.snappy}
                      >
                        <Home className="h-5 w-5 text-primary" />
                      </motion.div>
                      <motion.div 
                        className="flex-1 space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <motion.p 
                          className="text-base font-medium text-foreground"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          {formData.address1}
                        </motion.p>
                        {formData.address2 && (
                          <motion.p 
                            className="text-sm text-muted-foreground"
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {formData.address2}
                          </motion.p>
                        )}
                        <motion.p 
                          className="text-sm text-muted-foreground"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.25 }}
                        >
                          {formData.city}, {formData.state} {formData.postal_code}
                        </motion.p>
                        <motion.p 
                          className="text-sm font-medium text-foreground"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {formData.country}
                        </motion.p>
                      </motion.div>
                    </div>
                    
                    {formData.phone && (
                      <motion.div 
                        className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        whileHover={{ x: 4 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                        <p className="text-sm text-muted-foreground">{formData.phone}</p>
                      </motion.div>
                    )}
                  </motion.div>
                  
                  <motion.p 
                    className="text-xs text-muted-foreground text-center"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Need to update your address? Click "Edit Address" above
                  </motion.p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <motion.div 
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 mb-6 relative"
                    animate={{ 
                      scale: [1, 1.08, 1],
                      boxShadow: [
                        "0 0 0px hsl(var(--primary) / 0)",
                        "0 0 30px hsl(var(--primary) / 0.4)",
                        "0 0 0px hsl(var(--primary) / 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* LCARS rotating ring */}
                    <motion.div
                      className="absolute inset-0 border-2 border-primary/30 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      animate={{ 
                        y: [0, -3, 0],
                        rotateY: [0, 180, 360]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Package className="h-10 w-10 text-primary" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h4 
                    className="text-xl font-medium mb-3 text-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    No Shipping Address
                  </motion.h4>
                  
                  <motion.p 
                    className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {hasPhysicalRewards 
                      ? 'You have physical rewards waiting! Add your shipping address so we can send them to you.'
                      : 'Add your shipping address now to be ready for any physical rewards or merchandise.'}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <LCARSButton
                      size="lg"
                      onClick={() => setIsEditing(true)}
                      className="gap-2 min-h-[48px] px-8 font-medium shadow-lg border-2 border-primary bg-primary hover:bg-primary/90 text-primary-foreground rounded-daystrom-medium"
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                      >
                        <MapPin className="h-5 w-5" />
                      </motion.div>
                      Add Shipping Address
                    </LCARSButton>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DaystromCard>
    </motion.div>
  );
};
