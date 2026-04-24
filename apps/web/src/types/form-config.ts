/* ─────────────────────────────────────────────────────────
 * Config-Driven Form System — Type Definitions
 * ───────────────────────────────────────────────────────── */

// ─── Field Types ──────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'chip-select'
  | 'card-select'
  | 'multi-chip'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'image-upload'
  | 'location'
  | 'brands-multi-select';

/** A single selectable option (chip, card, or dropdown) */
export interface FieldOption {
  value: string;
  labelKey: string;
  icon?: string;
  descKey?: string;
}

/** Condition that controls when a field/section/step is visible */
export interface ShowCondition {
  /** Name of the field whose value is checked */
  field: string;
  /** Show when value equals */
  equals?: string | string[] | boolean;
  /** Show when value does NOT equal */
  notEquals?: string | string[] | boolean;
  /** Show when value is truthy (non-empty) */
  truthy?: boolean;
}

// ─── Field Config ─────────────────────────────────────────

export interface BaseFieldConfig {
  /** Unique name used as form state key */
  name: string;
  /** i18n key for the label (resolved via useTranslations) */
  labelKey: string;
  /** Field type — determines which renderer is used */
  type: FieldType;
  /** Whether this field must have a value to proceed */
  required?: boolean;
  /** i18n key for placeholder text */
  placeholderKey?: string;
  /** Default value for the field */
  defaultValue?: unknown;
  /** Conditional visibility */
  showWhen?: ShowCondition;
  /** Grid column span (1 or 2, default 1) */
  colSpan?: 1 | 2 | 3;
  /** Extra hint text below the field (i18n key) */
  hintKey?: string;
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text';
  defaultValue?: string;
}

export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea';
  rows?: number;
  defaultValue?: string;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number';
  step?: string;
  min?: number;
  max?: number;
  defaultValue?: string;
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select';
  options: FieldOption[];
  defaultValue?: string;
}

export interface ChipSelectFieldConfig extends BaseFieldConfig {
  type: 'chip-select';
  options: FieldOption[];
  defaultValue?: string;
}

export interface CardSelectFieldConfig extends BaseFieldConfig {
  type: 'card-select';
  options: FieldOption[];
  /** Grid columns for the cards (default 2) */
  columns?: number;
  defaultValue?: string;
}

export interface MultiChipFieldConfig extends BaseFieldConfig {
  type: 'multi-chip';
  options: FieldOption[];
  defaultValue?: string[];
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: 'checkbox';
  defaultValue?: boolean;
}

export interface DateFieldConfig extends BaseFieldConfig {
  type: 'date';
  defaultValue?: string;
}

export interface TimeFieldConfig extends BaseFieldConfig {
  type: 'time';
  defaultValue?: string;
}

export interface ImageUploadFieldConfig extends BaseFieldConfig {
  type: 'image-upload';
  maxImages?: number;
}

export interface LocationFieldConfig extends BaseFieldConfig {
  type: 'location';
  /** Whether to show country selector (default true) */
  showCountry?: boolean;
  /** Default country code (default 'OM') */
  defaultCountry?: string;
}

export interface BrandsMultiSelectFieldConfig extends BaseFieldConfig {
  type: 'brands-multi-select';
  defaultValue?: string[];
}

/** Union of all field config types */
export type FieldConfig =
  | TextFieldConfig
  | TextareaFieldConfig
  | NumberFieldConfig
  | SelectFieldConfig
  | ChipSelectFieldConfig
  | CardSelectFieldConfig
  | MultiChipFieldConfig
  | CheckboxFieldConfig
  | DateFieldConfig
  | TimeFieldConfig
  | ImageUploadFieldConfig
  | LocationFieldConfig
  | BrandsMultiSelectFieldConfig;

// ─── Section Config ───────────────────────────────────────

export interface SectionConfig {
  /** i18n key for the section title */
  titleKey: string;
  /** Material Symbols icon name */
  icon?: string;
  /** Fields within this section */
  fields: FieldConfig[];
  /** Grid columns for fields layout (default 1, can be 2 or 3) */
  gridCols?: 1 | 2 | 3;
  /** Conditional visibility */
  showWhen?: ShowCondition;
}

// ─── Step Config ──────────────────────────────────────────

export interface FormStepConfig {
  /** Unique step ID */
  id: string;
  /** i18n key for the step label (shown in stepper) */
  labelKey: string;
  /** Material Symbols icon name */
  icon?: string;
  /** Sections within this step */
  sections: SectionConfig[];
  /** Conditional visibility (e.g. skip step for certain listing types) */
  showWhen?: ShowCondition;
  /** Field names that must be filled to proceed from this step */
  requiredFields?: string[];
}

// ─── Form Config ──────────────────────────────────────────

export interface FormConfig {
  /** Listing type identifier (bus, equipment, parts, service, operator, car) */
  type: string;
  /** i18n key for the form page title */
  titleKey: string;
  /** i18n key for the submit button */
  submitKey: string;
  /** API endpoint for create (e.g. '/buses') */
  apiEndpoint: string;
  /** Upload endpoint template (e.g. '/uploads/buses') → will append /{id}/images */
  uploadEndpoint?: string;
  /** Build redirect path from created entity ID */
  redirectPath: (id: string) => string;
  /** API hook name for creating — used to map to actual mutation hook */
  createHook: string;
  /** API hook name for fetching single item (edit mode) */
  fetchHook?: string;
  /** API hook name for updating (edit mode) */
  updateHook?: string;
  /** API hook name for deleting images (edit mode) */
  deleteImageHook?: string;
  /** Steps of the form */
  steps: FormStepConfig[];
  /** Transform form data before sending to API */
  transformPayload?: (formData: Record<string, unknown>) => Record<string, unknown>;
}

// ─── Form Engine Props ────────────────────────────────────

export interface FormEngineProps {
  config: FormConfig;
  /** Edit mode — pre-fill form with existing data */
  mode?: 'create' | 'edit';
  /** Existing entity ID (edit mode) */
  entityId?: string;
  /** Pre-loaded entity data (edit mode) */
  initialData?: Record<string, unknown>;
  /** The actual API mutation call — must return an object with `id` */
  onSubmit: (payload: Record<string, unknown>) => Promise<{ id: string }>;
  /** Whether the mutation is in progress */
  isSubmitting?: boolean;
}

// ─── Form State (internal) ────────────────────────────────

export type FormValues = Record<string, unknown>;
