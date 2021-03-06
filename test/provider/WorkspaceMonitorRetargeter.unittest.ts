import {Workspace} from '../../src/client/workspaces';
import {WorkspaceMonitorRetargeter} from '../../src/provider/workspaces/WorkspaceMonitorRetargeter';
import {getId} from '../../src/provider/model/Identity';
import {WindowIdentity} from '../../src/client/main';
import {getMockWorkspace, getMockWorkspaceApp, getMockWorkspaceWindow, createWorkspaceBounds} from '../mocks';
import {Rectangle} from '../../src/provider/snapanddock/utils/RectUtils';

type DesktopModel = {
    hasAllMonitors: (monitors: Rectangle[]) => boolean,
    monitors: ReadonlyArray<Rectangle>
};

const smallMonitor = {
    center: {x: 250, y: 250},
    halfSize: {x: 250, y: 250}
};

const leftMonitor = {
    center: {x: 0, y: 250},
    halfSize: {x: 250, y: 250}
};

const rightMonitor = {
    center: {x: 500, y: 250},
    halfSize: {x: 250, y: 250}
};

const singleWindowInputWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [{
        ...getMockWorkspaceApp(),
        mainWindow: {
            ...getMockWorkspaceWindow(),
            uuid: 'app-1',
            name: 'main-window',
            bounds: createWorkspaceBounds({left: 750, right: 1000, top: 100, bottom: 350})
        }
    }]
};

const singleWindowExpectedWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [{
        ...getMockWorkspaceApp(),
        mainWindow: {
            ...getMockWorkspaceWindow(),
            uuid: 'app-1',
            name: 'main-window',
            bounds: createWorkspaceBounds({left: 250, right: 500, top: 100, bottom: 350})
        }
    }]
};

const tabbedWindowInputWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [{
        ...getMockWorkspaceApp(),
        mainWindow: {
            ...getMockWorkspaceWindow(),
            uuid: 'app-1',
            name: 'main-window',
            bounds: createWorkspaceBounds({left: 100, right: 400, top: 500, bottom: 800}),
            windowGroup: [
                {uuid: 'app-1', name: 'child-window-1'}
            ]
        },
        childWindows: [
            {
                ...getMockWorkspaceWindow(),
                uuid: 'app-1',
                name: 'child-window-1',
                bounds: createWorkspaceBounds({left: 100, right: 400, top: 500, bottom: 800}),
                windowGroup: [
                    {uuid: 'app-1', name: 'main-window'}
                ]
            }
        ]
    }],
    tabGroups: [
        {
            groupInfo: {
                active: {uuid: 'app-1', name: 'child-window-1'},
                dimensions: {x: 100, y: 440, appHeight: 300, width: 300},
                config: 'default',
                state: 'normal'
            },
            tabs: [
                {uuid: 'app-1', name: 'main-window'},
                {uuid: 'app-1', name: 'child-window-1'}
            ]
        }
    ]
};

const tabbedWindowExpectedWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [{
        ...getMockWorkspaceApp(),
        mainWindow: {
            ...getMockWorkspaceWindow(),
            uuid: 'app-1',
            name: 'main-window',
            bounds: createWorkspaceBounds({left: 100, right: 400, top: 200, bottom: 500}),
            windowGroup: [
                {uuid: 'app-1', name: 'child-window-1'}
            ]
        },
        childWindows: [
            {
                ...getMockWorkspaceWindow(),
                uuid: 'app-1',
                name: 'child-window-1',
                bounds: createWorkspaceBounds({left: 100, right: 400, top: 200, bottom: 500}),
                windowGroup: [
                    {uuid: 'app-1', name: 'main-window'}
                ]
            }
        ]
    }],
    tabGroups: [
        {
            groupInfo: {
                active: {uuid: 'app-1', name: 'child-window-1'},
                dimensions: {x: 100, y: 140, appHeight: 300, width: 300},
                config: 'default',
                state: 'normal'
            },
            tabs: [
                {uuid: 'app-1', name: 'main-window'},
                {uuid: 'app-1', name: 'child-window-1'}
            ]
        }
    ]
};

const twoGroupsInputWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [
        {
            ...getMockWorkspaceApp(),
            mainWindow: {
                ...getMockWorkspaceWindow(),
                uuid: 'app-1',
                name: 'main-window',
                bounds: createWorkspaceBounds({left: -100, right: 200, top: 300, bottom: 400}),
                windowGroup: [
                    {uuid: 'app-2', name: 'child-window-1'}
                ]
            },
            childWindows: [
                {
                    ...getMockWorkspaceWindow(),
                    uuid: 'app-1',
                    name: 'child-window-1',
                    bounds: createWorkspaceBounds({left: 400, right: 600, top: -100, bottom: 100}),
                    windowGroup: [
                        {uuid: 'app-1', name: 'child-window-2'},
                        {uuid: 'app-2', name: 'main-window'}
                    ]
                },
                {
                    ...getMockWorkspaceWindow(),
                    uuid: 'app-1',
                    name: 'child-window-2',
                    bounds: createWorkspaceBounds({left: 400, right: 600, top: -100, bottom: 100}),
                    windowGroup: [
                        {uuid: 'app-1', name: 'child-window-1'},
                        {uuid: 'app-2', name: 'main-window'}
                    ]
                }
            ]
        },
        {
            ...getMockWorkspaceApp(),
            mainWindow: {
                ...getMockWorkspaceWindow(),
                uuid: 'app-2',
                name: 'main-window',
                bounds: createWorkspaceBounds({left: 400, right: 650, top: 100, bottom: 200}),
                windowGroup: [
                    {uuid: 'app-1', name: 'child-window-1'},
                    {uuid: 'app-1', name: 'child-window-2'}
                ]
            },
            childWindows: [
                {
                    ...getMockWorkspaceWindow(),
                    uuid: 'app-2',
                    name: 'child-window-1',
                    bounds: createWorkspaceBounds({left: -200, right: 200, top: 400, bottom: 550}),
                    windowGroup: [
                        {uuid: 'app-1', name: 'main-window'}
                    ]
                }
            ]
        }
    ],
    tabGroups: [
        {
            groupInfo: {
                active: {uuid: 'app-1', name: 'child-window-2'},
                config: {url: '', height: 100},
                state: 'normal',
                dimensions: {x: 400, y: -200, width: 200, appHeight: 200
                }
            },
            tabs: [
                {uuid: 'app-1', name: 'child-window-1'},
                {uuid: 'app-1', name: 'child-window-2'}
            ]
        }
    ]
};

const twoGroupsExpectedWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [
        {
            ...getMockWorkspaceApp(),
            mainWindow: {
                ...getMockWorkspaceWindow(),
                uuid: 'app-1',
                name: 'main-window',
                bounds: createWorkspaceBounds({left: 100, right: 400, top: 250, bottom: 350}),
                windowGroup: [
                    {uuid: 'app-2', name: 'child-window-1'}
                ]
            },
            childWindows: [
                {
                    ...getMockWorkspaceWindow(),
                    uuid: 'app-1',
                    name: 'child-window-1',
                    bounds: createWorkspaceBounds({left: 250, right: 450, top: 100, bottom: 300}),
                    windowGroup: [
                        {uuid: 'app-1', name: 'child-window-2'},
                        {uuid: 'app-2', name: 'main-window'}
                    ]
                },
                {
                    ...getMockWorkspaceWindow(),
                    uuid: 'app-1',
                    name: 'child-window-2',
                    bounds: createWorkspaceBounds({left: 250, right: 450, top: 100, bottom: 300}),
                    windowGroup: [
                        {uuid: 'app-1', name: 'child-window-1'},
                        {uuid: 'app-2', name: 'main-window'}
                    ]
                }
            ]
        },
        {
            ...getMockWorkspaceApp(),
            mainWindow: {
                ...getMockWorkspaceWindow(),
                uuid: 'app-2',
                name: 'main-window',
                bounds: createWorkspaceBounds({left: 250, right: 500, top: 300, bottom: 400}),
                windowGroup: [
                    {uuid: 'app-1', name: 'child-window-1'},
                    {uuid: 'app-1', name: 'child-window-2'}
                ]
            },
            childWindows: [
                {
                    ...getMockWorkspaceWindow(),
                    uuid: 'app-2',
                    name: 'child-window-1',
                    bounds: createWorkspaceBounds({left: 0, right: 400, top: 350, bottom: 500}),
                    windowGroup: [
                        {uuid: 'app-1', name: 'main-window'}
                    ]
                }
            ]
        }
    ],
    tabGroups: [
        {
            groupInfo: {
                active: {uuid: 'app-1', name: 'child-window-2'},
                config: {url: '', height: 100},
                state: 'normal',
                dimensions: {x: 250, y: 0, width: 200, appHeight: 200}
            },
            tabs: [
                {uuid: 'app-1', name: 'child-window-1'},
                {uuid: 'app-1', name: 'child-window-2'}
            ]
        }
    ]
};

const largeGroupInputWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [
        {
            ...getMockWorkspaceApp(),
            mainWindow: {
                ...getMockWorkspaceWindow(),
                uuid: 'app-1',
                name: 'corner-window',
                bounds: createWorkspaceBounds({left: 0, right: 300, top: 0, bottom: 200
                }),
                windowGroup: [
                    {uuid: 'app-1', name: 'top-window'},
                    {uuid: 'app-1', name: 'right-window'}
                ]
            },
            childWindows: [
                {
                    ...getMockWorkspaceWindow(),
                    uuid: 'app-1',
                    name: 'top-window',
                    bounds: createWorkspaceBounds({left: 0, right: 300, top: -600, bottom: 0}),
                    windowGroup: [
                        {uuid: 'app-1', name: 'corner-window'},
                        {uuid: 'app-1', name: 'right-window'}
                    ]
                },
                {
                    ...getMockWorkspaceWindow(),
                    uuid: 'app-1',
                    name: 'right-window',
                    bounds: createWorkspaceBounds({left: 300, right: 700, top: 0, bottom: 200}),
                    windowGroup: [
                        {uuid: 'app-1', name: 'corner-window'},
                        {uuid: 'app-1', name: 'top-window'}
                    ]
                }
            ]
        }
    ]
};

const largeGroupExpectedWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [
        {
            ...getMockWorkspaceApp(),
            mainWindow: {
                ...getMockWorkspaceWindow(),
                uuid: 'app-1',
                name: 'corner-window',
                bounds: createWorkspaceBounds({left: 0, right: 300, top: 300, bottom: 500})
            },
            childWindows: [
                {
                    ...getMockWorkspaceWindow(),
                    uuid: 'app-1',
                    name: 'top-window',
                    bounds: createWorkspaceBounds({left: 0, right: 300, top: 0, bottom: 600})
                },
                {
                    ...getMockWorkspaceWindow(),
                    uuid: 'app-1',
                    name: 'right-window',
                    bounds: createWorkspaceBounds({left: 100, right: 500, top: 300, bottom: 500})
                }
            ]
        }
    ]
};

const windowStillOnScreenInputWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [{
        ...getMockWorkspaceApp(),
        mainWindow: {
            ...getMockWorkspaceWindow(),
            uuid: 'app-1',
            name: 'main-window',
            bounds: createWorkspaceBounds({left: 50, right: 250, top: 200, bottom: 400})
        }
    }]
};

const windowStillOnScreenExpectedWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [{
        ...getMockWorkspaceApp(),
        mainWindow: {
            ...getMockWorkspaceWindow(),
            uuid: 'app-1',
            name: 'main-window',
            bounds: createWorkspaceBounds({left: 50, right: 250, top: 200, bottom: 400})
        }
    }]
};

const leftAndRightWindowsInputWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [{
        ...getMockWorkspaceApp(),
        mainWindow: {
            ...getMockWorkspaceWindow(),
            uuid: 'left-app',
            name: 'main-window',
            bounds: createWorkspaceBounds({left: 0, right: 400, top: 0, bottom: 200})
        }
    },
    {
        ...getMockWorkspaceApp(),
        mainWindow: {
            ...getMockWorkspaceWindow(),
            uuid: 'right-app',
            name: 'main-window',
            bounds: createWorkspaceBounds({left: 200, right: 500, top: 300, bottom: 500})
        }
    }]
};

