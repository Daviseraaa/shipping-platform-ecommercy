
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Store, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLoginSuccess: (userData: any) => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (role: "shipper" | "seller" | "admin") => {
    if (!formData.username || !formData.password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin đăng nhập",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          ...data,
          role: role,
          username: formData.username,
        };

        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng ${role === "shipper" ? "Shipper" : role === "seller" ? "Seller" : "Admin"}!`,
        });

        onLoginSuccess(userData);
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: data.message || "Tài khoản hoặc mật khẩu không đúng",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Hệ Thống Vận Chuyển
          </CardTitle>
          <CardDescription>
            Đăng nhập vào tài khoản của bạn để tiếp tục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="shipper" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="shipper" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipper
              </TabsTrigger>
              <TabsTrigger value="seller" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Seller
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            {["shipper", "seller", "admin"].map((role) => (
              <TabsContent key={role} value={role} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`username-${role}`}>Tên đăng nhập</Label>
                    <Input
                      id={`username-${role}`}
                      name="username"
                      type="text"
                      placeholder="Nhập tên đăng nhập"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`password-${role}`}>Mật khẩu</Label>
                    <div className="relative">
                      <Input
                        id={`password-${role}`}
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleLogin(role as "shipper" | "seller" | "admin")}
                    disabled={isLoading}
                    className={`w-full ${
                      role === "shipper" 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        : role === "seller"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        : "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
                    }`}
                  >
                    {isLoading ? "Đang đăng nhập..." : `Đăng nhập với tư cách ${
                      role === "shipper" ? "Shipper" : role === "seller" ? "Seller" : "Admin"
                    }`}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
