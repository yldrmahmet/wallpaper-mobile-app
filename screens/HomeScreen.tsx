// HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Dimensions,
  ImageBackground
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Header from '../components/Header';
import CategoryButton from '../components/CategoryButton';
import WallpaperItem from '../components/WallpaperItem';
import { fetchWallpapers, fetchCategories, getPexelsCredit } from '../services/api';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'categories', title: 'Kategoriler' },
  { id: 'new', title: 'Yeni' },
  { id: 'trending', title: 'Trend' },
  { id: 'popular', title: 'Popüler' },
  { id: 'random', title: 'Rastgele' },
];

const HomeScreen = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState('categories'); // Varsayılan olarak kategoriler sekmesi
  const [wallpapers, setWallpapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  
  // İçerik yükleme fonksiyonu
  const loadWallpapers = useCallback(async (category, currentPage = 1, append = false) => {
    if (loading || loadingMore) return;
    
    if (currentPage === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await fetchWallpapers(category, currentPage);
      
      if (response) {
        // Eğer kategoriler sekmesi ise kategorileri yükle
        if (category === 'categories') {
          if (response.categories) {
            setCategories(response.categories);
          } else {
            // Eğer kategoriler yoksa ayrı bir istek at
            const categoriesData = await fetchCategories();
            setCategories(categoriesData);
          }
          // Duvar kağıtlarını temizle
          setWallpapers([]);
        } else {
          // Diğer sekmelerde duvar kağıtlarını ayarla
          const newWallpapers = response.wallpapers || [];
          setTotalResults(response.totalResults || 0);
          
          if (append) {
            setWallpapers(prev => [...prev, ...newWallpapers]);
          } else {
            setWallpapers(newWallpapers);
          }
          
          setHasMore(!!response.nextPage);
        }
        
        if (currentPage === 1) {
          // Listenin başına kaydır
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          }
        }
      }
    } catch (error) {
      console.error('Duvar kağıtları yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [loading, loadingMore]);
  
  // İlk yükleme
  useEffect(() => {
    loadWallpapers(activeCategory);
  }, []);
  
  // Kategori değişikliği
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadWallpapers(activeCategory, 1, false);
  }, [activeCategory]);
  
  // Kategori değiştirme
  const handleCategoryPress = (categoryId) => {
    if (categoryId !== activeCategory) {
      setActiveCategory(categoryId);
    }
  };
  
  // Duvar kağıdına tıklama
  const handleWallpaperPress = (wallpaper) => {
    navigation.navigate('WallpaperDetail', { wallpaper });
  };
  
  // Kategoriye tıklama
  const handleCategoryItemPress = (category) => {
    navigation.navigate('Category', { category });
  };
  
  // Yenileme
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadWallpapers(activeCategory, 1, false);
  };
  
  // Daha fazla yükleme
  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading && activeCategory !== 'categories') {
      const nextPage = page + 1;
      setPage(nextPage);
      loadWallpapers(activeCategory, nextPage, true);
    }
  };
  
  // FlatList referansı
  const flatListRef = React.useRef(null);
  
  // Duvar kağıdı render
  const renderWallpaperItem = ({ item }) => (
    <WallpaperItem
      imageUrl={item.imageUrl}
      onPress={() => handleWallpaperPress(item)}
    />
  );
  
  // Kategori render
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryItemPress(item)}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.categoryImage}
        imageStyle={styles.categoryImageStyle}
      >
        <BlurView intensity={50} style={styles.categoryTitleContainer} tint="dark">
          <Text style={styles.categoryTitle}>{item.name}</Text>
          {item.description && (
            <Text style={styles.categoryDescription}>{item.description}</Text>
          )}
        </BlurView>
      </ImageBackground>
    </TouchableOpacity>
  );
  
  // Liste altı içeriği
  const renderFooter = () => {
    if (!loadingMore || activeCategory === 'categories') return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  };
  
  // İçerik render
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      );
    }
    
    if (activeCategory === 'categories') {
      // Kategoriler görünümü
      return (
        <FlatList
          ref={flatListRef}
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Kategoriler yüklenemedi. Yenilemek için aşağı çekin.
                </Text>
              </View>
            ) : null
          }
        />
      );
    } else {
      // Duvar kağıtları görünümü
      return (
        <FlatList
          ref={flatListRef}
          data={wallpapers}
          renderItem={renderWallpaperItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.wallpapersList}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Duvar kağıdı bulunamadı. Başka bir kategori deneyin.
                </Text>
              </View>
            ) : null
          }
        />
      );
    }
  };
  
  // Pexels kredi bilgisi
  const pexelsCredit = getPexelsCredit();
  
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
      
      {renderContent()}
      
      {/* Pexels kredisi */}
      <View style={styles.creditContainer}>
        <TouchableOpacity 
          style={styles.creditButton}
          onPress={() => {
            // Pexels'e yönlendirme eklenebilir
          }}
        >
          <Text style={styles.creditText}>Fotoğraflar</Text>
          <Image 
            source={{ uri: pexelsCredit.logo.dark }} 
            style={styles.creditLogo} 
            resizeMode="contain"
          />
          <Text style={styles.creditText}>tarafından sağlanmıştır</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 70, // Pexels kredisi için boşluk bırak
  },
  categoriesList: {
    paddingHorizontal: 8,
    paddingBottom: 70, // Pexels kredisi için boşluk bırak
  },
  categoryItem: {
    width: width / 2 - 16,
    height: 200,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e1e1e',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  categoryImageStyle: {
    borderRadius: 12,
  },
  categoryTitleContainer: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  emptyText: {
    color: '#777',
    fontSize: 16,
    textAlign: 'center',
  },
  creditContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
  },
  creditButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  creditText: {
    color: '#FFF',
    fontSize: 12,
    marginHorizontal: 4,
  },
  creditLogo: {
    width: 50,
    height: 20,
  },
});

export default HomeScreen;