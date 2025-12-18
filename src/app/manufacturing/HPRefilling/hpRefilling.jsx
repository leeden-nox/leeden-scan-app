import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useHistory, useLocation, Switch, Route } from "react-router-dom";
import { PathLink } from "../../../constants/PathLink";
import { AxiosWithLoading, ErrorPrinter, SpinLoading } from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import MobilePageShell from "../../../constants/MobilePageShell";
import UnauthorizedPage from "../../../constants/Unauthorized";
import { FloatButton } from "antd";
import HPRefillingDetail from "./hpRefillingDetail";

const HPRefilling = () => {
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const [data, setData] = useState([]);
  const location = useLocation();

  const getHPRefillingData = async () => {
    try {
      const response = await AxiosWithLoading(
        APIHelper.getConfig('/production/GetRefillBatchList')
      );
      setAuthorized(true);
      setData(response.data.Table);
    } catch (error) {
      setAuthorized(false);
      ErrorPrinter(error);
    }
  }

  useEffect(() => {
    getHPRefillingData();
  }, [location]);

  if (!authorized) {
    <MobilePageShell title={"HP Refilling"} onBack={() => history.push('/')}>
      <UnauthorizedPage title={"HP Refilling"} subTitle={"Sorry, you are not authorized to access this page."}/>
    </MobilePageShell>
  } else {
    return (
      <>
        <Switch>
          <Route exact path={PathLink.hpRefillingDetail} >
            <HPRefillingDetail />
          </Route>
          <Route exact path={PathLink.hpRefilling}>
            <MobilePageShell title={"Pick List"} onBack={() => history.push('/')} >
              <SpinLoading />
              <FloatButton
                icon={<PlusOutlined />}
                type="primary"
                style={{ right: 15, bottom: 57 }} // position bottom-right
                onClick={() => history.push(PathLink.hpRefilling + '/0')}
              />
            </MobilePageShell>
          </Route>
        </Switch>
      </>
    )
  }
}
 
export default HPRefilling;