/* @flow */
import Router from 'service/router'
import type { EntityID, BreakpointName, GATrackingFields } from 'app/types'
import { routerActions, LOCATION_CHANGE as RRR_LOCATION_CHANGE } from 'react-router-redux'

export type ErrorAction<T> = { type: T, payload: Error, error: boolean }

export type CallApiInitType<T> = { type: T, payload: {} }

export type CallApiSuccessType<T, U> = { type: T, payload: { result: U } }

export const makeError = <T>(type: T) => (error: Error): ErrorAction<T> => ({ type, payload: error, error: true })

export const CALL_API: 'CALL_API' = 'CALL_API'
export const NAVIGATE: 'NAVIGATE' = 'NAVIGATE'
export const DISPATCH_BACKBONE: 'DISPATCH_BACKBONE' = 'DISPATCH_BACKBONE'
export const BACKBONE_EVENT: 'BACKBONE_EVENT' = 'BACKBONE_EVENT'
export const UPDATE_ENTITIES: 'UPDATE_ENTITIES' = 'UPDATE_ENTITIES'
export const GENERIC_CALL_API_ERROR: 'GENERIC_CALL_API_ERROR' = 'GENERIC_CALL_API_ERROR'
export const START_LOADING: 'START_LOADING' = 'START_LOADING'
export const STOP_LOADING: 'STOP_LOADING' = 'STOP_LOADING'
export const UPLOAD_PROFILE_PICTURE: 'UPLOAD_PROFILE_PICTURE' = 'UPLOAD_PROFILE_PICTURE'
export const DISCONNECT_FROM_USER: 'DISCONNECT_FROM_USER' = 'DISCONNECT_FROM_USER'

export const FETCH_MY_PRIVACY_SETTINGS: 'FETCH_MY_PRIVACY_SETTINGS' = 'FETCH_MY_PRIVACY_SETTINGS'

export const USERCARD_LOCK_OPEN: 'USERCARD_LOCK_OPEN' = 'USERCARD_LOCK_OPEN'
export const USERCARD_UNLOCK_OPEN: 'USERCARD_UNLOCK_OPEN' = 'USERCARD_UNLOCK_OPEN'

// Permissions
export const NEED_PERMISSIONS: 'NEED_PERMISSIONS' = 'NEED_PERMISSIONS'

export const TRIGGER_PAYWALL: 'TRIGGER_PAYWALL' = 'TRIGGER_PAYWALL'

export const OPEN_INTERESTS_MODAL: 'OPEN_INTERESTS_MODAL' = 'OPEN_INTERESTS_MODAL'

export const TWINKLE: 'TWINKLE' = 'TWINKLE'

export const LOCATION_CHANGE: 'LOCATION_CHANGE' = 'LOCATION_CHANGE'

export type RRRLocationChangeAction = {
    type: RRR_LOCATION_CHANGE,
    payload: { hash: string, key: string, pathname: string, search: string, state: mixed },
}

export const SWITCH_BREAKPOINT: 'SWITCH_BREAKPOINT' = 'SWITCH_BREAKPOINT'

// Impure Actions
// FIXME(vitorbal): use exact object types for stricted typechecking.
// Can only be done after babel supports type spread syntax.
export type CallApiAction = {
    type: typeof CALL_API,
    payload: {
        // The 3 actions to fire during the lifecycle of this API call:
        // [initType, successType, errorType]
        types: [?string, ?string, ?string],
        // The method to call to initiate the side-effect part of the lifecycle
        method: Function,
        // Arguments to pass to `method` when it gets invoked
        args?: any,
        // Payload to pass to the initType action
        initPayload?: Object,
    },
}

export type UploadProfilePictureAction = {
    type: typeof UPLOAD_PROFILE_PICTURE,
    payload: {
        file: File,
        hd: boolean,
    },
}

export type NavigateAction = {
    type: typeof NAVIGATE,
    payload: { url: string },
}

export type DispatchBackboneAction = {
    type: typeof DISPATCH_BACKBONE,
    payload: {
        name: string,
        args?: any,
    },
}

export type TwinkleAction = {
    type: typeof TWINKLE,
    payload: {
        userId: EntityID,
        trackingFields?: ?GATrackingFields,
    },
}

export type DisconnectFromUserAction = {
    type: typeof DISCONNECT_FROM_USER,
    payload: {
        userId: EntityID,
        reloadAfter: boolean,
        trackingFields?: ?GATrackingFields,
    },
}

export const FETCH_USER_CARD: 'FETCH_USER_CARD' = 'FETCH_USER_CARD'
export type FetchUserCardAction = {
    type: typeof FETCH_USER_CARD,
    payload: {
        userId: EntityID,
    },
}

