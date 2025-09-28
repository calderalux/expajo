import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/sections/HeroSection';
import { ExperiencesSection } from '@/components/sections/ExperiencesSection';
import { PlanFormSection } from '@/components/sections/PlanFormSection';
import { WhatDoYouNeedSection } from '@/components/sections/WhatDoYouNeedSection';
import { FeaturedPackagesSection } from '@/components/sections/FeaturedPackagesSection';
import { TrustedPartnerSection } from '@/components/sections/TrustedPartnerSection';
import { TestimonialSection } from '@/components/sections/TestimonialSection';
import { CTASection } from '@/components/sections/CTASection';
import { FAQSection } from '@/components/sections/FAQSection';

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <ExperiencesSection />
      <PlanFormSection />
      <WhatDoYouNeedSection />
      <FeaturedPackagesSection />
      <TrustedPartnerSection />
      <TestimonialSection />
      <CTASection />
      <FAQSection />
    </Layout>
  );
}
