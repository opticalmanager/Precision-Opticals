"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, Home, Building2, Check, ArrowRight, Glasses, Stethoscope } from "lucide-react";
import { appointmentSchema, type AppointmentFormValues } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AppointmentPageProps {
  onNavigateHome: () => void;
  onNavigateShop: () => void;
}

export const AppointmentPage: React.FC<AppointmentPageProps> = ({
  onNavigateHome,
  onNavigateShop,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      service: "12-Step Zero-Error Eye Test (Complimentary)",
      type: "in-store",
      storeLocation: "Store 1 - JMD Arcade, Sector 104, Noida",
      address: "",
      pincode: "",
      date: "",
      timeSlot: "11:30 AM - 01:00 PM",
    },
  });

  const appointmentType = watch("type");

  const APPOINTMENT_SERVICES = [
    "12-Step Zero-Error Eye Test (Complimentary)",
    "Progressive Lens Digital 3D Fitting & Centeration",
    "Contact Lens Diagnostic Exam & Free Trial",
    "Computer Vision Syndrome & Dry Eye Screening",
    "Pediatric Eye Exam & Myopia Control Consultation",
    "VIP Eyewear Wardrobe & Face-Shape Styling",
  ];

  const STORES = [
    "Store 1 - JMD Arcade, Sector 104, Noida",
    "Store 2 - Amarpali Crystals Homes, Sector 76, Noida",
    "Store 3 - Spectrum Metro Mall, Phase-1, Sector 75, Noida",
    "Store 4 - Mahagun Mart, Gaur City 2, Greater Noida",
    "Store 5 - Golf Course Road Boutique, DLF Phase 5, Gurugram",
    "Store 6 - Indiranagar 100ft Luxury Flagship, Bengaluru",
  ];

  const TIME_SLOTS = [
    "10:00 AM - 11:30 AM",
    "11:30 AM - 01:00 PM",
    "02:00 PM - 03:30 PM",
    "03:30 PM - 05:00 PM",
    "05:00 PM - 06:30 PM",
    "06:30 PM - 08:00 PM",
  ];

  const onFormSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    const newBookingId = `APT-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: newBookingId }),
      });

      setBookingId(newBookingId);
      setSubmitted(true);
      toast.success("Eye Exam Appointment Reserved!", {
        description: `Reference number: ${newBookingId}. Our clinic coordinator will call to confirm.`,
      });
    } catch (e) {
      setBookingId(newBookingId);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#2A1E17] font-sans pb-20 animate-in fade-in duration-200">
      {/* Breadcrumb Header */}
      <div className="bg-[#FAF3EB] border-b border-[#E8DCCF] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sans font-bold tracking-widest text-[#C85A1B] uppercase block">
              CLINICAL EXCELLENCE (ESTD. 1969)
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-[#1C1917]">
              Book Zero-Error Eye Exam
            </h1>
          </div>
          <button
            onClick={onNavigateHome}
            className="text-xs font-serif font-bold uppercase tracking-wider text-stone-700 hover:text-[#C85A1B] cursor-pointer"
          >
            ← Return Home
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {submitted ? (
          <div className="max-w-xl mx-auto bg-white border border-[#E8DCCF] p-8 rounded-xl shadow-xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-serif text-2xl font-bold uppercase text-stone-900">
              Appointment Reserved!
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
              Your In-Store 12-Step Clinical Eye Examination has been scheduled under reference: <strong className="font-mono text-[#C85A1B]">{bookingId}</strong>. Our senior clinic optician will welcome you for your complimentary exam.
            </p>
            <div className="pt-4 flex gap-3 justify-center">
              <Button onClick={onNavigateShop} variant="primary" className="py-3 px-6 h-auto">
                Explore Eyewear Catalog
              </Button>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="py-3 px-6 h-auto">
                Book Another
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form (Span 7) */}
            <div className="lg:col-span-7 bg-white border border-[#E8DCCF] p-6 sm:p-8 rounded-xl shadow-xs space-y-6">
              {/* Clinic Banner */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DCCF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2A1E17] text-white flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm uppercase text-stone-900">
                      In-Store Zero-Error Clinical Eye Exam
                    </h3>
                    <p className="text-[11px] text-stone-600">
                      12-step digital refractive protocol conducted by senior optometrists
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[10px] font-bold text-[#C85A1B] bg-orange-100/70 border border-orange-200/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Complimentary
                </span>
              </div>

              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase text-stone-700 mb-1">Patient Full Name *</label>
                    <Input
                      {...register("fullName")}
                      placeholder="e.g. Dr. Rohan Sharma"
                      className={errors.fullName ? "border-rose-500 bg-rose-50/20" : ""}
                    />
                    {errors.fullName && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                        {errors.fullName.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-stone-700 mb-1">Mobile Phone *</label>
                    <Input
                      {...register("phone")}
                      placeholder="e.g. 9810012345"
                      className={errors.phone ? "border-rose-500 bg-rose-50/20" : ""}
                    />
                    {errors.phone && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                        {errors.phone.message}
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold uppercase text-stone-700 mb-1">Email Address *</label>
                    <Input
                      type="email"
                      {...register("email")}
                      placeholder="patient@example.com"
                      className={errors.email ? "border-rose-500 bg-rose-50/20" : ""}
                    />
                    {errors.email && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold uppercase text-stone-700 mb-1">Clinical Service *</label>
                    <select
                      {...register("service")}
                      className="w-full bg-[#FAF7F2] border border-[#D5C2B1] p-2.5 rounded text-xs focus:outline-none focus:border-[#C85A1B] cursor-pointer"
                    >
                      {APPOINTMENT_SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold uppercase text-stone-700 mb-1">Select Precision Boutique Clinic *</label>
                    <select
                      {...register("storeLocation")}
                      className="w-full bg-[#FAF7F2] border border-[#D5C2B1] p-2.5 rounded text-xs focus:outline-none focus:border-[#C85A1B] cursor-pointer"
                    >
                      {STORES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-stone-700 mb-1">Preferred Date *</label>
                    <Input
                      type="date"
                      {...register("date")}
                      className={errors.date ? "border-rose-500 bg-rose-50/20" : ""}
                    />
                    {errors.date && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                        {errors.date.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-stone-700 mb-1">Time Slot *</label>
                    <select
                      {...register("timeSlot")}
                      className="w-full bg-[#FAF7F2] border border-[#D5C2B1] p-2.5 rounded text-xs focus:outline-none focus:border-[#C85A1B] cursor-pointer"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full py-4 text-xs tracking-widest shadow-lg h-auto"
                  >
                    <span>CONFIRM COMPLIMENTARY CLINIC APPOINTMENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Information (Span 5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#E8DCCF] rounded-xl overflow-hidden shadow-xs">
                <img
                  src="/images/store_1_precision_optics_1785155972710.jpg"
                  alt="Precision Optics Clinic"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 space-y-3 text-xs">
                  <h3 className="font-serif font-bold text-base uppercase text-[#1C1917]">
                    12-Step Zero-Error Clinical Protocol
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
                    Our master opticians employ auto-refractometry, pupil distance digital centeration, dry eye tear film evaluation, and 3D progressive corridor alignment to guarantee comfortable all-day vision.
                  </p>
                  <div className="space-y-1.5 pt-2 text-stone-700 font-semibold">
                    <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#C85A1B]" /> Zeiss i.Terminal 3D Digital Measurement</p>
                    <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#C85A1B]" /> 100+ Luxury Designer Frames for Trial</p>
                    <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#C85A1B]" /> 100% Free Consultation with No Purchase Obligation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
