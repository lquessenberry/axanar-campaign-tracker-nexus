import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MapPin, Plus, Star, Trash2, Edit2, Save, X } from 'lucide-react';
import { useAdminDonorMutations } from '@/hooks/useAdminDonorMutations';

interface Address {
  id: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  is_primary: boolean | null;
  created_at: string | null;
}

interface AdminGodViewAddressesProps {
  addresses: Address[];
  donorId: string;
  isLoading?: boolean;
}

const emptyAddress = {
  address1: '',
  address2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  phone: '',
  is_primary: false,
};

const AdminGodViewAddresses: React.FC<AdminGodViewAddressesProps> = ({
  addresses,
  donorId,
  isLoading = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyAddress);

  const { createAddress, updateAddress, deleteAddress, setAddressPrimary } = useAdminDonorMutations(donorId);

  const startEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country || '',
      phone: address.phone || '',
      is_primary: address.is_primary || false,
    });
  };

  const startAdd = () => {
    setIsAdding(true);
    setFormData(emptyAddress);
  };

  const cancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData(emptyAddress);
  };

  const handleSave = async () => {
    try {
      if (isAdding) {
        await createAddress.mutateAsync(formData);
        setIsAdding(false);
      } else if (editingId) {
        await updateAddress.mutateAsync({ addressId: editingId, data: formData });
        setEditingId(null);
      }
      setFormData(emptyAddress);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAddress.mutateAsync({ addressId: deleteId });
      setDeleteId(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSetPrimary = async (addressId: string) => {
    try {
      await setAddressPrimary.mutateAsync(addressId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const updateField = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderAddressForm = () => (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label htmlFor="address1" className="text-xs">Address Line 1</Label>
          <Input
            id="address1"
            value={formData.address1}
            onChange={(e) => updateField('address1', e.target.value)}
            placeholder="123 Main St"
            className="h-8 mt-1"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="address2" className="text-xs">Address Line 2</Label>
          <Input
            id="address2"
            value={formData.address2}
            onChange={(e) => updateField('address2', e.target.value)}
            placeholder="Apt 4B"
            className="h-8 mt-1"
          />
        </div>
        <div>
          <Label htmlFor="city" className="text-xs">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="City"
            className="h-8 mt-1"
          />
        </div>
        <div>
          <Label htmlFor="state" className="text-xs">State/Province</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => updateField('state', e.target.value)}
            placeholder="CA"
            className="h-8 mt-1"
          />
        </div>
        <div>
          <Label htmlFor="postal_code" className="text-xs">Postal Code</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => updateField('postal_code', e.target.value)}
            placeholder="90210"
            className="h-8 mt-1"
          />
        </div>
        <div>
          <Label htmlFor="country" className="text-xs">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => updateField('country', e.target.value)}
            placeholder="USA"
            className="h-8 mt-1"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="phone" className="text-xs">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+1 555-123-4567"
            className="h-8 mt-1"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button size="sm" variant="ghost" onClick={cancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={createAddress.isPending || updateAddress.isPending}
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Addresses ({addresses.length})
            </CardTitle>
            {!isAdding && (
              <Button size="sm" onClick={startAdd}>
                <Plus className="h-4 w-4 mr-1" />
                Add Address
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isAdding && renderAddressForm()}

          {addresses.length === 0 && !isAdding ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No addresses on file
            </p>
          ) : (
            addresses.map(address => (
              <div key={address.id}>
                {editingId === address.id ? (
                  renderAddressForm()
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {address.is_primary && (
                          <Badge className="bg-primary/20 text-primary text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        {address.address1 && <p>{address.address1}</p>}
                        {address.address2 && <p>{address.address2}</p>}
                        <p>
                          {[address.city, address.state, address.postal_code]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {address.country && <p>{address.country}</p>}
                        {address.phone && (
                          <p className="text-muted-foreground mt-1">{address.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!address.is_primary && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSetPrimary(address.id)}
                          title="Set as primary"
                          disabled={setAddressPrimary.isPending}
                        >
                          <Star className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(address)}
                        title="Edit address"
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(address.id)}
                        title="Delete address"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGodViewAddresses;
