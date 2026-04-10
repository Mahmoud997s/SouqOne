import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-8">
      <span className="material-symbols-outlined text-8xl text-outline mb-6">explore_off</span>
      <h1 className="text-5xl font-extrabold text-on-surface mb-3">404</h1>
      <p className="text-xl text-on-surface-variant mb-8">الصفحة التي تبحث عنها غير موجودة</p>
      <div className="flex gap-4">
        <Link href="/" className="bg-primary text-on-primary hover:brightness-110 rounded-lg shadow-ambient px-8 py-3 text-sm font-bold">
          الصفحة الرئيسية
        </Link>
        <Link href="/listings" className="border border-outline-variant rounded-full px-8 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-low transition-all">
          تصفح السوق
        </Link>
      </div>
    </div>
  );
}
