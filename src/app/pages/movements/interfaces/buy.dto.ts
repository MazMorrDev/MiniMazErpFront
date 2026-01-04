import { MovementDto } from "./movement.dto";

export interface BuyDto extends MovementDto {
    unitPrice: number;
}
