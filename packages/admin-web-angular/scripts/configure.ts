// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { env } from './env';
import { writeFile, unlinkSync } from 'fs';
import { argv } from 'yargs';

const environment = argv["environment"];
const isProd = environment === 'prod';

if (!env.GOOGLE_MAPS_API_KEY) {
	console.warn(
		'WARNING: No Google Maps API Key defined in the .env. Google Maps may not be visible!'
	);
}

let envFileContent = `// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { Environment } from './model';

`;


if (!env.IS_DOCKER) {
	envFileContent += `

		export const environment: Environment = {
			production: ${isProd},

			SERVICES_ENDPOINT: '${env.SERVICES_ENDPOINT}',
			HTTPS_SERVICES_ENDPOINT: '${env.HTTPS_SERVICES_ENDPOINT}',
			GQL_ENDPOINT: '${env.GQL_ENDPOINT}',
			GQL_SUBSCRIPTIONS_ENDPOINT: '${env.GQL_SUBSCRIPTIONS_ENDPOINT}',

			GOOGLE_MAPS_API_KEY: '${env.GOOGLE_MAPS_API_KEY}',

			DEFAULT_LATITUDE: ${env.DEFAULT_LATITUDE},
			DEFAULT_LONGITUDE: ${env.DEFAULT_LONGITUDE},

			NO_INTERNET_LOGO: '${env.NO_INTERNET_LOGO}',

			MAP_MERCHANT_ICON_LINK: '${env.MAP_MERCHANT_ICON_LINK}',

			MAP_USER_ICON_LINK: '${env.MAP_USER_ICON_LINK}',

			MAP_CARRIER_ICON_LINK: '${env.MAP_CARRIER_ICON_LINK}',

			API_FILE_UPLOAD_URL: '${env.API_FILE_UPLOAD_URL}',

			COMPANY_NAME: '${env.COMPANY_NAME}',
			COMPANY_SITE_LINK: '${env.COMPANY_SITE_LINK}',
			COMPANY_GITHUB_LINK: '${env.COMPANY_GITHUB_LINK}',
			COMPANY_FACEBOOK_LINK: '${env.COMPANY_FACEBOOK_LINK}',
			COMPANY_TWITTER_LINK: '${env.COMPANY_TWITTER_LINK}',
			COMPANY_LINKEDIN_LINK: '${env.COMPANY_LINKEDIN_LINK}',

			GENERATE_PASSWORD_CHARSET: '${env.GENERATE_PASSWORD_CHARSET}',

			CURRENCY_SYMBOL: '${env.CURRENCY_SYMBOL}',

			DEFAULT_LANGUAGE: '${env.DEFAULT_LANGUAGE}',

			// For maintenance micro service. Ever maintenance API URL: https://maintenance.ever.co/status
			SETTINGS_APP_TYPE: '${env.SETTINGS_APP_TYPE}',
			SETTINGS_MAINTENANCE_API_URL: '${env.SETTINGS_MAINTENANCE_API_URL}'
		};
`;
} else {
	envFileContent += `

		export const environment: Environment = {
			production: ${isProd},

			SERVICES_ENDPOINT: 'DOCKER_SERVICES_ENDPOINT',
			HTTPS_SERVICES_ENDPOINT: 'DOCKER_HTTPS_SERVICES_ENDPOINT',
			GQL_ENDPOINT: 'DOCKER_GQL_ENDPOINT',
			GQL_SUBSCRIPTIONS_ENDPOINT: 'DOCKER_GQL_SUBSCRIPTIONS_ENDPOINT',

			GOOGLE_MAPS_API_KEY: 'DOCKER_GOOGLE_MAPS_API_KEY',

			DEFAULT_LATITUDE: ${env.DEFAULT_LATITUDE},
			DEFAULT_LONGITUDE: ${env.DEFAULT_LONGITUDE},

			NO_INTERNET_LOGO: 'DOCKER_NO_INTERNET_LOGO',

			MAP_MERCHANT_ICON_LINK: 'DOCKER_MAP_MERCHANT_ICON_LINK',

			MAP_USER_ICON_LINK: 'DOCKER_MAP_USER_ICON_LINK',

			MAP_CARRIER_ICON_LINK: 'DOCKER_MAP_CARRIER_ICON_LINK',

			API_FILE_UPLOAD_URL: 'DOCKER_API_FILE_UPLOAD_URL',

			COMPANY_NAME: 'DOCKER_COMPANY_NAME',
			COMPANY_SITE_LINK: 'DOCKER_COMPANY_SITE_LINK',
			COMPANY_GITHUB_LINK: 'DOCKER_COMPANY_GITHUB_LINK',
			COMPANY_FACEBOOK_LINK: 'DOCKER_COMPANY_FACEBOOK_LINK',
			COMPANY_TWITTER_LINK: 'DOCKER_COMPANY_TWITTER_LINK',
			COMPANY_LINKEDIN_LINK: 'DOCKER_COMPANY_LINKEDIN_LINK',

			GENERATE_PASSWORD_CHARSET: 'DOCKER_GENERATE_PASSWORD_CHARSET',

			CURRENCY_SYMBOL: 'DOCKER_CURRENCY_SYMBOL',

			DEFAULT_LANGUAGE: 'DOCKER_DEFAULT_LANGUAGE',

			// For maintenance micro service. Ever maintenance API URL: https://maintenance.ever.co/status
			SETTINGS_APP_TYPE: 'DOCKER_SETTINGS_APP_TYPE',
			SETTINGS_MAINTENANCE_API_URL: 'DOCKER_SETTINGS_MAINTENANCE_API_URL'
		};

	`;
}

if (!isProd) {
	envFileContent += `

	// For easier debugging in development mode, you can import the following file
	// to ignore zone related error stack frames such as 'zone.run', 'zoneDelegate.invokeTask'.
	import 'zone.js';  // Included with Angular CLI.

	`;
}

// we always want first to remove old generated files (one of them is not needed for current build)
try {
	unlinkSync(`./src/environments/environment.ts`);
} catch {}
try {
	unlinkSync(`./src/environments/environment.prod.ts`);
} catch {}

const envFileDest: string = isProd ? 'environment.prod.ts' : 'environment.ts';
const envFileDestOther: string = !isProd
	? 'environment.prod.ts'
	: 'environment.ts';

writeFile(
	`./src/environments/${envFileDest}`,
	envFileContent,
	function (err) {
		if (err) {
			console.log(err);
		} else {
			console.log(`Generated Angular environment file: ${envFileDest}`);
		}
});

writeFile(
	`./src/environments/${envFileDestOther}`,
	'',
	function (err) {
		if (err) {
			console.log(err);
		} else {
			console.log(`Generated Second Empty Angular environment file: ${envFileDestOther}`);
		}
});
