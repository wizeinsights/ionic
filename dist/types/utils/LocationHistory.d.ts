import { Location as HistoryLocation } from 'history';
export declare class LocationHistory {
    locationHistory: HistoryLocation[];
    add(location: HistoryLocation): void;
    findLastLocation(url: string): HistoryLocation<any> | undefined;
}
