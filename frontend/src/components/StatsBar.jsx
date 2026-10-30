import React from 'react';
import { AlertTriangle, Flame, Users, HeartPulse, Cpu } from 'lucide-react';

export default function StatsBar({ stats, systemInfo }) {
  const isAiOnline = systemInfo?.aiEngine === 'gemini';

  return (
    <div className="stats-grid">
      {/* 1. Critical Incidents */}
      <div className="stat-card stat-critical">
        <div>
          <div className="stat-title">Critical Threats</div>
          <div className="stat-value" style={{ color: '#f87171' }}>
            {stats?.criticalCount ?? '—'}
          </div>
          <div className="stat-subtitle">Immediate life threats</div>
        </div>
        <div className="stat-icon">
          <Flame size={22} />
        </div>
      </div>

      {/* 2. Active Incidents */}
      <div className="stat-card stat-active">
        <div>
          <div className="stat-title">Active Incidents</div>
          <div className="stat-value" style={{ color: '#60a5fa' }}>
            {stats?.activeIncidentsCount ?? '—'}
          </div>
          <div className="stat-subtitle">
            {stats?.resolvedCount ? `${stats.resolvedCount} resolved` : 'Requiring attention'}
          </div>
        </div>
        <div className="stat-icon">
          <AlertTriangle size={22} />
        </div>
      </div>

      {/* 3. Dispatched Rescue Teams */}
      <div className="stat-card stat-teams">
        <div>
          <div className="stat-title">Deployed Units</div>
          <div className="stat-value" style={{ color: '#c084fc' }}>
            {stats?.dispatchedTeamsCount ?? '—'}
          </div>
          <div className="stat-subtitle">
            {stats?.availableTeamsCount ? `${stats.availableTeamsCount} available` : 'Units on mission'}
          </div>
        </div>
        <div className="stat-icon">
          <Users size={22} />
        </div>
      </div>

      {/* 4. Total People Affected */}
      <div className="stat-card stat-affected">
        <div>
          <div className="stat-title">People Impacted</div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {stats?.totalPeopleAffected?.toLocaleString() ?? '—'}
          </div>
          <div className="stat-subtitle">Estimated individuals</div>
        </div>
        <div className="stat-icon">
          <HeartPulse size={22} />
        </div>
      </div>

      {/* 5. AI Triage Engine Status */}
      <div className="stat-card ai-status-card">
        <div>
          <div className="stat-title">AI Triage Mode</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem' }}>
            {isAiOnline ? 'Gemini 1.5 Flash' : 'Rule-Based Fallback'}
          </div>
          <div className="stat-subtitle">
            {isAiOnline ? 'Connected to Google AI' : 'Deterministic zero-key engine'}
          </div>
        </div>
        <div className="stat-icon">
          <Cpu size={22} />
        </div>
      </div>
    </div>
  );
}
