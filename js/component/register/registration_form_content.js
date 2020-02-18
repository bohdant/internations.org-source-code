import Router from 'service/router'
import template from 'component/register/template/registration_form.tmpl'
import _ from 'lodash'

const formatThreadCount = number => String(number).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

const getAmountOfThreads = threadCount => (threadCount >= 100 ? formatThreadCount(threadCount) : 'many')

const getLocationName = ({ localcommunityName, countryName }) => localcommunityName || countryName

const checklistContext = ({ localcommunityName, countryName }) => {
    const locationName = getLocationName({ localcommunityName, countryName })

    return {
        checklist: {
            belowTablet: [
                'Connect with other <strong>expats</strong>',
                'Join <strong>exciting events</strong> with expats',
                'Get <strong>tips &amp; information</strong>',
            ],
            aboveTablet: [
                `Connect with other <strong>expats in ${locationName || 'your city'}</strong>`,
                'Join <strong>exciting events</strong> to meet international people',
                `Get <strong>tips &amp; information</strong> about ${locationName || 'your destination'}`,
            ],
        },
    }
}

const checklistContextDE = () => ({
    checklist: {
        belowTablet: [
            'Finden Sie andere <strong>Expats</strong>',
            'Nehmen Sie an <strong>aufregenden Events</strong> mit anderen Expats teil',
            'Holen Sie sich <strong>Tipps & Auskünfte</strong>',
        ],
        aboveTablet: [
            'Finden Sie andere <strong>Expats in ihrer Stadt</strong>',
            'Nehmen Sie <strong>an aufregenden Events</strong> mit anderen Expats teil',
            'Holen Sie sich <strong>Tipps & Informationen</strong> für Ihre Stadt',
        ],
    },
})

const promotionContext = ({ localcommunityName }) => {
    const forumAboveTabletEnd = localcommunityName ? `in ${localcommunityName}` : ''

    return {
        promotion: {
            forum: `Connect with other <strong>expats ${forumAboveTabletEnd}</strong>`,
            event: 'Join international <strong>exciting events</strong>',
            guide: 'Get good <strong>tips &amp; information</strong>',
        },
    }
}

const getForumContext = () => ({
    title: 'Have your say!',
    text: 'Become a member to join the discussion.',
})

const getForumPostContext = () => ({
    title: 'Ask questions!',
    text: 'Become a member to join the discussion.',
})

const getMaskedUserContext = () => ({
    title: 'Network &amp; connect',
    text: 'Become a member to browse and search profiles.',
})

const getAutoShowContext = () => ({
    title: 'Access Is for Members Only',
    text: 'Sign up now to join the discussion.',
})

const getAutoShowActivityContext = () => ({
    title: 'Access Is for Members Only',
    text: 'Sign up now to attend this activity.',
})

const getAutoShowEventContext = () => ({
    title: 'Access Is for Members Only',
    text: 'Sign up now to attend this event.',
})

const getEventContext = () => ({
    title: 'Attend events',
    text: 'Become a member and come along.',
})

const getActivityContext = () => ({
    title: 'Attend Activities',
    text: 'Become a member and come along.',
})

const getArticleContext = () => ({
    title: 'Access Is for Members Only',
    text: 'Become a member to read the full article.',
})

const getArticleClickContext = () => ({
    title: 'Learn more!',
    text: 'Become a member to read the full article.',
})

const getLCArticleClickContext = () => ({
    title: 'Learn more!',
    text: 'Become a member to read the full article.',
})

const getLCArticleAutoShowContext = () => ({
    title: 'Access Is for Members Only',
    text: 'Sign up now to read the full article.',
})

const getAttendContext = () => ({
    title: 'Attend events',
    text: 'Become a member and come along.',
    checklistContext,
})

const getInformedContext = () => ({
    title: 'Get informed',
    text: 'Become a member to read the full article.',
    checklistContext,
})

const getGroupContext = () => ({
    title: 'Meet, Explore, Share',
    text: 'Become a member to join this group.',
})

const getUserContext = () => ({
    title: 'Network & connect',
    text: 'Become a member to browse and search profiles.',
})

const getBusinessContext = ({ businessName }) => {
    const companyName = businessName || 'InterNations'

    return {
        title: 'Join now',
        text: `Make the most of your time abroad with ${companyName}`,
        buttonText: 'Get started',
        brandedContent: true,
    }
}

const getBusinessRedirectContext = ({ businessName, redirectMessage }) => {
    const companyName = businessName || 'InterNations'
    return {
        title: 'Join now',
        text: `Make the most of your time abroad with ${companyName}`,
        buttonText: 'Get started',
        brandedContent: true,
        redirectMessage,
    }
}

const getBusinessContextDE = ({ businessName }) => {
    const companyName = businessName || 'InterNations'
    return {
        title: 'Jetzt Mitglied werden',
        text: `Machen Sie das Beste aus Ihrem Auslandsaufenthalt mit ${companyName}`,
        buttonText: "LOS GEHT'S",
        brandedContent: true,
        isGermanLanguage: true,
        ...checklistContextDE(),
    }
}

