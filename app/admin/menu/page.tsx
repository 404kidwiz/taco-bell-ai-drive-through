"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Save,
  Eye,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Languages,
  ChevronDown,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  descriptionEs?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  calories?: number;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

const mockCategories: Category[] = [
  {
    id: "tacos",
    name: "Tacos",
    items: [
      { id: "t1", name: "Crunchy Taco", description: "A crunchy corn shell with seasoned beef, lettuce, and cheddar cheese.", descriptionEs: "Taco crujiente con res molida sazonada, lechuga y queso cheddar.", price: 199, category: "tacos", available: true, calories: 170 },
      { id: "t2", name: "Soft Taco", description: "A warm flour tortilla with seasoned beef, lettuce, and cheddar cheese.", descriptionEs: "Tortilla de harina tibia con res molida sazonada, lechuga y queso cheddar.", price: 199, category: "tacos", available: true, calories: 160 },
      { id: "t3", name: "Nacho Cheese Doritos Locos Taco", description: "Crunchy taco with nacho cheese Doritos chips.", descriptionEs: "Taco crujiente con chips Doritos de queso nacho.", price: 249, category: "tacos", available: true, calories: 200 },
    ],
  },
  {
    id: "burritos",
    name: "Burritos",
    items: [
      { id: "b1", name: "Burrito Supreme", description: "A large flour tortilla filled with seasoned beef, rice, beans, sour cream, and guacamole.", descriptionEs: "Una tortilla grande de harina rellena de res molida sazonada, arroz, frijoles, crema agria y aguacate.", price: 749, category: "burritos", available: true, calories: 660 },
      { id: "b2", name: "Bean & Cheese Burrito", description: "A warm flour tortilla with refried beans and melted cheese.", descriptionEs: "Tortilla de harina tibia con frijoles refritos y queso derretido.", price: 199, category: "burritos", available: true, calories: 380 },
    ],
  },
  {
    id: "sides",
    name: "Sides",
    items: [
      { id: "s1", name: "Nachos Bell Grande", description: "Crispy tortilla chips topped with warm nacho cheese, seasoned beef, sour cream, and guacamole.", descriptionEs: "Tortilla chips crujientes cubiertos con queso nacho tibio, res molida sazonada, crema agria y aguacate.", price: 649, category: "sides", available: true, calories: 540 },
      { id: "s2", name: "Chips & Cheese", description: "Crispy tortilla chips with warm cheese sauce.", descriptionEs: "Tortilla chips crujientes con salsa de queso tibia.", price: 249, category: "sides", available: true, calories: 310 },
    ],
  },
  {
    id: "drinks",
    name: "Drinks",
    items: [
      { id: "d1", name: "Medium Drink", description: "Your choice of drink.", descriptionEs: "Tu elección de bebida.", price: 199, category: "drinks", available: true, calories: 0 },
      { id: "d2", name: "Large Drink", description: "Your choice of large drink.", descriptionEs: "Tu elección de bebida grande.", price: 249, category: "drinks", available: true, calories: 0 },
    ],
  },
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newItemCategory, setNewItemCategory] = useState<string>("tacos");
  const [showNewItem, setShowNewItem] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCategories(mockCategories);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleReorder = (categoryId: string, newItems: MenuItem[]) => {
    setCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, items: newItems } : c));
    setHasChanges(true);
  };

  const handleToggleAvailable = (categoryId: string, itemId: string) => {
    setCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, available: !i.available } : i) } : c));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleAddItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: "New Item",
      description: "Item description",
      price: 499,
      category: categoryId,
      available: true,
    };
    setCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, items: [...c.items, newItem] } : c));
    setEditingItem(newItem);
    setHasChanges(true);
  };

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    setCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c));
    setHasChanges(true);
  };

  const handleUpdateItem = (updatedItem: MenuItem) => {
    setCategories((prev) => prev.map((c) => ({ ...c, items: c.items.map((i) => i.id === updatedItem.id ? updatedItem : i) })));
    setEditingItem(null);
    setHasChanges(true);
  };

  const handleAddCategory = (name: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      items: [],
    };
    setCategories((prev) => [...prev, newCategory]);
    setShowNewCategory(false);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#6D28FF]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Menu Management</h1>
          <p className="text-[#948DA3] text-sm mt-1">Drag items to reorder, click to edit</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e192b] border border-[#494457] text-white text-sm font-medium hover:bg-[#221d2f] transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={() => setShowNewCategory(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e192b] border border-[#494457] text-white text-sm font-medium hover:bg-[#221d2f] transition-colors"
          >
            <Plus size={16} />
            Add Category
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6D28FF] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.id} className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl overflow-hidden">
            {/* Category header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#494457]/50">
              <div className="flex items-center gap-3">
                <GripVertical className="text-[#948DA3]" size={18} />
                <h2 className="text-lg font-bold text-white">{category.name}</h2>
                <span className="px-2 py-0.5 rounded text-xs bg-[#494457]/30 text-[#948DA3]">
                  {category.items.length} items
                </span>
              </div>
              <button
                onClick={() => handleAddItem(category.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#494457]/30 text-[#948DA3] hover:text-white text-sm transition-colors"
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            {/* Items */}
            <Reorder.Group axis="y" values={category.items} onReorder={(newItems) => handleReorder(category.id, newItems)} className="divide-y divide-[#494457]/30">
              {category.items.map((item) => (
                <Reorder.Item key={item.id} value={item}>
                  <div className={`flex items-center gap-4 px-6 py-4 hover:bg-[#494457]/10 transition-colors ${!item.available ? "opacity-50" : ""}`}>
                    <GripVertical className="text-[#948DA3] cursor-grab" size={18} />
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[#494457]/30 flex items-center justify-center">
                        <ImageIcon className="text-[#948DA3]" size={20} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-[#948DA3] text-sm truncate">{item.description}</p>
                    </div>
                    {item.descriptionEs && (
                      <Languages className="text-[#948DA3] flex-shrink-0" size={16} aria-label="Has Spanish description" />
                    )}
                    {item.calories && (
                      <span className="text-[#948DA3] text-sm flex-shrink-0">{item.calories} cal</span>
                    )}
                    <p className="text-white font-semibold flex-shrink-0">{formatCurrency(item.price)}</p>
                    <button
                      onClick={() => handleToggleAvailable(category.id, item.id)}
                      className={`flex-shrink-0 ${item.available ? "text-green-400" : "text-[#948DA3]"}`}
                    >
                      {item.available ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 rounded-lg bg-[#494457]/30 text-[#948DA3] hover:text-white hover:bg-[#494457]/50 transition-colors flex-shrink-0"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(category.id, item.id)}
                      className="p-2 rounded-lg bg-[#494457]/30 text-[#948DA3] hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        ))}
      </div>

      {/* Edit item modal */}
      <AnimatePresence>
        {editingItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setEditingItem(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
            >
              <div className="bg-[#1e192b] border border-[#494457] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-[#494457]/50">
                  <h2 className="text-lg font-bold text-white">Edit Item</h2>
                  <button onClick={() => setEditingItem(null)} className="text-[#948DA3] hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateItem(editingItem); }} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="text-[#948DA3] text-sm">Name</label>
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-[#0a0612] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF]"
                    />
                  </div>
                  <div>
                    <label className="text-[#948DA3] text-sm">Description (English)</label>
                    <textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      rows={2}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-[#0a0612] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#948DA3] text-sm">Description (Spanish)</label>
                    <textarea
                      value={editingItem.descriptionEs || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, descriptionEs: e.target.value })}
                      placeholder="Optional Spanish description"
                      rows={2}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-[#0a0612] border border-[#494457] text-white placeholder-[#494457] focus:outline-none focus:border-[#6D28FF] resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#948DA3] text-sm">Price (cents)</label>
                      <input
                        type="number"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })}
                        className="w-full mt-1 px-4 py-2.5 rounded-xl bg-[#0a0612] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF]"
                      />
                    </div>
                    <div>
                      <label className="text-[#948DA3] text-sm">Calories</label>
                      <input
                        type="number"
                        value={editingItem.calories || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, calories: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="Optional"
                        className="w-full mt-1 px-4 py-2.5 rounded-xl bg-[#0a0612] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[#948DA3] text-sm">Image URL</label>
                    <input
                      type="url"
                      value={editingItem.image || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value || undefined })}
                      placeholder="https://..."
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-[#0a0612] border border-[#494457] text-white placeholder-[#494457] focus:outline-none focus:border-[#6D28FF]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#6D28FF] text-white font-semibold hover:opacity-90 transition-opacity"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New category modal */}
      <AnimatePresence>
        {showNewCategory && (
          <NewCategoryModal onClose={() => setShowNewCategory(false)} onAdd={handleAddCategory} />
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {showPreview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowPreview(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-8 z-50 bg-[#0a0612] rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#494457]">
                <h2 className="text-lg font-bold text-white">Menu Preview</h2>
                <button onClick={() => setShowPreview(false)} className="text-[#948DA3] hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {categories.map((category) => (
                  <div key={category.id} className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">{category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.filter(i => i.available).map((item) => (
                        <div key={item.id} className="bg-[#1e192b] rounded-xl p-4 flex gap-4">
                          {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />}
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="text-white font-medium">{item.name}</p>
                              <p className="text-[#cebdff] font-semibold">{formatCurrency(item.price)}</p>
                            </div>
                            <p className="text-[#948DA3] text-sm mt-1">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NewCategoryModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50"
      >
        <div className="bg-[#1e192b] border border-[#494457] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Add Category</h2>
          <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onAdd(name); }} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0612] border border-[#494457] text-white placeholder-[#494457] focus:outline-none focus:border-[#6D28FF]"
            />
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#494457]/30 text-[#948DA3] font-medium hover:bg-[#494457]/50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#6D28FF] text-white font-medium hover:opacity-90 transition-opacity">
                Add
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}
