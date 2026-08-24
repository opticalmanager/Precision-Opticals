"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, MapPin, CheckCircle2, Send, Clock, ShieldCheck } from "lucide-react";
import { contactSchema, type ContactFormValues } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ContactUsPageProps {
  onNavigateHome: () => void;
}

export const ContactUsPage: React.FC<ContactUsPageProps> = ({ onNavigateHome }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  const onFormSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Inquiry Transmitted", {
        description: "A senior master optician concierge will contact you within 24 hours.",
      });
    }, 400);
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 text-[#2A1E17] font-sans pb-20 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-stone-500 font-semibold">
          <button onClick={onNavigateHome} className="hover:text-[#C85A1B] font-bold cursor-pointer">
            HOME
          </button>
          <span>/</span>
          <span className="text-[#C85A1B] font-bold">CONTACT & ATELIER CLINICS</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF3EB] border border-[#E8DCCF] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#C85A1B] uppercase block">
                  CONCIERGE & ATELIER STORES
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight uppercase font-serif">
                  GET IN TOUCH <br />
                  <span className="text-[#C85A1B]">WITH PRECISION OPTICS</span>
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Established in 1969, Precision Optics delivers clinical optometry excellence and authorized luxury eyewear collections from Paris, Milan, and Tokyo.
                </p>
              </div>

              <div className="space-y-5 text-xs">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2A1E17] text-[#E59B62] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1C1917] uppercase">Concierge Email</h3>
                    <p className="text-stone-700">concierge@precisionoptics.in</p>
                    <p className="text-[10px] text-stone-400">Response within 2-4 business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2A1E17] text-[#E59B62] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1C1917] uppercase">Optical Helpline</h3>
                    <p className="text-stone-700">+91 (0120) 498-1969 / +91 98100 12345</p>
                    <p className="text-[10px] text-stone-400">Mon - Sun: 10:00 AM - 08:30 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2A1E17] text-[#E59B62] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1C1917] uppercase">Flagship Optical Boutique</h3>
                    <p className="text-stone-700">JMD Arcade, Sector 104, Noida, NCR Delhi 201304</p>
                    <p className="text-[10px] text-stone-400">With full Zeiss 3D diagnostic lab & luxury vault</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DCCF] shadow-xs">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-bold uppercase text-stone-900">
                    Inquiry Received
                  </h3>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                    Thank you. A senior master optometrist will review your request and contact you via email or phone shortly.
                  </p>
                  <Button
                    onClick={() => {
                      reset();
                      setSubmitted(false);
                    }}
                    variant="default"
                    className="py-3 px-6 h-auto"
                  >
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 text-xs font-sans">
                  <h3 className="font-serif text-base font-bold uppercase text-stone-900 border-b border-stone-200 pb-2">
                    Send a Message to Optical Concierge
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold uppercase text-stone-700 mb-1">Your Full Name *</label>
                      <Input
                        {...register("fullName")}
                        placeholder="e.g. Dr. Alexander"
                        className={errors.fullName ? "border-rose-500 bg-rose-50/20" : ""}
                      />
                      {errors.fullName && (
                        <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                          {errors.fullName.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-stone-700 mb-1">Phone Number</label>
                      <Input
                        type="tel"
                        {...register("phone")}
                        placeholder="+91 98100 00000"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold uppercase text-stone-700 mb-1">Email Address *</label>
                      <Input
                        type="email"
                        {...register("email")}
                        placeholder="name@example.com"
                        className={errors.email ? "border-rose-500 bg-rose-50/20" : ""}
                      />
                      {errors.email && (
                        <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                          {errors.email.message}
                        </span>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold uppercase text-stone-700 mb-1">Inquiry / Prescription Questions *</label>
                      <textarea
                        {...register("message")}
                        rows={4}
                        placeholder="Inquire about Cartier availability, Zeiss Progressive options, corporate bulk orders, or clinic consultations..."
                        className={`w-full bg-[#FAF7F2] border border-[#D5C2B1] p-2.5 rounded text-xs focus:outline-none focus:border-[#C85A1B] ${
                          errors.message ? "border-rose-500 bg-rose-50/20" : ""
                        }`}
                      />
                      {errors.message && (
                        <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                          {errors.message.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full py-4 text-xs tracking-widest shadow-md h-auto"
                  >
                    <Send className="w-4 h-4" />
                    <span>TRANSMIT INQUIRY</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
