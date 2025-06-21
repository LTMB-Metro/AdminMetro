export interface TicketType {
  id: string;
  ticket_name: string;
  description: string;
  price: number;
  duration: number;
  type: string;
  categories: string;
  status: "active" | "inactive";
  note?: string;
  createdAt: any;
  updatedAt: any;
}
