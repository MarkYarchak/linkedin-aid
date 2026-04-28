export type OnXhrLoad<T> = (data: T, url: string) => void;

interface XhrHandler {
  urlIncludes: string;
  onLoad: OnXhrLoad<any>;
}

const handlers: XhrHandler[] = [];
let isPatched = false;

function patchXhr() {
  if (isPatched) return;
  isPatched = true;

  console.log('[LI] MAIN injection via scripting');

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    async: boolean = true,
    username?: string | null,
    password?: string | null,
  ) {
    (this as any)._url = url.toString();
    return originalOpen.apply(this, [method, url, async || false, username, password]);
  };

  XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
    this.addEventListener('load', function () {
      try {
        const url: string = (this as any)._url || '';
        if (!url.includes('/sales-api/')) return;

        const contentType =
          this.getResponseHeader('content-type') || '';
        if (!contentType.includes('application/json')) return;

        console.log('[LI] XHR response', this.response);
        handlers.forEach((handler) => {
          if (url.includes(handler.urlIncludes)) {
            (this.response as Blob).text().then((rawData) => {
              const data = JSON.parse(rawData);
              handler.onLoad(data, url);
            });
          }
        });
      } catch (e) {
        console.error('[LI] Failed to parse XHR response', e);
      }
    });

    return originalSend.apply(this, [body]);
  };
}

export function handleXhr<T = any>(urlIncludes: string, onLoad: OnXhrLoad<T>) {
  patchXhr();
  handlers.push({ urlIncludes, onLoad });
}
