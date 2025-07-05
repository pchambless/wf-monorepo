/**
 * Runtime Route Builder
 * Builds routes dynamically from eventTypes instead of static generation
 */

import { getClientSafeEventTypes } from '@whatsfresh/shared-imports';
import { clientEntityRegistry } from '../../../packages/devtools/src/registries/clientEntityRegistry.js';
import { createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('RuntimeRoutes');

/**
 * Build routes dynamically from event types
 * @returns {Object} Routes configuration
 */
export function buildRoutes() {
    const events = getClientSafeEventTypes();
    const routes = {};
    const sections = {};

    log.debug('Building routes from', events.length, 'event types');

    // Process events and match with registry
    events.forEach(event => {
        const config = clientEntityRegistry[event.eventType];
        if (!config) {
            log.warn('No registry config found for event:', event.eventType);
            return;
        }

        // Create route entry
        routes[config.routeKey] = {
            path: `/${event.eventType}`,
            component: config.pageIndexPath,
            layout: config.layout,
            title: config.title,
            icon: config.icon,
            section: config.section,
            eventType: event.eventType,
            params: event.params,
            category: event.category
        };

        // Group into sections
        if (!sections[config.section]) {
            sections[config.section] = {
                name: config.section,
                order: config.sectionOrder || 999,
                items: []
            };
        }

        sections[config.section].items.push({
            routeKey: config.routeKey,
            title: config.title,
            icon: config.icon,
            order: config.itemOrder || 999,
            color: config.color
        });
    });

    // Sort sections and items
    Object.values(sections).forEach(section => {
        section.items.sort((a, b) => (a.order || 999) - (b.order || 999));
    });

    log.debug('Built routes:', Object.keys(routes).length, 'routes');
    log.debug('Built sections:', Object.keys(sections).length, 'sections');

    return {
        routes,
        sections,
        entityRegistry: clientEntityRegistry
    };
}

/**
 * Get route by key
 */
export function getRoute(routeKey, routes) {
    return routes[routeKey];
}

/**
 * Resolve route by event type
 */
export function resolveRoute(eventType, routes) {
    return Object.values(routes).find(route => route.eventType === eventType);
}

/**
 * Get navigation sections
 */
export function getNavSections(sections) {
    return Object.values(sections).sort((a, b) => (a.order || 999) - (b.order || 999));
}
