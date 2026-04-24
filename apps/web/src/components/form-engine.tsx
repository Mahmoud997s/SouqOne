'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { FormErrorOverlay } from '@/components/form-error-overlay';
import { renderField } from '@/components/form-fields';
import { uploadImages } from '@/lib/upload-images';
import { useToast } from '@/components/toast';
import { sectionCls, sectionTitleCls } from '@/lib/constants/form-styles';
import type {
  FormConfig,
  FormStepConfig,
  ShowCondition,
  FormValues,
  FormEngineProps,
} from '@/types/form-config';

/* ═══════════════════════════════════════════════════════════
 * Helpers
 * ═══════════════════════════════════════════════════════════ */

/** Check whether a ShowCondition is satisfied */
function isVisible(condition: ShowCondition | undefined, values: FormValues): boolean {
  if (!condition) return true;

  const val = values[condition.field];

  if (condition.truthy) return !!val;

  if (condition.equals !== undefined) {
    if (Array.isArray(condition.equals)) {
      return condition.equals.includes(val as string);
    }
    return val === condition.equals;
  }

  if (condition.notEquals !== undefined) {
    if (Array.isArray(condition.notEquals)) {
      return !condition.notEquals.includes(val as string);
    }
    return val !== condition.notEquals;
  }

  return true;
}

/** Extract default values from all fields across all steps */
function getDefaults(config: FormConfig): FormValues {
  const defaults: FormValues = {};
  for (const step of config.steps) {
    for (const section of step.sections) {
      for (const field of section.fields) {
        if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue;
        } else {
          switch (field.type) {
            case 'checkbox':
              defaults[field.name] = false;
              break;
            case 'multi-chip':
            case 'brands-multi-select':
              defaults[field.name] = [];
              break;
            case 'image-upload':
              defaults[field.name] = [];
              break;
            default:
              defaults[field.name] = '';
              break;
          }
        }
      }
    }
  }
  return defaults;
}

/** Check if all required fields in a step are filled */
function canProceedFromStep(
  step: FormStepConfig,
  values: FormValues,
): boolean {
  // Check explicit requiredFields list first
  if (step.requiredFields?.length) {
    return step.requiredFields.every((name) => {
      const v = values[name];
      if (Array.isArray(v)) return v.length > 0;
      return !!v;
    });
  }

  // Otherwise check all visible fields marked as required
  for (const section of step.sections) {
    if (!isVisible(section.showWhen, values)) continue;
    for (const field of section.fields) {
      if (!isVisible(field.showWhen, values)) continue;
      if (!field.required) continue;

      const v = values[field.name];
      if (Array.isArray(v) && v.length === 0) return false;
      if (!v && v !== false && v !== 0) return false;
    }
  }

  return true;
}

/* ═══════════════════════════════════════════════════════════
 * Form Engine Component
 * ═══════════════════════════════════════════════════════════ */

