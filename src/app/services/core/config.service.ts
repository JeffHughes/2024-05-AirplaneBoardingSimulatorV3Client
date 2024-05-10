import { Injectable, signal } from '@angular/core';
import { Passenger } from '../../classes/passenger';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  binCount = signal(12);
  slotsPerBin = signal(6);
  slotsPerParallelBinsCount = signal(this.slotsPerBin() * 2);
  passengerRowCount = signal(24);
  seatsPerPassengerRow = signal(6);
  walkwaySpots = signal(15);
  passengerCount = signal(143);

  families = signal<any>([]);

  bins() {
    return Array.from({ length: this.binCount() }, (v, k) => k + 1);
  }

  rows() {
    return Array.from({ length: this.passengerRowCount() }, (v, k) => k + 1);
  }

  seatsABC() {
    return Array.from({ length: 3 }, (v, k) => String.fromCharCode(65 + k));
  }

  seatsDEF() {
    return Array.from({ length: 3 }, (v, k) => String.fromCharCode(68 + k));
  }

  seatStyle() {
    return { width: "calc(100% / " + this.passengerRowCount() + ")" };
  }

  walkway() {
    return Array.from({ length: this.walkwaySpots() }, (v, k) => k + 1);
  }


  passengers() {
    return Array.from({ length: this.passengerCount() }, (v, i) => ({
      id: i + 1,
    }));
  }

  familyPassengers(passengerCount: number) {
    return Array.from({ length: passengerCount }, (v, i) => ({
      id: i + 1,
    }));
  }


  

}
