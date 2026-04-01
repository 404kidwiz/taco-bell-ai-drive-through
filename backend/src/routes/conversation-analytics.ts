/**
 * Conversation Analytics Routes
 */

import { Hono } from 'hono';
import { db } from '../db/index.js';
import { conversationAnalytics } from '../db/schema.js';
import { eq, gte, lte, and, sql, desc, count } from 'drizzle-orm';

const analyticsRouter = new Hono();

// POST /api/conversation-analytics — record a conversation
analyticsRouter.post('/conversation-analytics', async (c) => {
  try {
    const body = await c.req.json();
    const {
      id,
      restaurantId,
      conversationId,
      duration,
      completed,
      itemCount,
      totalValue,
      misunderstandingCount,
      upsellAttempted,
      upsellAccepted,
      avgResponseMs,
      sentiment,
      language,
    } = body;

    if (!restaurantId || !conversationId) {
      return c.json({ error: 'restaurantId and conversationId are required' }, 400);
    }

    const record = {
      id: id || `ca_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      restaurantId,
      conversationId,
      duration: duration || 0,
      completed: completed ?? false,
      itemCount: itemCount ?? 0,
      totalValue: totalValue ?? 0,
      misunderstandingCount: misunderstandingCount ?? 0,
      upsellAttempted: upsellAttempted ?? false,
      upsellAccepted: upsellAccepted ?? false,
      avgResponseMs: avgResponseMs ?? 0,
      sentiment: sentiment ?? 'neutral',
      language: language ?? 'en',
    };

    await db.insert(conversationAnalytics).values(record).onConflictDoUpdate({
      target: conversationAnalytics.id,
      set: record,
    });

    return c.json({ success: true, id: record.id }, 201);
  } catch (error: any) {
    console.error('Error recording conversation analytics:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// GET /api/conversation-analytics — get aggregated analytics
analyticsRouter.get('/conversation-analytics', async (c) => {
  try {
    const restaurantId = c.req.query('restaurantId');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const language = c.req.query('language');
    const outcome = c.req.query('outcome'); // completed | abandoned
    const limit = Math.min(parseInt(c.req.query('limit') || '100'), 500);
    const offset = parseInt(c.req.query('offset') || '0');

    // Build conditions
    const conditions = [];
    if (restaurantId) conditions.push(eq(conversationAnalytics.restaurantId, restaurantId));
    if (startDate) conditions.push(gte(conversationAnalytics.createdAt, new Date(startDate)));
    if (endDate) conditions.push(lte(conversationAnalytics.createdAt, new Date(endDate)));
    if (language) conditions.push(eq(conversationAnalytics.language, language));
    if (outcome === 'completed') conditions.push(eq(conversationAnalytics.completed, true));
    if (outcome === 'abandoned') conditions.push(eq(conversationAnalytics.completed, false));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get aggregated metrics
    const [totals] = await db
      .select({
        totalConversations: count(),
        totalDuration: sql<number>`sum(${conversationAnalytics.duration})`,
        avgDuration: sql<number>`avg(${conversationAnalytics.duration})`,
        totalCompleted: sql<number>`sum(case when ${conversationAnalytics.completed} then 1 else 0 end)`,
        totalMisunderstandings: sql<number>`sum(${conversationAnalytics.misunderstandingCount})`,
        totalUpsellAttempted: sql<number>`sum(case when ${conversationAnalytics.upsellAttempted} then 1 else 0 end)`,
        totalUpsellAccepted: sql<number>`sum(case when ${conversationAnalytics.upsellAccepted} then 1 else 0 end)`,
        avgResponseMs: sql<number>`avg(${conversationAnalytics.avgResponseMs})`,
        totalValue: sql<number>`sum(${conversationAnalytics.totalValue})`,
        positiveSentiment: sql<number>`sum(case when ${conversationAnalytics.sentiment} = 'positive' then 1 else 0 end)`,
        neutralSentiment: sql<number>`sum(case when ${conversationAnalytics.sentiment} = 'neutral' then 1 else 0 end)`,
        negativeSentiment: sql<number>`sum(case when ${conversationAnalytics.sentiment} = 'negative' then 1 else 0 end)`,
      })
      .from(conversationAnalytics)
      .where(whereClause);

    const totalConversations = Number(totals?.totalConversations) || 0;
    const totalCompleted = Number(totals?.totalCompleted) || 0;

    const metrics = {
      totalConversations,
      avgDuration: Math.round(Number(totals?.avgDuration) || 0),
      completionRate: totalConversations > 0 ? totalCompleted / totalConversations : 0,
      misunderstandingRate: totalConversations > 0 ? Number(totals?.totalMisunderstandings) / totalConversations : 0,
      upsellAttemptRate: totalConversations > 0 ? Number(totals?.totalUpsellAttempted) / totalConversations : 0,
      upsellSuccessRate: Number(totals?.totalUpsellAttempted) > 0
        ? Number(totals?.totalUpsellAccepted) / Number(totals?.totalUpsellAttempted)
        : 0,
      avgResponseMs: Math.round(Number(totals?.avgResponseMs) || 0),
      totalValue: Number(totals?.totalValue) || 0,
      sentiment: {
        positive: Number(totals?.positiveSentiment) || 0,
        neutral: Number(totals?.neutralSentiment) || 0,
        negative: Number(totals?.negativeSentiment) || 0,
      },
    };

    // Get recent conversations
    const recent = await db
      .select()
      .from(conversationAnalytics)
      .where(whereClause)
      .orderBy(desc(conversationAnalytics.createdAt))
      .limit(limit)
      .offset(offset);

    // Get daily breakdown for charts
    const dailyStats = await db
      .select({
        date: sql<string>`date(${conversationAnalytics.createdAt})`,
        conversations: count(),
        completed: sql<number>`sum(case when ${conversationAnalytics.completed} then 1 else 0 end)`,
        avgResponseMs: sql<number>`avg(${conversationAnalytics.avgResponseMs})`,
        avgDuration: sql<number>`avg(${conversationAnalytics.duration})`,
        positive: sql<number>`sum(case when ${conversationAnalytics.sentiment} = 'positive' then 1 else 0 end)`,
        negative: sql<number>`sum(case when ${conversationAnalytics.sentiment} = 'negative' then 1 else 0 end)`,
      })
      .from(conversationAnalytics)
      .where(whereClause)
      .groupBy(sql`date(${conversationAnalytics.createdAt})`)
      .orderBy(sql`date(${conversationAnalytics.createdAt})`);

    // Upsell funnel
    const upsellFunnel = {
      attempted: Number(totals?.totalUpsellAttempted) || 0,
      accepted: Number(totals?.totalUpsellAccepted) || 0,
    };

    // Language breakdown
    const languageBreakdown = await db
      .select({
        language: conversationAnalytics.language,
        count: count(),
        avgDuration: sql<number>`avg(${conversationAnalytics.duration})`,
        completionRate: sql<number>`avg(case when ${conversationAnalytics.completed} then 1 else 0 end)`,
      })
      .from(conversationAnalytics)
      .where(whereClause)
      .groupBy(conversationAnalytics.language);

    return c.json({
      metrics,
      recent,
      dailyStats,
      upsellFunnel,
      languageBreakdown,
      pagination: { limit, offset, total: totalConversations },
    });
  } catch (error: any) {
    console.error('Error fetching conversation analytics:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// GET /api/conversation-analytics/:id — get single conversation
analyticsRouter.get('/conversation-analytics/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const [record] = await db
      .select()
      .from(conversationAnalytics)
      .where(eq(conversationAnalytics.id, id))
      .limit(1);

    if (!record) {
      return c.json({ error: 'Not found' }, 404);
    }

    return c.json(record);
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// DELETE /api/conversation-analytics/:id
analyticsRouter.delete('/conversation-analytics/:id', async (c) => {
  try {
    const { id } = c.req.param();
    await db.delete(conversationAnalytics).where(eq(conversationAnalytics.id, id));
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

export default analyticsRouter;
