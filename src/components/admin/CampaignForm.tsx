import React, { useState, useEffect } from 'react';
import { Campaign } from '@/api/campaigns';

interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (formData: Partial<Campaign>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const defaultCampaign: Partial<Campaign> = {
  title: '',
  description: '',
  category: 'Film & Video',
  goal_amount: 0,
  current_amount: 0,
  backers_count: 0,
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  status: 'draft',
  image_url: '',
  web_url: '',
  provider: 'indiegogo',
  active: true,
};

const categories = [
  'Film & Video',
  'Merchandise',
  'Events',
  'Production',
  'Other'
];

export default function CampaignForm({ campaign, onSubmit, onCancel, isSubmitting }: CampaignFormProps) {
  const [formData, setFormData] = useState<Partial<Campaign>>(campaign || defaultCampaign);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (campaign) {
      setFormData(campaign);
    } else {
      setFormData(defaultCampaign);
    }
  }, [campaign]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;

    // Parse number inputs
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    }
    
    // Handle checkbox inputs if needed
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
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
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title?.trim()) newErrors.title = 'Campaign title is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.goal_amount || formData.goal_amount <= 0) newErrors.goal_amount = 'Goal must be greater than 0';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    
    // Date validation
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        newErrors.end_date = 'End date must be after start date';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Campaign title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Campaign Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm ${errors.title ? 'border-red-500' : ''}`}
              placeholder="e.g. Axanar Prelude to Axanar"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description*</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Campaign description..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category || 'Film & Video'}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="text"
              id="image_url"
              name="image_url"
              value={formData.image_url || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Web URL */}
          <div>
            <label htmlFor="web_url" className="block text-sm font-medium text-gray-700">Web URL</label>
            <input
              type="text"
              id="web_url"
              name="web_url"
              value={formData.web_url || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm"
              placeholder="https://indiegogo.com/projects/axanar"
            />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Goal amount */}
          <div>
            <label htmlFor="goal_amount" className="block text-sm font-medium text-gray-700">Goal Amount*</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="goal_amount"
                name="goal_amount"
                value={formData.goal_amount || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm ${errors.goal_amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
            </div>
            {errors.goal_amount && <p className="mt-1 text-sm text-red-600">{errors.goal_amount}</p>}
          </div>

          {/* Current amount - only editable for admin adjustment */}
          <div>
            <label htmlFor="current_amount" className="block text-sm font-medium text-gray-700">Current Amount</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="current_amount"
                name="current_amount"
                value={formData.current_amount || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start date */}
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date*</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm ${errors.start_date ? 'border-red-500' : ''}`}
              />
              {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
            </div>

            {/* End date */}
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date*</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm ${errors.end_date ? 'border-red-500' : ''}`}
              />
              {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status || 'draft'}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-axanar-teal focus:ring-axanar-teal sm:text-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
              placeholder="e.g. indiegogo, kickstarter"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center space-x-3 mt-6">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-axanar-teal focus:ring-axanar-teal border-gray-300 rounded"
            />
            <label htmlFor="active" className="block text-sm font-medium text-gray-700">
              Active (visible to users)
            </label>
          </div>
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
          {isSubmitting ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
        </button>
      </div>
    </form>
  );
}
