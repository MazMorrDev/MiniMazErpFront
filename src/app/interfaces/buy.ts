import { Movement } from "./movement";

export interface Buy extends Movement {
    unitPrice: number;
}
