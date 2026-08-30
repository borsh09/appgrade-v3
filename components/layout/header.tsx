'use client';
import Link from 'next/link';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { CitySelect } from '@/components/shared/city-select';
const nav = ['Каталог', 'Trade-In', 'Акции', 'Доставка', 'Контакты'];
export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="container header-inner">
    <Link href="/" className="logo" aria-label="APPGRADE — на главную"><span>APP</span>GRADE</Link>
    <nav className="desktop-nav" aria-label="Основная навигация">{nav.map((item) => <Link key={item} href={item === 'Trade-In' ? '#trade-in' : `#${item.toLowerCase()}`}>{item}</Link>)}</nav>
    <div className="header-actions"><div className="desktop-city"><CitySelect /></div><button className="icon-button" aria-label="Поиск"><Search size={20} strokeWidth={1.6} /></button><button className="icon-button bag" aria-label="Корзина"><ShoppingBag size={20} strokeWidth={1.6} /><span>0</span></button><button className="icon-button menu-button" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button></div>
  </div><div className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}><div className="container"><CitySelect /><nav>{nav.map((item) => <Link onClick={() => setOpen(false)} key={item} href={item === 'Trade-In' ? '#trade-in' : `#${item.toLowerCase()}`}>{item}<span>↗</span></Link>)}</nav></div></div></header>;
}
