export interface Profile {
  id?: number;
  profilePic?: string | null;   // S3 URL - can be string, null, or undefined
  profilePicKey?: string | null; // S3 Object Key - can be string, null, or undefined
  name: string;
  nrc: string;
  phone: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  email?: string | null;
  usageTime?: string | null;
  message: string,
  data: string,
  userid: any
}