import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Map as MapIcon, 
  ListFilter, 
  Layers, 
  AlertTriangle, 
  Truck, 
  Users, 
  MapPin, 
  Sparkles,
  WifiOff,
  Compass
} from 'lucide-react';

export default function MapView({ incidents = [], teams = [], onOpenDispatchModal }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [viewMode, setViewMode] = useState('map'); // 'map' | 'fallback'
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [tileError, setTileError] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Filter incidents for display
  const filteredIncidents = incidents.filter(inc => {
    if (filterSeverity === 'all') return true;
    return inc.severity?.toLowerCase() === filterSeverity.toLowerCase();
  });

  // Create custom HTML DivIcon for Leaflet based on severity
  const createCustomIcon = (incident) => {
    let pinClass = 'pin-medium';
    if (incident.severity === 'Critical') pinClass = 'pin-critical';
    else if (incident.severity === 'High') pinClass = 'pin-high';
    else if (incident.severity === 'Low') pinClass = 'pin-low';

    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="marker-pin ${pinClass}" title="${incident.title}">
          <span class="marker-pin-inner">${incident.priorityScore || '!'}</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    // If map does not exist, initialize it
    if (!mapInstanceRef.current) {
      const defaultCenter = [26.18, 91.75]; // Guwahati / Assam coordinates
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: true
      });

      // Standard free OpenStreetMap tile layer
      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 4
      });

      tiles.on('tileerror', () => {
        setTileError(true);
      });

      tiles.addTo(map);

      // Layer group for dynamic markers
      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;
    }

    // Render Markers
    if (markersLayerRef.current && mapInstanceRef.current) {
      markersLayerRef.current.clearLayers();

      const validLatLngs = [];

      filteredIncidents.forEach((inc) => {
        const lat = inc.location?.lat || 26.18;
        const lng = inc.location?.lng || 91.75;
        validLatLngs.push([lat, lng]);

        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(inc)
        });

        // Popup HTML content
        const assignedTeam = teams.find(t => t.id === inc.assignedTeamId);
        const popupHtml = `
          <div style="padding: 1rem; width: 280px; font-family: sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
              <span style="font-size: 0.7rem; font-weight: 700; color: ${inc.severity === 'Critical' ? '#ef4444' : inc.severity === 'High' ? '#f59e0b' : '#38bdf8'}; text-transform: uppercase;">
                ${inc.severity} SEVERITY
              </span>
              <span style="font-size: 0.72rem; font-weight: 800; color: #38bdf8; font-family: monospace;">
                Priority: ${inc.priorityScore}/100
              </span>
            </div>
            <div style="font-size: 0.95rem; font-weight: 700; color: white; margin-bottom: 0.35rem; line-height: 1.3;">
              ${inc.title}
            </div>
            <div style="font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.5rem;">
              📍 ${inc.location?.address || 'Disaster Zone'}
            </div>
            <div style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.75rem;">
              👥 <strong>${inc.peopleAffected}</strong> people impacted<br>
              🚒 Status: <strong>${inc.status}</strong>
            </div>
            <div style="font-size: 0.72rem; color: #fbbf24; background: rgba(245, 158, 11, 0.1); padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.75rem;">
              ${assignedTeam ? `Assigned: ${assignedTeam.name}` : 'No team assigned yet'}
            </div>
            <div style="font-size: 0.65rem; color: #64748b; margin-bottom: 0.75rem;">
              [DEMO SIMULATION DATA - BUILD WITH BHARAT 5.0]
            </div>
            <button
              id="dispatch-btn-${inc.id}"
              style="width: 100%; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; border-radius: 0.375rem; padding: 0.45rem; font-size: 0.78rem; font-weight: 700; cursor: pointer;"
            >
              Dispatch Rescue Team
            </button>
          </div>
        `;

        marker.bindPopup(popupHtml);

        // Attach DOM listener for dispatch button when popup opens
        marker.on('popupopen', () => {
          setSelectedIncident(inc);
          setTimeout(() => {
            const btn = document.getElementById(`dispatch-btn-${inc.id}`);
            if (btn) {
              btn.onclick = () => {
                onOpenDispatchModal(inc);
              };
            }
          }, 50);
        });

        markersLayerRef.current.addLayer(marker);
      });

      // Fit map to markers if we have any
      if (validLatLngs.length > 0) {
        try {
          const bounds = L.latLngBounds(validLatLngs);
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        } catch (e) {
          console.warn('Map fitBounds notice:', e);
        }
      }
    }

    return () => {
      // Map cleanup occurs on unmount
    };
  }, [viewMode, filteredIncidents.length, filterSeverity, teams]);

  // Clean cleanup on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Controls Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        backgroundColor: 'var(--bg-card)',
        padding: '0.875rem 1.25rem',
        borderRadius: '0.75rem',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem' }}>
            <Compass size={18} color="#38bdf8" />
            <span>Spatial Incident Heatmap</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '0.25rem' }}>
            {filteredIncidents.length} Active Geo-Pins
          </span>
        </div>

        {/* Filters and Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Filter Pins:</span>
          </div>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical Only</option>
            <option value="high">🟠 High Only</option>
            <option value="medium">🔵 Medium Only</option>
            <option value="low">🟢 Low Only</option>
          </select>

          {/* Toggle View Mode */}
          <button
            className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode(viewMode === 'map' ? 'fallback' : 'map')}
            title="Toggle between Leaflet Map and Spatial List Fallback"
          >
            {viewMode === 'map' ? (
              <>
                <ListFilter size={14} />
                <span>Switch to Spatial List Fallback</span>
              </>
            ) : (
              <>
                <MapIcon size={14} />
                <span>Return to Interactive Map</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Offline / Tile Error Banner */}
      {tileError && viewMode === 'map' && (
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fbbf24',
          fontSize: '0.825rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <WifiOff size={16} />
            <span>Map tile service is unreachable or network is restricted. The interactive map is operating with fallback layers.</span>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setViewMode('fallback')}
            style={{ fontSize: '0.75rem' }}
          >
            View Spatial Fallback Grid
          </button>
        </div>
      )}

      {/* View 1: Interactive Leaflet Map */}
      {viewMode === 'map' && (
        <div className="map-wrapper">
          <div ref={mapContainerRef} className="leaflet-map-element" />

          {/* Map Legend Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '1.25rem',
            zIndex: 400,
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            fontSize: '0.75rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontWeight: 700, marginBottom: '0.375rem', color: '#e2e8f0' }}>Marker Legend</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span>
                <span>Critical Priority (Life Threat)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span>
                <span>High Priority</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></span>
                <span>Medium Priority</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></span>
                <span>Low Priority / Routine</span>
              </div>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.5rem', borderTop: '1px solid #1f2937', paddingTop: '0.25rem' }}>
              Tiles: OpenStreetMap (No API key needed)
            </div>
          </div>
        </div>
      )}

      {/* View 2: Resilient Spatial List Fallback */}
      {viewMode === 'fallback' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Spatial Coordinate & Dispatch Fallback Grid</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Offline-ready incident coordinates and direct team allocation
              </p>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
              LOW-BANDWIDTH MODE ACTIVE
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {filteredIncidents.map((incident) => {
              const assignedTeam = teams.find(t => t.id === incident.assignedTeamId);

              return (
                <div
                  key={incident.id}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span className={`badge ${incident.severity === 'Critical' ? 'badge-critical' : incident.severity === 'High' ? 'badge-high' : 'badge-medium'}`}>
                        {incident.severity}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                        Score: {incident.priorityScore}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      {incident.title}
                    </h4>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                      <MapPin size={13} color="#38bdf8" />
                      <span>{incident.location?.address}</span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
                      Coordinates: {incident.location?.lat}°N, {incident.location?.lng}°E
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      👥 Impact: <strong>{incident.peopleAffected}</strong> people | Status: <strong>{incident.status}</strong>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.35rem' }}>
                      [DEMO SIMULATION DATA - BUILD WITH BHARAT 5.0]
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: assignedTeam ? '#34d399' : 'var(--text-muted)' }}>
                      {assignedTeam ? `Unit: ${assignedTeam.name}` : 'Unassigned'}
                    </span>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onOpenDispatchModal(incident)}
                    >
                      <Truck size={13} />
                      <span>Dispatch</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
