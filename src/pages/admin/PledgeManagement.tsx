import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from './AdminLayout';
import { BarChart3, Edit, Trash2, Plus, Filter, ArrowUpDown, X, DollarSign, User, CalendarClock } from 'lucide-react';
import { fetchPledges, Pledge, SortOrder, SortablePledgeColumns, PledgeStatus, createPledge, updatePledge, deletePledge as deletePledgeApi } from '@/api/pledges';
import PledgeForm from '@/components/admin/PledgeForm';

export default function PledgeManagement() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [totalPledges, setTotalPledges] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination and sorting state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortablePledgeColumns>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState<PledgeStatus | ''>('');
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState<Pledge | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const loadPledges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchPledges({
        page,
        pageSize,
        searchQuery,
        sortBy,
        sortOrder,
        status: statusFilter || undefined // Use undefined if statusFilter is falsy
      });
      
      setPledges(result.pledges);
      setTotalPledges(result.total);
    } catch (err: unknown) {
      console.error('Error loading pledges:', err);
      setError('Failed to load pledges. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, searchQuery, statusFilter]);

  useEffect(() => {
    loadPledges();
  }, [loadPledges]);
  
  const handleSort = (column: SortablePledgeColumns) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to descending order
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value === 'all' ? '' : value as PledgeStatus);
    setPage(1); // Reset to first page on status change
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleEditPledge = (pledge: Pledge) => {
    setSelectedPledge(pledge);
    setIsEditModalOpen(true);
  };
  
  const handleShowDeleteModal = (pledge: Pledge) => {
    setSelectedPledge(pledge);
    setIsDeleteModalOpen(true);
  };
  
  const handlePledgeFormSubmit = async (formData: Partial<Pledge>) => {
    setIsSubmitting(true);
    setActionError(null);
    
    try {
      if (isEditModalOpen && selectedPledge) {
        // Update existing pledge
        await updatePledge(selectedPledge.id, formData);
      } else {
        // Create new pledge
        // Ensure all required fields are present
        if (formData.donor_id && formData.campaign_id && formData.amount !== undefined && formData.status) {
          await createPledge({
            donor_id: formData.donor_id,
            campaign_id: formData.campaign_id,
            amount: formData.amount,
            status: formData.status,
            notes: formData.notes || '',
            provider: formData.provider || 'website',
            transaction_id: formData.transaction_id || null,
            reward_id: formData.reward_id || null
          });
        } else {
          throw new Error('Missing required pledge fields');
        }
      }
      
      // Close modal and refresh data
      setIsEditModalOpen(false);
      setIsNewModalOpen(false);
      setSelectedPledge(null);
      loadPledges();
    } catch (err) {
      console.error('Error saving pledge:', err);
      setActionError('Failed to save pledge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeletePledge = async () => {
    if (!selectedPledge) return;
    
    setIsSubmitting(true);
    setActionError(null);
    
    try {
      await deletePledgeApi(selectedPledge.id);
      setIsDeleteModalOpen(false);
      setSelectedPledge(null);
      loadPledges();
    } catch (err) {
      console.error('Error deleting pledge:', err);
      setActionError('Failed to delete pledge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate pagination details
  const totalPages = Math.ceil(totalPledges / pageSize);
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;
  
  // Get statistics for the dashboard
  const totalAmount = pledges.reduce((sum, pledge) => sum + pledge.amount, 0);
  const averageAmount = pledges.length > 0 ? totalAmount / pledges.length : 0;
  const pledgesByStatus = pledges.reduce((acc, pledge) => {
    acc[pledge.status] = (acc[pledge.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <AdminLayout title="Pledge Management">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-gray-700">
            Track and manage donor pledges across all campaigns.
          </p>
          
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="bg-axanar-teal text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-axanar-teal/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Pledge
          </button>
        </div>
        
        {/* Pledge Listing */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-axanar-dark text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Donor Pledges
            </h3>
          </div>
          
          <div className="p-4">
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 pb-4">
              <div className="relative flex-grow max-w-md">
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border rounded focus:ring-axanar-teal focus:border-axanar-teal"
                  placeholder="Search by donor, email, or campaign..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select 
                  className="border rounded px-3 py-2 focus:ring-axanar-teal focus:border-axanar-teal"
                  value={statusFilter || 'all'}
                  onChange={handleStatusChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            
            {/* Pledges Table */}
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Loading pledges...</div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">{error}</div>
            ) : pledges.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No pledges found. Try adjusting your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('donor_name')}
                        >
                          Donor
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('campaign_name')}
                        >
                          Campaign
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('amount')}
                        >
                          Amount
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reward
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('created_at')}
                        >
                          Date
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('status')}
                        >
                          Status
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pledges.map((pledge) => {
                      // Format date
                      const pledgeDate = new Date(pledge.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                      
                      return (
                        <tr key={pledge.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{pledge.donor_name}</div>
                                <div className="text-xs text-gray-500">{pledge.donor_email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pledge.campaign_name || 'Unknown Campaign'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${pledge.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pledge.reward_name || 'No Reward'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pledgeDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pledge.status === 'completed' ? 'bg-green-100 text-green-800' : pledge.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : pledge.status === 'refunded' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {pledge.status.charAt(0).toUpperCase() + pledge.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleEditPledge(pledge)}
                              className="text-axanar-teal hover:text-axanar-teal/80"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleShowDeleteModal(pledge)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && pledges.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, totalPledges)}</span> of <span className="font-medium">{totalPledges}</span> pledges
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handlePageChange(page - 1)} 
                    disabled={!canGoPrevious}
                    className={`px-3 py-1 border rounded ${canGoPrevious ? 'bg-white text-gray-600 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!canGoNext}
                    className={`px-3 py-1 border rounded ${canGoNext ? 'bg-white text-gray-600 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Pledge Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Pledge Summary</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Amount Pledged</h4>
                <div className="text-xl font-medium">
                  ${totalAmount.toLocaleString()}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Average Pledge Amount</h4>
                <div className="text-xl font-medium">
                  ${averageAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Actions & Tools</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setIsNewModalOpen(true)}
                className="w-full py-2 px-3 bg-axanar-teal text-white rounded hover:bg-axanar-teal/90 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Pledge
              </button>
              
              <button className="w-full py-2 px-3 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Pledge Data
              </button>
              
              <button className="w-full py-2 px-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Pledge Report
              </button>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Pledge Status Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-semibold">
                  {pledgesByStatus['completed'] || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold">
                  {pledgesByStatus['pending'] || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Refunded:</span>
                <span className="font-semibold">
                  {pledgesByStatus['refunded'] || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed:</span>
                <span className="font-semibold">
                  {pledgesByStatus['failed'] || 0}
                </span>
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center">
                  <CalendarClock className="h-5 w-5 text-gray-400 mr-2" />
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create/Edit Pledge Modal */}
      {(isEditModalOpen || isNewModalOpen) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditModalOpen ? 'Edit Pledge' : 'Create New Pledge'}
              </h2>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsNewModalOpen(false);
                  setSelectedPledge(null);
                  setActionError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {actionError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
                {actionError}
              </div>
            )}
            
            <PledgeForm
              pledge={selectedPledge || undefined}
              onSubmit={handlePledgeFormSubmit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setIsNewModalOpen(false);
                setSelectedPledge(null);
                setActionError(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedPledge && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this pledge of <span className="font-semibold">${selectedPledge.amount.toFixed(2)}</span> from 
              <span className="font-semibold">{selectedPledge.donor_name || 'Unknown Donor'}</span>?
              This action cannot be undone.
            </p>
            
            {actionError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
                {actionError}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedPledge(null);
                  setActionError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePledge}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Pledge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
