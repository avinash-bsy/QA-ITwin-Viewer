import { Modal, ModalContent, ProgressRadial } from "@itwin/itwinui-react";
import { FunctionComponent, useEffect, useState } from "react";
import { useClashDetectionTestContext } from "../../context/ClashDetectionTestContext";
import NameDescription from "./NameDescription";
import SetDataSelection, { SetDataObject } from "./SetDataSelection";
import ModalFooter from "./CDTestModalFooter";
import ClashReviewApi from "../../configs/ClashReviewApi";
import { useClashContext } from "../../context/ClashContext";
import AdvancedOption from "./AdvancedOptions";
import SuppressionRuleModal from "./SuppressionRulesModal";

interface ClashDetectionTestModalProps {
	method: "create" | "update";
	handleModalClose: () => void;
	selectedTestId: string;
}

export const convertStringtoObject = (queryReference: string): { [id: string]: Array<string> } => {
	if (queryReference) {
		let responseObject: { [id: string]: Array<string> } = {};
		const mappingAndGrouppings = queryReference.split(";");
		mappingAndGrouppings.forEach((mappingAndGroupping) => {
			const mappingId = mappingAndGroupping.split(":")[0];
			const groupingIds = mappingAndGroupping.split(":")[1];
			const groupingIdsString = groupingIds.substring(1, groupingIds.length - 1);
			let groupingIdArray = groupingIdsString.split(",");

			responseObject[mappingId] = groupingIdArray;
		});

		return responseObject;
	} else {
		return {};
	}
};

export const formatQueryReference = (mappingAndGroupings: Record<string, Array<string>> | undefined): string => {
	let queryReference = "";
	if (mappingAndGroupings) {
		Object.entries(mappingAndGroupings).map(([mappingId, groupingIds]: [string, Array<string>], index) => {
			queryReference += mappingId + ":[";
			groupingIds.forEach((groupingId: string, idx: number) => {
				queryReference += groupingId;
				if (idx !== groupingIds.length - 1) {
					queryReference += ",";
				}
			});
			queryReference += "]";
			if (index !== groupingIds.length - 1) {
				queryReference += ";";
			}
		});
	}
	return queryReference;
};

const ClashDetectionTestModal: FunctionComponent<ClashDetectionTestModalProps> = ({ method, handleModalClose, selectedTestId }) => {
	const { currentPage, testDetails, setTestDetails, setCurrentPage,  } = useClashDetectionTestContext();
	const { iTwinId } = useClashContext();
	const [selectedDataItems, setSelectedDataItems] = useState<Record<"setA" | "setB", SetDataObject>>({setA : {}, setB : {}});
	const [loading, setLoading] = useState<boolean>(false)

	const createClashDetectionTest = async () => {
		try {
			setLoading(true)
			addSetData()

			const response = await ClashReviewApi.createClashDetectionTest(iTwinId, testDetails)
			console.log(response)
			alert("Test created successfully")
		} catch (error) {
			console.log(error)
		}
		finally
		{
			setLoading(false)
		}
		
	};

	const updateClashDetectionTest = () => {
		alert("update clash test");
	};

	const actionHandler = () => {
		if (method === "create") {
			createClashDetectionTest();
		} else {
			updateClashDetectionTest();
		}
	};

	const handleSuppressionModalClose = () => {
		setCurrentPage("advancedOptions")
	}

	const addSetData = () => {
		const setAQueryReference = formatQueryReference(selectedDataItems.setA.mappingAndGroupings);
		const setBQueryReference = formatQueryReference(selectedDataItems.setB.mappingAndGroupings);

		testDetails.setA = {
			...testDetails.setA,
			modelIds: selectedDataItems.setA.models?.length === 0 ? undefined : selectedDataItems.setA.models,
			categoryIds: selectedDataItems.setA.categories?.length === 0 ? undefined : selectedDataItems.setA.categories,
			queries: !!setAQueryReference
				? {
						type: 1,
						queryReference: setAQueryReference,
				  }
				: undefined,
		};

		testDetails.setB = {
			...testDetails.setB,
			modelIds: selectedDataItems.setB.models?.length === 0 ? undefined : selectedDataItems.setB.models,
			categoryIds: selectedDataItems.setB.categories?.length === 0 ? undefined : selectedDataItems.setB.categories,
			queries: !!setBQueryReference
				? {
						type: 1,
						queryReference: setBQueryReference,
				  }
				: undefined,
		};

		setTestDetails(testDetails);
	}

	const getModalContent = () => {
		switch(currentPage) {
			case "nameDescription":
				return <NameDescription />
			case "advancedOptions":
				return <AdvancedOption />
			case "setSelection" :
				return <SetDataSelection selectedDataItems={selectedDataItems} setSelectedDataItems={setSelectedDataItems}/>
			case "suppressionRules" :
				return <SuppressionRuleModal handleOnClose={handleSuppressionModalClose}/>
		}
	}

	useEffect(() => {
		const initApp = async () => {
			const response = await ClashReviewApi.getClashTestDetailById(iTwinId, selectedTestId);
			setTestDetails(response);
			setSelectedDataItems(
				{
					setA : {
						models : response.setA.modelIds || [],
						categories : response.setA.categoryIds || [],
						mappingAndGroupings: response.setA.queries ? convertStringtoObject(response.setA.queries?.queryReference!) : {}
					},
					setB : {
						models : response.setB.modelIds || [],
						categories : response.setB.categoryIds || [],
						mappingAndGroupings: response.setB.queries ? convertStringtoObject(response.setB.queries?.queryReference!) : {}
					}
				}
			)
		};

		if (method === "update") {
			initApp();
		}
		else
		{
			setSelectedDataItems(
				{
					setA : {
						models : [],
						categories : [],
						mappingAndGroupings: {}
					},
					setB : {
						models : [],
						categories : [],
						mappingAndGroupings: {}
					}
				}
			)
		}
	}, []);

	useEffect(() => {
		console.log(selectedDataItems)
	}, [selectedDataItems])

	return (
		<Modal
			title={method === "create" ? "Create Clash Detection Test" : `Modify : ${testDetails.name}`}
			style={{ width: "800px" }}
			isOpen={true}
			onClose={handleModalClose}
			closeOnEsc
			closeOnExternalClick
			isDismissible>
			<ModalContent className="customModal">
				{loading ? <ProgressRadial indeterminate={true}/> : getModalContent()}
			</ModalContent>
			<ModalFooter method={method} actionHandler={actionHandler} />
		</Modal>
	);
};

export default ClashDetectionTestModal;
