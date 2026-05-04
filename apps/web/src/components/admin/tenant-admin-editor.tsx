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

type TenantAdminEditorProps = {
  initialTenant: AdminTenantDetail;
};

type NewCategoryState = {
  name: string;
  slug: string;
  description: string;
};

type NewProductState = {
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  imageUrl: string;
};

type NewPromotionState = {
  name: string;
  slug: string;
  type: string;
  couponCode: string;
  priority: string;
};

const emptyCategory: NewCategoryState = {
  name: "",
  slug: "",
  description: "",
};

const emptyProduct: NewProductState = {
  name: "",
  slug: "",
  categoryId: "",
  shortDescription: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  imageUrl: "",
};

const emptyPromotion: NewPromotionState = {
  name: "",
  slug: "",
  type: "PERCENTAGE",
  couponCode: "",
  priority: "0",
};

type NewBannerState = {
  title: string;
  subtitle: string;
  imageUrl: string;
};

const emptyBanner: NewBannerState = {
  title: "",
  subtitle: "",
  imageUrl: "",
};

export function TenantAdminEditor({ initialTenant }: TenantAdminEditorProps) {
  const [tenant, setTenant] = useState(initialTenant);
  const [newCategory, setNewCategory] = useState<NewCategoryState>(emptyCategory);
  const [newProduct, setNewProduct] = useState<NewProductState>(emptyProduct);
  const [newPromotion, setNewPromotion] =
    useState<NewPromotionState>(emptyPromotion);
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
        setError("La operacion no se pudo completar.");
        return;
      }

      startTransition(() => {
        void refreshTenant();
      });
      setFeedback("Cambios guardados.");
    } finally {
      setBusyKey("");
    }
  }

  function isBusy(key: string) {
    return busyKey === key || isPending;
  }

  async function loadQuoteRequests(status?: string) {
    setOrdersFilter(status ?? "");
    setOrdersLoading(true);
    try {
      const result = await getAdminQuoteRequests(tenant.id, status);
      if (result && result.quoteRequests) {
        setOrders(result.quoteRequests as AdminQuoteRequest[]);
      }
    } finally {
      setOrdersLoading(false);
    }
  }

  // Load orders on mount
  useState(() => {
    void loadQuoteRequests();
  });

  return (
    <main className="min-h-screen bg-[#eef3ff] p-4 text-slate-900 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[28px] bg-white px-6 py-5 shadow-[0_20px_50px_rgba(23,104,229,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Editor tenant
              </div>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                {tenant.name}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {tenant.subdomain}.lvh.me · {tenant._count.products} productos ·{" "}
                {tenant._count.categories} categorias
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/tenants"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                <ArrowLeft className="size-4" />
                Volver
              </Link>
              <a
                href={`http://${tenant.subdomain}.lvh.me:3000/`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-5 py-3 text-sm font-semibold text-white"
              >
                Ver tienda
              </a>
            </div>
          </div>
          {feedback ? (
            <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {feedback}
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </header>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(23,104,229,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#1768e5] text-white">
                <Palette className="size-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Branding
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  Configuracion visual
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-600">Nombre</span>
                <input
                  value={tenant.name}
                  onChange={(event) =>
                    setTenant((current) => ({ ...current, name: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-600">Subdominio</span>
                <input
                  value={tenant.subdomain}
                  onChange={(event) =>
                    setTenant((current) => ({
                      ...current,
                      subdomain: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-600">WhatsApp</span>
                <input
                  value={tenant.whatsappNumber ?? ""}
                  onChange={(event) =>
                    setTenant((current) => ({
                      ...current,
                      whatsappNumber: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-600">Plan</span>
                <input
                  value={tenant.plan}
                  onChange={(event) =>
                    setTenant((current) => ({ ...current, plan: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-600">Color primario</span>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={tenant.primaryColor ?? "#1768e5"}
                    onChange={(event) =>
                      setTenant((current) => ({
                        ...current,
                        primaryColor: event.target.value,
                      }))
                    }
                    className="h-12 w-16 rounded-xl border border-slate-200 bg-transparent"
                  />
                  <input
                    value={tenant.primaryColor ?? ""}
                    onChange={(event) =>
                      setTenant((current) => ({
                        ...current,
                        primaryColor: event.target.value,
                      }))
                    }
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3"
                  />
                </div>
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-600">Color secundario</span>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={tenant.secondaryColor ?? "#25c1f6"}
                    onChange={(event) =>
                      setTenant((current) => ({
                        ...current,
                        secondaryColor: event.target.value,
                      }))
                    }
                    className="h-12 w-16 rounded-xl border border-slate-200 bg-transparent"
                  />
                  <input
                    value={tenant.secondaryColor ?? ""}
                    onChange={(event) =>
                      setTenant((current) => ({
                        ...current,
                        secondaryColor: event.target.value,
                      }))
                    }
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3"
                  />
                </div>
              </label>
              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium text-slate-600">Imagen cover</span>
                <input
                  value={tenant.coverUrl ?? ""}
                  onChange={(event) =>
                    setTenant((current) => ({ ...current, coverUrl: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
            </div>

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
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Save className="size-4" />
              Guardar branding
            </button>
          </article>

          <article className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(23,104,229,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#1768e5] text-white">
                <Tag className="size-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Categorias
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  Gestion de categorias
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {tenant.categories.map((category) => (
                <div key={category.id} className="rounded-[24px] border border-slate-200 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={category.name}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          categories: current.categories.map((item) =>
                            item.id === category.id
                              ? { ...item, name: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={category.slug}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          categories: current.categories.map((item) =>
                            item.id === category.id
                              ? { ...item, slug: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={category.description ?? ""}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          categories: current.categories.map((item) =>
                            item.id === category.id
                              ? { ...item, description: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        void runMutation(`category-${category.id}`, () =>
                          updateAdminCategory(category.id, {
                            name: category.name,
                            slug: category.slug,
                            description: category.description,
                          }),
                        )
                      }
                      disabled={isBusy(`category-${category.id}`)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      <Save className="size-4" />
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void runMutation(`category-delete-${category.id}`, () =>
                          deleteAdminCategory(category.id),
                        )
                      }
                      disabled={isBusy(`category-delete-${category.id}`)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="size-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Nueva categoria</div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  value={newCategory.name}
                  onChange={(event) =>
                    setNewCategory((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Nombre"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={newCategory.slug}
                  onChange={(event) =>
                    setNewCategory((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                  placeholder="Slug"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={newCategory.description}
                  onChange={(event) =>
                    setNewCategory((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Descripcion"
                  className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  void runMutation("category-create", async () => {
                    const response = await createAdminCategory(tenant.id, newCategory);
                    if (response) {
                      setNewCategory(emptyCategory);
                    }
                    return response;
                  })
                }
                disabled={isBusy("category-create")}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Plus className="size-4" />
                Crear categoria
              </button>
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(23,104,229,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#1768e5] text-white">
                <Package className="size-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Productos
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  Gestion de catalogo
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {tenant.products.map((product) => (
                <div key={product.id} className="rounded-[24px] border border-slate-200 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={product.name}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          products: current.products.map((item) =>
                            item.id === product.id
                              ? { ...item, name: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={product.slug}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          products: current.products.map((item) =>
                            item.id === product.id
                              ? { ...item, slug: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <select
                      value={product.category?.id ?? ""}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          products: current.products.map((item) =>
                            item.id === product.id
                              ? {
                                  ...item,
                                  category:
                                    current.categories.find(
                                      (category) => category.id === event.target.value,
                                    ) ?? null,
                                }
                              : item,
                          ),
                        }))
                      }
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    >
                      <option value="">Sin categoria</option>
                      {tenant.categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={String(product.price)}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          products: current.products.map((item) =>
                            item.id === product.id
                              ? { ...item, price: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={String(product.compareAtPrice ?? "")}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          products: current.products.map((item) =>
                            item.id === product.id
                              ? { ...item, compareAtPrice: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      placeholder="Precio anterior"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={String(product.stock)}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          products: current.products.map((item) =>
                            item.id === product.id
                              ? { ...item, stock: Number(event.target.value) }
                              : item,
                          ),
                        }))
                      }
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={product.images[0]?.url ?? ""}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          products: current.products.map((item) =>
                            item.id === product.id
                              ? {
                                  ...item,
                                  images: item.images[0]
                                    ? [{ ...item.images[0], url: event.target.value }]
                                    : [
                                        {
                                          id: `draft-${item.id}`,
                                          url: event.target.value,
                                          alt: item.name,
                                        },
                                      ],
                                }
                              : item,
                          ),
                        }))
                      }
                      placeholder="Imagen URL"
                      className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                    />
                    <input
                      value={product.shortDescription ?? ""}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          products: current.products.map((item) =>
                            item.id === product.id
                              ? { ...item, shortDescription: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      placeholder="Descripcion corta"
                      className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
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
                          }),
                        )
                      }
                      disabled={isBusy(`product-${product.id}`)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      <Save className="size-4" />
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void runMutation(`product-delete-${product.id}`, () =>
                          deleteAdminProduct(product.id),
                        )
                      }
                      disabled={isBusy(`product-delete-${product.id}`)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="size-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Nuevo producto</div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input value={newProduct.name} onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre" className="rounded-2xl border border-slate-200 px-4 py-3" />
                <input value={newProduct.slug} onChange={(event) => setNewProduct((current) => ({ ...current, slug: event.target.value }))} placeholder="Slug" className="rounded-2xl border border-slate-200 px-4 py-3" />
                <select value={newProduct.categoryId} onChange={(event) => setNewProduct((current) => ({ ...current, categoryId: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3">
                  <option value="">Sin categoria</option>
                  {tenant.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input value={newProduct.price} onChange={(event) => setNewProduct((current) => ({ ...current, price: event.target.value }))} placeholder="Precio" className="rounded-2xl border border-slate-200 px-4 py-3" />
                <input value={newProduct.compareAtPrice} onChange={(event) => setNewProduct((current) => ({ ...current, compareAtPrice: event.target.value }))} placeholder="Precio anterior" className="rounded-2xl border border-slate-200 px-4 py-3" />
                <input value={newProduct.stock} onChange={(event) => setNewProduct((current) => ({ ...current, stock: event.target.value }))} placeholder="Stock" className="rounded-2xl border border-slate-200 px-4 py-3" />
                <input value={newProduct.imageUrl} onChange={(event) => setNewProduct((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="Imagen URL" className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" />
                <input value={newProduct.shortDescription} onChange={(event) => setNewProduct((current) => ({ ...current, shortDescription: event.target.value }))} placeholder="Descripcion corta" className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" />
              </div>
              <button
                type="button"
                onClick={() =>
                  void runMutation("product-create", async () => {
                    const response = await createAdminProduct(tenant.id, {
                      ...newProduct,
                      categoryId: newProduct.categoryId || null,
                    });
                    if (response) {
                      setNewProduct(emptyProduct);
                    }
                    return response;
                  })
                }
                disabled={isBusy("product-create")}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Plus className="size-4" />
                Crear producto
              </button>
            </div>
          </article>

          <article className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(23,104,229,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#1768e5] text-white">
                <TicketPercent className="size-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Promociones
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  Campañas y cupones
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {tenant.promotions.map((promotion) => (
                <div key={promotion.id} className="rounded-[24px] border border-slate-200 p-4">
                  <div className="grid gap-3">
                    <input value={promotion.name} onChange={(event) => setTenant((current) => ({ ...current, promotions: current.promotions.map((item) => item.id === promotion.id ? { ...item, name: event.target.value } : item) }))} className="rounded-2xl border border-slate-200 px-4 py-3" />
                    <div className="grid gap-3 md:grid-cols-2">
                      <select value={promotion.type} onChange={(event) => setTenant((current) => ({ ...current, promotions: current.promotions.map((item) => item.id === promotion.id ? { ...item, type: event.target.value } : item) }))} className="rounded-2xl border border-slate-200 px-4 py-3">
                        <option value="PERCENTAGE">PERCENTAGE</option>
                        <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
                        <option value="SPECIAL_PRICE">SPECIAL_PRICE</option>
                        <option value="BUY_X_GET_Y">BUY_X_GET_Y</option>
                      </select>
                      <input value={promotion.couponCode ?? promotion.coupons[0]?.code ?? ""} onChange={(event) => setTenant((current) => ({ ...current, promotions: current.promotions.map((item) => item.id === promotion.id ? { ...item, couponCode: event.target.value } : item) }))} placeholder="Coupon code" className="rounded-2xl border border-slate-200 px-4 py-3" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => void runMutation(`promotion-${promotion.id}`, () => updateAdminPromotion(promotion.id, { name: promotion.name, type: promotion.type, couponCode: promotion.couponCode }))} disabled={isBusy(`promotion-${promotion.id}`)} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                      <Save className="size-4" />
                      Guardar
                    </button>
                    <button type="button" onClick={() => void runMutation(`promotion-delete-${promotion.id}`, () => deleteAdminPromotion(promotion.id))} disabled={isBusy(`promotion-delete-${promotion.id}`)} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50">
                      <Trash2 className="size-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Nueva promocion</div>
              <div className="mt-4 grid gap-3">
                <input value={newPromotion.name} onChange={(event) => setNewPromotion((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre" className="rounded-2xl border border-slate-200 px-4 py-3" />
                <div className="grid gap-3 md:grid-cols-2">
                  <select value={newPromotion.type} onChange={(event) => setNewPromotion((current) => ({ ...current, type: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3">
                    <option value="PERCENTAGE">PERCENTAGE</option>
                    <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
                    <option value="SPECIAL_PRICE">SPECIAL_PRICE</option>
                    <option value="BUY_X_GET_Y">BUY_X_GET_Y</option>
                  </select>
                  <input value={newPromotion.couponCode} onChange={(event) => setNewPromotion((current) => ({ ...current, couponCode: event.target.value }))} placeholder="Coupon code" className="rounded-2xl border border-slate-200 px-4 py-3" />
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  void runMutation("promotion-create", async () => {
                    const response = await createAdminPromotion(tenant.id, newPromotion);
                    if (response) {
                      setNewPromotion(emptyPromotion);
                    }
                    return response;
                  })
                }
                disabled={isBusy("promotion-create")}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Plus className="size-4" />
                Crear promocion
              </button>
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(23,104,229,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#1768e5] text-white">
                <ImageIcon className="size-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Banners
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  Banners del storefront
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {(tenant.banners ?? []).map((banner) => (
                <div key={banner.id} className="rounded-[24px] border border-slate-200 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={banner.title}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          banners: current.banners.map((item) =>
                            item.id === banner.id
                              ? { ...item, title: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      placeholder="Titulo"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={banner.subtitle ?? ""}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          banners: current.banners.map((item) =>
                            item.id === banner.id
                              ? { ...item, subtitle: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      placeholder="Subtitulo"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={banner.imageUrl}
                      onChange={(event) =>
                        setTenant((current) => ({
                          ...current,
                          banners: current.banners.map((item) =>
                            item.id === banner.id
                              ? { ...item, imageUrl: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      placeholder="URL de imagen"
                      className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        void runMutation(`banner-${banner.id}`, () =>
                          updateAdminBanner(banner.id, {
                            title: banner.title,
                            subtitle: banner.subtitle,
                            imageUrl: banner.imageUrl,
                            status: banner.status,
                          }),
                        )
                      }
                      disabled={isBusy(`banner-${banner.id}`)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      <Save className="size-4" />
                      Guardar
                    </button>
                    <select
                      value={banner.status}
                      onChange={(event) =>
                        void runMutation(`banner-status-${banner.id}`, () =>
                          updateAdminBanner(banner.id, {
                            status: event.target.value,
                          }),
                        )
                      }
                      className="rounded-full border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="DRAFT">Borrador</option>
                      <option value="ACTIVE">Activo</option>
                      <option value="ARCHIVED">Archivado</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirm("Seguro que quieres eliminar este banner?")) return;
                        void runMutation(`banner-delete-${banner.id}`, () =>
                          deleteAdminBanner(banner.id),
                        );
                      }}
                      disabled={isBusy(`banner-delete-${banner.id}`)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="size-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Nuevo banner</div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  value={newBanner.title}
                  onChange={(event) =>
                    setNewBanner((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Titulo"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={newBanner.subtitle}
                  onChange={(event) =>
                    setNewBanner((current) => ({
                      ...current,
                      subtitle: event.target.value,
                    }))
                  }
                  placeholder="Subtitulo"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={newBanner.imageUrl}
                  onChange={(event) =>
                    setNewBanner((current) => ({
                      ...current,
                      imageUrl: event.target.value,
                    }))
                  }
                  placeholder="URL de imagen"
                  className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  void runMutation("banner-create", async () => {
                    const response = await createAdminBanner(tenant.id, newBanner);
                    if (response) {
                      setNewBanner(emptyBanner);
                    }
                    return response;
                  })
                }
                disabled={isBusy("banner-create")}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1768e5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Plus className="size-4" />
                Crear banner
              </button>
            </div>
          </article>

          <article className="rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(23,104,229,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#1768e5] text-white">
                <ClipboardList className="size-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Pedidos
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  Solicitudes de pedido
                </h2>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {["", "PENDING", "SENT", "VIEWED", "CLOSED"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void loadQuoteRequests(s || undefined)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    ordersFilter === s
                      ? "bg-[#1768e5] text-white"
                      : "border border-slate-200 text-slate-600"
                  }`}
                >
                  {s || "Todos"}
                </button>
              ))}
            </div>

            <div className="mt-6 max-h-[600px] space-y-4 overflow-y-auto">
              {ordersLoading ? (
                <div className="py-8 text-center text-sm text-slate-400">Cargando pedidos...</div>
              ) : orders.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                  No hay pedidos
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-[24px] border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {order.customerName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {order.customerPhone}
                          {order.customerEmail ? ` · ${order.customerEmail}` : ""}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString("es-CO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <select
                        value={order.status}
                        onChange={(event) =>
                          void runMutation(`order-status-${order.id}`, async () => {
                            const result = await updateAdminQuoteRequestStatus(
                              order.id,
                              event.target.value,
                            );
                            if (result) {
                              void loadQuoteRequests(ordersFilter || undefined);
                            }
                            return result;
                          })
                        }
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold"
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="SENT">Enviado</option>
                        <option value="VIEWED">Visto</option>
                        <option value="CLOSED">Cerrado</option>
                      </select>
                    </div>
                    <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-700">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-medium text-slate-900">
                            ${item.unitPrice ?? "0.00"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-900">
                      <span>Total</span>
                      <span>${order.total ?? "0.00"} {order.currency}</span>
                    </div>
                    {order.message ? (
                      <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        {order.message}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
