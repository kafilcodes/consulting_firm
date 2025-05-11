'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  getRecentOrders,
  getTotalRevenue,
  getTotalClients,
  getTotalEmployees,
  getRevenueByMonth,
  getOrdersByStatus,
  getTopServices
} from '@/lib/firebase/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Users, CreditCard, DollarSign, ShoppingBag, BarChart2, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, userRole, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    recentOrders: [],
    totalRevenue: 0,
    totalClients: 0,
    totalEmployees: 0,
    revenueByMonth: [],
    ordersByStatus: [],
    topServices: [],
    isLoading: true
  });

  useEffect(() => {
    if (!isLoading && (!user || userRole !== 'admin')) {
      router.push('/auth/signin');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [
          recentOrdersData,
          totalRevenueData,
          totalClientsData,
          totalEmployeesData,
          revenueByMonthData,
          ordersByStatusData,
          topServicesData
        ] = await Promise.all([
          getRecentOrders(5),
          getTotalRevenue(),
          getTotalClients(),
          getTotalEmployees(),
          getRevenueByMonth(),
          getOrdersByStatus(),
          getTopServices(5)
        ]);

        setDashboardData({
          recentOrders: recentOrdersData,
          totalRevenue: totalRevenueData,
          totalClients: totalClientsData,
          totalEmployees: totalEmployeesData,
          revenueByMonth: revenueByMonthData,
          ordersByStatus: ordersByStatusData,
          topServices: topServicesData,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({ ...prev, isLoading: false }));
      }
    };

    if (user && userRole === 'admin') {
      fetchDashboardData();
    }
  }, [user, userRole, isLoading, router]);

  // Colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const STATUS_COLORS = {
    pending: '#FFBB28',
    confirmed: '#00C49F',
    processing: '#0088FE',
    completed: '#4CAF50',
    cancelled: '#FF5252'
  };

  if (isLoading || dashboardData.isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-[100px]" />
                </CardTitle>
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-4 w-[80px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array(2).fill(0).map((_, i) => (
            <Card key={i} className="col-span-1">
              <CardHeader>
                <CardTitle><Skeleton className="h-5 w-[150px]" /></CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            This Month
          </Button>
          <Button variant="outline" size="sm">
            This Year
          </Button>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +4.6% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.ordersByStatus
                .filter(item => item.status === 'pending' || item.status === 'processing')
                .reduce((acc, item) => acc + item.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Trend Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboardData.revenueByMonth}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.substring(0, 3)}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.ordersByStatus.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Services Chart */}
        <Card className="col-span-2">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Top Services</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/services')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.topServices}
                margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-semibold">{order.serviceName || 'Service'}</p>
                      <p className="text-xs text-muted-foreground">{order.userName || 'User'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.amount?.toLocaleString() || 0}</p>
                      <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs 
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                        {order.status === 'pending' ? 'Pending' : 
                         order.status === 'confirmed' ? 'Confirmed' :
                         order.status === 'processing' ? 'Processing' :
                         order.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No recent orders found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 