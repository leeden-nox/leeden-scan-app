import 'antd/dist/reset.css'; // For Ant Design v5+
import "bootstrap/dist/css/bootstrap.min.css";
import "antd-mobile/es/global";
import './App.css';
import MainMenu from './app/MainMenu';
import './index.css';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import LoginPage from './app/login/page';
import { PathLink } from './constants/PathLink';
import PickListQty from './app/warehouse/pick-list/page';
import { PickListQtyDetail } from './app/warehouse/pick-list/pickListQtyDetail';
import { PickListQtyDetailPick } from './app/warehouse/pick-list/pickListQtyDetailPick';
import { FlowmeterReading } from './app/logistics/flowmeterReading/flowmeterReading';
import { FlowmeterReadingDetail } from './app/logistics/flowmeterReading/flowmeterReadingDetail';
import { OnSiteVerification } from './app/transport/onSiteVerification/OnSiteVerification';
import { OnSiteVerificationDetail } from './app/transport/onSiteVerification/onSiteVerificationDetail';
import { OnSiteVerificationDetailSerial } from './app/transport/onSiteVerification/OnSiteVerificationDetailSerial';
import { CustSiteVerification } from './app/transport/CustSiteVerification/CustSiteVerification';
import { CustSiteVerificationDetail } from './app/transport/CustSiteVerification/CustSiteVerificationDetail';
import { CustSiteVerificationDetailSerial } from './app/transport/CustSiteVerification/CustSiteVerificationDetailSerial';
import UserAccess from './app/UserAccess/userAccess';
import { DriverEcr } from './app/transport/DriverEcr/DriverEcr';
import { DriverECRDetail } from './app/transport/DriverEcr/DriverEcrDetail';
import { ECR } from './app/warehouse/ECR/ECR';
import { CustSiteVerificationAccountCode } from './app/transport/CustSiteVerification/CustSiteVerificationAccountCode';
import ProcessingGRPO from './app/warehouse/GoodsReceiptPO/ProcessingGRPO';
import NewGRPO from './app/warehouse/GoodsReceiptPO/NewGRPO';
import HPRefilling from './app/manufacturing/HPRefilling/hpRefilling';
import HPRefillingDetail from './app/manufacturing/HPRefilling/hpRefillingDetail';
import PendingAssignPickList from './app/warehouse/PendingToAssign/PendingAssignPickList';
import PendingAssignPickListDetail from './app/warehouse/PendingToAssign/PendingAssignPickListDetail';
import AssignedPickList from './app/warehouse/PendingToAssign/AssignedPickList';
import { QueryInventory } from './app/warehouse/QueryInventory/QueryInventory';
function App() {

  return (
    <>
      <BrowserRouter>
        <Switch>
          <Route exact path="/"><MainMenu /></Route>
          <Route exact path={PathLink.login}><LoginPage /></Route>

          {/* Pick List */}
          <Route exact path={PathLink.pickListQty}><PickListQty /></Route>
          <Route exact path={PathLink.pickListQtyDetail} component={PickListQtyDetail} />
          <Route exact path={PathLink.pickListQtyDetailPick} component={PickListQtyDetailPick} />

          {/* Flowmeter Reading */}
          <Route exact path={PathLink.flowmeterReading} component={FlowmeterReading} />
          <Route exact path={PathLink.flowmeterReadingDetail} component={FlowmeterReadingDetail} />

          {/* On Site Verification */}
          <Route exact path={PathLink.onSiteVerification}> <OnSiteVerification /></Route>
          <Route exact path={PathLink.onSiteVerificationDetail} component={OnSiteVerificationDetail} />
          <Route exact path={PathLink.onSiteVerificationDetailSerial} component={OnSiteVerificationDetailSerial} />

          {/* Cust Site Verification */}
          <Route exact path={PathLink.custSiteVerification} component={CustSiteVerification}/>
          <Route exact path={PathLink.custSiteVerificationAccountCode} component={CustSiteVerificationAccountCode} />
          <Route exact path={PathLink.custSiteVerificationDetail} component={CustSiteVerificationDetail} />
          <Route exact path={PathLink.custSiteVerificationDetailSerial} component={CustSiteVerificationDetailSerial} />
          {/* User Access */}
          <Route exact path={PathLink.userAccess} component={UserAccess} />

          {/* Driver ECR */}
          <Route exact path={PathLink.driverEcr} component={DriverEcr} />
          <Route exact path={PathLink.driverEcrDetail} component={DriverECRDetail} />
          {/* ECR */}
          <Route exact path={PathLink.ecr} component={ECR} />

          {/* GRPO */}
          <Route exact path={PathLink.processingGRPO} component={ProcessingGRPO} />
          <Route exact path={PathLink.newGRPO} component={NewGRPO} />

          {/* HP Refilling */}
          <Route exact path={PathLink.hpRefilling} component={HPRefilling} />
          <Route exact path={PathLink.hpRefillingDetail} component={HPRefillingDetail} />

          {/* Pending Assign Pick List */}
          <Route exact path={PathLink.pendingAssignPickList} component={PendingAssignPickList} />
          <Route exact path={PathLink.pendingAssignPickListDetail} component={PendingAssignPickListDetail} />
          <Route exact path={PathLink.assignedPickList} component={AssignedPickList} />

          {/* Query Inventory */}
          <Route exact path={PathLink.queryInventory} component={QueryInventory} />
        </Switch>
      </BrowserRouter>
    </>
  )
}

export default App
