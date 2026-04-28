import { motion } from "motion/react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { PROJECTS } from "../data/works";
import { ArrowLeft, Monitor, Play, Layers, Video, Maximize2, Loader2, Settings } from "lucide-react";
import { isMobileDevice } from "../utils/device";

const getAutoplayUrl = (url: string) => {
  if (!url) return "";
  let base = url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  base += "&playsinline=1&fs=0&mute=1"; // Restore controls natively so users can always interact with blocked autoplays
  return base;
};

const getThumbnailUrl = (url: string, fallback: string) => {
  if (!url) return fallback;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` : fallback;
};

// Enhanced Local Video Player with Loading State and Fullscreen
function LocalVideoPlayer({ url, isMobile, isBlenderVFX }: { url: string; isMobile: boolean; isBlenderVFX?: boolean }) {
  const [isBuffering, setIsBuffering] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Manual load removed; video is now conditionally mounted so autoPlay naturally triggers buffering

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      }
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center bg-black group overflow-hidden ${isBlenderVFX ? 'aspect-[9/16]' : ''}`}>
      {isBuffering && (
        <div className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 ${isBlenderVFX ? 'bg-black/80 backdrop-blur-md' : 'bg-black/50 backdrop-blur-sm'}`}>
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        src={url}
        autoPlay={true}
        controls={true}
        playsInline
        loop
        preload="metadata"
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlayThrough={() => setIsBuffering(false)}
        className={isBlenderVFX ? "w-full h-full object-cover" : "h-full w-auto max-w-full object-contain"}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      />
      {!isMobile && (
        <>
          <button 
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-20 p-2 bg-black/60 hover:bg-black/90 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/10 shadow-lg"
            title="Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          
          <div className="absolute top-4 right-16 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
              className="p-2 bg-black/60 hover:bg-black/90 rounded-xl text-white backdrop-blur-md border border-white/10 shadow-lg"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {showSettings && (
              <div className="absolute top-12 right-0 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 w-48 text-sm overflow-hidden z-30">
                <div className="px-4 py-2 text-white/50 text-xs font-semibold uppercase tracking-wider border-b border-white/10 mb-1">Quality</div>
                <button className="w-full text-left px-4 py-2 hover:bg-white/10 text-white flex items-center justify-between">
                  <span>1080p (Source)</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                </button>
                <button className="w-full text-left px-4 py-2 text-white/40 cursor-not-allowed" title="Available via YouTube embed only">
                  720p
                </button>
                <button className="w-full text-left px-4 py-2 text-white/40 cursor-not-allowed" title="Available via YouTube embed only">
                  480p
                </button>
                <button className="w-full text-left px-4 py-2 text-white/40 cursor-not-allowed" title="Available via YouTube embed only">
                  Auto
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function LazyVideoThumbnail({ url, isBlenderVFX, fallbackThumbnail }: { url: string; isBlenderVFX?: boolean; fallbackThumbnail?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Load slightly before it enters the viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`w-full h-full flex items-center justify-center ${isBlenderVFX ? 'aspect-[9/16]' : ''}`}>
      {isVisible ? (
        <video 
          src={`${url}#t=0.001`}
          className="w-full h-full object-cover pointer-events-none opacity-80"
          preload="metadata"
          muted
          playsInline
        />
      ) : (
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      )}
    </div>
  );
}

