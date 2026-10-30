import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Truck, 
  MapPin, 
  Phone, 
  PlusCircle, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function TeamManager({ 
  teams = [], 
  incidents = [], 
  onRegisterClick, 
  onStatusChange, 
  onDispatchTeam, 
  onRecallTeam 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filtered teams
  const filteredTeams = teams.filter(team => {
    if (statusFilter !== 'all' && team.status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (typeFilter !== 'all' && team.teamType?.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = team.name.toLowerCase().includes(q);
      const matchType = team.teamType.toLowerCase().includes(q);
      const matchGear = team.equipment?.some(eq => eq.toLowerCase().includes(q));
      const matchBase = team.baseLocation?.toLowerCase().includes(q);
      return matchName || matchType || matchGear || matchBase;
    }
    return true;
  });

  const availableCount = teams.filter(t => t.status === 'Available').length;
  const dispatchedCount = teams.filter(t => t.status === 'Dispatched' || t.status === 'On-Site').length;

  // Unassigned incidents for quick assignment
  const unassignedIncidents = incidents.filter(i => !i.assignedTeamId && i.status !== 'Resolved');

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Available':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Dispatched':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'On-Site':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.15)', text: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Fleet Controls Bar */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Left: Title & Quick Metrics */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={20} color="#c084fc" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Rescue Fleet & Resource Logistics</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Total Units: <strong>{teams.length}</strong></span>
            <span>•</span>
            <span style={{ color: '#34d399' }}>Available: <strong>{availableCount}</strong></span>
            <span>•</span>
            <span style={{ color: '#fbbf24' }}>Deployed: <strong>{dispatchedCount}</strong></span>
          </div>
        </div>

        {/* Right: Search, Filter & Register CTA */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.35rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-subtle)',
            minWidth: '180px'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search gear or units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.8rem', outline: 'none', width: '100%' }}
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available Only</option>
            <option value="Dispatched">Dispatched Only</option>
            <option value="On-Site">On-Site Only</option>
            <option value="Resting / Off-Duty">Off-Duty</option>
          </select>

          {/* Register Unit CTA */}
          <button className="btn btn-primary btn-sm" onClick={onRegisterClick}>
            <PlusCircle size={15} />
            <span>Register Unit</span>
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '0.75rem',
          border: '1px dashed var(--border-subtle)',
          color: 'var(--text-muted)'
        }}>
          <AlertTriangle size={36} style={{ margin: '0 auto 0.75rem' }} />
          <h4>No matching rescue units found</h4>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Try broadening your search or register a new unit.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {filteredTeams.map((team) => {
            const badgeStyle = getStatusBadgeStyle(team.status);

            return (
              <div
                key={team.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.875rem'
                }}
              >
                <div>
                  {/* Top Bar: Status & Crew */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '0.25rem',
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.text,
                        border: `1px solid ${badgeStyle.border}`
                      }}>
                        {team.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <Users size={14} color="#38bdf8" />
                      <span><strong>{team.membersCount}</strong> Crew</span>
                    </div>
                  </div>

                  {/* Team Name & Type */}
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    {team.name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 500, marginBottom: '0.75rem' }}>
                    {team.teamType}
                  </div>

                  {/* Metadata: Location & Contact */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={13} color="#94a3b8" />
                      <span>{team.baseLocation}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={13} color="#94a3b8" />
                      <span>{team.contactNumber}</span>
                    </div>
                  </div>

                  {/* Equipment Badges */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                      Operational Gear
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {team.equipment?.map((gear, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: 'var(--bg-subtle)',
                            color: '#e2e8f0',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '0.25rem',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          {gear}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Active Incident Assignment Box */}
                  {team.activeIncident ? (
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '0.5rem',
                      padding: '0.625rem 0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase' }}>
                          MISSION IN PROGRESS
                        </span>
                        <span className="badge badge-critical" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                          {team.activeIncident.severity}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', marginBottom: '0.2rem' }}>
                        {team.activeIncident.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                        📍 {team.activeIncident.location?.address}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#34d399',
                      marginBottom: '0.5rem'
                    }}>
                      ✓ Available on standby for emergency deployment
                    </div>
                  )}

                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                    [DEMO DATA - BUILD WITH BHARAT 5.0]
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}>
                  {/* Status Dropdown Changer */}
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    value={team.status}
                    onChange={(e) => onStatusChange(team.id, e.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="On-Site">On-Site</option>
                    <option value="Resting / Off-Duty">Off-Duty</option>
                  </select>

                  {/* Recall or Quick Dispatch Action */}
                  {team.activeIncident ? (
                    <button
                      className="btn btn-sm btn-danger-outline"
                      onClick={() => onRecallTeam(team.activeIncident.id)}
                      title="Recall team back to base"
                    >
                      <RotateCcw size={13} />
                      <span>Recall Unit</span>
                    </button>
                  ) : (
                    unassignedIncidents.length > 0 && (
                      <select
                        className="form-select"
                        style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--medium-bg)', color: '#93c5fd', borderColor: 'var(--medium-border)' }}
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            onDispatchTeam(e.target.value, team.id);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="" disabled>⚡ Quick Deploy To...</option>
                        {unassignedIncidents.map(inc => (
                          <option key={inc.id} value={inc.id}>
                            {inc.title.slice(0, 24)}... ({inc.severity})
                          </option>
                        ))}
                      </select>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
