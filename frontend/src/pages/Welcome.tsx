import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2574')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start justify-end min-h-screen p-8 pb-16 text-white">
        <div className="space-y-2 mb-12">
          <h1 className="text-7xl font-bold tracking-tight">Coffee</h1>
          <p className="text-2xl font-light">Meet. Converse. Belong.</p>
        </div>

        <Link to="/login" className="w-full">
          <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
