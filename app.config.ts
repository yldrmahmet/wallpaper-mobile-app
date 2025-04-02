// app.config.js
const path = require('path');
const dotenv = require('dotenv');

// .env dosyasını yükle
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Çevre değişkenleri
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

module.exports = {
  name: "Wallpaper",
  slug: "wallpaper",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/app-icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#121212"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.mobile.app.wallpaper"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#121212"
    },
    package: "com.yourname.wallpaper",
    permissions: ["WRITE_EXTERNAL_STORAGE"]
  },
  web: {
    favicon: "./assets/images/favicon.png"
  },
  // Burada çevre değişkenlerini extra içinde tanımlıyoruz
  extra: {
    pexelsApiKey: PEXELS_API_KEY,
  },
};