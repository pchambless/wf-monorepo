/**
 * Widget Registry
 * Maps widget names to their implementations
 */

export const WIDGET_REGISTRY = {
    // Selector widgets
    SelAcct: {
        name: 'SelAcct',
        type: 'selector',
        eventType: 'acctList'
    },

    SelBrnd: {
        name: 'SelBrnd',
        type: 'selector',
        eventType: 'brndList'
    },

    SelVndr: {
        name: 'SelVndr',
        type: 'selector',
        eventType: 'vndrList'
    },

    SelMeas: {
        name: 'SelMeas',
        type: 'selector',
        eventType: 'measList'
    },

    SelProd: {
        name: 'SelProd',
        type: 'selector',
        eventType: 'prodList'
    },

    SelProdType: {
        name: 'SelProdType',
        type: 'selector',
        eventType: 'prodTypeList'
    },

    SelIngr: {
        name: 'SelIngr',
        type: 'selector',
        eventType: 'ingrList'
    },

    SelIngrType: {
        name: 'SelIngrType',
        type: 'selector',
        eventType: 'ingrTypeList'
    },

    SelWrkr: {
        name: 'SelWrkr',
        type: 'selector',
        eventType: 'wrkrList'
    },

    SelUserAcct: {
        name: 'SelUserAcct',
        type: 'selector',
        eventType: 'userAcctList'
    }
};

export default WIDGET_REGISTRY;
