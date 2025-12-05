import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, MapPin, CreditCard, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

type Step = 'shipping' | 'payment' | 'review';

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Kenya',
  });

  const [paymentData, setPaymentData] = useState({
    phoneNumber: user?.phoneNumber || '',
    gateway: 'mpesa' as 'mpesa' | 'card' | 'bank',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to proceed with checkout',
        variant: 'destructive',
      });
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (cartState.items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add items to your cart before checkout',
      });
      navigate('/products');
      return;
    }
  }, [isAuthenticated, cartState.items.length, navigate]);

  const subtotal = cartState.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingFee = subtotal >= 5000 ? 0 : 300;
  const total = subtotal + shippingFee;

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate address
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast({
        title: 'Invalid address',
        description: 'Please fill in all address fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderItems = cartState.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const response = await apiClient.createOrder({
        items: orderItems,
        shippingAddress,
      });

      if (response.success && response.data) {
        setOrderId(response.data.order._id);
        setCurrentStep('payment');
        toast({
          title: 'Order created',
          description: 'Please proceed with payment',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Failed to create order',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId) {
      toast({
        title: 'Order not found',
        description: 'Please start over',
        variant: 'destructive',
      });
      return;
    }

    if (paymentData.gateway === 'mpesa' && !paymentData.phoneNumber) {
      toast({
        title: 'Phone number required',
        description: 'Please enter your M-Pesa phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.initiatePayment({
        orderId,
        gateway: paymentData.gateway,
        phoneNumber: paymentData.phoneNumber,
      });

      if (response.success && response.data) {
        setTransactionId(response.data.transaction._id);
        setCurrentStep('review');
        toast({
          title: 'Payment initiated',
          description: response.data.message || 'Please complete payment on your phone',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Payment failed',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!orderId || !transactionId) return;

    setLoading(true);
    try {
      // Poll for transaction status
      const checkStatus = async (): Promise<boolean> => {
        try {
          const response = await apiClient.getTransactionStatus(transactionId);
          if (response.success && response.data) {
            const { transaction, order } = response.data;
            if (transaction.status === 'success') {
              clearCart();
              navigate(`/orders/${orderId}/confirmation`);
              return true;
            } else if (transaction.status === 'failed') {
              toast({
                title: 'Payment failed',
                description: transaction.errorMessage || 'Payment was not completed',
                variant: 'destructive',
              });
              return true;
            }
          }
        } catch (error) {
          console.error('Error checking status:', error);
        }
        return false;
      };

      // Poll every 3 seconds for up to 60 seconds
      let attempts = 0;
      const maxAttempts = 20;
      const interval = setInterval(async () => {
        attempts++;
        const completed = await checkStatus();
        if (completed || attempts >= maxAttempts) {
          clearInterval(interval);
          if (!completed) {
            toast({
              title: 'Payment pending',
              description: 'Please check your order status in your account',
            });
            navigate('/orders');
          }
        }
      }, 3000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground mt-2">Complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step Indicator */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className={`flex items-center ${currentStep === 'shipping' ? 'text-primary' : currentStep === 'payment' || currentStep === 'review' ? 'text-success' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'shipping' ? 'bg-primary text-primary-foreground' : currentStep === 'payment' || currentStep === 'review' ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
                    {currentStep === 'payment' || currentStep === 'review' ? <CheckCircle2 className="h-4 w-4" /> : '1'}
                  </div>
                  <span className="ml-2 font-medium">Shipping</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${currentStep === 'payment' || currentStep === 'review' ? 'bg-success' : 'bg-muted'}`} />
                <div className={`flex items-center ${currentStep === 'payment' ? 'text-primary' : currentStep === 'review' ? 'text-success' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-primary text-primary-foreground' : currentStep === 'review' ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
                    {currentStep === 'review' ? <CheckCircle2 className="h-4 w-4" /> : '2'}
                  </div>
                  <span className="ml-2 font-medium">Payment</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${currentStep === 'review' ? 'bg-success' : 'bg-muted'}`} />
                <div className={`flex items-center ${currentStep === 'review' ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Review</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Step */}
          {currentStep === 'shipping' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
                <CardDescription>Enter your delivery address</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, street: e.target.value })
                      }
                      required
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, city: e.target.value })
                        }
                        required
                        placeholder="Nairobi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, state: e.target.value })
                        }
                        required
                        placeholder="Nairobi"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">Zip/Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                        }
                        required
                        placeholder="00100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, country: e.target.value })
                        }
                        required
                        placeholder="Kenya"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        Continue to Payment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
                <CardDescription>Choose your payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={paymentData.phoneNumber}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, phoneNumber: e.target.value })
                      }
                      required
                      placeholder="254712345678"
                      pattern="[0-9]{12}"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Format: 254712345678 (without + or spaces)
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Initiating Payment...
                      </>
                    ) : (
                      <>
                        Initiate M-Pesa Payment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-success" />
                  Review & Complete
                </CardTitle>
                <CardDescription>Review your order and complete payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Payment Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Check your phone for the M-Pesa STK Push prompt</li>
                    <li>Enter your M-Pesa PIN</li>
                    <li>Wait for confirmation</li>
                  </ol>
                </div>
                <Button
                  onClick={handleCompleteOrder}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking Payment Status...
                    </>
                  ) : (
                    'Complete Order'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartState.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

