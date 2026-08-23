# TrackIt design direction

## Product world
TrackIt is a private media memory room. The core job is to find the next thing to watch, read, play, or finish without losing the state around it.

## Visual direction
- Seed: ac6091c1 — assigned sparse console dashboard atmosphere.
- Material: deep blue-black void, translucent depth planes, white particles, warm amber selection signal.
- Typography: quiet mono labels with restrained serif item titles.
- Composition: controls and counts establish the room; items become signals in a calm constellation.

## Interaction
- Existing search, category/status filters, favorites, status updates, ratings, progress, and add-item flow remain intact.
- Amber marks active/focused state; it is not used as a decorative badge everywhere.
- The mobile layout keeps the filter rail scrollable and keeps item actions reachable.

## Constraints
- Preserve API/Prisma/auth boundaries and do not expose private collection data in copy.
- Counts are derived from fetched items only; no invented metrics.
- Keep the empty, loading, and add-item states usable in the same visual world.
- Avoid turning every control into a rounded card.

