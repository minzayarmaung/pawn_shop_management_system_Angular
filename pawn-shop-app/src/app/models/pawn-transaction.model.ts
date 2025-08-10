import { Customer } from './customer.model';
import { MasterData } from './MasterData.model';
import { PawnItem } from './pawn-item.model';
import { Setup } from './setup.model';

export interface PawnTransaction extends MasterData {
  customer: Customer;
  pawnItem: PawnItem;
  pawnDate: string;
  dueDate: string;
  loanAmount: number;
  setup: Setup;
  totalRepayment: number;
  redeemed: boolean;
  redeemedDate?: string;
  voucherNumber: string;
}
