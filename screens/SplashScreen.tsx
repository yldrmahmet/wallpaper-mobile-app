import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SplashScreen = () => {
  const navigation = useNavigation();
  const logoScale = new Animated.Value(0.3);
  const logoOpacity = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);
  const textTranslateY = new Animated.Value(20);

  useEffect(() => {
    // Animasyonları sırayla başlat
    Animated.sequence([
      // Logo görünür hale gelir ve büyür
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
      ]),
      
      // Text görünür hale gelir ve yukarı doğru hareket eder
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      
      // Kısa beklemeden sonra solma efekti
      Animated.delay(1000),
    ]).start(() => {
      // Animasyonlar tamamlandıktan sonra ana ekrana yönlendir
      setTimeout(() => {
        navigation.replace('Home');
      }, 500);
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoBackground}>
          <Ionicons name="images" size={70} color="#FFFFFF" />
        </View>
      </Animated.View>
      
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        Wallpaper
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    letterSpacing: 2,
    shadowColor: 'rgba(52, 152, 219, 0.6)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default SplashScreen;