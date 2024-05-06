import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

export const ContatosDeEmergencia = () => {

  const fazerLigacao = (numero) => {
    // Lógica para fazer a ligação para o número de emergência
    Linking.openURL(`tel:${numero}`)
      .catch((err) => console.error('Erro ao fazer a ligação:', err));
  };

  return (
    <View style={styles.container}>
      <View style={styles.coluna}>
        <TouchableOpacity style={styles.quadrado} onPress={() => fazerLigacao('193')}>
          <Text style={styles.texto}>Bombeiros</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quadrado} onPress={() => fazerLigacao('197')}>
          <Text style={styles.texto}>Polícia Civil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quadrado} onPress={() => fazerLigacao('180')}>
          <Text style={styles.texto}>Delegacia da Mulher</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.coluna}>
        <TouchableOpacity style={styles.quadrado} onPress={() => fazerLigacao('192')}>
          <Text style={styles.texto}>Ambulância</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quadrado} onPress={() => fazerLigacao('192')}>
          <Text style={styles.texto}>SAMU</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quadrado} onPress={() => fazerLigacao('180')}>
          <Text style={styles.texto}>Centro da Mulher</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    alignItems: 'center',
    backgroundColor:'#3c0c7b',
  },
  coluna: {
    flexDirection: 'column',
  },
  quadrado: {
    backgroundColor: '#9344fa',
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
    height: 180,
    width: 150,
    borderRadius: 10,
    justifyContent: 'center',
    flexDirection: 'column'

  },
  texto: {
    marginBottom: 10,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
});
export default ContatosDeEmergencia;