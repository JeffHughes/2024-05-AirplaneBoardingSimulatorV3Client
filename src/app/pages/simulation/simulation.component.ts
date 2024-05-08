import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { ConfigService } from '../../services/core/config.service';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ],
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.scss'
})

export class SimulationComponent implements OnInit {

  config = inject(ConfigService)

  ngOnInit() {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0 });
    tl.to('#half-circle', { strokeDashoffset: 20, duration: 1, ease: 'none' });
  }

  currentFrame = signal(0);
  currentTime = signal(0);

  speeds: number[] = [0.5, 1, 2, 4, 8, 10];
  currentSpeed = signal(1);

  constructor() { }

  updateTime(frame: number): void {
    this.currentTime.set(frame * 300); // 300s per frame
  }

  setSpeed(speed: number): void {
    this.currentSpeed.set(speed);
    // Implement the logic to adjust the animation speed
  }

}
