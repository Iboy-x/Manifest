import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DreamCard from '@/components/ui/DreamCard';
import StreakCounter from '@/components/ui/StreakCounter';
import QuoteBox from '@/components/ui/QuoteBox';
import { getUserDreams, getUserReflections } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { getRandomQuote } from '@/lib/dummyData';
import ProgressBar from '@/components/ui/ProgressBar';
import { getDreamProgress } from '@/lib/utils';

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
  // Calculate streak from reflections (reuse logic from Insights)
  const [reflections, setReflections] = useState([]);
  useEffect(() => {
    if (!user) return;
    getUserReflections(user.uid).then(setReflections).catch(() => {});
  }, [user]);
  const getStreak = () => {
    if (!reflections.length) return 0;
    const sorted = [...reflections].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let current = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const refDate = new Date(sorted[i].date);
      if (
        refDate.getFullYear() === current.getFullYear() &&
        refDate.getMonth() === current.getMonth() &&
        refDate.getDate() === current.getDate()
      ) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };
  const streak = getStreak();
  // Color logic for streak visuals
  let streakRing = '';
  if (streak >= 50) streakRing = 'ring-4 ring-blue-500/60 shadow-blue-500/30';
  else if (streak >= 30) streakRing = 'ring-4 ring-red-500/60 shadow-red-500/30';
  else if (streak >= 20) streakRing = 'ring-4 ring-orange-500/60 shadow-orange-500/30';
  else if (streak >= 10) streakRing = 'ring-4 ring-green-500/60 shadow-green-500/30';
  else streakRing = 'ring-2 ring-yellow-400/60 shadow-yellow-400/30';
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

  const upcomingDream = dreams
    .filter(dream => {
      const progress = getDreamProgress(dream);
      const daysLeft = dream.targetDate ? Math.ceil((new Date(dream.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
      return progress < 100 && daysLeft !== null && daysLeft >= 0;
    })
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())[0];


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

      {/* Upcoming Dream Highlight */}
      {upcomingDream && (
        <section className="manifestor-card p-6 bg-primary/5 border-primary/20">
          <h2 className="text-xl font-semibold text-foreground mb-4">Focus On Your Next Big Goal</h2>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">{upcomingDream.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {upcomingDream.category} • {upcomingDream.targetDate ? `${Math.ceil((new Date(upcomingDream.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left` : ''}
              </p>
              <ProgressBar 
                progress={getDreamProgress(upcomingDream)} 
                showPercentage 
              />
            </div>
          </div>
        </section>
      )}

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
                dream={{...dream, progress: getDreamProgress(dream)}}
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