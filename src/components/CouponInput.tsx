import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { useAuth } from '@/contexts/AuthContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';

interface CouponInputProps {
  onCouponApply: (coupon: any) => void;
  onCouponRemove: () => void;
  appliedCoupon?: any;
  subtotal: number;
}

const CouponInput = ({ onCouponApply, onCouponRemove, appliedCoupon, subtotal }: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState('');
  const { user } = useAuth();
  const { currency } = useStoreSettings();
  const validateCoupon = useValidateCoupon();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const coupon = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        userId: user?.id,
        isGuest: !user,
        subtotal: subtotal,
      });

      onCouponApply(coupon);
      setCouponCode('');
    } catch (error) {
      // Error is already handled by the mutation's onError handler
      console.error('Coupon validation failed:', error);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemove();
  };

  const calculateDiscount = (coupon: any, subtotal: number) => {
    if (coupon.type === 'percentage') {
      return (subtotal * coupon.value) / 100;
    } else {
      return Math.min(coupon.value, subtotal);
    }
  };

  return (
    <div className="space-y-3">
      {!appliedCoupon ? (
        <div className="flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
          />
          <Button 
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim() || validateCoupon.isPending}
            variant="outline"
          >
            Apply
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <div>
              <Badge variant="outline" className="font-mono">
                {appliedCoupon.code}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {appliedCoupon.type === 'percentage' 
                  ? `${appliedCoupon.value}% off`
                  : `${currency} ${appliedCoupon.value} off`
                } - Saved {currency} {appliedCoupon.type === 'percentage'
                  ? `${calculateDiscount(appliedCoupon, subtotal).toFixed(2)}`
                  : `${Math.min(appliedCoupon.value, subtotal).toFixed(2)}`
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CouponInput;