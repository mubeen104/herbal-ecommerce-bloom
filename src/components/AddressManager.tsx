import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAddresses, type Address } from '@/hooks/useAddresses';
import AddressForm from '@/components/AddressForm';
import { Plus, Edit, Trash2, MapPin, Star, Loader2 } from 'lucide-react';
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

const AddressManager = () => {
  const { addresses, isLoading, deleteAddress, setDefaultAddress, isDeleting } = useAddresses();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteAddress.mutateAsync(addressId);
      setDeleteAddressId(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress.mutateAsync(addressId);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.address_line_1,
      address.address_line_2,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Saved Addresses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Saved Addresses</span>
            </div>
            <Button onClick={handleAddAddress} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No addresses saved</h3>
              <p className="text-muted-foreground mb-4">
                Add your addresses to make checkout faster and easier.
              </p>
              <Button onClick={handleAddAddress}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={address.type === 'home' ? 'default' : 'secondary'}>
                          {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                        </Badge>
                        {address.is_default && (
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>Default</span>
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {address.first_name} {address.last_name}
                          {address.company && (
                            <span className="text-muted-foreground ml-2">
                              ({address.company})
                            </span>
                          )}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {formatAddress(address)}
                        </p>
                        {address.phone && (
                          <p className="text-muted-foreground text-sm">
                            Phone: {address.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!address.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteAddressId(address.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddressForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        address={editingAddress}
        onSuccess={() => {
          // Form will close automatically on success
        }}
      />

      <AlertDialog open={!!deleteAddressId} onOpenChange={() => setDeleteAddressId(null)}>
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
              onClick={() => deleteAddressId && handleDeleteAddress(deleteAddressId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddressManager;