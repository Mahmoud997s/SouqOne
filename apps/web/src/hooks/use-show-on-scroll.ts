import { useEffect, useState } from "react";

export const useShowOnScroll = (scrollYNeeded = 0) => {
  const [isShowOnScroll, setIsShowOnScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > scrollYNeeded) {
        setIsShowOnScroll(true);
      } else {
        setIsShowOnScroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollYNeeded]);

  return { isShowOnScroll };
};
