import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '@app/@theme';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { SimulationOrderComponent } from './order.component';
import { ElapsedTimeModule } from '@app/@shared/elapsed-time/elapsed-time.module';
import { ImageSliderModule } from '../../../@shared/render-component/image-slider/image-slider.module';
import { OrderMapModule } from '@app/@shared/order/order-map/order-map.module';

const SIMULATION_ORDER_COMPONENTS = [SimulationOrderComponent];

@NgModule({
    imports: [
        CommonModule,
        ThemeModule,
        ToasterModule.forRoot(),
        TranslateModule.forChild(),
        ElapsedTimeModule,
        OrderMapModule,
        ImageSliderModule,
    ],
    declarations: [...SIMULATION_ORDER_COMPONENTS],
    exports: [...SIMULATION_ORDER_COMPONENTS],
    providers: []
})
export class SimulationOrderModule {}
