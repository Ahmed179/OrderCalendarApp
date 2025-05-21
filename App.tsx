import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  FlatList,
  Modal,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {Calendar} from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import mockData from './mockData.json';

interface Order {
  id: string;
  name: string;
  description: string;
  car: 'Audi' | 'BMW' | 'Mercedes' | 'VW';
  date: string;
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [orders, setOrders] = useState<Order[]>(mockData.orders as Order[]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [car, setCar] = useState<Order['car']>('Audi');
  const [date, setDate] = useState(new Date());

  const handleAddOrder = () => {
    setIsEditMode(false);
    setCurrentOrder(null);
    setName('');
    setDescription('');
    setCar('Audi');
    setDate(new Date());
    setIsModalVisible(true);
  };

  const handleEditOrder = (order: Order) => {
    setIsEditMode(true);
    setCurrentOrder(order);
    setName(order.name);
    setDescription(order.description);
    setCar(order.car);
    setDate(new Date(order.date));
    setIsModalVisible(true);
  };

  const handleDeleteOrder = (id: string) => {
    const newOrders = orders.filter(order => order.id !== id);
    setOrders(newOrders);
    Toast.show({
      type: 'info',
      text1: 'Order deleted',
    });
  };

  const handleSaveOrder = () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please enter an order name',
      });
      return;
    }

    const orderDate = date.toISOString().split('T')[0];
    const newOrder: Order = {
      id: isEditMode && currentOrder ? currentOrder.id : Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      car,
      date: orderDate,
    };

    let newOrders;
    if (isEditMode && currentOrder) {
      newOrders = orders.map(order =>
        order.id === currentOrder.id ? newOrder : order,
      );
    } else {
      newOrders = [newOrder, ...orders];
    }

    setOrders(newOrders);
    setIsModalVisible(false);
    Toast.show({
      type: 'success',
      text1: isEditMode ? 'Order updated' : 'Order created',
    });
  };

  const renderOrderItem = ({item}: {item: Order}) => (
    <View style={[styles.orderItem, isDarkMode && styles.orderItemDark]}>
      <View style={styles.orderHeader}>
        <Text style={[styles.orderName, isDarkMode && styles.textDark]}>
          {item.name}
        </Text>
        <Text style={[styles.orderCar, isDarkMode && styles.textDark]}>
          {item.car}
        </Text>
      </View>
      <Text style={[styles.orderDescription, isDarkMode && styles.textDark]}>
        {item.description}
      </Text>
      <Text style={[styles.orderDate, isDarkMode && styles.textDark]}>
        {new Date(item.date).toLocaleDateString()}
      </Text>
      <View style={styles.orderButtons}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => handleEditOrder(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeleteOrder(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getMarkedDates = () => {
    const marked: {[key: string]: {marked: boolean}} = {};
    orders.forEach(order => {
      marked[order.date] = {marked: true};
    });
    return marked;
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff'},
      ]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#1a1a1a' : '#ffffff'}
      />

      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          ...getMarkedDates(),
          [selectedDate]: {
            selected: true,
            marked: getMarkedDates()[selectedDate]?.marked,
          },
        }}
        theme={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          calendarBackground: isDarkMode ? '#1a1a1a' : '#ffffff',
          textSectionTitleColor: isDarkMode ? '#ffffff' : '#000000',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#007AFF',
          dayTextColor: isDarkMode ? '#ffffff' : '#000000',
          textDisabledColor: isDarkMode ? '#444444' : '#d9e1e8',
        }}
      />

      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.textDark]}>
          Orders for {new Date(selectedDate).toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={handleAddOrder}>
          <Text style={styles.buttonText}>Add Order</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders.filter(order => order.date === selectedDate)}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        style={styles.orderList}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff'},
            ]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>
              {isEditMode ? 'Edit Order' : 'Create Order'}
            </Text>

            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              value={name}
              onChangeText={setName}
              placeholder="Order Name"
              placeholderTextColor={isDarkMode ? '#888888' : '#666666'}
            />

            <TextInput
              style={[styles.input, styles.textArea, isDarkMode && styles.inputDark]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor={isDarkMode ? '#888888' : '#666666'}
              multiline
              numberOfLines={3}
            />

            <View style={styles.pickerContainer}>
              <Text style={[styles.label, isDarkMode && styles.textDark]}>
                Car:
              </Text>
              <View style={styles.carButtons}>
                {(['Audi', 'BMW', 'Mercedes', 'VW'] as const).map(carOption => (
                  <TouchableOpacity
                    key={carOption}
                    style={[
                      styles.carButton,
                      car === carOption && styles.carButtonSelected,
                    ]}
                    onPress={() => setCar(carOption)}>
                    <Text
                      style={[
                        styles.carButtonText,
                        car === carOption && styles.carButtonTextSelected,
                      ]}>
                      {carOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.dateButtonText, isDarkMode && styles.textDark]}>
                Date: {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' ? (
              showDatePicker && (
                <View style={styles.iosDatePickerContainer}>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setDate(selectedDate);
                      }
                    }}
                    style={styles.iosDatePicker}
                  />
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.buttonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                />
              )
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveOrder}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  textDark: {
    color: '#ffffff',
  },
  orderList: {
    flex: 1,
  },
  orderItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  orderItemDark: {
    backgroundColor: '#2a2a2a',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderCar: {
    fontSize: 16,
    color: '#007AFF',
  },
  orderDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  orderButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  editButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inputDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#444',
    color: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  carButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  carButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  carButtonSelected: {
    backgroundColor: '#007AFF',
  },
  carButtonText: {
    color: '#000000',
  },
  carButtonTextSelected: {
    color: '#ffffff',
  },
  dateButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  iosDatePickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  iosDatePicker: {
    width: '100%',
    height: 200,
  },
});

export default App;
