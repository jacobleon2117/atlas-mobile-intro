import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

interface Activity {
  id: number;
  steps: number;
  date: number;
}

const STORAGE_KEY = 'activities';

export const initDatabase = async (): Promise<void> => {
  try {
    const db = SQLite.openDatabaseSync('activities.db');
    db.execSync(
      'CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY AUTOINCREMENT, steps INTEGER, date INTEGER);'
    );
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export const getActivities = async (): Promise<Activity[]> => {
  try {
    const db = SQLite.openDatabaseSync('activities.db');
    const results = db.getAllSync('SELECT * FROM activities ORDER BY date DESC;') as Activity[];
    return results;
  } catch (error) {
    console.error('Error fetching activities:', error);

    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  }
};

export const addActivity = async (steps: number, date: number): Promise<void> => {
  try {
    const db = SQLite.openDatabaseSync('activities.db');
    db.runSync('INSERT INTO activities (steps, date) VALUES (?, ?);', [steps, date]);
  } catch (error) {
    console.error('Error adding activity:', error);

    const activities = await getActivities();
    const newId = activities.length > 0 ? Math.max(...activities.map((a) => a.id)) + 1 : 1;

    const newActivity: Activity = { id: newId, steps, date };
    const updatedActivities = [newActivity, ...activities];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedActivities));
  }
};

export const deleteActivity = async (id: number): Promise<void> => {
  try {
    const db = SQLite.openDatabaseSync('activities.db');
    db.runSync('DELETE FROM activities WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error deleting activity:', error);

    const activities = await getActivities();
    const filteredActivities = activities.filter((activity) => activity.id !== id);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredActivities));
  }
};

export const deleteAllActivities = async (): Promise<void> => {
  try {
    const db = SQLite.openDatabaseSync('activities.db');
    db.runSync('DELETE FROM activities;');
  } catch (error) {
    console.error('Error deleting all activities:', error);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};
