import { RegisterCustomer } from '@/domains/customer/use-cases/RegisterCustomer';
import { authenticate } from '@/infrastructure/auth/middleware';
import { getPool } from '@/infrastructure/database/connection';
import { PostgresCustomerRepository } from '@/infrastructure/database/repositories/PostgresCustomerRepository';
import type { ApiResponse } from '@/types/database';
import { type NextRequest, NextResponse } from 'next/server';

// Registration is public (no auth required)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'firstName, lastName, and email are required',
        message: 'firstName, lastName y email son requeridos',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const pool = getPool();
    const customerRepo = new PostgresCustomerRepository(pool);
    const registerCustomer = new RegisterCustomer(customerRepo);

    const customer = await registerCustomer.execute({
      firstName,
      lastName,
      email,
      phone,
    });

    interface RegisterCustomerResponse {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      active: boolean;
      registeredAt: string;
    }

    const response: ApiResponse<RegisterCustomerResponse> = {
      success: true,
      message: 'Cliente registrado exitosamente',
      data: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        active: customer.active,
        registeredAt: customer.registeredAt.toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error registering customer:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// List customers requires authentication (admin only in production, but allowing authenticated users for now)
export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    const filters = {
      active: active ? active === 'true' : undefined,
      search: search || undefined,
    };

    const pool = getPool();
    const customerRepo = new PostgresCustomerRepository(pool);
    const customers = await customerRepo.findAll(filters);

    interface CustomerResponse {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      active: boolean;
      registeredAt: string;
    }

    const response: ApiResponse<CustomerResponse[]> = {
      success: true,
      data: customers.map((customer) => ({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        active: customer.active,
        registeredAt: customer.registeredAt.toISOString(),
      })),
      message: 'Clientes obtenidos exitosamente',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching customers:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
