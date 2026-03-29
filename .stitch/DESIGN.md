# Design System: Taco Bell Drive-Through Redesign
**Stitch Project ID:** `6883950520556782876`
**Design Direction:** `The Nocturnal Drive-Through`
**Source of Truth:** Google Stitch project `Taco Bell Drive-Through Redesign`

## 1. Visual Theme & Atmosphere
This redesign treats the drive-through like a cinematic night instrument, not a generic food-ordering app. The visual mood is a dark, smoked-plum cockpit with neon appetite cues, oversized roadside typography, and HUD-style AI feedback. Customer-facing surfaces should feel electric and immersive. Kitchen-facing surfaces should keep the same family, but shift toward dense operational clarity and touch speed.

The core metaphor is a lit oasis on a dark road. That means light, glow, and contrast do the separation work instead of flat cards and divider-heavy layouts.

## 2. Color Palette & Roles
- **Night Plum** `#151022`: Base canvas for the entire app shell and deepest background.
- **Electric Grape** `#6D28FF`: Brand anchor, hero emphasis, and primary interaction energy.
- **Lavender Signal** `#CEBDFF`: Primary text-on-dark accent, tinted highlights, and neon glow ramps.
- **Fire Orange** `#FF6A1F`: Appetite trigger, urgency accent, and conversion heat.
- **Crunch Gold** `#FFC247`: Pricing, add-to-cart emphasis, warm highlights, and reward moments.
- **Baja Cyan** `#12D7F2`: Reserved for AI, voice state, signal feedback, and informational status.
- **Surface Low** `#1E192B`: Section grouping and large content bands.
- **Surface Mid** `#221D2F`: Default elevated container surface.
- **Surface High** `#2C273A`: Interactive cards and active groupings.
- **Surface Highest** `#373245`: Glass panels, floating order summaries, modal layers, and KDS ticket shells.
- **Readable Body** `#CBC3DA`: Default body text on dark surfaces.
- **Outline** `#948DA3`: Low-contrast outline or ghost-edge treatment only when needed.

## 3. Typography Rules
- **Display / Headlines:** `Space Grotesk`
- **Body / Labels:** `Manrope`

Use display typography aggressively for hero headings, major menu calls, and order-state moments. Customer-facing headings should feel like illuminated roadside signage. Body copy should stay clean and neutral for low-light readability. Avoid cramped UI text. Category labels can use all-caps with extra tracking when the screen needs a more technical or command-center tone.

## 4. Component Stylings
### Buttons
- Primary buttons are pill-shaped and high-contrast.
- Primary CTA fill should bias toward `#6D28FF` with optional gradient lifts into `#CEBDFF`.
- Conversion or hunger CTAs can pivot into `#FF6A1F` when the moment is transactional.
- Define all button states: default, hover, focus, active, disabled, loading.

### Cards & Containers
- Avoid flat grey cards.
- Use smoked acrylic surfaces with soft translucency and depth.
- Prefer generous corner radii over sharp rectangles.
- Cards should separate via value shifts and spacing, not heavy borders.

### Inputs & Voice States
- Inputs should sit on darker recessed surfaces.
- Focus states should glow rather than hard-outline.
- Voice UI and assistant feedback should use `#12D7F2` as a reserved signal language.

### KDS Tickets
- Tickets should read as fast operational units first.
- Status, age, urgency, and bump actions should dominate over decoration.
- Tablet KDS should use larger touch targets and a lower-density grid than desktop KDS.

## 5. Layout Principles
- Build flows, not isolated hero sections.
- Use contrast bands and spacing rhythm to define stage changes.
- Avoid 1px divider-led composition.
- Prefer layered surfaces and wide gutters over card-on-card clutter.
- Customer flow should feel sequential: arrival, build, review, confirm, pickup.
- KDS layouts should be glanceable from a distance and operable with one touch.

## 6. Motion & Interaction
- Motion should feel weighted and intentional, not decorative.
- Use soft pulses for AI listening and active voice states.
- Use ambient glow shifts, staggered reveals, and status transitions.
- Keep kitchen motion minimal and functional.
- Respect reduced-motion preferences.

## 7. Non-Negotiables
- No generic dashboard treatment.
- No pure black or pure white unless explicitly required.
- No emoji-driven UI.
- No heavy border grids for sectioning.
- No glassmorphism overload in KDS where readability would suffer.
- No buried CTA hierarchy.

## 8. Screen Intent
### Customer Flow
- **Arrival:** cinematic voice-first onboarding with immediate AI presence.
- **Menu & Cart:** illuminated menu bays with an always-legible order build area.
- **Review & Confirmation:** clean, confidence-building final pass before send.
- **Order Sent & Pickup:** lane-status and pickup readiness rather than a generic success card.

### Operations Flow
- **Desktop KDS:** command-center density with strong status hierarchy.
- **Tablet KDS:** 11–13 inch landscape touch layout with 2x2 ticket rhythm and oversized action zones.

## 9. Implementation Notes
- Start by extracting tokens from this file into CSS variables or Tailwind theme values.
- Keep customer and kitchen surfaces on the same family, but with different density and emphasis.
- Preserve existing business logic and hooks first; refactor presentation and flow orchestration around them.
