# Taco Bell Redesign Handoff

This repo now contains the approved Stitch redesign package for the Taco Bell AI drive-through. These docs are meant to be consumed by another CLI or implementation agent without needing to re-audit the Stitch project from scratch.

## Stitch Source
- **Project:** `Taco Bell Drive-Through Redesign`
- **Project ID:** `6883950520556782876`
- **Design System:** [`.stitch/DESIGN.md`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/.stitch/DESIGN.md)

## Intent
The current repo has the right product ingredients, but the experience still reads like separate hero, menu, cart, and kitchen moments. The redesign unifies those into one continuous system:

- Customer flow becomes a cinematic nocturnal lane experience.
- AI voice feedback becomes a first-class visual system.
- Menu, cart, review, and pickup feel like connected stages instead of isolated widgets.
- Kitchen UI shifts from consumer glassmorphism toward high-speed operational clarity.

## Screen Inventory
### Desktop
| Label | Stitch Title | Screen ID | Target Repo Surface | Preview |
| --- | --- | --- | --- | --- |
| `D1` | Taco Bell AI Drive-Through Arrival | `7c05b78988154c769ce7a878e9a247ef` | [`app/page.tsx`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/page.tsx), [`components/Hero.tsx`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/components/Hero.tsx), [`app/hooks/useVoiceAI.ts`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/hooks/useVoiceAI.ts) | [open](https://lh3.googleusercontent.com/aida/ADBb0ujoRXUFzzfIzUltDy3WDJXeOYfCPqVW51LFZ5c1cdRCsqvX4cnonXR5lYHsb8DaVJ4Udoqvt0GhSuF1pFt5YW5zke0f6vwgD_N5hKsfDzYcvZSmzRktof8i3y-msw3EL-OeekeazvgTXdumHu0c2CP1saVHkmNk4Zx50SAHQ4rwcilws3Vdq9KaN9F_nHe976wvDA7oiuzqRjWeW0c67hX_ERCflegag13V_bnK2izM4qhHvibvTLlKPpc) |
| `D2` | Taco Bell AI Drive-Through Menu & Cart | `2a6f44d7433d4863a765303434728cb6` | [`app/page.tsx`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/page.tsx), [`app/components/MenuGrid.tsx`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/components/MenuGrid.tsx), [`app/components/CartDrawer.tsx`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/components/CartDrawer.tsx) | [open](https://lh3.googleusercontent.com/aida/ADBb0uj_uPpS5wPUiWK8U5cEn7Y3xlj0P_G-bzG6q4_Egxkodd-achjEZ4GI-mJPYC_bw-D8fx6b_nAZevlpeVriwkkYNFSYldTrGJmNMZ4lyhK2fREBcRR36yPpK-MTXgwJEV3xLgOvrA_kEQKPDnkvPCnmjby9OEP_oR4JTsCjQRtnoeSJOIUoXwApke-kSHY8QOcWFFnASkh-NzTtgdcECIoNv3WxlYqQ4hPM5bsgTOnUkRxfCLM6nEZxStU) |
| `D3` | Order Review & Confirmation | `b9fa20f15695437a9d57aa91daea29ba` | [`app/page.tsx`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/page.tsx), [`app/hooks/useCustomization.ts`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/hooks/useCustomization.ts), [`app/hooks/useRewards.ts`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/hooks/useRewards.ts) | [open](https://lh3.googleusercontent.com/aida/ADBb0uhMxYXLqWOk5RzNdFlrvuuuP99TImZk1LyG4RVpnYsMBpF6Ium-Fx5YnIIKv_DdW6MUkkF-mjleVYa3EAAkfhSjg0gjXe0lodM_XRNxFUHSDJQ9r2ysaQPOj-lSL2s9poyymDzVZGfCVS3XxMO83J8dt_IUGYvGYYhzfbx6pfCNYdQ-aezBEyH1AVpM3kuUeQ7TXPSHgu9HuhDpA9yGaoaQCOpA-ydo0EKiXnS7-S2V9F_fOV2sjTa7gA) |
| `D4` | Order Sent & Pickup Status | `2923285d0be14ed39e2a67ff9daa9f49` | [`app/page.tsx`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/page.tsx), [`app/hooks/useOrderTracking.ts`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/hooks/useOrderTracking.ts) | [open](https://lh3.googleusercontent.com/aida/ADBb0uh_a8h1roCJSqiX5Pxy9Lfunx0E3O62R4q8TbWNtoW_ONYPlEnOEYIndyexetGnNtJ-28GT8XVC6LRDyHOuigUhAoYjFK7O-ELIwsBQlb168GmNbC-g5mykT5iu-AocJw3v6lGV_qH7IECSNgo6Vi9TFQXyjgQcELUoY_KFOt1GQptwUAYKntlIslYfPrvQ8o632pxJrpqlwJHk3MYZq2H1YGxRY_9kI5qzELz3NFUpMOQ05JJUTvB1BFI) |
| `D5` | Taco Bell KDS Command Center | `f38de9aeef0748fb90cf740f58f2bcd5` | [`app/kitchen/page.tsx`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/kitchen/page.tsx) | [open](https://lh3.googleusercontent.com/aida/ADBb0ujzLZFpImOvpKsfAJn3SD-anDNQUOBfYWoBUjoaxe4PJnhDBOedQfc3iXvSJBaQyhD42fAm59DlwqQONiNVSMxbYejE7C0B9HqNlnzRaJrqMPtvphBlladvXg1u78ZH1qYNb2e5lq9U07iKpojyNevh4BdjIHhg9gL7ViIJNQltZrOVJEU7bh_FTEW3wo9x9DU4OGFozdAeXwe0oRXUD9NTeGrQRhlFy0UabRBy1qB6oJh4yTaPm5GRtLg) |

### Mobile
| Label | Stitch Title | Screen ID | Target Repo Surface | Preview |
| --- | --- | --- | --- | --- |
| `M1` | Taco Bell AI Arrival (Mobile) | `25ccf3f5697a406eab1aa7ed2adc181b` | Responsive version of `D1` | [open](https://lh3.googleusercontent.com/aida/ADBb0uiUITMRbWVMaQlWp9al2j7sxIr54PT7Hw_eitNCegeYbEheDvcHfUnxMGT913Dvnn9UqKRjBHsGlblkP7Q5etk9Pu-suErvhgU2G_PTWRlqNz3J08SMuOyn6V1qsDqKH_lS0jpTTwpyoS8in36a8VZOf0NlCMmCaNLCqx36lcWc1hKgJYZw8n0m8lozT81FiNPLZFMkmsE8Yda2CkRMAkhr2YbImNpxfygYm3iviB8-BlfjizvDKMEhLw) |
| `M2` | Taco Bell AI Mobile Menu & Cart | `ae9259d5b0da46f598aa5c4218d7b65e` | Responsive version of `D2` | [open](https://lh3.googleusercontent.com/aida/ADBb0ujUwdogbbdapYnd33vGIdk5uMhgMmczGl3zVHNy5wjjocbOiuo0gpPqu5tWaiXdsfm-jglogEZXsVbASwkGYKGVw_1aYEDz9MzjFIgvyqcghDM2x2_yRGDDin_yaMMnlvddlWmdCxnF4hOQ1XBhAdKDRq08-3c3TWXuTbwY8WcWEvKh4p6_yJGagWUNe06nDbGrkL9IDnsBPB2x3VYAw8U_CjzxKrQ-hs7M3TJOFW_mbNN_Q4k48lq52Q) |
| `M3` | Order Review & Confirmation (Mobile) | `4e9119ec72da40408249a056e52b0fea` | Responsive version of `D3` | [open](https://lh3.googleusercontent.com/aida/ADBb0ugrIY8UgP8tr0aofN8P8BDkzEXwoGAQDNRxwWISLvutn1kLSbpTIgn-a_xW3mMKdR2aYPZfpORlNzvknbnnYb2rk9-NX0Bddhi5r2guFbQmhJJ6UooGgchGrSFmOS6HrkYnll3OyDriOGozpwsRYJ2CcphLEcKYH_8Uh6A10MLSmo5XQ2eIX46-_Y5I6Qin2It9V2FvA9LFgv6la_mU0qS8Fyc28QNt46ToBhUR1f0awnEJ3-DriE_nId4) |
| `M4` | Mobile Order Status & Pickup | `6400f1e250b746058091dc353ea43681` | Responsive version of `D4` | [open](https://lh3.googleusercontent.com/aida/ADBb0ui897KbIsH6voutLrSqK4uzEtVElEiU3kqmhAo9fGT2wVt28nr2VU82zgm2vFpN1xR3EkWjmr8LPxf8tTf6Vkg5V21pSHGUiK83UaZNDAQmUxao1QS2ugvQ5_P18WW01IRDCzMfIPLmHZ1KLlrzxiPUy0u4A81gKAs-rOyFNUNUHfIpjSnh2pbMcZWlfejtzEaiVeN1tohCto-pmF_qNBGQpNf6zlEdkHdshWOdmc9_5nzJoSMARK2GAW0) |

### Tablet KDS
| Label | Stitch Title | Screen ID | Target Repo Surface | Preview |
| --- | --- | --- | --- | --- |
| `T1` | Taco Bell KDS Tablet Command Center | `7cbe99f202064c81aa9c2fd1c28b2713` | Tablet breakpoint for [`app/kitchen/page.tsx`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/kitchen/page.tsx) | [open](https://lh3.googleusercontent.com/aida/ADBb0ujExLy_wIAoEUBZGXIllkn14J3B1Kzb8jTjvakpyCjGSWBOdyPyChesE93ptbArUXYGm8s-eV8fCOh_oRRSJA8nkgrUY_dYK7p03TFEfE2rZhMbtGDImYcWxzcQANd6hiRQa-4ECKC9tF_lodPyc1BiLQMQAzazv3tPPUnygAhUUXCRUZB1g56RP4aG5zof3mQxcAod-xlJQy6EKz3w4NoLM3BgfYD0NuZb2mCuXaA36RFJbxnZbyB-dXk) |

## Implementation Mapping
### Customer Experience
- `D1` should replace the current split between the hero and voice onboarding so the first screen reads as a single arrival state, not a homepage plus a mic widget.
- `D2` should unify menu browsing and cart building into one continuous ordering surface. The current menu cards and cart drawer can keep their underlying data flow, but the visual hierarchy needs to become stage-based instead of component-by-component.
- `D3` should become the explicit pre-submit state. That includes rewards, customization, and final edits instead of treating confirmation as a small add-on step.
- `D4` should replace any lightweight success state with a lane-status and pickup-oriented flow that feels native to drive-through behavior.

### Kitchen Experience
- `D5` is the full desktop KDS direction for larger prep displays.
- `T1` is the 11–13 inch tablet adaptation of the same language. It should not be a straight shrink of `D5`; it should use a lower-density 2x2 ticket rhythm, larger touch targets, and quicker bump flows.

## Build Order
1. Tokenize the system in [`.stitch/DESIGN.md`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/.stitch/DESIGN.md).
2. Refactor the customer-facing flow in [`app/page.tsx`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/page.tsx) into explicit stages that match `D1` through `D4`.
3. Rework menu and cart presentation around `D2` before touching confirmation.
4. Rebuild [`app/kitchen/page.tsx`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/kitchen/page.tsx) against `D5` and `T1` together so desktop and tablet stay in one system.
5. Apply mobile behavior from `M1` through `M4` after the desktop customer flow is stable.

## Guardrails For The Next CLI
- Preserve current business logic and data plumbing first.
- Treat this as a redesign and flow-orchestration pass, not a backend rewrite.
- Reuse existing hooks where possible: [`app/hooks/useVoiceAI.ts`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/hooks/useVoiceAI.ts), [`app/hooks/useOrderTracking.ts`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/hooks/useOrderTracking.ts), [`app/hooks/useCustomization.ts`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/hooks/useCustomization.ts), [`app/hooks/useRewards.ts`](/Users/404kidwiz/projects/taco-bell-ai-drive-through/app/hooks/useRewards.ts).
- Keep customer surfaces cinematic and high-contrast.
- Keep kitchen surfaces operational and touch-first.

## Notes
- This handoff is documentation only. No runtime implementation is included here.
- The repo was already dirty before these docs were added, so implementation work should review existing local changes before touching app code.
