// Bu örnek API'de gerçek çağrılar yerine mockup data kullanılmıştır
// Gerçek bir uygulamada Unsplash, Pexels gibi API'ler kullanabilirsiniz

// Örnek duvar kağıdı verileri
const mockupWallpapers = {
    new: generateWallpapers('new', 20),
    trending: generateWallpapers('trending', 20),
    popular: generateWallpapers('popular', 20),
    random: generateWallpapers('random', 20),
    categories: [
      { id: 1, name: 'Nature', imageUrl: 'https://picsum.photos/500/900?random=1' },
      { id: 2, name: 'Abstract', imageUrl: 'https://picsum.photos/500/900?random=2' },
      { id: 3, name: 'Animals', imageUrl: 'https://picsum.photos/500/900?random=3' },
      { id: 4, name: 'Dark', imageUrl: 'https://picsum.photos/500/900?random=4' },
      { id: 5, name: 'Minimal', imageUrl: 'https://picsum.photos/500/900?random=5' },
      { id: 6, name: 'Space', imageUrl: 'https://picsum.photos/500/900?random=6' },
    ],
  };
  
  // Duvar kağıdı verileri oluşturma
  function generateWallpapers(category, count) {
    return Array.from({ length: count }, (_, index) => ({
      id: `${category}-${index + 1}`,
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Wallpaper ${index + 1}`,
      imageUrl: `https://picsum.photos/500/900?random=${category}-${index + 1}`,
      category: category,
      likes: Math.floor(Math.random() * 10000),
      downloads: Math.floor(Math.random() * 50000),
    }));
  }
  
  // Duvar kağıtlarını getir
  export const fetchWallpapers = async (category) => {
    // API çağrısını simüle etmek için gecikme ekleniyor
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockupWallpapers[category] || []);
      }, 800);
    });
  };
  
  // Kategoriye göre duvar kağıtlarını getir
  export const fetchWallpapersByCategory = async (categoryId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const wallpapers = generateWallpapers(`category-${categoryId}`, 15);
        resolve(wallpapers);
      }, 800);
    });
  };
  
  // Duvar kağıdı detaylarını getir
  export const fetchWallpaperDetails = async (wallpaperId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Tüm kategorilerdeki duvar kağıtlarını ara
        for (const category in mockupWallpapers) {
          if (Array.isArray(mockupWallpapers[category])) {
            const wallpaper = mockupWallpapers[category].find(w => w.id === wallpaperId);
            if (wallpaper) {
              resolve(wallpaper);
              return;
            }
          }
        }
        resolve(null);
      }, 500);
    });
  };