import { MasterData } from "./MasterData.model";

export interface User extends MasterData {
  username: string;
  password?: string;
  role: string;
}
