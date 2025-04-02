// services/pexelsApi.ts
import ENV from '../env';

// Pexels API için temel URL
const BASE_URL = 'https://api.pexels.com/v1';

// Yetkilendirme ile birlikte başlıklar
const headers = {
  Authorization: ENV.PEXELS_API_KEY,
  'Content-Type': 'application/json',
};

// Pexels API yanıtları için tipler
export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsPhotosResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page: string;
  prev_page?: string;
}

// Duvar kağıdı verilerimiz için dönüştürme
export interface Wallpaper {
  id: string;
  title: string;
  imageUrl: string;
  photographer: string;
  photographerUrl: string;
  originalUrl: string;
  category?: string;
  likes?: number;
  downloads?: number;
}

// Önbellek için tipler
interface CacheItem {
  data: Wallpaper[];
  timestamp: number;
  totalResults: number;
  nextPage?: string;
}

interface Cache {
  [key: string]: {
    [page: number]: CacheItem;
  };
}

// Önbellek verileri
const cache: Cache = {};

// Önbellek süresi (30 dakika - milisaniye)
const CACHE_DURATION = 30 * 60 * 1000;

// Önbelleğin geçerli olup olmadığını kontrol etme
const isCacheValid = (category: string, page: number): boolean => {
  const categoryCache = cache[category];
  if (!categoryCache || !categoryCache[page]) return false;
  
  const { timestamp } = categoryCache[page];
  return Date.now() - timestamp < CACHE_DURATION;
};

// Önbelleğe veri kaydetme
const saveToCache = (
  category: string, 
  page: number, 
  data: Wallpaper[], 
  totalResults: number,
  nextPage?: string
): void => {
  if (!cache[category]) {
    cache[category] = {};
  }
  
  cache[category][page] = {
    data,
    timestamp: Date.now(),
    totalResults,
    nextPage
  };
};

// Önbellekten veri alma
const getFromCache = (category: string, page: number): CacheItem | null => {
  if (isCacheValid(category, page)) {
    return cache[category][page];
  }
  return null;
};

