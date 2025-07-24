import { useState } from 'react';
import { Moon, Sun, Bell, LogOut, User, Shield, Palette, Clock, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, deleteUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState('19:00');
  const { signOut, user } = useAuth();

  // Editable display name state
  const [editingName, setEditingName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(user?.displayName || '');
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  const navigate = useNavigate();

  // Delete account confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = user?.displayName || 'Manifestor User';
  const email = user?.email || 'user@example.com';
  const photoURL = user?.photoURL;

  const handleEditName = () => {
    setEditingName(true);
    setDisplayNameInput(displayName);
    setNameSuccess(false);
    setNameError('');
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setNameError('');
  };

  const handleSaveName = async () => {
    if (!user) return;
    setSavingName(true);
    setNameError('');
    try {
      await updateProfile(auth.currentUser, { displayName: displayNameInput });
      // Update in Firestore as well
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { displayName: displayNameInput });
      setNameSuccess(true);
      setEditingName(false);
      window.location.reload(); // To update the UI with new name
    } catch (err) {
      setNameError('Failed to update name.');
    } finally {
      setSavingName(false);
    }
  };

  const functions = getFunctions();

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    setDeleteError('');
    try {
      // 1. Call the backend function to delete all user data
      const deleteUserData = httpsCallable(functions, 'deleteUserData');
      await deleteUserData();

      // 2. Delete Auth user
      await deleteUser(auth.currentUser);

      // 3. Redirect to intro
      navigate('/intro', { replace: true });
    } catch (err) {
      setDeleteError('Failed to delete account. Please re-authenticate and try again.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Toggle dark mode class on document
    document.documentElement.classList.toggle('dark');
  };

  const saveReminderTime = (time: string) => {
    setReminderTime(time);
    localStorage.setItem('dailyReminderTime', time);
    console.log('Reminder time saved:', time);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and app preferences.</p>
      </div>

      {/* Profile Section */}
      <section className="manifestor-card p-6">
        <div className="flex items-center gap-4 mb-6">
          {photoURL ? (
            <img src={photoURL} alt={displayName} className="w-12 h-12 rounded-lg object-cover bg-muted" />
          ) : (
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">Manage your personal information</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email (read-only) */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="font-medium text-foreground">Email</div>
              <div className="text-sm text-muted-foreground">{email}</div>
            </div>
            <Button variant="outline" size="sm" disabled>Read Only</Button>
          </div>

          {/* Display Name (editable) */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="font-medium text-foreground">Display Name</div>
              {editingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    className="bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={displayNameInput}
                    onChange={e => setDisplayNameInput(e.target.value)}
                    disabled={savingName}
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={savingName}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancelEditName} disabled={savingName}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-sm text-muted-foreground">{displayName}</div>
                  <Button size="icon" variant="ghost" onClick={handleEditName}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {nameSuccess && <div className="text-green-500 text-xs mt-1">Name updated!</div>}
              {nameError && <div className="text-red-500 text-xs mt-1">{nameError}</div>}
            </div>
          </div>

          {/* Password (info only) */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-foreground">Password</div>
              <div className="text-sm text-muted-foreground">Google sign-in users manage their password via their Google Account.</div>
            </div>
            <Button variant="outline" size="sm" disabled>Google Account</Button>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="manifestor-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
            <p className="text-sm text-muted-foreground">Customize how Manifestor looks</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />}
              <div>
                <Label className="font-medium text-foreground">Dark Mode</Label>
                <div className="text-sm text-muted-foreground">Toggle between light and dark themes</div>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="manifestor-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <Label className="font-medium text-foreground">Daily Reminders</Label>
              <div className="text-sm text-muted-foreground">Get reminded to write your daily reflection</div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-foreground" />
              <div>
                <Label className="font-medium text-foreground">Reminder Time</Label>
                <div className="text-sm text-muted-foreground">When to send daily reminder notifications</div>
              </div>
            </div>
            <Select value={reminderTime} onValueChange={saveReminderTime}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
                <SelectItem value="19:00">7:00 PM</SelectItem>
                <SelectItem value="20:00">8:00 PM</SelectItem>
                <SelectItem value="21:00">9:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="manifestor-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Privacy & Security</h2>
            <p className="text-sm text-muted-foreground">Manage your data and security settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="font-medium text-foreground">Delete Account</div>
              <div className="text-sm text-muted-foreground">Permanently delete your account and data</div>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(v => !v)}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Delete
            </Button>
          </div>
          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-lg flex flex-col gap-2">
              <div className="text-sm text-destructive font-semibold mb-2">Type <span className="font-mono bg-destructive/20 px-1 rounded">I agree to delete</span> to confirm account deletion.</div>
              <input
                className="bg-background border border-destructive/40 rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                disabled={deleting}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'I agree to delete' || deleting}
                  className="bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>Cancel</Button>
              </div>
              {deleteError && <div className="text-xs text-red-500 mt-1">{deleteError}</div>}
            </div>
          )}
        </div>
      </section>

      {/* App Info */}
      <section className="manifestor-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">App Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="text-foreground">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="text-foreground">July 18, 2024</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Terms of Service</span>
            <Button variant="link" size="sm" className="h-auto p-0">View</Button>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Privacy Policy</span>
            <Button variant="link" size="sm" className="h-auto p-0">View</Button>
          </div>
        </div>
      </section>

      {/* Logout */}
      <div className="manifestor-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Sign Out</h3>
            <p className="text-sm text-muted-foreground">Sign out of your Manifestor account</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="gap-2 hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}