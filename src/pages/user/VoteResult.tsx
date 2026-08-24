import React from 'react';
import { Crown, CheckCircle } from 'lucide-react';
import { BOYS, GIRLS, CATEGORIES } from '../../data/candidates';

type VoteRecord = Record<string, string>;

export default function VoteResult() {
  // Get the votes that Vote.tsx saved in localStorage
  const storedVotes = localStorage.getItem('king-queen-votes');

  let votes: VoteRecord = {};

  try {
    votes = storedVotes ? JSON.parse(storedVotes) : {};
  } catch (error) {
    console.error('Could not read votes:', error);
  }

  // Find the candidate using the candidate ID
  const findCandidate = (candidateId: string) => {
    return [...BOYS, ...GIRLS].find(
      (candidate) => candidate.id === candidateId
    );
  };

  // Get the real contest number
  //
  // Boys:
  // 01 - 06
  //
  // Girls:
  // 07 - 12
  //
  // If there are 10 boys:
  // Boys = 01 - 10
  // Girls = 11 - 20
const getContestNumber = (
  candidate: ReturnType<typeof findCandidate>
) => {
  if (!candidate) return '';

  return candidate.number;
};

  // The order we want to display
  const voteCategories = [
    ...CATEGORIES.boys,
    ...CATEGORIES.girls,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      
      {/* Main Card */}
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="w-10 h-10 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text">
            YOU VOTED
          </h1>

          <p className="text-muted-foreground mt-3">
            Your votes have been recorded successfully.
          </p>
        </div>

        {/* Vote Result Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">

          <div className="flex items-center justify-center gap-2 mb-6">
            <CheckCircle className="w-6 h-6 text-green-500" />

            <h2 className="text-xl font-bold text-gray-900">
              Your Selections
            </h2>
          </div>

          <div className="space-y-3">

            {voteCategories.map((category) => {
              const candidateId = votes[category.id];

              const candidate = candidateId
                ? findCandidate(candidateId)
                : undefined;

              if (!candidate) {
                return null;
              }

              const contestNumber = getContestNumber(candidate);

              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
                >

                  {/* Category */}
                  <div>
                    <p className="text-sm text-gray-500">
                      {category.title}
                    </p>

                    <p className="font-semibold text-gray-900">
                      No. {contestNumber}
                    </p>
                  </div>

                  {/* Candidate */}
                  <div className="flex items-center gap-3">

                    <img
                      src={candidate.image}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {candidate.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {category.title}
                      </p>
                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          {/* Thank You */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-gray-600">
              Thank you for participating in the voting.
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Your selections have been recorded.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}