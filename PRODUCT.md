# Product

<!-- impeccable:product-schema 1 -->

> Product truth inferred from the existing README, schema, routes, and implementation. Confirm any missing product decisions in a future init pass.

## Platform

web

## Users

A person managing a personal watch/read/play/listen queue across several kinds of media.

## Product Purpose

TrackIt records content items, their status, progress, ratings, favorites, notes, and activity in one personal dashboard. Success means the user can find an item, understand its current state, and update the next action without losing context.

## Positioning

It is a cross-media personal tracker with one shared status and progress model, rather than separate watchlists for each medium.

## Capabilities and Constraints

- Categories include anime, manga, movies, TV, books, games, podcasts, websites, and other content.
- Search, filtering, ratings, favorites, progress, and activity logging are part of the existing product.
- The implementation uses Next.js, Prisma, PostgreSQL, and local authentication configuration.
- Keep database and authentication behavior intact; do not claim public users or production SLAs.

## Evidence on Hand

- `prisma/schema.prisma`
- `src/app/page.tsx`
- Existing README, seed data, and UI components.

## Product Principles

- The next action should be easier to see than the data model.
- A single personal queue can hold different media without flattening their context.
- Progress and status remain editable, visible, and honest.
