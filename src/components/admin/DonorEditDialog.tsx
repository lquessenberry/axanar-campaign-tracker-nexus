
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface Donor {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  donor_name?: string;
  email: string;
  auth_user_id?: string;
  created_at?: string;
  totalDonations: number;
  donationCount: number;
  lastDonationDate?: string;
}

interface DonorEditDialogProps {
  donor: Donor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (donorId: string, data: any) => void;
}

const DonorEditDialog = ({ donor, isOpen, onClose, onSave }: DonorEditDialogProps) => {
  const form = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      donor_name: ''
    }
  });

  useEffect(() => {
    if (donor) {
      form.reset({
        first_name: donor.first_name || '',
        last_name: donor.last_name || '',
        email: donor.email || '',
        donor_name: donor.donor_name || ''
      });
    }
  }, [donor, form]);

  const handleSubmit = (data: any) => {
    if (donor) {
      onSave(donor.id, data);
      onClose();
    }
  };

  if (!donor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Donor</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="donor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DonorEditDialog;
