import { CardType } from "../enum/CardType";

export type CardFilter = {
  cardTypes?: CardType[];
  names?: string[];
  colors?: string[];
  features?: string[];

  minBp?: number;
  maxBp?: number;

  minRequiredEnergyTotal?: number;
  maxRequiredEnergyTotal?: number;
};