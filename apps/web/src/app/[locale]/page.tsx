'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WelcomeModal } from '@/components/welcome-modal';
import { useListings, useJobs } from '@/lib/api';
import { useBusListings } from '@/lib/api/buses';
import { useParts } from '@/lib/api/parts';
import { useInsuranceOffers } from '@/lib/api/insurance';
import { useEquipmentListings } from '@/lib/api/equipment';
import {
  HeroSection,
  CategoriesSection,
  FeaturedShowroom,
  BusesShowcase,
  PartsShowcase,
  EquipmentShowcase,
  InsuranceShowcase,
  QuickServicesGrid,
  JobsSection,
  NewsletterCta,
} from '@/features/home';

export default function Home() {
  const { data: featuredData, isLoading: featuredLoading } = useListings({ page: '1', limit: '4' });
  const { data: busesData, isLoading: busesLoading } = useBusListings({ page: '1', limit: '4' });
  const { data: partsData, isLoading: partsLoading } = useParts({ page: '1', limit: '4' });
  const { data: insuranceData, isLoading: insuranceLoading } = useInsuranceOffers({ page: '1', limit: '4' });
  const { data: equipmentData, isLoading: equipmentLoading } = useEquipmentListings({ page: '1', limit: '4' });
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ limit: '6' });

  return (
    <>
      <Navbar />
      <WelcomeModal />

      <main>
        {/* 1. Hero + integrated search */}
        <HeroSection />

        {/* 2. Browse categories — 7 main sections */}
        <CategoriesSection />

        {/* 3. Featured cars (sale + rental) */}
        <FeaturedShowroom
          items={featuredData?.items ?? []}
          isLoading={featuredLoading}
        />

        {/* 4. Latest buses */}
        <BusesShowcase
          items={busesData?.items ?? []}
          isLoading={busesLoading}
        />

        {/* 5. Latest spare parts */}
        <PartsShowcase
          items={partsData?.items ?? []}
          isLoading={partsLoading}
        />

        {/* 6. Quick services grid */}
        <QuickServicesGrid />

        {/* 7. Latest equipment */}
        <EquipmentShowcase
          items={equipmentData?.items ?? []}
          isLoading={equipmentLoading}
        />

        {/* 8. Insurance offers */}
        <InsuranceShowcase
          items={insuranceData?.items ?? []}
          isLoading={insuranceLoading}
        />

        {/* 9. Driver jobs */}
        <JobsSection
          items={jobsData?.items ?? []}
          isLoading={jobsLoading}
        />

        {/* 10. Newsletter CTA */}
        <NewsletterCta />
      </main>

      <Footer />
    </>
  );
}
