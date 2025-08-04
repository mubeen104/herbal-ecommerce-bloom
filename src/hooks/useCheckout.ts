import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  total: number;
}

interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface CreateOrderData {
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  discountAmount?: number;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  couponId?: string;
  couponCode?: string;
  cartItems: OrderItem[];
}

export const useCheckout = () => {
  const createOrder = useMutation({
    mutationFn: async (orderData: CreateOrderData): Promise<any> => {
      // For guest orders, don't call getUser() - just use session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // Generate order number
      const orderNumber = `NEH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          order_number: orderNumber,
          subtotal: orderData.subtotal,
          shipping_amount: orderData.shippingAmount,
          tax_amount: orderData.taxAmount,
          discount_amount: orderData.discountAmount || 0,
          total_amount: orderData.totalAmount,
          payment_method: orderData.paymentMethod,
          payment_status: 'pending',
          status: 'pending',
          shipping_address: orderData.shippingAddress as any,
          billing_address: orderData.billingAddress as any,
          notes: orderData.notes || null,
          coupon_id: orderData.couponId || null,
          coupon_code: orderData.couponCode || null,
          currency: 'PKR',
        } as any)
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // Create order items
      const orderItems = orderData.cartItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // If order items fail, we should delete the order to maintain consistency
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      // Track coupon usage if a coupon was applied
      if (orderData.couponId && orderData.discountAmount) {
        // Create coupon usage record
        const { error: usageError } = await supabase
          .from('coupon_usage')
          .insert({
            coupon_id: orderData.couponId,
            user_id: userId,
            order_id: order.id,
            discount_amount: orderData.discountAmount,
          });

        if (usageError) {
          console.error('Failed to track coupon usage:', usageError);
        }

        // Update coupon used count - increment by 1
        const { data: currentCoupon } = await supabase
          .from('coupons')
          .select('used_count')
          .eq('id', orderData.couponId)
          .single();

        if (currentCoupon) {
          const { error: updateError } = await supabase
            .from('coupons')
            .update({ used_count: (currentCoupon.used_count || 0) + 1 })
            .eq('id', orderData.couponId);

          // Note: We don't fail the order if coupon tracking fails
          if (updateError) {
            console.error('Failed to update coupon used count:', updateError);
          }
        }
      }

      // Send order confirmation email
      try {
        await supabase.functions.invoke('send-order-emails', {
          body: {
            type: 'order_confirmation',
            orderId: order.id,
          },
        });
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the order creation if email fails
      }

      return order;
    },
  });

  return {
    createOrder,
    isCreatingOrder: createOrder.isPending,
  };
};