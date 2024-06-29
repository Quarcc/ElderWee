import React, {useState, useEffect} from "react";
import { getAccountLog } from "../../../Api";

const Profile = (acc,anything) =>{

    const [accNo, setAccNo] = useState(acc);
    const [accLogData, setAccLogData] = useState(null);

    const retrieveAccLogData = () =>{
        let data = getAccountLog(accNo);
        //transform/handle data
        return data;
    }

    const testObj = {
        val1:1,
        val2:2,
        val3:3,
        val4:4,
    }

    const renderRows = () =>{
        let rows = [];
        Object.keys(testObj).forEach((ele)=>{
            rows.push(<RowComponent props={testObj[ele]}/>);
        });
        return rows;
    }

    useEffect(async ()=>{
        let accData = await getAccountLog(accNo);
        setAccLogData(accData);
    },[accNo]);

    return(<div>
            <div>
                {renderRows()}
                {acc}
                {anything}
                {accLogData ? <DataTable data={accLogData}/> : <Loading/>}
            </div>
        </div>);
}

export default Profile;