import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // Importando Marker
import * as Location from 'expo-location';

const MapScreen = ({ navigation }) => {
  const [mapRegion, setMapRegion] = useState(null);
  const mapRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(0);
  const mapLayoutTimeout = useRef(null);
  const [mapType, setMapType] = useState('standard'); // Alterado para 'standard'
  const [streetName, setStreetName] = useState("");
  const [nearestReference, setNearestReference] = useState("");
  const [markers, setMarkers] = useState([]); // Estado para armazenar os marcadores

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

        const street = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (street && street.length > 0) {
          setStreetName(street[0].name || "");
          setNearestReference(street[0].street || "");
        }

        // Mock de lugares próximos
        const nearbyPlaces = [
          { key: 1, coordinate: { latitude: location.coords.latitude + 0.001, longitude: location.coords.longitude + 0.001 }, title: 'Exemplo 1', description: 'Descrição 1' },
          { key: 2, coordinate: { latitude: location.coords.latitude - 0.001, longitude: location.coords.longitude - 0.001 }, title: 'Exemplo 2', description: 'Descrição 2' },
          // Adicione mais lugares conforme necessário
        ];
        setMarkers(nearbyPlaces);
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
      <View style={{ flex: 1 }}>
        <MapView
          provider={MapView.PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          mapType={mapType}
          showsUserLocation={true}
          onLayout={handleMapLayoutChange}
          onRegionChangeComplete={handleMapRegionChange}
          ref={mapRef}
        >
        </MapView>
      </View>

      <TouchableOpacity style={styles.mapTypeButton} onPress={toggleMapType}>
        <Text style={styles.mapTypeButtonText}>{getMapTypeName(mapType)}</Text>
      </TouchableOpacity>

      <View style={styles.bottomBox}>
        <Text style={styles.streetName}>{streetName}</Text>
        <Text style={styles.reference}>{nearestReference}</Text>
      </View>
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
  map: {
    width: "100%",
    height: "100%",
  },
  mapTypeButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  mapTypeButtonText: {
    color: '#000',
    fontSize: 16,
  },
  bottomBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: 250,
  },
  streetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reference: {
    fontSize: 14,
    color: '#555',
  },
});

export default MapScreen;
