'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){useEffect(()=>track('client_error'),[]);return <main className="container" style={{paddingBlock:60}}><h1>Не удалось загрузить страницу</h1><p>Попробуйте ещё раз. Содержимое корзины сохранено в браузере.</p><button onClick={reset}>Повторить</button><a href="/">На главную</a></main>;}
