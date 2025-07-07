-- Check if the 'generated' table exists, if not, create the tables
CREATE TABLE IF NOT EXISTS `devices` (
    device_id CHAR(36) NOT NULL,
    device_name VARCHAR(255),
    device_code VARCHAR(255),
    last_temp FLOAT,
    last_humid FLOAT,
    PRIMARY KEY(device_id)
);

CREATE TABLE IF NOT EXISTS `device_timeseries` (
    device_id CHAR(36) NOT NULL,
    time_stamp VARCHAR(255) NOT NULL,
    temperature FLOAT,
    humidity FLOAT,
    PRIMARY KEY (device_id, time_stamp)
);