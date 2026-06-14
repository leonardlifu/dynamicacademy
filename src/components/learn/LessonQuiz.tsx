import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  lessonId: string;
  onPassed: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export const LessonQuiz = ({ lessonId, onPassed }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  const { data: quiz } = useQuery({
    queryKey: ['quiz', lessonId],
    queryFn: async () => {
      const { data } = await supabase.from('quizzes').select('*').eq('lesson_id', lessonId).maybeSingle();
      return data;
    },
  });

  const { data: questions } = useQuery({
    queryKey: ['quiz-questions', quiz?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('quiz_questions')
        .select('id, question, options, order_index')
        .eq('quiz_id', quiz!.id)
        .order('order_index');
      return data || [];
    },
    enabled: !!quiz?.id,
  });

  const { data: bestAttempt } = useQuery({
    queryKey: ['quiz-best', quiz?.id, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quiz!.id)
        .eq('user_id', user!.id)
        .order('score', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.passed) onPassed();
      return data;
    },
    enabled: !!quiz?.id && !!user?.id,
  });

  const submit = useMutation({
    mutationFn: async () => {
      const arr = (questions || []).map((_, i) => answers[i] ?? -1);
      const { data, error } = await supabase.rpc('grade_quiz_attempt', {
        p_quiz_id: quiz!.id,
        p_answers: arr,
      });
      if (error) throw error;
      const r = (data as any)[0];
      await supabase.from('quiz_attempts').insert({
        quiz_id: quiz!.id,
        user_id: user!.id,
        score: r.score,
        passed: r.passed,
        answers: arr,
      });
      return r;
    },
    onSuccess: (r) => {
      setResult({ score: r.score, passed: r.passed });
      qc.invalidateQueries({ queryKey: ['quiz-best', quiz?.id, user?.id] });
      if (r.passed) {
        toast.success(`Passed with ${r.score}%!`);
        onPassed();
      } else {
        toast.error(`Scored ${r.score}%. Try again to pass.`);
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!quiz || !questions?.length) return null;

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const alreadyPassed = bestAttempt?.passed;

  return (
    <div className="bg-card rounded-2xl border shadow-card p-6 md:p-8 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Lesson Quiz</h2>
        {alreadyPassed && (
          <span className="ml-auto inline-flex items-center gap-1 text-sm text-success">
            <CheckCircle className="w-4 h-4" /> Passed ({bestAttempt.score}%)
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Pass with {quiz.passing_score}% or higher to continue to the next lesson.
      </p>

      <div className="space-y-6">
        {questions.map((q, qi) => {
          const opts = (q.options as string[]) || [];
          return (
            <div key={q.id}>
              <p className="font-medium mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {opts.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => !alreadyPassed && setAnswers({ ...answers, [qi]: oi })}
                      disabled={alreadyPassed}
                      className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted'
                      } ${alreadyPassed ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        selected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {LETTERS[oi]}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!alreadyPassed && (
        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={() => submit.mutate()}
            disabled={!allAnswered || submit.isPending}
            variant="hero"
          >
            Submit Quiz
          </Button>
          {result && (
            <span className={`flex items-center gap-1 text-sm ${result.passed ? 'text-success' : 'text-destructive'}`}>
              {result.passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              Score: {result.score}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};
