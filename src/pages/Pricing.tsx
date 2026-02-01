import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started with programming basics',
    features: [
      'Programming Foundations Course',
      '6 comprehensive modules',
      'Text-based lessons',
      'Basic quizzes and exercises',
      'Community forum access',
      'Mobile-friendly learning',
      'Learn at your own pace',
    ],
    cta: 'Start Free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: 49,
    period: 'one-time',
    description: 'Everything you need to become a job-ready developer',
    features: [
      'All Free features',
      'Web Development Essentials Course',
      'Python for Beginners Course',
      'Video lessons and tutorials',
      'Downloadable resources',
      'Completion certificates',
      'Priority email support',
      'Project code reviews',
      'Access to all future updates',
    ],
    cta: 'Get Pro Access',
    href: '/signup',
    popular: true,
  },
  {
    name: 'Team',
    price: 199,
    period: 'per month',
    description: 'For organizations and learning groups',
    features: [
      'All Pro features',
      'Up to 10 team members',
      'Admin dashboard',
      'Progress tracking for all members',
      'Custom learning paths',
      'Bulk enrollment management',
      'Dedicated support',
      'Monthly progress reports',
      'Custom branding options',
    ],
    cta: 'Contact Us',
    href: '/contact',
    popular: false,
  },
];

const Pricing = () => {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start for free, upgrade when you're ready. No hidden fees, no subscriptions required.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-card rounded-2xl border shadow-card ${
                  plan.popular ? 'border-primary ring-2 ring-primary/20 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                    <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold">${plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground">/{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={plan.href} className="block">
                    <Button
                      variant={plan.popular ? 'hero' : 'outline'}
                      className="w-full"
                      size="lg"
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Questions?</h2>
            <p className="text-muted-foreground mb-6">
              We offer a 30-day money-back guarantee on all paid plans. 
              No questions asked.
            </p>
            <Link to="/contact">
              <Button variant="outline">Contact Us</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Pricing;
