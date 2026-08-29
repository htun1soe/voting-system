import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Crown, CheckCircle } from 'lucide-react';
import Navbar from '@/layouts/Layout';

// Matches the documented `submitted_votes` shape returned by
// GET /api/voter/ballot once `submitted: true`. Note: the backend docs do
// not include a candidate photo field here — only title, candidate number,
// name, and major — so this view can't show a portrait from real data.
interface SubmittedVote {
  title: string;
  candidate_number: number;
  candidate_name: string;
  major?: string;
}

interface BallotResponse {
  submitted?: boolean;
  submitted_votes?: SubmittedVote[];
  success?: boolean;
  valid?: boolean;
  detail?: string;
}

export default function VoteResult() {
  const [, setLocation] = useLocation();
  const voterId = new URLSearchParams(window.location.search).get("voter_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedVotes, setSubmittedVotes] = useState<SubmittedVote[]>([]);

  useEffect(() => {
    if (!voterId) {
      setError("Missing voter ID.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const response = await fetch(
          `/api/voter/ballot?voter_id=${encodeURIComponent(voterId)}`,
          { credentials: "include" }
        );

        const data: BallotResponse = await response.json();

        if (data.valid === false) {
          setError(data.detail || "Your session is no longer valid.");
          setLoading(false);
          return;
        }

        if (!response.ok || data.success === false) {
          setError(data.detail || "Unable to load your results.");
          setLoading(false);
          return;
        }

        if (!data.submitted) {
          // Nothing submitted yet for this voter — nothing to show here.
          setLocation(`/vote?voter_id=${encodeURIComponent(voterId)}`);
          return;
        }

        setSubmittedVotes(data.submitted_votes || []);
        setLoading(false);
      } catch (e) {
        console.error("Failed to load vote result", e);
        setError("Network error while loading your results.");
        setLoading(false);
      }
    })();
  }, [voterId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading your results...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center text-center px-6">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
    <div className="min-h-screen flex items-center justify-center px-4 py-10 pt-22 bg-background">
      
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

            {submittedVotes.map((vote) => (
              <div
                key={vote.title}
                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
              >

                {/* Category */}
                <div>
                  <p className="text-sm text-gray-500">
                    {vote.title}
                  </p>

                  <p className="font-semibold text-gray-900">
                    No. {vote.candidate_number}
                  </p>
                </div>

                {/* Candidate */}
                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {vote.candidate_name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {vote.major || ''}
                    </p>
                  </div>

                </div>

              </div>
            ))}

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
    </>
  );
}