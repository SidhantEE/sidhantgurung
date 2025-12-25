"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";


export function Hero() {
  
  const scrollToCalculator = () => {
    const element = document.getElementById('calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-[70vh] w-full overflow-hidden md:h-[85vh]">

      {/* Background Image */}

      <div className="absolute inset-0 z-0">
        <Image
          src="/images/HeroHero.png"
          alt="Foundation30 Hero"
          fill
          priority
          className="object-cover"
        />


        <div className="absolute inset-0 bg-primary-navy/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
        
        {/* Mountain Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 z-5 opacity-30 mix-blend-overlay pointer-events-none">
             <Image
              src="/images/mountain1.png"
              alt="Mountain Accent"
              fill
              className="object-cover object-bottom"
              loading="lazy"
              quality={75}
            />
        </div>
      </div>


      {/* Geometric Overlay (Right side) */}
      <div className="absolute right-0 top-0 bottom-0 z-10 hidden w-1/3 bg-primary-gold/10 backdrop-blur-[2px] opacity-60 md:block skew-x-[-15deg] translate-x-1/4" />

      {/* Content */}
      <div className="container relative z-20 mx-auto flex h-full flex-col justify-center px-4 md:px-6">
        <div className="max-w-3xl space-y-6">
          <h1 className="font-display text-3xl font-medium uppercase leading-tight tracking-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
            Doanh nghiệp hình mẫu <br className="hidden md:block" />
            <span className="text-primary-gold">trong kỷ nguyên hiện đại</span>
          </h1>

          
          <p className="max-w-xl text-base font-normal leading-relaxed text-white/90 drop-shadow-md md:text-lg">
            Doanh nghiệp thành công khi đội ngũ nhân viên được bảo vệ và an tâm. 
            Sử dụng công cụ tính toán của Foundation30 để hoạch định chiến lược bảo hiểm cho nhân sự cốt lõi.
          </p>

          <div className="pt-4">
            <Button 
              onClick={scrollToCalculator}
              variant="primary" 
              size="lg" 
              className="min-w-[200px] border-none bg-primary-gold px-6 py-4 text-base font-medium uppercase tracking-wider text-white shadow-xl transition-all hover:-translate-y-1 hover:brightness-110 group"

            >

              <span className="relative">
                Kiểm tra giải pháp phù hợp ngay
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-white transition-all duration-300 ease-out group-hover:w-full" />
              </span>
            </Button>


          </div>
        </div>
      </div>
    </section>
  );
}
