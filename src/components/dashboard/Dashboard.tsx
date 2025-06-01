
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Package, Truck, User, MapPin, Phone, Clock, Shield } from "lucide-react";
import ShipperDashboard from "./ShipperDashboard";
import SellerDashboard from "./SellerDashboard";
import AdminDashboard from "./AdminDashboard";

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "shipper":
        return <Truck className="w-5 h-5 text-white" />;
      case "seller":
        return <Package className="w-5 h-5 text-white" />;
      case "admin":
        return <Shield className="w-5 h-5 text-white" />;
      default:
        return <User className="w-5 h-5 text-white" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "shipper":
        return "Shipper";
      case "seller":
        return "Seller";
      case "admin":
        return "Admin";
      default:
        return "User";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "shipper":
        return "default";
      case "seller":
        return "secondary";
      case "admin":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                {getRoleIcon(user.role)}
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Hệ Thống Vận Chuyển
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user.username}</span>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleName(user.role)}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === "shipper" ? (
          <ShipperDashboard user={user} />
        ) : user.role === "seller" ? (
          <SellerDashboard user={user} />
        ) : user.role === "admin" ? (
          <AdminDashboard user={user} />
        ) : (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900">Vai trò không được hỗ trợ</h2>
            <p className="text-gray-600">Vui lòng liên hệ quản trị viên.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
