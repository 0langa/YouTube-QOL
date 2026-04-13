// ==UserScript==
// @name                YouTube +
// @namespace           by
// @version             2.4.5
// @author              diorhc
// @description         YouTube quality-of-life enhancements for tabs, playback, and tools.
// @match               https://*.youtube.com/*
// @match               https://music.youtube.com/*
// @match               https://studio.youtube.com/*
// @match               *://myactivity.google.com/*
// @include             *://www.youtube.com/feed/history/*
// @include             https://www.youtube.com
// @include             *://*.youtube.com/**
// @exclude             *://accounts.youtube.com/*
// @exclude             *://www.youtube.com/live_chat_replay*
// @exclude             *://www.youtube.com/persist_identity*
// @exclude             /^https?://\w+\.youtube\.com\/live_chat.*$/
// @exclude             /^https?://\S+\.(txt|png|jpg|jpeg|gif|xml|svg|manifest|log|ini)[^\/]*$/
// @icon                https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @license             MIT
// @require             https://cdn.jsdelivr.net/npm/@preact/signals-core@1.12.1/dist/signals-core.min.js
// @require             https://cdn.jsdelivr.net/npm/browser-id3-writer@4.4.0/dist/browser-id3-writer.min.js
// @require             https://cdn.jsdelivr.net/npm/preact@10.27.2/dist/preact.min.js
// @require             https://cdn.jsdelivr.net/npm/preact@10.27.2/hooks/dist/hooks.umd.js
// @require             https://cdn.jsdelivr.net/npm/@preact/signals@2.5.0/dist/signals.min.js
// @require             https://cdn.jsdelivr.net/npm/dayjs@1.11.19/dayjs.min.js
// @grant               GM_addStyle
// @grant               GM_getValue
// @grant               GM_setValue
// @grant               GM_addValueChangeListener
// @grant               GM_xmlhttpRequest
// @grant               unsafeWindow
// @connect             api.livecounts.io
// @connect             cnv.cx
// @connect             mp3yt.is
// @connect             *
// @connect             youtube.com
// @connect             googlevideo.com
// @connect             self
// @run-at              document-start
// @noframes
// ==/UserScript==
