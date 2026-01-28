// Export all email functions
export { 
  sendBookingStartReminderEmail,
  sendBookingPendingReminderEmail, 
  sendBookingCancellationEmail 
} from "./builders/booking-emails"

export { 
  sendSalePendingReminderEmail,
  sendSaleCancellationEmail 
} from "./builders/sale-emails"

export { 
  sendNewBookingEmail,
  sendNewSaleEmail,
  sendNewEquipmentEmail,
  sendEquipmentApprovalEmail,
  sendPricingUpdateRequestEmail,
  sendPasswordResetEmail,
  sendPricingApprovalEmail,
  sendPricingRejectionEmail
} from "./builders/equipment-emails"

// Export types for external use
export type {
  PersonInfo,
  BookingEmailDetails,
  BookingStartReminderDetails,
  BookingCancellationDetails,
  SaleEmailDetails,
  SaleCancellationDetails,
  NewBookingDetails,
  NewSaleDetails,
  NewEquipmentDetails,
  PricingUpdateDetails
} from "./types"