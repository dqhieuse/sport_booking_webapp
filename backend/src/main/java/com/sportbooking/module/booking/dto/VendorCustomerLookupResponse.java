package com.sportbooking.module.booking.dto;

public record VendorCustomerLookupResponse(
        boolean found,
        Long userId,
        String fullName,
        String email,
        String phone
) {
    public static VendorCustomerLookupResponse notFound() {
        return new VendorCustomerLookupResponse(false, null, null, null, null);
    }
}
