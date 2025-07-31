import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Upload, Trash2 } from 'lucide-react';
import { ProductVariant } from '@/hooks/useProductVariants';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductVariantFormProps {
  productId: string;
  variant?: ProductVariant;
  onSave: (variant: any) => void;
  onCancel: () => void;
}

export const ProductVariantForm: React.FC<ProductVariantFormProps> = ({
  productId,
  variant,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: variant?.name || '',
    description: variant?.description || '',
    price: variant?.price || 0,
    compare_price: variant?.compare_price || 0,
    sku: variant?.sku || '',
    inventory_quantity: variant?.inventory_quantity || 0,
    weight: variant?.weight || 0,
    variant_options: variant?.variant_options || {},
    is_active: variant?.is_active ?? true,
    sort_order: variant?.sort_order || 0,
  });

  const [optionKey, setOptionKey] = useState('');
  const [optionValue, setOptionValue] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleAddOption = () => {
    if (optionKey && optionValue) {
      setFormData(prev => ({
        ...prev,
        variant_options: {
          ...prev.variant_options,
          [optionKey]: optionValue
        }
      }));
      setOptionKey('');
      setOptionValue('');
    }
  };

  const handleRemoveOption = (key: string) => {
    const newOptions = { ...formData.variant_options };
    delete newOptions[key];
    setFormData(prev => ({ ...prev, variant_options: newOptions }));
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const uploadedImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        uploadedImages.push(publicUrl);
      }

      setImages(prev => [...prev, ...Array.from(files)]);
      toast({
        title: "Images uploaded successfully",
        description: `${files.length} image(s) uploaded`
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, product_id: productId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{variant ? 'Edit Variant' : 'Add New Variant'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Variant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Large Red"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Product SKU"
              />
            </div>

            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="compare_price">Compare Price</Label>
              <Input
                id="compare_price"
                type="number"
                step="0.01"
                value={formData.compare_price}
                onChange={(e) => setFormData(prev => ({ ...prev, compare_price: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="inventory">Inventory</Label>
              <Input
                id="inventory"
                type="number"
                value={formData.inventory_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, inventory_quantity: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Variant description"
              rows={3}
            />
          </div>

          {/* Variant Options */}
          <div>
            <Label>Variant Options</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Option name (e.g., Size)"
                  value={optionKey}
                  onChange={(e) => setOptionKey(e.target.value)}
                />
                <Input
                  placeholder="Option value (e.g., Large)"
                  value={optionValue}
                  onChange={(e) => setOptionValue(e.target.value)}
                />
                <Button type="button" onClick={handleAddOption} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {Object.entries(formData.variant_options).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    {key}: {value}
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(key)}
                      className="ml-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Variant Images</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                id="variant-image-upload"
              />
              <label htmlFor="variant-image-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload variant images or drag and drop
                </p>
              </label>
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Variant ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Save Variant'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};