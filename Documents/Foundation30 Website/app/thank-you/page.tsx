import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ThankYouPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-primary-navy overflow-x-hidden">
      <Header />
      
      <main className="relative flex-1 flex items-center justify-center min-h-screen py-32 px-4">

        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero-bg.png" 
            alt="Background" 
            fill 
            className="object-cover opacity-20 brightness-50"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-primary-navy" />
        </div>


        <div className="relative z-10 container mx-auto px-4 text-center md:px-6">
          <div className="mx-auto max-w-2xl bg-white/5 p-8 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="mb-6 flex justify-center">
              <div className="relative h-20 w-48 md:h-24 md:w-56">
                <Image
                  src="/images/LogoMain.png"
                  alt="Foundation30 Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            
            <h1 className="mb-6 font-display text-3xl font-bold uppercase tracking-widest text-primary-gold">
              Cảm ơn bạn đã đăng ký!
            </h1>
            
            <div className="space-y-4 text-white/80 text-lg leading-relaxed">
              <p>
                Chúng tôi đã nhận được thông tin của bạn và sẽ liên hệ trong vòng <span className="font-bold text-white">24 giờ</span>.
              </p>
              <p>
                Đội ngũ hỗ trợ Foundation30 sẽ liên hệ để thảo luận các giải pháp bảo hiểm phù hợp với nhu cầu của bạn.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-sm text-white/60">
                Trong khi chờ đợi, hãy theo dõi chúng tôi trên Zalo/Facebook để biết thêm thông tin!
              </p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/profile.php?id=61582887162689" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white hover:text-primary-navy">
                    <Facebook className="h-4 w-4" /> Facebook
                  </Button>
                </a>
                <a href="https://zalo.me/0392411599" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white hover:text-primary-navy">
                    Zalo
                  </Button>
                </a>
              </div>

              <div className="mt-8">
                <Link href="/">
                  <Button variant="primary" className="px-8 py-6 text-base font-bold uppercase tracking-widest">
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>


      <Footer />
    </div>
  );
}

