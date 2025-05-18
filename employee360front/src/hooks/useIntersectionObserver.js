import { useEffect, useRef } from 'react';

const useIntersectionObserver = ({ target, onIntersect, threshold = 0.1, enabled = true }) => {
  const observerRef = useRef();

  useEffect(() => {
    if (!enabled || !target.current) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            onIntersect();
          }
        });
      },
      {
        threshold,
      }
    );

    observerRef.current = observer;

    observer.observe(target.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [target, onIntersect, threshold, enabled]);

  return observerRef;
};

export default useIntersectionObserver;