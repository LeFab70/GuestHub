import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import config from '../config/env';
import { CreateUserRequest, LoginRequest, LoginResponse, AuthUser } from '../types';
import { User } from '@prisma/client';

export class AuthService {
  // Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.BCRYPT_ROUNDS);
  }

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  generateAccessToken(user: AuthUser): string {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles
    };
    
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN } as any);
  }

  // Generate refresh token
  generateRefreshToken(user: AuthUser): string {
    const payload = { id: user.id };
    
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRES_IN } as any);
  }

  // Verify JWT token
  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      logger.error('JWT verification failed:', error);
      return null;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, config.JWT_REFRESH_SECRET);
    } catch (error) {
      logger.error('Refresh token verification failed:', error);
      return null;
    }
  }

  // Register new user
  async register(userData: CreateUserRequest): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { login: userData.login }
          ]
        }
      });

      if (existingUser) {
        throw new Error('User with this email or login already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return user;
    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  // Login user
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: loginData.email }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Create auth user object
      const authUser: AuthUser = {
        id: user.id,
        username: user.login,
        email: user.email,
        firstName: user.prenom,
        lastName: user.nom,
        roles: [user.role]
      };

      // Generate tokens
      const accessToken = this.generateAccessToken(authUser);
      const refreshToken = this.generateRefreshToken(authUser);

      // Calculate expiration time
      const expiresIn = this.getTokenExpirationTime(config.JWT_EXPIRES_IN);

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return {
        user: authUser,
        accessToken,
        refreshToken,
        expiresIn
      };
    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);
      if (!decoded) {
        throw new Error('Invalid refresh token');
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or deactivated');
      }

      // Create auth user object
      const authUser: AuthUser = {
        id: user.id,
        username: user.login,
        email: user.email,
        firstName: user.prenom,
        lastName: user.nom,
        roles: [user.role]
      };

      // Generate new access token
      const accessToken = this.generateAccessToken(authUser);
      const expiresIn = this.getTokenExpirationTime(config.JWT_EXPIRES_IN);

      logger.info('Token refreshed successfully', { userId: user.id });

      return { accessToken, expiresIn };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      logger.info('Password changed successfully', { userId });
    } catch (error) {
      logger.error('Password change failed:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      return user;
    } catch (error) {
      logger.error('Get user by ID failed:', error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      return user;
    } catch (error) {
      logger.error('Get user by email failed:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      logger.info('User profile updated successfully', { userId });

      return user;
    } catch (error) {
      logger.error('Profile update failed:', error);
      throw error;
    }
  }

  // Deactivate user
  async deactivateUser(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      });

      logger.info('User deactivated successfully', { userId });
    } catch (error) {
      logger.error('User deactivation failed:', error);
      throw error;
    }
  }

  // Activate user
  async activateUser(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true }
      });

      logger.info('User activated successfully', { userId });
    } catch (error) {
      logger.error('User activation failed:', error);
      throw error;
    }
  }

  // Helper method to get token expiration time in seconds
  private getTokenExpirationTime(expiresIn: string): number {
    const timeValue = parseInt(expiresIn);
    const timeUnit = expiresIn.slice(-1);

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'd':
        return timeValue * 24 * 60 * 60;
      default:
        return 24 * 60 * 60; // Default to 24 hours
    }
  }
}

export const authService = new AuthService();
