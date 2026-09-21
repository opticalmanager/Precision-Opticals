"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

export type CheckoutStep = "login" | "address" | "payment" | "summary";

interface CheckoutBreadcrumbsProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
  canNavigateTo: (step: CheckoutStep) => boolean;
}

export const CheckoutBreadcrumbs: React.FC<CheckoutBreadcrumbsProps> = ({
  currentStep,
  onStepClick,
  canNavigateTo,
}) => {
  const steps: { key: CheckoutStep; label: string }[] = [
    { key: "login", label: "Login/Signup" },
    { key: "address", label: "Shipping Address" },
    { key: "payment", label: "Payment" },
    { key: "summary", label: "Summary" },
  ];

  return (
    <nav className="w-full py-4 border-b border-[#E8DCCF]/80 bg-[#FAF7F2] select-none">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.key;
            const isClickable = canNavigateTo(step.key);

            return (
              <React.Fragment key={step.key}>
                <li className="flex items-center">
                  <button
                    type="button"
                    disabled={!isClickable || step.key === "summary"}
                    onClick={() => onStepClick && onStepClick(step.key)}
                    className={`transition-all ${
                      isActive
                        ? "text-[#C86A28] font-bold border-b-2 border-[#C86A28] pb-0.5"
                        : isClickable
                        ? "text-stone-600 hover:text-stone-900 cursor-pointer"
                        : "text-stone-400 cursor-not-allowed"
                    }`}
                  >
                    {step.label}
                  </button>
                </li>
                {idx < steps.length - 1 && (
                  <span className="text-stone-400 text-xs select-none">›</span>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
