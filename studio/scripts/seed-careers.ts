import {getCliClient} from 'sanity/cli'
import {careersPage} from '../../lib/careers'
const client = getCliClient({apiVersion: '2026-11-17'}).withConfig({
  projectId: 'lk8ts1r7',
  dataset: 'production',
  useCdn: false,
})
await client.createIfNotExists({_id: 'page-careers', _type: 'careersPage', ...careersPage, benefits:careersPage.benefits.map((item,index)=>({...item,_type:'item',_key:`benefit${index}`}))})
const page=await client.getDocument('page-careers')
if(page?.benefits?.some((item:{_key?:string;_type?:string})=>!item._key||!item._type))await client.patch(page._id).ifRevisionId(page._rev).set({benefits:page.benefits.map((item:{_key?:string;_type?:string},index:number)=>({...item,_type:item._type||'item',_key:item._key||`benefit${index}`}))}).commit()
const roles = [
  {
    title: 'Early Years Practitioner',
    slug: 'early-years-practitioner-angel',
    location: 'angel',
    department: 'Early years',
    salary: 'Salary to be confirmed',
  },
  {
    title: 'Nursery Room Leader',
    slug: 'nursery-room-leader-abbey-road',
    location: 'abbey-road',
    department: 'Leadership',
    salary: 'Salary to be confirmed',
  },
  {
    title: 'Early Years Practitioner',
    slug: 'early-years-practitioner-abbey-road',
    location: 'abbey-road',
    department: 'Early years',
    salary: 'Salary to be confirmed',
  },
]
for (const role of roles) {
  if (await client.fetch('count(*[_type=="job" && slug.current==$slug])', {slug: role.slug}))
    continue
  await client.create({
    _type: 'job',
    ...role,
    slug: {_type: 'slug', current: role.slug},
    employmentType: 'Full-time · Permanent',
    hours: '40 hours · Monday to Friday',
    postedAt: new Date().toISOString().slice(0, 10),
    status: 'open',
    isSample: true,
    summary:
      role.department === 'Leadership'
        ? 'Lead a welcoming nursery room, support your colleagues and create an inspiring environment for young children.'
        : 'Help children learn through play, build strong relationships with families and bring curiosity to every nursery day.',
    sections: [
      {
        _type: 'jobSection',
        _key: 'about',
        heading: 'About the role',
        body: 'Join our caring Montessori nursery team and help create a calm, stimulating environment where children can explore, learn and thrive.\n\nThis sample advert demonstrates the careers section. Final responsibilities, salary and benefits will be confirmed before recruitment opens.',
      },
      {
        _type: 'jobSection',
        _key: 'responsibilities',
        heading: 'What you’ll do',
        body: 'Plan engaging activities that respond to children’s interests and development.\n\nBuild positive relationships with children, parents and colleagues.\n\nSupport a safe, inclusive environment and follow nursery safeguarding procedures.\n\nObserve children’s progress and contribute to thoughtful learning plans.',
      },
      {
        _type: 'jobSection',
        _key: 'requirements',
        heading: 'What you’ll bring',
        body: 'A relevant Level 3 or above Early Years qualification.\n\nExperience supporting young children in an early years setting.\n\nAn understanding of the EYFS and a willingness to develop your Montessori practice.\n\nAvailability for shifts of 8am–4pm or 10am–6pm, five days a week.',
      },
      {
        _type: 'jobSection',
        _key: 'process',
        heading: 'How to apply',
        body: 'Start with two short qualifying questions, then complete the application with your qualifications, employment history and reasons for joining us. Shortlisted applicants will be contacted about the next stage.',
      },
    ],
  })
}
await client
  .patch('page-privacy')
  .setIfMissing({
    'copy.recruitmentTitle': 'Job applications',
    'copy.recruitmentPrivacy':
      'When you apply for a role, we collect your contact details, qualifying answers, qualifications, employment history and supporting information. We use these details to assess your application and contact you about recruitment. Applications are stored in our restricted staff inbox, sent to the relevant nursery by email and recorded in our recruitment spreadsheet. Please avoid including sensitive personal information that is not needed for your application. Contact the nursery if you would like to discuss your information or request its removal.',
  })
  .commit()
console.log('Careers page and three sample roles ready. Existing content preserved.')
