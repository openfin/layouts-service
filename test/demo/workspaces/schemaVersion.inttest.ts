import {MonitorInfo} from 'hadouken-js-adapter/out/types/src/api/system/monitor';

import {WorkspaceAPI} from '../../../src/client/internal';
import {Workspace} from '../../../src/client/workspaces';
import {assertDoesNotReject, assertRejects} from '../../provider/utils/assertions';
import {teardown} from '../../teardown';
import {itParameterized} from '../utils/parameterizedTestUtils';
import {sendServiceMessage} from '../utils/serviceUtils';
import {getMockWorkspace} from '../../mocks';

interface SchemaVersionTestOptions {
    versionString: string|undefined;
    shouldError: boolean;
}

afterEach(teardown);

itParameterized(
    'When calling restore, schemaVersion is handled as expected',
    (testOptions: SchemaVersionTestOptions) => `versionString: "${testOptions.versionString}" - expected ${testOptions.shouldError ? '' : 'not '}to error`,
    [
        {versionString: '1.0.0', shouldError: false},
        {versionString: '1.3.2', shouldError: false},
        {versionString: '2.0.0', shouldError: true},
        {versionString: '9.61.37.37', shouldError: true},
        {versionString: 'invalid string', shouldError: true},
        {versionString: undefined, shouldError: true}
    ],
    async (testOptions: SchemaVersionTestOptions) => {
        const workspaceToRestore = {...getMockWorkspace(), schemaVersion: testOptions.versionString};

        const restorePromise = sendServiceMessage<Workspace, Workspace>(WorkspaceAPI.RESTORE_LAYOUT, workspaceToRestore as Workspace);
        if (testOptions.shouldError) {
            await assertRejects(restorePromise);
        } else {
            await assertDoesNotReject(restorePromise);
        }
    }
);
