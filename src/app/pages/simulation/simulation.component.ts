import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { ConfigService } from '../../services/core/config.service';
import { TimelineService } from '../../services/core/timeline.service';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.scss',
})
export class SimulationComponent implements OnInit {
  config = inject(ConfigService);
  timelineService = inject(TimelineService);

  ngOnInit() {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0 });
    tl.to('#motionPath3', { strokeDashoffset: 20, duration: 1, ease: 'none' });

    this.timelineService.createTimelineFromJson();
  }

  speeds: number[] = [0.5, 1, 2, 4, 8, 10];
  currentSpeed = signal(1);

  constructor() {}

  updateTime($event: any): void {
    this.timelineService.timeline.progress($event.value / 100);
  }

  setSpeed(speed: number): void {
    this.currentSpeed.set(speed);
    // Implement the logic to adjust the animation speed

    //this.timelineService.timeline.timeScale(this.currentSpeed());
  }

  boardingLetter(num: number) {
    return String.fromCharCode(64 + num);
  }

  getSecs(num: number) {
    return Math.floor(num / 60);
  }

  getStyle(num: number, alpha = 0.4): any {
    return {
      'background-color': this.getColor(num, alpha),
    };
  }

  gateLaneStyle(index: number, alpha = 0.4) {
    let style = this.getStyle(index, alpha);
    style.width =
      'calc(' +
      100 / this.config.bins().length +
      '% - ' +
      25 / this.config.bins().length +
      'px)';

    return style;
  }

  rowStyle(row: number, alpha = 0.4) {
    return this.getStyle(13 - Math.ceil(row / 2), alpha);
  }

  rowPassengerStyle(passengerID: number, alpha = 0.4) {
    try {
      let { passenger, family } =
        this.timelineService.getPassenger(passengerID);
      return this.rowStyle(passenger.row, alpha);
    } catch (error) {
      console.log('Error: ', error);
      return this.rowStyle(1, alpha);
    }
  }

  getColor(index: number, alpha = 0.4): any {
    const colors = [
      `rgba(255, 215, 0, ${alpha})`, // Gold
      `rgba(255, 99, 71, ${alpha})`, // Tomato
      `rgba(250, 128, 114, ${alpha})`, // Salmon
      `rgba(255, 160, 122, ${alpha})`, // Light Salmon
      `rgba(173, 216, 230, ${alpha})`, // Light Blue
      `rgba(176, 224, 230, ${alpha})`, // Powder Blue
      `rgba(135, 206, 235, ${alpha})`, // Sky Blue
      `rgba(0, 191, 255, ${alpha})`, // Deep Sky Blue Lighter
      `rgba(70, 130, 180, ${alpha})`, // Steel Blue
      `rgba(100, 149, 237, ${alpha})`, // Cornflower Blue
      // `rgba(30, 144, 255, ${alpha})`, // Deep Sky Blue
      `rgba(28, 134, 238, ${alpha})`, // Dodger Blue
      `rgba(255, 165, 0, ${alpha})`, // Orange
    ];
    // Ensure the index is within the range of 1 to 12
    if (index < 1 || index > 12) {
      console.log('Invalid index. Please provide a number between 1 and 12.');
      return 'white';
    }

    // Arrays are zero-indexed, so subtract 1 to match the input with array indices
    return colors[index - 1];
  }
}
