import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import { motion, AnimatePresence } from "motion/react";
import { ReactLenis, useLenis } from "lenis/react";
import { useState, useRef, useEffect } from "react";
import { Mail } from "lucide-react";

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
                    <a href="mailto:athulvikram012@gmail.com" className="group text-sm text-zinc-300 hover:text-white transition-colors font-medium break-all lowercase flex items-center gap-3">
                      <Mail className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                      athulvikram012@gmail.com
                    </a>
                  </div>
                  <div className="w-full h-px bg-white/5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">Phone</span>
                    <a href="https://wa.me/917306483636" target="_blank" rel="noopener noreferrer" className="group text-sm text-zinc-300 hover:text-white transition-colors font-medium flex items-center gap-3">
                      <svg className="w-4 h-4 text-zinc-500 group-hover:text-[#25D366] transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                      </svg>
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
