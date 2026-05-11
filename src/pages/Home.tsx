import { motion, AnimatePresence } from "motion/react";
import { PROJECTS } from "../data/works";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ExternalLink, Play, Cpu, Eye } from "lucide-react";
import { useProgress } from "@react-three/drei";
import ModelViewer from "../components/ModelViewer";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { isMobileDevice } from "../utils/device";

let globalAppHasLoaded = false;

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { progress } = useProgress();
  const [isMobile] = useState(() => isMobileDevice());

  // Instantly unlock access and bypass all 3D compilation latches cleanly purely for lightweight mobile environments natively!
  if (isMobile && !globalAppHasLoaded) {
    globalAppHasLoaded = true;
  }

  const [modelMounted, setModelMounted] = useState(globalAppHasLoaded);
  const [deferredMount, setDeferredMount] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(globalAppHasLoaded);
  
  // Latch the loading screen eternally true once it succeeds, preventing UI flashes during track unloads
  if ((progress === 100 && modelMounted && !hasInitiallyLoaded) || globalAppHasLoaded) {
     if (!globalAppHasLoaded) {
       globalAppHasLoaded = true;
       setHasInitiallyLoaded(true);
     }
  }
  const isLoaded = hasInitiallyLoaded;
  
  const [drivingMode, setDrivingMode] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState("Welcome to Athul's World");
  const [isRestoring, setIsRestoring] = useState(!!sessionStorage.getItem('home-scroll-pos'));
  const lenis = useLenis();

  const mountedAsLocked = useRef(!globalAppHasLoaded);
  const [controlsLocked, setControlsLocked] = useState(!globalAppHasLoaded);
  const [showSlowNetwork, setShowSlowNetwork] = useState(false);

  useEffect(() => {
    // If loading takes >8 seconds, show network warning
    if (!isLoaded) {
      const t = setTimeout(() => setShowSlowNetwork(true), 8000);
      return () => clearTimeout(t);
    }
  }, [isLoaded]);

  useEffect(() => {
    // Critical Optimization: Defer the massive 67MB WebGL initialization until AFTER 
    // the routing transition and Lenis scroll restoration completely finish (400ms)!
    const t = setTimeout(() => setDeferredMount(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Strict Loading Lock: Completely disable scrolling and all physical mouse interactions 
  // globally while the initial 3D GLB parsing and shader compilation dominates the thread!
  useEffect(() => {
    if (!isLoaded) {
      setControlsLocked(true);
      if (lenis) lenis.stop(); 
    } else {
      const delay = mountedAsLocked.current ? 800 : 0;
      const t = setTimeout(() => {
         setControlsLocked(false);
         if (lenis) lenis.start();
      }, delay);
      return () => clearTimeout(t);
    }
  }, [isLoaded, lenis]);

  const lastScrollPos = useRef(0);

  useEffect(() => {
    if (!lenis) return;
    const handleScroll = (e: any) => {
      // Unconditionally freeze the memory the moment we leave Home!
      if (window.location.pathname === '/' || window.location.pathname === '') {
        lastScrollPos.current = e.targetScroll || e.scroll || window.scrollY;
      }
    };
    lenis.on('scroll', handleScroll);
    return () => lenis.off('scroll', handleScroll);
  }, [lenis]);

  useLayoutEffect(() => {
    // Exact Pixel Scroll Tracking: Constantly maintain exactly where we are without spamming memory!
    if (location.pathname !== '/') {
      return;
    }

    // Disable native browser scroll restoration from violently resetting the page to 0 behind our backs!
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Exact Pixel Scroll Restoration Logic
    const savedScrollRaw = sessionStorage.getItem('home-scroll-pos');
    if (savedScrollRaw) {
      setIsRestoring(true);
      
      if (lenis) lenis.stop();
      
      // Actively lock the scroll for 400ms to completely outlive the 300ms AnimatePresence exit
      // This mathematically overpowers the native iOS/Chrome layout reflows caused by body position changes!
      let attempts = 0;
      const lockInterval = setInterval(() => {
        const worksSection = document.getElementById('works');
        let savedScroll = 0;
        
        if (savedScrollRaw === 'works') {
          savedScroll = worksSection ? worksSection.offsetTop - 100 : 0;
        } else {
          savedScroll = parseInt(savedScrollRaw, 10);
        }
        
        window.scrollTo(0, savedScroll);
        if (lenis) {
           lenis.resize();
           lenis.scrollTo(savedScroll, { immediate: true, force: true });
        }
        
        attempts++;
        if (attempts >= 8) {
           clearInterval(lockInterval);
           if (lenis) lenis.start();
           sessionStorage.removeItem('home-scroll-pos');
           setIsRestoring(false);
        }
      }, 50);
    } else {
      setIsRestoring(false);
    }

    // Driving Event Subscriptions
    const handleDrive = () => {
      setDrivingMode(true);
      setTransitionText("Welcome to Athul's World");
      setTransitioning(true);
      setTimeout(() => setTransitioning(false), 3500); // Expanded cleanly allowing flawless tracking frames!
    };
    
    // Reverse Return Subscriptions
    const handleCancelDrive = () => {
      setTransitionText("Returning to Port...");
      setTransitioning(true);
      setTimeout(() => {
        setDrivingMode(false);
        setTransitioning(false);
      }, 1500); // Wait until securely under the pitch-black mask to dismantle the driving variables natively.
    };

    // Game Over Tracking
    const handleGameOver = () => {
      setTransitionText("GAME OVER");
      setTransitioning(true); // Absolute cut to black exactly instantly!
      
      setTimeout(() => {
        setTransitionText("Welcome to Athul's World"); // Reload the original game flow implicitly
      }, 700);
      
      setTimeout(() => {
        setTransitioning(false); // Drop the blackout to exactly reveal the physically reset race car natively!
      }, 1500);
    };

    document.addEventListener('showDashboard', handleDrive);
    document.addEventListener('triggerReturnTransition', handleCancelDrive);
    document.addEventListener('triggerGameOver', handleGameOver);
    
    return () => {
      document.removeEventListener('showDashboard', handleDrive);
      document.removeEventListener('triggerReturnTransition', handleCancelDrive);
      document.removeEventListener('triggerGameOver', handleGameOver);
    };
  }, [lenis, location.pathname]);

  return (
    <>
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="preloader"
            initial={{ y: 0 }}
            exit={{ y: "-100vh" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[2000] bg-[#0a0a0a] flex flex-col items-center justify-center"
          >
            <div className="flex overflow-hidden py-4">
              {"PORTFOLIO".split("").map((char, index) => (
                <span
                  key={index}
                  className="font-display font-bold text-5xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 animate-char-reveal"
                  style={{ 
                    letterSpacing: '0.15em',
                    animationDelay: `${index * 0.08}s`
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
            
            <div className="mt-8 flex flex-col items-center gap-4 w-48 md:w-64 opacity-0" style={{ animation: 'charReveal 0.8s ease forwards 0.8s' }}>
                <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-purple-500 rounded-full transition-all duration-300 ease-out"
                     style={{ width: `${progress}%` }}
                   />
                </div>
                <div className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase h-4 flex items-center justify-center">
                    {showSlowNetwork ? `Loading ${Math.round(progress)}% - Network is slow` : `Loading ${Math.round(progress)}%`}
                </div>
            </div>
            
            <div 
               className="absolute bottom-10 flex items-center gap-3 opacity-0"
               style={{ animation: 'charReveal 0.8s ease forwards 0.8s' }}
            >
              <div className="w-8 h-[1px] bg-purple-500/30" />
              <div className="text-purple-400/50 font-mono text-[10px] tracking-[0.3em] font-bold uppercase shadow-purple-500/20 whitespace-nowrap">
                 ATHUL VIKRAM
              </div>
              <div className="w-8 h-[1px] bg-purple-500/30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transitioning && (
           <motion.div 
             // Use a perfect 'hard cut' to instantaneous solid black to completely swallow the camera pan!
             initial={{ opacity: 1 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.8, ease: "easeInOut" }} // Extremely smooth 0.8s cinematic fade REVEAL
             className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center pointer-events-none"
           >
              <motion.h1 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-white text-3xl md:text-5xl font-display font-bold tracking-[0.2em] uppercase text-center px-4"
              >
                {transitionText}
              </motion.h1>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-[2px] bg-purple-500 mt-6"
              />
           </motion.div>
        )}
      </AnimatePresence>

      <div className={`min-h-screen transition-opacity duration-300 ${isRestoring ? 'opacity-0' : 'opacity-100'} ${controlsLocked ? 'pointer-events-none' : ''}`}>
        
        {/* Cancel Driving Button Overlay */}
        <button
          onClick={() => {
            document.dispatchEvent(new Event('triggerReturnTransition')); // Dispatch cinematic exit mask!
            setTimeout(() => document.dispatchEvent(new Event('cancelDriving')), 150); // Sever the physics link silently in the dark!
          }}
          className={`fixed top-6 left-6 z-[100] bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full font-bold tracking-wider uppercase transition-all duration-700 ${drivingMode ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}
        >
          &times; Exit Driving
        </button>



      {/* Hero Section Dynamic Layout */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        
        {/* Typography Content (Centered) */}
        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-10 pointer-events-none transition-opacity duration-1000 ${drivingMode ? 'opacity-0' : 'opacity-100'}`}>
            <motion.div
              initial={{ opacity: 0, y: -45 }}
              animate={{ opacity: 1, y: -15 }}
              transition={{ duration: 0.8 }}
              className="mb-8 flex flex-col items-center gap-3"
            >
              <div className="inline-block bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest backdrop-blur-sm pointer-events-auto text-center">
                <span className="pl-[0.1em] inline-block">VFX Artist</span>
              </div>
              <div className="text-zinc-400 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase pointer-events-auto text-center pl-[0.2em]">
                <span className="text-xs sm:text-sm">AI</span>-Integrated Workflows
              </div>
            </motion.div>

            {/* Perfect Center Alignment: Grid forces the gap to sit mathematically on the exact 50% axis */}
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-8xl lg:text-[9rem] font-display font-bold tracking-tighter mb-6 leading-none text-white drop-shadow-2xl grid grid-cols-2 gap-4 md:gap-8 w-full"
            >
              <div className="flex justify-end">
                <span>ATHUL</span>
              </div>
              <div className="flex justify-start">
                <span className="text-gradient drop-shadow-2xl">VIKRAM</span>
              </div>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-zinc-300 font-light max-w-xl leading-relaxed drop-shadow-lg mx-auto"
            >
              Crafting immersive digital worlds and cinematic visual effects using 
              <span className="text-white font-bold"> Blender</span> and industry-standard tools.
            </motion.p>
            
        </div>

        {/* 3D GLB Model Focus (Smoothly transitions from Side View to Full Screen) */}
        <div className={`absolute ${drivingMode ? 'inset-0 w-full h-full z-40 bg-[#0a0a0a] transition-all duration-[1500ms]' : 'right-0 w-full md:w-1/2 h-[50vh] md:h-screen z-0 transition-none'} ease-in-out overflow-hidden`}>
          {/* Subtly transitions the black background to the 3D scene */}
          <div className={`absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10 hidden md:block transition-opacity duration-1000 ${drivingMode ? 'opacity-0' : 'opacity-100'}`} />
          
          {deferredMount && !isMobile && <ModelViewer onLoaded={() => setModelMounted(true)} />}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-zinc-400 pointer-events-none hidden md:block transition-opacity duration-1000 ${drivingMode ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="w-px h-12 bg-gradient-to-b from-purple-400 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* Works Grid */}
      <section id="works" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-bold flex flex-wrap items-center gap-4">
              SELECTED WORKS
              <span className="text-purple-500 md:ml-4">-</span>
              <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-zinc-900 border border-zinc-800 font-display text-lg md:text-2xl text-zinc-400 group cursor-default hover:border-purple-500/50 hover:bg-purple-500/10 transition-colors duration-500">
                <Cpu className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
                <span className="opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  RENDER <span className="font-bold text-white group-hover:text-purple-300">i5 RTX 2050</span>
                </span>
              </div>
            </h2>
          </div>
          <div className="hidden md:block text-xs uppercase tracking-widest text-zinc-600 font-bold">
            Scroll to explore
          </div>
        </div>

        <div id="project-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.map((project, index) => (
            <motion.div
              key={project.id}
              className="h-full touch-pan-y"
              initial={sessionStorage.getItem('home-scroll-pos') ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div 
                onClick={() => {
                  if (isMobile) {
                    sessionStorage.setItem('home-scroll-pos', lastScrollPos.current.toString());
                  } else {
                    sessionStorage.setItem('home-scroll-pos', 'works');
                  }
                  navigate(`/project/${project.id}`);
                }}
                className="group cursor-pointer h-full flex flex-col glass rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/40 transition-colors duration-500 select-none touch-pan-y"
              >
                <div className="aspect-video overflow-hidden relative transform-gpu isolate">
                  <img 
                    src={project.thumbnail} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none will-change-transform translate-z-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none will-change-[opacity] translate-z-0">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform will-change-transform translate-z-0">
                      <Play className="fill-current" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-display font-bold group-hover:text-purple-400 transition-colors">
                      {project.title}
                    </h3>
                    <ExternalLink className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 mt-1 shrink-0 ml-3" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6 text-center">
        <p className="text-zinc-600 text-sm">
          &copy; 2026 Athul Vikram. Built with Passion & Blender.
        </p>
      </footer>
    </div>
    </>
  );
}
