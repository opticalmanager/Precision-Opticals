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
  Glasses,
  ChevronRight,
  User,
  Phone,
  Mail,
  SlidersHorizontal,
  Eye,
  Shield,
} from "lucide-react";
import { appointmentSchema, type AppointmentFormValues } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AppointmentPageProps {
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onNavigateContact?: () => void;
}

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

const WHY_CHOOSE_US = [
  {
    icon: Eye,
    title: "12-Step Zero-Error Protocol",
    description: "Industry-leading clinical eye examination with auto-refractometry and digital centeration.",
  },
  {
    icon: Glasses,
    title: "100+ Luxury Frames for Trial",
    description: "Try designer frames from Cartier, Tom Ford, Lindberg, and more during your visit.",
  },
  {
    icon: Shield,
    title: "100% Free Consultation",
    description: "No purchase obligation. Expert guidance from senior optometrists at zero cost.",
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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("11:30 AM - 01:00 PM");

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
      notes: "",
    },
  });

  // Compute minimum date (today)
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
        body: JSON.stringify({ ...data, id: newBookingId }),
      });

      const result = await res.json();

      setBookingId(result.bookingId || newBookingId);
      setSubmitted(true);
      toast.success("Appointment Reserved!", {
        description: `Reference: ${result.bookingId || newBookingId}. Our coordinator will confirm shortly.`,
      });
    } catch {
      setBookingId(newBookingId);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeSlotSelect = (slot: string) => {
    setSelectedTimeSlot(slot);
    setValue("timeSlot", slot);
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#2A1E17] font-sans animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* SECTION 1: DARK HERO BANNER (from Figma image 1)            */}
      {/* ============================================================ */}
      <section className="relative w-full bg-[#1C1917] overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[180px] sm:min-h-[220px] lg:min-h-[260px]">
            {/* Left Text Content */}
            <div className="py-8 sm:py-12 lg:py-16 max-w-lg relative z-10">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs text-stone-400 mb-4">
                <button
                  onClick={onNavigateHome}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
                <ChevronRight className="w-3 h-3 text-stone-600" />
                <span className="text-stone-300">Appointment</span>
              </nav>

              {/* Main Heading */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-white leading-tight tracking-tight">
                Book an{" "}
                <span className="text-[#C86A28]">Appointment</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-3 text-sm sm:text-base text-stone-400 font-sans leading-relaxed max-w-md">
                Personalized eyewear consultation with our experts.
              </p>
            </div>

            {/* Right Hero Image */}
            <div className="hidden md:block relative w-[360px] lg:w-[440px] xl:w-[500px] h-[220px] lg:h-[260px] shrink-0">
              <img
                src="/images/appointment-hero-banner.png"
                alt="Luxury eyewear on display"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Gradient blend into dark bg */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1C1917] via-[#1C1917]/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: MAIN FORM + SIDE INFO                            */}
      {/* ============================================================ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {submitted ? (
          /* ---- SUCCESS STATE ---- */
          <div className="max-w-xl mx-auto bg-white border border-[#E8DCCF] p-8 sm:p-10 shadow-lg text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-stone-900">
              Appointment Reserved!
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
              Your clinical eye examination has been scheduled under reference:{" "}
              <strong className="font-mono text-[#C85A1B]">{bookingId}</strong>.
              Our senior clinic coordinator will call to confirm your appointment.
            </p>
            <div className="flex items-center justify-center gap-3 text-xs text-stone-500 pt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C85A1B]" />
                {watch("date") || "Selected Date"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C85A1B]" />
                {watch("timeSlot") || "Selected Slot"}
              </span>
            </div>
            <div className="pt-4 flex gap-3 justify-center flex-wrap">
              <Button onClick={onNavigateShop} variant="primary" className="py-3 px-6 h-auto">
                Explore Eyewear Catalog
              </Button>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="py-3 px-6 h-auto">
                Book Another
              </Button>
            </div>
          </div>
        ) : (
          /* ---- FORM STATE ---- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Form (Span 7) */}
            <div className="lg:col-span-7 bg-white border border-[#E8DCCF] p-5 sm:p-7 shadow-xs space-y-6">
              {/* Form Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DCCF]">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917] uppercase tracking-tight">
                    Schedule Your Visit
                  </h2>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Fill in your details to book a complimentary eye examination
                  </p>
                </div>
                <span className="hidden sm:inline-block text-[10px] font-bold text-[#C85A1B] bg-orange-50 border border-orange-200/80 px-2.5 py-1 uppercase tracking-wider">
                  Complimentary
                </span>
              </div>

              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 text-xs font-sans">
                {/* Personal Details */}
                <div>
                  <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C85A1B]" />
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold uppercase text-stone-700 mb-1 text-[11px]">Full Name *</label>
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
                      <label className="block font-bold uppercase text-stone-700 mb-1 text-[11px]">Mobile Phone *</label>
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
                      <label className="block font-bold uppercase text-stone-700 mb-1 text-[11px]">Email Address *</label>
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
                  </div>
                </div>

                {/* Service & Location */}
                <div>
                  <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#C85A1B]" />
                    Service & Location
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block font-bold uppercase text-stone-700 mb-1 text-[11px]">Clinical Service *</label>
                      <select
                        {...register("service")}
                        className="w-full bg-[#FAF7F2] border border-[#D5C2B1] p-2.5 text-xs focus:outline-none focus:border-[#C85A1B] cursor-pointer transition-colors"
                      >
                        {APPOINTMENT_SERVICES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold uppercase text-stone-700 mb-1 text-[11px]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C85A1B]" />
                          Select Precision Boutique *
                        </span>
                      </label>
                      <select
                        {...register("storeLocation")}
                        className="w-full bg-[#FAF7F2] border border-[#D5C2B1] p-2.5 text-xs focus:outline-none focus:border-[#C85A1B] cursor-pointer transition-colors"
                      >
                        {STORES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div>
                  <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C85A1B]" />
                    Date & Time
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold uppercase text-stone-700 mb-1 text-[11px]">Preferred Date *</label>
                      <Input
                        type="date"
                        {...register("date")}
                        min={minDate}
                        className={errors.date ? "border-rose-500 bg-rose-50/20" : ""}
                      />
                      {errors.date && (
                        <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                          {errors.date.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-stone-700 mb-2 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#C85A1B]" />
                          Select Time Slot *
                        </span>
                      </label>
                      {/* Hidden select for form validation */}
                      <select
                        {...register("timeSlot")}
                        className="sr-only"
                        tabIndex={-1}
                        value={selectedTimeSlot}
                        onChange={() => {}}
                      >
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>

                      {/* Visual Time Slot Pill Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleTimeSlotSelect(slot)}
                            className={`py-2.5 px-3 text-[11px] font-bold text-center border transition-all cursor-pointer ${
                              selectedTimeSlot === slot
                                ? "bg-[#2A1E17] text-white border-[#2A1E17] shadow-sm"
                                : "bg-[#FAF7F2] text-stone-700 border-[#E8DCCF] hover:border-[#C85A1B] hover:text-[#C85A1B]"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block font-bold uppercase text-stone-700 mb-1 text-[11px]">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    {...register("notes")}
                    placeholder="Any specific requirements, previous prescriptions, or concerns..."
                    rows={3}
                    className="w-full bg-[#FAF7F2] border border-[#D5C2B1] px-3 py-2.5 text-xs font-sans text-[#2A1E17] placeholder:text-stone-400 focus:outline-none focus:border-[#C85A1B] focus:ring-1 focus:ring-[#C85A1B] transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full py-4 text-xs tracking-widest shadow-lg h-auto"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        <span>Confirm Appointment</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-stone-500 text-center mt-2">
                    By booking, you agree to receive appointment confirmation via SMS and email.
                  </p>
                </div>
              </form>
            </div>

            {/* Right Column: Info Sidebar (Span 5) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Store Image Card */}
              <div className="bg-white border border-[#E8DCCF] overflow-hidden shadow-xs">
                <img
                  src="/images/store_1_precision_optics_1785155972710.jpg"
                  alt="Precision Optics Boutique"
                  className="w-full h-48 sm:h-52 object-cover"
                />
                <div className="p-5 sm:p-6 space-y-3">
                  <span className="text-[10px] font-bold text-[#C85A1B] uppercase tracking-widest font-serif">
                    Our Promise
                  </span>
                  <h3 className="font-serif font-bold text-base sm:text-lg uppercase text-[#1C1917] leading-tight">
                    12-Step Zero-Error Clinical Protocol
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Our master opticians employ auto-refractometry, pupil distance digital centeration, dry eye tear film evaluation, and 3D progressive corridor alignment.
                  </p>
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="bg-white border border-[#E8DCCF] p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="font-serif text-sm font-bold uppercase text-[#1C1917] tracking-wider">
                  Why Choose Precision Optics
                </h3>
                <div className="space-y-3">
                  {WHY_CHOOSE_US.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-[#C85A1B]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">{item.title}</h4>
                        <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-[#2A1E17] text-white p-5 sm:p-6 shadow-xs space-y-3">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider">
                  Need Help Scheduling?
                </h3>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Our concierge team is available to help you find the perfect time and location.
                </p>
                <div className="space-y-2 pt-1">
                  <a
                    href="tel:+919810012345"
                    className="flex items-center gap-2 text-xs text-stone-200 hover:text-[#C86A28] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C86A28]" />
                    +91 98100 12345
                  </a>
                  <a
                    href="mailto:appointments@precisionoptics.in"
                    className="flex items-center gap-2 text-xs text-stone-200 hover:text-[#C86A28] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#C86A28]" />
                    appointments@precisionoptics.in
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: WALK-INS WELCOME BANNER (from Figma image 2)     */}
      {/* ============================================================ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="relative bg-[#F0E6DA] overflow-hidden rounded-2xl">
          <div className="flex items-center">
            {/* Left Content */}
            <div className="flex-1 py-10 sm:py-14 lg:py-16 pl-8 sm:pl-12 lg:pl-16 pr-4 relative z-10">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2A1E17] leading-tight">
                Walk-ins are also{" "}
                <br className="hidden sm:block" />
                Welcome!
              </h2>
              <p className="mt-3 text-sm sm:text-base text-stone-600 max-w-sm leading-relaxed">
                Visit our store at your convenience.
              </p>
              <button
                onClick={() => {
                  if (onNavigateContact) {
                    onNavigateContact();
                  }
                }}
                className="mt-6 bg-[#2A1E17] hover:bg-[#C85A1B] text-white font-serif text-sm font-bold px-6 py-3 inline-flex items-center gap-2.5 transition-colors cursor-pointer shadow-md rounded-lg"
              >
                <span>Find Our Store</span>
                <MapPin className="w-4 h-4" />
              </button>
            </div>

            {/* Right Image */}
            <div className="hidden sm:block relative w-[280px] md:w-[360px] lg:w-[440px] h-[280px] sm:h-[300px] lg:h-[340px] shrink-0">
              <img
                src="/images/appointment-walkins-banner.png"
                alt="Walk-ins welcome - eyewear on display"
                className="absolute inset-0 w-full h-full object-cover object-left"
              />
              {/* Gradient blend into beige bg */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#F0E6DA] via-transparent to-transparent w-1/3" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
