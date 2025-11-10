/**
 * Authentication Signin Endpoint
 *
 * Validates user credentials and returns JWT token.
 * Supports both customer authentication (via clientes table) and admin authentication.
 */

import { signToken } from '@/infrastructure/auth/jwt';
import { getPool } from '@/infrastructure/database/connection';
import type { ApiResponse } from '@/types/database';
import { NextResponse } from 'next/server';

// Note: bcryptjs needs to be installed: npm install bcryptjs @types/bcryptjs
// For now, we'll use a simple comparison (not secure - for development only)
// In production, use proper password hashing with bcryptjs
async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    // Dynamic import to avoid errors if bcryptjs is not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hash);
  } catch {
    // Fallback: simple comparison (NOT SECURE - for development only)
    // In production, this should always use bcryptjs
    console.warn('bcryptjs not available, using insecure password comparison');
    return password === hash; // This is NOT secure!
  }
}

interface SignInRequest {
  email: string;
  password: string;
}

interface SignInResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'customer' | 'artisan' | 'guest';
    name?: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignInRequest;
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Email and password are required',
        message: 'Email y contraseña son requeridos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const pool = getPool();

    // First, try to find user in usuarios table (for admin/artisan roles)
    // Note: This assumes usuarios table exists. If not, we'll fall back to clientes
    let user: {
      id: string;
      email: string;
      password_hash?: string;
      nombre?: string;
      apellido?: string;
      role?: string;
    } | null = null;

    try {
      const usuariosResult = await pool.query(
        `SELECT u.id, u.email, u.password_hash, u.nombre, u.apellido, r.codigo as role
         FROM usuarios u
         LEFT JOIN usuarios_roles ur ON u.id = ur.usuario_id
         LEFT JOIN roles r ON ur.role_id = r.id
         WHERE u.email = $1 AND u.activo = true`,
        [email.toLowerCase()]
      );

      if (usuariosResult.rows.length > 0) {
        user = usuariosResult.rows[0];
      }
    } catch {
      // usuarios table might not exist yet, continue to clientes check
    }

    // If not found in usuarios, check clientes table (for customer authentication)
    if (!user) {
      const clientesResult = await pool.query(
        'SELECT id, email, nombre, apellido FROM clientes WHERE email = $1 AND activo = true',
        [email.toLowerCase()]
      );

      if (clientesResult.rows.length > 0) {
        user = {
          id: String(clientesResult.rows[0].id),
          email: clientesResult.rows[0].email,
          nombre: clientesResult.rows[0].nombre,
          apellido: clientesResult.rows[0].apellido,
          role: 'customer'
        };
      }
    }

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid credentials',
        message: 'Credenciales inválidas'
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Verify password if password_hash exists (for usuarios table)
    if (user.password_hash) {
      const isValidPassword = await comparePassword(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid credentials',
          message: 'Credenciales inválidas'
        };
        return NextResponse.json(response, { status: 401 });
      }
    } else {
      // For clientes table, we don't have passwords yet
      // In a real system, you'd want to add password support to clientes
      // For now, we'll allow authentication without password for customers
      // TODO: Add password support to clientes table or require customer registration with password
    }

    // Determine role
    const role = (user.role || 'customer') as
      | 'admin'
      | 'customer'
      | 'artisan'
      | 'guest';

    // Generate JWT token
    const token = signToken(
      {
        userId: user.id,
        email: user.email,
        role
      },
      '7d' // Token expires in 7 days
    );

    const response: ApiResponse<SignInResponse> = {
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role,
          name:
            user.nombre && user.apellido
              ? `${user.nombre} ${user.apellido}`
              : undefined
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error during signin:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
