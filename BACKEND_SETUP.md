# Backend Setup - User Registration System

## Overview
Backend API for managing renter and supplier/partner account registration with NextAuth integration.

## Information Required

### Renter Account
**Required Fields:**
- `firstName` - User's first name
- `lastName` - User's last name  
- `email` - Valid email address
- `password` - Minimum 6 characters
- `phone` - Valid Mauritanian phone number (8 digits starting with 2, 3, or 4)

**Optional Fields:**
- None

### Supplier/Partner Account
**Required Fields:**
- `firstName` - User's first name
- `lastName` - User's last name
- `email` - Valid email address
- `password` - Minimum 6 characters
- `phone` - Valid Mauritanian phone number
- `companyName` - Company/business name
- `location` - Business location/city

**Optional Fields:**
- None

## Files Created/Modified

### 1. Authentication Setup
- **`src/lib/auth.ts`** - NextAuth configuration with credentials provider
- **`src/lib/mongodb-client.ts`** - MongoDB client for NextAuth adapter
- **`src/app/api/auth/[...nextauth]/route.ts`** - NextAuth API handlers (enabled)
- **`global.d.ts`** - NextAuth TypeScript declarations

### 2. Registration API
- **`src/app/api/auth/register/route.ts`** - Registration endpoint with validation

### 3. User Model
- **`src/lib/models/user.ts`** - Added `companyName` field for suppliers

### 4. Frontend Integration
- **`src/components/auth/RegisterForm.tsx`** - Connected to backend API with loading states

## API Endpoint

### POST `/api/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "22345678",
  "userType": "renter" | "supplier",
  "companyName": "ABC Company", // Required for suppliers only
  "location": "Nouakchott" // Required for suppliers only
}
```

**Success Response (201):**
```json
{
  "success": true,
  "userId": "507f1f77bcf86cd799439011",
  "message": "Account created successfully"
}
```

**Error Responses:**
- `400` - Validation error (missing/invalid fields)
- `409` - Email already registered
- `500` - Server error

## Validation Rules

1. **Email**: Must be valid format and unique
2. **Password**: Minimum 6 characters
3. **Phone**: Must match Mauritanian format (8 digits: 2XXXXXXX, 3XXXXXXX, or 4XXXXXXX)
4. **Names**: Cannot be empty, trimmed automatically
5. **Supplier Fields**: `companyName` and `location` required only for suppliers
6. **User Type**: Must be either "renter" or "supplier"

## User Document Structure

```typescript
{
  _id: ObjectId,
  email: string (lowercase, unique),
  username: string (derived from email),
  password: string (bcrypt hashed),
  firstName: string,
  lastName: string,
  phone: string (no spaces),
  location: string (empty for renters),
  userType: "renter" | "supplier",
  role: "user",
  status: "approved",
  companyName?: string (suppliers only),
  createdAt: Date,
  updatedAt: Date
}

## Security Features

- Password hashing with bcryptjs (12 rounds)
- Email uniqueness check
- Input sanitization (trim, lowercase email)
- Validation before database operations
- Secure session management with JWT

## NextAuth Configuration

- **Provider**: Credentials (email/password)
- **Session**: JWT strategy (30 days)
- **Adapter**: MongoDB adapter
- **Custom Fields**: role, userType, status included in session

## Next Steps

1. Install bcryptjs if not installed: `npm install bcryptjs @types/bcryptjs`
2. Set `NEXTAUTH_SECRET` in `.env.local`
3. Test registration flow
4. Implement login functionality
5. Add user dashboards based on role
