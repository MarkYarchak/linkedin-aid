export function interceptXHR() {
  console.log('[LI] MAIN injection via scripting');

  const OriginalXHR = window.XMLHttpRequest;

  window.XMLHttpRequest = function () {
    const xhr = new OriginalXHR();

    let url: string | URL = '';

    const originalOpen = xhr.open;
    xhr.open = function (
      method: string,
      requestUrl: string | URL,
      async: boolean = true,
      username?: string,
      password?: string,
    ) {
      url = requestUrl;
      return originalOpen.apply(xhr, [method, requestUrl, async, username, password]);
    };

    const originalSend = xhr.send;
    xhr.send = function (body: Document | XMLHttpRequestBodyInit | null | undefined) {
      xhr.addEventListener('load', function () {
        try {
          if (!url.toString().includes('/sales-api/')) return;

          const contentType =
            xhr.getResponseHeader('content-type') || '';
          if (!contentType.includes('application/json')) return;

          (xhr.response as Blob).text().then(() => {
            console.log('[LI] XHR parsed');
          });
        } catch (e) {
          console.error('[LI] Failed to parse XHR response', e);
        }
      });

      return originalSend.apply(xhr, [body]);
    };

    return xhr;
  } as any;
}
