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
    // const tl = gsap.timeline({ repeat: -1, repeatDelay: 0 });
    // tl.to('#half-circle', { strokeDashoffset: 20, duration: 1, ease: 'none' });

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
}
