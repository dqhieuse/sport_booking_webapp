export type SportStatus = 'ACTIVE' | 'INACTIVE';

export type Sport = {
  id: number;
  name: string;
  description: string | null;
  status: SportStatus;
};
