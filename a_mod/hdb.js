"use strict";

module.exports = class {

    static createConnection(options) {
        return new Promise((resolve, reject) => {
            const hdbext = require("@sap/hdbext");
            hdbext.createConnection(options, (error, connection) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(connection);
                }
            });
        });
    }

    constructor(connection) {
        this.connection = connection;
        this.util = require("util");
        this.connection.promisePrepare = this.util.promisify(this.connection.prepare);
    }

    preparePromisified(query) {
        return this.connection.promisePrepare(query);
    }

    statementExecPromisified(statement, parameters) {
        statement.promiseExec = this.util.promisify(statement.exec);
        return statement.promiseExec(parameters);
    }

    statementExecBatchPromisified(statement, parameters) {
        statement.promiseExec = this.util.promisify(statement.execBatch);
        return statement.promiseExec(parameters);
    }

    loadProcedurePromisified(hdbext, schema, procedure) {
        hdbext.promiseLoadProcedure = this.util.promisify(hdbext.loadProcedure);
        return hdbext.promiseLoadProcedure(this.connection, schema, procedure);
    }

    callProcedurePromisified(storedProc, inputParams) {
        return new Promise((resolve, reject) => {
            storedProc(inputParams, (error, outputScalar, ...results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length < 2) {
                        resolve({
                            outputScalar: outputScalar,
                            results: results[0]
                        });
                    } else {
                        let output = {};
                        output.outputScalar = outputScalar;
                        for (let i = 0; i < results.length; i++) {
                            output[`results${i}`] = results[i];
                        }
                        resolve(output);
                    }
                }
            });
        });
    }
};