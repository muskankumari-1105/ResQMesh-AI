import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DisclaimerBanner({ disclaimerText }) {
  return (
    <div className="disclaimer-banner">
      <div className="disclaimer-content">
        <div className="disclaimer-left">
          <span className="disclaimer-tag">PROTOTYPE SIMULATION</span>
          <AlertCircle size={15} />
          <span>
            {disclaimerText || 'ResQMesh AI is an intelligent disaster-response simulation built for Build With Bharat 5.0. No real emergency services (112 / 911) are contacted.'}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
          Safe Demo Sandbox Active
        </div>
      </div>
    </div>
  );
}
