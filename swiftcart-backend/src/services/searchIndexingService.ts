import { getElasticsearchClient, isElasticsearchConnected, INDEX_NAME } from '../config/elasticsearch';
import { Product, IProduct } from '../models/Product';
import logger from '../utils/logger';

/**
 * Index a single product in Elasticsearch
 */
export const indexProduct = async (product: IProduct): Promise<boolean> => {
  if (!isElasticsearchConnected()) {
    return false;
  }

  const client = getElasticsearchClient();
  if (!client) {
    return false;
  }

  try {
    await client.index({
      index: INDEX_NAME,
      id: product._id.toString(),
      body: {
        name: product.name,
        description: product.description,
        category: product.category,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        originalPrice: product.originalPrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        stock: product.stock,
        featured: product.featured || false,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });

    logger.debug('Product indexed in Elasticsearch', {
      productId: product._id,
      slug: product.slug,
    });
    return true;
  } catch (error: any) {
    logger.error('Error indexing product in Elasticsearch', {
      error: error.message,
      productId: product._id,
    });
    return false;
  }
};

/**
 * Remove a product from Elasticsearch index
 */
export const removeProductFromIndex = async (productId: string): Promise<boolean> => {
  if (!isElasticsearchConnected()) {
    return false;
  }

  const client = getElasticsearchClient();
  if (!client) {
    return false;
  }

  try {
    await client.delete({
      index: INDEX_NAME,
      id: productId,
    });

    logger.debug('Product removed from Elasticsearch index', { productId });
    return true;
  } catch (error: any) {
    // Ignore 404 errors (product not found in index)
    if (error.statusCode === 404) {
      return true;
    }
    logger.error('Error removing product from Elasticsearch index', {
      error: error.message,
      productId,
    });
    return false;
  }
};

/**
 * Re-index all products in Elasticsearch
 */
export const reindexAllProducts = async (): Promise<{ indexed: number; failed: number }> => {
  if (!isElasticsearchConnected()) {
    logger.warn('Elasticsearch not connected, skipping reindexing');
    return { indexed: 0, failed: 0 };
  }

  const client = getElasticsearchClient();
  if (!client) {
    return { indexed: 0, failed: 0 };
  }

  try {
    logger.info('Starting product reindexing...');

    // Fetch all products from MongoDB
    const products = await Product.find({}).lean();
    let indexed = 0;
    let failed = 0;

    // Index products in batches
    const batchSize = 100;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      const body = batch.flatMap((product: any) => [
        { index: { _index: INDEX_NAME, _id: product._id.toString() } },
        {
          name: product.name,
          description: product.description,
          category: product.category,
          slug: product.slug,
          sku: product.sku,
          price: product.price,
          originalPrice: product.originalPrice,
          rating: product.rating,
          reviewCount: product.reviewCount,
          stock: product.stock,
          featured: product.featured || false,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      ]);

      try {
        const response = await client.bulk({ body });
        if (response.errors) {
          const errors = response.items.filter((item: any) => item.index?.error);
          failed += errors.length;
          indexed += batch.length - errors.length;
        } else {
          indexed += batch.length;
        }
      } catch (error: any) {
        logger.error('Error indexing batch', {
          error: error.message,
          batchStart: i,
        });
        failed += batch.length;
      }
    }

    logger.info('Product reindexing completed', { indexed, failed, total: products.length });
    return { indexed, failed };
  } catch (error: any) {
    logger.error('Error during product reindexing', {
      error: error.message,
    });
    return { indexed: 0, failed: 0 };
  }
};

/**
 * Update product index when product is updated
 */
export const updateProductIndex = async (product: IProduct): Promise<boolean> => {
  return await indexProduct(product);
};



