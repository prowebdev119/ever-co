import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BasicInfoFormComponent } from '../forms';
import { IProductCreateObject } from '@modules/server.common/interfaces/IProduct';
import { ProductsService } from '../../../@core/data/products.service';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '@app/@core/services/notify/notify.service';

@Component({
	selector: 'ea-product-create',
	templateUrl: './product-create.component.html',
	styleUrls: ['./product-create.component.scss'],
})
export class ProductCreateComponent implements OnInit {
	@ViewChild('basicInfoForm', { static: true })
	basicInfoForm: BasicInfoFormComponent;

	public loading: boolean;
	public productsCategories: any;

	readonly form: FormGroup = this._formBuilder.group({
		basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
	});

	readonly basicInfo = this.form.get('basicInfo') as FormControl;

	constructor(
		private readonly _activeModal: NgbActiveModal,
		private readonly _formBuilder: FormBuilder,
		private readonly _productsService: ProductsService,
		private readonly _translateService: TranslateService,
		private readonly _notifyService: NotifyService
	) {}

	ngOnInit() {
		this.basicInfoForm.productCategories = this.productsCategories;
	}

	async createProduct() {
		if (this.basicInfo.valid) {
			const productCreateObject: IProductCreateObject = await this.basicInfoForm.setupProductCreateObject();
			try {
				this.loading = true;
				await firstValueFrom(
					this._productsService.create(productCreateObject).pipe(first())
				).finally(() => {
					this.loading = false;
				})

				const message = `Product ${productCreateObject.title[0].value} is created`;
				this._notifyService.success(message);
				this.cancelModal();
			} catch (error) {
				const message = `Something went wrong!`;
				this.loading = false;
				this._notifyService.error(message);
				this.cancelModal();
			}
		}
	}

	public cancelModal() {
		this._activeModal.dismiss('canceled');
	}
}
