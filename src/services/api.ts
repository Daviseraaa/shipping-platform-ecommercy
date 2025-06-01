
const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Orders API
export const ordersApi = {
  getShopOrders: async (shopId: number, page = 1, size = 10) => {
    const response = await fetch(`${API_BASE_URL}/order/shop/${shopId}?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getOrderDetails: async (orderId: number) => {
    const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Shippers API
export const shippersApi = {
  getAllShippers: async () => {
    const response = await fetch(`${API_BASE_URL}/user/shippers/all`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  findShipperByPhone: async (phoneNumber: string) => {
    const response = await fetch(`${API_BASE_URL}/user/shippers/find?phone_number=${phoneNumber}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getShipperById: async (shipperId: number) => {
    const response = await fetch(`${API_BASE_URL}/user/shippers/${shipperId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  setUserAsShipper: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/user/shippers/${userId}/set-role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  removeShipperRole: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/user/shippers/${userId}/remove-role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Shipping Management API
export const shippingApi = {
  assignShipper: async (orderId: number, shipperId: number) => {
    const response = await fetch(`${API_BASE_URL}/shipping-management/orders/${orderId}/assign-shipper`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ shipper_id: shipperId }),
    });
    return response.json();
  },

  updateShipmentStatus: async (orderId: number, status: string, trackingNumber?: string, notes?: string) => {
    const response = await fetch(`${API_BASE_URL}/shipping-management/orders/${orderId}/shipment/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status,
        tracking_number: trackingNumber,
        notes,
      }),
    });
    return response.json();
  },

  confirmDelivery: async (orderId: number, notes?: string) => {
    const response = await fetch(`${API_BASE_URL}/shipping-management/orders/${orderId}/shipment/confirm-delivery`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });
    return response.json();
  },

  reportIssue: async (orderId: number, notes: string) => {
    const response = await fetch(`${API_BASE_URL}/shipping-management/orders/${orderId}/shipment/report-issue`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });
    return response.json();
  },

  getAssignedOrders: async (status?: string, page = 1, size = 10) => {
    let url = `${API_BASE_URL}/shipping-management/shipper/my-assignments?page=${page}&size=${size}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
