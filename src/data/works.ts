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
  finalOutUrls?: string[];
  breakdownUrls?: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "cyber-city",
    title: "Blender VFX",
    description: "A futuristic city environment with dynamic lighting and volumetric fog.",
    thumbnail: "/images/blender_vfx_new.jpeg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    breakdownUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    roundupUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    softwares: ["Blender", "After Effects", "Substance Painter"],
    explanation: "This project focused on creating a dense, lived-in urban environment. I used geometry nodes for building generation and custom shaders for the neon signs.",
    finalOutUrls: [
      "/videos/blender-vfx/InShot_20260216_135416043.webm",
      "/videos/blender-vfx/final out.webm",
      "/videos/blender-vfx/car.webm",
      "/videos/blender-vfx/egal or.webm",
    ],
    breakdownUrls: [
      "/videos/blender-vfx/gb sank.webm",
      "/videos/blender-vfx/0426 (1).webm",
      "/videos/blender-vfx/bg car.webm",
      "/videos/blender-vfx/0426 (5).webm",
    ]
  },
  {
    id: "nature-vfx",
    title: "Blender animation and CGI work",
    description: "Time-lapse growth of alien flora using procedural animation.",
    thumbnail: "/images/blender_anim_new.jpeg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    breakdownUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    roundupUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    softwares: ["Blender", "Houdini Engine", "Davinci Resolve"],
    explanation: "A study in procedural growth. The main challenge was maintaining artistic control over the organic shapes while using math-driven animation.",
    finalOutUrls: [
      "/videos/nature-vfx/Video-755.mp4",
      "/videos/nature-vfx/0512(1).mp4",
      "/videos/nature-vfx/0508(1).mp4"
    ],
    breakdownUrls: [
      "https://www.youtube.com/embed/MMZjW2Nwpdc",
      "/videos/nature-vfx/Video-526.mp4"
    ]
  },
  {
    id: "space-battle",
    title: "prisma 3D (mobile animation )",
    description: "Cinematic space battle featuring complex particle systems and explosions.",
    thumbnail: "/images/prisma_3d_new.jpeg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    breakdownUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    roundupUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    softwares: ["Blender", "Nuke", "EmberGen"],
    explanation: "Focusing on large-scale physics simulations. I used EmberGen for the fire and smoke, integrated into Blender via OpenVDB.",
    finalOutUrls: [
      "https://www.youtube.com/embed/OhSWCWq0Ve4",
      "https://www.youtube.com/embed/QfEiJPNFeJE",
      "https://www.youtube.com/embed/4RsITRenSig"
    ]
  }
];
