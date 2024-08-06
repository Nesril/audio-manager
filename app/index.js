import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from 'expo-router';

const AudioRecorder = () => {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(null);
  const [playbackDuration, setPlaybackDuration] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access audio is required!');
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);

      // Start tracking recording duration
      recording.setOnRecordingStatusUpdate((status) => {
        setCurrentDuration(status.durationMillis);
      });
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      const { sound, status } = await recording.createNewLoadedSoundAsync();
      const uri = recording.getURI();

      setRecordings([...recordings, { sound, duration: status.durationMillis, uri }]);
      setRecording(null);
      setCurrentDuration(null); // Reset duration
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const playRecording = async (sound, duration) => {
    try {
      console.log('Attempting to play sound...');
      setIsPlaying(true);
      setPlaybackDuration(0);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isPlaying) {
          setPlaybackDuration(status.positionMillis);
        } else if (status.didJustFinish) {
          setIsPlaying(false);
          setPlaybackDuration(duration);
        }
      });
      await sound.playAsync();
      console.log('Sound playback started');
    } catch (err) {
      console.error('Error playing sound:', err);
    }
  };

  const saveRecording = async (uri) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}recording-${Date.now()}.m4a`;
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });
      console.log('File saved to:', fileUri);
    } catch (err) {
      console.error('Failed to save recording:', err);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={styles.text}>Recording {index + 1}</Text>
      <Button title="Play" onPress={() => playRecording(item.sound, item.duration)} />
      <Button title="Save" onPress={() => saveRecording(item.uri)} />
      <Text style={styles.text}>{formatDuration(item.duration)}</Text>
    </View>
  );

  const formatDuration = (durationMillis) => {
    const minutes = Math.floor(durationMillis / 60000);
    const seconds = ((durationMillis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={()=>navigation.navigate('SimpleSoundTest')}>
          <Text>Test Sound</Text>
        </TouchableOpacity>
      </View>
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />
      {currentDuration !== null && (
        <Text style={styles.durationText}>Recording Duration: {formatDuration(currentDuration)}</Text>
      )}
      <FlatList
        data={recordings}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      {isPlaying && playbackDuration !== null && (
        <Text style={styles.durationText}>Playback Duration: {formatDuration(playbackDuration)}</Text>
      )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    width: '100%',
  },
  text: {
    flex: 1,
  },
  durationText: {
    marginVertical: 10,
  },
});

export default AudioRecorder;