// Pexels'ten fotoğrafları getirmek için yardımcı fonksiyon
const fetchFromPexels = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
    
    if (!response.ok) {
      throw new Error(`Pexels API hatası: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Pexels API çağrısı başarısız:', error);
    throw error;
  }
};

// Pexels fotoğrafını bizim duvar kağıdı formatımıza dönüştürme
const transformToWallpaper = (photo: PexelsPhoto, category?: string): Wallpaper => {
  return {
    id: `pexels-${photo.id}`,
    title: photo.alt || `Fotoğrafçı: ${photo.photographer}`,
    imageUrl: photo.src.portrait, // Duvar kağıdı için dikey format
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    originalUrl: photo.url,
    category,
    // Rastgele beğeni ve indirme sayıları (Pexels bunları sağlamıyor)
    likes: Math.floor(Math.random() * 10000),
    downloads: Math.floor(Math.random() * 50000),
  };
};

// POPULAR: Kürasyon yapılmış fotoğrafları getir
export const getCuratedPhotos = async (page = 1, perPage = 20): Promise<{
  wallpapers: Wallpaper[];
  totalResults: number;
  nextPage?: number;
}> => {
  const cacheKey = 'popular';
  
  // Önbellekten kontrol et
  const cachedData = getFromCache(cacheKey, page);
  if (cachedData) {
    return {
      wallpapers: cachedData.data,
      totalResults: cachedData.totalResults,
      nextPage: cachedData.nextPage ? page + 1 : undefined
    };
  }
  
  try {
    const data = await fetchFromPexels(`/curated?page=${page}&per_page=${perPage}`);
    
    const wallpapers = data.photos.map((photo: PexelsPhoto) => 
      transformToWallpaper(photo, 'popular')
    );
    
    // Önbelleğe kaydet
    saveToCache(
      cacheKey, 
      page, 
      wallpapers, 
      data.total_results,
      data.next_page ?? undefined
    );
    
    return {
      wallpapers,
      totalResults: data.total_results,
      nextPage: data.next_page ? page + 1 : undefined
    };
  } catch (error) {
    console.error('Kürasyon fotoğrafları yüklenemedi:', error);
    return { wallpapers: [], totalResults: 0 };
  }
};

// NEW: En yeni fotoğrafları getir (arama sonuçlarını en yeni olarak sırala)
export const getNewPhotos = async (page = 1, perPage = 20): Promise<{
  wallpapers: Wallpaper[];
  totalResults: number;
  nextPage?: number;
}> => {
  const cacheKey = 'new';
  
  // Önbellekten kontrol et
  const cachedData = getFromCache(cacheKey, page);
  if (cachedData) {
    return {
      wallpapers: cachedData.data,
      totalResults: cachedData.totalResults,
      nextPage: cachedData.nextPage ? page + 1 : undefined
    };
  }
  
  try {
    // "wallpaper" araması yapıp en yeni fotoğrafları getir
    // Not: Pexels API'de doğrudan "en yeni" fotoğrafları getirme özelliği yok, bu yüzden en iyi yaklaşım bu
    const data = await fetchFromPexels(`/search?query=wallpaper&page=${page}&per_page=${perPage}`);
    
    const wallpapers = data.photos.map((photo: PexelsPhoto) => 
      transformToWallpaper(photo, 'new')
    );
    
    // Önbelleğe kaydet
    saveToCache(
      cacheKey, 
      page, 
      wallpapers, 
      data.total_results,
      data.next_page ?? undefined
    );
    
    return {
      wallpapers,
      totalResults: data.total_results,
      nextPage: data.next_page ? page + 1 : undefined
    };
  } catch (error) {
    console.error('Yeni fotoğraflar yüklenemedi:', error);
    return { wallpapers: [], totalResults: 0 };
  }
};

// TRENDING: Popüler aramaları kullanarak trendleri simüle et
export const getTrendingPhotos = async (page = 1, perPage = 20): Promise<{
  wallpapers: Wallpaper[];
  totalResults: number;
  nextPage?: number;
}> => {
  const cacheKey = 'trending';
  
  // Önbellekten kontrol et
  const cachedData = getFromCache(cacheKey, page);
  if (cachedData) {
    return {
      wallpapers: cachedData.data,
      totalResults: cachedData.totalResults,
      nextPage: cachedData.nextPage ? page + 1 : undefined
    };
  }
  
  try {
    // Popüler terimler
    const trendingTerms = [
      'nature', 'abstract', 'travel', 'minimal', 
      'technology', 'architecture', 'city', 'landscape'
    ];
    
    // Günlük rotasyon (her gün farklı bir kategori göster)
    const dayOfYear = Math.floor((Date.now() - Date.UTC(new Date().getFullYear(), 0, 0)) / 86400000);
    const termIndex = dayOfYear % trendingTerms.length;
    const currentTerm = trendingTerms[termIndex];
    
    const data = await fetchFromPexels(`/search?query=${currentTerm}&page=${page}&per_page=${perPage}`);
    
    const wallpapers = data.photos.map((photo: PexelsPhoto) => 
      transformToWallpaper(photo, 'trending')
    );
    
    // Önbelleğe kaydet
    saveToCache(
      cacheKey, 
      page, 
      wallpapers, 
      data.total_results,
      data.next_page ?? undefined
    );
    
    return {
      wallpapers,
      totalResults: data.total_results,
      nextPage: data.next_page ? page + 1 : undefined
    };
  } catch (error) {
    console.error('Trend fotoğrafları yüklenemedi:', error);
    return { wallpapers: [], totalResults: 0 };
  }
};

// RANDOM: Rastgele fotoğraflar getir
export const getRandomPhotos = async (page = 1, perPage = 20): Promise<{
  wallpapers: Wallpaper[];
  totalResults: number;
  nextPage?: number;
}> => {
  const cacheKey = 'random';
  
  // Önbellekten kontrol et
  const cachedData = getFromCache(cacheKey, page);
  if (cachedData) {
    return {
      wallpapers: cachedData.data,
      totalResults: cachedData.totalResults,
      nextPage: cachedData.nextPage ? page + 1 : undefined
    };
  }
  
  try {
    // Rastgele arama terimleri
    const randomTerms = [
      'colorful', 'pattern', 'space', 'vintage', 'art', 
      'beach', 'mountain', 'flowers', 'sunset', 'forest'
    ];
    
    // Rastgele bir terim seç
    const randomIndex = Math.floor(Math.random() * randomTerms.length);
    const randomTerm = randomTerms[randomIndex];
    
    const data = await fetchFromPexels(`/search?query=${randomTerm}&page=${page}&per_page=${perPage}`);
    
    const wallpapers = data.photos.map((photo: PexelsPhoto) => 
      transformToWallpaper(photo, 'random')
    );
    
    // Önbelleğe kaydet
    saveToCache(
      cacheKey, 
      page, 
      wallpapers, 
      data.total_results,
      data.next_page ?? undefined
    );
    
    return {
      wallpapers,
      totalResults: data.total_results,
      nextPage: data.next_page ? page + 1 : undefined
    };
  } catch (error) {
    console.error('Rastgele fotoğraflar yüklenemedi:', error);
    return { wallpapers: [], totalResults: 0 };
  }
};

// Kategoriye göre fotoğrafları ara
export const searchPhotosByCategory = async (
  query: string,
  page = 1,
  perPage = 20
): Promise<{
  wallpapers: Wallpaper[];
  totalResults: number;
  nextPage?: number;
}> => {
  const cacheKey = `category-${query.toLowerCase()}`;
  
  // Önbellekten kontrol et
  const cachedData = getFromCache(cacheKey, page);
  if (cachedData) {
    return {
      wallpapers: cachedData.data,
      totalResults: cachedData.totalResults,
      nextPage: cachedData.nextPage ? page + 1 : undefined
    };
  }
  
  try {
    const data = await fetchFromPexels(`/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
    
    const wallpapers = data.photos.map((photo: PexelsPhoto) => 
      transformToWallpaper(photo, query.toLowerCase())
    );
    
    // Önbelleğe kaydet
    saveToCache(
      cacheKey, 
      page, 
      wallpapers, 
      data.total_results,
      data.next_page ?? undefined
    );
    
    return {
      wallpapers,
      totalResults: data.total_results,
      nextPage: data.next_page ? page + 1 : undefined
    };
  } catch (error) {
    console.error(`${query} kategorisi için fotoğraflar yüklenemedi:`, error);
    return { wallpapers: [], totalResults: 0 };
  }
};

