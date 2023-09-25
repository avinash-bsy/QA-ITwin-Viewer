import { Table, ModalContent, ModalButtonBar, IconButton } from "@itwin/itwinui-react";
import { Dispatch, FunctionComponent, SetStateAction, useMemo, useState } from "react";
import { useSuppressionModalContext } from "../../../context/SuppressionModalContext";
import { SvgGoToEnd, SvgGoToStart } from "@itwin/itwinui-icons-react";
 
const SelectRuleType: FunctionComponent = () => {
    const {setSelectedRuleType, selectedRuleType, setCurrentPage} = useSuppressionModalContext()
    const columnDefinition = useMemo(
		() => [
			{
				Header: "Table",
				columns: [
					{
						id: "name",
						accessor: "name",
						Header: "Type",
					},
				],
			},
		],
		[]
	);

    const ruleTypes = useMemo(() => [
        {type : "mappingAndGrouping", name : "Suppression Mapping And Grouping"},
        {type : "aspects", name : "Suppression Aspects"},
        {type : "typeDefinition", name : "Suppression Type Definition"},
    ], [])

    const handleRowClick = (event: React.MouseEvent<Element, MouseEvent>, row: any) => {
        if (row.original.type === selectedRuleType) {
			setSelectedRuleType(null);
			return;
		}
        setSelectedRuleType(row.original.type)
    }

    const getSelectedRows = () => {
        let selectedRows:{[id:number] : boolean} = {}
        ruleTypes.forEach((ruleType, idx) => {
            if(selectedRuleType === ruleType.type)
            {
                selectedRows[idx] = true
            }
        })

        return selectedRows
    }

    return (
        <>
            <ModalContent className="customModal">
                <Table
                    columns={columnDefinition}
                    data={ruleTypes}
                    emptyTableContent="No rule type"
                    isSelectable={true}
                    initialState={{
                        selectedRowIds: getSelectedRows(),
                    }}
                    onRowClick={handleRowClick}
                    selectionMode="single"
                />
            </ModalContent>
            <ModalButtonBar style={{justifyContent:"space-between"}}>
                    <IconButton onClick={() => setCurrentPage("listRules")}>
						<SvgGoToStart style={{ height: 25, width: 25 }} />
					</IconButton>
                    <IconButton onClick={() => setCurrentPage("listTemplates")} disabled={!selectedRuleType}>
						<SvgGoToEnd style={{ height: 25, width: 25 }} />
					</IconButton>
            </ModalButtonBar>
        </>
    );
}
 
export default SelectRuleType;