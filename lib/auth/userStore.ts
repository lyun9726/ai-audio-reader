/**
 * User Store
 * In-memory user database for demo mode
 * TODO: Replace with real database (PostgreSQL/MongoDB) in production
 */

import crypto from 'crypto'

/**
 * User structure
 */
export interface User {
  id: string
  email: string
  passwordHash: string
  displayName: string
  isAdmin: boolean
  createdAt: number
  updatedAt: number
}

/**
 * User creation input
 */
export interface CreateUserInput {
  email: string
  password: string
  displayName: string
  isAdmin?: boolean
}

/**
 * User store class
 */
class UserStore {
  private users: Map<string, User> = new Map()

  constructor() {
    // Seed demo user
    this.seedDemoUser()
  }

  /**
   * Seed demo user for testing
   */
  private seedDemoUser(): void {
    const demoUser: User = {
      id: 'demo-user',
      email: 'demo@example.com',
      passwordHash: this.hashPassword('demo123'),
      displayName: 'Demo User',
      isAdmin: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.users.set(demoUser.id, demoUser)
  }

  /**
   * Hash password (simple deterministic stub for demo)
   * TODO: Use bcrypt/argon2 in production
   */
  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex')
  }

  /**
   * Verify password
   */
  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash
  }

  /**
   * Create new user
   */
  createUser(input: CreateUserInput): User {
    // Check if email already exists
    const existing = this.findByEmail(input.email)
    if (existing) {
      throw new Error('Email already exists')
    }

    const user: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      email: input.email.toLowerCase(),
      passwordHash: this.hashPassword(input.password),
      displayName: input.displayName,
      isAdmin: input.isAdmin || false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    this.users.set(user.id, user)
    return user
  }

  /**
   * Find user by email
   */
  findByEmail(email: string): User | null {
    const normalizedEmail = email.toLowerCase()
    for (const user of this.users.values()) {
      if (user.email === normalizedEmail) {
        return user
      }
    }
    return null
  }

  /**
   * Find user by ID
   */
  findById(id: string): User | null {
    return this.users.get(id) || null
  }

  /**
   * Update user
   */
  updateUser(id: string, patch: Partial<Omit<User, 'id' | 'createdAt'>>): User {
    const user = this.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    const updated: User = {
      ...user,
      ...patch,
      updatedAt: Date.now(),
    }

    this.users.set(id, updated)
    return updated
  }

  /**
   * Delete user
   */
  deleteUser(id: string): boolean {
    return this.users.delete(id)
  }

  /**
   * List all users (admin only)
   */
  listUsers(): User[] {
    return Array.from(this.users.values())
  }

  /**
   * Get user count
   */
  getUserCount(): number {
    return this.users.size
  }

  /**
   * Get user without sensitive data
   */
  getSafeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...safeUser } = user
    return safeUser
  }
}

// Global instance
let userStore: UserStore | null = null

/**
 * Get or create user store instance
 */
export function getUserStore(): UserStore {
  if (!userStore) {
    userStore = new UserStore()
  }
  return userStore
}

/**
 * Reset user store (for testing)
 */
export function resetUserStore(): void {
  userStore = null
}
