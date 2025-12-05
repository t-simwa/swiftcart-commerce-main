import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Package } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AdminInventory() {
  const [page, setPage] = useState(1);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-inventory', page, lowStockOnly],
    queryFn: () =>
      adminApi.getInventory({
        page,
        limit: 50,
        lowStockOnly,
      }),
  });

  const inventory = data?.data?.inventory;
  const stats = inventory?.stats;
  const products = inventory?.products || [];
  const pagination = inventory?.pagination;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Monitor stock levels and low stock alerts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.lowStockCount || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats?.outOfStockCount || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSh {((stats?.totalStockValue || 0) / 1000).toFixed(0)}K
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {stats?.lowStockCount > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Low Stock Alert</AlertTitle>
            <AlertDescription>
              {stats.lowStockCount} products are running low on stock and need attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="low-stock-only"
                checked={lowStockOnly}
                onCheckedChange={setLowStockOnly}
              />
              <Label htmlFor="low-stock-only">Show low stock items only</Label>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>
              {pagination?.total || 0} products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                Failed to load inventory. Please try again.
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products found
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Low Stock Threshold</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: any) => {
                      const isLowStock = product.stock <= product.lowStockThreshold;
                      const isOutOfStock = product.stock === 0;
                      return (
                        <TableRow key={product._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                              <div>
                                <p className="font-medium">{product.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {product.sku}
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <span className="font-medium">{product.stock}</span>
                          </TableCell>
                          <TableCell>{product.lowStockThreshold}</TableCell>
                          <TableCell>
                            {isOutOfStock ? (
                              <Badge variant="destructive">Out of Stock</Badge>
                            ) : isLowStock ? (
                              <Badge variant="destructive">Low Stock</Badge>
                            ) : (
                              <Badge variant="default">In Stock</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 text-sm border rounded"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!pagination.hasPrev}
                      >
                        Previous
                      </button>
                      <button
                        className="px-4 py-2 text-sm border rounded"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!pagination.hasNext}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

