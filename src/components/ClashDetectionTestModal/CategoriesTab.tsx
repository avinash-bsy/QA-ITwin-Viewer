import React, { useMemo } from "react";
import { Table } from "@itwin/itwinui-react";

interface CategoryComponentProps {
	selectedCategories: Array<string>;
	categoriesList: Array<any>;
	setSelectedItems: (tab: "categories", ids: any) => void;
}

const CategoriesTab = ({ setSelectedItems, categoriesList, selectedCategories }: CategoryComponentProps) => {
	const onSelect = (rows: any): void => {
		let selectedRows: Array<string> = [];

		rows.forEach((row: any) => {
			selectedRows.push(row.id);
		});

		setSelectedItems("categories", selectedRows);
	};

	const getSelectedRows = (): { [id: number]: boolean } => {
		var selectedRowIds: { [id: number]: boolean } = {};
		categoriesList.forEach((category: any, index: number) => {
			if (selectedCategories.includes(category.id)) {
				selectedRowIds[index] = true;
			}
		});

		return selectedRowIds;
	};

	const columns = useMemo(
		() => [
			{
				id: "name",
				Header: "Name",
				accessor: "displayName",
			},
		],
		[]
	);

	return (
		<Table
			columns={columns}
			data={categoriesList}
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
