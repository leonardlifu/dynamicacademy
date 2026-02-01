import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Amara Johnson',
    role: 'Web Developer',
    avatar: 'AJ',
    content: 'Dynamic Tech Academy transformed my career. I went from knowing nothing about coding to landing my first developer job in just 6 months!',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Software Engineer',
    avatar: 'DC',
    content: 'The structured curriculum and hands-on projects made learning to code actually enjoyable. Leonard is an amazing instructor.',
    rating: 5,
  },
  {
    name: 'Sarah Okonkwo',
    role: 'Freelance Developer',
    avatar: 'SO',
    content: 'As someone from Africa with limited internet, the performance-optimized content and downloadable resources were a game-changer.',
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="gradient-text">Students Say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students who have transformed their careers with Dynamic Tech Academy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border shadow-card p-6 card-hover"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>

              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              
              <p className="text-muted-foreground mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
