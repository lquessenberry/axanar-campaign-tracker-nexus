import React from 'react';
import AlgorithmVisualizer from '@/components/admin/AlgorithmVisualizer';
import AdminLayout from './AdminLayout';

export default function SystemDiagrams() {
  return (
    <AdminLayout title="System Architecture Diagrams">
      <p className="mb-6 text-gray-700">
        The following diagrams illustrate the architecture and workflows of the Axanar Campaign Tracker admin system.
        Click on the different buttons to view various aspects of the system design.
      </p>
      
      <AlgorithmVisualizer />
      
      <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-200">
        <h2 className="text-xl font-semibold mb-2">About These Diagrams</h2>
        <p>
          These diagrams are generated using Mermaid.js and reflect the current design of the Axanar admin system.
          They show how data flows through the application and how different components interact with each other.
        </p>
        <p className="mt-2">
          The diagrams are particularly useful for understanding how the Supabase backend integrates with the React frontend,
          and how the various SQL views (vw_donor_details, vw_campaign_performance, etc.) are utilized.
        </p>
      </div>
    </AdminLayout>
  );
}
