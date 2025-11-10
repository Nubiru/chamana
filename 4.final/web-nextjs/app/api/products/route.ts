import { SearchProducts } from '@/domains/product-catalog/use-cases/SearchProducts';
import { getPool } from '@/infrastructure/database/connection';
import { PostgresProductRepository } from '@/infrastructure/database/repositories/PostgresProductRepository';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');

    const filters = {
      categoryId: searchParams.get('categoryId') || undefined,
      minPrice: minPriceParam ? Number.parseFloat(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? Number.parseFloat(maxPriceParam) : undefined,
      query: searchParams.get('q') || undefined,
    };

    const pool = getPool();
    const productRepo = new PostgresProductRepository(pool);
    const searchProducts = new SearchProducts(productRepo);

    const products = await searchProducts.execute(filters);

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
