
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, MapPin, Phone, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3434/api';


interface ShipperDashboardProps {
  user: any;
}

const ShipperDashboard = ({ user }: ShipperDashboardProps) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "assigned", label: "Đã gán" },
    { value: "on_the_way", label: "Đang giao" },
    { value: "delivered", label: "Đã giao" },
    { value: "delivery_failed", label: "Giao thất bại" },
  ];

  const statusColors = {
    assigned: "bg-blue-100 text-blue-800",
    on_the_way: "bg-yellow-100 text-yellow-800",
    delivered: "bg-green-100 text-green-800",
    delivery_failed: "bg-red-100 text-red-800",
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = new URL(`${API_BASE_URL}/shipping-management/shipper/my-assignments`);
      
      if (selectedStatus !== "all") {
        url.searchParams.append('status', selectedStatus);
      }
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('size', '10');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.data || []);
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đơn hàng",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateShipmentStatus = async (orderId: number, status: string, trackingNumber?: string, notes?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/shipping-management/orders/${orderId}/shipment/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber,
          notes,
        }),
      });

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Cập nhật trạng thái thành công",
        });
        fetchAssignments(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast({
          title: "Lỗi",
          description: errorData.message || "Không thể cập nhật trạng thái",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
    }
  };

  const confirmDelivery = async (orderId: number, notes?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/shipping-management/orders/${orderId}/shipment/confirm-delivery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Xác nhận giao hàng thành công",
        });
        fetchAssignments();
      } else {
        const errorData = await response.json();
        toast({
          title: "Lỗi",
          description: errorData.message || "Không thể xác nhận giao hàng",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
    }
  };

  const reportIssue = async (orderId: number, notes: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/shipping-management/orders/${orderId}/shipment/report-issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Báo cáo sự cố thành công",
        });
        fetchAssignments();
      } else {
        const errorData = await response.json();
        toast({
          title: "Lỗi",
          description: errorData.message || "Không thể báo cáo sự cố",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [selectedStatus, currentPage]);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Shipper</h2>
          <p className="text-gray-600">Quản lý các đơn hàng được gán cho bạn</p>
        </div>
        <div className="flex items-center space-x-4">
          <Label htmlFor="status-filter">Lọc theo trạng thái:</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : assignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Không có đơn hàng nào</h3>
              <p className="text-gray-600">Hiện tại bạn chưa được gán đơn hàng nào để giao.</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment: any) => (
            <AssignmentCard
              key={assignment.order_shipping_id}
              assignment={assignment}
              onUpdateStatus={updateShipmentStatus}
              onConfirmDelivery={confirmDelivery}
              onReportIssue={reportIssue}
              statusColors={statusColors}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment, onUpdateStatus, onConfirmDelivery, onReportIssue, statusColors }: any) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(assignment.status);
  const [trackingNumber, setTrackingNumber] = useState(assignment.tracking_number || "");
  const [notes, setNotes] = useState("");
  const [showActions, setShowActions] = useState(false);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    await onUpdateStatus(assignment.order_id, newStatus, trackingNumber, notes);
    setIsUpdating(false);
    setShowActions(false);
    setNotes("");
  };

  const handleConfirmDelivery = async () => {
    setIsUpdating(true);
    await onConfirmDelivery(assignment.order_id, notes);
    setIsUpdating(false);
    setNotes("");
  };

  const handleReportIssue = async () => {
    if (!notes.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mô tả sự cố",
        variant: "destructive",
      });
      return;
    }
    setIsUpdating(true);
    await onReportIssue(assignment.order_id, notes);
    setIsUpdating(false);
    setNotes("");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Đơn hàng #{assignment.order?.order_code}
            </CardTitle>
            <CardDescription>
              Shop: {assignment.order?.shop?.shop_name}
            </CardDescription>
          </div>
          <Badge className={statusColors[assignment.status] || "bg-gray-100 text-gray-800"}>
            {assignment.status === "assigned" && "Đã gán"}
            {assignment.status === "on_the_way" && "Đang giao"}
            {assignment.status === "delivered" && "Đã giao"}
            {assignment.status === "delivery_failed" && "Giao thất bại"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Order Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Thông tin đơn hàng</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã vận đơn:</span>
                <span className="font-medium">{assignment.tracking_number || "Chưa có"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-medium text-green-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(assignment.order?.total_price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Khách hàng:</span>
                <span className="font-medium">{assignment.order?.user?.full_name}</span>
              </div>
              {assignment.order?.note && (
                <div>
                  <span className="text-gray-600">Ghi chú:</span>
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{assignment.order.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Địa chỉ giao hàng
            </h4>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{assignment.address?.full_name}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{assignment.address?.phone_number}</span>
              </div>
              <div className="text-gray-600">
                <p>{assignment.address?.street_address}</p>
                <p>{assignment.address?.ward}, {assignment.address?.district}</p>
                <p>{assignment.address?.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {assignment.notes && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-1">Ghi chú vận chuyển:</h5>
            <p className="text-blue-800 text-sm">{assignment.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {assignment.status === "assigned" && (
            <Button
              onClick={() => onUpdateStatus(assignment.order_id, "on_the_way")}
              disabled={isUpdating}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              <Truck className="w-4 h-4 mr-2" />
              Bắt đầu giao hàng
            </Button>
          )}

          {assignment.status === "on_the_way" && (
            <>
              <Button
                onClick={handleConfirmDelivery}
                disabled={isUpdating}
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Xác nhận đã giao
              </Button>
              <Button
                onClick={handleReportIssue}
                disabled={isUpdating || !notes.trim()}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Báo cáo sự cố
              </Button>
            </>
          )}

          <Button
            onClick={() => setShowActions(!showActions)}
            variant="outline"
          >
            Cập nhật chi tiết
          </Button>
        </div>

        {/* Detailed Actions */}
        {showActions && (
          <div className="space-y-4 pt-4 border-t bg-gray-50 p-4 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Đã gán</SelectItem>
                    <SelectItem value="on_the_way">Đang giao</SelectItem>
                    <SelectItem value="delivered">Đã giao</SelectItem>
                    <SelectItem value="delivery_failed">Giao thất bại</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tracking">Mã vận đơn</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Nhập mã vận đơn"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú về quá trình giao hàng..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleStatusUpdate} disabled={isUpdating}>
                {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
              <Button variant="outline" onClick={() => setShowActions(false)}>
                Hủy
              </Button>
            </div>
          </div>
        )}

        {/* For issue reporting when on_the_way */}
        {assignment.status === "on_the_way" && (
          <div className="space-y-2">
            <Label htmlFor="issue-notes">Mô tả sự cố (nếu có)</Label>
            <Textarea
              id="issue-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mô tả chi tiết sự cố gặp phải..."
              rows={2}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipperDashboard;
