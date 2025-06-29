import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

interface Campaign {
  id: string;
  name: string;
}

interface Reward {
  id: string;
  name: string;
  description?: string;
  amount: number;
  limit?: number;
  claimed: number;
  campaign_id: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at?: string;
  shipping_required?: boolean;
  estimated_delivery?: string;
}

interface RewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingReward?: Reward | null;
  campaigns: Campaign[];
  isLoadingCampaigns: boolean;
}

// Form schema with validation
const rewardSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  description: z.string().optional(),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  limit: z.coerce.number().min(0, "Limit must be a positive number").optional().nullable(),
  campaign_id: z.string().min(1, "Please select a campaign"),
  image_url: z.string().url("Please enter a valid URL").optional().nullable(),
  is_available: z.boolean().default(true),
  shipping_required: z.boolean().default(false),
  estimated_delivery: z.string().optional().nullable()
});

type RewardFormValues = z.infer<typeof rewardSchema>;

const RewardDialog = ({
  isOpen,
  onClose,
  onSubmit,
  editingReward,
  campaigns,
  isLoadingCampaigns
}: RewardDialogProps) => {
  const { 
    register, 
    handleSubmit, 
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: 0,
      limit: null,
      campaign_id: "",
      image_url: null,
      is_available: true,
      shipping_required: false,
      estimated_delivery: null
    }
  });

  const shippingRequired = watch("shipping_required");

  // Reset form when dialog opens or editing reward changes
  useEffect(() => {
    if (isOpen) {
      if (editingReward) {
        setValue("name", editingReward.name);
        setValue("description", editingReward.description || "");
        setValue("amount", editingReward.amount);
        setValue("limit", editingReward.limit || null);
        setValue("campaign_id", editingReward.campaign_id);
        setValue("image_url", editingReward.image_url || null);
        setValue("is_available", editingReward.is_available);
        setValue("shipping_required", editingReward.shipping_required || false);
        setValue("estimated_delivery", editingReward.estimated_delivery || null);
      } else {
        reset({
          name: "",
          description: "",
          amount: 0,
          limit: null,
          campaign_id: "",
          image_url: null,
          is_available: true,
          shipping_required: false,
          estimated_delivery: null
        });
      }
    }
  }, [isOpen, editingReward, setValue, reset]);

  const onFormSubmit = (data: RewardFormValues) => {
    onSubmit({
      ...data,
      // Format data for API if needed
      limit: data.limit || undefined,
      image_url: data.image_url || undefined,
      estimated_delivery: data.shipping_required ? data.estimated_delivery : undefined
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingReward ? "Edit Reward" : "Create New Reward"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Reward Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter reward name"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter reward description"
                rows={3}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) <span className="text-red-500">*</span></Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("amount")}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-xs text-red-500">{errors.amount.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="limit">Limit (optional)</Label>
                <Input
                  id="limit"
                  type="number"
                  min="0"
                  step="1"
                  {...register("limit")}
                  placeholder="No limit"
                />
                {errors.limit && (
                  <p className="text-xs text-red-500">{errors.limit.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campaign_id">Campaign <span className="text-red-500">*</span></Label>
              <Controller
                name="campaign_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoadingCampaigns}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCampaigns ? (
                        <SelectItem value="" disabled>Loading campaigns...</SelectItem>
                      ) : (
                        campaigns.map(campaign => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.campaign_id && (
                <p className="text-xs text-red-500">{errors.campaign_id.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                {...register("image_url")}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && (
                <p className="text-xs text-red-500">{errors.image_url.message}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Controller
                name="is_available"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="is_available"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="is_available">Available for selection by donors</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Controller
                name="shipping_required"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="shipping_required"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="shipping_required">Requires shipping</Label>
            </div>
            
            {shippingRequired && (
              <div className="space-y-2">
                <Label htmlFor="estimated_delivery">Estimated Delivery Date</Label>
                <Input
                  id="estimated_delivery"
                  type="date"
                  {...register("estimated_delivery")}
                />
                {errors.estimated_delivery && (
                  <p className="text-xs text-red-500">{errors.estimated_delivery.message}</p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editingReward ? "Save Changes" : "Create Reward"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RewardDialog;
