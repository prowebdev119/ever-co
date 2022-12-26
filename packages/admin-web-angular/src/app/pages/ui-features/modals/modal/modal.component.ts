import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'ngx-modal',
	templateUrl: './modal.component.html',
})
export class ModalComponent {
	modalHeader: string;
	modalContent = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy
    nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis
    nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.`;

	constructor(private activeModal: NgbActiveModal) {}

	closeModal() {
		this.activeModal.close();
	}
}
