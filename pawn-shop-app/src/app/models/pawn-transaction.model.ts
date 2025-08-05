import { Customer } from "./customer.model";
import { Item } from "./item.model";

// models/pawn-transaction.model.ts
export interface PawnTransaction {
  id?: number;
  customer: Customer;
  item: Item;
  pawnDate: Date;
  dueDate: Date;
  loanAmount: number;
  serviceFee: number;
  totalRepayment: number;
  isRedeemed: boolean;
  redeemedDate?: Date;
  voucherNumber: string;
}