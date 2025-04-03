// api.ts
import {
  getCuratedPhotos,
  getNewPhotos,
  getTrendingPhotos,
  getRandomPhotos,
  searchPhotosByCategory,
  getPhotoById,
  Wallpaper
} from './pexelsApi';

import {
  getCategories,
  getCategoryById,
  Category
} from './categoriesService';

// Sayfalama için tipleme
export interface PaginatedResponse {
  [x: string]: any;
  wallpapers: Wallpaper[];
  totalResults: number;
  nextPage?: number;
}

// Duvar kağıtlarını getir (kategori bazlı)
export const fetchWallpapers = async (category: string, page: number = 1): Promise<PaginatedResponse> => {
  try {
    switch (category) {
      case 'popular':
        return await getCuratedPhotos(page);
      case 'new':
        return await getNewPhotos(page);
      case 'trending':
        return await getTrendingPhotos(page);
      case 'random':
        return await getRandomPhotos(page);
      case 'categories':
        // Kategori listesini al
        const categories = await getCategories();
        return {
          wallpapers: [],
          totalResults: 0,
          categories
        } as any; // Tip genişletildi
      default:
        return { wallpapers: [], totalResults: 0 };
    }
  } catch (error) {
    console.error(`Duvar kağıtları yüklenemedi (${category}):`, error);
    return { wallpapers: [], totalResults: 0 };
  }
};

// Kategorileri getir
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    return await getCategories();
  } catch (error) {
    console.error('Kategoriler yüklenemedi:', error);
    return [];
  }
};

// Kategori detayını getir
export const fetchCategoryById = async (categoryId: string): Promise<Category | null> => {
  try {
    return await getCategoryById(categoryId);
  } catch (error) {
    console.error(`Kategori detayı yüklenemedi (${categoryId}):`, error);
    return null;
  }
};

// Kategoriye göre duvar kağıtlarını getir
export const fetchWallpapersByCategory = async (categoryId: string, page: number = 1): Promise<PaginatedResponse> => {
  try {
    // Kategori detayını al
    const category = await getCategoryById(categoryId);
    
    if (category) {
      // Kategori sorgusu ile fotoğrafları ara
      return await searchPhotosByCategory(category.query, page);
    }
    
    return { wallpapers: [], totalResults: 0 };
  } catch (error) {
    console.error(`Kategori duvar kağıtları yüklenemedi (${categoryId}):`, error);
    return { wallpapers: [], totalResults: 0 };
  }
};

// Duvar kağıdı detaylarını getir
export const fetchWallpaperDetails = async (wallpaperId: string): Promise<Wallpaper | null> => {
  try {
    return await getPhotoById(wallpaperId);
  } catch (error) {
    console.error(`Duvar kağıdı detayları yüklenemedi (${wallpaperId}):`, error);
    return null;
  }
};

// Pexels kredi bilgisi
export const getPexelsCredit = () => {
  return {
    name: 'Pexels',
    url: 'https://www.pexels.com',
    logo: {
      dark: 'https://images.pexels.com/lib/api/pexels-white.png',
      light: 'https://images.pexels.com/lib/api/pexels.png'
    }
  };
};