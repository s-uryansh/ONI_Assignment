'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface AuthDialogProps {
  onClose: () => void;
  onAuthSuccess: (user: { fullName: string; email: string;}) => void;
}

export default function AuthDialog({ onClose, onAuthSuccess }: AuthDialogProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { delay, duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  });

  const handleToggle = () => {
    if (animating) return;
    setAnimating(true);
    setError('');
    setTimeout(() => {
      setIsRegister(!isRegister);
      setTimeout(() => setAnimating(false), 800);
    }, 200);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  const form = e.target as HTMLFormElement;
  const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
  const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;

  if (!email) {
    toast.error('Please enter your email.');
    return;
  }
  if (!password) {
    toast.error('Please enter your password.');
    return;
  }

  if (isRegister) {
    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement)?.value;
    const data = { fullName, email, password };
    try {
      const signupRes = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const signupResult = await signupRes.json();

      if (!signupRes.ok) {
        toast.error(signupResult.error || 'Signup failed.');
        return;
      }

      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', 
      });
      const loginResult = await loginRes.json();

      if (!loginRes.ok) {
        toast.error(loginResult.error || 'Auto-login failed.');
        return;
      }

      toast.success('Signup and login successful!');
      window.location.reload();
      onAuthSuccess(loginResult.user);
      onClose();
    } catch (err) {
      console.error('Signup/Login Error:', err);
      toast.error('Network error.');
    }
  } else {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Login failed.');
      } else {
        toast.success('Login successful!');
        onAuthSuccess(result.user);
        onClose();
      }
    } catch {
      toast.error('Network error.');
    }
  }
};

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
       <motion.div
         key="auth"
         initial={{ opacity: 0, scale: 0.9, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9, y: -20 }}
         transition={{ duration: 0.3 }}
         className="relative bg-gradient-to-br from-[#0a0b14]/90 via-[#0e1c1c]/85 to-[#131336]/90 rounded-3xl shadow-[0_0_35px_rgba(0,0,0,0.6)] overflow-hidden w-[780px] h-[500px] flex border border-white/10 backdrop-blur-xl"
       >
         <button
           onClick={onClose}
           className="absolute top-3 right-4 text-gray-300 hover:text-white text-xl font-bold z-50"
         >
           ✕
         </button>

         {/* Left Section */}
         <motion.div
           animate={{ x: isRegister ? '100%' : '0%' }}
           transition={{ duration: 0.8, ease: 'easeInOut' }}
           className="w-1/2 h-full flex flex-col justify-center px-10 absolute left-0 bg-white/5 backdrop-blur-md rounded-l-3xl border-r border-white/10"
         >
           <AnimatePresence mode="wait">
             <motion.div key={isRegister ? 'register' : 'login'} {...fadeUp(0)} className="w-full">
               <h2 className="text-3xl font-bold text-center text-white mb-6">
                 {isRegister ? 'Sign Up' : 'Sign In'}
               </h2>

               <form className="space-y-5" onSubmit={handleSubmit}>
                 {isRegister && (
                   <>
                     <motion.div {...fadeUp(0.2)} className="relative pt-3">
                       <input
                         type="text"
                         name="fullName"
                         required
                         placeholder="Full Name"
                         className="peer w-full border-b-2 border-gray-500 text-white outline-none focus:border-indigo-400 bg-transparent py-1 placeholder-transparent"
                       />
                       <label className="absolute left-0 -top-3 text-gray-400 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-indigo-400 transition-all">
                         Full Name
                       </label>
                     </motion.div>
                   </>
                 )}

                 {/* Email Field */}
                 <motion.div {...fadeUp(0.35)} className="relative pt-3">
                   <input
                     type="email"
                     name="email"
                     required
                     placeholder="Email"
                     className="peer w-full border-b-2 border-gray-500 text-white outline-none focus:border-indigo-400 bg-transparent py-1 placeholder-transparent"
                   />
                   <label className="absolute left-0 -top-3 text-gray-400 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-indigo-400 transition-all">
                     Email
                   </label>
                 </motion.div>

                 <motion.div {...fadeUp(0.36)} className="relative pt-3">
                   <input
                     type="password"
                     name="password"
                     required
                     placeholder="Password"
                     className="peer w-full border-b-2 border-gray-500 text-white outline-none focus:border-indigo-400 bg-transparent py-1 placeholder-transparent"
                   />
                   <label className="absolute left-0 -top-3 text-gray-400 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-indigo-400 transition-all">
                     Password
                   </label>
                 </motion.div>

                 {error && (
                   <motion.p {...fadeUp(0.45)} className="text-red-400 text-sm text-center">
                     {error}
                   </motion.p>
                 )}

                 <motion.button
                   {...fadeUp(0.5)}
                   type="submit"
                   className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-md shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all"
                 >
                   {isRegister ? 'Sign Up' : 'Sign In'}
                 </motion.button>

                 <motion.p {...fadeUp(0.6)} className="text-center text-gray-400 mt-5 text-sm">
                   {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                   <button
                     type="button"
                     onClick={handleToggle}
                     className="text-indigo-400 font-semibold hover:underline"
                   >
                     {isRegister ? 'Login' : 'Sign Up'}
                   </button>
                 </motion.p>
               </form>
             </motion.div>
           </AnimatePresence>
         </motion.div>

         {/* Right Section */}
         <motion.div
           animate={{ x: isRegister ? '-100%' : '0%' }}
           transition={{ duration: 0.8, ease: 'easeInOut' }}
           className="w-1/2 h-full absolute right-0 flex flex-col justify-center items-center text-center text-white px-10 rounded-r-3xl"
         >
           <AnimatePresence mode="wait">
             <motion.div
               key={isRegister ? 'signupText' : 'loginText'}
               initial={{ opacity: 0, x: isRegister ? 50 : -50 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: isRegister ? -50 : 50 }}
               transition={{ duration: 0.6 }}
               className="text-center"
             >
               <h3 className="text-3xl font-bold text-white mb-4">
                 {isRegister ? 'Join the Network!' : 'Welcome Back!'}
               </h3>
               <p className="text-gray-300">
                 {isRegister
                   ? 'Create an account and become part of Oni.'
                   : 'Login to continue your journey on Oni.'}
               </p>
             </motion.div>
           </AnimatePresence>
         </motion.div>
       </motion.div>
     </div>
   );
 }
