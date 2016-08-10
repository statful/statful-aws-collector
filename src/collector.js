import Promise from 'bluebird';
import {Util} from './util';
import Logger from './logger';
import whilst from 'async/whilst';
import queue from 'async/queue';
import Request from './request';
import {dateFormat} from 'dateformat';

let _config = Symbol('config');
const _processRequest = Symbol('processRequest') ;
let _requests = Symbol('requests');
const _spawnRequest = Symbol('spawnRequest');
const _startCollecting = Symbol('startCollecting');
const _stopCollecting = Symbol('stopCollecting');
let _utcTimeToStopProcessingRequests = Symbol('utcTimeToStopProcessingRequests');

class Collector {
    constructor(config) {
        this[_config] = config;
        this.isStopping = false;
        this.started = false;
        this.log = Logger.sharedInstance().child({file: Util.getCurrentFile(module)}, true);
        this[_requests] = queue((request, callback) => {
            this[_processRequest](request, callback);
        });
        this[_utcTimeToStopProcessingRequests] = -1;
    }

    start() {
        return new Promise( (resolve) => {
            if (!this.started && !this.isStopping) {
                this.log.info('Collector begins start process.');

                this.started = true;
                this.isStopping = false;
                this[_utcTimeToStopProcessingRequests] = -1;

                this[_startCollecting]();

                this.log.info('Collector was started.');
                resolve();
            } else if(this.isStopping) {
                this.log.info('You can\'t start Collector because it\'s still stopping.');
            } else {
                this.log.info('Collector has been already started.');
                resolve();
            }
        });
    }

    stop(signal) {
        return new Promise( (resolve) => {
            if (this.started) {
                signal ? this.log.info('Receive %s - will exit, waiting for in-flight requests to complete.', signal)
                    : this.log.info('will exit, waiting for in-flight requests to complete.', signal);

                this.started = false;
                this.isStopping = true;

                this[_stopCollecting]().then( () => {
                    this.isStopping = false;
                    this.log.info('Collector was stopped.');
                    resolve();
                    process.exit(0);
                });

            } else if (this.isStopping) {
                this.log.info('Collector is stopping. Wait please to not loose any in-flight requests.');
            } else {
                this.log.info('Collector has been already stopped.');
                resolve();
            }
        });
    }

    [_processRequest](request, callback) {
        if (request instanceof Request) {
            if (this[_utcTimeToStopProcessingRequests] === -1 || request.endTime <= this[_utcTimeToStopProcessingRequests]) {
                request.execute().then(() => {
                    callback();
                });
            } else {
                this[_requests].kill();
                callback();
            }
        } else {
            callback();
        }
    }

    [_spawnRequest](callback) {
        let now = new Date();
        let startTime = dateFormat(now.setSeconds(now.getSeconds() - (this[_config].statfulAwsCollector.period + 1)), 'isoUtcDateTime');
        let endTime = dateFormat(now, 'isoUtcDateTime');

        this[_requests].push(new Request(this[_config], startTime, endTime));

        // Proceed to spawn another request
        setTimeout(() => {
            callback();
        }, this[_config].statfulAwsCollector.period * 1000);
    }

    [_startCollecting]() {
        whilst(
            () => {
                return this.started;
            },
            (callback) => {
                this[_spawnRequest](callback);
            }
        );
    }

    [_stopCollecting]() {
        this[_utcTimeToStopProcessingRequests] = new Date().getTime();

        return new Promise( (resolve) => {
            whilst(
                () => {
                    return this[_requests].length() > 0;
                },
                (callback) => {
                    setTimeout(() => {
                        callback();
                    }, 0);
                },
                () => {
                    resolve();
                }
            );
        });
    }
}

export default Collector;


