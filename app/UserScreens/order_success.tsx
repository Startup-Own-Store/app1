import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import React, { useState } from 'react';

// FIX: If you see an error on the line below, it's likely because the type
// definitions for react-native-vector-icons are not installed.
// Run this command in your terminal to fix it:
// npm install @types/react-native-vector-icons --save-dev
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ratingDistribution = [
    { stars: 5, percentage: '40%' },
    { stars: 4, percentage: '30%' },
    { stars: 3, percentage: '15%' },
    { stars: 2, percentage: '10%' },
    { stars: 1, percentage: '5%' },
];

// Combine all screen elements into a single data array for FlatList
const screenData = [
    { type: 'image', id: 'mainImage', uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyduPltMI7ylYi25XQel9M27XLonf1JlwUybsabP0M10o2Q1_E6v-EcQpCF8dKmvs4nZm4GEjf8_m11Ej9uklJRJg_mbAFCOe6AQXsd5Yq2dYUFrP85bK89Kb8qXRCxD0frp-1tAYB5SroFhWPK5fwJJHum5xjapwB3TwsXs86M02kdDgtqpZtHEe6cGQJq8UruGsvu_A194cz50u_4ZQQv_g2gFErF4i7QeWq1yJ9TH4jAI8Fk-c5MLUrvi08i4z3K6TTGABz0OKR' },
    { type: 'mainTitle', id: 'mainTitle', text: 'Enjoy your meal!' },
    { type: 'subtitle', id: 'subtitle', text: 'Your order #1234567890 has been delivered. We hope you enjoy your food!' },
    { type: 'header', id: 'rateHeader', title: 'Rate your experience' },
    { type: 'interactiveStars', id: 'interactiveStars' },
    { type: 'ratingSection', id: 'ratingSection' },
    { type: 'comment', id: 'comment' },
];


const OrderDeliveredScreen = ({ onBack, onTrackOrder }: { onBack?: () => void, onTrackOrder?: () => void }) => {
    const [userRating, setUserRating] = useState(0);
    const [comment, setComment] = useState('');

    const RatingBar = ({ stars, percentage }: { stars: number, percentage: string }) => (
        <View style={styles.ratingBarContainer}>
            <Text style={styles.ratingBarLabel}>{stars}</Text>
            <View style={styles.progressBarBackground}>
                {/* The dynamic width style has been removed to fix the error */}
                <View style={styles.progressBarForeground} />
            </View>
            <Text style={styles.ratingBarPercentage}>{percentage}</Text>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => {
        switch(item.type) {
            case 'image':
                return <Image source={{ uri: item.uri }} style={styles.mainImage} />;
            case 'mainTitle':
                return <Text style={styles.mainTitle}>{item.text}</Text>;
            case 'subtitle':
                return <Text style={styles.subtitle}>{item.text}</Text>;
            case 'header':
                return <Text style={styles.sectionTitle}>{item.title}</Text>;
            case 'interactiveStars':
                return (
                    <View style={styles.interactiveStarsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                                <MaterialIcons 
                                    name={userRating >= star ? "star" : "star-border"} 
                                    size={40} 
                                    color="#ee790b" 
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 'ratingSection':
                return (
                    <View style={styles.ratingSection}>
                        <View style={styles.ratingSummary}>
                            <Text style={styles.ratingValue}>4.5</Text>
                            <View style={styles.starsContainer}>
                                {[...Array(4)].map((_, i) => <MaterialIcons key={i} name="star" size={18} color="#ee790b" />)}
                                <MaterialIcons name="star-half" size={18} color="#ee790b" />
                            </View>
                            <Text style={styles.reviewCount}>120 reviews</Text>
                        </View>
                        <View style={styles.ratingDistributionContainer}>
                            {ratingDistribution.map(item => (
                                <RatingBar key={item.stars} stars={item.stars} percentage={item.percentage} />
                            ))}
                        </View>
                    </View>
                );
            case 'comment':
                return (
                    <View style={styles.commentContainer}>
                        <TextInput
                            placeholder="Leave a comment"
                            placeholderTextColor="#9c7149"
                            style={styles.commentInput}
                            multiline
                            value={comment}
                            onChangeText={setComment}
                        />
                    </View>
                );
            default:
                return null;
        }
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack}>
                <MaterialIcons name="close" size={24} color="#1c140d" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Delivered</Text>
            <View style={{ width: 24 }} />
        </View>

        <FlatList
            data={screenData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
        />
        
        {/* Footer Buttons */}
        <View style={styles.footer}>
            <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#f3e7e8' }]} onPress={onTrackOrder}>
                <Text style={[styles.footerButtonText, { color: '#1c140d' }]}>Track Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#ee790b' }]}>
                <Text style={[styles.footerButtonText, { color: '#fcfaf8' }]}>Submit Rating</Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcfaf8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c140d',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  mainImage: {
    width: '100%',
    aspectRatio: 3/2,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c140d',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  subtitle: {
    fontSize: 16,
    color: '#1c140d',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    lineHeight: 24,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c140d',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Interactive Stars
  interactiveStarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  // Rating Section
  ratingSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    padding: 16,
  },
  ratingSummary: {
    gap: 8,
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1c140d',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontSize: 16,
    color: '#1c140d',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  ratingDistributionContainer: {
    flex: 1,
    minWidth: 200,
    gap: 12,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBarLabel: {
    fontSize: 14,
    color: '#1c140d',
    width: 12,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e8dbce',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#ee790b',
    borderRadius: 4,
  },
  ratingBarPercentage: {
    fontSize: 14,
    color: '#9c7149',
    width: 40,
    textAlign: 'right',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Comment
  commentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentInput: {
    minHeight: 144,
    borderWidth: 1,
    borderColor: '#e8dbce',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1c140d',
    textAlignVertical: 'top',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fcfaf8',
  },
  footerButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
});

export default OrderDeliveredScreen;