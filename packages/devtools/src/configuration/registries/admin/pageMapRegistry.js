/**
 * Admin Page Map Registry
 * Contains all page definitions for the WhatsFresh admin application
 */

export const pageMapRegistry = {
    // Dashboard
    dashboard: {
        title: 'Admin Dashboard',
        icon: 'admin_panel_settings',
        path: '/admin/dashboard',
        component: 'AdminDashboard'
    },

    // Authentication
    userLogin: {
        title: 'Admin Login',
        icon: 'login',
        path: '/admin/login',
        component: 'AdminLogin'
    },

    // Account Management
    acctList: {
        title: 'Accounts',
        icon: 'account_circle',
        path: '/admin/accounts',
        component: 'AcctList',
        entity: 'acctList'
    },

    userList: {
        title: 'Users',
        icon: 'people',
        path: '/admin/users',
        component: 'UserList',
        entity: 'userList'
    },

    // System Management
    systemSettings: {
        title: 'System Settings',
        icon: 'settings',
        path: '/admin/settings',
        component: 'SystemSettings'
    },

    systemLogs: {
        title: 'System Logs',
        icon: 'description',
        path: '/admin/logs',
        component: 'SystemLogs'
    }
};
