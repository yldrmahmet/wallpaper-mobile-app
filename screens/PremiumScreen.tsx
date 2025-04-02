import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const PremiumScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.heroSection}>
          <ImageBackground
            source={{ uri: 'https://picsum.photos/500/900?random=premium' }}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
            blurRadius={4}
          >
            <View style={styles.heroOverlay}>
              <Ionicons name="diamond" size={60} color="#FFD700" />
              <Text style={styles.heroTitle}>Go Premium</Text>
              <Text style={styles.heroSubtitle}>
                Unlock all features and get access to exclusive wallpapers
              </Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Premium Features</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#3498db" />
            <Text style={styles.featureText}>Ad-free experience</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#3498db" />
            <Text style={styles.featureText}>Unlimited downloads</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#3498db" />
            <Text style={styles.featureText}>Exclusive premium wallpapers</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#3498db" />
            <Text style={styles.featureText}>Early access to new wallpapers</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#3498db" />
            <Text style={styles.featureText}>Higher resolution downloads</Text>
          </View>
        </View>

        <View style={styles.pricingSection}>
          <TouchableOpacity style={[styles.pricingOption, styles.recommendedOption]}>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>BEST VALUE</Text>
            </View>
            <Text style={styles.pricingTitle}>Annual</Text>
            <Text style={styles.pricingPrice}>$19.99/year</Text>
            <Text style={styles.pricingSaving}>Save 72%</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.pricingOption}>
            <Text style={styles.pricingTitle}>Monthly</Text>
            <Text style={styles.pricingPrice}>$5.99/month</Text>
            <Text style={styles.pricingSubtext}>Billed monthly</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.pricingOption}>
            <Text style={styles.pricingTitle}>Lifetime</Text>
            <Text style={styles.pricingPrice}>$59.99</Text>
            <Text style={styles.pricingSubtext}>One-time payment</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.subscribeButton}>
          <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          Payment will be charged to your account at confirmation of purchase. 
          Subscription automatically renews unless auto-renew is turned off at 
          least 24-hours before the end of the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    height: 240,
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  featuresSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 12,
  },
  pricingSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  pricingOption: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  recommendedOption: {
    borderColor: '#3498db',
    position: 'relative',
    paddingTop: 24,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -60,
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  pricingPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  pricingSaving: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  pricingSubtext: {
    fontSize: 14,
    color: '#777',
  },
  subscribeButton: {
    backgroundColor: '#3498db',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#777',
    marginHorizontal: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default PremiumScreen;