export const FETCH_PROFILE: 'FETCH_PROFILE' = 'FETCH_PROFILE'
export type FetchProfileAction = {
    type: typeof FETCH_PROFILE,
    payload: {
        userId: EntityID,
    },
}

export type NeedPermissionsAction = {
    type: typeof NEED_PERMISSIONS,
    payload: {
        userId: EntityID,
        useCache: boolean,
    },
}

export type TriggerPaywallAction = {
    type: typeof TRIGGER_PAYWALL,
    payload: {
        entityId?: ?string,
        modalContentUrl: string,
        referrer?: ?string,
        trackingName?: ?string,
        trackingSegment?: ?string,
        type: string,
        upgradeHandler: string,
        upgradeHandlerParameters?: ?mixed,
    },
}

export type OpenInterestsModalAction = {
    type: typeof OPEN_INTERESTS_MODAL,
    payload: { entityId?: ?string, userId: EntityID, trackingName?: ?string, trackingSegment?: ?string },
}

type RouteChangeOptions = { disableScrollToTop?: boolean }

export type LocationChangeAction = {
    type: typeof LOCATION_CHANGE,
    payload: {
        pathOrLocation: string,
        historyAction: 'push' | 'replace',
        ...RouteChangeOptions,
    },
}

export type ImpureAction =
    | CallApiAction
    | DispatchBackboneAction
    | FetchUserCardAction
    | RRRLocationChangeAction
    | UploadProfilePictureAction
    | NeedPermissionsAction
    | NavigateAction
    | TriggerPaywallAction
    | TwinkleAction
    | DisconnectFromUserAction
    | LocationChangeAction
    | OpenInterestsModalAction

export type PureAction =
    | {
          type: 'UPDATE_ENTITIES',
      }
    | {
          type: 'FETCH_USER_INBOX_SUCCESS',
          payload: { users: any, conversations: Object[], userInbox: Object[] },
      }
    | {
          type: 'UPDATE_CONVERSATION',
          payload: { id: EntityID, conversation: Object },
      }
    | { type: 'RECEIVE_USER_CARD', payload: { userId: EntityID, markup: string } }
    | { type: typeof USERCARD_LOCK_OPEN, payload: { userId: EntityID, className: string } }
    | { type: typeof USERCARD_UNLOCK_OPEN }
    | {
          type: typeof START_LOADING,
          payload: {
              loaderName: string,
          },
      }
    | {
          type: typeof STOP_LOADING,
          payload: {
              loaderName: string,
          },
      }
    | {
          type: typeof SWITCH_BREAKPOINT,
          payload: {
              breakpoint: BreakpointName,
          },
      }

export type Action = PureAction | ImpureAction
export type ActionWithMeta = ImpureAction & { meta: Object }
// FIXME(vitorbal): use type spread and use exact object types for stricted typechecking.
// Can only be done after babel supports type spread syntax.
// export type ActionWithMeta = {| ...ImpureAction, meta: Object |};

export const typeOnlyAction = <T>(type: T): (() => { type: T }) => () => ({ type })

export const updateEntities = (payload: Object): PureAction => ({
    type: UPDATE_ENTITIES,
    payload,
})

export const errorAction = (type: string) => (error: Error) => ({ type, payload: error, error: true })

export const genericCallApiError = errorAction(GENERIC_CALL_API_ERROR)

// Routing
// =============================================

export const pushRoute = (pathOrLocation: string, options?: RouteChangeOptions) => ({
    type: LOCATION_CHANGE,
    payload: { historyAction: 'push', pathOrLocation, ...options },
})

export const replaceRoute = (pathOrLocation: string, options?: RouteChangeOptions) => ({
    type: LOCATION_CHANGE,
    payload: { historyAction: 'replace', pathOrLocation, ...options },
})

export const goBack = () => routerActions.goBack()
export const navigate = (url: string) => ({
    type: NAVIGATE,
    payload: {
        url,
    },
})

//
// Conversation
// =============================================
// Receives user inbox data that was fetched from the server and parsed.
export const fetchUserInboxSuccess = (parsedServerResponse: Object): Action => ({
    type: 'FETCH_USER_INBOX_SUCCESS',
    payload: {
        users: parsedServerResponse.user,
        conversations: parsedServerResponse.conversation,
        userInbox: parsedServerResponse.list,
    },
})

// Updates a conversation's data and persists it to the Backend.
// Relies on the custom Request middleware defined in `middlewares/request.js`
// TODO(vitorbal): persist to backend
// TODO(vitorbal): rename conversation to something more obvious
export const updateConversation = (id: EntityID, conversation: Object): Action => ({
    type: 'UPDATE_CONVERSATION',
    payload: {
        id,
        conversation,
    },
})

