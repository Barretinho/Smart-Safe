import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/FontAwesome";
import LoginCadastroScreen from "./screens/loginEcadastro/LoginCadastroScreen";
import LoginScreen from "./screens/login/LoginScreen";
import Inicio from "./screens/inicio/Inicio";
import AdicionarContatoScreen from "./screens/adicionar/AdicionarContatoScreen";
import PerfilScreen from "./screens/perfil/PerfilScreen";
import SegundaParte from "./screens/cadastro/SegundaParte";
import ResetPasswordScreen from "./screens/ResetPasswordScreen/ResetPassword";
import MapScreen from "./screens/mapa/mapaScreen";
import { TouchableOpacity, StyleSheet, Image } from "react-native";
import Cadastro from "./screens/cadastro/CadastroScreen";
import Emergencia from "./screens/ContatosdeEmergencia/ContatosEmergencia";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, child, get } from "firebase/database";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainTabs = ({ navigation }) => {
  const [perfilImage, setPerfilImage] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      console.log(auth)

      if (user) {
        const dbref = ref(getDatabase());
        console.log("Usuário autenticado:", user.uid);
        const snapshot = await get(child(dbref, `users/${user.uid}`));
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log("Dados do usuário:", userData);
          setPerfilImage(userData.foto)
        } else {
          console.log("Nenhum dado encontrado para o usuário logado");
        }
      } else {
        console.log("Usuário não autenticado");
      }
    } catch (error) {
      console.error("Erro ao obter dados do perfil:", error);
    }
  };

  // Pronto Marquin deu certo, testa a~i pra ver

  useEffect(() => {
    navigation.addListener('focus', () => fetchUserProfile())
  }, [navigation])

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: "#fff",
          width: 250,
        },
        drawerActiveTintColor: "#9344fa",
        drawerInactiveTintColor: "#000000",
        itemStyle: { marginVertical: 5 },
        labelStyle: { fontSize: 20, fontWeight: "normal" },
        headerStyle: {
          height: 100,
          backgroundColor: "#9344fa",
        },
        headerTintColor: "#fff",
        drawerStatusBarAnimation: "slide",
        headerTitleStyle: {
          fontWeight: "100",
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Perfil")}
            style={styles.profileIcon}
          >
            {perfilImage !== "" ? (
              <Image
                source={{ uri: perfilImage  }}
                style={{ width: 50, height: 50, borderRadius: 100, borderWidth: 1.5, borderColor: "#fff"}}
              />
            ) : (
              "https://picsum.photos/id/237/200/300"
            )}
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen
        name="Inicio"
        component={Inicio}
        options={{
          headerTitle: '',
          drawerIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Adicionar Contatos"
        component={AdicionarContatoScreen}
        options={{
          headerTitle: '',
          drawerIcon: ({ color, size }) => (
            <Icon name="plus" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Números de Emergência"
        component={Emergencia}
        options={{
          headerTitle: '',
          drawerIcon: ({ color, size }) => (
            <Icon name="phone" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};


const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginCadastro">
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="LoginCadastro"
          component={LoginCadastroScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={Inicio}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SegundaParte"
          component={SegundaParte}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MapScreen"
          component={MapScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Emergencia"
          component={Emergencia}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cadastro"
          component={Cadastro}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{
            title: "Perfil",
            headerStyle: {
              backgroundColor: "#9344fa",
            },
            headerTintColor: "#fff",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  profileIcon: {
    marginRight: 20,
  },
  
});

export default App;
