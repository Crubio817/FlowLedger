// Spotlight Module v1.0 - Builder Component
// SpotlightBuilder: Create and edit spotlight profiles with dynamic field management

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  X, 
  Save, 
  ArrowLeft,
  Settings,
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  List,
  GripVertical,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  useSpotlight,
  useCreateSpotlight,
  useUpdateSpotlight,
  useSpotlightFields,
  useCreateSpotlightField,
  useAvailableDomains,
} from '../hooks/useSpotlight.ts';
import DomainInput from './DomainInput.tsx';
import type {
  Spotlight,
  SpotlightField,
  SpotlightFormData,
  CreateSpotlightRequest,
  UpdateSpotlightRequest,
} from '../services/spotlight.types.ts';

// ================================
// Component Props
// ================================

interface SpotlightBuilderProps {
  orgId: number;
  spotlightId?: number; // For editing existing spotlight
  initialDomain?: string;
  mode?: 'create' | 'edit' | 'clone';
  onSave?: (spotlight: Spotlight) => void;
  onCancel?: () => void;
  className?: string;
}

interface FieldEditorProps {
  field: SpotlightField;
  value: any;
  onChange: (value: any) => void;
  onRemove?: () => void;
  isRequired?: boolean;
  error?: string;
}

// ================================
// Field Type Icons
// ================================

const getFieldTypeIcon = (type: SpotlightField['field_type']) => {
  switch (type) {
    case 'text': return Type;
    case 'number': return Hash;
    case 'boolean': return ToggleLeft;
    case 'date': return Calendar;
    case 'enum': return List;
    default: return Type;
  }
};

// ================================
// Field Editor Component
// ================================

