import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Paneli</h1>
          <Button
            variant="ghost"
            onClick={() => {
              setIsAuthenticated(false);
              setAdminPassword("");
            }}
          >
            Çıkış
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:px-6">
        <AdminTabs adminPassword={adminPassword} />
      </main>
    </div>
  );
}

interface AdminLoginProps {
  onSuccess: () => void;
}

function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Verify password by trying to get admin settings
    // For now, we'll just check if password is not empty
    // In production, this should verify against the backend
    if (password.length > 0) {
      // Store password for API calls
      localStorage.setItem("adminPassword", password);
      onSuccess();
    } else {
      setError("Lütfen şifre girin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Admin Paneli</h1>
          <p className="text-muted-foreground">Yönetim için şifre girin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full h-12">
            Giriş Yap
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.setItem("adminPassword", "admin123");
              onSuccess();
            }}
          >
            Demo Şifresi: admin123
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AdminTabsProps {
  adminPassword: string;
}

function AdminTabs({ adminPassword }: AdminTabsProps) {
  const storedPassword = localStorage.getItem("adminPassword") || "admin123";

  return (
    <Tabs defaultValue="categories" className="space-y-6">
      <TabsList>
        <TabsTrigger value="categories">Kategoriler</TabsTrigger>
        <TabsTrigger value="products">Ürünler</TabsTrigger>
        <TabsTrigger value="settings">Ayarlar</TabsTrigger>
      </TabsList>

      <TabsContent value="categories">
        <CategoriesTab adminPassword={storedPassword} />
      </TabsContent>

      <TabsContent value="products">
        <ProductsTab adminPassword={storedPassword} />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab adminPassword={storedPassword} />
      </TabsContent>
    </Tabs>
  );
}

interface CategoriesTabProps {
  adminPassword: string;
}

function CategoriesTab({ adminPassword }: CategoriesTabProps) {
  const { data: categories = [] } = trpc.menu.categories.list.useQuery();
  const [newCategoryName, setNewCategoryName] = useState("");

  const createCategoryMutation = trpc.menu.admin.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Kategori eklendi");
      setNewCategoryName("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Kategori adı boş olamaz");
      return;
    }

    createCategoryMutation.mutate({
      adminPassword,
      name: newCategoryName,
      order: categories.length,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Yeni kategori adı"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button onClick={handleAddCategory} disabled={createCategoryMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" />
          Ekle
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-sm text-muted-foreground">Sıra: {category.order}</p>
            </div>
            <Button variant="ghost" size="icon">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProductsTabProps {
  adminPassword: string;
}

function ProductsTab({ adminPassword }: ProductsTabProps) {
  const { data: products = [] } = trpc.menu.products.list.useQuery();
  const { data: categories = [] } = trpc.menu.categories.list.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
  });

  const createProductMutation = trpc.menu.admin.products.create.useMutation({
    onSuccess: () => {
      toast.success("Ürün eklendi");
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        imageUrl: "",
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddProduct = () => {
    if (!formData.name.trim() || !formData.price.trim() || !formData.categoryId) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    createProductMutation.mutate({
      adminPassword,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      categoryId: parseInt(formData.categoryId),
      imageUrl: formData.imageUrl,
    });
  };

  return (
    <div className="space-y-6">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ürün
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Ürün Ekle</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ürün Adı *</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ürün adı"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Açıklama</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ürün açıklaması"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Fiyat *</label>
              <Input
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="Örn: 100.000 TL"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Kategori *</label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Fotoğraf URL</label>
              <Input
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="/manus-storage/..."
              />
            </div>

            <Button
              onClick={handleAddProduct}
              disabled={createProductMutation.isPending}
              className="w-full"
            >
              Ürün Ekle
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.price}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SettingsTabProps {
  adminPassword: string;
}

function SettingsTab({ adminPassword }: SettingsTabProps) {
  const { data: settings } = trpc.menu.settings.get.useQuery();
  const [formData, setFormData] = useState({
    restaurantName: settings?.restaurantName || "",
    restaurantTagline: settings?.restaurantTagline || "",
  });

  const updateSettingsMutation = trpc.menu.admin.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Ayarlar güncellendi");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate({
      adminPassword,
      restaurantName: formData.restaurantName,
      restaurantTagline: formData.restaurantTagline,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <label className="text-sm font-medium">Restoran Adı</label>
        <Input
          value={formData.restaurantName}
          onChange={(e) =>
            setFormData({ ...formData, restaurantName: e.target.value })
          }
          placeholder="Restoran adı"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Restoran Sloganı</label>
        <Input
          value={formData.restaurantTagline}
          onChange={(e) =>
            setFormData({ ...formData, restaurantTagline: e.target.value })
          }
          placeholder="Restoran sloganı"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={updateSettingsMutation.isPending}
      >
        Kaydet
      </Button>
    </div>
  );
}
