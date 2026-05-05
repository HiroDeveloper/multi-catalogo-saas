"use client";

import { useState } from "react";
import { Plus, Trash2, Palette, Ruler, Weight, ChevronDown, ChevronUp } from "lucide-react";
import { AdminTenantDetail } from "@/lib/api/admin-types";
import { ImageUploadButton } from "./image-upload-button";

type ProductType = AdminTenantDetail["products"][0];

// ---- Option type detection helpers ----
const isColorOption = (name: string) => /colou?r|color/i.test(name);
const isSizeOption  = (name: string) => /talla|size|tama[ñn]o/i.test(name);
const isWeightOption = (name: string) => /peso|weight/i.test(name);

// ---- Sub-components ----

function ColorValueRow({ val, onRemove }: { val: { id: string; value: string }; onRemove: () => void }) {
  // value format: "Rojo:#e53e3e" or just "Rojo"
  const [label, hex] = val.value.includes(":") ? val.value.split(":") : [val.value, "#888888"];
  return (
    <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2 py-1.5">
      <span className="h-5 w-5 rounded-full border border-neutral-300 flex-shrink-0" style={{ background: hex }} />
      <span className="text-xs font-medium text-neutral-700 flex-1">{label}</span>
      <button onClick={onRemove} className="text-red-400 hover:text-red-600 transition-colors">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function SizeValueRow({ val, onRemove }: { val: { id: string; value: string }; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5">
      <span className="text-xs font-semibold text-neutral-800 flex-1">{val.value}</span>
      <button onClick={onRemove} className="text-red-400 hover:text-red-600 transition-colors">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function ColorAddForm({ onAdd }: { onAdd: (label: string, hex: string) => void }) {
  const [label, setLabel] = useState("");
  const [hex, setHex] = useState("#3b82f6");
  return (
    <div className="flex items-end gap-2 pt-2 border-t border-dashed border-neutral-200">
      <div className="flex-1">
        <label className="text-[10px] text-neutral-400 uppercase tracking-wider">Nombre</label>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Rojo, Azul..." className="block w-full rounded border border-neutral-300 px-2 py-1 text-xs mt-0.5" />
      </div>
      <div>
        <label className="text-[10px] text-neutral-400 uppercase tracking-wider">Color</label>
        <input type="color" value={hex} onChange={e => setHex(e.target.value)} className="block h-7 w-12 rounded border border-neutral-300 p-0.5 cursor-pointer mt-0.5" />
      </div>
      <button
        onClick={() => { if (label.trim()) { onAdd(label.trim(), hex); setLabel(""); } }}
        className="flex items-center gap-1 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
      >
        <Plus className="h-3 w-3" /> Añadir
      </button>
    </div>
  );
}

function SizeAddForm({ onAdd }: { onAdd: (value: string) => void }) {
  const [val, setVal] = useState("");
  const presets = ["XS", "S", "M", "L", "XL", "XXL"];
  return (
    <div className="space-y-2 pt-2 border-t border-dashed border-neutral-200">
      <div className="flex flex-wrap gap-1.5">
        {presets.map(p => (
          <button key={p} onClick={() => onAdd(p)} className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs hover:border-black hover:bg-neutral-50 transition-colors">
            + {p}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)} placeholder="Personalizado (32, L, único...)" className="flex-1 rounded border border-neutral-300 px-2 py-1 text-xs"
          onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }} />
        <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}
          className="rounded-md bg-black px-3 py-1 text-xs font-medium text-white hover:bg-neutral-800">
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function GenericAddForm({ placeholder, onAdd }: { placeholder: string; onAdd: (value: string) => void }) {
  return (
    <div className="pt-2 border-t border-dashed border-neutral-200">
      <input
        placeholder={placeholder}
        className="w-full rounded border border-dashed border-neutral-300 px-2 py-1 text-xs"
        onKeyDown={e => { if (e.key === "Enter" && e.currentTarget.value.trim()) { onAdd(e.currentTarget.value.trim()); e.currentTarget.value = ""; } }}
      />
      <p className="mt-1 text-[10px] text-neutral-400">Presiona Enter para añadir</p>
    </div>
  );
}

// ---- Main Component ----

export function ProductAdminEditor({
  tenantId, product, categories, onUpdate, onSave, onDelete, isSaving
}: {
  tenantId: string;
  product: ProductType;
  categories: AdminTenantDetail["categories"];
  onUpdate: (updated: ProductType) => void;
  onSave: (product: ProductType) => void;
  onDelete: (id: string) => void;
  isSaving: boolean;
}) {
  const [showVariants, setShowVariants] = useState(false);

  // ---- Helpers ----
  const updateField = (field: string, value: unknown) => onUpdate({ ...product, [field]: value });

  const addOption = (name: string) => {
    onUpdate({ ...product, options: [...(product.options || []), { id: `new-${Date.now()}`, name, position: product.options?.length || 0, values: [] }] });
  };

  const addOptionValue = (oIdx: number, rawValue: string) => {
    const opts = [...(product.options || [])];
    opts[oIdx] = { ...opts[oIdx], values: [...opts[oIdx].values, { id: `v-${Date.now()}`, value: rawValue, position: opts[oIdx].values.length }] };
    onUpdate({ ...product, options: opts });
  };

  const removeOptionValue = (oIdx: number, vIdx: number) => {
    const opts = [...(product.options || [])];
    opts[oIdx] = { ...opts[oIdx], values: opts[oIdx].values.filter((_, i) => i !== vIdx) };
    onUpdate({ ...product, options: opts });
  };

  const removeOption = (oIdx: number) => {
    onUpdate({ ...product, options: (product.options || []).filter((_, i) => i !== oIdx) });
  };

  const addVariant = () => {
    onUpdate({
      ...product,
      variants: [...(product.variants || []), {
        id: `new-var-${Date.now()}`, name: "Nueva Variante", sku: "", price: product.price,
        compareAtPrice: product.compareAtPrice, stock: 0, weight: 0, imageId: null, image: null,
        imageUrl: null, options: []
      }]
    });
  };

  const updateVariant = (vIdx: number, field: string, value: unknown) => {
    const vars = [...(product.variants || [])];
    (vars[vIdx] as Record<string, unknown>)[field] = value;
    onUpdate({ ...product, variants: vars });
  };

  const removeVariant = (vIdx: number) => {
    onUpdate({ ...product, variants: (product.variants || []).filter((_, i) => i !== vIdx) });
  };

  const setVariantOption = (vIdx: number, optName: string, valName: string) => {
    const vars = [...(product.variants || [])];
    const v = { ...vars[vIdx] };
    const map: Record<string, string> = v.options.reduce((acc, o) => {
      acc[o.option?.name || o.optionId] = o.value?.value || o.valueId;
      return acc;
    }, {} as Record<string, string>);
    map[optName] = valName;
    v.options = Object.entries(map).map(([k, val]) => ({ optionId: k, valueId: val, option: { name: k }, value: { value: val } }));
    vars[vIdx] = v;
    onUpdate({ ...product, variants: vars });
  };

  const hasOptions = product.options && product.options.length > 0;
  const optionNames = (product.options || []).map(o => o.name.toLowerCase());
  const canAddColor  = !optionNames.some(n => isColorOption(n));
  const canAddSize   = !optionNames.some(n => isSizeOption(n));
  const canAddWeight = !optionNames.some(n => isWeightOption(n));

  return (
    <div className="space-y-8">
      {/* ── Section 1: Info básica ── */}
      <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-black text-white text-[10px] font-bold">1</span>
          <h3 className="text-sm font-semibold text-neutral-900">Información del Producto</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-600">Nombre *</label>
            <input value={product.name} onChange={e => updateField("name", e.target.value)} className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:ring-black" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-600">Slug (URL)</label>
            <input value={product.slug} onChange={e => updateField("slug", e.target.value)} className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-600">Categoría</label>
            <select value={product.category?.id ?? ""} onChange={e => { const cat = categories.find(c => c.id === e.target.value); onUpdate({ ...product, category: cat ?? null }); }} className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white">
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-600">Stock General</label>
            <input type="number" value={product.stock} onChange={e => updateField("stock", Number(e.target.value))} className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-600">Precio de Venta ($)</label>
            <input type="number" step="0.01" value={String(product.price)} onChange={e => updateField("price", e.target.value)} className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-600">Precio Anterior / Tachado ($)</label>
            <input type="number" step="0.01" value={String(product.compareAtPrice ?? "")} onChange={e => updateField("compareAtPrice", e.target.value)} className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" placeholder="Opcional" />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-medium text-neutral-600">URL Imagen Principal</label>
            <div className="flex gap-2">
              <input value={product.images[0]?.url ?? ""} onChange={e => {
                const imgs = [...product.images];
                if (imgs.length > 0) imgs[0] = { ...imgs[0], url: e.target.value };
                else imgs.push({ id: `img-${Date.now()}`, url: e.target.value, alt: "" });
                onUpdate({ ...product, images: imgs });
              }} placeholder="https://..." className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm" />
              <ImageUploadButton 
                tenantId={tenantId} 
                folder="products" 
                onUploadSuccess={(url) => {
                  const imgs = [...product.images];
                  if (imgs.length > 0) imgs[0] = { ...imgs[0], url };
                  else imgs.push({ id: `img-${Date.now()}`, url, alt: "" });
                  onUpdate({ ...product, images: imgs });
                }} 
              />
              {product.images[0]?.url && (
                <img src={product.images[0].url} alt="preview" className="h-9 w-9 rounded-md object-cover border border-neutral-200" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
            </div>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-medium text-neutral-600">Descripción corta</label>
            <textarea rows={2} value={product.shortDescription ?? ""} onChange={e => updateField("shortDescription", e.target.value)} className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm resize-none" placeholder="Una línea que describe el producto..." />
          </div>
        </div>
      </section>

      {/* ── Section 2: Opciones (Color, Talla, etc) ── */}
      <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-black text-white text-[10px] font-bold">2</span>
          <h3 className="text-sm font-semibold text-neutral-900">Opciones y Atributos</h3>
          <span className="ml-auto text-xs text-neutral-400">Agrega los atributos que tiene este producto</span>
        </div>
        <div className="p-6 space-y-4">
          {/* Quick-add buttons */}
          <div className="flex flex-wrap gap-2">
            {canAddColor && (
              <button onClick={() => addOption("Color")} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-500 hover:bg-neutral-50 transition-colors">
                <Palette className="h-3 w-3 text-purple-500" /> + Color
              </button>
            )}
            {canAddSize && (
              <button onClick={() => addOption("Talla")} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-500 hover:bg-neutral-50 transition-colors">
                <Ruler className="h-3 w-3 text-blue-500" /> + Talla
              </button>
            )}
            {canAddWeight && (
              <button onClick={() => addOption("Peso")} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-500 hover:bg-neutral-50 transition-colors">
                <Weight className="h-3 w-3 text-green-500" /> + Peso/Medida
              </button>
            )}
            <button onClick={() => addOption("")} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-500 hover:border-neutral-500 transition-colors">
              <Plus className="h-3 w-3" /> Otra opción
            </button>
          </div>

          {/* Option cards */}
          {(product.options || []).map((opt, oIdx) => {
            const isColor  = isColorOption(opt.name);
            const isSize   = isSizeOption(opt.name);
            return (
              <div key={opt.id} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {isColor  && <Palette className="h-4 w-4 text-purple-500 flex-shrink-0" />}
                  {isSize   && <Ruler   className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                  {!isColor && !isSize && <Weight className="h-4 w-4 text-green-500 flex-shrink-0" />}
                  <input
                    value={opt.name}
                    onChange={e => {
                      const opts = [...(product.options || [])];
                      opts[oIdx] = { ...opts[oIdx], name: e.target.value };
                      onUpdate({ ...product, options: opts });
                    }}
                    placeholder="Nombre de la opción"
                    className="flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm font-medium"
                  />
                  <button onClick={() => removeOption(oIdx)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Values display */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {opt.values.map((val, vIdx) =>
                    isColor
                      ? <ColorValueRow key={val.id} val={val} onRemove={() => removeOptionValue(oIdx, vIdx)} />
                      : <SizeValueRow  key={val.id} val={val} onRemove={() => removeOptionValue(oIdx, vIdx)} />
                  )}
                </div>

                {/* Add form for each type */}
                {isColor
                  ? <ColorAddForm onAdd={(label, hex) => addOptionValue(oIdx, `${label}:${hex}`)} />
                  : isSize
                  ? <SizeAddForm onAdd={v => addOptionValue(oIdx, v)} />
                  : <GenericAddForm placeholder="Ej. 500g, 1kg, 30cm... (Enter)" onAdd={v => addOptionValue(oIdx, v)} />
                }
              </div>
            );
          })}

          {(!product.options || product.options.length === 0) && (
            <p className="rounded-lg border border-dashed border-neutral-200 p-4 text-center text-sm text-neutral-400">
              Usa los botones de arriba para agregar atributos. No es obligatorio si el producto no tiene variantes.
            </p>
          )}
        </div>
      </section>

      {/* ── Section 3: Variantes ── */}
      {hasOptions && (
        <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-black text-white text-[10px] font-bold">3</span>
            <h3 className="text-sm font-semibold text-neutral-900">Variantes ({product.variants?.length || 0})</h3>
            <span className="ml-auto text-xs text-neutral-400">Precio, stock y foto individual por combinación</span>
            <button onClick={() => setShowVariants(!showVariants)} className="ml-2 p-1 rounded hover:bg-neutral-200 transition-colors">
              {showVariants ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {showVariants && (
            <div className="p-6 space-y-4">
              <button onClick={addVariant} className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800">
                <Plus className="h-3 w-3" /> Añadir Variante
              </button>

              <div className="space-y-3">
                {(product.variants || []).map((v, vIdx) => {
                  const vOpts = v.options.reduce((acc, o) => {
                    acc[o.option?.name || o.optionId] = o.value?.value || o.valueId;
                    return acc;
                  }, {} as Record<string, string>);

                  // Find color value for preview
                  const colorOptName = (product.options || []).find(o => isColorOption(o.name))?.name;
                  const colorRaw = colorOptName ? vOpts[colorOptName] : null;
                  const colorHex = colorRaw?.includes(":") ? colorRaw.split(":")[1] : null;

                  return (
                    <div key={v.id} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                      <div className="flex items-start gap-3">
                        {/* Color swatch if applicable */}
                        {colorHex && (
                          <div className="mt-1 h-6 w-6 rounded-full border border-neutral-300 flex-shrink-0" style={{ background: colorHex }} />
                        )}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                          {/* Option selectors */}
                          {(product.options || []).map(opt => {
                            const curVal = vOpts[opt.name] || "";
                            const isColor = isColorOption(opt.name);
                            return (
                              <div key={opt.id} className="space-y-1">
                                <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">{opt.name}</label>
                                <select
                                  value={curVal}
                                  onChange={e => setVariantOption(vIdx, opt.name, e.target.value)}
                                  className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs"
                                >
                                  <option value="">Seleccionar</option>
                                  {opt.values.map(val => {
                                    const label = isColor && val.value.includes(":") ? val.value.split(":")[0] : val.value;
                                    return <option key={val.id} value={val.value}>{label}</option>;
                                  })}
                                </select>
                              </div>
                            );
                          })}

                          {/* Precio */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Precio</label>
                            <input value={v.price === null ? "" : String(v.price)} onChange={e => updateVariant(vIdx, "price", e.target.value)} placeholder="Base" className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs" />
                          </div>

                          {/* Stock */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Stock</label>
                            <input type="number" value={v.stock} onChange={e => updateVariant(vIdx, "stock", Number(e.target.value))} className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs" />
                          </div>

                          {/* Peso */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Peso (kg)</label>
                            <input value={v.weight === null ? "" : String(v.weight)} onChange={e => updateVariant(vIdx, "weight", e.target.value)} placeholder="0.0" className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs" />
                          </div>

                          {/* SKU */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">SKU</label>
                            <input value={v.sku || ""} onChange={e => updateVariant(vIdx, "sku", e.target.value)} placeholder="Opcional" className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs font-mono" />
                          </div>

                          {/* Foto propia */}
                          <div className="space-y-1 col-span-2 sm:col-span-3 md:col-span-6">
                            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Foto específica de esta variante (URL)</label>
                            <div className="flex gap-2">
                              <input
                                value={v.image?.url || (v as { imageUrl?: string | null }).imageUrl || ""}
                                onChange={e => updateVariant(vIdx, "imageUrl", e.target.value)}
                                placeholder="https://... (opcional)"
                                className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-xs"
                              />
                              <ImageUploadButton 
                                tenantId={tenantId} 
                                folder="variants" 
                                onUploadSuccess={(url) => updateVariant(vIdx, "imageUrl", url)} 
                                className="px-2 py-1.5"
                              />
                              {(v.image?.url || (v as { imageUrl?: string | null }).imageUrl) && (
                                <img src={v.image?.url || (v as { imageUrl?: string | null }).imageUrl!} alt="" className="h-8 w-8 rounded object-cover border border-neutral-200" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              )}
                            </div>
                          </div>
                        </div>

                        <button onClick={() => removeVariant(vIdx)} className="mt-1 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors flex-shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(!product.variants || product.variants.length === 0) && (
                  <p className="text-xs text-neutral-400 text-center py-4">Añade variantes para gestionar stock y precios por combinación (ej. Rojo + Talla M).</p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Footer actions ── */}
      <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
        <button onClick={() => { if (confirm("¿Eliminar este producto definitivamente?")) onDelete(product.id); }} className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors">
          Eliminar Producto
        </button>
        <button onClick={() => onSave(product)} disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors">
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
