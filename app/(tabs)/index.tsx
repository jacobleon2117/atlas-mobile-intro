import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, View, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { Text } from 'react-native';
import {
  getActivities,
  initDatabase,
  deleteActivity,
  deleteAllActivities,
} from '@/services/database';

interface Activity {
  id: number;
  steps: number;
  date: number;
}

interface ActivityItemProps {
  item: Activity;
  onDelete: () => void;
}

function ActivityItem({ item, onDelete }: ActivityItemProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}/2025, ${date.toLocaleTimeString()}`;
  };

  const renderRightActions = () => (
    <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      containerStyle={styles.swipeableContainer}
      friction={2}
      rightThreshold={40}
    >
      <View style={styles.activityItem}>
        <View style={styles.activityContent}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <Text style={styles.stepsText}>Steps: {item.steps}</Text>
        </View>
      </View>
    </Swipeable>
  );
}

export default function HomeScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const results = await getActivities();
      setActivities(results);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDatabase();
        await loadActivities();
      } catch (error) {
        console.error('Initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [loadActivities]);

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [loadActivities])
  );

  const handleDeleteActivity = async (id: number) => {
    try {
      await deleteActivity(id);
      await loadActivities();
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllActivities();
      await loadActivities();
    } catch (error) {
      console.error('Failed to delete all activities:', error);
    }
  };

  const renderItem = ({ item }: { item: Activity }) => (
    <ActivityItem item={item} onDelete={() => handleDeleteActivity(item.id)} />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1ED2AF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.listContainer}>
        <FlashList
          data={activities}
          renderItem={renderItem}
          estimatedItemSize={80}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.addActivityButton]}
          onPress={() => router.push('/screens/add-activity')}
        >
          <Text style={styles.buttonText}>Add activity</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.deleteAllButton]} onPress={handleDeleteAll}>
          <Text style={styles.buttonText}>Delete all activities</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9E6',
  },
  listContainer: {
    flex: 1,
    margin: 10,
    paddingHorizontal: 10,
  },
  swipeableContainer: {
    marginHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF9E6',
  },
  listContent: {
    paddingBottom: 100,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    marginBottom: 10,
    backgroundColor: '#FFFEFE',
  },
  activityContent: {
    flex: 1,
    padding: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '400',
  },
  stepsText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  deleteButton: {
    backgroundColor: '#D00414',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '85%',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginBottom: 80,
  },
  button: {
    width: '100%',
    padding: 15,
    alignItems: 'center',
  },
  addActivityButton: {
    backgroundColor: '#1ED2AF',
  },
  deleteAllButton: {
    backgroundColor: '#D00414',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
});
