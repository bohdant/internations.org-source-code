/**
 * @flow
 *
 * Experiment tool - allows to obtain experiment state
 *
 * Experiments hash is defined in
 * app-new/src/InterNations/Bundle/LayoutBundle/Resources/views/Shared/_experiments.html.twig
 *
 * @example Check that version A is enabled
 *
 *   experiment.segment('nv01').isSegmentA();
 *
 * @example Check that version B is enabled
 *
 *   experiment.segment('nv01').isSegmentB();
 *
 */
import dataProvider from 'service/data_provider'

export default {
    segment(experiment: string) {
        const experiments = dataProvider.get('experiments') || {}
        const actualSegment = (experiments[experiment] || 'A').toUpperCase()

        function segmentIsOneOf(expectedSegments: string[]) {
            return expectedSegments.some(this.isSegment)
        }

        function isSegment(expectedSegment: string) {
            return expectedSegment.toUpperCase() === actualSegment
        }

        return {
            isSegment,
            segmentIsOneOf,
            isSegmentA: () => isSegment('A'),
            isSegmentB: () => isSegment('B'),
            isSegmentC: () => isSegment('C'),
            isSegmentD: () => isSegment('D'),
            actualSegment: () => actualSegment,
        }
    },
}
