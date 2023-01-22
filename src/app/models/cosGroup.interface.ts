import { CosGroupMember } from "./cosGroupMember.interface";
import { PlaceLocation } from "./location.interface";

export interface CosGroup {
    id?: string,
    creationDate?: Date;
    title: string,
    series: string,
    imageUrl: string,
    place: string,
    dateFrom: Date,
    dateTo: Date,
    userId: string,
    location: PlaceLocation,
    cosMembers: CosGroupMember
}