export interface PriceSetting {
  id?: string;
  name: string;
  original_grap: number; 
  price: number; 
  extra_price_per_station: number; 
  created_at?: Date;
  updated_at?: Date;
}

export interface StationPriceCalculation {
  fromStation: string;
  toStation: string;
  distance: number;
  calculatedPrice: number;
  isBasePrice: boolean;
}
