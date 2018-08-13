import { uuidv4 } from "./TabUtilities";
import { TabApiEvents } from "../../client/APITypes";
import { TabIdentifier, TabPackage, TabWindowOptions } from "../../client/types";
import { GroupWindow } from "./GroupWindow";
import { Tab } from "./Tab";
import { TabService } from "./TabService";

// tslint:disable-next-line:no-any
declare var fin: any;

/**
 * Handles functionality for the TabSet
 */
export class TabGroup {
	/**
	 * The ID for the TabGroup.
	 */
	public readonly ID: string;

	/**
	 * Handle to this tabgroups window.
	 */
	private _window: GroupWindow;

	/**
	 * Tabs currently in this tab group.
	 */
	private _tabs: Tab[];

	/**
	 * The active tab in the tab group.
	 */
	private _activeTab!: Tab;

	/**
	 * Constructor for the TabGroup Class.
	 * @param {TabWindowOptions} windowOptions
	 */
	constructor(windowOptions: TabWindowOptions) {
		this.ID = uuidv4();
		this._tabs = [];
		this._window = new GroupWindow(windowOptions, this);
	}

	/**
	 * Initializes the async methods required for the TabGroup Class.
	 */
	public async init(): Promise<void> {
		await this._window.init();
	}

	/**
	 * Adds a Tab to the tabset.
	 * @param {TabPackage} tabPackage The package containing uuid, name, tabProperties of the tab to be added.
	 * @returns {Tab} The created tab.
	 */
	public async addTab(tabPackage: TabPackage): Promise<Tab> {
		const tab = new Tab(tabPackage, this);
		this._tabs.push(tab);
		await tab.init();

		if (this._tabs.length > 1) {
			tab.window.hide();
		} else {
			const tabOpts = await tab.window.getWindowOptions();

			if (tabOpts.opacity! === 0) {
				tab.window.show();
			}
		}

		return tab;
	}

	/**
	 * Realigns all tab windows of the group to the position of the tab set window.
	 */
	public realignApps() {
		return Promise.all(
			this._tabs.map(tab => {
				tab.window.alignPositionToTabGroup();
			})
		);
	}

	/**
	 * Deregisters the Tab from tabbing altogether.
	 * @param ID ID (uuid, name) of the Tab to deregister.
	 */
	public async deregisterTab(ID: TabIdentifier): Promise<void> {
		const tab = this.getTab(ID);

		await this.removeTab(ID, false, true);

		if (tab) {
			tab.window.updateWindowOptions({ frame: true, opacity: 1.0 });
		}
	}

	/**
	 * Removes a specified tab from the tab group.
	 * @param {TabIdentifier} tabID The Tabs ID to remove.
	 * @param {boolean} closeApp Flag to force close the tab window or not.
	 * @param {boolean} closeGroupWindowCheck Flag to check if we should close the tab set window if there are no more tabs.
	 */
	public async removeTab(tabID: TabIdentifier, closeApp: boolean, closeGroupWindowCheck = false): Promise<void> {
		const index: number = this.getTabIndex(tabID);

		if (index === -1) {
			return;
		}
		const tab = this._tabs[index];
		this._tabs.splice(index, 1);

		if (this._tabs.length > 0 && this.activeTab.ID.uuid === tab.ID.uuid && this.activeTab.ID.name === tab.ID.name) {
			const nextTab: TabIdentifier = this._tabs[index] ? this._tabs[index].ID : this._tabs[index - 1].ID;

			await this.switchTab(nextTab);
		}

		await tab.remove(closeApp);

		if (closeGroupWindowCheck) {
			if (this._tabs.length === 0) {
				await TabService.INSTANCE.removeTabGroup(this.ID, true);
				return;
			}
		}
	}

	/**
	 * Switches the active Tab in the group. Hides current active window.
	 * @param {TabIdentifier} ID The ID of the tab to set as active.
	 * @param {boolean} hideActiveTab Flag if we should hide the current active tab.
	 */
	public async switchTab(ID: TabIdentifier, hideActiveTab = true): Promise<void> {
		const tab = this.getTab(ID);

		if (tab && tab !== this._activeTab) {
			await tab.window.show();

			if (this._activeTab) {
				this._activeTab.window.hide();
			}

			tab.window.finWindow.bringToFront();

			this.setActiveTab(tab);
		}
	}

	/**
	 * Removes all tabs from this tab set.
	 * @param closeApp Flag if we should close the tab windows.
	 */
	public removeAllTabs(closeApp: boolean): Promise<void[]> {
		const refArray = this._tabs.slice();
		const refArrayMap = refArray.map(tab => {
			this.removeTab(tab.ID, closeApp, true);
		});

		return Promise.all(refArrayMap);
	}

	/**
	 * Gets the tab with the specified identifier
	 * @param tabID The tab identifier
	 */
	public getTab(tabID: TabIdentifier): Tab | undefined {
		return this.tabs.find((tab: Tab) => {
			return tab.ID.uuid === tabID.uuid && tab.ID.name === tabID.uuid;
		});
	}

	/**
	 * Sets the active tab.  Does not switch tabs or hide/show windows.
	 * @param {Tab} tab The Tab to set as active.
	 */
	public setActiveTab(tab: Tab): void {
		this._activeTab = tab;
		fin.desktop.InterApplicationBus.send(fin.desktop.Application.getCurrent().uuid, this.ID, TabApiEvents.TABACTIVATED, tab.ID);
	}

	/**
	 * Finds the index of the specified Tab in the array.
	 * @param tabID The ID of the Tab.
	 * @returns {number} Index Number.
	 */
	public getTabIndex(tabID: TabIdentifier): number {
		return this.tabs.findIndex((tab: Tab) => {
			return tab.ID.uuid === tabID.uuid && tab.ID.name === tabID.uuid;
		});
	}

	/**
	 * Returns the current active tab of the tab set.
	 * @returns {Tab} The Active Tab
	 */
	public get activeTab(): Tab {
		return this._activeTab;
	}

	/**
	 * Returns the tab sets window.
	 * @returns {GroupWindow} The group window.
	 */
	public get window(): GroupWindow {
		return this._window;
	}

	/**
	 * Returns the tabs of this tab set.
	 * @returns {Tab[]} Array of tabs.
	 */
	public get tabs(): Tab[] {
		return this._tabs;
	}
}