import { CosGroup } from "./cosGroup.interface";
import { CosGroupMember } from "./cosGroupMember.interface";
import { Cosplay } from "./cosplay.interface";

export interface Group {
    cosplay: Cosplay,
    cosGroup: CosGroup,
    cosGroupMember: CosGroupMember
}