"use client";

import Link from "next/link";
import Image from "next/image";
import { useCalculatorStore } from "@/stores/calculatorStore";

export function Header() {
  const { openModal } = useCalculatorStore();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-sm transition-all duration-300">

      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-12 w-32 overflow-hidden rounded-sm"> {/* Adjusted for potentially wider logo */}
             <Image
              src="/images/LogoMain.png"
              alt="Foundation30 Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        
        {/* Navigation Removed */}

        <div className="flex items-center gap-4">
           <button 
             onClick={openModal}
             className="relative hidden md:inline-flex uppercase tracking-wider font-medium text-white/90 transition-colors hover:text-primary-gold group py-2"
           >
              Tư vấn ngay
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-gold transition-all duration-300 ease-out group-hover:w-full" />
           </button>

          {/* Mobile menu toggle would go here */}
        </div>

      </div>
    </header>
  );
}


