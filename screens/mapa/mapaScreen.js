import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const MapScreen = ({ navigation }) => {
  const [mapRegion, setMapRegion] = useState(null);
  const mapRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(0);
  const mapLayoutTimeout = useRef(null);
  const [mapType, setMapType] = useState('satellite'); // Estado para controlar o tipo de mapa

  useEffect(() => {
    const subscribeToLocationUpdates = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permissão de localização não concedida");
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({});
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
      } catch (error) {
        console.error("Erro ao obter a localização:", error);
      }
    };
  
    subscribeToLocationUpdates();
  }, []);

  const handleMapLayoutChange = () => {
    clearTimeout(mapLayoutTimeout.current);
    mapLayoutTimeout.current = setTimeout(() => {
      if (mapRegion && mapRegion.latitude && mapRegion.longitude && mapRef.current && mapRef.current.setCamera) {
        mapRef.current.setCamera({
          center: {
            latitude: mapRegion.latitude,
            longitude: mapRegion.longitude,
          },
          zoom: zoomLevel,
        });
      }
    }, 5);
  };

  const handleMapRegionChange = (region) => {
    setMapRegion(region);
    setZoomLevel(region.longitudeDelta);
  };

  const toggleMapType = () => {
    // Alternar entre os tipos de mapa
    switch (mapType) {
      case 'satellite':
        setMapType('standard');
        break;
      case 'standard':
        setMapType('terrain');
        break;
      case 'terrain':
        setMapType('satellite');
        break;
      default:
        setMapType('satellite');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Localização Atual</Text>
      </View>

      {/* Mapa */}
      <View style={{ flex: 1 }}>
        <MapView
          provider={MapView.PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          mapType={mapType}
          showsUserLocation={true}
          onLayout={handleMapLayoutChange}
          ref={mapRef}
        />
      </View>

      {/* Botão para alternar o tipo de mapa */}
      <TouchableOpacity style={styles.mapTypeButton} onPress={toggleMapType}>
        <Text style={styles.mapTypeButtonText}>{getMapTypeName(mapType)}</Text>
      </TouchableOpacity>
    </View>
  );
};

const getMapTypeName = (mapType) => {
  switch (mapType) {
    case 'satellite':
      return 'Padrão';
    case 'standard':
      return 'Satélite';
    case 'terrain':
      return 'Relevo';
    default:
      return 'Padrão';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#9344fa',
    paddingTop: 35,
    paddingBottom: 15,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 5,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapTypeButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3c0c7b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  mapTypeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MapScreen;
