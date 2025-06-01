
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, User, Search, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SellerDashboardProps {
  user: any;
}

const SellerDashboard = ({ user }: SellerDashboardProps) => {
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration (replace with actual API calls)
  useEffect(() => {
    // Mock orders data
    const mockOrders = [
      {
        order_id: 1,
        order_code: "ORD-001",
        total_price: 500000,
        status: "processing",
        user: { full_name: "Nguyễn Văn A" },
        shipping: {
          status: "pending",
          shipper_id: null,
        }
      },
      {
        order_id: 2,
        order_code: "ORD-002",
        total_price: 750000,
        status: "ready_to_ship",
        user: { full_name: "Trần Thị B" },
        shipping: {
          status: "pending",
          shipper_id: null,
        }
      },
    ];

    // Mock shippers data
    const mockShippers = [
      { user_id: 101, username: "shipper01", full_name: "Lê Văn Giao", phone: "0901234567" },
      { user_id: 102, username: "shipper02", full_name: "Phạm Thị Nhanh", phone: "0907654321" },
      { user_id: 103, username: "shipper03", full_name: "Hoàng Minh Tốc", phone: "0903456789" },
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setShippers(mockShippers);
      setLoading(false);
    }, 1000);
  }, []);

  const assignShipper = async (orderId: number, shipperId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/shipping-management/orders/${orderId}/assign-shipper`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipper_id: shipperId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Thành công",
          description: data.message || "Gán shipper thành công",
        });
        
        // Update local state
        setOrders(orders.map((order: any) => 
          order.order_id === orderId 
            ? { ...order, shipping: { ...order.shipping, shipper_id: shipperId, status: "assigned" } }
            : order
        ));
      } else {
        const errorData = await response.json();
        toast({
          title: "Lỗi",
          description: errorData.message || "Không thể gán shipper",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error assigning shipper:', error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter((order: any) =>
    order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Seller</h2>
          <p className="text-gray-600">Quản lý đơn hàng và gán shipper</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ gán shipper</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((order: any) => !order.shipping?.shipper_id).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã gán shipper</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((order: any) => order.shipping?.shipper_id).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipper khả dụng</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Danh sách đơn hàng</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Không có đơn hàng nào</h3>
              <p className="text-gray-600">Hiện tại chưa có đơn hàng nào phù hợp với tìm kiếm.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order: any) => (
            <OrderCard
              key={order.order_id}
              order={order}
              shippers={shippers}
              onAssignShipper={assignShipper}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order, shippers, onAssignShipper }: any) => {
  const [selectedShipper, setSelectedShipper] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignShipper = async () => {
    if (!selectedShipper) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn shipper",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    await onAssignShipper(order.order_id, parseInt(selectedShipper));
    setIsAssigning(false);
    setSelectedShipper("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "ready_to_ship":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShippingStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "on_the_way":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Đơn hàng #{order.order_code}
            </CardTitle>
            <CardDescription>
              Khách hàng: {order.user.full_name}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(order.status)}>
              {order.status === "processing" && "Đang xử lý"}
              {order.status === "ready_to_ship" && "Sẵn sàng giao"}
              {order.status === "shipped" && "Đã giao"}
            </Badge>
            <Badge className={getShippingStatusColor(order.shipping.status)}>
              {order.shipping.status === "pending" && "Chờ gán shipper"}
              {order.shipping.status === "assigned" && "Đã gán shipper"}
              {order.shipping.status === "on_the_way" && "Đang giao"}
              {order.shipping.status === "delivered" && "Đã giao"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tổng tiền:</span>
          <span className="font-semibold text-green-600">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price)}
          </span>
        </div>

        {/* Assign Shipper Section */}
        {!order.shipping.shipper_id && (order.status === "processing" || order.status === "ready_to_ship") && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="font-medium text-gray-900">Gán shipper cho đơn hàng</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="shipper-select">Chọn shipper</Label>
                <Select value={selectedShipper} onValueChange={setSelectedShipper}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn shipper..." />
                  </SelectTrigger>
                  <SelectContent>
                    {shippers.map((shipper: any) => (
                      <SelectItem key={shipper.user_id} value={shipper.user_id.toString()}>
                        {shipper.full_name} - {shipper.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAssignShipper}
                  disabled={isAssigning || !selectedShipper}
                  className="w-full sm:w-auto"
                >
                  {isAssigning ? "Đang gán..." : "Gán shipper"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Assigned Shipper Info */}
        {order.shipping.shipper_id && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Shipper đã được gán</h4>
            <div className="text-sm text-green-800">
              <p>ID Shipper: {order.shipping.shipper_id}</p>
              <p>Trạng thái: {order.shipping.status}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerDashboard;