export function FormEngine({
  config,
  mode: _mode = 'create',
  initialData,
  onSubmit: submitFn,
  isSubmitting: externalSubmitting,
}: FormEngineProps) {
  const router = useRouter();
  const tp = useTranslations('pages');
  const { addToast } = useToast();

  // ── Form state ──────────────────────────────────────
  const [values, setValues] = useState<FormValues>(() => {
    const defaults = getDefaults(config);
    return initialData ? { ...defaults, ...initialData } : defaults;
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill from initialData when it arrives async (edit mode)
  useEffect(() => {
    if (initialData) {
      setValues((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // ── Value setter ────────────────────────────────────
  const handleChange = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // ── Visible steps ──────────────────────────────────
  const visibleSteps = config.steps.filter((s) => isVisible(s.showWhen, values));
  const currentStepConfig = visibleSteps[step];
  const maxStep = visibleSteps.length - 1;

  // Step labels for the stepper
  const stepLabels = visibleSteps.map((s) => ({
    label: tp(s.labelKey),
    icon: s.icon,
  }));

  // ── Submit handler ─────────────────────────────────
  async function handleSubmit() {
    setErrors([]);
    setIsSubmitting(true);

    try {
      // Build payload — strip out internal fields like images
      const payload: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(values)) {
        // Skip image fields — handled separately
        const isImageField = config.steps.some((s) =>
          s.sections.some((sec) =>
            sec.fields.some((f) => f.name === key && f.type === 'image-upload'),
          ),
        );
        if (isImageField) continue;

        // Skip empty strings & null
        if (val === '' || val === null || val === undefined) continue;
        // Skip empty arrays
        if (Array.isArray(val) && val.length === 0) continue;

        // Convert numeric strings to numbers for fields typed as 'number'
        const fieldDef = config.steps
          .flatMap((s) => s.sections.flatMap((sec) => sec.fields))
          .find((f) => f.name === key);

        if (fieldDef?.type === 'number' && typeof val === 'string' && val !== '') {
          payload[key] = Number(val);
        } else {
          payload[key] = val;
        }
      }

      // Apply custom transform
      const finalPayload = config.transformPayload
        ? config.transformPayload(payload)
        : payload;

      const result = await submitFn(finalPayload);

      if (!result?.id) {
        throw new Error(tp('formEngineNoId'));
      }

      // Upload images
      const imageFieldNames = config.steps
        .flatMap((s) => s.sections.flatMap((sec) => sec.fields))
        .filter((f) => f.type === 'image-upload')
        .map((f) => f.name);

      if (config.uploadEndpoint) {
        for (const imgField of imageFieldNames) {
          const imgs = values[imgField];
          if (Array.isArray(imgs) && imgs.length > 0) {
            await uploadImages(config.uploadEndpoint, result.id, imgs);
          }
        }
      }

      addToast('success', tp(config.submitKey + 'Success'));
      router.push(config.redirectPath(result.id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : tp('formEngineError');
      setErrors(msg.split('\n').filter(Boolean));
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render sections + fields ───────────────────────
  function renderStep() {
    if (!currentStepConfig) return null;

    return (
      <div className="space-y-8">
        {currentStepConfig.sections.map((section, secIdx) => {
          if (!isVisible(section.showWhen, values)) return null;

          // Collect visible fields
          const visibleFields = section.fields.filter((f) =>
            isVisible(f.showWhen, values),
          );
          if (visibleFields.length === 0) return null;

          const gridCols = section.gridCols ?? 1;

          return (
            <section key={secIdx} className={sectionCls}>
              {section.titleKey && (
                <h2 className={sectionTitleCls}>
                  {section.icon && (
                    <span className="material-symbols-outlined text-primary text-lg">
                      {section.icon}
                    </span>
                  )}
                  {tp(section.titleKey)}
                </h2>
              )}
              <div
                className={gridCols > 1 ? 'grid gap-4' : 'space-y-4'}
                style={
                  gridCols > 1
                    ? { gridTemplateColumns: `repeat(${gridCols}, 1fr)` }
                    : undefined
                }
              >
                {visibleFields.map((field) => {
                  const colSpan = field.colSpan ?? 1;
                  return (
                    <div
                      key={field.name}
                      style={
                        gridCols > 1 && colSpan > 1
                          ? { gridColumn: `span ${colSpan}` }
                          : undefined
                      }
                    >
                      {renderField({
                        field,
                        value: values[field.name],
                        onChange: handleChange,
                        tp,
                        allValues: values,
                      })}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  // ── Layout ─────────────────────────────────────────
  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-28 pb-8 max-w-[900px] mx-auto px-4 md:px-8">
        <MultiStepForm
          steps={stepLabels}
          currentStep={step}
          onNext={() => {
            setStep((s) => Math.min(s + 1, maxStep));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBack={() => {
            setStep((s) => Math.max(s - 1, 0));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting || !!externalSubmitting}
          submitLabel={tp(config.submitKey)}
          canProceed={currentStepConfig ? canProceedFromStep(currentStepConfig, values) : false}
          title={tp(config.titleKey)}
        >
          {renderStep()}
        </MultiStepForm>

        {errors.length > 0 && (
          <FormErrorOverlay messages={errors} onClose={() => setErrors([])} />
        )}
      </main>
      <Footer />
    </AuthGuard>
  );
}

