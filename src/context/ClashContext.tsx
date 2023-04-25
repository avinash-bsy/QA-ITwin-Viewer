import React, { useContext, useState } from "react";

interface ClashContextType {
	clashTests: Array<any>;
	runs: Array<any>;
	accessToken: string;
	clashResults: Array<any>;
	testsLoading: boolean;
	setTestsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	runsLoading: boolean;
	setRunsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	resultsLoading: boolean;
	newRunRequested: boolean;
	setNewRunRequested: React.Dispatch<React.SetStateAction<boolean>>;
	setResultsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setAccessToken: React.Dispatch<React.SetStateAction<string>>;
	setClashTests: React.Dispatch<React.SetStateAction<Array<any>>>;
	setRuns: React.Dispatch<React.SetStateAction<Array<any>>>;
	setClashResults: React.Dispatch<React.SetStateAction<Array<any>>>;
}

const ClashContext = React.createContext<ClashContextType>({
	clashTests: [],
	runs: [],
	clashResults: [],
	accessToken: "",
	testsLoading: true,
	setTestsLoading: () => {},
	runsLoading: true,
	setRunsLoading: () => {},
	resultsLoading: true,
	newRunRequested: false,
	setNewRunRequested: () => {},
	setResultsLoading: () => {},
	setAccessToken: () => {},
	setClashTests: () => {},
	setRuns: () => {},
	setClashResults: () => {},
});

const ClashContextProvider: React.FC = ({ children }) => {
	const [clashTests, setClashTests] = useState<any[]>([]);
	const [runs, setRuns] = useState<any[]>([]);
	const [clashResults, setClashResults] = useState<any[]>([]);
	const [accessToken, setAccessToken] = useState<string>("");
	const [testsLoading, setTestsLoading] = useState<boolean>(true);
	const [runsLoading, setRunsLoading] = useState<boolean>(false);
	const [resultsLoading, setResultsLoading] = useState<boolean>(false);
	const [newRunRequested, setNewRunRequested] = useState<boolean>(false);

	const contextValues: ClashContextType = {
		clashTests,
		runs,
		accessToken,
		clashResults,
		testsLoading,
		setTestsLoading,
		runsLoading,
		setRunsLoading,
		resultsLoading,
		newRunRequested,
		setNewRunRequested,
		setResultsLoading,
		setClashTests,
		setClashResults,
		setRuns,
		setAccessToken,
	};

	return <ClashContext.Provider value={contextValues}>{children}</ClashContext.Provider>;
};

const useClashContext = () => useContext(ClashContext);

export { ClashContext, ClashContextProvider, useClashContext };
