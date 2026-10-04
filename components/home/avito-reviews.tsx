import { ArrowUpRight, Quote, Star } from 'lucide-react';
import { customerReviews, reviewSources } from '@/data/customer-reviews';
import styles from './avito-reviews.module.css';

export function AvitoReviews() {
  return (
    <section id="reviews" className={styles.section}>
      <div className="container">
        <div className={styles.heading}>
          <div><span className={styles.overline}>ОТЗЫВЫ ПОКУПАТЕЛЕЙ</span><h2>Нам доверяют</h2></div>
        </div>
        <div className={styles.platforms}>
          {Object.entries(reviewSources).map(([id, source]) => (
            <a key={id} href={source.href} target="_blank" rel="noopener noreferrer" className={styles.platform}>
              <span className={`${styles.mark} ${id === 'yandex' ? styles.yandex : styles.twoGis}`}>{source.mark}</span>
              <span><strong>{source.name}</strong><span className={styles.rating}><Star size={14} fill="currentColor" aria-hidden="true" />5,0 <small>рейтинг магазина</small></span></span>
              <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          ))}
          <a className={styles.avito} href="https://www.avito.ru/brands/appgrademgn?src=sharing" target="_blank" rel="noopener noreferrer">Мы на Авито <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
        <div className={styles.grid}>
          {customerReviews.map((review, index) => {
            const source = reviewSources[review.source];
            return (
              <article key={review.author} className={styles.card}>
                <div className={styles.cardTop}><Quote size={23} aria-hidden="true" /></div>
                <blockquote className={styles.text}>{review.text}</blockquote>
                <div className={styles.author}><span className={`${styles.avatar} ${index % 2 ? styles.green : styles.pink}`}>{review.initials}</span><div><h3>{review.author}</h3>{'date' in review && <span>{review.date}</span>}</div></div>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className={styles.original} aria-label={`Оригинал отзыва ${review.author} на ${source.name}`}>{source.name}<span>Читать оригинал <ArrowUpRight size={13} aria-hidden="true" /></span></a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
