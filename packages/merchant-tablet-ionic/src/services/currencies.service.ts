import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import Currency from '@modules/server.common/entities/Currency';
import { map, share } from 'rxjs/operators';

export interface CurrencyMutationRespone {
	success: boolean;
	message?: string;
	data?: Currency;
}

@Injectable()
export class CurrenciesService {
	constructor(private readonly apollo: Apollo) {}

	private currencies$: Observable<Currency[]> = this.apollo
		.watchQuery<{ currencies: Currency[] }>({
			query: gql`
				query allCurrencies {
					currencies {
						currencyCode
					}
				}
			`,
			pollInterval: 2000,
		})
		.valueChanges.pipe(
			map((result) => result.data.currencies),
			share()
		);

	getCurrencies(): Observable<Currency[]> {
		return this.currencies$;
	}
}
