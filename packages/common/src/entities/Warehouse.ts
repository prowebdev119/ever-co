import { map } from 'underscore';
import { DBObject, getSchema, ModelName, Schema, Types } from '../@pyro/db';
import GeoLocation from './GeoLocation';
import WarehouseProduct, { WithPopulatedProduct } from './WarehouseProduct';
import IWarehouse, { IWarehouseCreateObject } from '../interfaces/IWarehouse';
import ForwardOrdersMethod from '../enums/ForwardOrdersMethod';
import { Entity, Column } from 'typeorm';
import IWarehouseProduct from '../interfaces/IWarehouseProduct';
import OrderBarcodeTypes from '../enums/OrderBarcodeTypes';
import PaymentGateway from './PaymentGateway';

/**
 * Warehouse / Merchant / Store
 * We are using all of above as synonyms today, however at some point we will have
 * multiple warehouses per each store OR multiple stores using same warehouse.
 * So, while we think Merchant and Store are interchangeable,
 * in the future versions of Ever Platform, we will have Merchants and Warehouses as separated entities
 *
 * @class Warehouse
 * @extends {DBObject<IWarehouse, IWarehouseCreateObject>}
 * @implements {IWarehouse}
 */
@ModelName('Warehouse')
@Entity({ name: 'warehouses' })
class Warehouse extends DBObject<IWarehouse, IWarehouseCreateObject>
	implements IWarehouse {
	constructor(warehouse: IWarehouse) {
		super(warehouse);

		if (warehouse) {
			if (warehouse.geoLocation) {
				this.geoLocation = new GeoLocation(warehouse.geoLocation);
			}

			if (warehouse.products) {
				this.products = map(
					warehouse.products,
					(warehouseProduct: IWarehouseProduct) => {
						return new WarehouseProduct(warehouseProduct);
					}
				);
			}

			if (!warehouse.barcodeData) {
				this.barcodeData = warehouse._id.toString();
			}
		}
	}

	/**
	 * Is Warehouse working right now
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */
	@Types.Boolean(false)
	@Column()
	isActive: boolean;

	/**
	 * Is online payment enabled?
	 * If disabled, sales only possible using cash on delivery or takeaway and no online payments allowed
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */
	@Types.Boolean(true)
	@Column()
	isPaymentEnabled: boolean;

	/**
	 * Enable or disable cash payment method
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */

	@Types.Boolean(true)
	@Column()
	isCashPaymentEnabled: boolean;

	/**
	 * Enable or disable in-store mode
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */

	@Types.Boolean(false)
	@Column()
	inStoreMode: boolean;

	/**
	 * Warehouse current location (address)
	 * Note: we do support "moving" warehouses (e.g. car with products)
	 *
	 * @type {GeoLocation}
	 * @memberof Warehouse
	 */
	@Schema(getSchema(GeoLocation))
	geoLocation: GeoLocation;

	/**
	 * Warehouse delivery areas in GeoJSON format
	 *
	 * @type {Object}
	 * @memberof Warehouse
	 */
	@Schema({ type: Object })
	deliveryAreas: object;

	/**
	 * Products available at this warehouse for customer to purchase
	 *
	 * @type {WarehouseProduct[]}
	 * @memberof Warehouse
	 */
	@Schema([getSchema(WarehouseProduct)])
	products: WarehouseProduct[];

	/**
	 * The name of Store/Merchant
	 *
	 * @type {string}
	 * @memberof Warehouse
	 */
	@Types.String()
	@Column()
	name: string;

	/**
	 * The URL of store brand logo
	 *
	 * @type {string}
	 * @memberof Warehouse
	 */
	@Schema({ type: String, required: false })
	@Column()
	logo: string;

	/**
	 * Default administrator user for the store
	 * (used for authentication during login into Merchant app together with hashed password)
	 *
	 * @type {string}
	 * @memberof Warehouse
	 */
	@Schema({ type: String, unique: true })
	@Column()
	username: string;

	/**
	 * Hashed password of default store administrator
	 *
	 * @type {string}
	 * @memberof Warehouse
	 */
	@Schema({ type: String, required: false, select: false })
	@Column()
	hash?: string;

	/**
	 * Primary contact email for the store
	 *
	 * @type {(string | null)}
	 * @memberof Warehouse
	 */
	@Schema({ type: String, required: false })
	@Column()
	contactEmail: string | null;

	/**
	 * Primary contact phone for the store
	 *
	 * @type {(string | null)}
	 * @memberof Warehouse
	 */
	@Schema({ type: String, required: false })
	@Column()
	contactPhone: string | null;

	/**
	 * Phone number, which should be used to accept orders by phone calls
	 * If null, Store did not accept orders by phone calls
	 *
	 * @type {(string | null)}
	 * @memberof Warehouse
	 */
	@Schema({ type: String, required: false })
	@Column()
	ordersPhone: string | null;

	/**
	 * Email address, which should be used to accept orders by incoming emails
	 * If null, Store did not accept orders by incoming emails
	 *
	 * @type {(string | null)}
	 * @memberof Warehouse
	 */
	@Schema({ type: String, required: false })
	@Column()
	ordersEmail: string | null;

	/**
	 * Preferable way to forward orders to the Store (email, phone, etc)
	 *
	 * @type {ForwardOrdersMethod}
	 * @memberof Warehouse
	 */
	@Schema([Number])
	@Column()
	forwardOrdersUsing: ForwardOrdersMethod[];

	/**
	 * Is Warehouse products by default require manufacturing
	 * (e.g. pizza requires manufacturing, but bottle of beer usually don't)
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */
	@Types.Boolean(true)
	@Column()
	isManufacturing: boolean;

	/**
	 * Is warehouse products by default become available only when carrier found
	 * (Should we search for carrier before or after customer purchases product)
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */
	@Types.Boolean(true)
	@Column()
	isCarrierRequired: boolean;

	/**
	 * IDs of devices used to access Warehouse app (where app installed or running)
	 * Note: used to send push notifications
	 *
	 * @type {string[]}
	 * @memberof Warehouse
	 */
	@Schema([String])
	devicesIds: string[];

	/**
	 * IDs of carriers which used by Store
	 *
	 * @type {string[]}
	 * @memberof Warehouse
	 */
	@Schema([String])
	usedCarriersIds: string[];

	/**
	 * if true, has some carriers assigned to the Store
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */
	@Types.Boolean(false)
	@Column()
	hasRestrictedCarriers: boolean;

	/**
	 * IDs of carriers which are "connected" (assigned) to the Store ("own carriers").
	 *
	 * @type {string[]}
	 * @memberof Warehouse
	 */
	@Schema([String])
	carriersIds: string[];

	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;

	/**
	 * Is Store allows deliveries for purchases
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */
	@Schema({ type: Boolean, required: false })
	@Column()
	productsDelivery?: boolean;

	/**
	 * Is Store allows takeaway purchases
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */
	@Schema({ type: Boolean, required: false })
	@Column()
	productsTakeaway?: boolean;

	/**
	 * The type of order barcode
	 *
	 * @type {Number}
	 * @memberof Warehouse
	 */
	@Schema({ type: Number, required: false })
	@Column()
	orderBarcodeType?: OrderBarcodeTypes;

	/**
	 * Unique data for generate on barcode
	 *
	 * @type {string}
	 * @memberof Warehouse
	 */
	@Schema({ type: String, unique: true, sparse: true })
	@Column()
	barcodeData: string;

	/**
	 * Payment gateways
	 *
	 * @type {PaymentGateway[]}
	 * @memberof Warehouse
	 */
	@Schema([getSchema(PaymentGateway)])
	paymentGateways?: PaymentGateway[];

	/**
	 * if true, only assigned carriers (in carriersIds) can be used for delivery
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */
	@Schema({ type: Boolean, required: false })
	@Column()
	useOnlyRestrictedCarriersForDelivery?: boolean;

	/**
	 * if true, assigned carriers (in carriersIds) will be prefer for delivery
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */
	@Schema({ type: Boolean, required: false })
	@Column()
	preferRestrictedCarriersForDelivery?: boolean;

	/**
	 * if true, accepting the orders not goes of all the states
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */
	@Schema({ type: Boolean, required: false })
	@Column()
	ordersShortProcess?: boolean;

	/**
	 *
	 *
	 * @type { {enabled: Boolean, onState: Number} }
	 * @memberof Warehouse
	 */
	@Schema({ type: { enabled: Boolean, onState: Number }, required: false })
	orderCancelation?: { enabled: boolean; onState: number };

	/**
	 * Enable or disable carrier works competition mode
	 *
	 * @type {boolean}
	 * @memberof Warehouse
	 */

	@Types.Boolean(false)
	@Column()
	carrierCompetition?: boolean;
}

export type WithFullProducts = Warehouse & {
	products: WithPopulatedProduct[];
};

export default Warehouse;
