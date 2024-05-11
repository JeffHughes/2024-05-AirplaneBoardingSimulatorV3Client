import { NgZone, Injectable, inject, signal } from '@angular/core';

import { ConfigService } from './config.service';

import { gsap } from 'gsap';
import { GSDevTools } from 'gsap/GSDevTools';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
gsap.registerPlugin(GSDevTools);
gsap.registerPlugin(MotionPathPlugin);

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
  // sliderValue = signal(0);
  sliderValueAnalog = 0;
  currentTime = signal(0);
  message = signal('');
  currentBoardingGroup = signal(1);

  config = inject(ConfigService);

  timeline = gsap.timeline({
    onUpdate: () => {
      // console.log(this.timeline.progress() * 100 + '%');
      // this.sliderValue.set(this.timeline.progress() * 100);
      // this.sliderValueAnalog = this.timeline.progress() * 100;
      // if (this.timeline.progress() == 0) {
      //   this.message.set('standby');
      // }
      // if (this.timeline.progress() > 0.99) {
      //   this.message.set('Done');
      // }
    },
  });

  constructor(public zone: NgZone) {}

  async createTimelineFromJson() {
    const response = await fetch(
      //'../../../assets/test-delme/frames-05-06-4PM.json'
      // 'http://localhost:7048/api/Function1'
      'https://202405-boardingsimulationv3api.azurewebsites.net/api/Function1'
    );
    const calculations = await response.json();

    this.config.families.set(calculations.families);
    //TODO: READ other config setting from Json OR grab from form and double check

    let interval = setInterval(() => {
      if (!document.querySelector(`#family-2`)) {
        console.log('waiting for dom to be ready animate ... ');
      } else {
        // this.setupFinalPassengerMovesToSeats();
        calculations.animationFrames.forEach((frame: any) => {
          this.animateMovements(frame);
        });
        GSDevTools.create(); //TODO: kill logo and timeline dropdown
        clearInterval(interval);

        setInterval(() => {
          let secsAsInt = Math.ceil(this.timeline.time());
          this.currentTime.set(secsAsInt);
        }, 100);
      }
    }, 1);
  }

  // setupFinalPassengerMovesToSeats() {
  //   const families = this.config.families();
  //   families.forEach((family: any) => {
  //     const passengers = family.familyMembers;

  //     let overheadBin = family.overheadBin > 0 ? family.overheadBin : 12;

  //     passengers.forEach((passenger: any) => {
  //       const independentPassenger = `#passenger-moving-independently-${passenger.passengerID}`;
  //       let { x, y } = this.getDeltaXY(
  //         independentPassenger,
  //         `#Cabin-${overheadBin}`
  //       );
  //       gsap.set(independentPassenger, {
  //         x,
  //         y,
  //         opacity: 0,
  //       });
  //     });
  //   });
  // }

  isolatePassenger = 0;
  isolateFamily = 0;
  // Helper function to extract and animate movements

  timerInterval: any;
  previouslySeatedIDs: any = []; // for debug only
  animateMovements(frame: any) {
    let secsAsInt = Math.ceil(frame.timeSeconds - 0.1);

    const frameTimeline = gsap.timeline().call(() => {
      this.zone.run(() => {
        this.currentTime.set(secsAsInt);
        if (frame.message) this.message.set(frame.message);
        if (frame.currentBoardingGroup != this.currentBoardingGroup()) {
          this.currentBoardingGroup.set(frame.currentBoardingGroup);
          //TODO: Animate boarding group change
        }
      });
    });

    let staggerDelay = 1;
    Object.entries(frame.familyLocationMovements).forEach(
      ([familyID, locationID]) => {
        if (this.isolateFamily && +familyID != this.isolateFamily) return;

        const source = `#family-${familyID}`;

        //get lane for boarding group for family
        const family = this.config
          .families()
          .find((f: any) => f.familyID == familyID);

        let lane = family.boardingGroup % 2 == 0 ? 2 : 1;

        if (locationID == 'Walkway-1') {
          this.timeline.to(
            source,
            {
              motionPath: {
                path: '#motionPath' + lane,
                align: '#motionPath' + lane,
                // autoRotate: true,
                alignOrigin: [0.5, 0.5],
              },
              duration: 1,
            },
            '<'
          );
        } else if (locationID == 'Cabin-12') {
          this.timeline.to(
            source,
            {
              motionPath: {
                path: '#motionPath3',
                align: '#motionPath3',
                // autoRotate: true,
                alignOrigin: [0.5, 0.5],
              },
              duration: 1,
            },
            '<'
          );
        } else {
          let { x, y } = this.getDeltaXY(
            `#family-${familyID}`,
            `#${locationID}`
          );

          // Animate the source to move to the target
          this.timeline.to(
            source,
            { x, y, opacity: 1, delay: 0.001 * staggerDelay++, duration: 1 },
            '<'
          );
        }
      }
    );

    if (frame.familiesAreSeated) {
      frame.familiesAreSeated.forEach((familyID: any) => {
        if (this.isolateFamily && +familyID != this.isolateFamily) return;
        frameTimeline.to(
          `#family-${familyID}`,
          {
            borderColor: 'transparent',
            color: 'transparent',
            duration: 0.5,
            //delay: 1,
          },
          '<'
        );
      });
    }

    if (frame.passengerIDsToSeat) {
      try {
        frame.passengerIDsToSeat.forEach((passengerID: any) => {
          if (this.previouslySeatedIDs.includes(passengerID)) {
            console.log('passenger already seated ' + passengerID);
            debugger;
            return;
          }

          this.previouslySeatedIDs.push(passengerID);

          const { family, passenger } = this.getPassenger(passengerID);

          if (this.isolateFamily && family.familyID != this.isolateFamily)
            return;
          if (this.isolatePassenger && passengerID != this.isolatePassenger)
            return;

          const wFam = `#Passenger-moving-w-family-${passengerID}`;

          let seatFound = false;
          if (passenger) {
            if (passenger.row && passenger.seatLetter) {
              frameTimeline.set(
                wFam,
                {
                  position: 'absolute',
                  opacity: 0,
                },
                '<'
              );

              const noFam = `#passenger-moving-independently-${passengerID}`;
              let overheadBin =
                family.overheadBin > 0 ? family.overheadBin : 12;

              // reset independent passenger to middle of overhead cabin location
              let xy: any = this.getDeltaXY(noFam, `#Cabin-${overheadBin}`);
              xy.opacity = 0.25;
              xy.duration = 0.0001;
              xy.delay = 0.1;

              frameTimeline.to(noFam, xy, '<');

              // first, move to row of seat
              let rowDivID = `#row-${passenger.row}`;
              let rowX = this.getDeltaXY(noFam, rowDivID);
              frameTimeline.to(noFam, {
                x: rowX.x,
                opacity: 0.25,
                delay: 0.2,
                duration: rowX.x / (80 * this.timeline.timeScale()),
              });

              // then move to seat
              let seatDivID = `#seat-${passenger.row}${passenger.seatLetter}`;
              let { x, y } = this.getDeltaXY(noFam, seatDivID);
              frameTimeline.to(noFam, {
                x,
                y,
                opacity: 0.25,
                delay: 0.2,
                duration: 0.4,
              });

              frameTimeline.to(noFam, {
                opacity: 1,
                duration: 0.1,
              });

              seatFound = true;
            } else {
              console.log(`Passenger ${passengerID} SEAT not found`);
            }
          } else {
            console.log(`Passenger ${passengerID} not found`);
          }
        });
      } catch (error) {}
    }

    if (frame.bottleneckStart) {
      frame.bottleneckStart.forEach((divID: any) => {
        console.log(`Bottleneck start ${divID}`);
        frameTimeline
          .to(
            `#${divID}`,
            {
              opacity: 1,
              duration: 0.5,
            },
            '<'
          )
          .to(
            `#${divID}`,
            {
              opacity: 0.2,
              duration: 0.5,
              delay: 3, //THIS SI A HACK NEEDS DEBUGGING !!!!!
            },
            '<'
          );
      });
    }

    if (frame.bottleneckEnd) {
      frame.bottleneckEnd.forEach((divID: any) => {
        console.log(`Bottleneck end ${divID}`);
        frameTimeline.to(
          `#${divID}`,
          {
            opacity: 0.2,
            duration: 0.5,
          },
          '<'
        );
      });
    }

    // if (frame.message)
    //     console.log(`Frame ${frame.frameNumber}: ${frame.message}`);
    // if (frame.frameNumber % 100 == 0)
    //     console.log(`Frame ${frame.frameNumber}`);
    // if (frame.durationSeconds != 1)
    //     console.log(`Frame ${frame.frameNumber}: ${frame.durationSeconds} seconds`);

    // console.log(`Frame ${frame.frameNumber}: ${frame.timeSeconds} seconds`);
    this.timeline.add(frameTimeline, frame.timeSeconds); // Add this frame's timeline to the main timeline
  }

  getPassenger(passengerID: number) {
    const families = this.config.families();

    for (let i = 0; i < families.length; i++) {
      const family = families[i];
      const passengers = family.familyMembers;

      for (let j = 0; j < passengers.length; j++) {
        const passenger = passengers[j];

        if (passenger.passengerID === passengerID) {
          return { family, passenger };
        }
      }
    }

    return { undefined };

    //TODO: figure out best find method that works everywhere

    // const passenger = this.config
    //   .families()
    //   .find((family: any) =>
    //     family.members.find((member: any) => member.id == passengerID)
    //   );

    // const passenger = this.config
    //   .families()
    //   ?.flatMap((family: any) => family.members)
    //   ?.find((member: any) => member.id == passengerID);

    // const passenger = this.config
    //   .families()
    //   .reduce((acc: any, family: any) => {
    //     const member = family.members.filter(
    //       (m: any) => m.id === passengerID
    //     );
    //     return member.length > 0 ? member[0] : acc;
    //   }, undefined);
  }

  getDeltaXY(
    sourceDivID: string,
    targetDivID: string
  ): { x: number; y: number } {
    const source = document.querySelector(sourceDivID);
    const target = document.querySelector(targetDivID);

    if (!source) console.error('Source element not found:' + sourceDivID);

    if (!target) console.error('target element not found: ' + targetDivID);

    // Get the center positions of both elements
    const sourceCenter = this.getCenterPosition(source);
    const targetCenter = this.getCenterPosition(target);

    // Calculate the difference in positions
    const deltaX = targetCenter.x - sourceCenter.x;
    const deltaY = targetCenter.y - sourceCenter.y;

    return { x: deltaX, y: deltaY };
  }

  getCenterPosition(element: any) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }
}
