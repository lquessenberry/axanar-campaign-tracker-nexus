import React, { useState, useEffect } from 'react';
import { Pledge } from '@/api/pledges';
import { fetchCampaigns, Campaign } from '@/api/campaigns';
import { supabase } from '@/integrations/supabase/client';

interface PledgeFormProps {
  pledge?: Pledge;
  onSubmit: (formData: Partial<Pledge>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface Donor {
  id: string;
  full_name: string;
  email: string;
}

interface Reward {
  id: string;
  name: string;
  minimum_amount: number;
  description?: string;
  campaign_id: string;
}

const defaultPledge: Partial<Pledge> = {
  donor_id: '',
  campaign_id: '',
  reward_id: null,
  amount: 0,
  status: 'pending',
  transaction_id: null,
  provider: 'manual',
  notes: '',
};

export default function PledgeForm({ pledge, onSubmit, onCancel, isSubmitting }: PledgeFormProps) {
  const [formData, setFormData] = useState<Partial<Pledge>>(pledge || defaultPledge);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Options for selects
  const [donors, setDonors] = useState<Donor[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  
  // Loading states
  const [isLoadingDonors, setIsLoadingDonors] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  
  useEffect(() => {
    if (pledge) {
      setFormData(pledge);
    } else {
      setFormData(defaultPledge);
    }
  }, [pledge]);
  
  // Load donors for the select dropdown
  useEffect(() => {
    const loadDonors = async () => {
      setIsLoadingDonors(true);
      try {
        const { data, error } = await supabase
          .from('donors')
          .select('id, full_name, first_name, last_name, email')
          .order('full_name', { ascending: true });
        
        if (error) throw error;
        
        const formattedDonors = data.map((donor) => ({
          id: donor.id,
          full_name: donor.full_name || `${donor.first_name || ''} ${donor.last_name || ''}`.trim() || donor.email,
          email: donor.email
        }));
        
        setDonors(formattedDonors);
      } catch (err) {
        console.error('Error loading donors:', err);
      } finally {
        setIsLoadingDonors(false);
      }
    };
    
    loadDonors();
  }, []);
  
  // Load campaigns for the select dropdown
  useEffect(() => {
    const loadCampaigns = async () => {
      setIsLoadingCampaigns(true);
      try {
        const result = await fetchCampaigns({
          page: 1,
          pageSize: 100, // Assuming there won't be too many campaigns
          sortBy: 'created_at',
          sortOrder: 'desc'
        });
        
        setCampaigns(result.campaigns);
      } catch (err) {
        console.error('Error loading campaigns:', err);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };
    
    loadCampaigns();
  }, []);
  
  // Load all rewards
  useEffect(() => {
    const loadRewards = async () => {
      setIsLoadingRewards(true);
      try {
        const { data, error } = await supabase
          .from('rewards')
          .select('id, name, description, minimum_amount, campaign_id');
        
        if (error) throw error;
        setRewards(data || []);
      } catch (err) {
        console.error('Error loading rewards:', err);
      } finally {
        setIsLoadingRewards(false);
      }
    };
    
    loadRewards();
  }, []);
  
  // Filter rewards based on selected campaign
  useEffect(() => {
    if (formData.campaign_id) {
      const filtered = rewards.filter(reward => reward.campaign_id === formData.campaign_id);
      setFilteredRewards(filtered);
      
      // If current reward isn't in the filtered list, reset it
      if (formData.reward_id && !filtered.some(r => r.id === formData.reward_id)) {
        setFormData(prev => ({ ...prev, reward_id: null }));
      }
    } else {
      setFilteredRewards([]);
    }
  }, [formData.campaign_id, rewards, formData.reward_id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;

    // Parse number inputs
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue as typeof prev[keyof typeof prev]
    }));

    // Clear error for this field if any
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Special handling when campaign changes - set default reward based on amount
    if (name === 'campaign_id') {
      setFormData(prev => ({ ...prev, reward_id: null }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.donor_id) newErrors.donor_id = 'Donor is required';
    if (!formData.campaign_id) newErrors.campaign_id = 'Campaign is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';

    // If a reward is selected, ensure the amount meets the minimum
    if (formData.reward_id) {
      const selectedReward = filteredRewards.find(r => r.id === formData.reward_id);
      if (selectedReward && formData.amount < selectedReward.minimum_amount) {
        newErrors.amount = `Amount must be at least $${selectedReward.minimum_amount} for the selected reward`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  // Helper to find selected campaign
  const selectedCampaign = formData.campaign_id 
    ? campaigns.find(c => c.id === formData.campaign_id) 
    : undefined;
    
  // Helper to find selected reward
  const selectedReward = formData.reward_id 
    ? filteredRewards.find(r => r.id === formData.reward_id) 
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Donor selection */}
        <div>
          <label htmlFor="donor_id" className="block text-sm font-medium text-gray-700">Donor*</label>
          <select
            id="donor_id"
            name="donor_id"
            value={formData.donor_id || ''}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm ${errors.donor_id ? 'border-red-500' : ''}`}
            disabled={isSubmitting || isLoadingDonors}
          >
            <option value="">Select a donor</option>
            {donors.map(donor => (
              <option key={donor.id} value={donor.id}>
                {donor.full_name} ({donor.email})
              </option>
            ))}
          </select>
          {errors.donor_id && <p className="mt-1 text-sm text-red-600">{errors.donor_id}</p>}
          {isLoadingDonors && <p className="mt-1 text-sm text-gray-500">Loading donors...</p>}
        </div>

        {/* Campaign selection */}
        <div>
          <label htmlFor="campaign_id" className="block text-sm font-medium text-gray-700">Campaign*</label>
          <select
            id="campaign_id"
            name="campaign_id"
            value={formData.campaign_id || ''}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm ${errors.campaign_id ? 'border-red-500' : ''}`}
            disabled={isSubmitting || isLoadingCampaigns}
          >
            <option value="">Select a campaign</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>
          {errors.campaign_id && <p className="mt-1 text-sm text-red-600">{errors.campaign_id}</p>}
          {isLoadingCampaigns && <p className="mt-1 text-sm text-gray-500">Loading campaigns...</p>}
          
          {selectedCampaign && (
            <p className="mt-1 text-sm text-gray-500">
              Goal: ${selectedCampaign.goal_amount?.toLocaleString()}
              {selectedCampaign.status !== 'active' && ` • Status: ${selectedCampaign.status}`}
            </p>
          )}
        </div>
        
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Pledge Amount*</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm ${errors.amount ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>
        
        {/* Reward selection */}
        <div>
          <label htmlFor="reward_id" className="block text-sm font-medium text-gray-700">Reward</label>
          <select
            id="reward_id"
            name="reward_id"
            value={formData.reward_id || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm"
            disabled={isSubmitting || isLoadingRewards || !formData.campaign_id}
          >
            <option value="">No reward selected</option>
            {filteredRewards.map(reward => (
              <option 
                key={reward.id} 
                value={reward.id}
                disabled={formData.amount < reward.minimum_amount}
              >
                {reward.name} (${reward.minimum_amount} min.)
              </option>
            ))}
          </select>
          {!formData.campaign_id && <p className="mt-1 text-sm text-gray-500">Select a campaign to see available rewards</p>}
          {isLoadingRewards && <p className="mt-1 text-sm text-gray-500">Loading rewards...</p>}
          {formData.campaign_id && filteredRewards.length === 0 && !isLoadingRewards && (
            <p className="mt-1 text-sm text-gray-500">No rewards available for this campaign</p>
          )}
          
          {selectedReward && (
            <p className="mt-1 text-sm text-gray-500">
              {selectedReward.description?.substring(0, 100)}{selectedReward.description?.length > 100 ? '...' : ''}
            </p>
          )}
        </div>
        
        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status || 'pending'}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm"
            disabled={isSubmitting}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        
        {/* Provider */}
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700">Provider</label>
          <input
            type="text"
            id="provider"
            name="provider"
            value={formData.provider || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm"
            disabled={isSubmitting}
            placeholder="e.g. indiegogo, kickstarter, manual"
          />
        </div>
        
        {/* Transaction ID */}
        <div>
          <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700">Transaction ID</label>
          <input
            type="text"
            id="transaction_id"
            name="transaction_id"
            value={formData.transaction_id || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm"
            disabled={isSubmitting}
            placeholder="External transaction reference"
          />
        </div>
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm"
            disabled={isSubmitting}
            placeholder="Additional notes about this pledge"
          />
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-5 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-axanar-teal"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-axanar-teal hover:bg-axanar-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-axanar-teal"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : pledge ? 'Update Pledge' : 'Create Pledge'}
        </button>
      </div>
    </form>
  );
}
