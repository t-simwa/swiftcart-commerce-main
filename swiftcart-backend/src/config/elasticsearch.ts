import { Client } from '@elastic/elasticsearch';
import logger from '../utils/logger';
import { env } from './env';

let elasticsearchClient: Client | null = null;
let isConnected = false;

export const connectElasticsearch = async (): Promise<void> => {
  try {
    const node = env.ELASTICSEARCH_NODE || 'http://localhost:9200';
    const username = env.ELASTICSEARCH_USERNAME;
    const password = env.ELASTICSEARCH_PASSWORD;

    const clientConfig: any = {
      node,
    };

    // Add authentication if provided
    if (username && password) {
      clientConfig.auth = {
        username,
        password,
      };
    }

    elasticsearchClient = new Client(clientConfig);

    // Test connection
    const health = await elasticsearchClient.cluster.health();
    logger.info('Elasticsearch connected successfully', {
      cluster_name: health.cluster_name,
      status: health.status,
    });
    console.log(`✅ Elasticsearch Connected: ${node}`);

    isConnected = true;

    // Create index if it doesn't exist
    await ensureIndexExists();
  } catch (error: any) {
    logger.warn('Elasticsearch connection failed (Elasticsearch is optional)', {
      error: error.message,
      node: env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    });
    console.log('⚠️ Elasticsearch not available - application will continue with MongoDB text search');
    elasticsearchClient = null;
    isConnected = false;
  }
};

export const disconnectElasticsearch = async (): Promise<void> => {
  if (elasticsearchClient) {
    try {
      await elasticsearchClient.close();
      logger.info('Elasticsearch connection closed');
      console.log('✅ Elasticsearch connection closed');
    } catch (error: any) {
      logger.error('Error closing Elasticsearch connection', {
        error: error.message,
      });
    }
    elasticsearchClient = null;
    isConnected = false;
  }
};

export const getElasticsearchClient = (): Client | null => {
  return elasticsearchClient;
};

export const isElasticsearchConnected = (): boolean => {
  return isConnected && elasticsearchClient !== null;
};

const INDEX_NAME = 'products';

/**
 * Ensure the products index exists with proper mapping
 */
const ensureIndexExists = async (): Promise<void> => {
  if (!elasticsearchClient) return;

  try {
    const exists = await elasticsearchClient.indices.exists({ index: INDEX_NAME });

    if (!exists) {
      await elasticsearchClient.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              name: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: {
                    type: 'keyword',
                  },
                },
              },
              description: {
                type: 'text',
                analyzer: 'standard',
              },
              category: {
                type: 'keyword',
              },
              slug: {
                type: 'keyword',
              },
              sku: {
                type: 'keyword',
              },
              price: {
                type: 'float',
              },
              originalPrice: {
                type: 'float',
              },
              rating: {
                type: 'float',
              },
              reviewCount: {
                type: 'integer',
              },
              stock: {
                type: 'integer',
              },
              featured: {
                type: 'boolean',
              },
              createdAt: {
                type: 'date',
              },
              updatedAt: {
                type: 'date',
              },
            },
          },
          settings: {
            analysis: {
              analyzer: {
                product_analyzer: {
                  type: 'standard',
                  stopwords: '_english_',
                },
              },
            },
          },
        },
      });
      logger.info('Elasticsearch index created', { index: INDEX_NAME });
    }
  } catch (error: any) {
    logger.error('Error ensuring Elasticsearch index exists', {
      error: error.message,
    });
  }
};

export { INDEX_NAME };



