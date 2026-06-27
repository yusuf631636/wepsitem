import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dijital Menü</h1>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Çıkış
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center space-y-6">
          <h2 className="text-4xl font-bold">Hoşgeldiniz</h2>
          <p className="text-lg text-muted-foreground">
            Restoranımızın lezzetli yemeklerini keşfetmek için menüyü ziyaret edin.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/menu")}
            className="text-lg px-8 py-6"
          >
            Menüyü Aç
          </Button>
        </div>
      </main>
    </div>
  );
}
