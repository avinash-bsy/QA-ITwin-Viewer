import React, { Dispatch, FunctionComponent, SetStateAction, createContext, useContext, useEffect, useState } from "react";

interface SetData {
	modelIds? : string[];
	categoryIds? : string[];
	queries? : {
		type : number,
		queryReference : string
	};
	selfCheck : boolean;
	clearance : number;
}
export interface TestDetails {
	name: string;
	description: string;
	configType: number;
	includeSubModels: boolean;
	setA : SetData;
	setB : SetData;
	advancedSettings: {
		longClash: boolean;
		calculateOverlap: boolean;
		toleranceOverlapValidation: boolean;
	};
	suppressTouching: boolean;
	touchingTolerance: number;
	suppressionRules: string[];
}

type PageType = "nameDescription" | "setSelection" | "advancedOptions" | "suppressionRules";

interface ClashDetectionTestType {
	testDetails: TestDetails;
	currentPage: PageType;
	setCurrentPage: Dispatch<SetStateAction<PageType>>;
	setTestDetails: Dispatch<SetStateAction<TestDetails>>;
}

const ClashDetectionTestContext = createContext<ClashDetectionTestType>({
	testDetails: {
		name: "",
		description: "",
		configType: 2,
		includeSubModels: true,
		advancedSettings: {
			longClash: true,
			calculateOverlap: true,
			toleranceOverlapValidation: false,
		},
		setA : {
			selfCheck : false,
			clearance : 0,
		},
		setB : {
			selfCheck : false,
			clearance : 0,
		},
		suppressTouching: false,
		touchingTolerance: 0,
		suppressionRules: []
	},
	currentPage: "nameDescription",
	setCurrentPage: () => {},
	setTestDetails: () => {},
});

const ClashDetectionTestProvider: FunctionComponent = ({ children }) => {
	const [testDetails, setTestDetails] = useState<TestDetails>({
		name: "",
		description: "",
		configType: 2,
		includeSubModels: true,
		setA : {
			selfCheck : true,
			clearance : 0,
		},
		setB : {
			selfCheck : true,
			clearance : 0,
		},
		advancedSettings: {
			longClash: true,
			calculateOverlap: true,
			toleranceOverlapValidation: false,
		},
		suppressTouching: false,
		touchingTolerance: 0,
		suppressionRules: []
	});
	const [currentPage, setCurrentPage] = useState<PageType>("nameDescription");

	const contextValues: ClashDetectionTestType = {
		testDetails,
		currentPage,
		setCurrentPage,
		setTestDetails,
	};

	useEffect(() => {
		console.log(testDetails)
	}, [testDetails])

	return <ClashDetectionTestContext.Provider value={contextValues}>{children}</ClashDetectionTestContext.Provider>;
};

const useClashDetectionTestContext = () => useContext(ClashDetectionTestContext);

export { ClashDetectionTestContext, ClashDetectionTestProvider, useClashDetectionTestContext };
