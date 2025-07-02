export interface UserTicket {
  id: string;
  user_id: string;
  ticket_name: string;
  ticket_type: string;
  status: "unused" | "active" | "expired";
  activate_time?: any;
  auto_activate_time?: any;
  booking_time: any;
  description?: string;
  duration: number;
  end_station_code?: string;
  inactive_time?: any;
  note?: string;
  number_used: number;
  price: number;
  qr_code_content?: string;
  start_station_code?: string;
  createdAt?: any;
  updatedAt?: any;
  user_name?: string;
  user_email?: string;
  _documentPath?: string;
}
