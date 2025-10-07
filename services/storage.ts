import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@calendar_access_token';
const PROVIDER_IDS_KEY = '@calendar_provider_ids';
const CALENDAR_IDS_KEY = '@calendar_calendar_ids';
const MERCHANT_ID_KEY = '@calendar_merchant_id';
const BRAND_ID_KEY = '@calendar_brand_id';

/**
 * Storage service for managing access token and configuration
 */
export const StorageService = {
  /**
   * Save access token to secure storage
   */
  async saveAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save access token:', error);
      throw new Error('Failed to save access token');
    }
  },

  /**
   * Get access token from storage
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  },

  /**
   * Remove access token from storage
   */
  async removeAccessToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove access token:', error);
      throw new Error('Failed to remove access token');
    }
  },

  /**
   * Check if access token exists
   */
  async hasAccessToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      return token !== null && token.length > 0;
    } catch (error) {
      console.error('Failed to check access token:', error);
      return false;
    }
  },

  /**
   * Save provider IDs to storage
   */
  async saveProviderIds(providerIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PROVIDER_IDS_KEY, JSON.stringify(providerIds));
    } catch (error) {
      console.error('Failed to save provider IDs:', error);
      throw new Error('Failed to save provider IDs');
    }
  },

  /**
   * Get provider IDs from storage
   */
  async getProviderIds(): Promise<string[] | null> {
    try {
      const ids = await AsyncStorage.getItem(PROVIDER_IDS_KEY);
      return ids ? JSON.parse(ids) : null;
    } catch (error) {
      console.error('Failed to get provider IDs:', error);
      return null;
    }
  },

  /**
   * Remove provider IDs from storage
   */
  async removeProviderIds(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROVIDER_IDS_KEY);
    } catch (error) {
      console.error('Failed to remove provider IDs:', error);
      throw new Error('Failed to remove provider IDs');
    }
  },

  /**
   * Save calendar IDs to storage
   */
  async saveCalendarIds(calendarIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CALENDAR_IDS_KEY, JSON.stringify(calendarIds));
    } catch (error) {
      console.error('Failed to save calendar IDs:', error);
      throw new Error('Failed to save calendar IDs');
    }
  },

  /**
   * Get calendar IDs from storage
   */
  async getCalendarIds(): Promise<string[] | null> {
    try {
      const ids = await AsyncStorage.getItem(CALENDAR_IDS_KEY);
      return ids ? JSON.parse(ids) : null;
    } catch (error) {
      console.error('Failed to get calendar IDs:', error);
      return null;
    }
  },

  /**
   * Remove calendar IDs from storage
   */
  async removeCalendarIds(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CALENDAR_IDS_KEY);
    } catch (error) {
      console.error('Failed to remove calendar IDs:', error);
      throw new Error('Failed to remove calendar IDs');
    }
  },

  /**
   * Save merchant ID to storage
   */
  async saveMerchantId(merchantId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(MERCHANT_ID_KEY, merchantId);
    } catch (error) {
      console.error('Failed to save merchant ID:', error);
      throw new Error('Failed to save merchant ID');
    }
  },

  /**
   * Get merchant ID from storage
   */
  async getMerchantId(): Promise<string | null> {
    try {
      const id = await AsyncStorage.getItem(MERCHANT_ID_KEY);
      return id;
    } catch (error) {
      console.error('Failed to get merchant ID:', error);
      return null;
    }
  },

  /**
   * Remove merchant ID from storage
   */
  async removeMerchantId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MERCHANT_ID_KEY);
    } catch (error) {
      console.error('Failed to remove merchant ID:', error);
      throw new Error('Failed to remove merchant ID');
    }
  },

  /**
   * Save brand ID to storage
   */
  async saveBrandId(brandId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(BRAND_ID_KEY, brandId);
    } catch (error) {
      console.error('Failed to save brand ID:', error);
      throw new Error('Failed to save brand ID');
    }
  },

  /**
   * Get brand ID from storage
   */
  async getBrandId(): Promise<string | null> {
    try {
      const id = await AsyncStorage.getItem(BRAND_ID_KEY);
      return id;
    } catch (error) {
      console.error('Failed to get brand ID:', error);
      return null;
    }
  },

  /**
   * Remove brand ID from storage
   */
  async removeBrandId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BRAND_ID_KEY);
    } catch (error) {
      console.error('Failed to remove brand ID:', error);
      throw new Error('Failed to remove brand ID');
    }
  },
};
