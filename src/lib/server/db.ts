import { env } from '$env/dynamic/private';
import { readFileSync } from 'fs';
import { createPool, type FieldPacket, type QueryResult, type RowDataPacket } from 'mysql2/promise';

const dynamicSQL = (env.DYNAMIC_SQL ?? 'false').toLowerCase() == 'true' ? true : false;

const pool = createPool({
	uri: env.MYSQL_URI,
	waitForConnections: true,
	connectionLimit: 30,
	queueLimit: 0,
	multipleStatements: true
});

export const readSQL = (filename: string) => {
	return readFileSync(env.SQL_DIR + filename + '.sql', 'utf8');
};

export const exec = async <T = any>(sql: string, params?: any[]): Promise<RowDataPacket[]> => {
	const [rows] = await pool.query<RowDataPacket[]>(sql, params);
	return rows;
};

const lDS = readSQL('list_devices');
const gDS = readSQL('get_device');
const aDS = readSQL('add_device');
const dDS = readSQL('del_device');

const listDevicesSQL = () => (dynamicSQL ? readSQL('list_devices') : lDS);
const getDeviceSQL = () => (dynamicSQL ? readSQL('get_device') : gDS);
const addDeviceSQL = () => (dynamicSQL ? readSQL('add_device') : aDS);
const delDeviceSQL = () => (dynamicSQL ? readSQL('del_device') : dDS);

export const listDevices = async () => {
	return await exec(listDevicesSQL());
};

export const getDevice = async (device_id: string) => {
	return await exec(getDeviceSQL(), [device_id]);
};

export const addDevice = async (
	uuid: string,
	device_name: string,
	device_code: string,
	last_temp: number,
	last_humid: number
) => {
	return await exec(addDeviceSQL(), [uuid, device_name, device_code, last_temp, last_humid]);
};

export const delDevice = async (device_id: string) => {
	return await exec(delDeviceSQL(), [device_id]);
};
