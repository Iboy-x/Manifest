import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DreamCard from '@/components/ui/DreamCard';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { getUserDreams, addUserDream } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function ManifestLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Dream form state
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamDescription, setDreamDescription] = useState('');
  const [dreamType, setDreamType] = useState('short-term');
  const [dreamCategory, setDreamCategory] = useState('');
  const [checklist, setChecklist] = useState([{ text: '', done: false }]);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const resetForm = () => {
    setDreamTitle('');
    setDreamDescription('');
    setDreamType('short-term');
    setDreamCategory('');
    setChecklist([{ text: '', done: false }]);
    setAddError('');
  };

  const handleAddDream = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!dreamTitle.trim()) {
      setAddError('Title is required.');
      return;
    }
    if (checklist.length === 0 || checklist.some(item => !item.text.trim())) {
      setAddError('Please add at least one checklist item and fill all steps.');
      return;
    }
    setAdding(true);
    setAddError('');
    try {
      const newDream = {
        title: dreamTitle,
        description: dreamDescription,
        type: dreamType,
        category: dreamCategory,
        checklist,
        createdAt: new Date().toISOString(),
      };
      await addUserDream(user.uid, newDream);
      // Refresh dreams
      const updatedDreams = await getUserDreams(user.uid);
      setDreams(updatedDreams);
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      setAddError('Failed to add dream.');
    } finally {
      setAdding(false);
    }
  };

  const handleChecklistChange = (idx, value) => {
    setChecklist(cl => cl.map((item, i) => i === idx ? { ...item, text: value } : item));
  };
  const handleChecklistRemove = (idx) => {
    setChecklist(cl => cl.length === 1 ? cl : cl.filter((_, i) => i !== idx));
  };
  const handleChecklistAdd = () => {
    setChecklist(cl => [...cl, { text: '', done: false }]);
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserDreams(user.uid)
      .then(setDreams)
      .catch(() => setError('Failed to load dreams.'))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredDreams = dreams.filter(dream => {
    const matchesSearch = dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dream.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && dream.type === selectedFilter;
  });

  const categories = [...new Set(dreams.map(dream => dream.category).filter(Boolean))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manifest Log</h1>
          <p className="text-muted-foreground mt-1">Track and manage all your dreams and goals.</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Dream
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="manifestor-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search dreams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              All Dreams
            </Button>
            <Button
              variant={selectedFilter === 'short-term' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('short-term')}
            >
              Short Term
            </Button>
            <Button
              variant={selectedFilter === 'long-term' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('long-term')}
            >
              Long Term
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="manifestor-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{dreams.length}</div>
          <div className="text-sm text-muted-foreground">Total Dreams</div>
        </div>
        <div className="manifestor-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {dreams.filter(d => d.type === 'short-term').length}
          </div>
          <div className="text-sm text-muted-foreground">Short Term</div>
        </div>
        <div className="manifestor-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {dreams.filter(d => d.type === 'long-term').length}
          </div>
          <div className="text-sm text-muted-foreground">Long Term</div>
        </div>
        <div className="manifestor-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{categories.length}</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
      </div>

      {/* Categories */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div
              key={category}
              className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              {category}
              <span className="ml-1 text-xs">
                ({dreams.filter(d => d.category === category).length})
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Dreams Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Dreams ({filteredDreams.length})
          </h2>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>

        {loading ? (
          <div className="manifestor-card p-12 text-center">Loading dreams...</div>
        ) : error ? (
          <div className="manifestor-card p-12 text-center text-red-500">{error}</div>
        ) : filteredDreams.length === 0 ? (
          <div className="manifestor-card p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No dreams found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Start by creating your first dream!'}
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Dream
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDreams.map((dream) => (
              <DreamCard 
                key={dream.id} 
                dream={dream}
                onClick={() => {
                  console.log('Navigate to dream details:', dream.id);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => setShowAddForm(true)}
      />

      {/* Add Dream Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="manifestor-card max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Dream</h3>
            <form onSubmit={handleAddDream} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
                <Input value={dreamTitle} onChange={e => setDreamTitle(e.target.value)} required disabled={adding} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input value={dreamDescription} onChange={e => setDreamDescription(e.target.value)} disabled={adding} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full bg-background border border-border rounded px-2 py-1" value={dreamType} onChange={e => setDreamType(e.target.value)} disabled={adding}>
                    <option value="short-term">Short Term</option>
                    <option value="long-term">Long Term</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Input value={dreamCategory} onChange={e => setDreamCategory(e.target.value)} disabled={adding} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Checklist <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {checklist.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={item.text}
                        onChange={e => handleChecklistChange(idx, e.target.value)}
                        placeholder={`Step ${idx + 1}`}
                        disabled={adding}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => handleChecklistRemove(idx)} disabled={adding || checklist.length === 1}>
                        &times;
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={handleChecklistAdd} disabled={adding}>
                    + Add Step
                  </Button>
                </div>
              </div>
              {addError && <div className="text-red-500 text-sm">{addError}</div>}
              <div className="flex gap-2 mt-4">
                <Button className="flex-1" type="submit" disabled={adding}>{adding ? 'Creating...' : 'Create Dream'}</Button>
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => { setShowAddForm(false); resetForm(); }}
                  disabled={adding}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}