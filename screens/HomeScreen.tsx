import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import CategoryButton from '../components/CategoryButton';
import WallpaperItem from '../components/WallpaperItem';
import { fetchWallpapers } from '../services/api';

const CATEGORIES = [
  { id: 'categories', title: 'Categories' },
  { id: 'new', title: 'New' },
  { id: 'trending', title: 'Trending' },
  { id: 'popular', title: 'Popular' },
  { id: 'random', title: 'Random' },
];

const HomeScreen = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState('new');
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWallpapers(activeCategory);
  }, [activeCategory]);

  const loadWallpapers = async (category) => {
    setLoading(true);
    try {
      const data = await fetchWallpapers(category);
      setWallpapers(data);
    } catch (error) {
      console.error('Error loading wallpapers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryId) => {
    setActiveCategory(categoryId);
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
      <Header />
      
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((category) => (
            <CategoryButton
              key={category.id}
              title={category.title}
              isActive={activeCategory === category.id}
              onPress={() => handleCategoryPress(category.id)}
            />
          ))}
        </ScrollView>
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
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 8,
  },
  wallpapersList: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;