import {defineType, defineField, defineArrayMember} from 'sanity'
export const jobSchema = defineType({
  name: 'job',
  title: 'Job opportunity',
  type: 'document',
  groups: [
    {name: 'role', title: 'Role details', default: true},
    {name: 'advert', title: 'Job advert'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'role', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'role',
      options: {source: 'title'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'status',
      type: 'string',
      group: 'role',
      options: {list: ['open', 'closed'], layout: 'radio'},
      initialValue: 'open',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'isSample',
      title: 'Sample role (review only)',
      type: 'boolean',
      group: 'role',
      initialValue: false,
      description:
        'Sample roles are clearly labelled, hidden from search engines and do not accept applications.',
    }),
    defineField({
      name: 'location',
      type: 'string',
      group: 'role',
      options: {
        list: [
          {title: 'Angel', value: 'angel'},
          {title: 'Abbey Road', value: 'abbey-road'},
        ],
      },
      validation: (r) => r.required(),
    }),
    ...['department', 'employmentType', 'salary', 'hours'].map((name) =>
      defineField({name, type: 'string', group: 'role', validation: (r) => r.required()}),
    ),
    defineField({name: 'postedAt', type: 'date', group: 'role', validation: (r) => r.required()}),
    defineField({
      name: 'closingDate',
      type: 'date',
      group: 'role',
      description:
        'Applications close at the end of this day, London time. Leave blank for ongoing recruitment.',
      validation: (r) =>
        r.custom(
          (value, context) =>
            !value ||
            !context.document?.postedAt ||
            value >= String(context.document.postedAt) ||
            'Closing date must be on or after the posted date.',
        ),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      group: 'advert',
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'sections',
      type: 'array',
      group: 'advert',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'jobSection',
          fields: [
            defineField({name: 'heading', type: 'string', validation: (r) => r.required()}),
            defineField({
              name: 'body',
              type: 'text',
              rows: 8,
              description: 'Use a new paragraph for each point.',
              validation: (r) => r.required(),
            }),
          ],
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'location'}},
})
