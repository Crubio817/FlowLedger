// Spotlight Module v1.0 - Stepped Builder Component
// SpotlightBuilderStepped: Create and edit spotlight profiles with stepped wizard UI

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  useSpotlight,
  useCreateSpotlight,
  useUpdateSpotlight,
  useSpotlightFields,
  useCreateSpotlightField,
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
// Direct Input Components (No memo to avoid issues)
// ================================

const DirectInput = ({ 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  className,
  id,
  ...props 
}: any) => {
  return (
    <input
      id={id}
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck="false"
      {...props}
    />
  );
};

const DirectTextarea = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  rows = 3,
  id,
  ...props 
}: any) => {
  return (
    <textarea
      id={id}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`flex min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${className || ''}`}
      rows={rows}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck="false"
      {...props}
    />
  );
};

// ================================
// Component Props
// ================================

interface SpotlightBuilderSteppedProps {
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
            autoComplete="off"
            spellCheck="false"
            className="w-full px-4 py-3 bg-zinc-800/40 border rounded-lg text-white placeholder-zinc-500
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
              border-zinc-600/50 hover:border-zinc-500/70 backdrop-blur-sm"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.field_name}`}
            autoComplete="off"
            spellCheck="false"
            className="w-full px-4 py-3 bg-zinc-800/40 border rounded-lg text-white placeholder-zinc-500
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
              border-zinc-600/50 hover:border-zinc-500/70 backdrop-blur-sm"
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${field.field_id}-bool`}
                checked={value === true}
                onChange={() => onChange(true)}
                className="text-blue-500"
              />
              <span className="text-white">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${field.field_id}-bool`}
                checked={value === false}
                onChange={() => onChange(false)}
                className="text-blue-500"
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
            autoComplete="off"
            className="w-full px-4 py-3 bg-zinc-800/40 border rounded-lg text-white
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
              border-zinc-600/50 hover:border-zinc-500/70 backdrop-blur-sm"
          />
        );

      case 'enum':
        if (!field.enum_values?.length) {
          return (
            <div className="text-zinc-400 italic p-3">
              No options configured for this field
            </div>
          );
        }
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            className="w-full px-4 py-3 bg-zinc-800/40 border rounded-lg text-white
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
              border-zinc-600/50 hover:border-zinc-500/70 backdrop-blur-sm"
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
          <div className="text-zinc-400 italic p-3">
            Unsupported field type: {field.field_type}
          </div>
        );
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
      {/* Field Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <IconComponent className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-white">
              {field.field_name}
              {isRequired && <span className="text-red-400 ml-1">*</span>}
            </span>
            <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded capitalize">
              {field.field_type}
            </span>
          </div>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
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
        <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

// ================================
// Main SpotlightBuilderStepped Component
// ================================

const SpotlightBuilderStepped: React.FC<SpotlightBuilderSteppedProps> = ({
  orgId,
  spotlightId,
  initialDomain = '',
  mode: propMode,
  onSave,
  onCancel,
  className = '',
}) => {
  // Auto-detect mode if not explicitly provided
  const mode = propMode || (spotlightId ? 'edit' : 'create');
  
  const [currentStep, setCurrentStep] = useState(1);
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

  // Steps configuration
  const steps = [
    { id: 1, title: 'Basic Info', subtitle: 'Name and domain setup' },
    { id: 2, title: 'Description', subtitle: 'Describe your ideal customer' },
    { id: 3, title: 'Profile Fields', subtitle: 'Configure custom fields' },
    { id: 4, title: 'Review', subtitle: 'Confirm and create' }
  ];

  // Hooks
  const { data: existingSpotlight } = useSpotlight(spotlightId || 0, orgId);
  // Temporarily disable fields fetching to debug input issue
  // const { data: availableFields } = useSpotlightFields({
  //   org_id: orgId,
  //   domain: formData.domain && formData.domain.length > 2 ? formData.domain : undefined,
  // });
  const availableFields: SpotlightField[] = [];
  const { mutateAsync: createSpotlight } = useCreateSpotlight();
  const { mutateAsync: updateSpotlight } = useUpdateSpotlight();
  const { mutateAsync: createField } = useCreateSpotlightField();

  // Initialize form data from existing spotlight - with better dependency control
  useEffect(() => {
    if (existingSpotlight?.data && mode === 'edit' && !formData.name) {
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
  }, [existingSpotlight?.data?.spotlight_id, mode]); // Only run when spotlight ID or mode changes

  // For clone mode, copy data but clear ID-specific info - with better dependency control
  useEffect(() => {
    if (existingSpotlight?.data && mode === 'clone' && !formData.name) {
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
  }, [existingSpotlight?.data?.spotlight_id, mode]); // Only run when spotlight ID or mode changes

  // Handle input change with error clearing - simplified approach
  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Validate specific step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Profile name is required';
      }
      if (!formData.domain.trim()) {
        newErrors.domain = 'Domain is required';
      }
    }
    
    if (step === 3) {
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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle save
  const handleSave = async () => {
    if (!validateStep(currentStep)) return;

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
      } else if (mode === 'edit') {
        // Update existing spotlight
        if (!spotlightId) {
          throw new Error('Spotlight ID is required for edit mode');
        }

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
      } else {
        throw new Error(`Invalid mode: ${mode}`);
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

  const fields = availableFields || [];

  // Progress Bar Component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300
                ${currentStep >= step.id 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20' 
                  : currentStep === step.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 ring-2 ring-blue-400/20'
                  : 'bg-zinc-700/50 text-zinc-500'
                }
              `}>
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="font-bold">{step.id}</span>
                )}
                {currentStep === step.id && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-blue-500/20 animate-pulse"></div>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-8 h-1 mx-3 rounded-full transition-all duration-300
                  ${currentStep > step.id ? 'bg-blue-500' : 'bg-zinc-700/50'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-1">
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-zinc-400 text-sm">
          {steps[currentStep - 1].subtitle}
        </p>
      </div>
    </div>
  );

  // Step One: Basic Information
  const StepOne = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="profileName" className="block text-sm font-medium text-zinc-300 mb-2">
          Profile Name *
        </label>
        <DirectInput
          id="profileName"
          type="text"
          value={formData.name}
          onChange={(value: string) => handleInputChange('name', value)}
          placeholder="e.g., Enterprise Tech Startup"
          className={`
            w-full px-4 py-3 bg-zinc-800/40 border rounded-lg text-white placeholder-zinc-500
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
            ${errors.name ? 'border-red-500 ring-2 ring-red-500/20' : 'border-zinc-600/50 hover:border-zinc-500/70'}
            backdrop-blur-sm
          `}
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <X className="w-4 h-4 mr-1" />
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-zinc-300 mb-2">
          Domain *
        </label>
        <DomainInput
          value={formData.domain || ''}
          onChange={(value: string) => handleInputChange('domain', value)}
          orgId={orgId}
          placeholder="e.g., tech, finance, healthcare"
          error={errors.domain}
        />
        <p className="mt-2 text-sm text-zinc-500">
          Choose a domain category that best represents your target market
        </p>
      </div>

      {/* Active Status for Edit Mode */}
      {mode === 'edit' && (
        <div className="flex items-center gap-2 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => handleInputChange('active', e.target.checked)}
            className="w-4 h-4 text-blue-500 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500/30"
          />
          <label htmlFor="active" className="text-white">
            Active profile (available for evaluations)
          </label>
        </div>
      )}
    </div>
  );

  // Step Two: Description
  const StepTwo = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
          Customer Profile Description
        </label>
        <DirectTextarea
          id="description"
          value={formData.description}
          onChange={(value: string) => handleInputChange('description', value)}
          placeholder="Describe your ideal customer profile in detail. What characteristics, behaviors, or needs define them?"
          rows={6}
          className="
            w-full px-4 py-3 bg-zinc-800/40 border border-zinc-600/50 rounded-lg text-white placeholder-zinc-500
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-zinc-500/70 focus:border-blue-500/50
            resize-none backdrop-blur-sm
          "
        />
        <p className="mt-2 text-sm text-zinc-500">
          This helps your team understand who you're targeting with this profile
        </p>
      </div>
    </div>
  );

  // Step Three: Profile Fields
  const StepThree = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-400" />
            Profile Fields
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Define custom fields to capture specific information about your customers
          </p>
        </div>
      </div>

      {fields.length === 0 && !showFieldCreator ? (
        <div className="text-center py-12 bg-zinc-800/30 rounded-lg border-2 border-dashed border-zinc-600">
          <Target className="w-12 h-12 mx-auto text-zinc-500 mb-4" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">
            No fields configured for {formData.domain || 'this'} domain
          </h3>
          <p className="text-zinc-500 mb-6 max-w-md mx-auto">
            Create custom fields to define what makes an ideal customer profile. 
            Add fields like company size, budget, or specific needs.
          </p>
          <button
            onClick={() => setShowFieldCreator(true)}
            className="
              inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium
              hover:bg-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30
              shadow-lg shadow-blue-500/20
            "
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Field
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Existing Fields */}
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
          
          {/* Add Field Button */}
          {!showFieldCreator && (
            <button
              onClick={() => setShowFieldCreator(true)}
              className="
                w-full p-4 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400
                hover:border-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/30
              "
            >
              <Plus className="w-4 h-4 mx-auto mb-2" />
              Add Another Field
            </button>
          )}
        </div>
      )}

      {/* Field Creator */}
      {showFieldCreator && (
        <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-white">Create New Field</h4>
            <button
              onClick={() => setShowFieldCreator(false)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Field Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Field Name *
              </label>
              <input
                type="text"
                value={newField.field_name}
                onChange={(e) => setNewField(prev => ({ ...prev, field_name: e.target.value }))}
                placeholder="e.g., Company Size"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Field Type */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Field Type *
              </label>
              <select
                value={newField.field_type}
                onChange={(e) => setNewField(prev => ({ 
                  ...prev, 
                  field_type: e.target.value as SpotlightField['field_type'],
                  enum_values: e.target.value === 'enum' ? [] : prev.enum_values,
                }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={newField.description}
              onChange={(e) => setNewField(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this field represents..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white placeholder-zinc-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Enum Values */}
          {newField.field_type === 'enum' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {newField.enum_values.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={value}
                      readOnly
                      className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white text-sm"
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
                    className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-500 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addEnumValue(input.value);
                      input.value = '';
                    }}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
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
              className="w-4 h-4 text-blue-500 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="field-required" className="text-white text-sm">
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
              className="px-4 py-2 bg-blue-600 hover:bg-cyan-700 disabled:bg-zinc-600 text-white rounded transition-colors"
            >
              Create Field
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Step Four: Review
  const StepFour = () => (
    <div className="space-y-6">
      <div className="bg-zinc-800/30 rounded-lg p-6 border border-zinc-700">
        <h3 className="text-lg font-medium text-white mb-4">Review Your Profile</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Profile Name</label>
            <p className="text-white font-medium">{formData.name}</p>
          </div>
          
          <div>
            <label className="text-sm text-zinc-400">Domain</label>
            <p className="text-white font-medium">{formData.domain}</p>
          </div>
          
          {formData.description && (
            <div>
              <label className="text-sm text-zinc-400">Description</label>
              <p className="text-white">{formData.description}</p>
            </div>
          )}

          {mode === 'edit' && (
            <div>
              <label className="text-sm text-zinc-400">Status</label>
              <p className="text-white font-medium">
                {formData.active ? 'Active' : 'Inactive'}
              </p>
            </div>
          )}
          
          <div>
            <label className="text-sm text-zinc-400">Custom Fields</label>
            {fields.length > 0 ? (
              <div className="mt-2 space-y-2">
                {fields.map((field) => (
                  <div key={field.field_id} className="flex justify-between items-center py-2 px-3 bg-zinc-800 rounded">
                    <span className="text-white">{field.field_name}</span>
                    <div className="flex items-center text-sm text-zinc-400">
                      <span className="capitalize mr-2">{field.field_type}</span>
                      {field.is_required && (
                        <span className="text-red-400">Required</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 italic">No custom fields configured</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepOne />;
      case 2: return <StepTwo />;
      case 3: return <StepThree />;
      case 4: return <StepFour />;
      default: return <StepOne />;
    }
  };

  return (
    <div className={`text-white ${className}`}>
      <div className="max-w-full">
        {/* Progress Bar */}
        <div className="mb-6">
          <ProgressBar />
        </div>

        {/* Form Content */}
        <div className="bg-zinc-800/30 rounded-lg p-5 border border-zinc-700/30 mb-5">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center px-1">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300
              ${currentStep === 1 
                ? 'text-zinc-500 cursor-not-allowed opacity-50' 
                : 'relative bg-black/40 hover:bg-black/20 text-zinc-300 hover:text-white border-2 border-zinc-500 hover:border-zinc-400 backdrop-blur-xl overflow-hidden group shadow-[0_0_20px_rgba(113,113,122,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(113,113,122,0.6),0_0_60px_rgba(113,113,122,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]'
              }
            `}
          >
            {currentStep > 1 && (
              <>
                {/* Inner glass reflection */}
                <div className="absolute inset-[1px] bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-md opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent opacity-60"></div>
              </>
            )}
            <ChevronLeft className="w-4 h-4 relative z-10" />
            <span className="relative z-10 drop-shadow-[0_0_4px_rgba(113,113,122,0.6)]">Previous</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="
                relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/15 to-blue-500/15 hover:from-blue-500/25 hover:to-blue-500/25 text-blue-300 hover:text-white rounded-lg font-medium transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 backdrop-blur-xl overflow-hidden group shadow-[0_4px_12px_rgba(0,0,0,0.3),0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),0_0_30px_rgba(59,130,246,0.3)]
              "
            >
              {/* Subtle glass reflection */}
              <div className="absolute inset-[1px] bg-gradient-to-b from-white/10 via-transparent to-transparent rounded-md opacity-40"></div>
              <span className="relative z-10">Next</span>
              <ChevronRight className="w-4 h-4 relative z-10" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="
                relative flex items-center gap-2 px-6 py-3 bg-black/40 hover:bg-black/20 text-emerald-300 hover:text-white rounded-lg font-medium transition-all duration-300 border-2 border-emerald-500 hover:border-emerald-400 backdrop-blur-xl overflow-hidden group shadow-[0_0_30px_rgba(16,185,129,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.8),0_0_100px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] disabled:opacity-50
              "
            >
              {/* Inner glass reflection */}
              <div className="absolute inset-[1px] bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-md opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80"></div>
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                  <span className="relative z-10 drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]">Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]">
                    {mode === 'create' ? 'Create Profile' : 'Save Changes'}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotlightBuilderStepped;
export type { SpotlightBuilderSteppedProps };
