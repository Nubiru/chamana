import { UpdateProfile } from '@/domains/customer/use-cases/UpdateProfile';
import { authenticate } from '@/infrastructure/auth/middleware';
import { getPool } from '@/infrastructure/database/connection';
import { PostgresCustomerRepository } from '@/infrastructure/database/repositories/PostgresCustomerRepository';
import type { ApiResponse } from '@/types/database';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(_request);
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const pool = getPool();
    const customerRepo = new PostgresCustomerRepository(pool);
    const customer = await customerRepo.findById(id);

    if (!customer) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Customer not found',
        message: `Cliente con ID ${id} no encontrado`,
      };
      return NextResponse.json(response, { status: 404 });
    }

    interface CustomerResponse {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      active: boolean;
      registeredAt: string;
    }

    const response: ApiResponse<CustomerResponse> = {
      success: true,
      data: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        active: customer.active,
        registeredAt: customer.registeredAt.toISOString(),
      },
      message: 'Cliente obtenido exitosamente',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching customer:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, email, phone } = body;

    const pool = getPool();
    const customerRepo = new PostgresCustomerRepository(pool);
    const updateProfile = new UpdateProfile(customerRepo);

    await updateProfile.execute({
      customerId: id,
      firstName,
      lastName,
      email,
      phone,
    });

    // Fetch updated customer
    const customer = await customerRepo.findById(id);

    interface CustomerResponse {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      active: boolean;
      registeredAt: string;
    }

    const response: ApiResponse<CustomerResponse> = {
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: customer
        ? {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            active: customer.active,
            registeredAt: customer.registeredAt.toISOString(),
          }
        : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating customer:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
