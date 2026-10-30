import React, { useState } from 'react';
import { X, ShieldAlert, Truck, Check, AlertTriangle, Users } from 'lucide-react';

export default function DispatchModal({ isOpen, onClose, incident, teams, onDispatch }) {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !incident) return null;

  const availableTeams = teams.filter(t => t.status === 'Available');
  const currentAssignedTeam = teams.find(t => t.id === incident.assignedTeamId);

  const handleConfirmDispatch = async () => {
    if (!selectedTeamId && selectedTeamId !== null) return;
    try {
      setIsSubmitting(true);
      await onDispatch(incident.id, selectedTeamId || null);
      onClose();
    } catch (err) {
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', padding: '0.4rem', borderRadius: '0.375rem' }}>
              <Truck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Dispatch Rescue Team</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Allocate specialized emergency resources to active incident
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Target Incident Summary */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '0.5rem',
            padding: '0.875rem 1rem',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>
                TARGET: {incident.severity} SEVERITY
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                Priority Score: {incident.priorityScore}
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {incident.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Location: {incident.location?.address} | Impact: {incident.peopleAffected} people
            </div>
            {incident.aiTriage?.suggestedTeamType && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#a78bfa' }}>
                <strong>AI Recommendation:</strong> {incident.aiTriage.suggestedTeamType}
              </div>
            )}
          </div>

          {/* Currently Assigned Status */}
          {currentAssignedTeam && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>CURRENTLY ASSIGNED UNIT:</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{currentAssignedTeam.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentAssignedTeam.teamType}</div>
              </div>
              <button
                className="btn btn-sm btn-danger-outline"
                onClick={() => {
                  setSelectedTeamId(null);
                  handleConfirmDispatch();
                }}
                disabled={isSubmitting}
              >
                Unassign Unit
              </button>
            </div>
          )}

          {/* Available Teams Selector */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Select Available Rescue Unit to Deploy</label>
            {availableTeams.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '1.5rem',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '0.5rem',
                color: '#fbbf24',
                fontSize: '0.85rem'
              }}>
                <AlertTriangle size={20} style={{ margin: '0 auto 0.5rem' }} />
                All specialized units are currently deployed or off-duty.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                {availableTeams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    style={{
                      backgroundColor: selectedTeamId === team.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-subtle)',
                      border: `1px solid ${selectedTeamId === team.id ? 'var(--medium-blue)' : 'var(--border-subtle)'}`,
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{team.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>{team.teamType}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        Gear: {team.equipment?.join(', ')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {team.membersCount} crew
                      </span>
                      {selectedTeamId === team.id && (
                        <div style={{ backgroundColor: 'var(--medium-blue)', color: 'white', borderRadius: '50%', padding: '0.2rem' }}>
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirmDispatch}
            disabled={!selectedTeamId || isSubmitting}
          >
            <Truck size={15} className={isSubmitting ? 'spin' : ''} />
            <span>{isSubmitting ? 'Dispatching...' : 'Deploy Rescue Team'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
