import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Target, Heart, Globe, Award, Users, Lightbulb } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Practical Learning',
    description: 'Every concept is taught with real-world applications in mind.',
  },
  {
    icon: Heart,
    title: 'Student First',
    description: 'Your success is our success. We\'re here to support you every step.',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Optimized for learners worldwide, especially in emerging markets.',
  },
  {
    icon: Award,
    title: 'Quality Content',
    description: 'Carefully crafted curriculum by industry professionals.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Join a supportive network of learners and mentors.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Constantly updating our courses with the latest technologies.',
  },
];

const About = () => {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="gradient-text">Dynamic Tech Academy</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Empowering the next generation of developers through accessible, 
              high-quality programming education.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto bg-card rounded-2xl border shadow-card p-8 md:p-12 mb-16"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Our Mission</h2>
            <p className="text-muted-foreground text-center text-lg leading-relaxed">
              To break down barriers in tech education by providing structured, practical, 
              and affordable programming courses. We believe everyone deserves the opportunity 
              to learn how to code, regardless of their background or location.
            </p>
          </motion.div>

          {/* Instructor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold text-center mb-8">
              Meet Your <span className="gradient-text">Instructor</span>
            </h2>
            <div className="bg-card rounded-2xl border shadow-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-5xl font-bold shrink-0">
                LL
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Leonard Lifu</h3>
                <p className="text-primary font-medium mb-4">Founder & Lead Instructor</p>
                <p className="text-muted-foreground leading-relaxed">
                  Leonard is a passionate software developer and educator with over 10 years of 
                  experience in the tech industry. He founded Dynamic Tech Academy with a simple 
                  goal: to make programming education accessible to everyone, especially learners 
                  in underserved communities. His teaching style focuses on practical, hands-on 
                  learning that builds real-world skills.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">
              Our <span className="gradient-text">Values</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl border shadow-card p-6 card-hover"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
