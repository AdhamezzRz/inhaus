import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: { read: () => true },
  fields: [
    {
      name: 'announcements',
      type: 'array',
      labels: { singular: 'Announcement', plural: 'Announcements' },
      admin: { description: 'Rotating messages in the top bar.' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'marquee',
      type: 'array',
      admin: { description: 'Phrases in the scrolling ribbon.' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    { name: 'contactEmail', type: 'email' },
    { name: 'instagram', type: 'text', admin: { description: 'Handle without @' } },
    { name: 'tiktok', type: 'text' },
    { name: 'whatsapp', type: 'text', admin: { description: 'International number, digits only' } },
  ],
}
