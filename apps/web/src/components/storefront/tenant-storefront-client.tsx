"use client";

import type { CSSProperties } from "react";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  Menu,
  MessageCircleMore,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  createQuoteRequest,
  type StorefrontBanner,
  type StorefrontCategory,
  type StorefrontProduct,
  type StorefrontResponse,
  type TenantProductsResponse,
} from "@/lib/api/catalog";

type TenantStorefrontClientProps = {
  tenantSlug: string;
  storefront: StorefrontResponse;
  productsResponse: TenantProductsResponse;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  variantId?: string;
  variantName?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value * 4100);
}

function parseNumber(value: string | number | null | undefined) {
  const parsed = typeof value === "string" ? Number(value) : value ?? 0;
  return Number.isFinite(parsed) ? Number(parsed) : 0;
}

function hexToRgba(hex: string | null | undefined, alpha: number) {
  if (!hex) {
    return `rgba(164, 55, 0, ${alpha})`;
  }

  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  if (value.length !== 6) {
    return `rgba(164, 55, 0, ${alpha})`;
  }

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildWhatsAppHref(phone: string | null | undefined, tenantName: string, product?: string) {
  const cleanPhone = phone?.replace(/[^\d]/g, "") ?? "";

  if (!cleanPhone) {
    return "#";
  }

  const message = product
    ? `Hola, quiero pedir "${product}" del catalogo de ${tenantName}.`
    : `Hola, quiero informacion del catalogo de ${tenantName}.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

function getCategoryImage(
  category: StorefrontCategory,
  products: StorefrontProduct[],
  storefront: StorefrontResponse,
) {
  return (
    products.find((product) => product.category?.id === category.id)?.images[0]?.url ??
    storefront.banners.find((banner) =>
      banner.title.toLowerCase().includes(category.name.toLowerCase()),
    )?.imageUrl ??
    storefront.tenant.coverUrl ??
    storefront.banners[0]?.imageUrl ??
    ""
  );
}

function getHeroStyle(
  imageUrl: string | undefined,
  primary: string,
  secondary: string,
): CSSProperties {
  return {
    backgroundImage: `linear-gradient(100deg, ${hexToRgba(primary, 0.82)} 8%, ${hexToRgba(primary, 0.5)} 42%, ${hexToRgba(secondary, 0.22)} 100%), url(${imageUrl ?? ""})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

function getAccentButtonStyle(primary: string, secondary: string): CSSProperties {
  return {
    background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    boxShadow: `0 24px 50px -22px ${hexToRgba(primary, 0.65)}`,
  };
}

export function TenantStorefrontClient({
  tenantSlug,
  storefront,
  productsResponse,
}: TenantStorefrontClientProps) {
  const storageKey = `multi-catalogo:${tenantSlug}:cart`;
  const primary = storefront.tenant.primaryColor ?? "#a43700";
  const secondary = storefront.tenant.secondaryColor ?? "#cd4700";
  const heroBanner: StorefrontBanner | null = storefront.banners[0] ?? null;
  const products = productsResponse.products ?? [];
  const featuredProducts =
    storefront.featuredProducts.length > 0
      ? storefront.featuredProducts
      : products.slice(0, 8);
  const categories = storefront.categories ?? [];
  const spotlightCategories = categories.slice(0, 3);
  const phone = storefront.tenant.whatsappNumber;
  const heroImage =
    heroBanner?.imageUrl ?? storefront.tenant.coverUrl ?? products[0]?.images[0]?.url;

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const rawCart = window.localStorage.getItem(storageKey);

    if (!rawCart) {
      return [];
    }

    try {
      return JSON.parse(rawCart) as CartItem[];
    } catch {
      window.localStorage.removeItem(storageKey);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutDone, setCheckoutDone] = useState("");
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    message: "",
  });
  const [isPending, startTransition] = useTransition();

  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [addedConfirm, setAddedConfirm] = useState<string | null>(null);

  // Find matching variant based on selected options
  const matchingVariant = selectedProduct?.variants?.find(v =>
    v.options.every(o => selectedOptions[o.option.name] === o.value.value)
  );

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, storageKey]);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  function openProductModal(product: StorefrontProduct) {
    setSelectedProduct(product);
    setSelectedOptions({});
    setSelectedImageIndex(0);
    setModalQuantity(1);
    setAddedConfirm(null);
  }

  function addToCart(product: StorefrontProduct, variant?: any, qty = 1) {
    setCheckoutDone("");
    let effectivePrice = product.promotion
      ? parseNumber(product.promotion.finalPrice)
      : parseNumber(product.price);

    if (variant && variant.price !== null) {
      effectivePrice = parseNumber(variant.price);
    }

    const name = variant ? `${product.name} - ${variant.name}` : product.name;
    const imageUrl = variant?.image?.url || variant?.imageUrl || product.images[0]?.url || null;

    setCart((currentCart) => {
      const existing = currentCart.find((item) =>
        variant ? item.variantId === variant.id : item.productId === product.id && !item.variantId
      );

      if (existing) {
        return currentCart.map((item) =>
          (variant ? item.variantId === variant.id : item.productId === product.id && !item.variantId)
            ? { ...item, quantity: item.quantity + qty }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          productId: product.id,
          name,
          price: effectivePrice,
          quantity: qty,
          imageUrl,
          variantId: variant?.id,
          variantName: variant?.name,
        },
      ];
    });

    setAddedConfirm(name);
  }

  function changeQuantity(idKey: string, delta: number) {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          const itemKey = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
          return itemKey === idKey ? { ...item, quantity: item.quantity + delta } : item;
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(idKey: string) {
    setCart((currentCart) =>
      currentCart.filter((item) => {
        const itemKey = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
        return itemKey !== idKey;
      }),
    );
  }

  function clearCart() {
    setCart([]);
    setCheckoutDone("");
  }

  function handleCheckout() {
    if (cart.length === 0) {
      setCheckoutError("Agrega productos antes de enviar el pedido.");
      return;
    }

    setCheckoutError("");
    setCheckoutDone("");

    startTransition(() => {
      void (async () => {
        const response = await createQuoteRequest(tenantSlug, {
          ...checkoutForm,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        });

        if (!response) {
          setCheckoutError("No se pudo registrar el pedido.");
          return;
        }

        setCheckoutDone(`Pedido ${response.quoteRequestId} registrado.`);
        setCart([]);
        window.localStorage.removeItem(storageKey);

        if (response.whatsappUrl) {
          window.open(response.whatsappUrl, "_blank", "noopener,noreferrer");
        }
      })();
    });
  }

  return (
    <main
      className="min-h-screen text-[#1c1b1b]"
      style={{
        backgroundColor: "#fcf9f8",
        backgroundImage: `radial-gradient(circle at top left, ${hexToRgba(primary, 0.08)}, transparent 22%), radial-gradient(circle at top right, ${hexToRgba(secondary, 0.09)}, transparent 24%)`,
      }}
    >
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="font-display text-2xl font-black tracking-[-0.08em] text-stone-950">
            {storefront.tenant.name.toUpperCase()}
          </div>
          <div className="hidden items-center space-x-8 md:flex">
            <a
              className="font-display text-sm font-bold uppercase tracking-[0.16em]"
              href="#coleccion"
              style={{ color: primary, borderBottom: `2px solid ${primary}` }}
            >
              Explore
            </a>
            <a className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-950" href="#categorias">
              Colecciones
            </a>
            <a className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-950" href="#destacados">
              Destacados
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="text-stone-600 transition-transform active:scale-95">
              <Search className="size-5" />
            </button>
            <button type="button" className="text-stone-600 transition-transform active:scale-95">
              <Heart className="size-5" />
            </button>
            <button
              type="button"
              className="relative text-stone-600 transition-transform active:scale-95"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="size-5" />
              {totalItems > 0 ? (
                <span
                  className="absolute -right-2 -top-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: primary }}
                >
                  {totalItems}
                </span>
              ) : null}
            </button>
            <button type="button" className="text-stone-600 transition-transform active:scale-95 md:hidden">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        <section className="relative min-h-[520px] overflow-hidden lg:h-[640px]">
          <div className="absolute inset-0 bg-stone-950" style={getHeroStyle(heroImage, primary, secondary)}>
            {heroImage ? (
              <Image
                src={heroImage}
                alt={heroBanner?.title ?? storefront.tenant.name}
                fill
                className="object-cover opacity-35 mix-blend-screen"
                sizes="100vw"
                priority
              />
            ) : null}
          </div>
          <div className="relative z-10 mx-auto flex h-full max-w-screen-2xl flex-col justify-center px-6 py-24 lg:px-8">
            <span
              className="mb-4 inline-flex w-fit rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-[0.24em]"
              style={{
                color: "#ffdbcf",
                backgroundColor: hexToRgba(primary, 0.22),
              }}
            >
              {heroBanner?.title ?? `${storefront.tenant.name} online`}
            </span>
            <h1 className="font-display max-w-3xl text-5xl font-black leading-none tracking-[-0.08em] text-white md:text-7xl">
              {storefront.tenant.name.toUpperCase()}
              <br />
              {categories[0]?.name?.toUpperCase() ?? "COLECCION DESTACADA"}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/78">
              {heroBanner?.subtitle ??
                "Catalogo visual para vender mejor, destacar promociones y cerrar pedidos directos por WhatsApp."}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={buildWhatsAppHref(phone, storefront.tenant.name)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md px-8 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white transition-transform active:scale-95"
                style={getAccentButtonStyle(primary, secondary)}
              >
                Pedir por WhatsApp
                <MessageCircleMore className="size-4" />
              </a>
              <a
                href="#destacados"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white backdrop-blur-lg transition-colors hover:bg-white/20"
              >
                Ver coleccion
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </section>

        <section id="destacados" className="mx-auto max-w-screen-2xl px-6 pb-12 pt-20 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p
                className="mb-2 text-sm font-extrabold uppercase tracking-[0.2em]"
                style={{ color: primary }}
              >
                Curated selection
              </p>
              <h2 className="font-display text-4xl font-black tracking-[-0.08em] text-[#1c1b1b] md:text-6xl">
                COLECCION GLOBAL
                <br />
                {storefront.tenant.name.toUpperCase()}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ebe7e7] text-[#1c1b1b] transition-all"
              >
                <SlidersHorizontal className="size-5" />
              </button>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ebe7e7] text-[#1c1b1b] transition-all"
              >
                <Search className="size-5" />
              </button>
            </div>
          </div>
        </section>

        <section id="coleccion" className="mx-auto max-w-screen-2xl px-6 pb-24 lg:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product: StorefrontProduct, index: number) => (
              <article key={product.id} className="group cursor-pointer" onClick={() => openProductModal(product)}>
                <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-[20px] bg-[#f0edec] transition-all duration-500 group-hover:shadow-[0_40px_60px_-15px_rgba(164,55,0,0.12)]">
                  {product.promotion ? (
                    <div className="absolute left-4 top-4 z-10">
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tight text-white"
                        style={{ backgroundColor: secondary }}
                      >
                        -{product.promotion.discountPercent}%
                      </span>
                    </div>
                  ) : (product.compareAtPrice || index === 0) && (
                    <div className="absolute left-4 top-4 z-10">
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tight text-white"
                        style={{ backgroundColor: product.compareAtPrice ? secondary : primary }}
                      >
                        {product.compareAtPrice ? "Oferta" : "Nuevo"}
                      </span>
                    </div>
                  )}
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt ?? product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  ) : null}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1c1b1b] shadow-lg transition-colors"
                    >
                      <Heart className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="px-2">
                  <h3 className="font-display text-xl font-bold tracking-[-0.04em] text-[#1c1b1b]">
                    {product.name}
                  </h3>
                  <p className="mb-4 mt-1 text-sm text-[#5a4138]">
                    {product.category?.name ?? "Coleccion principal"}
                  </p>
                  {product.promotion ? (
                    <div className="mb-6">
                      <span className="font-display text-lg font-extrabold" style={{ color: primary }}>
                        {formatCurrency(parseNumber(product.promotion.finalPrice))}
                      </span>
                      <span className="ml-2 text-sm text-stone-400 line-through">
                        {formatCurrency(parseNumber(product.price))}
                      </span>
                    </div>
                  ) : (
                    <p className="mb-6 font-display text-lg font-extrabold">
                      {formatCurrency(parseNumber(product.price))}
                    </p>
                  )}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => openProductModal(product)}
                      className="inline-flex items-center justify-center gap-2 rounded-md py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white transition-transform active:scale-95"
                      style={getAccentButtonStyle(primary, secondary)}
                    >
                      <Search className="size-4" />
                      Ver producto
                    </button>
                    <a
                      href={buildWhatsAppHref(phone, storefront.tenant.name, product.name)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="py-2 text-center text-xs font-bold uppercase tracking-[0.16em] transition-all hover:underline"
                      style={{ color: secondary }}
                    >
                      Pedir directo
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="categorias" className="bg-[#161312] py-24">
          <div className="mx-auto max-w-screen-2xl px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="font-display text-4xl font-black tracking-[-0.07em] text-white md:text-5xl">
                CATEGORIAS DESTACADAS
              </h2>
              <div
                className="mt-4 h-1 w-24"
                style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:grid-rows-[290px_290px]">
              {spotlightCategories[0] ? (
                <article className="group relative overflow-hidden rounded-[24px] md:col-span-8 md:row-span-2">
                  {getCategoryImage(spotlightCategories[0], products, storefront) ? (
                    <Image
                      src={getCategoryImage(spotlightCategories[0], products, storefront)}
                      alt={spotlightCategories[0].name}
                      fill
                      className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 66vw"
                    />
                  ) : null}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${hexToRgba(primary, 0.3)}, rgba(22, 19, 18, 0.8))`,
                    }}
                  />
                  <div className="relative z-10 flex h-full flex-col justify-end p-8 lg:p-12">
                    <h3 className="font-display text-4xl font-black tracking-[-0.07em] text-white lg:text-5xl">
                      {spotlightCategories[0].name.toUpperCase()}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-7 text-stone-300">
                      {spotlightCategories[0].description ??
                        "Categoria lista para impulsar tus productos mas rentables."}
                    </p>
                    <a
                      href="#coleccion"
                      className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-extrabold uppercase tracking-[0.2em]"
                      style={{ color: secondary }}
                    >
                      Explorar
                      <ArrowRight className="size-4" />
                    </a>
                  </div>
                </article>
              ) : null}

              {spotlightCategories[1] ? (
                <article className="group relative overflow-hidden rounded-[24px] bg-stone-800 md:col-span-4">
                  {getCategoryImage(spotlightCategories[1], products, storefront) ? (
                    <Image
                      src={getCategoryImage(spotlightCategories[1], products, storefront)}
                      alt={spotlightCategories[1].name}
                      fill
                      className="object-cover opacity-50 transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : null}
                  <div className="relative z-10 flex h-full flex-col justify-end p-8">
                    <h3 className="font-display text-2xl font-black tracking-[-0.05em] text-white">
                      {spotlightCategories[1].name.toUpperCase()}
                    </h3>
                    <div className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                      Ver mas
                    </div>
                  </div>
                </article>
              ) : null}

              <article
                className="relative overflow-hidden rounded-[24px] md:col-span-4"
                style={{
                  background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
                }}
              >
                <div className="flex h-full flex-col justify-end p-8 text-white">
                  <MessageCircleMore className="mb-4 size-10" />
                  <h3 className="font-display text-2xl font-black tracking-[-0.05em]">
                    PEDIDO DIRECTO
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/76">
                    {storefront.promotions.length} promociones activas y salida directa a
                    WhatsApp para cotizar o cerrar la venta.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="mt-6 inline-flex items-center gap-2 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-white/85"
                  >
                    Abrir carrito
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-screen-2xl px-6 py-24 lg:px-8">
          <div className="rounded-[32px] border border-black/5 bg-[#f0edec] p-10 lg:p-16">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="font-display text-4xl font-black leading-none tracking-[-0.07em] text-[#1c1b1b] lg:text-5xl">
                  CATALOGO LISTO PARA CONVERTIR.
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#5a4138]">
                  Comparte este subdominio, publica tus productos y cierra pedidos
                  sin friccion por WhatsApp.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-md px-8 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white"
                  style={getAccentButtonStyle(primary, secondary)}
                >
                  Revisar pedido
                  <ShoppingCart className="size-4" />
                </button>
                <a
                  href="#coleccion"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#1c1b1b]"
                >
                  Ver productos
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full px-5 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-2xl"
        style={getAccentButtonStyle(primary, secondary)}
      >
        <ShoppingCart className="size-4" />
        {totalItems > 0 ? `${totalItems} items` : "Carrito"}
      </button>

      <div
        className={`fixed inset-0 z-50 transition ${
          isCartOpen
            ? "pointer-events-auto bg-black/40 opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-3xl font-black tracking-[-0.06em] text-[#1c1b1b]">
                Tu pedido
              </div>
              <p className="mt-2 text-sm text-stone-500">
                Este carrito queda guardado por tienda y registra la solicitud antes de abrir WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-700"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {cart.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-stone-200 bg-stone-50 p-6 text-sm text-stone-500">
                No hay productos en el carrito.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="grid grid-cols-[72px_1fr_auto] gap-4 rounded-[24px] border border-stone-200 p-4"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    ) : null}
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold tracking-[-0.04em]">
                      {item.name}
                    </div>
                    <div className="mt-1 text-sm text-stone-500">
                      {formatCurrency(item.price)}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.productId, -1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.productId, 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-sm font-bold uppercase tracking-[0.16em] text-stone-400"
                  >
                    Quitar
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 rounded-[24px] bg-stone-50 p-5">
            <div className="flex items-center justify-between text-sm text-stone-500">
              <span>Subtotal</span>
              <span className="font-bold text-stone-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-stone-500">
              <span>Items</span>
              <span className="font-bold text-stone-900">{totalItems}</span>
            </div>
            <button
              type="button"
              onClick={clearCart}
              className="mt-4 text-xs font-bold uppercase tracking-[0.16em]"
              style={{ color: secondary }}
            >
              Vaciar carrito
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            <input
              value={checkoutForm.customerName}
              onChange={(event) =>
                setCheckoutForm((current) => ({
                  ...current,
                  customerName: event.target.value,
                }))
              }
              placeholder="Tu nombre"
              className="rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0"
            />
            <input
              value={checkoutForm.customerPhone}
              onChange={(event) =>
                setCheckoutForm((current) => ({
                  ...current,
                  customerPhone: event.target.value,
                }))
              }
              placeholder="Tu telefono"
              className="rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0"
            />
            <input
              value={checkoutForm.customerEmail}
              onChange={(event) =>
                setCheckoutForm((current) => ({
                  ...current,
                  customerEmail: event.target.value,
                }))
              }
              placeholder="Tu email"
              className="rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0"
            />
            <textarea
              value={checkoutForm.message}
              onChange={(event) =>
                setCheckoutForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              placeholder="Notas para el pedido"
              className="min-h-28 rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0"
            />
          </div>

          {checkoutError ? (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {checkoutError}
            </div>
          ) : null}

          {checkoutDone ? (
            <div className="mt-4 rounded-2xl px-4 py-3 text-sm text-white" style={{ backgroundColor: primary }}>
              {checkoutDone}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isPending || cart.length === 0}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={getAccentButtonStyle(primary, secondary)}
          >
            {isPending ? "Procesando" : "Registrar y abrir WhatsApp"}
            <MessageCircleMore className="size-4" />
          </button>
        </aside>
      </div>

      <footer className="bg-stone-50 pb-10 pt-20">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-12 px-6 md:grid-cols-4 lg:px-8">
          <div className="md:col-span-1">
            <div className="font-display mb-6 text-lg font-bold tracking-[-0.05em] text-stone-900">
              {storefront.tenant.name.toUpperCase()}
            </div>
            <p className="mb-8 text-sm leading-7 text-stone-500">
              Catalogo moderno con branding propio, productos destacados y pedido
              directo por chat.
            </p>
            <a
              href={buildWhatsAppHref(phone, storefront.tenant.name)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: primary }}
            >
              <MessageCircleMore className="size-4" />
            </a>
          </div>

          <div>
            <h4 className="font-display mb-6 text-sm font-bold uppercase tracking-[0.18em] text-[#1c1b1b]">
              Explorar
            </h4>
            <ul className="space-y-4">
              {categories.slice(0, 3).map((category: StorefrontCategory) => (
                <li key={category.id} className="text-sm text-stone-500">
                  {category.name}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-6 text-sm font-bold uppercase tracking-[0.18em] text-[#1c1b1b]">
              Promociones
            </h4>
            <ul className="space-y-4">
              {storefront.promotions.slice(0, 3).map((promotion) => (
                <li key={promotion.id} className="text-sm text-stone-500">
                  {promotion.name}
                </li>
              ))}
              {storefront.promotions.length === 0 ? (
                <li className="text-sm text-stone-500">Sin campañas activas</li>
              ) : null}
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-6 text-sm font-bold uppercase tracking-[0.18em] text-[#1c1b1b]">
              Contacto
            </h4>
            <p className="text-sm text-stone-500">Canal principal de ventas:</p>
            <p className="mb-6 mt-2 text-lg font-bold" style={{ color: primary }}>
              {phone ?? "WhatsApp no configurado"}
            </p>
            <p className="text-sm text-stone-500">
              Subdominio activo: {storefront.tenant.subdomain}
            </p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedProduct(null); }}
        >
          <div className="relative w-full max-w-2xl overflow-hidden rounded-t-[32px] bg-white shadow-2xl sm:rounded-[32px] max-h-[92vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-600 shadow-md hover:bg-stone-100 transition-colors"
            >
              <X className="size-5" />
            </button>

            {/* Image Gallery */}
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-stone-100">
              {selectedProduct.images.length > 0 ? (
                <>
                  <Image
                    src={selectedProduct.images[selectedImageIndex]?.url ?? ""}
                    alt={selectedProduct.images[selectedImageIndex]?.alt ?? selectedProduct.name}
                    fill
                    className="object-cover transition-opacity duration-300"
                    sizes="(max-width: 640px) 100vw, 672px"
                  />
                  {selectedProduct.promotion && (
                    <div className="absolute left-4 top-4 z-10">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-tight text-white"
                        style={{ backgroundColor: secondary }}
                      >
                        -{selectedProduct.promotion.discountPercent}%
                      </span>
                    </div>
                  )}
                  {selectedProduct.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                      {selectedProduct.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImageIndex(i)}
                          className="h-2 rounded-full transition-all duration-200"
                          style={{
                            width: i === selectedImageIndex ? "24px" : "8px",
                            backgroundColor: i === selectedImageIndex ? primary : "rgba(255,255,255,0.6)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-stone-300">
                  <ShoppingBag className="size-16" />
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {selectedProduct.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-6 pb-0 pt-3 shrink-0">
                {selectedProduct.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(i)}
                    className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all"
                    style={{ borderColor: i === selectedImageIndex ? primary : "transparent" }}
                  >
                    <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">
              {/* Header */}
              <div className="mb-1 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: primary }}>
                {selectedProduct.category?.name ?? "Producto"}
              </div>
              <h3 className="font-display text-2xl font-black leading-tight tracking-[-0.04em] text-stone-900">
                {selectedProduct.name}
              </h3>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold" style={{ color: primary }}>
                  {formatCurrency(
                    matchingVariant && matchingVariant.price !== null
                      ? parseNumber(matchingVariant.price)
                      : selectedProduct.promotion
                        ? parseNumber(selectedProduct.promotion.finalPrice)
                        : parseNumber(selectedProduct.price)
                  )}
                </span>
                {selectedProduct.promotion && (
                  <span className="text-base text-stone-400 line-through">
                    {formatCurrency(parseNumber(selectedProduct.price))}
                  </span>
                )}
              </div>

              {/* Stock info */}
              {matchingVariant ? (
                <p className="mt-1 text-sm text-stone-500">
                  {matchingVariant.stock > 0 ? `${matchingVariant.stock} disponibles` : "Sin stock"}
                  {matchingVariant.weight ? ` • Peso: ${matchingVariant.weight}` : ""}
                  {matchingVariant.sku ? ` • SKU: ${matchingVariant.sku}` : ""}
                </p>
              ) : !selectedProduct.options?.length && selectedProduct.stock > 0 ? (
                <p className="mt-1 text-sm text-stone-500">{selectedProduct.stock} disponibles</p>
              ) : null}

              {/* Description */}
              {(selectedProduct.description || selectedProduct.shortDescription) && (
                <div className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm leading-7 text-stone-600">
                  {selectedProduct.description ?? selectedProduct.shortDescription}
                </div>
              )}

              {/* Options / Variants */}
              {selectedProduct.options && selectedProduct.options.length > 0 && (
                <div className="mt-5 space-y-5">
                  {selectedProduct.options.sort((a, b) => a.position - b.position).map((opt) => (
                    <div key={opt.id}>
                      <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-700">
                        {opt.name}
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {opt.values.sort((a, b) => a.position - b.position).map((val) => {
                          const isSelected = selectedOptions[opt.name] === val.value;
                          return (
                            <button
                              key={val.id}
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val.value }))}
                              className="rounded-full border-2 px-4 py-2 text-sm font-bold transition-all"
                              style={{
                                borderColor: isSelected ? primary : "#e5e7eb",
                                color: isSelected ? primary : "#4b5563",
                                backgroundColor: isSelected ? `${primary}18` : "transparent",
                              }}
                            >
                              {val.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity selector */}
              <div className="mt-6">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-700">
                  Cantidad
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-200 text-stone-600 transition-colors hover:border-stone-400"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-[2.5rem] text-center text-lg font-extrabold text-stone-900">
                    {modalQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalQuantity((q) => q + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-200 text-stone-600 transition-colors hover:border-stone-400"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                {addedConfirm ? (
                  <>
                    <div
                      className="flex items-center gap-3 rounded-2xl p-4"
                      style={{ backgroundColor: `${primary}12` }}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: primary }}
                      >
                        <ShoppingCart className="size-4 text-white" />
                      </div>
                      <p className="text-sm font-bold text-stone-800">
                        <span className="line-clamp-1">{addedConfirm}</span>
                        <span className="block text-xs font-normal text-stone-500">
                          agregado al carrito
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setAddedConfirm(null);
                        setIsCartOpen(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold uppercase tracking-widest text-white transition-all"
                      style={getAccentButtonStyle(primary, secondary)}
                    >
                      <ShoppingBag className="size-4" />
                      Ir al carrito
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setAddedConfirm(null);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 py-4 text-sm font-bold uppercase tracking-widest text-stone-700 transition-all hover:bg-stone-50"
                    >
                      <ArrowRight className="size-4" />
                      Seguir mirando
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        const hasOptions = selectedProduct.options && selectedProduct.options.length > 0;
                        if (hasOptions && !matchingVariant) return;
                        if (hasOptions && matchingVariant && matchingVariant.stock <= 0) return;
                        addToCart(selectedProduct, matchingVariant ?? undefined, modalQuantity);
                      }}
                      disabled={
                        (selectedProduct.options && selectedProduct.options.length > 0 && (!matchingVariant || matchingVariant.stock <= 0)) ||
                        (!selectedProduct.options?.length && selectedProduct.stock <= 0)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                      style={getAccentButtonStyle(primary, secondary)}
                    >
                      {selectedProduct.options && selectedProduct.options.length > 0 && !matchingVariant
                        ? "Selecciona las opciones"
                        : matchingVariant && matchingVariant.stock <= 0
                          ? "Agotado"
                          : selectedProduct.stock <= 0 && !selectedProduct.options?.length
                            ? "Agotado"
                            : "Agregar al carrito"}
                      <ShoppingCart className="size-5" />
                    </button>
                    <a
                      href={buildWhatsAppHref(phone, storefront.tenant.name, selectedProduct.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 py-4 text-sm font-bold uppercase tracking-widest text-stone-700 transition-all hover:bg-stone-50"
                    >
                      <MessageCircleMore className="size-4" />
                      Consultar por WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
