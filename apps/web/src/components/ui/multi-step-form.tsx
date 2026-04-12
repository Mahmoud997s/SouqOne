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
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full" dir="rtl">
      {/* ── Gradient Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#004ac6] via-[#2563eb] to-[#0B2447]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        <div className="absolute top-[-50%] left-[-10%] w-[300px] h-[300px] rounded-full bg-white/[0.04] blur-3xl" />

        <div className="relative z-10 px-4 sm:px-6 md:px-8 pt-5 sm:pt-8 pb-5 sm:pb-6">
          {/* Title */}
          {title && (
            <h1 className="text-base sm:text-xl md:text-2xl font-black text-white mb-5 sm:mb-6 text-center drop-shadow-sm">{title}</h1>
          )}

          {/* Steps — uses flex with equal columns for perfect alignment */}
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${steps.length * 2 - 1}, auto)`, justifyContent: 'center', alignItems: 'start' }}>
            {steps.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={i} className="contents">
                  {/* Step circle + label */}
                  <div className="flex flex-col items-center min-w-0 px-1 sm:px-2">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black shrink-0 transition-all duration-300 ${
                        done
                          ? 'bg-white text-primary shadow-lg'
                          : active
                            ? 'bg-white text-primary shadow-lg scale-110'
                            : 'bg-white/15 text-white/60 backdrop-blur-sm'
                      }`}
                    >
                      {done ? <span className="material-symbols-outlined text-sm sm:text-base">check_circle</span> : i + 1}
                    </div>
                    <span
                      className={`mt-1.5 text-[8px] sm:text-[11px] font-bold text-center leading-tight max-w-[72px] sm:max-w-[120px] transition-colors ${
                        active || done ? 'text-white' : 'text-white/40'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="flex items-center self-center pt-0 mt-[4px] sm:mt-[5px]" style={{ height: '32px' }}>
                      <div className={`w-5 sm:w-14 lg:w-24 h-[2px] rounded-full transition-colors duration-500 ${
                        i < currentStep ? 'bg-white/70' : 'bg-white/15'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 sm:mt-5 bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="min-h-[300px]">
        {children}
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mt-8 gap-3 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-2xl p-3 sm:p-4">
        {!isFirst ? (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-on-surface-variant hover:text-on-surface bg-surface-container-low dark:bg-surface-container-high hover:bg-surface-container rounded-xl transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            السابق
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs text-on-surface-variant font-medium hidden sm:inline">
            الخطوة {currentStep + 1} من {steps.length}
          </span>
          {isLast ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isLoading || !canProceed}
              className="flex items-center gap-1.5 px-4 sm:px-7 py-2.5 text-xs sm:text-sm font-black bg-primary text-on-primary rounded-xl hover:brightness-110 active:scale-[0.97] transition-all shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              {isLoading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
              {isLoading ? 'جارٍ الحفظ...' : submitLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!canProceed}
              className="flex items-center gap-1.5 px-4 sm:px-7 py-2.5 text-xs sm:text-sm font-black bg-primary text-on-primary rounded-xl hover:brightness-110 active:scale-[0.97] transition-all shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              التالي
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
