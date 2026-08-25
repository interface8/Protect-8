export interface Guide {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  iconKey: string;
  body: string;
  order: number;
  isActive: boolean;
}