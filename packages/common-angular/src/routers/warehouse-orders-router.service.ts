import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterFactory } from '../lib/router';
import * as _ from 'underscore';
import { Injectable } from '@angular/core';
import IOrder from '@modules/server.common/interfaces/IOrder';
import Order from '@modules/server.common/entities/Order';
import IWarehouseOrdersRouter, {
	IWarehouseOrdersRouterGetOptions,
	IOrderCreateInput,
	IOrderCreateInputProduct,
} from '@modules/server.common/routers/IWarehouseOrdersRouter';
import DeliveryType from '@modules/server.common/enums/DeliveryType';

@Injectable()
export class WarehouseOrdersRouter implements IWarehouseOrdersRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('warehouse-orders');
	}

	get(
		warehouseId: string,
		options: IWarehouseOrdersRouterGetOptions = {}
	): Observable<Order[]> {
		return this.router
			.runAndObserve<IOrder[]>('get', warehouseId, options)
			.pipe(
				map((orders) =>
					_.map(orders, (order) => this._orderFactory(order))
				)
			);
	}

	async create(createInput: IOrderCreateInput): Promise<Order> {
		const order = await this.router.run<IOrder>('create', createInput);
		return this._orderFactory(order);
	}

	async cancel(orderId: string): Promise<Order> {
		const order = await this.router.run<IOrder>('cancel', orderId);
		return this._orderFactory(order);
	}

	async userComplete(orderId: string): Promise<Order> {
		const order = await this.router.run<IOrder>('userComplete', orderId);
		return this._orderFactory(order);
	}

	async addMore(
		warehouseId: string,
		userId: string,
		orderId: string,
		products: IOrderCreateInputProduct[]
	): Promise<Order> {
		const order = await this.router.run<IOrder>(
			'addMore',
			warehouseId,
			userId,
			orderId,
			products
		);
		return this._orderFactory(order);
	}

	async createByProductType(
		userId: string,
		warehouseId: string,
		productId: string,
		orderType?: DeliveryType
	): Promise<Order> {
		const order = await this.router.run<IOrder>(
			'createByProductType',
			userId,
			warehouseId,
			productId,
			orderType
		);
		return this._orderFactory(order);
	}

	protected _orderFactory(order: IOrder) {
		return order == null ? null : new Order(order);
	}
}
