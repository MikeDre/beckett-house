import type { Metadata } from "next";
import { DEFAULT_OPEN_GRAPH } from "../../lib/seo";
import { getPublishedNurseryPage } from "../../lib/nursery-page-store";
export { default } from "../abbey-road-home";
export async function generateMetadata():Promise<Metadata> {
 const content = await getPublishedNurseryPage("abbey-road");
 return {title:{absolute:content.seoTitle},description:content.seoDescription,alternates:{canonical:"/abbey-road"},openGraph:{...DEFAULT_OPEN_GRAPH,title:content.seoTitle,description:content.seoDescription,url:"/abbey-road",images:[{url:content.hero.slides[0].src,alt:content.hero.slides[0].alt,width:content.hero.slides[0].width,height:content.hero.slides[0].height}]},twitter:{card:"summary_large_image",title:content.seoTitle,description:content.seoDescription,images:[{url:content.hero.slides[0].src,alt:content.hero.slides[0].alt,width:content.hero.slides[0].width,height:content.hero.slides[0].height}]}};
}
