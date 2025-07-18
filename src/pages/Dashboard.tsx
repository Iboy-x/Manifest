import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DreamCard from '@/components/ui/DreamCard';
import StreakCounter from '@/components/ui/StreakCounter';
import QuoteBox from '@/components/ui/QuoteBox';
import { getUserDreams } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentStreak, getRandomQuote } from '@/lib/dummyData';

export default function Dashboard() {
  const { user } = useAuth();
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserDreams(user.uid)
      .then(setDreams)
      .catch(() => setError('Failed to load dreams.'))
      .finally(() => setLoading(false));
  }, [user]);

  const activeDreams = dreams.slice(0, 3); // Show top 3 dreams
  const streak = getCurrentStreak();
  const quote = getRandomQuote();

  // Calculate average progress from checklist if present
  const avgProgress = dreams.length
    ? Math.round(
        dreams.reduce((acc, dream) => {
          if (dream.checklist && dream.checklist.length > 0) {
            const completed = dream.checklist.filter(item => item.done).length;
            return acc + (completed / dream.checklist.length) * 100;
          }
          return acc;
        }, 0) / dreams.length
      )
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your progress overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <StreakCounter streak={streak} size="lg" />
          <Link to="/reflection">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Today's Reflection
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="manifestor-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Dreams</p>
              <p className="text-2xl font-bold text-foreground">{dreams.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="manifestor-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Progress</p>
              <p className="text-2xl font-bold text-foreground">
                {avgProgress}%
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="manifestor-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold text-foreground">5 days</p>
              <p className="text-xs text-muted-foreground">active</p>
            </div>
            <StreakCounter streak={streak} size="md" />
          </div>
        </div>
      </div>

      {/* Active Dreams */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Active Dreams</h2>
          <Link to="/manifest">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="manifestor-card p-12 text-center">Loading dreams...</div>
        ) : error ? (
          <div className="manifestor-card p-12 text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeDreams.map((dream) => (
              <DreamCard 
                key={dream.id} 
                dream={dream}
                onClick={() => {
                  // Navigate to dream details
                  console.log('Navigate to dream:', dream.id);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Motivational Quote */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Daily Inspiration</h2>
        <QuoteBox quote={quote.text} author={quote.author} />
      </section>

      {/* Quick Actions */}
      <section className="manifestor-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/manifest">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
              <Plus className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">New Dream</div>
                <div className="text-sm text-muted-foreground">Set a new goal</div>
              </div>
            </Button>
          </Link>
          
          <Link to="/reflection">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
              <Calendar className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Daily Log</div>
                <div className="text-sm text-muted-foreground">Reflect on today</div>
              </div>
            </Button>
          </Link>
          
          <Link to="/insights">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
              <TrendingUp className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Insights</div>
                <div className="text-sm text-muted-foreground">View progress</div>
              </div>
            </Button>
          </Link>
          
          <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4" disabled>
            <Calendar className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Weekly Review</div>
              <div className="text-sm text-muted-foreground">Coming soon</div>
            </div>
          </Button>
        </div>
      </section>
    </div>
  );
}