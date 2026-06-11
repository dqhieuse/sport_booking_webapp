export const routePaths = {
  home: '/',
  sports: '/sports',
  venues: '/venues',
  venueDetail: '/venues/:venueId',
  courts: '/courts',
  courtDetail: '/courts/:courtId',
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  profile: '/profile',
  bookingHistory: '/bookings',
  bookingCheckout: '/courts/:courtId/checkout',
  bookingNotice: '/bookings/:bookingId/notice',
  vendorDashboard: '/vendor',
  vendorProfile: '/vendor/profile',
  vendorVenues: '/vendor/venues',
  vendorVenueCreate: '/vendor/venues/new',
  vendorVenueEdit: '/vendor/venues/:venueId/edit',
  vendorCourts: '/vendor/courts',
  vendorCourtCreate: '/vendor/courts/new',
  vendorCourtEdit: '/vendor/courts/:courtId/edit',
  vendorImages: '/vendor/images',
  vendorImageCreate: '/vendor/images/new',
  vendorSlots: '/vendor/slots',
  vendorBookings: '/vendor/bookings',
  adminDashboard: '/admin',
  adminProfile: '/admin/profile',
  adminSports: '/admin/sports',
  adminUsers: '/admin/users',
  adminVenues: '/admin/venues',
  adminCourts: '/admin/courts',
  adminBookings: '/admin/bookings',
} as const;

export function getVendorVenueEditPath(venueId: number) {
  return routePaths.vendorVenueEdit.replace(':venueId', String(venueId));
}

export function getVendorCourtEditPath(courtId: number) {
  return routePaths.vendorCourtEdit.replace(':courtId', String(courtId));
}
