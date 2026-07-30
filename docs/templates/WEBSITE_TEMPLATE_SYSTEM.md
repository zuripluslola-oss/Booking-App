# Website Template System — Locked

## Product decision

Businesses do not receive an unrestricted drag-and-drop website builder in version 1.

They choose from ten professionally designed website templates. Each template is visually distinct, mobile-first, booking-focused, and generated from the business onboarding data.

Customization is intentionally limited so every published site remains polished, fast, accessible, and difficult to break.

## Allowed customization

A business may:

- upload logo, hero, gallery, team, and service images
- edit business name, tagline, biography, contact information, policies, and section copy
- choose from approved color palettes and font pairings for the selected template
- add, remove, hide, show, and reorder supported sections
- choose which services, categories, staff members, reviews, products, offers, and locations appear
- choose a primary call to action such as Book now, Request consultation, Call now, Join waitlist, or Shop
- enable or disable booking, consultation, financing, memberships, packages, gift cards, and retail sections when supported

A business may not:

- freely position individual elements
- upload arbitrary code, scripts, CSS, or plugins
- alter the core responsive grid
- create layouts that break mobile behavior
- remove required legal, accessibility, booking-policy, or platform elements

## Shared section library

Every template is assembled from the same controlled section library:

1. Announcement bar
2. Header and navigation
3. Hero
4. Search or service-category navigation
5. Featured services
6. Full service menu
7. Book-from-image or book-from-video gallery
8. About
9. Team
10. Results / before-and-after
11. Reviews
12. Consultation
13. Memberships and packages
14. Specials and promotions
15. Retail products
16. Financing
17. Policies
18. Frequently asked questions
19. Locations and hours
20. Contact
21. Social feed
22. Final booking call to action
23. Footer

Sections may be hidden, shown, or reordered within safe template rules. Required sections can be locked by profession or regulation.

## Ten locked templates

### 1. Editorial Luxe
Large typography, asymmetrical image composition, restrained animation, premium whitespace, and a magazine-style service presentation. Best for high-end salons, makeup artists, wig specialists, and luxury independent professionals.

### 2. Visual Portfolio
Image-first design with cinematic galleries, video tiles, before-and-after work, and booking directly from visual examples. Best for braiders, nail artists, tattoo artists, makeup artists, and wig specialists.

### 3. Service Menu
A highly organized service-first layout using categories, accordions, clear pricing, durations, descriptions, add-ons, and persistent booking actions. Best for businesses with large menus such as estheticians, nail salons, spas, med spas, and full-service salons.

### 4. Boutique Minimal
Clean, quiet, modern design with short pages, generous whitespace, soft image treatment, and a compact service selection. Best for solo professionals and businesses with a small premium menu.

### 5. Bold Studio
High-contrast type, strong blocks, horizontal motion, expressive navigation, and campaign-style imagery. Best for barbers, tattoo studios, nail artists, and younger street-fashion-led brands.

### 6. Soft Spa
Calm editorial layout, muted palettes, rounded cards, treatment storytelling, and prominent consultation and package sections. Best for estheticians, spas, massage, wellness, brows, and lashes.

### 7. Classic Salon
A polished multi-page structure with hero, services, team, gallery, reviews, policies, contact, and booking. Best for established salons, barbershops, and multi-staff businesses.

### 8. Personal Brand
The professional is the center of the experience. Strong biography, credentials, signature services, social proof, media, and direct booking. Best for educators, celebrity stylists, independent specialists, and appointment-only professionals.

### 9. Marketplace Modern
Fast search, category chips, availability previews, staff cards, service cards, offers, reviews, and location information. Best for larger businesses, multi-service shops, and future marketplace placement.

### 10. Clinical Aesthetic
Crisp, trustworthy, structured design using categorized treatments, consultation pathways, provider credentials, financing, safety information, and educational content. Best for estheticians, advanced skincare, medical aesthetics, and med spas. Medical services remain subject to licensing and business eligibility.

## Responsive behavior

All ten templates must:

- be designed mobile-first
- support phone, tablet, and desktop layouts
- keep Book now or Request consultation reachable without excessive scrolling
- use accessible type sizes and contrast
- support keyboard navigation and screen-reader labels
- avoid horizontal overflow and text clipping
- preserve readable service names, prices, descriptions, and durations
- convert desktop navigation into a controlled mobile menu or accordion

The narrow, clipped service cards shown in the reference screenshots are specifically not acceptable. Long service names must wrap naturally, prices must remain aligned, and cards must adapt to the viewport.

## Service presentation modes

The website system supports four controlled ways to present services:

1. Service cards — image, title, description, price, duration, Book now
2. Category accordion — category heading opens a structured service list
3. Editorial menu — elegant text menu with aligned service details
4. Visual booking gallery — select a result image or video to begin booking the linked service

A template may support more than one mode, but the business chooses only from the approved modes for that template.

## Template data model

Each published website stores:

- template key
- approved palette key
- approved font-pair key
- section order
- section visibility
- section content
- selected service categories
- selected services
- selected staff
- selected locations
- CTA configuration
- media references
- publication status
- draft version
- published version

Content is separate from layout. A business can change templates later without re-entering all business data.

## Version 1 definition of done

- ten selectable template previews
- one shared section/content system
- controlled section add, remove, hide, show, and reorder actions
- live mobile preview
- service and category selection
- template-safe palette and font choices
- draft, preview, publish, and unpublish
- automatic booking links
- no unrestricted drag-and-drop editor

This ten-template system is the locked website direction for the platform.