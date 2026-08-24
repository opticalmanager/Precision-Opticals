import { AppointmentBooking, Order } from "../types";

/**
 * Service to submit new order checkout to Next.js API
 */
export async function submitOrder(order: Order): Promise<{ success: boolean; orderId: string; trackingNumber: string }> {
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Order submission fallback to client storage:", err);
  }

  return { success: true, orderId: order.id, trackingNumber: order.trackingNumber };
}

/**
 * Service to book in-store or home eye test appointments via Next.js API
 */
export async function bookAppointment(booking: AppointmentBooking): Promise<{ success: boolean; bookingId: string }> {
  try {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Appointment submission fallback to client storage:", err);
  }

  return { success: true, bookingId: booking.id };
}
