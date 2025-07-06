/**
 * Client Page Map Registry
 * Maps entity names to their configuration
 */

export const entityRegistry = {
    // Ingredient entities
    ingrTypeList: {
        title: 'Ingredient Types',
        entity: 'ingrType',
        apiPath: '/api/ingredient-types',
        tablePath: 'ingrType',
        keyField: 'ingrTypeID'
    },

    ingrList: {
        title: 'Ingredients',
        entity: 'ingr',
        apiPath: '/api/ingredients',
        tablePath: 'ingr',
        keyField: 'ingrID'
    },

    ingrBtchList: {
        title: 'Ingredient Batches',
        entity: 'ingrBtch',
        apiPath: '/api/ingredient-batches',
        tablePath: 'ingrBtch',
        keyField: 'ingrBtchID'
    },

    // Product entities
    prodTypeList: {
        title: 'Product Types',
        entity: 'prodType',
        apiPath: '/api/product-types',
        tablePath: 'prodType',
        keyField: 'prodTypeID'
    },

    prodList: {
        title: 'Products',
        entity: 'prod',
        apiPath: '/api/products',
        tablePath: 'prod',
        keyField: 'prodID'
    },

    prodBtchList: {
        title: 'Product Batches',
        entity: 'prodBtch',
        apiPath: '/api/product-batches',
        tablePath: 'prodBtch',
        keyField: 'prodBtchID'
    },

    // Supporting entities
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
