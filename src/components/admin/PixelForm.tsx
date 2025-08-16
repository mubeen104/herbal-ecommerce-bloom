import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2 } from 'lucide-react';
import { useAdvertisingPixels, PLATFORM_OPTIONS, validatePixelId, AdvertisingPixel } from '@/hooks/useAdvertisingPixels';
import { toast } from 'sonner';

interface PixelFormProps {
  pixel?: AdvertisingPixel;
  trigger?: React.ReactNode;
}

export const PixelForm = ({ pixel, trigger }: PixelFormProps) => {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState(pixel?.platform || '');
  const [pixelId, setPixelId] = useState(pixel?.pixel_id || '');
  const [isEnabled, setIsEnabled] = useState(pixel?.is_enabled ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createPixel, updatePixel } = useAdvertisingPixels();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!platform || !pixelId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!validatePixelId(platform, pixelId)) {
      const formats = {
        google_ads: 'AW-1234567890',
        meta_pixel: '123456789012345',
        tiktok_pixel: 'ABC123XYZ789DEF12345'
      };
      toast.error(`Invalid pixel ID format. Expected format: ${formats[platform as keyof typeof formats]}`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (pixel) {
        await updatePixel.mutateAsync({
          id: pixel.id,
          platform: platform as any,
          pixel_id: pixelId,
          is_enabled: isEnabled
        });
      } else {
        await createPixel.mutateAsync({
          platform: platform as any,
          pixel_id: pixelId,
          is_enabled: isEnabled
        });
      }
      
      setOpen(false);
      if (!pixel) {
        // Reset form for new pixels
        setPlatform('');
        setPixelId('');
        setIsEnabled(true);
      }
    } catch (error) {
      // Error already handled in the hooks
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const defaultTrigger = pixel ? (
    <Button variant="ghost" size="sm">
      <Edit2 className="h-4 w-4" />
    </Button>
  ) : (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add Pixel
    </Button>
  );
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {pixel ? 'Edit Advertising Pixel' : 'Add Advertising Pixel'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select 
              value={platform} 
              onValueChange={setPlatform}
              disabled={!!pixel} // Can't change platform for existing pixels
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pixelId">Pixel ID *</Label>
            <Input
              id="pixelId"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder={
                platform === 'google_ads' ? 'AW-1234567890' :
                platform === 'meta_pixel' ? '123456789012345' :
                platform === 'tiktok_pixel' ? 'ABC123XYZ789DEF12345' :
                'Enter pixel ID'
              }
            />
            {platform && (
              <p className="text-sm text-muted-foreground">
                {platform === 'google_ads' && 'Format: AW-1234567890 (10-11 digits after AW-)'}
                {platform === 'meta_pixel' && 'Format: 15-16 digit number'}
                {platform === 'tiktok_pixel' && 'Format: 20 character alphanumeric code'}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
            <Label htmlFor="enabled">Enable pixel tracking</Label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !platform || !pixelId}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : pixel ? 'Update' : 'Add Pixel'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};