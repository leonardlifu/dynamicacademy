import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Award, Download, Share2, Calendar, Hash } from 'lucide-react';
import { useCertificateByNumber } from '@/hooks/useCertificates';
import { useRef } from 'react';

const Certificate = () => {
  const { certNumber } = useParams<{ certNumber: string }>();
  const { data: cert, isLoading, error } = useCertificateByNumber(certNumber || '');
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `Certificate - ${cert?.course_title}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading certificate...</div>
        </div>
      </Layout>
    );
  }

  if (error || !cert) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Certificate Not Found</h1>
          <p className="text-muted-foreground">This certificate does not exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Layout>
      {/* Action buttons - hidden in print */}
      <div className="container mx-auto px-4 py-6 print:hidden">
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={handlePrint}>
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Certificate */}
      <div className="container mx-auto px-4 pb-16">
        <motion.div
          ref={certRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative bg-card border-4 border-primary/20 rounded-2xl p-12 md:p-16 shadow-xl overflow-hidden print:shadow-none print:border-2">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-primary/30 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-primary/30 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-primary/30 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-primary/30 rounded-br-2xl" />

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
                backgroundSize: '20px 20px',
              }} />
            </div>

            <div className="relative text-center space-y-8">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-10 h-10 text-primary" />
                </div>
              </div>

              {/* Title */}
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium mb-2">
                  Certificate of Completion
                </p>
                <div className="w-24 h-0.5 bg-primary/30 mx-auto" />
              </div>

              {/* Presented to */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">This certifies that</p>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {cert.full_name}
                </h1>
              </div>

              {/* Course */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">has successfully completed the course</p>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                  {cert.course_title}
                </h2>
              </div>

              <div className="w-16 h-0.5 bg-primary/20 mx-auto" />

              {/* Details */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {issuedDate}
                </span>
                <span className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  {cert.certificate_number}
                </span>
              </div>

              {/* Signature line */}
              <div className="pt-4">
                <div className="w-48 h-px bg-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Dynamic Academy</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Certificate;
