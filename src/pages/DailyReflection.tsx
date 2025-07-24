import { useState, useEffect } from 'react';
import { Calendar, Save, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import StreakCounter from '@/components/ui/StreakCounter';
import { useAuth } from '@/hooks/useAuth';
import { getUserDreams, getUserReflections, addUserReflection } from '@/lib/firebase';
import { sanitizeInput } from '@/lib/utils';

export default function DailyReflection() {
  const { user } = useAuth();
  const [reflection, setReflection] = useState('');
  const [selectedDreams, setSelectedDreams] = useState<string[]>([]);
  const [productivityRating, setProductivityRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [dreams, setDreams] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  const todayDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getUserDreams(user.uid),
      getUserReflections(user.uid)
    ]).then(([dreams, reflections]) => {
      setDreams(dreams);
      setReflections(reflections.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }).catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDreamToggle = (dreamId: string) => {
    setSelectedDreams(prev => 
      prev.includes(dreamId) 
        ? prev.filter(id => id !== dreamId)
        : [...prev, dreamId]
    );
  };

  const handleRatingClick = (rating: number) => {
    setProductivityRating(rating);
  };

  const handleSave = async () => {
    const cleanReflection = sanitizeInput(reflection);
    if (cleanReflection.split(' ').length < 10) {
      alert('Please write at least 10 words in your reflection.');
      return;
    }
    if (!user) return;
    setIsSaving(true);
    try {
      await addUserReflection(user.uid, {
        content: cleanReflection,
        dreamIds: selectedDreams,
        productivityRating,
        date: new Date().toISOString(),
      });
      // Refresh reflections
      const updatedReflections = await getUserReflections(user.uid);
      setReflections(updatedReflections.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setReflection('');
      setSelectedDreams([]);
      setProductivityRating(0);
      alert('Reflection saved! Your streak continues.');
    } catch {
      alert('Failed to save reflection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Daily Reflection</h1>
          <p className="text-muted-foreground mt-1">{todayDate}</p>
        </div>
        <StreakCounter streak={streak} size="lg" />
      </div>

      {/* Today's Reflection Form */}
      <div className="manifestor-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Today's Reflection</h2>
            <p className="text-sm text-muted-foreground">Share your thoughts and progress</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Reflection Text */}
          <div className="space-y-2">
            <Label htmlFor="reflection" className="text-sm font-medium">
              How was your day? What did you accomplish? (minimum 10 words)
            </Label>
            <Textarea
              id="reflection"
              placeholder="Write about your day, progress on your dreams, challenges you faced, or insights you gained..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {reflection.split(' ').filter(word => word.length > 0).length} words
            </div>
          </div>

          {/* Dream Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Which dreams does this relate to?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dreams.map((dream) => (
                <div 
                  key={dream.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`dream-${dream.id}`}
                    checked={selectedDreams.includes(dream.id)}
                    onCheckedChange={() => handleDreamToggle(dream.id)}
                  />
                  <label 
                    htmlFor={`dream-${dream.id}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <div className="font-medium text-foreground">{dream.title}</div>
                    <div className="text-xs text-muted-foreground">{dream.category}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Productivity Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">How productive did you feel today?</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingClick(rating)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    rating <= productivityRating
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  <Star className={`w-5 h-5 mx-auto ${rating <= productivityRating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {productivityRating === 0 && 'Select a rating'}
              {productivityRating === 1 && 'Not very productive'}
              {productivityRating === 2 && 'Somewhat productive'}
              {productivityRating === 3 && 'Moderately productive'}
              {productivityRating === 4 && 'Very productive'}
              {productivityRating === 5 && 'Extremely productive'}
            </p>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            disabled={reflection.split(' ').length < 10 || productivityRating === 0 || isSaving}
            className="w-full gap-2"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Reflection
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Recent Reflections */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-6">Recent Reflections</h2>
        <div className="space-y-4">
          {reflections.slice(0, 3).map((reflection) => (
            <div key={reflection.id} className="manifestor-card p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {new Date(reflection.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-3 h-3 ${
                              i < reflection.productivityRating 
                                ? 'text-primary fill-current' 
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1">productivity</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-foreground mb-3 leading-relaxed">
                {reflection.content}
              </p>
              
              {reflection.dreamIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {reflection.dreamIds.map((dreamId) => {
                    const dream = dreams.find(d => d.id === dreamId);
                    return dream ? (
                      <div 
                        key={dreamId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {dream.title}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}