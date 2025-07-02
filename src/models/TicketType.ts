export interface TicketType {
  id: string;
  ticket_name: string;
  type: string;
  price: number;
  categories: string;
  duration: number;
  note?: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: any;
  updatedAt: any;
}
