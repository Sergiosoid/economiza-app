import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer, Button, Typography } from '../components';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

const ONBOARDING_STORAGE_KEY = '@economiza:onboarding_completed';

const slides = [
  {
    id: 1,
    title: 'Economize no mercado',
    description: 'Escaneie suas notas fiscais e acompanhe seus gastos de forma simples e rápida.',
    emoji: '💰',
  },
  {
    id: 2,
    title: 'Compare preços automaticamente',
    description: 'Descubra onde você pode economizar mais comparando preços entre diferentes supermercados.',
    emoji: '📊',
  },
  {
    id: 3,
    title: 'Saiba onde economizar mais',
    description: 'Receba sugestões inteligentes de economia baseadas no seu histórico de compras.',
    emoji: '💡',
  },
];

export const OnboardingScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      navigation.reset({
        index: 0,
        routes: [{ name: 'BottomTabs' as never }],
      });
    } catch (error) {
      console.error('Erro ao salvar onboarding:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'BottomTabs' as never }],
      });
    }
  };

  const renderSlide = (slide: typeof slides[0], index: number) => (
    <View key={slide.id} style={[styles.slide, { width }]}>
      <View style={styles.emojiContainer}>
        <Typography variant="h1" style={styles.emoji}>
          {slide.emoji}
        </Typography>
      </View>
      <Typography variant="h2" style={styles.title}>
        {slide.title}
      </Typography>
      <Typography variant="body" color="secondary" style={styles.description}>
        {slide.description}
      </Typography>
    </View>
  );

  return (
    <ScreenContainer style={{ backgroundColor: colors.background }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentSlide(slideIndex);
        }}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      <View style={styles.footer}>
        {/* Indicadores */}
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    index === currentSlide ? colors.primary : colors.divider,
                  width: index === currentSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Botões */}
        <View style={styles.buttons}>
          {currentSlide < slides.length - 1 ? (
            <>
              <Button
                title="Pular"
                onPress={handleSkip}
                variant="ghost"
                style={styles.skipButton}
              />
              <Button
                title="Próximo"
                onPress={handleNext}
                variant="primary"
                style={styles.nextButton}
              />
            </>
          ) : (
            <Button
              title="Começar"
              onPress={handleFinish}
              variant="primary"
              fullWidth
              size="large"
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
};

export const checkOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Erro ao verificar onboarding:', error);
    return false;
  }
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emojiContainer: {
    marginBottom: 32,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  buttons: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

