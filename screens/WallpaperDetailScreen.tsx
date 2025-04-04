import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground, 
  Dimensions, 
  Share,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const { width, height } = Dimensions.get('window');

const WallpaperDetailScreen = ({ route, navigation }) => {
  const { wallpaper } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // Check for permissions when the component mounts
  useEffect(() => {
    (async () => {
      // Pre-check permissions when component loads
      const { status } = await MediaLibrary.getPermissionsAsync();
      console.log("Initial permission status:", status);
      
      // If permission is already denied, prompt the user to change settings
      if (status === 'denied') {
        Alert.alert(
          "Permission Required",
          "Photo library access is required to save wallpapers. Please enable this permission in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
      }
      // On iOS, if permission status is 'undetermined', show the system dialog
      else if (Platform.OS === 'ios' && status === 'undetermined') {
        const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
        console.log("Updated permission status:", newStatus);
      }
    })();
  }, []);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Request permissions using the updated MediaLibrary API
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Please grant permission to save wallpapers to your gallery.",
          [
            { text: "OK", onPress: () => console.log("Permission denied") }
          ]
        );
        setDownloading(false);
        return;
      }

      // Create a file URI for downloading
      const fileUri = FileSystem.documentDirectory + `wallpaper-${Date.now()}.jpg`;
      
      // Download the image using Expo FileSystem
      const downloadResumable = FileSystem.createDownloadResumable(
        wallpaper.imageUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress * 100}%`);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Wallpapers", asset, false);
      
      Alert.alert(
        "Download Complete",
        "Wallpaper has been saved to your gallery in the 'Wallpapers' album."
      );
    } catch (error) {
      console.error('Error downloading wallpaper:', error);
      Alert.alert(
        "Download Failed",
        "There was an error downloading the wallpaper. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing wallpaper: ${wallpaper.title}`,
        url: wallpaper.imageUrl,
      });
    } catch (error) {
      console.log('Error sharing:', error.message);
    }
  };

  const handleApply = async () => {
    try {
      // Check permissions first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Please grant permission to save wallpapers to your gallery."
        );
        return;
      }
      
      Alert.alert(
        "Set as Wallpaper",
        "To set as wallpaper, please save the image first and then set it through your device settings.",
        [
          { text: "Save Image", onPress: handleDownload },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } catch (error) {
      console.error('Error in handleApply:', error);
      Alert.alert("Error", "There was an error processing your request.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent={true} />
      
      <ImageBackground
        source={{ uri: wallpaper.imageUrl }}
        style={styles.image}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#e74c3c" : "#FFF"} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{wallpaper.title}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={16} color="#e74c3c" />
                <Text style={styles.statText}>{wallpaper.likes}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="cloud-download" size={16} color="#3498db" />
                <Text style={styles.statText}>{wallpaper.downloads}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleShare}
            >
              <Ionicons name="share-social" size={22} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Ionicons name="hourglass-outline" size={22} color="#FFF" />
              ) : (
                <Ionicons name="download" size={22} color="#FFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={handleApply}
              disabled={downloading}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width,
    height,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 48,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  applyButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WallpaperDetailScreen;