const checkIE = () => {
  const ua = window.navigator.userAgent;
  const msie = ua.indexOf("MSIE ");
  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./)) {
    return true;
  }
  return false;
};

// const forEach = (array, callback, scope) => {
//   for (let i = 0; i < array.length; i++) {
//     callback.call(scope, i, array[i]);
//   }
// };

// const hasClass = (el, cls) => {
//   const str = " " + el.className + " ";
//   const testCls = " " + cls + " ";
//   return str.indexOf(testCls) !== -1 ? el : false;
// };

// const isDescendant = (target, descendant) => {
//   let node = target;
//   while (
//     node !== null &&
//     node !== document.body &&
//     node !== document.documentElement
//   ) {
//     if (typeof descendant === "string") {
//       if (node.matches(descendant)) return node;
//     } else if (node === target) return node;
//     node = node.parentNode;
//   }
//   return false;
// };

interface scrollToArgs {
  top?: number;
  left?: number;
  duration:
    | {
        exact: number;
      }
    | {
        relative: number;
      };
  element: HTMLElement | Element;
  easing?: "linear" | "easeInOutQuad";
  callback?: () => void;
}

const scrollTo = ({
  top,
  left,
  duration,
  element,
  easing = "linear",
  callback,
}: scrollToArgs) => {
  if (!element) element = document.scrollingElement || document.documentElement;

  // t = current time
  // b = start value
  // c = change in value
  // d = duration;
  const easingMethod = (
    t: number,
    b: number,
    c: number,
    d: number,
    method: typeof easing
  ) => {
    if (method === "easeInOutQuad") {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }
    // linear
    return (c / d) * t;
  };
  // scroll Y
  if (top) {
    const topDuration =
      "exact" in duration ? duration.exact : duration.relative * top;
    const start = element.scrollTop;
    const change = top - start;
    const startDate = +new Date();
    const animateScroll = () => {
      const currentDate = +new Date();
      const currentTime = currentDate - startDate;
      element.scrollTop = easingMethod(
        currentTime,
        start,
        change,
        topDuration,
        easing
      );
      if (currentTime < topDuration) {
        requestAnimationFrame(animateScroll);
      } else {
        // animation finished
        element.scrollTop = top;
        callback?.();
      }
    };
    animateScroll();
  }
  // scroll X
  if (left) {
    const leftDuration =
      "exact" in duration ? duration.exact : duration.relative * left;

    const start = element.scrollLeft;
    const change = left - start;
    const startDate = +new Date();
    const animateScroll = () => {
      const currentDate = +new Date();
      const currentTime = currentDate - startDate;
      element.scrollLeft = easingMethod(
        currentTime,
        start,
        change,
        leftDuration,
        easing
      );
      if (currentTime < leftDuration) {
        requestAnimationFrame(animateScroll);
      } else {
        // animation finished
        element.scrollLeft = left;
        callback?.();
      }
    };
    animateScroll();
  }
};

export { checkIE, scrollTo };
