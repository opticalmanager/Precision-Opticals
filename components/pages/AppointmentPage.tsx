"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Award,
} from "lucide-react";
import { appointmentSchema, type AppointmentFormValues } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface AppointmentPageProps {
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onNavigateContact?: () => void;
}

const STORE_LOCATIONS = [
  "123, MG Road, Near City Center, Sector 18, Noida",
  "JMD Arcade, Sector 104, Noida",
  "Amarpali Crystals Homes, Sector 76, Noida",
  "Spectrum Metro Mall, Phase-1, Sector 75, Noida",
  "Mahagun Mart, Gaur City 2, Greater Noida",
  "Golf Course Road Flagship, DLF Phase 5, Gurugram",
  "Indiranagar 100ft Luxury Boutique, Bengaluru",
];

const PURPOSE_OPTIONS = [
  "Comprehensive Eye Examination",
  "Personalized Eyewear & Frame Consultation",
  "Progressive Lens Digital 3D Fitting",
  "Contact Lens Diagnostic Exam & Trial",
  "Frame Adjustment & Precision Repair",
  "Computer Vision & Blue-Cut Consultation",
];

const TIME_SLOT_OPTIONS = [
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
];

const WHY_BOOK_BENEFITS = [
  {
    icon: Sparkles,
    title: "Personalized Consultation",
    description: "Get expert advice tailored to your needs",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Skip the wait and get priority service",
  },
  {
    icon: ShieldCheck,
    title: "Better Experience",
    description: "One-on-one attention for perfect solutions",
  },
  {
    icon: Award,
    title: "Expert Guidance",
    description: "Professional advice for eye health & style",
  },
];

