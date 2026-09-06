import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { html as htmlLang } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Terminal, Loader2, Save, Check, CloudOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Language = 'python' | 'javascript' | 'html';

interface Props {
  lessonId: string;
  language: Language;
  starterCode?: string;
  hint?: string;
}

declare global {
  interface Window {
    loadPyodide?: (opts?: { indexURL?: string }) => Promise<unknown>;
    __pyodide?: unknown;
  }
}

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

const DEFAULTS: Record<Language, string> = {
  python: '# Try it yourself\nname = "Learner"\nprint(f"Hello, {name}! Ready to practise?")\n',
  javascript: '// Try it yourself\nconst name = "Learner";\nconsole.log(`Hello, ${name}! Ready to practise?`);\n',
  html: '<!-- Try it yourself -->\n<h1>Hello, Learner!</h1>\n<p>Edit this markup and press Run.</p>\n',
};

const extensionsFor = (language: Language) => {
  if (language === 'python') return [python()];
  if (language === 'javascript') return [javascript()];
  return [htmlLang()];
};

const loadPyodideOnce = async (onStatus: (s: string) => void) => {
  if (window.__pyodide) return window.__pyodide;
  if (!window.loadPyodide) {
    onStatus('Downloading Python runtime (one-time, ~6 MB)...');
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${PYODIDE_URL}pyodide.js`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load the Python runtime. Check your connection.'));
      document.head.appendChild(script);
    });
  }
  onStatus('Starting Python...');
  window.__pyodide = await window.loadPyodide!({ indexURL: PYODIDE_URL });
  return window.__pyodide;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export const CodePlayground = ({ lessonId, language, starterCode, hint }: Props) => {
  const { user } = useAuth();
  const initial = useMemo(
    () => (starterCode && starterCode.trim() ? starterCode : DEFAULTS[language]),
    [starterCode, language],
  );
  const storageKey = `playground:${lessonId}`;

  const [code, setCode] = useState(() => localStorage.getItem(storageKey) ?? initial);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [loading, setLoading] = useState(true);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const dirtyRef = useRef(false);

  // Load saved work from the student's account (falls back to local draft).
  useEffect(() => {
    let cancelled = false;
    dirtyRef.current = false;
    setOutput('');
    setStatus('');
    setSaveState('idle');
    setLoading(true);

    const local = localStorage.getItem(storageKey);
    setCode(local ?? initial);

    if (!user) {
      setLoading(false);
      return () => { cancelled = true; };
    }

    (async () => {
      const { data, error } = await supabase
        .from('lesson_code')
        .select('code')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      if (cancelled) return;
      if (!error && data?.code) setCode(data.code);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [storageKey, initial, lessonId, user]);

  // Keep a local draft so work is never lost offline.
  useEffect(() => {
    const id = setTimeout(() => localStorage.setItem(storageKey, code), 400);
    return () => clearTimeout(id);
  }, [code, storageKey]);

  const persist = useCallback(
    async (value: string, silent = true) => {
      if (!user) {
        if (!silent) toast.error('Sign in to save your work to your account.');
        return;
      }
      setSaveState('saving');
      const { error } = await supabase
        .from('lesson_code')
        .upsert(
          { user_id: user.id, lesson_id: lessonId, language, code: value },
          { onConflict: 'user_id,lesson_id' },
        );
      if (error) {
        setSaveState('error');
        if (!silent) toast.error('Could not save your work. Try again.');
        return;
      }
      dirtyRef.current = false;
      setSaveState('saved');
      if (!silent) toast.success('Work saved to your account');
    },
    [user, lessonId, language],
  );

  // Autosave after a pause in typing.
  useEffect(() => {
    if (loading || !user || !dirtyRef.current) return;
    const id = setTimeout(() => persist(code), 1200);
    return () => clearTimeout(id);
  }, [code, loading, user, persist]);

  const onChange = (value: string) => {
    dirtyRef.current = true;
    setSaveState('idle');
    setCode(value);
  };

  const runJs = () => {
    const lines: string[] = [];
    const push = (...args: unknown[]) =>
      lines.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    const original = { log: console.log, error: console.error, warn: console.warn };
    console.log = push;
    console.error = push;
    console.warn = push;
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(code)();
      if (result !== undefined) push(result);
    } catch (err) {
      push(`Error: ${(err as Error).message}`);
    } finally {
      console.log = original.log;
      console.error = original.error;
      console.warn = original.warn;
    }
    setOutput(lines.join('\n') || 'Ran successfully (no output).');
  };

  const runPython = async () => {
    try {
      const pyodide = (await loadPyodideOnce(setStatus)) as {
        loadPackagesFromImports: (code: string) => Promise<void>;
        runPythonAsync: (code: string) => Promise<unknown>;
      };
      setStatus('Running...');
      await pyodide.loadPackagesFromImports(code);
      await pyodide.runPythonAsync(
        'import sys, io\n_buf = io.StringIO()\nsys.stdout = _buf\nsys.stderr = _buf',
      );
      try {
        await pyodide.runPythonAsync(code);
      } catch (err) {
        setOutput(String((err as Error).message).split('\n').slice(-12).join('\n'));
        return;
      }
      const captured = await pyodide.runPythonAsync('_buf.getvalue()');
      setOutput(String(captured) || 'Ran successfully (no output).');
    } catch (err) {
      setOutput((err as Error).message);
    } finally {
      setStatus('');
    }
  };

  const run = async () => {
    setRunning(true);
    setOutput('');
    try {
      if (language === 'python') await runPython();
      else if (language === 'javascript') runJs();
      else if (frameRef.current) frameRef.current.srcdoc = code;
    } finally {
      setRunning(false);
    }
    if (user && dirtyRef.current) persist(code);
  };

  const reset = async () => {
    dirtyRef.current = true;
    setCode(initial);
    setOutput('');
    localStorage.removeItem(storageKey);
    await persist(initial);
  };

  const saveLabel =
    saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : saveState === 'error' ? 'Not saved' : 'Save';

  return (
    <div className="bg-card rounded-2xl border shadow-card overflow-hidden mb-8">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b bg-muted/40 flex-wrap">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Try it yourself</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {!user && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <CloudOff className="w-3.5 h-3.5" /> Sign in to save
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={reset} disabled={running}>
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => persist(code, false)}
            disabled={saveState === 'saving' || !user}
          >
            {saveState === 'saving' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveState === 'saved' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveLabel}
          </Button>
          <Button size="sm" onClick={run} disabled={running}>
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run
          </Button>
        </div>
      </div>

      {hint && <p className="px-5 pt-4 text-sm text-muted-foreground">{hint}</p>}

      <div className="p-5 space-y-4">
        <div className="rounded-xl border overflow-hidden">
          <CodeMirror
            value={code}
            height="320px"
            theme={oneDark}
            extensions={extensionsFor(language)}
            onChange={onChange}
            basicSetup={{ lineNumbers: true, highlightActiveLine: true, autocompletion: true, tabSize: 2 }}
          />
        </div>

        {language === 'html' ? (
          <div className="rounded-xl border overflow-hidden bg-background">
            <iframe ref={frameRef} title="Preview" sandbox="allow-scripts" className="w-full h-64 bg-background" />
          </div>
        ) : (
          <div className="rounded-xl border bg-muted/50 p-4 min-h-[6rem]">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Output</p>
            <pre className="font-mono text-sm whitespace-pre-wrap break-words">
              {status || output || 'Press Run to see your output here.'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
