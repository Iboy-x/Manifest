import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DreamCard from '@/components/ui/DreamCard';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { getUserDreams, addUserDream, updateUserDream, deleteUserDream } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { sanitizeInput } from '@/lib/utils';

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
  const [dreamTargetDate, setDreamTargetDate] = useState('');
  const [checklist, setChecklist] = useState([{ text: '', done: false }]);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Handle checklist toggle in modal
  const handleChecklistToggle = async (dream, idx) => {
    if (!user) return;
    setUpdatingChecklist(true);
    setChecklistError('');
    try {
      const updatedChecklist = dream.checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item);
      await updateUserDream(user.uid, dream.id, { checklist: updatedChecklist });
      // Refresh dreams
      const updatedDreams = await getUserDreams(user.uid);
      setDreams(updatedDreams);
      setActiveDream(updatedDreams.find(d => d.id === dream.id));
    } catch {
      setChecklistError('Failed to update checklist.');
    } finally {
      setUpdatingChecklist(false);
    }
  };

  const resetForm = () => {
    setDreamTitle('');
    setDreamDescription('');
    setDreamType('short-term');
    setDreamCategory('');
    setDreamTargetDate('');
    setChecklist([{ text: '', done: false }]);
    setAddError('');
  };

  const handleAddDream = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!sanitizeInput(dreamTitle)) {
      setAddError('Title is required.');
      return;
    }
    if (checklist.length === 0 || checklist.some(item => !sanitizeInput(item.text))) {
      setAddError('Please add at least one checklist item and fill all steps.');
      return;
    }
    if (!dreamTargetDate) {
      setAddError('Target date is required.');
      return;
    }
    setAdding(true);
    setAddError('');
    try {
      const newDream = {
        title: sanitizeInput(dreamTitle),
        description: sanitizeInput(dreamDescription),
        type: dreamType,
        category: sanitizeInput(dreamCategory),
        checklist: checklist.map(item => ({ ...item, text: sanitizeInput(item.text) })),
        targetDate: dreamTargetDate,
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

  const getDreamProgress = (dream) => {
    if (!dream.checklist || dream.checklist.length === 0) return 0;
    const completed = dream.checklist.filter((i) => i.done).length;
    return Math.round((completed / dream.checklist.length) * 100);
  };

  const activeDreams = dreams.filter(dream => getDreamProgress(dream) < 100);
  const completedDreams = dreams.filter(dream => getDreamProgress(dream) === 100);

  const filteredDreams = (selectedFilter === 'completed' ? completedDreams : activeDreams).filter((dream) => {
    const matchesSearch =
      dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dream.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    if (selectedFilter === 'completed' || selectedFilter === 'all') {
      return matchesSearch;
    }
    if (selectedFilter === 'short-term' || selectedFilter === 'long-term') {
      return matchesSearch && dream.type === selectedFilter;
    }
    return false;
  });

  const categories = [...new Set(dreams.map((dream) => dream.category).filter(Boolean))];

  const [activeDream, setActiveDream] = useState(null);
  const [updatingChecklist, setUpdatingChecklist] = useState(false);
  const [checklistError, setChecklistError] = useState('');
  const [editingDream, setEditingDream] = useState(false);
  const [editFields, setEditFields] = useState({ title: '', description: '', type: 'short-term', category: '', targetDate: '', checklist: [] });
  const [editError, setEditError] = useState('');
  const [deletingDream, setDeletingDream] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Start editing
  const startEditDream = (dream) => {
    setEditFields({
      title: dream.title,
      description: dream.description || '',
      type: dream.type,
      category: dream.category || '',
      targetDate: dream.targetDate || '',
      checklist: dream.checklist ? dream.checklist.map(item => ({ ...item })) : [],
    });
    setEditingDream(true);
    setEditError('');
  };
  // Handle edit field changes
  const handleEditField = (field, value) => setEditFields(f => ({ ...f, [field]: value }));
  const handleEditChecklistChange = (idx, value) => setEditFields(f => ({ ...f, checklist: f.checklist.map((item, i) => i === idx ? { ...item, text: value } : item) }));
  const handleEditChecklistToggle = (idx) => setEditFields(f => ({ ...f, checklist: f.checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item) }));
  const handleEditChecklistRemove = (idx) => setEditFields(f => ({ ...f, checklist: f.checklist.length === 1 ? f.checklist : f.checklist.filter((_, i) => i !== idx) }));
  const handleEditChecklistAdd = () => setEditFields(f => ({ ...f, checklist: [...f.checklist, { text: '', done: false }] }));
  // Save edits
  const handleSaveEditDream = async () => {
    if (!user || !activeDream) return;
    if (!sanitizeInput(editFields.title)) { setEditError('Title is required.'); return; }
    if (editFields.checklist.length === 0 || editFields.checklist.some(item => !sanitizeInput(item.text))) { setEditError('Checklist required.'); return; }
    if (!editFields.targetDate) { setEditError('Target date is required.'); return; }
    setEditError('');
    try {
      await updateUserDream(user.uid, activeDream.id, {
        title: sanitizeInput(editFields.title),
        description: sanitizeInput(editFields.description),
        type: editFields.type,
        category: sanitizeInput(editFields.category),
        targetDate: editFields.targetDate,
        checklist: editFields.checklist.map(item => ({ ...item, text: sanitizeInput(item.text) })),
      });
      const updatedDreams = await getUserDreams(user.uid);
      setDreams(updatedDreams);
      setActiveDream(updatedDreams.find(d => d.id === activeDream.id));
      setEditingDream(false);
    } catch {
      setEditError('Failed to update dream.');
    }
  };
  // Delete dream
  const handleDeleteDream = async () => {
    if (!user || !activeDream) return;
    setDeletingDream(true);
    try {
      await deleteUserDream(user.uid, activeDream.id);
      setDreams(dreams.filter(d => d.id !== activeDream.id));
      setActiveDream(null);
      setShowDeleteConfirm(false);
    } catch {
      setEditError('Failed to delete dream.');
    } finally {
      setDeletingDream(false);
    }
  };

  // Helper to calculate progress for a dream
  function getDaysLeft(targetDate) {
    if (!targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dream Log</h1>
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
              Active
            </Button>
            <Button
              variant={selectedFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('completed')}
            >
              Completed
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
            Active Dreams ({activeDreams.length})
          </h2>
          {/* Filters can be added back here if needed */}
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
            {activeDreams.map((dream) => (
              <DreamCard 
                key={dream.id} 
                dream={{
                  ...dream,
                  progress: getDreamProgress(dream),
                  daysLeft: getDaysLeft(dream.targetDate),
                }}
                onClick={() => setActiveDream(dream)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completed Dreams Section */}
      {completedDreams.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-muted-foreground">Completed Dreams ({completedDreams.length})</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 opacity-60">
            {completedDreams.map((dream) => (
              <DreamCard 
                key={dream.id} 
                dream={{
                  ...dream,
                  progress: getDreamProgress(dream),
                  daysLeft: null, // No days left for completed dreams
                }}
                onClick={() => setActiveDream(dream)}
              />
            ))}
          </div>
        </section>
      )}

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
              <div>
                <label className="block text-sm font-medium mb-1">Target Date <span className="text-red-500">*</span></label>
                <Input type="date" value={dreamTargetDate} onChange={e => setDreamTargetDate(e.target.value)} required disabled={adding} />
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

      {/* Dream Modal */}
      {activeDream && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="manifestor-card max-w-lg w-full p-6 relative">
            <button className="absolute top-3 right-3 text-xl text-muted-foreground hover:text-foreground" onClick={() => { setActiveDream(null); setEditingDream(false); setShowDeleteConfirm(false); }}>&times;</button>
            {/* Edit/Delete Buttons at bottom */}
            {!editingDream && (
              <div className="flex gap-2 justify-end mt-6">
                <Button size="sm" variant="outline" onClick={() => startEditDream(activeDream)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
              </div>
            )}
            {/* Edit Dream Form */}
            {editingDream ? (
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSaveEditDream(); }}>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Edit Dream</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
                  <Input value={editFields.title} onChange={e => handleEditField('title', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input value={editFields.description} onChange={e => handleEditField('description', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Date <span className="text-red-500">*</span></label>
                  <Input type="date" value={editFields.targetDate} onChange={e => handleEditField('targetDate', e.target.value)} required />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select className="w-full bg-background border border-border rounded px-2 py-1" value={editFields.type} onChange={e => handleEditField('type', e.target.value)}>
                      <option value="short-term">Short Term</option>
                      <option value="long-term">Long Term</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Input value={editFields.category} onChange={e => handleEditField('category', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Checklist <span className="text-red-500">*</span></label>
                  <div className="space-y-2">
                    {editFields.checklist.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          checked={!!item.done}
                          onChange={() => handleEditChecklistToggle(idx)}
                          className="accent-primary w-4 h-4 rounded"
                        />
                        <Input
                          value={item.text}
                          onChange={e => handleEditChecklistChange(idx, e.target.value)}
                          placeholder={`Step ${idx + 1}`}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => handleEditChecklistRemove(idx)} disabled={editFields.checklist.length === 1}>
                          &times;
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={handleEditChecklistAdd}>
                      + Add Step
                    </Button>
                  </div>
                </div>
                {editError && <div className="text-red-500 text-sm">{editError}</div>}
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1" type="submit">Save</Button>
                  <Button variant="outline" type="button" onClick={() => setEditingDream(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold mb-2 text-foreground">{activeDream.title}</h3>
                {activeDream.description && <p className="mb-4 text-muted-foreground">{activeDream.description}</p>}
                <div className="mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground mr-2">{activeDream.type.replace('-', ' ')}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground mr-2">{activeDream.category}</span>
                  {activeDream.targetDate && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary-foreground">
                      {(() => {
                        const days = getDaysLeft(activeDream.targetDate);
                        return days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`;
                      })()}
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <div className="font-semibold mb-2 text-foreground">Checklist</div>
                  <div className="space-y-2">
                    {activeDream.checklist && activeDream.checklist.length > 0 ? (
                      activeDream.checklist.map((item, idx) => (
                        <label key={idx} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!item.done}
                            onChange={() => handleChecklistToggle(activeDream, idx)}
                            disabled={updatingChecklist}
                            className="accent-primary w-4 h-4 rounded"
                          />
                          <span className={item.done ? 'line-through text-muted-foreground' : 'text-foreground'}>{item.text}</span>
                        </label>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm">No checklist items.</div>
                    )}
                  </div>
                  {checklistError && <div className="text-red-500 text-xs mt-2">{checklistError}</div>}
                </div>
                {/* Progress */}
                {activeDream.checklist && activeDream.checklist.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="text-foreground">Progress</span>
                      <span className="text-muted-foreground">
                        {getDreamProgress(activeDream)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all rounded-full"
                        style={{ width: `${getDreamProgress(activeDream)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Delete confirmation at bottom right */}
            {showDeleteConfirm && (
              <div className="absolute bottom-3 right-3 z-10 bg-destructive/10 p-3 rounded-lg flex flex-col gap-2 max-w-xs">
                <div className="text-sm text-red-400 font-semibold">Are you sure you want to delete this dream?</div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="destructive" onClick={handleDeleteDream} disabled={deletingDream}>{deletingDream ? 'Deleting...' : 'Yes, Delete'}</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deletingDream}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}