// Fotoğraf ID'sine göre detayları getir
export const getPhotoById = async (id: string): Promise<Wallpaper | null> => {
  const cacheKey = `photo-${id}`;
  
  // Önbellekten kontrol et
  const cachedData = getFromCache(cacheKey, 1);
  if (cachedData && cachedData.data.length > 0) {
    return cachedData.data[0];
  }
  
  // Pexels ID'sini çıkar (pexels-123456 formatından)
  const pexelsId = id.replace('pexels-', '');
  
  try {
    const photo = await fetchFromPexels(`/photos/${pexelsId}`);
    const wallpaper = transformToWallpaper(photo);
    
    // Önbelleğe kaydet
    saveToCache(cacheKey, 1, [wallpaper], 1);
    
    return wallpaper;
  } catch (error) {
    console.error(`ID ile fotoğraf yüklenemedi: ${id}`, error);
    return null;
  }
};

// Kategorileri yükle ve önbelleğe al
export const getCategories = async (): Promise<Wallpaper[]> => {
  const cacheKey = 'categories';
  
  // Önbellekten kontrol et
  const cachedData = getFromCache(cacheKey, 1);
  if (cachedData) {
    return cachedData.data;
  }
  
  // Temel kategori listesi
  const categories = [
    { id: 'nature', name: 'Doğa', query: 'nature' },
    { id: 'abstract', name: 'Soyut', query: 'abstract' },
    { id: 'animals', name: 'Hayvanlar', query: 'animals' },
    { id: 'dark', name: 'Karanlık', query: 'dark' },
    { id: 'minimal', name: 'Minimal', query: 'minimal' },
    { id: 'space', name: 'Uzay', query: 'space' },
  ];
  
  try {
    const categoryWallpapers: Wallpaper[] = [];
    
    // Her kategori için kapak fotoğrafı al
    for (const category of categories) {
      const data = await fetchFromPexels(`/search?query=${category.query}&per_page=1`);
      
      if (data.photos && data.photos.length > 0) {
        const wallpaper: Wallpaper = {
          id: category.id,
          title: category.name,
          imageUrl: data.photos[0].src.portrait,
          photographer: data.photos[0].photographer,
          photographerUrl: data.photos[0].photographer_url,
          originalUrl: data.photos[0].url,
          category: 'category',
          likes: 0,
          downloads: 0,
        };
        
        categoryWallpapers.push(wallpaper);
      }
    }
    
    // Önbelleğe kaydet (24 saat geçerli)
    saveToCache(cacheKey, 1, categoryWallpapers, categoryWallpapers.length);
    
    return categoryWallpapers;
  } catch (error) {
    console.error('Kategori verileri yüklenemedi:', error);
    
    // Hata durumunda boş kategori verileri göster
    return categories.map(cat => ({
      id: cat.id,
      title: cat.name,
      imageUrl: 'https://picsum.photos/500/900',
      photographer: '',
      photographerUrl: '',
      originalUrl: '',
      category: 'category',
      likes: 0,
      downloads: 0,
    }));
  }
};

// Önbelleği temizle
export const clearCache = (): void => {
  Object.keys(cache).forEach(key => {
    delete cache[key];
  });
};