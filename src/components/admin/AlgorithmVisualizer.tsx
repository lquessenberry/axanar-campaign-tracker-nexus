import React, { useState } from 'react';
import MermaidDiagram from '@/components/ui/MermaidDiagram';

// Predefined algorithms related to Axanar donor/pledge management
const algorithms = {
  donorManagement: `
    flowchart TD
      A[Start] --> B{Donor exists?}
      B -->|Yes| C[Fetch from vw_donor_details]
      B -->|No| D[Create New Donor]
      C --> E[Update Donor Profile]
      D --> F{Link to Auth User?}
      F -->|Yes| G[Create Auth User]
      F -->|No| H[Skip Auth Link]
      G --> I[Update donor_profiles.auth_user_id]
      H --> J[End]
      I --> J
      E --> J
  `,
  
  pledgeProcessing: `
    flowchart TD
      A[Start] --> B[Fetch Pledge Data]
      B --> C{Valid Campaign?}
      C -->|No| D[Reject Pledge]
      C -->|Yes| E{Valid Donor?}
      E -->|No| F[Create Donor Profile]
      E -->|Yes| G[Process Pledge]
      F --> G
      G --> H[Update vw_campaign_performance]
      H --> I[Update vw_reward_distribution]
      I --> J[End]
      D --> J
  `,
  
  userAuthentication: `
    flowchart TD
      A[Login Request] --> B{Valid Credentials?}
      B -->|No| C[Auth Failed]
      B -->|Yes| D[Generate JWT]
      D --> E{Check User Role}
      E -->|Admin| F[Admin Dashboard]
      E -->|Super Admin| G[Super Admin Dashboard]
      E -->|Donor| H[Donor Dashboard]
      F --> I[End]
      G --> I
      H --> I
      C --> I
  `,

  donorDataStructure: `
    erDiagram
      DONORS ||--o{ PLEDGES : makes
      DONORS ||--o{ ADDRESSES : has
      CAMPAIGNS ||--o{ PLEDGES : contains
      CAMPAIGNS ||--o{ REWARDS : offers
      PLEDGES }o--|| REWARDS : includes
      AUTH_USERS ||--o| DONORS : linked_to
      
      DONORS {
        uuid id PK
        string email
        string first_name
        string last_name
        string full_name
        uuid auth_user_id FK
        timestamp created_at
      }
      
      PLEDGES {
        uuid id PK
        uuid donor_id FK
        uuid campaign_id FK
        uuid reward_id FK
        float amount
        string status
        timestamp created_at
      }
  `,

  adminApiArchitecture: `
    flowchart TD
      subgraph Frontend
        A[Admin Dashboard] --> B[Auth Module]
        A --> C[Donor Management]
        A --> D[Campaign Management]
        A --> E[Pledge Management]
      end
      
      subgraph API Layer
        B --> G[Supabase Auth Client]
        C --> H[Donor API]
        D --> I[Campaign API]
        E --> J[Pledge API]
      end
      
      subgraph Data Access
        G --> L[supabase.auth]
        H --> M[vw_donor_details]
        I --> N[vw_campaign_performance]
        J --> O[vw_donor_pledge_summary]
      end
  `
};

export const AlgorithmVisualizer: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('adminApiArchitecture');
  
  return (
    <div className="algorithm-visualizer p-4">
      <h1 className="text-2xl font-bold mb-4">Axanar Admin System Architecture</h1>
      
      <div className="algorithm-selector flex space-x-2 mb-6">
        <button 
          onClick={() => setSelectedAlgorithm('adminApiArchitecture')}
          className={`px-3 py-2 rounded ${selectedAlgorithm === 'adminApiArchitecture' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          System Architecture
        </button>
        <button 
          onClick={() => setSelectedAlgorithm('donorDataStructure')}
          className={`px-3 py-2 rounded ${selectedAlgorithm === 'donorDataStructure' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Data Structure
        </button>
        <button 
          onClick={() => setSelectedAlgorithm('donorManagement')}
          className={`px-3 py-2 rounded ${selectedAlgorithm === 'donorManagement' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Donor Management
        </button>
        <button 
          onClick={() => setSelectedAlgorithm('pledgeProcessing')}
          className={`px-3 py-2 rounded ${selectedAlgorithm === 'pledgeProcessing' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Pledge Processing
        </button>
        <button 
          onClick={() => setSelectedAlgorithm('userAuthentication')}
          className={`px-3 py-2 rounded ${selectedAlgorithm === 'userAuthentication' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          User Authentication
        </button>
      </div>
      
      <div className="algorithm-diagram p-4 border rounded bg-white">
        <MermaidDiagram chart={algorithms[selectedAlgorithm]} />
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>These diagrams represent the Axanar Campaign Tracker admin system architecture and workflows.</p>
        <p>The system leverages Supabase views like vw_donor_details, vw_campaign_performance, and vw_donor_pledge_summary.</p>
      </div>
    </div>
  );
};

export default AlgorithmVisualizer;
