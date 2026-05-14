# Sport Booking WebApp - Project Brief

## 1. Project Name

**Sport Booking WebApp**

## 2. Short Description

Sport Booking WebApp is an online sports court booking system. Users can search for courts by sport, view court information, check available time slots, and create bookings.

## 3. Problem Statement

Sports court booking is often handled through phone calls, messages, or direct visits. This creates several problems:

- Users do not know clearly whether a court is available.
- Venue staff have to manage bookings manually.
- Double booking can happen if availability is not checked carefully.
- Users do not have one central place to view court information, prices, and booking history.

## 4. Project Goals

- Build a web application that allows users to book sports courts.
- Build a REST API backend with Spring Boot.
- Build a frontend application with ReactJS.
- Store data in PostgreSQL database.
- Support registration, login, and basic authorization.
- Support court booking, booking cancellation, and booking management.

## 5. Target Users

### User

A person who wants to search for and book sports courts.

Main features:

- Register and log in.
- View the list of sports.
- View the list of courts.
- View court details.
- Book a court by date and time slot.
- View booking history.
- Cancel a booking if allowed.
- Search for courts by sport, date, and time slot.

### Admin

A person who manages the system.

Main features:

- Manage sports.
- Manage venues.
- Manage courts.
- Manage bookings.
- Confirm or cancel bookings.
- Statistics and reports.

## 6. MVP Scope

The MVP focuses on the core features:

- Authentication: register and log in with JWT.
- Public browsing: view sports, venues, courts, and court details.
- Booking: book a court by date and time slot.
- User dashboard: view personal booking history.
- Admin dashboard: manage core system data.

## 7. Out of MVP Scope

The following features will be considered later:

- Real online payment.
- Map integration.
- Chat with venue owners.
- Court reviews and comments.
- Discount codes.
- Mobile application.
- Multi-owner venue management.

## 8. Tech Stack

### Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- Hibernate

### Frontend

- ReactJS
- React Router
- Axios
- Tailwind CSS

### Database

- PostgreSQL

### Development Tools

- IntelliJ IDEA
- Antigravity
- Postman
- Git/GitHub

## 9. Expected Outcome

When completed, the project should have:

- A backend with a clear Module-Driven Architecture.
- A frontend that calls real backend APIs.
- A database with clear relationships.
- A working court booking flow.
- Basic admin data management.
- A README with setup and running instructions.
- A local demo or deployed demo version.
