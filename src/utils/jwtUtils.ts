/**
 * Decodes a JWT token and returns the payload
 * @param token The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export const decodeJwt = (token: string): any => {
  try {
    // Check if token exists and has the correct format
    if (!token || typeof token !== 'string') {
      console.error('Invalid token format:', token);
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token does not have three parts:', token);
      return null;
    }

    // JWT token is split into three parts: header, payload, and signature
    // We only need the payload (second part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Extracts the userId from a JWT token
 * @param token The JWT token
 * @returns The userID or null if not found
 */
export const getUserIDFromToken = (token: string): string => {
  if (!token) {
    console.error('Token is undefined or null');
    return "";
  }

  try {
    // Log the token to debug
    console.log(">>> Attempting to decode token:", token.substring(0, 20) + '...');
    
    const decoded = decodeJwt(token);
    console.log(">>> Decoded token:", decoded);
    
    // Try different possible field names for user ID
    const userId = decoded?.userID || decoded?.sub || decoded?.id || decoded?.userId;
    console.log(">>> Extracted userID:", userId);
    
    if (!userId) {
      console.error('Could not find userId in token payload');
    }
    
    return userId || "";
  } catch (error) {
    console.error('Error extracting userId from token:', error);
    return "";
  }
};

/**
 * Checks if a JWT token has expired
 * @param token The JWT token to check
 * @returns true if the token has expired, false if it's still valid
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }

  try {
    const decoded = decodeJwt(token);
    
    if (!decoded || !decoded.exp) {
      console.warn("Token doesn't contain expiration (exp) claim");
      return true;
    }
    
    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Add a small buffer (30 seconds) to account for clock skew
    return decoded.exp < (currentTime - 30);
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};