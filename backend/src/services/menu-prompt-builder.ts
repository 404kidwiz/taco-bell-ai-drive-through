/**
 * Menu Prompt Builder Service
 * Dynamically builds the AI system prompt menu section from DB
 * Caches prompts for 5 minutes
 */

import { db } from '../db/index.js';
import { menuItems, menuCategories } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';

// Simple in-memory cache
interface CacheEntry {
  prompt: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(restaurantId: string): string | null {
  const entry = cache.get(restaurantId);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.prompt;
  }
  cache.delete(restaurantId);
  return null;
}

function setCached(restaurantId: string, prompt: string): void {
  cache.set(restaurantId, { prompt, expiresAt: Date.now() + CACHE_TTL_MS });
}

function clearCache(restaurantId?: string): void {
  if (restaurantId) {
    cache.delete(restaurantId);
  } else {
    cache.clear();
  }
}

export async function buildMenuSection(restaurantId: string, language?: 'en' | 'es'): Promise<string> {
  // Check cache first
  const cached = getCached(restaurantId);
  if (cached) return cached;

  // Fetch categories and items
  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, restaurantId))
    .orderBy(asc(menuCategories.sortOrder));

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantId))
    .orderBy(asc(menuItems.sortOrder));

  // If no menu data in DB yet, return empty
  if (categories.length === 0 && items.length === 0) {
    return '';
  }

  // Group items by category
  const itemsByCategory = new Map<string, typeof items>();
  for (const item of items) {
    const cat = item.category;
    if (!itemsByCategory.has(cat)) itemsByCategory.set(cat, []);
    itemsByCategory.get(cat)!.push(item);
  }

  // Build section for each category (prefer matching language)
  const lines: string[] = [];
  lines.push('Here\'s our full menu:');
  lines.push('');

  for (const cat of categories) {
    const catItems = itemsByCategory.get(cat.name.toLowerCase()) || [];
    if (catItems.length === 0) continue;

    const catName = language === 'es' && cat.nameEs ? cat.nameEs : cat.name;
    lines.push(`${catName.toUpperCase()}:`);

    for (const item of catItems) {
      if (!item.enabled) continue;

      const name = language === 'es' && item.descriptionEs ? item.name : item.name;
      const desc = language === 'es' && item.descriptionEs ? item.descriptionEs : item.description;
      const priceTag = `$${item.price.toFixed(2)}`;
      const popularTag = item.popular ? ' [POPULAR]' : '';
      const calTag = item.calories ? ` (${item.calories} cal)` : '';

      lines.push(`- ${name} — ${desc}${calTag} (${priceTag})${popularTag}`);
    }
    lines.push('');
  }

  const prompt = lines.join('\n');
  setCached(restaurantId, prompt);
  return prompt;
}

export async function getFullSystemPrompt(restaurantId: string, basePrompt: string, language?: 'en' | 'es'): Promise<string> {
  const menuSection = await buildMenuSection(restaurantId, language);

  // Inject menu section into base prompt
  if (!menuSection) return basePrompt;

  // Find the "Here's our full menu:" marker in the base prompt and replace
  const markerIndex = basePrompt.indexOf("Here's our full menu:");
  if (markerIndex !== -1) {
    return basePrompt.slice(0, markerIndex) + menuSection + basePrompt.slice(basePrompt.indexOf('\n\n', markerIndex) + 2);
  }

  // Fallback: append menu section
  return basePrompt + '\n\n' + menuSection;
}

export { clearCache };
