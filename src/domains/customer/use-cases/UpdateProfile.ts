import type { CustomerRepository } from '../repositories/CustomerRepository';

export interface UpdateProfileRequest {
  customerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class UpdateProfile {
  constructor(private customerRepo: CustomerRepository) {}

  async execute(request: UpdateProfileRequest): Promise<void> {
    const customer = await this.customerRepo.findById(request.customerId);

    if (!customer) {
      throw new Error(`Customer with ID ${request.customerId} not found`);
    }

    // Check if email is being changed and if it's already taken
    if (request.email && request.email !== customer.email) {
      const existingCustomer = await this.customerRepo.findByEmail(request.email);
      if (existingCustomer && existingCustomer.id !== request.customerId) {
        throw new Error(`Email ${request.email} is already registered to another customer`);
      }
    }

    // Update profile using entity method
    customer.updateProfile({
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,
    });

    // Save to repository
    await this.customerRepo.update(customer);
  }
}
