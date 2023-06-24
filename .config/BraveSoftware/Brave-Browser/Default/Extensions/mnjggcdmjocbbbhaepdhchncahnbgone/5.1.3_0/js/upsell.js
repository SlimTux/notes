(()=>{"use strict";var e,a={9377:function(e,a,l){var o=this&&this.__awaiter||function(e,a,l,o){return new(l||(l=Promise))((function(t,d){function r(e){try{u(o.next(e))}catch(e){d(e)}}function n(e){try{u(o.throw(e))}catch(e){d(e)}}function u(e){var a;e.done?t(e.value):(a=e.value,a instanceof l?a:new l((function(e){e(a)}))).then(r,n)}u((o=o.apply(e,a||[])).next())}))};Object.defineProperty(a,"__esModule",{value:!0});const t=l(7542),d=l(142),r=l(7707),n=l(9963),u=l(3147),i=l(7683);t.default.config;const w=new u.default;window.addEventListener("DOMContentLoaded",(function(){return o(this,void 0,void 0,(function*(){(0,r.localizeHtmlPage)();const e=document.getElementById("cantAfford"),a=chrome.i18n.getMessage("cantAfford").split(/{|}/);e.appendChild(document.createTextNode(a[0]));const l=document.createElement("span");l.id="discountButton",l.innerText=a[1],e.appendChild(l),e.appendChild(document.createTextNode(a[2]));const u=document.getElementById("redeemButton"),s=document.getElementById("redeemCodeInput");u.addEventListener("click",(()=>o(this,void 0,void 0,(function*(){const e=s.value;(yield(0,d.checkLicenseKey)(e))?(t.default.config.payments.licenseKey=e,t.default.forceSyncUpdate("payments"),w.getCategorySelection("chapter")||t.default.config.categorySelections.push({name:"chapter",option:i.CategorySkipOption.ShowOverlay}),alert(chrome.i18n.getMessage("redeemSuccess"))):alert(chrome.i18n.getMessage("redeemFailed"))})))),l.addEventListener("click",(()=>o(this,void 0,void 0,(function*(){const e=document.getElementById("subsidizedPrice");e.classList.remove("hidden");const a=document.getElementById("countrySelector");a&&a.remove();const l=document.createElement("select");l.id="countrySelector",l.className="optionsSelector";const o=document.createElement("option");o.innerText=chrome.i18n.getMessage("chooseACountry"),l.appendChild(o);for(const e of Object.keys(n)){const a=document.createElement("option");a.value=e,a.innerText=e,l.appendChild(a)}l.addEventListener("change",(()=>{var e;(null===(e=n[l.value])||void 0===e?void 0:e.allowed)?(document.getElementById("subsidizedLink").classList.remove("hidden"),document.getElementById("noSubsidizedLink").classList.add("hidden")):(document.getElementById("subsidizedLink").classList.add("hidden"),document.getElementById("noSubsidizedLink").classList.remove("hidden"))})),e.appendChild(l)}))))}))}))},9963:e=>{e.exports=JSON.parse('{"Albania":{"allowed":true},"Algeria":{"allowed":true},"Angola":{"allowed":true},"Argentina":{"allowed":true},"Armenia":{"allowed":true},"Australia":{"allowed":false},"Austria":{"allowed":false},"Azerbaijan":{"allowed":true},"Bangladesh":{"allowed":true},"Belarus":{"allowed":true},"Belgium":{"allowed":false},"Belize":{"allowed":true},"Benin":{"allowed":true},"Bhutan":{"allowed":true},"Bolivia":{"allowed":true},"Bosnia and Herzegovina":{"allowed":true},"Botswana":{"allowed":true},"Brazil":{"allowed":true},"Bulgaria":{"allowed":true},"Burkina Faso":{"allowed":true},"Burundi":{"allowed":true},"Cameroon":{"allowed":true},"Canada":{"allowed":false},"Central African Republic":{"allowed":true},"Chad":{"allowed":true},"Chile":{"allowed":true},"China":{"allowed":true},"Colombia":{"allowed":true},"Comoros":{"allowed":true},"Costa Rica":{"allowed":true},"Croatia":{"allowed":true},"Cyprus":{"allowed":false},"Czech Republic":{"allowed":false},"Denmark":{"allowed":false},"Djibouti":{"allowed":true},"Dominican Republic":{"allowed":true},"DR Congo":{"allowed":true},"Ecuador":{"allowed":true},"Egypt":{"allowed":true},"El Salvador":{"allowed":true},"Estonia":{"allowed":false},"Eswatini":{"allowed":true},"Ethiopia":{"allowed":true},"Fiji":{"allowed":true},"Finland":{"allowed":false},"France":{"allowed":false},"Gabon":{"allowed":true},"Gambia":{"allowed":true},"Georgia":{"allowed":true},"Germany":{"allowed":false},"Ghana":{"allowed":true},"Greece":{"allowed":true},"Guatemala":{"allowed":true},"Guinea":{"allowed":true},"Guinea-Bissau":{"allowed":true},"Guyana":{"allowed":true},"Haiti":{"allowed":true},"Honduras":{"allowed":true},"Hungary":{"allowed":true},"Iceland":{"allowed":false},"India":{"allowed":true},"Iran":{"allowed":true},"Iraq":{"allowed":true},"Ireland":{"allowed":false},"Israel":{"allowed":false},"Italy":{"allowed":false},"Ivory Coast":{"allowed":true},"Jamaica":{"allowed":true},"Japan":{"allowed":false},"Jordan":{"allowed":true},"Kazakhstan":{"allowed":true},"Kenya":{"allowed":true},"Kiribati":{"allowed":true},"Kyrgyzstan":{"allowed":true},"Laos":{"allowed":true},"Latvia":{"allowed":true},"Lebanon":{"allowed":true},"Lesotho":{"allowed":true},"Liberia":{"allowed":true},"Lithuania":{"allowed":true},"Luxembourg":{"allowed":false},"Madagascar":{"allowed":true},"Malawi":{"allowed":true},"Malaysia":{"allowed":true},"Maldives":{"allowed":true},"Mali":{"allowed":true},"Malta":{"allowed":false},"Mauritania":{"allowed":true},"Mauritius":{"allowed":true},"Mexico":{"allowed":true},"Micronesia":{"allowed":true},"Moldova":{"allowed":true},"Mongolia":{"allowed":true},"Montenegro":{"allowed":true},"Morocco":{"allowed":true},"Mozambique":{"allowed":true},"Myanmar":{"allowed":true},"Namibia":{"allowed":true},"Nepal":{"allowed":true},"Netherlands":{"allowed":false},"Nicaragua":{"allowed":true},"Niger":{"allowed":true},"Nigeria":{"allowed":true},"North Macedonia":{"allowed":true},"Norway":{"allowed":false},"Pakistan":{"allowed":true},"Panama":{"allowed":true},"Papua New Guinea":{"allowed":true},"Paraguay":{"allowed":true},"Peru":{"allowed":true},"Philippines":{"allowed":true},"Poland":{"allowed":true},"Portugal":{"allowed":true},"Republic of the Congo":{"allowed":true},"Romania":{"allowed":true},"Russia":{"allowed":true},"Rwanda":{"allowed":true},"Saint Lucia":{"allowed":true},"Samoa":{"allowed":true},"Sao Tome and Principe":{"allowed":true},"Senegal":{"allowed":true},"Serbia":{"allowed":true},"Seychelles":{"allowed":true},"Sierra Leone":{"allowed":true},"Slovakia":{"allowed":true},"Slovenia":{"allowed":false},"Solomon Islands":{"allowed":true},"South Africa":{"allowed":true},"South Korea":{"allowed":false},"South Sudan":{"allowed":true},"Spain":{"allowed":false},"Sri Lanka":{"allowed":true},"Sudan":{"allowed":true},"Suriname":{"allowed":true},"Sweden":{"allowed":false},"Switzerland":{"allowed":false},"Syria":{"allowed":true},"Taiwan":{"allowed":false},"Tajikistan":{"allowed":true},"Tanzania":{"allowed":true},"Thailand":{"allowed":true},"Timor-Leste":{"allowed":true},"Togo":{"allowed":true},"Tonga":{"allowed":true},"Trinidad and Tobago":{"allowed":true},"Tunisia":{"allowed":true},"Turkey":{"allowed":true},"Turkmenistan":{"allowed":true},"Tuvalu":{"allowed":true},"Uganda":{"allowed":true},"Ukraine":{"allowed":true},"United Arab Emirates":{"allowed":false},"United Kingdom":{"allowed":false},"United States":{"allowed":false},"Uruguay":{"allowed":true},"Uzbekistan":{"allowed":true},"Vanuatu":{"allowed":true},"Venezuela":{"allowed":true},"Vietnam":{"allowed":true},"Yemen":{"allowed":true},"Zambia":{"allowed":true},"Zimbabwe":{"allowed":true}}')}},l={};function o(e){var t=l[e];if(void 0!==t)return t.exports;var d=l[e]={exports:{}};return a[e].call(d.exports,d,d.exports,o),d.exports}o.m=a,e=[],o.O=(a,l,t,d)=>{if(!l){var r=1/0;for(w=0;w<e.length;w++){for(var[l,t,d]=e[w],n=!0,u=0;u<l.length;u++)(!1&d||r>=d)&&Object.keys(o.O).every((e=>o.O[e](l[u])))?l.splice(u--,1):(n=!1,d<r&&(r=d));if(n){e.splice(w--,1);var i=t();void 0!==i&&(a=i)}}return a}d=d||0;for(var w=e.length;w>0&&e[w-1][2]>d;w--)e[w]=e[w-1];e[w]=[l,t,d]},o.o=(e,a)=>Object.prototype.hasOwnProperty.call(e,a),(()=>{var e={830:0};o.O.j=a=>0===e[a];var a=(a,l)=>{var t,d,[r,n,u]=l,i=0;if(r.some((a=>0!==e[a]))){for(t in n)o.o(n,t)&&(o.m[t]=n[t]);if(u)var w=u(o)}for(a&&a(l);i<r.length;i++)d=r[i],o.o(e,d)&&e[d]&&e[d][0](),e[d]=0;return o.O(w)},l=self.webpackChunksponsorblock=self.webpackChunksponsorblock||[];l.forEach(a.bind(null,0)),l.push=a.bind(null,l.push.bind(l))})();var t=o.O(void 0,[736],(()=>o(9377)));t=o.O(t)})();