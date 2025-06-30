import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { useAddressOperations } from "../../hooks/useAddressOperations";
import { useCreateDonorRecord } from "../../hooks/useDonorRecord";
import { Address } from "../../types/address";
import { useAuth } from "../../contexts/AuthContext";

interface AddressFormProps {
  address: Address | null;
  donorId: string;
  onSuccess?: () => void;
}

const addressSchema = z.object({
  address1: z.string().min(1, "Address line 1 is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

const AddressForm: React.FC<AddressFormProps> = ({ address, donorId, onSuccess }) => {
  const { createAddress, updateAddress, isLoading } = useAddressOperations();
  const createDonorRecord = useCreateDonorRecord();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address1: address?.address1 || "",
      address2: address?.address2 || "",
      city: address?.city || "",
      state: address?.state || "",
      postal_code: address?.postal_code || "",
      country: address?.country || "United States",
      phone: address?.phone || "",
    },
  });

  const onSubmit = async (data: AddressFormValues) => {
    try {
      setProcessing(true);
      
      if (address?.id) {
        // Simple update case
        await updateAddress.mutateAsync({ id: address.id, ...data });
        toast.success("Address updated successfully!");
      } else {
        // For new addresses, we need to make sure there's a valid donor record first
        if (!donorId) {
          // Create a donor record first
          const donorRecord = await createDonorRecord.mutateAsync({
            email: user?.email,
            full_name: user?.user_metadata?.full_name
          });
          
          if (!donorRecord?.id) {
            throw new Error("Failed to create donor record");
          }
          
          // Now create the address with the new donor ID
          await createAddress.mutateAsync({ 
            donorId: donorRecord.id, 
            address1: data.address1, 
            address2: data.address2, 
            city: data.city,
            state: data.state,
            postal_code: data.postal_code,
            country: data.country,
            phone: data.phone,
            is_primary: true 
          });
        } else {
          // We have a donor ID, proceed normally
          await createAddress.mutateAsync({ 
            donorId, 
            address1: data.address1, 
            address2: data.address2, 
            city: data.city,
            state: data.state,
            postal_code: data.postal_code,
            country: data.country,
            phone: data.phone,
            is_primary: true 
          });
        }
        toast.success("Address added successfully!");
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Failed to save address");
      console.error("Error saving address:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{address ? "Update Address" : "Add New Address"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Main St" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Apt 4B" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="San Francisco" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal/Zip Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="94103" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="United States" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="(555) 123-4567" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Address"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddressForm;
