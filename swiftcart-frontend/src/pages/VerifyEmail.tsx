import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '@/lib/authApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        toast({
          title: 'Invalid link',
          description: 'Verification link is invalid or missing',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setIsVerified(true);
        toast({
          title: 'Email verified',
          description: 'Your email has been successfully verified!',
        });
        // Update user in context if logged in
        try {
          const response = await authApi.getMe();
          if (response.data?.user) {
            updateUser(response.data.user);
          }
        } catch (error) {
          // User not logged in, that's fine
        }
      } catch (error: any) {
        toast({
          title: 'Verification failed',
          description: error.message || 'Failed to verify email',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate, updateUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isVerified ? 'Email Verified!' : 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {isVerified
              ? 'Your email has been successfully verified. You can now enjoy all features.'
              : 'The verification link is invalid or has expired.'}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate('/')} className="w-full">
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

