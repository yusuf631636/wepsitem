import { useState, useMemo } from "react";
import * as React from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { MenuIcon, Moon, Sun } from "lucide-react";

interface ProductDetail {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
}

export default function Menu() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);

  // Fetch data
  const { data: categories = [] } = trpc.menu.categories.list.useQuery();
  const { data: products = [] } = trpc.menu.products.list.useQuery();
  const { data: settings } = trpc.menu.settings.get.useQuery();

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter((p) => p.categoryId === selectedCategory);
  }, [selectedCategory, products]);

  // Set default category on first load
  React.useEffect(() => {
    if (categories.length > 0 && selectedCategory === null) {
      setSelectedCategory(categories[0]?.id || null);
    }
  }, [categories, selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {settings?.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-10 w-auto rounded"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{settings?.restaurantName}</h1>
              <p className="text-xs text-muted-foreground">{settings?.restaurantTagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="mt-8 space-y-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Category Pills - Desktop */}
        <div className="hidden overflow-x-auto border-t bg-muted/50 md:block">
          <div className="flex gap-2 px-4 py-3 md:px-6">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="whitespace-nowrap"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg text-muted-foreground">
              {categories.length === 0
                ? "Henüz kategori eklenmemiş"
                : "Bu kategoride ürün bulunmamaktadır"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

interface ProductCardProps {
  product: ProductDetail;
  onSelect: (product: ProductDetail) => void;
}

function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={() => onSelect(product)}
      className="group overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
    >
      {product.imageUrl && (
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
        <p className="mt-3 text-lg font-bold text-primary">{product.price}</p>
      </div>
    </button>
  );
}

interface ProductDetailModalProps {
  product: ProductDetail;
  onClose: () => void;
}

function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {product.imageUrl && (
            <div className="relative h-80 overflow-hidden rounded-lg bg-muted">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Açıklama</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-2xl font-bold text-primary">{product.price}</span>
            <Button onClick={onClose}>Kapat</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
