import { Button, message, Select, Tag } from "antd";
import { useEffect, useState } from "react";
import { Route, Switch, useHistory, useLocation, useParams } from "react-router-dom";

import { APIHelper } from "../../../constants/APIHelper";
import { AxiosWithLoading, ErrorPrinter, SpinLoading } from "../../../constants/Common";
import MobilePageShell from "../../../constants/MobilePageShell";
import { PathLink } from "../../../constants/PathLink";
import UnauthorizedPage from "../../../constants/Unauthorized";

const PendingAssignPickListDetail = () => {
  const history = useHistory();
  const DONo = useParams().doNo.split("?")[0];
  const [authorized, setAuthorized] = useState(true);
  const location = useLocation();
  const [data, setData] = useState([]);
  const [pickerList, setPickerList] = useState([]);
  const [assignedPicker, setAssignedPicker] = useState(0);

  const getPendingToAssignDetail = async () => {
    try {
      const res = await AxiosWithLoading(
        APIHelper.getConfig("/logistics/getPendingToAssignDetail?doNo=" + DONo)
      );
      setData(res.data['DO']['records']);
      setPickerList(res.data['Pickers']['records']);

      if (res.data['DO']['records'][0] && res.data['DO']['records'][0]['PickerUserID']) {
        setAssignedPicker(res.data['DO']['records'][0]['PickerUserID']);
      }
      setAuthorized(true);
    } catch (error) {
      ErrorPrinter(error);
      setAuthorized(false);
    }
  }

  const assignPicker = async () => {
    try {
      if (assignedPicker === 0) {
        message.error("Please select a picker to assign.");
        return;
      }
      let body = {
        DONo: DONo,
        UserID: assignedPicker
      }
      const res = await AxiosWithLoading(
        APIHelper.postConfig("/logistics/assignPicker", body)
      );
      if (res.status === 200) {
        message.success("Picker assigned successfully for " + DONo);
        history.goBack();
      }
    } catch (error) {
      ErrorPrinter(error);
      setAuthorized(false);
    }
  }

  useEffect(() => {
    getPendingToAssignDetail();
  }, [location]);

  if (!authorized) {
    return (
      <MobilePageShell title={"Pending to assign"} onBack={() => history.goBack()} onRefresh={()=>{getPendingToAssignDetail()}}>
        <UnauthorizedPage title={"View Pending to assign"} subTitle={"Sorry, you are not authorized to access this page."}/>
      </MobilePageShell>
    );
  }
  else {
    return (
      <>
        <Switch>
          {/* <Route exact path={PathLink.pendingAssignPickListDetail} conmponent={PendingAssignPickListDetail} /> */}
          <Route exact path={'/'} render={() => <MainMenu />} />
        </Switch>
        <Route exact path={PathLink.pendingAssignPickListDetail}>
          <MobilePageShell title={DONo} onBack={() => history.goBack()} onRefresh={()=>{getPendingToAssignDetail()}}>
            <SpinLoading />
            {/* Pick List Content Goes Here */}
            <div style={{marginBottom:'5.5rem'}}>
              {data.map((item, index) => (
                <div key={index} style={{padding:16, borderBottom:'1px solid #ccc'}}>
                  <div style={{fontWeight:'bold'}}>{item.ProdCode}</div>
                  <div style={{fontSize:'0.75rem'}}>{item.ProdName}</div>
                  <div className="d-flex justify-content-center">
                    {item.Warehouse && <Tag className="text-center" style={{width:'40vw'}}>{item.Warehouse}</Tag>}
                    <Tag className="text-center" style={{width:'40vw'}}>{item.Qty}{' '}{item.UOM}</Tag>
                  </div>
                  {item.WarehouseFrom && <div className="d-flex justify-content-center">
                    <Tag className="text-center" style={{width:'40vw'}}>{item.WarehouseFrom}</Tag>
                    <Tag className="text-center" style={{width:'40vw'}}>{item.WarehouseTo}</Tag>
                  </div>}
                </div>
              ))}
            </div>
            <div style={{background:'white', position:'absolute', bottom:'1px'}}>
              <div className="mb-3 mt-2">
                <Select 
                  label={'Assign Picker'}
                  // options={pipelineList}
                  value={assignedPicker}
                  optionFilterProp="children"
                  style={{width:'100vw'}}
                  onSelect={(e) => setAssignedPicker(e)}
                  
                >
                  {pickerList.map((item, index) => (
                    <Select.Option key={index} value={item.UserID}>
                      {item.UserName}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <Button
                type="primary"
                block
                onClick={() => assignPicker()}
                style={{ backgroundColor: "#377188"}}
              >
                Post to LMS
              </Button>
            </div>
          </MobilePageShell>
        </Route>
      </>
    )
  }
}
 
export default PendingAssignPickListDetail;