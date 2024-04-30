import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, FlatList, Alert, Linking, Platform } from "react-native"; // Adicione Linking aqui
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, child, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import Icon from 'react-native-vector-icons/FontAwesome';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';



const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState(null); // Armazenar o contato de emergência
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    loadChatHistory();
    fetchUserName();
    fetchEmergencyContact(); // Carregar o contato de emergência ao iniciar o componente
  }, []);

  const loadChatHistory = async () => {
    try {
      const chatHistory = await AsyncStorage.getItem('chatHistory');
      if (chatHistory) {
        setMessages(JSON.parse(chatHistory));
      } 
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const fetchUserName = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const dbRef = ref(getDatabase());
        const snapshot = await get(child(dbRef, `users/${user.uid}`));

        if (snapshot.exists()) {
          const userData = snapshot.val();
          const fullName = `${userData.nome} ${userData.sobrenome}`;
          setUserName(fullName);

          // Adiciona uma mensagem de saudação junto com o nome da pessoa
          const greeting = getGreeting();
          addBotMessage(`Olá! ${greeting}, ${fullName}! Como posso ajudá-lo hoje?`);

          // Adiciona as opções de ajuda automaticamente após a mensagem de saudação
          addBotMessage("1. Acionar um contato de emergência");
          addBotMessage("2. Chamar emergência");
          addBotMessage("3. Outras opções"); // Adiciona a opção 3
          addBotMessage("Por favor, escolha uma das opções acima.");
        }
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  const fetchEmergencyContact = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (user) {
        const dbRef = ref(getDatabase());
        const contactsSnapshot = await get(child(dbRef, `Contatos/${user.uid}`));
  
        if (contactsSnapshot.exists()) {
          // Acessa os dados do usuário logado dentro do snapshot
          const userData = contactsSnapshot.val();
  
          // Verifica se há um contato de emergência configurado para o usuário
          if (userData) {
            // Acessa os detalhes do contato de emergência
            const emergencyContactData = userData["0"];
  
            // Verifica se os dados do contato de emergência estão presentes
            if (emergencyContactData) {
              // Obtém o nome e o número do contato de emergência
              const emergencyContactName = emergencyContactData.name;
              const emergencyContactPhoneNumber = emergencyContactData.phoneNumbers[0].number;
  
              // Define o contato de emergência no estado
              setEmergencyContact({
                name: emergencyContactName,
                phoneNumber: emergencyContactPhoneNumber
              });
            } else {
              console.log("Nenhum contato de emergência encontrado para o usuário.");
              setEmergencyContact(null);
            }
          } else {
            console.log("Nenhum contato de emergência configurado para o usuário.");
            setEmergencyContact(null);
          }
        } else {
          console.log("Nenhum contato de emergência encontrado para o usuário.");
          setEmergencyContact(null);
        }
      } else {
        console.log("Nenhum usuário logado.");
        setEmergencyContact(null);
      }
    } catch (error) {
      console.error('Erro ao buscar contato de emergência:', error);
      setEmergencyContact(null);
    }
  };
  
  

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;
  
    // Adiciona a mensagem do usuário à lista de mensagens
    addUserMessage(inputText);
  
    // Aqui, você pode adicionar a lógica para processar a mensagem do usuário e obter a resposta do chatbot
    // Por enquanto, vamos apenas simular algumas respostas do chatbot com mensagens pré-definidas
    if (inputText === "1") {
      // Lógica para acionar contato de emergência...
      if (emergencyContact) {
        // Obter a localização em tempo real
        const location = await getLocation();
        if (location) {
          // Criar mensagem com link para a localização em tempo real
          const locationMessage = `Este é um pedido de emergência! Por favor, clique no link abaixo para ver minha localização em tempo real:\n\nhttps://www.google.com/maps?q=${location.latitude},${location.longitude}`;
          
          // Abre o WhatsApp com a mensagem pré-definida
          const whatsappURL = `whatsapp://send?phone=${emergencyContact.phoneNumber}&text=${encodeURIComponent(locationMessage)}`;
          Linking.openURL(whatsappURL);
        } else {
          addBotMessage("Não foi possível obter a localização em tempo real.");
        }
      } else {
        addBotMessage("Não há contato de emergência configurado.");
      }
    } else if (inputText === "2") {
      // Lógica para chamar emergência...
    } else if (inputText === "3") {
      // Adiciona outras opções
      addBotMessage("4. Opção 4");
      addBotMessage("5. Opção 5");
      addBotMessage("0. Voltar"); // Adiciona a opção de voltar
      // Adicione mais opções conforme necessário
    } else if (inputText === "0") {
      // Voltar ao menu principal
      handleClearMessages();
    } else {
      addBotMessage("Desculpe, não entendi. Por favor, tente novamente ou digite o número da opção desejada.");
    }
  
    setInputText('');
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permissão de localização negada.');
        return null;
      }
  
      let location = await Location.getCurrentPositionAsync({});
      return location.coords;
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      return null;
    }
  };
  
  
  

  const handleClearMessages = () => {
    // Limpa as mensagens
    setMessages([]);

    // Reinicia o chatbot mostrando novamente a saudação e as opções
    fetchUserName();
  };

  const addUserMessage = (text) => {
    setMessages(prevMessages => [...prevMessages, { text, sender: 'user' }]);
  };

  const addBotMessage = (text) => {
    setMessages(prevMessages => [...prevMessages, { text, sender: 'bot' }]);
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return "Bom dia";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Boa tarde";
    } else {
      return "Boa noite";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>ChatBot</Text>
        <TouchableOpacity onPress={handleClearMessages}>
          <Icon name="trash" size={24} color="#FF0000" />
        </TouchableOpacity>
      </View>
      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View style={item.sender === 'bot' ? styles.botMessage : styles.userMessage}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Responda de acordo com o chat..."
          value={inputText}
          placeholderTextColor={'#777'}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={handleSendMessage}>
          <Text style={styles.buttonMensage}>
            <Icon name="paper-plane" size={22} color="blue"/> 
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3c0c7b",
    paddingTop: 35,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between', // Para centralizar o título
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: 'white'
  },
  chatContainer: {
    flex: 1,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  buttonMensage:{
    backgroundColor:'#fff',
    padding: 15, 
    borderRadius: 50,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  messageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    paddingVertical: 7,
    color: 'white',
  },
});

export default ChatBot;
