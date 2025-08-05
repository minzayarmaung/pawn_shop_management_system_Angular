// models/create-pawn-request.model.ts
export interface CreatePawnRequest {
  customer: {
    name: string;
    phoneNumber: string;
    nationalId?: string;
    address?: string;
  };
  item: {
    type: string;
    brand: string;
    model: string;
    imei?: string;
    description: string;
  };
  loanAmount: number;
}