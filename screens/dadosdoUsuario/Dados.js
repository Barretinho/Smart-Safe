import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getDatabase, get, ref, child, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const DadosdoUsuario = ({ route }) => {
  const [perfilData, setPerfilData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("Status das permissões:", status);
        if (status !== "granted") {
          Alert.alert(
            "Permissão necessária",
            "Por favor, conceda permissão para acessar a galeria de fotos para carregar uma imagem de perfil."
          );
        } else {
          const auth = getAuth();
          const user = auth.currentUser;

          if (user) {
            console.log("Usuário autenticado:", user.uid);
            const dbref = ref(getDatabase());
            const snapshot = await get(child(dbref, `users/${user.uid}`));
            if (snapshot.exists()) {
              const userData = snapshot.val();
              console.log("Dados do usuário:", userData);
              setPerfilData(userData);
            } else {
              console.log("Nenhum dado encontrado para o usuário logado");
            }
          } else {
            console.log("Usuário não autenticado");
          }
        }
      } catch (error) {
        console.error("Erro ao obter dados do perfil:", error);
      }
    };

    fetchUserProfile();
  }, []);

  if (!perfilData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Dados do perfil não encontrados.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dados do Usuário:</Text>
      <View style={styles.userData}>
        <FontAwesome name="user" size={24} color="#3b5998" style={styles.labelIcon} />
        <Text style={styles.label}>Nome:</Text>
        <Text style={styles.value}> {perfilData.nome}</Text>
      </View>
      <View style={styles.userData}>
        <FontAwesome name="user" size={24} color="#3b5998" style={styles.labelIcon} />
        <Text style={styles.label}>Sobrenome:</Text>
        <Text style={styles.value}> {perfilData.sobrenome}</Text>
      </View>
      <View style={styles.userData}>
        <MaterialIcons name="email" size={24} color="#3b5998" style={styles.labelIcon} />
        <Text style={styles.label}>E-mail:</Text>
        <Text style={styles.value}> {perfilData.email}</Text>
      </View>
      <View style={styles.userData}>
        <FontAwesome name="calendar" size={24} color="#3b5998" style={styles.labelIcon} />
        <Text style={styles.label}>Data de Nascimento:</Text>
        <Text style={styles.value}> {perfilData.dataNascimento}</Text>
      </View>
      <View style={styles.userData}>
        <FontAwesome name="id-card" size={24} color="#3b5998" style={styles.labelIcon} />
        <Text style={styles.label}>CPF:</Text>
        <Text style={styles.value}> {perfilData.cpf}</Text>
      </View>
      <View style={styles.userData}>
        <FontAwesome name="map-marker" size={24} color="#3b5998" style={styles.labelIcon} />
        <Text style={styles.label}>Rua:</Text>
        <Text style={styles.value}> {perfilData.rua}</Text>
      </View>
      <View style={styles.userData}>
        <FontAwesome name="map-marker" size={24} color="#3b5998" style={styles.labelIcon} />
        <Text style={styles.label}>Bairro:</Text>
        <Text style={styles.value}> {perfilData.bairro}</Text>
      </View>
      <View style={styles.userData}>
        <FontAwesome name="map-marker" size={24} color="#3b5998" style={styles.labelIcon} />
        <Text style={styles.label}>CEP:</Text>
        <Text style={styles.value}> {perfilData.cep}</Text>
      </View>
      <View style={styles.userData}>
        <FontAwesome name="map-marker" size={24} color="#3b5998" style={styles.labelIcon} />
        <Text style={styles.label}>Cidade:</Text>
        <Text style={styles.value}> {perfilData.cidade}</Text>
      </View>
      
    </View>
  );
  
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3c0c7b", // cor de fundo do Facebook
    paddingVertical: 20,
    paddingHorizontal: 10,
    gap: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    color: '#fff', // azul do Facebook
  },
  userData: {
    flexDirection: "row",
    backgroundColor: "#fff", // cor de fundo dos dados do usuário
    borderRadius: 10, // bordas arredondadas
    padding: 12, // espaço interno
    alignItems: 'center', // alinhamento vertical
  },
  labelIcon: {
    marginRight: 10, // Adicionando margem direita ao ícone
  },
  label: {
    fontWeight: "bold",
    color: '#3b5998', // azul do Facebook
    fontSize: 18,
  },
  value: {
    flex: 1,
    color: '#333', // cor do texto
    fontSize: 18,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: "red",
  },
});

export default DadosdoUsuario;
