import React, { useState, useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { Shield, CreditCard, Sparkles, Star } from "lucide-react";

export function LoginBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Springs to track and smooth client mouse positions for realistic inertia
  const mouseX = useSpring(0, { stiffness: 60, damping: 22 });
  const mouseY = useSpring(0, { stiffness: 60, damping: 22 });

  useEffect(() => {
    let baseTime = 0;
    let autoPlayId: number;
    let isUserActive = false;
    let userTimeout: NodeJS.Timeout;

    // Continuous premium autopilot sway loop
    const playAutopilot = () => {
      if (!isUserActive) {
        baseTime += 0.007;
        // Float in a clean infinity shape (Lissajous curve) for high kinetic premium impact
        const ax = Math.sin(baseTime) * 0.45;
        const ay = Math.cos(baseTime * 0.75) * 0.35;
        mouseX.set(ax);
        mouseY.set(ay);
      }
      autoPlayId = requestAnimationFrame(playAutopilot);
    };

    autoPlayId = requestAnimationFrame(playAutopilot);

    const handleMouseMove = (e: MouseEvent) => {
      isUserActive = true;
      clearTimeout(userTimeout);

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);

      // Return to autonomous autopilot if cursor is stationary for 3.5 seconds
      userTimeout = setTimeout(() => {
        isUserActive = false;
      }, 3500);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      cancelAnimationFrame(autoPlayId);
      clearTimeout(userTimeout);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // Transform rotations to tilt card and scene elements along standard X and Y axes
  const sceneRotateX = useTransform(mouseY, [-0.5, 0.5], [12, -12]);
  const sceneRotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  
  const cardRotateX = useTransform(mouseY, [-0.5, 0.5], [8, -25]);
  const cardRotateY = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
  const cardTranslateZ = useTransform(mouseY, [-0.5, 0.5], [35, 55]);

  // Drift simulation of floating stars
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; speed: number; size: number; delay: number; opacity: number }>>([]);

  useEffect(() => {
    const initialStars = Array.from({ length: 28 }).map((_, i) => {
      const size = 1.5 + Math.random() * 3.5;
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.12 + Math.random() * 0.28,
        size: size,
        delay: Math.random() * 5,
        opacity: 0.35 + Math.random() * 0.55,
      };
    });
    setStars(initialStars);

    // Subtle drift loop with animated breathing sparkle twinkle effect
    let animeId: number;
    const tick = () => {
      setStars((prev) =>
        prev.map((s) => {
          let nextY = s.y - s.speed;
          if (nextY < -10) {
            nextY = 110;
          }
          // Organic sine wave twinkle based on runtime timestamp
          const nextOpacity = 0.3 + Math.sin(Date.now() * 0.0018 + s.id * 12) * 0.35;
          return { ...s, y: nextY, opacity: nextOpacity };
        })
      );
      animeId = requestAnimationFrame(tick);
    };
    animeId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animeId);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-[#020818] select-none pointer-events-none"
      style={{ perspective: "1000px" }}
    >
      {/* Mesh glowing gradient backdrop */}
      <div className="absolute inset-0 bg-[#020818]" />
      
      {/* Radiant ambient glow blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[120%] h-[60%] rounded-full bg-gradient-to-br from-[#FF7A00]/10 to-transparent blur-[140px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[100%] h-[70%] rounded-full bg-gradient-to-tr from-[#081B4B]/30 to-[#FF7A00]/5 blur-[120px] opacity-60 pointer-events-none" />

      {/* Main 3D Space Wrapper */}
      <motion.div 
        className="absolute inset-0 flex flex-col justify-between"
        style={{ 
          transformStyle: "preserve-3d",
          rotateX: sceneRotateX,
          rotateY: sceneRotateY,
        }}
      >
        <div className="flex-1 relative w-full h-full">
          {/* Floor grid of glowing wireframe lines */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[550px] h-[300px] opacity-20"
            style={{
              transform: "rotateX(74deg) translateY(60px) translateZ(-80px)",
              backgroundImage: `
                linear-gradient(to right, rgba(255,122,0,0.25) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(8,27,75,0.4) 1px, transparent 1px)
              `,
              backgroundSize: "36px 36px",
              maskImage: "radial-gradient(circle at center, black 40%, transparent 95%)",
              WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 95%)",
            }}
          />

          {/* Glowing planetary orbital circles intersecting in space - Repositioned to top-[60%] to clear text */}
          {[120, 220, 310].map((dim, i) => (
            <motion.div
              key={i}
              className="absolute top-[60%] left-1/2 -translate-x-1/2 rounded-full border border-dashed text-zinc-100"
              style={{
                width: dim,
                height: dim,
                borderColor: i === 0 ? "rgba(255, 122, 0, 0.15)" : "rgba(8, 27, 75, 0.4)",
                transform: `translateZ(${-40 - i * 40}px)`,
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 20 + i * 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}

          {/* 3D Revolving Holographic Credit Card representation - Repositioned to top-[60%] to prevent overlap with welcome forms */}
          <motion.div
            className="absolute top-[60%] left-1/2 -ml-32 w-64 h-38 rounded-2xl p-5 border border-white/10 shadow-[0_20px_50px_rgba(255,122,0,0.12)] flex flex-col justify-between overflow-hidden scale-[0.8]"
            style={{
              transformStyle: "preserve-3d",
              rotateX: cardRotateX,
              rotateY: cardRotateY,
              z: 10, // Bring to beautiful foreground depth in safe non-overlapping zone
              background: "linear-gradient(135deg, rgba(255,122,0,0.2) 0%, rgba(13,32,77,0.65) 60%, rgba(2,5,15,0.95) 100%)",
              backdropFilter: "blur(8px)",
              opacity: 0.85, // Highly distinct, bright, and premium look
            }}
          >
            {/* Ambient card background glow highlight */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF7A00]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Laser reflection overlay swept by smooth hardware transition loop */}
            <motion.div 
              className="absolute inset-0 opacity-[0.22] pointer-events-none"
              style={{
                background: "linear-gradient(110deg, transparent 15%, rgba(255,122,0,0.4) 30%, rgba(255,255,255,0.6) 45%, rgba(255,122,0,0.4) 60%, transparent 75%)",
                backgroundSize: "200% 100%",
                x: "-100%"
              }}
              animate={{
                x: ["-100%", "100%"]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 2
              }}
            />

            {/* Card Content Layer - Top */}
            <div className="flex justify-between items-start" style={{ transform: "translateZ(15px)" }}>
              <div className="flex flex-col">
                <span className="text-[7.5px] text-[#FF7A00] tracking-widest font-mono uppercase font-black">DigiLend Premium</span>
                <span className="text-[11px] text-zinc-100 font-bold leading-none mt-1 shadow-xs">Smart Instant Credit</span>
              </div>
              <Shield className="w-5 h-5 text-[#FF7A00]/90 fill-[#FF7A00]/10 stroke-[2]" />
            </div>

            {/* Simulated Chip Block */}
            <div className="w-8 h-6 rounded-md bg-gradient-to-r from-amber-500/80 via-yellow-500/70 to-amber-600/80 p-0.5 border border-amber-400/30 flex flex-col justify-between opacity-85" style={{ transform: "translateZ(20px)" }}>
              <div className="flex justify-between h-2.5">
                <div className="border-r border-slate-950/20 w-2.5 h-full" />
                <div className="border-l border-slate-950/20 w-2.5 h-full" />
              </div>
              <div className="border-t border-slate-950/20 w-full" />
              <div className="flex justify-between h-2.5">
                <div className="border-r border-slate-950/20 w-2.5 h-full" />
                <div className="border-l border-slate-950/20 w-2.5 h-full" />
              </div>
            </div>

            {/* Card Content Layer - Bottom */}
            <div className="flex justify-between items-end" style={{ transform: "translateZ(15px)" }}>
              <div className="flex flex-col">
                <span className="text-[6px] text-zinc-400 font-mono tracking-widest font-bold">DIGITAL PRE-APPROVED CREDIT</span>
                <span className="text-sm font-black text-rose-50 font-sans tracking-tight mt-0.5">₹ 5,00,000</span>
              </div>
              <span className="text-[8.5px] font-mono text-zinc-300 font-bold tracking-widest">•••• 9841</span>
            </div>
          </motion.div>

          {/* Drifting space particles / dust simulation - High-contrast animated stars with continuous twinkling */}
          {stars.map((s) => (
            <div
              key={s.id}
              className="absolute rounded-full transition-opacity duration-300"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                backgroundColor: s.id % 3 === 0 ? "#FF7A00" : s.id % 3 === 1 ? "#38BDF8" : "#FFFFFF",
                opacity: s.opacity,
                filter: s.size > 2 ? "blur(0.5px)" : "none",
                boxShadow: s.id % 4 === 0 ? "0 0 8px rgba(255, 122, 0, 0.6)" : "none",
                transform: `translateZ(${-100 + s.size * 30}px)`,
              }}
            />
          ))}

          {/* Left glowing planet orb */}
          <div 
            className="absolute top-[45%] left-[-15px] w-12 h-12 rounded-full border border-white/5 opacity-30"
            style={{
              background: "radial-gradient(circle at 30% 30%, rgba(255, 122, 0, 0.15) 0%, transparent 70%)",
              transform: "translateZ(-140px)"
            }}
          />
        </div>
      </motion.div>

      {/* Dynamic top and bottom overlay panels for high contrast transitions */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#020818] via-[#020818]/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020818] via-[#020818]/40 to-transparent pointer-events-none" />
    </div>
  );
}