const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  value,
  onChange,
  onRemove,
  isRequired,
  error,
}) => {
  const IconComponent = getFieldTypeIcon(field.field_type);

  const renderFieldInput = () => {
    switch (field.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.field_name}`}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.field_name}`}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none"
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${field.field_id}-bool`}
                checked={value === true}
                onChange={() => onChange(true)}
                className="text-cyan-500"
              />
              <span className="text-white">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${field.field_id}-bool`}
                checked={value === false}
                onChange={() => onChange(false)}
                className="text-cyan-500"
              />
              <span className="text-white">No</span>
            </label>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
          />
        );

      case 'enum':
        if (!field.enum_values?.length) {
          return (
            <div className="text-zinc-400 italic">
              No options configured for this field
            </div>
          );
        }
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="">Select {field.field_name}</option>
            {field.enum_values.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <div className="text-zinc-400 italic">
            Unsupported field type: {field.field_type}
          </div>
        );
    }
  };

  return (
    <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
      {/* Field Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4 text-cyan-400" />
          <span className="font-medium text-white">
            {field.field_name}
            {isRequired && <span className="text-red-400 ml-1">*</span>}
          </span>
          <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded">
            {field.field_type}
          </span>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
            title="Remove field"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Field Input */}
      <div className="mb-2">
        {renderFieldInput()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

// ================================
// Main SpotlightBuilder Component
// ================================

const SpotlightBuilder: React.FC<SpotlightBuilderProps> = ({
  orgId,
  spotlightId,
  initialDomain = '',
  mode = 'create',
  onSave,
  onCancel,
  className = '',
}) => {
  const [formData, setFormData] = useState<SpotlightFormData>({
    name: '',
    domain: initialDomain,
    description: '',
    active: true,
    field_values: {},
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showFieldCreator, setShowFieldCreator] = useState(false);
  const [newField, setNewField] = useState({
    field_name: '',
    field_type: 'text' as SpotlightField['field_type'],
    description: '',
    is_required: false,
    enum_values: [] as string[],
  });

  // Hooks
  const { data: existingSpotlight } = useSpotlight(spotlightId || 0, orgId);
  const { data: availableFields } = useSpotlightFields({
    org_id: orgId,
    domain: formData.domain || undefined,
  });
  const { mutateAsync: createSpotlight } = useCreateSpotlight();
  const { mutateAsync: updateSpotlight } = useUpdateSpotlight();
  const { mutateAsync: createField } = useCreateSpotlightField();

  // Initialize form data from existing spotlight
  useEffect(() => {
    if (existingSpotlight?.data && mode === 'edit') {
      const spotlight = existingSpotlight.data;
      setFormData({
        name: spotlight.name,
        domain: spotlight.domain,
        description: spotlight.description || '',
        active: spotlight.active,
        field_values: spotlight.fields?.reduce((acc, field) => {
          if (field.value !== undefined) {
            acc[field.field_id] = field.value;
          }
          return acc;
        }, {} as Record<number, any>) || {},
      });
    }
  }, [existingSpotlight, mode]);

  // For clone mode, copy data but clear ID-specific info
  useEffect(() => {
    if (existingSpotlight?.data && mode === 'clone') {
      const spotlight = existingSpotlight.data;
      setFormData({
        name: `${spotlight.name} (Copy)`,
        domain: spotlight.domain,
        description: spotlight.description || '',
        active: true,
        field_values: spotlight.fields?.reduce((acc, field) => {
          if (field.value !== undefined) {
            acc[field.field_id] = field.value;
          }
          return acc;
        }, {} as Record<number, any>) || {},
      });
    }
  }, [existingSpotlight, mode]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.domain.trim()) {
      newErrors.domain = 'Domain is required';
    }

    // Validate required fields
    const fields = availableFields || [];
    if (fields.length > 0) {
      for (const field of fields) {
        if (field.is_required) {
          const value = formData.field_values[field.field_id];
          if (!value && value !== false && value !== 0) {
            newErrors[`field_${field.field_id}`] = `${field.field_name} is required`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      let savedSpotlight: Spotlight;

      if (mode === 'create' || mode === 'clone') {
        // Create new spotlight
        const createData: CreateSpotlightRequest = {
          org_id: orgId,
          name: formData.name,
          domain: formData.domain,
          description: formData.description,
        };
        
        savedSpotlight = await createSpotlight(createData);

        // Update field values if any were set
        if (Object.keys(formData.field_values).length > 0) {
          const updateData: UpdateSpotlightRequest = {
            org_id: orgId,
            field_values: formData.field_values,
          };
          await updateSpotlight({
            spotlightId: savedSpotlight.spotlight_id,
            data: updateData,
          });
        }
      } else {
        // Update existing spotlight
        if (!spotlightId) throw new Error('Spotlight ID required for update');

        const updateData: UpdateSpotlightRequest = {
          org_id: orgId,
          name: formData.name,
          domain: formData.domain,
          description: formData.description,
          active: formData.active,
          field_values: formData.field_values,
        };

        await updateSpotlight({
          spotlightId,
          data: updateData,
        });

        savedSpotlight = existingSpotlight?.data!;
      }

      onSave?.(savedSpotlight);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle field value change
  const handleFieldValueChange = (fieldId: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      field_values: {
        ...prev.field_values,
        [fieldId]: value,
      },
    }));

    // Clear field error
    if (errors[`field_${fieldId}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`field_${fieldId}`];
        return newErrors;
      });
    }
  };

  // Handle new field creation
  const handleCreateField = async () => {
    if (!newField.field_name.trim() || !formData.domain) return;

    try {
      const fieldData = {
        org_id: orgId,
        domain: formData.domain,
        field_name: newField.field_name,
        field_type: newField.field_type,
        description: newField.description || undefined,
        is_required: newField.is_required,
        display_order: (fields.length || 0) + 1, // Add at the end
        enum_values: newField.field_type === 'enum' ? newField.enum_values : undefined,
      };

      await createField(fieldData);

      // Reset form
      setNewField({
        field_name: '',
        field_type: 'text',
        description: '',
        is_required: false,
        enum_values: [],
      });
      setShowFieldCreator(false);
    } catch (error) {
      console.error('Failed to create field:', error);
    }
  };

  // Handle enum value addition
  const addEnumValue = (value: string) => {
    if (value.trim() && !newField.enum_values.includes(value.trim())) {
      setNewField(prev => ({
        ...prev,
        enum_values: [...prev.enum_values, value.trim()],
      }));
    }
  };

  // Handle enum value removal
  const removeEnumValue = (index: number) => {
    setNewField(prev => ({
      ...prev,
      enum_values: prev.enum_values.filter((_, i) => i !== index),
    }));
  };

  const isFormValid = !Object.keys(errors).length && formData.name && formData.domain;
  const fields = availableFields || [];

  return (
    <div className={`bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-700/50">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Target className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">
              {mode === 'create' ? 'Create Spotlight Profile' : 
               mode === 'clone' ? 'Clone Spotlight Profile' : 
               'Edit Spotlight Profile'}
            </h2>
            <p className="text-sm text-zinc-400">
              {mode === 'create' ? 'Define your ideal customer profile' : 
               mode === 'clone' ? 'Create a copy of the spotlight profile' :
               'Update your spotlight profile'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-zinc-400 hover:text-white border border-zinc-600 hover:border-zinc-500 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-600 text-white rounded transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {mode === 'create' ? 'Create' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Profile Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Enterprise Tech Startup"
              className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Domain *
            </label>
            <DomainInput
              value={formData.domain}
              onChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}
              orgId={orgId}
              placeholder="e.g., tech, finance, healthcare"
              error={errors.domain}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your ideal customer profile..."
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none resize-none"
          />
        </div>

        {/* Active Status */}
        {mode === 'edit' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="w-4 h-4 text-cyan-500 bg-zinc-800 border-zinc-600 rounded focus:ring-cyan-500"
            />
            <label htmlFor="active" className="text-white">
              Active profile (available for evaluations)
            </label>
          </div>
        )}

        {/* Field Configuration */}
        {(fields.length > 0 || formData.domain) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                Profile Fields
              </h3>
              {formData.domain && (
                <button
                  type="button"
                  onClick={() => setShowFieldCreator(!showFieldCreator)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              )}
            </div>

            {/* Existing Fields */}
            {fields.length > 0 && (
              <div className="space-y-4 mb-6">
                {fields.map((field) => (
                  <FieldEditor
                    key={field.field_id}
                    field={field}
                    value={formData.field_values[field.field_id]}
                    onChange={(value) => handleFieldValueChange(field.field_id, value)}
                    isRequired={field.is_required}
                    error={errors[`field_${field.field_id}`]}
                  />
                ))}
              </div>
            )}

            {/* Field Creator */}
            {showFieldCreator && (
              <div className="bg-zinc-800/50 border border-cyan-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-white">Create New Field</h4>
                  <button
                    type="button"
                    onClick={() => setShowFieldCreator(false)}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Field Name */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Field Name *
                    </label>
                    <input
                      type="text"
                      value={newField.field_name}
                      onChange={(e) => setNewField(prev => ({ ...prev, field_name: e.target.value }))}
                      placeholder="e.g., Company Size, Industry"
                      className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Field Type */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Field Type *
                    </label>
                    <select
                      value={newField.field_type}
                      onChange={(e) => setNewField(prev => ({ 
                        ...prev, 
                        field_type: e.target.value as SpotlightField['field_type'],
                        enum_values: e.target.value === 'enum' ? [] : prev.enum_values,
                      }))}
                      className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="boolean">Yes/No</option>
                      <option value="date">Date</option>
                      <option value="enum">Multiple Choice</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newField.description}
                    onChange={(e) => setNewField(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this field represents..."
                    className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Enum Values */}
                {newField.field_type === 'enum' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Options
                    </label>
                    <div className="space-y-2">
                      {newField.enum_values.map((value, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={value}
                            readOnly
                            className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeEnumValue(index)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter option and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addEnumValue(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            addEnumValue(input.value);
                            input.value = '';
                          }}
                          className="p-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Required Checkbox */}
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="field-required"
                    checked={newField.is_required}
                    onChange={(e) => setNewField(prev => ({ ...prev, is_required: e.target.checked }))}
                    className="w-4 h-4 text-cyan-500 bg-zinc-800 border-zinc-600 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor="field-required" className="text-white">
                    Required field
                  </label>
                </div>

                {/* Create Button */}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFieldCreator(false)}
                    className="px-4 py-2 text-zinc-400 hover:text-white border border-zinc-600 hover:border-zinc-500 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateField}
                    disabled={!newField.field_name.trim()}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-600 text-white rounded transition-colors"
                  >
                    Create Field
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Fields Message */}
        {fields.length === 0 && formData.domain && !showFieldCreator && (
          <div className="text-center py-8 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
            <Settings className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 mb-2">No fields configured for {formData.domain} domain</p>
            <p className="text-sm text-zinc-500 mb-4">
              Create custom fields to define what makes an ideal customer profile
            </p>
            <button
              type="button"
              onClick={() => setShowFieldCreator(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Field
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotlightBuilder;
export type { SpotlightBuilderProps };
