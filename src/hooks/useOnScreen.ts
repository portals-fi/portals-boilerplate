import { RefObject, useEffect, useState } from "react";

export function useOnScreen(
  ref: RefObject<Element>,
  root?: RefObject<Element>
) {
  const [isOnScreen, setIsOnScreen] = useState(false);
  const [observer, setObserver] = useState<IntersectionObserver>();

  useEffect(() => {
    setObserver(
      new IntersectionObserver(
        ([entry]) => {
          setIsOnScreen(entry.isIntersecting);
        },
        {
          root: root ? root.current : null,
          rootMargin: "0px",
          threshold: 0.1,
        }
      )
    );
  }, [root]);

  useEffect(() => {
    if (observer && ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [ref, observer]);

  return isOnScreen;
}
