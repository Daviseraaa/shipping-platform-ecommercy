
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, User, Search, UserPlus, Phone, MapPin, Clock, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ordersApi, shippingApi } from "@/services/api";

interface SellerDashboardProps {
  user: any;
}

const SellerDashboard = ({ user }: SellerDashboardProps) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const shopId = user.shopId || 1;
      const response = await ordersApi.getShopOrders(shopId);
      
      if (response.success && response.data) {
        setOrders(response.data.products || response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      const mockOrders = [
        {
          order_id: 1,
          order_code: "ORD-001",
          total_price: 500000,
          subtotal_price: 450000,
          shipping_fee: 50000,
          discount_amount: 0,
          status: "processing",
          note: "Giao hàng nhanh",
          created_at: "2024-01-15T10:30:00Z",
          user: { 
            user_id: 5,
            username: "customer1",
            user_info: {
              full_name: "Nguyễn Văn A",
              phone_number: "0901234567",
              email: "customer1@example.com"
            }
          },
          orderItems: [
            {
              order_item_id: 1,
              item_name: "Áo thun cotton",
              quantity: 2,
              price: 150000,
              item_image_url: "https://via.placeholder.com/100",
              item_attributes: { size: "L", color: "Đỏ" }
            },
            {
              order_item_id: 2,
              item_name: "Quần jean",
              quantity: 1,
              price: 300000,
              item_image_url: "https://via.placeholder.com/100",
              item_attributes: { size: "32", color: "Xanh" }
            }
          ],
          orderShipping: {
            status: "pending",
            shipper_id: null,
            tracking_number: null,
            shipping_address: {
              full_name: "Nguyễn Văn A",
              phone_number: "0901234567",
              street_address: "123 Đường Lê Lợi",
              ward: "Phường Bến Nghé",
              district: "Quận 1",
              city: "TP.HCM",
              country: "Vietnam"
            }
          },
          payments: [
            {
              payment_id: 1,
              amount: 500000,
              payment_method: "cod",
              status: "pending"
            }
          ]
        }
      ];
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const assignShipperByPhone = async (orderId: number, phoneNumber: string) => {
    try {
      const response = await shippingApi.assignShipperByPhone(orderId, phoneNumber);
      
      toast({
        title: "Thành công",
        description: "Đã gán shipper cho đơn hàng",
      });
      
      // Update local state
      setOrders(orders.map((order: any) => 
        order.order_id === orderId 
          ? { 
              ...order, 
              orderShipping: { 
                ...order.orderShipping, 
                shipper_id: response.orderShipping?.shipper_id, 
                status: "assigned" 
              } 
            }
          : order
      ));
      
      return true;
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
    order.user?.user_info?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                orders.reduce((sum: number, order: any) => sum + parseFloat(order.total_price || 0), 0)
              )}
            </div>
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

// Enhanced Order Card Component with more database information
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
      case "pending": return "bg-orange-100 text-orange-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "ready_to_ship": return "bg-yellow-100 text-yellow-800";
      case "shipped": return "bg-green-100 text-green-800";
      case "delivered": return "bg-green-200 text-green-900";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getShippingStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "on_the_way": return "bg-yellow-100 text-yellow-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "delivery_failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Đơn hàng #{order.order_code}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {order.user?.user_info?.full_name || order.user?.username}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {order.user?.user_info?.phone_number}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(order.created_at)}
              </span>
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(order.status)}>
              {order.status === "pending" && "Chờ xử lý"}
              {order.status === "processing" && "Đang xử lý"}
              {order.status === "ready_to_ship" && "Sẵn sàng giao"}
              {order.status === "shipped" && "Đã giao"}
              {order.status === "delivered" && "Đã nhận"}
              {order.status === "cancelled" && "Đã hủy"}
            </Badge>
            <Badge className={getShippingStatusColor(order.orderShipping?.status || "pending")}>
              {(order.orderShipping?.status === "pending" || !order.orderShipping?.status) && "Chờ gán shipper"}
              {order.orderShipping?.status === "assigned" && "Đã gán shipper"}
              {order.orderShipping?.status === "on_the_way" && "Đang giao"}
              {order.orderShipping?.status === "delivered" && "Đã giao"}
              {order.orderShipping?.status === "delivery_failed" && "Giao thất bại"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Tạm tính:</span>
            <p className="font-medium">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.subtotal_price || 0)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Phí ship:</span>
            <p className="font-medium">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.shipping_fee || 0)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Giảm giá:</span>
            <p className="font-medium text-red-600">
              -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discount_amount || 0)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Tổng tiền:</span>
            <p className="font-semibold text-green-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price)}
            </p>
          </div>
        </div>

        {/* Order Items */}
        {order.orderItems && order.orderItems.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Sản phẩm đặt mua:</h4>
            <div className="space-y-3">
              {order.orderItems.map((item: any) => (
                <div key={item.order_item_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  {item.item_image_url && (
                    <img 
                      src={item.item_image_url} 
                      alt={item.item_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium">{item.item_name}</h5>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity} | Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </p>
                    {item.item_attributes && (
                      <p className="text-sm text-gray-500">
                        {Object.entries(item.item_attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {order.orderShipping?.shipping_address && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Địa chỉ giao hàng
            </h4>
            <div className="text-sm text-blue-800">
              <p className="font-medium">{order.orderShipping.shipping_address.full_name}</p>
              <p>{order.orderShipping.shipping_address.phone_number}</p>
              <p>{order.orderShipping.shipping_address.street_address}</p>
              <p>
                {order.orderShipping.shipping_address.ward}, {order.orderShipping.shipping_address.district}, {order.orderShipping.shipping_address.city}
              </p>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {order.payments && order.payments.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Thông tin thanh toán</h4>
            {order.payments.map((payment: any) => (
              <div key={payment.payment_id} className="text-sm text-green-800">
                <p>Phương thức: {payment.payment_method === 'cod' ? 'COD' : payment.payment_method}</p>
                <p>Trạng thái: {payment.status === 'pending' ? 'Chờ thanh toán' : payment.status}</p>
                <p>Số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Order Note */}
        {order.note && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Ghi chú đơn hàng</h4>
            <p className="text-sm text-yellow-800">{order.note}</p>
          </div>
        )}

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
              {order.orderShipping.tracking_number && (
                <p>Mã vận đơn: {order.orderShipping.tracking_number}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerDashboard;
