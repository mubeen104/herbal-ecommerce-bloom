import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminNotification {
  id: string;
  type: 'new_order' | 'low_stock' | 'new_review' | 'system';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  order_id?: string;
  product_id?: string;
}

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) return;

    fetchNotifications();
    
    // Subscribe to new orders
    const ordersChannel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const newNotification: AdminNotification = {
            id: `order-${payload.new.id}`,
            type: 'new_order',
            title: 'New Order Received',
            message: `Order #${payload.new.order_number} for $${payload.new.total_amount}`,
            created_at: payload.new.created_at,
            read: false,
            order_id: payload.new.id
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [isAdmin]);

  const fetchNotifications = async () => {
    try {
      // Fetch recent orders for notifications
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, created_at, status')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch products with low stock
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('id, name, inventory_quantity')
        .lte('inventory_quantity', 5)
        .eq('track_inventory', true)
        .eq('is_active', true)
        .limit(5);

      const orderNotifications: AdminNotification[] = orders?.map(order => ({
        id: `order-${order.id}`,
        type: 'new_order' as const,
        title: 'Order Received',
        message: `Order #${order.order_number} - $${order.total_amount}`,
        created_at: order.created_at,
        read: order.status !== 'pending',
        order_id: order.id
      })) || [];

      const stockNotifications: AdminNotification[] = lowStockProducts?.map(product => ({
        id: `stock-${product.id}`,
        type: 'low_stock' as const,
        title: 'Low Stock Alert',
        message: `${product.name} has only ${product.inventory_quantity} items left`,
        created_at: new Date().toISOString(),
        read: false,
        product_id: product.id
      })) || [];

      const allNotifications = [...orderNotifications, ...stockNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
};