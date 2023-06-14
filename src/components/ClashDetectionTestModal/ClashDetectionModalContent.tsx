import { ChangeEvent, useCallback, useEffect, useReducer, useState } from "react";
import { Dialog, LabeledInput, IconButton, Button, ProgressLinear, ProgressRadial, ModalContent } from "@itwin/itwinui-react";
import { SvgGoToEnd } from "@itwin/itwinui-icons-react";
import useSelectedItemState from "./useSelectedTestState";
import ClashReviewApi from "../../configs/ClashReviewApi";
import { useClashContext } from "../../context/ClashContext";
import ModalFooter from "./ModalFooter";
import AdvancedOptions from "./AdvancedOptions";
import SetDataSelection from "./SetDataSelection";

interface ModalContentProps {
	method: "Create" | "Update";
	currentTestId: string | null;
}

export type PageTypes = "nameDescription" | "setSelection" | "advancedOptions";

const ClashDetectionModalContent = ({ method, currentTestId }: ModalContentProps) => {
	const { selectedDataItems, initializeSelectedItems, saveUpdatedSetData } = useSelectedItemState();
	const [currentPage, setCurrentPage] = useState<PageTypes>(method === "Update" ? "setSelection" : "nameDescription");
	const [testDetails, setTestDetails] = useState<any>({});

	const { iTwinId } = useClashContext();

	const handleInput = (event: ChangeEvent<HTMLInputElement>): void => {
		testDetails[event.target.name] = event.target.value;
		setTestDetails({ ...testDetails });
	};

	const getModalTitleText = useCallback(() => {
		if (method === "Create") {
			return "Create Clash Detection Test";
		}
		if (testDetails.name) {
			return `Modify : ${testDetails.name}`;
		}
	}, [testDetails]);

	const createClashDetectionTest = async () => {
		addSetData();
		testDetails.configType = 2;
		testDetails.includeSubModels = true;
		testDetails.advancedSettings = {
			...testDetails.advancedSettings,
			longClash: true,
			calculateOverlap: true,
			toleranceOverlapValidation: testDetails.advancedSettings?.toleranceOverlapValidation || false,
		};
		testDetails.suppressTouching = testDetails.suppressTouching || false;
		testDetails.touchingTolerance = testDetails.touchingTolerance || 0;
		const response = await ClashReviewApi.createClashDetectionTest(iTwinId, testDetails);
		console.log(response);
		setTestDetails({ ...testDetails });
		alert("test created");
	};

	const formatQueryReference = (mappingAndGroupings: Record<string, Array<string>>): string => {
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

	const getModalContent = () => {
		switch (currentPage) {
			case "nameDescription": {
				return (
					<>
						<ModalContent className="customModal">
							<LabeledInput
								placeholder="Name Required"
								label="Name"
								name="name"
								onChange={handleInput}
								value={testDetails.name || ""}
								style={{ margin: "10px 0px" }}
							/>
							<LabeledInput
								placeholder="Description Required"
								label="Description"
								name="description"
								onChange={handleInput}
								value={testDetails.description || ""}
							/>
						</ModalContent>
						<IconButton
							style={{ float: "right" }}
							disabled={!testDetails.name || !testDetails.description}
							onClick={() => setCurrentPage("setSelection")}>
							<SvgGoToEnd style={{ width: "25", height: "25" }} />
						</IconButton>
					</>
				);
			}
			case "setSelection": {
				return (
					<ModalContent className="customModal">
						<SetDataSelection selectedDataItems={selectedDataItems} saveUpdatedSetData={saveUpdatedSetData} />
					</ModalContent>
				);
			}
			case "advancedOptions": {
				return (
					<ModalContent className="customModal">
						<AdvancedOptions testDetails={testDetails} setTestDetails={setTestDetails} setCurrentPage={setCurrentPage} />
					</ModalContent>
				);
			}
		}
	};

	const addSetData = () => {
		const setAQueryReference = formatQueryReference(selectedDataItems.setA.mappingAndGroupings);
		const setBQueryReference = formatQueryReference(selectedDataItems.setB.mappingAndGroupings);

		testDetails.setA = {
			...testDetails.setA,
			// query: testDetails.setA?.query || "",
			// queryName: testDetails.setA?.queryName || "",
			selfCheck: testDetails.setA?.selfCheck || false,
			clearance: testDetails.setA?.clearance || 0,
			modelIds: selectedDataItems.setA.models.length === 0 ? undefined : selectedDataItems.setA.models,
			categoryIds: selectedDataItems.setA.categories.length === 0 ? undefined : selectedDataItems.setA.categories,
			queries: !!setAQueryReference
				? {
						type: 1,
						queryReference: setAQueryReference,
				  }
				: undefined,
		};

		testDetails.setB = {
			...testDetails.setB,
			// query: testDetails.setB?.query || "",
			// queryName: testDetails.setB?.queryName || "",
			selfCheck: testDetails.setB?.selfCheck || false,
			clearance: testDetails.setB?.clearance || 0,
			modelIds: selectedDataItems.setB.models.length === 0 ? undefined : selectedDataItems.setB.models,
			categoryIds: selectedDataItems.setB.categories.length === 0 ? undefined : selectedDataItems.setB.categories,
			queries: !!setBQueryReference
				? {
						type: 1,
						queryReference: setBQueryReference,
				  }
				: undefined,
		};

		console.log(testDetails, "addsetdata");

		setTestDetails(testDetails);
	};

	const updateClashDetectionTest = async () => {
		addSetData();

		if (testDetails.tag) {
			testDetails.tag = {
				repositoryId: testDetails.tag?.id,
				repositoryType: testDetails.tag?.type,
			};
		} else {
			delete testDetails.tag;
		}

		const { contextId, createdBy, creationDate, id, lastModifiedBy, modificationDate, ...requiredData } = testDetails;

		await ClashReviewApi.updateClashDetectionTest(iTwinId, currentTestId!, requiredData);
		alert("Test updated successfully");
	};

	useEffect(() => {
		const initApp = async () => {
			const response = await ClashReviewApi.getClashTestDetailById(iTwinId, currentTestId!);
			setTestDetails(response);
			initializeSelectedItems(response);
		};

		if (method === "Update") {
			initApp();
		}
	}, []);

	return (
		<>
			<ModalContent>
				{/* <Dialog.TitleBar titleText={getModalTitleText()} /> */}
				<div>{getModalContent()}</div>
				{currentPage !== "nameDescription" && (
					<ModalFooter
						handleSubmit={method === "Create" ? createClashDetectionTest : updateClashDetectionTest}
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
						buttonLabel={method}
					/>
				)}
			</ModalContent>
		</>
	);
};

export default ClashDetectionModalContent;
