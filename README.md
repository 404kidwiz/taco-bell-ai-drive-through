# 🌮 Taco Bell AI Drive-Through

A modern AI-powered voice ordering system for Taco Bell, built with Next.js 15, OpenAI Realtime API, and Framer Motion.

## Features

🎙️ **Voice AI Ordering**
- Natural conversation with AI assistant
- OpenAI GPT-4o Realtime API integration
- Real-time speech-to-text and text-to-speech

🎨 **Modern UI/UX**
- Taco Bell brand colors and aesthetics
- Smooth animations with Framer Motion
- Glass morphism design
- Mobile-responsive layout

🛒 **Full Order Flow**
- Interactive menu with 20+ items
- Shopping cart with quantity management
- Order confirmation and checkout

⚡ **Performance**
- Next.js 15 with App Router
- Static export for fast deployment
- Optimized bundle size

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom with Framer Motion
- **Voice AI**: OpenAI Realtime API
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key with Realtime API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/taco-bell-ai-drive-through.git
cd taco-bell-ai-drive-through
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```env
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variable: `NEXT_PUBLIC_OPENAI_API_KEY`
4. Deploy!

### Manual Build

```bash
npm run build
```

Static files will be in `dist/` directory.

## How It Works

1. **Start Order**: Click the microphone button to connect to voice AI
2. **Speak Naturally**: Tell the AI what you'd like to order
3. **Review Cart**: Items are automatically added to your cart
4. **Confirm**: Review and confirm your order
5. **Enjoy**: Get your order number!

## Menu

The app includes 20+ Taco Bell menu items:
- 🌮 Tacos (Crunchy, Soft, Doritos Locos)
- 🌯 Burritos (Bean, Beefy 5-Layer, Quesarito)
- ⭐ Specialties (Nachos BellGrande, Mexican Pizza, Chalupa)
- 🍟 Sides (Cinnamon Twists, Cheesy Roll Up)
- 🥤 Drinks (Baja Blast, Pepsi, Lemonade)

## Voice AI Integration

The app uses OpenAI's Realtime API for natural voice conversations:
- Speech-to-text: Automatic transcription of user speech
- Text-to-speech: AI responses spoken aloud
- Voice activity detection: Automatic turn-taking
- Low latency: Sub-second response times

## Customization

### Adding Menu Items

Edit `app/data/menu.ts`:

```typescript
{
  id: "new-item",
  name: "New Item",
  description: "Description here",
  price: 2.99,
  category: "tacos",
  popular: true,
  calories: 250
}
```

### Changing Colors

Edit CSS variables in `app/globals.css`:

```css
:root {
  --taco-purple: #451551;
  --taco-magenta: #9D1F60;
  --taco-pink: #D71A64;
  --taco-orange: #F58220;
  --taco-yellow: #FFC600;
}
```

## Architecture

```
app/
├── page.tsx              # Main drive-through interface
├── layout.tsx            # Root layout with fonts
├── globals.css           # Global styles + Taco Bell theme
├── types.ts              # TypeScript types
├── data/
│   └── menu.ts           # Menu items data
├── components/
│   ├── VoiceVisualizer.tsx   # Audio visualization
│   ├── MenuGrid.tsx          # Menu display grid
│   └── CartDrawer.tsx        # Shopping cart slide-out
└── hooks/
    └── useVoiceAI.ts         # Voice AI WebSocket hook
```

## Future Enhancements

- [ ] Payment integration (Stripe)
- [ ] Order tracking
- [ ] User accounts and favorites
- [ ] Nutritional information filtering
- [ ] Customization options (extra cheese, no lettuce, etc.)
- [ ] Multi-language support
- [ ] Drive-thru simulation mode

## License

MIT License - feel free to use for your own projects!

## Credits

- Built with [Next.js](https://nextjs.org)
- Voice AI powered by [OpenAI](https://openai.com)
- Icons by [Lucide](https://lucide.dev)
- Animations by [Framer Motion](https://framer.com/motion)

---

🌮 ¡Yo quiero Taco Bell! 🌮
