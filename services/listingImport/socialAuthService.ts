import * as SecureStore from 'expo-secure-store';

const COOKIE_STORAGE_KEY = 'toktok_social_cookies';

export type SocialPlatform = 'instagram' | 'tiktok';

export interface SocialAuthSession {
    platform: SocialPlatform;
    cookies: string;
    lastUpdated: number;
    username?: string;
}

// Fallback cache if persistence fails
let inMemoryCache: Record<string, SocialAuthSession> = {};

export class SocialAuthService {
    /**
     * Saves cookies for a specific platform.
     */
    static async saveCookies(platform: SocialPlatform, cookieString: string, username?: string): Promise<void> {
        try {
            let sessions: Record<string, SocialAuthSession> = {};
            
            try {
                const existingRaw = await SecureStore.getItemAsync(COOKIE_STORAGE_KEY);
                sessions = existingRaw ? JSON.parse(existingRaw) : {};
            } catch (e) {
                console.warn('[SocialAuthService] SecureStore read failed, using memory:', e);
                sessions = inMemoryCache;
            }
            
            sessions[platform] = {
                platform,
                cookies: cookieString,
                lastUpdated: Date.now(),
                username
            };
            
            inMemoryCache = sessions;
            
            try {
                await SecureStore.setItemAsync(COOKIE_STORAGE_KEY, JSON.stringify(sessions));
                console.log(`[SocialAuthService] Saved to SecureStore: ${platform}`);
            } catch (e) {
                console.warn('[SocialAuthService] SecureStore write failed, session remains in memory.');
            }
        } catch (error) {
            console.error(`[SocialAuthService] Critical failure in saveCookies:`, error);
        }
    }

    /**
     * Retrieves cookies for a specific platform.
     */
    static async getCookies(platform: SocialPlatform): Promise<string | null> {
        try {
            let sessions = inMemoryCache;
            
            try {
                const existingRaw = await SecureStore.getItemAsync(COOKIE_STORAGE_KEY);
                if (existingRaw) {
                    sessions = JSON.parse(existingRaw);
                    inMemoryCache = sessions; // Sync memory
                }
            } catch (e) {
                console.warn('[SocialAuthService] SecureStore read failed for retrieval, using memory fallback.');
            }
            
            const session = sessions[platform];
            return session ? session.cookies : null;
        } catch (error) {
            console.error(`[SocialAuthService] Error retrieving cookies:`, error);
            return inMemoryCache[platform]?.cookies || null;
        }
    }

    /**
     * Clears cookies for a specific platform (Logout).
     */
    static async logout(platform: SocialPlatform): Promise<void> {
        try {
            delete inMemoryCache[platform];
            
            try {
                const existingRaw = await SecureStore.getItemAsync(COOKIE_STORAGE_KEY);
                if (existingRaw) {
                    const sessions = JSON.parse(existingRaw);
                    delete sessions[platform];
                    
                    if (Object.keys(sessions).length === 0) {
                        await SecureStore.deleteItemAsync(COOKIE_STORAGE_KEY);
                    } else {
                        await SecureStore.setItemAsync(COOKIE_STORAGE_KEY, JSON.stringify(sessions));
                    }
                }
            } catch (e) {
                console.warn('[SocialAuthService] SecureStore logout failed, memory cleared.');
            }
            console.log(`[SocialAuthService] Logged out from ${platform}`);
        } catch (error) {
            console.error(`[SocialAuthService] Error logging out:`, error);
        }
    }

    /**
     * Checks if a session exists for a platform.
     */
    static async hasSession(platform: SocialPlatform): Promise<boolean> {
        try {
            const cookies = await this.getCookies(platform);
            return !!cookies && cookies.length > 0;
        } catch {
            return !!inMemoryCache[platform];
        }
    }
}
