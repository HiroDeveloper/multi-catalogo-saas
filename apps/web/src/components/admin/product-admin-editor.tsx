"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { AdminTenantDetail } from "@/lib/api/admin-types";

type ProductType = AdminTenantDetail["products"][0];

export function ProductAdminEditor({
  product,
  categories,
  onUpdate,
  onSave,
  onDelete,
  isSaving
}: {
  product: ProductType;
  categories: AdminTenantDetail["categories"];
  onUpdate: (updated: ProductType) => void;
  onSave: (product: ProductType) => void;
  onDelete: (id: string) => void;
  isSaving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  // Helper to add an option
  const addOption = () => {
    onUpdate({
      ...product,
      options: [
        ...(product.options || []),
        { id: `new-${Date.now()}`, name: "", position: (product.options?.length || 0), values: [] }
      ]
    });
  };

  const updateOptionName = (idx: number, name: string) => {
    const newOptions = [...(product.options || [])];
    newOptions[idx].name = name;
    onUpdate({ ...product, options: newOptions });
  };

  const addOptionValue = (idx: number, value: string) => {
    if (!value.trim()) return;
    const newOptions = [...(product.options || [])];
    newOptions[idx].values.push({ id: `new-val-${Date.now()}`, value: value.trim(), position: newOptions[idx].values.length });
    onUpdate({ ...product, options: newOptions });
  };

  const removeOption = (idx: number) => {
    const newOptions = [...(product.options || [])];
    newOptions.splice(idx, 1);
    onUpdate({ ...product, options: newOptions });
  };

  const addVariant = () => {
    onUpdate({
      ...product,
      variants: [
        ...(product.variants || []),
        {
          id: `new-var-${Date.now()}`,
          name: "Nueva Variante",
          sku: "",
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: 0,
          weight: 0,
          imageId: null,
          image: null,
          options: [] // To be filled
        }
      ]
    });
  };

  const updateVariant = (vIdx: number, field: string, value: any) => {
    const newVariants = [...(product.variants || [])];
    (newVariants[vIdx] as any)[field] = value;
    onUpdate({ ...product, variants: newVariants });
  };
  
  const removeVariant = (vIdx: number) => {
    const newVariants = [...(product.variants || [])];
    newVariants.splice(vIdx, 1);
    onUpdate({ ...product, variants: newVariants });
  };

  const updateVariantOption = (vIdx: number, optName: string, valName: string) => {
    const newVariants = [...(product.variants || [])];
    const variant = newVariants[vIdx];
    
    // Create a plain Record for API
    const plainOptions = variant.options.reduce((acc, o) => {
      acc[o.option?.name || o.optionId] = o.value?.value || o.valueId;
      return acc;
    }, {} as Record<string, string>);
    
    plainOptions[optName] = valName;
    
    // Reconstruct the array for the UI state
    variant.options = Object.entries(plainOptions).map(([k, v]) => ({
      optionId: k,
      valueId: v,
      option: { name: k },
      value: { value: v }
    }));
    
    onUpdate({ ...product, variants: newVariants });
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 overflow-hidden">
      {/* Header Row */}
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_0.5fr_auto_auto]">
        <input
          value={product.name}
          onChange={(e) => onUpdate({ ...product, name: e.target.value })}
          placeholder="Nombre del producto"
          className="rounded-xl border border-slate-200 px-4 py-2"
        />
        <input
          value={product.slug}
          onChange={(e) => onUpdate({ ...product, slug: e.target.value })}
          placeholder="Slug"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
        <select
          value={product.category?.id ?? ""}
          onChange={(e) => {
            const cat = categories.find((c) => c.id === e.target.value);
            onUpdate({ ...product, category: cat ?? null });
          }}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          value={String(product.price)}
          onChange={(e) => onUpdate({ ...product, price: e.target.value })}
          placeholder="Precio"
          className="rounded-xl border border-slate-200 px-4 py-2"
        />
        <button
          onClick={() => onSave(product)}
          disabled={isSaving}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-slate-600 hover:bg-slate-200"
        >
          {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
        </button>
      </div>

      {/* Expanded Area */}
      {expanded && (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Información General</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-500">Precio Comparación (Descuento)</label>
                  <input
                    value={String(product.compareAtPrice ?? "")}
                    onChange={(e) => onUpdate({ ...product, compareAtPrice: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Stock Base</label>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => onUpdate({ ...product, stock: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">Imagen Principal (URL)</label>
                  <input
                    value={product.images[0]?.url ?? ""}
                    onChange={(e) => {
                      const imgs = [...product.images];
                      if (imgs.length > 0) imgs[0].url = e.target.value;
                      else imgs.push({ id: `new-img`, url: e.target.value, alt: "" });
                      onUpdate({ ...product, images: imgs });
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Options Builder */}
            <div className="space-y-4 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Opciones del Producto</h3>
                <button onClick={addOption} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  + Añadir Opción
                </button>
              </div>
              
              <div className="space-y-3">
                {product.options?.map((opt, oIdx) => (
                  <div key={opt.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={opt.name}
                        onChange={(e) => updateOptionName(oIdx, e.target.value)}
                        placeholder="Ej. Color, Talla"
                        className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm font-medium"
                      />
                      <button onClick={() => removeOption(oIdx)} className="text-red-500">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {opt.values.map(v => (
                        <span key={v.id} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                          {v.value}
                        </span>
                      ))}
                      <input
                        placeholder="Añadir valor y presionar Enter..."
                        className="min-w-[120px] flex-1 rounded border-none bg-transparent px-1 py-0.5 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOptionValue(oIdx, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
                {(!product.options || product.options.length === 0) && (
                  <p className="text-xs text-slate-500">Este producto no tiene opciones (ej. tallas o colores).</p>
                )}
              </div>
            </div>
          </div>

          {/* Variants Grid */}
          {(product.options && product.options.length > 0) && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Variantes</h3>
                <button onClick={addVariant} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  + Añadir Variante Manual
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 font-medium text-slate-500">Opciones</th>
                      <th className="px-3 py-2 font-medium text-slate-500">Nombre Variante</th>
                      <th className="px-3 py-2 font-medium text-slate-500 w-24">Precio</th>
                      <th className="px-3 py-2 font-medium text-slate-500 w-20">Stock</th>
                      <th className="px-3 py-2 font-medium text-slate-500 w-20">Peso</th>
                      <th className="px-3 py-2 font-medium text-slate-500">Imagen URL</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {product.variants?.map((v, vIdx) => {
                      const vOpts = v.options.reduce((acc, o) => {
                        acc[o.option?.name || o.optionId] = o.value?.value || o.valueId;
                        return acc;
                      }, {} as Record<string, string>);

                      return (
                        <tr key={v.id}>
                          <td className="px-3 py-2">
                            <div className="flex flex-col gap-1">
                              {product.options?.map(opt => (
                                <select
                                  key={opt.id}
                                  value={vOpts[opt.name] || ""}
                                  onChange={(e) => updateVariantOption(vIdx, opt.name, e.target.value)}
                                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                                >
                                  <option value="">Seleccionar {opt.name}</option>
                                  {opt.values.map(val => (
                                    <option key={val.id} value={val.value}>{val.value}</option>
                                  ))}
                                </select>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={v.name}
                              onChange={(e) => updateVariant(vIdx, "name", e.target.value)}
                              className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={v.price === null ? "" : String(v.price)}
                              onChange={(e) => updateVariant(vIdx, "price", e.target.value)}
                              className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                              placeholder="Opcional"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => updateVariant(vIdx, "stock", Number(e.target.value))}
                              className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={v.weight === null ? "" : String(v.weight)}
                              onChange={(e) => updateVariant(vIdx, "weight", e.target.value)}
                              className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                              placeholder="kg/lb"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={v.image?.url || v.imageUrl || ""}
                              onChange={(e) => updateVariant(vIdx, "imageUrl", e.target.value)}
                              className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                              placeholder="https://..."
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button onClick={() => removeVariant(vIdx)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onDelete(product.id)}
              className="text-xs font-semibold text-red-500 hover:text-red-700"
            >
              Eliminar Producto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
