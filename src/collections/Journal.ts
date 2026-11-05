import type { CollectionConfig } from 'payload'

export const Journal: CollectionConfig = {
  slug: 'journal',
  labels: { singular: 'Journal entry', plural: 'Journal' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'room', 'publishedAt'],
    description: 'Editorial stories shown on /journal and the home page.',
  },
  access: { read: () => true },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'URL — e.g. slow-sunday-ritual' },
    },
    {
      name: 'room',
      type: 'select',
      defaultValue: 'day-in',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Day In', value: 'day-in' },
        { label: "Friend's House", value: 'friends-house' },
        { label: 'Quick Errand', value: 'quick-errand' },
        { label: 'Little Things', value: 'little-things' },
      ],
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'excerpt', type: 'textarea', required: true },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    {
      name: 'coverPath',
      type: 'text',
      admin: { description: 'Fallback image path in /public (used when no cover is uploaded).' },
    },
    { name: 'content', type: 'richText' },
  ],
}
