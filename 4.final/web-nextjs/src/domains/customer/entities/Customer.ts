/**
 * Customer Entity
 *
 * Represents a customer with personal information and account status.
 * Contains business logic for customer management.
 */
export class Customer {
  constructor(
    public readonly id: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public phone?: string,
    public active = true,
    public registeredAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.firstName || this.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!this.lastName || this.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Valid email is required');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }): void {
    if (data.firstName !== undefined) {
      if (!data.firstName || data.firstName.trim().length === 0) {
        throw new Error('First name cannot be empty');
      }
      this.firstName = data.firstName.trim();
    }

    if (data.lastName !== undefined) {
      if (!data.lastName || data.lastName.trim().length === 0) {
        throw new Error('Last name cannot be empty');
      }
      this.lastName = data.lastName.trim();
    }

    if (data.email !== undefined) {
      if (!data.email || !this.isValidEmail(data.email)) {
        throw new Error('Valid email is required');
      }
      this.email = data.email.trim().toLowerCase();
    }

    if (data.phone !== undefined) {
      this.phone = data.phone ? data.phone.trim() : undefined;
    }

    this.validate();
  }

  updateEmail(newEmail: string): void {
    if (!newEmail || !this.isValidEmail(newEmail)) {
      throw new Error('Valid email is required');
    }
    this.email = newEmail.trim().toLowerCase();
  }

  updatePhone(newPhone: string | undefined): void {
    this.phone = newPhone ? newPhone.trim() : undefined;
  }

  activate(): void {
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }
}
