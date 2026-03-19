import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_FAVORITES_KEY = 'toktok_guest_favorites';
const GUEST_ALERTS_KEY = 'toktok_guest_alerts';
const GUEST_AD_SETTINGS_KEY = 'toktok_guest_ad_settings';

export class GuestService {
    /**
     * Toggles a property in the guest's local favorites.
     */
    static async toggleFavorite(propertyId: string): Promise<string[]> {
        const favorites = await this.getFavorites();
        const index = favorites.indexOf(propertyId);
        let newFavorites: string[];

        if (index > -1) {
            newFavorites = favorites.filter(id => id !== propertyId);
        } else {
            newFavorites = [...favorites, propertyId];
        }

        await AsyncStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(newFavorites));
        return newFavorites;
    }

    static async getFavorites(): Promise<string[]> {
        const data = await AsyncStorage.getItem(GUEST_FAVORITES_KEY);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Manage alerts for searches.
     */
    static async addAlert(searchQuery: string, filters: any): Promise<void> {
        const alerts = await this.getAlerts();
        const newAlert = {
            id: Math.random().toString(36).substring(7),
            query: searchQuery,
            filters,
            createdAt: Date.now(),
        };
        const newAlerts = [...alerts, newAlert];
        await AsyncStorage.setItem(GUEST_ALERTS_KEY, JSON.stringify(newAlerts));
    }

    static async getAlerts(): Promise<any[]> {
        const data = await AsyncStorage.getItem(GUEST_ALERTS_KEY);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Manage ad preferences.
     */
    static async setHideAds(hide: boolean): Promise<void> {
        await AsyncStorage.setItem(GUEST_AD_SETTINGS_KEY, hide ? 'true' : 'false');
    }

    static async getsHideAds(): Promise<boolean> {
        const data = await AsyncStorage.getItem(GUEST_AD_SETTINGS_KEY);
        return data === 'true';
    }
}
