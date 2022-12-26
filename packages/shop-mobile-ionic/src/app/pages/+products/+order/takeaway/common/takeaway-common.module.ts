import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TakeawayStoreInfoComponent } from './store-info/store-info.component';
import { TakeawayTitleComponent } from './title/title.component';
import { TakeawayOrderInfoComponent } from './order-info/order-info.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxBarcodeModule } from '@modules/client.common.angular2/components/ngx-barcode/ngx-barcode.module';
import { OrderInfoCommonModule } from '../../common/order-info-common.module';

const COMPONENTS = [
	TakeawayStoreInfoComponent,
	TakeawayTitleComponent,
	TakeawayOrderInfoComponent,
];

@NgModule({
    imports: [
        CommonModule,
        TranslateModule.forChild(),
        NgxBarcodeModule,
        OrderInfoCommonModule,
    ],
    declarations: COMPONENTS,
    providers: [],
    exports: COMPONENTS
})
export class TakeawayCommonModule {}
