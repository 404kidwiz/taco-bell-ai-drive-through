"use client";

import { useEffect } from "react";
import { initLenis, destroyLenis } from "@/lib/smooth-scroll";
import { gsap, ScrollTrigger } from "@/lib/scroll-animations";

export default function ClientInit() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    initLenis();

    return () => {
      destroyLenis();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
