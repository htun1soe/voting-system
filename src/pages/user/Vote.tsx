import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Crown} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/layouts/Layout';

interface APICandidate {
  c_id: number;
  c_number: number;
  c_name: string;
  c_photo?: string;
  major?: string;
  c_gender: 'boy' | 'girl' | string;
}

interface APITitle {
  title_id: number;
  title: string;
  group: 'boy' | 'girl';
  selected_candidate_id?: number | null;
}

interface APISubmittedVote {
  title: string;
  candidate_number: number;
  candidate_name: string;
  major?: string;
}

interface APIBallot {
  voter_id: string;
  festival_target_id: number;
  festival: string;
  titles: APITitle[];
  candidates: APICandidate[];
  submitted?: boolean;
  submitted_votes?: APISubmittedVote[];
}

// Internal structure mapped to maintain original UI styling
interface Candidate {
  id: string; // e.g. "boy-1" or "girl-2"
  c_id: number;
  number: number;
  name: string;
  image: string;
  gender: 'boys' | 'girls';
  major?: string;
}

interface Category {
  id: string; // string key "cat-{title_id}" for matching component state
  title_id: number;
  title: string;
  icon: string;
}

export default function Vote() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const voterId = new URLSearchParams(window.location.search).get("voter_id");

  // API state
  const [ballot, setBallot] = useState<APIBallot | null>(null);

  // Key-value mapping: `cat-${title_id}` -> `boy-${c_id}` or `girl-${c_id}`
  const [votes, setVotes] = useState<Record<string, string>>({});

  const [expandedCandidate, setExpandedCandidate] = useState<Candidate | null>(null);

  const [confirmation, setConfirmation] = useState<{
    candidate: Candidate;
    categoryId: string;
    titleId: number;
    categoryTitle: string;
  } | null>(null);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Stacks states - indexing current top card
  const [boyIndex, setBoyIndex] = useState(0);
  const [girlIndex, setGirlIndex] = useState(0);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);

  // API 1: Poll voter session validity 
  const loadStatus = async () => {
    if (!voterId) return;

    try {
      const response = await fetch(
        `/api/voter/session?voter_id=${encodeURIComponent(voterId)}`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok || data.valid === false) {
        setQrAuthorized(false);
        return;
      }

      if (data.submitted && ballot && !ballot.submitted) {
        await loadBallot();
      }
    } catch (e) {
      console.error("Session check failed", e);
    }
  };

  const draftKeyFor = (festivalTargetId: number, voter: string) =>
    `qrVotingDraft:${festivalTargetId}:${voter}`;

  // API 2: Fetch Voter Ballot
  const [qrAuthorized, setQrAuthorized] = useState<boolean | null>(null);
  const loadBallot = async () => {
    if (!voterId) return;

    try {
      const response = await fetch(
        `/api/voter/ballot?voter_id=${encodeURIComponent(voterId)}`,
        { credentials: "include" }
      );

      const data: APIBallot & { success?: boolean; valid?: boolean; detail?: string } =
        await response.json();

      if (data.valid === false) {
        setQrAuthorized(false);
        return;
      }

      if (!response.ok || data.success === false) {
        toast({
          title: "Error",
          description: data.detail || "Unable to load ballot",
          variant: "destructive",
        });
        return;
      }

      setQrAuthorized(true);
      setBallot(data);

      const draftKey = draftKeyFor(data.festival_target_id, voterId);

      let stored: Record<string, string> = {};
      try {
        stored = JSON.parse(localStorage.getItem(draftKey) || "{}");
      } catch {}

      const initialVotes: Record<string, string> = { ...stored };

      if (data.submitted) {
        localStorage.removeItem(draftKey);
        setVotes({});
        setLocation(`/VoteResult?voter_id=${encodeURIComponent(voterId)}`);
        return;
      }

      data.titles.forEach((t) => {
        const catKey = `cat-${t.title_id}`;
        if (!initialVotes[catKey] && t.selected_candidate_id) {
          initialVotes[catKey] = `${t.group}-${t.selected_candidate_id}`;
        }
      });

      localStorage.setItem(draftKey, JSON.stringify(initialVotes));
      setVotes(initialVotes);
    } catch (e) {
      console.error("Failed to load ballot", e);
    }
  };

  useEffect(() => {
    loadStatus();
    loadBallot();

    const interval = setInterval(loadStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const BOYS: Candidate[] = (ballot?.candidates || [])
    .filter((c) => c.c_gender === 'boy')
    .map((c) => ({
      id: `boy-${c.c_id}`,
      c_id: c.c_id,
      number: c.c_number,
      name: c.c_name,
      image: c.c_photo || '',
      gender: 'boys',
      major: c.major,
    }));

  const GIRLS: Candidate[] = (ballot?.candidates || [])
    .filter((c) => c.c_gender === 'girl')
    .map((c) => ({
      id: `girl-${c.c_id}`,
      c_id: c.c_id,
      number: c.c_number,
      name: c.c_name,
      image: c.c_photo || '',
      gender: 'girls',
      major: c.major,
    }));

  const CATEGORIES: Record<'boys' | 'girls', Category[]> = {
    boys: (ballot?.titles || [])
      .filter((t) => t.group === 'boy')
      .map((t) => ({
        id: `cat-${t.title_id}`,
        title_id: t.title_id,
        title: t.title,
        icon: 'Crown',
      })),
    girls: (ballot?.titles || [])
      .filter((t) => t.group === 'girl')
      .map((t) => ({
        id: `cat-${t.title_id}`,
        title_id: t.title_id,
        title: t.title,
        icon: 'Crown',
      })),
  };

  useEffect(() => {
    if (!ballot || !voterId) return;

    const draftKey = draftKeyFor(ballot.festival_target_id, voterId);
    localStorage.setItem(draftKey, JSON.stringify(votes));
  }, [votes]);

  const handleVote = (
    candidate: Candidate,
    categoryId: string,
    categoryTitle: string
  ) => {
    if (votes[categoryId]) {
      return;
    }

    const candidateAlreadyUsed = Object.values(votes).includes(candidate.id);

    if (candidateAlreadyUsed) {
      toast({
        title: "Candidate Already Used",
        description: `${candidate.name} has already been selected for another category.`,
        duration: 3000,
      });
      return;
    }

    const categoryObj = [...CATEGORIES.boys, ...CATEGORIES.girls].find(c => c.id === categoryId);

    setConfirmation({
      candidate,
      categoryId,
      titleId: categoryObj?.title_id || 0,
      categoryTitle,
    });
  };

  const submitBallot = async () => {
    if (!ballot || !voterId) return;

    const selections = [
      ...CATEGORIES.boys,
      ...CATEGORIES.girls,
    ].map((cat) => ({
      title_id: cat.title_id,
      candidate_id: Number(votes[cat.id]?.split("-")[1]),
    }));

    try {
      const res = await fetch(
        `/api/voter/submit?voter_id=${encodeURIComponent(voterId)}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selections }),
        }
      );

      const data: { ok?: boolean; submitted?: boolean; message?: string; detail?: string } =
        await res.json();

      if (!res.ok || data.ok !== true) {
        toast({
          title: "Submit Failed",
          description: data.detail || "Your ballot was not submitted. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // clear draft
      const draftKey = draftKeyFor(ballot.festival_target_id, voterId);
      localStorage.removeItem(draftKey);

      toast({
        title: "Vote Submitted",
        description: data.message || "Your vote is final",
      });

      await loadBallot();
      setLocation(`/VoteResult?voter_id=${encodeURIComponent(voterId)}`);

    } catch {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    }
  };

  if (qrAuthorized === null) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center text-center px-6">
          <div className="max-w-md">
            <h1 className="text-3xl font-bold mb-4">
              QR Access Required
            </h1>
            <p className="text-muted-foreground mb-6">
              Please scan the official QR code to access the voting page.
            </p>

            <button
              onClick={() => setLocation("/")}
              className="px-6 py-3 bg-primary text-white rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen relative overflow-hidden pt-22 pb-24">

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

            <p className="text-muted-foreground mt-4 font-light text-lg">
              Tap a card to view and vote.
            </p>
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

        {/* Submit & Reset Buttons */}
        <div className="flex justify-center items-center gap-4 mt-16">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-6 py-3 rounded-lg border border-red-400/40 text-red-500 hover:bg-red-500/10 transition"
          >
            Reset
          </button>

          <button
            onClick={submitBallot}
            className="px-6 py-3 rounded-lg bg-primary text-white hover:opacity-90 transition shadow-md font-medium"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {expandedCandidate && (
          <ExpandedModal
            candidate={expandedCandidate}
            categories={CATEGORIES[expandedCandidate.gender]}
            votes={votes}
            onVote={handleVote}
            onClose={() => setExpandedCandidate(null)}
          />
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmation && (
          <ConfirmationModal
            confirmation={confirmation}
            onCancel={() => setConfirmation(null)}
            onConfirm={() => {
              setVotes((prev) => ({
                ...prev,
                [confirmation.categoryId]: confirmation.candidate.id,
              }));

              setConfirmation(null);
              setShowConfetti(true);

              setTimeout(() => setShowConfetti(false), 2000);

              toast({
                title: "Vote Selected",
                description: `${confirmation.candidate.name} for ${confirmation.categoryTitle}`,
                duration: 3000,
              });

              setExpandedCandidate(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Reset Votes?
              </h2>

              <p className="text-gray-600 mb-6">
                Are you sure you want to reset all your votes?
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  No
                </button>

                <button
                  onClick={async () => {
                    setVotes({});

                    if (ballot && voterId) {
                      const draftKey = draftKeyFor(ballot.festival_target_id, voterId);
                      localStorage.removeItem(draftKey);
                    }
                    setShowResetConfirm(false);

                    toast({
                      title: "Votes Reset",
                      description: "You can now choose your candidates again.",
                      duration: 3000,
                    });
                  }}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
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
    </>
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
  theme: 'boys' | 'girls'
}) {
  const isBoys = theme === 'boys';
  const baseColor = isBoys ? 'from-white-900/40 to-white-950/90 border-white-500/30' : 'from-white-900/40 to-white-950/90 border-white-500/30';
  const accentColor = isBoys ? 'text-white-400' : 'text-white-400';

  const nextCard = () => candidates.length && setIndex((currentIndex + 1) % candidates.length);
  const prevCard = () => candidates.length && setIndex((currentIndex - 1 + candidates.length) % candidates.length);

  return (
    <div className="relative w-full max-w-[320px] h-[450px] flex items-center justify-center perspective-1000">
      <AnimatePresence>
        {candidates.map((candidate, idx) => {
          let relIndex = (idx - currentIndex + candidates.length) % candidates.length;
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
              <div className="absolute inset-x-0 top-0 h-[100%] bg-black/50 overflow-hidden">
                <img
                  src={candidate.image}
                  alt={candidate.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              </div>

              <div className={`absolute top-4 left-4 backdrop-blur-md bg-white/40 px-3 py-1 rounded-full border border-white/10 text-sm font-serif font-bold ${accentColor}`}>
                No. {candidate.number}
              </div>

              <div className="absolute inset-x-0 bottom-0 h-[35%] p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-serif font-bold text-foreground truncate">
                  {candidate.name}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

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
  categories,
  onClose,
  votes,
  onVote
}: {
  candidate: Candidate,
  categories: Category[],
  onClose: () => void,
  votes: Record<string, string>,
  onVote: (candidate: Candidate, catId: string, catTitle: string) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-xl"
      >
        <div className="relative w-full aspect-[3/4]">
          <img
            src={candidate.image}
            alt={candidate.name}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 text-white">
            <div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-[10px] font-semibold mb-1">
                No. {candidate.number}
              </div>

              <h2 className="text-xl font-serif font-bold leading-tight">
                {candidate.name}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => {
                const isVotedForThis = votes[cat.id] === candidate.id;
                const isCategoryAlreadyVoted = !!votes[cat.id] && votes[cat.id] !== candidate.id;
                const isCandidateAlreadyUsed = Object.values(votes).includes(candidate.id);

                let buttonStyle = "bg-white/15 backdrop-blur border border-white/20 text-white hover:bg-white/25";

                if (isVotedForThis) {
                  buttonStyle = "bg-white text-primary border-transparent";
                } else if (isCategoryAlreadyVoted || isCandidateAlreadyUsed) {
                  buttonStyle = "bg-black/40 text-white/40 border-white/10 cursor-not-allowed";
                }

                return (
                  <button
                    key={cat.id}
                    onClick={() => onVote(candidate, cat.id, cat.title)}
                    disabled={
                      isVotedForThis ||
                      isCategoryAlreadyVoted ||
                      isCandidateAlreadyUsed
                    }
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

function ConfirmationModal({
  confirmation,
  onCancel,
  onConfirm,
}: {
  confirmation: {
    candidate: Candidate;
    categoryId: string;
    titleId: number;
    categoryTitle: string;
  };
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Confirm Your Vote
        </h2>

        <p className="text-gray-600 mb-6">
          Are you sure you want to vote{" "}
          <strong>
            No. {confirmation.candidate.number}
          </strong>{" "}
          for{" "}
          <strong>
            {confirmation.categoryTitle}
          </strong>
          ?
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            No
          </button>

          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition"
          >
            Yes
          </button>
        </div>
      </motion.div>
    </div>
  );
}