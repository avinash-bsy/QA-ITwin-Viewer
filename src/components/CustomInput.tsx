import { SvgClose } from "@itwin/itwinui-icons-react";
import { LabeledInput, Tag } from "@itwin/itwinui-react";
import { ChangeEventHandler, FunctionComponent, useEffect, useState } from "react";

interface CustomInputProps {
    placeholder: string;
    label:string;
    value: string[];
    setValue: (values:string[]) => void
    validatorFunction ?: (value:string) => boolean
}
 
const CustomInput: FunctionComponent<CustomInputProps> = ({placeholder, label, value, setValue, validatorFunction = (value:string) => true}) => {
    const [inputValue, setInputValue] = useState<string>("")
    
    const handleInputChange = (event: any) => {
        setInputValue(event.target.value)
    }

    const handleInputKeyUp = (event: any) => {
        if(event.key === "Enter" && inputValue && validatorFunction(inputValue))
        {
            setValue([...value, inputValue])
            setInputValue("")
        }
    }

    const removeOption = (index:number) => {
        value.splice(index, 1)
        setValue([...value])
    }

    return ( 
        <div>
            <LabeledInput placeholder={placeholder} label={label} value={inputValue} onChange={handleInputChange} onKeyDown={handleInputKeyUp}/>
            {
                value.map((option, index) =>(
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid white", padding:5, margin:5}} key={index}>
                        <span style={{fontWeight:"bold", fontSize:"medium"}} key={index}>{option}</span>
                        <SvgClose onClick={() => removeOption(index)} style={{cursor:"pointer"}}/>
                    </div>
                ))
            }

        </div>
    );
}
 
export default CustomInput;