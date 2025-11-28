import React from "react";
import ContributionHistory from "../ContributionHistory";
import { SupportContact } from "@/components/SupportContact";

interface ActivitySectionProps {
  profile: any;
  pledges: any[];
  campaigns: any[];
  achievements: any[];
  recruitmentData: any[];
}

const ActivitySection: React.FC<ActivitySectionProps> = ({
  pledges,
}) => {

  return (
    <div className="space-y-6">
      {/* Detailed Contribution History */}
      <ContributionHistory pledges={pledges} />
      
      <SupportContact />
    </div>
  );
};

export default ActivitySection;