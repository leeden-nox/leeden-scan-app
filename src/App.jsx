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

        </Switch>
      </BrowserRouter>
    </>
  )
}

export default App
