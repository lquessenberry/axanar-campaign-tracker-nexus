import React from 'react';
import AdminLayout from './AdminLayout';

export default function UserManagement() {
  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        <p className="text-gray-700">
          Manage Axanar Campaign Tracker users, including authentication settings, roles, and permissions.
        </p>
        
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-axanar-dark text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold">User Management</h3>
            <button className="bg-axanar-teal hover:bg-axanar-teal/90 text-white px-3 py-1 rounded text-sm">
              Add User
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between pb-4">
              <div className="relative w-64">
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border rounded focus:ring-axanar-teal focus:border-axanar-teal"
                  placeholder="Search users..." 
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <select className="border rounded px-3 py-2 focus:ring-axanar-teal focus:border-axanar-teal">
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="donor">Donor</option>
                  <option value="user">Regular User</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full overflow-hidden">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">John Doe</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">john.doe@example.com</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Admin
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-axanar-teal hover:text-axanar-teal/80 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full overflow-hidden">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Jane Smith</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">jane.smith@example.com</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Super Admin
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-axanar-teal hover:text-axanar-teal/80 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">Showing <span className="font-medium">1</span> to <span className="font-medium">2</span> of <span className="font-medium">2</span> results</div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border rounded bg-gray-100 text-gray-600">Previous</button>
                <button className="px-3 py-1 border rounded bg-axanar-teal text-white">Next</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-lg mb-2">About User Management</h3>
          <p className="text-sm">
            The User Management module allows administrators to create, edit, and manage user accounts. 
            You can set user roles, permissions, and link user accounts to donor profiles when appropriate.
            Use the search and filter functions to quickly find specific users.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
