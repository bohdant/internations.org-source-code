import _ from 'lodash'
import Backbone from 'backbone'
import locationService from 'service/location'

const _routeToRegExp = Backbone.Router.prototype._routeToRegExp
const _extractParameters = Backbone.Router.prototype._extractParameters

// Cached regex for stripping leading and trailing slashes.
const rootStripper = /^\/+|\/+$/g

// Turns a path into its normalized form with leading and trailing slashes.
// Means /path/to && path/to && /path/to/ will be normalized to /path/to/
function normalizePath(path) {
    return `/${path}/`.replace(rootStripper, '/')
}
function normalizeRoute(route) {
    return `/${route}(/)`.replace(rootStripper, '/')
}

const Router = Backbone.Router.extend({
    initialize() {
        Backbone.Router.prototype.initialize.call(this)
    },

    // Calls callback when the route matches the pathname.
    // Examples:
    // locationRoute('/my/path', function() {});
    // locationRoute('/my/:userId/path', function(userId) {});
    locationRoute(route, callback) {
        const normalizedPathname = normalizePath(locationService.getPathname())
        const normalizedRegexedRoute = _routeToRegExp(normalizeRoute(route))

        if (normalizedRegexedRoute.test(normalizedPathname)) {
            const params = _extractParameters(normalizedRegexedRoute, normalizedPathname)
            callback(...params)
        }
    },

    run(options) {
        return Backbone.history.start(options)
    },

    setPageTitle(title) {
        document.title = title
    },
})

