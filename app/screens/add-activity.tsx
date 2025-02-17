import { Stack, router } from 'expo-router';
import { useState, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  View,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import { addActivity } from '@/services/database';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddActivityScreen(): JSX.Element {
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = async (): Promise<void> => {
    Keyboard.dismiss();
    inputRef.current?.blur();

    const stepsNumber = parseInt(inputValue.trim());
    if (!isNaN(stepsNumber) && stepsNumber > 0) {
      try {
        await addActivity(stepsNumber, Date.now());
        router.replace('/');
      } catch (error) {
        console.error('Error adding activity:', error);
        Alert.alert('Error', 'Failed to add activity');
      }
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid number of steps');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Stack.Screen
            options={{
              title: 'Add Activity',
              headerStyle: styles.headerStyle,
              headerTitleStyle: styles.headerTitleStyle,
            }}
          />
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Add Activity</Text>

            <TextInput
              ref={inputRef}
              style={[styles.input, { color: '#000' }]}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Enter Steps"
              placeholderTextColor="#666666"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              blurOnSubmit={true}
            />

            <View style={styles.buttonsWrapper}>
              <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Add activity</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Go back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF9E6',
  },
  container: {
    flex: 1,
    backgroundColor: '#FEF9E6',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  headerStyle: {
    backgroundColor: '#FEF9E6',
    shadowOpacity: 0,
    elevation: 0,
  },
  headerTitleStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#000000',
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    marginHorizontal: 0,
  },
  buttonsWrapper: {
    marginHorizontal: 0,
  },
  button: {
    width: '100%',
    padding: 15,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#1ED2AF',
  },
  backButton: {
    backgroundColor: '#D00414',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
