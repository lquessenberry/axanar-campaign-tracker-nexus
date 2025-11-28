import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DAYSTROM_SPRINGS } from "@/lib/daystrom-springs";

interface AdminPledgeEditorProps {
  pledgeId: string;
  currentStatus?: string | null;
  currentShippedAt?: string | null;
  currentDeliveredAt?: string | null;
  currentTrackingNumber?: string | null;
  currentShippingNotes?: string | null;
}

export const AdminPledgeEditor: React.FC<AdminPledgeEditorProps> = ({
  pledgeId,
  currentStatus,
  currentShippedAt,
  currentDeliveredAt,
  currentTrackingNumber,
  currentShippingNotes,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(currentStatus || "pending");
  const [shippedAt, setShippedAt] = useState(
    currentShippedAt ? new Date(currentShippedAt).toISOString().slice(0, 16) : ""
  );
  const [deliveredAt, setDeliveredAt] = useState(
    currentDeliveredAt ? new Date(currentDeliveredAt).toISOString().slice(0, 16) : ""
  );
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || "");
  const [shippingNotes, setShippingNotes] = useState(currentShippingNotes || "");

  const queryClient = useQueryClient();

  const updatePledgeMutation = useMutation({
    mutationFn: async (data: {
      shipping_status: string;
      shipped_at?: string | null;
      delivered_at?: string | null;
      tracking_number?: string | null;
      shipping_notes?: string | null;
    }) => {
      const { error } = await supabase
        .from("pledges")
        .update(data)
        .eq("id", pledgeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["user-pledges"] });
      toast.success("Fulfillment status updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Failed to update pledge:", error);
      toast.error("Failed to update fulfillment status");
    },
  });

  const handleSave = () => {
    updatePledgeMutation.mutate({
      shipping_status: status,
      shipped_at: shippedAt || null,
      delivered_at: deliveredAt || null,
      tracking_number: trackingNumber || null,
      shipping_notes: shippingNotes || null,
    });
  };

  const handleCancel = () => {
    setStatus(currentStatus || "pending");
    setShippedAt(currentShippedAt ? new Date(currentShippedAt).toISOString().slice(0, 16) : "");
    setDeliveredAt(currentDeliveredAt ? new Date(currentDeliveredAt).toISOString().slice(0, 16) : "");
    setTrackingNumber(currentTrackingNumber || "");
    setShippingNotes(currentShippingNotes || "");
    setIsEditing(false);
  };

  return (
    <div className="relative mt-4 p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-bold text-primary uppercase tracking-wide">
          Admin Controls
        </div>
        {!isEditing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Edit2 className="h-3 w-3" />
            Edit Fulfillment
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={DAYSTROM_SPRINGS.gentle}
            className="space-y-4"
          >
            {/* Shipping Status */}
            <div className="space-y-2">
              <Label htmlFor="shipping-status" className="text-xs font-semibold">
                Shipping Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="shipping-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Number */}
            <div className="space-y-2">
              <Label htmlFor="tracking-number" className="text-xs font-semibold">
                Tracking Number
              </Label>
              <Input
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>

            {/* Shipped At */}
            <div className="space-y-2">
              <Label htmlFor="shipped-at" className="text-xs font-semibold">
                Shipped Date
              </Label>
              <Input
                id="shipped-at"
                type="datetime-local"
                value={shippedAt}
                onChange={(e) => setShippedAt(e.target.value)}
              />
            </div>

            {/* Delivered At */}
            <div className="space-y-2">
              <Label htmlFor="delivered-at" className="text-xs font-semibold">
                Delivered Date
              </Label>
              <Input
                id="delivered-at"
                type="datetime-local"
                value={deliveredAt}
                onChange={(e) => setDeliveredAt(e.target.value)}
              />
            </div>

            {/* Shipping Notes */}
            <div className="space-y-2">
              <Label htmlFor="shipping-notes" className="text-xs font-semibold">
                Shipping Notes
              </Label>
              <Textarea
                id="shipping-notes"
                value={shippingNotes}
                onChange={(e) => setShippingNotes(e.target.value)}
                placeholder="Add any notes about shipping..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updatePledgeMutation.isPending}
                className="gap-2"
              >
                {updatePledgeMutation.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={updatePledgeMutation.isPending}
                className="gap-2"
              >
                <X className="h-3 w-3" />
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={DAYSTROM_SPRINGS.gentle}
            className="text-xs text-muted-foreground"
          >
            Click "Edit Fulfillment" to update shipping status, tracking, and delivery dates
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
