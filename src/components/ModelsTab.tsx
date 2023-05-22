import React from "react";
import { Table } from "@itwin/itwinui-react";

interface ModelComponentProps {
	selectedModels: Array<string>;
	modelsList: Array<any>;
	setSelectedItems: (tab: "models", ids: any) => void;
}

const ModelsTab = (props: ModelComponentProps) => {
	const onSelect = (rows: any) => {
		let selectedRows: Array<string> = [];

		rows.forEach((row: any) => {
			selectedRows.push(row.id);
		});

		props.setSelectedItems("models", selectedRows);
	};

	const getSelectedRows = () => {
		const selectedRowIds: { [id: number]: boolean } = {};
		props.modelsList.map((model: any, index: number) => {
			if (props.selectedModels.includes(model.id)) {
				selectedRowIds[index] = true;
			}
		});

		return selectedRowIds;
	};

	return (
		<Table
			columns={[
				{
					id: "name",
					Header: "Name",
					accessor: "displayName",
				},
			]}
			data={props.modelsList}
			emptyTableContent="No data."
			isSelectable={true}
			onSelect={onSelect}
			initialState={{
				selectedRowIds: getSelectedRows(),
			}}
			selectionMode="multi"
		/>
	);
};

export default ModelsTab;
