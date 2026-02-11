export type StringLiteralFromEnum<T extends string> = `${T}`;

export type EnumOrStringLiteral<T extends string> = T | StringLiteralFromEnum<T>;
