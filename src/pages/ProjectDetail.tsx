import { motion } from "motion/react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { PROJECTS } from "../data/works";
import { ArrowLeft, Monitor, Play, Layers, Video } from "lucide-react";

// Helper for autoplay
const getAutoplayUrl = (url: string) => {
  if (!url) return "";
  return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
};

// Extracted Unified Carousel Component
function VideoCarouselRow({ slots, activeIndex, onSelect, projectTitle }: { slots: any[], activeIndex: number | null, onSelect: (idx: number) => void, projectTitle: string }) {
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
    if (!carouselRef.current) return;
    setIsDragging(true);
    scrollSpeed.current = 0;
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    scrollSpeed.current = 0;
  };

  const handleMouseUp = (e: React.MouseEvent, index: number) => {
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
        }
        scrollAnimationFrame.current = requestAnimationFrame(scrollStep);
      };
      scrollAnimationFrame.current = requestAnimationFrame(scrollStep);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    if (isDragging) {
      scrollSpeed.current = 0;
      e.preventDefault();
      const x = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      carouselRef.current.scrollLeft = scrollLeft - walk;
    } else {
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
      className={`flex flex-1 overflow-x-auto gap-8 pb-8 w-full hide-scrollbar items-center cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'snap-none scroll-auto' : 'snap-x snap-mandatory scroll-smooth'}`}
    >
      {slots.map((slot, idx) => (
        <motion.div 
          layout
          initial={false}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: "transform, width, height" }}
          key={idx}
          onMouseUp={(e) => handleMouseUp(e, idx)}
          className={`relative flex-none shrink-0 snap-center aspect-video rounded-2xl overflow-hidden shadow-2xl bg-[#0a0a0a] flex flex-col items-center justify-center group select-none ${activeIndex === idx ? 'h-full min-h-[50vh] max-h-[85vh]' : 'h-full min-h-[200px] md:min-h-[300px] max-h-[200px] md:max-h-[300px]'}`}
        >
          {slot.url ? (
            activeIndex === idx ? (
              <>
                <div className="absolute top-0 left-0 right-0 h-[65%] z-20 cursor-grab active:cursor-grabbing" />
                <iframe 
                  src={getAutoplayUrl(slot.url)} 
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={`${projectTitle} Slot ${idx + 1}`}
                />
              </>
            ) : (
              <>
                <div className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing" />
                <iframe 
                  src={slot.url} 
                  className="w-full h-full pointer-events-none opacity-80"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={`${projectTitle} Slot ${idx + 1}`}
                />
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
      ))}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = PROJECTS.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [activeBreakdown, setActiveBreakdown] = useState<number | null>(null);

  if (!project) return <div className="p-20 text-center">Project not found</div>;

  const carouselSlots = [
    { url: project.videoUrl, title: "MAIN CLIP" },
    { url: "", title: "+ UPLOAD NEXT CLIP" },
    { url: "", title: "+ UPLOAD FINAL CLIP" },
  ];

  const breakdownSlots = [
    { url: project.breakdownUrl, title: "BREAKDOWN" },
    { url: "", title: "+ UPLOAD BREAKDOWN 2" },
    { url: "", title: "+ UPLOAD BREAKDOWN 3" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full overflow-y-auto flex flex-col pt-6 pb-6 px-4 md:px-8 max-w-[1600px] mx-auto"
    >
      <div className="flex items-center justify-between flex-none mb-6">
        <button 
          onClick={() => navigate("/")}
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
            layout
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col transition-opacity duration-700 ${activeVideo !== null ? 'flex-[3]' : activeBreakdown !== null ? 'flex-[0.5] opacity-50' : 'flex-1'}`}
          >
            <h2 className="text-xl md:text-2xl font-display font-medium mb-3 flex items-center gap-3 flex-none pl-2">
              <Play className="text-purple-500 w-5 h-5 md:w-6 md:h-6" /> Final Render
            </h2>
            <VideoCarouselRow 
              slots={carouselSlots} 
              activeIndex={activeVideo} 
              onSelect={(idx) => { setActiveVideo(idx); setActiveBreakdown(null); }} 
              projectTitle={project.title} 
            />
          </motion.section>

          {/* Process Breakdown Carousel Section */}
          <motion.section 
            layout
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col transition-opacity duration-700 pb-4 ${activeBreakdown !== null ? 'flex-[3]' : activeVideo !== null ? 'flex-[0.5] opacity-50' : 'flex-1'}`}
          >
            <h2 className="text-xl md:text-2xl font-display font-medium mb-3 flex items-center gap-3 flex-none pl-2">
              <Layers className="text-purple-500 w-5 h-5 md:w-6 md:h-6" /> Process Breakdown
            </h2>
            <VideoCarouselRow 
              slots={breakdownSlots} 
              activeIndex={activeBreakdown} 
              onSelect={(idx) => { setActiveBreakdown(idx); setActiveVideo(null); }} 
              projectTitle={project.title} 
            />
          </motion.section>
      </div>
    </motion.div>
  );
}
