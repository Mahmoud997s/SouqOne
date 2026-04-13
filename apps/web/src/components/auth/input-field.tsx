'use client';

import React, { useState, InputHTMLAttributes } from 'react';

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  icon?: string;
  error?: string;
  /** Renders show/hide toggle when type="password" */
  isPassword?: boolean;
  hint?: string;
}

export function InputField({
  label,
  icon,
  error,
  isPassword,
  hint,
  ...rest
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : rest.type || 'text';

  return (
    <div className="flex flex-col gap-1.5">
      {(label || hint) && (
        <div className="flex justify-between items-center">
          {label && (
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              {label}
            </label>
          )}
          {hint && (
            <span className="text-[11px] text-on-surface-variant font-medium">{hint}</span>
          )}
        </div>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg pointer-events-none">
            {icon}
          </span>
        )}
        <input
          {...rest}
          type={inputType}
          dir={rest.dir}
          className={`w-full text-right placeholder:text-right bg-white border rounded-xl py-3 sm:py-3.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm transition-all text-on-surface placeholder:text-outline ${
            icon ? 'pr-11' : 'pr-4'
          } ${isPassword ? 'pl-11' : 'pl-4'} ${
            error ? 'border-red-400 ring-1 ring-red-400/20' : 'border-outline/40'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg cursor-pointer hover:text-primary transition-colors"
            tabIndex={-1}
          >
            {showPassword ? 'visibility_off' : 'visibility'}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs font-medium mt-0.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
