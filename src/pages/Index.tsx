import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/landing/Hero';
import { CoursesSection } from '@/components/landing/CoursesSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <CoursesSection />
      <Testimonials />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
