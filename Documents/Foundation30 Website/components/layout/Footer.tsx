import Link from "next/link";
import Image from "next/image";
import { Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer id="contact" className="bg-[#1A1A1A] text-white pt-10 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center justify-center space-y-4">
           <div className="relative h-48 w-80 md:h-72 md:w-xl">
             <Image

              src="/images/LogoMain.png"
              alt="Foundation30 Logo"
              fill
              className="object-contain" // Removed invert to show natural gold color
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 border-t border-white/10 pt-16">
          
          {/* Resources */}
          <div className="space-y-6 text-center md:text-left">
            <h3 className="font-display text-sm font-bold tracking-widest text-primary-gold uppercase">
              Resources
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-white/70 hover:text-primary-gold transition-colors">
                  Brochure
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-primary-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
               <li>
                <Link href="#" className="text-white/70 hover:text-primary-gold transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6 text-center md:text-left">
            <h3 className="font-display text-sm font-bold tracking-widest text-primary-gold uppercase">
              Contact
            </h3>
            <div className="space-y-4 text-white/70">
              <p>
                <span className="block text-xs uppercase tracking-wider text-white/40 mb-1">Điện Thoại (Zalo)</span>
                0392 411 599
              </p>
              <p>
                <span className="block text-xs uppercase tracking-wider text-white/40 mb-1">Email</span>
                khoadnguyenaia@gmail.com
              </p>
            </div>
             <a href="https://www.facebook.com/profile.php?id=61582887162689" target="_blank" rel="noopener noreferrer">
              <Button 
                  variant="outline" 
                  className="mt-4 gap-2 border-primary-gold text-primary-gold hover:bg-primary-gold hover:text-white"
                >
                  <Facebook className="h-4 w-4" />
                  Join Us On Facebook
                </Button>
             </a>

          </div>

           {/* Address */}
          <div className="space-y-6 text-center md:text-left">
            <h3 className="font-display text-sm font-bold tracking-widest text-primary-gold uppercase">
              Address
            </h3>
            <p className="text-white/70 leading-relaxed whitespace-pre-line">
              Bitexco Financial Tower{"\n"}
              Số 02 Hải Triều, Phường Bến Nghé,{"\n"}
              Quận 1 Ho Chi Minh City, Vietnam 700000
            </p>
          </div>

        </div>

        <div className="mt-20 border-t border-white/5 pt-8 text-center text-sm text-white/40">
          <p>Copyright © 2025 Foundation30. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
