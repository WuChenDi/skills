# ikui conventions

Rules for writing or fixing code that uses ikui components. ikui is themed onto Base UI and ships as copy-paste source, so the code lands in the user's tree — it must match their project, not ikui's repo defaults.

## Base UI, never Radix

ikui's primitive layer is `@base-ui/react`. Base UI APIs differ from Radix:

- Custom triggers/elements use the **`render`** prop, not Radix's `asChild`.
- Component part names and data attributes follow Base UI, not Radix.

Do not pull in `@radix-ui/*`, Headless UI, MUI, Mantine, etc. to "fill a gap" — if a primitive is missing, add the corresponding shadcn (Base UI) component or compose from ikui's existing pieces.

## Client vs server components

The host project is Next.js App Router with `rsc: true`. Anything using `useState`, `useEffect`, refs, `canvas`, audio/video decode, or pointer/drag handlers must start with `"use client"`. Every interactive ikui component already declares it — preserve it. When you wrap an ikui component in your own component that adds state or handlers, that wrapper also needs `"use client"`.

## Styling

- **Tailwind CSS v4, CSS-first.** Theme tokens live in the global CSS file (`globals.css`); there is no `tailwind.config`. Don't create one.
- **`cn()` for class merging** — from the project's `utils` alias (`@/lib/utils` in ikui itself). No manual template-literal ternaries for conditional classes.
- **`className` is for layout, not restyling.** Pass spacing/positioning; don't override a component's colors or typography through `className`. Prefer the component's own props.
- **Semantic color tokens** (`bg-background`, `text-muted-foreground`, …) over raw values like `bg-neutral-900`, and no manual `dark:` color overrides — the tokens already adapt.

## Icons and animation

- Icons: `lucide-react`. Match the project's `iconLibrary` from `components.json` if it differs.
- Animation: `motion` (Framer Motion). Don't add a second animation library.

## Imports and aliases

After `shadcn add`, the CLI rewrites imports to the project's aliases — but **verify**. Read the added files and confirm:

- UI/component imports use the project's real alias (`aliases.components` / `aliases.ui` in `components.json`), not a hardcoded `@/`.
- `cn` imports resolve to `aliases.utils`.
- Transitive `registryDependencies` actually landed (both plain shadcn components and other `@ikui/*` items).

## The timeline coordinate basis

Every timeline primitive (`timeline-ruler`, `timeline-element`, `timeline-playhead`) positions by the **same** formula: `time × pixelsPerSecond × zoom`. When composing them onto a shared track, feed all of them the same `pixelsPerSecond` and `zoom` so the ruler ticks, clips, and playhead line up. The primitives are intentionally "dumb" — they don't own the playback clock or click-to-seek; the consumer wires those.

## Building on `image-crop`

When consuming the `image-crop` primitive directly (instead of the `image-cropper` block), two traps cause the on-screen selection, preview, and output to diverge:

- **Give the crop area a definite height, never a percentage.** The primitive sizes its image through a `max-height: inherit` chain (`outer → media → img`). A percentage like `max-h-full` / `maxHeight: '100%'` fails to resolve down the chain (ancestors have auto height), collapses to `none`, and the image overflows and gets clipped. Pass a real length, e.g. `className="sm:max-h-[calc(20rem_-_1rem)]"`.
- **Map crop → source by displayed image size, not percent-of-box.** Use the **pixel** crop from `onChange`'s first argument and compute `pixelCrop × (naturalSize / img.displayedSize)`. Do **not** use `percentCrop / 100 × naturalSize` — percent is relative to the media box, so once the box differs from the displayed image (letterbox margin) the output drifts from what the user selected.

## Don't reinvent

Before writing custom media/timeline UI, check the registry — ikui likely has the primitive (a waveform, a thumbnail strip, a crop box). Compose existing items instead of hand-rolling canvas/pointer logic. For a finished feature (trim audio, trim video, crop-and-download), prefer the matching `registry:block`.
