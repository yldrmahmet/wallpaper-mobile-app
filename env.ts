import Constants from 'expo-constants';

// Expo'nun Constants'ından çevre değişkenlerini al
const ENV = {
  PEXELS_API_KEY: Constants.expoConfig?.extra?.pexelsApiKey || '',
};

// Tüm gerekli çevre değişkenlerinin ayarlanıp ayarlanmadığını kontrol eden fonksiyon
const checkEnvVariables = () => {
  const requiredVars = ['PEXELS_API_KEY'];
  const missingVars = requiredVars.filter(key => !ENV[key]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Gerekli çevre değişkenleri eksik: ${missingVars.join(', ')}`
    );
  }
};

// Bunu geliştirme sırasında çağırın, ancak üretimde hata fırlatmak istemeyebilirsiniz
if (__DEV__) {
  checkEnvVariables();
}

export default ENV;