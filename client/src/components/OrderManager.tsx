'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { RootState, AppDispatch } from '../store';
import { 
  fetchOrders, 
  createOrder, 
  updateOrder, 
  deleteOrder 
} from '../store/slices/orderSlice';
import { fetchClients } from '../store/slices/clientSlice';
import { fetchProducts } from '../store/slices/productSlice';
import { formatCurrency, parsePrice } from '../utils/formatters';
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react';

export default function OrderManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, isLoading } = useSelector((state: RootState) => state.orders);
  const { clients } = useSelector((state: RootState) => state.clients);
  const { products } = useSelector((state: RootState) => state.products);
  const [showModal, setShowModal] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [orderForm, setOrderForm] = useState({
    clientId: '',
    items: [{ productId: '', quantity: 1 }],
    paymentMethod1: 'cash',
    paymentAmount1: 0
  });

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchClients());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        clientId: parseInt(orderForm.clientId),
        items: orderForm.items.map(item => ({
          productId: parseInt(item.productId),
          quantity: item.quantity
        })).filter(item => item.productId && item.quantity > 0),
        paymentMethod1: orderForm.paymentMethod1,
        paymentAmount1: orderForm.paymentAmount1
      };
      
      if (!orderData.clientId || orderData.items.length === 0) {
        toast.error('Please select a client and add at least one item');
        return;
      }
      
      await dispatch(createOrder(orderData)).unwrap();
      toast.success('Order created successfully!');
      setShowModal(false);
      setOrderForm({
        clientId: '',
        items: [{ productId: '', quantity: 1 }],
        paymentMethod1: 'cash',
        paymentAmount1: 0
      });
      dispatch(fetchOrders());
    } catch (error: any) {
      toast.error(error.message || 'Order creation failed');
    }
  };

  const addOrderItem = () => {
    setOrderForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const removeOrderItem = (index: number) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleViewOrder = (order: any) => {
    setViewOrder(order);
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await dispatch(updateOrder({ id: orderId, status })).unwrap();
      toast.success('Order status updated successfully!');
      // Refresh the orders list
      dispatch(fetchOrders());
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await dispatch(deleteOrder(id)).unwrap();
        toast.success('Order deleted successfully!');
        // Refresh the orders list
        dispatch(fetchOrders());
      } catch (error: any) {
        toast.error(error.message || 'Delete failed');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderNumber || `ORD-${order.id}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.client?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 mr-3"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button onClick={() => setViewOrder(null)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Client: {viewOrder.client?.name}</h3>
                <p className="text-sm text-gray-600">Email: {viewOrder.client?.email}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Order Items:</h3>
                {viewOrder.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between py-2 border-b">
                    <span>{item.product?.name} x {item.quantity}</span>
                    <span>{formatCurrency(parsePrice(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(viewOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Order</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <select
                  value={orderForm.clientId}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, clientId: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Order Items</label>
                {orderForm.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <select
                      value={item.productId}
                      onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{product.name} - {formatCurrency(product.price)}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-20 border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Qty"
                    />
                    {orderForm.items.length > 1 && (
                      <button
                        onClick={() => removeOrderItem(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addOrderItem}
                  className="mt-2 text-blue-600 hover:text-blue-900 text-sm"
                >
                  + Add Item
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  value={orderForm.paymentMethod1}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, paymentMethod1: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}