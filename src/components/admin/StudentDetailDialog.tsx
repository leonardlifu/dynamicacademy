import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle } from 'lucide-react';
import { useAdminQuizResults, useAdminStudentProgress } from '@/hooks/useAdminData';

interface Props {
  student: { user_id: string; full_name: string | null; email: string | null } | null;
  onOpenChange: (open: boolean) => void;
}

export const StudentDetailDialog = ({ student, onOpenChange }: Props) => {
  const { data: progress, isLoading: loadingProgress } = useAdminStudentProgress(student?.user_id);
  const { data: quizzes } = useAdminQuizResults(student?.user_id);

  const byCourse = (progress ?? []).reduce<Record<string, typeof progress>>((acc, row) => {
    const key = row.course_title ?? 'Course';
    (acc[key] ||= [] as never)!.push(row as never);
    return acc;
  }, {});

  return (
    <Dialog open={!!student} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{student?.full_name || student?.email || 'Student'}</DialogTitle>
          <p className="text-sm text-muted-foreground">{student?.email}</p>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Lesson progress</h3>
              {loadingProgress && <p className="text-sm text-muted-foreground">Loading…</p>}
              {!loadingProgress && Object.keys(byCourse).length === 0 && (
                <p className="text-sm text-muted-foreground">Not enrolled in any course yet.</p>
              )}
              <div className="space-y-4">
                {Object.entries(byCourse).map(([course, rows]) => {
                  const list = rows ?? [];
                  const done = list.filter((r) => r.is_completed).length;
                  const pct = list.length ? Math.round((done / list.length) * 100) : 0;
                  return (
                    <div key={course} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{course}</p>
                        <span className="text-sm text-muted-foreground">
                          {done}/{list.length} lessons
                        </span>
                      </div>
                      <Progress value={pct} className="h-2 mb-3" />
                      <div className="space-y-1">
                        {list.map((row) => (
                          <div key={row.lesson_id} className="flex items-center gap-2 text-sm">
                            {row.is_completed ? (
                              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <span className={row.is_completed ? '' : 'text-muted-foreground'}>
                              {row.lesson_title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Quiz results</h3>
              {(!quizzes || quizzes.length === 0) && (
                <p className="text-sm text-muted-foreground">No quiz attempts yet.</p>
              )}
              <div className="space-y-2">
                {quizzes?.map((q) => (
                  <div
                    key={q.attempt_id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{q.lesson_title}</p>
                      <p className="text-xs text-muted-foreground truncate">{q.course_title}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold">{q.score}%</span>
                      <Badge variant={q.passed ? 'default' : 'destructive'}>
                        {q.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
