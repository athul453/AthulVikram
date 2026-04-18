import { motion } from "motion/react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { PROJECTS } from "../data/works";
import { ArrowLeft, Monitor, Play, Layers, Video } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = PROJECTS.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [activeBreakdown, setActiveBreakdown] = useState(false);

  if (!project) return <div className="p-20 text-center">Project not found</div>;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);

  const handleMouseUp = (e: React.MouseEvent, index: number) => {
    if (!carouselRef.current) return;
    setIsDragging(false);
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = Math.abs(x - startX);
    if (walk < 5) {
      setActiveVideo(index); // Explicit click triggers autoplay!
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll fast multiplier
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const getAutoplayUrl = (url: string) => {
    if (!url) return "";
    return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  };

  const carouselSlots = [
    { url: project.videoUrl, title: "MAIN CLIP" },
    { url: "", title: "+ UPLOAD NEXT CLIP" },
    { url: "", title: "+ UPLOAD FINAL CLIP" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-12 pb-12 px-6 max-w-6xl mx-auto"
    >
      <div className="w-full">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Gallery
        </button>

        {/* Centered Massive Title from Mockup */}
        <h1 className="text-4xl md:text-6xl lg:text-[5rem] text-center font-display font-bold mb-10 tracking-tight">
          {project.title}
        </h1>

        <div className="space-y-12">
            {/* Final Render Carousel */}
            <section>
              <h2 className="text-3xl font-display font-medium mb-8 flex items-center gap-3">
                <Play className="text-purple-500 w-8 h-8" /> Final Render
              </h2>
              
              <div 
                ref={carouselRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={() => setIsDragging(false)}
                onMouseMove={handleMouseMove}
                className={`flex overflow-x-auto gap-8 pb-8 w-full hide-scrollbar items-center cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'snap-none scroll-auto' : 'snap-x snap-mandatory scroll-smooth'}`}
              >
                
                {carouselSlots.map((slot, idx) => (
                  <div 
                    key={idx}
                    onMouseUp={(e) => handleMouseUp(e, idx)}
                    className={`relative flex-none snap-center aspect-video rounded-2xl overflow-hidden shadow-2xl bg-[#0a0a0a] flex flex-col items-center justify-center group transition-all duration-700 ease-out select-none ${activeVideo === idx ? 'w-[min(90vw,120vh)]' : 'w-[min(75vw,60vh)] md:w-[450px]'}`}
                  >
                    {slot.url ? (
                      activeVideo === idx ? (
                        /* ACTIVE PLAYING STATE: Iframe is completely open to user clicks/controls! */
                        <>
                          {/* Top 65% Invisible Drag Handle safely avoiding fixed px conflicts with bottom controls! */}
                          <div className="absolute top-0 left-0 right-0 h-[65%] z-20 cursor-grab active:cursor-grabbing" />
                          <iframe 
                            src={getAutoplayUrl(slot.url)} 
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            title={`${project.title} Slot ${idx + 1}`}
                          />
                        </>
                      ) : (
                        /* INACTIVE DRAGGABLE STATE: Iframe is shielded by transparent overlay! */
                        <>
                          <div className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing" />
                          <iframe 
                            src={slot.url} 
                            className="w-full h-full pointer-events-none opacity-80"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            title={`${project.title} Slot ${idx + 1}`}
                          />
                          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/40 group-hover:bg-black/20 transition-all">
                             <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-600/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl group-hover:scale-110 transition-transform">
                                <Play className="text-white w-6 h-6 md:w-8 md:h-8 ml-2 fill-white" />
                             </div>
                          </div>
                        </>
                      )
                    ) : (
                      /* BLANK STORAGE PLACEHOLDER */
                      <>
                        <Video className="w-12 h-12 text-zinc-700/50 mb-4 group-hover:text-purple-400 transition-colors pointer-events-none" />
                        <div className="text-zinc-600 font-bold text-base md:text-lg tracking-widest uppercase group-hover:text-purple-400 transition-colors pointer-events-none">{slot.title}</div>
                      </>
                    )}
                  </div>
                ))}

              </div>
            </section>

            {/* Process Breakdown (Dynamic Sub-Video) */}
            <section className="pb-10">
              <h2 className="text-2xl md:text-3xl font-display font-medium mb-6 flex items-center gap-3">
                <Layers className="text-purple-500 w-6 h-6 md:w-8 md:h-8" /> Process Breakdown
              </h2>
              {/* Expandable active state mathematically scaled securely inside 100vh! */}
              <div 
                className={`relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-[#0a0a0a] transition-all duration-700 ease-out ${activeBreakdown ? 'w-[min(90vw,120vh)]' : 'w-full lg:max-w-[500px]'}`}
                onClick={() => setActiveBreakdown(true)}
              >
                {activeBreakdown ? (
                  <iframe 
                    src={getAutoplayUrl(project.breakdownUrl)} 
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={`${project.title} Breakdown`}
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 z-20 cursor-pointer" />
                    <iframe 
                      src={project.breakdownUrl} 
                      className="w-full h-full pointer-events-none opacity-80"
                      allowFullScreen
                      title={`${project.title} Breakdown`}
                    />
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/40 group-hover:bg-black/20 transition-all">
                       <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-600/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="text-white w-6 h-6 md:w-8 md:h-8 ml-2 fill-white" />
                       </div>
                    </div>
                  </>
                )}
              </div>
            </section>
        </div>
      </div>
    </motion.div>
  );
}
