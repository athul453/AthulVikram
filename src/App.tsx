import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import { motion, AnimatePresence } from "motion/react";
import { ReactLenis, useLenis } from "lenis/react";
import { useState, useRef, useEffect } from "react";

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();
  const isHome = location.pathname === '/';
  const [showContact, setShowContact] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setShowContact(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
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
          <div className="relative" ref={contactRef}>
            <button 
              onClick={() => setShowContact(!showContact)}
              className={`transition-colors uppercase tracking-widest font-bold text-xs cursor-pointer ${showContact ? 'text-white' : 'hover:text-white'}`}
            >
              CONTACT
            </button>
            <AnimatePresence>
              {showContact && (
                <motion.div
                  initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-6 bg-[#0a0a0a]/95 border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col gap-5 min-w-[280px] pointer-events-auto z-[100]"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">Email</span>
                    <a href="mailto:athulvikram012@gmail.com" className="text-sm text-zinc-300 hover:text-white transition-colors font-medium break-all">
                      athulvikram012@gmail.com
                    </a>
                  </div>
                  <div className="w-full h-px bg-white/5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">Phone</span>
                    <a href="tel:7306483636" className="text-sm text-zinc-300 hover:text-white transition-colors font-medium">
                      7306483636
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
