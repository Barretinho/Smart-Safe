import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Animated, Easing } from 'react-native';

const Inicio = () => {
  const [isPressing, setIsPressing] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const handleSOSButtonPressIn = () => {
    setIsPressing(true);
    startAnimation();
  };

  const handleSOSButtonPressOut = () => {
    setIsPressing(false);
    scale.setValue(1);
  };

  const startAnimation = () => {
    Animated.loop(
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.sosButton, isPressing && styles.sosButtonPressed]}
        onPressIn={handleSOSButtonPressIn}
        onPressOut={handleSOSButtonPressOut}>
        <Text style={styles.sosText}>SOS</Text>
        {isPressing && (
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: scale }],
              },
            ]}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#3c0c7b',
  },
  sosButton: {
    backgroundColor: 'red',
    borderRadius: 100,
    height: 100,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    position: 'relative',
  },
  sosButtonPressed: {
    backgroundColor: 'darkred',
  },
  sosText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  ripple: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 100,
    width: 100,
    height: 100,
  },
});

export default Inicio;
