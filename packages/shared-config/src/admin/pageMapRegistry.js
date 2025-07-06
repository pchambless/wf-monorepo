/**
 * Admin Page Map Registry
 * Maps entity names to their configuration for admin app
 */

export const entityRegistry = {
    // User management
    userList: {
        title: 'Users',
        entity: 'user',
        apiPath: '/api/users',
        tablePath: 'user',
        keyField: 'userID'
    },

    // Account management
    acctList: {
        title: 'Accounts',
        entity: 'acct',
        apiPath: '/api/accounts',
        tablePath: 'acct',
        keyField: 'acctID'
    },

    userAcctList: {
        title: 'User Accounts',
        entity: 'userAcct',
        apiPath: '/api/user-accounts',
        tablePath: 'userAcct',
        keyField: 'userAcctID'
    },

    // Supporting entities (shared with client)
    brndList: {
        title: 'Brands',
        entity: 'brnd',
        apiPath: '/api/brands',
        tablePath: 'brnd',
        keyField: 'brndID'
    },

    vndrList: {
        title: 'Vendors',
        entity: 'vndr',
        apiPath: '/api/vendors',
        tablePath: 'vndr',
        keyField: 'vndrID'
    },

    measList: {
        title: 'Measurements',
        entity: 'meas',
        apiPath: '/api/measurements',
        tablePath: 'meas',
        keyField: 'measID'
    },

    wrkrList: {
        title: 'Workers',
        entity: 'wrkr',
        apiPath: '/api/workers',
        tablePath: 'wrkr',
        keyField: 'wrkrID'
    }
};

export default entityRegistry;
