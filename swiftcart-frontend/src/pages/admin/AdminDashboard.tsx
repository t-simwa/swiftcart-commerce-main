import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, DollarSign, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
  });

  const analytics = analyticsData?.data?.analytics;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-3 w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  const stats = [
    {
      title: 'Total Orders',
      value: analytics?.overview.totalOrders || 0,
      description: 'All time orders',
      icon: ShoppingCart,
      change: '+12.5%',
    },
    {
      title: 'Total Revenue',
      value: `KSh ${(analytics?.overview.totalRevenue || 0).toLocaleString()}`,
      description: 'Last 30 days',
      icon: DollarSign,
      change: '+8.2%',
    },
    {
      title: 'Total Customers',
      value: analytics?.overview.totalCustomers || 0,
      description: 'Registered users',
      icon: Users,
      change: '+5.1%',
    },
    {
      title: 'Low Stock Items',
      value: analytics?.lowStockProducts || 0,
      description: 'Needs attention',
      icon: Package,
      change: analytics?.lowStockProducts > 0 ? 'Action needed' : 'All good',
      variant: analytics?.lowStockProducts > 0 ? 'destructive' : 'default',
    },
  ];

  const ordersByStatus = analytics?.ordersByStatus || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your e-commerce platform performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Low Stock Alert */}
        {analytics?.lowStockProducts > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Low Stock Alert</AlertTitle>
            <AlertDescription>
              You have {analytics.lowStockProducts} products with low stock.{' '}
              <Link to="/admin/inventory" className="font-medium underline">
                View inventory
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Orders by Status */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
              <CardDescription>Current order distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{status}</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Products */}
          {analytics?.topProducts && analytics.topProducts.length > 0 && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling products (last 30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topProducts.slice(0, 5).map((product: any, index: number) => (
                    <div key={product._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KSh {product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/admin/orders">View All Orders</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin/products">Manage Products</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin/inventory">Check Inventory</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin/analytics">View Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

