import { ObjectId } from "mongodb"
import { UserRole, UserType, UserStatus } from "../types"

export interface User {
  _id?: ObjectId
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
  phone: string
  location: string
  userType?: UserType
  role: UserRole
  status: UserStatus
  companyName?: string
  createdAt: Date
  updatedAt: Date
}

export interface PasswordReset {
  _id?: ObjectId
  userId: ObjectId
  resetToken: string
  expiresAt: Date
  isUsed: boolean
  createdAt: Date
}
