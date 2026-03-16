import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Award, ArrowRight, ExternalLink } from 'lucide-react';
import { useCertificates } from '@/hooks/useCertificates';

const MyCertificates = () => {
  const { certificates, isLoading } = useCertificates();

  return (
    <Layout>
      <section className="py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
            <p className="text-muted-foreground">Your earned certificates of completion</p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !certificates?.length ? (
            <div className="bg-card rounded-2xl border shadow-card p-12 text-center">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
              <p className="text-muted-foreground mb-6">
                Complete a course to earn your first certificate
              </p>
              <Link to="/courses">
                <Button>
                  Browse Courses
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/certificate/${cert.certificate_number}`}>
                    <div className="bg-card rounded-2xl border shadow-card p-6 card-hover">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Award className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-1 truncate">{cert.course_title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Issued {new Date(cert.issued_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {cert.certificate_number}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MyCertificates;
