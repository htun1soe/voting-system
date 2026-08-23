import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Calendar, User, Hash, Image as ImageIcon, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const candidateSchema = z.object({
  name: z.string().min(2, 'Name required'),
  number: z.string().min(1, 'Number required'),
  category: z.string().min(1, 'Category required'),
  photoUrl: z.string().url('Valid URL required'),
});

const eventSchema = z.object({
  title: z.string().min(3, 'Event title required'),
  boyTitle: z.string().min(2, 'Boy title required (e.g. King)'),
  girlTitle: z.string().min(2, 'Girl title required (e.g. Queen)'),
  endDate: z.string().min(1, 'End date required'),
  candidates: z.array(candidateSchema).min(2, 'Add at least 2 candidates'),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, onCancel }) => {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      boyTitle: 'King',
      girlTitle: 'Queen',
      endDate: '',
      candidates: [{ name: '', number: '', category: 'King', photoUrl: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "candidates"
  });

  const boyTitle = watch('boyTitle');
  const girlTitle = watch('girlTitle');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[hsl(265_10%_90%)] shadow-xl overflow-hidden max-w-4xl mx-auto"
    >
      <div className="p-6 border-b border-[hsl(265_10%_92%)] bg-[hsl(265_85%_98%)]">
        <h2 className="font-serif font-bold text-2xl text-[hsl(265_30%_15%)]">Create New Voting Event</h2>
        <p className="text-sm text-[hsl(265_10%_45%)]">Define your event details and candidates below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[hsl(265_30%_20%)] mb-2">Event Title</label>
            <input
              {...register('title')}
              className="w-full px-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 outline-none transition-all"
              placeholder="e.g., University Annual Awards 2026"
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[hsl(265_30%_20%)] mb-2">Boy Title</label>
            <input
              {...register('boyTitle')}
              className="w-full px-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 outline-none transition-all"
              placeholder="e.g., King"
            />
            {errors.boyTitle && <p className="text-xs text-destructive mt-1">{errors.boyTitle.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[hsl(265_30%_20%)] mb-2">Girl Title</label>
            <input
              {...register('girlTitle')}
              className="w-full px-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 outline-none transition-all"
              placeholder="e.g., Queen"
            />
            {errors.girlTitle && <p className="text-xs text-destructive mt-1">{errors.girlTitle.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[hsl(265_30%_20%)] mb-2">Voting End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(265_10%_50%)]" />
              <input
                type="datetime-local"
                {...register('endDate')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[hsl(265_10%_88%)] focus:ring-2 focus:ring-[hsl(265_85%_60%)]/50 outline-none transition-all"
              />
            </div>
            {errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate.message}</p>}
          </div>
        </div>

        {/* Candidates Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-xl text-[hsl(265_30%_15%)]">Candidates</h3>
            <button
              type="button"
              onClick={() => append({ name: '', number: '', category: boyTitle, photoUrl: '' })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(95%_0.02_180)] text-[oklch(45%_0.07_180)] text-sm font-semibold hover:bg-[oklch(92%_0.03_180)] transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Candidate
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <motion.div 
                key={field.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-5 rounded-2xl border border-[hsl(265_10%_90%)] bg-[hsl(260_30%_99%)] relative group"
              >
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-4 right-4 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(265_10%_60%)]" />
                      <input
                        {...register(`candidates.${index}.name`)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm outline-none focus:ring-2 focus:ring-[hsl(265_85%_60%)]/30"
                        placeholder="Full Name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Number</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(265_10%_60%)]" />
                      <input
                        {...register(`candidates.${index}.number`)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm outline-none focus:ring-2 focus:ring-[hsl(265_85%_60%)]/30"
                        placeholder="e.g. 01"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Category</label>
                    <select
                      {...register(`candidates.${index}.category`)}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm outline-none focus:ring-2 focus:ring-[hsl(265_85%_60%)]/30 bg-white"
                    >
                      <option value={boyTitle}>{boyTitle}</option>
                      <option value={girlTitle}>{girlTitle}</option>
                      <option value="Smart">Smart</option>
                      <option value="Style">Style</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(265_10%_50%)] mb-1.5">Photo URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(265_10%_60%)]" />
                      <input
                        {...register(`candidates.${index}.photoUrl`)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-[hsl(265_10%_88%)] text-sm outline-none focus:ring-2 focus:ring-[hsl(265_85%_60%)]/30"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {errors.candidates && <p className="text-sm text-destructive">{errors.candidates.message}</p>}
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-[hsl(265_10%_92%)]">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-[hsl(265_10%_88%)] text-sm font-semibold text-[hsl(265_10%_40%)] hover:bg-[hsl(265_20%_97%)] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded-xl green-bg text-white font-bold shadow-lg shadow-[hsl(265_85%_58%)]/30 hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Launch Event
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EventForm;