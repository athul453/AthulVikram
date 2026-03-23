import { motion } from "motion/react";
import { PROJECTS } from "../data/works";
import { Link } from "react-router-dom";
import { ExternalLink, Play } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 relative inline-block"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-purple-500/30 p-2 mx-auto overflow-hidden">
              <img 
                src="https://picsum.photos/seed/athul/400/400" 
                alt="Athul Vikram" 
                className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">
              VFX Artist
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-6"
          >
            ATHUL <span className="text-gradient">VIKRAM</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed"
          >
            Crafting immersive digital worlds and cinematic visual effects using 
            <span className="text-white font-medium"> Blender</span> and industry-standard tools.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 animate-bounce text-zinc-500"
          >
            <div className="w-px h-12 bg-gradient-to-b from-purple-500 to-transparent mx-auto" />
          </motion.div>
        </div>
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
