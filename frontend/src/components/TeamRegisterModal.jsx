import React, { useState } from 'react';
import { X, ShieldPlus, Users, Truck, AlertCircle, Phone, MapPin } from 'lucide-react';

export default function TeamRegisterModal({ isOpen, onClose, onRegisterTeam }) {
  const [formData, setFormData] = useState({
    name: '',
    teamType: 'Urban Search & Rescue (USAR)',
    membersCount: 8,
    baseLocation: 'Central Disaster Response Depot',
    contactNumber: '+91 98765-02000',
    equipmentString: 'Hydraulic Cutters, Life Detectors, Shoring Timber'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Unit name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    }

    if (!formData.baseLocation.trim()) {
      newErrors.baseLocation = 'Base location is required';
    }

    const count = parseInt(formData.membersCount, 10);
    if (isNaN(count) || count < 1) {
      newErrors.membersCount = 'Must have at least 1 member';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const equipmentArray = formData.equipmentString
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await onRegisterTeam({
        name: formData.name.trim(),
        teamType: formData.teamType,
        membersCount: parseInt(formData.membersCount, 10),
        baseLocation: formData.baseLocation.trim(),
        contactNumber: formData.contactNumber.trim(),
        equipment: equipmentArray.length > 0 ? equipmentArray : ['Standard Response Kit']
      });

      onClose();
      // Reset
      setFormData({
        name: '',
        teamType: 'Urban Search & Rescue (USAR)',
        membersCount: 8,
        baseLocation: 'Central Disaster Response Depot',
        contactNumber: '+91 98765-02000',
        equipmentString: 'Hydraulic Cutters, Life Detectors, Shoring Timber'
      });
      setErrors({});
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.4rem', borderRadius: '0.375rem' }}>
              <ShieldPlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Register New Rescue Unit</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Add specialized disaster teams, volunteer squads, or drone fleets
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.form && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.825rem' }}>{errors.form}</span>
              </div>
            )}

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Rescue Unit / Battalion Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SDRF Emergency Water Unit - Bravo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            {/* Specialization & Crew Size */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Specialization Type</label>
                <select
                  className="form-select"
                  value={formData.teamType}
                  onChange={(e) => setFormData({ ...formData, teamType: e.target.value })}
                >
                  <option value="Urban Search & Rescue (USAR)">Urban Search & Rescue (USAR)</option>
                  <option value="Medical Triage & Evacuation">Medical Triage & Evacuation</option>
                  <option value="Flood & Swift Water Rescue">Flood & Swift Water Rescue</option>
                  <option value="Fire & Chemical Hazards">Fire & Chemical Hazards</option>
                  <option value="Drone Survey & Situational Intel">Drone Survey & Situational Intel</option>
                  <option value="General Disaster Relief & Logistics">General Relief & Logistics</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Active Crew Personnel *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.membersCount}
                  onChange={(e) => setFormData({ ...formData, membersCount: e.target.value })}
                />
                {errors.membersCount && <div className="form-error">{errors.membersCount}</div>}
              </div>
            </div>

            {/* Base Location & Phone */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Base Location / Depot *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. South Sector Command Pier"
                  value={formData.baseLocation}
                  onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value })}
                />
                {errors.baseLocation && <div className="form-error">{errors.baseLocation}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Comms / Contact</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 98765-02000"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Equipment Inventory */}
            <div className="form-group">
              <label className="form-label">Key Equipment & Capabilities (Comma-separated)</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="e.g. 2 Inflatable Dinghies, 10 PFDs, Outboard Motor, Portable Sonar"
                value={formData.equipmentString}
                onChange={(e) => setFormData({ ...formData, equipmentString: e.target.value })}
              ></textarea>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                Separate individual items with commas for equipment tag generation.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <ShieldPlus size={15} className={isSubmitting ? 'spin' : ''} />
              <span>{isSubmitting ? 'Registering...' : 'Register Rescue Unit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
