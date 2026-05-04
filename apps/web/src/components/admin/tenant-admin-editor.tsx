"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  ImageIcon,
  Package,
  Palette,
  Plus,
  Save,
  Tag,
  TicketPercent,
  Trash2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import {
  createAdminBanner,
  createAdminCategory,
  createAdminProduct,
  createAdminPromotion,
  deleteAdminBanner,
  deleteAdminCategory,
  deleteAdminProduct,
  deleteAdminPromotion,
  getAdminQuoteRequests,
  getAdminTenantDetailClient,
  updateAdminBanner,
  updateAdminCategory,
  updateAdminProduct,
  updateAdminPromotion,
  updateAdminQuoteRequestStatus,
  updateAdminTenant,
} from "@/lib/api/admin-client";
import type { AdminTenantDetail, AdminQuoteRequest } from "@/lib/api/admin-types";
import { ProductAdminEditor } from "./product-admin-editor";

type NewCategoryState = { name: string; slug: string; description: string };
type NewProductState = { name: string; slug: string; categoryId: string; shortDescription: string; price: string; compareAtPrice: string; stock: string; imageUrl: string };
type NewPromotionState = { name: string; slug: string; type: string; couponCode: string; priority: string };
type NewBannerState = { title: string; subtitle: string; imageUrl: string };

const emptyCategory: NewCategoryState = { name: "", slug: "", description: "" };
const emptyProduct: NewProductState = { name: "", slug: "", categoryId: "", shortDescription: "", price: "", compareAtPrice: "", stock: "0", imageUrl: "" };
const emptyPromotion: NewPromotionState = { name: "", slug: "", type: "PERCENTAGE", couponCode: "", priority: "0" };
const emptyBanner: NewBannerState = { title: "", subtitle: "", imageUrl: "" };

const TABS = [
  { id: "general", label: "General", icon: Palette },
  { id: "categories", label: "Categorías", icon: Tag },
  { id: "products", label: "Productos", icon: Package },
  { id: "banners", label: "Banners", icon: ImageIcon },
  { id: "promotions", label: "Promociones", icon: TicketPercent },
  { id: "orders", label: "Pedidos", icon: ClipboardList },
];

