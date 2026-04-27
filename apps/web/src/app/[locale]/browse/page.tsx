import type { Metadata } from 'next'
import { BrowseGlobalShell } from '@/features/listings/components/BrowseGlobalShell'

export const metadata: Metadata = {
  title: 'تصفّح كل الإعلانات — سوق وان',
  description: 'ابحث وتصفح كل الإعلانات في عُمان (سيارات، حافلات، قطع غيار، خدمات، وظائف) من مكان واحد.',
}

export default function BrowseGlobalPage() {
  return <BrowseGlobalShell />
}
