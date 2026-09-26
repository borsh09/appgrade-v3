import Image from 'next/image';
import styles from './brand-wordmark.module.css';

export function BrandWordmark({ priority = false }: { priority?: boolean }) {
  return (
    <span className={`${styles.wordmark} appgrade-brand-wordmark`}>
      <Image
        src="/images/appgrade-logo-hq.png"
        alt="APPGRADE"
        width={1930}
        height={330}
        priority={priority}
        unoptimized
      />
    </span>
  );
}
