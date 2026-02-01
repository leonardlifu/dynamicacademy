import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCourses } from '@/hooks/useCourses';

const difficultyColors = {
  beginner: 'bg-success/10 text-success border-success/20',
  intermediate: 'bg-warning/10 text-warning border-warning/20',
  advanced: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const CoursesSection = () => {
  const { data: courses, isLoading } = useCourses();

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto mb-4" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Learning <span className="gradient-text">Paths</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose your path and start building real-world skills today. 
            From complete beginner to job-ready developer.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-card rounded-2xl border shadow-card overflow-hidden card-hover">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-primary/50" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant="outline" 
                      className={difficultyColors[course.difficulty_level as keyof typeof difficultyColors] || ''}
                    >
                      {course.difficulty_level}
                    </Badge>
                    {course.is_free && (
                      <Badge className="bg-success text-success-foreground">
                        Free
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {course.short_description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration_hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning" />
                      4.9
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {course.is_free ? (
                      <span className="text-2xl font-bold text-success">Free</span>
                    ) : (
                      <span className="text-2xl font-bold">${course.price}</span>
                    )}
                    <Link to={`/courses/${course.slug}`}>
                      <Button variant="default" size="sm">
                        View Course
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/courses">
            <Button variant="heroOutline" size="lg">
              View All Courses
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
