import * as React from 'react';
import {
    ToolbarItem
} from '@patternfly/react-core';
import {
    action,
    createTopologyControlButtons,
    defaultControlButtonsOptions,
    GRAPH_LAYOUT_END_EVENT,
    TopologyView,
    TopologyControlBar,
    Visualization,
    VisualizationProvider,
    VisualizationSurface,
    DagreLayout,
    ColaLayout,
    ForceLayout,
    ColaGroupsLayout,
    GridLayout,
    SELECTION_EVENT,
    TopologySideBar,
} from '@patternfly/react-topology';
import {customComponentFactory, getModel} from "./TopologyApi";
import {useFilesStore, useProjectStore} from "../../api/ProjectStore";
import {shallow} from "zustand/shallow";

export const TopologyTab: React.FC = () => {

    const [files] = useFilesStore((s) => [s.files], shallow);
    const [project] = useProjectStore((s) => [s.project], shallow);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    const controller = React.useMemo(() => {
        const model = getModel(files);
        const newController = new Visualization();
        newController.registerLayoutFactory((_, graph) => new DagreLayout(graph));
        newController.registerComponentFactory(customComponentFactory);

        newController.addEventListener(SELECTION_EVENT, setSelectedIds);
        newController.addEventListener(GRAPH_LAYOUT_END_EVENT, () => {
            newController.getGraph().fit(80);
        });

        newController.fromModel(model, false);
        return newController;
    }, []);

    React.useEffect(() => {
        const model = getModel(files);
        controller.fromModel(model, false);
    }, []);

    const topologySideBar = (
        <TopologySideBar
            className="topology-sidebar"
            show={selectedIds.length > 0}
            onClose={() => setSelectedIds([])}
        >
            <div style={{ marginTop: 27, marginLeft: 20, height: '800px' }}>{selectedIds[0]}</div>
        </TopologySideBar>
    );

    return (
        <TopologyView
            viewToolbar={<ToolbarItem>{}</ToolbarItem>}
            sideBar={topologySideBar}
            controlBar={
                <TopologyControlBar
                    controlButtons={createTopologyControlButtons({
                        ...defaultControlButtonsOptions,
                        zoomInCallback: action(() => {
                            controller.getGraph().scaleBy(4 / 3);
                        }),
                        zoomOutCallback: action(() => {
                            controller.getGraph().scaleBy(0.75);
                        }),
                        fitToScreenCallback: action(() => {
                            controller.getGraph().fit(80);
                        }),
                        resetViewCallback: action(() => {
                            controller.getGraph().reset();
                            controller.getGraph().layout();
                        }),
                        legend: false
                    })}
                />
            }
        >
            <VisualizationProvider controller={controller}>
                <VisualizationSurface state={{ selectedIds }}/>
            </VisualizationProvider>
        </TopologyView>
    );
};