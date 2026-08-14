import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Crown, Sparkles, Heart, Brain, Star, X } from 'lucide-react';
import { BOYS, GIRLS, CATEGORIES, Candidate, CategoryType } from '../data/candidates';
import { useToast } from '@/hooks/use-toast';

// Local storage helper hooks
function useVotes() {
  const [votes, setVotes] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('king-queen-votes');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const castVote = (categoryId: string, candidateId: string) => {
    const newVotes = { ...votes, [categoryId]: candidateId };
    setVotes(newVotes);
    localStorage.setItem('king-queen-votes', JSON.stringify(newVotes));
  };

  return { votes, castVote };
}

// Map icon strings to actual Lucide components
const IconMap: Record<string, React.ElementType> = {
  Crown, Sparkles, Heart, Brain, Star
};

export default function Vote() {
  const { toast } = useToast();
  const { votes, castVote } = useVotes();
  
  const [expandedCandidate, setExpandedCandidate] = useState<Candidate | null>(null);
  
  // Stacks states - indexing the current top card
  const [boyIndex, setBoyIndex] = useState(0);
  const [girlIndex, setGirlIndex] = useState(0);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);

  const handleVote = (candidate: Candidate, categoryId: string, categoryTitle: string) => {
    if (votes[categoryId]) return; // Already voted

    castVote(categoryId, candidate.id);
    
    // Trigger confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);

    toast({
      title: "Vote Completed!",
      description: `You voted ${candidate.name} for ${categoryTitle}`,
      duration: 3000,
      className: "bg-cream text-primary border-none font-serif text-lg",
    });

    setTimeout(() => {
      setExpandedCandidate(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-12 pb-24">
      <div className="stars-bg"></div>
      
      {/* Background ambient lights */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 h-full flex flex-col">
        
        <header className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text inline-block"
          >
            Cast Your Votes
          </motion.h1>
          <p className="text-muted-foreground mt-4 font-light text-lg">Tap a card to view and vote.</p>
        </header>

        <div className="flex-1 grid md:grid-cols-2 gap-12 max-w-5xl mx-auto w-full">
          {/* Boys Stack */}
          <div className="flex flex-col items-center">
            <CardStack 
              candidates={BOYS} 
              currentIndex={boyIndex} 
              setIndex={setBoyIndex} 
              onExpand={setExpandedCandidate}
              theme="boys"
            />
          </div>

          {/* Girls Stack */}
          <div className="flex flex-col items-center">
            <CardStack 
              candidates={GIRLS} 
              currentIndex={girlIndex} 
              setIndex={setGirlIndex} 
              onExpand={setExpandedCandidate}
              theme="girls"
            />
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {expandedCandidate && (
          <ExpandedModal 
            candidate={expandedCandidate} 
            votes={votes}
            onVote={handleVote}
            onClose={() => setExpandedCandidate(null)} 
          />
        )}
      </AnimatePresence>

      {/* Confetti Overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            {/* Extremely simple CSS confetti simulation using framer motion */}
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  scale: 0, 
                  x: 0, 
                  y: 0,
                  rotate: 0
                }}
                animate={{ 
                  scale: [0, 1, 0.5],
                  x: (Math.random() - 0.5) * window.innerWidth,
                  y: (Math.random() - 0.5) * window.innerHeight,
                  rotate: 360 * Math.random()
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`absolute w-3 h-3 rounded-full ${['bg-primary', 'bg-blue-400', 'bg-pink-400', 'bg-white'][Math.floor(Math.random() * 4)]}`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CardStack({ 
  candidates, 
  currentIndex, 
  setIndex, 
  onExpand,
  theme
}: { 
  candidates: Candidate[], 
  currentIndex: number, 
  setIndex: (i: number) => void,
  onExpand: (c: Candidate) => void,
  theme: CategoryType
}) {
  const isBoys = theme === 'boys';
  const baseColor = isBoys ? 'from-white-900/40 to-white-950/90 border-white-500/30' : 'from-white-900/40 to-white-950/90 border-white-500/30';
  const accentColor = isBoys ? 'text-white-400' : 'text-white-400';

  const nextCard = () => setIndex((currentIndex + 1) % candidates.length);
  const prevCard = () => setIndex((currentIndex - 1 + candidates.length) % candidates.length);

  return (
    <div className="relative w-full max-w-[320px] h-[450px] flex items-center justify-center perspective-1000">
      
      {/* Background stacked cards */}
      <AnimatePresence>
        {candidates.map((candidate, idx) => {
          // Calculate relative position (0 is top, 1 is next, etc.)
          let relIndex = (idx - currentIndex + candidates.length) % candidates.length;
          
          // Only show top 3 cards
          if (relIndex > 2) return null;

          const isTop = relIndex === 0;

          return (
            <motion.div
              key={candidate.id}
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{
                scale: 1 - relIndex * 0.05,
                y: relIndex * 20,
                rotateZ: isTop ? 0 : relIndex % 2 === 0 ? 3 : -3,
                zIndex: 30 - relIndex,
                opacity: 1 - relIndex * 0.2
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`absolute inset-0 mx-auto w-[280px] h-[380px] rounded-2xl cursor-pointer group shadow-2xl bg-gradient-to-b border overflow-hidden ${baseColor}`}
              onClick={() => isTop && onExpand(candidate)}
              drag={isTop ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(_e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -10000 || offset.x < -100) nextCard();
                else if (swipe > 10000 || offset.x > 100) prevCard();
              }}
            >
              {/* Photo Area */}
              <div className="absolute inset-x-0 top-0 h-[100%] bg-black/50 overflow-hidden">
                <img 
                  src={candidate.image} 
                  alt={candidate.name} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                  draggable={false}
                />
                {/* Gradient overlay to blend with card body */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              </div>

              {/* Number Badge */}
              <div className={`absolute top-4 left-4 backdrop-blur-md bg-white/40 px-3 py-1 rounded-full border border-white/10 text-sm font-serif font-bold ${accentColor}`}>
                No. {candidate.number}
              </div>

              {/* Content Area */}
              <div className="absolute inset-x-0 bottom-0 h-[35%] p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-serif font-bold text-foreground truncate">
                  {candidate.name}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute -bottom-6 flex gap-4 z-40">
        <button 
          onClick={prevCard}
          className="w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-colors text-black hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextCard}
          className="w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-colors text-black hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function ExpandedModal({ 
  candidate, 
  onClose,
  votes,
  onVote
}: { 
  candidate: Candidate, 
  onClose: () => void,
  votes: Record<string, string>,
  onVote: (candidate: Candidate, catId: string, catTitle: string) => void
}) {
  const isBoys = candidate.gender === 'boys';
  const categories = CATEGORIES[candidate.gender];
  
  const themeBase = isBoys ? 'from-white-950/90 to-slate-900/95' : 'from-white-950/90 to-slate-900/95';
  const accentBorder = isBoys ? 'border-white-500/30' : 'border-white-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal Card */}
<motion.div
  initial={{ scale: 0.95, opacity: 0, y: 20 }}
  animate={{ scale: 1, opacity: 1, y: 0 }}
  exit={{ scale: 0.95, opacity: 0, y: 20 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
  className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-xl"
>

  {/* FULL IMAGE */}
  <div className="relative w-full aspect-[3/4]">
    <img
      src={candidate.image}
      alt={candidate.name}
      className="w-full h-full object-cover"
    />

    {/* Stronger gradient for readability */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

    {/* CONTENT OVERLAY */}
    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 text-white">

      {/* Name + number */}
      <div>
        <div className="inline-block px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-[10px] font-semibold mb-1">
          No. {candidate.number}
        </div>

        <h2 className="text-xl font-serif font-bold leading-tight">
          {candidate.name}
        </h2>
      </div>

      {/* BUTTONS OVER IMAGE */}
      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat) => {
          const Icon = IconMap[cat.icon];
          const isVotedForThis = votes[cat.id] === candidate.id;
          const isVotedForOther = votes[cat.id] && votes[cat.id] !== candidate.id;

          let buttonStyle =
            "bg-white/15 backdrop-blur border border-white/20 text-white hover:bg-white/25";

          if (isVotedForThis) {
            buttonStyle =
              "bg-white text-primary border-transparent";
          } else if (isVotedForOther) {
            buttonStyle =
              "bg-black/40 text-white/40 border-white/10 cursor-not-allowed";
          }

          return (
            <button
              key={cat.id}
              onClick={() => onVote(candidate, cat.id, cat.title)}
              disabled={isVotedForThis || !!isVotedForOther}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-s font-medium transition ${buttonStyle}`}
            >
              <span className="truncate">{cat.title}</span>
            </button>
          );
        })}
      </div>

    </div>
  </div>
</motion.div>
    </div>
  );
}
