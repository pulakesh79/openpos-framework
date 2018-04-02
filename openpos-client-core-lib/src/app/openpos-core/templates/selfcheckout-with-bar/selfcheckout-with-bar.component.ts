import { over } from '@stomp/stompjs';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { IScreen } from '../../common/iscreen';
import { SessionService } from '../../services/session.service';
import { AbstractApp } from '../../common/abstract-app';
import { AbstractTemplate } from '../../common/abstract-template';
import { StatusBarData } from '../../common/screen-interfaces/iStatusBarData';
import { SelfCheckoutStatusBarData } from '../../common/screen-interfaces/iSelfCheckoutStatusBarData';
import { SellScreenUtils } from '../../common/screen-interfaces/iSellScreen';

@Component({
  selector: 'app-selfcheckout-with-bar',
  templateUrl: './selfcheckout-with-bar.component.html',
  styleUrls: ['./selfcheckout-with-bar.component.scss']
})
export class SelfCheckoutWithBarComponent extends AbstractTemplate implements OnInit {

  template: any;
  statusBar : SelfCheckoutStatusBarData;

  constructor(public overlayContainer: OverlayContainer) {
      super();
  }

  ngOnInit() {
  }

  show(template: any, app: AbstractApp) {
    this.template = template;
    this.statusBar = SellScreenUtils.getSelfCheckoutStatusBar( template );
  }

}
