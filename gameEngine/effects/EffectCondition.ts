export type EffectCondition =
{
    type: "hasCharacterNamesOnField";
    names: string[];
    mode: "all" | "any";
};