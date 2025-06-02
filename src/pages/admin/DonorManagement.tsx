import React from 'react';
import AdminLayout from './AdminLayout';

export default function DonorManagement() {
  return (
    <AdminLayout title="Donor Management">
      <div className="space-y-6">
        <p className="text-gray-700">
          Manage and analyze donors, including their pledge history, total contributions, and personal information.
        </p>
        
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-axanar-dark text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold">Donor Directory</h3>
            <button className="bg-axanar-teal hover:bg-axanar-teal/90 text-white px-3 py-1 rounded text-sm">
              Export Data
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border rounded focus:ring-axanar-teal focus:border-axanar-teal"
                  placeholder="Search donors..." 
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select className="border rounded px-3 py-2 focus:ring-axanar-teal focus:border-axanar-teal">
                  <option value="total_donated">Sort by: Amount Donated</option>
                  <option value="pledge_count">Sort by: Pledge Count</option>
                  <option value="last_donation">Sort by: Last Donation</option>
                  <option value="name">Sort by: Name</option>
                </select>
                
                <select className="border rounded px-3 py-2 focus:ring-axanar-teal focus:border-axanar-teal">
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Donated</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pledges</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Donation</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Robert Anderson</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">robert.anderson@example.com</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">$1,275.00</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">May 28, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-axanar-teal hover:text-axanar-teal/80 mr-3">View</button>
                      <button className="text-blue-600 hover:text-blue-900">Email</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Michelle Lee</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">michelle.lee@example.com</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">$850.00</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">May 15, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-axanar-teal hover:text-axanar-teal/80 mr-3">View</button>
                      <button className="text-blue-600 hover:text-blue-900">Email</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">Showing <span className="font-medium">1</span> to <span className="font-medium">2</span> of <span className="font-medium">157</span> donors</div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border rounded bg-gray-100 text-gray-600">Previous</button>
                <button className="px-3 py-1 border rounded bg-axanar-teal text-white">Next</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">Donor Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Donors:</span>
                <span className="font-semibold">157</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Donors (30 days):</span>
                <span className="font-semibold text-green-600">+12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Donation:</span>
                <span className="font-semibold">$78.35</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Repeat Donors:</span>
                <span className="font-semibold">43%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2 bg-axanar-teal text-white rounded hover:bg-axanar-teal/90 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Newsletter
              </button>
              <button className="w-full py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export All Data
              </button>
              <button className="w-full py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Generate Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