export const AppointmentPage: React.FC<AppointmentPageProps> = ({
  onNavigateHome,
  onNavigateShop,
  onNavigateContact,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      service: "Comprehensive Eye Examination",
      purposeOfVisit: "Comprehensive Eye Examination",
      type: "in-store",
      storeLocation: STORE_LOCATIONS[0],
      date: "",
      timeSlot: TIME_SLOT_OPTIONS[1],
      notes: "",
    },
  });

  // Minimum date: today
  const minDate = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  const onFormSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    const newBookingId = `APT-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: newBookingId,
          service: data.purposeOfVisit || data.service,
        }),
      });

      const result = await res.json();
      const confirmedId = result.bookingId || newBookingId;

      setBookingId(confirmedId);
      setSubmitted(true);
      toast.success("Appointment Reserved!", {
        description: `Booking ID: ${confirmedId}. Our eyewear specialist will confirm shortly.`,
      });
    } catch {
      setBookingId(newBookingId);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSubmitted(false);
    setBookingId("");
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#2A1E17] font-sans antialiased">
      {/* ============================================================ */}
      {/* 1. HERO BANNER SECTION (Concise & Crisp, No Duplicate Text)   */}
      {/* ============================================================ */}
      <section className="w-full bg-[#0B0C0E] border-b border-[#2A1E17]/40 select-none">
        <div className="max-w-[1200px] mx-auto relative overflow-hidden">
          <img
            src="/images/appointment/appointment_hero_v2.png"
            alt="Book an Appointment - Personalized eyewear consultation with our experts"
            className="w-full h-auto max-h-[220px] sm:max-h-[250px] md:max-h-[270px] object-cover object-center"
          />

          {/* Single Clean Interactive Breadcrumb Overlay */}
          <div className="absolute top-4 sm:top-5 md:top-6 left-5 sm:left-8 md:left-12 lg:left-14 z-20 flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-400 font-sans font-medium">
            <button
              onClick={onNavigateHome}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-stone-500">&gt;</span>
            <span className="text-stone-200 font-semibold">Appointment</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. SECTION INTRO TITLE (Concise Spacing)                     */}
      {/* ============================================================ */}
      <section className="pt-8 sm:pt-10 pb-3 px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto">
        <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-[2.5px] text-[#C86A28] uppercase block mb-1">
          YOUR VISION, OUR PRIORITY
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] font-normal text-[#2A1E17] tracking-tight leading-tight">
          Book Your Visit
        </h1>

        {/* 3-segment orange divider */}
        <div className="flex items-center justify-center gap-1.5 my-2.5">
          <span className="w-3.5 h-[2px] bg-[#C86A28]/40 rounded-full" />
          <span className="w-6 h-[2px] bg-[#C86A28] rounded-full" />
          <span className="w-3.5 h-[2px] bg-[#C86A28]/40 rounded-full" />
        </div>

        <p className="text-xs sm:text-[13px] text-[#6B5E55] leading-relaxed max-w-lg mx-auto font-sans font-normal">
          Schedule an appointment with our eyewear specialists for personalized guidance and perfect vision solutions.
        </p>
      </section>

      {/* ============================================================ */}
      {/* 3. MAIN FORM & SIDEBAR SECTION (Contained Width, No Stretch)  */}
      {/* ============================================================ */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {submitted ? (
          /* Success Card State */
          <div className="max-w-lg mx-auto bg-white rounded-[24px] border border-[#EBE6DF] p-6 sm:p-10 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 bg-[#FAF3EB] text-[#C86A28] rounded-2xl flex items-center justify-center mx-auto border border-[#E8DCCF]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#C86A28]">
                RESERVATION CONFIRMED
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#2A1E17]">
                Appointment Booked!
              </h2>
              <p className="text-xs text-[#6B5E55] leading-relaxed max-w-md mx-auto">
                Thank you, <strong className="text-[#2A1E17]">{watch("fullName")}</strong>. Your consultation has been scheduled under reference number:
              </p>
              <div className="inline-block bg-[#FAF3EB] border border-[#E8DCCF] px-3.5 py-1.5 rounded-lg mt-1 font-mono font-bold text-[#C86A28] text-base">
                {bookingId}
              </div>
            </div>

            <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#EBE6DF] text-xs text-left space-y-1.5 text-[#4A3E37]">
              <div className="flex justify-between items-center py-1 border-b border-[#EBE6DF]/60">
                <span className="text-[#8C7D73]">Location:</span>
                <span className="font-semibold text-right max-w-[220px] truncate">{watch("storeLocation")}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#EBE6DF]/60">
                <span className="text-[#8C7D73]">Date:</span>
                <span className="font-semibold">{watch("date")}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#EBE6DF]/60">
                <span className="text-[#8C7D73]">Time Slot:</span>
                <span className="font-semibold">{watch("timeSlot")}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#8C7D73]">Purpose:</span>
                <span className="font-semibold text-right">{watch("purposeOfVisit")}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button
                onClick={onNavigateShop}
                className="bg-[#211712] hover:bg-[#C86A28] text-white py-3 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Browse Eyewear
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-[#E2D8CC] text-[#2A1E17] hover:bg-[#FAF3EB] py-3 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Book Another
              </Button>
            </div>
          </div>
        ) : (
          /* Form + Sidebar Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
            
            {/* ======================================================= */}
            {/* LEFT COLUMN: APPOINTMENT FORM (Span 7)                 */}
            {/* ======================================================= */}
            <div className="lg:col-span-7 bg-white rounded-[20px] sm:rounded-[26px] p-5 sm:p-7 shadow-xs border border-[#EBE6DF]">
              
              {/* Form Card Header */}
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#FAF3EB]">
                <div className="w-9 h-9 rounded-xl bg-[#FAF3EB] text-[#C86A28] border border-[#E8DCCF]/60 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2A1E17] tracking-tight">
                  Appointment Details
                </h2>
              </div>

              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3.5">
                
                {/* Row 1: Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold tracking-wider text-[#2A1E17] uppercase mb-1 block font-sans">
                      FULL NAME
                    </label>
                    <input
                      {...register("fullName")}
                      placeholder="Enter your full name"
                      className={`h-10 sm:h-[42px] w-full rounded-lg border ${
                        errors.fullName ? "border-rose-500 bg-rose-50/20" : "border-[#E2D8CC]"
                      } bg-[#FAF8F5]/60 px-3.5 text-xs text-[#2A1E17] placeholder:text-[#A8988B] focus:border-[#C86A28] focus:bg-white focus:outline-none transition-all shadow-xs`}
                    />
                    {errors.fullName && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                        {errors.fullName.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold tracking-wider text-[#2A1E17] uppercase mb-1 block font-sans">
                      PHONE NUMBER
                    </label>
                    <input
                      {...register("phone")}
                      placeholder="Enter your phone number"
                      className={`h-10 sm:h-[42px] w-full rounded-lg border ${
                        errors.phone ? "border-rose-500 bg-rose-50/20" : "border-[#E2D8CC]"
                      } bg-[#FAF8F5]/60 px-3.5 text-xs text-[#2A1E17] placeholder:text-[#A8988B] focus:border-[#C86A28] focus:bg-white focus:outline-none transition-all shadow-xs`}
                    />
                    {errors.phone && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                        {errors.phone.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: Email Address */}
                <div>
                  <label className="text-[10.5px] font-bold tracking-wider text-[#2A1E17] uppercase mb-1 block font-sans">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="Enter your email address"
                    className={`h-10 sm:h-[42px] w-full rounded-lg border ${
                      errors.email ? "border-rose-500 bg-rose-50/20" : "border-[#E2D8CC]"
                    } bg-[#FAF8F5]/60 px-3.5 text-xs text-[#2A1E17] placeholder:text-[#A8988B] focus:border-[#C86A28] focus:bg-white focus:outline-none transition-all shadow-xs`}
                  />
                  {errors.email && (
                    <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Row 3: Preferred Date & Preferred Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold tracking-wider text-[#2A1E17] uppercase mb-1 block font-sans">
                      PREFERRED DATE
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        {...register("date")}
                        min={minDate}
                        className={`h-10 sm:h-[42px] w-full rounded-lg border ${
                          errors.date ? "border-rose-500 bg-rose-50/20" : "border-[#E2D8CC]"
                        } bg-[#FAF8F5]/60 px-3.5 pr-10 text-xs text-[#2A1E17] placeholder:text-[#A8988B] focus:border-[#C86A28] focus:bg-white focus:outline-none transition-all shadow-xs cursor-pointer`}
                      />
                      <Calendar className="w-4 h-4 text-[#A8988B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.date && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                        {errors.date.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold tracking-wider text-[#2A1E17] uppercase mb-1 block font-sans">
                      PREFERRED TIME
                    </label>
                    <div className="relative">
                      <select
                        {...register("timeSlot")}
                        className="h-10 sm:h-[42px] w-full appearance-none rounded-lg border border-[#E2D8CC] bg-[#FAF8F5]/60 px-3.5 pr-10 text-xs text-[#2A1E17] focus:border-[#C86A28] focus:bg-white focus:outline-none transition-all shadow-xs cursor-pointer"
                      >
                        {TIME_SLOT_OPTIONS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                      <Clock className="w-4 h-4 text-[#A8988B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 4: Select Store Location */}
                <div>
                  <label className="text-[10.5px] font-bold tracking-wider text-[#2A1E17] uppercase mb-1 block font-sans">
                    SELECT STORE LOCATION
                  </label>
                  <div className="relative">
                    <select
                      {...register("storeLocation")}
                      className="h-10 sm:h-[42px] w-full appearance-none rounded-lg border border-[#E2D8CC] bg-[#FAF8F5]/60 px-3.5 pr-10 text-xs text-[#2A1E17] focus:border-[#C86A28] focus:bg-white focus:outline-none transition-all shadow-xs cursor-pointer"
                    >
                      {STORE_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#A8988B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Row 5: Purpose of Visit */}
                <div>
                  <label className="text-[10.5px] font-bold tracking-wider text-[#2A1E17] uppercase mb-1 block font-sans">
                    PURPOSE OF VISIT
                  </label>
                  <div className="relative">
                    <select
                      {...register("purposeOfVisit")}
                      className="h-10 sm:h-[42px] w-full appearance-none rounded-lg border border-[#E2D8CC] bg-[#FAF8F5]/60 px-3.5 pr-10 text-xs text-[#2A1E17] focus:border-[#C86A28] focus:bg-white focus:outline-none transition-all shadow-xs cursor-pointer"
                    >
                      {PURPOSE_OPTIONS.map((purp) => (
                        <option key={purp} value={purp}>
                          {purp}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#A8988B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Row 6: Additional Message (Optional) */}
                <div>
                  <label className="text-[10.5px] font-bold tracking-wider text-[#2A1E17] uppercase mb-1 block font-sans">
                    ADDITIONAL MESSAGE (OPTIONAL)
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={2.5}
                    placeholder="Tell us more about your requirements"
                    className="w-full rounded-lg border border-[#E2D8CC] bg-[#FAF8F5]/60 p-3 text-xs text-[#2A1E17] placeholder:text-[#A8988B] focus:border-[#C86A28] focus:bg-white focus:outline-none transition-all shadow-xs resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 sm:h-[46px] bg-[#211712] hover:bg-[#C86A28] text-white rounded-lg font-sans font-bold text-xs tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        <span>Book Appointment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {/* Trust Footer */}
                  <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-[#7A6E65]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C86A28] shrink-0" />
                    <span>Your information is secure and confidential.</span>
                  </div>
                </div>

              </form>
            </div>

            {/* ======================================================= */}
            {/* RIGHT COLUMN: SIDEBAR (Span 5)                         */}
            {/* ======================================================= */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Card 1: Why Book an Appointment? */}
              <div className="bg-white rounded-[20px] sm:rounded-[26px] p-5 sm:p-6 shadow-xs border border-[#EBE6DF]">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#2A1E17] text-center mb-4 tracking-tight">
                  Why Book an Appointment?
                </h3>

                <div className="space-y-3.5">
                  {WHY_BOOK_BENEFITS.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FAF3EB] text-[#C86A28] border border-[#E8DCCF]/60 flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-3.5 h-3.5 text-[#C86A28]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#2A1E17] leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#6B5E55] leading-relaxed mt-0.5 font-sans">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Walk-ins are also Welcome! Graphic Card */}
              <div
                onClick={() => {
                  if (onNavigateContact) onNavigateContact();
                }}
                className="relative rounded-[20px] sm:rounded-[26px] overflow-hidden shadow-xs border border-[#EBE6DF] cursor-pointer group transition-all duration-300 hover:shadow-sm"
              >
                <img
                  src="/images/appointment/appointment_walkins.png"
                  alt="Walk-ins are also Welcome! Visit our store at your convenience. Find Our Store"
                  className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-500 ease-out"
                />
              </div>

            </div>

          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 4. BOTTOM STORE CONTACT INFO BAR (Compact Proportions)       */}
      {/* ============================================================ */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EBE6DF] shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:divide-x lg:divide-[#EBE6DF]/70">
            
            {/* Column 1: Visit Our Store */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FAF3EB] text-[#C86A28] border border-[#E8DCCF]/60 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#C86A28]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#2A1E17]">
                  Visit Our Store
                </h4>
                <p className="text-[11px] text-[#6B5E55] leading-relaxed">
                  123, MG Road, Near City Center,<br />
                  Sector 18, Noida,<br />
                  Uttar Pradesh - 201301
                </p>
              </div>
            </div>

            {/* Column 2: Call Us */}
            <div className="flex items-start gap-3 lg:pl-5">
              <div className="w-9 h-9 rounded-full bg-[#FAF3EB] text-[#C86A28] border border-[#E8DCCF]/60 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#C86A28]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#2A1E17]">
                  Call Us
                </h4>
                <p className="text-[11px] text-[#6B5E55] leading-relaxed">
                  <a href="tel:+919876543210" className="hover:text-[#C86A28] transition-colors block">
                    +91 98765 43210
                  </a>
                  <a href="tel:+911204567890" className="hover:text-[#C86A28] transition-colors block">
                    +91 120 4567890
                  </a>
                </p>
              </div>
            </div>

            {/* Column 3: Store Timings */}
            <div className="flex items-start gap-3 lg:pl-5">
              <div className="w-9 h-9 rounded-full bg-[#FAF3EB] text-[#C86A28] border border-[#E8DCCF]/60 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#C86A28]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#2A1E17]">
                  Store Timings
                </h4>
                <p className="text-[11px] text-[#6B5E55] leading-relaxed">
                  Mon - Sat: 10:00 AM - 8:00 PM<br />
                  Sunday: 11:00 AM - 7:00 PM
                </p>
              </div>
            </div>

            {/* Column 4: Email Us */}
            <div className="flex items-start gap-3 lg:pl-5">
              <div className="w-9 h-9 rounded-full bg-[#FAF3EB] text-[#C86A28] border border-[#E8DCCF]/60 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[#C86A28]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#2A1E17]">
                  Email Us
                </h4>
                <p className="text-[11px] text-[#6B5E55] leading-relaxed">
                  <a href="mailto:hello@precisionoptics.in" className="hover:text-[#C86A28] transition-colors block truncate max-w-[170px]">
                    hello@precisionoptics.in
                  </a>
                  <a href="mailto:support@precisionoptics.in" className="hover:text-[#C86A28] transition-colors block truncate max-w-[170px]">
                    support@precisionoptics.in
                  </a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
