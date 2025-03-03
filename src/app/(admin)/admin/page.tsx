import {
  Users,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';

const stats = [
  {
    name: 'Total Revenue',
    value: '₹92,000',
    change: '+4.75%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Active Orders',
    value: '48',
    change: '+12.5%',
    changeType: 'positive',
    icon: ShoppingCart,
  },
  {
    name: 'Total Clients',
    value: '2,300',
    change: '+3.2%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Pending Tasks',
    value: '15',
    change: '-2.3%',
    changeType: 'negative',
    icon: Clock,
  },
];

const recentOrders = [
  {
    id: 'ORD001',
    client: 'Acme Corp',
    service: 'Tax Consultation',
    status: 'In Progress',
    amount: '₹15,000',
    date: '2024-03-01',
  },
  {
    id: 'ORD002',
    client: 'Tech Solutions',
    service: 'Audit Services',
    status: 'Pending',
    amount: '₹25,000',
    date: '2024-02-28',
  },
  {
    id: 'ORD003',
    client: 'Global Trading',
    service: 'Business Registration',
    status: 'Completed',
    amount: '₹8,000',
    date: '2024-02-27',
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-blue-500 p-3">
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight
                      className="h-4 w-4 flex-shrink-0 self-center text-green-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowDownRight
                      className="h-4 w-4 flex-shrink-0 self-center text-red-500"
                      aria-hidden="true"
                    />
                  )}
                  <span className="sr-only">
                    {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                  </span>
                  {stat.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Recent Orders
            </h3>
            <div className="mt-6 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                          Order ID
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Client
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Service
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Amount
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                            {order.id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {order.client}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {order.service}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                order.status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {order.amount}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {order.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 