import { CardInstance } from "../cards/CardInstance";

export class Slot {

    private card?: CardInstance;

    /**
     * カードを置く
     */
    public setCard(card: CardInstance): void {
        this.card = card;
    }

    /**
     * カードを取り除く
     */
    public removeCard(): CardInstance | undefined {
        const removed = this.card;
        this.card = undefined;
        return removed;
    }

    /**
     * カード取得
     */
    public getCard(): CardInstance | undefined {
        return this.card;
    }

    /**
     * 空きか判定
     */
    public isEmpty(): boolean {
        return this.card === undefined;
    }

}