/**
 * Browsing Community Instance
 */

import CommunityModel from 'model/community'
import dataProvider from 'service/data_provider'

export default new CommunityModel(dataProvider.get('currentLocalcommunity'))
