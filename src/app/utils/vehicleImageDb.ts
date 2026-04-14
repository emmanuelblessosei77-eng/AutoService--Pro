/**
 * IndexedDB utility for storing vehicle images
 * Provides higher storage capacity (50MB+) compared to localStorage (5-10MB)
 */

const DB_NAME = 'CarServiceApp';
const STORE_NAME = 'vehicleImages';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

// Initialize IndexedDB
export const initImageDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('✅ IndexedDB initialized');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'vehicleId' });
        store.createIndex('vehicleId', 'vehicleId', { unique: true });
        console.log('✅ IndexedDB store created');
      }
    };
  });
};

// Save images for a vehicle
export const saveVehicleImages = async (vehicleId: string, images: string[]): Promise<void> => {
  try {
    const database = await initImageDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const data = {
      vehicleId,
      images,
      savedAt: new Date().toISOString(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => {
        console.log(`✅ Saved ${images.length} images for vehicle ${vehicleId} to IndexedDB`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to save images to IndexedDB:', err);
    throw err;
  }
};

// Load images for a vehicle
export const loadVehicleImages = async (vehicleId: string): Promise<string[]> => {
  try {
    const database = await initImageDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(vehicleId);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.images) {
          console.log(`✅ Loaded ${result.images.length} images for vehicle ${vehicleId} from IndexedDB`);
          resolve(result.images);
        } else {
          resolve([]);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to load images from IndexedDB:', err);
    return [];
  }
};

// Delete images for a vehicle
export const deleteVehicleImages = async (vehicleId: string): Promise<void> => {
  try {
    const database = await initImageDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(vehicleId);
      request.onsuccess = () => {
        console.log(`✅ Deleted images for vehicle ${vehicleId} from IndexedDB`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to delete images from IndexedDB:', err);
    throw err;
  }
};

// Load all vehicle images at once
export const loadAllVehicleImages = async (vehicleIds: string[]): Promise<{[key: string]: string[]}> => {
  const allImages: {[key: string]: string[]} = {};

  for (const vehicleId of vehicleIds) {
    const images = await loadVehicleImages(vehicleId);
    if (images.length > 0) {
      allImages[vehicleId] = images;
    }
  }

  return allImages;
};
