import { FormArray, FormGroup } from '@angular/forms';
import * as _ from 'underscore.string';

export class FormHelpers {
	/**
	 * Loop and mark all it has
	 *
	 * @param {FormGroup} formGroup
	 * @param markAs
	 * @param opts
	 *
	 */
	static deepMark(
		formGroup: FormGroup | FormArray,
		markAs: 'touched' | 'untouched' | 'dirty' | 'pristine' | 'pending',
		opts = { onlySelf: false }
	): void {
		Object.values(formGroup.controls).forEach((c) => {
			if (c instanceof FormGroup || c instanceof FormArray) {
				FormHelpers.deepMark(c, markAs, opts);
			} else {
				c[`markAs${_.capitalize(markAs)}`](opts);
			}
		});
	}
}
