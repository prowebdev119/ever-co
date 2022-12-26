import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToasterService } from 'angular2-toaster';
import { first, map, switchMap } from 'rxjs/operators';
import { ContactInfoFormComponent } from '../../../../@shared/warehouse/forms';
import { LocationFormComponent } from '../../../../@shared/forms/location';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseManageTabsComponent } from '../../../../@shared/warehouse/forms/warehouse-manage-tabs/warehouse-manage-tabs.component';

@Component({
	selector: 'ea-warehouse-manage',
	templateUrl: './warehouse-manage.component.html',
	styleUrls: ['./warehouse-manage.component.scss'],
})
export class WarehouseManageComponent implements OnInit {
	loading: boolean;

	@ViewChild('warehouseManageTabs')
	warehouseManageTabs: WarehouseManageTabsComponent;

	@ViewChild('contactInfoForm')
	contactInfoForm: ContactInfoFormComponent;

	@ViewChild('locationForm')
	locationForm: LocationFormComponent;

	readonly form: FormGroup = this._formBuilder.group({
		tabsForm: WarehouseManageTabsComponent.buildForm(this._formBuilder),
	});

	readonly tabsForm = this.form.get('tabsForm') as FormControl;

	readonly warehouseId$ = this.activatedRoute.params.pipe(
		map((p) => p['id'])
	);

	_currentWarehouse: Warehouse;

	constructor(
		private readonly _formBuilder: FormBuilder,
		private readonly activatedRoute: ActivatedRoute,
		private readonly toasterService: ToasterService,
		private readonly warehouseRouter: WarehouseRouter
	) {}

	ngOnInit() {
		this.loadWarehouse();
	}

	async loadWarehouse() {
		const warehouseId = await this.warehouseId$.pipe(first()).toPromise();
		const warehouse = await this.warehouseRouter
			.get(warehouseId)
			.pipe(first())
			.toPromise();
		this._currentWarehouse = warehouse;
		this.warehouseManageTabs.setValue(warehouse);
	}

	get validForm() {
		return this.warehouseManageTabs.validForm;
	}

	async updateWarehouse() {
		try {
			this.loading = true;
			const tabsInfoRaw = this.warehouseManageTabs.getValue();

			const warehouseRaw = {
				...this._currentWarehouse,
				...tabsInfoRaw.basicInfo,
				...tabsInfoRaw.contactInfo,
				geoLocation: tabsInfoRaw.location,
				deliveryAreas: tabsInfoRaw.deliveryAreas,
				isPaymentEnabled: tabsInfoRaw.isPaymentEnabled,
				paymentGateways: tabsInfoRaw.paymentsGateways,
				isCashPaymentEnabled: tabsInfoRaw.isCashPaymentEnabled,
			};

			const username = this.tabsForm.value.account['username'];
			const passwordOld = tabsInfoRaw.password.current;
			const passwordNew = tabsInfoRaw.password.new;

			if (passwordNew.length > 0) {
				await this.warehouseRouter.updatePassword(
					this._currentWarehouse.id,
					{
						current: passwordOld,
						new: passwordNew,
					}
				);
			}

			const warehouse = await this.warehouseRouter.save(
				warehouseRaw as Warehouse
			);

			this.loading = false;

			this._showWarehouseUpdateSuccessMessage(warehouse);

			this.warehouseManageTabs.warehouseUpdateFinish();
			this.warehouseManageTabs.accountComponent.form.setValue({
				username: username,
				password: {
					confirm: '',
					current: '',
					new: '',
				},
			});
		} catch (err) {
			this.loading = false;
			this.toasterService.pop(
				'error',
				`Error in updating customer: "${err.message}"`
			);
		}
	}

	private _showWarehouseUpdateSuccessMessage(warehouse) {
		this.toasterService.pop(
			'success',
			`Store ${warehouse.name} was updated`
		);
	}
}
