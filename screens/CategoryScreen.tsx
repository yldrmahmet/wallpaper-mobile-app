import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import WallpaperItem from '../components/WallpaperItem';
import { fetchWallpapersByCategory } from '../services/api';

const CategoryScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryWallpapers();
  }, []);

  const loadCategoryWallpapers = async () => {
    try {
      const data = await fetchWallpapersByCategory(category.id);
      setWallpapers(data);
    } catch (error) {
      console.error('Error loading category wallpapers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWallpaperPress = (wallpaper) => {
    navigation.navigate('WallpaperDetail', { wallpaper });
  };

  const renderWallpaperItem = ({ item }) => (
    <WallpaperItem
      imageUrl={item.imageUrl}
      onPress={() => handleWallpaperPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <FlatList
          data={wallpapers}
          renderItem={renderWallpaperItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.wallpapersList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallpapersList: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 20,
  },
});

export default CategoryScreen;