import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Abstract decorative elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/20 to-transparent opacity-50 blur-3xl pointer-events-none"></div>
      
      <main className="container mx-auto px-6 py-12 md:py-18 relative z-10 max-w-4xl">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Fresher's <span className="green-text">Welcome</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Let's vote your favorite candidates for the Fresher's Welcome event!
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mb-10"
        >
          <Link href="/vote" className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full green-bg text-primary-foreground font-bold text-xl hover:scale-105 active:scale-95 transition-all group">
            <span>Cast Vote</span>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-sm text-muted-foreground/60 uppercase tracking-widest font-medium">
            Your vote is anonymous and final
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Rules Section */} 
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-panel rounded-2xl p-8 relative overflow-hidden group hover:border-primary/50 transition-colors"
          >
            <h2 className="text-2xl font-serif text-primary mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary"></span>
              The Rules
            </h2>
            
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>You may cast <strong>ONE</strong> vote per category.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="block mb-1 font-medium text-foreground">Boys Categories:</span>
                  <span className="text-sm">King, Smart, Mr. Popular</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="block mb-1 font-medium text-foreground">Girls Categories:</span>
                  <span className="text-sm">Queen, Style, Ms. Popular</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Voting will be opened <strong>for 5 hours</strong>.</span>
              </li>
            </ul>
          </motion.div>

          {/* How to Vote Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-panel rounded-2xl p-8 relative overflow-hidden group hover:border-primary/50 transition-colors"
          >

            <h2 className="text-2xl font-serif text-primary mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary"></span>
              How to Vote
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full green-bg text-primary-foreground flex items-center justify-center font-bold font-serif shrink-0 shadow-lg">1</div>
                <div>
                  <h3 className="font-medium text-lg mb-1 text-foreground">Browse the Candidates</h3>
                  <p className="text-sm text-muted-foreground">Swipe through the card stacks for Boys and Girls.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full green-bg text-primary-foreground flex items-center justify-center font-bold font-serif shrink-0 shadow-lg">2</div>
                <div>
                  <h3 className="font-medium text-lg mb-1 text-foreground">Select a Profile</h3>
                  <p className="text-sm text-muted-foreground">Tap any candidate's card to view their full portrait and voting options.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full green-bg text-primary-foreground flex items-center justify-center font-bold font-serif shrink-0 shadow-lg">3</div>
                <div>
                  <h3 className="font-medium text-lg mb-1 text-foreground">Cast Your Vote</h3>
                  <p className="text-sm text-muted-foreground">Tap the title you wish to vote for. Make it count!</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