// Select a conversation with the specified id.
export const selectConversation = (id: EntityID): Action => ({
    type: 'UPDATE_CONVERSATION',
    payload: {
        id,
        conversation: {
            unread: false,
        },
    },
    meta: {
        redirect: {
            path: Router.path('message_inbox_inbox_get', { conversationId: id }),
            replace: true,
        },
    },
})

//
// User Card
// =============================================
export const fetchUserCard = (userId: EntityID): FetchUserCardAction => ({
    type: FETCH_USER_CARD,
    payload: { userId },
})

export const receiveUserCard = (userId: EntityID, markup: string): Action => ({
    type: 'RECEIVE_USER_CARD',
    payload: { userId, markup },
})

export const showUserCard = (userId: EntityID, className: string): Action => ({
    type: USERCARD_LOCK_OPEN,
    payload: { userId, className },
})

export const unlockUserCardVisibility = (): Action => ({
    type: USERCARD_UNLOCK_OPEN,
})

export const fetchProfile = (userId: EntityID): FetchProfileAction => ({
    type: FETCH_PROFILE,
    payload: {
        userId,
    },
})

export const startLoading = (loaderName: string): PureAction => ({
    type: START_LOADING,
    payload: {
        loaderName,
    },
})

export const stopLoading = (loaderName: string): PureAction => ({
    type: STOP_LOADING,
    payload: {
        loaderName,
    },
})

export const uploadProfilePicture = (file: File, hd: boolean = true): UploadProfilePictureAction => ({
    type: UPLOAD_PROFILE_PICTURE,
    payload: {
        file,
        hd,
    },
})

export const switchBreakpoint = (breakpoint: BreakpointName): PureAction => ({
    type: SWITCH_BREAKPOINT,
    payload: { breakpoint },
})

export const needPermissions = (userId: EntityID, useCache: boolean = true): ImpureAction => ({
    type: NEED_PERMISSIONS,
    payload: {
        userId,
        useCache,
    },
})

export const dispatchBackbone = (name: string, args: ?Object) => ({
    type: DISPATCH_BACKBONE,
    payload: {
        name,
        args,
    },
})

export const backboneEvent = (event: Object) => ({
    type: BACKBONE_EVENT,
    payload: event,
})

export const openModal = (options: Object) => dispatchBackbone('Modal:open', options)

export const openNewContactRequestModal = (userId: EntityID) =>
    openModal({
        focusSelector: 'textarea',
        classes: 't-modal modal modal-noHeader',
        url: Router.path('network_contact_request_new', { userId }),
    })

export const openMessageModal = (entityId: EntityID, messageType: string, ref: ?string) =>
    dispatchBackbone('Message:modal:open', {
        url: Router.path('message_message_new', { messageType, entityId }, { query: { ref: ref || '' } }),
    })

export const openBlockThisMemberModal = (userId: EntityID) =>
    openModal({
        url: Router.path('contact_block_new', { userId }),
    })

export const openUnblockThisMemberModal = (userId: EntityID) =>
    openModal({
        url: Router.path('contact_block_edit', { userId }),
    })

export const openReportAbuseModal = (entityId: EntityID, reportType: string) =>
    openModal({
        url: Router.path('fraud_protection_abuse_report_new', { entityId, reportType }),
    })

export const openInterestsEditModal = ({
    userId,
}: {
    userId: EntityID,
    trackingName?: string,
    trackingSegment?: string,
}) => ({
    type: OPEN_INTERESTS_MODAL,
    payload: { userId },
})

export const impersonate = (userId: EntityID) =>
    navigate(Router.path('profile_profile_get', { userId }, { query: { _switch_user: userId } }))

export const editUser = (userId: EntityID) => navigate(Router.path('profile_admin_edit', { userId }))

export const triggerPaywall = (payload: *): TriggerPaywallAction => ({ type: TRIGGER_PAYWALL, payload })

export const twinkle = (userId: EntityID, trackingFields: ?GATrackingFields): TwinkleAction => ({
    type: TWINKLE,
    payload: { userId, trackingFields },
})

export const disconnectFromUser = ({
    userId,
    reloadAfter = false,
    trackingFields,
}: {
    userId: EntityID,
    reloadAfter: boolean,
    trackingFields?: ?GATrackingFields,
}): DisconnectFromUserAction => ({
    type: DISCONNECT_FROM_USER,
    payload: { userId, reloadAfter, trackingFields },
})

export const fetchMyPrivacySettings = () => ({
    type: FETCH_MY_PRIVACY_SETTINGS,
    payload: {},
})
