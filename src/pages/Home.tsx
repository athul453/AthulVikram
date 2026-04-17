import { motion } from "motion/react";
import { PROJECTS } from "../data/works";
import { Link } from "react-router-dom";
import { ExternalLink, Play } from "lucide-react";
import ModelViewer from "../components/ModelViewer";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20">
        
        {/* Fullscreen 3D Background */}
        <div className="absolute inset-0 z-0">
          <ModelViewer />
          {/* Subtle gradient overlay to ensure text legibility */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest backdrop-blur-sm pointer-events-auto">
                VFX Artist
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl md:text-8xl lg:text-[10rem] font-display font-bold tracking-tighter mb-6 leading-[0.85] text-white drop-shadow-2xl"
            >
              ATHUL<br/>
              <span className="text-gradient drop-shadow-2xl">VIKRAM</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-zinc-300 font-light max-w-2xl leading-relaxed drop-shadow-lg"
            >
              Crafting immersive digital worlds and cinematic visual effects using 
              <span className="text-white font-medium"> Blender</span> and industry-standard tools.
            </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-zinc-400 pointer-events-none"
        >
          <div className="w-px h-12 bg-gradient-to-b from-purple-400 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* Works Grid */}
      <section id="works" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="text-4xl font-display font-bold mb-2">SELECTED WORKS</h2>
            <p className="text-zinc-500">A collection of my recent VFX and 3D projects.</p>
          </div>
          <div className="hidden md:block text-xs uppercase tracking-widest text-zinc-600 font-bold">
            Scroll to explore
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={`/project/${project.id}`}
                className="group block glass rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-500"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={project.thumbnail} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
                      <Play className="fill-current" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-display font-bold group-hover:text-purple-400 transition-colors">
                      {project.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-purple-400" />
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.softwares.slice(0, 2).map((s) => (
                      <span key={s} className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
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
  );
}
