import {defineArrayMember,defineField} from 'sanity'

function nurseryGallery(name:string,title:string) {
 return defineField({
  name,title,type:'array',
  description:'Upload photos or select existing images. Drag thumbnails to change their order; click a photo to replace it or edit its caption and description.',
  options:{layout:'grid',sortable:true},
  of:[defineArrayMember({
   type:'image',title:'Photo',options:{hotspot:false},
   fields:[
    defineField({name:'caption',title:'Caption',type:'string',description:'The short label shown below the photo.'}),
    defineField({name:'alt',title:'Image description',type:'text',rows:2,description:'Describe the photo for visitors using screen readers.'}),
    // Retain legacy metadata; the website derives dimensions from the selected asset.
    defineField({name:'width',type:'number',hidden:true,readOnly:true}),
    defineField({name:'height',type:'number',hidden:true,readOnly:true}),
   ],
   validation:rule=>rule.custom(value=>!value || value.asset?true:'Upload or select a photo.'),
   preview:{select:{title:'caption',subtitle:'alt',media:'asset'},prepare:({title,subtitle,media})=>({title:title || 'Nursery photo',subtitle:subtitle || 'Add a caption and image description',media})},
  })],
 })
}
export const galleryImagesField=defineField({
 name:'images',title:'Nursery galleries',type:'object',group:'photos',
 options:{collapsible:false},
 fields:[nurseryGallery('angel','Angel photos'),nurseryGallery('abbeyRoad','Abbey Road photos')],
})
