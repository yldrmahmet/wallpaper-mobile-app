// services/categoriesService.ts
import ENV from '../env';

// Pexels API için temel URL
const BASE_URL = 'https://api.pexels.com/v1';

// API anahtarı ile başlıklar
const headers = {
  Authorization: ENV.PEXELS_API_KEY,
  'Content-Type': 'application/json',
};

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  query: string;
  description?: string;
}

// Kategoriler için önbellek
let categoriesCache: Category[] | null = null;
let cacheTimestamp: number = 0;

// Önbellek süresi (24 saat - milisaniye)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Pexels'ten kategori için bir fotoğraf arama
const searchCategoryPhoto = async (query: string): Promise<string> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=1&orientation=portrait`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`Pexels API Hatası: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      // Yüksek kaliteli, dikey resim
      return data.photos[0].src.portrait;
    }
    
    return 'https://picsum.photos/500/900'; // Fallback resim
  } catch (error) {
    console.error(`${query} için fotoğraf araması başarısız oldu:`, error);
    return 'https://picsum.photos/500/900'; // Hata durumunda fallback
  }
};

// Tüm kategorileri getir
export const getCategories = async (): Promise<Category[]> => {
  // Önbelleği kontrol et
  const now = Date.now();
  if (categoriesCache && now - cacheTimestamp < CACHE_DURATION) {
    return categoriesCache;
  }
  
  // Kategorilerin tanımları
  const categories: Category[] = [
    { 
      id: 'nature', 
      name: 'Doğa', 
      imageUrl: '', 
      query: 'nature landscape',
      description: 'Dağlar, denizler, ormanlar ve daha fazlası'
    },
    { 
      id: 'abstract', 
      name: 'Soyut', 
      imageUrl: '', 
      query: 'abstract pattern',
      description: 'Yaratıcı ve soyut desenler'
    },
    { 
      id: 'animals', 
      name: 'Hayvanlar', 
      imageUrl: '', 
      query: 'animals wildlife',
      description: 'Vahşi yaşam ve sevimli hayvanlar'
    },
    { 
      id: 'dark', 
      name: 'Karanlık', 
      imageUrl: '', 
      query: 'dark moody',
      description: 'Karanlık ve gizemli duvar kağıtları'
    },
    { 
      id: 'minimal', 
      name: 'Minimal', 
      imageUrl: '', 
      query: 'minimal simple',
      description: 'Sade ve minimal tasarımlar'
    },
    { 
      id: 'space', 
      name: 'Uzay', 
      imageUrl: '', 
      query: 'space galaxy',
      description: 'Galaksiler, yıldızlar ve gezegenler'
    },
    { 
      id: 'architecture', 
      name: 'Mimari', 
      imageUrl: '', 
      query: 'architecture building', 
      description: 'Etkileyici binalar ve yapılar'
    },
    { 
      id: 'city', 
      name: 'Şehir', 
      imageUrl: '', 
      query: 'city urban',
      description: 'Şehir manzaraları ve sokaklar'
    },
    { 
      id: 'food', 
      name: 'Yiyecek', 
      imageUrl: '', 
      query: 'food',
      description: 'Lezzetli ve çekici yiyecekler'
    },
    { 
      id: 'sport', 
      name: 'Spor', 
      imageUrl: '', 
      query: 'sport',
      description: 'Her türlü spor aktivitesi'
    },
    { 
      id: 'technology', 
      name: 'Teknoloji', 
      imageUrl: '', 
      query: 'technology',
      description: 'Modern teknoloji ve gadgetlar'
    },
    { 
      id: 'travel', 
      name: 'Seyahat', 
      imageUrl: '', 
      query: 'travel destination',
      description: 'Harika seyahat rotaları ve manzaralar'
    }
  ];
  
  // Her kategori için arkaplan resmi al
  const categoriesWithImages = await Promise.all(
    categories.map(async (category) => {
      if (!category.imageUrl) {
        category.imageUrl = await searchCategoryPhoto(category.query);
      }
      return category;
    })
  );
  
  // Önbelleğe kaydet
  categoriesCache = categoriesWithImages;
  cacheTimestamp = now;
  
  return categoriesWithImages;
};

// Kategori ID'sine göre kategori detayını getir
export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
  const categories = await getCategories();
  return categories.find(cat => cat.id === categoryId) || null;
};