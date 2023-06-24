(function () {
    "use strict";

    const isNavigatorDefined = typeof navigator !== "undefined";
    const userAgent = isNavigatorDefined
        ? navigator.userAgentData &&
          Array.isArray(navigator.userAgentData.brands)
            ? navigator.userAgentData.brands
                  .map(
                      (brand) => `${brand.brand.toLowerCase()} ${brand.version}`
                  )
                  .join(" ")
            : navigator.userAgent.toLowerCase()
        : "some useragent";
    const platform = isNavigatorDefined
        ? navigator.userAgentData &&
          typeof navigator.userAgentData.platform === "string"
            ? navigator.userAgentData.platform.toLowerCase()
            : navigator.platform.toLowerCase()
        : "some platform";
    const isThunderbird = userAgent.includes("thunderbird");
    const isFirefox =
        userAgent.includes("firefox") ||
        userAgent.includes("librewolf") ||
        isThunderbird;
    userAgent.includes("vivaldi");
    userAgent.includes("yabrowser");
    const isOpera = userAgent.includes("opr") || userAgent.includes("opera");
    const isEdge = userAgent.includes("edg");
    const isWindows = platform.startsWith("win");
    const isMacOS = platform.startsWith("mac");
    isNavigatorDefined && navigator.userAgentData
        ? navigator.userAgentData.mobile
        : userAgent.includes("mobile");
    const isMatchMediaChangeEventListenerSupported =
        typeof MediaQueryList === "function" &&
        typeof MediaQueryList.prototype.addEventListener === "function";
    const chromiumVersion = (() => {
        const m = userAgent.match(/chrom(?:e|ium)(?:\/| )([^ ]+)/);
        if (m && m[1]) {
            return m[1];
        }
        return "";
    })();
    const firefoxVersion = (() => {
        const m = userAgent.match(/(?:firefox|librewolf)(?:\/| )([^ ]+)/);
        if (m && m[1]) {
            return m[1];
        }
        return "";
    })();
    (() => {
        try {
            document.querySelector(":defined");
            return true;
        } catch (err) {
            return false;
        }
    })();
    function compareChromeVersions($a, $b) {
        const a = $a.split(".").map((x) => parseInt(x));
        const b = $b.split(".").map((x) => parseInt(x));
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return a[i] < b[i] ? -1 : 1;
            }
        }
        return 0;
    }
    const isXMLHttpRequestSupported = typeof XMLHttpRequest === "function";
    const isFetchSupported = typeof fetch === "function";
    const isCSSColorSchemePropSupported = (() => {
        if (typeof document === "undefined") {
            return false;
        }
        const el = document.createElement("div");
        el.setAttribute("style", "color-scheme: dark");
        return el.style && el.style.colorScheme === "dark";
    })();

    async function getOKResponse(url, mimeType, origin) {
        const response = await fetch(url, {
            cache: "force-cache",
            credentials: "omit",
            referrer: origin
        });
        if (
            isFirefox &&
            mimeType === "text/css" &&
            url.startsWith("moz-extension://") &&
            url.endsWith(".css")
        ) {
            return response;
        }
        if (
            mimeType &&
            !response.headers.get("Content-Type").startsWith(mimeType)
        ) {
            throw new Error(`Mime type mismatch when loading ${url}`);
        }
        if (!response.ok) {
            throw new Error(
                `Unable to load ${url} ${response.status} ${response.statusText}`
            );
        }
        return response;
    }
    async function loadAsDataURL(url, mimeType) {
        const response = await getOKResponse(url, mimeType);
        return await readResponseAsDataURL(response);
    }
    async function readResponseAsDataURL(response) {
        const blob = await response.blob();
        const dataURL = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
        return dataURL;
    }
    async function loadAsText(url, mimeType, origin) {
        const response = await getOKResponse(url, mimeType, origin);
        return await response.text();
    }

    function parseArray(text) {
        return text
            .replace(/\r/g, "")
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s);
    }
    function formatArray(arr) {
        return arr.concat("").join("\n");
    }
    function getStringSize(value) {
        return value.length * 2;
    }
    function getParenthesesRange(input, searchStartIndex = 0) {
        const length = input.length;
        let depth = 0;
        let firstOpenIndex = -1;
        for (let i = searchStartIndex; i < length; i++) {
            if (depth === 0) {
                const openIndex = input.indexOf("(", i);
                if (openIndex < 0) {
                    break;
                }
                firstOpenIndex = openIndex;
                depth++;
                i = openIndex;
            } else {
                const closingIndex = input.indexOf(")", i);
                if (closingIndex < 0) {
                    break;
                }
                const openIndex = input.indexOf("(", i);
                if (openIndex < 0 || closingIndex < openIndex) {
                    depth--;
                    if (depth === 0) {
                        return {start: firstOpenIndex, end: closingIndex + 1};
                    }
                    i = closingIndex;
                } else {
                    depth++;
                    i = openIndex;
                }
            }
        }
        return null;
    }

    function parse24HTime(time) {
        return time.split(":").map((x) => parseInt(x));
    }
    function compareTime(time1, time2) {
        if (time1[0] === time2[0] && time1[1] === time2[1]) {
            return 0;
        }
        if (
            time1[0] < time2[0] ||
            (time1[0] === time2[0] && time1[1] < time2[1])
        ) {
            return -1;
        }
        return 1;
    }
    function nextTimeInterval(time0, time1, date = new Date()) {
        const a = parse24HTime(time0);
        const b = parse24HTime(time1);
        const t = [date.getHours(), date.getMinutes()];
        if (compareTime(a, b) > 0) {
            return nextTimeInterval(time1, time0, date);
        }
        if (compareTime(a, b) === 0) {
            return null;
        }
        if (compareTime(t, a) < 0) {
            date.setHours(a[0]);
            date.setMinutes(a[1]);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date.getTime();
        }
        if (compareTime(t, b) < 0) {
            date.setHours(b[0]);
            date.setMinutes(b[1]);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date.getTime();
        }
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + 1,
            a[0],
            a[1]
        ).getTime();
    }
    function isInTimeIntervalLocal(time0, time1, date = new Date()) {
        const a = parse24HTime(time0);
        const b = parse24HTime(time1);
        const t = [date.getHours(), date.getMinutes()];
        if (compareTime(a, b) > 0) {
            return compareTime(a, t) <= 0 || compareTime(t, b) < 0;
        }
        return compareTime(a, t) <= 0 && compareTime(t, b) < 0;
    }
    function isInTimeIntervalUTC(time0, time1, timestamp) {
        if (time1 < time0) {
            return timestamp <= time1 || time0 <= timestamp;
        }
        return time0 < timestamp && timestamp < time1;
    }
    function getDuration(time) {
        let duration = 0;
        if (time.seconds) {
            duration += time.seconds * 1000;
        }
        if (time.minutes) {
            duration += time.minutes * 60 * 1000;
        }
        if (time.hours) {
            duration += time.hours * 60 * 60 * 1000;
        }
        if (time.days) {
            duration += time.days * 24 * 60 * 60 * 1000;
        }
        return duration;
    }
    function getDurationInMinutes(time) {
        return getDuration(time) / 1000 / 60;
    }
    function getSunsetSunriseUTCTime(latitude, longitude, date) {
        const dec31 = Date.UTC(date.getUTCFullYear(), 0, 0, 0, 0, 0, 0);
        const oneDay = getDuration({days: 1});
        const dayOfYear = Math.floor((date.getTime() - dec31) / oneDay);
        const zenith = 90.83333333333333;
        const D2R = Math.PI / 180;
        const R2D = 180 / Math.PI;
        const lnHour = longitude / 15;
        function getTime(isSunrise) {
            const t = dayOfYear + ((isSunrise ? 6 : 18) - lnHour) / 24;
            const M = 0.9856 * t - 3.289;
            let L =
                M +
                1.916 * Math.sin(M * D2R) +
                0.02 * Math.sin(2 * M * D2R) +
                282.634;
            if (L > 360) {
                L -= 360;
            } else if (L < 0) {
                L += 360;
            }
            let RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R));
            if (RA > 360) {
                RA -= 360;
            } else if (RA < 0) {
                RA += 360;
            }
            const Lquadrant = Math.floor(L / 90) * 90;
            const RAquadrant = Math.floor(RA / 90) * 90;
            RA += Lquadrant - RAquadrant;
            RA /= 15;
            const sinDec = 0.39782 * Math.sin(L * D2R);
            const cosDec = Math.cos(Math.asin(sinDec));
            const cosH =
                (Math.cos(zenith * D2R) - sinDec * Math.sin(latitude * D2R)) /
                (cosDec * Math.cos(latitude * D2R));
            if (cosH > 1) {
                return {
                    alwaysDay: false,
                    alwaysNight: true,
                    time: 0
                };
            } else if (cosH < -1) {
                return {
                    alwaysDay: true,
                    alwaysNight: false,
                    time: 0
                };
            }
            const H =
                (isSunrise
                    ? 360 - R2D * Math.acos(cosH)
                    : R2D * Math.acos(cosH)) / 15;
            const T = H + RA - 0.06571 * t - 6.622;
            let UT = T - lnHour;
            if (UT > 24) {
                UT -= 24;
            } else if (UT < 0) {
                UT += 24;
            }
            return {
                alwaysDay: false,
                alwaysNight: false,
                time: Math.round(UT * getDuration({hours: 1}))
            };
        }
        const sunriseTime = getTime(true);
        const sunsetTime = getTime(false);
        if (sunriseTime.alwaysDay || sunsetTime.alwaysDay) {
            return {
                alwaysDay: true
            };
        } else if (sunriseTime.alwaysNight || sunsetTime.alwaysNight) {
            return {
                alwaysNight: true
            };
        }
        return {
            sunriseTime: sunriseTime.time,
            sunsetTime: sunsetTime.time
        };
    }
    function isNightAtLocation(latitude, longitude, date = new Date()) {
        const time = getSunsetSunriseUTCTime(latitude, longitude, date);
        if (time.alwaysDay) {
            return false;
        } else if (time.alwaysNight) {
            return true;
        }
        const sunriseTime = time.sunriseTime;
        const sunsetTime = time.sunsetTime;
        const currentTime =
            date.getUTCHours() * getDuration({hours: 1}) +
            date.getUTCMinutes() * getDuration({minutes: 1}) +
            date.getUTCSeconds() * getDuration({seconds: 1}) +
            date.getUTCMilliseconds();
        return isInTimeIntervalUTC(sunsetTime, sunriseTime, currentTime);
    }
    function nextTimeChangeAtLocation(latitude, longitude, date = new Date()) {
        const time = getSunsetSunriseUTCTime(latitude, longitude, date);
        if (time.alwaysDay) {
            return date.getTime() + getDuration({days: 1});
        } else if (time.alwaysNight) {
            return date.getTime() + getDuration({days: 1});
        }
        const [firstTimeOnDay, lastTimeOnDay] =
            time.sunriseTime < time.sunsetTime
                ? [time.sunriseTime, time.sunsetTime]
                : [time.sunsetTime, time.sunriseTime];
        const currentTime =
            date.getUTCHours() * getDuration({hours: 1}) +
            date.getUTCMinutes() * getDuration({minutes: 1}) +
            date.getUTCSeconds() * getDuration({seconds: 1}) +
            date.getUTCMilliseconds();
        if (currentTime <= firstTimeOnDay) {
            return Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                0,
                0,
                0,
                firstTimeOnDay
            );
        }
        if (currentTime <= lastTimeOnDay) {
            return Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                0,
                0,
                0,
                lastTimeOnDay
            );
        }
        return Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() + 1,
            0,
            0,
            0,
            firstTimeOnDay
        );
    }

    async function readText(params) {
        return new Promise((resolve, reject) => {
            if (isXMLHttpRequestSupported) {
                const request = new XMLHttpRequest();
                request.overrideMimeType("text/plain");
                request.open("GET", params.url, true);
                request.onload = () => {
                    if (request.status >= 200 && request.status < 300) {
                        resolve(request.responseText);
                    } else {
                        reject(
                            new Error(
                                `${request.status}: ${request.statusText}`
                            )
                        );
                    }
                };
                request.onerror = () =>
                    reject(
                        new Error(`${request.status}: ${request.statusText}`)
                    );
                if (params.timeout) {
                    request.timeout = params.timeout;
                    request.ontimeout = () =>
                        reject(
                            new Error("File loading stopped due to timeout")
                        );
                }
                request.send();
            } else if (isFetchSupported) {
                let abortController;
                let signal;
                let timedOut = false;
                if (params.timeout) {
                    abortController = new AbortController();
                    signal = abortController.signal;
                    setTimeout(() => {
                        abortController.abort();
                        timedOut = true;
                    }, params.timeout);
                }
                fetch(params.url, {signal})
                    .then((response) => {
                        if (response.status >= 200 && response.status < 300) {
                            resolve(response.text());
                        } else {
                            reject(
                                new Error(
                                    `${response.status}: ${response.statusText}`
                                )
                            );
                        }
                    })
                    .catch((error) => {
                        if (timedOut) {
                            reject(
                                new Error("File loading stopped due to timeout")
                            );
                        } else {
                            reject(error);
                        }
                    });
            } else {
                reject(
                    new Error(
                        `Neither XMLHttpRequest nor Fetch API are accessible!`
                    )
                );
            }
        });
    }
    class LimitedCacheStorage {
        constructor() {
            this.bytesInUse = 0;
            this.records = new Map();
            chrome.alarms.onAlarm.addListener(async (alarm) => {
                if (alarm.name === LimitedCacheStorage.ALARM_NAME) {
                    LimitedCacheStorage.alarmIsActive = false;
                    this.removeExpiredRecords();
                }
            });
        }
        static ensureAlarmIsScheduled() {
            if (!this.alarmIsActive) {
                chrome.alarms.create(LimitedCacheStorage.ALARM_NAME, {
                    delayInMinutes: 1
                });
                this.alarmIsActive = true;
            }
        }
        has(url) {
            return this.records.has(url);
        }
        get(url) {
            if (this.records.has(url)) {
                const record = this.records.get(url);
                record.expires = Date.now() + LimitedCacheStorage.TTL;
                this.records.delete(url);
                this.records.set(url, record);
                return record.value;
            }
            return null;
        }
        set(url, value) {
            LimitedCacheStorage.ensureAlarmIsScheduled();
            const size = getStringSize(value);
            if (size > LimitedCacheStorage.QUOTA_BYTES) {
                return;
            }
            for (const [url, record] of this.records) {
                if (this.bytesInUse + size > LimitedCacheStorage.QUOTA_BYTES) {
                    this.records.delete(url);
                    this.bytesInUse -= record.size;
                } else {
                    break;
                }
            }
            const expires = Date.now() + LimitedCacheStorage.TTL;
            this.records.set(url, {url, value, size, expires});
            this.bytesInUse += size;
        }
        removeExpiredRecords() {
            const now = Date.now();
            for (const [url, record] of this.records) {
                if (record.expires < now) {
                    this.records.delete(url);
                    this.bytesInUse -= record.size;
                } else {
                    break;
                }
            }
            if (this.records.size !== 0) {
                LimitedCacheStorage.ensureAlarmIsScheduled();
            }
        }
    }
    LimitedCacheStorage.QUOTA_BYTES =
        (navigator.deviceMemory || 4) * 16 * 1024 * 1024;
    LimitedCacheStorage.TTL = getDuration({minutes: 10});
    LimitedCacheStorage.ALARM_NAME = "network";
    LimitedCacheStorage.alarmIsActive = false;
    function createFileLoader() {
        const caches = {
            "data-url": new LimitedCacheStorage(),
            "text": new LimitedCacheStorage()
        };
        const loaders = {
            "data-url": loadAsDataURL,
            "text": loadAsText
        };
        async function get({url, responseType, mimeType, origin}) {
            const cache = caches[responseType];
            const load = loaders[responseType];
            if (cache.has(url)) {
                return cache.get(url);
            }
            const data = await load(url, mimeType, origin);
            cache.set(url, data);
            return data;
        }
        return {get};
    }

    function isIPV6(url) {
        const openingBracketIndex = url.indexOf("[");
        if (openingBracketIndex < 0) {
            return false;
        }
        const queryIndex = url.indexOf("?");
        if (queryIndex >= 0 && openingBracketIndex > queryIndex) {
            return false;
        }
        return true;
    }
    const ipV6HostRegex = /\[.*?\](\:\d+)?/;
    function compareIPV6(firstURL, secondURL) {
        const firstHost = firstURL.match(ipV6HostRegex)[0];
        const secondHost = secondURL.match(ipV6HostRegex)[0];
        return firstHost === secondHost;
    }

    function getURLHostOrProtocol($url) {
        const url = new URL($url);
        if (url.host) {
            return url.host;
        } else if (url.protocol === "file:") {
            return url.pathname;
        }
        return url.protocol;
    }
    function compareURLPatterns(a, b) {
        return a.localeCompare(b);
    }
    function isURLInList(url, list) {
        for (let i = 0; i < list.length; i++) {
            if (isURLMatched(url, list[i])) {
                return true;
            }
        }
        return false;
    }
    function isURLMatched(url, urlTemplate) {
        const isFirstIPV6 = isIPV6(url);
        const isSecondIPV6 = isIPV6(urlTemplate);
        if (isFirstIPV6 && isSecondIPV6) {
            return compareIPV6(url, urlTemplate);
        } else if (!isFirstIPV6 && !isSecondIPV6) {
            const regex = createUrlRegex(urlTemplate);
            return Boolean(url.match(regex));
        }
        return false;
    }
    function createUrlRegex(urlTemplate) {
        urlTemplate = urlTemplate.trim();
        const exactBeginning = urlTemplate[0] === "^";
        const exactEnding = urlTemplate[urlTemplate.length - 1] === "$";
        urlTemplate = urlTemplate
            .replace(/^\^/, "")
            .replace(/\$$/, "")
            .replace(/^.*?\/{2,3}/, "")
            .replace(/\?.*$/, "")
            .replace(/\/$/, "");
        let slashIndex;
        let beforeSlash;
        let afterSlash;
        if ((slashIndex = urlTemplate.indexOf("/")) >= 0) {
            beforeSlash = urlTemplate.substring(0, slashIndex);
            afterSlash = urlTemplate.replace(/\$/g, "").substring(slashIndex);
        } else {
            beforeSlash = urlTemplate.replace(/\$/g, "");
        }
        let result = exactBeginning
            ? "^(.*?\\:\\/{2,3})?"
            : "^(.*?\\:\\/{2,3})?([^/]*?\\.)?";
        const hostParts = beforeSlash.split(".");
        result += "(";
        for (let i = 0; i < hostParts.length; i++) {
            if (hostParts[i] === "*") {
                hostParts[i] = "[^\\.\\/]+?";
            }
        }
        result += hostParts.join("\\.");
        result += ")";
        if (afterSlash) {
            result += "(";
            result += afterSlash.replace("/", "\\/");
            result += ")";
        }
        result += exactEnding ? "(\\/?(\\?[^/]*?)?)$" : "(\\/?.*?)$";
        return new RegExp(result, "i");
    }
    function isPDF(url) {
        if (url.includes(".pdf")) {
            if (url.includes("?")) {
                url = url.substring(0, url.lastIndexOf("?"));
            }
            if (url.includes("#")) {
                url = url.substring(0, url.lastIndexOf("#"));
            }
            if (
                (url.match(/(wikipedia|wikimedia)\.org/i) &&
                    url.match(
                        /(wikipedia|wikimedia)\.org\/.*\/[a-z]+\:[^\:\/]+\.pdf/i
                    )) ||
                (url.match(/timetravel\.mementoweb\.org\/reconstruct/i) &&
                    url.match(/\.pdf$/i)) ||
                (url.match(/dropbox\.com\/s\//i) && url.match(/\.pdf$/i))
            ) {
                return false;
            }
            if (url.endsWith(".pdf")) {
                for (let i = url.length; i > 0; i--) {
                    if (url[i] === "=") {
                        return false;
                    } else if (url[i] === "/") {
                        return true;
                    }
                }
            } else {
                return false;
            }
        }
        return false;
    }
    function isURLEnabled(
        url,
        userSettings,
        {isProtected, isInDarkList, isDarkThemeDetected}
    ) {
        if (isProtected && !userSettings.enableForProtectedPages) {
            return false;
        }
        if (isPDF(url)) {
            return userSettings.enableForPDF;
        }
        const isURLInUserList = isURLInList(url, userSettings.siteList);
        const isURLInEnabledList = isURLInList(
            url,
            userSettings.siteListEnabled
        );
        if (userSettings.applyToListedOnly) {
            return isURLInEnabledList || isURLInUserList;
        }
        if (isURLInEnabledList) {
            return true;
        }
        if (
            isInDarkList ||
            (userSettings.detectDarkTheme && isDarkThemeDetected)
        ) {
            return false;
        }
        return !isURLInUserList;
    }
    function isFullyQualifiedDomain(candidate) {
        return /^[a-z0-9.-]+$/.test(candidate);
    }

    function parseSitesFixesConfig(text, options) {
        const sites = [];
        const blocks = text.replace(/\r/g, "").split(/^\s*={2,}\s*$/gm);
        blocks.forEach((block) => {
            const lines = block.split("\n");
            const commandIndices = [];
            lines.forEach((ln, i) => {
                if (ln.match(/^[A-Z]+(\s[A-Z]+){0,2}$/)) {
                    commandIndices.push(i);
                }
            });
            if (commandIndices.length === 0) {
                return;
            }
            const siteFix = {
                url: parseArray(lines.slice(0, commandIndices[0]).join("\n"))
            };
            commandIndices.forEach((commandIndex, i) => {
                const command = lines[commandIndex].trim();
                const valueText = lines
                    .slice(
                        commandIndex + 1,
                        i === commandIndices.length - 1
                            ? lines.length
                            : commandIndices[i + 1]
                    )
                    .join("\n");
                const prop = options.getCommandPropName(command);
                if (!prop) {
                    return;
                }
                const value = options.parseCommandValue(command, valueText);
                siteFix[prop] = value;
            });
            sites.push(siteFix);
        });
        return sites;
    }
    function getDomain(url) {
        try {
            return new URL(url).hostname.toLowerCase();
        } catch (error) {
            return url.split("/")[0].toLowerCase();
        }
    }
    function encodeOffsets(offsets) {
        return offsets
            .map(([offset, length]) => {
                const stringOffset = offset.toString(36);
                const stringLength = length.toString(36);
                return (
                    "0".repeat(4 - stringOffset.length) +
                    stringOffset +
                    "0".repeat(3 - stringLength.length) +
                    stringLength
                );
            })
            .join("");
    }
    function decodeOffset(offsets, index) {
        const base = (4 + 3) * index;
        const offset = parseInt(offsets.substring(base + 0, base + 4), 36);
        const length = parseInt(offsets.substring(base + 4, base + 4 + 3), 36);
        return [offset, offset + length];
    }
    function indexSitesFixesConfig(text) {
        const domains = {};
        const domainPatterns = {};
        const offsets = [];
        function processBlock(recordStart, recordEnd, index) {
            const block = text.substring(recordStart, recordEnd);
            const lines = block.split("\n");
            const commandIndices = [];
            lines.forEach((ln, i) => {
                if (ln.match(/^[A-Z]+(\s[A-Z]+){0,2}$/)) {
                    commandIndices.push(i);
                }
            });
            if (commandIndices.length === 0) {
                return;
            }
            const urls = parseArray(
                lines.slice(0, commandIndices[0]).join("\n")
            );
            for (const url of urls) {
                const domain = getDomain(url);
                if (isFullyQualifiedDomain(domain)) {
                    if (!domains[domain]) {
                        domains[domain] = index;
                    } else if (
                        typeof domains[domain] === "number" &&
                        domains[domain] !== index
                    ) {
                        domains[domain] = [domains[domain], index];
                    } else if (
                        typeof domains[domain] === "object" &&
                        !domains[domain].includes(index)
                    ) {
                        domains[domain].push(index);
                    }
                    continue;
                }
                if (!domainPatterns[domain]) {
                    domainPatterns[domain] = index;
                } else if (
                    typeof domainPatterns[domain] === "number" &&
                    domainPatterns[domain] !== index
                ) {
                    domainPatterns[domain] = [domainPatterns[domain], index];
                } else if (
                    typeof domainPatterns[domain] === "object" &&
                    !domainPatterns[domain].includes(index)
                ) {
                    domainPatterns[domain].push(index);
                }
            }
            offsets.push([recordStart, recordEnd - recordStart]);
        }
        let recordStart = 0;
        const delimiterRegex = /^\s*={2,}\s*$/gm;
        let delimiter;
        let count = 0;
        while ((delimiter = delimiterRegex.exec(text))) {
            const nextDelimiterStart = delimiter.index;
            const nextDelimiterEnd = delimiter.index + delimiter[0].length;
            processBlock(recordStart, nextDelimiterStart, count);
            recordStart = nextDelimiterEnd;
            count++;
        }
        processBlock(recordStart, text.length, count);
        return {
            offsets: encodeOffsets(offsets),
            domains,
            domainPatterns,
            cache: {}
        };
    }
    function parseSiteFixConfig(text, options, recordStart, recordEnd) {
        const block = text.substring(recordStart, recordEnd);
        return parseSitesFixesConfig(block, options)[0];
    }
    function getSitesFixesFor(url, text, index, options) {
        const records = [];
        let recordIds = [];
        const domain = getDomain(url);
        for (const pattern of Object.keys(index.domainPatterns)) {
            if (isURLMatched(url, pattern)) {
                recordIds = recordIds.concat(index.domainPatterns[pattern]);
            }
        }
        const labels = domain.split(".");
        for (let i = 0; i < labels.length; i++) {
            const substring = labels.slice(i).join(".");
            if (index.domains[substring] && isURLMatched(url, substring)) {
                recordIds = recordIds.concat(index.domains[substring]);
            }
        }
        const set = new Set();
        for (const id of recordIds) {
            if (set.has(id)) {
                continue;
            }
            set.add(id);
            if (!index.cache[id]) {
                const [start, end] = decodeOffset(index.offsets, id);
                index.cache[id] = parseSiteFixConfig(text, options, start, end);
            }
            records.push(index.cache[id]);
        }
        return records;
    }

    const SEPERATOR = "=".repeat(32);
    const backgroundPropertyLength = "background: ".length;
    const textPropertyLength = "text: ".length;
    const humanizeNumber = (number) => {
        if (number > 3) {
            return `${number}th`;
        }
        switch (number) {
            case 0:
                return "0";
            case 1:
                return "1st";
            case 2:
                return "2nd";
            case 3:
                return "3rd";
        }
    };
    const isValidHexColor = (color) => {
        return /^#([0-9a-fA-F]{3}){1,2}$/.test(color);
    };
    function ParseColorSchemeConfig(config) {
        const sections = config.split(`${SEPERATOR}\n\n`);
        const definedColorSchemeNames = new Set();
        let lastDefinedColorSchemeName = "";
        const definedColorSchemes = {
            light: {},
            dark: {}
        };
        let interrupt = false;
        let error = null;
        const throwError = (message) => {
            if (!interrupt) {
                interrupt = true;
                error = message;
            }
        };
        sections.forEach((section) => {
            if (interrupt) {
                return;
            }
            const lines = section.split("\n");
            const name = lines[0];
            if (!name) {
                throwError("No color scheme name was found.");
                return;
            }
            if (definedColorSchemeNames.has(name)) {
                throwError(
                    `The color scheme name "${name}" is already defined.`
                );
                return;
            }
            if (
                lastDefinedColorSchemeName &&
                lastDefinedColorSchemeName !== "Default" &&
                name.localeCompare(lastDefinedColorSchemeName) < 0
            ) {
                throwError(
                    `The color scheme name "${name}" is not in alphabetical order.`
                );
                return;
            }
            lastDefinedColorSchemeName = name;
            definedColorSchemeNames.add(name);
            if (lines[1]) {
                throwError(
                    `The second line of the color scheme "${name}" is not empty.`
                );
                return;
            }
            const checkVariant = (lineIndex, isSecondVariant) => {
                const variant = lines[lineIndex];
                if (!variant) {
                    throwError(
                        `The third line of the color scheme "${name}" is not defined.`
                    );
                    return;
                }
                if (
                    variant !== "LIGHT" &&
                    variant !== "DARK" &&
                    isSecondVariant &&
                    variant === "Light"
                ) {
                    throwError(
                        `The ${humanizeNumber(
                            lineIndex
                        )} line of the color scheme "${name}" is not a valid variant.`
                    );
                    return;
                }
                const firstProperty = lines[lineIndex + 1];
                if (!firstProperty) {
                    throwError(
                        `The ${humanizeNumber(
                            lineIndex + 1
                        )} line of the color scheme "${name}" is not defined.`
                    );
                    return;
                }
                if (!firstProperty.startsWith("background: ")) {
                    throwError(
                        `The ${humanizeNumber(
                            lineIndex + 1
                        )} line of the color scheme "${name}" is not background-color property.`
                    );
                    return;
                }
                const backgroundColor = firstProperty.slice(
                    backgroundPropertyLength
                );
                if (!isValidHexColor(backgroundColor)) {
                    throwError(
                        `The ${humanizeNumber(
                            lineIndex + 1
                        )} line of the color scheme "${name}" is not a valid hex color.`
                    );
                    return;
                }
                const secondProperty = lines[lineIndex + 2];
                if (!secondProperty) {
                    throwError(
                        `The ${humanizeNumber(
                            lineIndex + 2
                        )} line of the color scheme "${name}" is not defined.`
                    );
                    return;
                }
                if (!secondProperty.startsWith("text: ")) {
                    throwError(
                        `The ${humanizeNumber(
                            lineIndex + 2
                        )} line of the color scheme "${name}" is not text-color property.`
                    );
                    return;
                }
                const textColor = secondProperty.slice(textPropertyLength);
                if (!isValidHexColor(textColor)) {
                    throwError(
                        `The ${humanizeNumber(
                            lineIndex + 2
                        )} line of the color scheme "${name}" is not a valid hex color.`
                    );
                    return;
                }
                return {
                    backgroundColor,
                    textColor,
                    variant
                };
            };
            const firstVariant = checkVariant(2, false);
            const isFirstVariantLight = firstVariant.variant === "LIGHT";
            delete firstVariant.variant;
            if (interrupt) {
                return;
            }
            let secondVariant = null;
            let isSecondVariantLight = false;
            if (lines[6]) {
                secondVariant = checkVariant(6, true);
                isSecondVariantLight = secondVariant.variant === "LIGHT";
                delete secondVariant.variant;
                if (interrupt) {
                    return;
                }
                if (lines.length > 11 || lines[9] || lines[10]) {
                    throwError(
                        `The color scheme "${name}" doesn't end with 1 new line.`
                    );
                    return;
                }
            } else if (lines.length > 7) {
                throwError(
                    `The color scheme "${name}" doesn't end with 1 new line.`
                );
                return;
            }
            if (secondVariant) {
                if (isFirstVariantLight === isSecondVariantLight) {
                    throwError(
                        `The color scheme "${name}" has the same variant twice.`
                    );
                    return;
                }
                if (isFirstVariantLight) {
                    definedColorSchemes.light[name] = firstVariant;
                    definedColorSchemes.dark[name] = secondVariant;
                } else {
                    definedColorSchemes.light[name] = secondVariant;
                    definedColorSchemes.dark[name] = firstVariant;
                }
            } else if (isFirstVariantLight) {
                definedColorSchemes.light[name] = firstVariant;
            } else {
                definedColorSchemes.dark[name] = firstVariant;
            }
        });
        return {result: definedColorSchemes, error: error};
    }

    function logInfo(...args) {}
    function logWarn(...args) {}

    var ThemeEngine;
    (function (ThemeEngine) {
        ThemeEngine["cssFilter"] = "cssFilter";
        ThemeEngine["svgFilter"] = "svgFilter";
        ThemeEngine["staticTheme"] = "staticTheme";
        ThemeEngine["dynamicTheme"] = "dynamicTheme";
    })(ThemeEngine || (ThemeEngine = {}));

    var AutomationMode;
    (function (AutomationMode) {
        AutomationMode["NONE"] = "";
        AutomationMode["TIME"] = "time";
        AutomationMode["SYSTEM"] = "system";
        AutomationMode["LOCATION"] = "location";
    })(AutomationMode || (AutomationMode = {}));

    const DEFAULT_COLORS = {
        darkScheme: {
            background: "#181a1b",
            text: "#e8e6e3"
        },
        lightScheme: {
            background: "#dcdad7",
            text: "#181a1b"
        }
    };
    const DEFAULT_THEME = {
        mode: 1,
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        sepia: 0,
        useFont: false,
        fontFamily: isMacOS
            ? "Helvetica Neue"
            : isWindows
            ? "Segoe UI"
            : "Open Sans",
        textStroke: 0,
        engine: ThemeEngine.dynamicTheme,
        stylesheet: "",
        darkSchemeBackgroundColor: DEFAULT_COLORS.darkScheme.background,
        darkSchemeTextColor: DEFAULT_COLORS.darkScheme.text,
        lightSchemeBackgroundColor: DEFAULT_COLORS.lightScheme.background,
        lightSchemeTextColor: DEFAULT_COLORS.lightScheme.text,
        scrollbarColor: isMacOS ? "" : "auto",
        selectionColor: "auto",
        styleSystemControls: !isCSSColorSchemePropSupported,
        lightColorScheme: "Default",
        darkColorScheme: "Default",
        immediateModify: false
    };
    const DEFAULT_COLORSCHEME = {
        light: {
            Default: {
                backgroundColor: DEFAULT_COLORS.lightScheme.background,
                textColor: DEFAULT_COLORS.lightScheme.text
            }
        },
        dark: {
            Default: {
                backgroundColor: DEFAULT_COLORS.darkScheme.background,
                textColor: DEFAULT_COLORS.darkScheme.text
            }
        }
    };
    const DEFAULT_SETTINGS = {
        enabled: true,
        fetchNews: true,
        theme: DEFAULT_THEME,
        presets: [],
        customThemes: [],
        siteList: [],
        siteListEnabled: [],
        applyToListedOnly: false,
        changeBrowserTheme: false,
        syncSettings: true,
        syncSitesFixes: false,
        automation: {
            enabled: false,
            mode: AutomationMode.NONE,
            behavior: "OnOff"
        },
        time: {
            activation: "18:00",
            deactivation: "9:00"
        },
        location: {
            latitude: null,
            longitude: null
        },
        previewNewDesign: false,
        enableForPDF: true,
        enableForProtectedPages: false,
        enableContextMenus: false,
        detectDarkTheme: false
    };

    const CONFIG_URLs = {
        darkSites: {
            remote: "https://raw.githubusercontent.com/darkreader/darkreader/main/src/config/dark-sites.config",
            local: "../config/dark-sites.config"
        },
        dynamicThemeFixes: {
            remote: "https://raw.githubusercontent.com/darkreader/darkreader/main/src/config/dynamic-theme-fixes.config",
            local: "../config/dynamic-theme-fixes.config"
        },
        inversionFixes: {
            remote: "https://raw.githubusercontent.com/darkreader/darkreader/main/src/config/inversion-fixes.config",
            local: "../config/inversion-fixes.config"
        },
        staticThemes: {
            remote: "https://raw.githubusercontent.com/darkreader/darkreader/main/src/config/static-themes.config",
            local: "../config/static-themes.config"
        },
        colorSchemes: {
            remote: "https://raw.githubusercontent.com/darkreader/darkreader/main/src/config/color-schemes.drconf",
            local: "../config/color-schemes.drconf"
        }
    };
    const REMOTE_TIMEOUT_MS = getDuration({seconds: 10});
    class ConfigManager {
        static async loadConfig({name, local, localURL, remoteURL}) {
            let $config;
            const loadLocal = async () => await readText({url: localURL});
            if (local) {
                $config = await loadLocal();
            } else {
                try {
                    $config = await readText({
                        url: `${remoteURL}?nocache=${Date.now()}`,
                        timeout: REMOTE_TIMEOUT_MS
                    });
                } catch (err) {
                    console.error(`${name} remote load error`, err);
                    $config = await loadLocal();
                }
            }
            return $config;
        }
        static async loadColorSchemes({local}) {
            const $config = await this.loadConfig({
                name: "Color Schemes",
                local,
                localURL: CONFIG_URLs.colorSchemes.local,
                remoteURL: CONFIG_URLs.colorSchemes.remote
            });
            this.raw.colorSchemes = $config;
            this.handleColorSchemes();
        }
        static async loadDarkSites({local}) {
            const sites = await this.loadConfig({
                name: "Dark Sites",
                local,
                localURL: CONFIG_URLs.darkSites.local,
                remoteURL: CONFIG_URLs.darkSites.remote
            });
            this.raw.darkSites = sites;
            this.handleDarkSites();
        }
        static async loadDynamicThemeFixes({local}) {
            const fixes = await this.loadConfig({
                name: "Dynamic Theme Fixes",
                local,
                localURL: CONFIG_URLs.dynamicThemeFixes.local,
                remoteURL: CONFIG_URLs.dynamicThemeFixes.remote
            });
            this.raw.dynamicThemeFixes = fixes;
            this.handleDynamicThemeFixes();
        }
        static async loadInversionFixes({local}) {
            const fixes = await this.loadConfig({
                name: "Inversion Fixes",
                local,
                localURL: CONFIG_URLs.inversionFixes.local,
                remoteURL: CONFIG_URLs.inversionFixes.remote
            });
            this.raw.inversionFixes = fixes;
            this.handleInversionFixes();
        }
        static async loadStaticThemes({local}) {
            const themes = await this.loadConfig({
                name: "Static Themes",
                local,
                localURL: CONFIG_URLs.staticThemes.local,
                remoteURL: CONFIG_URLs.staticThemes.remote
            });
            this.raw.staticThemes = themes;
            this.handleStaticThemes();
        }
        static async load(config) {
            await Promise.all([
                this.loadColorSchemes(config),
                this.loadDarkSites(config),
                this.loadDynamicThemeFixes(config),
                this.loadInversionFixes(config),
                this.loadStaticThemes(config)
            ]).catch((err) => console.error("Fatality", err));
        }
        static handleColorSchemes() {
            const $config = this.raw.colorSchemes;
            const {result, error} = ParseColorSchemeConfig($config);
            if (error) {
                this.COLOR_SCHEMES_RAW = DEFAULT_COLORSCHEME;
                return;
            }
            this.COLOR_SCHEMES_RAW = result;
        }
        static handleDarkSites() {
            const $sites = this.overrides.darkSites || this.raw.darkSites;
            this.DARK_SITES = parseArray($sites);
        }
        static handleDynamicThemeFixes() {
            const $fixes =
                this.overrides.dynamicThemeFixes || this.raw.dynamicThemeFixes;
            this.DYNAMIC_THEME_FIXES_INDEX = indexSitesFixesConfig($fixes);
            this.DYNAMIC_THEME_FIXES_RAW = $fixes;
        }
        static handleInversionFixes() {
            const $fixes =
                this.overrides.inversionFixes || this.raw.inversionFixes;
            this.INVERSION_FIXES_INDEX = indexSitesFixesConfig($fixes);
            this.INVERSION_FIXES_RAW = $fixes;
        }
        static handleStaticThemes() {
            const $themes =
                this.overrides.staticThemes || this.raw.staticThemes;
            this.STATIC_THEMES_INDEX = indexSitesFixesConfig($themes);
            this.STATIC_THEMES_RAW = $themes;
        }
    }
    ConfigManager.raw = {
        darkSites: null,
        dynamicThemeFixes: null,
        inversionFixes: null,
        staticThemes: null,
        colorSchemes: null
    };
    ConfigManager.overrides = {
        darkSites: null,
        dynamicThemeFixes: null,
        inversionFixes: null,
        staticThemes: null
    };

    function isArrayLike(items) {
        return items.length != null;
    }
    function forEach(items, iterator) {
        if (isArrayLike(items)) {
            for (let i = 0, len = items.length; i < len; i++) {
                iterator(items[i]);
            }
        } else {
            for (const item of items) {
                iterator(item);
            }
        }
    }
    function push(array, addition) {
        forEach(addition, (a) => array.push(a));
    }

    function formatSitesFixesConfig(fixes, options) {
        const lines = [];
        fixes.forEach((fix, i) => {
            push(lines, fix.url);
            options.props.forEach((prop) => {
                const command = options.getPropCommandName(prop);
                const value = fix[prop];
                if (options.shouldIgnoreProp(prop, value)) {
                    return;
                }
                lines.push("");
                lines.push(command);
                const formattedValue = options.formatPropValue(prop, value);
                if (formattedValue) {
                    lines.push(formattedValue);
                }
            });
            if (i < fixes.length - 1) {
                lines.push("");
                lines.push("=".repeat(32));
                lines.push("");
            }
        });
        lines.push("");
        return lines.join("\n");
    }

    function scale(x, inLow, inHigh, outLow, outHigh) {
        return ((x - inLow) * (outHigh - outLow)) / (inHigh - inLow) + outLow;
    }
    function clamp(x, min, max) {
        return Math.min(max, Math.max(min, x));
    }
    function multiplyMatrices(m1, m2) {
        const result = [];
        for (let i = 0, len = m1.length; i < len; i++) {
            result[i] = [];
            for (let j = 0, len2 = m2[0].length; j < len2; j++) {
                let sum = 0;
                for (let k = 0, len3 = m1[0].length; k < len3; k++) {
                    sum += m1[i][k] * m2[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    function createFilterMatrix(config) {
        let m = Matrix.identity();
        if (config.sepia !== 0) {
            m = multiplyMatrices(m, Matrix.sepia(config.sepia / 100));
        }
        if (config.grayscale !== 0) {
            m = multiplyMatrices(m, Matrix.grayscale(config.grayscale / 100));
        }
        if (config.contrast !== 100) {
            m = multiplyMatrices(m, Matrix.contrast(config.contrast / 100));
        }
        if (config.brightness !== 100) {
            m = multiplyMatrices(m, Matrix.brightness(config.brightness / 100));
        }
        if (config.mode === 1) {
            m = multiplyMatrices(m, Matrix.invertNHue());
        }
        return m;
    }
    function applyColorMatrix([r, g, b], matrix) {
        const rgb = [[r / 255], [g / 255], [b / 255], [1], [1]];
        const result = multiplyMatrices(matrix, rgb);
        return [0, 1, 2].map((i) =>
            clamp(Math.round(result[i][0] * 255), 0, 255)
        );
    }
    const Matrix = {
        identity() {
            return [
                [1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        },
        invertNHue() {
            return [
                [0.333, -0.667, -0.667, 0, 1],
                [-0.667, 0.333, -0.667, 0, 1],
                [-0.667, -0.667, 0.333, 0, 1],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        },
        brightness(v) {
            return [
                [v, 0, 0, 0, 0],
                [0, v, 0, 0, 0],
                [0, 0, v, 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        },
        contrast(v) {
            const t = (1 - v) / 2;
            return [
                [v, 0, 0, 0, t],
                [0, v, 0, 0, t],
                [0, 0, v, 0, t],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        },
        sepia(v) {
            return [
                [
                    0.393 + 0.607 * (1 - v),
                    0.769 - 0.769 * (1 - v),
                    0.189 - 0.189 * (1 - v),
                    0,
                    0
                ],
                [
                    0.349 - 0.349 * (1 - v),
                    0.686 + 0.314 * (1 - v),
                    0.168 - 0.168 * (1 - v),
                    0,
                    0
                ],
                [
                    0.272 - 0.272 * (1 - v),
                    0.534 - 0.534 * (1 - v),
                    0.131 + 0.869 * (1 - v),
                    0,
                    0
                ],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        },
        grayscale(v) {
            return [
                [
                    0.2126 + 0.7874 * (1 - v),
                    0.7152 - 0.7152 * (1 - v),
                    0.0722 - 0.0722 * (1 - v),
                    0,
                    0
                ],
                [
                    0.2126 - 0.2126 * (1 - v),
                    0.7152 + 0.2848 * (1 - v),
                    0.0722 - 0.0722 * (1 - v),
                    0,
                    0
                ],
                [
                    0.2126 - 0.2126 * (1 - v),
                    0.7152 - 0.7152 * (1 - v),
                    0.0722 + 0.9278 * (1 - v),
                    0,
                    0
                ],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
        }
    };

    function createTextStyle(config) {
        const lines = [];
        lines.push(
            '*:not(pre, pre *, code, .far, .fa, .glyphicon, [class*="vjs-"], .fab, .fa-github, .fas, .material-icons, .icofont, .typcn, mu, [class*="mu-"], .glyphicon, .icon) {'
        );
        if (config.useFont && config.fontFamily) {
            lines.push(`  font-family: ${config.fontFamily} !important;`);
        }
        if (config.textStroke > 0) {
            lines.push(
                `  -webkit-text-stroke: ${config.textStroke}px !important;`
            );
            lines.push(`  text-stroke: ${config.textStroke}px !important;`);
        }
        lines.push("}");
        return lines.join("\n");
    }

    var FilterMode;
    (function (FilterMode) {
        FilterMode[(FilterMode["light"] = 0)] = "light";
        FilterMode[(FilterMode["dark"] = 1)] = "dark";
    })(FilterMode || (FilterMode = {}));
    function hasPatchForChromiumIssue501582() {
        return Boolean(
            compareChromeVersions(chromiumVersion, "81.0.4035.0") >= 0
        );
    }
    function hasFirefoxNewRootBehavior() {
        return Boolean(
            isFirefox && compareChromeVersions(firefoxVersion, "102.0") >= 0
        );
    }
    function createCSSFilterStyleSheet(config, url, frameURL, fixes, index) {
        const filterValue = getCSSFilterValue(config);
        const reverseFilterValue = "invert(100%) hue-rotate(180deg)";
        return cssFilterStyleSheetTemplate(
            filterValue,
            reverseFilterValue,
            config,
            url,
            frameURL,
            fixes,
            index
        );
    }
    function cssFilterStyleSheetTemplate(
        filterValue,
        reverseFilterValue,
        config,
        url,
        frameURL,
        fixes,
        index
    ) {
        const fix = getInversionFixesFor(frameURL || url, fixes, index);
        const lines = [];
        lines.push("@media screen {");
        if (filterValue && !frameURL) {
            lines.push("");
            lines.push("/* Leading rule */");
            lines.push(createLeadingRule(filterValue));
        }
        if (config.mode === FilterMode.dark) {
            lines.push("");
            lines.push("/* Reverse rule */");
            lines.push(createReverseRule(reverseFilterValue, fix));
        }
        if (config.useFont || config.textStroke > 0) {
            lines.push("");
            lines.push("/* Font */");
            lines.push(createTextStyle(config));
        }
        lines.push("");
        lines.push("/* Text contrast */");
        lines.push("html {");
        lines.push("  text-shadow: 0 0 0 !important;");
        lines.push("}");
        lines.push("");
        lines.push("/* Full screen */");
        [":-webkit-full-screen", ":-moz-full-screen", ":fullscreen"].forEach(
            (fullScreen) => {
                lines.push(`${fullScreen}, ${fullScreen} * {`);
                lines.push("  -webkit-filter: none !important;");
                lines.push("  filter: none !important;");
                lines.push("}");
            }
        );
        if (!frameURL) {
            const light = [255, 255, 255];
            const bgColor =
                !hasPatchForChromiumIssue501582() &&
                !hasFirefoxNewRootBehavior() &&
                config.mode === FilterMode.dark
                    ? applyColorMatrix(light, createFilterMatrix(config)).map(
                          Math.round
                      )
                    : light;
            lines.push("");
            lines.push("/* Page background */");
            lines.push("html {");
            lines.push(`  background: rgb(${bgColor.join(",")}) !important;`);
            lines.push("}");
        }
        if (fix.css && fix.css.length > 0 && config.mode === FilterMode.dark) {
            lines.push("");
            lines.push("/* Custom rules */");
            lines.push(fix.css);
        }
        lines.push("");
        lines.push("}");
        return lines.join("\n");
    }
    function getCSSFilterValue(config) {
        const filters = [];
        if (config.mode === FilterMode.dark) {
            filters.push("invert(100%) hue-rotate(180deg)");
        }
        if (config.brightness !== 100) {
            filters.push(`brightness(${config.brightness}%)`);
        }
        if (config.contrast !== 100) {
            filters.push(`contrast(${config.contrast}%)`);
        }
        if (config.grayscale !== 0) {
            filters.push(`grayscale(${config.grayscale}%)`);
        }
        if (config.sepia !== 0) {
            filters.push(`sepia(${config.sepia}%)`);
        }
        if (filters.length === 0) {
            return null;
        }
        return filters.join(" ");
    }
    function createLeadingRule(filterValue) {
        return [
            "html {",
            `  -webkit-filter: ${filterValue} !important;`,
            `  filter: ${filterValue} !important;`,
            "}"
        ].join("\n");
    }
    function joinSelectors(selectors) {
        return selectors.map((s) => s.replace(/\,$/, "")).join(",\n");
    }
    function createReverseRule(reverseFilterValue, fix) {
        const lines = [];
        if (fix.invert.length > 0) {
            lines.push(`${joinSelectors(fix.invert)} {`);
            lines.push(`  -webkit-filter: ${reverseFilterValue} !important;`);
            lines.push(`  filter: ${reverseFilterValue} !important;`);
            lines.push("}");
        }
        if (fix.noinvert.length > 0) {
            lines.push(`${joinSelectors(fix.noinvert)} {`);
            lines.push("  -webkit-filter: none !important;");
            lines.push("  filter: none !important;");
            lines.push("}");
        }
        if (fix.removebg.length > 0) {
            lines.push(`${joinSelectors(fix.removebg)} {`);
            lines.push("  background: white !important;");
            lines.push("}");
        }
        return lines.join("\n");
    }
    function getInversionFixesFor(url, fixes, index) {
        const inversionFixes = getSitesFixesFor(url, fixes, index, {
            commands: Object.keys(inversionFixesCommands),
            getCommandPropName: (command) => inversionFixesCommands[command],
            parseCommandValue: (command, value) => {
                if (command === "CSS") {
                    return value.trim();
                }
                return parseArray(value);
            }
        });
        const common = {
            url: inversionFixes[0].url,
            invert: inversionFixes[0].invert || [],
            noinvert: inversionFixes[0].noinvert || [],
            removebg: inversionFixes[0].removebg || [],
            css: inversionFixes[0].css || ""
        };
        if (url) {
            const matches = inversionFixes
                .slice(1)
                .filter((s) => isURLInList(url, s.url))
                .sort((a, b) => b.url[0].length - a.url[0].length);
            if (matches.length > 0) {
                const found = matches[0];
                return {
                    url: found.url,
                    invert: common.invert.concat(found.invert || []),
                    noinvert: common.noinvert.concat(found.noinvert || []),
                    removebg: common.removebg.concat(found.removebg || []),
                    css: [common.css, found.css].filter((s) => s).join("\n")
                };
            }
        }
        return common;
    }
    const inversionFixesCommands = {
        "INVERT": "invert",
        "NO INVERT": "noinvert",
        "REMOVE BG": "removebg",
        "CSS": "css"
    };
    function parseInversionFixes(text) {
        return parseSitesFixesConfig(text, {
            commands: Object.keys(inversionFixesCommands),
            getCommandPropName: (command) => inversionFixesCommands[command],
            parseCommandValue: (command, value) => {
                if (command === "CSS") {
                    return value.trim();
                }
                return parseArray(value);
            }
        });
    }
    function formatInversionFixes(inversionFixes) {
        const fixes = inversionFixes
            .slice()
            .sort((a, b) => compareURLPatterns(a.url[0], b.url[0]));
        return formatSitesFixesConfig(fixes, {
            props: Object.values(inversionFixesCommands),
            getPropCommandName: (prop) =>
                Object.entries(inversionFixesCommands).find(
                    ([, p]) => p === prop
                )[0],
            formatPropValue: (prop, value) => {
                if (prop === "css") {
                    return value.trim().replace(/\n+/g, "\n");
                }
                return formatArray(value).trim();
            },
            shouldIgnoreProp: (prop, value) => {
                if (prop === "css") {
                    return !value;
                }
                return !(Array.isArray(value) && value.length > 0);
            }
        });
    }

    const dynamicThemeFixesCommands = {
        "INVERT": "invert",
        "CSS": "css",
        "IGNORE INLINE STYLE": "ignoreInlineStyle",
        "IGNORE IMAGE ANALYSIS": "ignoreImageAnalysis"
    };
    function parseDynamicThemeFixes(text) {
        return parseSitesFixesConfig(text, {
            commands: Object.keys(dynamicThemeFixesCommands),
            getCommandPropName: (command) => dynamicThemeFixesCommands[command],
            parseCommandValue: (command, value) => {
                if (command === "CSS") {
                    return value.trim();
                }
                return parseArray(value);
            }
        });
    }
    function formatDynamicThemeFixes(dynamicThemeFixes) {
        const fixes = dynamicThemeFixes
            .slice()
            .sort((a, b) => compareURLPatterns(a.url[0], b.url[0]));
        return formatSitesFixesConfig(fixes, {
            props: Object.values(dynamicThemeFixesCommands),
            getPropCommandName: (prop) =>
                Object.entries(dynamicThemeFixesCommands).find(
                    ([, p]) => p === prop
                )[0],
            formatPropValue: (prop, value) => {
                if (prop === "css") {
                    return value.trim().replace(/\n+/g, "\n");
                }
                return formatArray(value).trim();
            },
            shouldIgnoreProp: (prop, value) => {
                if (prop === "css") {
                    return !value;
                }
                return !(Array.isArray(value) && value.length > 0);
            }
        });
    }
    function getDynamicThemeFixesFor(
        url,
        frameURL,
        text,
        index,
        enabledForPDF
    ) {
        const fixes = getSitesFixesFor(frameURL || url, text, index, {
            commands: Object.keys(dynamicThemeFixesCommands),
            getCommandPropName: (command) => dynamicThemeFixesCommands[command],
            parseCommandValue: (command, value) => {
                if (command === "CSS") {
                    return value.trim();
                }
                return parseArray(value);
            }
        });
        if (fixes.length === 0 || fixes[0].url[0] !== "*") {
            return null;
        }
        const genericFix = fixes[0];
        const common = {
            url: genericFix.url,
            invert: genericFix.invert || [],
            css: genericFix.css || "",
            ignoreInlineStyle: genericFix.ignoreInlineStyle || [],
            ignoreImageAnalysis: genericFix.ignoreImageAnalysis || []
        };
        if (enabledForPDF) {
            {
                common.css +=
                    '\nembed[type="application/pdf"][src="about:blank"] { filter: invert(100%) contrast(90%); }';
            }
        }
        const sortedBySpecificity = fixes
            .slice(1)
            .map((theme) => {
                return {
                    specificity: isURLInList(frameURL || url, theme.url)
                        ? theme.url[0].length
                        : 0,
                    theme
                };
            })
            .filter(({specificity}) => specificity > 0)
            .sort((a, b) => b.specificity - a.specificity);
        if (sortedBySpecificity.length === 0) {
            return common;
        }
        const match = sortedBySpecificity[0].theme;
        return {
            url: match.url,
            invert: common.invert.concat(match.invert || []),
            css: [common.css, match.css].filter((s) => s).join("\n"),
            ignoreInlineStyle: common.ignoreInlineStyle.concat(
                match.ignoreInlineStyle || []
            ),
            ignoreImageAnalysis: common.ignoreImageAnalysis.concat(
                match.ignoreImageAnalysis || []
            )
        };
    }

    const darkTheme = {
        neutralBg: [16, 20, 23],
        neutralText: [167, 158, 139],
        redBg: [64, 12, 32],
        redText: [247, 142, 102],
        greenBg: [32, 64, 48],
        greenText: [128, 204, 148],
        blueBg: [32, 48, 64],
        blueText: [128, 182, 204],
        fadeBg: [16, 20, 23, 0.5],
        fadeText: [167, 158, 139, 0.5]
    };
    const lightTheme = {
        neutralBg: [255, 242, 228],
        neutralText: [0, 0, 0],
        redBg: [255, 85, 170],
        redText: [140, 14, 48],
        greenBg: [192, 255, 170],
        greenText: [0, 128, 0],
        blueBg: [173, 215, 229],
        blueText: [28, 16, 171],
        fadeBg: [0, 0, 0, 0.5],
        fadeText: [0, 0, 0, 0.5]
    };
    function rgb([r, g, b, a]) {
        if (typeof a === "number") {
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
    }
    function mix(color1, color2, t) {
        return color1.map((c, i) => Math.round(c * (1 - t) + color2[i] * t));
    }
    function createStaticStylesheet(
        config,
        url,
        frameURL,
        staticThemes,
        staticThemesIndex
    ) {
        const srcTheme = config.mode === 1 ? darkTheme : lightTheme;
        const theme = Object.entries(srcTheme).reduce((t, [prop, color]) => {
            const [r, g, b, a] = color;
            t[prop] = applyColorMatrix(
                [r, g, b],
                createFilterMatrix({...config, mode: 0})
            );
            if (a !== undefined) {
                t[prop].push(a);
            }
            return t;
        }, {});
        const commonTheme = getCommonTheme(staticThemes, staticThemesIndex);
        const siteTheme = getThemeFor(
            frameURL || url,
            staticThemes,
            staticThemesIndex
        );
        const lines = [];
        if (!siteTheme || !siteTheme.noCommon) {
            lines.push("/* Common theme */");
            lines.push(...ruleGenerators.map((gen) => gen(commonTheme, theme)));
        }
        if (siteTheme) {
            lines.push(`/* Theme for ${siteTheme.url.join(" ")} */`);
            lines.push(...ruleGenerators.map((gen) => gen(siteTheme, theme)));
        }
        if (config.useFont || config.textStroke > 0) {
            lines.push("/* Font */");
            lines.push(createTextStyle(config));
        }
        return lines.filter((ln) => ln).join("\n");
    }
    function createRuleGen(
        getSelectors,
        generateDeclarations,
        modifySelector = (s) => s
    ) {
        return (siteTheme, themeColors) => {
            const selectors = getSelectors(siteTheme);
            if (selectors == null || selectors.length === 0) {
                return null;
            }
            const lines = [];
            selectors.forEach((s, i) => {
                let ln = modifySelector(s);
                if (i < selectors.length - 1) {
                    ln += ",";
                } else {
                    ln += " {";
                }
                lines.push(ln);
            });
            const declarations = generateDeclarations(themeColors);
            declarations.forEach((d) => lines.push(`    ${d} !important;`));
            lines.push("}");
            return lines.join("\n");
        };
    }
    const mx = {
        bg: {
            hover: 0.075,
            active: 0.1
        },
        fg: {
            hover: 0.25,
            active: 0.5
        },
        border: 0.5
    };
    const ruleGenerators = [
        createRuleGen(
            (t) => t.neutralBg,
            (t) => [`background-color: ${rgb(t.neutralBg)}`]
        ),
        createRuleGen(
            (t) => t.neutralBgActive,
            (t) => [`background-color: ${rgb(t.neutralBg)}`]
        ),
        createRuleGen(
            (t) => t.neutralBgActive,
            (t) => [
                `background-color: ${rgb(
                    mix(t.neutralBg, [255, 255, 255], mx.bg.hover)
                )}`
            ],
            (s) => `${s}:hover`
        ),
        createRuleGen(
            (t) => t.neutralBgActive,
            (t) => [
                `background-color: ${rgb(
                    mix(t.neutralBg, [255, 255, 255], mx.bg.active)
                )}`
            ],
            (s) => `${s}:active, ${s}:focus`
        ),
        createRuleGen(
            (t) => t.neutralText,
            (t) => [`color: ${rgb(t.neutralText)}`]
        ),
        createRuleGen(
            (t) => t.neutralTextActive,
            (t) => [`color: ${rgb(t.neutralText)}`]
        ),
        createRuleGen(
            (t) => t.neutralTextActive,
            (t) => [
                `color: ${rgb(
                    mix(t.neutralText, [255, 255, 255], mx.fg.hover)
                )}`
            ],
            (s) => `${s}:hover`
        ),
        createRuleGen(
            (t) => t.neutralTextActive,
            (t) => [
                `color: ${rgb(
                    mix(t.neutralText, [255, 255, 255], mx.fg.active)
                )}`
            ],
            (s) => `${s}:active, ${s}:focus`
        ),
        createRuleGen(
            (t) => t.neutralBorder,
            (t) => [
                `border-color: ${rgb(
                    mix(t.neutralBg, t.neutralText, mx.border)
                )}`
            ]
        ),
        createRuleGen(
            (t) => t.redBg,
            (t) => [`background-color: ${rgb(t.redBg)}`]
        ),
        createRuleGen(
            (t) => t.redBgActive,
            (t) => [`background-color: ${rgb(t.redBg)}`]
        ),
        createRuleGen(
            (t) => t.redBgActive,
            (t) => [
                `background-color: ${rgb(
                    mix(t.redBg, [255, 0, 64], mx.bg.hover)
                )}`
            ],
            (s) => `${s}:hover`
        ),
        createRuleGen(
            (t) => t.redBgActive,
            (t) => [
                `background-color: ${rgb(
                    mix(t.redBg, [255, 0, 64], mx.bg.active)
                )}`
            ],
            (s) => `${s}:active, ${s}:focus`
        ),
        createRuleGen(
            (t) => t.redText,
            (t) => [`color: ${rgb(t.redText)}`]
        ),
        createRuleGen(
            (t) => t.redTextActive,
            (t) => [`color: ${rgb(t.redText)}`]
        ),
        createRuleGen(
            (t) => t.redTextActive,
            (t) => [
                `color: ${rgb(mix(t.redText, [255, 255, 0], mx.fg.hover))}`
            ],
            (s) => `${s}:hover`
        ),
        createRuleGen(
            (t) => t.redTextActive,
            (t) => [
                `color: ${rgb(mix(t.redText, [255, 255, 0], mx.fg.active))}`
            ],
            (s) => `${s}:active, ${s}:focus`
        ),
        createRuleGen(
            (t) => t.redBorder,
            (t) => [`border-color: ${rgb(mix(t.redBg, t.redText, mx.border))}`]
        ),
        createRuleGen(
            (t) => t.greenBg,
            (t) => [`background-color: ${rgb(t.greenBg)}`]
        ),
        createRuleGen(
            (t) => t.greenBgActive,
            (t) => [`background-color: ${rgb(t.greenBg)}`]
        ),
        createRuleGen(
            (t) => t.greenBgActive,
            (t) => [
                `background-color: ${rgb(
                    mix(t.greenBg, [128, 255, 182], mx.bg.hover)
                )}`
            ],
            (s) => `${s}:hover`
        ),
        createRuleGen(
            (t) => t.greenBgActive,
            (t) => [
                `background-color: ${rgb(
                    mix(t.greenBg, [128, 255, 182], mx.bg.active)
                )}`
            ],
            (s) => `${s}:active, ${s}:focus`
        ),
        createRuleGen(
            (t) => t.greenText,
            (t) => [`color: ${rgb(t.greenText)}`]
        ),
        createRuleGen(
            (t) => t.greenTextActive,
            (t) => [`color: ${rgb(t.greenText)}`]
        ),
        createRuleGen(
            (t) => t.greenTextActive,
            (t) => [
                `color: ${rgb(mix(t.greenText, [182, 255, 224], mx.fg.hover))}`
            ],
            (s) => `${s}:hover`
        ),
        createRuleGen(
            (t) => t.greenTextActive,
            (t) => [
                `color: ${rgb(mix(t.greenText, [182, 255, 224], mx.fg.active))}`
            ],
            (s) => `${s}:active, ${s}:focus`
        ),
        createRuleGen(
            (t) => t.greenBorder,
            (t) => [
                `border-color: ${rgb(mix(t.greenBg, t.greenText, mx.border))}`
            ]
        ),
        createRuleGen(
            (t) => t.blueBg,
            (t) => [`background-color: ${rgb(t.blueBg)}`]
        ),
        createRuleGen(
            (t) => t.blueBgActive,
            (t) => [`background-color: ${rgb(t.blueBg)}`]
        ),
        createRuleGen(
            (t) => t.blueBgActive,
            (t) => [
                `background-color: ${rgb(
                    mix(t.blueBg, [0, 128, 255], mx.bg.hover)
                )}`
            ],
            (s) => `${s}:hover`
        ),
        createRuleGen(
            (t) => t.blueBgActive,
            (t) => [
                `background-color: ${rgb(
                    mix(t.blueBg, [0, 128, 255], mx.bg.active)
                )}`
            ],
            (s) => `${s}:active, ${s}:focus`
        ),
        createRuleGen(
            (t) => t.blueText,
            (t) => [`color: ${rgb(t.blueText)}`]
        ),
        createRuleGen(
            (t) => t.blueTextActive,
            (t) => [`color: ${rgb(t.blueText)}`]
        ),
        createRuleGen(
            (t) => t.blueTextActive,
            (t) => [
                `color: ${rgb(mix(t.blueText, [182, 224, 255], mx.fg.hover))}`
            ],
            (s) => `${s}:hover`
        ),
        createRuleGen(
            (t) => t.blueTextActive,
            (t) => [
                `color: ${rgb(mix(t.blueText, [182, 224, 255], mx.fg.active))}`
            ],
            (s) => `${s}:active, ${s}:focus`
        ),
        createRuleGen(
            (t) => t.blueBorder,
            (t) => [
                `border-color: ${rgb(mix(t.blueBg, t.blueText, mx.border))}`
            ]
        ),
        createRuleGen(
            (t) => t.fadeBg,
            (t) => [`background-color: ${rgb(t.fadeBg)}`]
        ),
        createRuleGen(
            (t) => t.fadeText,
            (t) => [`color: ${rgb(t.fadeText)}`]
        ),
        createRuleGen(
            (t) => t.transparentBg,
            () => ["background-color: transparent"]
        ),
        createRuleGen(
            (t) => t.noImage,
            () => ["background-image: none"]
        ),
        createRuleGen(
            (t) => t.invert,
            () => ["filter: invert(100%) hue-rotate(180deg)"]
        )
    ];
    const staticThemeCommands = {
        "NO COMMON": "noCommon",
        "NEUTRAL BG": "neutralBg",
        "NEUTRAL BG ACTIVE": "neutralBgActive",
        "NEUTRAL TEXT": "neutralText",
        "NEUTRAL TEXT ACTIVE": "neutralTextActive",
        "NEUTRAL BORDER": "neutralBorder",
        "RED BG": "redBg",
        "RED BG ACTIVE": "redBgActive",
        "RED TEXT": "redText",
        "RED TEXT ACTIVE": "redTextActive",
        "RED BORDER": "redBorder",
        "GREEN BG": "greenBg",
        "GREEN BG ACTIVE": "greenBgActive",
        "GREEN TEXT": "greenText",
        "GREEN TEXT ACTIVE": "greenTextActive",
        "GREEN BORDER": "greenBorder",
        "BLUE BG": "blueBg",
        "BLUE BG ACTIVE": "blueBgActive",
        "BLUE TEXT": "blueText",
        "BLUE TEXT ACTIVE": "blueTextActive",
        "BLUE BORDER": "blueBorder",
        "FADE BG": "fadeBg",
        "FADE TEXT": "fadeText",
        "TRANSPARENT BG": "transparentBg",
        "NO IMAGE": "noImage",
        "INVERT": "invert"
    };
    function parseStaticThemes($themes) {
        return parseSitesFixesConfig($themes, {
            commands: Object.keys(staticThemeCommands),
            getCommandPropName: (command) => staticThemeCommands[command],
            parseCommandValue: (command, value) => {
                if (command === "NO COMMON") {
                    return true;
                }
                return parseArray(value);
            }
        });
    }
    function camelCaseToUpperCase(text) {
        return text.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase();
    }
    function formatStaticThemes(staticThemes) {
        const themes = staticThemes
            .slice()
            .sort((a, b) => compareURLPatterns(a.url[0], b.url[0]));
        return formatSitesFixesConfig(themes, {
            props: Object.values(staticThemeCommands),
            getPropCommandName: camelCaseToUpperCase,
            formatPropValue: (prop, value) => {
                if (prop === "noCommon") {
                    return "";
                }
                return formatArray(value).trim();
            },
            shouldIgnoreProp: (prop, value) => {
                if (prop === "noCommon") {
                    return !value;
                }
                return !(Array.isArray(value) && value.length > 0);
            }
        });
    }
    function getCommonTheme(staticThemes, staticThemesIndex) {
        const length = parseInt(
            staticThemesIndex.offsets.substring(4, 4 + 3),
            36
        );
        const staticThemeText = staticThemes.substring(0, length);
        return parseStaticThemes(staticThemeText)[0];
    }
    function getThemeFor(url, staticThemes, staticThemesIndex) {
        const themes = getSitesFixesFor(url, staticThemes, staticThemesIndex, {
            commands: Object.keys(staticThemeCommands),
            getCommandPropName: (command) => staticThemeCommands[command],
            parseCommandValue: (command, value) => {
                if (command === "NO COMMON") {
                    return true;
                }
                return parseArray(value);
            }
        });
        const sortedBySpecificity = themes
            .slice(1)
            .map((theme) => {
                return {
                    specificity: isURLInList(url, theme.url)
                        ? theme.url[0].length
                        : 0,
                    theme
                };
            })
            .filter(({specificity}) => specificity > 0)
            .sort((a, b) => b.specificity - a.specificity);
        if (sortedBySpecificity.length === 0) {
            return null;
        }
        return sortedBySpecificity[0].theme;
    }

    class PersistentStorageWrapper {
        constructor() {
            this.cache = {};
            this.dataIsMigrated = false;
        }
        setDataIsMigratedForTesting(value) {}
        async migrateFromLocalStorage() {
            if (typeof localStorage === "undefined") {
                this.dataIsMigrated = true;
                return;
            }
            return new Promise((resolve) => {
                chrome.storage.local.get(
                    [
                        DevTools.KEY_DYNAMIC,
                        DevTools.KEY_FILTER,
                        DevTools.KEY_STATIC
                    ],
                    (data) => {
                        if (chrome.runtime.lastError) {
                            console.error(
                                "DevTools failed to migrate data",
                                chrome.runtime.lastError
                            );
                            resolve();
                        }
                        if (
                            data[DevTools.KEY_DYNAMIC] ||
                            data[DevTools.KEY_FILTER] ||
                            data[DevTools.KEY_STATIC]
                        ) {
                            this.dataIsMigrated = true;
                            this.cache = data;
                            resolve();
                            return;
                        }
                        this.cache = {
                            [DevTools.KEY_DYNAMIC]: localStorage.getItem(
                                DevTools.KEY_DYNAMIC
                            ),
                            [DevTools.KEY_FILTER]: localStorage.getItem(
                                DevTools.KEY_FILTER
                            ),
                            [DevTools.KEY_STATIC]: localStorage.getItem(
                                DevTools.KEY_STATIC
                            )
                        };
                        chrome.storage.local.set(this.cache, () => {
                            if (chrome.runtime.lastError) {
                                console.error(
                                    "DevTools failed to migrate data",
                                    chrome.runtime.lastError
                                );
                                resolve();
                            }
                            this.dataIsMigrated = true;
                            localStorage.removeItem(DevTools.KEY_DYNAMIC);
                            localStorage.removeItem(DevTools.KEY_FILTER);
                            localStorage.removeItem(DevTools.KEY_STATIC);
                            resolve();
                        });
                    }
                );
            });
        }
        async get(key) {
            if (!this.dataIsMigrated) {
                await this.migrateFromLocalStorage();
            }
            if (key in this.cache) {
                return this.cache[key];
            }
            return new Promise((resolve) => {
                chrome.storage.local.get(key, (result) => {
                    if (key in this.cache) {
                        resolve(this.cache[key]);
                        return;
                    }
                    if (chrome.runtime.lastError) {
                        console.error(
                            "Failed to query DevTools data",
                            chrome.runtime.lastError
                        );
                        resolve(null);
                        return;
                    }
                    this.cache[key] = result[key];
                    resolve(result[key]);
                });
            });
        }
        async set(key, value) {
            this.cache[key] = value;
            return new Promise((resolve) =>
                chrome.storage.local.set({[key]: value}, () => {
                    if (chrome.runtime.lastError) {
                        console.error(
                            "Failed to write DevTools data",
                            chrome.runtime.lastError
                        );
                    } else {
                        resolve();
                    }
                })
            );
        }
        async remove(key) {
            this.cache[key] = undefined;
            return new Promise((resolve) =>
                chrome.storage.local.remove(key, () => {
                    if (chrome.runtime.lastError) {
                        console.error(
                            "Failed to delete DevTools data",
                            chrome.runtime.lastError
                        );
                    } else {
                        resolve();
                    }
                })
            );
        }
        async has(key) {
            return Boolean(await this.get(key));
        }
    }
    class LocalStorageWrapper {
        setDataIsMigratedForTesting() {}
        async get(key) {
            try {
                return localStorage.getItem(key);
            } catch (err) {
                console.error(err);
                return null;
            }
        }
        set(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch (err) {
                console.error(err);
            }
        }
        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (err) {
                console.error(err);
            }
        }
        async has(key) {
            try {
                return localStorage.getItem(key) != null;
            } catch (err) {
                console.error(err);
                return false;
            }
        }
    }
    class TempStorage {
        constructor() {
            this.map = new Map();
        }
        setDataIsMigratedForTesting() {}
        async get(key) {
            return this.map.get(key);
        }
        set(key, value) {
            this.map.set(key, value);
        }
        remove(key) {
            this.map.delete(key);
        }
        async has(key) {
            return this.map.has(key);
        }
    }
    class DevTools {
        static init(onChange) {
            if (
                typeof chrome.storage.local !== "undefined" &&
                chrome.storage.local !== null &&
                !isFirefox
            ) {
                this.store = new PersistentStorageWrapper();
            } else if (
                typeof localStorage !== "undefined" &&
                localStorage != null
            ) {
                this.store = new LocalStorageWrapper();
            } else {
                this.store = new TempStorage();
            }
            this.loadConfigOverrides();
            this.onChange = onChange;
        }
        static setDataIsMigratedForTesting(value) {
            this.store.setDataIsMigratedForTesting(value);
        }
        static async loadConfigOverrides() {
            const [dynamicThemeFixes, inversionFixes, staticThemes] =
                await Promise.all([
                    this.getSavedDynamicThemeFixes(),
                    this.getSavedInversionFixes(),
                    this.getSavedStaticThemes()
                ]);
            ConfigManager.overrides.dynamicThemeFixes =
                dynamicThemeFixes || null;
            ConfigManager.overrides.inversionFixes = inversionFixes || null;
            ConfigManager.overrides.staticThemes = staticThemes || null;
        }
        static async getSavedDynamicThemeFixes() {
            return this.store.get(DevTools.KEY_DYNAMIC);
        }
        static saveDynamicThemeFixes(text) {
            this.store.set(DevTools.KEY_DYNAMIC, text);
        }
        static async getDynamicThemeFixesText() {
            const $fixes = await this.getSavedDynamicThemeFixes();
            const fixes = $fixes
                ? parseDynamicThemeFixes($fixes)
                : parseDynamicThemeFixes(ConfigManager.DYNAMIC_THEME_FIXES_RAW);
            return formatDynamicThemeFixes(fixes);
        }
        static resetDynamicThemeFixes() {
            this.store.remove(DevTools.KEY_DYNAMIC);
            ConfigManager.overrides.dynamicThemeFixes = null;
            ConfigManager.handleDynamicThemeFixes();
            this.onChange();
        }
        static applyDynamicThemeFixes(text) {
            try {
                const formatted = formatDynamicThemeFixes(
                    parseDynamicThemeFixes(text)
                );
                ConfigManager.overrides.dynamicThemeFixes = formatted;
                ConfigManager.handleDynamicThemeFixes();
                this.saveDynamicThemeFixes(formatted);
                this.onChange();
                return null;
            } catch (err) {
                return err;
            }
        }
        static async getSavedInversionFixes() {
            return this.store.get(DevTools.KEY_FILTER);
        }
        static saveInversionFixes(text) {
            this.store.set(DevTools.KEY_FILTER, text);
        }
        static async getInversionFixesText() {
            const $fixes = await this.getSavedInversionFixes();
            const fixes = $fixes
                ? parseInversionFixes($fixes)
                : parseInversionFixes(ConfigManager.INVERSION_FIXES_RAW);
            return formatInversionFixes(fixes);
        }
        static resetInversionFixes() {
            this.store.remove(DevTools.KEY_FILTER);
            ConfigManager.overrides.inversionFixes = null;
            ConfigManager.handleInversionFixes();
            this.onChange();
        }
        static applyInversionFixes(text) {
            try {
                const formatted = formatInversionFixes(
                    parseInversionFixes(text)
                );
                ConfigManager.overrides.inversionFixes = formatted;
                ConfigManager.handleInversionFixes();
                this.saveInversionFixes(formatted);
                this.onChange();
                return null;
            } catch (err) {
                return err;
            }
        }
        static async getSavedStaticThemes() {
            return this.store.get(DevTools.KEY_STATIC);
        }
        static saveStaticThemes(text) {
            this.store.set(DevTools.KEY_STATIC, text);
        }
        static async getStaticThemesText() {
            const $themes = await this.getSavedStaticThemes();
            const themes = $themes
                ? parseStaticThemes($themes)
                : parseStaticThemes(ConfigManager.STATIC_THEMES_RAW);
            return formatStaticThemes(themes);
        }
        static resetStaticThemes() {
            this.store.remove(DevTools.KEY_STATIC);
            ConfigManager.overrides.staticThemes = null;
            ConfigManager.handleStaticThemes();
            this.onChange();
        }
        static applyStaticThemes(text) {
            try {
                const formatted = formatStaticThemes(parseStaticThemes(text));
                ConfigManager.overrides.staticThemes = formatted;
                ConfigManager.handleStaticThemes();
                this.saveStaticThemes(formatted);
                this.onChange();
                return null;
            } catch (err) {
                return err;
            }
        }
    }
    DevTools.KEY_DYNAMIC = "dev_dynamic_theme_fixes";
    DevTools.KEY_FILTER = "dev_inversion_fixes";
    DevTools.KEY_STATIC = "dev_static_themes";

    class IconManager {
        static onStartup() {}
        static handleUpdate() {
            {
                return;
            }
        }
        static setActive() {
            if (!chrome.browserAction.setIcon) {
                return;
            }
            IconManager.iconState.active = true;
            chrome.browserAction.setIcon({
                path: IconManager.ICON_PATHS.active
            });
        }
        static setInactive() {
            if (!chrome.browserAction.setIcon) {
                return;
            }
            IconManager.iconState.active = false;
            chrome.browserAction.setIcon({
                path: IconManager.ICON_PATHS.inactive
            });
        }
        static showBadge(text) {
            IconManager.iconState.badgeText = text;
            chrome.browserAction.setBadgeBackgroundColor({color: "#e96c4c"});
            chrome.browserAction.setBadgeText({text});
        }
        static hideBadge() {
            IconManager.iconState.badgeText = "";
            chrome.browserAction.setBadgeText({text: ""});
        }
    }
    IconManager.ICON_PATHS = {
        active: {
            19: "../icons/dr_active_19.png",
            38: "../icons/dr_active_38.png"
        },
        inactive: {
            19: "../icons/dr_inactive_19.png",
            38: "../icons/dr_inactive_38.png"
        }
    };
    IconManager.iconState = {
        badgeText: "",
        active: true
    };

    var MessageType;
    (function (MessageType) {
        MessageType["UI_GET_DATA"] = "ui-get-data";
        MessageType["UI_SUBSCRIBE_TO_CHANGES"] = "ui-subscribe-to-changes";
        MessageType["UI_UNSUBSCRIBE_FROM_CHANGES"] =
            "ui-unsubscribe-from-changes";
        MessageType["UI_CHANGE_SETTINGS"] = "ui-change-settings";
        MessageType["UI_SET_THEME"] = "ui-set-theme";
        MessageType["UI_SET_SHORTCUT"] = "ui-set-shortcut";
        MessageType["UI_TOGGLE_ACTIVE_TAB"] = "ui-toggle-active-tab";
        MessageType["UI_MARK_NEWS_AS_READ"] = "ui-mark-news-as-read";
        MessageType["UI_MARK_NEWS_AS_DISPLAYED"] = "ui-mark-news-as-displayed";
        MessageType["UI_LOAD_CONFIG"] = "ui-load-config";
        MessageType["UI_APPLY_DEV_DYNAMIC_THEME_FIXES"] =
            "ui-apply-dev-dynamic-theme-fixes";
        MessageType["UI_RESET_DEV_DYNAMIC_THEME_FIXES"] =
            "ui-reset-dev-dynamic-theme-fixes";
        MessageType["UI_APPLY_DEV_INVERSION_FIXES"] =
            "ui-apply-dev-inversion-fixes";
        MessageType["UI_RESET_DEV_INVERSION_FIXES"] =
            "ui-reset-dev-inversion-fixes";
        MessageType["UI_APPLY_DEV_STATIC_THEMES"] =
            "ui-apply-dev-static-themes";
        MessageType["UI_RESET_DEV_STATIC_THEMES"] =
            "ui-reset-dev-static-themes";
        MessageType["UI_SAVE_FILE"] = "ui-save-file";
        MessageType["UI_REQUEST_EXPORT_CSS"] = "ui-request-export-css";
        MessageType["UI_COLOR_SCHEME_CHANGE"] = "ui-color-scheme-change";
        MessageType["BG_CHANGES"] = "bg-changes";
        MessageType["BG_ADD_CSS_FILTER"] = "bg-add-css-filter";
        MessageType["BG_ADD_STATIC_THEME"] = "bg-add-static-theme";
        MessageType["BG_ADD_SVG_FILTER"] = "bg-add-svg-filter";
        MessageType["BG_ADD_DYNAMIC_THEME"] = "bg-add-dynamic-theme";
        MessageType["BG_EXPORT_CSS"] = "bg-export-css";
        MessageType["BG_UNSUPPORTED_SENDER"] = "bg-unsupported-sender";
        MessageType["BG_CLEAN_UP"] = "bg-clean-up";
        MessageType["BG_RELOAD"] = "bg-reload";
        MessageType["BG_FETCH_RESPONSE"] = "bg-fetch-response";
        MessageType["BG_UI_UPDATE"] = "bg-ui-update";
        MessageType["BG_CSS_UPDATE"] = "bg-css-update";
        MessageType["CS_COLOR_SCHEME_CHANGE"] = "cs-color-scheme-change";
        MessageType["CS_FRAME_CONNECT"] = "cs-frame-connect";
        MessageType["CS_FRAME_FORGET"] = "cs-frame-forget";
        MessageType["CS_FRAME_FREEZE"] = "cs-frame-freeze";
        MessageType["CS_FRAME_RESUME"] = "cs-frame-resume";
        MessageType["CS_EXPORT_CSS_RESPONSE"] = "cs-export-css-response";
        MessageType["CS_FETCH"] = "cs-fetch";
        MessageType["CS_DARK_THEME_DETECTED"] = "cs-dark-theme-detected";
        MessageType["CS_DARK_THEME_NOT_DETECTED"] =
            "cs-dark-theme-not-detected";
        MessageType["CS_LOG"] = "cs-log";
    })(MessageType || (MessageType = {}));

    class Messenger {
        static init(adapter) {
            this.adapter = adapter;
            this.changeListenerCount = 0;
            chrome.runtime.onMessage.addListener(
                (message, sender, sendResponse) =>
                    this.messageListener(message, sender, sendResponse)
            );
            if (isFirefox) {
                chrome.runtime.onConnect.addListener((port) =>
                    this.firefoxPortListener(port)
                );
            }
        }
        static messageListener(message, sender, sendResponse) {
            const allowedSenderURL = [
                chrome.runtime.getURL("/ui/popup/index.html"),
                chrome.runtime.getURL("/ui/devtools/index.html"),
                chrome.runtime.getURL("/ui/stylesheet-editor/index.html")
            ];
            if (allowedSenderURL.includes(sender.url)) {
                this.onUIMessage(message, sendResponse);
                return [MessageType.UI_GET_DATA].includes(message.type);
            }
        }
        static firefoxPortListener(port) {
            let promise;
            switch (port.name) {
                case MessageType.UI_GET_DATA:
                    promise = this.adapter.collect();
                    break;
                case MessageType.UI_APPLY_DEV_DYNAMIC_THEME_FIXES:
                case MessageType.UI_APPLY_DEV_INVERSION_FIXES:
                case MessageType.UI_APPLY_DEV_STATIC_THEMES:
                    promise = new Promise((resolve, reject) => {
                        port.onMessage.addListener((message) => {
                            const {data} = message;
                            let error;
                            switch (port.name) {
                                case MessageType.UI_APPLY_DEV_DYNAMIC_THEME_FIXES:
                                    error =
                                        this.adapter.applyDevDynamicThemeFixes(
                                            data
                                        );
                                    break;
                                case MessageType.UI_APPLY_DEV_INVERSION_FIXES:
                                    error =
                                        this.adapter.applyDevInversionFixes(
                                            data
                                        );
                                    break;
                                case MessageType.UI_APPLY_DEV_STATIC_THEMES:
                                    error =
                                        this.adapter.applyDevStaticThemes(data);
                                    break;
                                default:
                                    throw new Error(
                                        `Unknown port name: ${port.name}`
                                    );
                            }
                            if (error) {
                                reject(error);
                            } else {
                                resolve(null);
                            }
                        });
                    });
                    break;
                default:
                    return;
            }
            promise
                .then((data) => port.postMessage({data}))
                .catch((error) => port.postMessage({error}));
        }
        static onUIMessage({type, data}, sendResponse) {
            switch (type) {
                case MessageType.UI_GET_DATA:
                    this.adapter.collect().then((data) => sendResponse({data}));
                    break;
                case MessageType.UI_SUBSCRIBE_TO_CHANGES:
                    this.changeListenerCount++;
                    break;
                case MessageType.UI_UNSUBSCRIBE_FROM_CHANGES:
                    this.changeListenerCount--;
                    break;
                case MessageType.UI_CHANGE_SETTINGS:
                    this.adapter.changeSettings(data);
                    break;
                case MessageType.UI_SET_THEME:
                    this.adapter.setTheme(data);
                    break;
                case MessageType.UI_SET_SHORTCUT:
                    this.adapter.setShortcut(data);
                    break;
                case MessageType.UI_TOGGLE_ACTIVE_TAB:
                    this.adapter.toggleActiveTab();
                    break;
                case MessageType.UI_MARK_NEWS_AS_READ:
                    this.adapter.markNewsAsRead(data);
                    break;
                case MessageType.UI_MARK_NEWS_AS_DISPLAYED:
                    this.adapter.markNewsAsDisplayed(data);
                    break;
                case MessageType.UI_LOAD_CONFIG:
                    this.adapter.loadConfig(data);
                    break;
                case MessageType.UI_APPLY_DEV_DYNAMIC_THEME_FIXES: {
                    const error = this.adapter.applyDevDynamicThemeFixes(data);
                    sendResponse({error: error ? error.message : null});
                    break;
                }
                case MessageType.UI_RESET_DEV_DYNAMIC_THEME_FIXES:
                    this.adapter.resetDevDynamicThemeFixes();
                    break;
                case MessageType.UI_APPLY_DEV_INVERSION_FIXES: {
                    const error = this.adapter.applyDevInversionFixes(data);
                    sendResponse({error: error ? error.message : null});
                    break;
                }
                case MessageType.UI_RESET_DEV_INVERSION_FIXES:
                    this.adapter.resetDevInversionFixes();
                    break;
                case MessageType.UI_APPLY_DEV_STATIC_THEMES: {
                    const error = this.adapter.applyDevStaticThemes(data);
                    sendResponse({error: error ? error.message : null});
                    break;
                }
                case MessageType.UI_RESET_DEV_STATIC_THEMES:
                    this.adapter.resetDevStaticThemes();
                    break;
            }
        }
        static reportChanges(data) {
            if (this.changeListenerCount > 0) {
                chrome.runtime.sendMessage({
                    type: MessageType.BG_CHANGES,
                    data
                });
            }
        }
    }

    function getUILanguage() {
        let code;
        if (
            "i18n" in chrome &&
            "getUILanguage" in chrome.i18n &&
            typeof chrome.i18n.getUILanguage === "function"
        ) {
            code = chrome.i18n.getUILanguage();
        } else {
            code = navigator.language.split("-")[0];
        }
        if (code.endsWith("-mac")) {
            return code.substring(0, code.length - 4);
        }
        return code;
    }

    const BLOG_URL = "https://darkreader.org/blog/";
    const UNINSTALL_URL = "https://darkreader.org/goodluck/";
    const helpLocales = [
        "be",
        "cs",
        "de",
        "en",
        "es",
        "fr",
        "it",
        "nl",
        "pt",
        "ru",
        "sr",
        "tr",
        "zh-CN",
        "zh-TW"
    ];
    function getHelpURL() {
        const locale = getUILanguage();
        const matchLocale =
            helpLocales.find((hl) => hl === locale) ||
            helpLocales.find((hl) => locale.startsWith(hl)) ||
            "en";
        return `https://darkreader.org/help/${matchLocale}/`;
    }
    function getBlogPostURL(postId) {
        return `${BLOG_URL}${postId}/`;
    }

    function canInjectScript(url) {
        if (isFirefox) {
            return (
                url &&
                !url.startsWith("about:") &&
                !url.startsWith("moz") &&
                !url.startsWith("view-source:") &&
                !url.startsWith("resource:") &&
                !url.startsWith("chrome:") &&
                !url.startsWith("jar:") &&
                !url.startsWith("https://addons.mozilla.org/") &&
                !isPDF(url)
            );
        }
        if (isEdge) {
            return (
                url &&
                !url.startsWith("chrome") &&
                !url.startsWith("data") &&
                !url.startsWith("devtools") &&
                !url.startsWith("edge") &&
                !url.startsWith("https://chrome.google.com/webstore") &&
                !url.startsWith("https://microsoftedge.microsoft.com/addons") &&
                !url.startsWith("view-source")
            );
        }
        return (
            url &&
            !url.startsWith("chrome") &&
            !url.startsWith("https://chrome.google.com/webstore") &&
            !url.startsWith("data") &&
            !url.startsWith("devtools") &&
            !url.startsWith("view-source")
        );
    }
    async function readSyncStorage(defaults) {
        return new Promise((resolve) => {
            chrome.storage.sync.get(null, (sync) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    resolve(null);
                    return;
                }
                for (const key in sync) {
                    if (!sync[key]) {
                        continue;
                    }
                    const metaKeysCount = sync[key].__meta_split_count;
                    if (!metaKeysCount) {
                        continue;
                    }
                    let string = "";
                    for (let i = 0; i < metaKeysCount; i++) {
                        string += sync[`${key}_${i.toString(36)}`];
                        delete sync[`${key}_${i.toString(36)}`];
                    }
                    try {
                        sync[key] = JSON.parse(string);
                    } catch (error) {
                        console.error(
                            `sync[${key}]: Could not parse record from sync storage: ${string}`
                        );
                        resolve(null);
                        return;
                    }
                }
                sync = {
                    ...defaults,
                    ...sync
                };
                resolve(sync);
            });
        });
    }
    async function readLocalStorage(defaults) {
        return new Promise((resolve) => {
            chrome.storage.local.get(defaults, (local) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    resolve(defaults);
                    return;
                }
                resolve(local);
            });
        });
    }
    function prepareSyncStorage(values) {
        for (const key in values) {
            const value = values[key];
            const string = JSON.stringify(value);
            const totalLength = string.length + key.length;
            if (totalLength > chrome.storage.sync.QUOTA_BYTES_PER_ITEM) {
                const maxLength =
                    chrome.storage.sync.QUOTA_BYTES_PER_ITEM -
                    key.length -
                    1 -
                    2;
                const minimalKeysNeeded = Math.ceil(string.length / maxLength);
                for (let i = 0; i < minimalKeysNeeded; i++) {
                    values[`${key}_${i.toString(36)}`] = string.substring(
                        i * maxLength,
                        (i + 1) * maxLength
                    );
                }
                values[key] = {
                    __meta_split_count: minimalKeysNeeded
                };
            }
        }
        return values;
    }
    async function writeSyncStorage(values) {
        return new Promise(async (resolve, reject) => {
            const packaged = prepareSyncStorage(values);
            chrome.storage.sync.set(packaged, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }
                resolve();
            });
        });
    }
    async function writeLocalStorage(values) {
        return new Promise(async (resolve) => {
            chrome.storage.local.set(values, () => {
                resolve();
            });
        });
    }
    async function getCommands() {
        return new Promise((resolve) => {
            if (!chrome.commands) {
                resolve([]);
                return;
            }
            chrome.commands.getAll((commands) => {
                if (commands) {
                    resolve(commands);
                } else {
                    resolve([]);
                }
            });
        });
    }
    function setShortcut(command, shortcut) {
        if (
            typeof browser !== "undefined" &&
            browser.commands &&
            browser.commands.update
        ) {
            browser.commands.update({name: command, shortcut});
        }
    }

    class PromiseBarrier {
        constructor() {
            this.resolves = [];
            this.rejects = [];
            this.wasResolved = false;
            this.wasRejected = false;
        }
        async entry() {
            if (this.wasResolved) {
                return Promise.resolve(this.resolution);
            }
            if (this.wasRejected) {
                return Promise.reject(this.reason);
            }
            return new Promise((resolve, reject) => {
                this.resolves.push(resolve);
                this.rejects.push(reject);
            });
        }
        async resolve(value) {
            if (this.wasRejected || this.wasResolved) {
                return;
            }
            this.wasResolved = true;
            this.resolution = value;
            this.resolves.forEach((resolve) => resolve(value));
            this.resolves = null;
            this.rejects = null;
            return new Promise((resolve) => setTimeout(() => resolve()));
        }
        async reject(reason) {
            if (this.wasRejected || this.wasResolved) {
                return;
            }
            this.wasRejected = true;
            this.reason = reason;
            this.rejects.forEach((reject) => reject(reason));
            this.resolves = null;
            this.rejects = null;
            return new Promise((resolve) => setTimeout(() => resolve()));
        }
        isPending() {
            return !this.wasResolved && !this.wasRejected;
        }
        isFulfilled() {
            return this.wasResolved;
        }
        isRejected() {
            return this.wasRejected;
        }
    }

    var StateManagerImplState;
    (function (StateManagerImplState) {
        StateManagerImplState[(StateManagerImplState["INITIAL"] = 0)] =
            "INITIAL";
        StateManagerImplState[(StateManagerImplState["LOADING"] = 1)] =
            "LOADING";
        StateManagerImplState[(StateManagerImplState["READY"] = 2)] = "READY";
        StateManagerImplState[(StateManagerImplState["SAVING"] = 3)] = "SAVING";
        StateManagerImplState[(StateManagerImplState["SAVING_OVERRIDE"] = 4)] =
            "SAVING_OVERRIDE";
        StateManagerImplState[(StateManagerImplState["ONCHANGE_RACE"] = 5)] =
            "ONCHANGE_RACE";
        StateManagerImplState[(StateManagerImplState["RECOVERY"] = 6)] =
            "RECOVERY";
    })(StateManagerImplState || (StateManagerImplState = {}));

    class StateManager {
        constructor(localStorageKey, parent, defaults, logWarn) {}
        async saveState() {
            if (this.stateManager) {
                return this.stateManager.saveState();
            }
        }
        async loadState() {
            if (this.stateManager) {
                return this.stateManager.loadState();
            }
        }
    }

    class Newsmaker {
        constructor() {
            if (Newsmaker.initialized) {
                return;
            }
            Newsmaker.stateManager = new StateManager(
                Newsmaker.LOCAL_STORAGE_KEY,
                this,
                {latest: [], latestTimestamp: null},
                logWarn
            );
            Newsmaker.latest = [];
            Newsmaker.latestTimestamp = null;
        }
        static onUpdate() {
            const latestNews =
                Newsmaker.latest.length > 0 && Newsmaker.latest[0];
            if (
                latestNews &&
                latestNews.badge &&
                !latestNews.read &&
                !latestNews.displayed
            ) {
                IconManager.showBadge(latestNews.badge);
                return;
            }
            IconManager.hideBadge();
        }
        static async getLatest() {
            await Newsmaker.stateManager.loadState();
            return Newsmaker.latest;
        }
        static subscribe() {
            if (
                Newsmaker.latestTimestamp === null ||
                Newsmaker.latestTimestamp + Newsmaker.UPDATE_INTERVAL <
                    Date.now()
            ) {
                Newsmaker.updateNews();
            }
            chrome.alarms.onAlarm.addListener(Newsmaker.alarmListener);
            chrome.alarms.create(Newsmaker.ALARM_NAME, {
                periodInMinutes: Newsmaker.UPDATE_INTERVAL
            });
        }
        static unSubscribe() {
            chrome.alarms.onAlarm.removeListener(Newsmaker.alarmListener);
            chrome.alarms.clear(Newsmaker.ALARM_NAME);
        }
        static async updateNews() {
            const news = await Newsmaker.getNews();
            if (Array.isArray(news)) {
                Newsmaker.latest = news;
                Newsmaker.latestTimestamp = Date.now();
                Newsmaker.onUpdate();
                await Newsmaker.stateManager.saveState();
            }
        }
        static async getReadNews() {
            const [sync, local] = await Promise.all([
                readSyncStorage({readNews: []}),
                readLocalStorage({readNews: []})
            ]);
            return Array.from(
                new Set([
                    ...(sync ? sync.readNews : []),
                    ...(local ? local.readNews : [])
                ])
            );
        }
        static async getDisplayedNews() {
            const [sync, local] = await Promise.all([
                readSyncStorage({displayedNews: []}),
                readLocalStorage({displayedNews: []})
            ]);
            return Array.from(
                new Set([
                    ...(sync ? sync.displayedNews : []),
                    ...(local ? local.displayedNews : [])
                ])
            );
        }
        static async getNews() {
            try {
                const response = await fetch(
                    `https://darkreader.github.io/blog/posts.json`,
                    {cache: "no-cache"}
                );
                const $news = await response.json();
                const readNews = await Newsmaker.getReadNews();
                const displayedNews = await Newsmaker.getDisplayedNews();
                const news = $news.map((n) => {
                    const url = getBlogPostURL(n.id);
                    const read = Newsmaker.wasRead(n.id, readNews);
                    const displayed = Newsmaker.wasDisplayed(
                        n.id,
                        displayedNews
                    );
                    return {...n, url, read, displayed};
                });
                for (let i = 0; i < news.length; i++) {
                    const date = new Date(news[i].date);
                    if (isNaN(date.getTime())) {
                        throw new Error(`Unable to parse date ${date}`);
                    }
                }
                return news;
            } catch (err) {
                console.error(err);
                return null;
            }
        }
        static async markAsRead(...ids) {
            const readNews = await Newsmaker.getReadNews();
            const results = readNews.slice();
            let changed = false;
            ids.forEach((id) => {
                if (readNews.indexOf(id) < 0) {
                    results.push(id);
                    changed = true;
                }
            });
            if (changed) {
                Newsmaker.latest = Newsmaker.latest.map((n) => {
                    const read = Newsmaker.wasRead(n.id, results);
                    return {...n, read};
                });
                Newsmaker.onUpdate();
                const obj = {readNews: results};
                await Promise.all([
                    writeLocalStorage(obj),
                    writeSyncStorage(obj),
                    Newsmaker.stateManager.saveState()
                ]);
            }
        }
        static async markAsDisplayed(...ids) {
            const displayedNews = await Newsmaker.getDisplayedNews();
            const results = displayedNews.slice();
            let changed = false;
            ids.forEach((id) => {
                if (displayedNews.indexOf(id) < 0) {
                    results.push(id);
                    changed = true;
                }
            });
            if (changed) {
                Newsmaker.latest = Newsmaker.latest.map((n) => {
                    const displayed = Newsmaker.wasDisplayed(n.id, results);
                    return {...n, displayed};
                });
                Newsmaker.onUpdate();
                const obj = {displayedNews: results};
                await Promise.all([
                    writeLocalStorage(obj),
                    writeSyncStorage(obj),
                    Newsmaker.stateManager.saveState()
                ]);
            }
        }
        static wasRead(id, readNews) {
            return readNews.includes(id);
        }
        static wasDisplayed(id, displayedNews) {
            return displayedNews.includes(id);
        }
    }
    Newsmaker.UPDATE_INTERVAL = getDurationInMinutes({hours: 4});
    Newsmaker.ALARM_NAME = "newsmaker";
    Newsmaker.LOCAL_STORAGE_KEY = "Newsmaker-state";
    Newsmaker.alarmListener = (alarm) => {
        if (alarm.name === Newsmaker.ALARM_NAME) {
            Newsmaker.updateNews();
        }
    };

    function isPanel(sender) {
        return (
            typeof sender === "undefined" ||
            typeof sender.tab === "undefined" ||
            (isOpera && sender.tab.index === -1)
        );
    }

    async function queryTabs(query = {}) {
        return new Promise((resolve) => chrome.tabs.query(query, resolve));
    }
    var DocumentState;
    (function (DocumentState) {
        DocumentState[(DocumentState["ACTIVE"] = 0)] = "ACTIVE";
        DocumentState[(DocumentState["PASSIVE"] = 1)] = "PASSIVE";
        DocumentState[(DocumentState["HIDDEN"] = 2)] = "HIDDEN";
        DocumentState[(DocumentState["FROZEN"] = 3)] = "FROZEN";
        DocumentState[(DocumentState["TERMINATED"] = 4)] = "TERMINATED";
        DocumentState[(DocumentState["DISCARDED"] = 5)] = "DISCARDED";
    })(DocumentState || (DocumentState = {}));
    class TabManager {
        static init({
            getConnectionMessage,
            onColorSchemeChange,
            getTabMessage
        }) {
            this.stateManager = new StateManager(
                TabManager.LOCAL_STORAGE_KEY,
                this,
                {tabs: {}, timestamp: 0},
                logWarn
            );
            this.tabs = {};
            this.getTabMessage = getTabMessage;
            chrome.runtime.onMessage.addListener(
                async (message, sender, sendResponse) => {
                    switch (message.type) {
                        case MessageType.CS_FRAME_CONNECT: {
                            onColorSchemeChange(message.data.isDark);
                            await this.stateManager.loadState();
                            const reply = (options) => {
                                getConnectionMessage(options).then(
                                    (message) => {
                                        message &&
                                            chrome.tabs.sendMessage(
                                                sender.tab.id,
                                                message,
                                                {frameId: sender.frameId}
                                            );
                                    }
                                );
                            };
                            if (isPanel(sender)) {
                                if (isFirefox) {
                                    if (
                                        sender &&
                                        sender.tab &&
                                        typeof sender.tab.id === "number"
                                    ) {
                                        chrome.tabs.sendMessage(
                                            sender.tab.id,
                                            {
                                                type: MessageType.BG_UNSUPPORTED_SENDER
                                            },
                                            {
                                                frameId:
                                                    sender &&
                                                    typeof sender.frameId ===
                                                        "number"
                                                        ? sender.frameId
                                                        : undefined
                                            }
                                        );
                                    }
                                } else {
                                    sendResponse("unsupportedSender");
                                }
                                return;
                            }
                            const tabId = sender.tab.id;
                            const {frameId} = sender;
                            const senderURL = sender.url;
                            const tabURL = sender.tab.url;
                            this.addFrame(
                                tabId,
                                frameId,
                                senderURL,
                                this.timestamp
                            );
                            reply({
                                url: tabURL,
                                frameURL: frameId === 0 ? null : senderURL
                            });
                            this.stateManager.saveState();
                            break;
                        }
                        case MessageType.CS_FRAME_FORGET:
                            if (!sender.tab) {
                                break;
                            }
                            this.removeFrame(sender.tab.id, sender.frameId);
                            break;
                        case MessageType.CS_FRAME_FREEZE: {
                            await this.stateManager.loadState();
                            const info =
                                this.tabs[sender.tab.id][sender.frameId];
                            info.state = DocumentState.FROZEN;
                            info.url = null;
                            this.stateManager.saveState();
                            break;
                        }
                        case MessageType.CS_FRAME_RESUME: {
                            onColorSchemeChange(message.data.isDark);
                            await this.stateManager.loadState();
                            const tabId = sender.tab.id;
                            const frameId = sender.frameId;
                            const frameURL = sender.url;
                            if (
                                this.tabs[tabId][frameId].timestamp <
                                this.timestamp
                            ) {
                                const message = this.getTabMessage(
                                    this.getTabURL(sender.tab),
                                    frameURL
                                );
                                chrome.tabs.sendMessage(tabId, message, {
                                    frameId
                                });
                            }
                            this.tabs[sender.tab.id][sender.frameId] = {
                                url: sender.url,
                                state: DocumentState.ACTIVE,
                                timestamp: this.timestamp
                            };
                            this.stateManager.saveState();
                            break;
                        }
                        case MessageType.CS_DARK_THEME_DETECTED:
                            this.tabs[sender.tab.id][
                                sender.frameId
                            ].darkThemeDetected = true;
                            break;
                        case MessageType.CS_FETCH: {
                            const id = message.id;
                            const sendResponse = (response) => {
                                chrome.tabs.sendMessage(
                                    sender.tab.id,
                                    {
                                        type: MessageType.BG_FETCH_RESPONSE,
                                        id,
                                        ...response
                                    },
                                    {frameId: sender.frameId}
                                );
                            };
                            try {
                                const {url, responseType, mimeType, origin} =
                                    message.data;
                                if (!this.fileLoader) {
                                    this.fileLoader = createFileLoader();
                                }
                                const response = await this.fileLoader.get({
                                    url,
                                    responseType,
                                    mimeType,
                                    origin
                                });
                                sendResponse({data: response});
                            } catch (err) {
                                sendResponse({
                                    error:
                                        err && err.message ? err.message : err
                                });
                            }
                            break;
                        }
                        case MessageType.UI_COLOR_SCHEME_CHANGE:
                        case MessageType.CS_COLOR_SCHEME_CHANGE:
                            onColorSchemeChange(message.data.isDark);
                            break;
                        case MessageType.UI_SAVE_FILE: {
                            const {content, name} = message.data;
                            const a = document.createElement("a");
                            a.href = URL.createObjectURL(new Blob([content]));
                            a.download = name;
                            a.click();
                            break;
                        }
                        case MessageType.UI_REQUEST_EXPORT_CSS: {
                            const activeTab = await this.getActiveTab();
                            chrome.tabs.sendMessage(
                                activeTab.id,
                                {type: MessageType.BG_EXPORT_CSS},
                                {frameId: 0}
                            );
                            break;
                        }
                    }
                }
            );
            chrome.tabs.onRemoved.addListener(async (tabId) =>
                this.removeFrame(tabId, 0)
            );
        }
        static addFrame(tabId, frameId, senderURL, timestamp) {
            let frames;
            if (this.tabs[tabId]) {
                frames = this.tabs[tabId];
            } else {
                frames = {};
                this.tabs[tabId] = frames;
            }
            frames[frameId] = {
                url: senderURL,
                state: DocumentState.ACTIVE,
                timestamp
            };
        }
        static async removeFrame(tabId, frameId) {
            await this.stateManager.loadState();
            if (frameId === 0) {
                delete this.tabs[tabId];
            }
            if (this.tabs[tabId] && this.tabs[tabId][frameId]) {
                delete this.tabs[tabId][frameId];
            }
            this.stateManager.saveState();
        }
        static getTabURL(tab) {
            return tab.url || "about:blank";
        }
        static async updateContentScript(options) {
            (await queryTabs())
                .filter(
                    (tab) =>
                        options.runOnProtectedPages || canInjectScript(tab.url)
                )
                .filter((tab) => !Boolean(this.tabs[tab.id]))
                .forEach((tab) => {
                    if (!tab.discarded) {
                        {
                            chrome.tabs.executeScript(tab.id, {
                                runAt: "document_start",
                                file: "/inject/index.js",
                                allFrames: true,
                                matchAboutBlank: true
                            });
                        }
                    }
                });
        }
        static async registerMailDisplayScript() {
            await chrome.messageDisplayScripts.register({
                js: [{file: "/inject/fallback.js"}, {file: "/inject/index.js"}]
            });
        }
        static async sendMessage(onlyUpdateActiveTab = false) {
            this.timestamp++;
            const activeTabHostname = onlyUpdateActiveTab
                ? getURLHostOrProtocol(await this.getActiveTabURL())
                : null;
            (await queryTabs())
                .filter((tab) => Boolean(this.tabs[tab.id]))
                .forEach((tab) => {
                    const frames = this.tabs[tab.id];
                    Object.entries(frames)
                        .filter(
                            ([, {state}]) =>
                                state === DocumentState.ACTIVE ||
                                state === DocumentState.PASSIVE
                        )
                        .forEach(([id, {url}]) => {
                            const frameId = Number(id);
                            const tabURL = this.getTabURL(tab);
                            if (
                                onlyUpdateActiveTab &&
                                getURLHostOrProtocol(tabURL) !==
                                    activeTabHostname
                            ) {
                                return;
                            }
                            const message = this.getTabMessage(
                                tabURL,
                                frameId === 0 ? null : url
                            );
                            if (tab.active && frameId === 0) {
                                chrome.tabs.sendMessage(tab.id, message, {
                                    frameId
                                });
                            } else {
                                setTimeout(() => {
                                    chrome.tabs.sendMessage(tab.id, message, {
                                        frameId
                                    });
                                });
                            }
                            if (this.tabs[tab.id][frameId]) {
                                this.tabs[tab.id][frameId].timestamp =
                                    this.timestamp;
                            }
                        });
                });
        }
        static async canAccessActiveTab() {
            const tab = await this.getActiveTab();
            return Boolean(this.tabs[tab.id]);
        }
        static async isActiveTabDarkThemeDetected() {
            const tab = await this.getActiveTab();
            return (
                this.tabs[tab.id] &&
                this.tabs[tab.id][0] &&
                this.tabs[tab.id][0].darkThemeDetected
            );
        }
        static async getActiveTabURL() {
            return this.getTabURL(await this.getActiveTab());
        }
        static async getActiveTab() {
            let tab = (
                await queryTabs({
                    active: true,
                    lastFocusedWindow: true
                })
            )[0];
            const isExtensionPage = (url) =>
                url.startsWith("chrome-extension:") ||
                url.startsWith("moz-extension:");
            if (!tab || isExtensionPage(tab.url)) {
                const tabs = await queryTabs({active: true});
                tab = tabs.find((t) => !isExtensionPage(t.url)) || tab;
            }
            return tab;
        }
    }
    TabManager.fileLoader = null;
    TabManager.timestamp = null;
    TabManager.LOCAL_STORAGE_KEY = "TabManager-state";

    function debounce(delay, fn) {
        let timeoutId = null;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                timeoutId = null;
                fn(...args);
            }, delay);
        };
    }

    function isBoolean(x) {
        return typeof x === "boolean";
    }
    function isPlainObject(x) {
        return typeof x === "object" && x != null && !Array.isArray(x);
    }
    function isArray(x) {
        return Array.isArray(x);
    }
    function isString(x) {
        return typeof x === "string";
    }
    function isNonEmptyString(x) {
        return x && isString(x);
    }
    function isNonEmptyArrayOfNonEmptyStrings(x) {
        return (
            Array.isArray(x) &&
            x.length > 0 &&
            x.every((s) => isNonEmptyString(s))
        );
    }
    function isRegExpMatch(regexp) {
        return (x) => {
            return isString(x) && x.match(regexp) != null;
        };
    }
    const isTime = isRegExpMatch(
        /^((0?[0-9])|(1[0-9])|(2[0-3])):([0-5][0-9])$/
    );
    function isNumber(x) {
        return typeof x === "number" && !isNaN(x);
    }
    function isNumberBetween(min, max) {
        return (x) => {
            return isNumber(x) && x >= min && x <= max;
        };
    }
    function isOneOf(...values) {
        return (x) => values.includes(x);
    }
    function hasRequiredProperties(obj, keys) {
        return keys.every((key) => obj.hasOwnProperty(key));
    }
    function createValidator() {
        const errors = [];
        function validateProperty(obj, key, validator, fallback) {
            if (!obj.hasOwnProperty(key) || validator(obj[key])) {
                return;
            }
            errors.push(
                `Unexpected value for "${key}": ${JSON.stringify(obj[key])}`
            );
            obj[key] = fallback[key];
        }
        function validateArray(obj, key, validator) {
            if (!obj.hasOwnProperty(key)) {
                return;
            }
            const wrongValues = new Set();
            const arr = obj[key];
            for (let i = 0; i < arr.length; i++) {
                if (!validator(arr[i])) {
                    wrongValues.add(arr[i]);
                    arr.splice(i, 1);
                    i--;
                }
            }
            if (wrongValues.size > 0) {
                errors.push(
                    `Array "${key}" has wrong values: ${Array.from(wrongValues)
                        .map((v) => JSON.stringify(v))
                        .join("; ")}`
                );
            }
        }
        return {validateProperty, validateArray, errors};
    }
    function validateSettings(settings) {
        if (!isPlainObject(settings)) {
            return {
                errors: ["Settings are not a plain object"],
                settings: DEFAULT_SETTINGS
            };
        }
        const {validateProperty, validateArray, errors} = createValidator();
        const isValidPresetTheme = (theme) => {
            if (!isPlainObject(theme)) {
                return false;
            }
            const {errors: themeErrors} = validateTheme(theme);
            return themeErrors.length === 0;
        };
        validateProperty(settings, "enabled", isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, "fetchNews", isBoolean, DEFAULT_SETTINGS);
        validateProperty(settings, "theme", isPlainObject, DEFAULT_SETTINGS);
        const {errors: themeErrors} = validateTheme(settings.theme);
        errors.push(...themeErrors);
        validateProperty(settings, "presets", isArray, DEFAULT_SETTINGS);
        validateArray(settings, "presets", (preset) => {
            const presetValidator = createValidator();
            if (
                !(
                    isPlainObject(preset) &&
                    hasRequiredProperties(preset, [
                        "id",
                        "name",
                        "urls",
                        "theme"
                    ])
                )
            ) {
                return false;
            }
            presetValidator.validateProperty(
                preset,
                "id",
                isNonEmptyString,
                preset
            );
            presetValidator.validateProperty(
                preset,
                "name",
                isNonEmptyString,
                preset
            );
            presetValidator.validateProperty(
                preset,
                "urls",
                isNonEmptyArrayOfNonEmptyStrings,
                preset
            );
            presetValidator.validateProperty(
                preset,
                "theme",
                isValidPresetTheme,
                preset
            );
            return presetValidator.errors.length === 0;
        });
        validateProperty(settings, "customThemes", isArray, DEFAULT_SETTINGS);
        validateArray(settings, "customThemes", (custom) => {
            if (
                !(
                    isPlainObject(custom) &&
                    hasRequiredProperties(custom, ["url", "theme"])
                )
            ) {
                return false;
            }
            const presetValidator = createValidator();
            presetValidator.validateProperty(
                custom,
                "url",
                isNonEmptyArrayOfNonEmptyStrings,
                custom
            );
            presetValidator.validateProperty(
                custom,
                "theme",
                isValidPresetTheme,
                custom
            );
            return presetValidator.errors.length === 0;
        });
        validateProperty(settings, "siteList", isArray, DEFAULT_SETTINGS);
        validateArray(settings, "siteList", isNonEmptyString);
        validateProperty(
            settings,
            "siteListEnabled",
            isArray,
            DEFAULT_SETTINGS
        );
        validateArray(settings, "siteListEnabled", isNonEmptyString);
        validateProperty(
            settings,
            "applyToListedOnly",
            isBoolean,
            DEFAULT_SETTINGS
        );
        validateProperty(
            settings,
            "changeBrowserTheme",
            isBoolean,
            DEFAULT_SETTINGS
        );
        validateProperty(settings, "syncSettings", isBoolean, DEFAULT_SETTINGS);
        validateProperty(
            settings,
            "syncSitesFixes",
            isBoolean,
            DEFAULT_SETTINGS
        );
        validateProperty(
            settings,
            "automation",
            (automation) => {
                if (!isPlainObject(automation)) {
                    return false;
                }
                const automationValidator = createValidator();
                automationValidator.validateProperty(
                    automation,
                    "enabled",
                    isBoolean,
                    automation
                );
                automationValidator.validateProperty(
                    automation,
                    "mode",
                    isOneOf(
                        AutomationMode.SYSTEM,
                        AutomationMode.TIME,
                        AutomationMode.LOCATION,
                        AutomationMode.NONE
                    ),
                    automation
                );
                automationValidator.validateProperty(
                    automation,
                    "behavior",
                    isOneOf("OnOff", "Scheme"),
                    automation
                );
                return automationValidator.errors.length === 0;
            },
            DEFAULT_SETTINGS
        );
        validateProperty(
            settings,
            AutomationMode.TIME,
            (time) => {
                if (!isPlainObject(time)) {
                    return false;
                }
                const timeValidator = createValidator();
                timeValidator.validateProperty(
                    time,
                    "activation",
                    isTime,
                    time
                );
                timeValidator.validateProperty(
                    time,
                    "deactivation",
                    isTime,
                    time
                );
                return timeValidator.errors.length === 0;
            },
            DEFAULT_SETTINGS
        );
        validateProperty(
            settings,
            AutomationMode.LOCATION,
            (location) => {
                if (!isPlainObject(location)) {
                    return false;
                }
                const locValidator = createValidator();
                const isValidLoc = (x) => x === null || isNumber(x);
                locValidator.validateProperty(
                    location,
                    "latitude",
                    isValidLoc,
                    location
                );
                locValidator.validateProperty(
                    location,
                    "longitude",
                    isValidLoc,
                    location
                );
                return locValidator.errors.length === 0;
            },
            DEFAULT_SETTINGS
        );
        validateProperty(
            settings,
            "previewNewDesign",
            isBoolean,
            DEFAULT_SETTINGS
        );
        validateProperty(settings, "enableForPDF", isBoolean, DEFAULT_SETTINGS);
        validateProperty(
            settings,
            "enableForProtectedPages",
            isBoolean,
            DEFAULT_SETTINGS
        );
        validateProperty(
            settings,
            "enableContextMenus",
            isBoolean,
            DEFAULT_SETTINGS
        );
        validateProperty(
            settings,
            "detectDarkTheme",
            isBoolean,
            DEFAULT_SETTINGS
        );
        return {errors, settings};
    }
    function validateTheme(theme) {
        if (!isPlainObject(theme)) {
            return {
                errors: ["Theme is not a plain object"],
                theme: DEFAULT_THEME
            };
        }
        const {validateProperty, errors} = createValidator();
        validateProperty(theme, "mode", isOneOf(0, 1), DEFAULT_THEME);
        validateProperty(
            theme,
            "brightness",
            isNumberBetween(0, 200),
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "contrast",
            isNumberBetween(0, 200),
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "grayscale",
            isNumberBetween(0, 100),
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "sepia",
            isNumberBetween(0, 100),
            DEFAULT_THEME
        );
        validateProperty(theme, "useFont", isBoolean, DEFAULT_THEME);
        validateProperty(theme, "fontFamily", isNonEmptyString, DEFAULT_THEME);
        validateProperty(
            theme,
            "textStroke",
            isNumberBetween(0, 1),
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "engine",
            isOneOf("dynamicTheme", "staticTheme", "cssFilter", "svgFilter"),
            DEFAULT_THEME
        );
        validateProperty(theme, "stylesheet", isString, DEFAULT_THEME);
        validateProperty(
            theme,
            "darkSchemeBackgroundColor",
            isRegExpMatch(/^#[0-9a-f]{6}$/i),
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "darkSchemeTextColor",
            isRegExpMatch(/^#[0-9a-f]{6}$/i),
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "lightSchemeBackgroundColor",
            isRegExpMatch(/^#[0-9a-f]{6}$/i),
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "lightSchemeTextColor",
            isRegExpMatch(/^#[0-9a-f]{6}$/i),
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "scrollbarColor",
            (x) => x === "" || isRegExpMatch(/^(auto)|(#[0-9a-f]{6})$/i)(x),
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "selectionColor",
            isRegExpMatch(/^(auto)|(#[0-9a-f]{6})$/i),
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "styleSystemControls",
            isBoolean,
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "lightColorScheme",
            isNonEmptyString,
            DEFAULT_THEME
        );
        validateProperty(
            theme,
            "darkColorScheme",
            isNonEmptyString,
            DEFAULT_THEME
        );
        validateProperty(theme, "immediateModify", isBoolean, DEFAULT_THEME);
        return {errors, theme};
    }

    const SAVE_TIMEOUT = 1000;
    class UserStorage {
        static async loadSettings() {
            UserStorage.settings = await UserStorage.loadSettingsFromStorage();
        }
        static fillDefaults(settings) {
            settings.theme = {...DEFAULT_THEME, ...settings.theme};
            settings.time = {...DEFAULT_SETTINGS.time, ...settings.time};
            settings.presets.forEach((preset) => {
                preset.theme = {...DEFAULT_THEME, ...preset.theme};
            });
            settings.customThemes.forEach((site) => {
                site.theme = {...DEFAULT_THEME, ...site.theme};
            });
        }
        static migrateAutomationSettings(settings) {
            if (typeof settings.automation === "string") {
                const automationMode = settings.automation;
                const automationBehavior = settings.automationBehaviour;
                if (settings.automation === "") {
                    settings.automation = {
                        enabled: false,
                        mode: automationMode,
                        behavior: automationBehavior
                    };
                } else {
                    settings.automation = {
                        enabled: true,
                        mode: automationMode,
                        behavior: automationBehavior
                    };
                }
                delete settings.automationBehaviour;
            }
        }
        static async loadSettingsFromStorage() {
            if (UserStorage.loadBarrier) {
                return await UserStorage.loadBarrier.entry();
            }
            UserStorage.loadBarrier = new PromiseBarrier();
            const local = await readLocalStorage(DEFAULT_SETTINGS);
            const {errors: localCfgErrors} = validateSettings(local);
            localCfgErrors.forEach((err) => logWarn(err));
            if (local.syncSettings == null) {
                local.syncSettings = DEFAULT_SETTINGS.syncSettings;
            }
            if (!local.syncSettings) {
                UserStorage.migrateAutomationSettings(local);
                UserStorage.fillDefaults(local);
                UserStorage.loadBarrier.resolve(local);
                return local;
            }
            const $sync = await readSyncStorage(DEFAULT_SETTINGS);
            if (!$sync) {
                local.syncSettings = false;
                UserStorage.set({syncSettings: false});
                UserStorage.saveSyncSetting(false);
                UserStorage.loadBarrier.resolve(local);
                UserStorage.migrateAutomationSettings($sync);
                UserStorage.fillDefaults($sync);
                return local;
            }
            const {errors: syncCfgErrors} = validateSettings($sync);
            syncCfgErrors.forEach((err) => logWarn(err));
            UserStorage.migrateAutomationSettings($sync);
            UserStorage.fillDefaults($sync);
            UserStorage.loadBarrier.resolve($sync);
            return $sync;
        }
        static async saveSettings() {
            if (!UserStorage.settings) {
                return;
            }
            await UserStorage.saveSettingsIntoStorage();
        }
        static async saveSyncSetting(sync) {
            const obj = {syncSettings: sync};
            await writeLocalStorage(obj);
            try {
                await writeSyncStorage(obj);
            } catch (err) {
                logWarn(
                    "Settings synchronization was disabled due to error:",
                    chrome.runtime.lastError
                );
                UserStorage.set({syncSettings: false});
            }
        }
        static set($settings) {
            if (!UserStorage.settings) {
                return;
            }
            if ($settings.siteList) {
                if (!Array.isArray($settings.siteList)) {
                    const list = [];
                    for (const key in $settings.siteList) {
                        const index = Number(key);
                        if (!isNaN(index)) {
                            list[index] = $settings.siteList[key];
                        }
                    }
                    $settings.siteList = list;
                }
                const siteList = $settings.siteList.filter((pattern) => {
                    let isOK = false;
                    try {
                        isURLMatched("https://google.com/", pattern);
                        isURLMatched("[::1]:1337", pattern);
                        isOK = true;
                    } catch (err) {}
                    return isOK && pattern !== "/";
                });
                $settings = {...$settings, siteList};
            }
            UserStorage.settings = {...UserStorage.settings, ...$settings};
        }
    }
    UserStorage.saveSettingsIntoStorage = debounce(SAVE_TIMEOUT, async () => {
        if (UserStorage.saveStorageBarrier) {
            await UserStorage.saveStorageBarrier.entry();
            return;
        }
        UserStorage.saveStorageBarrier = new PromiseBarrier();
        const settings = UserStorage.settings;
        if (settings.syncSettings) {
            try {
                await writeSyncStorage(settings);
            } catch (err) {
                logWarn(
                    "Settings synchronization was disabled due to error:",
                    chrome.runtime.lastError
                );
                UserStorage.set({syncSettings: false});
                await UserStorage.saveSyncSetting(false);
                await writeLocalStorage(settings);
            }
        } else {
            await writeLocalStorage(settings);
        }
        UserStorage.saveStorageBarrier.resolve();
        UserStorage.saveStorageBarrier = null;
    });

    function evalMath(expression) {
        const rpnStack = [];
        const workingStack = [];
        let lastToken;
        for (let i = 0, len = expression.length; i < len; i++) {
            const token = expression[i];
            if (!token || token === " ") {
                continue;
            }
            if (operators.has(token)) {
                const op = operators.get(token);
                while (workingStack.length) {
                    const currentOp = operators.get(workingStack[0]);
                    if (!currentOp) {
                        break;
                    }
                    if (op.lessOrEqualThan(currentOp)) {
                        rpnStack.push(workingStack.shift());
                    } else {
                        break;
                    }
                }
                workingStack.unshift(token);
            } else if (!lastToken || operators.has(lastToken)) {
                rpnStack.push(token);
            } else {
                rpnStack[rpnStack.length - 1] += token;
            }
            lastToken = token;
        }
        rpnStack.push(...workingStack);
        const stack = [];
        for (let i = 0, len = rpnStack.length; i < len; i++) {
            const op = operators.get(rpnStack[i]);
            if (op) {
                const args = stack.splice(0, 2);
                stack.push(op.exec(args[1], args[0]));
            } else {
                stack.unshift(parseFloat(rpnStack[i]));
            }
        }
        return stack[0];
    }
    class Operator {
        constructor(precedence, method) {
            this.precendce = precedence;
            this.execMethod = method;
        }
        exec(left, right) {
            return this.execMethod(left, right);
        }
        lessOrEqualThan(op) {
            return this.precendce <= op.precendce;
        }
    }
    const operators = new Map([
        ["+", new Operator(1, (left, right) => left + right)],
        ["-", new Operator(1, (left, right) => left - right)],
        ["*", new Operator(2, (left, right) => left * right)],
        ["/", new Operator(2, (left, right) => left / right)]
    ]);

    const hslaParseCache = new Map();
    const rgbaParseCache = new Map();
    function parseColorWithCache($color) {
        $color = $color.trim();
        if (rgbaParseCache.has($color)) {
            return rgbaParseCache.get($color);
        }
        if ($color.includes("calc(")) {
            $color = lowerCalcExpression($color);
        }
        const color = parse($color);
        color && rgbaParseCache.set($color, color);
        return color;
    }
    function parseToHSLWithCache(color) {
        if (hslaParseCache.has(color)) {
            return hslaParseCache.get(color);
        }
        const rgb = parseColorWithCache(color);
        if (!rgb) {
            return null;
        }
        const hsl = rgbToHSL(rgb);
        hslaParseCache.set(color, hsl);
        return hsl;
    }
    function hslToRGB({h, s, l, a = 1}) {
        if (s === 0) {
            const [r, b, g] = [l, l, l].map((x) => Math.round(x * 255));
            return {r, g, b, a};
        }
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        const [r, g, b] = (
            h < 60
                ? [c, x, 0]
                : h < 120
                ? [x, c, 0]
                : h < 180
                ? [0, c, x]
                : h < 240
                ? [0, x, c]
                : h < 300
                ? [x, 0, c]
                : [c, 0, x]
        ).map((n) => Math.round((n + m) * 255));
        return {r, g, b, a};
    }
    function rgbToHSL({r: r255, g: g255, b: b255, a = 1}) {
        const r = r255 / 255;
        const g = g255 / 255;
        const b = b255 / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const c = max - min;
        const l = (max + min) / 2;
        if (c === 0) {
            return {h: 0, s: 0, l, a};
        }
        let h =
            (max === r
                ? ((g - b) / c) % 6
                : max === g
                ? (b - r) / c + 2
                : (r - g) / c + 4) * 60;
        if (h < 0) {
            h += 360;
        }
        const s = c / (1 - Math.abs(2 * l - 1));
        return {h, s, l, a};
    }
    function toFixed(n, digits = 0) {
        const fixed = n.toFixed(digits);
        if (digits === 0) {
            return fixed;
        }
        const dot = fixed.indexOf(".");
        if (dot >= 0) {
            const zerosMatch = fixed.match(/0+$/);
            if (zerosMatch) {
                if (zerosMatch.index === dot + 1) {
                    return fixed.substring(0, dot);
                }
                return fixed.substring(0, zerosMatch.index);
            }
        }
        return fixed;
    }
    function rgbToString(rgb) {
        const {r, g, b, a} = rgb;
        if (a != null && a < 1) {
            return `rgba(${toFixed(r)}, ${toFixed(g)}, ${toFixed(b)}, ${toFixed(
                a,
                2
            )})`;
        }
        return `rgb(${toFixed(r)}, ${toFixed(g)}, ${toFixed(b)})`;
    }
    function rgbToHexString({r, g, b, a}) {
        return `#${(a != null && a < 1
            ? [r, g, b, Math.round(a * 255)]
            : [r, g, b]
        )
            .map((x) => {
                return `${x < 16 ? "0" : ""}${x.toString(16)}`;
            })
            .join("")}`;
    }
    const rgbMatch = /^rgba?\([^\(\)]+\)$/;
    const hslMatch = /^hsla?\([^\(\)]+\)$/;
    const hexMatch = /^#[0-9a-f]+$/i;
    function parse($color) {
        const c = $color.trim().toLowerCase();
        if (c.match(rgbMatch)) {
            return parseRGB(c);
        }
        if (c.match(hslMatch)) {
            return parseHSL(c);
        }
        if (c.match(hexMatch)) {
            return parseHex(c);
        }
        if (knownColors.has(c)) {
            return getColorByName(c);
        }
        if (systemColors.has(c)) {
            return getSystemColor(c);
        }
        if ($color === "transparent") {
            return {r: 0, g: 0, b: 0, a: 0};
        }
        return null;
    }
    function getNumbers($color) {
        const numbers = [];
        let prevPos = 0;
        let isMining = false;
        const startIndex = $color.indexOf("(");
        $color = $color.substring(startIndex + 1, $color.length - 1);
        for (let i = 0; i < $color.length; i++) {
            const c = $color[i];
            if ((c >= "0" && c <= "9") || c === "." || c === "+" || c === "-") {
                isMining = true;
            } else if (isMining && (c === " " || c === ",")) {
                numbers.push($color.substring(prevPos, i));
                isMining = false;
                prevPos = i + 1;
            } else if (!isMining) {
                prevPos = i + 1;
            }
        }
        if (isMining) {
            numbers.push($color.substring(prevPos, $color.length));
        }
        return numbers;
    }
    function getNumbersFromString(str, range, units) {
        const raw = getNumbers(str);
        const unitsList = Object.entries(units);
        const numbers = raw
            .map((r) => r.trim())
            .map((r, i) => {
                let n;
                const unit = unitsList.find(([u]) => r.endsWith(u));
                if (unit) {
                    n =
                        (parseFloat(r.substring(0, r.length - unit[0].length)) /
                            unit[1]) *
                        range[i];
                } else {
                    n = parseFloat(r);
                }
                if (range[i] > 1) {
                    return Math.round(n);
                }
                return n;
            });
        return numbers;
    }
    const rgbRange = [255, 255, 255, 1];
    const rgbUnits = {"%": 100};
    function parseRGB($rgb) {
        const [r, g, b, a = 1] = getNumbersFromString($rgb, rgbRange, rgbUnits);
        return {r, g, b, a};
    }
    const hslRange = [360, 1, 1, 1];
    const hslUnits = {"%": 100, "deg": 360, "rad": 2 * Math.PI, "turn": 1};
    function parseHSL($hsl) {
        const [h, s, l, a = 1] = getNumbersFromString($hsl, hslRange, hslUnits);
        return hslToRGB({h, s, l, a});
    }
    function parseHex($hex) {
        const h = $hex.substring(1);
        switch (h.length) {
            case 3:
            case 4: {
                const [r, g, b] = [0, 1, 2].map((i) =>
                    parseInt(`${h[i]}${h[i]}`, 16)
                );
                const a =
                    h.length === 3 ? 1 : parseInt(`${h[3]}${h[3]}`, 16) / 255;
                return {r, g, b, a};
            }
            case 6:
            case 8: {
                const [r, g, b] = [0, 2, 4].map((i) =>
                    parseInt(h.substring(i, i + 2), 16)
                );
                const a =
                    h.length === 6 ? 1 : parseInt(h.substring(6, 8), 16) / 255;
                return {r, g, b, a};
            }
        }
        return null;
    }
    function getColorByName($color) {
        const n = knownColors.get($color);
        return {
            r: (n >> 16) & 255,
            g: (n >> 8) & 255,
            b: (n >> 0) & 255,
            a: 1
        };
    }
    function getSystemColor($color) {
        const n = systemColors.get($color);
        return {
            r: (n >> 16) & 255,
            g: (n >> 8) & 255,
            b: (n >> 0) & 255,
            a: 1
        };
    }
    function lowerCalcExpression(color) {
        let searchIndex = 0;
        const replaceBetweenIndices = (start, end, replacement) => {
            color =
                color.substring(0, start) + replacement + color.substring(end);
        };
        while ((searchIndex = color.indexOf("calc(")) !== -1) {
            const range = getParenthesesRange(color, searchIndex);
            if (!range) {
                break;
            }
            let slice = color.slice(range.start + 1, range.end - 1);
            const includesPercentage = slice.includes("%");
            slice = slice.split("%").join("");
            const output = Math.round(evalMath(slice));
            replaceBetweenIndices(
                range.start - 4,
                range.end,
                output + (includesPercentage ? "%" : "")
            );
        }
        return color;
    }
    const knownColors = new Map(
        Object.entries({
            aliceblue: 0xf0f8ff,
            antiquewhite: 0xfaebd7,
            aqua: 0x00ffff,
            aquamarine: 0x7fffd4,
            azure: 0xf0ffff,
            beige: 0xf5f5dc,
            bisque: 0xffe4c4,
            black: 0x000000,
            blanchedalmond: 0xffebcd,
            blue: 0x0000ff,
            blueviolet: 0x8a2be2,
            brown: 0xa52a2a,
            burlywood: 0xdeb887,
            cadetblue: 0x5f9ea0,
            chartreuse: 0x7fff00,
            chocolate: 0xd2691e,
            coral: 0xff7f50,
            cornflowerblue: 0x6495ed,
            cornsilk: 0xfff8dc,
            crimson: 0xdc143c,
            cyan: 0x00ffff,
            darkblue: 0x00008b,
            darkcyan: 0x008b8b,
            darkgoldenrod: 0xb8860b,
            darkgray: 0xa9a9a9,
            darkgrey: 0xa9a9a9,
            darkgreen: 0x006400,
            darkkhaki: 0xbdb76b,
            darkmagenta: 0x8b008b,
            darkolivegreen: 0x556b2f,
            darkorange: 0xff8c00,
            darkorchid: 0x9932cc,
            darkred: 0x8b0000,
            darksalmon: 0xe9967a,
            darkseagreen: 0x8fbc8f,
            darkslateblue: 0x483d8b,
            darkslategray: 0x2f4f4f,
            darkslategrey: 0x2f4f4f,
            darkturquoise: 0x00ced1,
            darkviolet: 0x9400d3,
            deeppink: 0xff1493,
            deepskyblue: 0x00bfff,
            dimgray: 0x696969,
            dimgrey: 0x696969,
            dodgerblue: 0x1e90ff,
            firebrick: 0xb22222,
            floralwhite: 0xfffaf0,
            forestgreen: 0x228b22,
            fuchsia: 0xff00ff,
            gainsboro: 0xdcdcdc,
            ghostwhite: 0xf8f8ff,
            gold: 0xffd700,
            goldenrod: 0xdaa520,
            gray: 0x808080,
            grey: 0x808080,
            green: 0x008000,
            greenyellow: 0xadff2f,
            honeydew: 0xf0fff0,
            hotpink: 0xff69b4,
            indianred: 0xcd5c5c,
            indigo: 0x4b0082,
            ivory: 0xfffff0,
            khaki: 0xf0e68c,
            lavender: 0xe6e6fa,
            lavenderblush: 0xfff0f5,
            lawngreen: 0x7cfc00,
            lemonchiffon: 0xfffacd,
            lightblue: 0xadd8e6,
            lightcoral: 0xf08080,
            lightcyan: 0xe0ffff,
            lightgoldenrodyellow: 0xfafad2,
            lightgray: 0xd3d3d3,
            lightgrey: 0xd3d3d3,
            lightgreen: 0x90ee90,
            lightpink: 0xffb6c1,
            lightsalmon: 0xffa07a,
            lightseagreen: 0x20b2aa,
            lightskyblue: 0x87cefa,
            lightslategray: 0x778899,
            lightslategrey: 0x778899,
            lightsteelblue: 0xb0c4de,
            lightyellow: 0xffffe0,
            lime: 0x00ff00,
            limegreen: 0x32cd32,
            linen: 0xfaf0e6,
            magenta: 0xff00ff,
            maroon: 0x800000,
            mediumaquamarine: 0x66cdaa,
            mediumblue: 0x0000cd,
            mediumorchid: 0xba55d3,
            mediumpurple: 0x9370db,
            mediumseagreen: 0x3cb371,
            mediumslateblue: 0x7b68ee,
            mediumspringgreen: 0x00fa9a,
            mediumturquoise: 0x48d1cc,
            mediumvioletred: 0xc71585,
            midnightblue: 0x191970,
            mintcream: 0xf5fffa,
            mistyrose: 0xffe4e1,
            moccasin: 0xffe4b5,
            navajowhite: 0xffdead,
            navy: 0x000080,
            oldlace: 0xfdf5e6,
            olive: 0x808000,
            olivedrab: 0x6b8e23,
            orange: 0xffa500,
            orangered: 0xff4500,
            orchid: 0xda70d6,
            palegoldenrod: 0xeee8aa,
            palegreen: 0x98fb98,
            paleturquoise: 0xafeeee,
            palevioletred: 0xdb7093,
            papayawhip: 0xffefd5,
            peachpuff: 0xffdab9,
            peru: 0xcd853f,
            pink: 0xffc0cb,
            plum: 0xdda0dd,
            powderblue: 0xb0e0e6,
            purple: 0x800080,
            rebeccapurple: 0x663399,
            red: 0xff0000,
            rosybrown: 0xbc8f8f,
            royalblue: 0x4169e1,
            saddlebrown: 0x8b4513,
            salmon: 0xfa8072,
            sandybrown: 0xf4a460,
            seagreen: 0x2e8b57,
            seashell: 0xfff5ee,
            sienna: 0xa0522d,
            silver: 0xc0c0c0,
            skyblue: 0x87ceeb,
            slateblue: 0x6a5acd,
            slategray: 0x708090,
            slategrey: 0x708090,
            snow: 0xfffafa,
            springgreen: 0x00ff7f,
            steelblue: 0x4682b4,
            tan: 0xd2b48c,
            teal: 0x008080,
            thistle: 0xd8bfd8,
            tomato: 0xff6347,
            turquoise: 0x40e0d0,
            violet: 0xee82ee,
            wheat: 0xf5deb3,
            white: 0xffffff,
            whitesmoke: 0xf5f5f5,
            yellow: 0xffff00,
            yellowgreen: 0x9acd32
        })
    );
    const systemColors = new Map(
        Object.entries({
            "ActiveBorder": 0x3b99fc,
            "ActiveCaption": 0x000000,
            "AppWorkspace": 0xaaaaaa,
            "Background": 0x6363ce,
            "ButtonFace": 0xffffff,
            "ButtonHighlight": 0xe9e9e9,
            "ButtonShadow": 0x9fa09f,
            "ButtonText": 0x000000,
            "CaptionText": 0x000000,
            "GrayText": 0x7f7f7f,
            "Highlight": 0xb2d7ff,
            "HighlightText": 0x000000,
            "InactiveBorder": 0xffffff,
            "InactiveCaption": 0xffffff,
            "InactiveCaptionText": 0x000000,
            "InfoBackground": 0xfbfcc5,
            "InfoText": 0x000000,
            "Menu": 0xf6f6f6,
            "MenuText": 0xffffff,
            "Scrollbar": 0xaaaaaa,
            "ThreeDDarkShadow": 0x000000,
            "ThreeDFace": 0xc0c0c0,
            "ThreeDHighlight": 0xffffff,
            "ThreeDLightShadow": 0xffffff,
            "ThreeDShadow": 0x000000,
            "Window": 0xececec,
            "WindowFrame": 0xaaaaaa,
            "WindowText": 0x000000,
            "-webkit-focus-ring-color": 0xe59700
        }).map(([key, value]) => [key.toLowerCase(), value])
    );

    function getBgPole(theme) {
        const isDarkScheme = theme.mode === 1;
        const prop = isDarkScheme
            ? "darkSchemeBackgroundColor"
            : "lightSchemeBackgroundColor";
        return theme[prop];
    }
    function getFgPole(theme) {
        const isDarkScheme = theme.mode === 1;
        const prop = isDarkScheme
            ? "darkSchemeTextColor"
            : "lightSchemeTextColor";
        return theme[prop];
    }
    const colorModificationCache = new Map();
    const rgbCacheKeys = ["r", "g", "b", "a"];
    const themeCacheKeys = [
        "mode",
        "brightness",
        "contrast",
        "grayscale",
        "sepia",
        "darkSchemeBackgroundColor",
        "darkSchemeTextColor",
        "lightSchemeBackgroundColor",
        "lightSchemeTextColor"
    ];
    function getCacheId(rgb, theme) {
        let resultId = "";
        rgbCacheKeys.forEach((key) => {
            resultId += `${rgb[key]};`;
        });
        themeCacheKeys.forEach((key) => {
            resultId += `${theme[key]};`;
        });
        return resultId;
    }
    function modifyColorWithCache(
        rgb,
        theme,
        modifyHSL,
        poleColor,
        anotherPoleColor
    ) {
        let fnCache;
        if (colorModificationCache.has(modifyHSL)) {
            fnCache = colorModificationCache.get(modifyHSL);
        } else {
            fnCache = new Map();
            colorModificationCache.set(modifyHSL, fnCache);
        }
        const id = getCacheId(rgb, theme);
        if (fnCache.has(id)) {
            return fnCache.get(id);
        }
        const hsl = rgbToHSL(rgb);
        const pole = poleColor == null ? null : parseToHSLWithCache(poleColor);
        const anotherPole =
            anotherPoleColor == null
                ? null
                : parseToHSLWithCache(anotherPoleColor);
        const modified = modifyHSL(hsl, pole, anotherPole);
        const {r, g, b, a} = hslToRGB(modified);
        const matrix = createFilterMatrix(theme);
        const [rf, gf, bf] = applyColorMatrix([r, g, b], matrix);
        const color =
            a === 1
                ? rgbToHexString({r: rf, g: gf, b: bf})
                : rgbToString({r: rf, g: gf, b: bf, a});
        fnCache.set(id, color);
        return color;
    }
    function modifyLightSchemeColor(rgb, theme) {
        const poleBg = getBgPole(theme);
        const poleFg = getFgPole(theme);
        return modifyColorWithCache(
            rgb,
            theme,
            modifyLightModeHSL,
            poleFg,
            poleBg
        );
    }
    function modifyLightModeHSL({h, s, l, a}, poleFg, poleBg) {
        const isDark = l < 0.5;
        let isNeutral;
        if (isDark) {
            isNeutral = l < 0.2 || s < 0.12;
        } else {
            const isBlue = h > 200 && h < 280;
            isNeutral = s < 0.24 || (l > 0.8 && isBlue);
        }
        let hx = h;
        let sx = l;
        if (isNeutral) {
            if (isDark) {
                hx = poleFg.h;
                sx = poleFg.s;
            } else {
                hx = poleBg.h;
                sx = poleBg.s;
            }
        }
        const lx = scale(l, 0, 1, poleFg.l, poleBg.l);
        return {h: hx, s: sx, l: lx, a};
    }
    const MAX_BG_LIGHTNESS = 0.4;
    function modifyBgHSL({h, s, l, a}, pole) {
        const isDark = l < 0.5;
        const isBlue = h > 200 && h < 280;
        const isNeutral = s < 0.12 || (l > 0.8 && isBlue);
        if (isDark) {
            const lx = scale(l, 0, 0.5, 0, MAX_BG_LIGHTNESS);
            if (isNeutral) {
                const hx = pole.h;
                const sx = pole.s;
                return {h: hx, s: sx, l: lx, a};
            }
            return {h, s, l: lx, a};
        }
        let lx = scale(l, 0.5, 1, MAX_BG_LIGHTNESS, pole.l);
        if (isNeutral) {
            const hx = pole.h;
            const sx = pole.s;
            return {h: hx, s: sx, l: lx, a};
        }
        let hx = h;
        const isYellow = h > 60 && h < 180;
        if (isYellow) {
            const isCloserToGreen = h > 120;
            if (isCloserToGreen) {
                hx = scale(h, 120, 180, 135, 180);
            } else {
                hx = scale(h, 60, 120, 60, 105);
            }
        }
        if (hx > 40 && hx < 80) {
            lx *= 0.75;
        }
        return {h: hx, s, l: lx, a};
    }
    function modifyBackgroundColor(rgb, theme) {
        if (theme.mode === 0) {
            return modifyLightSchemeColor(rgb, theme);
        }
        const pole = getBgPole(theme);
        return modifyColorWithCache(
            rgb,
            {...theme, mode: 0},
            modifyBgHSL,
            pole
        );
    }
    const MIN_FG_LIGHTNESS = 0.55;
    function modifyBlueFgHue(hue) {
        return scale(hue, 205, 245, 205, 220);
    }
    function modifyFgHSL({h, s, l, a}, pole) {
        const isLight = l > 0.5;
        const isNeutral = l < 0.2 || s < 0.24;
        const isBlue = !isNeutral && h > 205 && h < 245;
        if (isLight) {
            const lx = scale(l, 0.5, 1, MIN_FG_LIGHTNESS, pole.l);
            if (isNeutral) {
                const hx = pole.h;
                const sx = pole.s;
                return {h: hx, s: sx, l: lx, a};
            }
            let hx = h;
            if (isBlue) {
                hx = modifyBlueFgHue(h);
            }
            return {h: hx, s, l: lx, a};
        }
        if (isNeutral) {
            const hx = pole.h;
            const sx = pole.s;
            const lx = scale(l, 0, 0.5, pole.l, MIN_FG_LIGHTNESS);
            return {h: hx, s: sx, l: lx, a};
        }
        let hx = h;
        let lx;
        if (isBlue) {
            hx = modifyBlueFgHue(h);
            lx = scale(l, 0, 0.5, pole.l, Math.min(1, MIN_FG_LIGHTNESS + 0.05));
        } else {
            lx = scale(l, 0, 0.5, pole.l, MIN_FG_LIGHTNESS);
        }
        return {h: hx, s, l: lx, a};
    }
    function modifyForegroundColor(rgb, theme) {
        if (theme.mode === 0) {
            return modifyLightSchemeColor(rgb, theme);
        }
        const pole = getFgPole(theme);
        return modifyColorWithCache(
            rgb,
            {...theme, mode: 0},
            modifyFgHSL,
            pole
        );
    }
    function modifyBorderHSL({h, s, l, a}, poleFg, poleBg) {
        const isDark = l < 0.5;
        const isNeutral = l < 0.2 || s < 0.24;
        let hx = h;
        let sx = s;
        if (isNeutral) {
            if (isDark) {
                hx = poleFg.h;
                sx = poleFg.s;
            } else {
                hx = poleBg.h;
                sx = poleBg.s;
            }
        }
        const lx = scale(l, 0, 1, 0.5, 0.2);
        return {h: hx, s: sx, l: lx, a};
    }
    function modifyBorderColor(rgb, theme) {
        if (theme.mode === 0) {
            return modifyLightSchemeColor(rgb, theme);
        }
        const poleFg = getFgPole(theme);
        const poleBg = getBgPole(theme);
        return modifyColorWithCache(
            rgb,
            {...theme, mode: 0},
            modifyBorderHSL,
            poleFg,
            poleBg
        );
    }

    const themeColorTypes = {
        accentcolor: "bg",
        button_background_active: "text",
        button_background_hover: "text",
        frame: "bg",
        icons: "text",
        icons_attention: "text",
        ntp_background: "bg",
        ntp_text: "text",
        popup: "bg",
        popup_border: "bg",
        popup_highlight: "bg",
        popup_highlight_text: "text",
        popup_text: "text",
        sidebar: "bg",
        sidebar_border: "border",
        sidebar_text: "text",
        tab_background_text: "text",
        tab_line: "bg",
        tab_loading: "bg",
        tab_selected: "bg",
        textcolor: "text",
        toolbar: "bg",
        toolbar_bottom_separator: "border",
        toolbar_field: "bg",
        toolbar_field_border: "border",
        toolbar_field_border_focus: "border",
        toolbar_field_focus: "bg",
        toolbar_field_separator: "border",
        toolbar_field_text: "text",
        toolbar_field_text_focus: "text",
        toolbar_text: "text",
        toolbar_top_separator: "border",
        toolbar_vertical_separator: "border"
    };
    const $colors = {
        accentcolor: "#111111",
        frame: "#111111",
        ntp_background: "white",
        ntp_text: "black",
        popup: "#cccccc",
        popup_text: "black",
        sidebar: "#cccccc",
        sidebar_border: "#333",
        sidebar_text: "black",
        tab_background_text: "white",
        tab_loading: "#23aeff",
        textcolor: "white",
        toolbar: "#707070",
        toolbar_field: "lightgray",
        toolbar_field_text: "black"
    };
    function setWindowTheme(filter) {
        const colors = Object.entries($colors).reduce((obj, [key, value]) => {
            const type = themeColorTypes[key];
            const modify = {
                bg: modifyBackgroundColor,
                text: modifyForegroundColor,
                border: modifyBorderColor
            }[type];
            const rgb = parseColorWithCache(value);
            const modified = modify(rgb, filter);
            obj[key] = modified;
            return obj;
        }, {});
        if (
            typeof browser !== "undefined" &&
            browser.theme &&
            browser.theme.update
        ) {
            browser.theme.update({colors});
        }
    }
    function resetWindowTheme() {
        if (
            typeof browser !== "undefined" &&
            browser.theme &&
            browser.theme.reset
        ) {
            browser.theme.reset();
        }
    }

    function createSVGFilterStylesheet(config, url, frameURL, fixes, index) {
        let filterValue;
        let reverseFilterValue;
        if (isFirefox) {
            filterValue = getEmbeddedSVGFilterValue(
                getSVGFilterMatrixValue(config)
            );
            reverseFilterValue = getEmbeddedSVGFilterValue(
                getSVGReverseFilterMatrixValue()
            );
        } else {
            filterValue = "url(#dark-reader-filter)";
            reverseFilterValue = "url(#dark-reader-reverse-filter)";
        }
        return cssFilterStyleSheetTemplate(
            filterValue,
            reverseFilterValue,
            config,
            url,
            frameURL,
            fixes,
            index
        );
    }
    function getEmbeddedSVGFilterValue(matrixValue) {
        const id = "dark-reader-filter";
        const svg = [
            '<svg xmlns="http://www.w3.org/2000/svg">',
            `<filter id="${id}" style="color-interpolation-filters: sRGB;">`,
            `<feColorMatrix type="matrix" values="${matrixValue}" />`,
            "</filter>",
            "</svg>"
        ].join("");
        return `url(data:image/svg+xml;base64,${btoa(svg)}#${id})`;
    }
    function toSVGMatrix(matrix) {
        return matrix
            .slice(0, 4)
            .map((m) => m.map((m) => m.toFixed(3)).join(" "))
            .join(" ");
    }
    function getSVGFilterMatrixValue(config) {
        return toSVGMatrix(createFilterMatrix(config));
    }
    function getSVGReverseFilterMatrixValue() {
        return toSVGMatrix(Matrix.invertNHue());
    }

    let query = null;
    const onChange = ({matches}) =>
        listeners.forEach((listener) => listener(matches));
    const listeners = new Set();
    function runColorSchemeChangeDetector(callback) {
        listeners.add(callback);
        if (query) {
            return;
        }
        query = matchMedia("(prefers-color-scheme: dark)");
        if (isMatchMediaChangeEventListenerSupported) {
            query.addEventListener("change", onChange);
        } else {
            query.addListener(onChange);
        }
    }
    const isSystemDarkModeEnabled = () =>
        (query || matchMedia("(prefers-color-scheme: dark)")).matches;

    var ContentScriptManagerState;
    (function (ContentScriptManagerState) {
        ContentScriptManagerState[(ContentScriptManagerState["UNKNOWN"] = 0)] =
            "UNKNOWN";
        ContentScriptManagerState[
            (ContentScriptManagerState["REGISTERING"] = 1)
        ] = "REGISTERING";
        ContentScriptManagerState[
            (ContentScriptManagerState["REGISTERED"] = 2)
        ] = "REGISTERED";
        ContentScriptManagerState[
            (ContentScriptManagerState["NOTREGISTERED"] = 3)
        ] = "NOTREGISTERED";
    })(ContentScriptManagerState || (ContentScriptManagerState = {}));

    var _a;
    class Extension {
        static init() {
            new Newsmaker();
            DevTools.init(async () => this.onSettingsChanged());
            Messenger.init(this.getMessengerAdapter());
            TabManager.init({
                getConnectionMessage: async ({url, frameURL}) =>
                    this.getConnectionMessage(url, frameURL),
                getTabMessage: this.getTabMessage,
                onColorSchemeChange: this.onColorSchemeChange
            });
            this.startBarrier = new PromiseBarrier();
            this.stateManager = new StateManager(
                Extension.LOCAL_STORAGE_KEY,
                this,
                {
                    autoState: "",
                    wasEnabledOnLastCheck: null,
                    registeredContextMenus: null
                },
                logWarn
            );
            chrome.alarms.onAlarm.addListener(this.alarmListener);
            if (chrome.commands) {
                chrome.commands.onCommand.addListener(async (command) =>
                    this.onCommand(command)
                );
            }
            if (chrome.permissions.onRemoved) {
                chrome.permissions.onRemoved.addListener((permissions) => {
                    var _b;
                    if (
                        !((_b =
                            permissions === null || permissions === void 0
                                ? void 0
                                : permissions.permissions) === null ||
                        _b === void 0
                            ? void 0
                            : _b.includes("contextMenus"))
                    ) {
                        this.registeredContextMenus = false;
                    }
                });
            }
        }
        static async MV3syncSystemColorStateManager(isDark) {
            {
                return;
            }
        }
        static isExtensionSwitchedOn() {
            return (
                this.autoState === "turn-on" ||
                this.autoState === "scheme-dark" ||
                this.autoState === "scheme-light" ||
                (this.autoState === "" && UserStorage.settings.enabled)
            );
        }
        static updateAutoState() {
            const {mode, behavior, enabled} = UserStorage.settings.automation;
            let isAutoDark;
            let nextCheck;
            switch (mode) {
                case AutomationMode.TIME: {
                    const {time} = UserStorage.settings;
                    isAutoDark = isInTimeIntervalLocal(
                        time.activation,
                        time.deactivation
                    );
                    nextCheck = nextTimeInterval(
                        time.activation,
                        time.deactivation
                    );
                    break;
                }
                case AutomationMode.SYSTEM:
                    isAutoDark =
                        this.wasLastColorSchemeDark === null
                            ? isSystemDarkModeEnabled()
                            : this.wasLastColorSchemeDark;
                    if (isFirefox) {
                        runColorSchemeChangeDetector(
                            Extension.onColorSchemeChange
                        );
                    }
                    break;
                case AutomationMode.LOCATION: {
                    const {latitude, longitude} = UserStorage.settings.location;
                    if (latitude != null && longitude != null) {
                        isAutoDark = isNightAtLocation(latitude, longitude);
                        nextCheck = nextTimeChangeAtLocation(
                            latitude,
                            longitude
                        );
                    }
                    break;
                }
                case AutomationMode.NONE:
                    break;
            }
            let state = "";
            if (enabled) {
                if (behavior === "OnOff") {
                    state = isAutoDark ? "turn-on" : "turn-off";
                } else if (behavior === "Scheme") {
                    state = isAutoDark ? "scheme-dark" : "scheme-light";
                }
            }
            this.autoState = state;
            if (nextCheck) {
                if (nextCheck < Date.now()) {
                    logWarn(
                        `Alarm is set in the past: ${nextCheck}. The time is: ${new Date()}. ISO: ${new Date().toISOString()}`
                    );
                } else {
                    chrome.alarms.create(Extension.ALARM_NAME, {
                        when: nextCheck
                    });
                }
            }
        }
        static async start() {
            await Promise.all([
                ConfigManager.load({local: true}),
                this.MV3syncSystemColorStateManager(null),
                UserStorage.loadSettings()
            ]);
            if (
                UserStorage.settings.enableContextMenus &&
                !this.registeredContextMenus
            ) {
                chrome.permissions.contains(
                    {permissions: ["contextMenus"]},
                    (permitted) => {
                        if (permitted) {
                            this.registerContextMenus();
                        }
                    }
                );
            }
            if (UserStorage.settings.syncSitesFixes) {
                await ConfigManager.load({local: false});
            }
            this.updateAutoState();
            this.onAppToggle();
            logInfo("loaded", UserStorage.settings);
            {
                TabManager.updateContentScript({
                    runOnProtectedPages:
                        UserStorage.settings.enableForProtectedPages
                });
            }
            UserStorage.settings.fetchNews && Newsmaker.subscribe();
            this.startBarrier.resolve();
        }
        static getMessengerAdapter() {
            return {
                collect: async () => {
                    return await this.collectData();
                },
                changeSettings: (settings) => this.changeSettings(settings),
                setTheme: (theme) => this.setTheme(theme),
                setShortcut: ({command, shortcut}) =>
                    this.setShortcut(command, shortcut),
                toggleActiveTab: async () => this.toggleActiveTab(),
                markNewsAsRead: async (ids) =>
                    await Newsmaker.markAsRead(...ids),
                markNewsAsDisplayed: async (ids) =>
                    await Newsmaker.markAsDisplayed(...ids),
                loadConfig: async (options) =>
                    await ConfigManager.load(options),
                applyDevDynamicThemeFixes: (text) =>
                    DevTools.applyDynamicThemeFixes(text),
                resetDevDynamicThemeFixes: () =>
                    DevTools.resetDynamicThemeFixes(),
                applyDevInversionFixes: (text) =>
                    DevTools.applyInversionFixes(text),
                resetDevInversionFixes: () => DevTools.resetInversionFixes(),
                applyDevStaticThemes: (text) =>
                    DevTools.applyStaticThemes(text),
                resetDevStaticThemes: () => DevTools.resetStaticThemes()
            };
        }
        static registerContextMenus() {
            chrome.contextMenus.onClicked.addListener(
                async ({menuItemId, frameUrl, pageUrl}) =>
                    this.onCommand(menuItemId, frameUrl || pageUrl)
            );
            chrome.contextMenus.removeAll(() => {
                this.registeredContextMenus = false;
                chrome.contextMenus.create(
                    {
                        id: "DarkReader-top",
                        title: "Dark Reader"
                    },
                    () => {
                        if (chrome.runtime.lastError) {
                            return;
                        }
                        const msgToggle =
                            chrome.i18n.getMessage("toggle_extension");
                        const msgAddSite = chrome.i18n.getMessage(
                            "toggle_current_site"
                        );
                        const msgSwitchEngine = chrome.i18n.getMessage(
                            "theme_generation_mode"
                        );
                        chrome.contextMenus.create({
                            id: "toggle",
                            parentId: "DarkReader-top",
                            title: msgToggle || "Toggle everywhere"
                        });
                        chrome.contextMenus.create({
                            id: "addSite",
                            parentId: "DarkReader-top",
                            title: msgAddSite || "Toggle for current site"
                        });
                        chrome.contextMenus.create({
                            id: "switchEngine",
                            parentId: "DarkReader-top",
                            title: msgSwitchEngine || "Switch engine"
                        });
                        this.registeredContextMenus = true;
                    }
                );
            });
        }
        static async getShortcuts() {
            const commands = await getCommands();
            return commands.reduce(
                (map, cmd) => Object.assign(map, {[cmd.name]: cmd.shortcut}),
                {}
            );
        }
        static setShortcut(command, shortcut) {
            setShortcut(command, shortcut);
        }
        static async collectData() {
            await this.loadData();
            const [
                news,
                shortcuts,
                dynamicFixesText,
                filterFixesText,
                staticThemesText,
                activeTab
            ] = await Promise.all([
                Newsmaker.getLatest(),
                this.getShortcuts(),
                DevTools.getDynamicThemeFixesText(),
                DevTools.getInversionFixesText(),
                DevTools.getStaticThemesText(),
                this.getActiveTabInfo()
            ]);
            return {
                isEnabled: this.isExtensionSwitchedOn(),
                isReady: true,
                settings: UserStorage.settings,
                news,
                shortcuts,
                colorScheme: ConfigManager.COLOR_SCHEMES_RAW,
                forcedScheme:
                    this.autoState === "scheme-dark"
                        ? "dark"
                        : this.autoState === "scheme-light"
                        ? "light"
                        : null,
                devtools: {
                    dynamicFixesText,
                    filterFixesText,
                    staticThemesText
                },
                activeTab
            };
        }
        static async getActiveTabInfo() {
            await this.loadData();
            const url = await TabManager.getActiveTabURL();
            const info = this.getURLInfo(url);
            info.isInjected = await TabManager.canAccessActiveTab();
            if (UserStorage.settings.detectDarkTheme) {
                info.isDarkThemeDetected =
                    await TabManager.isActiveTabDarkThemeDetected();
            }
            return info;
        }
        static async getConnectionMessage(url, frameURL) {
            await this.loadData();
            return this.getTabMessage(url, frameURL);
        }
        static async loadData() {
            const promises = [this.stateManager.loadState()];
            if (!UserStorage.settings) {
                promises.push(UserStorage.loadSettings());
            }
            await Promise.all(promises);
        }
        static changeSettings($settings, onlyUpdateActiveTab = false) {
            const prev = {...UserStorage.settings};
            UserStorage.set($settings);
            if (
                prev.enabled !== UserStorage.settings.enabled ||
                prev.automation.enabled !==
                    UserStorage.settings.automation.enabled ||
                prev.automation.mode !== UserStorage.settings.automation.mode ||
                prev.automation.behavior !==
                    UserStorage.settings.automation.behavior ||
                prev.time.activation !== UserStorage.settings.time.activation ||
                prev.time.deactivation !==
                    UserStorage.settings.time.deactivation ||
                prev.location.latitude !==
                    UserStorage.settings.location.latitude ||
                prev.location.longitude !==
                    UserStorage.settings.location.longitude
            ) {
                this.updateAutoState();
                this.onAppToggle();
            }
            if (prev.syncSettings !== UserStorage.settings.syncSettings) {
                UserStorage.saveSyncSetting(UserStorage.settings.syncSettings);
            }
            if (
                this.isExtensionSwitchedOn() &&
                $settings.changeBrowserTheme != null &&
                prev.changeBrowserTheme !== $settings.changeBrowserTheme
            ) {
                if ($settings.changeBrowserTheme) {
                    setWindowTheme(UserStorage.settings.theme);
                } else {
                    resetWindowTheme();
                }
            }
            if (prev.fetchNews !== UserStorage.settings.fetchNews) {
                UserStorage.settings.fetchNews
                    ? Newsmaker.subscribe()
                    : Newsmaker.unSubscribe();
            }
            if (
                prev.enableContextMenus !==
                UserStorage.settings.enableContextMenus
            ) {
                if (UserStorage.settings.enableContextMenus) {
                    this.registerContextMenus();
                } else {
                    chrome.contextMenus.removeAll();
                }
            }
            this.onSettingsChanged(onlyUpdateActiveTab);
        }
        static setTheme($theme) {
            UserStorage.set({
                theme: {...UserStorage.settings.theme, ...$theme}
            });
            if (
                this.isExtensionSwitchedOn() &&
                UserStorage.settings.changeBrowserTheme
            ) {
                setWindowTheme(UserStorage.settings.theme);
            }
            this.onSettingsChanged();
        }
        static async reportChanges() {
            const info = await this.collectData();
            Messenger.reportChanges(info);
        }
        static async toggleActiveTab() {
            const settings = UserStorage.settings;
            const tab = await this.getActiveTabInfo();
            const {url} = tab;
            const isInDarkList = isURLInList(url, ConfigManager.DARK_SITES);
            const host = getURLHostOrProtocol(url);
            function getToggledList(sourceList) {
                const list = sourceList.slice();
                const index = list.indexOf(host);
                if (index < 0) {
                    list.push(host);
                } else {
                    list.splice(index, 1);
                }
                return list;
            }
            const darkThemeDetected =
                !settings.applyToListedOnly &&
                settings.detectDarkTheme &&
                tab.isDarkThemeDetected;
            if (
                isInDarkList ||
                darkThemeDetected ||
                settings.siteListEnabled.includes(host)
            ) {
                const toggledList = getToggledList(settings.siteListEnabled);
                this.changeSettings({siteListEnabled: toggledList}, true);
                return;
            }
            const toggledList = getToggledList(settings.siteList);
            this.changeSettings({siteList: toggledList}, true);
        }
        static onAppToggle() {
            if (this.isExtensionSwitchedOn()) {
                IconManager.setActive();
            } else {
                IconManager.setInactive();
            }
            if (UserStorage.settings.changeBrowserTheme) {
                if (
                    this.isExtensionSwitchedOn() &&
                    this.autoState !== "scheme-light"
                ) {
                    setWindowTheme(UserStorage.settings.theme);
                } else {
                    resetWindowTheme();
                }
            }
        }
        static async onSettingsChanged(onlyUpdateActiveTab = false) {
            await this.loadData();
            this.wasEnabledOnLastCheck = this.isExtensionSwitchedOn();
            TabManager.sendMessage(onlyUpdateActiveTab);
            this.saveUserSettings();
            this.reportChanges();
            this.stateManager.saveState();
        }
        static getURLInfo(url) {
            const {DARK_SITES} = ConfigManager;
            const isInDarkList = isURLInList(url, DARK_SITES);
            const isProtected = !canInjectScript(url);
            return {
                url,
                isInDarkList,
                isProtected,
                isInjected: null,
                isDarkThemeDetected: null
            };
        }
        static async saveUserSettings() {
            await UserStorage.saveSettings();
            logInfo("saved", UserStorage.settings);
        }
    }
    _a = Extension;
    Extension.autoState = "";
    Extension.wasEnabledOnLastCheck = null;
    Extension.registeredContextMenus = null;
    Extension.wasLastColorSchemeDark = null;
    Extension.startBarrier = null;
    Extension.stateManager = null;
    Extension.ALARM_NAME = "auto-time-alarm";
    Extension.LOCAL_STORAGE_KEY = "Extension-state";
    Extension.SYSTEM_COLOR_LOCAL_STORAGE_KEY = "system-color-state";
    Extension.alarmListener = (alarm) => {
        if (alarm.name === Extension.ALARM_NAME) {
            _a.loadData().then(() => _a.handleAutomationCheck());
        }
    };
    Extension.onCommandInternal = async (command, frameURL) => {
        if (_a.startBarrier.isPending()) {
            await _a.startBarrier.entry();
        }
        _a.stateManager.loadState();
        switch (command) {
            case "toggle":
                _a.changeSettings({
                    enabled: !_a.isExtensionSwitchedOn(),
                    automation: {
                        ...UserStorage.settings.automation,
                        ...{enable: false}
                    }
                });
                break;
            case "addSite": {
                const url = frameURL || (await TabManager.getActiveTabURL());
                if (isPDF(url)) {
                    _a.changeSettings({
                        enableForPDF: !UserStorage.settings.enableForPDF
                    });
                } else {
                    _a.toggleActiveTab();
                }
                break;
            }
            case "switchEngine": {
                const engines = Object.values(ThemeEngine);
                const index = engines.indexOf(
                    UserStorage.settings.theme.engine
                );
                const next = engines[(index + 1) % engines.length];
                _a.setTheme({engine: next});
                break;
            }
        }
    };
    Extension.onCommand = debounce(75, _a.onCommandInternal);
    Extension.onColorSchemeChange = async (isDark) => {
        if (_a.wasLastColorSchemeDark === isDark) {
            return;
        }
        _a.wasLastColorSchemeDark = isDark;
        _a.MV3syncSystemColorStateManager(isDark);
        await _a.loadData();
        if (UserStorage.settings.automation.mode !== AutomationMode.SYSTEM) {
            return;
        }
        _a.handleAutomationCheck();
    };
    Extension.handleAutomationCheck = () => {
        _a.updateAutoState();
        const isSwitchedOn = _a.isExtensionSwitchedOn();
        if (
            _a.wasEnabledOnLastCheck === null ||
            _a.wasEnabledOnLastCheck !== isSwitchedOn ||
            _a.autoState === "scheme-dark" ||
            _a.autoState === "scheme-light"
        ) {
            _a.wasEnabledOnLastCheck = isSwitchedOn;
            _a.onAppToggle();
            TabManager.sendMessage();
            _a.reportChanges();
            _a.stateManager.saveState();
        }
    };
    Extension.getTabMessage = (url, frameURL) => {
        const settings = UserStorage.settings;
        const urlInfo = _a.getURLInfo(url);
        if (
            _a.isExtensionSwitchedOn() &&
            isURLEnabled(url, settings, urlInfo)
        ) {
            const custom = settings.customThemes.find(({url: urlList}) =>
                isURLInList(url, urlList)
            );
            const preset = custom
                ? null
                : settings.presets.find(({urls}) => isURLInList(url, urls));
            let theme = custom
                ? custom.theme
                : preset
                ? preset.theme
                : settings.theme;
            if (
                _a.autoState === "scheme-dark" ||
                _a.autoState === "scheme-light"
            ) {
                const mode = _a.autoState === "scheme-dark" ? 1 : 0;
                theme = {...theme, mode};
            }
            const isIFrame = frameURL != null;
            const detectDarkTheme =
                !isIFrame &&
                settings.detectDarkTheme &&
                !isURLInList(url, settings.siteListEnabled) &&
                !isPDF(url);
            logInfo(`Custom theme ${
                custom ? "was found" : "was not found"
            }, Preset theme ${preset ? "was found" : "was not found"}
            The theme(${
                custom ? "custom" : preset ? "preset" : "global"
            } settings) used is: ${JSON.stringify(theme)}`);
            switch (theme.engine) {
                case ThemeEngine.cssFilter: {
                    return {
                        type: MessageType.BG_ADD_CSS_FILTER,
                        data: {
                            css: createCSSFilterStyleSheet(
                                theme,
                                url,
                                frameURL,
                                ConfigManager.INVERSION_FIXES_RAW,
                                ConfigManager.INVERSION_FIXES_INDEX
                            ),
                            detectDarkTheme
                        }
                    };
                }
                case ThemeEngine.svgFilter: {
                    if (isFirefox) {
                        return {
                            type: MessageType.BG_ADD_CSS_FILTER,
                            data: {
                                css: createSVGFilterStylesheet(
                                    theme,
                                    url,
                                    frameURL,
                                    ConfigManager.INVERSION_FIXES_RAW,
                                    ConfigManager.INVERSION_FIXES_INDEX
                                ),
                                detectDarkTheme
                            }
                        };
                    }
                    return {
                        type: MessageType.BG_ADD_SVG_FILTER,
                        data: {
                            css: createSVGFilterStylesheet(
                                theme,
                                url,
                                frameURL,
                                ConfigManager.INVERSION_FIXES_RAW,
                                ConfigManager.INVERSION_FIXES_INDEX
                            ),
                            svgMatrix: getSVGFilterMatrixValue(theme),
                            svgReverseMatrix: getSVGReverseFilterMatrixValue(),
                            detectDarkTheme
                        }
                    };
                }
                case ThemeEngine.staticTheme: {
                    return {
                        type: MessageType.BG_ADD_STATIC_THEME,
                        data: {
                            css:
                                theme.stylesheet && theme.stylesheet.trim()
                                    ? theme.stylesheet
                                    : createStaticStylesheet(
                                          theme,
                                          url,
                                          frameURL,
                                          ConfigManager.STATIC_THEMES_RAW,
                                          ConfigManager.STATIC_THEMES_INDEX
                                      ),
                            detectDarkTheme: settings.detectDarkTheme
                        }
                    };
                }
                case ThemeEngine.dynamicTheme: {
                    const fixes = getDynamicThemeFixesFor(
                        url,
                        frameURL,
                        ConfigManager.DYNAMIC_THEME_FIXES_RAW,
                        ConfigManager.DYNAMIC_THEME_FIXES_INDEX,
                        UserStorage.settings.enableForPDF
                    );
                    return {
                        type: MessageType.BG_ADD_DYNAMIC_THEME,
                        data: {
                            theme,
                            fixes,
                            isIFrame,
                            detectDarkTheme
                        }
                    };
                }
                default:
                    throw new Error(`Unknown engine ${theme.engine}`);
            }
        }
        return {
            type: MessageType.BG_CLEAN_UP
        };
    };

    function makeChromiumHappy() {
        chrome.runtime.onMessage.addListener(
            (message, sender, sendResponse) => {
                if (
                    ![
                        MessageType.UI_GET_DATA,
                        MessageType.UI_APPLY_DEV_DYNAMIC_THEME_FIXES,
                        MessageType.UI_APPLY_DEV_INVERSION_FIXES,
                        MessageType.UI_APPLY_DEV_STATIC_THEMES
                    ].includes(message.type) &&
                    (message.type !== MessageType.CS_FRAME_CONNECT ||
                        !isPanel(sender))
                ) {
                    sendResponse({type: "¯\\_(ツ)_/¯"});
                }
            }
        );
    }

    Extension.init();
    Extension.start();
    const welcome = `  /''''\\
 (0)==(0)
/__||||__\\
Welcome to Dark Reader!`;
    console.log(welcome);
    {
        chrome.runtime.onInstalled.addListener(({reason}) => {
            if (reason === "install") {
                chrome.tabs.create({url: getHelpURL()});
            }
        });
        chrome.runtime.setUninstallURL(UNINSTALL_URL);
    }
    makeChromiumHappy();
})();
