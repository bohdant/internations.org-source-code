/* @flow */
import { combineReducers } from 'redux'
import makeEntityReducer from 'app/redux/utils/entityReducerFactory'
import permissions from 'app/redux/reducers/entities/permissions'

import type {
    ActivityGroup,
    ContactRequest,
    Country,
    EntityMap,
    EventActivity,
    Interest,
    Language,
    Nationality,
    Excursion,
    Permissions,
    PrivacySettings,
    TimelineEntry,
    University,
    User,
    UserDetails,
    UserStatistics,
    Workplace,
} from 'app/types'

export type State = {
    activityGroup: EntityMap<ActivityGroup>,
    contactRequest: EntityMap<ContactRequest>,
    country: EntityMap<Country>,
    eventActivity: EntityMap<EventActivity>,
    interest: EntityMap<Interest>,
    language: EntityMap<Language>,
    nationality: EntityMap<Nationality>,
    excursion: EntityMap<Excursion>,
    privacySettings: EntityMap<PrivacySettings>,
    permissions: EntityMap<Permissions>,
    timelineEntry: EntityMap<TimelineEntry>,
    user: EntityMap<User>,
    userDetails: EntityMap<UserDetails>,
    userStatistics: EntityMap<UserStatistics>,
    workplace: EntityMap<Workplace>,
    university: EntityMap<University>,
}

export default combineReducers({
    activityGroup: makeEntityReducer('activityGroup'),
    contactRequest: makeEntityReducer('contactRequest'),
    country: makeEntityReducer('country'),
    eventActivity: makeEntityReducer('eventActivity'),
    interest: makeEntityReducer('interest'),
    language: makeEntityReducer('language'),
    nationality: makeEntityReducer('nationality'),
    excursion: makeEntityReducer('excursion'),
    permissions,
    privacySettings: makeEntityReducer('privacySettings'),
    timelineEntry: makeEntityReducer('timelineEntry'),
    user: makeEntityReducer('user'),
    userDetails: makeEntityReducer('userDetails'),
    userStatistics: makeEntityReducer('userStatistics'),
    workplace: makeEntityReducer('workplace'),
    university: makeEntityReducer('university'),
})
