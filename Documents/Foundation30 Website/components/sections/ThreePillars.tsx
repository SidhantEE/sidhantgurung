"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    id: "health",
    eyebrow: "SỨC KHỎE",
    title: "Sức khỏe toàn diện",
    description:
      "Thiết kế bảo hiểm sức khỏe, chi phí và lối sống khỏe mạnh cho từng nhóm nhân viên. Chúng tôi mang đến giải pháp chăm sóc y tế đẳng cấp, đảm bảo sự an tâm tuyệt đối cho đội ngũ của bạn.",
    image: "/images/young-japanese-woman-white-skirt-outdoors.jpg",
    gradient: "from-primary-navy/40 to-primary-navy",
  },
  {
    id: "wealth",
    eyebrow: "THỊNH VƯỢNG",
    title: "An tâm tài chính",
    description:
      "Bảo vệ tài chính trước những rủi ro và những giải pháp bền vững cho một sự ổn định dài hạn. Chiến lược đầu tư và bảo vệ tài sản thông minh giúp doanh nghiệp phát triển vững chắc.",
    image: "/images/japanese-business-concept-with-business-partners-min.jpg",
    gradient: "from-primary-navy/40 to-primary-navy",
  },
  {
    id: "wisdom",
    eyebrow: "TRÍ TUỆ",
    title: "Tầm nhìn lãnh đạo",
    description:
      "Lãnh đạo dựa trên phúc lợi, niềm tin, sự an toàn và tầm nhìn dài hạn. Xây dựng văn hóa doanh nghiệp ưu việt thông qua sự thấu hiểu và các giải pháp nhân sự tiên tiến.",
    image: "/images/businessman-getting-off-car-2.avif",
    gradient: "from-primary-navy/40 to-primary-navy",
  },

];

export function ThreePillars() {
  const [activePillar, setActivePillar] = useState(0);

  return (
    <section className="relative w-full bg-primary-navy pb-20">


        {/* Background Accent - Wrapped to prevent overflow issues with sticky */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute inset-0 z-0 opacity-10">
                 <Image
                    src="/images/2mount.png"
                    alt="Mountain Accent"
                    fill
                    className="object-cover object-bottom"
                    loading="lazy"
                    quality={75}
                  />
            </div>
        </div>

      
      {/* Intro Header */}
      <div className="container relative z-10 mx-auto px-4 pt-16 text-center md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Ba trụ cột của sự bảo vệ toàn diện
          </h2>
          <p className="font-display text-sm md:text-base font-bold tracking-[0.2em] text-primary-gold uppercase mb-12">
            Sức khỏe | Thịnh vượng | Trí tuệ
          </p>
        </motion.div>
      </div>


      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row">
            {/* Left Column: Scrolling Text */}
            <div className="w-full lg:w-1/2 py-10 lg:pt-12 lg:pb-32">


              <div className="space-y-[20vh]"> {/* Compact spacing */}
                {PILLARS.map((pillar, index) => (
                  <PillarTextBlock
                    key={pillar.id}
                    pillar={pillar}
                    index={index}
                    setActivePillar={setActivePillar}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Sticky Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
              <div className="sticky top-24 h-[80vh] flex items-center justify-center p-4"> {/* Adjusted top and height */}
                <div className="relative w-full h-full max-h-[800px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <AnimatePresence mode="popLayout">

                    {PILLARS.map((pillar, index) => (
                      activePillar === index && (
                        <motion.div
                          key={pillar.id}
                          className="absolute inset-0"
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          style={{ willChange: "transform, opacity" }}
                        >

                          <Image
                            src={pillar.image}
                            alt={pillar.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={index === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                          {/* Overlay Gradient */}
                          <div className={cn("absolute inset-0 bg-linear-to-t", pillar.gradient, "opacity-40")} />
                        </motion.div>
                      )
                    ))}
                  </AnimatePresence>
                  
                  {/* Decorative Elements on the frame */}
                  <div className="absolute inset-0 border border-white/10 rounded-2xl z-20 pointer-events-none" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary-gold/50 rounded-tr-lg z-20" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary-gold/50 rounded-bl-lg z-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function PillarTextBlock({
  pillar,
  index,
  setActivePillar,
}: {
  pillar: (typeof PILLARS)[0];
  index: number;
  setActivePillar: (index: number) => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  useEffect(() => {
    if (isInView) {
      setActivePillar(index);
    }
  }, [isInView, index, setActivePillar]);


  return (
    <div
      ref={ref}
      className="flex flex-col justify-center min-h-[40vh] lg:min-h-[60vh] px-4 lg:pr-12"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0 }}
        className="relative z-10"
      >
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary-gold/30 bg-primary-gold/10 text-primary-gold text-sm font-medium tracking-wider">
          {pillar.eyebrow}
        </span>
        <h3 className="font-display text-3xl md:text-5xl font-medium text-secondary-tan mb-6 leading-tight">
          {pillar.title}
        </h3>

        <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-xl">
          {pillar.description}
        </p>


        
        {/* Mobile-only Image (since sticky is hidden on mobile) */}
        <div className="lg:hidden mt-8 relative w-full aspect-video rounded-lg overflow-hidden border border-white/10">
             <Image
                src={pillar.image}
                alt={pillar.title}
                fill
                className="object-cover"
              />
        </div>
      </motion.div>
    </div>
  );
}

