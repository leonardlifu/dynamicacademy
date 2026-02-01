import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, ArrowRight, Star, Users } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';

const difficultyColors = {
  beginner: 'bg-success/10 text-success border-success/20',
  intermediate: 'bg-warning/10 text-warning border-warning/20',
  advanced: 'bg-destructive/10 text-destructive border-destructive/20',
};

const Courses = () => {
  const { data: courses, isLoading } = useCourses();

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
              Our <span className="gradient-text">Courses</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From complete beginner to confident developer. Choose your path and start learning today.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses?.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="h-full bg-card rounded-2xl border shadow-card overflow-hidden card-hover flex flex-col">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                      <BookOpen className="w-20 h-20 text-primary/40" />
                      {course.is_free && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-success text-success-foreground">
                            Free Course
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge 
                          variant="outline" 
                          className={difficultyColors[course.difficulty_level as keyof typeof difficultyColors] || ''}
                        >
                          {course.difficulty_level}
                        </Badge>
                      </div>

                      <h2 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                        {course.title}
                      </h2>
                      
                      <p className="text-muted-foreground text-sm mb-4 flex-1">
                        {course.short_description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration_hours} hours
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          500+ students
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning" />
                          4.9
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        {course.is_free ? (
                          <span className="text-2xl font-bold text-success">Free</span>
                        ) : (
                          <span className="text-2xl font-bold">${course.price}</span>
                        )}
                        <Link to={`/courses/${course.slug}`}>
                          <Button>
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
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Courses;
