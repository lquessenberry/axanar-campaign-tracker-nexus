import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle, Play, RefreshCw, Database } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export const CanonicalRewardsButton = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [phase, setPhase] = useState<string>('');
  const [stats, setStats] = useState<{
    created?: number;
    duplicates?: number;
    reassigned?: number;
    deleted?: number;
  }>({});
  const [results, setResults] = useState<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  const runCanonicalRewards = async () => {
    setLoading(true);
    setLogs([]);
    setPhase('Starting...');
    setStats({});
    setResults(null);
    
    addLog('Initiating canonical rewards restoration...', 'info');
    addLog('Calling edge function (this may take 1-2 minutes)...', 'info');

    try {
      const { data, error } = await supabase.functions.invoke('create-canonical-rewards');
      
      if (error) {
        addLog(`Error: ${error.message}`, 'error');
        toast.error('Failed to run canonical rewards restoration', {
          description: error.message,
        });
        setPhase('Failed');
      } else {
        setResults(data);
        addLog('Edge function completed!', 'success');
        
        // Parse the response for detailed stats
        if (data) {
          if (data.phase2) {
            addLog(`Phase 2: Created ${data.phase2.created} canonical rewards`, 'success');
            addLog(`Phase 2: Found ${data.phase2.duplicates} duplicate rewards to clean up`, 'info');
            setStats(prev => ({ ...prev, created: data.phase2.created, duplicates: data.phase2.duplicates }));
          }
          
          if (data.phase3) {
            addLog(`Phase 3: Reassigned ${data.phase3.totalReassigned} pledges from duplicates`, 'success');
            if (data.phase3.details) {
              data.phase3.details.forEach((d: any) => {
                addLog(`  → ${d.from} → ${d.to}: ${d.count} pledges`, 'info');
              });
            }
            setStats(prev => ({ ...prev, reassigned: data.phase3.totalReassigned }));
          }
          
          if (data.phase4) {
            addLog(`Phase 4: Deleted ${data.phase4.deleted} orphaned duplicate rewards`, 'success');
            setStats(prev => ({ ...prev, deleted: data.phase4.deleted }));
          }
          
          if (data.phase5) {
            addLog(`Phase 5: Assigned ${data.phase5.assigned} unassigned pledges by amount`, 'success');
          }
          
          setPhase('Completed');
          toast.success('Canonical rewards restoration complete!');
        }
      }
    } catch (err: any) {
      addLog(`Exception: ${err.message}`, 'error');
      toast.error('Error running canonical rewards', {
        description: err.message,
      });
      setPhase('Failed');
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />;
      default: return <div className="h-4 w-4 rounded-full bg-blue-500/50 shrink-0" />;
    }
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Canonical Rewards Restoration</h3>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          onClick={runCanonicalRewards} 
          disabled={loading}
          variant="destructive"
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Canonical Rewards Restoration
            </>
          )}
        </Button>
        
        {phase && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            phase === 'Completed' ? 'bg-green-500/20 text-green-400' :
            phase === 'Failed' ? 'bg-red-500/20 text-red-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            {phase}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.created !== undefined && (
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">{stats.created}</div>
              <div className="text-sm text-muted-foreground">Canonical Rewards Created</div>
            </div>
          )}
          {stats.duplicates !== undefined && (
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-500">{stats.duplicates}</div>
              <div className="text-sm text-muted-foreground">Duplicates Found</div>
            </div>
          )}
          {stats.reassigned !== undefined && (
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-green-500">{stats.reassigned}</div>
              <div className="text-sm text-muted-foreground">Pledges Reassigned</div>
            </div>
          )}
          {stats.deleted !== undefined && (
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-red-500">{stats.deleted}</div>
              <div className="text-sm text-muted-foreground">Duplicates Deleted</div>
            </div>
          )}
        </div>
      )}

      {/* Live Logs */}
      {logs.length > 0 && (
        <div className="bg-black/50 border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-muted border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">Execution Log</span>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Processing...
              </div>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto p-4 font-mono text-sm space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                {getLogIcon(log.type)}
                <span className="text-muted-foreground">[{log.timestamp}]</span>
                <span className={
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  'text-foreground'
                }>
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {/* Raw Results */}
      {results && (
        <div className="p-4 bg-muted rounded-lg text-sm">
          <h4 className="font-medium mb-2">Raw Results:</h4>
          <pre className="whitespace-pre-wrap overflow-auto max-h-48 text-xs">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-muted-foreground space-y-2">
        <p><strong>What this does:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Phase 1: Creates canonical reward records for all 3 campaigns</li>
          <li>Phase 2: Identifies duplicate rewards with the same campaign + amount</li>
          <li>Phase 3: Reassigns pledges from duplicates to canonical rewards (in batches)</li>
          <li>Phase 4: Deletes orphaned duplicate rewards</li>
          <li>Phase 5: Assigns any remaining unassigned pledges by amount</li>
        </ul>
      </div>
    </div>
  );
};
