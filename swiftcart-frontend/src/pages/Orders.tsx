import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to view your orders',
        variant: 'destructive',
      });
      navigate('/login', { state: { from: '/orders' } });
      return;
    }

    fetchOrders();
  }, [isAuthenticated, currentPage, statusFilter, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 10 };
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await apiClient.getMyOrders(params);
      if (response.success && response.data) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'processing':
        return 'bg-info/10 text-info';
      case 'shipped':
        return 'bg-primary/10 text-primary';
      case 'delivered':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <ShoppingBag className="h-8 w-8 mr-2" />
          My Orders
        </h1>
        <p className="text-muted-foreground">View and manage your orders</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('')}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === 'processing' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('processing')}
        >
          Processing
        </Button>
        <Button
          variant={statusFilter === 'shipped' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('shipped')}
        >
          Shipped
        </Button>
        <Button
          variant={statusFilter === 'delivered' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('delivered')}
        >
          Delivered
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter
                ? `You don't have any ${statusFilter} orders`
                : "You haven't placed any orders yet"}
            </p>
            <Button onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items Preview */}
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {order.items.slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="flex-shrink-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex-shrink-0 w-16 h-16 bg-muted rounded flex items-center justify-center text-xs font-medium">
                        +{order.items.length - 3} more
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="font-semibold text-lg mt-1">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <Link to={`/orders/${order._id}/confirmation`}>
                      <Button variant="outline">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;

