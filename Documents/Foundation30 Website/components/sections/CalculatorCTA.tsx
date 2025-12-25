"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useCalculatorStore } from "@/stores/calculatorStore";


export function CalculatorCTA() {
  const { openModal } = useCalculatorStore();
  const benefits = [
    "Tạo ra phúc lợi trực tiếp cho nhân viên",
    "Thu hút và giữ chân nhân tài",
    "Tiết kiệm chi phí bảo hiểm dài hạn bằng tài khoản tiền mặt của hợp đồng bảo hiểm",
    "Tiết kiệm thuế cho doanh nghiệp"
  ];


  return (
    <section id="calculator" className="relative w-full bg-linear-to-b from-primary-navy to-black py-24 md:py-32">

       {/* Background Accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left: Content */}
            <div className="flex-1 space-y-8 text-center md:text-left">
                <div>
                     <span className="inline-block px-4 py-1.5 rounded-md border border-primary-gold/30 bg-primary-gold/10 text-primary-gold text-sm font-semibold tracking-wider mb-6">
                        CÔNG CỤ HỖ TRỢ
                    </span>
                    <h2 className="font-display text-3xl md:text-5xl font-medium text-white mb-6 leading-tight">
                        F30 Calculator
                    </h2>

                    <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto md:mx-0">
                         Foundation30 thuộc AIA Vietnam là đại lý được cấp chứng chỉ chính thức chuyên hỗ trợ tư vấn và cung cấp các giải pháp bảo hiểm nhân thọ, bảo hiểm y tế phù hợp cho các khách hàng thu nhập cao và tổ chức kinh doanh tại lãnh thổ Việt Nam. Chúng tôi giúp quý khách hàng hiểu rõ khả năng sử dụng bảo hiểm nhân thọ và bảo hiểm y tế như những công cụ tài chính cho cá nhân, doanh nghiệp cho những mục đích khác nhau.
                    </p>

                </div>
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-gold/20 text-primary-gold">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium text-gray-200">{benefit}</span>
                      </div>
                    ))}
                  </div>

                 <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                     <Button 
                        onClick={openModal}
                        size="lg"
                        className="bg-primary-gold text-primary-navy hover:bg-white hover:text-primary-navy font-medium text-base px-6 py-4 rounded-lg shadow-[0_0_20px_rgba(212,184,150,0.3)] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                      >




                        Bắt đầu bài kiểm tra ngay
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                 </div>
            </div>

            {/* Right: Visual Abstract Representation (CSS only, no images needed) */}
             <div className="w-full md:w-1/2 lg:w-5/12">
                <div className="relative aspect-square max-w-sm mx-auto">
                    {/* Abstract Cards Layered */}
                    <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent rounded-2xl border border-white/10 backdrop-blur-sm -rotate-6 transform translate-y-4" />
                    <div className="absolute inset-0 bg-linear-to-br from-primary-gold/20 to-transparent rounded-2xl border border-primary-gold/20 backdrop-blur-sm rotate-3 transform translate-x-2" />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-primary-navy border border-white/10 p-8 shadow-2xl">

                        <div className="w-full h-full border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center space-y-6">
                            <div className="text-center">
                                <div className="text-3xl font-medium text-white mb-2">Tối ưu</div>
                                <div className="text-sm text-gray-400 uppercase tracking-widest">Chi phí Thuế</div>
                            </div>
                             <div className="w-16 h-1 bg-white/10 rounded-full" />
                            <div className="text-center">
                                <div className="text-3xl font-medium text-primary-gold mb-2">Toàn diện</div>
                                <div className="text-sm text-primary-gold/80 uppercase tracking-widest">Bảo vệ nhân sự</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
}

