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
import { MapPin, Plus, Star, Trash2, Edit2, Save, X, Home, Building } from 'lucide-react';
import { useAdminDonorMutations } from '@/hooks/useAdminDonorMutations';
import { LCARSStatCard } from '@/components/admin/lcars';
import { cn } from '@/lib/utils';

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

  const primaryAddress = addresses.find(a => a.is_primary);
  const otherAddresses = addresses.filter(a => !a.is_primary);

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
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="address1" className="text-sm">Address Line 1 *</Label>
          <Input
            id="address1"
            value={formData.address1}
            onChange={(e) => updateField('address1', e.target.value)}
            placeholder="123 Main Street"
            className="mt-1"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="address2" className="text-sm">Address Line 2</Label>
          <Input
            id="address2"
            value={formData.address2}
            onChange={(e) => updateField('address2', e.target.value)}
            placeholder="Apt 4B, Suite 100"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="city" className="text-sm">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="Los Angeles"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="state" className="text-sm">State/Province</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => updateField('state', e.target.value)}
            placeholder="CA"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="postal_code" className="text-sm">Postal Code *</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => updateField('postal_code', e.target.value)}
            placeholder="90210"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="country" className="text-sm">Country *</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => updateField('country', e.target.value)}
            placeholder="United States"
            className="mt-1"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="phone" className="text-sm">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
        <Button size="sm" variant="ghost" onClick={cancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={createAddress.isPending || updateAddress.isPending || !formData.address1 || !formData.city || !formData.postal_code || !formData.country}
        >
          <Save className="h-4 w-4 mr-1" />
          {isAdding ? 'Add Address' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );

  const renderAddressCard = (address: Address, isPrimary: boolean = false) => {
    if (editingId === address.id) {
      return renderAddressForm();
    }

    return (
      <div
        className={cn(
          'relative p-4 rounded-lg border transition-all',
          isPrimary 
            ? 'bg-primary/5 border-primary/30' 
            : 'bg-card border-border/50 hover:border-border'
        )}
      >
        {isPrimary && (
          <div className="absolute -top-2 left-3">
            <Badge className="bg-primary text-primary-foreground gap-1 text-xs">
              <Star className="h-3 w-3" />
              Primary
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2 mb-2">
              {isPrimary ? (
                <Home className="h-4 w-4 text-primary" />
              ) : (
                <Building className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {isPrimary ? 'Shipping Address' : 'Alternative Address'}
              </span>
            </div>
            
            <div className="text-sm space-y-0.5">
              {address.address1 && <p className="font-medium">{address.address1}</p>}
              {address.address2 && <p>{address.address2}</p>}
              <p>
                {[address.city, address.state, address.postal_code]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              {address.country && <p className="text-muted-foreground">{address.country}</p>}
              {address.phone && (
                <p className="text-muted-foreground text-xs mt-2">{address.phone}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            {!isPrimary && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleSetPrimary(address.id)}
                title="Set as primary"
                disabled={setAddressPrimary.isPending}
                className="h-8 w-8"
              >
                <Star className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => startEdit(address)}
              title="Edit address"
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDeleteId(address.id)}
              title="Delete address"
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2].map(i => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <LCARSStatCard
          title="Total Addresses"
          value={addresses.length}
          icon={<MapPin className="h-4 w-4" />}
          variant="primary"
        />
        <LCARSStatCard
          title="Has Primary"
          value={primaryAddress ? 'Yes' : 'No'}
          icon={<Star className="h-4 w-4" />}
          variant={primaryAddress ? 'success' : 'warning'}
        />
        <LCARSStatCard
          title="Countries"
          value={new Set(addresses.map(a => a.country).filter(Boolean)).size}
          icon={<Building className="h-4 w-4" />}
          variant="default"
        />
      </div>

      {/* Add Address Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Addresses
        </h3>
        {!isAdding && (
          <Button size="sm" onClick={startAdd} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && renderAddressForm()}

      {/* Addresses */}
      <div className="space-y-4">
        {/* Primary Address */}
        {primaryAddress && renderAddressCard(primaryAddress, true)}

        {/* Other Addresses */}
        {otherAddresses.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {otherAddresses.map(address => (
              <div key={address.id}>
                {renderAddressCard(address, false)}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {addresses.length === 0 && !isAdding && (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No addresses on file</p>
            <Button size="sm" variant="outline" onClick={startAdd} className="mt-4 gap-1">
              <Plus className="h-4 w-4" />
              Add First Address
            </Button>
          </div>
        )}
      </div>

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
