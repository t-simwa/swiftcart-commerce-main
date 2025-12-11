import { getElasticsearchClient, isElasticsearchConnected, INDEX_NAME } from '../config/elasticsearch';
import { Product, IProduct } from '../models/Product';
import logger from '../utils/logger';

export interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  brands?: string[];
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'relevance';
}

export interface SearchResult {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Search products using Elasticsearch if available, otherwise fallback to MongoDB
 */
export const searchProducts = async (params: SearchParams): Promise<SearchResult> => {
  const {
    query,
    category,
    minPrice,
    maxPrice,
    featured,
    brands,
    page = 1,
    limit = 20,
    sort = 'relevance',
  } = params;

  // Use Elasticsearch if available
  if (isElasticsearchConnected() && query) {
    return await searchWithElasticsearch(params);
  }

  // Fallback to MongoDB search
  return await searchWithMongoDB(params);
};

/**
 * Search using Elasticsearch
 */
const searchWithElasticsearch = async (params: SearchParams): Promise<SearchResult> => {
  const {
    query,
    category,
    minPrice,
    maxPrice,
    featured,
    brands,
    page = 1,
    limit = 20,
    sort = 'relevance',
  } = params;

  const client = getElasticsearchClient();
  if (!client) {
    throw new Error('Elasticsearch client not available');
  }

  const skip = (page - 1) * limit;

  // Build Elasticsearch query
  const must: any[] = [];
  const filter: any[] = [];

  // Text search
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['name^3', 'description^2', 'category'],
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    });
  }

  // Filters
  if (category) {
    filter.push({ term: { category: category.toLowerCase() } });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const range: any = {};
    if (minPrice !== undefined) range.gte = minPrice;
    if (maxPrice !== undefined) range.lte = maxPrice;
    filter.push({ range: { price: range } });
  }

  if (featured !== undefined) {
    filter.push({ term: { featured } });
  }

  if (brands && brands.length > 0) {
    // Extract brand from product name (first word)
    // This is a simplified approach - in production, you'd want a separate brand field
    const brandQueries = brands.map((brand) => ({
      prefix: { 'name.keyword': brand },
    }));
    filter.push({ bool: { should: brandQueries, minimum_should_match: 1 } });
  }

  // Build sort
  let sortOption: any[] = [];
  switch (sort) {
    case 'price-asc':
      sortOption = [{ price: { order: 'asc' } }];
      break;
    case 'price-desc':
      sortOption = [{ price: { order: 'desc' } }];
      break;
    case 'popular':
      sortOption = [
        { reviewCount: { order: 'desc' } },
        { rating: { order: 'desc' } },
      ];
      break;
    case 'newest':
      sortOption = [{ createdAt: { order: 'desc' } }];
      break;
    case 'relevance':
    default:
      // Default to relevance score (no explicit sort)
      break;
  }

  const esQuery: any = {
    index: INDEX_NAME,
    body: {
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter,
        },
      },
      from: skip,
      size: limit,
    },
  };

  if (sortOption.length > 0) {
    esQuery.body.sort = sortOption;
  }

  try {
    const response = await client.search(esQuery);

    const total = response.hits.total as any;
    const totalCount = typeof total === 'number' ? total : total?.value || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Extract product IDs from Elasticsearch results
    const productIds = response.hits.hits.map((hit: any) => hit._id);

    // Fetch full product documents from MongoDB
    const products = await Product.find({
      _id: { $in: productIds },
    })
      .lean()
      .exec();

    // Maintain Elasticsearch result order
    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));
    const orderedProducts = productIds
      .map((id: string) => productMap.get(id))
      .filter(Boolean) as IProduct[];

    logger.info('Elasticsearch search completed', {
      query,
      total: totalCount,
      returned: orderedProducts.length,
    });

    return {
      products: orderedProducts,
      total: totalCount,
      page,
      limit,
      totalPages,
    };
  } catch (error: any) {
    logger.error('Elasticsearch search error', {
      error: error.message,
      query,
    });
    // Fallback to MongoDB on error
    return await searchWithMongoDB(params);
  }
};

/**
 * Search using MongoDB (fallback)
 */
const searchWithMongoDB = async (params: SearchParams): Promise<SearchResult> => {
  const {
    query,
    category,
    minPrice,
    maxPrice,
    featured,
    brands,
    page = 1,
    limit = 20,
    sort = 'newest',
  } = params;

  const skip = (page - 1) * limit;

  // Build query
  const mongoQuery: any = {};

  if (category) {
    mongoQuery.category = { $regex: category, $options: 'i' };
  }

  if (query) {
    mongoQuery.$text = { $search: query };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    mongoQuery.price = {};
    if (minPrice !== undefined) mongoQuery.price.$gte = minPrice;
    if (maxPrice !== undefined) mongoQuery.price.$lte = maxPrice;
  }

  if (featured !== undefined) {
    mongoQuery.featured = featured;
  }

  if (brands && brands.length > 0) {
    const brandConditions = brands.map((brand) => ({
      name: { $regex: `^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, $options: 'i' },
    }));
    if (mongoQuery.$text) {
      const textQuery = mongoQuery.$text;
      delete mongoQuery.$text;
      mongoQuery.$and = [{ $text: textQuery }, { $or: brandConditions }];
    } else {
      mongoQuery.$or = brandConditions;
    }
  }

  // Build sort
  let sortOption: any = { createdAt: -1 };
  switch (sort) {
    case 'price-asc':
      sortOption = { price: 1 };
      break;
    case 'price-desc':
      sortOption = { price: -1 };
      break;
    case 'popular':
      sortOption = { reviewCount: -1, rating: -1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(mongoQuery).sort(sortOption).skip(skip).limit(limit).lean(),
    Product.countDocuments(mongoQuery),
  ]);

  const totalPages = Math.ceil(total / limit);

  logger.info('MongoDB search completed', {
    query,
    total,
    returned: products.length,
  });

  return {
    products: products as unknown as IProduct[],
    total,
    page,
    limit,
    totalPages,
  };
};



