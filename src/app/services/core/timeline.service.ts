import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {
 
  timeline = gsap.timeline( );

  constructor() { }

  createTimelineFromJson() { 


  }
}
