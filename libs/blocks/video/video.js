import { createIntersectionObserver, getConfig } from '../../utils/utils.js';
import { applyHoverPlay, getVideoAttrs } from '../../utils/decorate.js';

const ROOT_MARGIN = 1000;

const loadVideo = (a) => {
  //const { pathname, hash, href } = a;
  /*
  let videoPath = `.${pathname}`;
  if (pathname.match('media_.*.mp4')) {
    const { codeRoot } = getConfig();
    const root = codeRoot.endsWith('/')
      ? codeRoot
      : `${codeRoot}/`;
    const mediaFilename = pathname.split('/').pop();
    videoPath = `${root}${mediaFilename}`;
  }

  const attrs = getVideoAttrs(hash);
  */
  const video = `<video controls>
        <source src="${a.innerText}" type="video/mp4" />
      </video>`;
      
  if (!a.parentNode) return;
  a.insertAdjacentHTML('afterend', video);

      
a.remove();
  const videoElem = document.body.querySelector(`source[src="${videoPath}"]`)?.parentElement;
  applyHoverPlay(videoElem);

};

export default function init(a) {
  a.classList.add('hide-video');
  if (a.textContent.includes('no-lazy')) {
    loadVideo(a);
  } else {
    createIntersectionObserver({
      el: a,
      options: { rootMargin: `${ROOT_MARGIN}px` },
      callback: loadVideo,
    });
  }
}
