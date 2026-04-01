/**
 * Menu Management Routes
 */

import { Hono } from 'hono';
import { db } from '../db/index.js';
import { menuItems, menuCategories } from '../db/schema.js';
import { eq, and, asc, sql } from 'drizzle-orm';

const menuRouter = new Hono();

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// GET /api/restaurants/:restaurantId/menu — get full menu
menuRouter.get('/restaurants/:restaurantId/menu', async (c) => {
  try {
    const { restaurantId } = c.req.param();

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

    return c.json({ categories, items });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// POST /api/restaurants/:restaurantId/menu/categories — add category
menuRouter.post('/restaurants/:restaurantId/menu/categories', async (c) => {
  try {
    const { restaurantId } = c.req.param();
    const { name, nameEs, sortOrder, enabled } = await c.req.json();

    if (!name) return c.json({ error: 'name is required' }, 400);

    const record = {
      id: generateId('cat'),
      restaurantId,
      name,
      nameEs: nameEs || null,
      sortOrder: sortOrder ?? 0,
      enabled: enabled ?? true,
    };

    await db.insert(menuCategories).values(record);
    return c.json({ success: true, category: record }, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// PATCH /api/restaurants/:restaurantId/menu/categories/:id — update category
menuRouter.patch('/restaurants/:restaurantId/menu/categories/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const updates = await c.req.json();

    const allowed = ['name', 'nameEs', 'sortOrder', 'enabled'];
    const setClause: Record<string, any> = {};
    for (const key of allowed) {
      if (key in updates) setClause[key] = updates[key];
    }

    if (Object.keys(setClause).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    await db
      .update(menuCategories)
      .set(setClause)
      .where(eq(menuCategories.id, id));

    const [updated] = await db.select().from(menuCategories).where(eq(menuCategories.id, id)).limit(1);
    return c.json({ success: true, category: updated });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// DELETE /api/restaurants/:restaurantId/menu/categories/:id — delete category
menuRouter.delete('/restaurants/:restaurantId/menu/categories/:id', async (c) => {
  try {
    const { id } = c.req.param();
    await db.delete(menuCategories).where(eq(menuCategories.id, id));
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// POST /api/restaurants/:restaurantId/menu/items — add menu item
menuRouter.post('/restaurants/:restaurantId/menu/items', async (c) => {
  try {
    const { restaurantId } = c.req.param();
    const body = await c.req.json();
    const { name, description, descriptionEs, price, category, image, popular, calories, enabled, sortOrder } = body;

    if (!name || price === undefined || !category) {
      return c.json({ error: 'name, price, and category are required' }, 400);
    }

    const record = {
      id: generateId('item'),
      restaurantId,
      name,
      description: description || '',
      descriptionEs: descriptionEs || null,
      price: Number(price),
      category,
      image: image || null,
      popular: popular ?? false,
      calories: calories ? Number(calories) : null,
      enabled: enabled ?? true,
      sortOrder: sortOrder ?? 0,
    };

    await db.insert(menuItems).values(record);
    return c.json({ success: true, item: record }, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// PATCH /api/restaurants/:restaurantId/menu/items/:id — update item
menuRouter.patch('/restaurants/:restaurantId/menu/items/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const updates = await c.req.json();

    const allowed = ['name', 'description', 'descriptionEs', 'price', 'category', 'image', 'popular', 'calories', 'enabled', 'sortOrder'];
    const setClause: Record<string, any> = { updatedAt: new Date() };
    for (const key of allowed) {
      if (key in updates) setClause[key] = updates[key];
    }

    if (Object.keys(setClause).length <= 1) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    await db.update(menuItems).set(setClause).where(eq(menuItems.id, id));

    const [updated] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
    return c.json({ success: true, item: updated });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// DELETE /api/restaurants/:restaurantId/menu/items/:id
menuRouter.delete('/restaurants/:restaurantId/menu/items/:id', async (c) => {
  try {
    const { id } = c.req.param();
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// PATCH /api/restaurants/:restaurantId/menu/reorder — reorder items/categories
menuRouter.patch('/restaurants/:restaurantId/menu/reorder', async (c) => {
  try {
    const { restaurantId } = c.req.param();
    const { items, categories } = await c.req.json();

    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.id && item.sortOrder !== undefined) {
          await db
            .update(menuItems)
            .set({ sortOrder: Number(item.sortOrder), updatedAt: new Date() })
            .where(and(eq(menuItems.id, item.id), eq(menuItems.restaurantId, restaurantId)));
        }
      }
    }

    if (categories && Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat.id && cat.sortOrder !== undefined) {
          await db
            .update(menuCategories)
            .set({ sortOrder: Number(cat.sortOrder) })
            .where(and(eq(menuCategories.id, cat.id), eq(menuCategories.restaurantId, restaurantId)));
        }
      }
    }

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// POST /api/restaurants/:restaurantId/menu/import — import menu from URL or JSON
menuRouter.post('/restaurants/:restaurantId/menu/import', async (c) => {
  try {
    const { restaurantId } = c.req.param();
    const body = await c.req.json();

    // Direct items import
    if (body.items && Array.isArray(body.items)) {
      const inserted = [];
      for (const item of body.items) {
        const record = {
          id: generateId('item'),
          restaurantId,
          name: item.name || 'Unknown',
          description: item.description || '',
          descriptionEs: item.descriptionEs || null,
          price: Number(item.price) || 0,
          category: item.category || 'misc',
          image: item.image || null,
          popular: item.popular ?? false,
          calories: item.calories ? Number(item.calories) : null,
          enabled: item.enabled ?? true,
          sortOrder: item.sortOrder ?? 0,
        };
        await db.insert(menuItems).values(record);
        inserted.push(record);
      }
      return c.json({ success: true, imported: inserted.length, items: inserted }, 201);
    }

    // URL-based import via GPT-4o-mini
    if (body.url) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return c.json({ error: 'OpenAI API key not configured' }, 500);
      }

      // Fetch the URL content
      let urlContent = '';
      try {
        const response = await fetch(body.url);
        urlContent = await response.text();
      } catch {
        return c.json({ error: 'Failed to fetch URL' }, 400);
      }

      // Use GPT-4o-mini to extract menu items
      const extractionPrompt = `Extract all menu items from this webpage content. Return a JSON array with objects containing: name, description, price (number), category, popular (boolean), calories (number or null). Be thorough — extract everything that looks like a menu item.

Webpage content:
${urlContent.slice(0, 8000)}

Return ONLY valid JSON in this exact format:
[
  {"name": "Item Name", "description": "Description", "price": 5.99, "category": "category-name", "popular": false, "calories": 450}
]`;

      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: extractionPrompt }],
          max_tokens: 2000,
          temperature: 0.3,
        }),
      });

      if (!gptResponse.ok) {
        const errText = await gptResponse.text();
        return c.json({ error: `OpenAI error: ${errText}` }, 500);
      }

      const gptData = await gptResponse.json();
      const rawContent = gptData.choices?.[0]?.message?.content || '';

      // Parse the JSON response
      let items: any[] = [];
      try {
        const jsonMatch = rawContent.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          items = JSON.parse(jsonMatch[0]);
        }
      } catch {
        return c.json({ error: 'Failed to parse GPT extraction result' }, 500);
      }

      // Insert into DB
      const inserted = [];
      for (const item of items) {
        const record = {
          id: generateId('item'),
          restaurantId,
          name: item.name || 'Unknown',
          description: item.description || '',
          descriptionEs: null,
          price: Number(item.price) || 0,
          category: (item.category || 'misc').toLowerCase().replace(/\s+/g, '-'),
          image: null,
          popular: item.popular ?? false,
          calories: item.calories ? Number(item.calories) : null,
          enabled: true,
          sortOrder: 0,
        };
        await db.insert(menuItems).values(record);
        inserted.push(record);
      }

      return c.json({ success: true, imported: inserted.length, items: inserted }, 201);
    }

    return c.json({ error: 'Provide either url or items array' }, 400);
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

export default menuRouter;
