import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, Star, Clock } from 'lucide-react';
import StreakCounter from '@/components/ui/StreakCounter';
import QuoteBox from '@/components/ui/QuoteBox';
import ProgressBar from '@/components/ui/ProgressBar';
import { getUserDreams, getUserReflections } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentStreak, getRandomQuote } from '@/lib/dummyData';

export default function Insights() {
  const { user } = useAuth();
  const [dreams, setDreams] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getUserDreams(user.uid),
      getUserReflections(user.uid)
    ]).then(([dreams, reflections]) => {
      setDreams(dreams);
      setReflections(reflections);
    }).catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, [user]);

  // Calculate streak from reflections
  const getStreak = () => {
    if (!reflections.length) return 0;
    // Sort reflections by date descending
    const sorted = [...reflections].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let current = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const refDate = new Date(sorted[i].date);
      // Ignore time, compare only date
      if (
        refDate.getFullYear() === current.getFullYear() &&
        refDate.getMonth() === current.getMonth() &&
        refDate.getDate() === current.getDate()
      ) {
        streak++;
        // Move to previous day
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };
  const streak = getStreak();
  const quote = getRandomQuote();

  // Calculate insights
  const totalDreams = dreams.length;
  const avgProgress = totalDreams
    ? Math.round(
        dreams.reduce((acc, dream) => {
          if (dream.checklist && dream.checklist.length > 0) {
            const completed = dream.checklist.filter(item => item.done).length;
            return acc + (completed / dream.checklist.length) * 100;
          }
          return acc;
        }, 0) / totalDreams
      )
    : 0;
  const mostActiveDream = dreams.length
    ? dreams.reduce((prev, current) => {
        const prevProgress = prev.checklist && prev.checklist.length > 0 ? prev.checklist.filter(i => i.done).length / prev.checklist.length : 0;
        const currProgress = current.checklist && current.checklist.length > 0 ? current.checklist.filter(i => i.done).length / current.checklist.length : 0;
        return prevProgress > currProgress ? prev : current;
      })
    : null;

  // Weekly activity and productivity (from reflections)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  const weeklyActivity = weekDays.map((day, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const reflection = reflections.find(r => r.date && r.date.startsWith(dateStr));
    return {
      day,
      active: !!reflection,
      productivity: reflection ? reflection.productivityRating : 0,
    };
  });
  const activeDaysThisWeek = weeklyActivity.filter(day => day.active).length;
  const weeklyProductivity = weeklyActivity.length
    ? Math.round(
        weeklyActivity.reduce((acc, day) => acc + day.productivity, 0) / weeklyActivity.length
      )
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile & Insights</h1>
          <p className="text-muted-foreground mt-1">Analyze your productivity and progress patterns.</p>
        </div>
        <StreakCounter streak={streak} size="lg" />
      </div>

      {loading ? (
        <div className="manifestor-card p-12 text-center">Loading insights...</div>
      ) : error ? (
        <div className="manifestor-card p-12 text-center text-red-500">{error}</div>
      ) : (
      <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="manifestor-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{activeDaysThisWeek}</div>
              <div className="text-sm text-muted-foreground">of 7 days</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">This Week</span>
              <span className="text-sm text-muted-foreground">{Math.round((activeDaysThisWeek / 7) * 100)}%</span>
            </div>
            <ProgressBar progress={(activeDaysThisWeek / 7) * 100} />
          </div>
        </div>

        <div className="manifestor-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{avgProgress}%</div>
              <div className="text-sm text-muted-foreground">avg progress</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
            </div>
            <ProgressBar progress={avgProgress} />
          </div>
        </div>

        <div className="manifestor-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-foreground" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{weeklyProductivity}</div>
              <div className="text-sm text-muted-foreground">out of 5</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Avg Productivity</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-sm ${
                    i < weeklyProductivity ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="manifestor-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-foreground" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{totalDreams}</div>
              <div className="text-sm text-muted-foreground">active dreams</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Dreams Portfolio</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {dreams.filter(d => d.type === 'short-term').length} short-term, {dreams.filter(d => d.type === 'long-term').length} long-term
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Grind Chart */}
      <div className="manifestor-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Weekly Grind Chart</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-2">{day.day}</div>
                <div 
                  className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    day.active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {day.active ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs">{day.productivity}</span>
                    </div>
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded"></div>
              <span>Active Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded"></div>
              <span>Inactive Day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Most Active Dream */}
      <div className="manifestor-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Most Active Dream</h2>
        {mostActiveDream ? (
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">{mostActiveDream.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{mostActiveDream.category}  {mostActiveDream.type?.replace('-', ' ')}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Progress</span>
                <span className="text-muted-foreground">{mostActiveDream.checklist && mostActiveDream.checklist.length > 0 ? Math.round(mostActiveDream.checklist.filter(i => i.done).length / mostActiveDream.checklist.length * 100) : 0}% complete</span>
              </div>
              <ProgressBar progress={mostActiveDream.checklist && mostActiveDream.checklist.length > 0 ? Math.round(mostActiveDream.checklist.filter(i => i.done).length / mostActiveDream.checklist.length * 100) : 0} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{mostActiveDream.checklist ? mostActiveDream.checklist.filter(i => i.done).length : 0} of {mostActiveDream.checklist ? mostActiveDream.checklist.length : 0} tasks completed</span>
                <span>
                  {/* Placeholder for days left */}
                  -- days left
                </span>
              </div>
            </div>
          </div>
        </div>
        ) : <div className="text-muted-foreground">No dreams yet.</div>}
      </div>

      {/* Motivational Quote */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Motivational Quote</h2>
        <QuoteBox quote={quote.text} author={quote.author} />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="manifestor-card p-6 text-center">
          <div className="text-3xl font-bold text-foreground mb-2">
            {reflections.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Reflections</div>
        </div>
        
        <div className="manifestor-card p-6 text-center">
          <div className="text-3xl font-bold text-foreground mb-2">
            {reflections.length ? Math.round(reflections.reduce((acc, r) => acc + r.productivityRating, 0) / reflections.length * 20) : 0}%
          </div>
          <div className="text-sm text-muted-foreground">Avg Productivity Score</div>
        </div>
        
        <div className="manifestor-card p-6 text-center">
          <div className="text-3xl font-bold text-foreground mb-2">
            {streak > 7 ? Math.floor(streak / 7) : 0}
          </div>
          <div className="text-sm text-muted-foreground">Week{Math.floor(streak / 7) !== 1 ? 's' : ''} Streak</div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}