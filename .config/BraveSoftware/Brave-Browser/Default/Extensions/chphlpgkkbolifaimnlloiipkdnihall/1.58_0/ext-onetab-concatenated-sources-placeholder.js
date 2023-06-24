// Copyright 2022 OneTab Ltd.  All rights reserved.

const i="1.58";const o=false;const u=false;const c=false;const f=false;const l=false;const s=false;const a=true;const d="chrome://";const w="chrome://newtab/";const h="https://www.one-tab.com";const p=false;async function x(){return new Promise(((t,n)=>{if(document.readyState==="complete"){t()}else{document.addEventListener("readystatechange",(n=>{if(document.readyState==="complete")t()}))}}))}function m(t){return J(undefined,"div",{id:"headerText",style:{paddingTop:"40px",paddingBottom:"20px",[`padding${zt()}`]:"240px",fontSize:"16px",color:"var(--text-color-weak)",fontWeight:"300",borderBottom:"1px dashed var(--dash-color)",marginBottom:"10px"},textContent:t}).t}function g(t,n,e){return J(undefined,"picture",{style:{...t},...n,children:{i:J(undefined,"source",{srcset:e(true),media:"(prefers-color-scheme: light)"}),o:J(undefined,"source",{srcset:e(false),media:"(prefers-color-scheme: dark)"}),u:J(undefined,"img",{style:{width:"100%",height:"100%"}})}}).t}function y(){return g({width:416/2+"px",height:114/2+"px",position:"absolute",top:"16px",[`${Ut()}`]:"19px"},{},(t=>`images/top-left-logo-${t?"light":"dark"}${Bt()?"":"-rtl"}.png`))}function b(t,n,e){let i=document.createElement("div");let r=document.createElement("div");Dt(r,"30px");r.style.position="relative";let o=document.createElement("img");o.src=t?"images/twister-open.png":"images/twister-closed"+(Bt()?"":"-rtl")+".png";o.style.width=48/2+"px";o.style.height=50/2+"px";o.style.position="absolute";Ht(o,"0px");o.style.top="0px";r.textContent=n;r.style.fontSize="16px";r.style.cursor="pointer";i.appendChild(r);r.appendChild(o);let u=document.createElement("div");Dt(u,"30px");u.style.paddingTop="10px";u.appendChild(e.t);u.style.display=t?"block":"none";i.appendChild(u);r.onclick=()=>{t=!t;o.src=t?"images/twister-open.png":"images/twister-closed"+(Bt()?"":"-rtl")+".png";u.style.display=t?"block":"none"};let c={l:e.t};Object.assign(c,e);c.t=i;return c}function v(t,n,e,i){let r=document.createElement("div");r.style.fontSize=n+"px";r.className="clickable";let o=document.createElement("span");if(i){let t=document.createElement("span");t.textContent=St("newExclamation")+" ";o.appendChild(t)}if(typeof t==="string"){o.appendChild(document.createTextNode(t))}else{o.appendChild(t)}o.style.verticalAlign="middle";o.onclick=t=>{e(o)};r.appendChild(o);return r}const k=window.chrome.runtime.getURL("onetab.html");const T=k.substr(0,k.length-"onetab.html".length);function R(t){let n=O(t);if(n.toLowerCase().startsWith("www."))return n.substring("www.".length);else return n}function O(t){if(!t)return"undefined";if(t.indexOf("//")===0)t="http:"+t;if(t.indexOf("://")===-1)t="http://"+t;t=t.substring(t.indexOf("://")+"://".length);if(t.indexOf("/")!==-1)t=t.substring(0,t.indexOf("/"));if(t.indexOf(":")!==-1)t=t.substring(0,t.indexOf(":"));if(t.indexOf("?")!==-1)t=t.substring(0,t.indexOf("?"));if(t.indexOf("#")!==-1)t=t.substring(0,t.indexOf("#"));return t.toLowerCase()}function S(t){if(t.indexOf("://")===-1)return"https://";t=t.substring(0,t.indexOf("://")+"://".length);return t.toLowerCase()}let M=["com","co.uk","org.uk","net","org","de","ru","info","xyz","nl"];function j(t){let n=O(t);try{for(let t in M){let e="."+M[t];if(H(n,e)){n=n.substr(0,n.length-e.length);while(n.indexOf(".")!==-1)n=n.substring(n.indexOf(".")+1);n=n+e;break}}if(n.indexOf("www.")===0)n=n.substring("www.".length);return n}catch(t){return n}}function L(t){t["noCacheRandom"]=$()}function $(){return(new Date).getTime()+Math.round(Math.random()*1e4)+""}async function C(t,n){L(n);let e=JSON.stringify(n);let i=await E(t,e);return await i.json()}async function E(t,n){let e={};if(n){e.method="POST";e.body=n}else{e.method="GET"}e.headers=new Headers;e.headers.append("Content-Type","text/json");let i=await fetch(t,e);if(i.status===200)return i;else throw new Error("http response code"+i.status)}function P(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(t=>{let n=Math.random()*16|0,e=t=="x"?n:n&3|8;return e.toString(16)}))}const B="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");function I(t,n){let e=B,i=[],r=0;n=n||e.length;t=t||22;for(r=0;r<t;r++)i[r]=e[0|Math.random()*n];return i.join("")}function z(){return I()}function F(t){if(t===null||t===undefined)return"";return t.replace(/^\s+/,"").replace(/\s+$/,"")}const U=(t,n)=>!!n["starred"]-!!t["starred"]||t["starred"]&&n["starred"]&&n["starredDate"]-t["starredDate"]||n["createDate"]-t["createDate"];function W(t){if(!t)t="";return t.replace(/[\x00-\x1F\x7F-\x9F]/g,"")}function H(t,n){if(!t)return false;return t.indexOf(n,t.length-n.length)!==-1}const A={restoreWindow:"newWindow",pinnedTabs:"ignore",startupLaunch:"displayOneTab",restoreRemoval:"default",duplicates:"allow"};function D(t,n){if(n[t])return n[t];else return A[t]}function G(t,n,e){if(t.parentNode)t.remove();n.insertBefore(t,e===undefined||e>=n.children.length||n.children.length===0?null:n.children[Math.max(0,e)])}function J(t,n,e){let i=n===undefined?t:document.createElement(n);let r={};if(e){if(e.style)Object.assign(i.style,e.style);for(let t of Object.keys(e)){if(t!=="style"&&t!=="children")i[t]=e[t]}if(e.children){for(const[t,n]of Object.entries(e.children)){r[t]=n;i.appendChild(n instanceof HTMLElement?n:n.t)}}if(e.h)i.appendChild(e.h);if(e.init)e.init(i)}if(n!==undefined&&t)t.appendChild(i);let o={t:i};Object.assign(o,r);return o}const N="about:reader?url=";function X(t){if(!t)return"";if(t.indexOf(":")===-1)return"https://"+t;if(t.indexOf(N)===0)return decodeURIComponent(t.substring(N.length));if(t.startsWith(`${T}placeholder.html?`)){const n=new URLSearchParams(t.substring(t.indexOf("?")));return n.get("url")}return t}async function Y(t){return new Promise((n=>setTimeout(n,t)))}function q(t){return parseInt(t.match(/\d+/)[0])}const K=[...new Array(30)].map(((t,n)=>parseInt(10+Math.pow(1.6,n))));function*Q(t){let n=0;while(K.slice(0,n).reduce(((t,n)=>t+n),0)<t){yield K[n++]}}async function V(t,n,e){let i=0;for(let n of Q(t)){if(await e(i))return;else{await Y(n);i+=n}}throw new Error(`Timeout waiting for condition ${n}`)}class Z{constructor(t,n){this.x=t;this.y=n}p(t){return new Z(this.x-t.x,this.y-t.y)}}class _{constructor(t,n,e,i){this.m=t;this.type=n;this.listener=e;this.g=i}remove(){this.m.removeEventListener(this.type,this.listener,this.g)}}function tt(t,n){t.onmousemove=e=>{n(new xt(t,e))}}function nt(t,n){t.onmousedown=e=>{n(new xt(t,e))}}function et(t,n){t.onmouseover=e=>{n(new xt(t,e))}}function it(t,n){t.onmouseup=e=>{n(new xt(t,e))}}function rt(t,n){t.onmouseout=e=>{n(new xt(t,e))}}function ot(t,n){t.onclick=e=>{n(new xt(t,e))}}function ut(t,n){t.ondblclick=e=>{n(new xt(t,e))}}function ct(t,n){mt(t,"click",n)}function ft(t,n){mt(t,"dblclick",n)}function lt(t,n){return mt(t,"mouseover",n)}function st(t,n){return mt(t,"mouseup",n)}function at(t,n){let e;e=e=>{let i,r;i=e.currentTarget;r=e.relatedTarget;if(i===t&&i!==r&&!pt(i,r)){n(new xt(t,e))}};t.addEventListener("mouseout",e,false);return new _(t,"mouseout",e,false)}function dt(t,n){t.onmouseout=e=>{let i,r;i=e.currentTarget;r=e.relatedTarget;if(i===t&&i!==r&&!pt(i,r)){n(new xt(t,e))}}}function wt(t,n){for(let e of t){e.onmouseout=ht(e,t,n)}}function ht(t,n,e){return i=>{let r,o;r=i.currentTarget;o=i.relatedTarget;if(r===t&&r!==o&&!pt(r,o)){for(let t of n)if(o===t)return;e(new xt(t,i))}}}function pt(t,n){try{if(!n)return false;while(n.parentNode)if((n=n.parentNode)===t)return true;return false}catch(t){return false}}class xt{constructor(t,n){this.element=t;this.event=n;this.v=null;this.k=null}T(){if(this.v===null){let t=yt(this.element);this.v=t.x;this.k=t.y}return this.v}R(){if(this.v===null){this.T()}return this.k}}function mt(t,n,e){let i=n=>{let i=new xt(t,n);e(i)};t.addEventListener(n,i,false);return new _(t,n,i,false)}function gt(t){return bt(t)}function yt(t,n){return bt(n).p(vt(t))}function bt(t){let n,e;n=t.clientX+window.scrollX;e=t.clientY+window.scrollY;return new Z(n,e)}function vt(t){let n=t;let e=0;let i=0;while(true){let t=n.offsetParent;if(t===null)break;e+=n.offsetLeft;i+=n.offsetTop;n=t}return new Z(e,i)}function kt(){return window.scrollY}function Tt(){return window.scrollX}let Rt={};async function Ot(){Rt=Mt.O()}function St(t){return Rt[t]}const Mt=window.chrome.extension.getBackgroundPage().core;async function jt(){It();await Ot()}function Lt(t){if(typeof t==="string")t=document.getElementById(t);if(!t)return;while(t.childNodes.length>0)t.childNodes[0].remove()}function $t(t){return J(undefined,"div",{style:{fontSize:"1px",height:t+"px",width:1+"px"}}).t}let Ct=navigator["language"]||navigator["userLanguage"];function Et(){let t=["ar","he","fa","ps","ur"];let n=Ct.split("-",1)[0];return t.indexOf(n)>=0?"rtl":"ltr"}let Pt=Et();function Bt(){return Pt!=="rtl"}function It(){document.getElementsByTagName("html")[0]["dir"]=Pt}function zt(){return Bt()?"Left":"Right"}function Ft(){return Bt()?"Right":"Left"}function Ut(){return Bt()?"left":"right"}function Wt(){return Bt()?"right":"left"}function Ht(t,n){if(Bt())t.style.left=n;else t.style.right=n}function At(t,n){if(Bt())t.style.right=n;else t.style.left=n}function Dt(t,n){if(Bt())t.style.paddingLeft=n;else t.style.paddingRight=n}function Gt(t,n){if(Bt())t.style.paddingRight=n;else t.style.paddingLeft=n}function Jt(t,n){if(Bt())t.style.marginLeft=n;else t.style.marginRight=n}(async()=>{await x();const t=document.getElementById("copyButton");const n=new URLSearchParams(window.location.search);let e=n.get("url");let i=document.getElementById("urlInput");i.value=e;let r=e;["/","\\"].forEach((t=>{if(r.includes(t))r=r.substring(r.lastIndexOf(t)+1)}));document.title=r;document.getElementById("filename").textContent=r;t.onclick=t=>{i.select();navigator.clipboard.writeText(i.value)}})();