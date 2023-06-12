import React, { useState } from "react";
import { Table } from "@itwin/itwinui-react";

interface ModelComponentProps {
	selectedModels: Array<string>;
	modelsList: Array<any>;
	setSelectedItems: (tab: "models", ids: any) => void;
}

const ModelsTab = ({ selectedModels, modelsList, setSelectedItems }: ModelComponentProps) => {
	const onSelect = (rows: any): void => {
		let selectedRows: Array<string> = [];

		rows.forEach((row: any) => {
			selectedRows.push(row.id);
		});

		setSelectedItems("models", selectedRows);
	};

	const getSelectedRows = (): { [id: number]: boolean } => {
		const selectedRowIds: { [id: number]: boolean } = {};
		modelsList.map((model: any, index: number) => {
			if (selectedModels.includes(model.id)) {
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
			data={modelsList}
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
