export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  breakdownUrl: string;
  roundupUrl?: string;
  softwares: string[];
  explanation: string;
}

export const PROJECTS: Project[] = [
  {
    id: "cyber-city",
    title: "Blender VFX",
    description: "A futuristic city environment with dynamic lighting and volumetric fog.",
    thumbnail: "/images/1.png",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    breakdownUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    roundupUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    softwares: ["Blender", "After Effects", "Substance Painter"],
    explanation: "This project focused on creating a dense, lived-in urban environment. I used geometry nodes for building generation and custom shaders for the neon signs."
  },
  {
    id: "nature-vfx",
    title: "Blender animation and CGI work",
    description: "Time-lapse growth of alien flora using procedural animation.",
    thumbnail: "/images/2.png",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    breakdownUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    roundupUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    softwares: ["Blender", "Houdini Engine", "Davinci Resolve"],
    explanation: "A study in procedural growth. The main challenge was maintaining artistic control over the organic shapes while using math-driven animation."
  },
  {
    id: "space-battle",
    title: "prisma 3D (mobile animation )",
    description: "Cinematic space battle featuring complex particle systems and explosions.",
    thumbnail: "/images/3.png",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    breakdownUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    roundupUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    softwares: ["Blender", "Nuke", "EmberGen"],
    explanation: "Focusing on large-scale physics simulations. I used EmberGen for the fire and smoke, integrated into Blender via OpenVDB."
  }
];
