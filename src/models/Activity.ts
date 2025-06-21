export interface Activity {
  id: string;
  type: "user" | "ticket" | "station" | "system";
  desc: string;
  timestamp: any;
  userId?: string;
  metadata?: {
    [key: string]: any;
  };
}
