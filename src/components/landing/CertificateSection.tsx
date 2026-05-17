import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Download, Globe, ShieldCheck, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CertificateSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Certificate of Completion
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Earn a verifiable <span className="gradient-text">certificate</span>
          </h2>
          <p className="text-muted-foreground">
            Complete every lesson in a course and we'll automatically issue your
            Dynamic Tech Academy certificate — share the link, download the PDF,
            and showcase your skills.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-center">
          {/* Certificate preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-accent/30 blur-2xl rounded-3xl" />
              <div className="relative aspect-[1.4/1] rounded-2xl border-2 border-primary/30 bg-card shadow-2xl p-8 md:p-10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_60%)]" />
                <div className="relative h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Award className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground leading-none">Dynamic Tech</p>
                        <p className="text-sm font-bold leading-none">Academy</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Verified
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Certificate of Completion
                    </p>
                    <p className="text-sm text-muted-foreground">This is to certify that</p>
                    <h3 className="text-2xl md:text-3xl font-bold gradient-text my-2">
                      Your Name Here
                    </h3>
                    <p className="text-sm text-muted-foreground">has successfully completed</p>
                    <p className="text-base md:text-lg font-semibold mt-1">
                      Web Development Essentials
                    </p>
                  </div>

                  <div className="flex items-end justify-between text-[10px] md:text-xs text-muted-foreground">
                    <div>
                      <p className="font-mono">DTA-2026-XXXX</p>
                      <p>Certificate ID</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">Dynamic Tech Academy</p>
                      <p>Issuing Authority</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-4"
          >
            {[
              { icon: CheckCircle, title: 'Auto-issued at 100%', desc: 'Finish every lesson and the certificate appears in your dashboard instantly.' },
              { icon: Globe, title: 'Public, shareable link', desc: 'Anyone with the link can verify your credential — perfect for LinkedIn.' },
              { icon: Download, title: 'Downloadable PDF', desc: 'Save it locally, print it, or attach it to job applications.' },
              { icon: Share2, title: 'Unique certificate ID', desc: 'Each credential has a unique number for tamper-proof verification.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-card border hover:border-primary/40 transition-colors">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/courses">
                <Button variant="hero">Start a course</Button>
              </Link>
              <Link to="/certificates">
                <Button variant="outline">My certificates</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
