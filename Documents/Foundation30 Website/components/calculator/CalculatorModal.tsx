"use client";

import { useCalculatorStore } from "@/stores/calculatorStore";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { MultiStepForm } from "@/components/calculator/MultiStepForm";
import Image from "next/image";
import { useEffect } from "react";

export function CalculatorModal() {
  const { isOpen, closeModal, currentStep, totalSteps } = useCalculatorStore();

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative flex w-full max-w-4xl flex-col bg-white shadow-2xl overflow-hidden rounded-2xl md:flex-row max-h-[85vh]"
          >
            {/* Close Button Mobile */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 p-2 text-gray-500 hover:text-gray-900 md:hidden"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Left Column: Branding (Desktop) */}
            <div className="hidden w-1/3 flex-col justify-between bg-gray-50 p-8 md:flex border-r border-gray-100">
              <div className="space-y-6">
                <div className="relative h-12 w-32">
                   <Image src="/images/LogoMain.png" alt="Foundation30 Logo" fill className="object-contain" />
                </div>
                <div>
                   <h2 className="font-display text-3xl font-medium text-primary-navy mb-4">F30 Calculator</h2>
                   <p className="text-base text-primary-navy/70 leading-relaxed">
                    Hoàn tất thông tin để nhận kế hoạch bảo hiểm và phúc lợi được cá nhân hóa cho doanh nghiệp.
                   </p>
                </div>
              </div>
              <div className="text-xs font-medium text-gray-400 tracking-wider">FOUNDATION30 © 2025</div>
            </div>


            {/* Right Column: Form */}
            <div className="flex flex-1 flex-col bg-white">
              {/* Header with Progress */}
              <div className="flex flex-col border-b border-gray-100 bg-white px-6 py-4 md:px-8">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 md:hidden">
                      <div className="relative h-8 w-20">
                        <Image src="/images/LogoMain.png" alt="Foundation30 Logo" fill className="object-contain" />
                      </div>
                      <span className="font-bold text-primary-navy hidden sm:inline-block text-sm">F30 Calculator</span> 
                   </div>

                   <button
                    onClick={closeModal}
                    className="hidden rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:block"
                  >
                    <X className="h-5 w-5" />
                  </button>
                 </div>
                 
                 <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-gray-400">
                      <span>Tiến độ</span>
                      <span>Bước {currentStep}/{totalSteps}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        className="h-full bg-primary-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </div>
                 </div>
              </div>

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
                <MultiStepForm />
              </div>
            </div>
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
