// Dummy data for Manifestor app

export interface Dream {
  id: string;
  title: string;
  type: 'short-term' | 'long-term';
  category: string;
  startDate: string;
  endDate: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  description: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dreamId: string;
}

export interface DailyReflection {
  id: string;
  date: string;
  content: string;
  dreamIds: string[];
  productivityRating: number; // 1-5
}

export const dummyDreams: Dream[] = [
  {
    id: '1',
    title: 'Launch My SaaS Product',
    type: 'long-term',
    category: 'Career',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    progress: 65,
    totalTasks: 12,
    completedTasks: 8,
    description: 'Build and launch a productivity SaaS application with user authentication, subscription management, and core features.',
    tasks: [
      { id: '1-1', text: 'Research market and competitors', completed: true, dreamId: '1' },
      { id: '1-2', text: 'Define MVP features', completed: true, dreamId: '1' },
      { id: '1-3', text: 'Design UI/UX mockups', completed: true, dreamId: '1' },
      { id: '1-4', text: 'Set up development environment', completed: true, dreamId: '1' },
      { id: '1-5', text: 'Build authentication system', completed: true, dreamId: '1' },
      { id: '1-6', text: 'Implement core features', completed: true, dreamId: '1' },
      { id: '1-7', text: 'Set up payment processing', completed: true, dreamId: '1' },
      { id: '1-8', text: 'Write API documentation', completed: true, dreamId: '1' },
      { id: '1-9', text: 'Beta testing with friends', completed: false, dreamId: '1' },
      { id: '1-10', text: 'Fix bugs and optimize performance', completed: false, dreamId: '1' },
      { id: '1-11', text: 'Create marketing landing page', completed: false, dreamId: '1' },
      { id: '1-12', text: 'Public launch and marketing campaign', completed: false, dreamId: '1' },
    ],
  },
  {
    id: '2',
    title: 'Read 12 Business Books',
    type: 'long-term',
    category: 'Study',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    progress: 33,
    totalTasks: 12,
    completedTasks: 4,
    description: 'Expand business knowledge by reading one book per month, focusing on entrepreneurship, marketing, and leadership.',
    tasks: [
      { id: '2-1', text: 'The Lean Startup', completed: true, dreamId: '2' },
      { id: '2-2', text: 'Zero to One', completed: true, dreamId: '2' },
      { id: '2-3', text: 'The Mom Test', completed: true, dreamId: '2' },
      { id: '2-4', text: 'Crossing the Chasm', completed: true, dreamId: '2' },
      { id: '2-5', text: 'The 22 Immutable Laws of Marketing', completed: false, dreamId: '2' },
      { id: '2-6', text: 'Good to Great', completed: false, dreamId: '2' },
      { id: '2-7', text: 'The Hard Thing About Hard Things', completed: false, dreamId: '2' },
      { id: '2-8', text: 'Blitzscaling', completed: false, dreamId: '2' },
      { id: '2-9', text: 'The Innovator\'s Dilemma', completed: false, dreamId: '2' },
      { id: '2-10', text: 'Hooked', completed: false, dreamId: '2' },
      { id: '2-11', text: 'The Lean Analytics', completed: false, dreamId: '2' },
      { id: '2-12', text: 'Traction', completed: false, dreamId: '2' },
    ],
  },
  {
    id: '3',
    title: 'Build a Morning Routine',
    type: 'short-term',
    category: 'Personal',
    startDate: '2024-07-01',
    endDate: '2024-07-21',
    progress: 80,
    totalTasks: 5,
    completedTasks: 4,
    description: 'Establish a consistent morning routine to improve productivity and well-being.',
    tasks: [
      { id: '3-1', text: 'Wake up at 6:00 AM daily', completed: true, dreamId: '3' },
      { id: '3-2', text: '10-minute meditation', completed: true, dreamId: '3' },
      { id: '3-3', text: '20-minute exercise/walk', completed: true, dreamId: '3' },
      { id: '3-4', text: 'Healthy breakfast', completed: true, dreamId: '3' },
      { id: '3-5', text: 'Review daily goals', completed: false, dreamId: '3' },
    ],
  },
  {
    id: '4',
    title: 'Learn Spanish Basics',
    type: 'short-term',
    category: 'Study',
    startDate: '2024-07-01',
    endDate: '2024-08-31',
    progress: 45,
    totalTasks: 8,
    completedTasks: 3,
    description: 'Learn fundamental Spanish vocabulary and grammar for basic conversation.',
    tasks: [
      { id: '4-1', text: 'Complete Duolingo Spanish Basics 1', completed: true, dreamId: '4' },
      { id: '4-2', text: 'Learn 100 common Spanish words', completed: true, dreamId: '4' },
      { id: '4-3', text: 'Practice pronunciation 15 min daily', completed: true, dreamId: '4' },
      { id: '4-4', text: 'Complete Spanish Basics 2', completed: false, dreamId: '4' },
      { id: '4-5', text: 'Watch Spanish Netflix with subtitles', completed: false, dreamId: '4' },
      { id: '4-6', text: 'Have 5-minute conversation with native speaker', completed: false, dreamId: '4' },
      { id: '4-7', text: 'Learn basic verb conjugations', completed: false, dreamId: '4' },
      { id: '4-8', text: 'Take online Spanish quiz', completed: false, dreamId: '4' },
    ],
  },
];

export const dummyReflections: DailyReflection[] = [
  {
    id: '1',
    date: '2024-07-18',
    content: 'Had a productive day working on the SaaS authentication system. Managed to implement OAuth integration and started on the dashboard design. Feeling motivated about the progress.',
    dreamIds: ['1'],
    productivityRating: 4,
  },
  {
    id: '2',
    date: '2024-07-17',
    content: 'Morning routine going well - woke up at 6 AM and did meditation. Started reading "The 22 Immutable Laws of Marketing" and it\'s already giving me great insights for the product launch.',
    dreamIds: ['2', '3'],
    productivityRating: 5,
  },
  {
    id: '3',
    date: '2024-07-16',
    content: 'Struggled a bit with Spanish practice today, but managed to complete the Duolingo lesson. Need to be more consistent with pronunciation practice.',
    dreamIds: ['4'],
    productivityRating: 3,
  },
];

export const motivationalQuotes = [
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
];

export const getRandomQuote = () => {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
};

export const getCurrentStreak = (): number => {
  // Calculate streak based on recent reflections
  const today = new Date().toISOString().split('T')[0];
  const recent = dummyReflections.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const reflection of recent) {
    const reflectionDate = new Date(reflection.date);
    const diffDays = Math.floor((currentDate.getTime() - reflectionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate = reflectionDate;
    } else {
      break;
    }
  }
  
  return streak;
};