import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StorageService } from '@/services/storage';

export default function AccessTokenScreen() {
  const colorScheme = useColorScheme();
  const [accessToken, setAccessToken] = useState('');
  const [contactIds, setContactIds] = useState('');
  const [merchantId, setMerchantId] = useState('SEN42');
  const [brandId, setBrandId] = useState('110003eb-76c1-4b81-a96a-4cdf91bf70fb');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const [savedToken, savedMerchantId, savedBrandId, savedProviderIds] = await Promise.all([
        StorageService.getAccessToken(),
        StorageService.getMerchantId(),
        StorageService.getBrandId(),
        StorageService.getProviderIds(),
      ]);

      if (savedToken) setAccessToken(savedToken);
      if (savedMerchantId) setMerchantId(savedMerchantId);
      if (savedBrandId) setBrandId(savedBrandId);
      if (savedProviderIds) setContactIds(savedProviderIds.join(', '));
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  };

  const handlePasteToField = async (fieldSetter: (value: string) => void) => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        fieldSetter(text);
        Alert.alert('Success', 'Pasted from clipboard');
      } else {
        Alert.alert('Info', 'Clipboard is empty');
      }
    } catch (err) {
      console.error('Failed to read from clipboard:', err);
      Alert.alert('Error', 'Failed to read from clipboard');
    }
  };

  const handleSave = async () => {
    if (accessToken.trim()) {
      setIsLoading(true);
      try {
        await StorageService.saveAccessToken(accessToken.trim());
        
        // Save merchant ID if provided
        if (merchantId.trim()) {
          await StorageService.saveMerchantId(merchantId.trim());
        }
        
        // Save brand ID if provided
        if (brandId.trim()) {
          await StorageService.saveBrandId(brandId.trim());
        }
        
        // Save contact IDs (provider IDs) if provided
        if (contactIds.trim()) {
          await StorageService.saveProviderIds(
            contactIds.split(',').map(id => id.trim()).filter(Boolean)
          );
        }
        
        Alert.alert('Success', 'Settings saved successfully!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        Alert.alert('Error', 'Failed to save settings');
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert('Error', 'Please enter an access token');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="key.viewfinder"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Access Token</ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.description}>
        Enter your access token and configuration details to authenticate with the calendar service.
      </ThemedText>

      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <ThemedText style={styles.label}>Access Token *</ThemedText>
          <TouchableOpacity 
            onPress={() => handlePasteToField(setAccessToken)}
            style={styles.pasteTextButton}
          >
            <ThemedText style={styles.pasteTextButtonText}>Paste</ThemedText>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
              color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
              borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#D1D1D6',
            }
          ]}
          value={accessToken}
          onChangeText={setAccessToken}
          placeholder="Paste your access token here..."
          placeholderTextColor="#8E8E93"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <ThemedText style={styles.label}>Account ID</ThemedText>
          <TouchableOpacity 
            onPress={() => handlePasteToField(setMerchantId)}
            style={styles.pasteTextButton}
          >
            <ThemedText style={styles.pasteTextButtonText}>Paste</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.helperText}>Default: SEN42</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
              color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
              borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#D1D1D6',
            }
          ]}
          value={merchantId}
          onChangeText={setMerchantId}
          placeholder="SEN42"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <ThemedText style={styles.label}>Brand ID</ThemedText>
          <TouchableOpacity 
            onPress={() => handlePasteToField(setBrandId)}
            style={styles.pasteTextButton}
          >
            <ThemedText style={styles.pasteTextButtonText}>Paste</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.helperText}>Default: 110003eb-76c1-4b81-a96a-4cdf91bf70fb</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
              color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
              borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#D1D1D6',
            }
          ]}
          value={brandId}
          onChangeText={setBrandId}
          placeholder="110003eb-76c1-4b81-a96a-4cdf91bf70fb"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <ThemedText style={styles.label}>Contact ID</ThemedText>
          <TouchableOpacity 
            onPress={() => handlePasteToField(setContactIds)}
            style={styles.pasteTextButton}
          >
            <ThemedText style={styles.pasteTextButtonText}>Paste</ThemedText>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
              color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
              borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#D1D1D6',
            }
          ]}
          value={contactIds}
          onChangeText={setContactIds}
          placeholder="e.g., contact1"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.saveButton,
            { backgroundColor: '#34C759' },
            isLoading && styles.buttonDisabled
          ]}
          onPress={handleSave}
          disabled={isLoading}>
          <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  pasteTextButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pasteTextButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  helperText: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButton: {
    // backgroundColor set to green
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
