import { Component, OnInit } from '@angular/core';
import { FivePaisaService } from '../../shared/services/Fivepaisa.service';
import { routerTransition } from '../../router.animations';
import { Holding } from '../../shared/models/user.model';

@Component({
    selector: 'app-form',
    templateUrl: './holding.component.html',
    styleUrls: ['./holding.component.scss'],
    animations: [routerTransition()]
})
export class HoldingComponent implements OnInit {
    holdings: Holding;
    constructor(public fivePaisaService: FivePaisaService) {}

    ngOnInit() {
        this.holding();
    }
    holding() {
        this.fivePaisaService.Holding().subscribe((data: any) => {
            this.holdings = data.responseData.body.data;
            debugger;
          });
    }
}
