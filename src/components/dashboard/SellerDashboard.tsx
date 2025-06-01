
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, User, Search, UserPlus, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ordersApi, shippersApi, shippingApi } from "@/services/api";

interface SellerDashboardProps {
  user: any;
}

const SellerDashboard = ({ user }: SellerDashboardProps) => {
  const [orders, setOrders] = useState([]);
  const [allShippers, setAllShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchShippers();
  }, []);

  const fetchOrders = async () => {
    try {
      // Giả sử user có shopId, nếu không thì sử dụng mock data
      const shopId = user.shopId || 1; // Mock shopId
      const response = await ordersApi.getShopOrders(shopId);
      
      if (response.success && response.data) {
        // API trả về trong data.products nhưng thực tế là orders
        setOrders(response.data.products || response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to mock data nếu API không hoạt động
      const mockOrders = [
        {
          order_id: 1,
          order_code: "ORD-001",
          total_price: 500000,
          status: "processing",
          user: { full_name: "Nguyễn Văn A" },
          orderShipping: {
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
          orderShipping: {
            status: "pending",
            shipper_id: null,
          }
        },
      ];
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const fetchShippers = async () => {
    try {
      const response = await shippersApi.getAllShippers();
      setAllShippers(response);
    } catch (error) {
      console.error('Error fetching shippers:', error);
      // Fallback to mock data
      const mockShippers = [
        { user_id: 101, username: "shipper01", user_info: { full_name: "Lê Văn Giao", phone_number: "0901234567" } },
        { user_id: 102, username: "shipper02", user_info: { full_name: "Phạm Thị Nhanh", phone_number: "0907654321" } },
        { user_id: 103, username: "shipper03", user_info: { full_name: "Hoàng Minh Tốc", phone_number: "0903456789" } },
      ];
      setAllShippers(mockShippers);
    }
  };

  const assignShipperByPhone = async (orderId: number, phoneNumber: string) => {
    try {
      // Tìm shipper bằng số điện thoại
      const shipperResponse = await shippersApi.findShipperByPhone(phoneNumber);
      
      if (shipperResponse && shipperResponse.user_id) {
        // Gán shipper cho đơn hàng
        const assignResponse = await shippingApi.assignShipper(orderId, shipperResponse.user_id);
        
        toast({
          title: "Thành công",
          description: `Đã gán shipper ${shipperResponse.user_info?.full_name || shipperResponse.username} cho đơn hàng`,
        });
        
        // Cập nhật local state
        setOrders(orders.map((order: any) => 
          order.order_id === orderId 
            ? { 
                ...order, 
                orderShipping: { 
                  ...order.orderShipping, 
                  shipper_id: shipperResponse.user_id, 
                  status: "assigned" 
                } 
              }
            : order
        ));
        
        return true;
      }
    } catch (error) {
      console.error('Error assigning shipper by phone:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tìm thấy shipper với số điện thoại này hoặc gán shipper thất bại",
        variant: "destructive",
      });
      return false;
    }
  };

  const filteredOrders = orders.filter((order: any) =>
    order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
              {orders.filter((order: any) => !order.orderShipping?.shipper_id).length}
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
              {orders.filter((order: any) => order.orderShipping?.shipper_id).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipper khả dụng</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allShippers.length}</div>
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
              onAssignShipperByPhone={assignShipperByPhone}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Order Card Component với tính năng gán shipper bằng số điện thoại
const OrderCard = ({ order, onAssignShipperByPhone }: any) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignShipperByPhone = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại shipper",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    const success = await onAssignShipperByPhone(order.order_id, phoneNumber);
    if (success) {
      setPhoneNumber("");
    }
    setIsAssigning(false);
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
              Khách hàng: {order.user?.full_name}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(order.status)}>
              {order.status === "processing" && "Đang xử lý"}
              {order.status === "ready_to_ship" && "Sẵn sàng giao"}
              {order.status === "shipped" && "Đã giao"}
            </Badge>
            <Badge className={getShippingStatusColor(order.orderShipping?.status || "pending")}>
              {(order.orderShipping?.status === "pending" || !order.orderShipping?.status) && "Chờ gán shipper"}
              {order.orderShipping?.status === "assigned" && "Đã gán shipper"}
              {order.orderShipping?.status === "on_the_way" && "Đang giao"}
              {order.orderShipping?.status === "delivered" && "Đã giao"}
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

        {/* Assign Shipper by Phone Section */}
        {!order.orderShipping?.shipper_id && (order.status === "processing" || order.status === "ready_to_ship") && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="font-medium text-gray-900">Gán shipper bằng số điện thoại</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="phone-input">Số điện thoại shipper</Label>
                <Input
                  id="phone-input"
                  placeholder="Nhập số điện thoại..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAssignShipperByPhone}
                  disabled={isAssigning || !phoneNumber.trim()}
                  className="w-full sm:w-auto"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {isAssigning ? "Đang gán..." : "Gán shipper"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Assigned Shipper Info */}
        {order.orderShipping?.shipper_id && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Shipper đã được gán</h4>
            <div className="text-sm text-green-800">
              <p>ID Shipper: {order.orderShipping.shipper_id}</p>
              <p>Trạng thái: {order.orderShipping.status}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerDashboard;
