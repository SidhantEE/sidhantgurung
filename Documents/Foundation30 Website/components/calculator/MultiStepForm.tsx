"use client";

import { useCalculatorStore } from "@/stores/calculatorStore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";

// Schema
const formSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  position: z.string().optional(),
  industry: z.string().min(1, "Vui lòng chọn lĩnh vực"),
  companySize: z.string().min(1, "Vui lòng chọn quy mô"),
  priority: z.string().min(1, "Vui lòng chọn ưu tiên"),
  employeeGroup: z.string().min(1, "Vui lòng chọn nhóm nhân sự"),
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  { id: "name", label: "1. Tên *", type: "text", placeholder: "Nguyễn Văn Khoa" },
  { id: "phone", label: "2. Số điện thoại *", type: "tel", placeholder: "0912 345 678" },
  { id: "email", label: "3. Email doanh nghiệp *", type: "email", placeholder: "name@company.com" },
  { id: "position", label: "4. Chức danh", type: "text", placeholder: "CEO, Giám đốc..." },
  { 
    id: "industry", 
    label: "5. Lĩnh vực hoạt động", 
    type: "select", 
    options: ["Bán lẻ FMCG", "Công nghệ thông tin", "Sản xuất dệt may", "Sản xuất điện tử", "Dịch vụ tài chính", "Startup", "Xây dựng và bất động sản", "Khác"] 
  },
  { 
    id: "companySize", 
    label: "6. Quy mô nhân sự", 
    type: "select", 
    options: ["Dưới 10 nhân sự", "10 - 30 nhân sự", "30 - 100 nhân sự", "100 - 500 nhân sự", "Trên 500 nhân sự"] 
  },
  { 
    id: "priority", 
    label: "7. Ưu tiên chính của doanh nghiệp", 
    type: "select", 
    options: ["Giữ chân và thu hút nhân tài", "Kiểm soát và tối ưu chi phí", "Bảo vệ đội ngũ lãnh đạo", "Nâng cao năng suất làm việc", "Chăm sóc sức khỏe toàn diện"] 
  },
  { 
    id: "employeeGroup", 
    label: "8. Nhóm nhân sự ưu tiên", 
    type: "select", 
    options: ["Toàn bộ nhân sự", "Cấp quản lý / điều hành", "Nhà sáng lập / đội ngũ lãnh đạo", "Nhóm tạo doanh thu"] 
  },
];

export function MultiStepForm() {
  const { currentStep, nextStep, prevStep, updateFormData, closeModal, reset } = useCalculatorStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const { register, trigger, getValues, formState: { errors } } = form;

  const handleNext = async () => {
    const currentFieldName = STEPS[currentStep - 1].id as keyof FormValues;
    const isStepValid = await trigger(currentFieldName);

    if (isStepValid) {
      updateFormData({ [currentFieldName]: getValues(currentFieldName) });
      if (currentStep < 8) {
        nextStep();
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // In a real app, submit 'formData' to API
    console.log("Form Submitted:", getValues());
    
    setIsSubmitting(false);
    reset(); // Reset store
    closeModal();
    router.push("/thank-you");
  };

  const currentField = STEPS[currentStep - 1];

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="space-y-4">
          <Label htmlFor={currentField.id} className="text-base font-medium text-primary-navy">
            {currentField.label}
          </Label>
          
          {currentField.type === "select" ? (
             <div className="relative">
              <select
                {...register(currentField.id as keyof FormValues)}
                id={currentField.id}
                className="flex h-12 w-full cursor-pointer appearance-none rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:border-primary-gold focus:outline-none focus:ring-2 focus:ring-primary-gold"
              >
                <option value="">Chọn một tùy chọn...</option>
                {currentField.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
               <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <ChevronRight className="h-4 w-4 rotate-90" />
               </div>
            </div>
          ) : (
            <Input
              {...register(currentField.id as keyof FormValues)}
              id={currentField.id}
              type={currentField.type}
              placeholder={currentField.placeholder}
              className="h-12 text-base"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                   e.preventDefault();
                   handleNext();
                }
              }}
            />
          )}
          
          {errors[currentField.id as keyof FormValues] && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
              {errors[currentField.id as keyof FormValues]?.message}
            </p>
          )}
        </div>
      </motion.div>

      <div className="flex items-center gap-4 pt-4">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={prevStep}
          className={`h-10 px-4 border-gray-300 text-gray-500 hover:text-primary-navy ${currentStep === 1 ? "invisible" : ""}`}
        >
           <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>

        {/* Next/Submit Button */}
        <Button
          onClick={handleNext}
          variant="primary"
          className="flex-1 h-12 text-sm font-medium"
          disabled={isSubmitting}
        >

          {isSubmitting ? (
            "Đang gửi..." 
          ) : currentStep === 8 ? (
            <span className="flex items-center">Gửi kết quả <Check className="ml-2 h-4 w-4" /></span>
          ) : (
            <span className="flex items-center">Tiếp theo <ChevronRight className="ml-2 h-4 w-4" /></span>
          )}
        </Button>
      </div>
    </div>
  );
}
