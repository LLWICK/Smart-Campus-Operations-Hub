# Smart Campus Hub - Testing Guide

## Prerequisites

1. **Backend running:** `cd API/demo && .\mvnw.cmd spring-boot:run` (http://localhost:8080)
2. **Frontend running:** `cd FRONTEND && npm run dev` (http://localhost:5173)
3. Open **http://localhost:5173** in your browser

---

## MODULE A: Facilities & Assets Catalogue (Member 1)

### Test Case F1: Create a Facility
1. Go to sidebar -> **Manage Facilities** (Admin section)
2. Click **"Add Facility"** button (top right)
3. Fill in:
   - Name: `Computer Lab 01`
   - Type: `Laboratory`
   - Capacity: `40`
   - Location: `Block A, Floor 2`
   - Description: `Fully equipped lab with 40 workstations`
   - Available From: `08:00`
   - Available Until: `18:00`
4. Click **"Create Facility"**
5. **Expected:** Toast "Facility created successfully", facility appears in the table

### Test Case F2: Create Multiple Facility Types
Repeat F1 with these variations:
- **Lecture Hall:** Name=`Main Lecture Hall`, Type=`Lecture Hall`, Capacity=`200`, Location=`Block B, Ground Floor`
- **Meeting Room:** Name=`Board Room`, Type=`Meeting Room`, Capacity=`15`, Location=`Admin Block, Floor 3`
- **Equipment:** Name=`Portable Projector`, Type=`Equipment`, Capacity=`1`, Location=`IT Office`

### Test Case F3: View Facilities Catalogue
1. Go to sidebar -> **Facilities**
2. **Expected:** Grid of facility cards with colored type gradients
   - Labs = purple gradient
   - Lecture Halls = blue gradient
   - Meeting Rooms = green gradient
   - Equipment = amber gradient
3. Each card shows: name, type label, capacity, location, availability hours, ACTIVE badge

### Test Case F4: Search Facilities
1. On Facilities page, type `Lab` in the search bar
2. **Expected:** Only facilities with "Lab" in the name appear
3. Clear search -> all facilities return

### Test Case F5: Filter by Type
1. On Facilities page, click the **"Laboratory"** filter chip
2. **Expected:** Only LAB type facilities shown
3. Click **"All Types"** to reset

### Test Case F6: Filter by Minimum Capacity
1. On Facilities page, enter `50` in the "Min capacity" field
2. **Expected:** Only facilities with capacity >= 50 shown

### Test Case F7: View Facility Detail
1. Click any facility card
2. **Expected:** Detail page shows:
   - Type-colored gradient header with icon
   - Full name, description, type label
   - Capacity, Location, Availability info cards
   - "Book Now" button (if ACTIVE)
   - Today's Availability time-slot grid (green=available, amber=pending, red=booked)
   - Today's Bookings list

### Test Case F8: Edit Facility
1. Go to **Manage Facilities**
2. Click the **pencil icon** on any facility row
3. Change the name or capacity
4. Click **"Update Facility"**
5. **Expected:** Toast "Facility updated successfully", table reflects changes

### Test Case F9: Toggle Facility Status
1. Go to **Manage Facilities**
2. Click the **toggle icon** (green=active, gray=inactive) on a facility
3. **Expected:** Status changes from ACTIVE to OUT_OF_SERVICE (or vice versa)
4. Go to **Facilities** catalogue -> the out-of-service facility should NOT appear (catalogue filters ACTIVE only)

### Test Case F10: Delete Facility
1. Go to **Manage Facilities**
2. Click the **trash icon** on a facility
3. Confirm in the modal
4. **Expected:** Toast "Facility deleted", facility removed from table

### Test Case F11: Validation - Create with Missing Fields
1. Go to **Manage Facilities** -> Add Facility
2. Leave "Name" empty, click "Create Facility"
3. **Expected:** Browser validation prevents submission (required field)

---

## MODULE B: Booking Management (Member 2)

### Test Case B1: Create a Booking
1. Go to sidebar -> **My Bookings**
2. Click **"New Booking"**
3. Step 1 - Select Slot:
   - Select a facility from dropdown
   - **Expected:** Info box shows facility availability hours and capacity
   - Pick a date (today or future)
   - Set start time: `09:00`, end time: `11:00`
   - **Expected:** Time-slot grid appears showing existing bookings
   - Click **"Check Availability & Continue"**
   - **Expected:** Green banner "Time slot is available!"
4. Step 2 - Details:
   - Enter purpose: `Database Systems Tutorial`
   - Enter expected attendees: `30`
   - Click **"Submit Booking Request"**
5. **Expected:** Toast "Booking request submitted successfully!", redirected to My Bookings
6. New booking appears with **PENDING** status badge

### Test Case B2: Booking Conflict Detection
1. Create a booking for `Computer Lab 01` on `2026-03-25`, `09:00-11:00`
2. Try creating ANOTHER booking for the SAME facility, SAME date, overlapping time `10:00-12:00`
3. Click "Check Availability & Continue"
4. **Expected:** Red banner "Time slot has conflicts" with details of the conflicting booking
5. The form should NOT let you proceed to Step 2

### Test Case B3: Booking on Out-of-Service Facility
1. First, go to **Manage Facilities** and toggle a facility to OUT_OF_SERVICE
2. Go to **New Booking** -> that facility should NOT appear in the dropdown (catalogue filters ACTIVE)
3. **Expected:** Out-of-service facilities are not bookable

### Test Case B4: View Booking Detail
1. Go to **My Bookings** -> click any booking card
2. **Expected:** Detail page shows:
   - Status banner (color-coded: amber=pending, green=approved, red=rejected)
   - Facility name, booking ID (clickable to copy)
   - Date, time, attendees, booked by info cards
   - Purpose section
   - Admin response (if approved/rejected)
   - "Cancel Booking" button (if PENDING or APPROVED)
   - "View Facility" link

### Test Case B5: Filter Bookings by Status
1. Go to **My Bookings**
2. Click **"Pending"** filter tab
3. **Expected:** Only PENDING bookings shown
4. Click **"All"** to see everything

### Test Case B6: Cancel a Booking
1. Go to **My Bookings** -> click a PENDING or APPROVED booking
2. Click **"Cancel Booking"** button
3. Confirm in the modal
4. **Expected:** Status changes to CANCELLED, cancel button disappears

### Test Case B7: Admin - Approve a Booking
1. Go to sidebar -> **Manage Bookings** (Admin section)
2. Default filter shows PENDING bookings
3. Click the **green checkmark** icon on a pending booking
4. **Expected:** Toast "Booking approved", booking disappears from PENDING list
5. Switch filter to "Approved" -> booking appears there

### Test Case B8: Admin - Reject a Booking (with reason)
1. Go to **Manage Bookings** -> find a PENDING booking
2. Click the **red X** icon
3. **Expected:** Modal appears asking for rejection reason
4. Type: `Facility under maintenance on this date`
5. Click **"Reject Booking"**
6. **Expected:** Toast "Booking rejected", booking moves to REJECTED status
7. View the booking detail -> admin reason is shown in a red box

### Test Case B9: Admin - Reject without Reason (validation)
1. Go to **Manage Bookings** -> click reject on a booking
2. Leave the reason field empty, click "Reject Booking"
3. **Expected:** Toast error "Please provide a reason for rejection"

### Test Case B10: Booking Time Validation
1. Go to **New Booking**, select a facility
2. Set start time: `14:00`, end time: `12:00` (end before start)
3. Click "Check Availability"
4. **Expected:** Error toast "End time must be after start time"

### Test Case B11: Booking Outside Availability Hours
1. Select a facility with availability `08:00 - 18:00`
2. Set time: `06:00 - 08:00` (before availability)
3. Click "Check Availability"
4. **Expected:** Error "Booking time must be within facility availability hours: 08:00 - 18:00"

### Test Case B12: Attendee Capacity Warning
1. Go to **New Booking**, select a facility with capacity 40
2. In Step 2, enter expected attendees: `50`
3. **Expected:** Amber warning "Exceeds facility capacity of 40" appears below the field

### Test Case B13: Update a Pending Booking
- **API Test (Postman/curl):**
```
PUT http://localhost:8080/api/bookings/{bookingId}
Body: { same fields as create but with changes }
```
- **Expected:** Only works if status is PENDING, returns updated booking

### Test Case B14: Cannot Update Non-Pending Booking
- Approve a booking first, then try to PUT update it
- **Expected:** 400 error "Only PENDING bookings can be updated"

---

## DASHBOARD

### Test Case D1: Dashboard Stats
1. Go to sidebar -> **Dashboard** (home page)
2. **Expected:** 4 stat cards showing:
   - Total Facilities (animated counter)
   - Active Facilities
   - Total Bookings
   - Pending Approvals
3. Numbers should animate from 0 to actual value

### Test Case D2: Recent Bookings
1. Dashboard shows recent bookings list
2. **Expected:** Up to 5 most recent bookings with facility name, date/time, status badge
3. Click any booking -> navigates to booking detail

### Test Case D3: Booking Status Breakdown
1. Right sidebar shows colored progress bars
2. **Expected:** Approved (green), Pending (amber), Rejected (red), Cancelled (gray) counts with bars

### Test Case D4: Quick Actions
1. Click "Browse Facilities" -> goes to Facilities page
2. Click "Quick Book" -> goes to New Booking page
3. Click "Review Pending" -> goes to Manage Bookings page

---

## UI/UX QUALITY CHECKS

### Test Case U1: Responsive Design
1. Resize browser to mobile width (< 768px)
2. **Expected:**
   - Sidebar hides, hamburger menu appears in top left
   - Click hamburger -> sidebar slides in from left with overlay
   - Click overlay -> sidebar closes
   - Cards stack vertically (1 column on mobile)
   - Tables scroll horizontally

### Test Case U2: Loading States
1. Refresh any page (Facilities, Bookings, Dashboard)
2. **Expected:** Skeleton placeholders appear (gray pulsing blocks) instead of blank page
3. Real data replaces skeletons when loaded

### Test Case U3: Empty States
1. Filter bookings to a status with no results (e.g., "Rejected" when none exist)
2. **Expected:** Centered empty state with icon, title, message, and action button

### Test Case U4: Hover Effects
1. Hover over facility cards
2. **Expected:** Card lifts up slightly, shadow increases, title color changes to indigo
3. Hover over booking cards -> similar lift effect
4. Hover over buttons -> color darkens
5. Click buttons -> subtle scale-down press feedback

### Test Case U5: Animations
1. Navigate between pages
2. **Expected:** Content fades in smoothly
3. On Facilities grid -> cards animate in with staggered delay
4. Dashboard stat numbers count up from 0
5. Modals appear with scale-in animation

### Test Case U6: Toast Notifications
1. Create/update/delete anything
2. **Expected:** Dark toast appears in top-right corner for 3 seconds
3. Success = appears after create/update/delete
4. Error = appears on validation failure or API error

### Test Case U7: 404 Page
1. Navigate to `http://localhost:5173/nonexistent`
2. **Expected:** Styled 404 page with "Go Home" and "Go Back" buttons

---

## API ENDPOINT REFERENCE (for Postman testing)

### Facilities
```
GET    http://localhost:8080/api/facilities
GET    http://localhost:8080/api/facilities?type=LAB&status=ACTIVE&minCapacity=20&search=computer
GET    http://localhost:8080/api/facilities/{id}
POST   http://localhost:8080/api/facilities
PUT    http://localhost:8080/api/facilities/{id}
DELETE http://localhost:8080/api/facilities/{id}
PATCH  http://localhost:8080/api/facilities/{id}/status
```

### Bookings
```
GET    http://localhost:8080/api/bookings
GET    http://localhost:8080/api/bookings?status=PENDING&userId=user-001&facilityId={id}&date=2026-03-25
GET    http://localhost:8080/api/bookings/{id}
POST   http://localhost:8080/api/bookings
PUT    http://localhost:8080/api/bookings/{id}
DELETE http://localhost:8080/api/bookings/{id}
PATCH  http://localhost:8080/api/bookings/{id}/approve
PATCH  http://localhost:8080/api/bookings/{id}/reject
GET    http://localhost:8080/api/bookings/check-availability?facilityId={id}&date=2026-03-25&startTime=09:00&endTime=11:00
GET    http://localhost:8080/api/bookings/facility/{facilityId}/date/2026-03-25
```

### Dashboard
```
GET    http://localhost:8080/api/dashboard/stats
```

### Sample POST Body - Create Facility
```json
{
  "name": "Computer Lab 01",
  "type": "LAB",
  "capacity": 40,
  "location": "Block A, Floor 2",
  "description": "Fully equipped computer lab",
  "availabilityStart": "08:00",
  "availabilityEnd": "18:00"
}
```

### Sample POST Body - Create Booking
```json
{
  "facilityId": "<facility-id-from-GET>",
  "userId": "user-001",
  "userName": "Campus User",
  "date": "2026-03-25",
  "startTime": "09:00",
  "endTime": "11:00",
  "purpose": "Software Engineering Lab",
  "expectedAttendees": 35
}
```

### Sample PATCH Body - Reject Booking
```json
{
  "reason": "Facility under maintenance"
}
```

---

## Error Response Format (all errors follow this)
```json
{
  "status": 400,
  "error": "Validation Failed",
  "message": "One or more fields are invalid",
  "fieldErrors": {
    "name": "Facility name is required",
    "capacity": "Capacity must be at least 1"
  },
  "timestamp": "2026-03-22T07:00:00Z"
}
```
