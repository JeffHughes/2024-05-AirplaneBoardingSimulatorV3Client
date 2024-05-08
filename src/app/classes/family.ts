export type Family = {
    familyID?: number  ;
    passengerIDs: number[];
    size: number;
    location?: string;
    sequence?: number;
    animationInProgress?: boolean;
}