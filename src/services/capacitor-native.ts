import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

export class CapacitorNativeService {
  
  // Camera functionality
  async capturePhoto(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      
      return image.dataUrl || null;
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  }

  async selectFromGallery(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });
      
      return image.dataUrl || null;
    } catch (error) {
      console.error('Gallery error:', error);
      return null;
    }
  }

  // Geolocation functionality
  async getCurrentPosition(): Promise<{lat: number, lng: number} | null> {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      
      return {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude
      };
    } catch (error) {
      console.error('Geolocation error:', error);
      return null;
    }
  }

  async watchPosition(callback: (position: {lat: number, lng: number}) => void): Promise<string> {
    const watchId = await Geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 30000
    }, (position, err) => {
      if (err) {
        console.error('Watch position error:', err);
        return;
      }
      
      if (position) {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }
    });
    
    return watchId;
  }

  async clearWatch(watchId: string): Promise<void> {
    await Geolocation.clearWatch({ id: watchId });
  }

  // Device information
  async getDeviceInfo(): Promise<any> {
    try {
      const info = await Device.getInfo();
      return {
        platform: info.platform,
        model: info.model,
        operatingSystem: info.operatingSystem,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer,
        isVirtual: info.isVirtual,
        webViewVersion: info.webViewVersion
      };
    } catch (error) {
      console.error('Device info error:', error);
      return null;
    }
  }

  async getBatteryInfo(): Promise<any> {
    try {
      const info = await Device.getBatteryInfo();
      return {
        batteryLevel: info.batteryLevel,
        isCharging: info.isCharging
      };
    } catch (error) {
      console.error('Battery info error:', error);
      return { batteryLevel: -1, isCharging: false };
    }
  }

  // Network status
  async getNetworkStatus(): Promise<any> {
    try {
      const status = await Network.getStatus();
      return {
        connected: status.connected,
        connectionType: status.connectionType
      };
    } catch (error) {
      console.error('Network status error:', error);
      return { connected: false, connectionType: 'unknown' };
    }
  }

  // File system operations
  async saveToFile(data: string, fileName: string): Promise<boolean> {
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      return true;
    } catch (error) {
      console.error('File save error:', error);
      return false;
    }
  }

  async readFromFile(fileName: string): Promise<string | null> {
    try {
      const result = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      return result.data as string;
    } catch (error) {
      console.error('File read error:', error);
      return null;
    }
  }

  // App lifecycle
  setupAppStateListeners(callbacks: {
    onPause?: () => void;
    onResume?: () => void;
    onBackButton?: () => void;
  }): void {
    if (callbacks.onPause) {
      App.addListener('pause', callbacks.onPause);
    }
    
    if (callbacks.onResume) {
      App.addListener('resume', callbacks.onResume);
    }
    
    if (callbacks.onBackButton) {
      App.addListener('backButton', callbacks.onBackButton);
    }
  }

  // Status bar management
  async setStatusBarStyle(dark: boolean = true): Promise<void> {
    try {
      await StatusBar.setStyle({
        style: dark ? Style.Dark : Style.Light
      });
    } catch (error) {
      console.error('Status bar error:', error);
    }
  }

  async setStatusBarColor(color: string): Promise<void> {
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error('Status bar color error:', error);
    }
  }

  // Utility methods
  isNativeApp(): boolean {
    return (window as any).Capacitor?.isNativePlatform() || false;
  }

  isAndroid(): boolean {
    return (window as any).Capacitor?.getPlatform() === 'android';
  }

  isIOS(): boolean {
    return (window as any).Capacitor?.getPlatform() === 'ios';
  }
}

// Export singleton instance
export const capacitorNative = new CapacitorNativeService();