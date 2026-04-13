'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WelcomeModal } from '@/components/welcome-modal';
import { useListings, useJobs } from '@/lib/api';
import {
  HeroSection,
  CategoriesSection,
  FeaturedShowroom,
  QuickServicesGrid,
  JobsSection,
  NewsletterCta,
} from '@/features/home';

export default function Home() {
  const { data: featuredData, isLoading: featuredLoading } = useListings({ page: '1', limit: '4' });
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ limit: '6' });

  return (
    <>
      <Navbar />
      <WelcomeModal />

      <main>
        {/* 1. Hero + integrated search */}
        <HeroSection />

        {/* 2. Browse categories — 6 main sections */}
        <CategoriesSection />

        {/* 3. Featured cars (sale + rental) */}
        <FeaturedShowroom
          items={featuredData?.items ?? []}
          isLoading={featuredLoading}
        />

        {/* 4. Services & transport quick links */}
        <QuickServicesGrid />

        {/* 5. Driver jobs */}
        <JobsSection
          items={jobsData?.items ?? []}
          isLoading={jobsLoading}
        />

        {/* 6. Newsletter CTA */}
        <NewsletterCta />
      </main>

      <Footer />
    </>
  );
}
