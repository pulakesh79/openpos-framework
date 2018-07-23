import { Component, Input, OnInit } from '@angular/core';
import { SellStatusSectionData } from './sell-status-section.data';
import { timer } from 'rxjs';
import { Configuration } from '../../../../configuration/configuration';

@Component({
    selector: 'app-sell-status-section',
    templateUrl: './sell-status-section.component.html'
  })

  export class SellStatusSectionComponent implements OnInit {

    @Input()
    data: SellStatusSectionData;

    date = Date.now();
    timer: number;

    ngOnInit(): void {
        timer( 1000, 1000 ).subscribe( () => {
            if ( this.data.timestampBegin ) {
                this.timer = (Date.now() - this.data.timestampBegin) / 1000;
            }
            this.date = Date.now();
        });
    }

    showRegisterStatus(): boolean {
        return this.data.registerStatus && Configuration.showRegisterStatus;
    }

  }
