import { Apollo, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class WarehouseProductsService {
	constructor(private readonly apollo: Apollo) {}

	async getWarehouseProduct(warehouseId, warehouseProductId) {
		console.warn(warehouseId);

		const res = await this.apollo
			.query({
				query: gql`
					query GetWarehouseProduct(
						$warehouseId: String!
						$warehouseProductId: String!
					) {
						getWarehouseProduct(
							warehouseId: $warehouseId
							warehouseProductId: $warehouseProductId
						) {
							id
							price
							initialPrice
							count
							soldCount

							product {
								id
								title {
									locale
									value
								}
								description {
									locale
									value
								}
								details {
									locale
									value
								}
								images {
									locale
									url
									width
									height
									orientation
								}
							}
							isManufacturing
							isCarrierRequired
							isDeliveryRequired
							isProductAvailable
							isTakeaway
							deliveryTimeMin
							deliveryTimeMax
						}
					}
				`,
				variables: { warehouseId, warehouseProductId },
			})
			.toPromise();

		return res.data['getWarehouseProduct'];
	}
}
