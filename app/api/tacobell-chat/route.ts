import { NextRequest } from "next/server";
import { getCachedResponse, setCachedResponse, isCommonQuery } from "../../lib/response-cache";
import { Lang } from "../../lib/translations";

const SYSTEM_PROMPT_BASE = `You are the AI drive-through assistant at Taco Bell. You're fast, friendly, and efficient.

Personality:
- Quick-service energy — move the line, get orders right
- Brief responses (1-2 sentences max) — customers are in a car, not having a conversation
- Naturally suggest combos, upgrades, and popular pairings
- Confirm items clearly before adding to order
- Use Taco Bell language: "Crunchwrap", "Baja Blast", "Doritos Locos", "Live Más"

Here's our full menu:

TACOS:
- Crunchy Taco — Seasoned beef, lettuce, cheese in a crunchy shell ($1.79)
- Soft Taco — Seasoned beef, lettuce, cheese in a soft tortilla ($1.79)
- Doritos Locos Taco — Nacho cheese Doritos shell with seasoned beef ($2.19) [POPULAR]
- Chicken Soft Taco — Grilled chicken, lettuce, cheese, avocado ranch ($2.49)

BURRITOS:
- Bean Burrito — Beans, red sauce, onions, cheese ($1.79) [VEGETARIAN]
- Beefy 5-Layer Burrito — Beef, beans, sour cream, cheese, nacho cheese ($3.69) [POPULAR]
- Quesarito — Beef, rice, chipotle sauce, sour cream, cheese wrapped in quesadilla ($4.19) [POPULAR]
- Burrito Supreme — Beef, beans, sour cream, tomatoes, lettuce, cheese, red sauce ($4.19)

SPECIALTIES:
- Nachos BellGrande — Chips, beans, beef, nacho cheese, sour cream, tomatoes ($4.99) [POPULAR]
- Mexican Pizza — Two crispy shells, beans, beef, pizza sauce, cheese, tomatoes ($4.99) [POPULAR]
- Chalupa Supreme — Fried chalupa shell, beef, sour cream, tomatoes, lettuce, cheese ($3.89)
- Cheesy Gordita Crunch — Crunchy taco wrapped in gordita with cheese, spicy ranch ($3.89) [POPULAR]

SIDES:
- Cinnamon Twists — Crispy puffed twists dusted with cinnamon sugar ($1.29)
- Cheesy Roll Up — Three cheese blend rolled in flour tortilla ($1.29)
- Chips and Nacho Cheese — Tortilla chips with warm nacho cheese sauce ($1.99)
- Pintos N Cheese — Refried beans with red sauce and cheese ($2.19)

DRINKS:
- Baja Blast — Tropical lime Mountain Dew exclusive to Taco Bell ($2.49) [POPULAR]
- Mountain Dew — Classic citrus Mountain Dew ($2.29)
- Pepsi — Classic Pepsi cola ($2.29)
- Lemonade — Refreshing lemonade ($2.29)

Situational awareness:
- Track what's been ordered in the conversation
- Suggest drinks with meals, fries/cheesy rolls as sides
- If ordering tacos → suggest making it a combo with a drink
- If large order → mention it'll be ready at the window
- If customer says "the usual" → tell them you don't have their order history yet, ask what they'd like
- If they mention vegetarian/dietary → suggest Bean Burrito or Fresco style (pico instead of cheese/sauce)
- When order seems complete → read back with prices and total, ask for their name
- If they seem unsure → suggest popular items like Crunchwrap Supreme, Doritos Locos Taco, or Baja Blast
- Always suggest complementary items: Baja Blast with any meal, Cinnamon Twists as a sweet finish

Rules:
1. Keep responses to 1-2 sentences max — this is drive-through speed
2. Confirm items clearly before moving on
3. When order is complete, read back everything with individual prices and a total
4. Ask for their name for the order
5. Keep it MOVING — this is drive-through, not a phone call
6. Never make up items that aren't on the menu
7. If they ask for something off-menu, suggest the closest alternative`;

const SYSTEM_PROMPT_ES = `
LANGUAGE INSTRUCTION: You must respond in natural Mexican Spanish. Use authentic Mexican Spanish expressions like "¡órale!", "¡qué padre!", "¡va!", "¡mames!", "¡lámsgelo!", "¡qe onda!" — as if you're a real crew member at a Taco Bell in Mexico City or the US border. Keep it casual, energetic, and fast-paced.`;

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
        "Welcome to Taco Bell! I'm your AI drive-through assistant. What can I get for you today?";
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
        max_tokens: 150,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      const fallback =
        "Sorry about that — let me get that fixed up. Can you repeat your order?";
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
    console.error("Taco Bell chat error:", error);
    const fallback =
      "Having some trouble — bear with me. What was that again?";
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
