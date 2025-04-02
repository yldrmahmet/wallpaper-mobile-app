import React from 'react';
import { 
  TouchableOpacity, 
  ImageBackground, 
  StyleSheet, 
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 2 - 24;

const WallpaperItem = ({ imageUrl, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.image}
        imageStyle={styles.imageStyle}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.8,
  },
  imageStyle: {
    borderRadius: 12,
  }
});

export default WallpaperItem;