const leftAndRightWindowsExpectedWorkspace: Workspace = {
    ...getMockWorkspace(),
    apps: [{
        ...getMockWorkspaceApp(),
        mainWindow: {
            ...getMockWorkspaceWindow(),
            uuid: 'left-app',
            name: 'main-window',
            bounds: createWorkspaceBounds({left: -150, right: 250, top: 0, bottom: 200})
        }
    },
    {
        ...getMockWorkspaceApp(),
        mainWindow: {
            ...getMockWorkspaceWindow(),
            uuid: 'right-app',
            name: 'main-window',
            bounds: createWorkspaceBounds({left: 250, right: 550, top: 300, bottom: 500})
        }
    }]
};

type TestParam = [string, Workspace, Workspace];

const smallMonitorTestParams: TestParam[] = [
    ['A single window is moved as expected', singleWindowInputWorkspace, singleWindowExpectedWorkspace],
    ['A tabbed window is moved as expected', tabbedWindowInputWorkspace, tabbedWindowExpectedWorkspace],
    ['Two groups are moved as expected', twoGroupsInputWorkspace, twoGroupsExpectedWorkspace],
    ['A large group is split and moved as expected', largeGroupInputWorkspace, largeGroupExpectedWorkspace]
];

const twoMonitorTestParams: TestParam[] = [
    ['A window still on screen is not moved', windowStillOnScreenInputWorkspace, windowStillOnScreenExpectedWorkspace],
    ['A left and a right window are moved as expected', leftAndRightWindowsInputWorkspace, leftAndRightWindowsExpectedWorkspace]
];

describe('When restoring a workspace created on a large monitor on a small monitor', () => {
    it.each(smallMonitorTestParams)('%s', (titleParam: string, inputWorkspace: Workspace, expectedWorkspace: Workspace): void => {
        WorkspaceMonitorRetargeter.retargetWorkspaceForMonitors(inputWorkspace, createModelWithMonitors([smallMonitor]));

        normalize(inputWorkspace);
        normalize(expectedWorkspace);

        expect(inputWorkspace).toEqual(expectedWorkspace);
    });
});

describe('When restoring a workspace created on a single central monitor on a left and a right monitor', () => {
    it.each(twoMonitorTestParams)('%s', (titleParam: string, inputWorkspace: Workspace, expectedWorkspace: Workspace): void => {
        WorkspaceMonitorRetargeter.retargetWorkspaceForMonitors(inputWorkspace, createModelWithMonitors([leftMonitor, rightMonitor]));

        normalize(inputWorkspace);
        normalize(expectedWorkspace);

        expect(inputWorkspace).toEqual(expectedWorkspace);
    });
});

function normalize(workspace: Workspace): void {
    workspace.apps.sort((app1, app2) => app1.uuid.localeCompare(app2.uuid, 'en'));

    for (const app of workspace.apps) {
        (app.mainWindow.windowGroup as WindowIdentity[]).sort(compareIdentities);

        app.childWindows.sort(compareIdentities);
        for (const childWindow of app.childWindows) {
            (childWindow.windowGroup as WindowIdentity[]).sort(compareIdentities);
        }
    }

    workspace.tabGroups.sort(((tabGroup1, tabGroup2) => compareIdentities(tabGroup1.groupInfo.active, tabGroup2.groupInfo.active)));
    for (const tabGroup of workspace.tabGroups) {
        tabGroup.tabs.sort(compareIdentities);
    }
}

function compareIdentities(identity1: WindowIdentity, identity2: WindowIdentity): number {
    const id1 = getId(identity1);
    const id2 = getId(identity2);

    return id1.localeCompare(id2, 'en');
}

function createModelWithMonitors(monitors: Rectangle[]): DesktopModel {
    return {
        monitors,
        hasAllMonitors: (monitors: Rectangle[]) => false
    };
}
