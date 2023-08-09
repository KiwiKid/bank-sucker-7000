import { Fragment, h } from "preact"
import { TransactionRow } from "./ElementFinder"
import { useState } from "preact/hooks";

interface RowProps {
    rows: TransactionRow[]
}
const Rows = ({rows}:RowProps) => {

    const [showAllRows, setShowAllRows] = useState(false);

    if(!rows || Rows.length == 0){
        return <Fragment>'no rows'</Fragment>
    }

    if(!showAllRows){
        return <Fragment><h3>Example row:</h3><pre>{JSON.stringify(rows[0], null, 4)}</pre><button onClick={() => setShowAllRows(true)}>Show ALL</button></Fragment>
    }else{
        return <Fragment><h1>Rows:</h1><button onClick={() => setShowAllRows(false)}>Hide ALL</button><pre>{JSON.stringify(rows, null, 4)}</pre><button onClick={() => setShowAllRows(false)}>Hide ALL</button></Fragment>
    }
    
}

export default Rows