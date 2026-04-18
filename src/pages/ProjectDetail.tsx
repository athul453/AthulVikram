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
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-12 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Gallery
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Main Video */}
          <section>
            <h2 className="text-2xl font-display font-medium mb-6 flex items-center gap-3">
              <Play className="text-purple-500" /> Final Render
            </h2>
            <div className="aspect-video glass rounded-2xl overflow-hidden shadow-2xl">
              <iframe 
                src={project.videoUrl} 
                className="w-full h-full"
                allowFullScreen
                title={project.title}
              />
            </div>
          </section>

          {/* Breakdown Video */}
          <section>
            <h2 className="text-2xl font-display font-medium mb-6 flex items-center gap-3">
              <Layers className="text-purple-500" /> Process Breakdown
            </h2>
            <div className="aspect-video glass rounded-2xl overflow-hidden shadow-2xl">
              <iframe 
                src={project.breakdownUrl} 
                className="w-full h-full"
                allowFullScreen
                title={`${project.title} Breakdown`}
              />
            </div>
          </section>

          {/* Final Round Up - 3 Video Horizonatal Placholders */}
          <section>
            <h2 className="text-2xl font-display font-medium mb-6 flex items-center gap-3">
              <Video className="text-purple-500" /> Final Round Up
            </h2>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 w-full hide-scrollbar">
              {/* Video Box 1 */}
              <div className="min-w-full flex-none snap-center aspect-video glass rounded-2xl overflow-hidden shadow-2xl bg-[#050505]/80 border border-white/5 flex flex-col items-center justify-center group hover:border-purple-500/30 transition-all cursor-pointer">
                {project.roundupUrl ? (
                  <iframe 
                    src={project.roundupUrl} 
                    className="w-full h-full"
                    allowFullScreen
                    title={`${project.title} Clip 1`}
                  />
                ) : (
                  <>
                    <Video className="w-8 h-8 text-zinc-700/50 mb-3 group-hover:text-purple-400 transition-colors" />
                    <div className="text-zinc-600 font-bold text-sm tracking-widest uppercase group-hover:text-purple-400 transition-colors">+ UPLOAD CLIP 1</div>
                  </>
                )}
              </div>

              {/* Video Box 2 */}
              <div className="min-w-full flex-none snap-center aspect-video glass rounded-2xl overflow-hidden shadow-2xl bg-[#050505]/80 border border-white/5 flex flex-col items-center justify-center group hover:border-purple-500/30 transition-all cursor-pointer">
                 <Video className="w-8 h-8 text-zinc-700/50 mb-3 group-hover:text-purple-400 transition-colors" />
                 <div className="text-zinc-600 font-bold text-sm tracking-widest uppercase group-hover:text-purple-400 transition-colors">+ UPLOAD CLIP 2</div>
              </div>

              {/* Video Box 3 */}
              <div className="min-w-full flex-none snap-center aspect-video glass rounded-2xl overflow-hidden shadow-2xl bg-[#050505]/80 border border-white/5 flex flex-col items-center justify-center group hover:border-purple-500/30 transition-all cursor-pointer">
                 <Video className="w-8 h-8 text-zinc-700/50 mb-3 group-hover:text-purple-400 transition-colors" />
                 <div className="text-zinc-600 font-bold text-sm tracking-widest uppercase group-hover:text-purple-400 transition-colors">+ UPLOAD CLIP 3</div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-10">
          <div>
            <h1 className="text-4xl font-display font-bold mb-4">{project.title}</h1>
            <p className="text-zinc-400 leading-relaxed text-lg">
              {project.explanation}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Softwares Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.softwares.map((s) => (
                <span key={s} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 glass rounded-2xl border-purple-500/10">
            <h3 className="text-lg font-display font-medium mb-2">Project Insight</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              This work represents a milestone in my VFX journey, pushing the boundaries of what's possible within Blender's EEVEE and Cycles engines.
            </p>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
