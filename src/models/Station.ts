export interface Station {
  id: string;
  name: string;
  code: string;
  location: {
    lat: number;
    lng: number;
  };
  type: "elevated" | "underground";
  status: "active" | "maintenance" | "inactive";
  createdAt: any;
  updatedAt: any;
}
