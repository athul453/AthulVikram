import { motion } from "motion/react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { PROJECTS } from "../data/works";
import { ArrowLeft, Monitor, Play, Layers, Video, Maximize2, Loader2, Settings } from "lucide-react";
import { isMobileDevice } from "../utils/device";

const getAutoplayUrl = (url: string) => {
  if (!url) return "";
  let base = url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  if (isMobileDevice()) {
    base += "&playsinline=1&fs=0&mute=1"; // Restore controls natively so users can always interact with blocked autoplays
  }
  return base;
};

const getThumbnailUrl = (url: string, fallback: string) => {
  if (!url) return fallback;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` : fallback;
};

// Enhanced Local Video Player with Loading State and Fullscreen
function LocalVideoPlayer({ url, isMobile }: { url: string; isMobile: boolean }) {
  const [isBuffering, setIsBuffering] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black group overflow-hidden">
      {isBuffering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        src={url}
        autoPlay
        controls={true}
        playsInline
        loop
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlayThrough={() => setIsBuffering(false)}
        className="h-full w-auto max-w-full object-contain"
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

function LazyVideoThumbnail({ url }: { url: string }) {
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
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      {isVisible ? (
        <video 
          src={`${url}#t=0.001`}
          className="h-full w-auto max-w-[90vw] object-contain pointer-events-none opacity-80"
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
function VideoCarouselRow({ slots, activeIndex, onSelect, projectTitle, fallbackThumbnail }: { slots: any[], activeIndex: number | null, onSelect: (idx: number) => void, projectTitle: string, fallbackThumbnail: string }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scrollSpeed = useRef(0);
  const scrollAnimationFrame = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scrollAnimationFrame.current) {
        cancelAnimationFrame(scrollAnimationFrame.current);
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobileDevice()) return;
    if (!carouselRef.current) return;
    setIsDragging(true);
    scrollSpeed.current = 0;
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    if (isMobileDevice()) return;
    setIsDragging(false);
    scrollSpeed.current = 0;
  };

  const handleMouseUp = (e: React.MouseEvent, index: number) => {
    if (isMobileDevice()) return;
    if (!carouselRef.current) return;
    setIsDragging(false);
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = Math.abs(x - startX);
    if (walk < 5) {
      onSelect(index);
      setTimeout(() => {
        if (carouselRef.current && carouselRef.current.children[index]) {
          carouselRef.current.children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 50);
    }
  };

  const startAutoScroll = () => {
    if (!scrollAnimationFrame.current) {
      const scrollStep = () => {
        if (carouselRef.current && scrollSpeed.current !== 0) {
          carouselRef.current.scrollLeft += scrollSpeed.current;
          scrollAnimationFrame.current = requestAnimationFrame(scrollStep);
        } else {
          scrollAnimationFrame.current = null;
        }
      };
      scrollAnimationFrame.current = requestAnimationFrame(scrollStep);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobileDevice()) return;
    if (!carouselRef.current) return;
    if (isDragging) {
      scrollSpeed.current = 0;
      e.preventDefault();
      const x = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      carouselRef.current.scrollLeft = scrollLeft - walk;
    } else {
      if (isMobileDevice()) {
        scrollSpeed.current = 0;
        return;
      }
      
      const rect = carouselRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const edgeThreshold = 180;
      const maxSpeed = 15;
      
      if (mouseX < edgeThreshold) {
        scrollSpeed.current = -maxSpeed * (1 - Math.max(0, mouseX / edgeThreshold));
        startAutoScroll();
      } else if (mouseX > rect.width - edgeThreshold) {
        scrollSpeed.current = maxSpeed * (Math.max(0, (mouseX - (rect.width - edgeThreshold)) / edgeThreshold));
        startAutoScroll();
      } else {
        scrollSpeed.current = 0;
      }
    }
  };

  return (
    <div 
      ref={carouselRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={() => { scrollSpeed.current = 0; setIsDragging(false); }}
      onTouchEnd={() => { scrollSpeed.current = 0; }}
      onWheel={(e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.stopPropagation();
        }
      }}
      data-lenis-prevent="true"
      className={`flex flex-1 overflow-x-auto md:gap-8 gap-4 pb-8 w-full hide-scrollbar items-center cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'scroll-auto' : 'md:scroll-smooth scroll-auto'} ${isMobileDevice() ? 'px-4' : ''}`}
    >
      {slots.map((slot, idx) => {
        const isMobile = isMobileDevice();
        const isActive = activeIndex === idx;
        const mobileClasses = `w-[85vw] h-[250px] transition-opacity duration-300 ease-out border ${isActive ? 'border-purple-500/50 shadow-[0_0_30px_rgba(192,38,211,0.3)] opacity-100' : 'border-white/5 opacity-60 brightness-75'}`;
        const desktopClasses = `h-[200px] md:h-[300px]`;
        const isYouTube = slot.url && (slot.url.includes("youtube.com") || slot.url.includes("youtu.be"));

        return (
        <motion.div 
          initial={false}
          whileHover={!isMobile ? { scale: 1.02 } : undefined}
          transition={{ duration: 0.3, ease: "easeOut" }}
          key={idx}
          onMouseUp={(e) => handleMouseUp(e, idx)}
          onClick={() => {
            if (isMobile && !isActive) {
               onSelect(idx);
            }
          }}
          className={`relative flex-none shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-[#0a0a0a] flex flex-col items-center justify-center group select-none ${isYouTube || !slot.url ? 'aspect-video' : 'w-auto'} ${isMobile ? mobileClasses : desktopClasses}`}
        >
          {slot.url ? (
            activeIndex === idx ? (
              <>
                {slot.url.includes("youtube.com") || slot.url.includes("youtu.be") ? (
                  <iframe 
                    key={`active-iframe-${idx}`}
                    src={getAutoplayUrl(slot.url)} 
                    className={`w-full h-full`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen={!isMobile}
                    title={`${projectTitle} Slot ${idx + 1}`}
                  />
                ) : (
                  <LocalVideoPlayer url={slot.url} isMobile={isMobile} />
                )}
              </>
            ) : (
              <>
                <div className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing" />
                {slot.url.includes("youtube.com") || slot.url.includes("youtu.be") ? (
                  <img 
                    src={getThumbnailUrl(slot.url, fallbackThumbnail)} 
                    alt={slot.title}
                    className="w-full h-full object-cover pointer-events-none opacity-80"
                  />
                ) : (
                  <LazyVideoThumbnail url={slot.url} />
                )}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/40 group-hover:bg-black/20 transition-all">
                   <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-600/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="text-white w-6 h-6 md:w-8 md:h-8 ml-2 fill-white" />
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
  );
}

import { useLenis } from "lenis/react";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = PROJECTS.find((p) => p.id === id);
  const lenis = useLenis();

  useEffect(() => {
    // Assert structural dominance over the physics engine upon route entry to ruthlessly snap directly to the absolute top of the layout!
    if (lenis) {
       lenis.scrollTo(0, { immediate: true, force: true });
    }
    window.scrollTo(0, 0);
  }, [navigate, lenis]);

  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [activeBreakdown, setActiveBreakdown] = useState<number | null>(null);

  if (!project) return <div className="p-20 text-center">Project not found</div>;

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
      className={`w-full flex flex-col pt-[100px] md:pt-[120px] pb-6 px-4 md:px-8 max-w-[1600px] mx-auto ${isMobileDevice() ? 'h-[100dvh] overflow-hidden fixed inset-0' : 'min-h-screen'}`}
    >
      <div className="flex items-center justify-between flex-none mb-6">
        <button 
          onClick={() => {
            sessionStorage.setItem('home-scroll-pos', 'works');
            navigate("/");
          }}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group flex-none"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-2xl md:text-4xl lg:text-5xl text-center font-display font-bold tracking-tight px-4 truncate">
          {project.title}
        </h1>
        <div className="w-20 hidden sm:block flex-none" />
      </div>

      <div className="flex-1 flex flex-col gap-6">
          {/* Final Render Carousel Section */}
          <motion.section 
            className={`flex flex-col transition-opacity duration-700 ${isMobileDevice() ? 'flex-1 mb-8' : 'flex-1'}`}
          >
            <h2 className="text-xl md:text-2xl font-display font-medium mb-3 flex items-center gap-3 flex-none pl-2">
              <Play className="text-purple-500 w-5 h-5 md:w-6 md:h-6" /> Final Render
            </h2>
            <VideoCarouselRow 
              slots={carouselSlots} 
              activeIndex={activeVideo} 
              onSelect={(idx) => { setActiveVideo(idx); setActiveBreakdown(null); }} 
              projectTitle={project.title} 
              fallbackThumbnail={project.thumbnail}
            />
          </motion.section>

          {/* Process Breakdown Carousel Section */}
          <motion.section 
            className={`flex flex-col transition-opacity duration-700 pb-4 ${isMobileDevice() ? 'flex-1' : 'flex-1'}`}
          >
            <h2 className="text-xl md:text-2xl font-display font-medium mb-3 flex items-center gap-3 flex-none pl-2">
              <Layers className="text-purple-500 w-5 h-5 md:w-6 md:h-6" /> Process Breakdown
            </h2>
            <VideoCarouselRow 
              slots={breakdownSlots} 
              activeIndex={activeBreakdown} 
              onSelect={(idx) => { setActiveBreakdown(idx); setActiveVideo(null); }} 
              projectTitle={project.title} 
              fallbackThumbnail={project.thumbnail}
            />
          </motion.section>
      </div>
    </motion.div>
  );
}
