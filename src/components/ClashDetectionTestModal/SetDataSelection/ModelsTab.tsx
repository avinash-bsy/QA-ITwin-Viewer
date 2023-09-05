import { Table } from "@itwin/itwinui-react";
import { FunctionComponent, useCallback } from "react";

interface ModelsTabProps {
	selectedModels: Array<string>;
	modelsList: Array<any>;
	setSelectedItems: (tab: "models", ids: any) => void;
}

const ModelsTab: FunctionComponent<ModelsTabProps> = ({ selectedModels, modelsList, setSelectedItems }) => {
	const onSelect = (rows: any): void => {
		let selectedRows: Array<string> = [];

		rows.forEach((row: any) => {
			selectedRows.push(row.id);
		});

		setSelectedItems("models", selectedRows);
	};

	const getSelectedRows = (): { [id: number]: boolean } => {
		const selectedRowIds: { [id: number]: boolean } = {};
		modelsList.forEach((model: any, index: number) => {
			if (selectedModels.includes(model.id)) {
				selectedRowIds[index] = true;
			}
		});

		return selectedRowIds;
	};

	const controlledState = useCallback(
		(state: any) => {
			state.selectedRowIds = getSelectedRows();
		  return { ...state };
		},
		[selectedModels]
	);

	return (
		<Table
			columns={[
				{
					id: "name",
					Header: "Name",
					accessor: "displayName",
				},
			]}
			data={modelsList}
			emptyTableContent="No data."
			isSelectable={true}
			onSelect={onSelect}
			useControlledState={controlledState}
			selectionMode="multi"
		/>
	);
};

export default ModelsTab;
