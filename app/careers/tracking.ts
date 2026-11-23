'use client';
import {useEffect,useRef} from 'react';
import {readConsent,loadAnalytics} from '../analytics';
const allowed=new Set(['listing_view','job_view','apply_click','application_start','qualification_complete','cv_attached','application_submit','application_error','filter_change']);
export function trackCareerEvent(action:string){
 if(!allowed.has(action)||readConsent()!=='granted'||window.location.hostname!=='www.beckett-house.co.uk')return;
 loadAnalytics();
 const browser=window as Window & {dataLayer?:unknown[]};
 (browser.dataLayer??=[]).push({event:`careers_${action}`});
}
export function useCareerView(action:string,id=''){
 const last=useRef('');
 useEffect(()=>{const key=action+id;if(last.current===key)return;last.current=key;trackCareerEvent(action);},[action,id]);
}
