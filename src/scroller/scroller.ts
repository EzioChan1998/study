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

  function scrollHandler()  {
    const scrollPercent = view!.scrollTop / view!.scrollHeight;
    thumb.style.top = scrollBarHeight * scrollPercent + 'px';
  }

  view.addEventListener('scroll', scrollHandler);

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
      // 获取滚动条容器的顶部偏移量
      const scrollBarRect = scrollBarInner.getBoundingClientRect();
      // 计算鼠标相对于滚动条容器的 Y 坐标
      const mouseY = e.clientY - scrollBarRect.top;
      // 记录当前鼠标位置和滚动条位置
      thumbStatus.mouseDownY = mouseY;
      thumbStatus.thumbTop = parseFloat(getComputedStyle(thumb).top);
    } else {
      const scrollTop = (e.offsetY * view.scrollHeight) / scrollBarHeight;
      view.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  });


  let scrollTimeout: number | null = null;
  scrollBarInner.addEventListener('mousemove', (e) => {
    if(thumbStatus.isClick) {
      const scrollBarRect = scrollBarInner.getBoundingClientRect();
      const mouseY = e.clientY - scrollBarRect.top;

      const diffY = mouseY - thumbStatus.mouseDownY;
      let newTop = thumbStatus.thumbTop + diffY;

      // 限制滚动条位置在有效范围内
      const maxTop = scrollBarHeight - thumbHeight;
      newTop = Math.max(0, Math.min(newTop, maxTop));

      thumb.style.top = newTop + 'px';

      const scrollTop = (newTop * view.scrollHeight) / scrollBarHeight;
      view.scrollTo({ top: scrollTop });

      if (scrollTimeout !== null) return;
      scrollTimeout = setTimeout(() => {
        const scrollTop = (newTop * view.scrollHeight) / scrollBarHeight;
        view.scrollTo({ top: scrollTop });
        scrollTimeout = null;
      }, 16) as unknown as number; // ~60fps
    }
  });
}
