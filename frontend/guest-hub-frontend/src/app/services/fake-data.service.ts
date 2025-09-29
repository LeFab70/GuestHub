import { Injectable } from '@angular/core';
import { User, UserRole } from '../models/user.model';
import { Guest, IdType } from '../models/guest.model';
import { Visit, VisitStatus } from '../models/visit.model';

@Injectable({
  providedIn: 'root'
})
export class FakeDataService {
  
  // Fake Users Data
  private users: User[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phoneNumber: '+1234567890',
      department: 'IT',
      position: 'Software Engineer',
      userRole: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      phoneNumber: '+1234567891',
      department: 'HR',
      position: 'HR Manager',
      userRole: UserRole.MANAGER,
      isActive: true,
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@company.com',
      phoneNumber: '+1234567892',
      department: 'Reception',
      position: 'Receptionist',
      userRole: UserRole.RECEPTIONIST,
      isActive: true,
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17')
    },
    {
      id: 4,
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@company.com',
      phoneNumber: '+1234567893',
      department: 'Marketing',
      position: 'Marketing Specialist',
      userRole: UserRole.EMPLOYEE,
      isActive: true,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@company.com',
      phoneNumber: '+1234567894',
      department: 'Finance',
      position: 'Financial Analyst',
      userRole: UserRole.EMPLOYEE,
      isActive: false,
      createdAt: new Date('2024-01-19'),
      updatedAt: new Date('2024-01-19')
    }
  ];

  // Fake Guests Data
  private guests: Guest[] = [
    {
      id: 1,
      firstName: 'Alice',
      lastName: 'Cooper',
      email: 'alice.cooper@external.com',
      phoneNumber: '+1987654321',
      company: 'Tech Solutions Inc.',
      position: 'CEO',
      idNumber: 'P123456789',
      idType: IdType.PASSPORT,
      isBlacklisted: false,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 2,
      firstName: 'Bob',
      lastName: 'Marley',
      email: 'bob.marley@consulting.com',
      phoneNumber: '+1987654322',
      company: 'Business Consulting Ltd.',
      position: 'Senior Consultant',
      idNumber: 'D987654321',
      idType: IdType.DRIVER_LICENSE,
      isBlacklisted: false,
      createdAt: new Date('2024-01-21'),
      updatedAt: new Date('2024-01-21')
    },
    {
      id: 3,
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol.davis@partners.com',
      phoneNumber: '+1987654323',
      company: 'Strategic Partners',
      position: 'Business Development Manager',
      idNumber: 'N456789123',
      idType: IdType.NATIONAL_ID,
      isBlacklisted: false,
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-01-22')
    },
    {
      id: 4,
      firstName: 'Daniel',
      lastName: 'White',
      email: 'daniel.white@vendor.com',
      phoneNumber: '+1987654324',
      company: 'Supply Chain Solutions',
      position: 'Vendor Relations Manager',
      idNumber: 'O789123456',
      idType: IdType.OTHER,
      isBlacklisted: true,
      createdAt: new Date('2024-01-23'),
      updatedAt: new Date('2024-01-23')
    },
    {
      id: 5,
      firstName: 'Emma',
      lastName: 'Taylor',
      email: 'emma.taylor@client.com',
      phoneNumber: '+1987654325',
      company: 'Global Enterprises',
      position: 'Project Manager',
      idNumber: 'P987654321',
      idType: IdType.PASSPORT,
      isBlacklisted: false,
      createdAt: new Date('2024-01-24'),
      updatedAt: new Date('2024-01-24')
    }
  ];

  // Fake Visits Data
  private visits: Visit[] = [
    {
      id: 1,
      visitDate: new Date('2024-02-01T09:00:00'),
      expectedDuration: 60,
      actualDuration: 55,
      visitStatus: VisitStatus.COMPLETED,
      purpose: 'Business meeting to discuss partnership opportunities',
      notes: 'Very productive meeting, follow-up scheduled',
      checkInTime: new Date('2024-02-01T09:05:00'),
      checkOutTime: new Date('2024-02-01T10:00:00'),
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-02-01T10:00:00'),
      guestId: 1,
      guestName: 'Alice Cooper',
      hostId: 2,
      hostName: 'Jane Smith',
      createdById: 3,
      createdByName: 'Mike Johnson'
    },
    {
      id: 2,
      visitDate: new Date('2024-02-02T14:00:00'),
      expectedDuration: 90,
      actualDuration: 85,
      visitStatus: VisitStatus.COMPLETED,
      purpose: 'Technical consultation and system review',
      notes: 'Client satisfied with the presentation',
      checkInTime: new Date('2024-02-02T14:02:00'),
      checkOutTime: new Date('2024-02-02T15:27:00'),
      createdAt: new Date('2024-01-26'),
      updatedAt: new Date('2024-02-02T15:27:00'),
      guestId: 2,
      guestName: 'Bob Marley',
      hostId: 1,
      hostName: 'John Doe',
      createdById: 3,
      createdByName: 'Mike Johnson'
    },
    {
      id: 3,
      visitDate: new Date('2024-02-03T10:30:00'),
      expectedDuration: 45,
      actualDuration: undefined,
      visitStatus: VisitStatus.IN_PROGRESS,
      purpose: 'Contract negotiation meeting',
      notes: 'Currently in progress',
      checkInTime: new Date('2024-02-03T10:35:00'),
      checkOutTime: undefined,
      createdAt: new Date('2024-01-27'),
      updatedAt: new Date('2024-02-03T10:35:00'),
      guestId: 3,
      guestName: 'Carol Davis',
      hostId: 2,
      hostName: 'Jane Smith',
      createdById: 3,
      createdByName: 'Mike Johnson'
    },
    {
      id: 4,
      visitDate: new Date('2024-02-04T11:00:00'),
      expectedDuration: 30,
      actualDuration: undefined,
      visitStatus: VisitStatus.SCHEDULED,
      purpose: 'Product demonstration',
      notes: 'Scheduled for next week',
      checkInTime: undefined,
      checkOutTime: undefined,
      createdAt: new Date('2024-01-28'),
      updatedAt: new Date('2024-01-28'),
      guestId: 5,
      guestName: 'Emma Taylor',
      hostId: 4,
      hostName: 'Sarah Wilson',
      createdById: 3,
      createdByName: 'Mike Johnson'
    },
    {
      id: 5,
      visitDate: new Date('2024-01-30T15:00:00'),
      expectedDuration: 60,
      actualDuration: undefined,
      visitStatus: VisitStatus.NO_SHOW,
      purpose: 'Quarterly review meeting',
      notes: 'Guest did not show up, no prior notice',
      checkInTime: undefined,
      checkOutTime: undefined,
      createdAt: new Date('2024-01-29'),
      updatedAt: new Date('2024-01-30T16:00:00'),
      guestId: 4,
      guestName: 'Daniel White',
      hostId: 1,
      hostName: 'John Doe',
      createdById: 3,
      createdByName: 'Mike Johnson'
    }
  ];

  // User methods
  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  getUsersByRole(role: UserRole): User[] {
    return this.users.filter(user => user.userRole === role);
  }

  getUsersByDepartment(department: string): User[] {
    return this.users.filter(user => user.department === department);
  }

  getActiveUsers(): User[] {
    return this.users.filter(user => user.isActive);
  }

  searchUsers(name: string): User[] {
    const searchTerm = name.toLowerCase();
    return this.users.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm)
    );
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: Math.max(...this.users.map(u => u.id || 0)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: number, updates: Partial<User>): User | undefined {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date() };
      return this.users[index];
    }
    return undefined;
  }

  deleteUser(id: number): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  // Guest methods
  getGuests(): Guest[] {
    return [...this.guests];
  }

  getGuestById(id: number): Guest | undefined {
    return this.guests.find(guest => guest.id === id);
  }

  getGuestByEmail(email: string): Guest | undefined {
    return this.guests.find(guest => guest.email === email);
  }

  getGuestsByCompany(company: string): Guest[] {
    return this.guests.filter(guest => guest.company === company);
  }

  getBlacklistedGuests(): Guest[] {
    return this.guests.filter(guest => guest.isBlacklisted);
  }

  getNotBlacklistedGuests(): Guest[] {
    return this.guests.filter(guest => !guest.isBlacklisted);
  }

  searchGuests(name: string): Guest[] {
    const searchTerm = name.toLowerCase();
    return this.guests.filter(guest => 
      guest.firstName.toLowerCase().includes(searchTerm) ||
      guest.lastName.toLowerCase().includes(searchTerm)
    );
  }

  getGuestByIdNumber(idNumber: string): Guest | undefined {
    return this.guests.find(guest => guest.idNumber === idNumber);
  }

  createGuest(guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>): Guest {
    const newGuest: Guest = {
      ...guest,
      id: Math.max(...this.guests.map(g => g.id || 0)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.guests.push(newGuest);
    return newGuest;
  }

  updateGuest(id: number, updates: Partial<Guest>): Guest | undefined {
    const index = this.guests.findIndex(guest => guest.id === id);
    if (index !== -1) {
      this.guests[index] = { ...this.guests[index], ...updates, updatedAt: new Date() };
      return this.guests[index];
    }
    return undefined;
  }

  deleteGuest(id: number): boolean {
    const index = this.guests.findIndex(guest => guest.id === id);
    if (index !== -1) {
      this.guests.splice(index, 1);
      return true;
    }
    return false;
  }

  // Visit methods
  getVisits(): Visit[] {
    return [...this.visits];
  }

  getVisitById(id: number): Visit | undefined {
    return this.visits.find(visit => visit.id === id);
  }

  getVisitsByGuest(guestId: number): Visit[] {
    return this.visits.filter(visit => visit.guestId === guestId);
  }

  getVisitsByHost(hostId: number): Visit[] {
    return this.visits.filter(visit => visit.hostId === hostId);
  }

  getVisitsByStatus(status: VisitStatus): Visit[] {
    return this.visits.filter(visit => visit.visitStatus === status);
  }

  getVisitsByDateRange(startDate: Date, endDate: Date): Visit[] {
    return this.visits.filter(visit => 
      visit.visitDate >= startDate && visit.visitDate <= endDate
    );
  }

  getGuestVisitsByDateRange(guestId: number, startDate: Date, endDate: Date): Visit[] {
    return this.visits.filter(visit => 
      visit.guestId === guestId &&
      visit.visitDate >= startDate && 
      visit.visitDate <= endDate
    );
  }

  getHostVisitsByDateRange(hostId: number, startDate: Date, endDate: Date): Visit[] {
    return this.visits.filter(visit => 
      visit.hostId === hostId &&
      visit.visitDate >= startDate && 
      visit.visitDate <= endDate
    );
  }

  createVisit(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Visit {
    const newVisit: Visit = {
      ...visit,
      id: Math.max(...this.visits.map(v => v.id || 0)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.visits.push(newVisit);
    return newVisit;
  }

  updateVisit(id: number, updates: Partial<Visit>): Visit | undefined {
    const index = this.visits.findIndex(visit => visit.id === id);
    if (index !== -1) {
      this.visits[index] = { ...this.visits[index], ...updates, updatedAt: new Date() };
      return this.visits[index];
    }
    return undefined;
  }

  deleteVisit(id: number): boolean {
    const index = this.visits.findIndex(visit => visit.id === id);
    if (index !== -1) {
      this.visits.splice(index, 1);
      return true;
    }
    return false;
  }

  checkInVisit(id: number): Visit | undefined {
    const visit = this.getVisitById(id);
    if (visit) {
      visit.checkInTime = new Date();
      visit.visitStatus = VisitStatus.IN_PROGRESS;
      visit.updatedAt = new Date();
    }
    return visit;
  }

  checkOutVisit(id: number): Visit | undefined {
    const visit = this.getVisitById(id);
    if (visit && visit.checkInTime) {
      visit.checkOutTime = new Date();
      visit.visitStatus = VisitStatus.COMPLETED;
      visit.actualDuration = Math.floor((visit.checkOutTime.getTime() - visit.checkInTime.getTime()) / (1000 * 60));
      visit.updatedAt = new Date();
    }
    return visit;
  }

  cancelVisit(id: number): Visit | undefined {
    const visit = this.getVisitById(id);
    if (visit) {
      visit.visitStatus = VisitStatus.CANCELLED;
      visit.updatedAt = new Date();
    }
    return visit;
  }

  markNoShow(id: number): Visit | undefined {
    const visit = this.getVisitById(id);
    if (visit) {
      visit.visitStatus = VisitStatus.NO_SHOW;
      visit.updatedAt = new Date();
    }
    return visit;
  }
}
