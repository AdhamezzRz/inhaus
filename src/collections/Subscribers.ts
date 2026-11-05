import type { CollectionConfig } from 'payload'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Haus list subscriber', plural: 'Haus list' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'source', 'createdAt'],
    description: 'People who joined the haus list from the website footer.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false, // only via the site's server action (local API)
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'source', type: 'text', defaultValue: 'footer' },
  ],
}
