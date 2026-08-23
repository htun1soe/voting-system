import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Crown, Mail, Lock, ArrowRight, Shield, BarChart3, Users, Clock } from 'lucide-react';
import { useStore } from '../../lib/store';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

type FormData = z.infer<typeof schema>;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    const success = login(data.email, data.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
<div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel rounded-2xl p-8 w-full max-w-md shadow-lg"
        >
          <div className="mb-8 text-center">
            <h2 className="font-serif font-bold text-3xl text-[hsl(265_30%_15%)] mb-2">Welcome Back</h2>
            <p className="text-[hsl(265_10%_45%)]">Sign in to manage your university voting system!</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[hsl(265_30%_20%)] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(265_10%_50%)] pointer-events-none" />
                <input
                  type="email"
                  {...register('email')}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] bg-white focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 focus:border-[hsl(265_85%_60%)] outline-none transition-all text-[hsl(265_30%_15%)]"
                  placeholder="admin@university.edu"
                />
              </div>
              {errors.email && <p className="text-xs text-[hsl(0_70%_50%)] mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(265_30%_20%)] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(265_10%_50%)] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] bg-white focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 focus:border-[hsl(265_85%_60%)] outline-none transition-all text-[hsl(265_30%_15%)]"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-[hsl(0_70%_50%)] mt-1.5">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={e => setShowPassword(e.target.checked)}
                  className="w-4 h-4 rounded border-[hsl(265_10%_80%)] text-[hsl(265_85%_55%)] focus:ring-[hsl(265_85%_60%)]/50"
                />
                <span className="text-[hsl(265_10%_45%)]">Show password</span>
              </label>
              <a href="#" className="text-[hsl(265_85%_55%)] font-medium hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3.5 rounded-xl green-bg text-white font-semibold hover:scale-[1.02] transition-all shadow-lg shadow-[hsl(265_85%_58%)]/30 flex items-center justify-center gap-2"
            >
              Sign In to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
  );
};

export default Home;