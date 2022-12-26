import {
	Component,
	EventEmitter,
	Output,
	Input,
	ViewChild,
	OnInit,
} from '@angular/core';
import { LocationFormComponent } from '@app/@shared/forms/location';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';
import { PaymentGatewaysComponent } from '@app/@shared/payment-gateways/payment-gateways.component';

@Component({
	selector: 'ea-merchants-setup-payments',
	templateUrl: './payments.component.html',
	styleUrls: ['./payments.component.scss'],
})
export class SetupMerchantPaymentsComponent implements OnInit {
	@ViewChild('paymentGateways', { static: true })
	paymentGateways: PaymentGatewaysComponent;
	@Output()
	previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input()
	warehouseLogo: string;
	@Input()
	locationForm: LocationFormComponent;

	isPaymentEnabled = false;
	isCashPaymentEnabled = true;

	ngOnInit() {
		console.warn(this.isCashPaymentEnabled);
	}

	get isPaymentValid() {
		return !this.isPaymentEnabled || this.paymentGateways.isValid;
	}

	get paymentsGateways(): IPaymentGatewayCreateObject[] {
		return this.paymentGateways.paymentsGateways;
	}

	isCashAllowed(ev) {
		this.isCashPaymentEnabled = ev;
	}

	isOnlinePaymentAllowed(ev) {
		this.isPaymentEnabled = ev;
	}
}
