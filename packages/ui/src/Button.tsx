import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full';

  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-l from-[#0058bc] to-[#0070eb] text-white hover:opacity-90',
    secondary: 'bg-[#006e28] text-white hover:opacity-90',
    outline: 'border border-[#c1c6d7] text-[#1a1c1f] hover:bg-[#f3f3f8]',
    ghost: 'text-[#1a1c1f] hover:bg-[#f3f3f8]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
