import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Check } from 'lucide-react';
import type { Candidate, Category } from '../lib/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum(['King', 'Queen', 'Smart', 'Style', 'Mr. Popular', 'Ms. Popular']),
  department: z.string().min(2, 'Department is required'),
  year: z.string().min(1, 'Year is required'),
  photoUrl: z.string().url('Must be a valid URL'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

interface CandidateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Candidate, 'id' | 'votes'>) => void;
  candidate?: Candidate | null;
  categories: Category[];
}

const CandidateModal: React.FC<CandidateModalProps> = ({ open, onClose, onSave, candidate, categories }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (candidate) {
      reset({
        name: candidate.name,
        category: candidate.category,
        department: candidate.department,
        year: candidate.year,
        photoUrl: candidate.photoUrl,
        bio: candidate.bio,
      });
    } else {
      reset({
        name: '',
        category: categories[0],
        department: '',
        year: '',
        photoUrl: '',
        bio: '',
      });
    }
  }, [candidate, open, reset, categories]);

  const onSubmit = (data: FormData) => {
    onSave(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[hsl(265_10%_92%)] sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">
                {candidate ? 'Edit Candidate' : 'Add New Candidate'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(265_10%_50%)] hover:bg-[hsl(265_20%_95%)] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[hsl(265_30%_20%)] mb-1.5">Full Name</label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-2.5 rounded-lg border border-[hsl(265_10%_88%)] focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 focus:border-[hsl(265_85%_60%)] outline-none transition-all text-[hsl(265_30%_15%)]"
                  placeholder="e.g., James Okoro"
                />
                {errors.name && <p className="text-xs text-[hsl(0_70%_50%)] mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[hsl(265_30%_20%)] mb-1.5">Category</label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-2.5 rounded-lg border border-[hsl(265_10%_88%)] focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 focus:border-[hsl(265_85%_60%)] outline-none transition-all text-[hsl(265_30%_15%)] bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-[hsl(0_70%_50%)] mt-1">{errors.category.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(265_30%_20%)] mb-1.5">Department</label>
                <input
                  {...register('department')}
                  className="w-full px-4 py-2.5 rounded-lg border border-[hsl(265_10%_88%)] focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 focus:border-[hsl(265_85%_60%)] outline-none transition-all text-[hsl(265_30%_15%)]"
                  placeholder="e.g., Computer Science"
                />
                {errors.department && <p className="text-xs text-[hsl(0_70%_50%)] mt-1">{errors.department.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(265_30%_20%)] mb-1.5">Photo URL</label>
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(265_10%_50%)] pointer-events-none" />
                  <input
                    {...register('photoUrl')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[hsl(265_10%_88%)] focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 focus:border-[hsl(265_85%_60%)] outline-none transition-all text-[hsl(265_30%_15%)]"
                    placeholder="https://placehold.co/600x400"
                  />
                </div>
                {errors.photoUrl && <p className="text-xs text-[hsl(0_70%_50%)] mt-1">{errors.photoUrl.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(265_30%_20%)] mb-1.5">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-[hsl(265_10%_88%)] focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 focus:border-[hsl(265_85%_60%)] outline-none transition-all text-[hsl(265_30%_15%)] resize-none"
                  placeholder="Brief description of the candidate..."
                />
                {errors.bio && <p className="text-xs text-[hsl(0_70%_50%)] mt-1">{errors.bio.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-2.5 rounded-lg border border-[hsl(265_10%_88%)] text-sm font-medium text-[hsl(265_20%_35%)] hover:bg-[hsl(265_20%_96%)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-5 py-2.5 rounded-lg green-bg text-white text-sm font-semibold hover:scale-[1.02] transition-all shadow-lg shadow-[hsl(265_85%_58%)]/30 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {candidate ? 'Save Changes' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CandidateModal;