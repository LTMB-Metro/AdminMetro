import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { PriceSetting } from "../models/PriceSetting";

const COLLECTION_NAME = "price_setting";

export const priceSettingService = {
  // Lấy cài đặt giá hiện tại
  async getCurrentPriceSetting(): Promise<PriceSetting | null> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      if (querySnapshot.empty) return null;

      const doc = querySnapshot.docs[0]; 
      return {
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate(),
        updated_at: doc.data().updated_at?.toDate(),
      } as PriceSetting;
    } catch (error) {
      console.error("Error fetching price setting:", error);
      throw error;
    }
  },

  // Thêm cài đặt giá mới
  async addPriceSetting(
    priceSetting: Omit<PriceSetting, "id" | "created_at" | "updated_at">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...priceSetting,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding price setting:", error);
      throw error;
    }
  },

  // Cập nhật cài đặt giá (cập nhật vào document hiện có)
  async updatePriceSetting(
    priceSetting: Omit<PriceSetting, "id" | "created_at" | "updated_at">
  ): Promise<void> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));

      if (querySnapshot.empty) {
        throw new Error("Không tìm thấy cài đặt giá để cập nhật");
      }

      const docId = querySnapshot.docs[0].id; // Lấy ID của document đầu tiên
      const docRef = doc(db, COLLECTION_NAME, docId);

      await updateDoc(docRef, {
        ...priceSetting,
        updated_at: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating price setting:", error);
      throw error;
    }
  },

  // Xóa cài đặt giá
  async deletePriceSetting(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error("Error deleting price setting:", error);
      throw error;
    }
  },

  // Tính giá vé dựa trên khoảng cách
  calculateTicketPrice(distance: number, priceSetting: PriceSetting): number {
    if (distance <= priceSetting.original_grap) {
      return priceSetting.price;
    }

    const extraStations = distance - priceSetting.original_grap;
    return (
      priceSetting.price + extraStations * priceSetting.extra_price_per_station
    );
  },

  // Tạo ma trận giá cho tất cả các tuyến đường
  generatePriceMatrix(
    stations: any[],
    priceSetting: PriceSetting
  ): { [key: string]: number } {
    const priceMatrix: { [key: string]: number } = {};

    for (let i = 0; i < stations.length; i++) {
      for (let j = i + 1; j < stations.length; j++) {
        const distance = Math.abs(
          stations[j].order_index - stations[i].order_index
        );
        const price = this.calculateTicketPrice(distance, priceSetting);

        const key1 = `${stations[i].id}-${stations[j].id}`;
        const key2 = `${stations[j].id}-${stations[i].id}`;

        priceMatrix[key1] = price;
        priceMatrix[key2] = price;
      }
    }

    return priceMatrix;
  },
};
