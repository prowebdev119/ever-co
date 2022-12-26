import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Inject,
	EventEmitter,
	Output,
} from '@angular/core';
import { Store } from '../../services/store.service';
import OrderStatus from '@modules/server.common/enums/OrderStatus';
import Order from '@modules/server.common/entities/Order';
import Warehouse from '@modules/server.common/entities/Warehouse';
import * as _ from 'lodash';
import {
	animate,
	state,
	style,
	transition,
	trigger,
} from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { NavController } from '@ionic/angular';
import { environment } from 'environments/environment';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';

@Component({
	selector: 'e-cu-order',
	templateUrl: 'order.component.html',
	styleUrls: ['./order.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,

	/*animations: [
		trigger('collapseExpand', [
			state('true', style({ height: '*' })),
			state('false', style({ height: '*' })),
			transition('false <=> true', animate(1000))
		])
	]*/
})
export class OrderComponent {
	deletedProductId: string;

	@Input()
	order: Order;
	@Input()
	showDetailsButton: boolean = false;

	@Output()
	orderChange = new EventEmitter<Order>();

	@Output()
	onAddComment = new EventEmitter<{ comment: string; productId: string }>();

	get id() {
		return this.order.id;
	}

	get warehouseLogo() {
		return (this.order.warehouse as Warehouse).logo;
	}

	get customerAddress() {
		return `${this.order.user.geoLocation.countryName} ${this.order.user.geoLocation.postcode}, ${this.order.user.geoLocation.city}`;
	}

	get totalPrice() {
		return _.chain(this.order.products)
			.map((p) => p.count * p.price)
			.reduce((p1, p2) => p1 + p2)
			.value();
	}

	get createdAt() {
		return this.order.createdAt;
	}

	get deliveryTime() {
		const deliveryTimeAsNumber = new Date(
			this.order.deliveryTime
		).getTime();
		const createdAtAsNumber = new Date(this.order.createdAt).getTime();
		return this.order.deliveryTime !== null
			? this._millisToMinutes(deliveryTimeAsNumber - createdAtAsNumber) +
					' min'
			: null;
	}

	get statusText() {
		return this.order.getStatusText(this.store.language);
	}

	get badgeClass() {
		switch (this.order.status) {
			case OrderStatus.CanceledWhileInDelivery:
			case OrderStatus.CanceledWhileWarehousePreparation:
				return 'badge-energized';
			case OrderStatus.CarrierIssue:
			case OrderStatus.WarehouseIssue:
				return 'badge-assertive';
			default:
				return 'badge-balanced';
		}
	}

	get isCanceled() {
		return (
			(this.order &&
				this.order.status === OrderStatus.CanceledWhileInDelivery) ||
			this.order.status === OrderStatus.CanceledWhileWarehousePreparation
		);
	}
	get isFailed() {
		return (
			(this.order && this.order.status === OrderStatus.CarrierIssue) ||
			this.order.status === OrderStatus.WarehouseIssue
		);
	}

	get inProcessing() {
		return this.order && this.order.status < OrderStatus.Delivered;
	}

	get isTakeaway() {
		return (
			this.order &&
			this.order.products.filter((p) => p.isTakeaway).length > 0
		);
	}

	constructor(
		@Inject(DOCUMENT) public document: Document,
		private readonly store: Store,
		public navCtrl: NavController,
		private orderRouter: OrderRouter
	) {}

	goToOrder() {
		if (this.inProcessing && environment.ORDER_INFO_TYPE === 'page') {
			this.navCtrl.navigateRoot(
				`${
					this.store.deliveryType === DeliveryType.Delivery
						? '/order-info'
						: '/order-info-takeaway'
				}`
			);
		}
	}

	async removeProduct(orderId, orderProduct) {
		await this.orderRouter.removeProducts(orderId, [
			orderProduct.product._id,
		]);

		const productIndex = this.order.products.findIndex(
			(p) => p.id == orderProduct.id
		);
		this.order.products[productIndex].price = 0;
		this.deletedProductId = orderProduct._id;
		this.orderChange.emit(this.order);
	}

	private _millisToMinutes(ms) {
		const minutes = Math.floor(ms / 60000);
		const seconds = ((ms % 60000) / 1000).toFixed(0);
		return minutes + ':' + (+seconds < 10 ? '0' : '') + seconds;
	}
}
