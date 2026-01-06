import { PlusOutlined } from "@ant-design/icons";
import { FloatButton, Tag } from "antd";
import { useEffect, useState } from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";

import { PathLink } from "../../../constants/PathLink";
import MobilePageShell from "../../../constants/MobilePageShell";
import { AxiosWithLoading, ErrorPrinter, SpinLoading } from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import moment from "moment";
import UnauthorizedPage from "../../../constants/Unauthorized";

const PendingAssignPickList = () => {
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const location = useLocation();
  const [data, setData] = useState([]);

  const getPendingToAssign = async () => {
    try {
      const res = await AxiosWithLoading(
        APIHelper.getConfig("/logistics/getPendingToAssign?type=Pending")
      );
      setData(res.data['records']);
      setAuthorized(true);
    } catch (error) {
      ErrorPrinter(error);
      setAuthorized(false);
    }
  }

  useEffect(() => {
    getPendingToAssign();
  }, [location]);

  if (!authorized) {
    return (
      <MobilePageShell title={"Pending to assign"} onBack={() => history.push('/')} onRefresh={()=>{getPendingToAssign()}}>
        <UnauthorizedPage title={"View Pending to assign"} subTitle={"Sorry, you are not authorized to access this page."}/>
      </MobilePageShell>
    );
  }
  else {
    return (
      <>
        <Switch>
          {/* <Route exact path={PathLink.newGRPO} conmponent={NewGRPO} /> */}
          <Route exact path={'/'} render={() => <MainMenu />} />
        </Switch>
        <Route exact path={PathLink.pendingAssignPickList}>
          <MobilePageShell title={"Pending to assign"} onBack={() => history.push('/')} onRefresh={()=>{getPendingToAssign()}}>
            <SpinLoading />
            {/* Pick List Content Goes Here */}
            <div style={{marginBottom:'50px'}}>
              {data.map((item, index) => (
                <div onClick={() => history.push(PathLink.pendingAssignPickList + '/' + item.PickNo)} key={index} style={{padding:12, borderBottom:'1px solid #ccc'}}>
                  <div className="d-flex justify-content-between">
                    <div style={{fontWeight:'bold'}}>{item.PickNo}</div>
                    <div>{moment(item.PickDate).format('YYYY-MM-DD')}</div>
                  </div>
                  <div>{item.AccountName}</div>
                  <div className="d-flex justify-content-between">
                    {item.PackingDetailRequired ? <Tag style={{borderRadius:'1rem', fontWeight:'bold', fontSize:'1rem'}} color={"#595A5C"}>P</Tag> : null}
                    {item.DocTagNo ? <Tag style={{fontSize:'1rem', marginLeft:'auto'}} color={"#595A5C"}>{item.DocTagNo}</Tag> : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-around" style={{position:'fixed', bottom:0, width:'100vw', background:'white'}}>
              <div className="">
                <div className="d-flex justify-content-center"><img src={'../../images/picklist_active.png'} width={34} height={33} /></div>
                <div className="d-flex justify-content-center" style={{ fontSize: 10 }}>Pending</div>
              </div>
              <div onClick={() => history.push(PathLink.assignedPickList)}>
                <div className="d-flex justify-content-center"><img src={'../../images/picklist.png'} width={34} height={33} /></div>
                <div className="d-flex justify-content-center" style={{ fontSize: 10 }}>Assigned</div>
              </div>
            </div>
          </MobilePageShell>
        </Route>
      </>
    )
  }
}
 
export default PendingAssignPickList;