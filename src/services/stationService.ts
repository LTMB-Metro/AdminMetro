import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  GeoPoint,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Station {
  id: string;
  code: string;
  station_name: string;
  location: [number, number] | null; // Always array format for frontend
  order_index: number;
  status: "active" | "inactive" | "maintenance";
  type: "elevated" | "underground";
  zone: string;
}

// Helper function to convert GeoPoint to array
const convertLocationToArray = (location: any): [number, number] | null => {
  if (!location) return null;

  // If it's already an array
  if (Array.isArray(location) && location.length >= 2) {
    return [location[0], location[1]];
  }

  // If it's a GeoPoint
  if (location.latitude !== undefined && location.longitude !== undefined) {
    return [location.latitude, location.longitude];
  }

  return null;
};

// Fetch all stations
export const fetchStations = async (): Promise<Station[]> => {
  try {
    const stationsQuery = query(
      collection(db, "stations"),
      orderBy("order_index", "asc")
    );
    const snapshot = await getDocs(stationsQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const locationArray = convertLocationToArray(data.location);

      return {
        id: doc.id,
        ...data,
        location: locationArray,
      };
    }) as Station[];
  } catch (error) {
    console.error("Error fetching stations:", error);
    throw error;
  }
};

// Add new station
export const addStation = async (
  station: Omit<Station, "id">
): Promise<string> => {
  try {
    // Convert array location to GeoPoint for storage
    const stationData: any = {
      ...station,
      location: station.location
        ? new GeoPoint(station.location[0], station.location[1])
        : null,
    };

    const docRef = await addDoc(collection(db, "stations"), stationData as any);
    return docRef.id;
  } catch (error) {
    console.error("Error adding station:", error);
    throw error;
  }
};

// Update station
export const updateStation = async (
  id: string,
  station: Partial<Station>
): Promise<void> => {
  try {
    // Convert array location to GeoPoint for storage
    const updateData: any = {
      ...station,
    };

    if (station.location && Array.isArray(station.location)) {
      updateData.location = new GeoPoint(
        station.location[0],
        station.location[1]
      );
    }

    const stationRef = doc(db, "stations", id);
    await updateDoc(stationRef, updateData);
  } catch (error) {
    console.error("Error updating station:", error);
    throw error;
  }
};

// Delete station
export const deleteStation = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "stations", id));
  } catch (error) {
    console.error("Error deleting station:", error);
    throw error;
  }
};
