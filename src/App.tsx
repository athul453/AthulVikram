import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import { motion, AnimatePresence } from "motion/react";
import { ReactLenis, useLenis } from "lenis/react";

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();
  const isHome = location.pathname === '/';
  
  const handleGalleryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isHome) {
      if (lenis) {
        lenis.scrollTo('#works', { duration: 1.2 });
      } else {
        document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        if (lenis) {
          lenis.scrollTo('#works', { duration: 1.2 });
        } else {
          document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[60] px-6 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm pointer-events-auto">
        <Link to="/" className="text-2xl font-display font-bold tracking-tighter hover:text-purple-400 transition-colors">
          AV<span className="text-purple-500">.</span>
        </Link>
        <div className="flex gap-8 text-xs uppercase tracking-widest font-bold text-zinc-400">
          <button onClick={handleGalleryClick} className="hover:text-white transition-colors uppercase tracking-widest font-bold text-xs cursor-pointer">GALLERY</button>
          <a href="mailto:athulvikram2003@gmail.com" className="hover:text-white transition-colors uppercase tracking-widest font-bold text-xs">CONTACT</a>
        </div>
      </nav>

      {/* PERFECT VRAM RETENTION: Home NEVER unmounts! The 67MB model sits dormant in memory, mathematically eradicating the 800ms parsing lag. */}
      <div 
         style={{ 
           opacity: isHome ? 1 : 0, 
           visibility: isHome ? 'visible' : 'hidden', 
           pointerEvents: isHome ? 'auto' : 'none',
           transition: 'opacity 0.3s ease-in-out',
           position: isHome ? 'relative' : 'fixed',
           height: isHome ? 'auto' : '100vh',
           overflow: isHome ? 'visible' : 'hidden',
           top: 0,
           left: 0,
           width: '100%'
         }}
      >
        <Home />
      </div>

      {/* Exclusively animate sub-pages layered over the top */}
      <AnimatePresence mode="wait">
        {!isHome && (
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 w-full min-h-screen bg-[#0a0a0a] z-50"
          >
            <Routes location={location}>
              <Route path="/project/:id" element={<ProjectDetail />} />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  // Globally crush Chromium's native Scroll Restoration so it cannot hijack 
  // the Y-axis coordinates when triggered by a physical hardware mouse BACK button!
  if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  return (
    <ReactLenis root>
      <Router>
      <div className="relative">
        <AnimatedRoutes />
      </div>
      </Router>
    </ReactLenis>
  );
}
