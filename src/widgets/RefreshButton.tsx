import {
	AbstractWidgetProps,
	StagePanelLocation,
	StagePanelSection,
	UiItemsProvider,
	WidgetState,
	ToolbarItem,
	ActionButton,
	ConditionalStringValue,
} from "@itwin/appui-abstract";
import { Button } from "@itwin/itwinui-react";

const RefreshButton = () => {
	return <Button>Refresh</Button>;
};

export class RefreshButtonToolbarItem implements ActionButton {
	public readonly id: string = "RefreshButton";
	public readonly icon: string | ConditionalStringValue = "";
	public readonly label: string | ConditionalStringValue = "";
	public readonly itemPriority: number = 1;

	public readonly execute = () => {
		alert("clicked");
	};
}