Router.routes = {
    about_get_involved_ambassador_index: '/get-involved/internations-ambassador/',
    about_get_involved_consul_index: '/get-involved/internations-consul/',
    about_get_involved_index: '/get-involved/',
    about_get_involved_localcommunity_index: '/get-involved/community-team/',
    recruiting_team: '/team',
    about_press_press_release_get: '/press/press-release/<%= slug %>-<%= id %>',
    account_index: '/account/',
    account_privacy: '/account/privacy/',
    account_notifications: '/account/notifications/',
    activity_group_activity_group_get: '/activity-group/<%= activityGroupId %>/',
    activity_group_activity_group_index: '/activity-group/',
    activity_group_activity_index: '/activity-group/<%= activityGroupId %>/activity/<%= activityId %>',
    activity_group_activity_new: '/activity-group/<%= activityGroupId %>/activity/new',
    activity_group_activity_wire_index: '/activity-group/<%= activityGroupId %>/activity/<%= activityId %>/wire',
    activity_group_subscription_post: '/activity-group/<%= activityGroupId %>/subscription/',
    activity_group_support_request_new: '/activity-group/<%= activityGroupId %>/<%= context %>/new',
    activity_group_activity_attend_confirmation_get:
        '/activity-group/<%= activityGroupId %>/activity/<%= activityId %>/attend-confirmation',
    calendar_calendar_index: '/calendar/',
    calendar_upcoming_events_index: '/calendar/upcoming-events',
    contact_block_new: '/contact/block/new/<%= userId %>',
    contact_block_edit: '/contact/block/edit/<%= userId %>',
    content_city_guide_overview_get: '/guide/<%= country %>/<%= city %>',
    content_country_guide_overview_get: '/guide/<%= country %>',
    content_country_summary_guide_topic_get: '/guide/<%= country %>/at-a-glance',
    content_extended_guide_topic_get: '/guide/<%= country %>/<%- id %>-<%= urlName %>',
    content_global_guide_overview_index: '/guide/global/',
    content_global_guide_topic_get: '/guide/global/<%- id %>-<%= urlName %>',
    content_magazine_overview_index: '/magazine/',
    content_magazine_topic_get: '/magazine/<%= id %>-<%= urlName %>',
    email_pattern_library: '/demo/email/email_pattern_library',
    event_promotion_details_get: '/event/promotion/details/<%- event %>',
    event_promotion_wire_index: '/event/promotion/wire/<%= eventId %>',
    event_review_suggested_event_edit: '/event/review/edit/<%- suggestedEvent %>',
    event_feedback_event_modal_get: '/event-feedback/event/<%= eventId %>/feedback/new',
    event_feedback_activity_modal_get: '/event-feedback/activity/<%= activityId %>/feedback/new',
    event_promotion_attend_confirmation_get: '/event/promotion/attend-confirmation/<%= eventId %>',
    forum_admin_console_thread_get: '/console/forum/thread/<%= threadId %>',
    forum_category_external_global_index: '/world-forum/<%= categoryId %>',
    forum_category_external_local_index: '/<%= localcommunityUrlName %>-expats/forum/<%= categoryId %>',
    forum_category_get: '/forum/<%= categoryId %>',
    forum_category_index: '/forum/',
    forum_external_category_index: '/world-forum/',
    forum_subscribed_thread_index: '/forum/subscriptions',
    forum_thread_external_global_index: '/world-forum/<%= slug %>-<%= threadId %>',
    forum_thread_external_local_index: '/<%= localcommunityUrlName %>-expats/forum/<%= slug %>-<%= threadId %>',
    forum_thread_get: '/forum/thread/<%= threadId %>',
    fraud_protection_abuse_report_new: '/fraud-protection/abuse-report/new/<%= reportType %>/<%= entityId %>',
    fraud_protection_browser_fingerprint_put: '/fraud-protection/browser-fingerprint/',
    group_request_new_index: '/activity-group/request/new',
    invitation_bring_friends_get: '/invitation/bring-friends/<%= context %>/<%= eventId %>',
    invitation_platform_invitation_get: '/invitation/',
    invitation_teaser_invitees_get: '/invitation/teaser/invitees',
    localcommunity_visit_post: '/localcommunity/visit/<%= localcommunityId %>',
    location_user_location_index: '/location/user/',
    media_gallery_index: '/media/gallery/<%= galleryId %>',
    media_photo_get: '/media/photo/<%= photoId %>',
    media_photo_wire_index: '/media/photo/wire/<%= photoId %>',
    media_upload_post: '/media/upload/',
    media_upload_post_photo: '/media/upload/photo',
    member_search_get: '/members/search/result',
    member_recommendation_get: '/member/recommendations/result',
    member_index: '/members/',
    member_search_index: '/members/search',
    member_recommendation_index: '/members/recommendations/',
    membership_membership_index: '/membership/',
    membership_promotion_paywall_default: '/membership/promotion/paywall/',
    membership_promotion_paywall: '/membership/promotion/paywall/<%= context %>',
    message_inbox_inbox_get: '/inbox/<%= conversationId %>',
    message_inbox_inbox_index: '/inbox/',
    message_inbox_inbox_new: '/inbox/new/', // this route doesn't exist in the BE yet but should
    message_message_get: '/message/<%= messageId %>',
    message_message_new: '/message/new/<%= messageType %>/<%= entityId %>',
    message_overview_index: '/message/',
    network_contact_index: '/contact',
    network_contact_request_index: '/contact/request/',
    network_contact_request_new: '/contact/request/new/<%= userId %>',
    network_contact_request_new_type: '/contact/request/new/<%= userId %>/<%= type %>',
    profile_admin_edit: '/console/user/manage/edit/<%= userId %>',
    profile_preview_get: '/profile/preview/<%- id %>',
    profile_profile_get: '/profile/<%= userId %>/',
    profile_teaser_interest_edit: '/profile/<%= user %>/teaser/interests/edit',
    profile_visit_index: '/profile/visitors/',
    registration_application_post: '/registration/application/',
    registration_basic_registration_edit: '/registration/',
    registration_power_layer_new: '/registration/power-layer/', // only used for GA tracking
    registration_preset: '/registration/preset/',
    registration_promo_code_invitation: '/registration/voucher/',
    security_login: '/login/',
    seo_country_get: '/<%= country %>-expats',
    seo_localcommunity_get: '/<%= localcommunityName %>-expats',
    start_page_start_page_index: '/start/',
    start_page_wire_index: '/wire/',
    twinkle_twinkle_index: '/twinkle/',
    web_pattern_library: '/pattern-library/web',
    support_request: '/support/request/',
}

