import React, { Dispatch, FunctionComponent, SetStateAction, createContext, useContext, useEffect, useState } from "react";

interface SuppressionModalType {
    currentPage : PageType;
    setCurrentPage: Dispatch<SetStateAction<PageType>>;
    selectedRuleType : RuleTemplateType | null;
    setSelectedRuleType : Dispatch<SetStateAction<RuleTemplateType | null>>;
    selectedRuleTemplate : any;
    setSelectedRuleTemplate : Dispatch<SetStateAction<any>>;
    ruleDetails : any;
    setRuleDetails : Dispatch<SetStateAction<any>>;
}

type PageType = "selectRuleTemplate" | "selectRuleType" | "ruleDetails" | "listTemplates" | "listRules"
type RuleTemplateType = "mappingAndGrouping" | "aspects" | "typeDefinition"

const SuppressionModalContext = createContext<SuppressionModalType>({
	currentPage : "listRules",
    setCurrentPage: () => {},
    selectedRuleType : null,
    setSelectedRuleType : () => {},
    selectedRuleTemplate : {},
    setSelectedRuleTemplate : () => {},
    ruleDetails : {},
    setRuleDetails : () => {}
});

const SuppressionModalContextProvider: FunctionComponent = ({ children }) => {
	const [currentPage, setCurrentPage] = useState<PageType>("listRules");
    const [selectedRuleType, setSelectedRuleType] = useState<RuleTemplateType | null>(null);
    const [selectedRuleTemplate, setSelectedRuleTemplate] = useState<any>(null);
    const [ruleDetails, setRuleDetails] = useState<any>({});

    const contextValues : SuppressionModalType = {
        currentPage, setCurrentPage, selectedRuleType, setSelectedRuleType, selectedRuleTemplate, setSelectedRuleTemplate, ruleDetails, setRuleDetails
    }

	return <SuppressionModalContext.Provider value={contextValues}>{children}</SuppressionModalContext.Provider>;
};

const useSuppressionModalContext = () => useContext(SuppressionModalContext);

export { SuppressionModalContext, SuppressionModalContextProvider, useSuppressionModalContext };
