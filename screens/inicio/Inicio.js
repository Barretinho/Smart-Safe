import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Animated, StatusBar } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { getStorage, uploadBytesResumable, ref as sRef, getDownloadURL, deleteObject, updateMetadata } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { addDoc, getFirestore, collection } from 'firebase/firestore';
import { app } from '../../src/config/firebase';
import utils from '../../src/utils';


const Inicio = () => {
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadProgressAnimation = useRef(new Animated.Value(0)).current; // Aqui está o useRef
  const [audioURL, setAudioURL] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        console.log("Status das permissões:", status);
        if (status !== "granted") {
          Alert.alert(
            "Permissão necessária",
            "Por favor, conceda permissão para acessar a gravação de áudio para usar essa funcionalidade."
          );
        }
      } catch (error) {
        console.error("Erro ao obter permissões de gravação de áudio:", error);
      }
    })();
  }, []);

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY); 
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    setUploading(true);
    await uploadRecording(uri);
  }

  const uploadRecording = async (uri) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const uid = user.uid;
      const storage = getStorage();
      const storageRef = sRef(storage, `recordings/${uid}/${Date.now()}.mpeg`);
      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadTask = uploadBytesResumable(storageRef, blob);
  
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setUploadProgress(progress);
          Animated.timing(uploadProgressAnimation, {
            toValue: progress,
            duration: 200,
            useNativeDriver: false,
          }).start();
        },
        (error) => {
          // Handle error
          console.error("Error uploading recording:", error);
          setUploading(false);
        },
        () => {
          // Handle successful upload
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("Recording uploaded successfully at", downloadURL);
            setUploading(false);
            setUploaded(true);
            setAudioURL(downloadURL);
            setTimeout(() => {
              setUploaded(false);
            }, 3000);
            setUploadProgress(0);
            utils.fetchUserProfile().then((profile) => {
              const { nome, sobrenome, rua, bairro, cidade } = profile
              addDoc(collection(getFirestore(app), "calls"), {
                nome: nome+ " " +sobrenome,
                local: rua+ ", " + bairro + ", " + cidade,
                horario: (new Date()).getTime(),
                audio: downloadURL
              }).then(() => {}).catch(err => {
                console.log("Firestore:", err)
              })
            }).catch(err => {
              console.log(err)
            })

            Animated.timing(uploadProgressAnimation, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start();
          });
        }
      );
    } catch (error) {
      console.error("Error uploading recording:", error);
      setUploading(false);
    }
  }; 

const handleEmergencyCall = async () => {

  Alert.alert('Olá')  
};


  

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.sosButton, recording && styles.sosButtonRecording]}
        onPress={recording ? stopRecording : startRecording}>
        <FontAwesome name="exclamation-triangle" size={60} color="white" />
        <Text style={styles.titleSOS}>SOS</Text>
      </TouchableOpacity>
      {uploading && (
        <View style={styles.progressContainer}>
          <Animated.View
            style={[styles.progressBar, { width: `${uploadProgress}%` }]}
          />
        </View>
      )}
      {uploaded && (
        <Text style={styles.uploadedText}>Gravação enviada com sucesso!</Text>
      )}
      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
        <FontAwesome name="phone" size={27} color="white" />
        <Text style={styles.emergencyText}>Acionar contato de emergência pessoal</Text>
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3c0c7b',
  },
  sosButton: {
    backgroundColor: '#9344fa',
    borderRadius: 100,
    height: 200,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 5,
  },
  sosButtonRecording: {
    backgroundColor: 'darkred',
  },
  titleSOS:{
    color: 'white',
    fontSize: 26,
    fontWeight:'bold'
  },
  progressContainer: {
    width: '40%',
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'green',
    borderRadius: 5,
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  audioControls: {
    marginHorizontal: 10,
  },
  emergencyButton: {
    backgroundColor: '#9344fa',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  uploadedText: {
    color: 'green',
    fontSize: 16,
    fontWeight: 'bold'
  },
  chatButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    right: 10,
  },
});

export default Inicio;
