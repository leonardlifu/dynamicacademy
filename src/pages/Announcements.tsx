import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Bell, Megaphone, Info, AlertTriangle } from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { format } from 'date-fns';

const priorityConfig = {
  low: { icon: Info, color: 'bg-muted text-muted-foreground' },
  normal: { icon: Bell, color: 'bg-primary/10 text-primary' },
  high: { icon: Megaphone, color: 'bg-warning/10 text-warning' },
  urgent: { icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
};

const Announcements = () => {
  const { data: announcements, isLoading } = useAnnouncements();

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
              <span className="gradient-text">Announcements</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest news, updates, and important information 
              from Dynamic Tech Academy.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : announcements?.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No announcements yet</h2>
              <p className="text-muted-foreground">Check back later for updates!</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {announcements?.map((announcement, index) => {
                const priority = announcement.priority as keyof typeof priorityConfig;
                const config = priorityConfig[priority] || priorityConfig.normal;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-2xl border shadow-card p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="font-bold text-lg">{announcement.title}</h2>
                          <Badge variant="outline" className={config.color}>
                            {priority}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line mb-3">
                          {announcement.content}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(announcement.created_at), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Announcements;