Router.routesClientSideOnly = {
    profile_client_about: '/profile/<%= userId %>/',
    profile_client_contacts: '/profile/<%= userId %>/contact/',
}

Router.routesApi = {
    activity_group_api_activity_groups_index: '/api/activity-groups',
    activity_group_api_activity_groups_teaser_index: '/api/activity-groups/teaser',
    activity_group_api_members_index: '/api/activity-groups/<%= activityGroupId %>/members',
    calendar_api_calendar_entries_index: '/api/calendar-entries',
    content_api_new_guide_articles_index: '/api/guide/articles',
    content_api_new_magazine_articles_index: '/api/magazine/articles',
    countries_api_index: '/api/countries',
    forum_api_global_overview_index: '/api/forum/global-overview',
    forum_api_replies_index: '/api/forum/threads/<%= threadId %>/replies',
    forum_api_search_index: '/api/forum/search',
    forum_api_subscribed_threads_index: '/api/forum/threads/subscribed',
    forum_api_subscriptions_delete: '/api/forum/threads/<%= threadId %>/subscription',
    forum_api_subscriptions_put: '/api/forum/threads/<%= threadId %>/subscription',
    forum_api_threads_patch: '/api/forum/threads/<%= threadId %>',
    forum_api_threads_post: '/api/forum/categories/<%= categoryId %>/threads',
    interest_api_interests_index: '/api/interests',
    localcommunity_api_localcommunities_search_index: '/api/search/localcommunities',
    location_api_suggestion_get: '/api/location/suggestion/<%= placeId %>',
    location_api_suggestion_index: '/api/location/suggestion',
    media_api_photos_post: '/api/photos',
    membership_api_checkout_payment_method_patch: '/api/membership/checkout/payment-method/',
    message_api_latest_messages_index: '/api/messages/latest',
    network_api_contact_delete: '/api/contacts/<%= userId %>',
    network_api_contact_request_post: '/api/contact-requests',
    network_api_contact_request_patch: '/api/contact-requests/<%= contactRequestId %>',
    photos_api_upload: '/api/photos',
    profile_api_index: '/api/users/<%= userId %>',
    profile_api_details: '/api/users/<%= userId %>/details',
    profile_api_timeline_entries: '/api/users/<%= userId %>/timeline-entries',
    profile_api_timeline_entries_put: '/api/users/<%= userId %>/timeline-entries/<%= id %>',
    profile_api_timeline_entries_delete: '/api/users/<%= userId %>/timeline-entries/<%= id %>',
    profile_api_nationalities: '/api/users/<%= userId %>/nationalities',
    profile_api_countries_visited: '/api/users/<%= userId %>/countries-visited',
    profile_api_activity_groups: '/api/users/<%= userId %>/activity-groups',
    profile_api_contacts_index: '/api/users/<%= userId %>/contacts',
    profile_api_contacts_distinct: '/api/users/<%= userId %>/contacts/distinct',
    profile_api_contacts_mutual: '/api/users/<%= userId %>/contacts/mutual',
    profile_api_statistics: '/api/users/<%= userId %>/statistics',
    profile_api_workplaces: '/api/users/<%= userId %>/workplaces',
    profile_api_user_universities: '/api/users/<%= userId %>/user-universities',
    start_page_api_guided_tour_tracking_post: '/api/guided-tour-trackings/<%= action %>',
    start_page_api_teasers_calendar_teaser_index: '/api/teasers/calendar',
    start_page_api_teasers_contact_request_teaser_index: '/api/teasers/contact-request',
    start_page_api_teasers_forum_teaser_index: '/api/teasers/forum',
    start_page_api_teasers_guide_teaser_index: '/api/teasers/guide',
    start_page_api_teasers_member_recommendation_teaser_index: '/api/teasers/member-recommendation',
    start_page_api_teasers_profile_visit_teaser_index: '/api/teasers/profile-visit',
    start_page_api_teasers_volunteer_teaser_index: '/api/teasers/volunteer',
    start_page_api_visit_post: '/api/start-page-visits',
    tracking_api_track_post: '/api/t/events/<%= type %>',
    twinkle_api_latest_twinkles_index: '/api/twinkles/latest',
    twinkle_api_twinkles_post: '/api/twinkles',
    user_api_alerts_count_index: '/api/alerts/count',
    user_api_privacy_settings_get: '/api/users/current/privacy-settings',
    user_api_user_universities_delete: '/api/users/<%= userId %>/user-universities/<%= id %>',
    user_api_user_universities_post: '/api/users/<%= userId %>/user-universities',
    user_api_user_universities_put: '/api/users/<%= userId %>/user-universities/<%= id %>',
    user_api_users_details_patch: '/api/users/<%= userId %>/details',
    user_api_users_get: '/api/users/current',
    user_api_users_interests_index: '/api/users/<%= userId %>/interests',
    user_api_users_interests_put: '/api/users/<%= userId %>/interests',
    user_api_users_languages_put: '/api/users/<%= userId %>/languages',
    user_api_users_nationalities_put: '/api/users/<%= userId %>/nationalities',
    user_api_users_countries_get: '/api/users/<%= userId %>/contacts/countries',
    user_api_users_countries_visited_put: '/api/users/<%= userId %>/countries-visited',
    user_api_users_patch: '/api/users/current',
    user_api_users_search_index: '/api/search/users',
    user_api_workplaces_delete: '/api/users/<%= userId %>/workplaces/<%= id %>',
    user_api_workplaces_put: '/api/users/<%= userId %>/workplaces/<%= id %>',
    users_api_permissions_index: '/api/users/<%= userId %>/permissions',
    user_api_users_motto_index: '/api/users/<%= userId %>/motto',
    user_api_newcomer_contact_suggestions_get: '/api/users/newcomer-contact-suggestions',
    onboarding_api_tasks_index: '/api/onboarding/users/<%= userId %>/tasks',
    onboarding_api_tasks_get: '/api/onboarding/users/<%= userId %>/tasks/<%= taskId %>',
    onboarding_api_tasks_put: '/api/onboarding/users/<%= userId %>/tasks/<%= taskId %>',
    onboarding_api_buddy_delete: '/api/onboarding/buddies/mine',
    event_guestlist_api_guestlists_waiting_list_entries_put:
        '/api/guestlists/<%= guestlistId %>/waiting-list-entries/mine',
    event_guestlist_api_guestlists_rsvps_post: '/api/guestlists/<%= guestlistId =%>/rsvps/<%= rsvpId =%>',
    event_guestlist_api_guestlists_rsvps_delete: '/api/guestlists/<%= guestlistId =%>/rsvps/<%= rsvpId =%>',
    event_cockpit_api_dismissal_post: '/api/cockpit/dismissal',
    event_cockpit_api_calendar_entry_teasers_hosted_past_index: '/api/cockpit/calendar-entry-teasers/hosted/past',
    event_cockpit_api_calendar_entry_teasers_under_purview_upcoming_index:
        '/api/cockpit/calendar-entry-teasers/under-purview/upcoming',
    event_cockpit_api_calendar_entry_teasers_owned_suggested_index:
        '/api/cockpit/calendar-entry-teasers/owned/suggested',
    event_cockpit_api_activity_groups_owned_index: '/api/cockpit/activity-group-teasers/owned',
}

