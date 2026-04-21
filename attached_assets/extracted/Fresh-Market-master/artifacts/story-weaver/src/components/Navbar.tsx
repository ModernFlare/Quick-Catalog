import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, Leaf, User, LogOut, ShieldAlert, UserCircle, Package } from "lucide-react";
import { useCart } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getTotalItems } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = getTotalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: "Главная" },
    { to: "/catalog", label: "Каталог" },
    { to: "/cart", label: "Корзина" },
    { to: "/feedback", label: "Обратная связь" },
    ...(isAdmin ? [{ to: "/admin", label: "Админ" }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className={cn("navbar-fixed bg-background/95 backdrop-blur-md", scrolled && "scrolled")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}
              className="text-xl text-foreground"
            >
              ФрешМаркет
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={cn("nav-link text-sm font-medium text-muted-foreground hover:text-foreground",
                  location.pathname === l.to && "active text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {totalItems > 0 && <span className="cart-counter">{totalItems}</span>}
            </Link>

            {user && isAdmin && (
              <Link to="/admin">
                <Button variant="default" size="sm" className="gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  Админ панель
                </Button>
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <UserCircle className="h-4 w-4" />
                      Мой профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4" />
                      Мои заказы
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">Войти</Button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            <Link to="/cart" className="relative p-2" onClick={() => setIsOpen(false)}>
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {totalItems > 0 && <span className="cart-counter">{totalItems}</span>}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-96 pb-4" : "max-h-0"
          )}
        >
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                location.pathname === l.to && "bg-muted text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <div className="my-1 border-t border-border" />
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors", location.pathname === "/profile" && "bg-muted text-foreground")}
              >
                <UserCircle className="h-4 w-4" /> Мой профиль
              </Link>
              <Link
                to="/orders"
                onClick={() => setIsOpen(false)}
                className={cn("flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors", location.pathname === "/orders" && "bg-muted text-foreground")}
              >
                <Package className="h-4 w-4" /> Мои заказы
              </Link>
              <div className="my-1 border-t border-border" />
              <button
                onClick={() => { handleSignOut(); setIsOpen(false); }}
                className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-md text-sm font-medium text-destructive hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4" /> Выйти
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-3 rounded-md text-sm font-medium text-primary hover:bg-muted transition-colors"
            >
              Войти / Регистрация
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
