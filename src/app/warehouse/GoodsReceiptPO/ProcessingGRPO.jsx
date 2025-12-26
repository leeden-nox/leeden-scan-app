import { PlusOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import { useState } from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";

import { PathLink } from "../../../constants/PathLink";
import NewGRPO from "./NewGRPO";
import MobilePageShell from "../../../constants/MobilePageShell";
import { SpinLoading } from "../../../constants/Common";

const ProcessingGRPO = () => {
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const location = useLocation();

  if (!authorized) {
    return (
      <MobilePageShell title={"GRPO"} onBack={() => history.push('/')} onRefresh={()=>{}}>
        <UnauthorizedPage title={"View GRPO"} subTitle={"Sorry, you are not authorized to access this page."}/>
      </MobilePageShell>
    );
  }
  else {
    return (
      <>
        <Switch>
          <Route exact path={PathLink.newGRPO} conmponent={NewGRPO} />
          <Route exact path={'/'} render={() => <MainMenu />} />
        </Switch>
        <Route exact path={PathLink.processingGRPO}>
          <MobilePageShell title={"GRPO"} onBack={() => history.push('/')} onRefresh={()=>{}}>
            <SpinLoading />
            {/* GRPO Content Goes Here */}
            <FloatButton
              icon={<PlusOutlined />}
              type="primary"
              style={{ right: 15, bottom: 57 }} // position bottom-right
              onClick={() => history.push(PathLink.newGRPO)}
            />
            <div className="d-flex justify-content-around" style={{position:'fixed', bottom:0, width:'100vw', background:'white'}}>
              <div className="">
                <div className="d-flex justify-content-center"><img src={'../../images/processing.png'} width={34} height={33} /></div>
                <div className="d-flex justify-content-center" style={{ fontSize: 10 }}>Processing</div>
              </div>
              <div>
                <div className="d-flex justify-content-center"><img src={'../../images/posted.png'} width={34} height={33} /></div>
                <div className="d-flex justify-content-center" style={{ fontSize: 10 }}>Posted</div>
              </div>
            </div>
          </MobilePageShell>
        </Route>
      </>
    )
  }
}
 
export default ProcessingGRPO;