Router.routesWebView = {
    webview_paywall_activity_url:
        'internationsapp://paywalls/<%- paywallType %>?activityId=<%- activityId %>&upgradeHandler=<%- upgradeHandler %>&upgradeHandlerParameters=<%- upgradeHandlerParameters %>&referrer=<%- referrer %>',
    webview_paywall_url:
        'internationsapp://paywalls/<%- paywallType %>?upgradeHandler=<%- upgradeHandler %>&upgradeHandlerParameters=<%- upgradeHandlerParameters %>&referrer=<%- referrer %>',
}

/**
 * Get route path
 *
 * @param  {String}        name                  Route name
 * @param  {Object}        [params]              Route path params that will be replaced
 * @param  {Object}        [options]             Route options
 * @param  {String|Object} [options.query]       Query option of the route
 * @param  {String}        [options.hash]        Hash option of the route
 * @param  {Boolean}       [options.webOnlyUrl]  Returns a .mobi url
 *
 * @return {String}        Route
 *
 * @example
 *
 *   // Assume you have routes on server side:
 *   // profile_profile_get => /profile/{userId}/
 *   // start_page_wire => /start/
 *
 *   // route without params
 *   Router.path('start') => /start/
 *
 *   // route with params
 *   Router.path('profile_profile_get', { userId: 1 }); // => /profile/1/
 *
 *   // route without params and with query and hash
 *   Router.path('start', null, {
 *      query: { hello: 'world' },
 *      hash: '#welcome'
 *   }); => /start/?hello=world#welcome
 *
 *   // route with params, query and hash
 *   Router.path('profile', { userId: 1 }, {
 *     query: { hello: 'world' },
 *     hash: '#welcome'
 *   }); => /profile/1/?hello=world#welcome
 *
 */
