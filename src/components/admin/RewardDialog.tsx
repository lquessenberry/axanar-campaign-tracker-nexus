import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Campaign {
  id: string;
  name: string;
}

interface Reward {
  id: string;
  name: string;
  description?: string;
  minimum_amount: number;
  campaign_id: string;
  created_at: string;
  updated_at?: string;
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
  minimum_amount: z.coerce.number().min(1, "Minimum amount must be at least 1"),
  campaign_id: z.string().min(1, "Please select a campaign"),
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
    formState: { errors, isSubmitting } 
  } = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      name: "",
      description: "",
      minimum_amount: 0,
      campaign_id: "",
    }
  });

  // Reset form when dialog opens or editing reward changes
  useEffect(() => {
    if (isOpen) {
      if (editingReward) {
        setValue("name", editingReward.name);
        setValue("description", editingReward.description || "");
        setValue("minimum_amount", editingReward.minimum_amount);
        setValue("campaign_id", editingReward.campaign_id);
      } else {
        reset({
          name: "",
          description: "",
          minimum_amount: 0,
          campaign_id: "",
        });
      }
    }
  }, [isOpen, editingReward, setValue, reset]);

  const onFormSubmit = (data: RewardFormValues) => {
    onSubmit(data);
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
            
            <div className="space-y-2">
              <Label htmlFor="minimum_amount">Minimum Amount ($) <span className="text-red-500">*</span></Label>
              <Input
                id="minimum_amount"
                type="number"
                min="0"
                step="0.01"
                {...register("minimum_amount")}
                placeholder="0.00"
              />
              {errors.minimum_amount && (
                <p className="text-xs text-red-500">{errors.minimum_amount.message}</p>
              )}
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
