import { Component, Input } from '@angular/core';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import Order from '@modules/server.common/entities/Order';

@Component({
	selector: 'order-image',
	templateUrl: './order-image.html',
	styleUrls: ['./order-image.scss']
})
export class OrderImageComponent {
	@Input()
	order: Order;

	constructor(
		public readonly productLocalesService: ProductLocalesService
	) {}

	getOrderDate(date: Date) {
		return new Date(date).getDate();
	}

	getOrderMonth(date: Date) {
		return new Date(date).getMonth() + 1;
	}

	getProductImages(images) {
		return [...images].sort((a, b) => {
			return b.orientation - a.orientation;
		});
	}
}
