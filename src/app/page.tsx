import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/sections/HeroSection';
import { CategoriesSection } from '@/components/sections/CategoriesSection';
import { FeaturedListSection } from '@/components/sections/FeaturedListSection';
import { BenefitsSection } from '@/components/sections/BenefitsSection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { CTASection } from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <CategoriesSection />
      <FeaturedListSection />
      <BenefitsSection />
      <ReviewsSection />
      <CTASection />
    </Layout>
  );
}
