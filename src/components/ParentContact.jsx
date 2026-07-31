import React, { useState } from 'react';
import { Select } from './shared.jsx';
import {
  PARENT_RELATIONS, isValidUzPhone, normalizePhone, phoneHref, hasParentContact,
} from '../lib/parent.js';

/* ============================================================
   Shared parent-contact form. The student fills it once; after
   that only a teacher or admin reaches it, through the same
   component with canEdit still true.
   ============================================================ */
export function ParentContactForm({ student, onSave, onCancel, submitLabel = 'Saqlash', note }) {
  const [name, setName] = useState(student.parentName || '');
  const [relation, setRelation] = useState(student.parentRelation || PARENT_RELATIONS[0]);
  const [phone, setPhone] = useState(student.parentPhone || '');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Ota-onaning ismini kiriting."); return; }
    if (!isValidUzPhone(phone)) { setError("Telefon raqami noto'g'ri. Namuna: 90 123 45 67"); return; }
    setError('');
    onSave({
      parentName: name.trim(),
      parentRelation: relation,
      parentPhone: normalizePhone(phone),
    });
  }

  return (
    <form className="parent-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <div className="field-inner">
            <label>Ota-onaning F.I.Sh.</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Nodira Akbarova"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="field">
          <div className="field-inner">
            <label>Kimligi</label>
            <Select
              value={relation}
              onChange={setRelation}
              ariaLabel="Ota-onaning kimligi"
              options={PARENT_RELATIONS.map((r) => ({ value: r, label: r }))}
            />
          </div>
        </div>
        <div className="field">
          <div className="field-inner">
            <label>Telefon raqami</label>
            <div className="phone-input">
              <span className="mono">+998</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="90 123 45 67"
                inputMode="tel"
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </div>

      {note && <p className="parent-form-note">{note}</p>}
      {error && <div className="error-banner">{error}</div>}

      <div className="parent-form-actions">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Bekor qilish</button>}
      </div>
    </form>
  );
}

/* Read-only view — what the student sees once the contact is locked. */
export function ParentContactSummary({ student }) {
  if (!hasParentContact(student)) {
    return <div className="muted">Ota-ona ma'lumoti kiritilmagan.</div>;
  }
  return (
    <div className="kv-list">
      <span className="k">F.I.Sh.</span>
      <span className="v">{student.parentName}</span>
      <span className="k">Kimligi</span>
      <span className="v">{student.parentRelation || '—'}</span>
      <span className="k">Telefon</span>
      <span className="v">
        <a className="mono" href={phoneHref(student.parentPhone)}>{student.parentPhone}</a>
      </span>
    </div>
  );
}
