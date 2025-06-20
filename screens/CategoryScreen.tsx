import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  Image,
  ImageBackground,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import WallpaperItem from '../components/WallpaperItem';
import { fetchWallpapersByCategory, getPexelsCredit } from '../services/api';

const { width, height } = Dimensions.get('window');

const CategoryScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Modified animation interpolations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 0], // Change to 0 instead of 60 to completely collapse
    extrapolate: 'clamp'
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp'
  });
  
  const titleScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp'
  });

  // Content loading function
  const loadCategoryWallpapers = useCallback(async (currentPage = 1, append = false) => {
    if (currentPage === 1) {
      if (!append) setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetchWallpapersByCategory(category.id, currentPage);
      
      if (response) {
        const newWallpapers = response.wallpapers || [];
        setTotalResults(response.totalResults || 0);
        
        if (append) {
          setWallpapers(prev => [...prev, ...newWallpapers]);
        } else {
          setWallpapers(newWallpapers);
        }
        
        setHasMore(!!response.nextPage);
        
        if (currentPage === 1 && !append) {
          // Scroll to the top of the list
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          }
        }
      }
    } catch (error) {
      console.error('Error loading category wallpapers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [category.id]);

  useEffect(() => {
    loadCategoryWallpapers();
  }, [loadCategoryWallpapers]);

  const handleWallpaperPress = (wallpaper) => {
    navigation.navigate('WallpaperDetail', { wallpaper });
  };
  
  // Refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadCategoryWallpapers(1, false);
  };
  
  // Load more
  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadCategoryWallpapers(nextPage, true);
    }
  };
  
  // FlatList reference
  const flatListRef = useRef(null);

  const renderWallpaperItem = ({ item }) => (
    <WallpaperItem
      imageUrl={item.imageUrl}
      onPress={() => handleWallpaperPress(item)}
    />
  );
  
  // Footer content
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  };
  
  // Pexels credit info
  const pexelsCredit = getPexelsCredit();

  // Calculate dynamic margin based on header state
  const contentMarginTop = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 0], // Adjust this to match header collapse
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Category title background */}
      <Animated.View 
        style={[
          styles.headerContainer, 
          { 
            height: headerHeight,
            opacity: headerOpacity
          }
        ]}
      >
        <ImageBackground
          source={{ uri: category.imageUrl }}
          style={styles.headerImage}
          imageStyle={styles.headerImageStyle}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
            style={styles.headerGradient}
          >
            <SafeAreaView style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              
              <Animated.View 
                style={[
                  styles.titleContainer, 
                  { 
                    opacity: headerOpacity,
                    transform: [{ scale: titleScale }]
                  }
                ]}
              >
                <BlurView intensity={50} tint="dark" style={styles.titleBlur}>
                  <Text style={styles.headerTitle}>{category.name || category.title}</Text>
                  {category.description && (
                    <Text style={styles.headerDescription}>{category.description}</Text>
                  )}
                </BlurView>
              </Animated.View>
            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>
      
      {/* Wallpapers list */}
      {loading && !refreshing ? (
        <Animated.View style={[styles.loaderContainer, { marginTop: contentMarginTop }]}>
          <ActivityIndicator size="large" color="#3498db" />
        </Animated.View>
      ) : (
        <Animated.FlatList
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
                  No wallpapers found in this category.
                </Text>
              </View>
            ) : null
          }
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          style={{ paddingTop: 0 }} // Remove fixed padding
        />
      )}
      
      {/* Small header (visible after scrolling) */}
      <Animated.View 
        style={[
          styles.smallHeaderContainer, 
          { 
            opacity: scrollY.interpolate({
              inputRange: [150, 200],
              outputRange: [0, 1],
              extrapolate: 'clamp'
            })
          }
        ]}
      >
        <BlurView intensity={80} tint="dark" style={styles.smallHeaderBlur}>
          <SafeAreaView style={styles.smallHeaderContent}>
            <TouchableOpacity 
              style={styles.smallBackButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.smallHeaderTitle}>{category.name || category.title}</Text>
            <View style={{ width: 22 }} />
          </SafeAreaView>
        </BlurView>
      </Animated.View>
      
      {/* Pexels credit */}
      <View style={styles.creditContainer}>
        <TouchableOpacity 
          style={styles.creditButton}
          onPress={() => {
            // Redirect to Pexels can be added here
          }}
        >
          <Text style={styles.creditText}>Photos by</Text>
          <Image 
            source={{ uri: pexelsCredit.logo.dark }} 
            style={styles.creditLogo} 
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerImageStyle: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  titleContainer: {
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  titleBlur: {
    padding: 16,
    borderRadius: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  smallHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  smallHeaderBlur: {
    width: '100%',
  },
  smallHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  smallBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallHeaderTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallpapersList: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 70, // Space for Pexels credit
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

export default CategoryScreen;