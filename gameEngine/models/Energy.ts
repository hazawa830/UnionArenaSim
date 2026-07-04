// エナジーの色
import { EnergyColor } from "../enum/EnergyColor";

// 各色のエナジー数
export type EnergyMap = {
  red: number;
  blue: number;
  green: number;
  yellow: number;
  purple: number;
};

export class Energy {
  private amounts: EnergyMap;

  constructor(amounts?: Partial<EnergyMap>) {
    this.amounts = {
      red: 0,
      blue: 0,
      green: 0,
      yellow: 0,
      purple: 0,
      ...amounts,
    };
  }

  /**
   * 指定した色のエナジー数を取得
   */
  public get(color: EnergyColor): number {
    return this.amounts[color];
  }

  /**
   * 指定した色のエナジーを追加
   */
  public add(energy: Energy): void {
    this.amounts.red += energy.get(EnergyColor.Red);
    this.amounts.blue += energy.get(EnergyColor.Blue);
    this.amounts.green += energy.get(EnergyColor.Green);
    this.amounts.yellow += energy.get(EnergyColor.Yellow);
    this.amounts.purple += energy.get(EnergyColor.Purple);
  }

  /**
   * 必要エナジーを満たしているか判定
   */
  public canPay(required: Energy): boolean {
    return (
      this.amounts.red >= required.get(EnergyColor.Red) &&
      this.amounts.blue >= required.get(EnergyColor.Blue) &&
      this.amounts.green >= required.get(EnergyColor.Green) &&
      this.amounts.yellow >= required.get(EnergyColor.Yellow) &&
      this.amounts.purple >= required.get(EnergyColor.Purple)
    );
  }

  /**
   * デバッグ用
   */
  public toString(): string {
    return JSON.stringify(this.amounts);
  }
  public getTotal(): number {
  return this.amounts.red + this.amounts.blue + this.amounts.green + this.amounts.yellow + this.amounts.purple;
}
}