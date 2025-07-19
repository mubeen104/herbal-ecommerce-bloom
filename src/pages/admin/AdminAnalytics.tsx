import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminAnalytics() {
  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [
        { data: revenueByMonth },
        { data: ordersByStatus },
        { data: topProducts },
        { data: recentActivity }
      ] = await Promise.all([
        // Revenue by month (last 6 months)
        supabase
          .from('orders')
          .select('total_amount, created_at')
          .eq('payment_status', 'completed')
          .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Orders by status
        supabase
          .from('orders')
          .select('status')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Top selling products (last 30 days)
        supabase
          .from('order_items')
          .select(`
            quantity,
            products(name),
            orders!inner(created_at)
          `)
          .gte('orders.created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Recent activity
        supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total_amount,
            status,
            created_at,
            profiles!orders_user_id_fkey(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Process revenue by month
      const monthlyRevenue = revenueByMonth?.reduce((acc: any, order: any) => {
        const month = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + Number(order.total_amount);
        return acc;
      }, {}) || {};

      // Process orders by status
      const statusCounts = ordersByStatus?.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}) || {};

      // Process top products
      const productSales = topProducts?.reduce((acc: any, item: any) => {
        const productName = item.products?.name || 'Unknown Product';
        acc[productName] = (acc[productName] || 0) + item.quantity;
        return acc;
      }, {}) || {};

      const topSellingProducts = Object.entries(productSales)
        .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, quantity }));

      return {
        monthlyRevenue,
        statusCounts,
        topSellingProducts,
        recentActivity: recentActivity || []
      };
    }
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-20 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Insights and performance metrics
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Monthly Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics?.monthlyRevenue || {}).map(([month, revenue]: [string, any]) => (
                  <div key={month} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{month}</span>
                    <span className="font-bold">${Number(revenue).toFixed(2)}</span>
                  </div>
                ))}
                {Object.keys(analytics?.monthlyRevenue || {}).length === 0 && (
                  <p className="text-muted-foreground text-sm">No revenue data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Status (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics?.statusCounts || {}).map(([status, count]: [string, any]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{status}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
                {Object.keys(analytics?.statusCounts || {}).length === 0 && (
                  <p className="text-muted-foreground text-sm">No order data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Top Products (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.topSellingProducts?.map((product: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{product.name}</span>
                    <span className="font-bold">{product.quantity} sold</span>
                  </div>
                ))}
                {(!analytics?.topSellingProducts || analytics.topSellingProducts.length === 0) && (
                  <p className="text-muted-foreground text-sm">No sales data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.recentActivity?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.profiles?.first_name} {order.profiles?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${Number(order.total_amount).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
              {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
                <p className="text-muted-foreground">No recent activity to display.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}