import {galleryImagesField} from './gallery'
import {defineType, defineField, defineArrayMember, type FieldDefinition} from 'sanity'
import models from '../../lib/sanity/content-model.json'
import {fieldName} from '../../lib/sanity/shape'

function title(key: string, value: unknown) {
  if (key === 'seoTitle') return 'SEO title'
  if (key === 'seoDescription') return 'SEO description'
  if (key === 'copy' || key === 'texts') return 'Page text'
  if (key === 'menus') return 'Navigation menus'
  if (key === 'items' && Array.isArray(value) && value[0]?.question) return 'Questions'
  if (key === 'items' && Array.isArray(value) && value[0]?.category) return 'Announcements'

  if (/^(text|paragraph)\d+$/.test(key) && typeof value === 'string')
    return value.replace(/\*\*/g, '').slice(0, 65)
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
}
function fields(value: Record<string, unknown>): FieldDefinition[] {
  if ('category' in value && 'title' in value)
    value = {
      published: true,
      showFrom: '',
      showUntil: '',
      date: '',
      dateLabel: '',
      href: '',
      linkLabel: '',
      summary: '',
      ...value,
    }

  return Object.entries(value)
    .filter(
      ([, child]) =>
        !child ||
        typeof child !== 'object' ||
        Array.isArray(child) ||
        Object.keys(child).length > 0,
    )
    .map(([key, child]) =>
      defineField({
        name: fieldName(key),
        title: title(key, child),
        ...(['standard', 'funded15', 'funded30'].includes(key)
          ? {
              description:
                'Monthly fees in pounds (£). Values are ordered: 3 days, 4 days, 5 days a week.',
            }
          : key === 'extras'
            ? {
                description:
                  'Per funded day, in pounds (£): food, non-food consumables, extra-curricular activities.',
              }
            : {}),
        hidden: ['width', 'height'].includes(key),
        readOnly: ['slug', 'id', 'width', 'height'].includes(key),
        ...(['slug', 'id'].includes(key) ? {initialValue: () => crypto.randomUUID()} : {}),
        ...(/^paragraph\d+$/.test(key)
          ? {
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'block',
                  styles: [{title: 'Normal', value: 'normal'}],
                  lists: [],
                  marks: {decorators: [{title: 'Strong', value: 'strong'}], annotations: []},
                }),
              ],
            }
          : ['start', 'end', 'date', 'showFrom', 'showUntil'].includes(key)
            ? {type: 'date'}
            : shape(child)),
        ...(child && typeof child === 'object' && !Array.isArray(child) && !('category' in value)
          ? {validation: (rule: {required(): unknown}) => rule.required()}
          : {}),
        ...(['start','end'].includes(key) ? {validation:(rule:{required():unknown})=>rule.required()} : {}),
        ...(['sections'].includes(key) ? {validation:(rule:{required():{min(n:number):unknown}})=>rule.required().min(2)} : {}),
        ...(['slides', 'angelFees', 'abbeyRoadFees'].includes(key)
          ? {validation: (rule: {required(): {min(n: number): unknown}}) => rule.required().min(1)}
          : {}),
        ...(['alt', 'imageAlt'].includes(key)
          ? {description:'Describe the image for people using screen readers. Leave blank only when the image is decorative.'}
          : {}),
        ...(['standard', 'funded15', 'funded30', 'extras'].includes(key)
          ? {validation: (rule: {required(): {length(n:number):unknown};length(n: number): unknown}) => key==='funded15'?rule.length(3):rule.required().length(3)}
          : {}),
      } as FieldDefinition),
    )
}
function shape(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    const objects = value.filter((v) => v && typeof v === 'object' && !Array.isArray(v))
    const sample = objects.length ? Object.assign({}, ...objects) : value.find((v) => v !== null)
    const member=shape(sample)
    return {
      type: 'array',
      of: [
        defineArrayMember({
          name: member.type==='object' ? 'item' : undefined,
          ...member,
        } as Parameters<typeof defineArrayMember>[0]),
      ],
    }
  }
  if (value && typeof value === 'object') {
    const data = value as Record<string, unknown>
    if (typeof data.src === 'string' || typeof data.imageSrc === 'string') {
      return {
        type: 'image',
        options: {hotspot: false},
        fields: fields(
          Object.fromEntries(
            Object.entries(data).filter(([k]) => !['src', 'imageSrc'].includes(k)),
          ),
        ),
      }
    }
    return {type: 'object', fields: fields(data), options: {collapsible: true, collapsed: true}}
  }
  if (typeof value === 'string' && value.startsWith('/images/')) return {type: 'image'}
  if (typeof value === 'number')
    return {type: 'number', validation: (rule: {min(n: number): unknown}) => rule.min(0)}
  if (typeof value === 'boolean') return {type: 'boolean'}
  return {
    type: typeof value === 'string' && value.length > 150 ? 'text' : 'string',
    ...(typeof value === 'string' && value.length > 150 ? {rows: 4} : {}),
  }
}
export const pageModels = models
export const schemaTypes = models.map((model) =>
  defineType({
    name: fieldName(model.slug) + 'Page',
    title: model.title,
    type: 'document',
    fields: model.slug==='gallery' ? fields(model.content).map(field=>field.name==='images' ? galleryImagesField : {...field,group:field.name.startsWith('seo')?'seo':'text'}) : fields(model.content),
    ...(model.slug==='gallery' ? {groups:[{name:'photos',title:'Photos',default:true},{name:'text',title:'Page text'},{name:'seo',title:'Search appearance'}]} : {}),
    preview: {prepare: () => ({title: model.title, subtitle: model.path})},
  }),
)
