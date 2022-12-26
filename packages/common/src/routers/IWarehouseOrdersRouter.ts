import { Observable } from 'rxjs';
import Order from '../entities/Order';
import Product from '../entities/Product';
import DeliveryType from '../enums/DeliveryType';

export interface IWarehouseOrdersRouterGetOptions {
	populateWarehouse?: boolean;
	populateCarrier?: boolean;
	onlyAvailableToCarrier?: boolean;
}

export interface IWarehouseOrdersRouterCreateOptions {
	autoConfirm?: boolean;
}

export interface IOrderCreateInputProduct {
	count: number;
	comment?: string;
	productId: Product['id'];
}

export interface IOrderCreateInput {
	userId: string;
	warehouseId: string;
	products: IOrderCreateInputProduct[];

	orderType?: DeliveryType;
	waitForCompletion?: boolean;
	options?: IWarehouseOrdersRouterCreateOptions;
}

interface IWarehouseOrdersRouter {
	get(
		warehouseId: string,
		options?: IWarehouseOrdersRouterGetOptions
	): Observable<Order[]>;

	create(createInput: IOrderCreateInput): Promise<Order>;

	cancel(orderId: string): Promise<Order>;

	addMore(
		warehouseId: string,
		userId: string,
		orderId: string,
		products: IOrderCreateInputProduct[]
	): Promise<Order>;

	createByProductType(
		userId: string,
		warehouseId: string,
		productId: string
	): Promise<Order>;
}

export default IWarehouseOrdersRouter;
