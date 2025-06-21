import { Timestamp } from "firebase/firestore";

export interface Activity {
  id: string;
  timestamp: Date;
  time: string;
  desc: string;
  type: "user" | "ticket" | "station" | "system";
}
