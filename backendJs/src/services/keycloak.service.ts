import axios, { AxiosInstance } from 'axios';
import config from '../config/env';
import { logger } from '../config/logger';
import { KeycloakUser } from '../config/keycloak';

export class KeycloakService {
  private adminClient: AxiosInstance;
  private realm: string;
  private clientId: string;
  private clientSecret: string;
  private serverUrl: string;
  private adminToken: string = '';
  private tokenExpiry: number = 0;

  // Rôles définis dans le système
  public static readonly ROLES = {
    ADMIN: 'ADMIN',
    RECEPTIONNISTE: 'RECEPTIONNISTE'
  } as const;

  constructor() {
    this.realm = config.KEYCLOAK_REALM;
    this.clientId = config.KEYCLOAK_CLIENT_ID;
    this.clientSecret = config.KEYCLOAK_CLIENT_SECRET;
    this.serverUrl = config.KEYCLOAK_SERVER_URL;

    this.adminClient = axios.create({
      baseURL: `${this.serverUrl}/admin/realms/${this.realm}`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Obtenir un token d'administration avec cache
  private async getAdminToken(): Promise<string> {
    // Vérifier si le token est encore valide
    if (this.adminToken && Date.now() < this.tokenExpiry) {
      return this.adminToken;
    }

    try {
      const response = await axios.post(
        `${this.serverUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: 'admin-cli',
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (!response.data.access_token) {
        throw new Error('No access token received from Keycloak');
      }
      
      this.adminToken = response.data.access_token!;
      // Mettre à jour l'expiration (soustraire 60 secondes pour la sécurité)
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

      return this.adminToken;
    } catch (error) {
      logger.error('Failed to get admin token:', error);
      throw new Error('Failed to authenticate with Keycloak admin');
    }
  }

  // Obtenir les informations d'un utilisateur par ID
  async getUserById(userId: string): Promise<KeycloakUser | null> {
    try {
      const token = await this.getAdminToken();
      
      const response = await this.adminClient.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const user = response.data;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        roles: [], // Les rôles seront récupérés séparément
        realm: this.realm
      };
    } catch (error) {
      logger.error(`Failed to get user ${userId}:`, error);
      return null;
    }
  }

  // Obtenir les rôles d'un utilisateur
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const token = await this.getAdminToken();
      
      const response = await this.adminClient.get(`/users/${userId}/role-mappings/realm`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.map((role: any) => role.name);
    } catch (error) {
      logger.error(`Failed to get roles for user ${userId}:`, error);
      return [];
    }
  }

  // Créer un utilisateur avec rôle spécifique
  async createUser(userData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: 'ADMIN' | 'RECEPTIONNISTE';
    enabled?: boolean;
  }): Promise<KeycloakUser | null> {
    try {
      const token = await this.getAdminToken();
      
      const userPayload = {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled !== false,
        credentials: [{
          type: 'password',
          value: userData.password,
          temporary: false
        }]
      };

      const response = await this.adminClient.post('/users', userPayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Récupérer l'ID de l'utilisateur créé depuis l'en-tête Location
      const location = response.headers.location;
      const userId = location?.split('/').pop();

      if (userId) {
        // Assigner le rôle à l'utilisateur
        await this.assignRoleToUser(userId, userData.role);
        
        // Récupérer l'utilisateur avec ses rôles
        const user = await this.getUserById(userId);
        if (user) {
          user.roles = [userData.role];
        }
        return user;
      }

      return null;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw new Error('Failed to create user in Keycloak');
    }
  }

  // Créer un administrateur
  async createAdmin(userData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    enabled?: boolean;
  }): Promise<KeycloakUser | null> {
    return this.createUser({ ...userData, role: 'ADMIN' });
  }

  // Créer un réceptionniste
  async createReceptionist(userData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    enabled?: boolean;
  }): Promise<KeycloakUser | null> {
    return this.createUser({ ...userData, role: 'RECEPTIONNISTE' });
  }

  // Mettre à jour un utilisateur
  async updateUser(userId: string, userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    enabled?: boolean;
  }): Promise<boolean> {
    try {
      const token = await this.getAdminToken();
      
      await this.adminClient.put(`/users/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return true;
    } catch (error) {
      logger.error(`Failed to update user ${userId}:`, error);
      return false;
    }
  }

  // Assigner un rôle spécifique à un utilisateur
  async assignRoleToUser(userId: string, role: string): Promise<boolean> {
    try {
      const token = await this.getAdminToken();
      
      // Récupérer le rôle spécifique
      const roleResponse = await this.adminClient.get(`/roles/${role}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const roleData = roleResponse.data;

      // Assigner le rôle
      await this.adminClient.post(`/users/${userId}/role-mappings/realm`, [roleData], {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return true;
    } catch (error) {
      logger.error(`Failed to assign role ${role} to user ${userId}:`, error);
      return false;
    }
  }

  // Assigner des rôles à un utilisateur
  async assignRolesToUser(userId: string, roles: string[]): Promise<boolean> {
    try {
      const token = await this.getAdminToken();
      
      // Récupérer les rôles disponibles
      const rolesResponse = await this.adminClient.get('/roles', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const availableRoles = rolesResponse.data.filter((role: any) => 
        roles.includes(role.name)
      );

      if (availableRoles.length === 0) {
        logger.warn('No valid roles found for assignment');
        return false;
      }

      // Assigner les rôles
      await this.adminClient.post(`/users/${userId}/role-mappings/realm`, availableRoles, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return true;
    } catch (error) {
      logger.error(`Failed to assign roles to user ${userId}:`, error);
      return false;
    }
  }

  // Désactiver un utilisateur
  async disableUser(userId: string): Promise<boolean> {
    try {
      const token = await this.getAdminToken();
      
      await this.adminClient.put(`/users/${userId}`, { enabled: false }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return true;
    } catch (error) {
      logger.error(`Failed to disable user ${userId}:`, error);
      return false;
    }
  }

  // Activer un utilisateur
  async enableUser(userId: string): Promise<boolean> {
    try {
      const token = await this.getAdminToken();
      
      await this.adminClient.put(`/users/${userId}`, { enabled: true }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return true;
    } catch (error) {
      logger.error(`Failed to enable user ${userId}:`, error);
      return false;
    }
  }

  // Lister tous les utilisateurs
  async getAllUsers(limit: number = 100, offset: number = 0): Promise<KeycloakUser[]> {
    try {
      const token = await this.getAdminToken();
      
      const response = await this.adminClient.get(`/users?max=${limit}&first=${offset}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        roles: [],
        realm: this.realm
      }));
    } catch (error) {
      logger.error('Failed to get all users:', error);
      return [];
    }
  }

  // Rechercher des utilisateurs
  async searchUsers(query: string, limit: number = 100): Promise<KeycloakUser[]> {
    try {
      const token = await this.getAdminToken();
      
      const response = await this.adminClient.get(`/users?search=${encodeURIComponent(query)}&max=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        roles: [],
        realm: this.realm
      }));
    } catch (error) {
      logger.error(`Failed to search users with query "${query}":`, error);
      return [];
    }
  }

  // Vérifier la connexion à Keycloak
  async checkConnection(): Promise<boolean> {
    try {
      const token = await this.getAdminToken();
      return !!token;
    } catch (error) {
      logger.error('Keycloak connection check failed:', error);
      return false;
    }
  }
}

export const keycloakService = new KeycloakService();
