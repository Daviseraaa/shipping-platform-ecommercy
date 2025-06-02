
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, Search, UserPlus, Phone, Shield, MapPin, Mail, Star, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ordersApi, shippersApi, shippingApi, usersApi } from "@/services/api";

interface AdminDashboardProps {
  user: any;
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [foundShipper, setFoundShipper] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Fetch all shippers
  const fetchShippers = async () => {
    try {
      const response = await shippersApi.getAllShippers();
      setShippers(response);
    } catch (error) {
      console.error('Error fetching shippers:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách shipper",
        variant: "destructive",
      });
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await usersApi.getAllUsers();
      setUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchShippers();
    fetchUsers();
  }, []);

  const handlePhoneSearch = async () => {
    if (!phoneSearch.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await shippersApi.findShipperByPhone(phoneSearch);
      setFoundShipper(response);
      toast({
        title: "Thành công",
        description: "Tìm thấy shipper",
      });
    } catch (error) {
      console.error('Error finding shipper:', error);
      setFoundShipper(null);
      toast({
        title: "Lỗi",
        description: "Không tìm thấy shipper với số điện thoại này",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetUserAsShipper = async (userId: number) => {
    try {
      const response = await shippersApi.setUserAsShipper(userId);
      toast({
        title: "Thành công",
        description: response.message,
      });
      fetchShippers(); // Refresh shippers list
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error('Error setting user as shipper:', error);
      toast({
        title: "Lỗi",
        description: "Không thể chuyển vai trò thành shipper",
        variant: "destructive",
      });
    }
  };

  const handleRemoveShipperRole = async (userId: number) => {
    try {
      const response = await shippersApi.removeShipperRole(userId);
      toast({
        title: "Thành công",
        description: response.message,
      });
      fetchShippers(); // Refresh shippers list
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error('Error removing shipper role:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gỡ vai trò shipper",
        variant: "destructive",
      });
    }
  };

  const filteredShippers = shippers.filter((shipper: any) =>
    shipper.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipper.UserInfo?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipper.UserInfo?.phone_number?.includes(searchTerm)
  );

  const filteredUsers = users.filter((user: any) =>
    user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.UserInfo?.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.UserInfo?.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.UserInfo?.phone_number?.includes(userSearchTerm)
  );

  const nonShipperUsers = filteredUsers.filter((user: any) => user.role !== 'shipper');

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Admin</h2>
          <p className="text-gray-600">Quản lý hệ thống và shipper</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Người Dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Shipper</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipper Hoạt Động</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shippers.filter((shipper: any) => shipper.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Đơn Hàng</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shippers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shippers">Quản Lý Shipper</TabsTrigger>
          <TabsTrigger value="users">Quản Lý Người Dùng</TabsTrigger>
          <TabsTrigger value="search">Tìm Kiếm Shipper</TabsTrigger>
        </TabsList>

        <TabsContent value="shippers" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm shipper..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredShippers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Không có shipper nào</h3>
                  <p className="text-gray-600">Hiện tại chưa có shipper nào trong hệ thống.</p>
                </CardContent>
              </Card>
            ) : (
              filteredShippers.map((shipper: any) => (
                <ShipperCard
                  key={shipper.user_id}
                  shipper={shipper}
                  onRemoveRole={handleRemoveShipperRole}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {nonShipperUsers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Không có người dùng nào</h3>
                  <p className="text-gray-600">Tất cả người dùng đều đã là shipper.</p>
                </CardContent>
              </Card>
            ) : (
              nonShipperUsers.map((user: any) => (
                <UserCard
                  key={user.user_id}
                  user={user}
                  onSetAsShipper={handleSetUserAsShipper}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tìm Shipper Theo Số Điện Thoại</CardTitle>
              <CardDescription>Nhập số điện thoại để tìm kiếm shipper</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="phone-search">Số điện thoại</Label>
                  <Input
                    id="phone-search"
                    placeholder="Nhập số điện thoại..."
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handlePhoneSearch} disabled={loading}>
                    <Phone className="w-4 h-4 mr-2" />
                    {loading ? "Đang tìm..." : "Tìm kiếm"}
                  </Button>
                </div>
              </div>

              {foundShipper && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Kết quả tìm kiếm:</h4>
                  <ShipperCard
                    shipper={foundShipper}
                    onRemoveRole={handleRemoveShipperRole}
                    showActions={true}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Enhanced Shipper Card Component with more database information
const ShipperCard = ({ shipper, onRemoveRole, showActions = true }: any) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              {shipper.UserInfo?.lastname || shipper.username}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span>@{shipper.username}</span>
              <span>ID: {shipper.user_id}</span>
              <span>Tham gia: {formatDate(shipper.created_at)}</span>
            </CardDescription>
          </div>
          <Badge variant={shipper.is_active ? "default" : "secondary"}>
            {shipper.is_active ? "Hoạt động" : "Không hoạt động"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-gray-600 text-sm">Email:</span>
              <p className="font-medium">{shipper.UserInfo?.email || "Chưa cập nhật"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-gray-600 text-sm">Số điện thoại:</span>
              <p className="font-medium">{shipper.UserInfo?.phone_number || "Chưa cập nhật"}</p>
            </div>
          </div>
        </div>

        {/* Avatar */}
        {shipper.user_info?.avatar_url && (
          <div className="flex items-center gap-2">
            <img 
              src={shipper.user_info.avatar_url} 
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
        )}

        {/* Addresses */}
        {shipper.user_addresses && shipper.user_addresses.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Địa chỉ
            </h5>
            <div className="space-y-2">
              {shipper.user_addresses.map((address: any) => (
                <div key={address.address_id} className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium">{address.full_name}</p>
                  <p>{address.phone_number}</p>
                  <p>{address.street_address}</p>
                  <p>{address.ward}, {address.district}, {address.city}</p>
                  {address.address_type && (
                    <Badge variant="outline" className="mt-1">
                      {address.address_type}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Statistics */}
        {shipper.totalDeliveredOrders !== undefined && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <div>
              <span className="text-gray-600 text-sm">Đơn hàng đã giao:</span>
              <span className="font-medium ml-2 text-green-600">{shipper.totalDeliveredOrders}</span>
            </div>
          </div>
        )}

        {/* Account Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Vai trò:</span>
            <Badge variant="secondary" className="ml-2">
              {shipper.role}
            </Badge>
          </div>
          <div>
            <span className="text-gray-600">Cập nhật cuối:</span>
            <p className="font-medium">{formatDate(shipper.updated_at)}</p>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemoveRole(shipper.user_id)}
            >
              Gỡ vai trò Shipper
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// New User Card Component for managing regular users
const UserCard = ({ user, onSetAsShipper }: any) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const hasPhoneNumber = user.UserInfo?.phone_number;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              {user.UserInfo?.lastname || user.username}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span>@{user.username}</span>
              <span>ID: {user.user_id}</span>
              <span>Tham gia: {formatDate(user.created_at)}</span>
            </CardDescription>
          </div>
          <Badge variant={user.role === "admin" ? "destructive" : user.role === "seller" ? "secondary" : "outline"}>
            {user.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-gray-600 text-sm">Email:</span>
              <p className="font-medium">{user.UserInfo?.email || "Chưa cập nhật"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-gray-600 text-sm">Số điện thoại:</span>
              <p className="font-medium">{user.UserInfo?.phone_number || "Chưa cập nhật"}</p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        {user.UserAddresses && user.UserAddresses.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Địa chỉ ({user.UserAddresses.length})
            </h5>
            <div className="space-y-2">
              {user.UserAddresses.slice(0, 2).map((address: any) => (
                <div key={address.address_id} className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium">{address.full_name}</p>
                  <p>{address.phone_number}</p>
                  <p>{address.street_address}</p>
                  <p>{address.ward}, {address.district}, {address.city}</p>
                  {address.address_type && (
                    <Badge variant="outline" className="mt-1">
                      {address.address_type}
                    </Badge>
                  )}
                </div>
              ))}
              {user.UserAddresses.length > 2 && (
                <p className="text-sm text-gray-500">+{user.UserAddresses.length - 2} địa chỉ khác</p>
              )}
            </div>
          </div>
        )}

        {/* Account Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Trạng thái:</span>
            <Badge variant={user.is_active ? "default" : "secondary"} className="ml-2">
              {user.is_active ? "Hoạt động" : "Không hoạt động"}
            </Badge>
          </div>
          <div>
            <span className="text-gray-600">Cập nhật cuối:</span>
            <p className="font-medium">{formatDate(user.updated_at)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t">
          {!hasPhoneNumber && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              ⚠️ Người dùng chưa cập nhật số điện thoại. Không thể chuyển thành shipper.
            </div>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => onSetAsShipper(user.user_id)}
            disabled={!hasPhoneNumber || user.role === 'admin'}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Chuyển thành Shipper
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;