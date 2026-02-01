import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your <span className="gradient-text">Coding Journey?</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students who have already started learning with Dynamic Tech Academy. 
            Begin with our free course today!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="xl">
                Browse Courses
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required. Start learning in minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
