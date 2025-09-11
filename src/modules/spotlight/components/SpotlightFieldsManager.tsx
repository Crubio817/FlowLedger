import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  List,
  ChevronUp,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { 
  useSpotlightFields,
  useCreateSpotlightField,
  useUpdateSpotlightField,
  useDeleteSpotlightField 
} from '../hooks/useSpotlight.ts';
import type { SpotlightField, SpotlightFieldFilters } from '../services/spotlight.types.ts';

// Types
interface SpotlightFieldsManagerProps {
  orgId: number;
  domain?: string;
  className?: string;
}

interface FieldFormData {
  field_name: string;
  field_type: 'text' | 'number' | 'boolean' | 'enum' | 'date';
  is_required: boolean;
  enum_values: string[];
  domain: string;
  display_order: number;
}

const SpotlightFieldsManager: React.FC<SpotlightFieldsManagerProps> = ({
  orgId,
  domain = '',
  className = '',
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingField, setEditingField] = useState<SpotlightField | null>(null);
  const [formData, setFormData] = useState<FieldFormData>({
    field_name: '',
    field_type: 'text',
    is_required: false,
    enum_values: [],
    domain: domain,
    display_order: 0,
  });
  const [newEnumValue, setNewEnumValue] = useState('');

  // Hooks
  const filters: SpotlightFieldFilters = { org_id: orgId };
  if (domain) filters.domain = domain;
  
  const { data: fieldsResponse } = useSpotlightFields(filters);
  const { mutateAsync: createField } = useCreateSpotlightField();
  const { mutateAsync: updateField } = useUpdateSpotlightField();
  const { mutateAsync: deleteField } = useDeleteSpotlightField();

  const fields = fieldsResponse || [];

  // Field type configuration
  const getFieldTypeConfig = (type: SpotlightField['field_type']) => {
    switch (type) {
      case 'text': return { icon: Type, label: 'Text', color: 'text-blue-400' };
      case 'number': return { icon: Hash, label: 'Number', color: 'text-green-400' };
      case 'boolean': return { icon: ToggleLeft, label: 'Yes/No', color: 'text-purple-400' };
      case 'date': return { icon: Calendar, label: 'Date', color: 'text-yellow-400' };
      case 'enum': return { icon: List, label: 'List', color: 'text-cyan-400' };
      default: return { icon: Type, label: 'Text', color: 'text-gray-400' };
    }
  };

  // Event handlers
  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      field_name: '',
      field_type: 'text',
      is_required: false,
      enum_values: [],
      domain: domain,
      display_order: fields.length,
    });
  };

  const handleEdit = (field: SpotlightField) => {
    setEditingField(field);
    setFormData({
      field_name: field.field_name,
      field_type: field.field_type,
      is_required: field.is_required,
      enum_values: field.enum_values || [],
      domain: field.domain,
      display_order: field.display_order,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingField(null);
    setFormData({
      field_name: '',
      field_type: 'text',
      is_required: false,
      enum_values: [],
      domain: domain,
      display_order: 0,
    });
  };

  const handleSave = async () => {
    try {
      if (editingField) {
        // Update existing field
        await updateField({
          fieldId: editingField.field_id,
          data: {
            field_name: formData.field_name,
            field_type: formData.field_type,
            is_required: formData.is_required,
            enum_values: formData.enum_values.length > 0 ? formData.enum_values : null,
            display_order: formData.display_order,
          },
        });
      } else {
        // Create new field
        await createField({
          org_id: orgId,
          domain: formData.domain,
          field_name: formData.field_name,
          field_type: formData.field_type,
          is_required: formData.is_required,
          display_order: formData.display_order,
          enum_values: formData.enum_values.length > 0 ? formData.enum_values : null,
        });
      }
      handleCancel();
    } catch (error) {
      console.error('Failed to save field:', error);
    }
  };

  const handleDelete = async (fieldId: number) => {
    if (confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
      try {
        await deleteField({ fieldId, orgId });
      } catch (error) {
        console.error('Failed to delete field:', error);
      }
    }
  };

  const addEnumValue = () => {
    if (newEnumValue.trim() && !formData.enum_values.includes(newEnumValue.trim())) {
      setFormData(prev => ({
        ...prev,
        enum_values: [...prev.enum_values, newEnumValue.trim()]
      }));
      setNewEnumValue('');
    }
  };

  const removeEnumValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      enum_values: prev.enum_values.filter((_, i) => i !== index)
    }));
  };

  const moveField = (fieldId: number, direction: 'up' | 'down') => {
    const fieldIndex = fields.findIndex((f: SpotlightField) => f.field_id === fieldId);
    if (fieldIndex === -1) return;

    const newOrder = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    if (newOrder < 0 || newOrder >= fields.length) return;

    // Update display order
    updateField({
      fieldId,
      data: { display_order: newOrder }
    });
  };

  return (
    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">Custom Fields</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Manage custom fields for spotlight profiles
          </p>
        </div>
        
        {!isCreating && !editingField && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingField) && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-zinc-100">
              {editingField ? 'Edit Field' : 'Create New Field'}
            </h4>
            <button
              onClick={handleCancel}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Field Name
              </label>
              <input
                type="text"
                value={formData.field_name}
                onChange={(e) => setFormData(prev => ({ ...prev, field_name: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
                placeholder="Enter field name"
              />
            </div>

            {/* Field Type */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Field Type
              </label>
              <select
                value={formData.field_type}
                onChange={(e) => setFormData(prev => ({ ...prev, field_type: e.target.value as any }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Yes/No</option>
                <option value="date">Date</option>
                <option value="enum">Dropdown List</option>
              </select>
            </div>
          </div>

          {/* Enum Values */}
          {formData.field_type === 'enum' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                List Options
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newEnumValue}
                  onChange={(e) => setNewEnumValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addEnumValue()}
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
                  placeholder="Add option"
                />
                <button
                  onClick={addEnumValue}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.enum_values.map((value, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-700 text-zinc-100 rounded-full text-sm"
                  >
                    {value}
                    <button
                      onClick={() => removeEnumValue(index)}
                      className="text-zinc-400 hover:text-zinc-200 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required Toggle */}
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                className="rounded border-zinc-600 bg-zinc-800 text-cyan-600 focus:ring-cyan-500"
              />
              Required field
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="relative flex items-center gap-2 px-6 py-3 bg-black/40 hover:bg-black/20 text-zinc-300 hover:text-white rounded-lg font-medium transition-all duration-300 border-2 border-zinc-500 hover:border-zinc-400 backdrop-blur-xl overflow-hidden group shadow-[0_0_20px_rgba(113,113,122,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(113,113,122,0.6),0_0_60px_rgba(113,113,122,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]"
            >
              {/* Inner glass reflection */}
              <div className="absolute inset-[1px] bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-md opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent opacity-60"></div>
              <span className="relative z-10 drop-shadow-[0_0_4px_rgba(113,113,122,0.6)]">Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.field_name.trim()}
              className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 hover:text-white rounded-lg font-medium transition-all duration-300 border-2 border-cyan-500/50 hover:border-cyan-400 backdrop-blur-xl overflow-hidden group shadow-[0_0_40px_rgba(6,182,212,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(6,182,212,0.8),0_0_120px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Inner glass reflection */}
              <div className="absolute inset-[1px] bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-md opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80"></div>
              <Save className="w-4 h-4 relative z-10" />
              <span className="relative z-10 drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]">
                {editingField ? 'Update' : 'Create'} Field
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Fields List */}
      <div className="space-y-2">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No custom fields defined</p>
            <p className="text-sm mt-1">Add your first field to get started</p>
          </div>
        ) : (
          fields.map((field: SpotlightField) => {
            const config = getFieldTypeConfig(field.field_type);
            const Icon = config.icon;
            
            return (
              <div
                key={field.field_id}
                className="flex items-center justify-between p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Field Type Icon */}
                  <div className={`p-2 rounded-lg bg-zinc-800 ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Field Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-zinc-100">{field.field_name}</h4>
                      {field.is_required && (
                        <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <span>{config.label}</span>
                      {field.enum_values && field.enum_values.length > 0 && (
                        <span>• {field.enum_values.length} options</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Move buttons */}
                  <button
                    onClick={() => moveField(field.field_id, 'up')}
                    disabled={field.display_order === 0}
                    className="p-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveField(field.field_id, 'down')}
                    disabled={field.display_order === fields.length - 1}
                    className="p-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Edit button */}
                  <button
                    onClick={() => handleEdit(field)}
                    className="p-2 text-zinc-400 hover:text-cyan-400 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(field.field_id)}
                    className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SpotlightFieldsManager;
