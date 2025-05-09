
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Login page render state:', { isAuthenticated, isAdmin, loading });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('User is authenticated, redirecting to admin');
      navigate('/admin');
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Logging in with:', email);
      const success = await login(email, password);
      
      if (success) {
        console.log('Login successful, redirecting to admin');
        navigate('/admin');
      } else {
        setErrorMessage('فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="container-custom max-w-lg py-12" dir="rtl">
      <Card className="border-0 shadow-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>
            يرجى تسجيل الدخول للوصول إلى لوحة التحكم
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <p className="text-gray-500">
              المستخدمين الجدد يتم إنشاؤهم من قبل المشرف فقط
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
