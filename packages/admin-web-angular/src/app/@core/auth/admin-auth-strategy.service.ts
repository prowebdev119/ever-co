import { Observable, from, of as observableOf } from 'rxjs';
import { NbAuthResult, NbAuthStrategy } from '@nebular/auth';
import { ActivatedRoute } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store } from '../data/store.service';
import Admin from '@modules/server.common/entities/Admin';
import { NbAuthStrategyClass } from '@nebular/auth/auth.options';
import { IAdminLoginResponse } from '@modules/server.common/routers/IAdminRouter';
import { getDummyImage } from '@modules/server.common/utils';

@Injectable()
export class AdminAuthStrategy extends NbAuthStrategy {
	private static config = {
		login: {
			redirect: {
				success: '/',
				failure: null,
			},
			defaultErrors: [
				'Login/Email combination is not correct, please try again.',
			],
			defaultMessages: ['You have been successfully logged in.'],
		},
		register: {
			redirect: {
				success: '/',
				failure: null,
			},
			defaultErrors: ['Something went wrong, please try again.'],
			defaultMessages: ['You have been successfully registered.'],
		},
		logout: {
			redirect: {
				success: '/',
				failure: null,
			},
			defaultErrors: ['Something went wrong, please try again.'],
			defaultMessages: ['You have been successfully logged out.'],
		},
		requestPass: {
			redirect: {
				success: '/',
				failure: null,
			},
			defaultErrors: ['Something went wrong, please try again.'],
			defaultMessages: [
				'Reset password instructions have been sent to your email.',
			],
		},
		resetPass: {
			redirect: {
				success: '/',
				failure: null,
			},
			resetPasswordTokenKey: 'reset_password_token',
			defaultErrors: ['Something went wrong, please try again.'],
			defaultMessages: ['Your password has been successfully changed.'],
		},
	};

	constructor(
		private apollo: Apollo,
		private route: ActivatedRoute,
		private store: Store
	) {
		super();
	}

	static setup(options: { name: string }): [NbAuthStrategyClass, any] {
		return [AdminAuthStrategy, options];
	}

	getByEmail(email: string) {
		return this.apollo
			.query({
				query: gql`
					query GetAdminByEmail($email: String!) {
						adminByEmail(email: $email) {
							_id
						}
					}
				`,
				variables: { email },
			})
			.pipe(map((res) => res.data['adminByEmail']));
	}

	authenticate(args: {
		email: string;
		password: string;
		rememberMe?: boolean | null;
	}): Observable<NbAuthResult> {
		const { email, password } = args;

		// TODO implement remember me feature
		const rememberMe = !!args.rememberMe;

		const Login = gql`
			mutation Login($email: String!, $password: String!) {
				adminLogin(email: $email, password: $password) {
					token
					admin {
						_id
						id
						email
						name
						pictureUrl
					}
				}
			}
		`;

		return this.apollo
			.mutate({
				mutation: Login,
				variables: {
					email,
					password,
				},
				errorPolicy: 'all',
			})
			.pipe(
				map(
					/*
					Instead of res: any, it should be:
					res: {
						data: { adminLogin: IAdminLoginResponse };
						errors;
					}
					*/
					(res: any) => {
						const { data, errors } = res;
						const isSuccessful = !!data.adminLogin;

						if (errors) {
							return new NbAuthResult(
								false,
								res,
								AdminAuthStrategy.config.login.redirect.failure,
								errors.map((err) => JSON.stringify(err))
							);
						}

						if (!isSuccessful) {
							return new NbAuthResult(
								false,
								res,
								AdminAuthStrategy.config.login.redirect.failure,
								AdminAuthStrategy.config.login.defaultErrors
							);
						}

						this.store.adminId = data.adminLogin.admin.id;
						this.store.token = data.adminLogin.token;

						return new NbAuthResult(
							isSuccessful,
							res,
							AdminAuthStrategy.config.login.redirect.success,
							[],
							AdminAuthStrategy.config.logout.defaultMessages
						);
					}
				),
				catchError((err) => {
					console.error(err);

					return observableOf(
						new NbAuthResult(
							false,
							err,
							AdminAuthStrategy.config.login.defaultErrors,
							[AdminAuthStrategy.config.logout.defaultErrors]
						)
					);
				})
			);
	}

	register(args: {
		email: string;
		fullName: string;
		password: string;
		confirmPassword: string;
		terms: boolean;
	}): Observable<NbAuthResult> {
		const { email, fullName, password, confirmPassword, terms } = args;

		if (password !== confirmPassword) {
			return observableOf(
				new NbAuthResult(false, null, null, [
					"The passwords don't match.",
				])
			);
		}

		const letter = fullName.charAt(0).toUpperCase();
		const pictureUrl = getDummyImage(300, 300, letter);

		const mutation = gql`
			mutation Register(
				$email: String!
				$fullName: String!
				$pictureUrl: String!
				$password: String!
			) {
				registerAdmin(
					registerInput: {
						admin: {
							email: $email
							name: $fullName
							pictureUrl: $pictureUrl
						}
						password: $password
					}
				) {
					_id
					id
					email
					pictureUrl
				}
			}
		`;

		return this.apollo
			.mutate({
				mutation,
				variables: {
					email,
					fullName,
					password,
					pictureUrl,
				},
				errorPolicy: 'all',
			})
			.pipe(
				/*
					res: { data: { registerAdmin: Admin }; errors }
				*/
				map((res: any) => {
					const { data, errors } = res;
					const admin = data.registerAdmin;

					if (errors) {
						return new NbAuthResult(
							false,
							res,
							AdminAuthStrategy.config.register.redirect.failure,
							errors.map((err) => JSON.stringify(err))
						);
					}

					return new NbAuthResult(
						true,
						res,
						AdminAuthStrategy.config.register.redirect.success,
						[],
						AdminAuthStrategy.config.register.defaultMessages
					);
				}),
				catchError((err) => {
					console.error(err);

					return observableOf(
						new NbAuthResult(
							false,
							err,
							AdminAuthStrategy.config.register.defaultErrors,
							[AdminAuthStrategy.config.logout.defaultErrors]
						)
					);
				})
			);
	}

	logout(): Observable<NbAuthResult> {
		return from(this._logout());
	}

	requestPassword(data?: any): Observable<NbAuthResult> {
		throw new Error('Not implemented yet');
	}

	resetPassword(data: any = {}): Observable<NbAuthResult> {
		throw new Error('Not implemented yet');
	}

	refreshToken(data?: any): Observable<NbAuthResult> {
		throw new Error('Not implemented yet');
	}

	private async _logout(): Promise<NbAuthResult> {
		this.store.clear();

		this.store.serverConnection = '200';

		await this.apollo.getClient().resetStore();

		return new NbAuthResult(
			true,
			null,
			AdminAuthStrategy.config.logout.redirect.success,
			[],
			AdminAuthStrategy.config.logout.defaultMessages
		);
	}
}
