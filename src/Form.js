import React, { useState } from 'react';
import './form.css';

const DynamicForm = () => {
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filePreviews, setFilePreviews] = useState({});
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [addingField, setAddingField] = useState(false);

  const [formState, setFormState] = useState({
    fields: [
      { id: 'name', label: 'Full Name', type: 'text', required: true, value: '' },
      { id: 'email', label: 'Email Address', type: 'email', required: true, value: '' },
      { id: 'age', label: 'Age', type: 'number', required: false, value: '' },
      { id: 'birth_date', label: 'Birth Date', type: 'date', required: false, value: '' },
      { id: 'country', label: 'Country', type: 'select', required: true, options: ['India', 'Canada', 'United Kingdom', 'Australia', 'Other'], value: '' },
      { id: 'gender', label: 'Gender', type: 'radio', required: false, options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'], value: '' },
      { id: 'interests', label: 'Interests', type: 'checkbox', required: false, options: ['Technology', 'Sports', 'Reading', 'Travel', 'Music'], value: [] },
      { id: 'profile_picture', label: 'Profile Picture', type: 'file', required: false, value: null, accept: 'image/*' },
      { id: 'bio', label: 'Biography', type: 'textarea', required: false, value: '' },
    ],
    isValid: false,
  });

  const resetForm = () => {
    setFormState(prevState => ({
      ...prevState,
      fields: prevState.fields.map(field => ({
        ...field,
        value: Array.isArray(field.value) ? [] : (field.type === 'file' ? null : ''),
        error: undefined
      })),
      isValid: false,
    }));
    setEditingId(null);
    setFilePreviews(prev => ({
      ...prev,
      profile_picture: null
    }));
    setNewFieldLabel('');
    setAddingField(false);
  };

  const handleFieldChange = (id, value) => {
    setFormState(prevState => {
      const updatedFields = prevState.fields.map(field => {
        if (field.id === id) {
          const updatedField = { ...field, value };

          if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
            updatedField.error = `${field.label} is required`;
          } else if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
            updatedField.error = 'Please enter a valid email address';
          } else {
            updatedField.error = undefined;
          }

          return updatedField;
        }
        return field;
      });

      const isValid = updatedFields.every(field => !field.required || (field.value && !field.error));

      return { fields: updatedFields, isValid };
    });

    if (id === 'profile_picture' && value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreviews(prev => ({
          ...prev,
          [id]: e.target.result
        }));
      };
      reader.readAsDataURL(value);
    }
  };

  const addField = () => {
    if (newFieldLabel.trim()) {
      const newId = `field_${formState.fields.length + 1}`;
      setFormState(prevState => ({
        ...prevState,
        fields: [
          ...prevState.fields,
          {
            id: newId,
            label: newFieldLabel,
            type: 'text',
            required: false,
            value: '',
          },
        ],
      }));
      setNewFieldLabel('');
      setAddingField(false);
    } else {
      alert('Please enter a label for the new field.');
    }
  };

  const cancelAddField = () => {
    setNewFieldLabel('');
    setAddingField(false);
  };

  const removeField = (id) => {
    setFormState(prevState => ({
      ...prevState,
      fields: prevState.fields.filter(field => field.id !== id),
    }));
  };

  const editRecord = (record) => {
    setEditingId(record.id);

    setFormState(prevState => {
      const updatedFields = prevState.fields.map(field => {
        const fieldValue = record[field.id];

        return {
          ...field,
          value: fieldValue !== undefined ? fieldValue : (Array.isArray(field.value) ? [] : (field.type === 'file' ? null : '')),
          error: undefined
        };
      });

      const isValid = updatedFields.every(field => !field.required || (field.value && !field.error));

      return { fields: updatedFields, isValid };
    });

    if (record.profile_picture_url) {
      setFilePreviews(prev => ({
        ...prev,
        profile_picture: record.profile_picture_url
      }));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedFields = formState.fields.map(field => {
      if (field.required && (!field.value || (Array.isArray(field.value) && field.value.length === 0))) {
        return { ...field, error: `${field.label} is required` };
      }
      return field;
    });

    const isValid = updatedFields.every(field => !field.required || (field.value && !field.error));

    if (isValid) {
      const formData = formState.fields.reduce((data, field) => {
        if (field.id === 'profile_picture') {
          data[field.id] = field.value;
          if (filePreviews.profile_picture) {
            data.profile_picture_url = filePreviews.profile_picture;
          }
        } else {
          data[field.id] = field.value;
        }
        return data;
      }, {});

      if (editingId) {
        setRecords(prevRecords =>
          prevRecords.map(record =>
            record.id === editingId ? { ...formData, id: editingId } : record
          )
        );
        console.log('Record updated:', formData);
      } else {
        const newRecord = {
          id: Date.now().toString(),
          ...formData
        };
        setRecords(prevRecords => [...prevRecords, newRecord]);
        console.log('New record added:', newRecord);
      }

      resetForm();
      alert(editingId ? 'Record updated successfully!' : 'Record added successfully!');
    } else {
      setFormState({ fields: updatedFields, isValid });
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'password':
        return (
          <input
            type={field.type}
            id={field.id}
            value={field.value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`form-input ${field.error ? 'input-error' : ''}`}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={field.value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`form-textarea ${field.error ? 'input-error' : ''}`}
            required={field.required}
            rows={4}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={field.value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`form-input ${field.error ? 'input-error' : ''}`}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={field.value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`form-select ${field.error ? 'input-error' : ''}`}
            required={field.required}
          >
            <option value="">-- Select an option --</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map(option => (
              <div className="form-check" key={option}>
                <input
                  type="radio"
                  id={`${field.id}_${option}`}
                  name={field.id}
                  value={option}
                  checked={field.value === option}
                  onChange={() => handleFieldChange(field.id, option)}
                  className="form-check-input"
                  required={field.required}
                />
                <label className="form-check-label" htmlFor={`${field.id}_${option}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="checkbox-group">
            {field.options?.map(option => (
              <div className="form-check" key={option}>
                <input
                  type="checkbox"
                  id={`${field.id}_${option}`}
                  value={option}
                  checked={Array.isArray(field.value) && field.value.includes(option)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...(field.value || []), option]
                      : (field.value || []).filter(val => val !== option);
                    handleFieldChange(field.id, newValue);
                  }}
                  className="form-check-input"
                />
                <label className="form-check-label" htmlFor={`${field.id}_${option}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="file-input-container">
            <input
              type="file"
              id={field.id}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleFieldChange(field.id, file);
              }}
              className={`form-file ${field.error ? 'input-error' : ''}`}
              required={field.required}
              accept={field.accept || ''}
            />
            {field.id === 'profile_picture' && filePreviews.profile_picture && (
              <div className="image-preview-container">
                <img
                  src={filePreviews.profile_picture}
                  alt="Profile Preview"
                  className="image-preview"
                />
              </div>
            )}
            {field.value && field.value.name && (
              <div className="image-name-container">
                <span>{field.value.name}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderTableHeader = () => {
    const visibleFields = formState.fields.filter(field => field.id !== 'profile_picture');

    return (
      <thead>
        <tr>
          <th className="profile-picture-column">Profile</th>
          {visibleFields.map(field => (
            <th key={field.id}>{field.label}</th>
          ))}
          <th>Actions</th>
        </tr>
      </thead>
    );
  };

  const formatCellValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    } else if (value === null || value === undefined) {
      return '';
    } else {
      return String(value);
    }
  };

  const renderTableRows = () => {
    const visibleFields = formState.fields.filter(field => field.id !== 'profile_picture');

    return (
      <tbody>
        {records.map(record => (
          <tr key={record.id}>
            <td className="profile-picture-column">
              {record.profile_picture_url ? (
                <img
                  src={record.profile_picture_url}
                  alt="Profile"
                  className="table-image-preview"
                />
              ) : (
                <div className="placeholder-image">
                  <span>No Image</span>
                </div>
              )}
            </td>
            {visibleFields.map(field => (
              <td key={`${record.id}_${field.id}`}>
                {formatCellValue(record[field.id])}
              </td>
            ))}
            <td className="action-column">
              <div className="action-buttons">
                <button
                  className="btn btn-edit"
                  onClick={() => editRecord(record)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => deleteRecord(record.id)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
        {records.length === 0 && (
          <tr>
            <td colSpan={visibleFields.length + 2} className="empty-message">
              No records found. Add a new record using the form above.
            </td>
          </tr>
        )}
      </tbody>
    );
  };

  return (
    <div className="dynamic-form-container">
      <div className="form-section">
        <h2 className="form-title">{editingId ? 'Edit Record' : 'Add New Record'}</h2>
        <form onSubmit={handleSubmit}>
          {formState.fields.map((field) => (
            <div className="form-group" key={field.id}>
              <div className="field-header">
                <label htmlFor={field.id} className="field-label">
                  {field.label} {field.required && <span className="required-mark">*</span>}
                </label>
                {!field.required && (
                  <button
                    type="button"
                    className="btn btn-remove"
                    onClick={() => removeField(field.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
              {renderField(field)}
              {field.error && <div className="error-message">{field.error}</div>}
            </div>
          ))}

          {addingField && (
            <div className="form-group">
              <div className="field-header">
                <label htmlFor="newFieldLabel" className="field-label">
                  New Field Label <span className="required-mark">*</span>
                </label>
              </div>
              <input
                type="text"
                id="newFieldLabel"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-actions">
            {!addingField ? (
              <button type="button" className="btn btn-secondary" onClick={() => setAddingField(true)}>
                Add Field
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={addField}>
                  Confirm Field
                </button>
                <button type="button" className="btn btn-outline" onClick={cancelAddField}>
                  Cancel
                </button>
              </>
            )}
            <button type="submit" className="btn btn-primary" disabled={!formState.isValid}>
              {editingId ? 'Update Record' : 'Submit'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-section">
        <h3 className="table-title">Records</h3>
        <div className="table-container">
          <table className="data-table">
            {renderTableHeader()}
            {renderTableRows()}
          </table>
        </div>
      </div>
    </div>
  );
};

export default DynamicForm;
