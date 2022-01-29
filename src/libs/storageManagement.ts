import appInfo from '~~/package.json';
import date from '~/libs/date';
import obj from '~/libs/utils';

const storageIndex = 'ToToday-storage';

/**
 * (Local) Storage Management of the application.
 */
const sm = {
	/**
	 * Adds new value on `data`. *Don't create or rewrite the value if it already exists.*
	 * @param {string} path New value's path on `data`;
	 * @param {any} value New value;
	 */
	add: (path: string, value: any) => {

		let data = sm.getJSON().data;


		if (obj.getByString(data, `data.${path}`))
			return window.alert('ERROR: Value already in storage');

		data = obj.setByString(data, value, path);

		sm.setJSON(data);
	},

	/**
	 * Rewrite a value inside of `data` with a new *(creates a new path/value if it's doesn't exist before)*.
	 * @param {string} path Value's path on `data`;
	 * @param {any} value The new value to replace;
	 * @param {boolean | undefined} getOld Return the old value of the path?
	 * @param {boolean | undefined} meta Update a value on `meta`?
	 *
	 * @returns The old value of the path, if `getOld` is `true`.
	 */
	set: (
		path: string,
		value: any,
		getOld?: boolean,
		meta?: boolean
	): void | any => {
		if (meta) {
			let metaData = sm.getJSON();
			metaData = obj.setByString(metaData, undefined, path);
			sm.setJSON(metaData, true);
			return;
		}

		let data = sm.getJSON().data;

		if (obj.getByString(data, path)) return sm.add(path, value);

		const oldValue = obj.getByString(data, path);

		data = obj.setByString(data, value, path);

		sm.setJSON(data);

		if (getOld) return oldValue;
	},

	/**
	 * Gets a value from localStorage*.
	 * @param {string} path Value's path on `data`;
	 * @param {boolean | undefined} meta Update a value on `meta`?
	 *
	 * @returns {any | undefined} Value on localStorage (or undefined if no value wasn't found).
	 */
	get: (path: string, meta?: boolean): any | undefined => {
		const storage = sm.getJSON();

		if (meta && path) return obj.getByString(storage, `meta.${path}`);
		else if (meta) return storage.meta;

		if (path && obj.getByString(storage, `data.${path}`) !== undefined)
			return obj.getByString(storage, `data.${path}`);

		return undefined;
	},

	/**
	 * Removes a value from localStorage's data
	 * @param {string} path Value's path on `data`;
	 * @param {boolean | undefined} getOld Return the old value of the path?
	 *
	 * @returns The old value of the path, if `getOld` is `true`.
	 */
	remove: (path: string, getOld?: boolean): void | any => {
		let data = sm.getJSON().data;

		const oldValue = obj.getByString(data, path);

		data = obj.setByString(data, undefined, path);

		sm.setJSON(data);

		if (getOld) return oldValue;
	},

	/**
	 * Gets and parses the local storage JSON file.
	 *
	 * **Used internally by the storage management.**
	 */
	getJSON: (): any => {
		sm.checkJSON();
		return JSON.parse(localStorage.getItem(storageIndex) + '');
	},

	/**
	 * Sets a new `data` on the local storage JSON file *(also updates the `date.updated` meta-information)*.
	 * @param {object} newData New data object to be updated/set;
	 * @param {boolean} meta Do new data parameters contain `meta` information?
	 *
	 * **Used internally by the storage management.**
	 */
	setJSON: (newData: object, meta?: boolean) => {
		if (meta) localStorage.setItem(storageIndex, JSON.stringify(newData));
		else {
			const newJSON = { meta: sm.getJSON().meta, data: newData };

			localStorage.setItem(storageIndex, JSON.stringify(newJSON));

			const updatedMeta = sm.getJSON().meta;

			updatedMeta.date.updated = date.full();

			const updatedJSON = {
				meta: updatedMeta,
				data: newData,
			};

			localStorage.setItem(storageIndex, JSON.stringify(updatedJSON));
		}
		window.dispatchEvent(new CustomEvent('localStorage-changed'));
	},

	/**
	 * Check if there's already an app's local storage file exists or if it's valid and creates a new one if there's isn't.
	 *
	 * **Used internally by the storage management.**
	 */
	checkJSON: () => {
		try {
			JSON.parse(localStorage.getItem(storageIndex) + '');
		} catch (error) {
			sm.createJSON(true);
		}
		if (
			!localStorage.getItem(storageIndex) ||
			!JSON.parse(localStorage.getItem(storageIndex) + '').meta
		)
			sm.createJSON(true);

		if (
			!localStorage.getItem(storageIndex) ||
			!JSON.parse(localStorage.getItem(storageIndex) + '').data
		)
			sm.createJSON(true);
	},

	/**
	 * Creates and sets an entire new JSON file on the local storage with meta-information about the app and file itself.
	 * @param {boolean} reset Force creation of a file even if it's already created?
	 *
	 * **Used internally by the storage management.**
	 */
	createJSON: (reset?: boolean) => {
		if (localStorage.getItem(storageIndex) && !reset)
			return window.alert('ERROR: Local storage already exists');

		const colorTheme = localStorage.getItem('nuxt-color-mode');

		const storage = {
			meta: {
				index: storageIndex,
				name: appInfo.name,
				version: appInfo.version,
				theme: colorTheme,

				date: {
					created: date.full(),
					updated: date.full(),
				},
			},
			data: {},
		};

		sm.setJSON(storage, true);
	},
};

export default sm;
