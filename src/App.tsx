import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import { motion, AnimatePresence } from "motion/react";
import { ReactLenis } from "lenis/react";

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ReactLenis root>
      <Router>
      <div className="relative">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
          <Link to="/" className="text-2xl font-display font-bold tracking-tighter hover:text-purple-400 transition-colors">
            AV<span className="text-purple-500">.</span>
          </Link>
          <div className="flex gap-8 text-xs uppercase tracking-widest font-bold text-zinc-400">
            <Link to="/" className="hover:text-white transition-colors">Gallery</Link>
            <a href="mailto:athulvikram2003@gmail.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </nav>

        <AnimatedRoutes />
      </div>
      </Router>
    </ReactLenis>
  );
}
