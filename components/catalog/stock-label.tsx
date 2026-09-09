'use client';
import { useStock } from '@/components/providers/price-provider';
export function StockLabel({id}:{id:string}){const stock=useStock();return <>{stock(id)===0?'Нет в наличии':'В наличии'}</>;}
