"use client";
import { motion } from "framer-motion";

export const BackgroundWave = () => {
  return (
    <motion.video
      src="/wave-loop.mp4"
      autoPlay
      muted
      loop
      controls={false}
      className="fixed [filter:sepia(100%)_saturate(400%)_brightness(95%)_hue-rotate(15deg)] object-cover bottom-0 z-[-1] hidden md:block pointer-events-none opacity-75"
    />
  );
};
