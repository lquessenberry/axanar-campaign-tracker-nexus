import React from 'react';
import AdminLayout from './AdminLayout';
import { BarChart3, Users, CreditCard, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Donors</p>
                <p className="text-2xl font-bold">157</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>8.2% increase</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>2 new this month</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pledged</p>
                <p className="text-2xl font-bold">$128,547</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>12.4% increase</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-2xl font-bold">$24,853</p>
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>18.2% from last month</span>
            </div>
          </div>
        </div>
        
        {/* Recent Activity and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="border-b px-4 py-3">
              <h3 className="font-medium">Recent Activity</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">New pledge</span> from <span className="text-axanar-teal">Robert Anderson</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">$250.00 • 2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">New donor</span> registered: <span className="text-axanar-teal">Michelle Lee</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Campaign milestone reached:</span> <span className="text-axanar-teal">Axanar Episode IV</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">75% funded • 8 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">New pledge</span> from <span className="text-axanar-teal">James Wilson</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">$175.00 • 1 day ago</p>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 text-sm text-axanar-teal border border-axanar-teal rounded-md hover:bg-axanar-teal/10 transition-colors">
                View All Activity
              </button>
            </div>
          </div>
          
          {/* System Alerts */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="border-b px-4 py-3">
              <h3 className="font-medium">System Alerts</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Low balance for payment gateway</p>
                    <p className="text-xs text-amber-700 mt-1">Payment processor account balance is below the recommended minimum.</p>
                  </div>
                </div>
                
                <div className="flex p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Failed backup</p>
                    <p className="text-xs text-red-700 mt-1">The automated database backup failed last night at 2:00 AM.</p>
                  </div>
                </div>
                
                <div className="flex p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">System update available</p>
                    <p className="text-xs text-blue-700 mt-1">A new version of the campaign management system is available.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 text-sm text-white bg-axanar-teal rounded-md hover:bg-axanar-teal/90 transition-colors">
                    Resolve Alerts
                  </button>
                  <button className="py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    System Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Campaign Performance */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="border-b px-4 py-3">
            <h3 className="font-medium">Campaign Performance</h3>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raised</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Axanar Episode IV</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$37,500</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$50,000</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-axanar-teal h-2.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">75%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Klingon Battle Cruiser Models</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$12,850</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$20,000</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-axanar-teal h-2.5 rounded-full" style={{ width: '64%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">64%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">23</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Federation Uniform Collection</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        Draft
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">--</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$15,000</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gray-400 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">Not started</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">--</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="py-2 px-4 text-sm text-axanar-teal border border-axanar-teal rounded-md hover:bg-axanar-teal/10 transition-colors">
                View All Campaigns
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
