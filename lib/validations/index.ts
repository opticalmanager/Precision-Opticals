import { z } from "zod";

/**
 * Zod validation schema for Checkout & Shipping
 */
export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .min(10, "Please enter a valid 10-digit mobile number")
    .regex(/^[0-9+\s-]{10,15}$/, "Invalid phone format"),
  email: z.string().email("Please enter a valid email address"),
  streetAddress: z.string().min(5, "Please enter complete street address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z
    .string()
    .length(6, "Indian Pincode must be exactly 6 digits")
    .regex(/^[0-9]{6}$/, "Pincode must contain only numbers"),
  paymentMethod: z.enum(["upi", "card", "netbanking", "cod"]),
  upiId: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

/**
 * Zod validation schema for Eye Test Appointments
 */
export const appointmentSchema = z.object({
  fullName: z.string().min(2, "Patient full name is required"),
  phone: z
    .string()
    .min(10, "Please enter a valid 10-digit mobile number")
    .regex(/^[0-9+\s-]{10,15}$/, "Invalid phone format"),
  email: z.string().email("Please enter a valid email address"),
  service: z.string().min(1, "Please select an optical service"),
  type: z.enum(["in-store", "home"]),
  storeLocation: z.string().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
  date: z.string().min(1, "Preferred date is required"),
  timeSlot: z.string().min(1, "Please select a time slot"),
}).refine(
  (data) => {
    if (data.type === "home") {
      return !!data.address && !!data.pincode && data.pincode.length === 6;
    }
    return true;
  },
  {
    message: "Doorstep address and 6-digit pincode are required for home eye test",
    path: ["address"],
  }
);

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;

/**
 * Zod validation schema for Contact Us Concierge Messages
 */
export const contactSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Inquiry message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

/**
 * Zod validation schema for Prescription Data
 */
export const prescriptionSchema = z.object({
  rightEye: z.object({
    sph: z.string().default("0.00"),
    cyl: z.string().default("0.00"),
    axis: z.string().default("0"),
    add: z.string().default("0.00"),
  }),
  leftEye: z.object({
    sph: z.string().default("0.00"),
    cyl: z.string().default("0.00"),
    axis: z.string().default("0"),
    add: z.string().default("0.00"),
  }),
  pd: z.string().min(2, "Pupillary distance is required"),
  fileName: z.string().optional(),
  notes: z.string().optional(),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;
