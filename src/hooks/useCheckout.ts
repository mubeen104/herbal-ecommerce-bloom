import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  productId: string;
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
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
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
          total_amount: orderData.totalAmount,
          payment_method: orderData.paymentMethod,
          payment_status: 'pending',
          status: 'pending',
          shipping_address: orderData.shippingAddress as any,
          billing_address: orderData.billingAddress as any,
          notes: orderData.notes || null,
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

      return order;
    },
  });

  return {
    createOrder,
    isCreatingOrder: createOrder.isPending,
  };
};