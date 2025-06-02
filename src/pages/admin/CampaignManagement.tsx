import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { BarChart3, Edit, Trash2, Plus, Filter, ArrowUpDown, X } from 'lucide-react';
import { fetchCampaigns, Campaign, SortOrder, SortableCampaignColumns, createCampaign, updateCampaign, deleteCampaign as deleteCampaignApi } from '@/api/campaigns';
import CampaignForm from '@/components/admin/CampaignForm';

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination and sorting state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortableCampaignColumns>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchCampaigns({
        page,
        pageSize,
        searchQuery,
        sortBy,
        sortOrder,
        category
      });
      
      setCampaigns(result.campaigns);
      setTotalCampaigns(result.total);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, searchQuery, category]);
  
  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);
  
  const handleSort = (column: SortableCampaignColumns) => {
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
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategory(value === 'all' ? undefined : value);
    setPage(1); // Reset to first page on category change
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsEditModalOpen(true);
  };
  
  const handleShowDeleteModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDeleteModalOpen(true);
  };
  
  const handleCampaignFormSubmit = async (formData: Partial<Campaign>) => {
    setIsSubmitting(true);
    setActionError(null);
    
    try {
      if (isEditModalOpen && selectedCampaign) {
        // Update existing campaign
        await updateCampaign(selectedCampaign.id, formData);
      } else {
        // Create new campaign
        await createCampaign(formData);
      }
      
      // Close modal and refresh data
      setIsEditModalOpen(false);
      setIsNewModalOpen(false);
      setSelectedCampaign(null);
      loadCampaigns();
    } catch (err) {
      console.error('Error saving campaign:', err);
      setActionError('Failed to save campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;
    
    setIsSubmitting(true);
    setActionError(null);
    
    try {
      await deleteCampaignApi(selectedCampaign.id);
      setIsDeleteModalOpen(false);
      setSelectedCampaign(null);
      loadCampaigns();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setActionError('Failed to delete campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate pagination details
  const totalPages = Math.ceil(totalCampaigns / pageSize);
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;
  
  return (
    <AdminLayout title="Campaign Management">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-gray-700">
            Manage campaign listings, track performance, and update campaign details.
          </p>
          
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="bg-axanar-teal text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-axanar-teal/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </button>
        </div>
        
        {/* Campaign Listing */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-axanar-dark text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Campaigns
            </h3>
          </div>
          
          <div className="p-4">
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 pb-4">
              <div className="relative flex-grow max-w-md">
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border rounded focus:ring-axanar-teal focus:border-axanar-teal"
                  placeholder="Search campaigns..." 
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
                  value={category || 'all'}
                  onChange={handleCategoryChange}
                >
                  <option value="all">All Categories</option>
                  <option value="Film & Video">Film & Video</option>
                  <option value="Merchandise">Merchandise</option>
                  <option value="Events">Events</option>
                  <option value="Production">Production</option>
                </select>
              </div>
            </div>
            
            {/* Campaigns Table */}
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Loading campaigns...</div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">{error}</div>
            ) : campaigns.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No campaigns found. Try adjusting your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('backers_count')}
                        >
                          Backers
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('current_amount')}
                        >
                          Raised
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center" 
                          onClick={() => handleSort('end_date')}
                        >
                          End Date
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign) => {
                      // Calculate progress percentage
                      const progressPercent = campaign.goal_amount > 0 
                        ? Math.min(Math.round((campaign.current_amount / campaign.goal_amount) * 100), 100)
                        : 0;
                        
                      // Format dates
                      const endDate = new Date(campaign.end_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                      
                      // Calculate days remaining
                      const today = new Date();
                      const end = new Date(campaign.end_date);
                      const daysLeft = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                      
                      return (
                        <tr key={campaign.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-100">
                                {campaign.image_url ? (
                                  <img 
                                    src={campaign.image_url} 
                                    alt={campaign.title} 
                                    className="h-10 w-10 object-cover" 
                                  />
                                ) : (
                                  <BarChart3 className="h-10 w-10 p-2 text-gray-500" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                                <div className="text-xs text-gray-500">{campaign.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {campaign.backers_count.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            ${campaign.current_amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${campaign.goal_amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {endDate} 
                            {daysLeft > 0 && <span className="ml-1 text-xs text-gray-400">({daysLeft} days left)</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleEditCampaign(campaign)}
                              className="text-axanar-teal hover:text-axanar-teal/80 mr-3"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleShowDeleteModal(campaign)}
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
            {!isLoading && campaigns.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, totalCampaigns)}</span> of <span className="font-medium">{totalCampaigns}</span> campaigns
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
        
        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Campaign Performance</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Top Performing Campaign</h4>
                <div className="text-base font-medium">
                  {campaigns.length > 0 ? campaigns.sort((a, b) => b.current_amount - a.current_amount)[0]?.title : 'N/A'}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {campaigns.length > 0 ? `$${campaigns.sort((a, b) => b.current_amount - a.current_amount)[0]?.current_amount.toLocaleString()} raised` : ''}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Campaign Success Rate</h4>
                <div className="text-base font-medium">
                  {campaigns.length > 0 ? 
                    `${Math.round((campaigns.filter(c => c.current_amount >= c.goal_amount).length / campaigns.length) * 100)}%` : 
                    'N/A'}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Average Funding</h4>
                <div className="text-base font-medium">
                  {campaigns.length > 0 ? 
                    `${Math.round((campaigns.reduce((acc, c) => acc + (c.current_amount / c.goal_amount) * 100, 0) / campaigns.length))}%` : 
                    'N/A'}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  of goal on average
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
                Create New Campaign
              </button>
              
              <button className="w-full py-2 px-3 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Campaign Data
              </button>
              
              <button className="w-full py-2 px-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Campaign Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Campaigns:</span>
                <span className="font-semibold">
                  {campaigns.filter(c => c.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Draft Campaigns:</span>
                <span className="font-semibold">
                  {campaigns.filter(c => c.status === 'draft').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Campaigns:</span>
                <span className="font-semibold">
                  {campaigns.filter(c => c.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Raised:</span>
                <span className="font-semibold">
                  ${campaigns.reduce((sum, c) => sum + c.current_amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t">
                <div className="text-sm text-gray-500 mb-1">Campaign Goal Progress (All Active)</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-axanar-teal h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(
                        100, 
                        Math.round(
                          (campaigns
                            .filter(c => c.status === 'active')
                            .reduce((sum, c) => sum + c.current_amount, 0) / 
                            campaigns
                            .filter(c => c.status === 'active')
                            .reduce((sum, c) => sum + c.goal_amount, 0)) * 100
                        )
                      )}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create/Edit Campaign Modal */}
      {(isEditModalOpen || isNewModalOpen) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditModalOpen ? 'Edit Campaign' : 'Create New Campaign'}
              </h2>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsNewModalOpen(false);
                  setSelectedCampaign(null);
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
            
            <CampaignForm
              campaign={selectedCampaign || undefined}
              onSubmit={handleCampaignFormSubmit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setIsNewModalOpen(false);
                setSelectedCampaign(null);
                setActionError(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the campaign <span className="font-semibold">{selectedCampaign.title}</span>?
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
                  setSelectedCampaign(null);
                  setActionError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
