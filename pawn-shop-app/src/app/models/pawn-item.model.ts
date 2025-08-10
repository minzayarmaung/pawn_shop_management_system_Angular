import { MasterData } from './MasterData.model';
import { PawnItemDetails } from './pawn-item-details.model';

export interface PawnItem extends MasterData {
  category: string;
  voucherCode: number;
  amount: number;
  pawnDate: string; // ISO Date (YYYY-MM-DD)
  dueDate: string;
  description?: string;
  pawnItemDetailsList?: PawnItemDetails[];
}