// Extracted Unified Carousel Component
function VideoCarouselRow({ slots, activeIndex, onSelect, projectTitle, fallbackThumbnail, isBlenderVFX }: { slots: any[], activeIndex: number | null, onSelect: (idx: number) => void, projectTitle: string, fallbackThumbnail: string, isBlenderVFX?: boolean }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const enterFullscreen = (el: HTMLElement) => {
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen();
    }
  };

  useEffect(() => {
    // Rely exclusively on Lenis data-lenis-prevent attribute for horizontal scroll areas
    // rather than manual wheel interception, which can cause severe freezing on certain sections.
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobileDevice()) return;
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    if (isMobileDevice()) return;
    setIsDragging(false);
  };

  const handleMouseUp = (e: React.MouseEvent, index: number) => {
    if (isMobileDevice()) return;
    if (!carouselRef.current) return;
    setIsDragging(false);
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = Math.abs(x - startX);
    if (walk < 5) {
      setTimeout(() => {
        if (carouselRef.current && carouselRef.current.children[index]) {
          carouselRef.current.children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 50);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobileDevice()) return;
    if (!carouselRef.current) return;
    if (isDragging) {
      e.preventDefault();
      const x = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full relative">
      <div 
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(false)}
        data-lenis-prevent="true"
        className={`flex flex-1 min-h-0 overflow-x-auto overscroll-x-contain touch-pan-x md:gap-6 gap-4 pb-2 w-full hide-scrollbar items-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab snap-x snap-mandatory'} px-4`}
      >
      {slots.map((slot, idx) => {
        const isActive = activeIndex === idx;
        const unifiedClasses = `h-[85%] md:h-[90%] transition-opacity duration-300 ease-out border ${isActive ? 'border-purple-500/50 shadow-[0_0_30px_rgba(192,38,211,0.3)] opacity-100' : 'border-white/5 opacity-60 brightness-75'}`;
        const isYouTube = slot.url && (slot.url.includes("youtube.com") || slot.url.includes("youtu.be"));

        return (
        <motion.div 
          initial={false}
          transition={{ duration: 0.3, ease: "easeOut" }}
          key={idx}
          onMouseUp={(e) => handleMouseUp(e, idx)}
          onClick={(e) => {
            if (!isActive) {
               if (!isBlenderVFX) {
                 onSelect(idx);
                 if (!isMobileDevice()) {
                   enterFullscreen(e.currentTarget as HTMLElement);
                 }
               }
            }
          }}
          className={`relative flex-none shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-[#0a0a0a] flex flex-col items-center justify-center group select-none snap-center ${isBlenderVFX ? 'aspect-[9/16] w-auto' : (isYouTube || !slot.url ? 'aspect-video w-auto' : 'w-auto')} ${unifiedClasses}`}
        >
          {slot.url ? (
            activeIndex === idx ? (
              <>
                <button 
                   onClick={(e) => {
                      e.stopPropagation();
                      onSelect(-1);
                   }}
                   className="absolute top-4 left-4 z-[60] px-3 py-1.5 md:px-4 md:py-2 bg-black/80 hover:bg-black text-white text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg border border-white/20 backdrop-blur-md shadow-2xl transition-all"
                >
                  Close Video
                </button>
                {slot.url.includes("youtube.com") || slot.url.includes("youtu.be") ? (
                  <iframe 
                    key={`active-iframe-${idx}`}
                    src={getAutoplayUrl(slot.url)} 
                    className={`w-full h-full`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen={true}
                    title={`${projectTitle} Slot ${idx + 1}`}
                  />
                ) : (
                  <LocalVideoPlayer url={slot.url} isMobile={true} isBlenderVFX={isBlenderVFX} />
                )}
              </>
            ) : (
              <>
                <div className={`absolute inset-0 z-20 ${isBlenderVFX ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`} />
                {slot.url.includes("youtube.com") || slot.url.includes("youtu.be") ? (
                  <img 
                    src={getThumbnailUrl(slot.url, fallbackThumbnail)} 
                    alt={slot.title}
                    className="w-full h-full object-cover pointer-events-none opacity-80"
                  />
                ) : (
                  <LazyVideoThumbnail url={slot.url} isBlenderVFX={isBlenderVFX} fallbackThumbnail={fallbackThumbnail} />
                )}
                <div className={`absolute inset-0 z-30 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all ${isBlenderVFX ? 'pointer-events-none' : 'pointer-events-none'}`}>
                   <div 
                      style={isBlenderVFX ? { cursor: 'pointer' } : undefined}
                      className={`w-16 h-16 md:w-20 md:h-20 bg-purple-600/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl group-hover:scale-110 transition-transform ${isBlenderVFX ? 'pointer-events-auto' : ''}`}
                      onClick={(e) => {
                         if (isBlenderVFX) {
                            e.stopPropagation();
                            onSelect(idx);
                            if (!isMobileDevice()) {
                              const target = e.currentTarget.closest('.group');
                              if (target) enterFullscreen(target as HTMLElement);
                            }
                         }
                      }}
                   >
                      <Play className="text-white w-6 h-6 md:w-8 md:h-8 ml-2 fill-white pointer-events-none" />
                   </div>
                </div>
              </>
            )
          ) : (
            <>
              <Video className="w-12 h-12 text-zinc-700/50 mb-4 group-hover:text-purple-400 transition-colors pointer-events-none" />
              <div className="text-zinc-600 font-bold text-base md:text-lg tracking-widest uppercase group-hover:text-purple-400 transition-colors pointer-events-none">{slot.title}</div>
            </>
          )}
        </motion.div>
        );
      })}
      </div>
      <div className="flex justify-end pr-4 text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 mb-2 pointer-events-none flex-none">
        Swipe Next &rarr;
      </div>
    </div>
  );
}

import { useLenis } from "lenis/react";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = PROJECTS.find((p) => p.id === id);
  const lenis = useLenis();

  useEffect(() => {
    // Rely exclusively on native browser scroll restoration to prevent Lenis physics engine corruption (NaN freeze) when users scroll immediately during route transitions.
    window.scrollTo(0, 0);
    
    // Hard-lock body scrolling for mobile users to prevent any slight vertical scroll leakage
    if (isMobileDevice()) {
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      return () => {
        if (lenis) lenis.start();
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }
  }, [navigate]);

  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [activeBreakdown, setActiveBreakdown] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const isAnyVideoOpen = activeVideo !== null || activeBreakdown !== null;
    if (isAnyVideoOpen && !videoOpen) {
      window.history.pushState({ videoOpen: true }, '');
      setVideoOpen(true);
    } else if (!isAnyVideoOpen && videoOpen) {
      setVideoOpen(false);
    }
  }, [activeVideo, activeBreakdown, videoOpen]);

  useEffect(() => {
    const handlePopState = () => {
      if (videoOpen) {
        setActiveVideo(null);
        setActiveBreakdown(null);
        setVideoOpen(false);
        if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
        else if ((document as any).webkitFullscreenElement) (document as any).webkitExitFullscreen();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [videoOpen]);

  // Anti-Screen-Recording & Web Capture Protection
  useEffect(() => {
    // 1. Block web-based screen recording (getDisplayMedia API)
    const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia;
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
        value: () => Promise.reject(new Error('Screen recording is disabled for copyright protection.')),
        configurable: true
      });
    }

    // 2. Block common screen recording keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+5 (Mac Screen Record) or Win+Alt+R (Windows Game Bar Record)
      if (
        (e.metaKey && e.shiftKey && e.key === '5') || 
        (e.metaKey && e.altKey && (e.key === 'r' || e.key === 'R'))
      ) {
        e.preventDefault();
        alert('Screen recording is disabled for copyright protection. Screenshots are allowed.');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (navigator.mediaDevices && originalGetDisplayMedia) {
        Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
          value: originalGetDisplayMedia,
          configurable: true
        });
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const closeVideo = () => {
    setActiveVideo(null);
    setActiveBreakdown(null);
    if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
    else if ((document as any).webkitFullscreenElement) (document as any).webkitExitFullscreen();
    if (videoOpen) {
       window.history.back();
    }
  };

  if (!project) {
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }

  const isBlenderVFX = project.id === "cyber-city" || project.id === "space-battle";

  const carouselSlots = project.finalOutUrls && project.finalOutUrls.length > 0
    ? project.finalOutUrls.map((url, index) => ({ url, title: `CLIP 0${index + 1}` }))
    : [
        { url: project.videoUrl, title: "MAIN CLIP" },
        { url: "", title: "+ UPLOAD NEXT CLIP" },
        { url: "", title: "+ UPLOAD FINAL CLIP" },
      ];

  const breakdownSlots = project.breakdownUrls && project.breakdownUrls.length > 0
    ? project.breakdownUrls.map((url, index) => ({ url, title: `BREAKDOWN 0${index + 1}` }))
    : [
        { url: project.breakdownUrl, title: "BREAKDOWN" },
        { url: "", title: "+ UPLOAD BREAKDOWN 2" },
        { url: "", title: "+ UPLOAD BREAKDOWN 3" },
      ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`w-full flex flex-col pt-[70px] md:pt-[100px] pb-2 md:pb-4 px-2 md:px-8 max-w-[1600px] mx-auto ${isMobileDevice() ? 'fixed inset-0 z-50 bg-[#050505]' : 'h-[100dvh] overflow-hidden'} ${isBlenderVFX ? 'select-none' : ''}`}
    >
      <div className="flex items-center justify-between flex-none mb-3 md:mb-6 px-2">
        <button 
          onClick={() => {
            if (isMobileDevice()) {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/");
              }
            } else {
              sessionStorage.setItem('home-scroll-pos', 'works');
              navigate("/");
            }
          }}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group flex-none"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <motion.h1 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="text-xl md:text-4xl lg:text-5xl text-center font-display font-bold tracking-tight px-2 truncate"
        >
          {project.title}
        </motion.h1>
        <div className="w-20 hidden sm:block flex-none" />
      </div>

      <div className="flex-1 flex flex-col gap-3 md:gap-6 min-h-0 px-2 md:px-0">
          {/* Final Render Carousel Section */}
          <motion.section 
            className={`flex flex-col transition-opacity duration-700 flex-1 min-h-0`}
          >
            <h2 className="text-base md:text-xl font-display font-medium mb-1 md:mb-2 flex items-center gap-2 flex-none pl-1">
              <Play className="text-purple-500 w-4 h-4 md:w-6 md:h-6" /> Final Render
            </h2>
            <VideoCarouselRow 
              slots={carouselSlots} 
              activeIndex={activeVideo} 
              onSelect={(idx) => { 
                 if (idx === -1) closeVideo();
                 else { setActiveVideo(idx); setActiveBreakdown(null); }
              }} 
              projectTitle={project.title} 
              fallbackThumbnail={project.thumbnail}
              isBlenderVFX={isBlenderVFX}
            />
          </motion.section>

          {/* Process Breakdown Carousel Section */}
          {project.id !== "space-battle" && (
            <motion.section 
              className={`flex flex-col transition-opacity duration-700 flex-1 min-h-0`}
            >
              <h2 className="text-base md:text-xl font-display font-medium mb-1 md:mb-2 flex items-center gap-2 flex-none pl-1">
                <Layers className="text-purple-500 w-4 h-4 md:w-6 md:h-6" /> Process Breakdown
              </h2>
              <VideoCarouselRow 
                slots={breakdownSlots} 
                activeIndex={activeBreakdown} 
                onSelect={(idx) => { 
                   if (idx === -1) closeVideo();
                   else { setActiveBreakdown(idx); setActiveVideo(null); }
                }} 
                projectTitle={project.title} 
                fallbackThumbnail={project.thumbnail}
                isBlenderVFX={isBlenderVFX}
              />
            </motion.section>
          )}
      </div>
    </motion.div>
  );
}
