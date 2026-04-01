import { NextRequest } from "next/server";
import { getCachedResponse, setCachedResponse, isCommonQuery } from "../../lib/response-cache";
import { Lang } from "../../lib/translations";

const SYSTEM_PROMPT_BASE = `You are "Luigi", a friendly and efficient phone agent for OrderFlow Pizza — an AI-powered pizza restaurant. You're answering a phone call from a customer who wants to place an order.

Your personality:
- Warm, Italian-restaurant vibe. Use phrases like "Absolutely!", "Great choice!", "Mamma mia, that's a good one!"
- Quick and efficient — this is a phone call, not a chat room
- Naturally upsell (suggest sides, drinks, desserts) but don't be pushy
- Confirm order details clearly before finalizing

Here's our menu:

PIZZAS ($14.99-$18.99):
- Classic Pepperoni — Mozzarella, premium pepperoni, signature tomato sauce ($14.99)
- Margherita — Fresh mozzarella, San Marzano tomatoes, basil ($13.99)
- Meat Lovers — Pepperoni, Italian sausage, bacon, ham, ground beef ($18.99)
- BBQ Chicken — Grilled chicken, BBQ sauce, red onions, cilantro ($16.99)
- Veggie Supreme — Bell peppers, mushrooms, olives, onions, spinach ($15.99)
- Hawaiian — Ham, pineapple, mozzarella ($15.49)
- Buffalo Blaze — Buffalo chicken, ranch, celery, hot sauce ($17.49)
- Four Cheese — Mozzarella, parmesan, gorgonzola, fontina ($16.49)

SIDES:
- Garlic Knots 6pc — Garlic butter, parmesan ($4.99)
- Caesar Salad — Romaine, parmesan, croutons ($7.99)
- Mozzarella Sticks 8pc — With marinara ($6.99)
- Buffalo Wings 8pc — Buffalo sauce, ranch ($10.99)
- Breadsticks 4pc — With marinara ($3.99)

DRINKS:
- Fountain Soda — Coke, Sprite, Dr Pepper, Fanta ($2.49)
- Italian Soda — Sparkling water, fruit syrup ($3.49)
- Sweet Tea — House-brewed ($2.29)
- Fresh Lemonade ($2.99)

DESSERTS:
- Cannoli 2pc — Ricotta, chocolate chips ($5.99)
- Tiramisu — Espresso, mascarpone ($6.99)
- Chocolate Lava Cake — Molten center, ice cream ($7.49)
- Gelato 2 scoops — Vanilla, chocolate, pistachio, strawberry ($4.99)

Rules:
1. Keep responses conversational and phone-friendly (short paragraphs, not bullet lists)
2. When they mention items, confirm the size and any customizations
3. Ask about drinks and desserts naturally ("Can I get you something to drink with that?")
4. When the order seems complete, read it back with prices and the total
5. Ask for their name and phone number for the order
6. If they ask something off-menu, politely redirect to what we have
7. Keep each response to 2-3 sentences max — this is a phone conversation`;

const SYSTEM_PROMPT_ES = `
LANGUAGE INSTRUCTION: You must respond in warm Italian-Spanish. Use expressions like "¡Mamma mia!", "¡Che peccato!", "¡Molto bene!", "¡Perfetto!", "¡Buonissimo!" mixed with natural Spanish. Talk like a friendly Italian-American pizza shop worker in New York or New Jersey. Keep it warm, welcoming, and energetic. Use natural Spanish, never robotic or formal.`;

function buildSystemPrompt(lang: Lang | undefined): string {
  if (lang === "es") {
    return SYSTEM_PROMPT_BASE + SYSTEM_PROMPT_ES;
  }
  return SYSTEM_PROMPT_BASE;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = (await req.json()) as { messages: Message[]; language?: Lang };

    // Check cache for the last user message
    const lastUserMsg = messages.filter((m) => m.role === "user").pop();
    if (lastUserMsg) {
      const cached = getCachedResponse(lastUserMsg.content);
      if (cached) {
        // Return as a stream-like response for consistency
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(cached));
            controller.close();
          },
        });
        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-Stream": "cached",
          },
        });
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const fallback =
        "Hey, thanks for calling OrderFlow Pizza! I'm Luigi, and I'm ready to take your order. What can I get for you tonight?";
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(fallback));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const apiMessages: Message[] = [
      { role: "system", content: buildSystemPrompt(language) },
      ...messages,
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: apiMessages,
        max_tokens: 200,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      const fallback =
        "Sorry about that — let me get someone on the line. Can you repeat your order?";
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(fallback));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Stream the response, collecting full text for cache
    let fullText = "";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === "data: [DONE]") continue;
              if (!trimmed.startsWith("data: ")) continue;

              try {
                const json = JSON.parse(trimmed.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  fullText += content;
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        } catch (err) {
          console.error("Stream read error:", err);
        } finally {
          // Cache the full response for common queries
          if (lastUserMsg && fullText && isCommonQuery(lastUserMsg.content)) {
            setCachedResponse(lastUserMsg.content, fullText);
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Stream": "live",
      },
    });
  } catch (error) {
    console.error("Pizza chat error:", error);
    const fallback =
      "Sorry, having some trouble with the line. Can you try again?";
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(fallback));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
