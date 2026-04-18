import { motion } from "motion/react";
import { PROJECTS } from "../data/works";
import { Link } from "react-router-dom";
import { ExternalLink, Play } from "lucide-react";
import { useProgress } from "@react-three/drei";
import ModelViewer from "../components/ModelViewer";
import { useState, useEffect } from "react";

export default function Home() {
  const { progress } = useProgress();
  const [modelMounted, setModelMounted] = useState(false);
  const isLoaded = progress === 100 && modelMounted;
  
  const [drivingMode, setDrivingMode] = useState(false);

  useEffect(() => {
    const handleDrive = () => setDrivingMode(true);
    document.addEventListener('showDashboard', handleDrive);
    return () => document.removeEventListener('showDashboard', handleDrive);
  }, []);

  return (
    <>
      <div className="min-h-screen">
        
        {/* Cancel Driving Button Overlay */}
        <button
          onClick={() => {
            setDrivingMode(false);
            document.dispatchEvent(new Event('cancelDriving'));
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
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-block bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest backdrop-blur-sm pointer-events-auto">
                VFX Artist
              </div>
            </motion.div>

            {/* Changed to one continuous horizontal flow for the name */}
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-8xl lg:text-[9rem] font-display font-bold tracking-tighter mb-6 leading-none text-white drop-shadow-2xl flex flex-row gap-4 md:gap-8 justify-center"
            >
              <span>ATHUL</span>
              <span className="text-gradient drop-shadow-2xl">VIKRAM</span>
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
        <div className={`absolute ${drivingMode ? 'inset-0 w-full h-full z-40 bg-[#0a0a0a]' : 'right-0 w-full md:w-1/2 h-[50vh] md:h-screen z-0'} transition-all duration-700 ease-in-out overflow-hidden`}>
          {/* Subtle fade to smoothly transition the black background to the 3D scene (Hidden when full screen) */}
          <div className={`absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10 hidden md:block transition-opacity duration-1000 ${drivingMode ? 'opacity-0' : 'opacity-100'}`} />
          
          {/* Dedicated sleek loading indicator for the 3D Model so it doesn't look broken while parsing 50MB! */}
          <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-[1500ms] ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6" />
            <div className="text-purple-400 font-bold text-xs tracking-[0.2em] animate-pulse">
              INITIALIZING 3D ENGINE...
            </div>
            <div className="text-white/40 text-[10px] tracking-widest font-mono mt-3">
              {Math.floor(progress)}%
            </div>
          </div>
          
          <ModelViewer onLoaded={() => setModelMounted(true)} />
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-[25%] -translate-x-1/2 animate-bounce text-zinc-400 pointer-events-none hidden md:block"
        >
          <div className="w-px h-12 bg-gradient-to-b from-purple-400 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* Works Grid */}
      <section id="works" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="text-4xl font-display font-bold">SELECTED WORKS</h2>
          </div>
          <div className="hidden md:block text-xs uppercase tracking-widest text-zinc-600 font-bold">
            Scroll to explore
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.map((project, index) => (
            <motion.div
              key={project.id}
              className="h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={`/project/${project.id}`}
                className="group h-full flex flex-col glass rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-500"
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
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-display font-bold group-hover:text-purple-400 transition-colors">
                      {project.title}
                    </h3>
                    <ExternalLink className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 mt-1 shrink-0 ml-3" />
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
    </>
  );
}
