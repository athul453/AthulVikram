import { motion } from "motion/react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PROJECTS } from "../data/works";
import { ArrowLeft, Monitor, Play, Layers, Video } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = PROJECTS.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!project) return <div className="p-20 text-center">Project not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-20 px-6 max-w-6xl mx-auto"
    >
      <div className="w-full">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-12 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Gallery
        </button>

        {/* Centered Massive Title from Mockup */}
        <h1 className="text-5xl md:text-7xl lg:text-[6rem] text-center font-display font-bold mb-20 tracking-tight">
          {project.title}
        </h1>

        <div className="space-y-24">
            {/* Final Render Carousel */}
            <section>
              <h2 className="text-3xl font-display font-medium mb-8 flex items-center gap-3">
                <Play className="text-purple-500 w-8 h-8" /> Final Render
              </h2>
              
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-8 w-full hide-scrollbar items-center">
                
                {/* Primary Main Video Slot */}
                <div className="min-w-[90%] md:min-w-[85%] lg:min-w-[1000px] flex-none snap-center aspect-video glass rounded-2xl overflow-hidden shadow-2xl bg-[#050505]/80 border border-white/5">
                    <iframe 
                      src={project.videoUrl} 
                      className="w-full h-full"
                      allowFullScreen
                      title={project.title}
                    />
                </div>

                {/* Blank Secondary Storage Slot */}
                <div className="min-w-[90%] md:min-w-[85%] lg:min-w-[1000px] flex-none snap-center aspect-video glass rounded-2xl overflow-hidden shadow-2xl bg-[#050505]/80 border border-white/5 flex flex-col items-center justify-center group hover:border-purple-500/30 transition-all cursor-pointer">
                   <Video className="w-12 h-12 text-zinc-700/50 mb-4 group-hover:text-purple-400 transition-colors" />
                   <div className="text-zinc-600 font-bold text-lg tracking-widest uppercase group-hover:text-purple-400 transition-colors">+ UPLOAD NEXT CLIP</div>
                </div>

                 {/* Blank Tertiary Storage Slot */}
                <div className="min-w-[90%] md:min-w-[85%] lg:min-w-[1000px] flex-none snap-center aspect-video glass rounded-2xl overflow-hidden shadow-2xl bg-[#050505]/80 border border-white/5 flex flex-col items-center justify-center group hover:border-purple-500/30 transition-all cursor-pointer">
                   <Video className="w-12 h-12 text-zinc-700/50 mb-4 group-hover:text-purple-400 transition-colors" />
                   <div className="text-zinc-600 font-bold text-lg tracking-widest uppercase group-hover:text-purple-400 transition-colors">+ UPLOAD FINAL CLIP</div>
                </div>

              </div>
            </section>

            {/* Process Breakdown (Standard Sub-Video) */}
            <section className="pb-10">
              <h2 className="text-3xl font-display font-medium mb-8 flex items-center gap-3">
                <Layers className="text-purple-500 w-8 h-8" /> Process Breakdown
              </h2>
              {/* Force identical width size for aesthetic symmetry */}
              <div className="aspect-video glass rounded-2xl overflow-hidden shadow-2xl w-full lg:max-w-[1000px]">
                <iframe 
                  src={project.breakdownUrl} 
                  className="w-full h-full"
                  allowFullScreen
                  title={`${project.title} Breakdown`}
                />
              </div>
            </section>
        </div>
      </div>
    </motion.div>
  );
}
