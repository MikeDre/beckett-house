import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes, pageModels} from './schemaTypes'
import {presentationTool, defineLocations} from 'sanity/presentation'
import {fieldName} from '../lib/sanity/shape'
import {PREVIEW_URL} from '../lib/sanity/config'

export default defineConfig({
  name: 'default',
  title: 'Beckett House',

  projectId: 'lk8ts1r7',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Website content')
          .items([
            S.documentTypeListItem('job').title('Job opportunities'),
            ...pageModels.map((page) =>
              S.listItem()
                .id(page.slug)
                .title(page.title)
                .child(
                  S.document()
                    .schemaType(fieldName(page.slug) + 'Page')
                    .documentId('page-' + page.slug),
                ),
            ),
          ]),
    }),
    presentationTool({
      previewUrl: {
        initial: PREVIEW_URL,
        previewMode: {enable: '/api/draft-mode/enable', disable: '/api/draft-mode/disable'},
      },
      resolve: {
        locations: {
          job: defineLocations({
            select: {title: 'title', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: doc?.slug
                ? [{title: doc.title || 'Job opportunity', href: `/careers/${doc.slug}`}]
                : [],
            }),
          }),
          ...Object.fromEntries(
            pageModels.map((page) => [
              fieldName(page.slug) + 'Page',
              defineLocations({locations: [{title: page.title, href: page.path}]}),
            ]),
          ),
        },
      },
    }),
    visionTool(),
  ],
  document: {
    actions: (actions, context) =>
      context.documentId?.startsWith('page-')
        ? actions.filter(
            (action) => !['delete', 'duplicate', 'unpublish'].includes(action.action || ''),
          )
        : actions,
  },

  schema: {
    types: schemaTypes,
  },
})
