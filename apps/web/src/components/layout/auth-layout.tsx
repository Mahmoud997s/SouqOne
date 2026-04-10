import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  heroTitle: React.ReactNode;
  heroSubtitle: React.ReactNode;
  formTitle: string;
  formSubtitle: string;
}

export function AuthLayout({ children, heroTitle, heroSubtitle, formTitle, formSubtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 lg:p-12 overflow-hidden">
      {/* Premium Fullscreen Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/90 via-black/50 to-brand-navy/90" />
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)' }} />

      <div className="relative z-10 w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 rounded-[2.5rem] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10">
        
        {/* Left — Text Panel */}
        <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-black/40 text-white backdrop-blur-md text-center">
          <div className="flex flex-col items-center gap-3 mb-8">
            <img src="/logo.png" alt="SouqOne" className="h-[120px] w-auto object-contain drop-shadow-2xl" />
            <img src="/name.png" alt="سوق وان" className="h-[48px] w-auto object-contain brightness-0 invert drop-shadow-md" />
          </div>
          <h2 className="text-3xl font-black mb-4 leading-tight">{heroTitle}</h2>
          <p className="text-white/80 text-base font-medium leading-relaxed max-w-sm">{heroSubtitle}</p>
        </div>

        {/* Right — Form Panel */}
        <div className="bg-white/40 border-r border-white/20 backdrop-blur-[40px] backdrop-saturate-150 p-8 md:p-12 flex flex-col justify-center relative">
          <div className="mb-8 flex lg:hidden items-center gap-3">
            <img src="/logo.png" alt="SouqOne" className="h-[42px] w-auto object-contain" />
            <img src="/name.png" alt="سوق وان" className="h-[24px] w-auto object-contain" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-white mb-2 text-center">{formTitle}</h1>
          <p className="text-white/80 mb-8 font-medium text-center">{formSubtitle}</p>

          {children}
        </div>
      </div>
    </div>
  );
}
