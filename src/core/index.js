import 'custom-event-polyfill';

import {
  append,
  remove,
  getUniqId,
  addClass,
  triggerEvent,
  loadScript,
} from '../lib/util';

const assign = require('es6-object-assign').assign;

const defaults = {
  channel: 'youtube',
  facebook: {},
  youtube: {
    autoplay: 1,
    cc_load_policy: 1,
    color: null,
    controls: 1,
    disablekb: 0,
    enablejsapi: 0,
    end: null,
    fs: 1,
    h1: null,
    iv_load_policy: 1,
    list: null,
    listType: null,
    loop: 0,
    modestbranding: null,
    origin: null,
    playlist: null,
    playsinline: null,
    rel: 0,
    showinfo: 1,
    start: 0,
    wmode: 'transparent',
    theme: 'dark',
    nocookie: false
  },
  ratio: '16:9',
  vimeo: {
    api: false,
    autopause: true,
    autoplay: true,
    byline: true,
    callback: null,
    color: null,
    height: null,
    loop: false,
    maxheight: null,
    maxwidth: null,
    player_id: null,
    portrait: true,
    title: true,
    width: null,
    xhtml: false
  },
  allowFullScreen: true,
  animationSpeed: 300,
  classNames: {
    modalVideo: 'modal-video',
    modalVideoClose: 'modal-video-close',
    modalVideoBody: 'modal-video-body',
    modalVideoInner: 'modal-video-inner',
    modalVideoIframeWrap: 'modal-video-movie-wrap',
    modalVideoCloseBtn: 'modal-video-close-btn'
  },
  aria: {
    openMessage: 'You just openned the modal video',
    dismissBtnMessage: 'Close the modal by clicking here'
  }
};

export default class ModalVideo {

  constructor(ele, option) {
    const opt = assign({}, defaults, option);
    const selectors = typeof ele === 'string' ? document.querySelectorAll(ele) : ele;
    const body = document.querySelector('body');
    const classNames = opt.classNames;
    const speed = opt.animationSpeed;
    let ytApiLoadDef = null;
    let vimeoApiLoadDef = null;
    [].forEach.call(selectors, (selector) => {
      selector.addEventListener('click', (event) => {
        if (selector.tagName === 'A') {
          event.preventDefault();
        }
        const videoId = selector.dataset.videoId;
        const channel = selector.dataset.channel || opt.channel;
        const id = getUniqId();
        const containerId = 'modal-video-container-' + id;
        const videoUrl = selector.dataset.videoUrl || this.getVideoUrl(opt, channel, videoId);
        const html = this.getHtml(channel, opt, videoUrl, id, containerId);
        append(body, html);
        const modal = document.getElementById(id);
        const btn = modal.querySelector('.js-modal-video-dismiss-btn');
        modal.focus();
        modal.addEventListener('click', () => {
          addClass(modal, classNames.modalVideoClose);
          setTimeout(() => {
            remove(modal);
            selector.focus();
          }, speed);
        });
        modal.addEventListener('keydown', (e) => {
          if (e.which === 9) {
            e.preventDefault();
            if (document.activeElement === modal) {
              btn.focus();
            } else {
              modal.setAttribute('aria-label', '');
              modal.focus();
            }
          }
        });
        btn.addEventListener('click', () => {
          triggerEvent(modal, 'click');
        });
        if(channel == 'youtube' && opt.jsapi){
          if(! ytApiLoadDef){
            ytApiLoadDef = new Promise((resolve, reject) => {
              loadScript('https://www.youtube.com/iframe_api').then(() => {
                YT.ready(resolve);
              }).catch(reject);
            });
          }
          ytApiLoadDef.then(() => {
            const player = new YT.Player(document.getElementById(containerId), assign({
              width: 460,
              height: 230,
              videoId: videoId,
              events: {
                'onReady': () => { 
                  triggerEvent(selector, 'player-created', {player});
                  if(opt.youtube.autoplay){
                    player.playVideo();
                  }
                }
              },
            }, opt));
          });
        }
        else if(channel == 'vimeo' && opt.jsapi){
          if(! vimeoApiLoadDef){
            vimeoApiLoadDef = loadScript('https://player.vimeo.com/api/player.js');
          }
          vimeoApiLoadDef.then(() => {
            const player = new Vimeo.Player(containerId, assign({
              width: 460,
              height: 230,
              id: videoId,
            }, opt));
            player.ready().then(() => {
              triggerEvent(selector, 'player-created', {player});
              if(opt.vimeo.autoplay){
                // Not working in Chrome 66+ without setVolume(0) before
                player.play();
              }
            });
          });
        }
      });
    });
  }

  getPadding(ratio) {
    const arr = ratio.split(':');
    const width = Number(arr[0]);
    const height = Number(arr[1]);
    const padding = height * 100 / width;
    return `${padding}%`;
  }

  getQueryString(obj) {
    let url = '';
    Object.keys(obj).forEach((key) => {
      url += `${key}=${obj[key]}&`;
    });
    return url.substr(0, url.length - 1);
  }

  getVideoUrl(opt, channel, videoId) {
    if (channel === 'youtube') {
      return this.getYoutubeUrl(opt.youtube, videoId);
    } else if (channel === 'vimeo') {
      return this.getVimeoUrl(opt.vimeo, videoId);
    } else if (channel === 'facebook') {
      return this.getFacebookUrl(opt.facebook, videoId);
    }
    return '';
  }

  getVimeoUrl(vimeo, videoId) {
    const query = this.getQueryString(vimeo);
    return `//player.vimeo.com/video/${videoId}?${query}`;
  }

  getYoutubeUrl(youtube, videoId) {
    const query = this.getQueryString(youtube);
    if (youtube.nocookie === true) {
      return `//www.youtube-nocookie.com/embed/${videoId}?${query}`;
    }

    return `//www.youtube.com/embed/${videoId}?${query}`;
  }

  getFacebookUrl(facebook, videoId, containerId) {
    return `//www.facebook.com/v2.10/plugins/video.php?href=https://www.facebook.com/facebook/videos/${videoId}&${this.getQueryString(facebook)}`;
  }

  getHtml(channel, opt, videoUrl, id, containerId) {
    const padding = this.getPadding(opt.ratio);
    const classNames = opt.classNames;
    return (`
      <div class="${classNames.modalVideo}" tabindex="-1" role="dialog" aria-label="${opt.aria.openMessage}" id="${id}">
        <div class="${classNames.modalVideoBody}">
          <div class="${classNames.modalVideoInner}">
            <div class="${classNames.modalVideoIframeWrap}" style="padding-bottom:${padding}">
              <button class="${classNames.modalVideoCloseBtn} js-modal-video-dismiss-btn" aria-label="${opt.aria.dismissBtnMessage}"></button>`
              + (opt.jsapi 
                ? `<div id="${containerId}"></div>`
                : `<iframe width='460' height='230' src="${videoUrl}" frameborder='0' allowfullscreen=${opt.allowFullScreen} tabindex="-1"/>`)
              +
            `</div>
          </div>
        </div>
      </div>
    `);
  }
}
