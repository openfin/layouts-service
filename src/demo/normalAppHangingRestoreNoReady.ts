import Bounds from 'hadouken-js-adapter/out/types/src/api/window/bounds';
import {_Window} from 'hadouken-js-adapter/out/types/src/api/window/window';

import * as Layouts from '../client/main';
import {Workspace} from '../client/workspaces';

export interface Workspace {
    id: string;
    layout: Workspace;
}

let numChildren = 0;
const launchDir = location.href.slice(0, location.href.lastIndexOf('/'));

export async function createChild(parentWindowName: string): Promise<void> {
    await openChild(parentWindowName + ' - win' + numChildren, numChildren);
}

export async function openChild(name: string, i: number, frame = true, state = 'normal', url?: string, bounds?: Bounds) {
    numChildren++;

    if (bounds) {
        return fin.Window.create({
            url: url || `${launchDir}/child.html`,
            autoShow: true,
            defaultHeight: bounds.height,
            defaultWidth: bounds.width,
            defaultLeft: bounds.left,
            defaultTop: bounds.top,
            saveWindowState: false,
            frame,
            state,
            name
        });
    } else {
        return fin.Window.create({
            url: url || `${launchDir}/child.html`,
            autoShow: true,
            defaultHeight: 250 + 50 * i,
            defaultWidth: 250 + 50 * i,
            defaultLeft: 320 * (i % 3),
            defaultTop: i > 2 ? 400 : 50,
            saveWindowState: false,
            frame,
            state,
            name
        });
    }
}

// Allow layouts service to save and restore this application
Layouts.workspaces.setGenerateHandler(() => {
    return {test: true};
});
Layouts.workspaces.setRestoreHandler(Layouts.restoreHelpers.standardRestoreHandler);
// This is meant to test what happens when an application doesn't call its `ready` function.
// In this case, the application never tells the service that it's ready to accept its workspace payload, so
// the restore handler never gets called. This results in child windows not being restored.
