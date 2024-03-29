import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';

export default class Cliente extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      clientes: [],
      filteredClientes: [],
      modalVisible: false,
      nombre: '',
      apellido: '',
      edad: '',
      tipoDocumento: '',
      numDocumento: '',
      correo: '',
      editingClienteId: null,
      isEditing: false,
      successMessage: '', // Nuevo estado para el mensaje de éxito
    };
  }

  componentDidMount() {
    this.getClientes();
  }

  getClientes = () => {
    this.setState({ loading: true });
    fetch('https://localhost:7284/api/clientes')
      .then(res => res.json())
      .then(data => {
        this.setState({
          clientes: data,
          filteredClientes: data,
          loading: false
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  };

  handleSearch = text => {
    const filteredClientes = this.state.clientes.filter(cliente => {
      return cliente.nombre.toLowerCase().includes(text.toLowerCase());
    });
    this.setState({ filteredClientes });
  };

  handleEdit = clienteId => {
    const cliente = this.state.clientes.find(cliente => cliente.clienteId === clienteId);
    this.setState({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      edad: cliente.edad,
      tipoDocumento: cliente.tipoDocumento,
      numDocumento: cliente.numDocumento,
      correo: cliente.correo,
      editingClienteId: clienteId,
      modalVisible: true,
      isEditing: true, // Establecer isEditing como true al entrar en modo de edición
      successMessage: '', // Limpiar mensaje de éxito al editar
    });
  };
  
  handleSave = async () => {
    const { nombre, apellido, edad, tipoDocumento, numDocumento, correo, editingClienteId, isEditing } = this.state;
    const data = { nombre, apellido, edad, tipoDocumento, numDocumento, correo };

    // Validaciones de datos
    if (!/^[a-zA-Z]+$/.test(nombre)) {
      alert('El nombre solo puede contener letras.');
      return;
    }
    if (!/^[a-zA-Z]+$/.test(apellido)) {
      alert('El apellido solo puede contener letras.');
      return;
    }
    if (tipoDocumento !== 'CC' && tipoDocumento !== 'CE') {
      alert('El tipo de documento solo puede ser CC o CE.');
      return;
    }
    if (!/^\d{7,10}$/.test(numDocumento)) {
      alert('El número de documento debe contener entre 7 y 10 dígitos.');
      return;
    }
    if (!/^\d+$/.test(edad) || parseInt(edad) < 18 || parseInt(edad) > 100) {
      alert('La edad debe ser un número entero mayor o igual a 18 y menor a 100');
      return;
    }
    if (!correo.endsWith('@gmail.com')) {
      alert('El correo debe terminar en @gmail.com.');
      return;
    }

    const url = editingClienteId ? `https://localhost:7284/api/clientes/${editingClienteId}` : 'https://localhost:7284/api/clientes';
  
    try {
      const method = editingClienteId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log('Response:', responseData);
      
      if (!isEditing) {
        // Agregar una nueva línea para actualizar la lista después de agregar un nuevo cliente
        await this.getClientes();
        // Recargar la página para obtener los datos actualizados de la base de datos
        this.forceUpdate();
      }
      
      // Limpia el estado y cierra el modal
      this.setState({ 
        modalVisible: false, 
        nombre: '', 
        apellido: '', 
        edad: '', 
        tipoDocumento: '', 
        numDocumento: '', 
        correo: '', 
        editingClienteId: null, 
        isEditing: false, 
        successMessage: isEditing ? 'Los cambios se guardaron correctamente.' : 'El cliente se agregó correctamente.', // Mensaje de éxito
      });
    } catch (error) {
      console.error('Error saving cliente:', error);
    }
    
  };

  handleDelete = async clienteId => {
    try {
      await fetch(`https://localhost:7284/api/clientes/${clienteId}`, { method: 'DELETE' });
      // Eliminar la fila correspondiente de los datos del cliente y de los clientes filtrados
      const updatedClientes = this.state.clientes.filter(cliente => cliente.clienteId !== clienteId);
      const updatedFilteredClientes = this.state.filteredClientes.filter(cliente => cliente.clienteId !== clienteId);
      this.setState({ clientes: updatedClientes, filteredClientes: updatedFilteredClientes });
    } catch (error) {
      console.error('Error deleting cliente:', error);
    }
  };
  
  
  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.buttonContainer, { flexDirection: 'row', marginLeft: 300   }]}>
          <TouchableOpacity
            onPress={() => this.setState({ modalVisible: true })}
            style={{
              backgroundColor: '#440000',
              padding: 10,
              borderRadius: 50,
              marginBottom: 5,
              width: 150,
              marginRight: 10,
              marginTop: 20,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Registrar Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({ modalVisible: true })}
            style={{
              backgroundColor: '#440000',
              padding: 10,
              borderRadius: 50,
              marginBottom: 5,
              width: 150,
              marginTop: 20,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Buscar Cliente</Text>
          </TouchableOpacity>
          <TextInput
              style={styles.searchInput}
              placeholder="Buscar Caja....."
              onChangeText={this.handleSearch}
            />
        </View>
        
              <View style={styles.containerdos}>
                <Text style={styles.headerItem }>Empresa: Diablo Amargo</Text>
                <Text style={styles.headerItem}>Direccion: </Text>
              </View>
              <View style={styles.containertres}>
                <Text style={styles.headerItem }>Fecha De Compra:</Text>
                <Text style={styles.headerItem}>Id Cliente: </Text>
                <Text style={styles.headerItem}>Id Empleado: </Text>
              </View>
            
            <View style={styles.containercuatro}>
                <Text style={styles.headerItem }>ID:</Text>
                <Text style={styles.headerItem }>Nombre:</Text>
                <Text style={styles.headerItem }>Precio Unitario:</Text>
                <Text style={styles.headerItem }>Cantidad:</Text>
                
            </View>
            <View style={[styles.buttonContainerdos, { flexDirection: 'row', marginLeft: 300   }]}>
          <TouchableOpacity
            onPress={() => this.setState({ modalVisible: true })}
            style={{
              backgroundColor: '#440000',
              padding: 10,
              borderRadius: 50,
              marginBottom: 5,
              width: 150,
              marginRight: 10,
              marginTop: 20,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({ modalVisible: true })}
            style={{
              backgroundColor: '#440000',
              padding: 10,
              borderRadius: 50,
              marginBottom: 5,
              width: 150,
              marginTop: 20,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Cancelar</Text>
          </TouchableOpacity>
          <View style={styles.box}>
            <Text style={styles.text}>SubTotal:0</Text>
          </View>
          <View style={styles.boxuno}>
            <Text style={styles.text}>IVA:0</Text>
          </View>
          <View style={styles.boxdos}>
            <Text style={styles.text}>Total:0</Text>
          </View>
          <FlatList
              contentContainerStyle={styles.tableGroupDivider}
              data={this.state.facturas}
              renderItem={({ item, index }) => (
                <TouchableOpacity>
                  <View style={styles.row}>
                    <Text style={[styles.item, { flex: 1 }]}>{index + 1}</Text>
                    <Text style={[styles.item, { flex: 2 }]}>{item.fechaCompra}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.ivaCompra}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.subtotal}</Text>
                    <Text style={[styles.item, { flex: 1 }]}>{item.total}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a9a9a9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#440000',
    borderWidth: 1,
    flex: 1,
    paddingLeft: 10,
    borderRadius: 10,
    color: 'black',
    backgroundColor: 'white',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 10,
    marginHorizontal: 10,
  },
  item: {
    flex: 1,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#440000',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: '#440000',
    color: 'white',
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successMessageContainer: {
    backgroundColor: '#00FF00',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  successMessageText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    row: 'space',
},


searchInput: {
    height: 40,
    borderColor: '#440000',
    borderWidth: 1,
    flex: 1,
    paddingLeft: 10,
    borderRadius: '10px',
    color :'black',
    backgroundColor: 'white',
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 3.5,
    marginRight: 300,
    borderRadius: 30
  },



containerdos: {
    flex: 1,
    backgroundColor: 'white',
    marginLeft: 300,
    marginRight: 300,
    marginTop: 3,
    margin:'30px'
  },
  containertres: {
    flex: 1,
    marginLeft: 300,
    marginRight: 300,
    marginTop: -28,
    backgroundColor: 'white',
    margin:'40px'
  },
  containercuatro: {
    flex: 1,
    marginLeft: 300,
    marginRight: 300,
    marginTop: -38.5,
    display: 'flex',
    flexDirection: 'row',
    columnGap: '150px',
    backgroundColor: 'white',
    margin:'30px'
  },




buttonContainerdos:{
    row: 'space',
    marginTop: -34,
  },




box: {
    marginTop: 25,
    borderColor: 'black',
    padding: 1,
    marginLeft: 100,
    marginRight: -35,
  

  },
  boxdos: {
    marginTop: 25,
    borderColor: 'black',
    padding: 1,
    marginLeft: 100,
    marginRight: -55,
  },
  boxuno: {
    marginTop: 25,
    borderColor: 'black',
    padding: 1,
    marginLeft: 100,
    marginRight: -54,
  },

});
