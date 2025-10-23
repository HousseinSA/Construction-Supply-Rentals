# Construction Equipment Rental Platform - Complete Workflow

## System Overview
A multi-equipment rental platform where renters can book multiple equipment items in a single transaction, suppliers can list their equipment, and admins manage the entire process via WhatsApp coordination.

## Core Entities & Relationships

### User Management
- **Users**: `renter` | `supplier` | `admin`
- **Status**: `approved` | `blocked`
- **Authentication**: Email/password with reset tokens
- **Contact**: Phone + WhatsApp for admin coordination

### Equipment Hierarchy
```
Category (hourly/daily/per_km) → Equipment Type → Equipment → Booking Items
```

### Multi-Equipment Booking System
- **Single Booking** can contain **multiple equipment items**
- **Flexible pricing**: hourly, daily, or per-kilometer
- **Automatic calculations**: quantity × rate × usage = subtotal
- **Admin-controlled**: All communication via WhatsApp

## Complete Workflow Process

### 1. Equipment Setup (Suppliers/Admin)
```
Supplier/Admin → Lists Equipment → Sets Pricing (hourly/daily/per_km) → Equipment Available
```
**Equipment States**: `pending` → `approved` (admin creates = auto-approved)

### 2. Renter Booking Process
```
Renter → Browse Equipment → Add Multiple Items → Create Booking Request
```
**Booking Example:**
- CAT 320D Excavator: 2 units × $150/hour × 8 hours = $2,400
- Dump Truck: 1 unit × $300/day × 3 days = $900
- **Total**: $3,300 (auto-calculated)

### 3. Admin Management Process
```
Admin Dashboard → New Booking Alert → Contact Parties via WhatsApp → Coordinate Everything
```
**Admin Actions:**
1. Contacts suppliers via WhatsApp for availability
2. Contacts renter via WhatsApp for confirmation
3. Arranges payment and delivery details
4. Updates booking status: `pending` → `admin_handling`

### 4. Coordination & Delivery
```
Admin → Arranges Payment → Coordinates Delivery → Equipment in Use
```
**Payment Flow:**
- Renter pays admin (cash/mobile money/bank transfer)
- Admin pays suppliers (minus commission)
- All handled offline via WhatsApp

### 5. Return & Completion
```
Equipment Used → Return Arranged → Admin Confirms → Booking Complete
```
**Final Status**: `admin_handling` → `completed`

## Booking Schema Structure

### BookingItem
```typescript
{
  equipmentId: ObjectId,
  supplierId: ObjectId,
  equipmentName: "CAT 320D Excavator",
  quantity: 2,              // How many units
  rate: 150,                // Price from equipment ($/hour)
  usage: 8,                 // Hours/days/km requested
  subtotal: 2400            // quantity × rate × usage
}
```

### Complete Booking
```typescript
{
  renterId: ObjectId,
  bookingItems: [BookingItem[]],  // Multiple equipment
  startDate: Date,
  endDate: Date,
  totalPrice: 3300,               // Sum of all subtotals
  status: "pending",              // pending → admin_handling → completed
  renterMessage: "Need for construction project",
  adminNotes: "Confirmed with both suppliers"
}
```

## System Status Flow
```
pending → admin_handling → completed → cancelled
   ↓           ↓              ↓
New Request → Admin Working → All Done
```

## Implementation Phases

### Phase 1: Core Setup ✓
- [x] Database models defined
- [x] MongoDB connection
- [x] Multi-equipment booking schema
- [x] Usage tracking for equipment

### Phase 2: Authentication & User Management
- [ ] User registration/login
- [ ] Role-based access control
- [ ] Admin user approval system
- [ ] WhatsApp contact integration

### Phase 3: Equipment Management
- [ ] Category/Type management (Admin)
- [ ] Equipment CRUD (Suppliers)
- [ ] Equipment approval system (Admin)
- [ ] Usage tracking (hours/km/year)

### Phase 4: Multi-Equipment Booking System
- [ ] Equipment browsing/filtering
- [ ] Shopping cart functionality
- [ ] Multi-equipment booking creation
- [ ] Automatic price calculations

### Phase 5: Admin Dashboard
- [ ] Booking management interface
- [ ] WhatsApp contact integration
- [ ] Status tracking and updates
- [ ] Commission calculations

### Phase 6: Mobile Optimization
- [ ] Mobile-responsive design
- [ ] WhatsApp deep linking
- [ ] Offline functionality

## API Endpoints Structure

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/reset-password`

### Equipment
- `GET /api/equipment` - Browse available equipment
- `POST /api/equipment` - Create equipment (Supplier/Admin)
- `PUT /api/equipment/:id/approve` - Approve equipment (Admin)

### Bookings
- `POST /api/bookings` - Create multi-equipment booking
- `GET /api/bookings` - List bookings
- `PUT /api/bookings/:id/status` - Update booking status (Admin)

## Key Features

### For Renters
- Browse equipment by category/type/location
- Add multiple equipment to single booking
- See automatic price calculations
- Track booking status
- Direct WhatsApp coordination with admin

### For Suppliers
- List equipment with flexible pricing (hourly/daily/per_km)
- Track equipment usage and condition
- Receive WhatsApp coordination from admin
- Get paid after completion

### For Admins
- Manage all bookings via dashboard
- WhatsApp coordination with all parties
- Handle payments and commissions
- Track platform performance

## Money Flow
```
Renter → Pays Admin → Admin Pays Suppliers (minus commission)
```
**Example:**
- Renter pays admin: $3,300
- Admin keeps commission: $330 (10%)
- Admin pays suppliers: $2,970

## Success Metrics
- Booking completion rate
- Admin response time
- Equipment utilization
- Platform commission revenue
- User satisfaction (WhatsApp coordination)