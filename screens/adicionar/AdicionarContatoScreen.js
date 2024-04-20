import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  SafeAreaView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import * as SMS from "expo-sms";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdicionarContatoScreen = () => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [addedContacts, setAddedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showContactListModal, setShowContactListModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [allContacts, setAllContacts] = useState([]);

  useEffect(() => {
    const requestContactsPermission = async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === "granted") {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
            sort: Contacts.SortTypes.FirstName,
          });
          setAllContacts(data);
        } else {
          console.log("Permission denied for contacts");
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    requestContactsPermission();
    loadContacts();
  }, []);

  useEffect(() => {
    saveContacts();
  }, [addedContacts]);

  const loadContacts = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem("addedContacts");
      if (savedContacts !== null) {
        setAddedContacts(JSON.parse(savedContacts));
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const saveContacts = async () => {
    try {
      await AsyncStorage.setItem(
        "addedContacts",
        JSON.stringify(addedContacts)
      );
    } catch (error) {
      console.error("Error saving contacts:", error);
    }
  };

  const handleDeleteContact = (index) => {
    const updatedContacts = [...addedContacts];
    updatedContacts.splice(index, 1);
    setAddedContacts(updatedContacts);
  };

  const handleCallContact = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleSendSMS = async (phoneNumber) => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      SMS.sendSMSAsync([phoneNumber], "");
    } else {
      console.log("SMS is not available on this device");
    }
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
  
    if (!text) {
      setSelectedContacts([]);
      return;
    }
  
    const filteredContacts = allContacts.filter((contact) => {
      const validName =
        contact.name &&
        contact.name.toLowerCase().includes(text.toLowerCase());
      const validPhoneNumber =
        contact.phoneNumbers &&
        contact.phoneNumbers.some((phone) =>
          phone.number.toLowerCase().includes(text.toLowerCase())
        );
  
      return validName || validPhoneNumber;
    });
  
    const sortedContacts = filteredContacts.sort((a, b) => {
      // Priorizar a ordenação por nome se o texto de pesquisa for alfabético
      if (isNaN(text)) {
        return a.name.localeCompare(b.name);
      }
      // Caso contrário, priorizar a ordenação por número
      return a.phoneNumbers[0].number.localeCompare(b.phoneNumbers[0].number);
    });
  
    setSelectedContacts(sortedContacts);
  };
  

  const renderContactItem = ({ item }) => {
    if (!item.name || item.name === "null" || item.name === "null null") {
      return null; // Retorna null para não renderizar nada
    }
  
    return (
      <TouchableOpacity onPress={() => handleAddSelectedContacts(item)}>
        <View style={styles.contactItem}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.phoneNumbers && item.phoneNumbers.length > 0 && (
            <Text style={styles.contactNumber}>
              {item.phoneNumbers[0].number}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  

  const handleAddSelectedContacts = (contact) => {
    const isContactAlreadyAdded = addedContacts.some(
      (addedContact) => addedContact.id === contact.id
    );
  
    if (!isContactAlreadyAdded) {
      const newContact = {
        id: contact.id,
        name: contact.name,
        phoneNumbers: contact.phoneNumbers,
      };
  
      const newAddedContacts = [...addedContacts, newContact];
      setAddedContacts(newAddedContacts);
  
      setConfirmationMessage(`${contact.name} adicionado com sucesso`);
      setShowConfirmationModal(true);
      setTimeout(() => setShowConfirmationModal(false), 2000);
    } else {
      setConfirmationMessage(`${contact.name} já está na lista de contatos`);
      setShowConfirmationModal(true);
      setTimeout(() => setShowConfirmationModal(false), 2000);
    }
    setShowContactListModal(false);
  };
  
  const renderAddedContactItem = ({ item, index }) => (
    <View style={styles.contactContainer}>
      <View style={styles.contactItem}>
        <Text style={styles.contactName}>{item.name.substring(0, 14)}</Text>
        {item.phoneNumbers && item.phoneNumbers.length > 0 && (
          <Text style={styles.contactNumber}>{item.phoneNumbers[0].number}</Text>
        )}
        <View style={styles.contactActions}>
          <TouchableOpacity
            onPress={() => handleCallContact(item.phoneNumbers[0].number)}
          >
            <Ionicons
              name="call"
              size={24}
              color="#008080"
              style={styles.actionIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSendSMS(item.phoneNumbers[0].number)}
          >
            <Ionicons
              name="chatbox"
              size={24}
              color="#008080"
              style={styles.actionIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteContact(index)}>
            <Ionicons
              name="trash-outline"
              size={24}
              color="#ff0000"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleDeleteAllContacts = () => {
    setAddedContacts([]); // Limpa a lista de contatos adicionados
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setShowContactListModal(true)}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>Adicionar Contatos</Text>
        <Ionicons name="person-add" size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDeleteAllContacts}>
        <Text style={styles.deleteAllButton}>Apagar Todos</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Contatos Adicionados</Text>
      <FlatList
        data={addedContacts}
        renderItem={renderAddedContactItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.contactList}
      />
      <Modal
        visible={showContactListModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowContactListModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar Contatos"
            value={searchTerm}
            onChangeText={handleSearch}
          />
          {selectedContacts.length === 0 && (
            <View style={styles.noContactsContainer}>
              <Text style={styles.noContactsText}>Contato não existe</Text>
            </View>
          )}
          {selectedContacts.length > 0 && (
            <FlatList
              data={selectedContacts}
              renderItem={renderContactItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.contactList}
            />
          )}
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={() => setShowContactListModal(false)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddSelectedContacts}>
              <Text style={styles.modalButtonText}>Concluir</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={showConfirmationModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.confirmationModalContainer}>
          <Text style={styles.confirmationText}>{confirmationMessage}</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3c0c7b",
    paddingVertical: 25,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: "#9344fa",
    padding: 20,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 18,
    color: "white",
    marginRight: 10,
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  contactList: {
    flex: 1,
    width: "100%",
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#ccc",
    paddingHorizontal: 10,

  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  contactContainer: {
    backgroundColor: "#9995",
    borderRadius: 10,
    marginVertical: 15,

  },
  contactNumber: {
    fontSize: 14,
    color: "#ccc",
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionIcon: {},
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#3c0c7b",
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButtonText: {
    fontSize: 18,
    color: "#008080",
    fontWeight: "bold",
  },
  confirmationModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    elevation: 5,
  },
  confirmationText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 10,
  },
  deleteAllButton: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff0000",
    marginBottom: 10,
  },
  noContactsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noContactsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});

export default AdicionarContatoScreen;
