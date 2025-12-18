import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { Select } from "antd";
import { AxiosWithLoading, ErrorPrinter } from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import { PathLink } from "../../../constants/PathLink";

const NewGRPO = () => {
  const history = useHistory();
  const [docSeries, setDocSeries] = useState([]);

  const getDocumentSeries = async () => {
    try {
      const res = await AxiosWithLoading(
        APIHelper.getConfig("/common/getdocumentseries")
      );
      console.log('data: ', res.data);
      setDocSeries(res.data);
    } catch (error) {
      ErrorPrinter(error);
    }
  }

  useEffect(() => {
    getDocumentSeries();
  }, []);

  return ( 
    <MobilePageShell title={"New GRN"} onBack={() => history.push(PathLink.processingGRPO)} onRefresh={()=>{}}>
      <div>
        <Select 
          optionFilterProp="children"
          placeholder="Document Series"
          filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
          value={docSeries}
          onChange={(value) => {console.log('data: ', value)}}
          style={{margin:20, width:'80%'}}
        ></Select>
      </div>
    </MobilePageShell>
   );
}
 
export default NewGRPO;