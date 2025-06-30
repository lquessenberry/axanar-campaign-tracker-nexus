import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Edit2, Home } from "lucide-react";
import { Address } from "@/types/address";
import AddressForm from "./AddressForm";

interface AddressCardProps {
  address: Address;
  donorId: string;
  onAddressUpdated?: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, donorId, onAddressUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="mb-4">
        <AddressForm 
          address={address} 
          donorId={donorId}
          onSuccess={() => {
            setIsEditing(false);
            if (onAddressUpdated) onAddressUpdated();
          }} 
        />
        <div className="mt-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md flex items-center">
            {address.is_primary && (
              <Home className="h-4 w-4 mr-2 text-axanar-teal" />
            )}
            {address.is_primary ? 'Primary Address' : 'Additional Address'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-start">
          <MapPin className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
          <div>
            <p>{address.address1}</p>
            {address.address2 && <p>{address.address2}</p>}
            <p>{address.city}, {address.state} {address.postal_code}</p>
            <p>{address.country}</p>
            {address.phone && <p className="text-sm text-muted-foreground mt-1">Phone: {address.phone}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressCard;
