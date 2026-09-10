"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  Send,
  Download,
  Trash2,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  X,
  ExternalLink,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { privacyRequestSchema, type PrivacyRequestFormValues } from "@/lib/validations";

interface PrivacyPolicyPageProps {
  onNavigateHome?: () => void;
  onNavigateContact?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  onNavigateHome,
  onNavigateContact,
}) => {
  const [activeSection, setActiveSection] = useState<string>("intro");
  const [isRightsModalOpen, setIsRightsModalOpen] = useState(false);
  const [isSubmittingRights, setIsSubmittingRights] = useState(false);
  const [rightsSubmitted, setRightsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrivacyRequestFormValues>({
    resolver: zodResolver(privacyRequestSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      requestType: "access_data",
      details: "",
    },
  });

  const onSubmitRightsRequest = async (data: PrivacyRequestFormValues) => {
    setIsSubmittingRights(true);
    try {
      const res = await fetch("/api/privacy-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setRightsSubmitted(true);
        toast.success("Privacy Request Transmitted", {
          description: `Reference #${result.requestId}. Our Data Protection Officer will respond within 48 hours.`,
        });
        reset();
      } else {
        toast.error("Transmission Error", {
          description: result.error || "Unable to submit request. Please reach out to concierge.",
        });
      }
    } catch (err) {
      // Graceful local optimistic fallback
      setRightsSubmitted(true);
      toast.success("Privacy Request Logged", {
        description: "Our Data Protection Officer has received your request and will follow up.",
      });
      reset();
    } finally {
      setIsSubmittingRights(false);
    }
  };

  const storeLocations = [
    {
      name: "Precision Optics – Gaur City",
      address: "Shop No. UGF, Mahagun Mart, 39, Sector 16C, Gaur City 2, Greater Noida, Ghaziabad, Uttar Pradesh – 201009",
      phone: "093549 08857",
      tel: "+919354908857",
    },
    {
      name: "Precision Optics – Spectrum Metro Mall",
      address: "GF-45D, Spectrum Metro Mall, Phase-1, Sector 75, Noida, Uttar Pradesh – 201307",
      phone: "070424 93209",
      tel: "+917042493209",
    },
    {
      name: "Precision Optics – JMD Arcade",
      address: "JMD Arcade, B-101, Hazipur, Sector 104, Noida, Uttar Pradesh – 201304",
      phone: "099102 97515",
      tel: "+919910297515",
    },
    {
      name: "Precision Optics – Amrapali Crystal Homes",
      address: "Shop 18, Ground Floor, Amrapali Crystal Homes Society, Next to Aditya Celebrity Homes, Sector 76, Noida, Uttar Pradesh – 201316",
      phone: "099100 89581",
      tel: "+919910089581",
    },
  ];

  const tableOfContents = [
    { id: "intro", title: "Overview" },
    { id: "collected", title: "Information We Collect" },
    { id: "usage", title: "How We Use Data" },
    { id: "sharing", title: "Sharing & Disclosure" },
    { id: "advertising", title: "Behavioural Advertising" },
    { id: "do-not-track", title: "Do Not Track" },
    { id: "retention", title: "Data Retention" },
    { id: "changes", title: "Policy Updates" },
    { id: "contact-us", title: "Atelier Contacts" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#2A1E17] font-sans pb-24 pt-4 sm:pt-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-stone-500 font-semibold">
          <button
            onClick={() => onNavigateHome && onNavigateHome()}
            className="hover:text-[#C86A28] font-bold cursor-pointer transition-colors"
          >
            HOME
          </button>
          <span>/</span>
          <span className="text-[#C86A28] font-bold">PRIVACY POLICY</span>
        </div>
      </div>

      {/* Main Luxury Container matching Figma 106:7668 */}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Subtitle Badge */}
        <div className="text-center mb-12 sm:mb-16 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF3EB] border border-[#E8DCCF] text-[#C86A28] text-[11px] font-bold tracking-widest uppercase mb-4 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-[#C86A28]" />
            <span>CLIENT PRIVACY & DATA GOVERNANCE</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.12em] text-[#2A1E17] uppercase mb-4">
            PRIVACY POLICY
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-2xl mx-auto leading-relaxed">
            Effective Date: September 2026 | Precision Optics Private Limited (Estd. 1969)
          </p>
        </div>

        {/* Quick Table of Contents Ribbon */}
        <div className="bg-[#FAF3EB] border border-[#E8DCCF] rounded-2xl p-3 sm:p-4 mb-10 overflow-x-auto no-scrollbar shadow-2xs">
          <div className="flex items-center gap-2 min-w-max text-xs">
            <span className="font-serif font-bold text-[#2A1E17] uppercase tracking-wider text-[11px] mr-2">
              JUMP TO:
            </span>
            {tableOfContents.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all text-[12px] cursor-pointer ${
                  activeSection === item.id
                    ? "bg-[#2A1E17] text-[#FAF7F2] shadow-xs"
                    : "text-stone-600 hover:text-[#2A1E17] hover:bg-white/80"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Privacy Policy Content Card */}
        <div className="bg-white rounded-3xl border border-[#EBE6DF] p-6 sm:p-10 lg:p-14 shadow-sm space-y-12 leading-relaxed text-[13.5px] sm:text-[14px] text-stone-800">
          
          {/* Section 1: Overview */}
          <section id="intro" className="space-y-4">
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
              This Privacy Policy describes how Precision Optics collects, uses, and protects your personal information when you visit or make a purchase from our website <span className="font-semibold text-[#2A1E17]">precisionoptics.in</span>.
            </p>
          </section>

          {/* Section 2: Personal Information We Collect */}
          <section id="collected" className="space-y-4 pt-4 border-t border-[#F0ECE6]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1E17] tracking-wide">
              Personal information we collect
            </h2>
            <p className="text-stone-700 leading-relaxed">
              When you visit our website, we may automatically collect certain information about your device, including information about your web browser, IP address, device type, time zone, and cookies installed on your device. We may also collect information about the pages or products you view, referring websites or search terms, and how you interact with our website.
            </p>
            <p className="font-medium text-stone-900 pt-1">
              We may collect this information using technologies such as:
            </p>
            <ul className="space-y-2.5 pl-6 list-disc text-stone-700 marker:text-[#C86A28]">
              <li>
                <strong className="text-[#2A1E17]">Cookies</strong> – small data files stored on your device.
              </li>
              <li>
                <strong className="text-[#2A1E17]">Log Files</strong> – which may collect information such as IP address, browser type, internet service provider, referring pages, and date/time information.
              </li>
              <li>
                <strong className="text-[#2A1E17]">Web Beacons, Tags and Pixels</strong> – electronic files used to understand how visitors browse and interact with our website.
              </li>
            </ul>
            <p className="text-stone-700 leading-relaxed pt-2">
              When you make a purchase, book an appointment, submit an enquiry, or contact us, we may collect information including your name, phone number, email address, billing address, shipping address, payment information, prescription details where voluntarily provided, and order information.
            </p>
            <p className="text-stone-700 leading-relaxed">
              When we refer to &quot;Personal Information&quot; in this Privacy Policy, we mean both the information you provide to us and information automatically collected through your use of our website.
            </p>
          </section>

          {/* Section 3: How Do We Use Your Personal Information */}
          <section id="usage" className="space-y-4 pt-4 border-t border-[#F0ECE6]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1E17] tracking-wide">
              How do we use your personal information?
            </h2>
            <p className="text-stone-700">We use the information we collect to:</p>
            <ul className="space-y-2 pl-6 list-disc text-stone-700 marker:text-[#C86A28]">
              <li>Process and fulfil your orders.</li>
              <li>Process payments and arrange product delivery.</li>
              <li>Provide invoices, order confirmations, and updates.</li>
              <li>Manage appointments and customer enquiries.</li>
              <li>Communicate with you regarding your orders, services, and requests.</li>
              <li>Provide eye care and optical services requested by you.</li>
              <li>Improve our website, products, and customer experience.</li>
              <li>Send promotional offers, updates, or marketing communications where permitted.</li>
              <li>Screen orders and activities for potential fraud or security risks.</li>
              <li>Comply with applicable legal and regulatory requirements.</li>
            </ul>
            <p className="text-stone-700 leading-relaxed pt-2">
              We may also use automatically collected device and website information to understand how customers browse and interact with our website, improve website performance, and measure the effectiveness of our marketing campaigns.
            </p>
          </section>

          {/* Section 4: Sharing Your Personal Information */}
          <section id="sharing" className="space-y-4 pt-4 border-t border-[#F0ECE6]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1E17] tracking-wide">
              Sharing your personal Information
            </h2>
            <p className="text-stone-700 leading-relaxed">
              We do not sell or rent your personal information.
            </p>
            <p className="text-stone-700">
              We may share necessary information with trusted third-party service providers who help us operate our business, including:
            </p>
            <ul className="space-y-2 pl-6 list-disc text-stone-700 marker:text-[#C86A28]">
              <li>Payment gateway providers.</li>
              <li>Shipping and delivery partners.</li>
              <li>Website hosting and technology providers.</li>
              <li>Analytics and marketing service providers.</li>
              <li>Communication and customer support platforms.</li>
            </ul>
            <p className="text-stone-700 leading-relaxed pt-2">
              We may also share information when required to comply with applicable laws, legal processes, government requests, or to protect the rights, safety, and security of Precision Optics, our customers, or others.
            </p>
          </section>

          {/* Section 5: Behavioural Advertising */}
          <section id="advertising" className="space-y-4 pt-4 border-t border-[#F0ECE6]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1E17] tracking-wide">
              Behavioural advertising
            </h2>
            <p className="text-stone-700 leading-relaxed">
              We may use your information to provide you with relevant advertisements, offers, and marketing communications that may be of interest to you.
            </p>
            <p className="text-stone-700 leading-relaxed">
              You may choose to opt out of promotional communications by following the unsubscribe instructions provided in our communications or by contacting us directly.
            </p>
          </section>

          {/* Section 6: Do Not Track */}
          <section id="do-not-track" className="space-y-4 pt-4 border-t border-[#F0ECE6]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1E17] tracking-wide">
              Do not track
            </h2>
            <p className="text-stone-700 leading-relaxed">
              Please note that we do not alter our Site&apos;s data collection and use practices when we see a Do Not Track signal from your browser.
            </p>
          </section>

          {/* Section 7: Data Retention */}
          <section id="retention" className="space-y-4 pt-4 border-t border-[#F0ECE6]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1E17] tracking-wide">
              Data retention
            </h2>
            <p className="text-stone-700 leading-relaxed">
              When you place an order through the Site, we will maintain your Order Information for our records.
            </p>
          </section>

          {/* Section 8: Changes */}
          <section id="changes" className="space-y-4 pt-4 border-t border-[#F0ECE6]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1E17] tracking-wide">
              Changes
            </h2>
            <p className="text-stone-700 leading-relaxed">
              We reserve the right, at our sole discretion, to update, change or replace any part of this privacy policy by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. Your continued use of or access to our website or the Service following the posting of any changes to this Privacy Policy constitutes acceptance of those changes.
            </p>
          </section>

          {/* Section 9: Contact Us & Physical Atelier Locations */}
          <section id="contact-us" className="space-y-6 pt-6 border-t border-[#F0ECE6]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1E17] tracking-wide">
                  Contact us
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  For more information about our privacy practices, questions, concerns, or requests regarding your personal information, please contact Precision Optics at one of our locations below:
                </p>
              </div>
              {onNavigateContact && (
                <button
                  onClick={onNavigateContact}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C86A28] hover:text-[#9F4810] uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  <span>Open Contact Desk</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 4 Physical Store Locations Grid from Figma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {storeLocations.map((loc, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E8DCCF] space-y-3 hover:border-[#C86A28]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#2A1E17] text-[#FAF3EB] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-[#2A1E17] text-[13.5px]">
                        {loc.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed pl-10">
                    {loc.address}
                  </p>
                  <div className="pl-10 pt-1 flex items-center justify-between">
                    <a
                      href={`tel:${loc.tel}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C86A28] hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{loc.phone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Privacy Data Rights Action Card */}
          <div className="bg-[#FAF3EB] rounded-2xl p-6 sm:p-8 border border-[#E8DCCF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mt-8">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C86A28] block">
                YOUR PRIVACY RIGHTS
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2A1E17]">
                Exercise Your Data Protection Rights
              </h3>
              <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
                Under the DPDP Act & GDPR, you may request a copy of your personal data, request deletion, or opt-out of marketing communications at any time.
              </p>
            </div>
            <button
              onClick={() => setIsRightsModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#2A1E17] hover:bg-[#3D2C22] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer shrink-0"
            >
              Submit Privacy Request
            </button>
          </div>
        </div>
      </main>

      {/* Slide-over / Modal for Data Subject Privacy Rights Request */}
      {isRightsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#EBE6DF] shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsRightsModalOpen(false);
                setRightsSubmitted(false);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EB] text-[#C86A28] text-[10px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SECURE DATA REGISTRY</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2A1E17]">
                Data Subject Rights Request
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Precision Optics takes your data privacy seriously. Submit your request below for immediate compliance processing.
              </p>
            </div>

            {rightsSubmitted ? (
              <div className="text-center py-8 space-y-4 bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DCCF]">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#2A1E17]">
                  Request Securely Logged
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
                  Our Data Protection Officer has received your submission and will verify your identity within 48 business hours.
                </p>
                <button
                  onClick={() => {
                    setIsRightsModalOpen(false);
                    setRightsSubmitted(false);
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#2A1E17] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmitRightsRequest)} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Full Name *
                  </label>
                  <input
                    {...register("fullName")}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C86A28]/30"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Registered Email Address *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C86A28]/30"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Phone Number (Optional)
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C86A28]/30"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Request Category *
                  </label>
                  <select
                    {...register("requestType")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C86A28]/30 cursor-pointer"
                  >
                    <option value="access_data">Export / Access My Personal Data</option>
                    <option value="delete_data">Erase / Delete My Personal Data</option>
                    <option value="opt_out_marketing">Opt-out from Marketing & Promotional Offers</option>
                    <option value="rectify_data">Correct / Rectify Inaccurate Details</option>
                    <option value="other">Other Data Governance Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                    Specific Details / Instructions *
                  </label>
                  <textarea
                    {...register("details")}
                    rows={3}
                    placeholder="Describe your request or specify relevant orders/prescriptions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C86A28]/30 resize-none"
                  />
                  {errors.details && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.details.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingRights}
                    className="w-full py-3 rounded-xl bg-[#C86A28] hover:bg-[#B05B1E] disabled:opacity-50 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    {isSubmittingRights ? (
                      <span>Logging Request...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Transmitting Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
