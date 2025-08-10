import { MasterData } from "./MasterData.model";

export interface Customer extends MasterData {
  name: string;
  phoneNumber?: string;
  nationalId?: string;
  address?: string;
}
