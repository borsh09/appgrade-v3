import { forwardRef, type AnchorHTMLAttributes } from 'react';

type SafeLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Full document navigation avoids the current Vinext RSC-link runtime bug. */
const Link = forwardRef<HTMLAnchorElement, SafeLinkProps>(function Link(
  { href, children, target = '_top', ...props },
  ref,
) {
  return (
    <a ref={ref} href={href} target={target} {...props}>
      {children}
    </a>
  );
});

export default Link;
