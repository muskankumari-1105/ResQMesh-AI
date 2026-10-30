import React from 'react';
import { ShieldAlert, RotateCcw, PlusCircle, Activity } from 'lucide-react';

export default function Navbar({ onOpenReportModal, onResetDemo, isResetting }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="brand-section">
          <div className="brand-icon-wrapper">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">ResQMesh AI</span>
              <span className="pulse-beacon" title="Live System Active"></span>
            </div>
            <div className="brand-subtitle">
              <span>Disaster Response & Rescue Intelligence</span>
              <span className="hackathon-pill">Build With Bharat 5.0</span>
            </div>
          </div>
        </div>

        <div className="navbar-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset database to initial demo disaster scenario"
          >
            <RotateCcw size={15} className={isResetting ? 'spin' : ''} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={onOpenReportModal}
            title="Report a new emergency incident"
          >
            <PlusCircle size={16} />
            <span>Report Emergency</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
