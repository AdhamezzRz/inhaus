import type { GlobalConfig } from 'payload'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home page',
  access: { read: () => true },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero',
      fields: [
        { name: 'heroEyebrow', type: 'text', defaultValue: 'Fall 2026 — Loungewear for living in' },
        { name: 'heroTitle', type: 'text', defaultValue: 'wear it. live in it.' },
        { name: 'heroCaption', type: 'text', defaultValue: 'Come in. Stay a while.' },
      ],
    },
    {
      name: 'manifesto',
      type: 'textarea',
      admin: { description: 'The big statement under the hero.' },
    },
    {
      type: 'collapsible',
      label: 'The Line (product rail)',
      fields: [
        { name: 'lineTitle', type: 'text', defaultValue: 'fresh off the line' },
        { name: 'lineIntro', type: 'text' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Packaging',
      fields: [
        { name: 'packagingTitle', type: 'text', defaultValue: 'wrapped like a gift' },
        { name: 'packagingText', type: 'textarea' },
      ],
    },
  ],
}
