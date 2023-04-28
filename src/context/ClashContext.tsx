import React, { useContext, useState } from "react";

interface ClashContextType {
	clashTests: Array<any>;
	runs: Array<any>;
	clashResults: Array<any>;
	testId: string;
	runId: string;
	resultId: string;
	newRunRequested: string | null;
	setNewRunRequested: React.Dispatch<React.SetStateAction<string | null>>;
	setClashTests: React.Dispatch<React.SetStateAction<Array<any>>>;
	setRuns: React.Dispatch<React.SetStateAction<Array<any>>>;
	setClashResults: React.Dispatch<React.SetStateAction<Array<any>>>;
	setTestId: React.Dispatch<React.SetStateAction<string>>;
	setResultId: React.Dispatch<React.SetStateAction<string>>;
	setRunId: React.Dispatch<React.SetStateAction<string>>;
}

const ClashContext = React.createContext<ClashContextType>({
	clashTests: [],
	runs: [],
	clashResults: [],
	testId: "",
	runId: "",
	resultId: "",
	newRunRequested: null,
	setTestId: () => {},
	setRunId: () => {},
	setResultId: () => {},
	setNewRunRequested: () => {},
	setClashTests: () => {},
	setRuns: () => {},
	setClashResults: () => {},
});

const ClashContextProvider: React.FC = ({ children }) => {
	const [clashTests, setClashTests] = useState<any[]>([]);
	const [runs, setRuns] = useState<any[]>([]);
	const [clashResults, setClashResults] = useState<any[]>([]);
	const [testId, setTestId] = useState<string>("");
	const [runId, setRunId] = useState<string>("");
	const [resultId, setResultId] = useState<string>("");
	const [testsLoading, setTestsLoading] = useState<boolean>(true);
	const [runsLoading, setRunsLoading] = useState<boolean>(false);
	const [resultsLoading, setResultsLoading] = useState<boolean>(false);
	const [newRunRequested, setNewRunRequested] = useState<string | null>(null);

	const contextValues: ClashContextType = {
		clashTests,
		runs,
		clashResults,
		newRunRequested,
		testId,
		resultId,
		runId,
		setNewRunRequested,
		setClashTests,
		setClashResults,
		setRuns,
		setTestId,
		setRunId,
		setResultId,
	};

	return <ClashContext.Provider value={contextValues}>{children}</ClashContext.Provider>;
};

const useClashContext = () => useContext(ClashContext);

export { ClashContext, ClashContextProvider, useClashContext };
