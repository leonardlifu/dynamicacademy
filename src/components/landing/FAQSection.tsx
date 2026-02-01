import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Do I need any prior programming experience?',
    answer: 'Not at all! Our Programming Foundations course is designed for complete beginners. We start from the very basics and gradually build up your skills.',
  },
  {
    question: 'How long do I have access to the courses?',
    answer: 'Once you enroll in a course, you have lifetime access. Learn at your own pace and revisit the material whenever you need a refresher.',
  },
  {
    question: 'Are the certificates recognized?',
    answer: 'Yes, our completion certificates demonstrate your skills and can be shared on LinkedIn or added to your resume. Many of our students have used them to land jobs.',
  },
  {
    question: 'Can I learn on my mobile device?',
    answer: 'Absolutely! Our platform is fully responsive and optimized for mobile learning. You can learn on any device, anywhere.',
  },
  {
    question: 'What if I get stuck on a lesson?',
    answer: 'We have a community forum where you can ask questions and get help from instructors and fellow students. Pro members also get priority support.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee on all paid courses. If you\'re not satisfied, just let us know.',
  },
];

export const FAQSection = () => {
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
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions? We've got answers. If you don't see what you're looking for, 
            feel free to contact us.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border rounded-xl px-6 shadow-card"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
