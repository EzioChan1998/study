window.onload = function() {
  let view = document.querySelector('.viewport');
  let scrollBarInner = document.querySelector('.scroll-bar-inner') as HTMLDivElement;
  let widthTimer:number|undefined = undefined;
  const thumbStatus = {
    isClick: false,
    mouseDownY: 0,
    thumbTop: 0,
  }

  if(!view) {
    view = document.createElement('div');
    view.className = 'viewport';
    document.body.appendChild(view);
  }

  Array.from({ length: 30 }, (v, i) => i).forEach(idx => {
    const box = document.createElement('div');
    box.className = 'box';
    box.innerHTML = `${idx + 1}`;
    view.appendChild(box);
  });

  const viewportCH = view.clientHeight;
  const viewportSH = view.scrollHeight;
  const scrollBarHeight = (document.querySelector('.scroll-bar-inner') as Element).clientHeight;

  const thumbHeight = (viewportCH * scrollBarHeight) / viewportSH;
  const thumb:HTMLDivElement = document.querySelector('.scroll-thumb') as HTMLDivElement;
  thumb.style.height = thumbHeight + 'px';

  view.addEventListener('scroll', () => {
    const scrollPercent = view.scrollTop / view.scrollHeight;
    thumb.style.top = scrollBarHeight * scrollPercent + 'px';
  });

  const observerArea = document.querySelector('.observer-area') as HTMLDivElement;
  observerArea.addEventListener('mouseenter', () => {
    clearTimeout(widthTimer);
    (document.querySelector('.scroll-bar') as HTMLDivElement).style.width = '15px';
  });

  observerArea.addEventListener('mouseleave', () => {
    // @ts-ignore
    widthTimer = setTimeout(() => {
      (document.querySelector('.scroll-bar') as HTMLDivElement).style.width = '5px';
    }, 1000);
  });

  scrollBarInner.addEventListener('mouseover', () => {
    clearTimeout(widthTimer);
  });

  thumb.addEventListener('mousedown', () => {
    thumbStatus.isClick = true;
  });

  thumb.addEventListener('mouseup', () => {
    thumbStatus.isClick = false;
  });

  scrollBarInner.addEventListener('mouseleave', () => {
    thumbStatus.isClick = false;
  });

  scrollBarInner.addEventListener('mousedown', (e) => {
    if(thumbStatus.isClick) {
      thumbStatus.mouseDownY = e.offsetY;
      thumbStatus.thumbTop = parseInt(getComputedStyle(thumb).top);
    } else {
      const scrollTop = (e.offsetY * view.scrollHeight) / scrollBarHeight;
      view.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  });

  scrollBarInner.addEventListener('mousemove', (e) => {
    if(thumbStatus.isClick) {
      const diffY = e.offsetY - thumbStatus.mouseDownY;
      const top = Math.ceil(thumbStatus.thumbTop) + diffY;
      const scrollTop = (top * view.scrollHeight) / scrollBarHeight;
      view.scrollTo({ top: scrollTop });
    }
  });
}
