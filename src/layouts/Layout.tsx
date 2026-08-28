import { Crown } from "lucide-react";
import { Link } from "wouter";

function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass-panel border-b-0 border-white/5">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Crown className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-serif font-bold text-lg tracking-wide text-foreground">
            MTU Voting
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin
          </Link>
          <Link
            href="/q/:public_id/:secret"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cast Vote
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;