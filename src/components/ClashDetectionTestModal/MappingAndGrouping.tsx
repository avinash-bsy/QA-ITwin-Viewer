import React, { useMemo } from "react";
import { Table } from "@itwin/itwinui-react";

interface MappingAndGroupingProps {
	selectedMapAndGroups: Record<string, Array<string>>;
	mapAndGroupsList: Array<any>;
	setSelectedItems: (tab: "mappingAndGroupings", ids: any) => void;
}

const MappingAndGroupingTab = ({ selectedMapAndGroups, mapAndGroupsList, setSelectedItems }: MappingAndGroupingProps) => {
	const onSelect = (rows: any): void => {
		let selectedRows: { [id: string]: Array<string> } = {};

		// if row has a mapping id then that row signifies grouping data, else its a mapping data
		rows.forEach((row: any) => {
			if (!row.mappingId) {
				if (!selectedRows[row.id]) {
					// adding mapping id with an empty array
					selectedRows[row.id] = [];
				}
				return;
			}

			if (!selectedRows[row.mappingId]) {
				// if mapping id of this particular group is not added in object then initializing the mapping id with an array containing this grouping id
				selectedRows[row.mappingId] = [row.id];
				return;
			}

			selectedRows[row.mappingId].push(row.id);
		});

		setSelectedItems("mappingAndGroupings", selectedRows);
	};

	const getSelectedRows = (): { [id: string]: boolean } => {
		const selectedRowIds: { [id: string]: boolean } = {};
		if (!selectedMapAndGroups) return selectedRowIds;

		mapAndGroupsList.forEach((row: any, index: number) => {
			if (!selectedMapAndGroups[row.id]) return;
			if (!row.subRows) return;

			// to mark mapping id if all associated groups are selected
			if (selectedMapAndGroups[row.id].length === row.subRows.length) {
				selectedRowIds[index] = true;
			}

			row.subRows.forEach((subRow: any, idx: string) => {
				// mark each checked group under a mapping
				if (selectedMapAndGroups[row.id].includes(subRow.id)) {
					selectedRowIds[`${index}.${idx}`] = true;
				}
			});
		});

		return selectedRowIds;
	};

	const columns = useMemo(
		() => [
			{
				id: "name",
				Header: "Name",
				accessor: "name",
			},
		],
		[]
	);

	return (
		<>
			<Table
				emptyTableContent="No data."
				isSelectable
				isSortable
				data={mapAndGroupsList}
				columns={columns}
				initialState={{
					selectedRowIds: getSelectedRows(),
				}}
				onSelect={onSelect}
			/>
		</>
	);
};

export default MappingAndGroupingTab;
