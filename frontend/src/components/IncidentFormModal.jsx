import React, { useState } from 'react';
import { X, Send, Sparkles, AlertCircle } from 'lucide-react';

export default function IncidentFormModal({ isOpen, onClose, onSubmitIncident }) {
  const [formData, setFormData] = useState({
    title: '',
    incidentType: 'Flood',
    severity: 'High',
    description: '',
    address: '',
    city: 'Guwahati',
    peopleAffected: 5
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Incident title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Detailed description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Please describe the emergency in at least 10 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Location address or landmark is required';
    }

    const people = parseInt(formData.peopleAffected, 10);
    if (isNaN(people) || people < 0) {
      newErrors.peopleAffected = 'Please enter a valid number (0 or more)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmitIncident({
        title: formData.title,
        incidentType: formData.incidentType,
        severity: formData.severity,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.city
        },
        peopleAffected: parseInt(formData.peopleAffected, 10)
      });
      onClose();
      // Reset form
      setFormData({
        title: '',
        incidentType: 'Flood',
        severity: 'High',
        description: '',
        address: '',
        city: 'Guwahati',
        peopleAffected: 5
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
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.4rem', borderRadius: '0.375rem' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Report Emergency Incident</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                AI will automatically analyze priority and suggest tactical response
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

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Incident Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Flash Flood Stranding Civilians on Roof"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            {/* Type & Severity */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Disaster / Hazard Type</label>
                <select
                  className="form-select"
                  value={formData.incidentType}
                  onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                >
                  <option value="Flood">Flood / Water Surge</option>
                  <option value="Building Collapse">Building Collapse / Debris</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Landslide">Landslide / Road Cutoff</option>
                  <option value="Hazard">Hazard (Electric / Gas / Chemical)</option>
                  <option value="Relief Supply">Relief Supply / Shelter Need</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reported Severity</label>
                <select
                  className="form-select"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <option value="Critical">🔴 Critical (Immediate Threat)</option>
                  <option value="High">🟠 High (Urgent Response)</option>
                  <option value="Medium">🔵 Medium (Elevated Concern)</option>
                  <option value="Low">🟢 Low (Routine Relief)</option>
                </select>
              </div>
            </div>

            {/* People Affected & City */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Estimated People Affected *</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.peopleAffected}
                  onChange={(e) => setFormData({ ...formData, peopleAffected: e.target.value })}
                />
                {errors.peopleAffected && <div className="form-error">{errors.peopleAffected}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Region / City</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">Location Address / Landmark *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ward 12, Near Brahmaputra Ghat, Riverside Road"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              {errors.address && <div className="form-error">{errors.address}</div>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Incident Description & Situation On-Ground *</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Describe what happened, any trapped victims, children, medical needs, or rising water..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                Tip: Mention factors like "trapped", "water rising", "elderly", or "oxygen" for high-precision AI prioritization.
              </div>
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Send size={15} className={isSubmitting ? 'spin' : ''} />
              <span>{isSubmitting ? 'Analyzing & Prioritizing...' : 'Submit Emergency Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
