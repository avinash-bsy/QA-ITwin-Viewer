import React from "react";
import { Table } from "@itwin/itwinui-react";

interface CategoryComponentProps {
	selectedCategories: Array<string>;
	categoriesList: Array<any>;
	setSelectedItems: (tab: "categories", ids: any) => void;
}

const CategoriesTab = (props: CategoryComponentProps) => {
	const onSelect = (rows: any) => {
		let selectedRows: Array<string> = [];

		rows.forEach((row: any) => {
			selectedRows.push(row.id);
		});

		props.setSelectedItems("categories", selectedRows);
	};

	const getSelectedRows = () => {
		var selectedRowIds: { [id: number]: boolean } = {};
		props.categoriesList.map((category: any, index: number) => {
			if (props.selectedCategories.includes(category.id)) {
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
			data={props.categoriesList}
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

export default CategoriesTab;
