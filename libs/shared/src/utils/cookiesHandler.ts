const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();

    if (name) {
      cookies[name] = parts.join('=');
    }
  });

  return cookies;
};

export const getCookie = (cookieHeader: string | undefined, cookieName: string): string | undefined => {
  return parseCookies(cookieHeader)[cookieName];
};