Router.path = function path(name, params, options) {
    let _route
    const _routes = Object.assign(
        {},
        Router.routes,
        Router.routesApi,
        Router.routesWebView,
        Router.routesClientSideOnly
    )
    const _routeTemplate = _routes[name]

    if (!_routeTemplate) {
        throw new Error(`Route for \`${name}\` is not provided.`)
    }

    if (!_.isUndefined(params) && !_.isNull(params) && !_.isObject(params)) {
        throw new Error('Params should be an object or `null`')
    }

    try {
        _route = _.template(_routeTemplate)(params)
    } catch (err) {
        throw new Error(`Cannot create route \`${name}\`. Not enough params.`)
    }

    return Router.generateUrl(_route, options)
}

/**
 * Generates url
 *
 * @param  {String} url                          Url base
 * @param  {Object}        [options]             Url options
 * @param  {String|Object} [options.query]       Query option of the url
 * @param  {String}        [options.hash]        Hash option of the url
 * @param  {Boolean}       [options.webOnlyUrl]  Returns a .mobi url
 *
 * @return {String}         Generated url
 *
 * @example
 *
 *   Router.generateUrl('http://internations.org', {
 *     query: { hello: 'world' },
 *     hash: 'edit'
 *   }); => 'http://internations.org?hello=world#edit'
 */
Router.generateUrl = function(url, options) {
    if (_.isUndefined(options)) {
        return url
    }

    if (!_.isObject(options)) {
        throw new Error('Options should be an object')
    }

    if (options.query) {
        url += _toQueryString(options.query)
    }

    if (options.webOnlyUrl) {
        url = `http://internations.mobi${url}`
    }

    if (_.isUndefined(options.hash)) {
        return url
    }

    // convert hash to string
    if (!_.isString(options.hash)) {
        options.hash = String(options.hash)
    }

    if (options.hash === '' || options.hash === '#') {
        return url
    }

    url += options.hash.charAt(0) === '#' ? options.hash : `#${options.hash}`

    return url
}

/**
 * Convert string or object to query string
 *
 * @param  {Object|String} query Query source
 * @return {String}       Query string
 */
function _toQueryString(query) {
    // check query
    if (query && !_.isString(query) && !_.isObject(query)) {
        throw new Error('You should provide an object or string as a query')
    }

    // string
    if (_.isString(query)) {
        return query.charAt(0) === '?' ? query : `?${query}`
    }

    // object
    let result = ''
    _.each(query, (value, key) => {
        result += result ? '&' : '?'
        result += `${key}=${encodeURIComponent(value)}`
    })

    return result
}

export default Router
