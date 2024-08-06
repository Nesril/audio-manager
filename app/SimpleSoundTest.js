import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, View, Alert } from 'react-native';
import { Audio } from 'expo-av';

const SimpleSoundTest = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access audio is required!');
      }
    })();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/001.mp3')
      );
      setSound(sound);
    } catch (err) {
      console.error('Error loading sound:', err);
    }
  };

  const playSound = async () => {
    try {
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        console.log('Sound not loaded yet');
      }
    } catch (err) {
      console.error('Error playing sound:', err);
    }
  };

  const pauseSound = async () => {
    try {
      if (sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        console.log('Sound not loaded yet');
      }
    } catch (err) {
      console.error('Error pausing sound:', err);
    }
  };

  const resumeSound = async () => {
    try {
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        console.log('Sound not loaded yet');
      }
    } catch (err) {
      console.error('Error resuming sound:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Load Sound" onPress={loadSound} />
      <View style={{flexDirection:'row', justifyContent:'space-between'}}>
      <Button title="Play Sound" onPress={playSound} />
      <Button title="Pause Sound" onPress={pauseSound} />
      <Button title="Resume Sound" onPress={resumeSound} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default SimpleSoundTest;
