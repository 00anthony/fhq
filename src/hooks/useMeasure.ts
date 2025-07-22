import { useRef, useState, useLayoutEffect, RefObject } from 'react';

function useMeasure<T extends HTMLElement = HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const measure = () => setHeight(ref.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return [ref, height];
}

export default useMeasure;