export function TenantAdminEditor({ initialTenant }: { initialTenant: AdminTenantDetail }) {
  const [tenant, setTenant] = useState(initialTenant);
  const [activeTab, setActiveTab] = useState("general");
  
  const [newCategory, setNewCategory] = useState<NewCategoryState>(emptyCategory);
  const [newProduct, setNewProduct] = useState<NewProductState>(emptyProduct);
  const [newPromotion, setNewPromotion] = useState<NewPromotionState>(emptyPromotion);
  const [newBanner, setNewBanner] = useState<NewBannerState>(emptyBanner);
  
  const [orders, setOrders] = useState<AdminQuoteRequest[]>([]);
  const [ordersFilter, setOrdersFilter] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [isPending, startTransition] = useTransition();

  async function refreshTenant() {
    const nextTenant = await getAdminTenantDetailClient(tenant.id);
    if (!nextTenant) {
      setError("No se pudo refrescar el tenant.");
      return;
    }
    setTenant(nextTenant);
  }

  async function runMutation(key: string, action: () => Promise<unknown>) {
    setBusyKey(key);
    setError("");
    setFeedback("");
    try {
      const response = await action();
      if (!response) {
        setError("La operación no se pudo completar.");
        return;
      }
      startTransition(() => { void refreshTenant(); });
      setFeedback("Cambios guardados exitosamente.");
      setTimeout(() => setFeedback(""), 3000);
    } finally {
      setBusyKey("");
    }
  }

  function isBusy(key: string) { return busyKey === key || isPending; }

  async function loadQuoteRequests(status?: string) {
    setOrdersFilter(status ?? "");
    setOrdersLoading(true);
    try {
      const result = await getAdminQuoteRequests(tenant.id, status);
      if (result && result.quoteRequests) setOrders(result.quoteRequests as AdminQuoteRequest[]);
    } finally {
      setOrdersLoading(false);
    }
  }

  useState(() => { void loadQuoteRequests(); });

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 font-sans text-neutral-900">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/tenants" className="text-neutral-500 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-neutral-900">{tenant.name}</h1>
                <div className="text-xs font-medium text-neutral-500 flex items-center gap-2">
                  <span>{tenant.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lvh.me'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/t/${tenant.subdomain}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-white border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Ver tienda
              </a>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar gap-1 pt-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive 
                      ? "border-black text-black" 
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Notifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {feedback && (
          <div className="rounded-md bg-green-50 border border-green-200 p-4 mb-6">
            <p className="text-sm font-medium text-green-800">{feedback}</p>
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-6">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* TAB: GENERAL */}
        {activeTab === "general" && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white shadow-sm border border-neutral-200 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50">
                <h3 className="text-base font-semibold leading-6 text-neutral-900">Configuración General</h3>
                <p className="mt-1 text-sm text-neutral-500">Administra la identidad básica y el branding de la tienda.</p>
              </div>
              <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Nombre de la Empresa</label>
                  <input
                    type="text"
                    value={tenant.name}
                    onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Subdominio</label>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="text"
                      value={tenant.subdomain}
                      onChange={(e) => setTenant({ ...tenant, subdomain: e.target.value })}
                      className="block w-full rounded-none rounded-l-md border-neutral-300 focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                    />
                    <span className="inline-flex items-center rounded-r-md border border-l-0 border-neutral-300 bg-neutral-50 px-3 text-neutral-500 sm:text-sm">
                      .{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lvh.me'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Número de WhatsApp (Ventas)</label>
                  <input
                    type="text"
                    value={tenant.whatsappNumber ?? ""}
                    onChange={(e) => setTenant({ ...tenant, whatsappNumber: e.target.value })}
                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Plan</label>
                  <input
                    type="text"
                    value={tenant.plan}
                    onChange={(e) => setTenant({ ...tenant, plan: e.target.value })}
                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border bg-neutral-50"
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Color Primario</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={tenant.primaryColor ?? "#1768e5"}
                      onChange={(e) => setTenant({ ...tenant, primaryColor: e.target.value })}
                      className="h-9 w-9 rounded border border-neutral-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={tenant.primaryColor ?? ""}
                      onChange={(e) => setTenant({ ...tenant, primaryColor: e.target.value })}
                      className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Color Secundario</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={tenant.secondaryColor ?? "#25c1f6"}
                      onChange={(e) => setTenant({ ...tenant, secondaryColor: e.target.value })}
                      className="h-9 w-9 rounded border border-neutral-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={tenant.secondaryColor ?? ""}
                      onChange={(e) => setTenant({ ...tenant, secondaryColor: e.target.value })}
                      className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    void runMutation("branding", () =>
                      updateAdminTenant(tenant.id, {
                        name: tenant.name,
                        subdomain: tenant.subdomain,
                        whatsappNumber: tenant.whatsappNumber,
                        plan: tenant.plan,
                        primaryColor: tenant.primaryColor,
                        secondaryColor: tenant.secondaryColor,
                        coverUrl: tenant.coverUrl,
                      }),
                    )
                  }
                  disabled={isBusy("branding")}
                  className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="bg-white shadow-sm border border-neutral-200 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold leading-6 text-neutral-900">Categorías de Productos</h3>
                  <p className="mt-1 text-sm text-neutral-500">Organiza tu catálogo para que los clientes encuentren los productos fácilmente.</p>
                </div>
              </div>
              
              <div className="divide-y divide-neutral-200">
                {tenant.categories.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500 text-sm">No hay categorías creadas.</div>
                ) : (
                  tenant.categories.map((category) => (
                    <div key={category.id} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-neutral-50/50 transition-colors">
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-neutral-500">Nombre</label>
                        <input
                          value={category.name}
                          onChange={(e) => setTenant(curr => ({...curr, categories: curr.categories.map(c => c.id === category.id ? {...c, name: e.target.value} : c)}))}
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-1.5 border"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-neutral-500">Slug</label>
                        <input
                          value={category.slug}
                          onChange={(e) => setTenant(curr => ({...curr, categories: curr.categories.map(c => c.id === category.id ? {...c, slug: e.target.value} : c)}))}
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-1.5 border"
                        />
                      </div>
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-xs font-medium text-neutral-500">Descripción</label>
                        <input
                          value={category.description ?? ""}
                          onChange={(e) => setTenant(curr => ({...curr, categories: curr.categories.map(c => c.id === category.id ? {...c, description: e.target.value} : c)}))}
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-1.5 border"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-end justify-end gap-2 pt-5">
                        <button
                          type="button"
                          onClick={() => void runMutation(`cat-${category.id}`, () => updateAdminCategory(category.id, { name: category.name, slug: category.slug, description: category.description }))}
                          disabled={isBusy(`cat-${category.id}`)}
                          className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-md transition-colors"
                          title="Guardar"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { if(confirm("¿Eliminar?")) void runMutation(`cat-del-${category.id}`, () => deleteAdminCategory(category.id)); }}
                          disabled={isBusy(`cat-del-${category.id}`)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="px-6 py-5 bg-neutral-50 border-t border-neutral-200">
                <h4 className="text-sm font-medium text-neutral-900 mb-4">Añadir nueva categoría</h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-3">
                    <input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="Nombre"
                      className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      value={newCategory.slug}
                      onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                      placeholder="slug-url"
                      className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <input
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Descripción corta"
                      className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => void runMutation("cat-add", async () => {
                        const res = await createAdminCategory(tenant.id, newCategory);
                        if (res) setNewCategory(emptyCategory);
                        return res;
                      })}
                      disabled={isBusy("cat-add") || !newCategory.name}
                      className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" /> Añadir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PRODUCTS */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Catálogo de Productos</h2>
                <p className="text-sm text-neutral-500 mt-1">Gestiona inventario, precios y variantes.</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800"
                onClick={() => {
                  const el = document.getElementById("new-product-form");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Plus className="h-4 w-4" />
                Nuevo Producto
              </button>
            </div>
            
            <div className="space-y-4">
              {tenant.products.map((product) => (
                <div key={product.id} className="bg-white shadow-sm border border-neutral-200 rounded-xl p-6">
                   <ProductAdminEditor
                    product={product}
                    categories={tenant.categories}
                    isSaving={isBusy(`product-${product.id}`)}
                    onUpdate={(updatedProduct) => {
                      setTenant((current) => ({
                        ...current,
                        products: current.products.map((item) =>
                          item.id === product.id ? updatedProduct : item
                        ),
                      }));
                    }}
                    onSave={() => {
                      void runMutation(`product-${product.id}`, () =>
                        updateAdminProduct(product.id, {
                          name: product.name,
                          slug: product.slug,
                          categoryId: product.category?.id ?? null,
                          shortDescription: product.shortDescription,
                          price: product.price,
                          compareAtPrice: product.compareAtPrice,
                          stock: product.stock,
                          imageUrl: product.images[0]?.url ?? "",
                          options: product.options?.map(o => ({
                            name: o.name,
                            position: o.position,
                            values: o.values.map(v => v.value)
                          })),
                          variants: product.variants?.map(v => ({
                            name: v.name,
                            sku: v.sku,
                            price: v.price,
                            compareAtPrice: v.compareAtPrice,
                            stock: v.stock,
                            weight: v.weight,
                            imageUrl: v.image?.url || v.imageUrl,
                            options: v.options.reduce((acc, o) => {
                              acc[o.option?.name || o.optionId] = o.value?.value || o.valueId;
                              return acc;
                            }, {} as Record<string, string>)
                          }))
                        })
                      );
                    }}
                    onDelete={() => {
                      void runMutation(`product-delete-${product.id}`, () =>
                        deleteAdminProduct(product.id)
                      );
                    }}
                  />
                </div>
              ))}
            </div>

            {/* New Product Form */}
            <div id="new-product-form" className="bg-white shadow-sm border border-neutral-200 rounded-xl overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50">
                <h3 className="text-base font-semibold leading-6 text-neutral-900">Crear nuevo producto (Básico)</h3>
                <p className="mt-1 text-sm text-neutral-500">Añade los datos básicos. Podrás agregar variantes (tallas/colores) una vez creado.</p>
              </div>
              <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Nombre</label>
                  <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Slug</label>
                  <input value={newProduct.slug} onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Categoría</label>
                  <select value={newProduct.categoryId} onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border bg-white">
                    <option value="">Sin categoría</option>
                    {tenant.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Stock Base</label>
                  <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Precio de Venta</label>
                  <input type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Precio Anterior (Tachado)</label>
                  <input type="number" step="0.01" value={newProduct.compareAtPrice} onChange={(e) => setNewProduct({ ...newProduct, compareAtPrice: e.target.value })} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">URL Imagen Principal</label>
                  <input value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border" />
                </div>
              </div>
              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => void runMutation("prod-add", async () => {
                    const res = await createAdminProduct(tenant.id, { ...newProduct, categoryId: newProduct.categoryId || null });
                    if (res) setNewProduct(emptyProduct);
                    return res;
                  })}
                  disabled={isBusy("prod-add") || !newProduct.name}
                  className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Crear Producto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BANNERS & PROMOS (COMBINED) */}
        {(activeTab === "banners" || activeTab === "promotions") && (
          <div className="space-y-8 max-w-5xl">
            {/* BANNERS */}
            {activeTab === "banners" && (
              <div className="bg-white shadow-sm border border-neutral-200 rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50">
                  <h3 className="text-base font-semibold leading-6 text-neutral-900">Banners del Storefront</h3>
                </div>
                <div className="divide-y divide-neutral-200">
                  {(tenant.banners || []).map((banner) => (
                    <div key={banner.id} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-neutral-500">Título</label>
                        <input value={banner.title} onChange={(e) => setTenant(curr => ({...curr, banners: curr.banners.map(b => b.id === banner.id ? {...b, title: e.target.value} : b)}))} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black sm:text-sm px-3 py-1.5 border" />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-neutral-500">Imagen URL</label>
                        <input value={banner.imageUrl} onChange={(e) => setTenant(curr => ({...curr, banners: curr.banners.map(b => b.id === banner.id ? {...b, imageUrl: e.target.value} : b)}))} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black sm:text-sm px-3 py-1.5 border" />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-neutral-500">Estado</label>
                        <select value={banner.status} onChange={(e) => setTenant(curr => ({...curr, banners: curr.banners.map(b => b.id === banner.id ? {...b, status: e.target.value} : b)}))} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-black sm:text-sm px-3 py-1.5 border bg-white">
                          <option value="ACTIVE">Activo</option>
                          <option value="DRAFT">Borrador</option>
                        </select>
                      </div>
                      <div className="md:col-span-3 flex justify-end gap-2 pt-5">
                        <button type="button" onClick={() => void runMutation(`banner-${banner.id}`, () => updateAdminBanner(banner.id, { title: banner.title, subtitle: banner.subtitle, imageUrl: banner.imageUrl, status: banner.status }))} className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-md transition-colors">Guardar</button>
                        <button type="button" onClick={() => void runMutation(`banner-del-${banner.id}`, () => deleteAdminBanner(banner.id))} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-md transition-colors"><Trash2 className="h-4 w-4"/></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-5 bg-neutral-50 border-t border-neutral-200 flex gap-4 items-end">
                  <div className="flex-1"><label className="text-xs font-medium text-neutral-500 block mb-1">Nuevo Título</label><input value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="block w-full rounded-md border-neutral-300 shadow-sm px-3 py-1.5 border" /></div>
                  <div className="flex-1"><label className="text-xs font-medium text-neutral-500 block mb-1">URL Imagen</label><input value={newBanner.imageUrl} onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})} className="block w-full rounded-md border-neutral-300 shadow-sm px-3 py-1.5 border" /></div>
                  <button type="button" onClick={() => void runMutation("banner-add", async () => { const res = await createAdminBanner(tenant.id, newBanner); if(res) setNewBanner(emptyBanner); return res; })} className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium">Añadir Banner</button>
                </div>
              </div>
            )}
            
            {/* PROMOTIONS */}
            {activeTab === "promotions" && (
              <div className="bg-white shadow-sm border border-neutral-200 rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50">
                  <h3 className="text-base font-semibold leading-6 text-neutral-900">Promociones y Cupones</h3>
                </div>
                <div className="divide-y divide-neutral-200">
                  {(tenant.promotions || []).map((promo) => (
                    <div key={promo.id} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-neutral-500">Nombre</label>
                        <input value={promo.name} onChange={(e) => setTenant(curr => ({...curr, promotions: curr.promotions.map(p => p.id === promo.id ? {...p, name: e.target.value} : p)}))} className="block w-full rounded-md border-neutral-300 shadow-sm px-3 py-1.5 border" />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-neutral-500">Cupón (Code)</label>
                        <input value={promo.couponCode || ''} onChange={(e) => setTenant(curr => ({...curr, promotions: curr.promotions.map(p => p.id === promo.id ? {...p, couponCode: e.target.value} : p)}))} className="block w-full rounded-md border-neutral-300 shadow-sm px-3 py-1.5 border" />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-neutral-500">Tipo</label>
                        <select value={promo.type} onChange={(e) => setTenant(curr => ({...curr, promotions: curr.promotions.map(p => p.id === promo.id ? {...p, type: e.target.value} : p)}))} className="block w-full rounded-md border-neutral-300 shadow-sm px-3 py-1.5 border bg-white">
                          <option value="PERCENTAGE">Porcentaje %</option>
                          <option value="FIXED_AMOUNT">Monto Fijo</option>
                        </select>
                      </div>
                      <div className="md:col-span-3 flex justify-end gap-2 pt-5">
                        <button type="button" onClick={() => void runMutation(`promo-${promo.id}`, () => updateAdminPromotion(promo.id, { name: promo.name, type: promo.type, couponCode: promo.couponCode }))} className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-md transition-colors">Guardar</button>
                        <button type="button" onClick={() => void runMutation(`promo-del-${promo.id}`, () => deleteAdminPromotion(promo.id))} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-md transition-colors"><Trash2 className="h-4 w-4"/></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-5 bg-neutral-50 border-t border-neutral-200 flex gap-4 items-end">
                  <div className="flex-1"><label className="text-xs font-medium text-neutral-500 block mb-1">Nombre Promoción</label><input value={newPromotion.name} onChange={e => setNewPromotion({...newPromotion, name: e.target.value})} className="block w-full rounded-md border-neutral-300 shadow-sm px-3 py-1.5 border" /></div>
                  <div className="flex-1"><label className="text-xs font-medium text-neutral-500 block mb-1">Código Cupón</label><input value={newPromotion.couponCode} onChange={e => setNewPromotion({...newPromotion, couponCode: e.target.value})} className="block w-full rounded-md border-neutral-300 shadow-sm px-3 py-1.5 border" /></div>
                  <button type="button" onClick={() => void runMutation("promo-add", async () => { const res = await createAdminPromotion(tenant.id, newPromotion); if(res) setNewPromotion(emptyPromotion); return res; })} className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium">Crear Promoción</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: ORDERS */}
        {activeTab === "orders" && (
          <div className="bg-white shadow-sm border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
              <h3 className="text-base font-semibold leading-6 text-neutral-900">Solicitudes y Pedidos (B2B)</h3>
              <div className="flex gap-2">
                {["", "PENDING", "SENT", "VIEWED", "CLOSED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => void loadQuoteRequests(s || undefined)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      ordersFilter === s ? "bg-black text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {s === "" ? "Todos" : s === "PENDING" ? "Pendientes" : s === "SENT" ? "Enviados" : s === "VIEWED" ? "Vistos" : "Cerrados"}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="divide-y divide-neutral-200">
              {ordersLoading ? (
                <div className="p-12 text-center text-neutral-500">Cargando historial de pedidos...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-neutral-500">No hay pedidos registrados.</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900">{order.customerName}</h4>
                        <p className="text-sm text-neutral-500">{order.customerPhone} {order.customerEmail ? `· ${order.customerEmail}` : ""}</p>
                        <p className="text-xs text-neutral-400 mt-1">{new Date(order.createdAt).toLocaleString('es-CO')}</p>
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => void runMutation(`order-status-${order.id}`, async () => {
                          const result = await updateAdminQuoteRequestStatus(order.id, e.target.value);
                          if(result) void loadQuoteRequests(ordersFilter || undefined);
                          return result;
                        })}
                        className="rounded-md border-neutral-300 shadow-sm focus:border-black sm:text-sm px-3 py-1.5 border bg-white"
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="SENT">Enviado</option>
                        <option value="VIEWED">Visto</option>
                        <option value="CLOSED">Cerrado</option>
                      </select>
                    </div>
                    
                    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                      <div className="space-y-2 mb-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-neutral-700">{item.quantity}x {item.productName}</span>
                            <span className="font-medium text-neutral-900">${item.unitPrice ?? "0.00"}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between border-t border-neutral-200 pt-3 text-sm font-bold text-neutral-900">
                        <span>Total de Compra</span>
                        <span>${order.total ?? "0.00"} {order.currency}</span>
                      </div>
                    </div>
                    {order.message && (
                      <div className="mt-3 text-sm text-neutral-600 bg-amber-50 p-3 rounded-md border border-amber-100">
                        <span className="font-semibold text-amber-900 block mb-1">Nota del cliente:</span>
                        {order.message}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
