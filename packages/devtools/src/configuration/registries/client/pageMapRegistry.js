/**
 * Client Page Map Registry
 * Contains all page definitions for the WhatsFresh client application
 */

export const pageMapRegistry = {
    // Dashboard
    dashboard: {
        title: 'Dashboard',
        icon: 'dashboard',
        path: '/dashboard',
        component: 'Dashboard'
    },

    // Authentication
    userLogin: {
        title: 'Login',
        icon: 'login',
        path: '/login',
        component: 'UserLogin'
    },

    // Ingredient Management
    ingrTypeList: {
        title: 'Ingredient Types',
        icon: 'category',
        path: '/ingredients/types',
        component: 'IngrTypeList',
        entity: 'ingrTypeList',
        layout: 'CrudLayout',
        pageIndexPath: '2-Ingredient/01-ingrTypeList/index.jsx'
    },

    ingrList: {
        title: 'Ingredients',
        icon: 'grass',
        path: '/ingredients',
        component: 'IngrList',
        entity: 'ingrList',
        layout: 'CrudLayout',
        pageIndexPath: '2-Ingredient/02-ingrList/index.jsx'
    },

    ingrBtchList: {
        title: 'Ingredient Batches',
        icon: 'inventory',
        path: '/ingredients/batches',
        component: 'IngrBtchList',
        entity: 'ingrBtchList',
        layout: 'CrudLayout',
        pageIndexPath: '2-Ingredient/03-ingrBtchList/index.jsx'
    },

    // Product Management
    prodTypeList: {
        title: 'Product Types',
        icon: 'category',
        path: '/products/types',
        component: 'ProdTypeList',
        entity: 'prodTypeList',
        layout: 'CrudLayout',
        pageIndexPath: '3-Product/01-prodTypeList/index.jsx'
    },

    prodList: {
        title: 'Products',
        icon: 'shopping_bag',
        path: '/products',
        component: 'ProdList',
        entity: 'prodList',
        layout: 'CrudLayout',
        pageIndexPath: '3-Product/02-prodList/index.jsx'
    },

    prodBtchList: {
        title: 'Product Batches',
        icon: 'inventory_2',
        path: '/products/batches',
        component: 'ProdBtchList',
        entity: 'prodBtchList',
        layout: 'CrudLayout',
        pageIndexPath: '3-Product/03-prodBtchList/index.jsx'
    },

    // Recipe Management  
    rcpeList: {
        title: 'Recipes',
        icon: 'restaurant_menu',
        path: '/recipes',
        component: 'RcpeList',
        entity: 'rcpeList',
        layout: 'CrudLayout',
        pageIndexPath: '5-Mapping/03-rcpeList/index.jsx'
    },

    taskList: {
        title: 'Tasks',
        icon: 'task_alt',
        path: '/tasks',
        component: 'TaskList',
        entity: 'taskList',
        layout: 'CrudLayout',
        pageIndexPath: '5-Mapping/02-taskList/index.jsx'
    },

    // Reference Data
    vndrList: {
        title: 'Vendors',
        icon: 'business',
        path: '/vendors',
        component: 'VndrList',
        entity: 'vndrList',
        layout: 'CrudLayout',
        pageIndexPath: '4-Reference/02-vndrList/index.jsx'
    },

    brndList: {
        title: 'Brands',
        icon: 'branding_watermark',
        path: '/brands',
        component: 'BrndList',
        entity: 'brndList',
        layout: 'CrudLayout',
        pageIndexPath: '4-Reference/01-brndList/index.jsx'
    },

    measList: {
        title: 'Measurements',
        icon: 'straighten',
        path: '/measurements',
        component: 'MeasList',
        entity: 'measList',
        layout: 'CrudLayout',
        pageIndexPath: '4-Reference/04-measList/index.jsx'
    },

    wrkrList: {
        title: 'Workers',
        icon: 'person',
        path: '/workers',
        component: 'WrkrList',
        entity: 'wrkrList',
        layout: 'CrudLayout',
        pageIndexPath: '4-Reference/03-wrkrList/index.jsx'
    }
};
