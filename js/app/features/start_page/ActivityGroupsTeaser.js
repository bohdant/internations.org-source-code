// @flow
import React from 'react'
import styled from 'styled-components'
import Router from 'service/router'
import { HALF_GUTTER, GUTTER_PLUS_HALF } from 'app/styles/sizes'

import BlockLink from 'app/components/presentational/BlockLink'
import GroupTeaserMobile from 'app/features/start_page/GroupTeaserMobile'
import type { ActivityGroup } from 'app/types'

const ContainerWrapper = styled.div`
    padding: ${HALF_GUTTER} ${HALF_GUTTER} ${GUTTER_PLUS_HALF};
`

const ElementWrapper = styled.div`
    padding: ${HALF_GUTTER};
`

type GroupTeaserElementProps = {
    activityGroup: ActivityGroup,
    index: number,
}

const GroupTeaserElement = ({ activityGroup, index }: GroupTeaserElementProps) => {
    const ref = `sp_grt_ti${index + 1}`
    const link = Router.generateUrl(activityGroup.externalUrl, { query: { ref } })
    return (
        <ElementWrapper key={link}>
            <GroupTeaserMobile
                stickerTitle={activityGroup.category}
                title={activityGroup.name}
                link={link}
                image={activityGroup.imageUrl}
                memberCount={activityGroup.memberCount}
                metaCountry={activityGroup.nationalityCount}
                testClass="t-teaser-groups-link"
            />
        </ElementWrapper>
    )
}

type Props = {
    activityGroups: Array<ActivityGroup>,
}

const ActivityGroupsTeaser = ({ activityGroups }: Props) => {
    const hasActivityGroups = activityGroups != null && activityGroups.length > 0
    const groupsPageUrl = Router.path('activity_group_activity_group_index', null, {
        query: {
            useRandomTiebreaker: 'true',
            ref: 'sp_grt_tl',
        },
    })

    return (
        hasActivityGroups && (
            <div>
                <ContainerWrapper>
                    {activityGroups.map((activity: ActivityGroup, index: number) => (
                        <GroupTeaserElement key={activity.activityGroupId} activityGroup={activity} index={index} />
                    ))}
                </ContainerWrapper>
                <BlockLink href={groupsPageUrl} icon="group">
                    Go to Groups
                </BlockLink>
            </div>
        )
    )
}

export default ActivityGroupsTeaser
