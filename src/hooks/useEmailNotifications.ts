import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEmailNotifications = () => {
  const { toast } = useToast();

  const sendOrderConfirmationEmail = async (orderId: string, recipientEmail?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-order-emails', {
        body: {
          type: 'order_confirmation',
          orderId,
          recipientEmail,
        },
      });

      if (error) throw error;

      console.log('Order confirmation email sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      toast({
        title: 'Email Error',
        description: 'Failed to send order confirmation email',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const sendShippingNotificationEmail = async (orderId: string, recipientEmail?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-order-emails', {
        body: {
          type: 'shipping_notification',
          orderId,
          recipientEmail,
        },
      });

      if (error) throw error;

      console.log('Shipping notification email sent:', data);
      toast({
        title: 'Email Sent',
        description: 'Shipping notification email sent successfully',
      });
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send shipping notification email:', error);
      toast({
        title: 'Email Error',
        description: 'Failed to send shipping notification email',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  return {
    sendOrderConfirmationEmail,
    sendShippingNotificationEmail,
  };
};