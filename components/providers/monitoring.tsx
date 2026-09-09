'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics';
export function Monitoring(){const pathname=usePathname();useEffect(()=>{if(!pathname.startsWith('/admin'))track('page_view');},[pathname]);useEffect(()=>{let last=0;const report=()=>{if(Date.now()-last>60000){last=Date.now();track('client_error');}};window.addEventListener('error',report);window.addEventListener('unhandledrejection',report);return()=>{window.removeEventListener('error',report);window.removeEventListener('unhandledrejection',report);};},[]);return null;}
