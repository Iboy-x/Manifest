import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_17_40)">
      <path d="M47.5 24.5C47.5 22.6 47.3 20.8 46.9 19H24V29.1H37.4C36.8 32.1 34.8 34.6 32 36.1V42.1H39.6C44.1 38.1 47.5 32.1 47.5 24.5Z" fill="#4285F4"/>
      <path d="M24 48C30.6 48 36.1 45.9 39.6 42.1L32 36.1C30.2 37.2 27.9 37.9 24 37.9C17.7 37.9 12.2 33.8 10.3 28.3H2.4V34.5C5.9 41.1 14.2 48 24 48Z" fill="#34A853"/>
      <path d="M10.3 28.3C9.8 27.2 9.5 26 9.5 24.8C9.5 23.6 9.8 22.4 10.3 21.3V15.1H2.4C0.8 18.1 0 21.4 0 24.8C0 28.2 0.8 31.5 2.4 34.5L10.3 28.3Z" fill="#FBBC05"/>
      <path d="M24 9.6C27.7 9.6 30.3 11.1 31.7 12.4L39.7 5.1C36.1 1.8 30.6 0 24 0C14.2 0 5.9 6.9 2.4 15.1L10.3 21.3C12.2 15.8 17.7 9.6 24 9.6Z" fill="#EA4335"/>
    </g>
    <defs>
      <clipPath id="clip0_17_40">
        <rect width="48" height="48" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

export default function Intro() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e0e0e] to-[#1a1a1a] overflow-hidden px-4 font-inter">
      {/* Floating blurred blob for depth */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-blob z-0" />
      {/* Centered card container */}
      <div className="relative z-10 max-w-xl w-full mx-auto bg-black/60 backdrop-blur-md rounded-3xl border border-gray-800/40 shadow-xl shadow-gray-900/40 px-8 py-14 flex flex-col items-center gap-6">
        <img src="/logo.png" alt="Manifestor Logo" className="mx-auto mb-4" style={{ maxWidth: 72, width: '100%', height: 'auto' }} />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-0">Manifestor</h1>
        <div className="bg-gradient-to-r from-gray-600 via-white to-gray-600 h-[2px] w-16 mx-auto rounded-full my-4 shadow-[0_0_8px_2px_rgba(255,255,255,0.12)]" />
        <div className="text-base md:text-lg text-gray-300 leading-relaxed text-center space-y-3">
          <p><span className="text-white font-semibold">Manifestor</span> is your modern, minimalist dashboard for mindful productivity and personal growth.</p>
          <p>Set goals, track your dreams, and reflect daily—all in a distraction-free, glassy interface inspired by the best of Notion, Linear, and Vercel.</p>
          <p>Experience clarity, focus, and a little baddie Gen Z energy. Your journey, beautifully organized.</p>
        </div>
        <button
          onClick={signInWithGoogle}
          className="mt-4 flex items-center justify-center bg-white text-black font-medium py-2 px-6 rounded-full shadow-md hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/40 text-base md:text-lg"
        >
          <GoogleIcon /> Sign in with Google
        </button>
      </div>
      {/* Extra subtle blurred light at bottom right for depth */}
      <div className="absolute bottom-0 right-0 w-72 h-40 bg-white/5 rounded-full blur-3xl z-0" />
      <style>{`
        @keyframes blob {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.08) translateY(12px); }
        }
        .animate-blob { animation: blob 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
} 