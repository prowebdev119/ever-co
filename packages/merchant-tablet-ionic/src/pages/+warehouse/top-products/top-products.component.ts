import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ModalController } from '@ionic/angular';
import Product from '@modules/server.common/entities/Product';

@Component({
	selector: 'merchant-top-products',
	templateUrl: 'top-products.component.html',
	styleUrls: ['../common/no-orders-info/no-orders-info.component.scss'],
})
export class TopProductsComponent implements OnInit, OnDestroy {
	@Input()
	warehouseId: string;

	@Input()
	presentCreateProductPopover: () => void;

	@Input()
	addProduct: (id: string) => void;

	@Input()
	getWarehouseProductImageUrl: (product: Product) => void;

	@Input()
	openEditProductModal: (warehouseProduct: WarehouseProduct) => void;

	@Input()
	truncateTitle: (title: any) => void;

	@Input()
	localeTranslate: (title: any) => void;

	topProducts$: Subscription;
	topProducts: WarehouseProduct[] = [];

	public showNoProductsIcon: boolean = false;

	constructor(
		private warehouseProductsRouter: WarehouseProductsRouter,
		private modalCtrl: ModalController,
		private translateProductLocales: ProductLocalesService
	) {}

	ngOnInit() {
		if (this.topProducts$) {
			this.topProducts$.unsubscribe();
		}

		this.topProducts$ = this.warehouseProductsRouter
			.getTopProducts(this.warehouseId, 20)
			.subscribe((products) => {
				products.length === 0
					? (this.showNoProductsIcon = true)
					: (this.showNoProductsIcon = false);
				this.topProducts = products;
			});
	}

	ngOnDestroy() {
		if (this.topProducts$) {
			this.topProducts$.unsubscribe();
		}
	}
}
