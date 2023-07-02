
import { useFormikContext } from "formik";
import React from "react";
import { objectCompare } from "./helpers";

const defaultShouldTriggerErrors = (errors, nextErrors) => Object.keys(nextErrors).length && !objectCompare(errors, nextErrors);

export const ErrorListener = ({onError, shouldTriggerErrors, errors}) => {
    const _shouldTriggerErrors = shouldTriggerErrors || defaultShouldTriggerErrors;
    const formik = useFormikContext();
    const [prevErrors, updateErrors] = React.useState(errors);

    React.useEffect(() => {
        console.log(formik.submitCount)
        if (_shouldTriggerErrors(prevErrors, errors)) {
            onError(errors);
            updateErrors(errors);
        }
    }, [errors, prevErrors, formik.submitCount]);

    return null;
}