/* eslint-disable quote-props */
const contextMapping = {
    post_thread_button: getForumPostContext,
    masked_user: getMaskedUserContext,
    internal_link: getMaskedUserContext,
    time_triggered: getAutoShowContext,
    article: getArticleContext,
    article_click: getArticleClickContext,
    lc_article: getLCArticleAutoShowContext,
    lc_article_click: getLCArticleClickContext,
    next_article_page: getArticleClickContext,
    inside_article: getArticleClickContext,
    prev_article_page: getArticleClickContext,
    next_article_page_lc: getLCArticleClickContext,
    inside_article_lc: getLCArticleClickContext,
    prev_article_page_lc: getLCArticleClickContext,
    guide_teaser: getInformedContext,
    event_teaser: getAttendContext,
    user_image: getMaskedUserContext,
    user_more: getMaskedUserContext,
    masked_link: getMaskedUserContext,
    join_group: getGroupContext,
    button_more_group: getGroupContext,
    group_tab_wall: getGroupContext,
    group_tab_activities: getGroupContext,
    group_tab_members: getGroupContext,
    group_tab_photos: getGroupContext,
    time_triggered_group: getAutoShowActivityContext,
    attend_activity: getActivityContext,
    button_more_activity: getActivityContext,
    photo_more: getActivityContext,
    protected_link: getActivityContext,
    time_triggered_activity: getAutoShowActivityContext,
    time_triggered_event: getAutoShowEventContext,
    attend_event: getEventContext,
    event: getEventContext,
    photo_event: getEventContext,
    photo_more_event: getEventContext,
    button_more_event: getEventContext,
    masked_link_forum: getForumContext,
    masked_user_forum: getMaskedUserContext,
    user_image_forum: getMaskedUserContext,
    time_triggered_forum: getAutoShowContext,
    user: getUserContext,
    author_name: getMaskedUserContext,
    ambassador_join: getAttendContext,
    consul_join: getAttendContext,
    business: getBusinessContext,
    business_de: getBusinessContextDE,
    business_redirect: getBusinessRedirectContext,
}

const typeMapping = {
    time_triggered: 'autoShow',
    time_triggered_event: 'autoShow',
    time_triggered_activity: 'autoShow',
    time_triggered_forum: 'autoShow',
    article: 'autoShow',
    lc_article: 'autoShow',
    business_redirect: 'businessRedirect',
}
/* eslint-enable quote-props */

function getType(registrationTrigger) {
    const type = typeMapping[registrationTrigger]
    return type
}

function showCopyBelowTablet(registrationTrigger) {
    const forumRegistrationTriggers = [
        'post_thread_button',
        'user_image_forum',
        'masked_link_forum',
        'masked_user_forum',
        'time_triggered_forum',
        'internal_link',
        'button_reply',
        'reply_to_thread',
        'reply_button',
        'time_triggered_forum',
    ]

    return _.includes(forumRegistrationTriggers, registrationTrigger)
}

export function getDesignVariant(registrationTrigger) {
    // Two main values we evaluate which design variant to get:
    // registration trigger and trigger type (click, autoShow). Click is default.
    // Mix of these two define which design variant to show.

    // Extract experiment to separate method.
    // Type and design variant as two different variations
    // registrationTrigger
    const type = getType(registrationTrigger)

    if (type === 'autoShow') {
        return 'checklistWithPromotion'
    }

    if (type === 'businessRedirect') {
        return 'businessRedirect'
    }

    return 'checklist'
}
// INCONTENT-766: remove getTriggerTracking. Serves as a quick fix, will be removed with ce03 cleanup
function getTriggerTracking(registrationTrigger) {
    const type = getType(registrationTrigger)

    if (!registrationTrigger) {
        return null
    }

    if (type === 'autoShow' && !/^time_triggered/.test(registrationTrigger)) {
        return { trigger: 'time_triggered' }
    }

    return { trigger: registrationTrigger }
}

export function getContext(registrationTrigger, params = {}) {
    const { localcommunityName, localThreadCount, globalThreadCount } = params

    const postUrlQuery = getTriggerTracking(registrationTrigger)
    const postUrl = Router.path('registration_preset', null, { query: { ...postUrlQuery, registration_type: 'email' } })
    const loginUrl = Router.path('security_login')
    const threadCount = localcommunityName ? localThreadCount : globalThreadCount
    const contextFn = contextMapping[registrationTrigger] || getForumContext

    const context = {
        ...params,
        postUrl,
        loginUrl,
        localcommunityName,
        amountOfThreads: getAmountOfThreads(threadCount),
        designVariant: getDesignVariant(registrationTrigger),
        title: null,
        text: null,
        buttonText: null,
        brandedContent: null,
        isGermanLanguage: null,
        checklist: null,
        promotion: null,
    }

    return {
        ...context,
        ...promotionContext(context),
        ...checklistContext(context),
        ...contextFn(context),
        showCopyBelowTablet: showCopyBelowTablet(registrationTrigger),
    }
}

export function renderHtml(registrationTrigger, options) {
    const context = getContext(registrationTrigger, options)
    return context.designVariant ? template(context) : undefined
}
