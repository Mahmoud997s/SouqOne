'use client';

import { ReactNode } from 'react';

export interface StepConfig {
  label: string;
  icon?: string;
}

interface MultiStepFormProps {
  steps: StepConfig[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  canProceed?: boolean;
  children: ReactNode;
  title?: string;
}

export function MultiStepForm({
  steps,
  currentStep,
  onNext,
  onBack,
  onSubmit,
  isLoading = false,
  submitLabel = 'نشر الإعلان',
  canProceed = true,
  children,
  title,
}: MultiStepFormProps) {
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div className="w-full">
      {/* Title */}
      {title && (
        <h1 className="text-2xl md:text-3xl font-black text-on-surface mb-8 text-center">{title}</h1>
      )}

      {/* Progress Bar */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={i} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    done
                      ? 'bg-primary text-on-primary'
                      : active
                        ? 'bg-primary text-on-primary shadow-ambient scale-110'
                        : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {done ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                </div>
                <span
                  className={`mt-2 text-[11px] font-bold whitespace-nowrap transition-colors ${
                    active ? 'text-primary' : done ? 'text-on-surface' : 'text-on-surface-variant'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-24 lg:w-32 h-[2px] mx-2 mt-[-18px] transition-colors duration-300 ${
                    i < currentStep ? 'bg-primary' : 'bg-outline-variant/30'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 gap-4">
        {!isFirst ? (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-low rounded-lg transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            السابق
          </button>
        ) : (
          <div />
        )}

        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !canProceed}
            className="flex items-center gap-2 px-8 py-3 text-sm font-bold btn-editorial hover:brightness-105 hover:shadow-ambient disabled:opacity-50"
          >
            {isLoading ? 'جارٍ الحفظ...' : submitLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="flex items-center gap-2 px-8 py-3 text-sm font-bold btn-editorial hover:brightness-105 hover:shadow-ambient disabled:opacity-50"
          >
            التالي
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
        )}
      </div>
    </div>
  );
}
