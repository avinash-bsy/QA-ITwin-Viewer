import { UiItemsProvider } from "@itwin/appui-react";
import { IModelApp } from "@itwin/core-frontend";
import { ToolbarItemUtilities, CommonToolbarItem, ToolbarOrientation, ToolbarUsage } from "@itwin/appui-abstract";
import ClashReviewApi from "../configs/ClashReviewApi";

export class CustomNavigationToolsProvider implements UiItemsProvider {
	public readonly id = "refresh-button";
	public provideToolbarButtonItems(
		_stageId: string,
		_stageUsage: string,
		toolbarUsage: ToolbarUsage,
		toolbarOrientation: ToolbarOrientation
	): CommonToolbarItem[] {
		const items: CommonToolbarItem[] = [];
		if (toolbarUsage == 1 && toolbarOrientation == 0) {
			const refreshButton = ToolbarItemUtilities.createActionButton("refresh-button", 100, "icon-refresh", "Refresh Viewer", () => {
				IModelApp.viewManager.refreshForModifiedModels(undefined);
				ClashReviewApi.resetDisplay();
			});

			items.push(refreshButton);
		}

		return items;
	}
}
