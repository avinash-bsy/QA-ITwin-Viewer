import React from "react";
import { Table } from "@itwin/itwinui-react";

interface MappingAndGroupingProps {
	selectedMapAndGroups: Record<string, Array<string>>;
	mapAndGroupsList: Array<any>;
	setSelectedItems: (tab: "mappingAndGroupings", ids: any) => void;
}

const MappingAndGroupingTab = (props: MappingAndGroupingProps) => {
	const onSelect = (rows: any) => {
		let selectedRows: { [id: string]: Array<string> } = {};
		rows.forEach((row: any) => {
			if (row.mappingId) {
				if (selectedRows[row.mappingId] === undefined) {
					selectedRows[row.mappingId] = [row.id];
				} else {
					selectedRows[row.mappingId].push(row.id);
				}
			} else {
				if (!selectedRows[row.id]) {
					selectedRows[row.id] = [];
				}
			}
		});

		props.setSelectedItems("mappingAndGroupings", selectedRows);
	};

	const getSelectedRows = () => {
		const selectedRowIds: { [id: string]: boolean } = {};
		if (props.selectedMapAndGroups) {
			props.mapAndGroupsList.map((row: any, index: number) => {
				if (props.selectedMapAndGroups[row.id]) {
					if (row.subRows) {
						if (props.selectedMapAndGroups[row.id].length === row.subRows.length) {
							selectedRowIds[index] = true;
						}
						row.subRows.map((subRow: any, idx: string) => {
							if (props.selectedMapAndGroups[row.id].includes(subRow.id)) {
								selectedRowIds[`${index}.${idx}`] = true;
							}
						});
					}
				}
			});
		}

		return selectedRowIds;
	};

	return (
		<>
			<Table
				emptyTableContent="No data."
				isSelectable
				isSortable
				data={props.mapAndGroupsList}
				columns={[
					{
						id: "name",
						Header: "Name",
						accessor: "name",
					},
				]}
				initialState={{
					selectedRowIds: getSelectedRows(),
				}}
				onSelect={onSelect}
			/>
		</>
	);
};

export default MappingAndGroupingTab;
