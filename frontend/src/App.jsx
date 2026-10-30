import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import StatsBar from './components/StatsBar';
import IncidentFormModal from './components/IncidentFormModal';
import DispatchModal from './components/DispatchModal';
import TeamRegisterModal from './components/TeamRegisterModal';
import MapView from './components/MapView';
import TeamManager from './components/TeamManager';
import { api } from './services/api';
import { 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Sparkles, 
  Clock, 
  Search, 
  Filter,
  Layers,
  Map as MapIcon,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRegisterTeamModalOpen, setIsRegisterTeamModalOpen] = useState(false);
  const [dispatchTargetIncident, setDispatchTargetIncident] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'map' | 'teams'

  // Toast Helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Fetch initial dashboard data
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, incidentsData, teamsData] = await Promise.all([
        api.getStats(),
        api.getIncidents({
          status: statusFilter,
          severity: severityFilter,
          search: searchQuery
        }),
        api.getTeams()
      ]);

      setStats(statsData.stats);
      setSystemInfo(statsData.system);
      setIncidents(incidentsData.data);
      setTeams(teamsData.data);
    } catch (err) {
      console.error('Failed to connect to ResQMesh AI backend:', err);
      addToast('Cannot connect to backend server. Make sure the backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter, searchQuery]);

  // Handle reporting incident
  const handleCreateIncident = async (newIncidentData) => {
    const res = await api.createIncident(newIncidentData);
    addToast(`Incident "${res.data.title}" prioritized with score ${res.data.priorityScore}!`, 'success');
    await loadData();
  };

  // Handle status update for incident
  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await api.updateIncident(incidentId, { status: newStatus });
      addToast(`Incident status updated to "${newStatus}"`, 'success');
      await loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Handle Team Dispatch
  const handleDispatchTeam = async (incidentId, teamId) => {
    try {
      const res = await api.dispatchTeam(incidentId, teamId);
      addToast(res.message, 'success');
      await loadData();
    } catch (err) {
      addToast(`Dispatch failed: ${err.message}`, 'error');
      throw err;
    }
  };

  // Handle Team Recall
  const handleRecallTeam = async (incidentId) => {
    try {
      const res = await api.dispatchTeam(incidentId, null);
      addToast('Rescue team recalled successfully.', 'success');
      await loadData();
    } catch (err) {
      addToast(`Recall error: ${err.message}`, 'error');
    }
  };

  // Handle Register New Team
  const handleRegisterTeam = async (teamData) => {
    try {
      const res = await api.createTeam(teamData);
      addToast(`Rescue unit "${res.data.name}" registered into fleet!`, 'success');
      await loadData();
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // Handle Team Status Change
  const handleTeamStatusChange = async (teamId, newStatus) => {
    try {
      await api.updateTeamStatus(teamId, newStatus);
      addToast(`Unit status updated to "${newStatus}"`, 'success');
      await loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Handle Demo Reset
  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      await api.resetDemoData();
      addToast('Demo scenario data restored successfully!', 'success');
      await loadData();
    } catch (err) {
      addToast(`Failed to reset demo: ${err.message}`, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Safety Disclaimer Banner */}
      <DisclaimerBanner disclaimerText={systemInfo?.prototypeDisclaimer} />

      {/* Main Container */}
      <main className="main-content">
        {/* KPI Statistics */}
        <StatsBar stats={stats} systemInfo={systemInfo} />

        {/* Tab Navigation */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layers size={16} />
            <span>Active Incidents Command</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <MapIcon size={16} />
            <span>Interactive Geo Map</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <ShieldCheck size={16} />
            <span>Rescue Fleet Command ({teams.length})</span>
          </button>
        </div>

        {/* Tab 1: Incidents Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Filter & Search Bar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              backgroundColor: 'var(--bg-card)',
              padding: '0.875rem 1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--border-subtle)'
            }}>
              {/* Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px', minWidth: '200px' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search incidents, hazards, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    width: '100%',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Filter size={14} />
                  <span>Severity:</span>
                </div>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Status:</span>
                </div>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Reported">Reported</option>
                  <option value="Verified">Verified</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Incidents List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <div className="pulse-beacon" style={{ width: '14px', height: '14px', marginBottom: '0.75rem' }}></div>
                <p>Loading incident intelligence feed...</p>
              </div>
            ) : incidents.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '0.75rem',
                border: '1px dashed var(--border-subtle)'
              }}>
                <AlertCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>No matching incidents found</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Try clearing your filters or restore the demo disaster dataset.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={handleResetDemo}>
                  Restore Demo Incidents
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incidents.map((incident) => {
                  const assignedTeam = teams.find(t => t.id === incident.assignedTeamId);

                  return (
                    <div
                      key={incident.id}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.875rem'
                      }}
                    >
                      {/* Header Row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                          <span className={`badge ${getSeverityBadgeClass(incident.severity)}`}>
                            {incident.severity}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', padding: '0.15rem 0.5rem', borderRadius: '0.25rem' }}>
                            {incident.incidentType}
                          </span>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{incident.title}</h4>
                        </div>

                        {/* Priority Score Meter & Dispatch Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Priority Score
                            </div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: incident.priorityScore >= 80 ? '#ef4444' : incident.priorityScore >= 65 ? '#f59e0b' : '#38bdf8' }}>
                              {incident.priorityScore} / 100
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setDispatchTargetIncident(incident)}
                            title="Dispatch rescue team to this incident"
                          >
                            <Truck size={14} />
                            <span>{assignedTeam ? 'Reassign' : 'Dispatch'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p style={{ fontSize: '0.875rem', color: '#d1d5db', lineHeight: 1.5 }}>
                        {incident.description}
                      </p>

                      {/* Meta Row: Location, People, Status */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <MapPin size={14} color="#38bdf8" />
                            <span>{incident.location?.address || 'Disaster Zone'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Users size={14} color="#fbbf24" />
                            <span><strong>{incident.peopleAffected}</strong> people impacted</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Clock size={14} />
                            <span>{new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {assignedTeam && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#34d399' }}>
                              <Truck size={14} />
                              <span>Unit: <strong>{assignedTeam.name}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Status Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem' }}>Status:</span>
                          <select
                            className="form-select"
                            style={{
                              width: 'auto',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              backgroundColor: incident.status === 'Resolved' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-subtle)',
                              color: incident.status === 'Resolved' ? '#34d399' : 'white'
                            }}
                            value={incident.status}
                            onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                          >
                            <option value="Reported">Reported</option>
                            <option value="Verified">Verified</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                      </div>

                      {/* AI Tactical Recommendations */}
                      {incident.aiTriage && (
                        <div style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.7)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          borderRadius: '0.5rem',
                          padding: '0.75rem 1rem',
                          marginTop: '0.25rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>
                              <Sparkles size={13} />
                              <span>AI TRIAGE: {incident.aiTriage.urgencyLevel}</span>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                              Source: {incident.aiTriage.source}
                            </span>
                          </div>

                          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                            {incident.aiTriage.recommendations?.map((rec, idx) => (
                              <li key={idx} style={{ marginBottom: '0.2rem' }}>{rec}</li>
                            ))}
                          </ul>

                          {incident.aiTriage.suggestedTeamType && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                              <strong>Suggested Resource:</strong> {incident.aiTriage.suggestedTeamType}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Interactive Leaflet Map View */}
        {activeTab === 'map' && (
          <MapView
            incidents={incidents}
            teams={teams}
            onOpenDispatchModal={(incident) => setDispatchTargetIncident(incident)}
          />
        )}

        {/* Tab 3: Rescue Fleet Command Panel */}
        {activeTab === 'teams' && (
          <TeamManager
            teams={teams}
            incidents={incidents}
            onRegisterClick={() => setIsRegisterTeamModalOpen(true)}
            onStatusChange={handleTeamStatusChange}
            onDispatchTeam={handleDispatchTeam}
            onRecallTeam={handleRecallTeam}
          />
        )}
      </main>

      {/* Emergency Incident Report Modal */}
      <IncidentFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitIncident={handleCreateIncident}
      />

      {/* Team Dispatch Modal */}
      <DispatchModal
        isOpen={Boolean(dispatchTargetIncident)}
        onClose={() => setDispatchTargetIncident(null)}
        incident={dispatchTargetIncident}
        teams={teams}
        onDispatch={handleDispatchTeam}
      />

      {/* Team Register Modal */}
      <TeamRegisterModal
        isOpen={isRegisterTeamModalOpen}
        onClose={() => setIsRegisterTeamModalOpen(false)}
        onRegisterTeam={handleRegisterTeam}
      />

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={18} color="#ef4444" />
            ) : (
              <CheckCircle2 size={18} color="#10b981" />
            )}
            <span style={{ fontSize: '0.85rem' }}>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
