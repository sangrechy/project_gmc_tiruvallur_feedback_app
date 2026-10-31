// Browser Cookie Management for Temporary Live Chat (24-hour TTL)

const COOKIE_NAME = 'gmc_temp_chat_session';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

export const cookieService = {
  /**
   * Set temporary chat session cookie (24h retention)
   */
  setChatCookie(sessionId) {
    if (typeof document === 'undefined') return;
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(sessionId)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict${isSecure ? '; Secure' : ''}`;
  },

  /**
   * Get active chat session ID from cookie
   */
  getChatCookie() {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const trimmed = c.trim();
      if (trimmed.startsWith(`${COOKIE_NAME}=`)) {
        return decodeURIComponent(trimmed.substring(COOKIE_NAME.length + 1));
      }
    }
    return null;
  },

  /**
   * Clear session cookie upon manual end-chat
   */
  clearChatCookie() {
    if (typeof document === 'undefined') return;
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict${isSecure ? '; Secure' : ''}`;
  }
};
